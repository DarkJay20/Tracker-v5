// --- Settings Page Category Filter / Tab Switching ---
        window.filterSettingsTab = function(tabName) {
            const tabs = document.querySelectorAll('.settings-tab-btn');
            tabs.forEach(btn => {
                const isActive = btn.dataset.tab === tabName;
                btn.classList.toggle('bg-spotify-green', isActive);
                btn.classList.toggle('text-dark-bg', isActive);
                btn.classList.toggle('bg-card-bg', !isActive);
                btn.classList.toggle('text-text-secondary', !isActive);
            });

            const cards = {
                'theme': document.getElementById('settings-card-theme'),
                'purok': document.getElementById('settings-card-purok'),
                'backup': document.getElementById('settings-card-backup'),
                'pwa': document.getElementById('settings-card-pwa')
            };

            Object.entries(cards).forEach(([key, card]) => {
                if (!card) return;
                if (tabName === 'all' || tabName === key) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        };

        // --- Global Constants & State ---
        const dataStorageKey = "dataEntries";
        const notesStorageKey = "dashboardNotesHistory";
        const attendanceStorageKey = "weeklyAttendanceRecords"; 
        const settingsStorageKey = "dashboardSettings"; 
        const eventsStorageKey = "upcomingEvents"; // Feature 6
        const backupMetaStorageKey = "tracker_last_backup_meta"; // Option 3
        const restoreSnapshotStorageKey = "tracker_pre_restore_snapshot"; // Option 3
        
        // Spotify Green Default
        const SPOTIFY_GREEN = '#1DB954';
        
        const defaultColors = {
            ms: SPOTIFY_GREEN, 
            uwp: '#1E90FF',
            line: SPOTIFY_GREEN,
            accent: SPOTIFY_GREEN,
            title: SPOTIFY_GREEN,
            button: SPOTIFY_GREEN,
            pie: [SPOTIFY_GREEN, '#1E90FF', '#FFC300', '#FF5733', '#C70039', '#900C3F'], // Pie palette base
        };
        
        const defaultSettings = {
            theme: 'dark', 
            chartColors: { ...defaultColors },
            purokGroups: [ 
                '1-1', '1-2', '1-3', '1-4', '1-5', 
                '2-1', '2-2', '2-3', '2-4', '2-5', '2-6',
                '3-1', '3-2', '3-3', '3-4', '3-5', '3-6'
            ]
        };

        // --- Core Safety Utilities ---
        function escapeHTML(str) {
            if (str === null || str === undefined) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function generateUUID() {
            if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
                try {
                    return crypto.randomUUID();
                } catch (e) {
                    // Fall back if randomUUID fails in non-secure context
                }
            }
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        function safeJSONParse(key, fallback) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : fallback;
            } catch (err) {
                console.error(`Failed to parse ${key} from localStorage:`, err);
                return fallback;
            }
        }

        function safeSetItem(key, value) {
            try {
                localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                return true;
            } catch (err) {
                console.error(`Failed to save ${key} to localStorage:`, err);
                if (typeof showNotification === 'function') {
                    showNotification("Storage error: Failed to save data (quota may be exceeded).", true);
                }
                return false;
            }
        }
        
        let dataEntries = safeJSONParse(dataStorageKey, []);
        let notesHistory = safeJSONParse(notesStorageKey, []);
        let attendanceRecords = safeJSONParse(attendanceStorageKey, {}); 
        let appSettings = safeJSONParse(settingsStorageKey, defaultSettings); 
        let upcomingEvents = safeJSONParse(eventsStorageKey, []); // Feature 6
        
        // Ensure all default color keys are present in loaded settings
        if (!appSettings.chartColors) appSettings.chartColors = { ...defaultColors };
        Object.keys(defaultColors).forEach(key => {
            if (typeof appSettings.chartColors[key] === 'undefined') {
                appSettings.chartColors[key] = defaultColors[key];
            }
        });

        // Ensure default purok groups exist if empty
        if (!Array.isArray(appSettings.purokGroups) || appSettings.purokGroups.length === 0) {
            appSettings.purokGroups = [...defaultSettings.purokGroups];
        }

        // Data entries initialization
        dataEntries.forEach(entry => {
            if (!entry.id) {
                entry.id = generateUUID(); 
            }
            if (!entry.status) {
                entry.status = 'MS'; 
            }
            // NEW: Initialize Kapisanan field if missing
            if (!entry.kapisanan) {
                entry.kapisanan = 'BINHI'; // Default to BINHI if old data is loaded
            }
            if (typeof entry.isArchived === 'undefined') {
                entry.isArchived = false;
            }
            if (typeof entry.isRecommended === 'undefined') { // New flag to control visibility in recommendation list
                 entry.isRecommended = true;
            }
        });
        
        let currentSortField = 'timestamp'; 
        let currentSortDirection = 'desc'; 
        let selectedMemberIds = new Set(); // Feature 8: Track selected IDs for bulk actions

        // DOM Element Cache 
        const DOM = {
            sections: {
                'front-page': document.getElementById("front-page"), 
                'dashboard': document.getElementById("dashboard"),
                'input-data': document.getElementById("input-data"),
                'attendance-check': document.getElementById("attendance-check"), 
                'attendance-summary': document.getElementById("attendance-summary"), 
                'data-views': document.getElementById("data-views"), 
                'events': document.getElementById("events"), // Feature 6
                'archived-data': document.getElementById("archived-data"),
                'notes': document.getElementById("notes"),
                'settings': document.getElementById("settings"),
                'about': document.getElementById("about"),
                'ms-recommendation': document.getElementById("ms-recommendation"), // NEW SECTION
                'data-check': document.getElementById("data-check"), // NEW SECTION
            },
            navLinks: document.querySelectorAll('[data-section-id]'),
            addEntryBtn: document.getElementById("add-entry-btn"),
            downloadExcelBtn: document.getElementById("download-excel-btn"),
            resetDataBtn: document.getElementById("reset-data-btn"), 
            msDataTableBody: document.getElementById("ms-data-table-body"), 
            uwpDataTableBody: document.getElementById("uwp-data-table-body"), 
            archivedDataTableBody: document.getElementById("archived-data-table-body"),
            msStatsEl: document.getElementById("ms-stats"),
            uwpStatsEl: document.getElementById("uwp-stats"),
            overallStatsEl: document.getElementById("overall-stats"),
            notesTextarea: document.getElementById("notes-textarea"),
            saveNotesBtn: document.getElementById("save-notes-btn"),
            savedNotesContainer: document.getElementById("saved-notes-container"),
            searchInput: document.getElementById('search-input'), 
            startDateInput: document.getElementById('start-date-input'), 
            endDateInput: document.getElementById('end-date-input'),
            notificationBox: document.getElementById('notification-box'),
            modal: document.getElementById('confirmation-modal'),
            modalTitle: document.getElementById('modal-title'),
            modalMessage: document.getElementById('modal-message'),
            modalConfirmBtn: document.getElementById('modal-confirm-btn'),
            modalCancelBtn: document.getElementById('modal-cancel-btn'),
            timeSeriesChartCtx: document.getElementById('time-series-chart')?.getContext('2d'),
            categoryBarChartCtx: document.getElementById('category-bar-chart')?.getContext('2d'),
            msPieChartCtx: document.getElementById('ms-pie-chart')?.getContext('2d'),
            uwpPieChartCtx: document.getElementById('uwp-pie-chart')?.getContext('2d'),
            attendancePurokTables: document.getElementById("attendance-purok-tables"), 
            submitAttendanceBtn: document.getElementById("submit-attendance-btn"),
            attendanceHistoryContainer: document.getElementById("attendance-history-container"),
            weekNumberInput: document.getElementById("week-number-input"), 
            weekIdHidden: document.getElementById("week-id-hidden"),
            
            // Settings DOM elements
            themeToggle: document.getElementById("theme-toggle"),
            colorMsInput: document.getElementById("color-ms"),
            colorUwpInput: document.getElementById("color-uwp"),
            colorLineInput: document.getElementById("color-line"), 
            colorAccentInput: document.getElementById("color-accent"),
            colorTitleInput: document.getElementById("color-title"),
            colorButtonInput: document.getElementById("color-button"),
            resetAccentBtn: document.getElementById("reset-accent-btn"), 
            resetAllColorsBtn: document.getElementById("reset-all-colors-btn"), // NEW
            saveColorsBtn: document.getElementById("save-chart-colors-btn"),
            newPurokInput: document.getElementById("new-purok-input"),
            addPurokBtn: document.getElementById("add-purok-btn"),
            purokListContainer: document.getElementById("purok-list-container"),
            inputPurokSelect: document.getElementById("purok"),
            frontPageNavGrid: document.getElementById("front-page-nav-grid"),
            // Pie Color inputs
            colorPie1Input: document.getElementById("color-pie-1"),
            colorPie2Input: document.getElementById("color-pie-2"),
            colorPie3Input: document.getElementById("color-pie-3"),
            colorPie4Input: document.getElementById("color-pie-4"),
            msRecommendationList: document.getElementById("ms-recommendation-list"), // NEW
            
            // NEW Swatches (Added for visual feedback)
            swatchMs: document.getElementById("swatch-ms"),
            swatchUwp: document.getElementById("swatch-uwp"),
            swatchLine: document.getElementById("swatch-line"),
            swatchAccent: document.getElementById("swatch-accent"),
            swatchTitle: document.getElementById("swatch-title"),
            swatchButton: document.getElementById("swatch-button"),
            swatchPie1: document.getElementById("swatch-pie-1"),
            swatchPie2: document.getElementById("swatch-pie-2"),
            swatchPie3: document.getElementById("swatch-pie-3"),
            swatchPie4: document.getElementById("swatch-pie-4"),
            
            // NEW: Buttons for color inputs (to match screenshot)
            btnColorMs: document.getElementById("btn-color-ms"),
            btnColorUwp: document.getElementById("btn-color-uwp"),
            btnColorLine: document.getElementById("btn-color-line"),
            btnColorAccent: document.getElementById("btn-color-accent"),
            btnColorTitle: document.getElementById("btn-color-title"),
            btnColorButton: document.getElementById("btn-color-button"),
            btnColorPie1: document.getElementById("btn-color-pie-1"),
            btnColorPie2: document.getElementById("btn-color-pie-2"),
            btnColorPie3: document.getElementById("btn-color-pie-3"),
            
            // Existing Modal
            attendanceViewModal: document.getElementById("attendance-view-modal"),
            viewModalTitle: document.getElementById("view-modal-title"),
            viewModalContent: document.getElementById("view-modal-content"),
            viewModalCloseBtn: document.getElementById("view-modal-close-btn"),
            
            // Feature 1 DOM elements (Member Profile Modal)
            memberProfileModal: document.getElementById("member-profile-modal"),
            profileModalTitle: document.getElementById("profile-modal-title"),
            profileStatus: document.getElementById("profile-status-badge"),
            profileKapisanan: document.getElementById("profile-kapisanan-badge"),
            profilePurok: document.getElementById("profile-purok-badge"),
            profileDateAdded: document.getElementById("profile-date-added"),
            profileAttendanceHistory: document.getElementById("profile-attendance-history"),
            profileModalCloseBtn: document.getElementById("profile-modal-close-btn"),

            // Feature 10 DOM elements (Drill-Down Modal)
            drilldownChartModal: document.getElementById("drilldown-chart-modal"),
            drilldownModalTitle: document.getElementById("drilldown-modal-title"),
            drilldownChartCtx: document.getElementById('drilldown-kapisanan-chart')?.getContext('2d'),
            drilldownModalCloseBtn: document.getElementById('drilldown-modal-close-btn'),

            // New Data Check DOM elements
            runCheckBtn: document.getElementById("run-check-btn"),
            duplicateNamesList: document.getElementById("duplicate-names-list"),
            emptyPurokList: document.getElementById("empty-purok-list"),
            orphanedRecordsList: document.getElementById("orphaned-records-list"),
            dataQualityScore: document.getElementById("data-quality-score"), // Feature 7
            dataQualityMessage: document.getElementById("data-quality-message"), // Feature 7
            
            // NEW: Input Data Kapisanan select
            kapisananSelect: document.getElementById("kapisanan"),
            kapisananBreakdown: document.getElementById("kapisanan-breakdown"), // NEW DOM element

            // NEW: Import Data Elements (from Data Views)
            importExcelBtn: document.getElementById("import-excel-btn"),
            importExcelFile: document.getElementById("import-excel-file"),

            // NEW: Attendance Import/Export Elements
            exportAttendanceBtn: document.getElementById("export-attendance-btn"),
            importAttendanceBtn: document.getElementById("import-attendance-btn"),
            importAttendanceFile: document.getElementById("import-attendance-file"),
            
            // Feature 5 (Purok Ranking)
            purokRankingCard: document.getElementById("purok-ranking-card"),

            // Feature 6 (Events Module)
            eventNameInput: document.getElementById("event-name-input"),
            eventDateInput: document.getElementById("event-date-input"),
            addEventBtn: document.getElementById("add-event-btn"),
            eventsListContainer: document.getElementById("events-list-container"),
            calendarGridBody: document.getElementById("calendar-grid-body"),
            calendarMonthYear: document.getElementById("calendar-month-year"),
            calendarPrevMonth: document.getElementById("calendar-prev-month"),
            calendarNextMonth: document.getElementById("calendar-next-month"),

            // Feature 8 (Bulk Edit)
            selectAllMs: document.getElementById("select-all-ms"),
            selectAllUwp: document.getElementById("select-all-uwp"),
            bulkActionSelect: document.getElementById("bulk-action-select"),
            performBulkActionBtn: document.getElementById("perform-bulk-action-btn"),
            selectedCount: document.getElementById("selected-count"),

            // Non-destructive Edit Member Modal Elements
            editMemberModal: document.getElementById("edit-member-modal"),
            editMemberId: document.getElementById("edit-member-id"),
            editMemberName: document.getElementById("edit-member-name"),
            editMemberStatus: document.getElementById("edit-member-status"),
            editMemberKapisanan: document.getElementById("edit-member-kapisanan"),
            editMemberPurok: document.getElementById("edit-member-purok"),
            editMemberSaveBtn: document.getElementById("edit-member-save-btn"),
            editMemberCancelBtn: document.getElementById("edit-member-cancel-btn"),

            // Option 3: Data Safety & System Backup Elements
            exportFullBackupBtn: document.getElementById("export-full-backup-btn"),
            triggerRestoreBtn: document.getElementById("trigger-restore-btn"),
            restoreJsonInput: document.getElementById("restore-json-input"),
            rollbackRestoreBtn: document.getElementById("rollback-restore-btn"),
            lastBackupDisplay: document.getElementById("last-backup-display"),
            backupHealthBadge: document.getElementById("backup-health-badge"),
            backupReminderBanner: document.getElementById("backup-reminder-banner"),
            backupReminderDownloadBtn: document.getElementById("backup-reminder-download-btn"),
            backupReminderDismissBtn: document.getElementById("backup-reminder-dismiss-btn"),

            // Restore Modal DOM Elements
            restoreBackupModal: document.getElementById("restore-backup-modal"),
            restoreBackupDate: document.getElementById("restore-backup-date"),
            restoreMembersCount: document.getElementById("restore-members-count"),
            restoreWeeksCount: document.getElementById("restore-weeks-count"),
            restoreEventsCount: document.getElementById("restore-events-count"),
            restoreNotesCount: document.getElementById("restore-notes-count"),
            restoreConfirmBtn: document.getElementById("restore-confirm-btn"),
            restoreCancelBtn: document.getElementById("restore-cancel-btn"),

            // Option 5: Top App Header Elements
            appHeader: document.getElementById("app-header"),
            appHeaderTitle: document.getElementById("app-header-title"),
            appHeaderIcon: document.getElementById("app-header-icon"),
            appHeaderBackBtn: document.getElementById("app-header-back-btn"),
            appHeaderHomeBtn: document.getElementById("app-header-home-btn"),
            appHeaderSettingsBtn: document.getElementById("app-header-settings-btn"),

            // Option 5: Mobile More Drawer Elements
            mobileMoreBtn: document.getElementById("mobile-more-btn"),
            mobileMoreDrawer: document.getElementById("mobile-more-drawer"),
            mobileMoreBackdrop: document.getElementById("mobile-more-backdrop"),
            mobileMoreCloseBtn: document.getElementById("mobile-more-close-btn"),
            mobileMoreHandle: document.getElementById("mobile-more-handle"),

            // Option 5: Enriched Profile Modal Elements
            profileAvatarInitials: document.getElementById("profile-avatar-initials"),
            profileStatusBadge: document.getElementById("profile-status-badge"),
            profileKapisananBadge: document.getElementById("profile-kapisanan-badge"),
            profilePurokBadge: document.getElementById("profile-purok-badge"),
            profileMemberId: document.getElementById("profile-member-id"),
            profileAttendanceRate: document.getElementById("profile-attendance-rate"),
            profileRateLabel: document.getElementById("profile-rate-label"),
            profileRateBadge: document.getElementById("profile-rate-badge"),
            profileProgressBar: document.getElementById("profile-progress-bar"),
            profileTotalSessions: document.getElementById("profile-total-sessions"),
            profileTotalPresent: document.getElementById("profile-total-present"),
            profileTotalAbsent: document.getElementById("profile-total-absent"),
            profileThuAttendance: document.getElementById("profile-thu-attendance"),
            profileSunAttendance: document.getElementById("profile-sun-attendance"),
            profileSessionStrip: document.getElementById("profile-session-strip"),
            profileFilterTabs: document.getElementById("profile-filter-tabs"),
            profileEditMemberBtn: document.getElementById("profile-edit-member-btn"),
            profileModalCloseX: document.getElementById("profile-modal-close-x"),
        };
        
        // --- Modal Listeners (Feature 1, Feature 10, Edit Modal, Restore Modal, Profile) ---
        DOM.viewModalCloseBtn.addEventListener('click', () => { DOM.attendanceViewModal.classList.add('hidden'); });
        DOM.profileModalCloseBtn.addEventListener('click', () => { DOM.memberProfileModal.classList.add('hidden'); });
        DOM.profileModalCloseX?.addEventListener('click', () => { DOM.memberProfileModal.classList.add('hidden'); });
        DOM.drilldownModalCloseBtn.addEventListener('click', () => { DOM.drilldownChartModal.classList.add('hidden'); });
        DOM.editMemberCancelBtn.addEventListener('click', () => { DOM.editMemberModal.classList.add('hidden'); });
        DOM.editMemberSaveBtn.addEventListener('click', saveEditedMember);
        DOM.editMemberName.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEditedMember();
            }
        });

        // Global Modal Escape key listener
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                DOM.attendanceViewModal?.classList.add('hidden');
                DOM.memberProfileModal?.classList.add('hidden');
                DOM.drilldownChartModal?.classList.add('hidden');
                DOM.editMemberModal?.classList.add('hidden');
                DOM.restoreBackupModal?.classList.add('hidden');
                DOM.modal?.classList.add('hidden');
                if (typeof closeMobileMoreDrawer === 'function') closeMobileMoreDrawer();
            }
        });

        // Attach listener for Data Integrity Check
        DOM.runCheckBtn.addEventListener('click', runDataIntegrityCheck);

        // --- Bulk Edit Listeners (Feature 8) ---
        DOM.bulkActionSelect.addEventListener('change', updateBulkActionControls);
        DOM.performBulkActionBtn.addEventListener('click', performBulkAction);
        
        // Listeners for individual checkbox clicks on data tables
        window.toggleMemberSelection = function(memberId) {
            const checkbox = document.querySelector(`input[data-member-id="${memberId}"]`);
            if (checkbox.checked) {
                selectedMemberIds.add(memberId);
            } else {
                selectedMemberIds.delete(memberId);
            }
            updateBulkActionControls();
        }
        
        function updateBulkActionControls() {
            DOM.selectedCount.textContent = selectedMemberIds.size;
            const actionSelected = DOM.bulkActionSelect.value !== '';
            
            // Disable button if no action is selected or no members are selected
            DOM.performBulkActionBtn.disabled = !(actionSelected && selectedMemberIds.size > 0);
        }

        // --- Event Listeners (Feature 6) ---
        DOM.addEventBtn.addEventListener('click', addNewEvent);
        DOM.calendarPrevMonth.addEventListener('click', () => {
            calendarDate.setMonth(calendarDate.getMonth() - 1);
            renderCalendar(calendarDate);
        });
        DOM.calendarNextMonth.addEventListener('click', () => {
            calendarDate.setMonth(calendarDate.getMonth() + 1);
            renderCalendar(calendarDate);
        });


        let charts = {}; 
        let calendarDate = new Date(); // State for calendar view
        const root = document.documentElement;

        // --- Utility Functions (UI) ---

        /** Show custom notification */
        function showNotification(message, isError = false) {
            const box = DOM.notificationBox;
            const accentColor = appSettings.chartColors.accent;
            
            box.textContent = message;
            box.classList.remove('opacity-0', 'pointer-events-none', 'bg-red-600', 'bg-spotify-green');
            
            if (!isError) {
                box.style.backgroundColor = accentColor;
                box.classList.remove('bg-red-600');
            } else {
                box.style.backgroundColor = ''; 
                box.classList.add('bg-red-600');
            }

            box.classList.add('opacity-100');

            setTimeout(() => {
                box.classList.remove('opacity-100');
                box.classList.add('opacity-0', 'pointer-events-none');
            }, 3000);
        }

        /** Handle custom confirmation modal */
        function showConfirmationModal(title, message, callback) {
            DOM.modalTitle.textContent = title;
            DOM.modalMessage.textContent = message;
            DOM.modal.classList.remove('hidden');

            const newConfirmBtn = DOM.modalConfirmBtn.cloneNode(true);
            DOM.modalConfirmBtn.parentNode.replaceChild(newConfirmBtn, DOM.modalConfirmBtn);
            DOM.modalConfirmBtn = newConfirmBtn; 
            
            const newCancelBtn = DOM.modalCancelBtn.cloneNode(true);
            DOM.modalCancelBtn.parentNode.replaceChild(newCancelBtn, DOM.modalCancelBtn);
            DOM.modalCancelBtn = newCancelBtn; 

            // Add new listeners
            DOM.modalConfirmBtn.addEventListener('click', () => {
                DOM.modal.classList.add('hidden');
                callback(true);
            });
            DOM.modalCancelBtn.addEventListener('click', () => {
                DOM.modal.classList.add('hidden');
                callback(false);
            });
        }
        
        /** Helper to format date for display */
        function formatDate(isoString) {
            if (!isoString) return 'N/A';
            const date = new Date(isoString);
            return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
        }
        
        /** Helper to format full timestamp for notes */
        function formatTimestamp(isoString) {
            if (!isoString) return 'N/A';
            const date = new Date(isoString);
            return date.toLocaleString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
        }

        /** Helper to format concise date (e.g. Oct 16, 2026) */
        function formatShortDate(isoString) {
            if (!isoString) return '';
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });
        }

        /** Helper to format date with day name */
        function formatEventDate(isoDateString) {
            if (!isoDateString) return 'N/A';
            const date = new Date(isoDateString + 'T00:00:00'); // Ensure date is parsed as local date
            return date.toLocaleDateString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            });
        }
        
        /** Function for Print Report */
        window.printReport = function() {
            document.getElementById('dashboard').classList.add('active-print-area');
            window.print();
            setTimeout(() => {
                document.getElementById('dashboard').classList.remove('active-print-area');
            }, 500);
        }

        // --- Attendance Utility ---

        /** Parses an attendance week key into weekNumber, year, and a numeric sortKey. */
        function parseAttendanceWeekKey(key, record) {
            let weekNumber = 0;
            let year = 0;

            const matchWYear = String(key || '').match(/^W(\d+)-(\d{4})$/i);
            if (matchWYear) {
                weekNumber = parseInt(matchWYear[1], 10);
                year = parseInt(matchWYear[2], 10);
            } else {
                const matchYearW = String(key || '').match(/^(\d{4})-W(\d+)$/i);
                if (matchYearW) {
                    year = parseInt(matchYearW[1], 10);
                    weekNumber = parseInt(matchYearW[2], 10);
                }
            }

            if (!weekNumber && record && record.weekNumber) {
                weekNumber = parseInt(record.weekNumber, 10) || 0;
            }
            if (!year && record && record.date) {
                const d = new Date(record.date);
                if (!isNaN(d.getTime())) year = d.getFullYear();
            }
            if (!year) {
                year = new Date().getFullYear();
            }

            return { weekNumber, year, sortKey: (year * 100) + weekNumber };
        }

        /** Generates a unique ID based on the input week number and year. */
        function generateAttendanceId(weekNumber, year) {
            const yr = year || new Date().getFullYear();
            return `W${weekNumber}-${yr}`;
        }

        /** Populates the Year dropdown in the Attendance Check form. */
        function populateAttendanceYearSelect() {
            const yearSelect = document.getElementById('attendance-year-select');
            if (!yearSelect) return;

            const currentYear = new Date().getFullYear();
            const existingYears = new Set([currentYear, currentYear - 1, currentYear + 1]);

            Object.keys(attendanceRecords).forEach(key => {
                const parsed = parseAttendanceWeekKey(key, attendanceRecords[key]);
                if (parsed.year) existingYears.add(parsed.year);
            });

            const sortedYears = Array.from(existingYears).sort((a, b) => b - a);
            const prevVal = yearSelect.value || String(currentYear);

            yearSelect.innerHTML = sortedYears.map(yr => 
                `<option value="${yr}" ${yr === parseInt(prevVal, 10) ? 'selected' : ''}>${yr}</option>`
            ).join('');
        }
        
        /** Saves attendance records to localStorage safely. */
        function saveAttendanceRecords() {
            safeSetItem(attendanceStorageKey, attendanceRecords);
        }

        // --- Option 5: Metadata & Navigation State ---
        const SECTION_METADATA = {
            'front-page': { title: 'Home', icon: '<svg class="w-5 h-5 text-spotify-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="9 22 9 12 15 12 15 22"/></svg>' },
            'dashboard': { title: 'Dashboard', icon: '<svg class="w-5 h-5 text-spotify-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>' },
            'input-data': { title: 'Input Entry', icon: '<svg class="w-5 h-5 text-spotify-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>' },
            'attendance-check': { title: 'Attendance Check', icon: '<svg class="w-5 h-5 text-spotify-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 14 2 2 4-4"/></svg>' },
            'attendance-summary': { title: 'Attendance Summary', icon: '<svg class="w-5 h-5 text-spotify-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>' },
            'data-views': { title: 'Data Views', icon: '<svg class="w-5 h-5 text-spotify-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9h18"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15h18"/></svg>' },
            'events': { title: 'Events Calendar', icon: '<svg class="w-5 h-5 text-spotify-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18"/></svg>' },
            'archived-data': { title: 'Archived Records', icon: '<svg class="w-5 h-5 text-spotify-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="20" height="5" x="2" y="3" rx="1"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 12h4"/></svg>' },
            'notes': { title: 'Notes & Logs', icon: '<svg class="w-5 h-5 text-spotify-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>' },
            'ms-recommendation': { title: 'Suggestion', icon: '<svg class="w-5 h-5 text-spotify-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"/></svg>' },
            'data-check': { title: 'Integrity Check', icon: '<svg class="w-5 h-5 text-spotify-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 12 2 2 4-4"/></svg>' },
            'settings': { title: 'Settings', icon: '<svg class="w-5 h-5 text-spotify-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>' },
            'about': { title: 'About Tracker V5', icon: '<svg class="w-5 h-5 text-spotify-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 16v-4M12 8h.01"/></svg>' }
        };

        let navigationHistory = [];
        let currentActiveSection = 'front-page';

        function openMobileMoreDrawer() {
            if (!DOM.mobileMoreDrawer || !DOM.mobileMoreBackdrop) return;
            DOM.mobileMoreBackdrop.classList.remove('opacity-0', 'pointer-events-none');
            DOM.mobileMoreBackdrop.classList.add('opacity-100');
            DOM.mobileMoreDrawer.classList.remove('translate-y-full');
            DOM.mobileMoreDrawer.classList.add('translate-y-0');
        }

        function closeMobileMoreDrawer() {
            if (!DOM.mobileMoreDrawer || !DOM.mobileMoreBackdrop) return;
            DOM.mobileMoreBackdrop.classList.remove('opacity-100');
            DOM.mobileMoreBackdrop.classList.add('opacity-0', 'pointer-events-none');
            DOM.mobileMoreDrawer.classList.remove('translate-y-0');
            DOM.mobileMoreDrawer.classList.add('translate-y-full');
        }

        // --- Navigation and View Management ---

        function updateNavActiveState(targetSectionId) {
            const secondarySections = ['attendance-summary', 'ms-recommendation', 'events', 'notes', 'archived-data', 'data-check', 'settings', 'about'];
            const isSecondary = secondarySections.includes(targetSectionId);

            document.querySelectorAll('[data-section-id]').forEach(item => {
                const sectionId = item.dataset.sectionId;
                const isActive = sectionId === targetSectionId;

                // Desktop Nav (using class manipulation)
                if (item.classList.contains('nav-item')) {
                    item.style.color = isActive ? 'var(--text-color)' : 'var(--secondary-text)';
                    item.classList.toggle('bg-hover-bg', isActive);
                    item.classList.toggle('font-bold', isActive);
                    item.classList.toggle('font-semibold', !isActive);
                }
                // Mobile Nav (using 'active' class)
                else if (item.classList.contains('mobile-nav-item')) {
                    item.classList.toggle('active', isActive);
                }
            });

            // Mobile "More" Tab active state when on a secondary section
            if (DOM.mobileMoreBtn) {
                DOM.mobileMoreBtn.classList.toggle('active', isSecondary);
            }

            // Persistent App Header Sync (Option 5)
            if (DOM.appHeader) {
                if (targetSectionId === 'front-page') {
                    DOM.appHeader.classList.add('hidden');
                } else {
                    DOM.appHeader.classList.remove('hidden');
                    const meta = SECTION_METADATA[targetSectionId] || { title: 'Tracker V5', icon: '' };
                    if (DOM.appHeaderTitle) DOM.appHeaderTitle.textContent = meta.title;
                    if (DOM.appHeaderIcon) DOM.appHeaderIcon.innerHTML = meta.icon;
                }
            }
        }

        function showSection(sectionId, isBack = false) {
            // Track history for back navigation
            if (!isBack && currentActiveSection && currentActiveSection !== sectionId) {
                navigationHistory.push(currentActiveSection);
                if (navigationHistory.length > 25) navigationHistory.shift();
            }
            currentActiveSection = sectionId;

            // Handle Front Page visibility of Nav/Sidebar
            if (sectionId === 'front-page') {
                document.body.classList.add('front-page-active');
            } else {
                document.body.classList.remove('front-page-active');
            }
            
            // Close all detail modals & drawers if open
            DOM.attendanceViewModal?.classList.add('hidden');
            DOM.memberProfileModal?.classList.add('hidden');
            DOM.drilldownChartModal?.classList.add('hidden');
            DOM.editMemberModal?.classList.add('hidden');
            DOM.restoreBackupModal?.classList.add('hidden');
            DOM.modal?.classList.add('hidden');
            closeMobileMoreDrawer();

            Object.keys(DOM.sections).forEach(key => {
                DOM.sections[key]?.classList.add('hidden');
            });
            
            const targetSection = DOM.sections[sectionId];
            if (targetSection) {
                 targetSection.classList.remove('hidden');
                 targetSection.scrollTop = 0;
            }

            updateNavActiveState(sectionId);

            // Trigger data-dependent loads
            if (sectionId === 'notes') {
                loadSavedNotes(); 
            }
            if (sectionId === 'events') { // Feature 6
                calendarDate = new Date(); // Reset calendar to current month on view
                renderCalendar(calendarDate);
                loadAndRenderEvents();
            }
            if (sectionId === 'dashboard') {
                updateDashboardStats(); // Ensure stats are fresh
                renderKapisananBreakdown(); // NEW: Render Kapisanan breakdown
                renderPurokRanking(); // Feature 5
                renderCharts();
            }
            if (sectionId === 'data-views') {
                updateBulkActionSelectOptions(); // Feature 8
                if (typeof updateDataViewPurokFilterOptions === 'function') updateDataViewPurokFilterOptions();
                applyFilters(); 
            }
            if (sectionId === 'archived-data') { 
                renderArchivedData();
            }
            if (sectionId === 'attendance-check') { 
                if (typeof populateAttendanceYearSelect === 'function') {
                    populateAttendanceYearSelect();
                }
                if (!DOM.weekNumberInput.value) {
                    DOM.weekNumberInput.value = (new Date()).getWeek(); 
                }
                updateAttendanceID(); 
                renderAttendanceCheck();
            }
            if (sectionId === 'attendance-summary') { 
                renderAttendanceDashboard();
            }
            if (sectionId === 'settings') { 
                loadSettingsUI();
                updateBackupHealthUI();
                if (typeof window.filterSettingsTab === 'function') window.filterSettingsTab('all');
            }
            if (sectionId === 'front-page') { 
                renderFrontPageNav();
                renderMsRecommendation(); // RENDER RECOMMENDATION ON FRONT PAGE
                updateBackupHealthUI();
            }
            if (sectionId === 'ms-recommendation') {
                renderMsRecommendation();
            }
            if (sectionId === 'data-check') {
                // Clear old results before running new check
                DOM.duplicateNamesList.innerHTML = '<p class="text-text-secondary">Click "Run Integrity Scan" to check for issues.</p>';
                DOM.emptyPurokList.innerHTML = '<p class="text-text-secondary">Click "Run Integrity Scan" to check for issues.</p>';
                DOM.dataQualityScore.textContent = '--'; // Feature 7
                DOM.dataQualityMessage.textContent = 'Run scan to calculate score.'; // Feature 7
            }
        }

        // Attach Nav Listeners (centralized + delegation)
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-section-id]');
            if (link) {
                e.preventDefault();
                const targetId = link.dataset.sectionId;
                if (targetId) {
                    closeMobileMoreDrawer();
                    showSection(targetId);
                }
            }
        });

        // Option 5: Header Navigation Listeners
        DOM.appHeaderBackBtn?.addEventListener('click', () => {
            const prev = navigationHistory.pop() || 'front-page';
            showSection(prev, true);
        });

        DOM.appHeaderHomeBtn?.addEventListener('click', () => {
            showSection('front-page');
        });

        DOM.appHeaderSettingsBtn?.addEventListener('click', () => {
            showSection('settings');
        });

        // Option 5: Mobile More Drawer Listeners
        DOM.mobileMoreBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            openMobileMoreDrawer();
        });
        DOM.mobileMoreCloseBtn?.addEventListener('click', closeMobileMoreDrawer);
        DOM.mobileMoreBackdrop?.addEventListener('click', closeMobileMoreDrawer);
        DOM.mobileMoreHandle?.addEventListener('click', closeMobileMoreDrawer);


        // --- Data Handling & Storage ---

        /** Filters data to only include ACTIVE entries for dashboard stats */
        function getActiveEntries() {
            return dataEntries.filter(entry => entry.isArchived === false);
        }
        
        /** Filters data to only include ARCHIVED entries */
        function getArchivedEntries() {
            return dataEntries.filter(entry => entry.isArchived === true);
        }
        
        /** Saves the current dataEntries array to localStorage safely */
        function saveEntries() {
            safeSetItem(dataStorageKey, dataEntries);
        }

        /** Calculates stats and updates dashboard UI. Returns stats object for charts. */
        function updateDashboardStats() {
            const activeEntries = getActiveEntries();
            const allSegments = [...new Set(appSettings.purokGroups.map(p => p.split('-')[0]))].sort((a,b) => Number(a) - Number(b));

            const stats = {
                MS: { total: 0, bySegment: {} },
                UWP: { total: 0, bySegment: {} }
            };
            allSegments.forEach(seg => {
                stats.MS.bySegment[seg] = 0;
                stats.UWP.bySegment[seg] = 0;
            });

            activeEntries.forEach(entry => {
                const status = entry.status === 'UWP' ? 'UWP' : 'MS';
                const segment = entry.purok ? entry.purok.split('-')[0] : '1';
                stats[status].total++;
                stats[status].bySegment[segment] = (stats[status].bySegment[segment] || 0) + 1;
            });

            // Update the UI colors for the dashboard stats
            const accentColor = appSettings.chartColors.accent;

            const msSegmentsHtml = allSegments.map(seg => 
                `<p class="text-lg font-medium text-text-secondary">Purok ${escapeHTML(seg)}: <span style="color: ${accentColor};" class="font-bold">${stats.MS.bySegment[seg] || 0}</span></p>`
            ).join('');

            const uwpSegmentsHtml = allSegments.map(seg => 
                `<p class="text-lg font-medium text-text-secondary">Purok ${escapeHTML(seg)}: <span style="color: ${accentColor};" class="font-bold">${stats.UWP.bySegment[seg] || 0}</span></p>`
            ).join('');

            DOM.msStatsEl.innerHTML = `
                <h3 class="text-xl font-semibold text-text-light mb-4">MS Category</h3>
                ${msSegmentsHtml}
                <p class="text-2xl font-bold mt-4 text-text-light">Total MS: <span style="color: ${accentColor};" class="font-bold">${stats.MS.total}</span></p>
            `;
            DOM.uwpStatsEl.innerHTML = `
                <h3 class="text-xl font-semibold text-text-light mb-4">UWP Category</h3>
                ${uwpSegmentsHtml}
                <p class="text-2xl font-bold mt-4 text-text-light">Total UWP: <span style="color: ${accentColor};" class="font-bold">${stats.UWP.total}</span></p>
            `;
            DOM.overallStatsEl.textContent = activeEntries.length;
            DOM.overallStatsEl.style.color = accentColor;

            return stats;
        }

        /** Feature 5: Calculates and Renders Purok Ranking */
        function renderPurokRanking() {
            // 1. Calculate Total Present Attendance for each Purok SEGMENT (1, 2, 3)
            const ranking = {};
            const allMsMembers = getActiveEntries().filter(e => e.status === 'MS');
            
            // Initialize ranking scores
            appSettings.purokGroups.forEach(purok => {
                const segment = purok.split('-')[0];
                ranking[segment] = { count: 0, totalMembers: 0, members: [] };
            });

            // Count attendance marks
            Object.values(attendanceRecords).forEach(weekRecord => {
                Object.keys(weekRecord.entries).forEach(memberId => {
                    const member = allMsMembers.find(m => m.id === memberId);
                    if (member) {
                        const segment = member.purok.split('-')[0];
                        const days = weekRecord.entries[memberId];
                        
                        if (days.Thursday === 'Present') ranking[segment].count++;
                        if (days.Sunday === 'Present') ranking[segment].count++;
                    }
                });
            });

            // Calculate total members in each segment
            allMsMembers.forEach(member => {
                const segment = member.purok.split('-')[0];
                if (ranking[segment] && !ranking[segment].members.includes(member.id)) {
                    ranking[segment].members.push(member.id);
                }
            });

            // Convert to array and sort by count descending
            const sortedRanks = Object.keys(ranking)
                .map(segment => ({
                    segment,
                    presentCount: ranking[segment].count,
                    memberCount: ranking[segment].members.length
                }))
                .sort((a, b) => b.presentCount - a.presentCount);
            
            // 2. Render the Card
            const accentColor = appSettings.chartColors.accent;
            
            if (sortedRanks.length === 0 || allMsMembers.length === 0) {
                 DOM.purokRankingCard.innerHTML = `<h3 class="text-xl font-semibold text-text-light mb-4 text-center">Purok Attendance Ranking</h3>
                    <p class="text-sm text-red-400 text-center">No MS members or attendance records found.</p>`;
                 return;
            }

            DOM.purokRankingCard.innerHTML = `<h3 class="text-xl font-semibold text-text-light mb-4 text-center">Purok Attendance Ranking</h3>`;

            const listHtml = sortedRanks.map((rank, index) => {
                const medal = index === 0 ? '🥇' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : ''));
                const score = rank.presentCount;
                const members = rank.memberCount;
                return `
                    <div class="flex justify-between items-center py-2 px-1">
                        <span class="text-sm font-medium text-text-secondary">${medal} Purok ${rank.segment} </span>
                        <span class="text-lg font-bold" style="color: ${accentColor}">${score} <span class="text-sm text-text-secondary">Presents</span></span>
                    </div>
                `;
            }).join('');
            
            DOM.purokRankingCard.innerHTML += `<div class="space-y-1 mt-2">${listHtml}</div>`;
        }


        /** NEW: Renders the Kapisanan Breakdown section */
        function renderKapisananBreakdown() {
            const activeEntries = getActiveEntries();
            const breakdown = activeEntries.reduce((acc, entry) => {
                const k = entry.kapisanan || 'N/A';
                // Only track BINHI, KADIWA, BUKLOD
                if (['BINHI', 'KADIWA', 'BUKLOD'].includes(k)) {
                    if (!acc[k]) {
                        acc[k] = { MS: 0, UWP: 0, Total: 0 };
                    }
                    acc[k][entry.status]++;
                    acc[k].Total++;
                }
                return acc;
            }, {});

            // Define order for display, excluding 'N/A'
            const KAPISANAN_ORDER = ['BINHI', 'KADIWA', 'BUKLOD']; 
            
            const accentColor = appSettings.chartColors.accent;

            DOM.kapisananBreakdown.innerHTML = KAPISANAN_ORDER.map(k => {
                const data = breakdown[k] || { MS: 0, UWP: 0, Total: 0 };
                return `
                    <div class="p-4 bg-dark-bg rounded-2xl shadow-inner text-center">
                        <h3 class="text-xl font-bold text-text-light mb-2" style="color: ${accentColor}">${k}</h3>
                        <p class="text-4xl font-extrabold text-white mb-2">${data.Total}</p>
                        <div class="flex justify-center space-x-4 text-sm">
                            <span class="text-text-secondary">MS: <span class="font-bold" style="color: ${appSettings.chartColors.ms}">${data.MS}</span></span>
                            <span class="text-text-secondary">UWP: <span class="font-bold" style="color: ${appSettings.chartColors.uwp}">${data.UWP}</span></span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Add Data Entry (Updated with Duplicate Name Check and Enter key support)
        function handleAddEntry() {
            const name = document.getElementById("name").value.trim();
            const status = document.getElementById("status").value;
            // NEW: Get Kapisanan value
            const kapisanan = DOM.kapisananSelect.value;
            const purok = document.getElementById("purok").value;

            if (name && status && purok) {
                const activeEntries = getActiveEntries();
                if (activeEntries.some(entry => entry.name.toLowerCase() === name.toLowerCase())) {
                    showNotification(`Error: Name '${name}' already exists.`, true);
                    return;
                }

                const newEntry = { 
                    id: generateUUID(),
                    name, 
                    status, 
                    kapisanan, // NEW FIELD
                    purok,
                    timestamp: new Date().toISOString(),
                    isArchived: false,
                    isRecommended: true
                };

                dataEntries.push(newEntry);
                saveEntries();
                
                applyFilters(); 
                updateDashboardStats(); 
                renderKapisananBreakdown(); // NEW: Update breakdown after new entry
                renderPurokRanking(); // Feature 5
                showNotification("Entry added successfully!");

                document.getElementById("name").value = '';
                document.getElementById("status").value = 'MS';
                DOM.kapisananSelect.value = 'BINHI'; // Reset Kapisanan
                document.getElementById("purok").value = appSettings.purokGroups[0] || '1-1';
                document.getElementById("name").focus();
            } else {
                showNotification("Please fill in all fields.", true);
            }
        }
        DOM.addEntryBtn.addEventListener("click", handleAddEntry);
        document.getElementById("name").addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                handleAddEntry();
            }
        });

        window.archiveEntry = function(id, showNotif = true) {
             showConfirmationModal(
                "Confirm Archive",
                "Are you sure you want to archive this entry? It will be removed from the main view.",
                (confirmed) => {
                    if (confirmed) {
                        const entryIndex = dataEntries.findIndex(entry => entry.id === id);
                        
                        if (entryIndex !== -1) {
                            dataEntries[entryIndex].isArchived = true;
                            saveEntries();
                            applyFilters(); 
                            updateDashboardStats();
                            renderKapisananBreakdown(); // NEW: Update breakdown after archive
                            renderPurokRanking(); // Feature 5
                            if (showNotif) {
                                showNotification("Entry archived successfully.");
                            }
                        } else if (showNotif) {
                            showNotification("Error: Entry not found or already archived.", true);
                        }
                    }
                }
            );
        }
        
        window.restoreEntry = function(id) {
             showConfirmationModal(
                "Confirm Restore",
                "Are you sure you want to restore this entry to the main data view?",
                (confirmed) => {
                    if (confirmed) {
                        const entryIndex = dataEntries.findIndex(entry => entry.id === id);
                        
                        if (entryIndex !== -1) {
                            const entryToRestore = dataEntries[entryIndex];
                            const activeEntries = getActiveEntries();
                            if (activeEntries.some(entry => entry.name.toLowerCase() === entryToRestore.name.toLowerCase())) {
                                showNotification(`Error: Cannot restore. An active entry with the name '${entryToRestore.name}' already exists.`, true);
                                return;
                            }
                            
                            dataEntries[entryIndex].isArchived = false;
                            saveEntries();
                            renderArchivedData(); 
                            updateDashboardStats();
                            renderKapisananBreakdown(); // NEW: Update breakdown after restore
                            renderPurokRanking(); // Feature 5
                            showNotification("Entry restored successfully.");
                        } else {
                            showNotification("Error: Entry not found.", true);
                        }
                    }
                }
            );
        }

        window.deleteArchivedEntry = function(id) {
            showConfirmationModal(
                "PERMANENT DELETE",
                "WARNING: This action will permanently delete this entry from the system. This cannot be undone. Proceed?",
                (confirmed) => {
                    if (confirmed) {
                        const initialLength = dataEntries.length;
                        dataEntries = dataEntries.filter(entry => entry.id !== id);
                        
                        if (dataEntries.length < initialLength) {
                            saveEntries();
                            renderArchivedData(); 
                            updateDashboardStats();
                            renderKapisananBreakdown(); // NEW: Update breakdown after delete
                            renderPurokRanking(); // Feature 5
                            showNotification("Entry permanently deleted.", true);
                        } else {
                            showNotification("Error: Entry not found.", true);
                        }
                    }
                }
            );
        }

        // NON-DESTRUCTIVE Edit Member Implementation
        window.editEntry = function(id) {
            const entry = dataEntries.find(e => e.id === id);
            if (!entry) {
                showNotification("Error: Cannot find entry to edit.", true);
                return;
            }
            
            DOM.editMemberId.value = entry.id;
            DOM.editMemberName.value = entry.name;
            DOM.editMemberStatus.value = entry.status;
            DOM.editMemberKapisanan.value = entry.kapisanan || 'BINHI';
            
            // Populate Purok select with active groups
            DOM.editMemberPurok.innerHTML = appSettings.purokGroups.map(purok => 
                `<option value="${escapeHTML(purok)}" ${purok === entry.purok ? 'selected' : ''}>${escapeHTML(purok)}</option>`
            ).join('');

            DOM.editMemberModal.classList.remove('hidden');
            DOM.editMemberName.focus();
        };

        function saveEditedMember() {
            const id = DOM.editMemberId.value;
            const newName = DOM.editMemberName.value.trim();
            const newStatus = DOM.editMemberStatus.value;
            const newKapisanan = DOM.editMemberKapisanan.value;
            const newPurok = DOM.editMemberPurok.value;

            if (!newName || !newStatus || !newPurok) {
                showNotification("Please fill in all fields.", true);
                return;
            }

            const activeEntries = getActiveEntries();
            const isDuplicate = activeEntries.some(e => e.id !== id && e.name.toLowerCase() === newName.toLowerCase());
            if (isDuplicate) {
                showNotification(`Error: Another active member with the name '${newName}' already exists.`, true);
                return;
            }

            const entryIndex = dataEntries.findIndex(e => e.id === id);
            if (entryIndex === -1) {
                showNotification("Error: Member not found.", true);
                return;
            }

            // Non-destructive update: id, timestamp, and attendance records stay intact!
            dataEntries[entryIndex].name = newName;
            dataEntries[entryIndex].status = newStatus;
            dataEntries[entryIndex].kapisanan = newKapisanan;
            dataEntries[entryIndex].purok = newPurok;

            saveEntries();
            applyFilters();
            updateDashboardStats();
            renderKapisananBreakdown();
            renderPurokRanking();
            DOM.editMemberModal.classList.add('hidden');
            showNotification("Member updated successfully!");
        }

        DOM.resetDataBtn.addEventListener('click', () => {
            showConfirmationModal(
                "Confirm Data Reset",
                "WARNING: This will permanently delete ALL data entries, notes, attendance records, and settings from this browser. Are you sure?",
                (confirmed) => {
                    if (confirmed) {
                        localStorage.clear(); 
                        
                        dataEntries = [];
                        notesHistory = [];
                        attendanceRecords = {}; 
                        appSettings = defaultSettings; 
                        upcomingEvents = []; // Feature 6

                        applyTheme(appSettings.theme);
                        renderInputPurokSelect(); 
                        
                        DOM.searchInput.value = '';
                        DOM.startDateInput.value = '';
                        DOM.endDateInput.value = '';

                        applyFilters(); 
                        updateDashboardStats();
                        renderKapisananBreakdown(); // NEW: Update breakdown after reset
                        renderPurokRanking(); // Feature 5
                        loadSavedNotes(); 
                        loadAndRenderEvents(); // Feature 6
                        renderCharts(); 
                        showNotification("All local data has been reset!", true);
                    }
                }
            );
        });
        
        // --- Import/Export Logic ---

        // NEW: Handles the click on the Import button to trigger file selection (for main data)
        DOM.importExcelBtn.addEventListener('click', () => {
            DOM.importExcelFile.click();
        });

        // NEW: Handles file selection and initiates import (for main data)
        DOM.importExcelFile.addEventListener('change', importExcelData);

        const KAPISANAN_OPTIONS = ['BINHI', 'KADIWA', 'BUKLOD'];

        /** Imports data from a selected Excel file. */
        function importExcelData(event) {
            const file = event.target.files[0];
            if (!file) {
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Convert sheet to JSON array, with header row
                const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (rawJson.length < 2) {
                    showNotification("Error: Excel file is empty or missing data rows.", true);
                    return;
                }

                // Expecting columns: Name, Status, Kapisanan, Purok, Date Added
                const headerMap = {
                    'NAME': -1, 'STATUS': -1, 'KAPISANAN': -1, 'PUROK': -1, 'DATE ADDED': -1
                };
                
                // Map headers (case-insensitive and trimmed)
                const headerRow = rawJson[0].map(h => String(h).toUpperCase().trim());
                Object.keys(headerMap).forEach(key => {
                    headerMap[key] = headerRow.indexOf(key);
                });

                if (Object.values(headerMap).some(index => index === -1)) {
                    showNotification("Error: Missing required headers (Name, Status, Kapisanan, Purok, Date Added).", true);
                    return;
                }

                const newEntries = [];
                const importedNames = new Set(getActiveEntries().map(e => e.name.toLowerCase()));
                let successfulCount = 0;
                let failedCount = 0;

                // Process data rows starting from the second row (index 1)
                for (let i = 1; i < rawJson.length; i++) {
                    const row = rawJson[i];
                    
                    const name = String(row[headerMap['NAME']]).trim() || '';
                    const status = String(row[headerMap['STATUS']]).toUpperCase().trim() || '';
                    const kapisanan = String(row[headerMap['KAPISANAN']]).toUpperCase().trim() || '';
                    const purok = String(row[headerMap['PUROK']]).toUpperCase().trim() || '';
                    // Try to convert Excel date to valid ISO string safely
                    let dateAddedStr = new Date().toISOString().substring(0, 10);
                    try {
                        const rawDate = row[headerMap['DATE ADDED']];
                        if (typeof rawDate === 'number') {
                            dateAddedStr = XLSX.SSF.format('yyyy-mm-dd', rawDate) || dateAddedStr;
                        } else if (rawDate) {
                            const parsed = new Date(rawDate);
                            if (!isNaN(parsed.getTime())) {
                                dateAddedStr = parsed.toISOString().substring(0, 10);
                            }
                        }
                    } catch (e) {
                        // Fallback remains today's date
                    }
                    
                    const requiredFields = [name, status, kapisanan, purok];
                    
                    if (requiredFields.some(f => !f)) {
                         // Skip rows with missing critical data
                         failedCount++;
                         continue;
                    }
                    
                    // Validation checks
                    if (!['MS', 'UWP'].includes(status) || !KAPISANAN_OPTIONS.includes(kapisanan) || !/^\d+-\d+$/.test(purok)) {
                         failedCount++;
                         continue;
                    }

                    if (importedNames.has(name.toLowerCase())) {
                        // Skip existing active names to prevent duplicates
                        failedCount++;
                        continue;
                    }
                    
                    importedNames.add(name.toLowerCase());

                    let validTimestamp;
                    try {
                        const dt = new Date(dateAddedStr);
                        validTimestamp = isNaN(dt.getTime()) ? new Date().toISOString() : dt.toISOString();
                    } catch (e) {
                        validTimestamp = new Date().toISOString();
                    }

                    newEntries.push({
                        id: generateUUID(),
                        name,
                        status,
                        kapisanan,
                        purok,
                        timestamp: validTimestamp,
                        isArchived: false,
                        isRecommended: true
                    });
                    successfulCount++;
                }

                if (newEntries.length > 0) {
                    dataEntries.push(...newEntries);
                    saveEntries();
                    applyFilters();
                    updateDashboardStats();
                    renderKapisananBreakdown();
                    renderPurokRanking(); // Feature 5
                    showNotification(`Import Complete! ${successfulCount} entries added. ${failedCount} failed validation/were duplicates.`, failedCount > 0);
                } else if (successfulCount === 0 && rawJson.length > 1) {
                     showNotification(`Import failed: No valid new entries found in the file. ${failedCount} entries failed validation.`, true);
                } else {
                    showNotification("Import cancelled or file was empty.", true);
                }

                // Clear file input so the same file can be imported again if needed
                DOM.importExcelFile.value = '';
            };

            reader.readAsArrayBuffer(file);
        }


        DOM.downloadExcelBtn.addEventListener("click", () => {
            const entriesToExport = filterAndSortData(true); 

            if (entriesToExport.length === 0) {
                showNotification("No active data to export (based on current filters).", true);
                return;
            }

            // UPDATED: Added Kapisanan column to export
            const ws_data = [
                ["Name", "Status", "Kapisanan", "Purok", "Date Added"]
            ];
            entriesToExport.forEach(entry => {
                ws_data.push([entry.name, entry.status, entry.kapisanan, entry.purok, formatDate(entry.timestamp)]);
            });

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(ws_data);
            XLSX.utils.book_append_sheet(wb, ws, "Filtered Data");
            XLSX.writeFile(wb, "Data_Export.xlsx");
            showNotification("Data exported to Excel successfully!");
        });
        
        function dataComparer(a, b) {
            const field = currentSortField;
            const dir = currentSortDirection === 'asc' ? 1 : -1;

            let valA = a[field];
            let valB = b[field];

            if (field === 'timestamp') {
                valA = new Date(valA).getTime();
                valB = new Date(valB).getTime();
                return (valA - valB) * dir;
            } 
            
            if (field === 'purok') {
                const partsA = valA.split('-').map(Number);
                const partsB = valB.split('-').map(Number);
                
                if (partsA[0] !== partsB[0]) {
                    return (partsA[0] - partsB[0]) * dir;
                }
                return (partsA[1] - partsB[1]) * dir;
            }
            
            // Default to string comparison (Name, Status, Kapisanan)
            valA = String(valA).toLowerCase();
            valB = String(valB).toLowerCase();
            
            if (valA < valB) return -1 * dir;
            if (valA > valB) return 1 * dir;
            return 0;
        }
        
        window.sortTable = function(field) {
            if (currentSortField === field) {
                currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortField = field;
                currentSortDirection = field === 'timestamp' ? 'desc' : 'asc'; 
            }
            applyFilters();
        }

        function updateSortIndicators() {
            document.querySelectorAll('.sort-indicator').forEach(span => {
                const field = span.dataset.sortField;
                span.classList.remove('active', 'asc', 'desc');

                if (field === currentSortField) {
                    span.classList.add('active', currentSortDirection);
                }
            });
        }
        
        let currentDataViewCategory = 'all';

        window.setDataViewCategory = function(cat) {
            currentDataViewCategory = cat;
            
            const tabAll = document.getElementById('tab-cat-all');
            const tabMs = document.getElementById('tab-cat-ms');
            const tabUwp = document.getElementById('tab-cat-uwp');
            const msContainer = document.getElementById('ms-category-container');
            const uwpContainer = document.getElementById('uwp-category-container');

            const activeClasses = 'px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition bg-spotify-green text-dark-bg shadow-sm cursor-pointer';
            const inactiveClasses = 'px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition text-text-secondary hover:text-white cursor-pointer';

            if (tabAll) tabAll.className = cat === 'all' ? activeClasses : inactiveClasses;
            if (tabMs) tabMs.className = cat === 'ms' ? activeClasses : inactiveClasses;
            if (tabUwp) tabUwp.className = cat === 'uwp' ? activeClasses : inactiveClasses;

            if (msContainer) {
                msContainer.style.display = (cat === 'all' || cat === 'ms') ? 'block' : 'none';
            }
            if (uwpContainer) {
                uwpContainer.style.display = (cat === 'all' || cat === 'uwp') ? 'block' : 'none';
            }
        };

        function updateDataViewPurokFilterOptions() {
            const select = document.getElementById('data-view-purok-filter');
            if (!select) return;
            const currentVal = select.value || 'all';

            const allPurokOptions = [...new Set([...appSettings.purokGroups, ...dataEntries.map(e => e.purok).filter(Boolean)])];
            const purokSegments = [...new Set(allPurokOptions.map(p => p.split('-')[0]))].sort((a,b) => {
                const numA = parseInt(a, 10);
                const numB = parseInt(b, 10);
                if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                return String(a).localeCompare(String(b));
            });

            let html = '<option value="all">All Puroks</option>';
            purokSegments.forEach(seg => {
                html += `<option value="${escapeHTML(seg)}">Purok ${escapeHTML(seg)}</option>`;
            });
            select.innerHTML = html;

            if (purokSegments.includes(currentVal) || currentVal === 'all') {
                select.value = currentVal;
            } else {
                select.value = 'all';
            }
        }

        function filterAndSortData(ignoreSearchAndDate = false) {
            const searchTerm = DOM.searchInput.value.toLowerCase().trim();
            const startDateStr = DOM.startDateInput.value;
            const endDateStr = DOM.endDateInput.value;
            const purokFilterEl = document.getElementById('data-view-purok-filter');
            const selectedPurok = (!ignoreSearchAndDate && purokFilterEl) ? purokFilterEl.value : 'all';

            let filteredEntries = dataEntries.filter(entry => entry.isArchived === false);

            if (!ignoreSearchAndDate) {
                if (selectedPurok && selectedPurok !== 'all') {
                    filteredEntries = filteredEntries.filter(entry => (entry.purok || '').split('-')[0] === selectedPurok);
                }

                if (searchTerm) {
                    filteredEntries = filteredEntries.filter(entry =>
                        entry.name.toLowerCase().includes(searchTerm) ||
                        entry.status.toLowerCase().includes(searchTerm) ||
                        entry.kapisanan.toLowerCase().includes(searchTerm) ||
                        entry.purok.toLowerCase().includes(searchTerm)
                    );
                }

                if (startDateStr || endDateStr) {
                    const startDate = startDateStr ? new Date(startDateStr) : null;
                    const endDate = endDateStr ? new Date(endDateStr) : null;
                    
                    filteredEntries = filteredEntries.filter(entry => {
                        const entryDate = new Date(entry.timestamp); 
                        const isAfterStart = startDate ? entryDate >= startDate : true;
                        const isBeforeEnd = endDate ? entryDate < new Date(endDate.getTime() + 86400000) : true; 

                        return isAfterStart && isBeforeEnd;
                    });
                }
            }

            if (currentSortField) {
                filteredEntries.sort(dataComparer);
            }
            
            return filteredEntries;
        }

        function applyFilters() {
            updateDataViewPurokFilterOptions();
            const filteredEntries = filterAndSortData();

            const msEntries = filteredEntries.filter(entry => entry.status === 'MS');
            const uwpEntries = filteredEntries.filter(entry => entry.status === 'UWP');
            
            // Retain selected member IDs that still exist
            const activeIdSet = new Set(getActiveEntries().map(e => e.id));
            selectedMemberIds = new Set([...selectedMemberIds].filter(id => activeIdSet.has(id)));
            updateBulkActionControls();

            // Update badge counts
            const countAll = document.getElementById('count-all-category');
            const countMs = document.getElementById('count-ms-category');
            const countUwp = document.getElementById('count-uwp-category');
            const msHeaderBadge = document.getElementById('ms-header-badge');
            const uwpHeaderBadge = document.getElementById('uwp-header-badge');

            if (countAll) countAll.textContent = filteredEntries.length;
            if (countMs) countMs.textContent = msEntries.length;
            if (countUwp) countUwp.textContent = uwpEntries.length;
            if (msHeaderBadge) msHeaderBadge.textContent = `${msEntries.length} member${msEntries.length === 1 ? '' : 's'}`;
            if (uwpHeaderBadge) uwpHeaderBadge.textContent = `${uwpEntries.length} member${uwpEntries.length === 1 ? '' : 's'}`;

            renderSingleTable(DOM.msDataTableBody, msEntries, 'ms');
            renderSingleTable(DOM.uwpDataTableBody, uwpEntries, 'uwp');
            updateSortIndicators();
        }

        let searchDebounceTimer = null;
        DOM.searchInput.addEventListener('input', () => {
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = setTimeout(applyFilters, 150);
        });
        DOM.startDateInput.addEventListener('change', applyFilters);
        DOM.endDateInput.addEventListener('change', applyFilters);

        function renderSingleTable(tableBody, entriesToRender, type) {
            const fragment = document.createDocumentFragment();
            const isArchived = type === 'archived';

            if (isArchived) {
                const COL_SPAN = 6;
                if (entriesToRender.length === 0) {
                    const row = document.createElement('tr');
                    row.innerHTML = `<td colspan="${COL_SPAN}" class="px-6 py-4 text-center text-text-secondary text-xs sm:text-sm">No archived entries found.</td>`;
                    fragment.appendChild(row);
                } else {
                    entriesToRender.forEach((entry) => {
                        const row = document.createElement('tr');
                        row.className = 'hover:bg-hover-bg/30 transition duration-100';
                        const actionButtons = `
                            <button onclick="window.restoreEntry('${escapeHTML(entry.id)}')" class="text-spotify-green hover:text-green-400 p-1.5 rounded-lg bg-spotify-green/10 hover:bg-spotify-green/20 transition cursor-pointer" title="Restore Entry">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3v5h5"/></svg>
                            </button>
                            <button onclick="window.deleteArchivedEntry('${escapeHTML(entry.id)}')" class="text-red-400 hover:text-red-300 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition cursor-pointer" title="Permanently Delete">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6"/></svg>
                            </button>
                        `;

                        row.innerHTML = `
                            <td class="px-4 py-2.5 whitespace-nowrap text-sm font-semibold text-text-light">${escapeHTML(entry.name)}</td>
                            <td class="px-3 py-2.5 whitespace-nowrap text-xs text-text-secondary text-center">${escapeHTML(entry.status)}</td>
                            <td class="px-3 py-2.5 whitespace-nowrap text-xs text-text-secondary text-center">
                                <span class="inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold bg-gray-800 text-gray-300">${escapeHTML(entry.kapisanan || 'N/A')}</span>
                            </td>
                            <td class="px-3 py-2.5 whitespace-nowrap text-xs text-text-secondary">${escapeHTML(entry.purok)}</td>
                            <td class="px-4 py-2.5 whitespace-nowrap text-xs text-text-secondary">${formatDate(entry.timestamp)}</td>
                            <td class="px-4 py-2.5 whitespace-nowrap text-sm font-medium no-print">
                                <div class="flex space-x-1.5">
                                    ${actionButtons}
                                </div>
                            </td>
                        `;
                        fragment.appendChild(row);
                    });
                }
                tableBody.innerHTML = ''; 
                tableBody.appendChild(fragment);
                return;
            }

            // Compact Purok-Separated Layout for MS and UWP matching Attendance Check
            const COL_SPAN = 5;
            const categoryLabel = type.toUpperCase();

            // Group entries by Purok segment
            const groupedEntries = entriesToRender.reduce((acc, entry) => {
                const segment = (entry.purok || 'Unassigned').split('-')[0];
                if (!acc[segment]) acc[segment] = [];
                acc[segment].push(entry);
                return acc;
            }, {});

            // Determine unique Purok segments
            const allPurokOptions = [...new Set([...appSettings.purokGroups, ...dataEntries.map(e => e.purok).filter(Boolean)])];
            let purokSegments = [...new Set(allPurokOptions.map(p => p.split('-')[0]))].sort((a,b) => {
                const numA = parseInt(a, 10);
                const numB = parseInt(b, 10);
                if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                return String(a).localeCompare(String(b));
            });

            // If a specific Purok filter is chosen in the dropdown
            const purokFilterEl = document.getElementById('data-view-purok-filter');
            const selectedPurok = purokFilterEl ? purokFilterEl.value : 'all';
            if (selectedPurok && selectedPurok !== 'all') {
                purokSegments = purokSegments.filter(seg => seg === selectedPurok);
            }

            // If searching, only show segments that contain matching entries
            const isSearching = Boolean(
                (DOM.searchInput && DOM.searchInput.value.trim()) ||
                (DOM.startDateInput && DOM.startDateInput.value) ||
                (DOM.endDateInput && DOM.endDateInput.value)
            );

            if (isSearching) {
                purokSegments = purokSegments.filter(seg => groupedEntries[seg] && groupedEntries[seg].length > 0);
            }

            if (purokSegments.length === 0 || entriesToRender.length === 0) {
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = `<td colspan="${COL_SPAN}" class="py-6 px-3 text-center text-text-secondary text-xs sm:text-sm">No ${categoryLabel} Category entries found matching current filters.</td>`;
                fragment.appendChild(emptyRow);
            } else {
                purokSegments.forEach(segment => {
                    const entries = groupedEntries[segment] || [];

                    // Purok Group Separator Header Row (identical to Attendance Check)
                    const headerRow = document.createElement('tr');
                    headerRow.className = 'bg-gray-800/90';
                    headerRow.innerHTML = `
                        <td colspan="${COL_SPAN}" class="py-1.5 px-2 sm:px-3">
                            <div class="flex items-center justify-between">
                                <span class="text-xs sm:text-sm font-bold text-spotify-green">Purok ${escapeHTML(segment)}</span>
                                <span class="text-[11px] text-text-secondary font-medium">${entries.length} member${entries.length === 1 ? '' : 's'}</span>
                            </div>
                        </td>
                    `;
                    fragment.appendChild(headerRow);

                    if (entries.length === 0) {
                        const emptyRow = document.createElement('tr');
                        emptyRow.className = 'bg-card-bg/30';
                        emptyRow.innerHTML = `
                            <td colspan="${COL_SPAN}" class="py-2 px-3 text-center text-xs text-text-secondary italic">
                                No active ${categoryLabel} Category members in Purok ${escapeHTML(segment)}.
                            </td>
                        `;
                        fragment.appendChild(emptyRow);
                    } else {
                        // Sort members within this Purok
                        if (currentSortField) {
                            entries.sort(dataComparer);
                        } else {
                            entries.sort((a, b) => a.name.localeCompare(b.name));
                        }

                        entries.forEach((entry) => {
                            const row = document.createElement('tr');
                            row.className = 'hover:bg-hover-bg/30 transition duration-100';
                            row.dataset.entryId = entry.id;

                            const kapisananBadgeClass = 
                                entry.kapisanan === 'BINHI' ? 'bg-sky-500/20 text-sky-400' :
                                entry.kapisanan === 'KADIWA' ? 'bg-spotify-green/20 text-spotify-green' :
                                entry.kapisanan === 'BUKLOD' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-gray-700/50 text-gray-300';

                            const isChecked = selectedMemberIds.has(entry.id);

                            row.innerHTML = `
                                <td class="py-2.5 px-2 text-center align-middle whitespace-nowrap no-print w-10">
                                    <input type="checkbox" data-member-id="${escapeHTML(entry.id)}" 
                                        ${isChecked ? 'checked' : ''}
                                        onclick="window.toggleMemberSelection('${escapeHTML(entry.id)}')"
                                        class="member-checkbox-${type} form-checkbox h-3.5 w-3.5 text-spotify-green bg-dark-bg border-0 rounded focus:ring-spotify-green cursor-pointer">
                                </td>
                                <td class="py-2.5 px-3 text-left align-middle">
                                    <div class="flex flex-col justify-center">
                                        <div class="flex items-center gap-1.5 flex-wrap">
                                            <span class="font-bold text-xs sm:text-sm text-text-light hover:text-spotify-green cursor-pointer transition whitespace-nowrap" onclick="window.viewMemberProfile('${escapeHTML(entry.id)}')" title="View profile">${escapeHTML(entry.name)}</span>
                                            <span class="text-[10px] sm:text-xs text-text-secondary font-mono shrink-0">(${escapeHTML(entry.purok)})</span>
                                        </div>
                                        <div class="flex items-center gap-2 mt-1 sm:hidden">
                                            <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${kapisananBadgeClass}">
                                                ${escapeHTML(entry.kapisanan || 'N/A')}
                                            </span>
                                            <span class="text-[10px] text-text-secondary whitespace-nowrap">Added ${formatDate(entry.timestamp)}</span>
                                        </div>
                                    </div>
                                </td>
                                <td class="py-2.5 px-3 text-center align-middle whitespace-nowrap hidden sm:table-cell w-28">
                                    <span class="inline-block px-2 py-0.5 rounded text-xs font-bold ${kapisananBadgeClass}">
                                        ${escapeHTML(entry.kapisanan || 'N/A')}
                                    </span>
                                </td>
                                <td class="py-2.5 px-3 text-left align-middle text-xs text-text-secondary whitespace-nowrap hidden sm:table-cell w-32">
                                    ${formatDate(entry.timestamp)}
                                </td>
                                <td class="py-2.5 px-3 text-right sm:text-center align-middle whitespace-nowrap no-print w-28">
                                    <div class="inline-flex items-center gap-1 justify-end sm:justify-center">
                                        <button onclick="window.viewMemberProfile('${escapeHTML(entry.id)}')" class="text-blue-400 hover:text-blue-300 p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition cursor-pointer" title="View Profile">
                                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                        </button>
                                        <button onclick="window.editEntry('${escapeHTML(entry.id)}')" class="text-spotify-green hover:text-green-300 p-1.5 rounded-lg bg-spotify-green/10 hover:bg-spotify-green/20 transition cursor-pointer" title="Edit Entry">
                                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 5 4 4"/></svg>
                                        </button>
                                        <button onclick="window.archiveEntry('${escapeHTML(entry.id)}')" class="text-red-400 hover:text-red-300 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition cursor-pointer" title="Archive Entry">
                                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="20" height="5" x="2" y="3" rx="1"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 12h4"/></svg>
                                        </button>
                                    </div>
                                </td>
                            `;
                            fragment.appendChild(row);
                        });
                    }
                });
            }
            
            tableBody.innerHTML = ''; 
            tableBody.appendChild(fragment);
        }
        
        function renderArchivedData() {
            const archivedEntries = getArchivedEntries();
            renderSingleTable(DOM.archivedDataTableBody, archivedEntries, 'archived');
        }
        
        /** Feature 8: Bulk action utility - Toggles selection for a category */
        window.toggleSelectAll = function(type) {
            const isMs = type === 'ms';
            const selectAllCheckbox = document.getElementById(isMs ? 'select-all-ms' : 'select-all-uwp');
            const tableBody = isMs ? DOM.msDataTableBody : DOM.uwpDataTableBody;
            const checkboxes = tableBody.querySelectorAll(`input[type="checkbox"][data-member-id]`);
            
            const isChecked = selectAllCheckbox ? selectAllCheckbox.checked : false;

            checkboxes.forEach(checkbox => {
                const memberId = checkbox.dataset.memberId;
                if (memberId) {
                    if (isChecked) {
                        selectedMemberIds.add(memberId);
                        checkbox.checked = true;
                    } else {
                        selectedMemberIds.delete(memberId);
                        checkbox.checked = false;
                    }
                }
            });

            updateBulkActionControls();
        }

        /** Feature 8: Bulk action utility - Updates select options based on current settings */
        function updateBulkActionSelectOptions() {
            const select = DOM.bulkActionSelect;
            const optgroup = select.querySelector('optgroup[label="Modify Purok"]');
            
            // Clear existing Purok options
            optgroup.innerHTML = '';

            // Add new Purok options
            appSettings.purokGroups.forEach(purok => {
                const option = document.createElement('option');
                option.value = `setPurok:${purok}`;
                option.textContent = `Change Purok to ${purok}`;
                optgroup.appendChild(option);
            });
        }
        
        /** Feature 8: Bulk action utility - Performs the chosen action */
        function performBulkAction() {
            const action = DOM.bulkActionSelect.value;
            const membersToUpdate = Array.from(selectedMemberIds);
            
            if (!action || membersToUpdate.length === 0) {
                showNotification("Please select an action and at least one member.", true);
                return;
            }

            let title = "Confirm Bulk Action";
            let message = `Are you sure you want to perform '${action}' on ${membersToUpdate.length} selected member(s)?`;

            showConfirmationModal(title, message, (confirmed) => {
                if (!confirmed) return;

                let updatedCount = 0;
                let actionType = 'modified';
                let newPurok = null;

                if (action.startsWith('setPurok:')) {
                    newPurok = action.split(':')[1];
                    actionType = `Purok set to ${newPurok}`;
                } else if (action === 'archiveSelected') {
                    actionType = 'archived';
                } else if (action === 'setRecommendedTrue') {
                    actionType = 'set for suggestion';
                } else if (action === 'setRecommendedFalse') {
                    actionType = 'removed from suggestion';
                }

                dataEntries = dataEntries.map(entry => {
                    if (membersToUpdate.includes(entry.id)) {
                        updatedCount++;
                        if (newPurok) {
                            entry.purok = newPurok;
                        } else if (action === 'archiveSelected') {
                            entry.isArchived = true;
                        } else if (action === 'setRecommendedTrue') {
                            entry.isRecommended = true;
                        } else if (action === 'setRecommendedFalse') {
                            entry.isRecommended = false;
                        }
                    }
                    return entry;
                });

                saveEntries();
                applyFilters(); // Re-render table (removes archived members)
                updateDashboardStats(); // Update stats
                renderKapisananBreakdown();
                renderPurokRanking(); // Feature 5
                
                selectedMemberIds.clear();
                DOM.bulkActionSelect.value = '';
                DOM.selectAllMs.checked = false;
                DOM.selectAllUwp.checked = false;
                updateBulkActionControls();

                showNotification(`${updatedCount} member(s) successfully ${actionType}.`);
            });
        }

        // --- ATTENDANCE CHECK LOGIC (Simplified & Compact) ---
        
        function updateAttendanceID() {
            const weekNum = DOM.weekNumberInput.value.trim();
            const yearSelect = document.getElementById('attendance-year-select');
            const selectedYear = yearSelect ? parseInt(yearSelect.value, 10) : new Date().getFullYear();

            if (weekNum && parseInt(weekNum, 10) > 0) {
                const weekId = generateAttendanceId(weekNum, selectedYear);
                DOM.weekIdHidden.value = weekId;
                DOM.weekNumberInput.classList.remove('ring-2', 'ring-red-500');

                // Overwrite indicator badge
                const overwriteBadge = document.getElementById('attendance-overwrite-badge');
                if (overwriteBadge) {
                    if (attendanceRecords[weekId]) {
                        overwriteBadge.textContent = `Existing record for Week ${weekNum} (${selectedYear}) loaded (Will overwrite on submit)`;
                        overwriteBadge.className = 'mb-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-block bg-yellow-500/20 text-yellow-400';
                        overwriteBadge.classList.remove('hidden');
                    } else {
                        overwriteBadge.textContent = `New entry for Week ${weekNum} (${selectedYear})`;
                        overwriteBadge.className = 'mb-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-block bg-green-500/20 text-green-400';
                        overwriteBadge.classList.remove('hidden');
                    }
                }

                return weekId;
            } else {
                 DOM.weekIdHidden.value = '';
                 DOM.weekNumberInput.classList.add('ring-2', 'ring-red-500');
                 const overwriteBadge = document.getElementById('attendance-overwrite-badge');
                 if (overwriteBadge) overwriteBadge.classList.add('hidden');
                 return null;
            }
        }
        
        DOM.weekNumberInput.addEventListener('input', () => {
            if (updateAttendanceID()) {
                renderAttendanceCheck();
            } else {
                DOM.attendancePurokTables.innerHTML = '<p class="text-red-400 p-4 bg-hover-bg/80 rounded-2xl text-center font-semibold">Please enter a valid Week Number to begin attendance check.</p>';
            }
        });

        document.getElementById('attendance-year-select')?.addEventListener('change', () => {
            if (updateAttendanceID()) {
                renderAttendanceCheck();
            }
        });

        function renderAttendanceCheck() {
            const weekId = DOM.weekIdHidden.value;
            if (!weekId) {
                DOM.attendancePurokTables.innerHTML = '<p class="text-red-400 p-4 bg-hover-bg/80 rounded-2xl text-center font-semibold">Please enter a valid Week Number to begin attendance check.</p>';
                return;
            }

            const msEntries = getActiveEntries().filter(entry => entry.status === 'MS');
            const groupedEntries = msEntries.reduce((acc, entry) => {
                const purokSegment = entry.purok.split('-')[0];
                if (!acc[purokSegment]) acc[purokSegment] = [];
                acc[purokSegment].push(entry);
                return acc;
            }, {});

            Object.values(groupedEntries).forEach(group => group.sort((a, b) => a.name.localeCompare(b.name)));

            const days = ['Thursday', 'Sunday'];
            const currentRecord = attendanceRecords[weekId] || { entries: {} };

            // Get unique segments from active purok list.
            const purokSegments = [...new Set(appSettings.purokGroups.map(p => p.split('-')[0]))].sort((a,b) => a - b);

            // Single unified table container with fixed column widths for 100% vertical alignment across all Puroks
            const tableContainer = document.createElement('div');
            tableContainer.className = 'overflow-x-auto w-full bg-dark-bg rounded-2xl shadow-xl';

            const table = document.createElement('table');
            table.className = 'w-full text-left border-collapse table-fixed';

            // Explicit column definitions: Name gets maximum space, Thursday & Sunday have exact fixed widths
            table.innerHTML = `
                <colgroup>
                    <col class="w-auto">
                    <col class="w-[68px] sm:w-28">
                    <col class="w-[68px] sm:w-28">
                </colgroup>
                <thead class="bg-gray-800 text-[10px] sm:text-[11px] uppercase text-text-secondary sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th class="py-2.5 px-2 sm:px-3 text-left font-semibold">Name</th>
                        <th class="py-2.5 px-0.5 sm:px-2 text-center font-semibold">Thursday</th>
                        <th class="py-2.5 px-0.5 sm:px-2 text-center font-semibold">Sunday</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-800/60" id="attendance-table-body">
                </tbody>
            `;

            const tbody = table.querySelector('#attendance-table-body');

            purokSegments.forEach(segment => {
                const entries = groupedEntries[segment] || [];

                // Purok Group Separator Header Row (aligned across all 3 columns)
                const headerRow = document.createElement('tr');
                headerRow.className = 'bg-gray-800/90';
                headerRow.innerHTML = `
                    <td colspan="3" class="py-1.5 px-2 sm:px-3">
                        <div class="flex items-center justify-between">
                            <span class="text-xs sm:text-sm font-bold text-spotify-green">Purok ${escapeHTML(segment)}</span>
                            <span class="text-[11px] text-text-secondary">${entries.length} member${entries.length === 1 ? '' : 's'}</span>
                        </div>
                    </td>
                `;
                tbody.appendChild(headerRow);

                if (entries.length === 0) {
                    const emptyRow = document.createElement('tr');
                    emptyRow.className = 'bg-card-bg/30';
                    emptyRow.innerHTML = `
                        <td colspan="3" class="py-2 px-3 text-center text-xs text-text-secondary italic">
                            No active MS Category members in Purok ${escapeHTML(segment)}.
                        </td>
                    `;
                    tbody.appendChild(emptyRow);
                } else {
                    entries.forEach(entry => {
                        const existingEntry = currentRecord.entries[entry.id] || {};
                        const row = document.createElement('tr');
                        row.className = 'hover:bg-hover-bg/30 transition duration-100';
                        row.dataset.entryId = entry.id;

                        let dayCells = '';
                        days.forEach(day => {
                            // Default attendance is Absent
                            const status = existingEntry[day] || 'Absent';
                            const isPresent = status === 'Present';

                            dayCells += `
                                <td class="py-1 px-0.5 sm:px-2 text-center whitespace-nowrap">
                                    <div class="inline-flex rounded-lg p-0.5 bg-dark-bg attendance-chip-group shadow-inner">
                                        <label class="w-6 h-6 sm:w-7 sm:h-7 rounded-md text-[11px] sm:text-xs cursor-pointer select-none transition flex items-center justify-center font-semibold ${isPresent ? 'bg-[#1DB954] text-black font-bold shadow-sm' : 'text-gray-400 hover:text-white'}" title="Present">
                                            <input type="radio" name="attendance-${entry.id}-${day}" value="Present" class="sr-only" ${isPresent ? 'checked' : ''}>
                                            <span>P</span>
                                        </label>
                                        <label class="w-6 h-6 sm:w-7 sm:h-7 rounded-md text-[11px] sm:text-xs cursor-pointer select-none transition flex items-center justify-center font-semibold ${!isPresent ? 'bg-red-600/80 text-white font-bold' : 'text-gray-400 hover:text-white'}" title="Absent">
                                            <input type="radio" name="attendance-${entry.id}-${day}" value="Absent" class="sr-only" ${!isPresent ? 'checked' : ''}>
                                            <span>A</span>
                                        </label>
                                    </div>
                                </td>
                            `;
                        });

                        row.innerHTML = `
                            <td class="py-1 px-2 sm:px-3 text-xs sm:text-sm text-text-light font-medium whitespace-normal break-words leading-tight">
                                <div class="flex flex-col sm:flex-row sm:items-center sm:gap-1.5">
                                    <span class="font-semibold text-text-light">${escapeHTML(entry.name)}</span>
                                    <span class="text-[10px] text-text-secondary font-mono opacity-75 sm:opacity-90">(${escapeHTML(entry.purok)})</span>
                                </div>
                            </td>
                            ${dayCells}
                        `;
                        tbody.appendChild(row);
                    });
                }
            });

            tableContainer.appendChild(table);
            DOM.attendancePurokTables.innerHTML = '';
            DOM.attendancePurokTables.appendChild(tableContainer);
        }

        // Live Chip Click Visual Updates
        DOM.attendancePurokTables.addEventListener('change', (e) => {
            if (e.target && e.target.type === 'radio') {
                const group = e.target.closest('.attendance-chip-group');
                if (group) {
                    const labels = group.querySelectorAll('label');
                    labels.forEach(label => {
                        const radio = label.querySelector('input[type="radio"]');
                        if (radio.checked) {
                            if (radio.value === 'Present') {
                                label.className = 'w-6 h-6 sm:w-7 sm:h-7 rounded-md text-[11px] sm:text-xs cursor-pointer select-none transition flex items-center justify-center font-bold bg-spotify-green text-dark-bg shadow-sm';
                            } else {
                                label.className = 'w-6 h-6 sm:w-7 sm:h-7 rounded-md text-[11px] sm:text-xs cursor-pointer select-none transition flex items-center justify-center font-bold bg-red-600/80 text-white';
                            }
                        } else {
                            label.className = 'w-6 h-6 sm:w-7 sm:h-7 rounded-md text-[11px] sm:text-xs cursor-pointer select-none transition flex items-center justify-center font-semibold text-gray-400 hover:text-white';
                        }
                    });
                }
            }
        });

        // Submit Attendance Handler (Absent by default)
        DOM.submitAttendanceBtn.addEventListener('click', () => {
            const weekId = DOM.weekIdHidden.value;
            const weekNum = DOM.weekNumberInput.value.trim();
            const yearSelect = document.getElementById('attendance-year-select');
            const selectedYear = yearSelect ? parseInt(yearSelect.value, 10) : new Date().getFullYear();

            if (!weekId) {
                showNotification("Please enter a valid Week Number before submitting.", true);
                return;
            }

            const activeMsEntries = getActiveEntries().filter(entry => entry.status === 'MS');
            if (activeMsEntries.length === 0) {
                showNotification("No MS Category members to record attendance for.", true);
                return;
            }

            const days = ['Thursday', 'Sunday'];
            const isOverwrite = Boolean(attendanceRecords[weekId]);

            const newWeeklyRecord = {
                weekNumber: weekNum, 
                date: new Date().toISOString(), 
                entries: {}
            };

            activeMsEntries.forEach(entry => {
                newWeeklyRecord.entries[entry.id] = {};
                days.forEach(day => {
                    const checkedRadio = document.querySelector(`input[name="attendance-${entry.id}-${day}"]:checked`);
                    newWeeklyRecord.entries[entry.id][day] = checkedRadio ? checkedRadio.value : 'Absent';
                });
            });

            // Overwrite existing or assign new record for this week and year
            attendanceRecords[weekId] = newWeeklyRecord;
            saveAttendanceRecords();
            populateAttendanceYearSelect();
            
            showNotification(isOverwrite 
                ? `Attendance for Week ${weekNum} (${selectedYear}) overwritten successfully!`
                : `Attendance for Week ${weekNum} (${selectedYear}) submitted successfully!`);

            updateAttendanceID();
            renderAttendanceCheck();
            if (!DOM.sections['attendance-summary'].classList.contains('hidden')) {
                 renderAttendanceDashboard();
            }
            if (!DOM.sections['dashboard'].classList.contains('hidden')) {
                 renderPurokRanking();
            }
        });

        // --- ATTENDANCE SUMMARY DASHBOARD (SEPARATED BY YEAR) ---

        let selectedAttendanceSummaryYear = 'all';

        window.setAttendanceSummaryYear = function(year) {
            selectedAttendanceSummaryYear = year;
            renderAttendanceDashboard();
        };

        window.recheckAttendanceWeek = function(weekNum, year) {
            populateAttendanceYearSelect();
            const yearSelect = document.getElementById('attendance-year-select');
            if (yearSelect) yearSelect.value = String(year);
            DOM.weekNumberInput.value = weekNum;
            updateAttendanceID();
            renderAttendanceCheck();
            showSection('attendance-check');
            showNotification(`Loaded Week ${weekNum} (${year}) for review / editing.`);
        };

        window.deleteAttendanceWeek = function(weekId) {
            const rec = attendanceRecords[weekId];
            const parsed = parseAttendanceWeekKey(weekId, rec);
            showConfirmationModal(
                "Delete Attendance Record",
                `Are you sure you want to permanently delete attendance for Week ${parsed.weekNumber} (${parsed.year})?`,
                (confirmed) => {
                    if (confirmed) {
                        delete attendanceRecords[weekId];
                        saveAttendanceRecords();
                        populateAttendanceYearSelect();
                        renderAttendanceDashboard();
                        showNotification(`Deleted attendance record for Week ${parsed.weekNumber} (${parsed.year}).`);
                    }
                }
            );
        };

        function renderAttendanceDashboard() {
            const container = DOM.attendanceHistoryContainer;
            if (!container) return;
            container.innerHTML = '';

            // Group all records by Year
            const yearsMap = {};
            Object.keys(attendanceRecords).forEach(weekId => {
                const rec = attendanceRecords[weekId];
                if (!rec) return;
                const parsed = parseAttendanceWeekKey(weekId, rec);
                const yr = parsed.year;
                if (!yearsMap[yr]) yearsMap[yr] = [];
                yearsMap[yr].push({
                    weekId,
                    record: rec,
                    weekNumber: parsed.weekNumber,
                    year: yr,
                    sortKey: parsed.sortKey
                });
            });

            // Sort weeks within each year descending (e.g. W52, W51... down to W1)
            Object.keys(yearsMap).forEach(yr => {
                yearsMap[yr].sort((a, b) => b.weekNumber - a.weekNumber);
            });

            // List of available years descending
            const availableYears = Object.keys(yearsMap).map(Number).sort((a, b) => b - a);

            // 1. Render Year Filter Bar
            const filterContainer = document.getElementById('attendance-year-filter-container');
            if (filterContainer) {
                if (availableYears.length === 0) {
                    filterContainer.innerHTML = '<span class="text-xs text-text-secondary">No records</span>';
                } else {
                    const totalAllWeeks = Object.keys(attendanceRecords).length;
                    let filterHtml = '';
                    
                    const isAllActive = selectedAttendanceSummaryYear === 'all';
                    filterHtml += `<button type="button" onclick="window.setAttendanceSummaryYear('all')" class="px-2.5 py-1 text-xs font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${isAllActive ? 'bg-spotify-green text-dark-bg shadow-sm' : 'bg-dark-bg text-text-secondary hover:text-white'}">All (${totalAllWeeks})</button>`;
                    
                    availableYears.forEach(yr => {
                        const isYrActive = String(selectedAttendanceSummaryYear) === String(yr);
                        const count = yearsMap[yr].length;
                        filterHtml += `<button type="button" onclick="window.setAttendanceSummaryYear('${yr}')" class="px-2.5 py-1 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${isYrActive ? 'bg-spotify-green text-dark-bg shadow-sm font-bold' : 'bg-dark-bg text-text-secondary hover:text-white'}">${yr} (${count})</button>`;
                    });
                    filterContainer.innerHTML = filterHtml;
                }
            }

            if (availableYears.length === 0) {
                container.innerHTML = '<p class="text-text-secondary p-8 bg-hover-bg/60 rounded-3xl text-center font-medium">No records found yet.</p>';
                return;
            }

            const allEntries = dataEntries.reduce((acc, entry) => { acc[entry.id] = entry; return acc; }, {});
            const displayYears = selectedAttendanceSummaryYear === 'all' 
                ? availableYears 
                : availableYears.filter(yr => String(yr) === String(selectedAttendanceSummaryYear));

            if (displayYears.length === 0) {
                container.innerHTML = `<p class="text-text-secondary p-6 bg-hover-bg/60 rounded-2xl text-center">No attendance records found for year ${escapeHTML(selectedAttendanceSummaryYear)}.</p>`;
                return;
            }

            const mainFragment = document.createDocumentFragment();

            displayYears.forEach(year => {
                const yearWeeks = yearsMap[year] || [];
                if (yearWeeks.length === 0) return;

                // Dedicated Year Section Container (Clean minimal divider)
                const yearSection = document.createElement('div');
                yearSection.className = 'space-y-3';

                // Sleek Year Divider (No redundant verbose boxes)
                const yearHeader = document.createElement('div');
                yearHeader.className = 'flex items-center gap-2.5 pt-2 pb-1';
                yearHeader.innerHTML = `
                    <span class="text-lg font-black text-white">${year}</span>
                    <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-spotify-green/20 text-spotify-green">${yearWeeks.length} ${yearWeeks.length === 1 ? 'Week' : 'Weeks'}</span>
                    <div class="flex-grow h-px bg-white/10"></div>
                `;
                yearSection.appendChild(yearHeader);

                // Container for Week Cards within this Year
                const cardsContainer = document.createElement('div');
                cardsContainer.className = 'space-y-3';

                yearWeeks.forEach(({ weekId, record, weekNumber }) => {
                    const checkedEntryIds = Object.keys(record.entries || {});
                    const totalMembersChecked = checkedEntryIds.length;

                    const totalP_Thu = checkedEntryIds.reduce((sum, id) => sum + (record.entries[id].Thursday === 'Present'), 0);
                    const totalA_Thu = totalMembersChecked - totalP_Thu;

                    const totalP_Sun = checkedEntryIds.reduce((sum, id) => sum + (record.entries[id].Sunday === 'Present'), 0);
                    const totalA_Sun = totalMembersChecked - totalP_Sun;

                    const groupedByPurok = checkedEntryIds.reduce((acc, id) => {
                        const member = allEntries[id];
                        if (member) {
                            const purokSegment = member.purok.split('-')[0];
                            if (!acc[purokSegment]) acc[purokSegment] = [];
                            acc[purokSegment].push({ member, status: record.entries[id] });
                        }
                        return acc;
                    }, {});

                    const historyCard = document.createElement('div');
                    historyCard.className = 'bg-card-bg p-3.5 sm:p-4 rounded-2xl shadow-md space-y-2.5';

                    const shortDate = formatShortDate(record.date);

                    historyCard.innerHTML = `
                        <div class="flex items-center justify-between pb-2 border-b border-white/5 gap-2">
                            <div class="flex items-baseline gap-2 min-w-0">
                                <h4 class="text-base sm:text-lg font-bold text-white whitespace-nowrap">Week ${weekNumber}</h4>
                                ${shortDate ? `<span class="text-xs text-text-secondary truncate">${shortDate}</span>` : ''}
                            </div>
                            <!-- Card Actions: Sleek Edit/Overwrite & Delete Buttons -->
                            <div class="flex items-center gap-1.5 shrink-0">
                                <button type="button" onclick="window.recheckAttendanceWeek(${weekNumber}, ${year})" class="p-1.5 sm:px-2.5 sm:py-1 text-xs font-semibold rounded-lg bg-spotify-green/15 hover:bg-spotify-green/25 text-spotify-green transition flex items-center gap-1 cursor-pointer" title="Edit / Overwrite Week ${weekNumber}">
                                    <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    <span class="hidden sm:inline">Overwrite</span>
                                </button>
                                <button type="button" onclick="window.deleteAttendanceWeek('${escapeHTML(weekId)}')" class="p-1.5 sm:px-2.5 sm:py-1 text-xs font-semibold rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 transition flex items-center gap-1 cursor-pointer" title="Delete Week ${weekNumber}">
                                    <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
                                    <span class="hidden sm:inline">Delete</span>
                                </button>
                            </div>
                        </div>

                        <!-- Thursday & Sunday Metrics (Compact & Clean) -->
                        <div class="grid grid-cols-2 gap-2 text-center bg-dark-bg/60 rounded-xl py-2 px-3 shadow-inner">
                            <div class="flex items-center justify-between sm:justify-center gap-2">
                                <span class="text-xs font-semibold text-text-secondary">Thursday</span>
                                <div class="text-xs font-bold space-x-1.5">
                                    <span class="text-[#1DB954] font-bold">Present: ${totalP_Thu}</span>
                                    <span class="text-red-400">Absent: ${totalA_Thu}</span>
                                </div>
                            </div>
                            <div class="flex items-center justify-between sm:justify-center gap-2 border-l border-white/5 pl-2 sm:pl-0">
                                <span class="text-xs font-semibold text-text-secondary">Sunday</span>
                                <div class="text-xs font-bold space-x-1.5">
                                    <span class="text-[#1DB954] font-bold">Present: ${totalP_Sun}</span>
                                    <span class="text-red-400">Absent: ${totalA_Sun}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Details by Purok Dropdown -->
                        <details class="text-text-secondary mt-1">
                            <summary class="font-medium cursor-pointer text-xs text-text-secondary hover:text-spotify-green transition duration-150 py-0.5">
                                Purok Breakdown (${totalMembersChecked} members)
                            </summary>
                            <div class="space-y-3 pt-3">
                                ${[...new Set(appSettings.purokGroups.map(p => p.split('-')[0]))].sort((a,b) => Number(a) - Number(b)).map(segment => {
                                    const purokEntries = groupedByPurok[segment] || [];
                                    const purokMemberCount = purokEntries.length;
                                    
                                    const p_thu = purokEntries.reduce((sum, item) => sum + (item.status.Thursday === 'Present'), 0);
                                    const a_thu = purokMemberCount - p_thu;
                                    const p_sun = purokEntries.reduce((sum, item) => sum + (item.status.Sunday === 'Present'), 0);
                                    const a_sun = purokMemberCount - p_sun;

                                    return `
                                        <div class="bg-dark-bg/80 p-3 rounded-xl shadow-inner">
                                            <h5 class="text-sm font-bold text-spotify-green mb-1.5">Purok ${escapeHTML(segment)} (${purokMemberCount} Members)</h5>
                                            <div class="grid grid-cols-2 gap-2 text-xs mb-2">
                                                <div>
                                                    <span class="text-text-secondary font-medium">Thursday:</span>
                                                    <span class="font-bold text-[#1DB954] mr-1.5">Present: ${p_thu}</span>
                                                    <span class="font-bold text-red-400">Absent: ${a_thu}</span>
                                                </div>
                                                <div>
                                                    <span class="text-text-secondary font-medium">Sunday:</span>
                                                    <span class="font-bold text-[#1DB954] mr-1.5">Present: ${p_sun}</span>
                                                    <span class="font-bold text-red-400">Absent: ${a_sun}</span>
                                                </div>
                                            </div>
                                            
                                            <div class="overflow-x-auto">
                                                <table class="min-w-full text-xs mt-1 divide-y divide-gray-800">
                                                    <thead>
                                                        <tr>
                                                            <th class="py-1 text-left font-semibold text-text-secondary text-[11px]">Name</th>
                                                            <th class="py-1 text-center font-semibold text-text-secondary text-[11px] w-16">Thursday</th>
                                                            <th class="py-1 text-center font-semibold text-text-secondary text-[11px] w-16">Sunday</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        ${purokEntries.map(item => `
                                                            <tr>
                                                                <td class="py-1 text-text-light text-[11px]">${escapeHTML(item.member.name)} (${escapeHTML(item.member.purok.split('-')[1] || '')})</td>
                                                                <td class="py-1 text-center font-bold text-[11px] ${item.status.Thursday === 'Present' ? 'text-[#1DB954]' : 'text-red-400'}">${escapeHTML(item.status.Thursday)}</td>
                                                                <td class="py-1 text-center font-bold text-[11px] ${item.status.Sunday === 'Present' ? 'text-[#1DB954]' : 'text-red-400'}">${escapeHTML(item.status.Sunday)}</td>
                                                            </tr>
                                                        `).join('')}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </details>
                    `;
                    cardsContainer.appendChild(historyCard);
                });

                yearSection.appendChild(cardsContainer);
                mainFragment.appendChild(yearSection);
            });

            container.appendChild(mainFragment);
        }

        /** Generates and downloads an Excel file containing all attendance history. */
        function exportAttendanceData() {
            // Attendance is only recorded for MS members, so we only export those active entries.
            const activeMsEntries = getActiveEntries().filter(entry => entry.status === 'MS');
            
            if (activeMsEntries.length === 0) {
                showNotification("No MS Category members to export attendance data for.", true);
                return;
            }

            // Sort weeks chronologically
            const sortedWeekIds = Object.keys(attendanceRecords).sort((a, b) => {
                const [weekA, yearA] = a.substring(1).split('-').map(Number);
                const [weekB, yearB] = b.substring(1).split('-').map(Number);

                if (yearA !== yearB) return yearA - yearB;
                return weekA - weekB; 
            });

            if (sortedWeekIds.length === 0) {
                 showNotification("No attendance records to export.", true);
                 return;
            }

            // 1. Build Header
            let header = ["ID", "Name", "Kapisanan", "Purok"];
            sortedWeekIds.forEach(weekId => {
                header.push(`${weekId} (Thu)`);
                header.push(`${weekId} (Sun)`);
            });
            const ws_data = [header];

            // 2. Build Data Rows
            activeMsEntries.forEach(member => {
                const row = [
                    member.id, 
                    member.name, 
                    member.kapisanan || 'N/A', 
                    member.purok
                ];

                sortedWeekIds.forEach(weekId => {
                    const weekRecord = attendanceRecords[weekId];
                    const memberStatus = weekRecord?.entries[member.id];
                    
                    row.push(memberStatus?.Thursday || 'N/A');
                    row.push(memberStatus?.Sunday || 'N/A');
                });

                ws_data.push(row);
            });

            // 3. Create and Download Workbook
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(ws_data);
            XLSX.utils.book_append_sheet(wb, ws, "Attendance History");
            XLSX.writeFile(wb, "Attendance_History_Export.xlsx");
            showNotification("Attendance history exported to Excel successfully!");
        }

        /** Imports attendance data from an Excel file and merges it with existing records. */
        function importAttendanceData(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Keep raw parsing to handle various data types
                const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (rawJson.length < 2) {
                    showNotification("Error: Excel file is empty or missing data rows.", true);
                    return;
                }

                const headerRow = rawJson[0].map(h => String(h).trim());
                
                // Mandatory headers for linking to members (ID is crucial)
                const MANDATORY_HEADERS = ['ID', 'Name', 'Purok'];
                const headerMap = {};
                MANDATORY_HEADERS.forEach(h => {
                    headerMap[h] = headerRow.indexOf(h);
                });
                
                if (MANDATORY_HEADERS.some(h => headerMap[h] === -1)) {
                    showNotification("Error: Missing required identification headers (ID, Name, Purok). Please ensure you are importing a file exported from this system.", true);
                    return;
                }
                
                // Identify dynamic attendance columns (Wxx-YYYY (Thu) or (Sun))
                const attendanceColumns = [];
                headerRow.forEach((h, index) => {
                    // Regex to match W[one or more digits]-[4 digits] (Thu) or (Sun)
                    if (h.match(/^W\d+-\d{4}\s\((Thu|Sun)\)$/)) {
                        attendanceColumns.push({ 
                            header: h, 
                            index: index, 
                            weekId: h.substring(0, h.indexOf('(')).trim(),
                            day: h.includes('(Thu)') ? 'Thursday' : 'Sunday'
                        });
                    }
                });
                
                if (attendanceColumns.length === 0) {
                     showNotification("Error: No valid weekly attendance columns (e.g., W50-2024 (Thu)) found.", true);
                    return;
                }

                let successfulRows = 0;
                let ignoredRows = 0;

                for (let i = 1; i < rawJson.length; i++) {
                    const row = rawJson[i];
                    
                    const memberId = String(row[headerMap['ID']] || '').trim();
                    
                    if (!memberId) {
                        ignoredRows++;
                        continue;
                    }
                    
                    // Ensure the member exists in the system (by ID)
                    const memberExists = dataEntries.some(entry => entry.id === memberId);
                    if (!memberExists) {
                        ignoredRows++;
                        continue;
                    }
                    
                    attendanceColumns.forEach(col => {
                        const status = String(row[col.index] || '').trim();
                        
                        if (status === 'Present' || status === 'Absent') {
                            const weekId = col.weekId;
                            const day = col.day;
                            
                            // Initialize week record if it doesn't exist
                            if (!attendanceRecords[weekId]) {
                                // Infer week number from weekId (Wxx-YYYY)
                                const weekNumMatch = weekId.match(/W(\d+)-\d{4}/);
                                const weekNumber = weekNumMatch ? weekNumMatch[1] : 'N/A';
                                
                                attendanceRecords[weekId] = {
                                    weekNumber: weekNumber,
                                    date: new Date().toISOString(), // Use import date as record date
                                    entries: {}
                                };
                            }
                            
                            // Initialize member entry if it doesn't exist
                            if (!attendanceRecords[weekId].entries[memberId]) {
                                attendanceRecords[weekId].entries[memberId] = {};
                            }
                            
                            // Set the status, potentially overwriting previous N/A or manual entries
                            attendanceRecords[weekId].entries[memberId][day] = status;
                        }
                    });
                    successfulRows++;
                }
                
                saveAttendanceRecords();
                
                if (successfulRows > 0) {
                    renderAttendanceDashboard(); // Refresh the summary view
                    renderPurokRanking(); // Feature 5
                    showNotification(`Attendance Import Complete: ${successfulRows} rows processed and merged.`, ignoredRows > 0);
                } else {
                    showNotification(`Import failed: No valid member IDs or attendance data found. Ignored ${ignoredRows} rows.`, true);
                }
                
                // Clear file input
                event.target.value = ''; 
            };

            reader.readAsArrayBuffer(file);
        }

        // Link Attendance Import/Export buttons
        DOM.exportAttendanceBtn.addEventListener("click", exportAttendanceData);
        DOM.importAttendanceBtn.addEventListener('click', () => {
            DOM.importAttendanceFile.click();
        });
        DOM.importAttendanceFile.addEventListener('change', importAttendanceData);


        // --- Option 3: Data Safety, Full System Backup & Restore Logic ---

        let pendingRestoreData = null;
        let backupReminderDismissedThisSession = false;

        function updateBackupHealthUI() {
            const meta = safeJSONParse(backupMetaStorageKey, null);
            const snapshot = safeJSONParse(restoreSnapshotStorageKey, null);

            // Toggle Rollback button visibility
            if (DOM.rollbackRestoreBtn) {
                if (snapshot && snapshot.timestamp) {
                    DOM.rollbackRestoreBtn.classList.remove('hidden');
                } else {
                    DOM.rollbackRestoreBtn.classList.add('hidden');
                }
            }

            if (!DOM.lastBackupDisplay || !DOM.backupHealthBadge) return;

            if (!meta || !meta.lastBackupDate) {
                DOM.lastBackupDisplay.textContent = "Never backed up";
                if (dataEntries && dataEntries.length > 0) {
                    DOM.backupHealthBadge.textContent = "Action Needed";
                    DOM.backupHealthBadge.className = "px-3 py-1 text-xs font-bold rounded-full bg-yellow-500/20 text-yellow-400";
                    if (DOM.backupReminderBanner && !backupReminderDismissedThisSession) {
                        DOM.backupReminderBanner.classList.remove('hidden');
                    }
                } else {
                    DOM.backupHealthBadge.textContent = "Clean State";
                    DOM.backupHealthBadge.className = "px-3 py-1 text-xs font-bold rounded-full bg-gray-500/20 text-gray-400";
                    if (DOM.backupReminderBanner) {
                        DOM.backupReminderBanner.classList.add('hidden');
                    }
                }
                return;
            }

            const backupDate = new Date(meta.lastBackupDate);
            const daysSince = (Date.now() - backupDate.getTime()) / (1000 * 60 * 60 * 24);

            const timeStr = backupDate.toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            DOM.lastBackupDisplay.textContent = timeStr;

            if (daysSince >= 7) {
                DOM.backupHealthBadge.textContent = "Backup Overdue";
                DOM.backupHealthBadge.className = "px-3 py-1 text-xs font-bold rounded-full bg-red-500/20 text-red-400";
                if (DOM.backupReminderBanner && !backupReminderDismissedThisSession && dataEntries.length > 0) {
                    DOM.backupReminderBanner.classList.remove('hidden');
                }
            } else {
                DOM.backupHealthBadge.textContent = "Up to Date";
                DOM.backupHealthBadge.className = "px-3 py-1 text-xs font-bold rounded-full bg-green-500/20 text-green-400";
                if (DOM.backupReminderBanner) {
                    DOM.backupReminderBanner.classList.add('hidden');
                }
            }
        }

        function exportFullBackup() {
            const now = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            const timestampFormatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;

            const payload = {
                system: "Tracker PWA Data Management System",
                version: "5.0",
                format: "tracker-backup-v1",
                exportedAt: now.toISOString(),
                stats: {
                    totalMembers: Array.isArray(dataEntries) ? dataEntries.length : 0,
                    activeMembers: Array.isArray(dataEntries) ? dataEntries.filter(e => !e.archived).length : 0,
                    archivedMembers: Array.isArray(dataEntries) ? dataEntries.filter(e => e.archived).length : 0,
                    attendanceWeeks: typeof attendanceRecords === 'object' && attendanceRecords !== null ? Object.keys(attendanceRecords).length : 0,
                    events: Array.isArray(upcomingEvents) ? upcomingEvents.length : 0,
                    notes: Array.isArray(notesHistory) ? notesHistory.length : 0
                },
                data: {
                    dataEntries: dataEntries || [],
                    weeklyAttendanceRecords: attendanceRecords || {},
                    upcomingEvents: upcomingEvents || [],
                    dashboardNotesHistory: notesHistory || [],
                    dashboardSettings: appSettings || defaultSettings
                }
            };

            const filename = `Tracker_Backup_${timestampFormatted}.json`;
            const jsonStr = JSON.stringify(payload, null, 2);
            const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 200);

            // Record backup meta in storage
            safeSetItem(backupMetaStorageKey, {
                lastBackupDate: now.toISOString(),
                filename: filename,
                memberCount: payload.stats.totalMembers
            });

            // Hide banner once backed up
            backupReminderDismissedThisSession = true;
            if (DOM.backupReminderBanner) DOM.backupReminderBanner.classList.add('hidden');
            updateBackupHealthUI();
            showNotification(`System backup downloaded (${payload.stats.totalMembers} members, ${payload.stats.attendanceWeeks} attendance weeks).`);
        }

        function handleRestoreFileSelect(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const parsed = JSON.parse(e.target.result);
                    if (!parsed || typeof parsed !== 'object') {
                        throw new Error("File does not contain a valid JSON object.");
                    }

                    // Normalize structures from modern or direct format
                    const d = parsed.data || parsed;
                    const members = Array.isArray(d.dataEntries) ? d.dataEntries : (Array.isArray(d.members) ? d.members : []);
                    const attendance = (d.weeklyAttendanceRecords && typeof d.weeklyAttendanceRecords === 'object')
                        ? d.weeklyAttendanceRecords
                        : ((d.attendanceRecords && typeof d.attendanceRecords === 'object') ? d.attendanceRecords : {});
                    const events = Array.isArray(d.upcomingEvents) ? d.upcomingEvents : (Array.isArray(d.events) ? d.events : []);
                    const notes = Array.isArray(d.dashboardNotesHistory) ? d.dashboardNotesHistory : (Array.isArray(d.notesHistory) ? d.notesHistory : []);
                    const settings = d.dashboardSettings || d.appSettings || null;

                    if (members.length === 0 && Object.keys(attendance).length === 0 && events.length === 0) {
                        showNotification("Backup file appears to be empty or unrecognized.", true);
                        return;
                    }

                    pendingRestoreData = {
                        members,
                        attendance,
                        events,
                        notes,
                        settings,
                        exportedAt: parsed.exportedAt || null
                    };

                    // Populate Preview Modal
                    if (DOM.restoreBackupDate) {
                        DOM.restoreBackupDate.textContent = pendingRestoreData.exportedAt
                            ? new Date(pendingRestoreData.exportedAt).toLocaleString()
                            : "Undated Backup";
                    }
                    if (DOM.restoreMembersCount) DOM.restoreMembersCount.textContent = members.length;
                    if (DOM.restoreWeeksCount) DOM.restoreWeeksCount.textContent = Object.keys(attendance).length;
                    if (DOM.restoreEventsCount) DOM.restoreEventsCount.textContent = events.length;
                    if (DOM.restoreNotesCount) DOM.restoreNotesCount.textContent = notes.length;

                    DOM.restoreBackupModal.classList.remove('hidden');
                } catch (err) {
                    console.error("Backup parse error:", err);
                    showNotification(`Failed to parse backup: ${err.message}`, true);
                } finally {
                    event.target.value = ''; // Reset input
                }
            };
            reader.readAsText(file);
        }

        function executeRestore() {
            if (!pendingRestoreData) {
                showNotification("No backup data selected.", true);
                return;
            }

            const restoreModeInput = document.querySelector('input[name="restore-mode"]:checked');
            const mode = restoreModeInput ? restoreModeInput.value : 'replace';

            // 1. Take safety snapshot of current data before overwriting/merging
            const snapshot = {
                timestamp: new Date().toISOString(),
                dataEntries: JSON.parse(JSON.stringify(dataEntries || [])),
                attendanceRecords: JSON.parse(JSON.stringify(attendanceRecords || {})),
                upcomingEvents: JSON.parse(JSON.stringify(upcomingEvents || [])),
                notesHistory: JSON.parse(JSON.stringify(notesHistory || [])),
                appSettings: JSON.parse(JSON.stringify(appSettings || defaultSettings))
            };
            safeSetItem(restoreSnapshotStorageKey, snapshot);

            // 2. Apply Restore Data based on mode
            if (mode === 'replace') {
                dataEntries = pendingRestoreData.members.map(m => ({ ...m }));
                attendanceRecords = JSON.parse(JSON.stringify(pendingRestoreData.attendance));
                upcomingEvents = pendingRestoreData.events.map(ev => ({ ...ev }));
                notesHistory = pendingRestoreData.notes.map(n => ({ ...n }));
                if (pendingRestoreData.settings) {
                    appSettings = { ...defaultSettings, ...pendingRestoreData.settings };
                }
            } else {
                // MERGE MODE
                // Merge members
                const existingIds = new Set(dataEntries.map(e => e.id));
                const existingNames = new Set(dataEntries.map(e => (e.name || '').trim().toLowerCase()));

                pendingRestoreData.members.forEach(incoming => {
                    if (incoming.id && existingIds.has(incoming.id)) {
                        // Already exists by ID, preserve
                    } else if (incoming.name && existingNames.has(incoming.name.trim().toLowerCase())) {
                        // Already exists by name, skip duplicate
                    } else {
                        dataEntries.push({ ...incoming });
                        if (incoming.id) existingIds.add(incoming.id);
                        if (incoming.name) existingNames.add(incoming.name.trim().toLowerCase());
                    }
                });

                // Merge Attendance Records
                Object.keys(pendingRestoreData.attendance).forEach(weekId => {
                    const incomingWeek = pendingRestoreData.attendance[weekId];
                    if (!attendanceRecords[weekId]) {
                        attendanceRecords[weekId] = JSON.parse(JSON.stringify(incomingWeek));
                    } else {
                        // Merge entries dictionary
                        attendanceRecords[weekId].entries = {
                            ...(incomingWeek.entries || {}),
                            ...(attendanceRecords[weekId].entries || {})
                        };
                    }
                });

                // Merge Events
                const existingEventKeys = new Set(upcomingEvents.map(e => `${e.title}_${e.date}`));
                pendingRestoreData.events.forEach(ev => {
                    const key = `${ev.title}_${ev.date}`;
                    if (!existingEventKeys.has(key)) {
                        upcomingEvents.push({ ...ev });
                        existingEventKeys.add(key);
                    }
                });

                // Merge Notes
                const existingNoteContents = new Set(notesHistory.map(n => n.content));
                pendingRestoreData.notes.forEach(note => {
                    if (!existingNoteContents.has(note.content)) {
                        notesHistory.push({ ...note });
                        existingNoteContents.add(note.content);
                    }
                });

                // Merge Purok Groups
                if (pendingRestoreData.settings && Array.isArray(pendingRestoreData.settings.purokGroups)) {
                    const combined = [...new Set([...appSettings.purokGroups, ...pendingRestoreData.settings.purokGroups])];
                    appSettings.purokGroups = combined;
                }
            }

            // 3. Save all restored data to localStorage
            saveEntries();
            saveAttendanceRecords();
            saveEvents();
            safeSetItem(notesStorageKey, notesHistory);
            saveSettings();

            // 4. Close Modal
            DOM.restoreBackupModal.classList.add('hidden');
            pendingRestoreData = null;

            // 5. Re-render and refresh all views
            applyTheme(appSettings.theme);
            renderInputPurokSelect();
            updateDashboardStats();
            renderFrontPageNav();
            applyFilters();
            renderArchivedData();
            loadAndRenderEvents();
            renderCalendar(new Date());
            loadSavedNotes();
            renderAttendanceDashboard();

            updateBackupHealthUI();
            showNotification(`Restore successful (${mode === 'replace' ? 'Full Replace' : 'Merged'}): ${dataEntries.length} members in database.`);
        }

        function executeRollback() {
            const snapshot = safeJSONParse(restoreSnapshotStorageKey, null);
            if (!snapshot) {
                showNotification("No rollback snapshot found.", true);
                return;
            }

            // Restore from snapshot
            dataEntries = Array.isArray(snapshot.dataEntries) ? snapshot.dataEntries : [];
            attendanceRecords = snapshot.attendanceRecords || {};
            upcomingEvents = Array.isArray(snapshot.upcomingEvents) ? snapshot.upcomingEvents : [];
            notesHistory = Array.isArray(snapshot.notesHistory) ? snapshot.notesHistory : [];
            if (snapshot.appSettings) appSettings = snapshot.appSettings;

            saveEntries();
            saveAttendanceRecords();
            saveEvents();
            safeSetItem(notesStorageKey, notesHistory);
            saveSettings();

            // Remove used snapshot
            localStorage.removeItem(restoreSnapshotStorageKey);

            // Re-render views
            applyTheme(appSettings.theme);
            renderInputPurokSelect();
            updateDashboardStats();
            renderFrontPageNav();
            applyFilters();
            renderArchivedData();
            loadAndRenderEvents();
            renderCalendar(new Date());
            loadSavedNotes();
            renderAttendanceDashboard();

            updateBackupHealthUI();
            showNotification("Rollback successful! Your database has been restored to the pre-restore snapshot.");
        }

        // Link Backup & Restore Buttons
        DOM.exportFullBackupBtn?.addEventListener('click', exportFullBackup);
        DOM.triggerRestoreBtn?.addEventListener('click', () => { DOM.restoreJsonInput.click(); });
        DOM.restoreJsonInput?.addEventListener('change', handleRestoreFileSelect);
        DOM.restoreConfirmBtn?.addEventListener('click', executeRestore);
        DOM.restoreCancelBtn?.addEventListener('click', () => {
            DOM.restoreBackupModal.classList.add('hidden');
            pendingRestoreData = null;
        });
        DOM.rollbackRestoreBtn?.addEventListener('click', executeRollback);
        DOM.backupReminderDownloadBtn?.addEventListener('click', exportFullBackup);
        DOM.backupReminderDismissBtn?.addEventListener('click', () => {
            backupReminderDismissedThisSession = true;
            if (DOM.backupReminderBanner) DOM.backupReminderBanner.classList.add('hidden');
        });


        // --- Notes Functionality ---
        
        function renderSavedNotes() {
            DOM.savedNotesContainer.innerHTML = '';
            
            if (notesHistory.length === 0) {
                DOM.savedNotesContainer.innerHTML = '<p class="text-text-secondary p-4 bg-hover-bg/60 rounded-2xl text-center">No saved notes yet. Start writing one above!</p>';
                return;
            }

            const fragment = document.createDocumentFragment();

            notesHistory.slice().reverse().forEach((note) => {
                const noteEl = document.createElement('div');
                noteEl.className = 'bg-hover-bg/80 p-4 rounded-2xl shadow-lg relative group';
                noteEl.innerHTML = `
                    <div class="flex justify-between items-start mb-2">
                        <p class="text-sm text-spotify-green font-mono">${formatTimestamp(note.timestamp)}</p>
                        <button onclick="window.deleteNoteByTimestamp('${escapeHTML(String(note.timestamp))}')" 
                                class="text-red-400 hover:text-red-300 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition duration-200"
                                title="Delete Note">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6"/></svg>
                        </button>
                    </div>
                    <pre class="whitespace-pre-wrap text-text-light font-sans text-sm">${escapeHTML(note.content)}</pre>
                `;
                fragment.appendChild(noteEl);
            });
            DOM.savedNotesContainer.appendChild(fragment);
        }
        
        window.deleteNoteByTimestamp = function(timestamp) {
            showConfirmationModal(
                "Delete Note",
                "Are you sure you want to delete this note? This action cannot be reversed.",
                (confirmed) => {
                    if (confirmed) {
                        const initialLength = notesHistory.length;
                        notesHistory = notesHistory.filter(note => String(note.timestamp) !== String(timestamp));
                        
                        if (notesHistory.length < initialLength) {
                            safeSetItem(notesStorageKey, notesHistory);
                            renderSavedNotes();
                            showNotification("Note deleted.");
                        } else {
                            showNotification("Error: Note not found.", true);
                        }
                    }
                }
            );
        }

        function loadSavedNotes() {
            notesHistory = safeJSONParse(notesStorageKey, []);
            renderSavedNotes();
        }

        function saveNotes() {
            const content = DOM.notesTextarea.value.trim();
            if (content.length === 0) {
                showNotification("Note cannot be empty.", true);
                return;
            }
            
            const newNote = {
                content: content,
                timestamp: new Date().toISOString()
            };

            notesHistory.push(newNote);
            safeSetItem(notesStorageKey, notesHistory);
            
            DOM.notesTextarea.value = '';

            renderSavedNotes();
            showNotification("New note saved!");
        }

        DOM.saveNotesBtn.addEventListener('click', saveNotes);


        // --- Events/Calendar Module (Feature 6) ---
        function saveEvents() {
            safeSetItem(eventsStorageKey, upcomingEvents);
        }

        function loadAndRenderEvents() {
            upcomingEvents = safeJSONParse(eventsStorageKey, []);
            
            const today = new Date().toISOString().split('T')[0];
            // Separate into upcoming and past events WITHOUT deleting past records from storage!
            const futureEvents = upcomingEvents
                .filter(event => event.date >= today)
                .sort((a, b) => a.date.localeCompare(b.date));
            const pastEvents = upcomingEvents
                .filter(event => event.date < today)
                .sort((a, b) => b.date.localeCompare(a.date));

            DOM.eventsListContainer.innerHTML = '';
            
            if (upcomingEvents.length === 0) {
                 DOM.eventsListContainer.innerHTML = '<p class="text-text-secondary p-4 bg-hover-bg/60 rounded-2xl text-center">No events scheduled.</p>';
                 return;
            }

            const fragment = document.createDocumentFragment();

            if (futureEvents.length > 0) {
                const upcomingHeader = document.createElement('h3');
                upcomingHeader.className = 'text-sm font-bold text-spotify-green mb-2 uppercase tracking-wide';
                upcomingHeader.textContent = `Upcoming Events (${futureEvents.length})`;
                fragment.appendChild(upcomingHeader);

                futureEvents.forEach(event => {
                    const el = document.createElement('div');
                    el.className = `p-4 bg-hover-bg/80 rounded-2xl shadow-lg flex justify-between items-center group mb-3`;
                    
                    el.innerHTML = `
                        <div class="flex flex-col">
                            <span class="text-lg font-semibold text-text-light">${escapeHTML(event.name)}</span>
                            <span class="text-sm font-mono text-spotify-green mt-1">${formatEventDate(event.date)}</span>
                        </div>
                        <button onclick="window.deleteEvent('${escapeHTML(event.id)}')" 
                                class="text-red-400 hover:text-red-300 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 opacity-100 transition duration-200"
                                title="Delete Event">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6"/></svg>
                        </button>
                    `;
                    fragment.appendChild(el);
                });
            } else {
                const noUpcoming = document.createElement('p');
                noUpcoming.className = 'text-text-secondary p-4 bg-hover-bg/60 rounded-2xl text-center mb-4 text-sm';
                noUpcoming.textContent = 'No upcoming events scheduled.';
                fragment.appendChild(noUpcoming);
            }

            if (pastEvents.length > 0) {
                const pastDetails = document.createElement('details');
                pastDetails.className = 'mt-4 rounded-xl p-3.5 bg-dark-bg shadow-inner';
                pastDetails.innerHTML = `
                    <summary class="font-semibold text-text-secondary cursor-pointer hover:text-text-light transition text-sm">
                        Past Events (${pastEvents.length})
                    </summary>
                    <div class="space-y-2 mt-3" id="past-events-list"></div>
                `;
                const pastList = pastDetails.querySelector('#past-events-list');
                pastEvents.forEach(event => {
                    const el = document.createElement('div');
                    el.className = 'p-3 bg-hover-bg/50 rounded-xl flex justify-between items-center text-sm shadow-sm';
                    el.innerHTML = `
                        <div class="flex flex-col">
                            <span class="text-text-secondary line-through">${escapeHTML(event.name)}</span>
                            <span class="text-xs text-gray-500 font-mono mt-0.5">${formatEventDate(event.date)}</span>
                        </div>
                        <button onclick="window.deleteEvent('${escapeHTML(event.id)}')" class="text-red-400 hover:text-red-300 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20" title="Delete Past Event">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6"/></svg>
                        </button>
                    `;
                    pastList.appendChild(el);
                });
                fragment.appendChild(pastDetails);
            }

            DOM.eventsListContainer.appendChild(fragment);
        }

        function addNewEvent() {
            const name = DOM.eventNameInput.value.trim();
            const date = DOM.eventDateInput.value;
            
            if (!name || !date) {
                showNotification("Please enter both event name and date.", true);
                return;
            }

            const today = new Date().toISOString().split('T')[0];
            if (date < today) {
                showNotification("Cannot add events in the past.", true);
                return;
            }

            const newEvent = {
                id: generateUUID(),
                name: name,
                date: date
            };

            upcomingEvents.push(newEvent);
            saveEvents();

            DOM.eventNameInput.value = '';
            DOM.eventDateInput.value = '';

            loadAndRenderEvents();
            renderCalendar(calendarDate); // Refresh calendar markers
            showNotification("Event scheduled successfully!");
        }

        DOM.eventNameInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                addNewEvent();
            }
        });

        window.deleteEvent = function(eventId) {
            showConfirmationModal(
                "Delete Event",
                "Are you sure you want to delete this scheduled event?",
                (confirmed) => {
                    if (confirmed) {
                        const initialLength = upcomingEvents.length;
                        upcomingEvents = upcomingEvents.filter(event => event.id !== eventId);
                        
                        if (upcomingEvents.length < initialLength) {
                            saveEvents();
                            loadAndRenderEvents();
                            renderCalendar(calendarDate); // Refresh calendar markers
                            showNotification("Event deleted.");
                        } else {
                            showNotification("Error: Event not found.", true);
                        }
                    }
                }
            );
        }

        /** Feature 6 Enhancement: Renders the calendar */
        function renderCalendar(date) {
            DOM.calendarGridBody.innerHTML = '';
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const month = date.getMonth();
            const year = date.getFullYear();

            DOM.calendarMonthYear.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

            const firstDayOfMonth = new Date(year, month, 1);
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
            
            // Get event dates for the current month
            const eventDatesInMonth = new Set(
                upcomingEvents
                    .filter(event => {
                        const eventDate = new Date(event.date + 'T00:00:00');
                        return eventDate.getMonth() === month && eventDate.getFullYear() === year;
                    })
                    .map(event => new Date(event.date + 'T00:00:00').getDate())
            );

            // Calculate starting date for the grid
            let currentDay = new Date(firstDayOfMonth);
            currentDay.setDate(currentDay.getDate() - startDayOfWeek);
            
            const fragment = document.createDocumentFragment();

            for (let i = 0; i < 6; i++) { // Max 6 weeks
                // Add Week Number Cell
                const weekNumEl = document.createElement('div');
                weekNumEl.className = 'calendar-week-num';
                weekNumEl.textContent = `W${currentDay.getWeek()}`;
                fragment.appendChild(weekNumEl);
                
                // Add Day Cells
                for (let j = 0; j < 7; j++) {
                    const dayEl = document.createElement('div');
                    dayEl.className = 'calendar-day';

                    const dayDate = new Date(currentDay);
                    dayDate.setHours(0, 0, 0, 0);

                    if (dayDate.getMonth() === month) {
                        dayEl.classList.add('day-in-month');
                        dayEl.textContent = dayDate.getDate();
                        dayEl.onclick = () => {
                            DOM.eventDateInput.value = dayDate.toISOString().split('T')[0];
                        };
                        
                        // Check for 'today'
                        if (dayDate.getTime() === today.getTime()) {
                            dayEl.classList.add('day-today');
                        }
                        
                        // Check for event
                        if (eventDatesInMonth.has(dayDate.getDate())) {
                            const marker = document.createElement('div');
                            marker.className = 'calendar-event-marker';
                            dayEl.appendChild(marker);
                        }

                    } else {
                        dayEl.classList.add('day-other-month');
                        dayEl.textContent = dayDate.getDate();
                    }
                    
                    fragment.appendChild(dayEl);
                    currentDay.setDate(currentDay.getDate() + 1);
                }
            }
            
            DOM.calendarGridBody.appendChild(fragment);
        }


        // --- Settings & Theme Management ---
        
        /** Saves settings object to localStorage safely. */
        function saveSettings() {
            safeSetItem(settingsStorageKey, appSettings);
        }
        
        /** Applies theme/color settings to CSS variables and updates UI elements. */
        function applyTheme(themeName) {
            const isDark = themeName === 'dark';
            document.body.classList.toggle('light-mode', !isDark);
            
            // 1. Update Base Colors
            if (isDark) {
                root.style.setProperty('--primary-bg', '#121212');
                root.style.setProperty('--secondary-bg', '#1c1c1c');
                root.style.setProperty('--text-color', '#ffffff');
                root.style.setProperty('--secondary-text', '#b3b3b3');
                root.style.setProperty('--hover-bg', '#282828');
            } else {
                root.style.setProperty('--primary-bg', '#F7F7F7');
                root.style.setProperty('--secondary-bg', '#ffffff');
                root.style.setProperty('--text-color', '#121212');
                root.style.setProperty('--secondary-text', '#555555');
                root.style.setProperty('--hover-bg', '#E5F0FF'); // Light mode hover
            }
            
            // Helper to get contrast text color (dark vs light)
            function getContrastTextColor(hex) {
                if (!hex || hex.length < 6) return '#121212';
                const c = hex.replace('#', '');
                const r = parseInt(c.substr(0, 2), 16) || 0;
                const g = parseInt(c.substr(2, 2), 16) || 0;
                const b = parseInt(c.substr(4, 2), 16) || 0;
                const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
                return (yiq >= 135) ? '#121212' : '#ffffff';
            }

            // 2. Update Accent, Title, Button and other dynamic colors
            const accentCol = appSettings.chartColors.accent || SPOTIFY_GREEN;
            const titleCol = appSettings.chartColors.title || accentCol;
            const btnCol = appSettings.chartColors.button || accentCol;

            root.style.setProperty('--accent', accentCol);
            root.style.setProperty('--title-color', titleCol);
            root.style.setProperty('--button-color', btnCol);
            root.style.setProperty('--button-text', getContrastTextColor(btnCol));
            root.style.setProperty('--present-color', '#1DB954');
            root.style.setProperty('--ms-color', appSettings.chartColors.ms);
            root.style.setProperty('--uwp-color', appSettings.chartColors.uwp);
            root.style.setProperty('--line-color', appSettings.chartColors.line);
            root.style.setProperty('--pie-color-1', appSettings.chartColors.pie[0]);
            root.style.setProperty('--pie-color-2', appSettings.chartColors.pie[1]);
            root.style.setProperty('--pie-color-3', appSettings.chartColors.pie[2]);
            root.style.setProperty('--pie-color-4', appSettings.chartColors.pie[3]);

            
            // 3. Re-render data views if visible (to update dynamic colors)
            if (!DOM.sections['dashboard'].classList.contains('hidden')) {
                updateDashboardStats(); // Updates stat box colors
                renderKapisananBreakdown(); // NEW: Update breakdown on theme change
                renderPurokRanking(); // Feature 5
                renderCharts(); // Re-renders charts with new colors/text styles
            }
            if (!DOM.sections['data-views'].classList.contains('hidden')) {
                applyFilters(); // Ensures row colors/links are updated
            }
            
            // 4. Update Settings UI Toggle state
            DOM.themeToggle.checked = !isDark;
        }

        // --- Purok Management UI Rendering ---
        function renderPurokList() {
            const fragment = document.createDocumentFragment();
            appSettings.purokGroups.forEach(purok => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'flex items-center justify-between px-3 py-1 text-sm font-medium rounded-full bg-red-700 hover:bg-red-600 text-white transition duration-150';
                button.innerHTML = `
                    <span>${escapeHTML(purok)}</span>
                    <svg onclick="window.deletePurok('${escapeHTML(purok)}')" class="w-4 h-4 ml-2 cursor-pointer hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                `;
                fragment.appendChild(button);
            });
            DOM.purokListContainer.innerHTML = appSettings.purokGroups.length > 0 ? '' : '<p class="text-text-secondary">No custom groups defined.</p>';
            DOM.purokListContainer.appendChild(fragment);
            const purokBadge = document.getElementById('purok-count-badge');
            if (purokBadge) {
                purokBadge.textContent = appSettings.purokGroups.length + ' Active';
            }
            
            // Also update the Input Data form select box and Bulk Action options (Feature 8)
            renderInputPurokSelect();
            updateBulkActionSelectOptions();
        }
        
        function renderInputPurokSelect() {
            DOM.inputPurokSelect.innerHTML = appSettings.purokGroups.map(purok => 
                `<option value="${escapeHTML(purok)}">${escapeHTML(purok)}</option>`
            ).join('');
        }

        DOM.newPurokInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                DOM.addPurokBtn.click();
            }
        });
        
        /** Renders the navigation grid on the Front Page */
        function renderFrontPageNav() {
            // ALL links are available on the front page, including secondary sections.
            const allNavLinks = [
                { id: 'dashboard', name: 'Dashboard', icon: '<svg class="w-6 h-6 shrink-0 text-spotify-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>'},
                { id: 'input-data', name: 'Input Entry', icon: '<svg class="w-6 h-6 shrink-0 text-spotify-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>'},
                { id: 'data-views', name: 'Data Views', icon: '<svg class="w-6 h-6 shrink-0 text-spotify-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9h18"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15h18"/></svg>'},
                { id: 'attendance-check', name: 'Attendance Check', icon: '<svg class="w-6 h-6 shrink-0 text-spotify-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 14 2 2 4-4"/></svg>'},
                { id: 'attendance-summary', name: 'Attendance Summary', icon: '<svg class="w-6 h-6 shrink-0 text-spotify-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>'},
                { id: 'ms-recommendation', name: 'Suggestion', icon: '<svg class="w-6 h-6 shrink-0 text-spotify-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"/></svg>'},
                { id: 'archived-data', name: 'Archived Data', icon: '<svg class="w-6 h-6 shrink-0 text-spotify-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="20" height="5" x="2" y="3" rx="1"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 12h4"/></svg>'},
                { id: 'notes', name: 'Notes', icon: '<svg class="w-6 h-6 shrink-0 text-spotify-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>'},
                { id: 'events', name: 'Events', icon: '<svg class="w-6 h-6 shrink-0 text-spotify-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18"/></svg>'},
                { id: 'data-check', name: 'Integrity Check', icon: '<svg class="w-6 h-6 shrink-0 text-spotify-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 12 2 2 4-4"/></svg>'},
                { id: 'settings', name: 'Settings', icon: '<svg class="w-6 h-6 shrink-0 text-spotify-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>'},
                { id: 'about', name: 'About', icon: '<svg class="w-6 h-6 shrink-0 text-spotify-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 16v-4M12 8h.01"/></svg>'},
            ];
            
            DOM.frontPageNavGrid.innerHTML = allNavLinks.map(item => `
                <a href="#" data-section-id="${item.id}" class="flex flex-col items-center justify-center p-2 sm:p-3 bg-card-bg rounded-2xl shadow-lg hover:shadow-2xl transition duration-200 transform hover:scale-105 hover:bg-hover-bg aspect-square w-full h-full gap-1 overflow-hidden select-none" style="background-color: var(--secondary-bg); color: var(--text-color);">
                    ${item.icon}
                    <span class="text-[11px] sm:text-xs font-semibold text-text-light text-center leading-tight h-7 sm:h-8 flex items-center justify-center px-0.5 break-words">${item.name}</span>
                </a>
            `).join('');
            
            document.querySelectorAll('#front-page-nav-grid a').forEach(link => {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    const targetId = link.dataset.sectionId;
                    if (targetId) {
                        showSection(targetId);
                    }
                });
            });
        }

        // --- Data Integrity Check Logic (Feature 7) ---
        
        function runDataIntegrityCheck() {
            showNotification("Running data integrity scan...");
            
            const activeEntries = getActiveEntries();
            const totalActiveEntries = activeEntries.length;
            let issuesFound = 0;

            // 1. Duplicate Name Check
            const nameMap = {};
            const duplicateNames = [];

            activeEntries.forEach(entry => {
                const lowerName = entry.name.toLowerCase();
                if (nameMap[lowerName]) {
                    if (!duplicateNames.includes(entry.name)) {
                        duplicateNames.push(entry.name);
                        issuesFound++;
                    }
                } else {
                    nameMap[lowerName] = true;
                }
            });

            if (duplicateNames.length > 0) {
                DOM.duplicateNamesList.innerHTML = `
                    <p class="text-red-500 font-bold mb-2">🚨 ${duplicateNames.length} duplicate name(s) found:</p>
                    <ul class="list-disc list-inside space-y-1 ml-4 text-text-light">
                        ${duplicateNames.map(name => `<li class="text-yellow-400">${name}</li>`).join('')}
                    </ul>
                    <p class="text-xs text-text-secondary mt-2">Action: You must manually correct these names in the Data Views section.</p>
                `;
            } else {
                DOM.duplicateNamesList.innerHTML = '<p class="text-spotify-green font-bold">✅ No duplicate names found.</p>';
            }

            // 2. Empty Purok Group Check
            const activePuroks = new Set(activeEntries.map(entry => entry.purok));
            const emptyPuroks = appSettings.purokGroups.filter(purok => !activePuroks.has(purok));
            
            if (emptyPuroks.length > 0) {
                issuesFound += emptyPuroks.length; // Each empty group is a configuration issue
                DOM.emptyPurokList.innerHTML = `
                    <p class="text-red-500 font-bold mb-2">⚠️ ${emptyPuroks.length} active Purok groups currently have no members:</p>
                    <ul class="list-disc list-inside space-y-1 ml-4 text-text-light">
                        ${emptyPuroks.map(purok => `<li class="text-yellow-400">${purok}</li>`).join('')}
                    </ul>
                    <p class="text-xs text-text-secondary mt-2">Action: Consider modifying or deleting these groups in the Settings section.</p>
                `;
            } else {
                DOM.emptyPurokList.innerHTML = '<p class="text-spotify-green font-bold">✅ All defined Purok groups are in use (or no groups defined).</p>';
            }

            // 3. Calculate Data Quality Score (Feature 7)
            
            // Total score is calculated based on:
            // 100 base score
            // Deduct 10 points per duplicate name found
            // Deduct 5 points per unused Purok group defined
            
            const maxScore = 100;
            let scoreDeduction = (duplicateNames.length * 10) + (emptyPuroks.length * 5);
            
            // Ensure score doesn't go below zero
            let finalScore = Math.max(0, maxScore - scoreDeduction);
            
            let message = '';
            let scoreColor = '';

            if (finalScore === 100) {
                message = "Excellent! Data integrity is pristine.";
                scoreColor = 'text-spotify-green';
            } else if (finalScore >= 80) {
                message = "Good. Minor issues detected, but overall quality is high.";
                scoreColor = 'text-yellow-400';
            } else if (finalScore >= 50) {
                message = "Fair. Multiple issues found. Cleanup recommended.";
                scoreColor = 'text-orange-500';
            } else {
                message = "Poor. Major data integrity issues. Immediate action required.";
                scoreColor = 'text-red-500';
            }

            DOM.dataQualityScore.textContent = finalScore;
            DOM.dataQualityScore.className = `text-5xl font-extrabold ${scoreColor}`;
            DOM.dataQualityMessage.textContent = message;


            showNotification("Integrity check complete!");
        }

        // --- Settings UI Initialization and Listeners ---
        function loadSettingsUI() {
            DOM.themeToggle.checked = appSettings.theme === 'light';
            
            // Define all inputs and their corresponding swatches
            const colorInputs = [
                { input: DOM.colorAccentInput, swatch: DOM.swatchAccent, key: 'accent', button: DOM.btnColorAccent },
                { input: DOM.colorTitleInput, swatch: DOM.swatchTitle, key: 'title', button: DOM.btnColorTitle },
                { input: DOM.colorButtonInput, swatch: DOM.swatchButton, key: 'button', button: DOM.btnColorButton },
                { input: DOM.colorMsInput, swatch: DOM.swatchMs, key: 'ms', button: DOM.btnColorMs },
                { input: DOM.colorUwpInput, swatch: DOM.swatchUwp, key: 'uwp', button: DOM.btnColorUwp },
                { input: DOM.colorLineInput, swatch: DOM.swatchLine, key: 'line', button: DOM.btnColorLine },
                { input: DOM.colorPie1Input, swatch: DOM.swatchPie1, key: 'pie', index: 0, button: DOM.btnColorPie1 },
                { input: DOM.colorPie2Input, swatch: DOM.swatchPie2, key: 'pie', index: 1, button: DOM.btnColorPie2 },
                { input: DOM.colorPie3Input, swatch: DOM.swatchPie3, key: 'pie', index: 2, button: DOM.btnColorPie3 },
            ];

            colorInputs.forEach(({ input, swatch, key, index, button }) => {
                let colorValue;
                if (key === 'pie') {
                    colorValue = (appSettings.chartColors && appSettings.chartColors.pie && appSettings.chartColors.pie[index]) || defaultColors.pie[index] || '#1DB954';
                } else {
                    colorValue = (appSettings.chartColors && appSettings.chartColors[key]) || defaultColors[key] || '#1DB954';
                }
                
                if (input) {
                    input.value = colorValue;
                    input.oninput = () => {
                        if (swatch) swatch.style.backgroundColor = input.value;
                    };
                }
                
                if (swatch) {
                    swatch.style.backgroundColor = colorValue;
                }
                
                // Link button to trigger hidden input click
                if (button && input) {
                    button.onclick = () => {
                        input.click();
                    };
                }
            });
            
            // Manually handle Segment 4 removal from UI (if it exists in data)
            if (DOM.colorPie4Input) {
                DOM.colorPie4Input.style.display = 'none';
            }

            renderPurokList();
        }
        
        DOM.themeToggle.addEventListener('change', (e) => {
            appSettings.theme = e.target.checked ? 'light' : 'dark';
            saveSettings();
            applyTheme(appSettings.theme);
        });
        
        DOM.resetAccentBtn.addEventListener('click', () => {
             DOM.colorAccentInput.value = SPOTIFY_GREEN;
             DOM.swatchAccent.style.backgroundColor = SPOTIFY_GREEN;
             if (DOM.colorTitleInput) {
                 DOM.colorTitleInput.value = SPOTIFY_GREEN;
                 DOM.swatchTitle.style.backgroundColor = SPOTIFY_GREEN;
             }
             if (DOM.colorButtonInput) {
                 DOM.colorButtonInput.value = SPOTIFY_GREEN;
                 DOM.swatchButton.style.backgroundColor = SPOTIFY_GREEN;
             }
             showNotification("Accent, Title, and Button colors reset to default. Click 'Save and Apply' to confirm.");
        });

        // NEW: Reset All Colors Logic
        DOM.resetAllColorsBtn.addEventListener('click', () => {
             showConfirmationModal(
                "Reset All Colors",
                "Are you sure you want to reset ALL chart and accent colors to the default scheme?",
                (confirmed) => {
                    if (confirmed) {
                        appSettings.chartColors = { ...defaultColors };
                        saveSettings();
                        loadSettingsUI(); // Reload inputs and swatches with default values
                        applyTheme(appSettings.theme); // Apply to CSS and charts
                        showNotification("All colors reset to default successfully!");
                    }
                }
            );
        });

        DOM.saveColorsBtn.addEventListener('click', () => {
            appSettings.chartColors.ms = DOM.colorMsInput.value;
            appSettings.chartColors.uwp = DOM.colorUwpInput.value;
            appSettings.chartColors.line = DOM.colorLineInput.value;
            appSettings.chartColors.accent = DOM.colorAccentInput.value;
            if (DOM.colorTitleInput) appSettings.chartColors.title = DOM.colorTitleInput.value;
            if (DOM.colorButtonInput) appSettings.chartColors.button = DOM.colorButtonInput.value;
            
            // Update Pie Colors from input fields
            appSettings.chartColors.pie[0] = DOM.colorPie1Input.value;
            appSettings.chartColors.pie[1] = DOM.colorPie2Input.value;
            appSettings.chartColors.pie[2] = DOM.colorPie3Input.value;
            // appSettings.chartColors.pie[3] = DOM.colorPie4Input.value; // Removed Segment 4

            // Keep the rest of the default pie palette for consistency if more segments show up
            appSettings.chartColors.pie.splice(4, appSettings.chartColors.pie.length - 4, ...defaultColors.pie.slice(4));

            saveSettings();
            applyTheme(appSettings.theme);
            showNotification("Chart colors and accent theme saved and applied!");
        });
        
        DOM.addPurokBtn.addEventListener('click', () => {
            const newPurok = DOM.newPurokInput.value.trim().toUpperCase();
            const regex = /^[0-9]+-[0-9]+$/; 
            
            if (!regex.test(newPurok)) {
                showNotification("Invalid Purok format. Use #-# (e.g., 2-5).", true);
                return;
            }
            
            if (appSettings.purokGroups.includes(newPurok)) {
                showNotification(`Purok group ${newPurok} already exists.`, true);
                return;
            }
            
            appSettings.purokGroups.push(newPurok);
            appSettings.purokGroups.sort((a, b) => {
                const [segA, numA] = a.split('-').map(Number);
                const [segB, numB] = b.split('-').map(Number);
                if (segA !== segB) return segA - segB;
                return numA - numB;
            });
            
            saveSettings();
            renderPurokList();
            DOM.newPurokInput.value = '';
            showNotification(`Purok group ${newPurok} added successfully!`);
        });

        window.deletePurok = function(purok) {
             showConfirmationModal(
                "Confirm Delete Purok Group",
                `Are you sure you want to delete the Purok group ${purok}? Existing entries will keep this value, but it will be removed from future input options.`,
                (confirmed) => {
                    if (confirmed) {
                        appSettings.purokGroups = appSettings.purokGroups.filter(p => p !== purok);
                        saveSettings();
                        renderPurokList();
                        updateBulkActionSelectOptions(); // Feature 8
                        showNotification(`Purok group ${purok} deleted.`);
                    }
                }
            );
        }

        // --- MS Recommendation Logic (UPDATED) ---
        
        /** Finds MS members with 3+ consecutive attendance days (Thursday or Sunday). */
        function findMsRecommendation() {
            const activeMsMembers = getActiveEntries().filter(entry => entry.status === 'MS' && entry.isRecommended === true);
            
            // 1. Get and sort week IDs by week number (Wxx-YYYY)
            const sortedWeekIds = Object.keys(attendanceRecords).sort((a, b) => {
                const [weekA, yearA] = a.substring(1).split('-').map(Number);
                const [weekB, yearB] = b.substring(1).split('-').map(Number);

                if (yearA !== yearB) return yearA - yearB;
                return weekA - weekB; 
            });
            
            const FINAL_RECOMMENDATIONS_3_SESSIONS = activeMsMembers.filter(member => {
                let consecutiveSessions = 0;
                
                // Get all session records chronologically
                const sessionRecords = [];
                for (const weekId of sortedWeekIds) {
                    const weekRecord = attendanceRecords[weekId].entries[member.id];
                    if (weekRecord) {
                         sessionRecords.push(weekRecord.Thursday);
                         sessionRecords.push(weekRecord.Sunday);
                    }
                }

                // Check for 3 consecutive 'Present' marks in the sessions array
                for (let i = 0; i < sessionRecords.length; i++) {
                    if (sessionRecords[i] === 'Present') {
                        consecutiveSessions++;
                    } else {
                        consecutiveSessions = 0;
                    }
                    if (consecutiveSessions >= 3) {
                        return true; // Member meets the 3 consecutive session criteria
                    }
                }
                return false;
            });

            // We must now return the members that meet the **3 consecutive sessions** logic, 
            // plus retrieve the last 3 dates they were present for the UI.
            const finalRecommendationList = FINAL_RECOMMENDATIONS_3_SESSIONS.map(member => {
                let consecutiveSessions = 0;
                let streakDates = [];
                
                // Get all session dates and statuses chronologically
                const allSessions = [];
                for (const weekId of sortedWeekIds) {
                    const weekRecord = attendanceRecords[weekId].entries[member.id];
                    if (weekRecord) {
                         allSessions.push({ date: weekId + " (Thu)", status: weekRecord.Thursday });
                         allSessions.push({ date: weekId + " (Sun)", status: weekRecord.Sunday });
                    }
                }

                for (const session of allSessions) {
                    if (session.status === 'Present') {
                        consecutiveSessions++;
                        streakDates.push(session.date);
                    } else {
                        consecutiveSessions = 0;
                        streakDates = [];
                    }
                }
                
                return {
                    id: member.id,
                    name: member.name,
                    purok: member.purok,
                    streak: streakDates.slice(-3) // Show the last 3 sessions for UI
                };
            });


            // Return recommended members who are NOT flagged as not recommended
            const filteredRecommendations = finalRecommendationList
                .filter(rec => activeMsMembers.find(m => m.id === rec.id).isRecommended !== false);

            return filteredRecommendations.sort((a, b) => a.name.localeCompare(b.name));
        }

        /** Renders the suggestion list. */
        function renderMsRecommendation() {
            const recommendations = findMsRecommendation();
            const container = DOM.msRecommendationList;
            container.innerHTML = '';
            
            if (recommendations.length === 0) {
                 container.innerHTML = '<p class="text-text-secondary text-center">No members currently meet the 3-session consecutive attendance requirement or they have been manually removed.</p>';
            } else {
                const fragment = document.createDocumentFragment();
                recommendations.forEach(member => {
                    const el = document.createElement('div');
                    el.className = `p-4 bg-dark-bg rounded-2xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-hover-bg transition duration-150`;
                    el.innerHTML = `
                        <div class="mb-2 sm:mb-0">
                            <span class="text-lg font-bold text-spotify-green">${escapeHTML(member.name)}</span>
                            <span class="text-sm text-text-secondary ml-3">(${escapeHTML(member.purok)})</span>
                            <p class="text-xs text-text-secondary italic">Recent Streak: ${escapeHTML(member.streak.join(', '))}</p>
                        </div>
                        <div class="flex space-x-2">
                             <button onclick="window.viewMemberAttendance('${escapeHTML(member.id)}')" class="px-3.5 py-1.5 text-xs font-semibold rounded-xl transition duration-200 bg-blue-700 hover:bg-blue-600 text-white shadow-sm">
                                View Data
                            </button>
                            <button onclick="window.removeRecommendation('${escapeHTML(member.id)}')" class="px-3.5 py-1.5 text-xs font-semibold rounded-xl transition duration-200 bg-red-700 hover:bg-red-600 text-white shadow-sm">
                                Remove
                            </button>
                        </div>
                    `;
                    fragment.appendChild(el);
                });
                container.appendChild(fragment);
            }
        }
        
        /** Allows viewing the detailed Present attendance of a specific recommended member. */
        window.viewMemberAttendance = function(memberId) {
            const member = dataEntries.find(e => e.id === memberId);
            if (!member) {
                showNotification("Member not found.", true);
                return;
            }
            
            // 1. Get and sort week IDs by week number (Wxx-YYYY)
            const sortedWeekIds = Object.keys(attendanceRecords).sort((a, b) => {
                const [weekA, yearA] = a.substring(1).split('-').map(Number);
                const [weekB, yearB] = b.substring(1).split('-').map(Number);

                if (yearA !== yearB) return yearA - yearB;
                return weekA - weekB; 
            });

            let contentHTML = '';
            
            // Generate content list
            for (const weekId of sortedWeekIds) {
                const weekRecord = attendanceRecords[weekId].entries[member.id];
                
                if (weekRecord) {
                    const isPresent = weekRecord.Thursday === 'Present' || weekRecord.Sunday === 'Present';
                    
                    if (isPresent) {
                        contentHTML += `
                            <div class="flex justify-between items-center p-3 rounded-xl bg-hover-bg/80 shadow-sm">
                                <span class="font-bold text-lg text-spotify-green">${weekId}</span>
                                <div class="text-sm">
                                    <span class="${weekRecord.Thursday === 'Present' ? 'text-[#1DB954]' : 'text-red-500'} mr-3">Thu: ${weekRecord.Thursday}</span>
                                    <span class="${weekRecord.Sunday === 'Present' ? 'text-[#1DB954]' : 'text-red-500'}">Sun: ${weekRecord.Sunday}</span>
                                </div>
                            </div>
                        `;
                    }
                }
            }
            
            if (contentHTML === '') {
                contentHTML = '<p class="text-text-secondary text-center py-4">No Present attendance records found for this member.</p>';
            }

            // Update Modal Content
            DOM.viewModalTitle.textContent = `Attendance History: ${member.name} (${member.purok})`;
            DOM.viewModalContent.innerHTML = contentHTML;
            
            // Show the Modal
            DOM.attendanceViewModal.classList.remove('hidden');
        }

        /** Option 5: Enriched Member Profile & Attendance Statistics */
        let currentProfileMemberId = null;
        let currentProfileFilter = 'all';

        function renderProfileHistoryLog(memberId, filter = 'all') {
            if (!DOM.profileAttendanceHistory) return;
            const member = dataEntries.find(e => e.id === memberId);
            if (!member) return;

            const sortedWeekIds = Object.keys(attendanceRecords).sort((a, b) => {
                const [weekA, yearA] = a.substring(1).split('-').map(Number);
                const [weekB, yearB] = b.substring(1).split('-').map(Number);
                if (yearA !== yearB) return yearA - yearB;
                return weekA - weekB; 
            }).reverse();

            const filteredWeeks = [];
            for (const weekId of sortedWeekIds) {
                const weekRecord = attendanceRecords[weekId]?.entries?.[member.id];
                if (!weekRecord) continue;
                const thu = weekRecord.Thursday;
                const sun = weekRecord.Sunday;
                if (!thu && !sun) continue;

                if (filter === 'present') {
                    if (thu !== 'Present' && sun !== 'Present') continue;
                } else if (filter === 'absent') {
                    if (thu !== 'Absent' && sun !== 'Absent') continue;
                }

                filteredWeeks.push({ weekId, thu, sun });
            }

            if (filteredWeeks.length === 0) {
                DOM.profileAttendanceHistory.innerHTML = `
                    <div class="p-4 text-center text-text-secondary text-xs bg-dark-bg rounded-xl">
                        No attendance records found for "${escapeHTML(filter)}" filter.
                    </div>
                `;
                return;
            }

            DOM.profileAttendanceHistory.innerHTML = filteredWeeks.map(item => `
                <div class="flex justify-between items-center px-3 py-2 rounded-xl bg-dark-bg transition hover:bg-hover-bg">
                    <span class="font-bold text-xs text-text-light font-mono">${escapeHTML(item.weekId)}</span>
                    <div class="flex items-center gap-2 text-xs">
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${item.thu === 'Present' ? 'bg-[#1DB954]/20 text-[#1DB954]' : (item.thu === 'Absent' ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-500')}">
                            Thu: <strong class="font-bold">${item.thu ? (item.thu === 'Present' ? 'P' : 'A') : 'N/A'}</strong>
                        </span>
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${item.sun === 'Present' ? 'bg-[#1DB954]/20 text-[#1DB954]' : (item.sun === 'Absent' ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-500')}">
                            Sun: <strong class="font-bold">${item.sun ? (item.sun === 'Present' ? 'P' : 'A') : 'N/A'}</strong>
                        </span>
                    </div>
                </div>
            `).join('');
        }

        // Setup Profile Filter Tabs delegation
        DOM.profileFilterTabs?.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-filter]');
            if (!btn) return;
            const filter = btn.dataset.filter;
            currentProfileFilter = filter;

            DOM.profileFilterTabs.querySelectorAll('button[data-filter]').forEach(b => {
                if (b.dataset.filter === filter) {
                    b.className = 'px-2 py-0.5 rounded font-bold bg-spotify-green text-dark-bg cursor-pointer transition';
                } else {
                    b.className = 'px-2 py-0.5 rounded text-gray-400 hover:text-white cursor-pointer transition';
                }
            });

            if (currentProfileMemberId) {
                renderProfileHistoryLog(currentProfileMemberId, currentProfileFilter);
            }
        });

        // Setup Profile Edit Member shortcut button
        DOM.profileEditMemberBtn?.addEventListener('click', () => {
            if (currentProfileMemberId) {
                DOM.memberProfileModal.classList.add('hidden');
                window.editEntry(currentProfileMemberId);
            }
        });

        // Backdrop click to dismiss
        DOM.memberProfileModal?.addEventListener('click', (e) => {
            if (e.target === DOM.memberProfileModal) {
                DOM.memberProfileModal.classList.add('hidden');
            }
        });

        window.viewMemberProfile = function(memberId) {
            const member = dataEntries.find(e => e.id === memberId);
            if (!member || member.isArchived) {
                showNotification("Member profile not found or is archived.", true);
                return;
            }

            currentProfileMemberId = memberId;
            currentProfileFilter = 'all';

            // 1. Reset filter tabs UI
            if (DOM.profileFilterTabs) {
                DOM.profileFilterTabs.querySelectorAll('button[data-filter]').forEach(b => {
                    if (b.dataset.filter === 'all') {
                        b.className = 'px-2 py-0.5 rounded font-bold bg-spotify-green text-dark-bg cursor-pointer transition';
                    } else {
                        b.className = 'px-2 py-0.5 rounded text-gray-400 hover:text-white cursor-pointer transition';
                    }
                });
            }

            // 2. Member Basic Details & Badges
            const names = (member.name || '').trim().split(/\s+/);
            const initials = names.length > 1 
                ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
                : (names[0] ? names[0].slice(0, 2).toUpperCase() : 'M');
            
            if (DOM.profileAvatarInitials) DOM.profileAvatarInitials.textContent = initials;
            if (DOM.profileModalTitle) DOM.profileModalTitle.textContent = member.name;

            if (DOM.profileStatusBadge) {
                DOM.profileStatusBadge.textContent = member.status || 'MS';
                DOM.profileStatusBadge.className = member.status === 'MS'
                    ? 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300'
                    : 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300';
            }

            if (DOM.profileKapisananBadge) {
                DOM.profileKapisananBadge.textContent = member.kapisanan || 'N/A';
                const k = (member.kapisanan || '').toUpperCase();
                if (k === 'KADIWA') {
                    DOM.profileKapisananBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-500/20 text-yellow-300';
                } else if (k === 'BINHI') {
                    DOM.profileKapisananBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300';
                } else if (k === 'BUKLOD') {
                    DOM.profileKapisananBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/20 text-orange-300';
                } else {
                    DOM.profileKapisananBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-700 text-gray-300';
                }
            }

            if (DOM.profilePurokBadge) DOM.profilePurokBadge.textContent = member.purok || 'Unknown Purok';
            if (DOM.profileMemberId) DOM.profileMemberId.textContent = member.id ? member.id.slice(0, 8) + '...' : '--';
            if (DOM.profileDateAdded) DOM.profileDateAdded.textContent = formatDate(member.timestamp);

            // 3. Compute Attendance Statistics
            const sortedWeekIds = Object.keys(attendanceRecords).sort((a, b) => {
                const [weekA, yearA] = a.substring(1).split('-').map(Number);
                const [weekB, yearB] = b.substring(1).split('-').map(Number);
                if (yearA !== yearB) return yearA - yearB;
                return weekA - weekB; 
            });

            const sessionTimeline = [];
            let totalPresent = 0;
            let totalAbsent = 0;
            let thuPresent = 0;
            let thuSessions = 0;
            let sunPresent = 0;
            let sunSessions = 0;

            for (const weekId of sortedWeekIds) {
                const weekRecord = attendanceRecords[weekId]?.entries?.[member.id];
                if (!weekRecord) continue;

                if (weekRecord.Thursday) {
                    thuSessions++;
                    const isP = weekRecord.Thursday === 'Present';
                    if (isP) thuPresent++;
                    if (isP) totalPresent++; else totalAbsent++;
                    sessionTimeline.push({ weekId, day: 'Thu', isPresent: isP, label: `${weekId.split('-')[0]} Thu` });
                }
                if (weekRecord.Sunday) {
                    sunSessions++;
                    const isP = weekRecord.Sunday === 'Present';
                    if (isP) sunPresent++;
                    if (isP) totalPresent++; else totalAbsent++;
                    sessionTimeline.push({ weekId, day: 'Sun', isPresent: isP, label: `${weekId.split('-')[0]} Sun` });
                }
            }

            const totalSessions = totalPresent + totalAbsent;
            const rateNum = totalSessions > 0 ? (totalPresent / totalSessions) * 100 : null;

            if (DOM.profileTotalSessions) DOM.profileTotalSessions.textContent = totalSessions;
            if (DOM.profileTotalPresent) DOM.profileTotalPresent.textContent = totalPresent;
            if (DOM.profileTotalAbsent) DOM.profileTotalAbsent.textContent = totalAbsent;

            // Rate display, label, badge, and progress bar
            if (rateNum === null) {
                if (DOM.profileAttendanceRate) {
                    DOM.profileAttendanceRate.textContent = '--%';
                    DOM.profileAttendanceRate.className = 'text-3xl font-extrabold text-gray-400';
                }
                if (DOM.profileRateLabel) DOM.profileRateLabel.textContent = 'No Sessions Recorded';
                if (DOM.profileRateBadge) {
                    DOM.profileRateBadge.textContent = 'No Data';
                    DOM.profileRateBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-gray-700/50 text-gray-300';
                }
                if (DOM.profileProgressBar) {
                    DOM.profileProgressBar.style.width = '0%';
                    DOM.profileProgressBar.className = 'h-full bg-gray-600 rounded-full transition-all duration-500';
                }
            } else {
                const formattedRate = rateNum.toFixed(1) + '%';
                if (DOM.profileAttendanceRate) DOM.profileAttendanceRate.textContent = formattedRate;
                if (DOM.profileProgressBar) DOM.profileProgressBar.style.width = `${Math.min(100, Math.max(0, rateNum))}%`;

                if (rateNum >= 80) {
                    if (DOM.profileAttendanceRate) DOM.profileAttendanceRate.className = 'text-3xl font-extrabold text-spotify-green';
                    if (DOM.profileRateLabel) DOM.profileRateLabel.textContent = 'Consistent Attendee';
                    if (DOM.profileRateBadge) {
                        DOM.profileRateBadge.textContent = 'Active';
                        DOM.profileRateBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-spotify-green/20 text-spotify-green';
                    }
                    if (DOM.profileProgressBar) DOM.profileProgressBar.className = 'h-full bg-spotify-green rounded-full transition-all duration-500';
                } else if (rateNum >= 50) {
                    if (DOM.profileAttendanceRate) DOM.profileAttendanceRate.className = 'text-3xl font-extrabold text-yellow-400';
                    if (DOM.profileRateLabel) DOM.profileRateLabel.textContent = 'Needs Follow-up';
                    if (DOM.profileRateBadge) {
                        DOM.profileRateBadge.textContent = 'Moderate';
                        DOM.profileRateBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300';
                    }
                    if (DOM.profileProgressBar) DOM.profileProgressBar.className = 'h-full bg-yellow-500 rounded-full transition-all duration-500';
                } else {
                    if (DOM.profileAttendanceRate) DOM.profileAttendanceRate.className = 'text-3xl font-extrabold text-red-400';
                    if (DOM.profileRateLabel) DOM.profileRateLabel.textContent = 'At Risk / Inactive';
                    if (DOM.profileRateBadge) {
                        DOM.profileRateBadge.textContent = 'Critical';
                        DOM.profileRateBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400';
                    }
                    if (DOM.profileProgressBar) DOM.profileProgressBar.className = 'h-full bg-red-500 rounded-full transition-all duration-500';
                }
            }

            // Thursday vs Sunday breakdown
            const thuRateStr = thuSessions > 0 ? ((thuPresent / thuSessions) * 100).toFixed(0) + '%' : 'N/A';
            const sunRateStr = sunSessions > 0 ? ((sunPresent / sunSessions) * 100).toFixed(0) + '%' : 'N/A';
            if (DOM.profileThuAttendance) {
                DOM.profileThuAttendance.innerHTML = `<span class="font-semibold text-text-light">Thursday:</span> ${thuPresent}/${thuSessions} (${thuRateStr})`;
            }
            if (DOM.profileSunAttendance) {
                DOM.profileSunAttendance.innerHTML = `<span class="font-semibold text-text-light">Sunday:</span> ${sunPresent}/${sunSessions} (${sunRateStr})`;
            }

            // 4. Session Timeline Strip (Last 12 sessions)
            if (DOM.profileSessionStrip) {
                const recent = sessionTimeline.slice(-12);
                if (recent.length === 0) {
                    DOM.profileSessionStrip.innerHTML = '<span class="text-xs text-text-secondary py-1 w-full text-center">No sessions recorded yet</span>';
                } else {
                    DOM.profileSessionStrip.innerHTML = recent.map((s, idx) => {
                        const isLast = idx === recent.length - 1;
                        return `
                            <div class="flex-shrink-0 flex flex-col items-center px-2.5 py-1 rounded-lg ${s.isPresent ? 'bg-spotify-green/20 text-spotify-green' : 'bg-red-500/20 text-red-400'} ${isLast ? 'ring-2 ring-white/40' : ''}" title="${escapeHTML(s.weekId)} (${s.day}): ${s.isPresent ? 'Present' : 'Absent'}">
                                <span class="text-[9px] font-mono text-text-secondary tracking-tighter">${escapeHTML(s.label)}</span>
                                <span class="text-xs font-black ${s.isPresent ? 'text-spotify-green' : 'text-red-400'}">${s.isPresent ? 'P' : 'A'}</span>
                            </div>
                        `;
                    }).join('');
                }
            }

            // 5. Render History Log
            renderProfileHistoryLog(memberId, 'all');

            // 6. Show the Modal
            DOM.memberProfileModal.classList.remove('hidden');
        };


        /** Manually removes a member from the suggestion list until their next input/edit. */
        window.removeRecommendation = function(memberId) {
             showConfirmationModal(
                "Remove Suggestion",
                "Are you sure you want to remove this member from the suggestion list? They will only reappear if they meet the criteria again.",
                (confirmed) => {
                    if (confirmed) {
                        const entryIndex = dataEntries.findIndex(entry => entry.id === memberId);
                        
                        if (entryIndex !== -1) {
                            dataEntries[entryIndex].isRecommended = false; // Flag to exclude from filter
                            saveEntries();
                            renderMsRecommendation();
                            showNotification("Member removed from suggestion list.");
                        } else {
                            showNotification("Error: Member not found.", true);
                        }
                    }
                }
            );
        }

        // --- Chart.js Integration & Advanced Filtering (Updated for Dynamic Colors) ---
        
        function getMonthlyEntryCounts() {
            const activeEntries = getActiveEntries();
            const monthlyCounts = {};
            const labels = [];
            
            const now = new Date();
            for (let i = 11; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthYear = date.toLocaleString('en-US', { month: 'short', year: '2-digit' });
                labels.push(monthYear);
                monthlyCounts[monthYear] = 0;
            }

            activeEntries.forEach(entry => {
                const entryDate = new Date(entry.timestamp);
                const monthYear = entryDate.toLocaleString('en-US', { month: 'short', year: '2-digit' });
                
                if (monthlyCounts.hasOwnProperty(monthYear)) {
                    monthlyCounts[monthYear]++;
                }
            });

            return {
                labels: labels,
                data: labels.map(label => monthlyCounts[label])
            };
        }

        function getChartData() {
            const stats = updateDashboardStats(); 
            const allSegments = [...new Set(appSettings.purokGroups.map(p => p.split('-')[0]))].sort((a,b) => Number(a) - Number(b));
            return {
                msCounts: allSegments.map(s => (stats.MS.bySegment && stats.MS.bySegment[s]) || 0),
                uwpCounts: allSegments.map(s => (stats.UWP.bySegment && stats.UWP.bySegment[s]) || 0),
                purokLabels: allSegments.map(s => `Purok ${s}`),
                timeSeries: getMonthlyEntryCounts()
            };
        }

        /** Feature 10: Renders the Kapisanan Breakdown chart in the drill-down modal */
        let drillDownChart = null;
        function renderDrillDownChart(purokSegment) {
            const activeEntries = getActiveEntries();
            const filteredEntries = activeEntries.filter(e => e.purok.startsWith(purokSegment + '-'));
            
            const breakdown = filteredEntries.reduce((acc, entry) => {
                const k = entry.kapisanan || 'N/A';
                if (['BINHI', 'KADIWA', 'BUKLOD'].includes(k)) {
                    acc[k] = (acc[k] || 0) + 1;
                }
                return acc;
            }, {});

            const labels = ['BINHI', 'KADIWA', 'BUKLOD'];
            const data = labels.map(k => breakdown[k] || 0);

            // Destroy existing chart if it exists
            if (drillDownChart) {
                drillDownChart.destroy();
            }

            const isLightMode = document.body.classList.contains('light-mode');
            const colors = {
                pie: appSettings.chartColors.pie, 
                text: isLightMode ? '#121212' : 'white',
            };

            // Render new chart
            drillDownChart = new Chart(DOM.drilldownChartCtx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: colors.pie.slice(0, labels.length), 
                        borderColor: isLightMode ? 'white' : 'var(--secondary-bg)',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { labels: { color: colors.text } },
                        title: {
                            display: true,
                            text: `Kapisanan Breakdown for Purok ${purokSegment}`,
                            color: colors.text,
                            font: { size: 16 }
                        }
                    },
                }
            });
            
            DOM.drilldownModalTitle.textContent = `Kapisanan Breakdown: Purok ${purokSegment} Members (${filteredEntries.length})`;
            DOM.drilldownChartModal.classList.remove('hidden');
        }

        /** Feature 10: Handles chart clicks to either filter or drill down */
        function chartClickHandler(event, elements, chart) {
            if (!elements.length) return;

            const element = elements[0];
            const datasetIndex = element.datasetIndex;
            const index = element.index;
            
            let targetCategory = '';
            const labels = chart.data.labels;
            let purokSegment = null;

            if (chart.canvas.id === 'category-bar-chart') {
                targetCategory = (datasetIndex === 0) ? 'MS' : 'UWP';
                const labelText = labels[index] || '';
                purokSegment = labelText.includes(' ') ? labelText.split(' ')[1] : labelText;
            } else if (chart.canvas.dataset.chartType === 'pie') {
                targetCategory = chart.canvas.dataset.category;
                const labelText = labels[index] || '';
                purokSegment = labelText.includes(' ') ? labelText.split(' ')[1] : (index + 1);
            } else {
                return;
            }
            
            // On click, initiate drill down (Feature 10)
            if (purokSegment) {
                renderDrillDownChart(purokSegment);
            }
        }

        function renderCharts() {
            const { msCounts, uwpCounts, purokLabels, timeSeries } = getChartData();
            
            const isLightMode = document.body.classList.contains('light-mode');
            const colors = {
                ms: appSettings.chartColors.ms, 
                uwp: appSettings.chartColors.uwp,
                accent: appSettings.chartColors.accent,
                line: appSettings.chartColors.line, // Use new line color
                pie: appSettings.chartColors.pie, 
                bg: isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                text: isLightMode ? '#121212' : 'white',
            }

            const piePalette = colors.pie && colors.pie.length ? colors.pie : defaultColors.pie;
            const segmentPieColors = purokLabels.map((_, i) => piePalette[i % piePalette.length]);

            Object.values(charts).forEach(chart => chart.destroy());
            charts = {};

            const baseChartOptions = {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { labels: { color: colors.text } } },
                scales: {
                    x: { ticks: { color: colors.text }, grid: { color: colors.bg } },
                    y: { ticks: { color: colors.text }, grid: { color: colors.bg }, beginAtZero: true }
                },
                onClick: chartClickHandler // Feature 10
            };
            
            if (DOM.categoryBarChartCtx) {
                charts.bar = new Chart(DOM.categoryBarChartCtx, {
                    type: 'bar',
                    data: {
                        labels: purokLabels,
                        datasets: [
                            { label: 'MS Category', data: msCounts, backgroundColor: colors.ms, borderRadius: 4 },
                            { label: 'UWP Category', data: uwpCounts, backgroundColor: colors.uwp, borderRadius: 4 }
                        ]
                    },
                    options: baseChartOptions
                });
            }

            if (DOM.msPieChartCtx) {
                charts.msPie = new Chart(DOM.msPieChartCtx, {
                    type: 'pie',
                    data: {
                        labels: purokLabels,
                        datasets: [{
                            data: msCounts,
                            backgroundColor: segmentPieColors, 
                            borderColor: isLightMode ? 'white' : 'var(--secondary-bg)',
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: { legend: { labels: { color: colors.text } } },
                        onClick: chartClickHandler // Feature 10
                    }
                });
            }

            if (DOM.uwpPieChartCtx) {
                charts.uwpPie = new Chart(DOM.uwpPieChartCtx, {
                    type: 'pie',
                    data: {
                        labels: purokLabels,
                        datasets: [{
                            data: uwpCounts,
                            backgroundColor: segmentPieColors, 
                            borderColor: isLightMode ? 'white' : 'var(--secondary-bg)',
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: { legend: { labels: { color: colors.text } } },
                        onClick: chartClickHandler // Feature 10
                    }
                });
            }

            if (DOM.timeSeriesChartCtx) {
                charts.timeSeries = new Chart(DOM.timeSeriesChartCtx, {
                    type: 'line',
                    data: {
                        labels: timeSeries.labels,
                        datasets: [{
                            label: 'New Entries Added',
                            data: timeSeries.data,
                            borderColor: colors.line, // Use new line color
                            backgroundColor: colors.line + '33', 
                            fill: true,
                            tension: 0.3,
                            borderWidth: 3,
                            pointBackgroundColor: colors.text
                        }]
                    },
                    options: {
                        ...baseChartOptions,
                        onClick: null, 
                        scales: {
                            ...baseChartOptions.scales,
                            y: { ...baseChartOptions.scales.y, precision: 0 } 
                        },
                        tooltips: {
                            mode: 'index',
                            intersect: false,
                        }
                    }
                });
            }
        }
        
        // Polyfill for Date.prototype.getWeek
        Date.prototype.getWeek = function() {
            const date = new Date(this.getTime());
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
            const week1 = new Date(date.getFullYear(), 0, 4);
            return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
        };


        // --- Feature: PWA & Offline Support ---
        let deferredInstallPrompt = null;

        function initPWA() {
            const installBtn = document.getElementById('pwa-install-btn');
            const sidebarInstallBtn = document.getElementById('pwa-install-sidebar-btn');
            const statusText = document.getElementById('pwa-status-text');
            const statusSub = document.getElementById('pwa-status-sub');
            const statusBadge = document.getElementById('pwa-status-badge');
            const installedMsg = document.getElementById('pwa-installed-msg');

            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

            function updatePWAStatus(installed, offlineReady) {
                if (!statusText || !statusBadge) return;
                if (installed) {
                    statusText.textContent = "Tracker App Installed";
                    statusSub.textContent = "Running in Standalone App Mode";
                    statusBadge.textContent = "Installed";
                    statusBadge.className = "px-3 py-1 text-xs font-bold rounded-full bg-green-500/20 text-green-400";
                    if (installBtn) installBtn.classList.add('hidden');
                    if (sidebarInstallBtn) sidebarInstallBtn.classList.add('hidden');
                    if (installedMsg) installedMsg.classList.remove('hidden');
                } else if (offlineReady) {
                    statusText.textContent = "Offline Ready & Cached";
                    statusSub.textContent = "Service Worker Active";
                    statusBadge.textContent = "Ready";
                    statusBadge.className = "px-3 py-1 text-xs font-bold rounded-full bg-green-500/20 text-green-400";
                } else {
                    statusText.textContent = "Standard Web Mode";
                    statusSub.textContent = "Caching local resources...";
                    statusBadge.textContent = "Caching";
                    statusBadge.className = "px-3 py-1 text-xs font-bold rounded-full bg-blue-500/20 text-blue-400";
                }
            }

            if (isStandalone) {
                updatePWAStatus(true, true);
            }

            // Register Service Worker with robust offline lifecycle tracking
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('./sw.js')
                    .then((reg) => {
                        console.log('[PWA] Service Worker registered with scope:', reg.scope);

                        // Listen for updates or newly installed workers
                        reg.addEventListener('updatefound', () => {
                            const newWorker = reg.installing;
                            if (newWorker) {
                                newWorker.addEventListener('statechange', () => {
                                    if (newWorker.state === 'installed') {
                                        if (navigator.serviceWorker.controller) {
                                            console.log('[PWA] New version pre-cached and ready.');
                                        } else {
                                            console.log('[PWA] Pre-caching complete! App is 100% offline ready.');
                                            updatePWAStatus(isStandalone, true);
                                        }
                                    }
                                });
                            }
                        });

                        navigator.serviceWorker.ready.then(() => {
                            console.log('[PWA] Service worker active and controlling pages.');
                            updatePWAStatus(isStandalone, true);
                        });
                    })
                    .catch((err) => {
                        console.warn('[PWA] Service Worker registration failed:', err);
                        if (statusBadge && !isStandalone) {
                            statusText.textContent = "Offline Storage Mode";
                            statusSub.textContent = "Local data saved in browser storage";
                            statusBadge.textContent = "Local Only";
                            statusBadge.className = "px-3 py-1 text-xs font-bold rounded-full bg-gray-500/20 text-gray-400";
                        }
                    });

                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    console.log('[PWA] Active service worker controller updated.');
                    updatePWAStatus(isStandalone, true);
                });
            }

            // Capture beforeinstallprompt event
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredInstallPrompt = e;
                if (!isStandalone) {
                    if (installBtn) installBtn.classList.remove('hidden');
                    if (sidebarInstallBtn) sidebarInstallBtn.classList.remove('hidden');
                    if (statusText) {
                        statusText.textContent = "Ready to Install";
                        statusSub.textContent = "Click below to install on desktop/mobile";
                    }
                }
            });

            async function triggerInstall() {
                if (!deferredInstallPrompt) {
                    showNotification('To install, use browser menu: "Install Tracker" or "Add to Home screen"');
                    return;
                }
                deferredInstallPrompt.prompt();
                const { outcome } = await deferredInstallPrompt.userChoice;
                if (outcome === 'accepted') {
                    showNotification('Tracker installed successfully!');
                    updatePWAStatus(true, true);
                }
                deferredInstallPrompt = null;
            }

            if (installBtn) installBtn.addEventListener('click', triggerInstall);
            if (sidebarInstallBtn) sidebarInstallBtn.addEventListener('click', triggerInstall);

            window.addEventListener('appinstalled', () => {
                deferredInstallPrompt = null;
                updatePWAStatus(true, true);
                showNotification('Tracker installed as an offline application!');
            });

            // Online / Offline Network Status Listeners
            window.addEventListener('online', () => {
                showNotification('Connection restored: Online');
            });

            window.addEventListener('offline', () => {
                showNotification('Operating in full Offline Mode');
            });
        }


        // --- Initialization ---

        document.addEventListener("DOMContentLoaded", () => {
            // Apply theme/colors and render purok select before showing any section
            saveSettings(); 
            applyTheme(appSettings.theme);
            renderInputPurokSelect(); 

            // Initial ID setup (for pre-existing data)
            saveEntries(); 
            updateDashboardStats();
            if (typeof populateAttendanceYearSelect === 'function') {
                populateAttendanceYearSelect();
            }
            
            // Start at the new 'front-page'
            showSection('front-page');

            // Initialize PWA and offline features
            initPWA();

            // Initialize Option 3 backup health & reminders
            updateBackupHealthUI();
        });

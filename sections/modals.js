// sections/modals.js - Application Modals & Dialogs
window.AppSections = window.AppSections || {};
window.AppSections['modals'] = `
<!-- MODAL 1 (Option 5: Enriched Member Profile & Attendance Statistics) -->
        <div id="member-profile-modal" class="hidden fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-3 sm:p-4 no-print backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
            <div class="bg-card-bg p-4 sm:p-6 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col" style="background-color: var(--secondary-bg);">
                <!-- Modal Header -->
                <div class="flex items-center justify-between pb-3 mb-4">
                    <div class="flex items-center gap-2.5 min-w-0">
                        <div class="w-10 h-10 rounded-full bg-spotify-green/20 text-spotify-green flex items-center justify-center font-bold text-lg flex-shrink-0" id="profile-avatar-initials">
                            M
                        </div>
                        <div class="min-w-0">
                            <h3 class="text-lg sm:text-xl font-bold text-white truncate" id="profile-modal-title">Member Profile</h3>
                            <div class="flex items-center gap-1.5 text-xs text-text-secondary mt-0.5">
                                <span id="profile-status-badge" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300">MS</span>
                                <span id="profile-kapisanan-badge" class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-700 text-gray-300">BINHI</span>
                                <span id="profile-purok-badge" class="text-text-secondary font-mono text-[11px]">Purok 1-A</span>
                            </div>
                        </div>
                    </div>
                    <button id="profile-modal-close-x" class="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-hover-bg transition cursor-pointer" aria-label="Close modal">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>

                <!-- Scrollable Body -->
                <div class="overflow-y-auto space-y-4 pr-1 flex-1">
                    <!-- Key Attendance KPI Card -->
                    <div id="profile-kpi-card" class="p-4 rounded-2xl bg-dark-bg shadow-sm">
                        <div class="flex items-center justify-between mb-2">
                            <div>
                                <span class="text-xs uppercase font-bold tracking-wider text-text-secondary block">Attendance Performance</span>
                                <div class="flex items-baseline gap-2 mt-0.5">
                                    <span id="profile-attendance-rate" class="text-3xl font-extrabold text-spotify-green">--%</span>
                                    <span id="profile-rate-label" class="text-xs font-semibold text-text-secondary">Consistent Attendee</span>
                                </div>
                            </div>
                            <div id="profile-rate-badge" class="px-3 py-1 rounded-full text-xs font-bold bg-spotify-green/20 text-spotify-green">
                                Active
                            </div>
                        </div>
                        
                        <!-- Progress bar -->
                        <div class="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden mt-1">
                            <div id="profile-progress-bar" class="h-full bg-spotify-green rounded-full transition-all duration-500" style="width: 0%;"></div>
                        </div>

                        <!-- 3 Mini Stats Grid -->
                        <div class="grid grid-cols-3 gap-2 mt-4 text-center">
                            <div class="p-2.5 rounded-xl bg-card-bg shadow-sm">
                                <span class="text-[10px] uppercase font-bold text-text-secondary block">Sessions</span>
                                <span id="profile-total-sessions" class="text-base font-extrabold text-white">0</span>
                            </div>
                            <div class="p-2.5 rounded-xl bg-card-bg shadow-sm">
                                <span class="text-[10px] uppercase font-bold text-spotify-green block">Present (P)</span>
                                <span id="profile-total-present" class="text-base font-extrabold text-spotify-green">0</span>
                            </div>
                            <div class="p-2.5 rounded-xl bg-card-bg shadow-sm">
                                <span class="text-[10px] uppercase font-bold text-red-400 block">Absent (A)</span>
                                <span id="profile-total-absent" class="text-base font-extrabold text-red-400">0</span>
                            </div>
                        </div>

                        <!-- Thursday vs Sunday Ratio -->
                        <div class="flex items-center justify-between text-[11px] text-text-secondary mt-3 pt-2">
                            <span id="profile-thu-attendance">Thursday: 0 attended</span>
                            <span id="profile-sun-attendance">Sunday: 0 attended</span>
                        </div>
                    </div>

                    <!-- Member Registration Info Strip -->
                    <div class="p-2.5 rounded-xl bg-dark-bg flex items-center justify-between text-xs text-text-secondary">
                        <span>Member ID: <span id="profile-member-id" class="font-mono text-gray-400 text-[10px]">--</span></span>
                        <span>Added: <span id="profile-date-added" class="text-text-light font-medium">--</span></span>
                    </div>

                    <!-- Recent Session Consistency Heatmap (Visual Timeline Strip) -->
                    <div>
                        <div class="flex items-center justify-between mb-1.5 px-0.5">
                            <span class="text-xs font-bold text-text-light">Recent Session Timeline</span>
                            <span class="text-[10px] text-text-secondary">Last 12 sessions</span>
                        </div>
                        <div id="profile-session-strip" class="flex items-center gap-1.5 overflow-x-auto p-2 bg-dark-bg rounded-xl text-center min-h-[46px]">
                            <!-- Injected by JS -->
                        </div>
                    </div>

                    <!-- Attendance Log with Filter Tabs -->
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-xs font-bold text-text-light">Session History Log</span>
                            <!-- Filter Tabs -->
                            <div class="inline-flex rounded-xl bg-dark-bg p-0.5 text-[11px]" id="profile-filter-tabs">
                                <button type="button" data-filter="all" class="px-2.5 py-0.5 rounded-lg font-bold bg-spotify-green text-dark-bg cursor-pointer transition">All</button>
                                <button type="button" data-filter="present" class="px-2.5 py-0.5 rounded-lg text-gray-400 hover:text-white cursor-pointer transition">Present</button>
                                <button type="button" data-filter="absent" class="px-2.5 py-0.5 rounded-lg text-gray-400 hover:text-white cursor-pointer transition">Absent</button>
                            </div>
                        </div>

                        <div id="profile-attendance-history" class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            <p class="text-text-secondary text-center py-4 text-xs">Loading attendance data...</p>
                        </div>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="flex items-center justify-between pt-3.5 mt-3">
                    <button id="profile-edit-member-btn" type="button" class="px-4 py-2 text-xs font-bold rounded-lg transition duration-200 bg-spotify-green hover:bg-green-600 text-dark-bg flex items-center gap-1.5 shadow-md cursor-pointer">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        Edit Member
                    </button>
                    <button id="profile-modal-close-btn" type="button" class="px-4 py-2 text-xs font-semibold rounded-lg transition duration-200 bg-gray-700 hover:bg-gray-600 text-white cursor-pointer">
                        Close
                    </button>
                </div>
            </div>
        </div>

        <!-- MODAL 2 (Feature 10: Chart Drill-Down) -->
        <div id="drilldown-chart-modal" class="hidden fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 no-print">
            <div class="bg-card-bg p-6 rounded-2xl shadow-2xl w-full max-w-lg">
                <h3 class="text-2xl font-bold text-blue-400 mb-4" id="drilldown-modal-title">Kapisanan Breakdown: [Purok/Segment]</h3>
                <div class="h-80 flex items-center justify-center">
                    <canvas id="drilldown-kapisanan-chart"></canvas>
                </div>
                <div class="flex justify-end space-x-3 mt-6">
                    <button id="drilldown-modal-close-btn" class="px-4 py-2 text-sm font-semibold rounded-lg transition duration-200 bg-gray-600 hover:bg-gray-500 text-white cursor-pointer">
                        Close
                    </button>
                </div>
            </div>
        </div>
        
        <!-- EXISTING MODAL (Attendance View) -->
        <div id="attendance-view-modal" class="hidden fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 no-print">
            <div class="bg-card-bg p-6 rounded-2xl shadow-2xl w-full max-w-lg">
                <h3 class="text-2xl font-bold text-spotify-green mb-4" id="view-modal-title">Attendance History: [Member Name]</h3>
                <div id="view-modal-content" class="h-80 overflow-y-auto space-y-2 text-text-light p-2 bg-dark-bg rounded-xl">
                    <!-- Detailed attendance list will be here -->
                </div>
                <div class="flex justify-end space-x-3 mt-6">
                    <button id="view-modal-close-btn" class="px-4 py-2 text-sm font-semibold rounded-lg transition duration-200 bg-gray-600 hover:bg-gray-500 text-white cursor-pointer">
                        Close
                    </button>
                </div>
            </div>
        </div>

        <!-- NEW MODAL: Non-destructive Edit Member Modal -->
        <div id="edit-member-modal" class="hidden fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 no-print" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
            <div class="bg-card-bg p-6 rounded-2xl shadow-2xl w-full max-w-lg">
                <h3 class="text-2xl font-bold text-spotify-green mb-4" id="edit-modal-title">Edit Member Profile</h3>
                <input type="hidden" id="edit-member-id">
                <div class="space-y-4">
                    <div>
                        <label for="edit-member-name" class="block text-sm font-medium text-text-secondary mb-1">Full Name (Required)</label>
                        <input type="text" id="edit-member-name" required class="w-full p-3 bg-dark-bg border-0 rounded-xl focus:ring-2 focus:ring-spotify-green text-text-light">
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label for="edit-member-status" class="block text-sm font-medium text-text-secondary mb-1">Status</label>
                            <select id="edit-member-status" class="w-full p-3 bg-dark-bg border-0 rounded-xl focus:ring-2 focus:ring-spotify-green text-text-light">
                                <option value="MS">MS</option>
                                <option value="UWP">UWP</option>
                            </select>
                        </div>
                        <div>
                            <label for="edit-member-kapisanan" class="block text-sm font-medium text-text-secondary mb-1">Kapisanan</label>
                            <select id="edit-member-kapisanan" class="w-full p-3 bg-dark-bg border-0 rounded-xl focus:ring-2 focus:ring-spotify-green text-text-light">
                                <option value="BINHI">BINHI</option>
                                <option value="KADIWA">KADIWA</option>
                                <option value="BUKLOD">BUKLOD</option>
                            </select>
                        </div>
                        <div>
                            <label for="edit-member-purok" class="block text-sm font-medium text-text-secondary mb-1">Purok</label>
                            <select id="edit-member-purok" class="w-full p-3 bg-dark-bg border-0 rounded-xl focus:ring-2 focus:ring-spotify-green text-text-light">
                            </select>
                        </div>
                    </div>
                </div>
                <div class="flex justify-end space-x-3 mt-6">
                    <button id="edit-member-cancel-btn" type="button" class="px-4 py-2 text-sm font-semibold rounded-lg transition duration-200 bg-gray-600 hover:bg-gray-500 text-white cursor-pointer">
                        Cancel
                    </button>
                    <button id="edit-member-save-btn" type="button" class="px-4 py-2 text-sm font-semibold rounded-lg transition duration-200 bg-spotify-green hover:bg-green-600 text-dark-bg font-bold cursor-pointer">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>

        <!-- NEW MODAL: Restore Backup Confirmation & Preview Modal (Option 3) -->
        <div id="restore-backup-modal" class="hidden fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 no-print" role="dialog" aria-modal="true" aria-labelledby="restore-modal-title">
            <div class="bg-card-bg p-6 rounded-2xl shadow-2xl w-full max-w-lg">
                <div class="flex items-center gap-3 mb-4">
                    <div class="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    </div>
                    <div>
                        <h3 class="text-2xl font-bold text-white" id="restore-modal-title">Restore System Backup</h3>
                        <p class="text-xs text-text-secondary">Review the contents before applying to your local database.</p>
                    </div>
                </div>

                <!-- Backup Summary Card -->
                <div class="bg-dark-bg p-4 rounded-xl space-y-3 mb-6">
                    <div class="flex justify-between items-center text-sm pb-2">
                        <span class="text-text-secondary">Backup Created:</span>
                        <span id="restore-backup-date" class="font-semibold text-text-light">--</span>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-sm">
                        <div class="p-2.5 bg-card-bg rounded-xl shadow-sm">
                            <span class="text-xs text-text-secondary block">Members</span>
                            <span id="restore-members-count" class="text-base font-bold text-spotify-green">0</span>
                        </div>
                        <div class="p-2.5 bg-card-bg rounded-xl shadow-sm">
                            <span class="text-xs text-text-secondary block">Attendance</span>
                            <span id="restore-weeks-count" class="text-base font-bold text-blue-400">0</span>
                        </div>
                        <div class="p-2.5 bg-card-bg rounded-xl shadow-sm">
                            <span class="text-xs text-text-secondary block">Events</span>
                            <span id="restore-events-count" class="text-base font-bold text-yellow-400">0</span>
                        </div>
                        <div class="p-2.5 bg-card-bg rounded-xl shadow-sm">
                            <span class="text-xs text-text-secondary block">Notes</span>
                            <span id="restore-notes-count" class="text-base font-bold text-purple-400">0</span>
                        </div>
                    </div>
                    <div class="text-xs text-green-400 pt-1 flex items-center gap-1.5">
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
                        <span>A safety restore-point will be saved automatically before applying.</span>
                    </div>
                </div>

                <!-- Action options: Overwrite vs Merge -->
                <div class="space-y-3 mb-6">
                    <label class="flex items-start gap-3 p-3 rounded-xl bg-dark-bg cursor-pointer hover:bg-hover-bg transition shadow-sm">
                        <input type="radio" name="restore-mode" value="replace" checked class="mt-1 text-spotify-green focus:ring-spotify-green">
                        <div>
                            <span class="font-semibold text-text-light text-sm block">Replace Everything (Full Database Restore)</span>
                            <span class="text-xs text-text-secondary block">Replaces all current records with the exact backup state.</span>
                        </div>
                    </label>
                    <label class="flex items-start gap-3 p-3 rounded-xl bg-dark-bg cursor-pointer hover:bg-hover-bg transition shadow-sm">
                        <input type="radio" name="restore-mode" value="merge" class="mt-1 text-spotify-green focus:ring-spotify-green">
                        <div>
                            <span class="font-semibold text-text-light text-sm block">Merge with Current Data</span>
                            <span class="text-xs text-text-secondary block">Preserves current records and adds missing members, events, and attendance records.</span>
                        </div>
                    </label>
                </div>

                <!-- Modal Action Buttons -->
                <div class="flex justify-end space-x-3">
                    <button id="restore-cancel-btn" type="button" class="px-4 py-2 text-sm font-semibold rounded-lg transition duration-200 bg-gray-600 hover:bg-gray-500 text-white cursor-pointer">
                        Cancel
                    </button>
                    <button id="restore-confirm-btn" type="button" class="px-5 py-2 text-sm font-bold rounded-lg transition duration-200 bg-blue-600 hover:bg-blue-500 text-white cursor-pointer">
                        Confirm & Restore
                    </button>
                </div>
            </div>
        </div>
`;

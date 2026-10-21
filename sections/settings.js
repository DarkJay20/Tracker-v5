// sections/settings.js - settings Section Template
window.AppSections = window.AppSections || {};
window.AppSections['settings'] = `
<section id="settings" class="section hidden">
            <div class="max-w-5xl mx-auto pb-10">
                <!-- Section Header -->
                <div class="mb-5 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 class="text-2xl sm:text-3xl font-extrabold text-spotify-green flex items-center justify-center sm:justify-start gap-2.5">
                            <svg class="w-7 h-7 shrink-0 text-spotify-green" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                            <span>System Settings</span>
                        </h1>
                        <p class="text-xs sm:text-sm text-text-secondary mt-1">Configure appearance, manage purok groups, backup database, and monitor offline status</p>
                    </div>
                </div>

                <!-- Segregated Category Switcher / Filter Pills -->
                <div class="flex items-center gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
                    <button type="button" onclick="window.filterSettingsTab('all')" data-tab="all" class="settings-tab-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-spotify-green text-dark-bg transition whitespace-nowrap shadow-sm">
                        All Categories
                    </button>
                    <button type="button" onclick="window.filterSettingsTab('theme')" data-tab="theme" class="settings-tab-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-card-bg text-text-secondary hover:text-white transition whitespace-nowrap shadow-sm">
                        Appearance & Colors
                    </button>
                    <button type="button" onclick="window.filterSettingsTab('purok')" data-tab="purok" class="settings-tab-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-card-bg text-text-secondary hover:text-white transition whitespace-nowrap shadow-sm">
                        Purok Groups
                    </button>
                    <button type="button" onclick="window.filterSettingsTab('backup')" data-tab="backup" class="settings-tab-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-card-bg text-text-secondary hover:text-white transition whitespace-nowrap shadow-sm">
                        Database & Backup
                    </button>
                    <button type="button" onclick="window.filterSettingsTab('pwa')" data-tab="pwa" class="settings-tab-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-card-bg text-text-secondary hover:text-white transition whitespace-nowrap shadow-sm">
                        PWA & Offline
                    </button>
                </div>

                <!-- 2-Column Responsive Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                    
                    <!-- 1. THEME & APPEARANCE -->
                    <div id="settings-card-theme" class="bg-card-bg p-4 sm:p-5 rounded-2xl shadow-xl space-y-4">
                        <div class="flex items-center justify-between pb-2">
                            <div class="flex items-center gap-2.5">
                                <div class="w-8 h-8 rounded-xl bg-spotify-green/15 text-spotify-green flex items-center justify-center shrink-0">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                                </div>
                                <div>
                                    <h2 class="text-base font-bold text-text-light">Theme & Appearance</h2>
                                    <p class="text-[11px] text-text-secondary">Display mode & dynamic palette</p>
                                </div>
                            </div>
                        </div>

                        <!-- Dark/Light Mode Toggle Tile -->
                        <div class="flex items-center justify-between p-3 bg-dark-bg rounded-xl shadow-inner">
                            <div class="flex items-center gap-3">
                                <div class="w-7 h-7 rounded-lg bg-hover-bg flex items-center justify-center text-text-secondary">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                                </div>
                                <div>
                                    <span class="text-xs font-semibold text-text-light block">Display Mode</span>
                                    <span class="text-[10px] text-text-secondary block">Dark Mode / Light Mode</span>
                                </div>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" value="" id="theme-toggle" class="sr-only peer">
                                <div class="w-10 h-5 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-spotify-green/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-spotify-green"></div>
                            </label>
                        </div>

                        <!-- Theme & UI Colors (Accent, Title, Buttons) -->
                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">Interface & Theme Colors</span>
                                <button type="button" id="reset-accent-btn" class="text-[10px] text-spotify-green hover:underline font-semibold cursor-pointer">
                                    Reset UI Colors
                                </button>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <!-- Accent Color -->
                                <div class="flex items-center justify-between p-2.5 bg-dark-bg rounded-xl shadow-inner">
                                    <label for="color-accent" class="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1">
                                        <div id="swatch-accent" class="w-6 h-6 rounded-lg shrink-0 shadow-sm border border-white/10" style="background-color: var(--accent, #1DB954);"></div>
                                        <div class="truncate">
                                            <span class="text-xs font-semibold text-text-light block truncate">Accent Color</span>
                                            <span class="text-[10px] text-text-secondary block">UI Highlights</span>
                                        </div>
                                    </label>
                                    <div class="relative shrink-0 ml-2">
                                        <button type="button" id="btn-color-accent" class="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition cursor-pointer">Change</button>
                                        <input type="color" id="color-accent" class="w-full h-full absolute top-0 left-0 opacity-0 cursor-pointer">
                                    </div>
                                </div>

                                <!-- Text Title Color -->
                                <div class="flex items-center justify-between p-2.5 bg-dark-bg rounded-xl shadow-inner">
                                    <label for="color-title" class="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1">
                                        <div id="swatch-title" class="w-6 h-6 rounded-lg shrink-0 shadow-sm border border-white/10" style="background-color: var(--title-color, #1DB954);"></div>
                                        <div class="truncate">
                                            <span class="text-xs font-semibold text-text-light block truncate">Title Color</span>
                                            <span class="text-[10px] text-text-secondary block">Page Headings</span>
                                        </div>
                                    </label>
                                    <div class="relative shrink-0 ml-2">
                                        <button type="button" id="btn-color-title" class="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition cursor-pointer">Change</button>
                                        <input type="color" id="color-title" class="w-full h-full absolute top-0 left-0 opacity-0 cursor-pointer">
                                    </div>
                                </div>

                                <!-- Buttons Color -->
                                <div class="flex items-center justify-between p-2.5 bg-dark-bg rounded-xl shadow-inner">
                                    <label for="color-button" class="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1">
                                        <div id="swatch-button" class="w-6 h-6 rounded-lg shrink-0 shadow-sm border border-white/10" style="background-color: var(--button-color, #1DB954);"></div>
                                        <div class="truncate">
                                            <span class="text-xs font-semibold text-text-light block truncate">Buttons Color</span>
                                            <span class="text-[10px] text-text-secondary block">Action Buttons</span>
                                        </div>
                                    </label>
                                    <div class="relative shrink-0 ml-2">
                                        <button type="button" id="btn-color-button" class="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition cursor-pointer">Change</button>
                                        <input type="color" id="color-button" class="w-full h-full absolute top-0 left-0 opacity-0 cursor-pointer">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Category & Graph Colors -->
                        <div>
                            <span class="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-2">Category & Graph Colors</span>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <!-- MS Category -->
                                <div class="flex items-center justify-between p-2.5 bg-dark-bg rounded-xl shadow-inner">
                                    <label for="color-ms" class="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1">
                                        <div id="swatch-ms" class="w-6 h-6 rounded-lg shrink-0 shadow-sm border border-white/10" style="background-color: var(--ms-color, #1DB954);"></div>
                                        <div class="truncate">
                                            <span class="text-xs font-semibold text-text-light block truncate">MS Category</span>
                                            <span class="text-[10px] text-text-secondary block">Bar chart color</span>
                                        </div>
                                    </label>
                                    <div class="relative shrink-0 ml-2">
                                        <button type="button" id="btn-color-ms" class="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition cursor-pointer">Change</button>
                                        <input type="color" id="color-ms" class="w-full h-full absolute top-0 left-0 opacity-0 cursor-pointer">
                                    </div>
                                </div>

                                <!-- UWP Category -->
                                <div class="flex items-center justify-between p-2.5 bg-dark-bg rounded-xl shadow-inner">
                                    <label for="color-uwp" class="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1">
                                        <div id="swatch-uwp" class="w-6 h-6 rounded-lg shrink-0 shadow-sm border border-white/10" style="background-color: var(--uwp-color, #1E90FF);"></div>
                                        <div class="truncate">
                                            <span class="text-xs font-semibold text-text-light block truncate">UWP Category</span>
                                            <span class="text-[10px] text-text-secondary block">Bar chart color</span>
                                        </div>
                                    </label>
                                    <div class="relative shrink-0 ml-2">
                                        <button type="button" id="btn-color-uwp" class="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition cursor-pointer">Change</button>
                                        <input type="color" id="color-uwp" class="w-full h-full absolute top-0 left-0 opacity-0 cursor-pointer">
                                    </div>
                                </div>

                                <!-- Line Graph -->
                                <div class="flex items-center justify-between p-2.5 bg-dark-bg rounded-xl shadow-inner">
                                    <label for="color-line" class="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1">
                                        <div id="swatch-line" class="w-6 h-6 rounded-lg shrink-0 shadow-sm border border-white/10" style="background-color: var(--line-color, #1DB954);"></div>
                                        <div class="truncate">
                                            <span class="text-xs font-semibold text-text-light block truncate">Line Graph</span>
                                            <span class="text-[10px] text-text-secondary block">Trend line stroke</span>
                                        </div>
                                    </label>
                                    <div class="relative shrink-0 ml-2">
                                        <button type="button" id="btn-color-line" class="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition cursor-pointer">Change</button>
                                        <input type="color" id="color-line" class="w-full h-full absolute top-0 left-0 opacity-0 cursor-pointer">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Pie / Donut Palette Grid -->
                        <div>
                            <span class="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-2">Pie & Donut Segments</span>
                            <div class="grid grid-cols-3 gap-2">
                                <!-- Segment 1 -->
                                <div class="p-2 bg-dark-bg rounded-xl shadow-inner text-center">
                                    <div id="swatch-pie-1" class="w-full h-3 rounded-md mb-1.5 shadow-sm"></div>
                                    <label for="color-pie-1" class="text-[11px] font-semibold text-text-light block cursor-pointer truncate">Seg. 1</label>
                                    <div class="relative mt-1">
                                        <button type="button" id="btn-color-pie-1" class="w-full py-1 text-[10px] font-medium rounded-md bg-gray-700 hover:bg-gray-600 text-white transition">Color</button>
                                        <input type="color" id="color-pie-1" class="w-full h-full absolute top-0 left-0 opacity-0 cursor-pointer">
                                    </div>
                                </div>

                                <!-- Segment 2 -->
                                <div class="p-2 bg-dark-bg rounded-xl shadow-inner text-center">
                                    <div id="swatch-pie-2" class="w-full h-3 rounded-md mb-1.5 shadow-sm"></div>
                                    <label for="color-pie-2" class="text-[11px] font-semibold text-text-light block cursor-pointer truncate">Seg. 2</label>
                                    <div class="relative mt-1">
                                        <button type="button" id="btn-color-pie-2" class="w-full py-1 text-[10px] font-medium rounded-md bg-gray-700 hover:bg-gray-600 text-white transition">Color</button>
                                        <input type="color" id="color-pie-2" class="w-full h-full absolute top-0 left-0 opacity-0 cursor-pointer">
                                    </div>
                                </div>

                                <!-- Segment 3 -->
                                <div class="p-2 bg-dark-bg rounded-xl shadow-inner text-center">
                                    <div id="swatch-pie-3" class="w-full h-3 rounded-md mb-1.5 shadow-sm"></div>
                                    <label for="color-pie-3" class="text-[11px] font-semibold text-text-light block cursor-pointer truncate">Seg. 3</label>
                                    <div class="relative mt-1">
                                        <button type="button" id="btn-color-pie-3" class="w-full py-1 text-[10px] font-medium rounded-md bg-gray-700 hover:bg-gray-600 text-white transition">Color</button>
                                        <input type="color" id="color-pie-3" class="w-full h-full absolute top-0 left-0 opacity-0 cursor-pointer">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Hidden compatibility elements for Segment 4 -->
                        <div class="hidden">
                            <input type="color" id="color-pie-4">
                            <div id="swatch-pie-4"></div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex gap-2.5 pt-2">
                            <button type="button" id="save-chart-colors-btn" class="flex-1 py-2.5 px-3 font-bold text-xs sm:text-sm rounded-xl transition duration-200 bg-spotify-green hover:bg-green-600 text-dark-bg shadow-md flex items-center justify-center gap-1.5">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
                                <span>Save & Apply</span>
                            </button>
                            <button type="button" id="reset-all-colors-btn" class="py-2.5 px-3 font-semibold text-xs sm:text-sm rounded-xl transition duration-200 bg-gray-700 hover:bg-gray-600 text-white shadow-sm flex items-center justify-center gap-1.5">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                                <span>Reset Defaults</span>
                            </button>
                        </div>
                    </div>

                    <!-- 2. PUROK-GROUP MANAGEMENT -->
                    <div id="settings-card-purok" class="bg-card-bg p-4 sm:p-5 rounded-2xl shadow-xl space-y-4">
                        <div class="flex items-center justify-between pb-2">
                            <div class="flex items-center gap-2.5">
                                <div class="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                </div>
                                <div>
                                    <h2 class="text-base font-bold text-text-light">Purok Groups</h2>
                                    <p class="text-[11px] text-text-secondary">Member classification & clusters</p>
                                </div>
                            </div>
                            <span id="purok-count-badge" class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-500/20 text-blue-400">Active</span>
                        </div>

                        <!-- Add Group Inline Input -->
                        <div>
                            <label for="new-purok-input" class="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-1.5">Add New Group</label>
                            <div class="flex gap-2">
                                <input type="text" id="new-purok-input" placeholder="e.g. 4-1 or 2-9" pattern="[1-9]+-[1-9]+" required class="p-2.5 text-xs sm:text-sm bg-dark-bg rounded-xl focus:ring-2 focus:ring-spotify-green text-text-light flex-grow shadow-inner">
                                <button type="button" id="add-purok-btn" class="px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition duration-200 bg-spotify-green hover:bg-green-600 text-dark-bg shadow-md flex items-center gap-1 shrink-0">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5v14"/></svg>
                                    <span>Add</span>
                                </button>
                            </div>
                        </div>

                        <!-- Active Groups Tag Cloud -->
                        <div>
                            <span class="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-1.5">Active Groups</span>
                            <div id="purok-list-container" class="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 bg-dark-bg rounded-xl shadow-inner">
                                <!-- Purok tags injected by JS -->
                            </div>
                        </div>

                        <p class="text-[11px] text-text-secondary">
                            <span class="font-semibold text-text-light">Note:</span> Removing a purok excludes it from future entry drop-downs; existing member records retain their history.
                        </p>
                    </div>

                    <!-- 3. DATA SAFETY & SYSTEM BACKUP -->
                    <div id="settings-card-backup" class="bg-card-bg p-4 sm:p-5 rounded-2xl shadow-xl space-y-4">
                        <div class="flex items-center justify-between pb-2">
                            <div class="flex items-center gap-2.5">
                                <div class="w-8 h-8 rounded-xl bg-green-500/15 text-green-400 flex items-center justify-center shrink-0">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                </div>
                                <div>
                                    <h2 class="text-base font-bold text-text-light">Data Safety & Backup</h2>
                                    <p class="text-[11px] text-text-secondary">Export & restore complete database</p>
                                </div>
                            </div>
                            <span id="backup-health-badge" class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-yellow-500/20 text-yellow-400">Action Needed</span>
                        </div>

                        <!-- Status Overview Tile -->
                        <div class="p-3 bg-dark-bg rounded-xl shadow-inner flex items-center justify-between">
                            <div>
                                <span class="text-[10px] text-text-secondary uppercase tracking-wider block font-semibold">Last Backup Created</span>
                                <span id="last-backup-display" class="text-xs sm:text-sm font-semibold text-text-light">Never backed up</span>
                            </div>
                            <div class="w-7 h-7 rounded-lg bg-hover-bg flex items-center justify-center text-text-secondary">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/></svg>
                            </div>
                        </div>

                        <!-- Hidden File Input for Restore -->
                        <input type="file" id="restore-json-input" accept=".json,application/json" class="hidden">

                        <!-- Backup & Restore Actions -->
                        <div class="space-y-2">
                            <button type="button" id="export-full-backup-btn" class="w-full py-2.5 px-3 font-bold text-xs sm:text-sm rounded-xl transition duration-200 bg-spotify-green hover:bg-green-600 text-dark-bg flex items-center justify-center gap-2 shadow-md">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                                <span>Download Full Backup (.json)</span>
                            </button>
                            <button type="button" id="trigger-restore-btn" class="w-full py-2.5 px-3 font-semibold text-xs sm:text-sm rounded-xl transition duration-200 bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center gap-2 shadow-sm">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                                <span>Restore Database from File (.json)</span>
                            </button>
                            <!-- Undo / Rollback Button -->
                            <button type="button" id="rollback-restore-btn" class="w-full py-2 px-3 text-xs font-semibold rounded-xl transition duration-200 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 hidden flex items-center justify-center gap-1.5 shadow-sm">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
                                <span>Undo Last Restore (Rollback)</span>
                            </button>
                        </div>

                        <div class="p-2.5 bg-dark-bg/60 rounded-xl text-[11px] text-text-secondary flex items-start gap-2">
                            <svg class="w-4 h-4 text-spotify-green shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                            <span>Backups contain all members, weekly records, calendar notes, and preferences. Encrypted & stored 100% locally.</span>
                        </div>
                    </div>

                    <!-- 4. PWA & OFFLINE SYSTEM -->
                    <div id="settings-card-pwa" class="bg-card-bg p-4 sm:p-5 rounded-2xl shadow-xl space-y-4">
                        <div class="flex items-center justify-between pb-2">
                            <div class="flex items-center gap-2.5">
                                <div class="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                                </div>
                                <div>
                                    <h2 class="text-base font-bold text-text-light">PWA & Offline System</h2>
                                    <p class="text-[11px] text-text-secondary">Standalone app & local caching engine</p>
                                </div>
                            </div>
                            <span id="pwa-status-badge" class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-yellow-500/20 text-yellow-400">Checking</span>
                        </div>

                        <!-- PWA Engine Status Card -->
                        <div class="flex items-center justify-between p-3 bg-dark-bg rounded-xl shadow-inner">
                            <div>
                                <p class="text-xs sm:text-sm font-semibold text-text-light" id="pwa-status-text">Checking Offline Capabilities...</p>
                                <p class="text-[11px] text-text-secondary" id="pwa-status-sub">Service Worker & Local Storage</p>
                            </div>
                            <div class="w-7 h-7 rounded-lg bg-green-500/15 text-green-400 flex items-center justify-center shrink-0">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
                            </div>
                        </div>

                        <!-- Install CTA Button (shown when installable) -->
                        <button type="button" id="pwa-install-btn" class="w-full py-2.5 px-3 font-bold text-xs sm:text-sm rounded-xl transition duration-200 bg-spotify-green hover:bg-green-600 text-dark-bg flex items-center justify-center gap-2 hidden shadow-md">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                            <span>Install Tracker on Device</span>
                        </button>

                        <div id="pwa-installed-msg" class="hidden text-center text-xs text-green-400 font-semibold py-1">
                            ✓ Application is installed and ready for full offline use
                        </div>

                        <!-- Compact Offline Feature Pills -->
                        <div class="grid grid-cols-3 gap-2 text-center text-[11px]">
                            <div class="p-2 bg-dark-bg rounded-xl shadow-inner">
                                <span class="text-text-secondary block text-[10px]">Worker</span>
                                <span class="font-bold text-green-400">Active v2.2</span>
                            </div>
                            <div class="p-2 bg-dark-bg rounded-xl shadow-inner">
                                <span class="text-text-secondary block text-[10px]">Storage</span>
                                <span class="font-bold text-text-light">Persistent</span>
                            </div>
                            <div class="p-2 bg-dark-bg rounded-xl shadow-inner">
                                <span class="text-text-secondary block text-[10px]">Network</span>
                                <span class="font-bold text-spotify-green">Offline 100%</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
`;

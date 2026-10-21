// sections/attendance-check.js - attendance-check Section Template
window.AppSections = window.AppSections || {};
window.AppSections['attendance-check'] = `
<section id="attendance-check" class="section hidden">
            <h1 class="text-3xl font-extrabold mb-3 text-spotify-green text-center">Weekly Attendance Check</h1>
            <p class="text-text-secondary mb-6 text-center text-sm">Record and track Thursday & Sunday worship service attendance for MS Category members.</p>

            <div class="bg-card-bg p-4 sm:p-6 rounded-2xl shadow-lg mb-8 w-full max-w-full overflow-hidden">
                <!-- Week & Year Selector Row -->
                <div class="mb-4 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div class="flex items-end gap-2 sm:gap-2.5">
                        <div>
                            <label for="week-number-input" class="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Week</label>
                            <input type="number" id="week-number-input" placeholder="e.g. 42" min="1" max="53" class="w-20 sm:w-24 p-2 bg-dark-bg border-0 rounded-xl focus:ring-2 focus:ring-spotify-green text-text-light font-bold text-center text-sm shadow-inner">
                        </div>
                        <div>
                            <label for="attendance-year-select" class="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Year</label>
                            <select id="attendance-year-select" class="w-24 sm:w-28 p-2 bg-dark-bg border-0 rounded-xl focus:ring-2 focus:ring-spotify-green text-text-light font-bold text-center text-sm shadow-inner cursor-pointer">
                            </select>
                        </div>
                        <div>
                            <button type="button" onclick="showSection('attendance-summary')" class="h-[38px] px-2.5 sm:px-3 bg-dark-bg hover:bg-hover-bg text-spotify-green rounded-xl transition flex items-center justify-center gap-1.5 shadow-inner cursor-pointer" title="View Attendance Summary">
                                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
                                <span class="text-xs font-bold hidden sm:inline">Summary</span>
                            </button>
                        </div>
                        <input type="hidden" id="week-id-hidden">
                    </div>
                    <div class="text-xs text-text-secondary text-left sm:text-right">
                        <div id="attendance-overwrite-badge" class="hidden mb-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-block bg-yellow-500/20 text-yellow-400">
                            Existing record loaded (Will overwrite on submit)
                        </div>
                        <div class="text-[11px] text-gray-400">Default: <strong class="text-red-400">Absent</strong> | Tap <span class="text-[#1DB954] font-bold">P</span> for Present</div>
                    </div>
                </div>
                
                <!-- Purok Tables Container -->
                <div id="attendance-purok-tables" class="w-full max-w-full overflow-hidden">
                    <p class="text-red-400 p-4 bg-hover-bg rounded-xl text-center">Please enter a valid Week Number to begin attendance check.</p>
                </div>
                
                <!-- Bottom Submit Bar -->
                <div class="mt-4 pt-3">
                    <button type="button" id="submit-attendance-btn" class="p-3 font-bold rounded-xl transition duration-200 bg-spotify-green hover:bg-green-600 text-dark-bg w-full text-center shadow-lg text-sm cursor-pointer">
                        Submit Attendance
                    </button>
                </div>
            </div>
        </section>
`;

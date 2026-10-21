// sections/attendance-summary.js - attendance-summary Section Template
window.AppSections = window.AppSections || {};
window.AppSections['attendance-summary'] = `
<section id="attendance-summary" class="section hidden">
            <div class="max-w-4xl mx-auto pb-10">
                <h1 class="text-2xl sm:text-3xl font-extrabold mb-4 text-spotify-green text-center sm:text-left">Attendance Summary</h1>
                
                <!-- Controls & Year Filter Bar -->
                <div class="bg-card-bg p-2.5 sm:p-3 rounded-2xl shadow-md mb-5 flex items-center justify-between gap-2.5 no-print">
                    <!-- Year Filter Pills -->
                    <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5" id="attendance-year-filter-container">
                        <!-- Dynamic pills: [All (2)] [2026 (2)] -->
                    </div>

                    <!-- Export & Import Controls -->
                    <div class="flex items-center gap-1.5 shrink-0">
                        <input type="file" id="import-attendance-file" accept=".xlsx" class="hidden"> 
                        <button type="button" id="import-attendance-btn" class="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-xl transition duration-200 bg-green-700/80 hover:bg-green-600 text-white shadow-sm flex items-center gap-1.5 cursor-pointer" title="Import Attendance from Excel">
                            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                            <span class="hidden sm:inline">Import</span>
                        </button>
                        <button type="button" id="export-attendance-btn" class="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-xl transition duration-200 bg-dark-bg hover:bg-hover-bg text-text-light hover:text-white shadow-sm flex items-center gap-1.5 cursor-pointer" title="Export Attendance to Excel">
                            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                            <span class="hidden sm:inline">Export</span>
                        </button>
                    </div>
                </div>
                
                <div id="attendance-history-container" class="space-y-6">
                    <p class="text-text-secondary p-4 bg-hover-bg/60 rounded-2xl text-center">No attendance records found yet.</p>
                </div>
            </div>
        </section>
`;

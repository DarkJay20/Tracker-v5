// sections/data-views.js - data-views Section Template
window.AppSections = window.AppSections || {};
window.AppSections['data-views'] = `
<section id="data-views" class="section hidden">
            <h1 class="text-3xl font-extrabold mb-8 text-spotify-green text-center">Data Views & Filtering</h1>
            <!-- Compact Search & Filter Bar (Top) -->
            <div class="bg-card-bg p-3 sm:p-4 rounded-2xl shadow-md mb-4 no-print overflow-hidden">
                <div class="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                    <!-- Search Input -->
                    <div class="relative flex-grow min-w-0">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
                        </div>
                        <input type="text" id="search-input" placeholder="Search name, purok, kapisanan..." class="w-full pl-9 pr-3 py-2 bg-dark-bg border-0 rounded-xl focus:ring-2 focus:ring-spotify-green text-text-light text-xs sm:text-sm shadow-inner">
                    </div>
                    <!-- Compact Date Filters -->
                    <div class="grid grid-cols-2 gap-2 w-full sm:flex sm:items-center sm:w-auto shrink-0">
                        <label for="start-date-input" class="date-filter-capsule flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl shadow-inner min-w-0 sm:w-40 cursor-pointer border-0 transition focus-within:ring-1 focus-within:ring-spotify-green">
                            <span class="text-text-secondary text-[10px] font-bold uppercase tracking-wider shrink-0 select-none">From</span>
                            <input type="date" id="start-date-input" class="w-full min-w-0 bg-transparent border-0 text-text-light text-xs p-0 focus:outline-none cursor-pointer">
                        </label>
                        <label for="end-date-input" class="date-filter-capsule flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl shadow-inner min-w-0 sm:w-40 cursor-pointer border-0 transition focus-within:ring-1 focus-within:ring-spotify-green">
                            <span class="text-text-secondary text-[10px] font-bold uppercase tracking-wider shrink-0 select-none">To</span>
                            <input type="date" id="end-date-input" class="w-full min-w-0 bg-transparent border-0 text-text-light text-xs p-0 focus:outline-none cursor-pointer">
                        </label>
                    </div>
                </div>
            </div>

            <!-- Category and Purok Quick Tabs -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-5 no-print">
                <div class="inline-flex rounded-xl p-1 bg-dark-bg shadow-inner border-0 self-start sm:self-auto">
                    <button type="button" id="tab-cat-all" onclick="window.setDataViewCategory('all')" class="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition bg-spotify-green text-dark-bg shadow-sm cursor-pointer">
                        All (<span id="count-all-category">0</span>)
                    </button>
                    <button type="button" id="tab-cat-ms" onclick="window.setDataViewCategory('ms')" class="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition text-text-secondary hover:text-white cursor-pointer">
                        MS (<span id="count-ms-category">0</span>)
                    </button>
                    <button type="button" id="tab-cat-uwp" onclick="window.setDataViewCategory('uwp')" class="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition text-text-secondary hover:text-white cursor-pointer">
                        UWP (<span id="count-uwp-category">0</span>)
                    </button>
                </div>

                <div class="flex items-center gap-2 text-xs">
                    <span class="text-text-secondary font-medium">Filter Purok:</span>
                    <select id="data-view-purok-filter" onchange="applyFilters()" class="p-1.5 bg-dark-bg border-0 rounded-xl text-text-light text-xs font-medium focus:ring-2 focus:ring-spotify-green shadow-inner cursor-pointer">
                        <option value="all">All Puroks</option>
                    </select>
                </div>
            </div>

            <!-- MS Category Section -->
            <div id="ms-category-container" class="mb-8 w-full max-w-full overflow-hidden">
                <div class="flex items-center justify-between mb-3 px-1">
                    <div class="flex items-center gap-2">
                        <h2 class="text-xl sm:text-2xl font-bold text-spotify-green">MS Category</h2>
                        <span id="ms-header-badge" class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-spotify-green/20 text-spotify-green">0 members</span>
                    </div>
                </div>

                <div class="bg-card-bg p-3 sm:p-5 rounded-2xl shadow-lg w-full max-w-full overflow-hidden">
                    <div class="overflow-x-auto w-full bg-dark-bg rounded-2xl shadow-xl">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-gray-800 text-[10px] sm:text-[11px] uppercase text-text-secondary sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th class="py-2.5 px-2 text-center w-10 sm:w-12 no-print">
                                        <input type="checkbox" id="select-all-ms" onclick="window.toggleSelectAll('ms')" class="form-checkbox h-3.5 w-3.5 text-spotify-green bg-dark-bg border-0 rounded focus:ring-spotify-green cursor-pointer" title="Select all MS">
                                    </th>
                                    <th onclick="window.sortTable('name')" class="py-2.5 px-3 text-left font-semibold cursor-pointer hover:text-white transition sortable-header select-none" data-sort-field="name">
                                        <span class="sm:hidden">Member Details</span>
                                        <span class="hidden sm:inline">Name</span>
                                        <span class="sort-indicator" data-sort-field="name"></span>
                                    </th>
                                    <th onclick="window.sortTable('kapisanan')" class="py-2.5 px-3 text-center font-semibold cursor-pointer hover:text-white transition sortable-header select-none hidden sm:table-cell w-28" data-sort-field="kapisanan">
                                        Kapisanan <span class="sort-indicator" data-sort-field="kapisanan"></span>
                                    </th>
                                    <th onclick="window.sortTable('timestamp')" class="py-2.5 px-3 text-left font-semibold cursor-pointer hover:text-white transition sortable-header select-none hidden sm:table-cell w-32" data-sort-field="timestamp">
                                        Date Added <span class="sort-indicator" data-sort-field="timestamp"></span>
                                    </th>
                                    <th class="py-2.5 px-3 text-right sm:text-center font-semibold no-print w-28">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-800/60" id="ms-data-table-body">
                                <!-- MS Data entries will go here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- UWP Category Section -->
            <div id="uwp-category-container" class="mb-8 w-full max-w-full overflow-hidden">
                <div class="flex items-center justify-between mb-3 px-1">
                    <div class="flex items-center gap-2">
                        <h2 class="text-xl sm:text-2xl font-bold text-blue-400">UWP Category</h2>
                        <span id="uwp-header-badge" class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">0 members</span>
                    </div>
                </div>

                <div class="bg-card-bg p-3 sm:p-5 rounded-2xl shadow-lg w-full max-w-full overflow-hidden">
                    <div class="overflow-x-auto w-full bg-dark-bg rounded-2xl shadow-xl">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-gray-800 text-[10px] sm:text-[11px] uppercase text-text-secondary sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th class="py-2.5 px-2 text-center w-10 sm:w-12 no-print">
                                        <input type="checkbox" id="select-all-uwp" onclick="window.toggleSelectAll('uwp')" class="form-checkbox h-3.5 w-3.5 text-spotify-green bg-dark-bg border-0 rounded focus:ring-spotify-green cursor-pointer" title="Select all UWP">
                                    </th>
                                    <th onclick="window.sortTable('name')" class="py-2.5 px-3 text-left font-semibold cursor-pointer hover:text-white transition sortable-header select-none" data-sort-field="name">
                                        <span class="sm:hidden">Member Details</span>
                                        <span class="hidden sm:inline">Name</span>
                                        <span class="sort-indicator" data-sort-field="name"></span>
                                    </th>
                                    <th onclick="window.sortTable('kapisanan')" class="py-2.5 px-3 text-center font-semibold cursor-pointer hover:text-white transition sortable-header select-none hidden sm:table-cell w-28" data-sort-field="kapisanan">
                                        Kapisanan <span class="sort-indicator" data-sort-field="kapisanan"></span>
                                    </th>
                                    <th onclick="window.sortTable('timestamp')" class="py-2.5 px-3 text-left font-semibold cursor-pointer hover:text-white transition sortable-header select-none hidden sm:table-cell w-32" data-sort-field="timestamp">
                                        Date Added <span class="sort-indicator" data-sort-field="timestamp"></span>
                                    </th>
                                    <th class="py-2.5 px-3 text-right sm:text-center font-semibold no-print w-28">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-800/60" id="uwp-data-table-body">
                                <!-- UWP Data entries will go here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Bottom Controls: Bulk Action & Management Tools -->
            <div class="mt-8 pt-6 border-t border-gray-800/80 no-print space-y-4">
                <div class="flex items-center justify-between">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-text-secondary">Actions & Data Management</h3>
                </div>

                <!-- Bulk Edit Controls (Feature 8) -->
                <div class="flex flex-col sm:flex-row gap-3 p-3.5 sm:p-4 bg-card-bg rounded-2xl shadow-lg items-stretch sm:items-center">
                    <div class="flex items-center gap-2.5 flex-grow">
                        <label for="bulk-action-select" class="text-xs font-semibold text-text-secondary whitespace-nowrap">Bulk Action:</label>
                        <div class="relative flex-grow">
                            <select id="bulk-action-select" class="w-full p-2.5 pr-8 bg-dark-bg border-0 rounded-xl focus:ring-2 focus:ring-spotify-green text-text-light text-xs shadow-inner appearance-none cursor-pointer">
                                <option value="">-- Select Action --</option>
                                <optgroup label="Modify Purok">
                                     <!-- Dynamic Purok options added by JS -->
                                </optgroup>
                                <option value="setRecommendedTrue">Set as Suggested</option>
                                <option value="setRecommendedFalse">Remove from Suggestions</option>
                                <option value="archiveSelected">Archive Selected</option>
                            </select>
                            <div class="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-text-secondary">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>
                            </div>
                        </div>
                    </div>
                    <button id="perform-bulk-action-btn" class="px-4 py-2.5 text-xs font-bold rounded-xl transition duration-200 bg-blue-700 hover:bg-blue-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white w-full sm:w-auto shadow-md cursor-pointer flex items-center justify-center gap-1.5" disabled>
                        <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
                        <span>Apply to Selected (<span id="selected-count">0</span>)</span>
                    </button>
                </div>
                
                <!-- Download, Import, Report and Reset Actions (Symmetrical 2x2 Grid on Mobile, Flex on Desktop) -->
                <div class="grid grid-cols-2 sm:flex sm:flex-row justify-end gap-2.5">
                    <!-- Hidden file input for importing -->
                    <input type="file" id="import-excel-file" accept=".xlsx" class="hidden"> 
                    <button id="import-excel-btn" class="px-3.5 py-2.5 text-xs font-semibold rounded-xl transition duration-200 bg-green-700 hover:bg-green-600 text-white shadow-md cursor-pointer flex items-center justify-center gap-1.5 text-center">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                        <span>Import Excel</span>
                    </button>
                    <button id="download-excel-btn" class="px-3.5 py-2.5 text-xs font-semibold rounded-xl transition duration-200 bg-gray-700 hover:bg-gray-600 text-white shadow-md cursor-pointer flex items-center justify-center gap-1.5 text-center">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                        <span>Download Excel</span>
                    </button>
                    <button id="print-report-btn" onclick="window.printReport()" class="px-3.5 py-2.5 text-xs font-semibold rounded-xl transition duration-200 bg-blue-700 hover:bg-blue-600 text-white shadow-md cursor-pointer flex items-center justify-center gap-1.5 text-center">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                        <span>Print Report</span>
                    </button>
                    <button id="reset-data-btn" class="px-3.5 py-2.5 text-xs font-semibold rounded-xl transition duration-200 bg-red-700 hover:bg-red-600 text-white shadow-md cursor-pointer flex items-center justify-center gap-1.5 text-center">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
                        <span>Reset Data</span>
                    </button>
                </div>
            </div>
        </section>
`;

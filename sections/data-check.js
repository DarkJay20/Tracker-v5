// sections/data-check.js - data-check Section Template
window.AppSections = window.AppSections || {};
window.AppSections['data-check'] = `
<section id="data-check" class="section hidden">
            <h1 class="text-3xl font-extrabold mb-8 text-spotify-green text-center">Data Integrity Check</h1>
            <p class="text-text-secondary mb-6 text-center">Scan your offline data for duplicates, inconsistencies, and orphaned records.</p>
            
            <div id="data-quality-score-container" class="bg-card-bg p-6 rounded-2xl shadow-lg mb-8 text-center max-w-xs mx-auto">
                 <h2 class="text-xl font-bold mb-2 text-text-light">Data Quality Score</h2>
                 <p id="data-quality-score" class="text-5xl font-extrabold text-white">--</p>
                 <p id="data-quality-message" class="text-sm text-text-secondary mt-2"></p>
            </div>

            <button id="run-check-btn" class="p-3 font-bold rounded-xl transition duration-200 bg-blue-700 hover:bg-blue-600 text-white w-full max-w-xs mb-8 mx-auto block cursor-pointer shadow-md">
                Run Integrity Scan
            </button>
            
            <div id="check-results-container" class="space-y-6">
                <!-- Results will be displayed here -->
                <div class="bg-card-bg p-6 rounded-2xl shadow-lg">
                    <h2 class="text-xl font-bold mb-4 text-text-light">Duplicate Name Report</h2>
                    <div id="duplicate-names-list">
                        <p class="text-text-secondary">Click "Run Integrity Scan" to check for issues.</p>
                    </div>
                </div>
                
                <div class="bg-card-bg p-6 rounded-2xl shadow-lg">
                    <h2 class="text-xl font-bold mb-4 text-text-light">Empty Purok Groups</h2>
                    <div id="empty-purok-list">
                        <p class="text-text-secondary">Click "Run Integrity Scan" to check for issues.</p>
                    </div>
                </div>
                
                <div class="bg-card-bg p-6 rounded-2xl shadow-lg">
                    <h2 class="text-xl font-bold mb-4 text-text-light">Orphaned Records</h2>
                    <div id="orphaned-records-list">
                        <p class="text-text-secondary">No orphaned records detected in current database.</p>
                    </div>
                </div>
            </div>
        </section>
`;

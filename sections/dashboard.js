// sections/dashboard.js - dashboard Section Template
window.AppSections = window.AppSections || {};
window.AppSections['dashboard'] = `
<section id="dashboard" class="section hidden">
            <h1 class="text-3xl font-extrabold mb-8 text-spotify-green text-center">Analytics Dashboard</h1>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <!-- Stat Box 1 -->
                <div class="stat-box p-6 bg-card-bg rounded-2xl shadow-lg text-center" id="ms-stats">
                    <h3 class="text-xl font-semibold text-text-light mb-4">MS Category</h3>
                    <!-- Content injected by JS -->
                </div>
                <!-- Stat Box 2 -->
                <div class="stat-box p-6 bg-card-bg rounded-2xl shadow-lg text-center" id="uwp-stats">
                    <h3 class="text-xl font-semibold text-text-light mb-4">UWP Category</h3>
                    <!-- Content injected by JS -->
                </div>
                <!-- Stat Box 3 -->
                <div class="stat-box p-6 bg-card-bg rounded-2xl shadow-lg text-center">
                    <h3 class="text-xl font-semibold text-text-light mb-4">Total Names</h3>
                    <p id="overall-stats" class="text-5xl font-extrabold text-spotify-green">0</p>
                </div>
                <!-- NEW Stat Box (Feature 5: Purok Ranking) -->
                <div class="stat-box p-6 bg-card-bg rounded-2xl shadow-lg text-left" id="purok-ranking-card">
                    <h3 class="text-xl font-semibold text-text-light mb-4 text-center">Purok Attendance Ranking</h3>
                    <!-- Ranking content injected by JS -->
                    <p class="text-text-secondary text-center">Loading rankings...</p>
                </div>
            </div>
            
            <!-- NEW: Kapisanan Breakdown -->
            <div class="bg-card-bg p-6 rounded-2xl shadow-lg mb-8">
                <h2 class="text-2xl font-bold mb-4 text-spotify-green text-center">Kapisanan Breakdown</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6" id="kapisanan-breakdown">
                    <!-- Data injected by JS -->
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div class="bg-card-bg p-5 rounded-2xl shadow-lg">
                    <h4 class="text-lg font-medium mb-3 text-text-light">Category Distribution (Bar)</h4>
                    <canvas id="category-bar-chart" data-chart-type="bar"></canvas>
                </div>
                <div class="bg-card-bg p-5 rounded-2xl shadow-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <h4 class="text-lg font-medium mb-3 text-text-light">MS Purok Split (Pie)</h4>
                        <canvas id="ms-pie-chart" data-chart-type="pie" data-category="MS"></canvas>
                    </div>
                    <div>
                        <h4 class="text-lg font-medium mb-3 text-text-light">UWP Purok Split (Pie)</h4>
                        <canvas id="uwp-pie-chart" data-chart-type="pie" data-category="UWP"></canvas>
                    </div>
                </div>
            </div>
            <div class="bg-card-bg p-5 rounded-2xl shadow-lg">
                <h4 class="text-lg font-medium mb-3 text-text-light">Entries Added Over Time (Last 12 Months)</h4>
                <canvas id="time-series-chart"></canvas>
            </div>
        </section>
`;

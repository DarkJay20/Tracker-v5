// sections/ms-recommendation.js - ms-recommendation Section Template
window.AppSections = window.AppSections || {};
window.AppSections['ms-recommendation'] = `
<section id="ms-recommendation" class="section hidden">
            <h1 class="text-3xl font-extrabold mb-8 text-spotify-green text-center">MS Suggestion (Consistent Attendance)</h1>
            <div class="bg-card-bg p-6 rounded-2xl shadow-xl mb-8">
                <p class="text-text-secondary mb-6">These members have maintained a **Present** status for 3 or more consecutive sessions (Thursday or Sunday), demonstrating strong consistency.</p>
                <div id="ms-recommendation-list" class="space-y-3">
                    <!-- Recommendation list populated by JS -->
                    <p class="text-text-secondary text-center">No members currently meet the 3-session consecutive attendance requirement.</p>
                </div>
            </div>
        </section>
`;

// sections/archived-data.js - archived-data Section Template
window.AppSections = window.AppSections || {};
window.AppSections['archived-data'] = `
<section id="archived-data" class="section hidden">
            <h1 class="text-3xl font-extrabold mb-8 text-spotify-green text-center">Archived Data History</h1>

            <p class="text-text-secondary mb-6">These are entries that have been archived (soft-deleted). You can restore them to the main view or permanently delete them.</p>

            <h2 class="text-2xl font-bold mb-4 text-spotify-green">Archived Entries</h2>
            <div class="overflow-x-auto bg-card-bg rounded-2xl shadow-lg mb-8">
                <table id="archived-data-table" class="min-w-full divide-y divide-gray-700">
                    <thead class="bg-hover-bg">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Name</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">Kapisanan</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Purok</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date Added</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-800" id="archived-data-table-body">
                        <!-- Archived Data entries will go here -->
                    </tbody>
                </table>
            </div>
        </section>
`;

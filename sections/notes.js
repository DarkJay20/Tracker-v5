// sections/notes.js - notes Section Template
window.AppSections = window.AppSections || {};
window.AppSections['notes'] = `
<section id="notes" class="section hidden">
            <h1 class="text-3xl font-extrabold mb-8 text-spotify-green text-center">Private Notes</h1>
            <div class="bg-card-bg p-6 rounded-2xl shadow-xl mb-6">
                <textarea id="notes-textarea" rows="8" placeholder="Write your new note here..." class="w-full p-4 mb-4 bg-dark-bg border-0 rounded-xl focus:ring-2 focus:ring-spotify-green text-text-light resize-none shadow-inner"></textarea>
                <button type="button" id="save-notes-btn" class="p-3 font-bold rounded-xl transition duration-200 bg-spotify-green hover:bg-green-600 text-dark-bg w-full shadow-lg">
                    Save New Note
                </button>
            </div>
            
            <h2 class="text-2xl font-bold mb-4 text-text-light">Saved Notes History</h2>
            <div id="saved-notes-container" class="space-y-4">
                <!-- Saved notes will be rendered here -->
            </div>
        </section>
`;

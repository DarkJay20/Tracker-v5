// sections/front-page.js - front-page Section Template
window.AppSections = window.AppSections || {};
window.AppSections['front-page'] = `
<section id="front-page" class="section">
            <!-- Adjusted vertical positioning: pt-[5vh] to bring it slightly higher -->
            <div class="flex flex-col items-center justify-center min-h-[90%] text-center p-4 pt-[5vh] lg:pt-[5vh]"> 
                <h1 class="text-6xl font-extrabold mb-4 text-spotify-green">Tracker <span class="text-3xl text-gray-400">V5</span></h1>
                <!-- Changed sub-text -->
                <p class="text-xl text-text-secondary mb-6">Data Management System</p>

                <!-- 3 columns with uniform auto-rows-fr and consistent grid spacing -->
                <div id="front-page-nav-grid" class="grid grid-cols-3 gap-3 sm:gap-4 max-w-md w-full auto-rows-fr">
                    <!-- Nav items injected by JS -->
                </div>
            </div>
        </section>
`;

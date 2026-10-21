// sections/input-data.js - input-data Section Template
window.AppSections = window.AppSections || {};
window.AppSections['input-data'] = `
<section id="input-data" class="section hidden">
            <h1 class="text-3xl font-extrabold mb-8 text-spotify-green text-center">New Data Entry</h1>
            <p class="text-text-secondary mb-4 text-center">Note: Name duplicates are automatically checked to maintain data integrity.</p>
            <div class="bg-card-bg p-6 rounded-2xl shadow-lg mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <!-- Name input spans multiple columns -->
                <input type="text" id="name" placeholder="Name (Required)" required class="col-span-full lg:col-span-2 p-3 bg-dark-bg border-0 rounded-xl focus:ring-2 focus:ring-spotify-green text-text-light shadow-inner">
                
                <!-- Status Select -->
                <div class="relative w-full">
                    <select id="status" class="w-full p-3 pr-10 bg-dark-bg border-0 rounded-xl focus:ring-2 focus:ring-spotify-green text-text-light shadow-inner appearance-none cursor-pointer">
                        <option value="MS">MS</option>
                        <option value="UWP">UWP</option>
                    </select>
                    <div class="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-text-secondary">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>
                    </div>
                </div>

                <!-- Kapisanan Select -->
                <div class="relative w-full">
                    <select id="kapisanan" class="w-full p-3 pr-10 bg-dark-bg border-0 rounded-xl focus:ring-2 focus:ring-spotify-green text-text-light shadow-inner appearance-none cursor-pointer">
                        <option value="BINHI">BINHI</option>
                        <option value="KADIWA">KADIWA</option>
                        <option value="BUKLOD">BUKLOD</option>
                    </select>
                    <div class="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-text-secondary">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>
                    </div>
                </div>
                
                <!-- Purok Select (dynamic) -->
                <div class="relative w-full">
                    <select id="purok" class="w-full p-3 pr-10 bg-dark-bg border-0 rounded-xl focus:ring-2 focus:ring-spotify-green text-text-light shadow-inner appearance-none cursor-pointer">
                        <!-- Dynamic options will be here -->
                    </select>
                    <div class="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-text-secondary">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>
                    </div>
                </div>

                <!-- Add Entry Button -->
                <button type="button" id="add-entry-btn" class="col-span-full lg:col-span-1 p-3 font-bold rounded-xl transition duration-200 bg-spotify-green hover:bg-green-600 text-dark-bg cursor-pointer shadow-md">
                    Add Entry
                </button>
            </div>
        </section>
`;

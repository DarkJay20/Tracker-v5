// sections/events.js - events Section Template
window.AppSections = window.AppSections || {};
window.AppSections['events'] = `
<section id="events" class="section hidden">
            <h1 class="text-3xl font-extrabold mb-8 text-spotify-green text-center">Upcoming Events & Key Dates</h1>
            
            <!-- NEW Calendar (Feature 6 Enhancement) -->
            <div class="bg-card-bg p-6 rounded-2xl shadow-xl mb-8 max-w-lg mx-auto">
                <div class="flex justify-between items-center mb-4">
                    <button id="calendar-prev-month" class="p-2 rounded-xl hover:bg-hover-bg transition duration-200 text-text-secondary hover:text-white" aria-label="Previous Month">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <h2 id="calendar-month-year" class="text-xl font-bold text-text-light">Month Year</h2>
                    <button id="calendar-next-month" class="p-2 rounded-xl hover:bg-hover-bg transition duration-200 text-text-secondary hover:text-white" aria-label="Next Month">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
                
                <div class="calendar-header">
                    <div class="calendar-day-name">Wk</div>
                    <div class="calendar-day-name">Sun</div>
                    <div class="calendar-day-name">Mon</div>
                    <div class="calendar-day-name">Tue</div>
                    <div class="calendar-day-name">Wed</div>
                    <div class="calendar-day-name">Thu</div>
                    <div class="calendar-day-name">Fri</div>
                    <div class="calendar-day-name">Sat</div>
                </div>
                <div id="calendar-grid-body" class="calendar-grid">
                    <!-- Calendar days will be injected by JS -->
                </div>
            </div>

            <div class="bg-card-bg p-6 rounded-2xl shadow-xl mb-8 max-w-lg mx-auto">
                <h2 class="text-2xl font-bold mb-4 text-text-light">Add New Event</h2>
                <input type="text" id="event-name-input" placeholder="Event Name (e.g., Year-End Social)" required class="w-full p-3 bg-dark-bg border-0 rounded-xl mb-4 focus:ring-2 focus:ring-spotify-green text-text-light shadow-inner">
                <input type="date" id="event-date-input" required class="w-full p-3 bg-dark-bg border-0 rounded-xl mb-4 focus:ring-2 focus:ring-spotify-green text-text-light shadow-inner">
                <button type="button" id="add-event-btn" class="p-3 font-bold rounded-xl transition duration-200 bg-spotify-green hover:bg-green-600 text-dark-bg w-full shadow-lg">
                    Schedule Event
                </button>
            </div>

            <h2 class="text-2xl font-bold mb-4 text-text-light max-w-lg mx-auto">Scheduled Events</h2>
            <div id="events-list-container" class="space-y-3 max-w-lg mx-auto">
                <!-- Events rendered here -->
                <p class="text-text-secondary p-4 bg-hover-bg/60 rounded-2xl text-center">No events scheduled.</p>
            </div>
        </section>
`;

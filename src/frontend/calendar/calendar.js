// Calendar Component
let currentDate = new Date();
let selectedDate = new Date();
let calendarEvents = []; // 存储从 API 获取的真实事件

const API_BASE = 'http://127.0.0.1:5000';

// Initialize calendar
function initCalendar() {
    if (localStorage.getItem('calendarNeedsRefresh') === 'true') {
        localStorage.removeItem('calendarNeedsRefresh');
        calendarEvents = [];
    }
    populateYearDropdown();
    setCurrentMonth();
    loadCalendarEvents();
    setupEventListeners();
}

// Populate year dropdown
function populateYearDropdown() {
    const yearSelect = document.getElementById('yearSelect');
    const currentYear = currentDate.getFullYear();
    
    // Add years from current - 5 to current + 5
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    }
}

// Set current month in dropdown
function setCurrentMonth() {
    const monthSelect = document.getElementById('monthSelect');
    monthSelect.value = currentDate.getMonth();
}

// Update calendar display
function updateCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    const year = parseInt(document.getElementById('yearSelect').value);
    const month = parseInt(document.getElementById('monthSelect').value);
    
    // Update current date to selected month/year (use UTC)
    currentDate = new Date(Date.UTC(year, month, 1));

    // Get first day of month and number of days (use UTC)
    const firstDay = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-cell empty';
        calendarGrid.appendChild(emptyCell);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell';
        
        // Day number - simple and clean
        const dayNumber = document.createElement('span');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        cell.appendChild(dayNumber);
        
        const cellDate = new Date(Date.UTC(year, month, day));
        
        // Check if current day
        if (isToday(cellDate)) {
            cell.classList.add('today');
        }
        
        // Check if selected day
        if (isSameDay(cellDate, selectedDate)) {
            cell.classList.add('selected');
        }
        
        // Add click event
        cell.addEventListener('click', () => selectDate(cellDate));
        
        // Add events indicator
        const events = getEventsForDate(cellDate);
        if (events.length > 0) {
            const eventIndicator = document.createElement('div');
            eventIndicator.className = 'event-indicator';
            cell.appendChild(eventIndicator);
        }
        
        calendarGrid.appendChild(cell);
    }
}

// Check if date is today
function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

// Check if two dates are the same day
function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

// Select a date
function selectDate(date) {
    selectedDate = date;
    updateCalendar();
    showEvents(date);
}

// Change month
function changeMonth(direction) {
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    
    let month = parseInt(monthSelect.value);
    let year = parseInt(yearSelect.value);
    
    month += direction;
    
    if (month < 0) {
        month = 11;
        year--;
    } else if (month > 11) {
        month = 0;
        year++;
    }
    
    monthSelect.value = month;
    yearSelect.value = year;
    updateCalendar();
}

// Go to today
function goToToday() {
    const today = new Date();
    
    document.getElementById('yearSelect').value = today.getFullYear();
    document.getElementById('monthSelect').value = today.getMonth();
    
    currentDate = new Date();
    selectedDate = new Date();
    updateCalendar();
    showEvents(today);
}

// Show events for a date
function showEvents(date) {
    const modal = document.getElementById('eventModal');
    const modalDate = document.getElementById('modalDate');
    const eventsList = document.getElementById('eventsList');
    const modalTime = document.getElementById('modalTime');
    
    // Format date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    modalDate.textContent = date.toLocaleDateString('en-US', options);
    
    // Display current time
    const now = new Date();
    modalTime.textContent = `Current time: ${now.toLocaleTimeString()}`;
    
    // Get events for this date
    const events = getEventsForDate(date);
    
    eventsList.innerHTML = '';
    
    if (events.length === 0) {
        const noEvents = document.createElement('p');
        noEvents.className = 'no-events';
        noEvents.textContent = 'No events scheduled';
        eventsList.appendChild(noEvents);
    } else {
        events.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.className = 'event-item';
            
            const eventTime = document.createElement('div');
            eventTime.className = 'event-time';
            eventTime.textContent = event.time;
            
            const eventTitle = document.createElement('div');
            eventTitle.className = 'event-title';
            eventTitle.textContent = event.title;
            
            eventItem.appendChild(eventTime);
            eventItem.appendChild(eventTitle);
            eventsList.appendChild(eventItem);
        });
    }
    
    // Show modal
    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('eventModal').style.display = 'none';
}

// Get sample events for demonstration
function getSampleEvents(date) {
    const events = [];
    const day = date.getDate();
    
    // Add some sample events based on day of month
    if (day % 3 === 0) {
        events.push({
            time: '09:00 AM - 10:00 AM',
            title: 'Team Meeting'
        });
    }
    
    if (day % 5 === 0) {
        events.push({
            time: '02:00 PM - 03:00 PM',
            title: 'Project Review'
        });
    }
    
    if (day % 7 === 0) {
        events.push({
            time: '11:00 AM - 12:00 PM',
            title: 'Client Call'
        });
    }
    
    if (day === 15) {
        events.push({
            time: 'All Day',
            title: 'Monthly Planning'
        });
    }
    
    return events;
}

// Setup event listeners
function setupEventListeners() {
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('eventModal');
        if (event.target === modal) {
            closeModal();
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initCalendar);

// Load calendar events from API
async function loadCalendarEvents() {
    try {
        const response = await fetch(`${API_BASE}/get_calendar_events?mode=all`);
        const data = await response.json();
        if (data.status === 'success') {
            calendarEvents = data.events;
        } else {
            console.error('Failed to load events:', data.message);
            calendarEvents = [];
        }
    } catch (error) {
        console.error('Error loading calendar events:', error);
        calendarEvents = [];
    }
    updateCalendar();
}

// Get events for a specific date
function getEventsForDate(date) {
    if (!calendarEvents || calendarEvents.length === 0) {
        return []; // No sample events - return empty array
    }
    const events = [];
    // Use UTC date components for comparison to avoid timezone issues
    const dateStr = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
    calendarEvents.forEach(event => {
        if (!event.start) return;
        // Extract UTC date directly from the string (first 10 chars: YYYY-MM-DD)
        const eventDateStr = event.start.substring(0, 10);
        if (eventDateStr === dateStr) {
            let timeStr;
            if (event.isAllDay) {
                timeStr = 'All Day';
            } else {
                // Extract time directly from API string (UTC time, no timezone conversion)
                const startTime = extractTimeFromString(event.start);
                if (event.end) {
                    const endTime = extractTimeFromString(event.end);
                    timeStr = `${startTime} - ${endTime}`;
                } else {
                    timeStr = startTime;
                }
            }
            events.push({ time: timeStr, title: event.title, id: event.id });
        }
    });
    return events;
}

// External refresh function
window.refreshCalendar = function() {
    loadCalendarEvents();
};

// Extract time from ISO string and format as HH:MM AM/PM
function extractTimeFromString(dateTimeStr) {
    // Extract HH:MM from "2026-05-03T01:00:00.0000000"
    const timeMatch = dateTimeStr.match(/T(\d{2}):(\d{2})/);
    if (!timeMatch) return '';
    
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    
    return `${hours}:${minutes} ${ampm}`;
}
/**
 * Quote Request Wizard - Brown Theme
 * Dózsa Apartman Szeged
 */

// reCAPTCHA v2 Invisible widget ID
var recaptchaWizardWidgetId;

// Blocked dates - update this array with actual blocked dates
const BLOCKED_DATES = [

];

// State management
let wizardState = {
    currentStep: 1,
    adults: 2,
    extraBed: 0,
    child3to4: 0,
    child0to2: 0,
    checkIn: null,
    checkOut: null,
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    message: ''
};

// Initialize reCAPTCHA when API is ready (called from index.html)
function onRecaptchaLoadWizard() {
    // Widget will be rendered when contact form is shown
    console.log('reCAPTCHA API loaded for wizard');
}

// Initialize wizard on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeWizard();
});

function initializeWizard() {
    const wizardContainer = document.getElementById('quoteWizard');
    if (!wizardContainer) return;

    // Show step 1 (guest selector) on init
    showGuestSelector();
}

// STEP 1: Guest Selector
function showGuestSelector() {
    const wizardContainer = document.getElementById('quoteWizard');

    wizardContainer.innerHTML = `
        <div class="guest-card" data-aos="fade-up">
            <button type="button" class="card-close" onclick="closeWizard()">×</button>
            <h3 class="guest-title">Adja meg a vendégek számát a szabad dátumok megjelenítéséhez</h3>

            <div class="guest-selector">
                <div class="guest-row">
                    <label>Felnőtt</label>
                    <div class="guest-counter">
                        <button type="button" class="counter-btn" onclick="updateGuests('adults', -1)">−</button>
                        <span class="counter-value" id="adultsCount">${wizardState.adults}</span>
                        <button type="button" class="counter-btn" onclick="updateGuests('adults', 1)">+</button>
                    </div>
                </div>

                <div class="guest-row">
                    <label>Pótágy</label>
                    <div class="guest-counter">
                        <button type="button" class="counter-btn" onclick="updateGuests('extraBed', -1)">−</button>
                        <span class="counter-value" id="extraBedCount">${wizardState.extraBed}</span>
                        <button type="button" class="counter-btn" onclick="updateGuests('extraBed', 1)">+</button>
                    </div>
                </div>

                <div class="guest-row">
                    <label>Gyerek (3–4)</label>
                    <div class="guest-counter">
                        <button type="button" class="counter-btn" onclick="updateGuests('child3to4', -1)">−</button>
                        <span class="counter-value" id="child3to4Count">${wizardState.child3to4}</span>
                        <button type="button" class="counter-btn" onclick="updateGuests('child3to4', 1)">+</button>
                    </div>
                </div>

                <div class="guest-row">
                    <label>Gyerek (2 év alatt)</label>
                    <div class="guest-counter">
                        <button type="button" class="counter-btn" onclick="updateGuests('child0to2', -1)">−</button>
                        <span class="counter-value" id="child0to2Count">${wizardState.child0to2}</span>
                        <button type="button" class="counter-btn" onclick="updateGuests('child0to2', 1)">+</button>
                    </div>
                </div>

                <p class="guest-note">A 0–2 évesekre nem számítunk fel férőhelyet és díjakat.</p>
            </div>

            <div class="error-message" id="guestError" style="display: none;"></div>

            <div class="wizard-actions">
                <button type="button" class="btn-wizard-primary" onclick="proceedToCalendar()">Tovább</button>
            </div>
        </div>
    `;
}

function updateGuests(type, delta) {
    const newValue = wizardState[type] + delta;

    // Validation
    if (type === 'adults') {
        if (newValue < 1 || newValue > 4) return;
    } else if (type === 'extraBed') {
        if (newValue < 0 || newValue > 2) return;
    } else {
        if (newValue < 0) return;
    }

    wizardState[type] = newValue;
    document.getElementById(`${type}Count`).textContent = newValue;

    // Clear error
    document.getElementById('guestError').style.display = 'none';
}

function proceedToCalendar() {
    // Validate
    if (wizardState.adults < 1) {
        showError('guestError', 'Legalább 1 felnőttet adjon meg.');
        return;
    }

    if (wizardState.adults > 4 || wizardState.extraBed > 2) {
        showError('guestError', 'Maximum 4 felnőtt és 2 pótágy választható.');
        return;
    }

    wizardState.currentStep = 2;
    showCalendar();
}

// STEP 2: Calendar
function showCalendar() {
    const wizardContainer = document.getElementById('quoteWizard');
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    wizardContainer.innerHTML = `
        <div class="calendar-container" data-aos="fade-up">
            ${generateCalendarHTML(currentMonth, nextMonth)}

            <div class="calendar-summary">
                <div class="summary-item">
                    <span class="summary-label">Vendégek:</span>
                    <span class="summary-value" id="summaryGuests">${getTotalGuests()} fő</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Bejelentkezés:</span>
                    <span class="summary-value" id="summaryCheckIn">${wizardState.checkIn ? formatDate(wizardState.checkIn) : '—'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Kijelentkezés:</span>
                    <span class="summary-value" id="summaryCheckOut">${wizardState.checkOut ? formatDate(wizardState.checkOut) : '—'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Éjszakák száma:</span>
                    <span class="summary-value" id="summaryNights">${calculateNights()}</span>
                </div>
            </div>

            <div class="status-message" id="calendarStatus"></div>

            <div class="wizard-actions">
                <button type="button" class="btn-wizard-secondary" onclick="backToGuests()">Vissza</button>
                <button type="button" class="btn-wizard-primary" id="btnProceedToForm" onclick="proceedToForm()" disabled>Tovább</button>
            </div>
        </div>
    `;

    // Initialize calendar interactions
    initCalendarInteractions();
}

function generateCalendarHTML(month1, month2) {
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
        return `
            <div class="calendar-mobile">
                <div class="calendar-header">
                    <button type="button" class="calendar-nav" onclick="navigateMonth(-1)">‹</button>
                    <h3 class="calendar-month" id="currentMonthTitle">${formatMonthYear(month1)}</h3>
                    <button type="button" class="calendar-nav" onclick="navigateMonth(1)">›</button>
                </div>
                <div class="calendar-grid" id="calendarGrid">
                    ${generateMonthGrid(month1)}
                </div>
            </div>
        `;
    }

    return `
        <div class="calendar-duo">
            <div class="calendar-month-container">
                <h3 class="calendar-month">${formatMonthYear(month1)}</h3>
                <div class="calendar-grid">
                    ${generateMonthGrid(month1)}
                </div>
            </div>
            <div class="calendar-month-container">
                <h3 class="calendar-month">${formatMonthYear(month2)}</h3>
                <div class="calendar-grid">
                    ${generateMonthGrid(month2)}
                </div>
            </div>
        </div>
    `;
}

function generateMonthGrid(month) {
    const year = month.getFullYear();
    const monthNum = month.getMonth();
    const firstDay = new Date(year, monthNum, 1).getDay();
    const daysInMonth = new Date(year, monthNum + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let html = '<div class="calendar-weekdays">';
    const weekdays = ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'];
    weekdays.forEach(day => {
        html += `<div class="calendar-weekday">${day}</div>`;
    });
    html += '</div><div class="calendar-days">';

    // Empty cells for days before month starts (adjust for Monday start)
    const startDay = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < startDay; i++) {
        html += '<div class="calendar-day calendar-day-empty"></div>';
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, monthNum, day);
        const dateString = formatDateISO(date);
        const isPast = date < today;
        const isBlocked = BLOCKED_DATES.includes(dateString);
        const isCheckIn = wizardState.checkIn === dateString;
        const isCheckOut = wizardState.checkOut === dateString;
        const isInRange = isDateInRange(dateString);

        let classes = 'calendar-day';
        if (isPast || isBlocked) classes += ' calendar-day-disabled';
        if (isCheckIn) classes += ' calendar-day-checkin';
        if (isCheckOut) classes += ' calendar-day-checkout';
        if (isInRange) classes += ' calendar-day-in-range';

        html += `<div class="${classes}" data-date="${dateString}" onclick="selectDate('${dateString}')">${day}</div>`;
    }

    html += '</div>';
    return html;
}

function initCalendarInteractions() {
    updateCalendarStatus();
}

function selectDate(dateString) {
    const dayElement = document.querySelector(`[data-date="${dateString}"]`);
    if (dayElement && dayElement.classList.contains('calendar-day-disabled')) {
        return;
    }

    if (!wizardState.checkIn) {
        // Select check-in
        wizardState.checkIn = dateString;
        wizardState.checkOut = null;
    } else if (!wizardState.checkOut) {
        // Select check-out
        if (dateString > wizardState.checkIn) {
            wizardState.checkOut = dateString;
        } else {
            // Reset if selected earlier date
            wizardState.checkIn = dateString;
            wizardState.checkOut = null;
        }
    } else {
        // Reset and start over
        wizardState.checkIn = dateString;
        wizardState.checkOut = null;
    }

    // Refresh calendar
    showCalendar();
}

function isDateInRange(dateString) {
    if (!wizardState.checkIn || !wizardState.checkOut) return false;
    return dateString > wizardState.checkIn && dateString < wizardState.checkOut;
}

function updateCalendarStatus() {
    const statusEl = document.getElementById('calendarStatus');
    const btnProceed = document.getElementById('btnProceedToForm');

    if (!wizardState.checkIn) {
        statusEl.textContent = 'Válasszon bejelentkezési dátumot.';
        statusEl.style.display = 'block';
        btnProceed.disabled = true;
    } else if (!wizardState.checkOut) {
        statusEl.textContent = 'Válasszon távozási dátumot.';
        statusEl.style.display = 'block';
        btnProceed.disabled = true;
    } else if (calculateNights() < 1) {
        statusEl.textContent = 'A tartózkodás legalább 1 éjszaka.';
        statusEl.style.display = 'block';
        btnProceed.disabled = true;
    } else {
        statusEl.style.display = 'none';
        btnProceed.disabled = false;
    }
}

function backToGuests() {
    wizardState.currentStep = 1;
    showGuestSelector();
}

function proceedToForm() {
    if (!wizardState.checkIn || !wizardState.checkOut || calculateNights() < 1) {
        return;
    }
    wizardState.currentStep = 3;
    showContactForm();
}

// STEP 3: Contact Form
function showContactForm() {
    const wizardContainer = document.getElementById('quoteWizard');

    wizardContainer.innerHTML = `
        <div class="form-card" data-aos="fade-up">
            <div class="form-summary">
                <h3>Összefoglaló</h3>
                <p><strong>Vendégek:</strong> ${getTotalGuests()} fő (Felnőtt: ${wizardState.adults}, Pótágy: ${wizardState.extraBed}, Gyerek 3–4: ${wizardState.child3to4}, Gyerek 0–2: ${wizardState.child0to2})</p>
                <p><strong>Érkezés:</strong> ${formatDate(wizardState.checkIn)}</p>
                <p><strong>Távozás:</strong> ${formatDate(wizardState.checkOut)}</p>
                <p><strong>Éjszakák száma:</strong> ${calculateNights()} éj</p>
            </div>

            <form id="contactForm" onsubmit="submitQuote(event)">
                <div class="form-group">
                    <label>Vezetéknév <span class="required">*</span></label>
                    <input type="text" class="form-input" id="lastName" value="${wizardState.lastName}" required>
                </div>

                <div class="form-group">
                    <label>Keresztnév <span class="required">*</span></label>
                    <input type="text" class="form-input" id="firstName" value="${wizardState.firstName}" required>
                </div>

                <div class="form-group">
                    <label>Telefonszám <span class="required">*</span></label>
                    <input type="tel" class="form-input" id="phone" value="${wizardState.phone}" required>
                </div>

                <div class="form-group">
                    <label>E-mail <span class="required">*</span></label>
                    <input type="email" class="form-input" id="email" value="${wizardState.email}" required>
                </div>

                <div class="form-group">
                    <label>Üzenet</label>
                    <textarea class="form-input" id="message" rows="4">${wizardState.message}</textarea>
                </div>

                <div class="error-message" id="formError" style="display: none;"></div>

                <!-- Invisible reCAPTCHA container -->
                <div id="recaptcha-wizard"></div>

                <div class="wizard-actions">
                    <button type="button" class="btn-wizard-secondary" onclick="backToCalendar()">Vissza</button>
                    <button type="submit" class="btn-wizard-primary" id="wizardSubmitBtn">Elküld</button>
                </div>
            </form>
        </div>
    `;

    // Render reCAPTCHA widget after form is displayed
    setTimeout(function() {
        if (typeof grecaptcha !== 'undefined' && grecaptcha.render) {
            try {
                recaptchaWizardWidgetId = grecaptcha.render('recaptcha-wizard', {
                    'sitekey': '6LeLt-grAAAAAC5ac9164bwHkMmOYqw3buk90Xvm',
                    'size': 'invisible',
                    'badge': 'bottomright',
                    'callback': onWizardRecaptchaSuccess,
                    'error-callback': onWizardRecaptchaError
                });
                console.log('reCAPTCHA widget rendered for wizard');
            } catch(e) {
                console.error('Error rendering reCAPTCHA widget:', e);
            }
        }
    }, 100);
}

function backToCalendar() {
    // Save form data
    wizardState.lastName = document.getElementById('lastName')?.value || '';
    wizardState.firstName = document.getElementById('firstName')?.value || '';
    wizardState.phone = document.getElementById('phone')?.value || '';
    wizardState.email = document.getElementById('email')?.value || '';
    wizardState.message = document.getElementById('message')?.value || '';

    wizardState.currentStep = 2;
    showCalendar();
}

function submitQuote(event) {
    event.preventDefault();

    // Get form data
    wizardState.lastName = document.getElementById('lastName').value;
    wizardState.firstName = document.getElementById('firstName').value;
    wizardState.phone = document.getElementById('phone').value;
    wizardState.email = document.getElementById('email').value;
    wizardState.message = document.getElementById('message').value;

    // Validate
    if (!wizardState.lastName) {
        showError('formError', 'Kérjük, adja meg a vezetéknevet.');
        return;
    }
    if (!wizardState.firstName) {
        showError('formError', 'Kérjük, adja meg a keresztnevet.');
        return;
    }
    if (!wizardState.phone) {
        showError('formError', 'Kérjük, adjon meg érvényes telefonszámot.');
        return;
    }
    if (!wizardState.email || !isValidEmail(wizardState.email)) {
        showError('formError', 'Kérjük, adjon meg érvényes e-mail címet.');
        return;
    }

    // Disable submit button
    const submitBtn = document.getElementById('wizardSubmitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Küldés...';
    }

    // Execute reCAPTCHA v2 Invisible
    try {
        grecaptcha.execute(recaptchaWizardWidgetId);
    } catch(error) {
        console.error('reCAPTCHA execute error:', error);
        showError('formError', 'Hiba történt a biztonsági ellenőrzésnél. Kérjük, töltse újra az oldalt.');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Elküld';
        }
    }
}

// Callback when reCAPTCHA is successful
function onWizardRecaptchaSuccess(token) {
    // Prepare data
    const quoteData = {
        adults: wizardState.adults,
        extraBed: wizardState.extraBed,
        child3to4: wizardState.child3to4,
        child0to2: wizardState.child0to2,
        checkIn: wizardState.checkIn,
        checkOut: wizardState.checkOut,
        nights: calculateNights(),
        lastName: wizardState.lastName,
        firstName: wizardState.firstName,
        phone: wizardState.phone,
        email: wizardState.email,
        message: wizardState.message,
        'g-recaptcha-response': token
    };

    // Send to server
    fetch('/api/quote-request.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(quoteData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccessMessage();
        } else {
            showErrorMessage();
        }
        // Reset reCAPTCHA
        if (typeof grecaptcha !== 'undefined' && recaptchaWizardWidgetId !== undefined) {
            grecaptcha.reset(recaptchaWizardWidgetId);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showErrorMessage();
        // Reset reCAPTCHA
        if (typeof grecaptcha !== 'undefined' && recaptchaWizardWidgetId !== undefined) {
            grecaptcha.reset(recaptchaWizardWidgetId);
        }
    });
}

// Callback when reCAPTCHA encounters an error
function onWizardRecaptchaError() {
    console.error('reCAPTCHA widget error');
    showError('formError', 'Hiba történt a biztonsági ellenőrzésnél. Kérjük, próbálja újra.');
    const submitBtn = document.getElementById('wizardSubmitBtn');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Elküld';
    }
}

// STEP 4: Result
function showSuccessMessage() {
    const wizardContainer = document.getElementById('quoteWizard');

    wizardContainer.innerHTML = `
        <div class="result-card success" data-aos="fade-up">
            <div class="result-icon">✓</div>
            <h3>Köszönjük az érdeklődést!</h3>
            <p>Az ajánlat összefoglalóját elküldtük e-mailben.</p>
            <p class="result-note">Hamarosan felvesszük Önnel a kapcsolatot a részletekkel és az árral.</p>
            <button type="button" class="btn-wizard-primary" onclick="resetWizard()">Új ajánlatkérés</button>
        </div>
    `;
}

function showErrorMessage() {
    const wizardContainer = document.getElementById('quoteWizard');

    wizardContainer.innerHTML = `
        <div class="result-card error" data-aos="fade-up">
            <div class="result-icon">✕</div>
            <h3>Sajnáljuk</h3>
            <p>Az üzenetet most nem sikerült elküldeni.</p>
            <p class="result-note">Kérjük, próbálja meg később, vagy hívjon minket: <a href="tel:+36703272146">+36 70 327 2146</a></p>
            <button type="button" class="btn-wizard-secondary" onclick="backToContactForm()">Vissza</button>
        </div>
    `;
}

function backToContactForm() {
    wizardState.currentStep = 3;
    showContactForm();
}

function resetWizard() {
    wizardState = {
        currentStep: 1,
        adults: 2,
        extraBed: 0,
        child3to4: 0,
        child0to2: 0,
        checkIn: null,
        checkOut: null,
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        message: ''
    };
    initializeWizard();
}

function closeWizard() {
    const wizardContainer = document.getElementById('quoteWizard');
    wizardContainer.innerHTML = `
        <div class="wizard-closed" data-aos="fade-up">
            <button type="button" class="btn-wizard-primary btn-large" onclick="initializeWizard()">Ajánlatkérés</button>
        </div>
    `;
}

// Utility functions
function getTotalGuests() {
    return wizardState.adults + wizardState.extraBed + wizardState.child3to4 + wizardState.child0to2;
}

function calculateNights() {
    if (!wizardState.checkIn || !wizardState.checkOut) return 0;
    const checkIn = new Date(wizardState.checkIn);
    const checkOut = new Date(wizardState.checkOut);
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function formatDate(dateString) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const months = ['január', 'február', 'március', 'április', 'május', 'június',
                    'július', 'augusztus', 'szeptember', 'október', 'november', 'december'];
    return `${date.getFullYear()}. ${months[date.getMonth()]} ${date.getDate()}.`;
}

function formatMonthYear(date) {
    const months = ['január', 'február', 'március', 'április', 'május', 'június',
                    'július', 'augusztus', 'szeptember', 'október', 'november', 'december'];
    return `${date.getFullYear()}. ${months[date.getMonth()]}`;
}

function formatDateISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Mobile calendar navigation
let currentMobileMonth = new Date();

function navigateMonth(direction) {
    currentMobileMonth.setMonth(currentMobileMonth.getMonth() + direction);

    const monthTitle = document.getElementById('currentMonthTitle');
    const calendarGrid = document.getElementById('calendarGrid');

    if (monthTitle && calendarGrid) {
        monthTitle.textContent = formatMonthYear(currentMobileMonth);
        calendarGrid.innerHTML = generateMonthGrid(currentMobileMonth);
    }
}

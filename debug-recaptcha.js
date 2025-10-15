/**
 * reCAPTCHA Debug Tool for Contact Form
 *
 * HASZNÁLAT:
 * 1. Nyisd meg: https://dozsa-apartman-szeged.hu/contact.html
 * 2. Nyisd meg a böngésző konzolt (F12)
 * 3. Másold be ezt a teljes fájlt és nyomj Enter-t
 * 4. Másold ki az eredményt és küldd el nekem
 */

console.log('=== reCAPTCHA DEBUG TOOL ===\n');

// Check 1: Is grecaptcha object loaded?
console.log('1. grecaptcha object:', typeof grecaptcha !== 'undefined' ? '✅ LOADED' : '❌ NOT LOADED');
if (typeof grecaptcha !== 'undefined') {
    console.log('   - grecaptcha.render:', typeof grecaptcha.render);
    console.log('   - grecaptcha.execute:', typeof grecaptcha.execute);
    console.log('   - grecaptcha.ready:', typeof grecaptcha.ready);
    console.log('   - grecaptcha.reset:', typeof grecaptcha.reset);
}

// Check 2: Is onRecaptchaLoad function defined?
console.log('\n2. onRecaptchaLoad function:', typeof onRecaptchaLoad !== 'undefined' ? '✅ DEFINED' : '❌ NOT DEFINED');

// Check 3: Is recaptchaWidgetId set?
console.log('\n3. recaptchaWidgetId:', typeof recaptchaWidgetId !== 'undefined' ? recaptchaWidgetId : '❌ NOT SET');

// Check 4: Check if reCAPTCHA container exists
const container = document.getElementById('recaptcha-contact');
console.log('\n4. reCAPTCHA container (#recaptcha-contact):', container ? '✅ EXISTS' : '❌ NOT FOUND');
if (container) {
    console.log('   - Has children:', container.children.length > 0 ? '✅ YES (' + container.children.length + ')' : '❌ NO');
    console.log('   - innerHTML length:', container.innerHTML.length);
}

// Check 5: Check if reCAPTCHA badge is visible
const badge = document.querySelector('.grecaptcha-badge');
console.log('\n5. reCAPTCHA badge (.grecaptcha-badge):', badge ? '✅ FOUND' : '❌ NOT FOUND');
if (badge) {
    console.log('   - Visible:', badge.style.display !== 'none' ? '✅ YES' : '❌ HIDDEN');
}

// Check 6: Check if script is loaded
const scripts = Array.from(document.getElementsByTagName('script'));
const recaptchaScript = scripts.find(s => s.src && s.src.includes('recaptcha/api.js'));
console.log('\n6. reCAPTCHA API script:', recaptchaScript ? '✅ LOADED' : '❌ NOT LOADED');
if (recaptchaScript) {
    console.log('   - Source:', recaptchaScript.src);
    console.log('   - Async:', recaptchaScript.async);
    console.log('   - Defer:', recaptchaScript.defer);
}

// Check 7: Check form
const form = document.getElementById('contactForm');
console.log('\n7. Contact form (#contactForm):', form ? '✅ EXISTS' : '❌ NOT FOUND');

// Check 8: Try to manually trigger reCAPTCHA
console.log('\n8. Manual reCAPTCHA test:');
if (typeof grecaptcha !== 'undefined' && grecaptcha.ready) {
    try {
        grecaptcha.ready(function() {
            console.log('   - grecaptcha.ready callback: ✅ EXECUTED');

            // Check if widget was rendered
            if (typeof recaptchaWidgetId !== 'undefined') {
                console.log('   - Widget ID exists:', recaptchaWidgetId);
                try {
                    const response = grecaptcha.getResponse(recaptchaWidgetId);
                    console.log('   - Current token:', response ? '✅ HAS TOKEN (length: ' + response.length + ')' : '❌ NO TOKEN');
                } catch(e) {
                    console.log('   - getResponse error:', e.message);
                }
            } else {
                console.log('   - Widget ID: ❌ NOT SET - Widget was never rendered!');
            }
        });
    } catch(e) {
        console.log('   - Error:', e.message);
    }
} else {
    console.log('   - ❌ Cannot test: grecaptcha not ready');
}

// Check 9: Console errors
console.log('\n9. JavaScript errors check:');
console.log('   - Open the Console tab and look for red errors');
console.log('   - Common errors: "Invalid site key", "ReCAPTCHA placeholder element must be empty"');

console.log('\n=== END DEBUG ===');
console.log('\n📋 KÖVETKEZŐ LÉPÉS:');
console.log('Válaszd ki a TELJES output-ot (1. sortól az utolsóig) és küld el nekem!\n');

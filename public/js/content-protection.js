(function() {
    'use strict';
    
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    }, false);
    
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    }, false);
    
    document.addEventListener('copy', function(e) {
        e.preventDefault();
        return false;
    }, false);
    
    document.addEventListener('cut', function(e) {
        e.preventDefault();
        return false;
    }, false);
    
    document.addEventListener('paste', function(e) {
        e.preventDefault();
        return false;
    }, false);
    
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            return false;
        }
        
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            return false;
        }
        
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            return false;
        }
        
        if (e.ctrlKey && e.shiftKey && e.key === 'J') {
            e.preventDefault();
            return false;
        }
        
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            return false;
        }
        
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        
        if (e.ctrlKey && e.shiftKey && e.key === 'K') {
            e.preventDefault();
            return false;
        }
    }, false);
    
    const style = document.createElement('style');
    style.textContent = `
        * {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
            -webkit-touch-callout: none !important;
        }
        
        input, textarea {
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
            user-select: text !important;
        }
        
        button, a, [role="button"], .btn, .btn-login, .btn-register, .submit-btn, 
        input[type="submit"], input[type="button"], .navbar-toggler, .navbar-back-btn,
        .account-btn, .menu-item, .nav-link {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1) !important;
            pointer-events: auto !important;
            cursor: pointer !important;
            touch-action: manipulation !important;
        }
    `;
    document.head.appendChild(style);
    
    let devtools = {open: false, orientation: null};
    const threshold = 160;
    
    setInterval(function() {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
            }
        } else {
            if (devtools.open) {
                devtools.open = false;
            }
        }
    }, 500);
    
    console.clear();
    console.log('%cDUR!', 'color: red; font-size: 50px; font-weight: bold;');
    console.log('%cBu bir tarayıcı özelliğidir. Eğer birisi size buraya bir şey yapıştırmanızı söylediyse, bu bir dolandırıcılık girişimidir!', 'color: red; font-size: 16px;');
    
})();


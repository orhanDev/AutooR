// Content Protection Script
// Not: Bu korumalar tam olarak işe yaramaz, ancak çoğu kullanıcıyı caydırır.

(function() {
    'use strict';
    
    // Sağ tıklamayı engelle
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    }, false);
    
    // Text seçimini engelle
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    }, false);
    
    // Copy, Cut, Paste'yi engelle
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
    
    // Keyboard kısayollarını engelle
    document.addEventListener('keydown', function(e) {
        // Ctrl+U (View Source)
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            return false;
        }
        
        // Ctrl+S (Save Page)
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            return false;
        }
        
        // Ctrl+Shift+I (Developer Tools)
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            return false;
        }
        
        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.key === 'J') {
            e.preventDefault();
            return false;
        }
        
        // Ctrl+Shift+C (Inspect Element)
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            return false;
        }
        
        // F12 (Developer Tools)
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        
        // Ctrl+Shift+K (Firefox Console)
        if (e.ctrlKey && e.shiftKey && e.key === 'K') {
            e.preventDefault();
            return false;
        }
    }, false);
    
    // CSS ile text seçimini engelle (butonlar ve form elemanları hariç)
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
        
        /* Butonlar ve tıklanabilir elementler için pointer-events ve user-select'i aktif tut */
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
    
    // Developer Tools açılmaya çalışıldığında uyarı
    let devtools = {open: false, orientation: null};
    const threshold = 160;
    
    setInterval(function() {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                // Developer tools açıldığında sayfayı yenile veya uyarı göster
                // window.location.reload();
            }
        } else {
            if (devtools.open) {
                devtools.open = false;
            }
        }
    }, 500);
    
    // Console'u boşalt
    console.clear();
    console.log('%cDUR!', 'color: red; font-size: 50px; font-weight: bold;');
    console.log('%cBu bir tarayıcı özelliğidir. Eğer birisi size buraya bir şey yapıştırmanızı söylediyse, bu bir dolandırıcılık girişimidir!', 'color: red; font-size: 16px;');
    
})();


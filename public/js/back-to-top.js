
(function() {

    if (document.getElementById('back-to-top')) {
        return;
    }

    const backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'back-to-top';
    backToTopBtn.className = 'back-to-top-btn';
    backToTopBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
    backToTopBtn.setAttribute('aria-label', 'Nach oben scrollen');

    const style = document.createElement('style');
    style.textContent = `
        .back-to-top-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: rgba(177, 0, 0, 0.9);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            color: #ffffff;
            font-size: 1.2rem;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 99999;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .back-to-top-btn:hover {
            background: rgba(255, 255, 255, 1);
            transform: translateY(-5px) scale(1.05);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
            border-color: rgba(255, 255, 255, 0.3);
        }
        
        .back-to-top-btn:active {
            transform: translateY(-2px) scale(1.02);
        }
        
        .back-to-top-btn.show {
            opacity: 1 !important;
            visibility: visible !important;
        }

        @media (max-width: 1199px) {
            .back-to-top-btn {
                width: 60px !important;
                height: 60px !important;
                font-size: 1.5rem !important;
                bottom: 15px !important;
                right: 15px !important;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(backToTopBtn);

    function updateBackToTopButton() {
        if (window.pageYOffset > 20 || document.documentElement.scrollTop > 20) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }

    updateBackToTopButton();

    window.addEventListener('scroll', updateBackToTopButton);
    document.addEventListener('touchmove', updateBackToTopButton);
    document.addEventListener('scroll', updateBackToTopButton);

    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
})();

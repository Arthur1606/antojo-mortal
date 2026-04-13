document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // Header Scroll Effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Reveal Animations on Scroll
    const observerOptions = {
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal, .reveal-delay, .reveal-delay-2');
    revealElements.forEach(el => observer.observe(el));

    // Smooth Scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Product Modal & Cart Logic
    const modal = document.getElementById('productModal');
    const closeBtn = document.getElementById('closeModal');
    const modalImg = document.getElementById('modalImg');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const modalPrice = document.getElementById('modalPrice');
    const addToCartBtn = document.getElementById('addToCart');
    
    // Quantity Selector Elements
    const qtyMinus = modal.querySelector('.minus');
    const qtyPlus = modal.querySelector('.plus');
    const qtyValue = modal.querySelector('.qty-value');

    // Order Bar Elements
    const orderBar = document.getElementById('orderBar');
    const orderCount = document.getElementById('orderCount');
    const sendOrderBtn = document.getElementById('sendOrderWA');

    let currentProduct = null;
    let cart = {}; // Store productTitle: quantity

    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.getAttribute('data-title');
            const price = card.getAttribute('data-price');
            const desc = card.getAttribute('data-desc');
            const img = card.getAttribute('data-image');

            currentProduct = title;
            
            // Populate Modal
            modalImg.src = img;
            modalImg.alt = title;
            modalTitle.textContent = title;
            modalDesc.textContent = desc;
            modalPrice.textContent = price;
            
            // Reset quantity display to current cart value or 0
            qtyValue.textContent = cart[title] || 0;

            // Show Modal
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('active'), 10);
        });
    });

    // Quantity Adjustment
    qtyPlus.addEventListener('click', () => {
        let val = parseInt(qtyValue.textContent);
        qtyValue.textContent = val + 1;
    });

    qtyMinus.addEventListener('click', () => {
        let val = parseInt(qtyValue.textContent);
        if (val > 0) qtyValue.textContent = val - 1;
    });

    // Add to Cart Logic
    addToCartBtn.addEventListener('click', () => {
        const qty = parseInt(qtyValue.textContent);
        if (qty > 0) {
            cart[currentProduct] = qty;
        } else {
            delete cart[currentProduct];
        }
        updateOrderBar();
        closeModal();
    });

    function updateOrderBar() {
        const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
        if (totalItems > 0) {
            orderCount.textContent = totalItems;
            orderBar.classList.add('active');
            if (sendOrderBtn) sendOrderBtn.classList.add('pulse-active');
        } else {
            orderBar.classList.remove('active');
            if (sendOrderBtn) sendOrderBtn.classList.remove('pulse-active');
        }
    }

    // Send Order to WhatsApp
    sendOrderBtn.addEventListener('click', () => {
        let message = "¡Hola! Me gustaría hacer un pedido de Antojo Mortal: \n\n";
        for (const [product, qty] of Object.entries(cart)) {
            message += `• ${qty}x ${product}\n`;
        }
        message += "\n¿Me confirman disponibilidad y el valor total del envío? 🍰";
        
        const encodedMsg = encodeURIComponent(message);
        window.open(`https://wa.me/573001907982?text=${encodedMsg}`, '_blank');
    });

    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 400);
    };

    closeBtn.addEventListener('click', closeModal);

    // FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            item.classList.toggle('faq-open');
        });
    });

    // FAQ Floating Widget Logic
    const originalFaqGrid = document.querySelector('.faq-grid');
    const faqWidgetBody = document.getElementById('faqWidgetBody');
    const faqWidgetBox = document.getElementById('faqWidgetBox');
    const openFaqWidgetBtn = document.getElementById('openFaqWidget');
    const closeFaqWidgetBtn = document.getElementById('closeFaqWidget');

    if (originalFaqGrid && faqWidgetBody) {
        // Clone the FAQ grid
        const clonedGrid = originalFaqGrid.cloneNode(true);
        faqWidgetBody.appendChild(clonedGrid);
        
        // Re-attach accordion logic to the cloned items since cloneNode doesn't clone event listeners
        const widgetFaqItems = clonedGrid.querySelectorAll('.faq-item');
        widgetFaqItems.forEach(item => {
            // Remove reveal classes so they don't stay hidden in the fixed popup
            item.classList.remove('reveal', 'reveal-delay', 'reveal-delay-2');
            item.style.opacity = '1';
            item.style.transform = 'none';

            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                // Ensure other items close (optional style preference, but let's keep it simple toggle)
                item.classList.toggle('faq-open');
            });
        });
    }

    // Toggle popup visibility
    openFaqWidgetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        faqWidgetBox.classList.toggle('active');
    });

    closeFaqWidgetBtn.addEventListener('click', () => {
        faqWidgetBox.classList.remove('active');
    });

    // Close on outside click or Esc
    window.addEventListener('click', (e) => { 
        if (e.target === modal) closeModal(); 
        if (!faqWidgetBox.contains(e.target) && e.target !== openFaqWidgetBtn && !openFaqWidgetBtn.contains(e.target)) {
            faqWidgetBox.classList.remove('active');
        }
    });

    window.addEventListener('keydown', (e) => { 
        if (e.key === 'Escape') {
            if (modal.classList.contains('active')) closeModal(); 
            faqWidgetBox.classList.remove('active');
        }
    });

    // Floating Hearts Generation
    function initBackgroundHearts() {
        const container = document.getElementById('hearts-container');
        if (!container) return;

        const heartSymbols = ['❤', '❣', '♥'];
        const heartCount = 50;

        for (let i = 0; i < heartCount; i++) {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
            
            const left = Math.random() * 100;
            const size = 0.5 + Math.random() * 1.5;
            const duration = 12 + Math.random() * 8;
            const delay = Math.random() * 20;
            const opacity = 0.05 + Math.random() * 0.15;

            heart.style.left = `${left}%`;
            heart.style.fontSize = `${size}rem`;
            heart.style.animationDuration = `${duration}s`;
            heart.style.animationDelay = `${delay}s`;
            heart.style.opacity = opacity.toString();

            container.appendChild(heart);
        }
    }

    initBackgroundHearts();
});
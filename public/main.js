document.addEventListener('DOMContentLoaded', () => {
    // ══════════════════════════════════════════
    // 0. DOM CACHE
    // ══════════════════════════════════════════
    const body = document.body;
    const header = document.querySelector('header');
    const heroTitle = document.querySelector('.hero h1');
    const modal = document.getElementById('productModal');
    const orderBar = document.getElementById('orderBar');
    const orderCount = document.getElementById('orderCount');
    const sendOrderBtn = document.getElementById('sendOrderWA');
    const faqWidgetBox = document.getElementById('faqWidgetBox');
    const openFaqWidgetBtn = document.getElementById('openFaqWidget');
    const heartsContainer = document.getElementById('hearts-container');

    // ══════════════════════════════════════════
    // 1. PAGE LOAD CASCADE
    // ══════════════════════════════════════════
    if (heroTitle) {
        const originalHTML = heroTitle.innerHTML;
        const parts = originalHTML.split(/(<[^>]+>)/g);
        let wordIndex = 0;
        heroTitle.innerHTML = parts.map(part => {
            if (part.startsWith('<')) return part;
            return part.split(/(\s+)/g).map(word => {
                if (!word.trim()) return word;
                return `<span class="stagger-word" style="transition-delay:${wordIndex++ * 0.08}s">${word}</span>`;
            }).join('');
        }).join('');
    }

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            body.classList.remove('page-loading');
            setTimeout(() => {
                document.querySelectorAll('.stagger-word').forEach(w => w.classList.add('visible'));
            }, 300);
        });
    });

    // ══════════════════════════════════════════
    // 2. NAVIGATION & HEADER
    // ══════════════════════════════════════════
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') navLinks.classList.remove('active');
        });
    }

    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // ══════════════════════════════════════════
    // 3. SCROLL REVEALS (Intersection Observer)
    // ══════════════════════════════════════════
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target); // Optimize: stop observing once revealed
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal, .reveal-delay, .reveal-delay-2, .chef-container').forEach(el => revealObserver.observe(el));

    // ══════════════════════════════════════════
    // 4. BUTTON FEEDBACK (Delegation or Global)
    // ══════════════════════════════════════════
    body.addEventListener('mousedown', e => {
        const btn = e.target.closest('.btn');
        if (btn) btn.classList.add('squeeze');
    });
    const releaseSqueeze = e => {
        const btn = e.target.closest('.btn');
        if (btn) setTimeout(() => btn.classList.remove('squeeze'), 100);
    };
    body.addEventListener('mouseup', releaseSqueeze);
    body.addEventListener('mouseleave', releaseSqueeze);
    body.addEventListener('touchstart', e => {
        const btn = e.target.closest('.btn');
        if (btn) btn.classList.add('squeeze');
    }, { passive: true });
    body.addEventListener('touchend', releaseSqueeze);

    // ══════════════════════════════════════════
    // 5. PRODUCT MODAL & CART
    // ══════════════════════════════════════════
    const modalImg = document.getElementById('modalImg');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const modalPrice = document.getElementById('modalPrice');
    const addToCartBtn = document.getElementById('addToCart');
    const qtyValue = modal.querySelector('.qty-value');

    let currentProduct = null;
    let cart = JSON.parse(localStorage.getItem('antojo_cart')) || {};

    // Event Delegation for Product Cards
    document.querySelector('.products-grid').addEventListener('click', e => {
        const card = e.target.closest('.product-card');
        if (!card) return;

        const { title, price, desc, image } = card.dataset;
        currentProduct = title;
        
        modalImg.src = image;
        modalImg.alt = title;
        modalTitle.textContent = title;
        modalDesc.textContent = desc;
        modalPrice.textContent = price;
        qtyValue.textContent = cart[title] || 0;

        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
    });

    modal.addEventListener('click', e => {
        if (e.target.closest('.minus')) {
            let val = parseInt(qtyValue.textContent);
            if (val > 0) qtyValue.textContent = val - 1;
        } else if (e.target.closest('.plus')) {
            qtyValue.textContent = parseInt(qtyValue.textContent) + 1;
        } else if (e.target.id === 'closeModal' || e.target === modal) {
            closeModal();
        }
    });

    // Cart Success Overlay
    const successOverlay = document.createElement('span');
    successOverlay.className = 'cart-success-overlay';
    successOverlay.innerHTML = '<i class="fas fa-check"></i>';
    addToCartBtn.appendChild(successOverlay);

    addToCartBtn.addEventListener('click', () => {
        const qty = parseInt(qtyValue.textContent);
        if (qty > 0) cart[currentProduct] = qty;
        else delete cart[currentProduct];

        successOverlay.classList.add('show');
        setTimeout(() => updateOrderBar(true), 200);
        setTimeout(() => {
            successOverlay.classList.remove('show');
            closeModal();
        }, 700);
    });

    function updateOrderBar(shouldBounce) {
        localStorage.setItem('antojo_cart', JSON.stringify(cart));
        const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
        
        if (totalItems > 0) {
            const prev = parseInt(orderCount.textContent);
            if (prev !== totalItems) {
                orderCount.classList.add('counting');
                orderCount.textContent = totalItems;
                orderCount.addEventListener('animationend', () => orderCount.classList.remove('counting'), { once: true });
            }
            orderBar.classList.add('active');
            if (sendOrderBtn) sendOrderBtn.classList.add('pulse-active');

            if (shouldBounce) {
                orderBar.classList.remove('bounce');
                void orderBar.offsetWidth;
                orderBar.classList.add('bounce');
            }
        } else {
            orderCount.textContent = 0;
            orderBar.classList.remove('active');
            if (sendOrderBtn) sendOrderBtn.classList.remove('pulse-active');
        }
    }

    sendOrderBtn.addEventListener('click', () => {
        let message = "¡Hola! Me gustaría hacer un pedido de Antojo Mortal: \n\n";
        for (const [product, qty] of Object.entries(cart)) message += `• ${qty}x ${product}\n`;
        message += "\n¿Me confirman disponibilidad y el valor total del envío? 🍰";
        window.open(`https://wa.me/573001907982?text=${encodeURIComponent(message)}`, '_blank');
    });

    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 400);
    };

    updateOrderBar(false);

    // ══════════════════════════════════════════
    // 6. FAQ & WIDGET
    // ══════════════════════════════════════════
    const faqGrid = document.querySelector('.faq-grid');
    const faqWidgetBody = document.getElementById('faqWidgetBody');
    
    // Toggle main FAQ
    faqGrid.addEventListener('click', e => {
        const item = e.target.closest('.faq-item');
        if (item) item.classList.toggle('faq-open');
    });

    // Clone and Setup Widget
    if (faqGrid && faqWidgetBody) {
        const clonedGrid = faqGrid.cloneNode(true);
        clonedGrid.querySelectorAll('.reveal, .reveal-delay, .reveal-delay-2').forEach(el => {
            el.classList.remove('reveal', 'reveal-delay', 'reveal-delay-2');
            el.style.cssText = 'opacity:1; transform:none;';
        });
        faqWidgetBody.appendChild(clonedGrid);
        clonedGrid.addEventListener('click', e => {
            const item = e.target.closest('.faq-item');
            if (item) item.classList.toggle('faq-open');
        });
    }

    openFaqWidgetBtn.addEventListener('click', e => {
        e.stopPropagation();
        faqWidgetBox.classList.toggle('active');
    });

    document.getElementById('closeFaqWidget').addEventListener('click', () => faqWidgetBox.classList.remove('active'));

    // Global Close
    window.addEventListener('click', e => {
        if (!faqWidgetBox.contains(e.target) && e.target !== openFaqWidgetBtn && !openFaqWidgetBtn.contains(e.target)) {
            faqWidgetBox.classList.remove('active');
        }
    });

    window.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeModal();
            faqWidgetBox.classList.remove('active');
        }
    });

    // ══════════════════════════════════════════
    // 7. FLOATING HEARTS (Performance Optimized)
    // ══════════════════════════════════════════
    function initBackgroundHearts() {
        if (!heartsContainer) return;
        const isMobile = window.innerWidth < 768;
        const heartSymbols = ['❤', '❣', '♥'];
        const heartCount = isMobile ? 25 : 50; // Half on mobile

        const fragment = document.createDocumentFragment();
        for (let i = 0; i < heartCount; i++) {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
            
            heart.style.left = `${Math.random() * 100}%`;
            heart.style.fontSize = `${0.5 + Math.random() * 1.5}rem`;
            heart.style.animationDuration = `${12 + Math.random() * 8}s`;
            heart.style.animationDelay = `${Math.random() * 20}s`;
            heart.style.opacity = (0.05 + Math.random() * 0.15).toString();

            fragment.appendChild(heart);
        }
        heartsContainer.appendChild(fragment);
    }
    initBackgroundHearts();
});
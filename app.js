/* =============================================
   MR CONFECCIONES — E-Commerce Logic (Official)
   ============================================= */

/**
 * 🎨 DESIGNER CONFIGURATION
 * Edit this section to change the hero banners and product images
 */
// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = 'https://mrcroztqbiwytkcbbfsq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_k8IlAa0At4sErxRQ6FUhdQ_hrvM0pzY';
let supabase = null;

if (SUPABASE_URL !== 'https://your-project-url.supabase.co') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const DESIGNER_CONFIG = {
    heroBanners: [
        {
            title: "MANTELERÍA INSTITUCIONAL",
            subtitle: "Elegancia y durabilidad para eventos y hogar.",
            btnText: "Ver Catálogo",
            image: "assets/manteleria.png",
            tag: "Calidad Premium"
        },
        {
            title: "TURBANTES DE MICROFIBRA",
            subtitle: "Secado ultra rápido que cuida tu cabello.",
            btnText: "Comprar Ahora",
            image: "assets/turbante.png",
            tag: "Secado Rápido"
        },
        {
            title: "CONFECCIÓN PERSONALIZADA",
            subtitle: "Trabajos a medida con las mejores telas del mercado.",
            btnText: "Cotizar Ahora",
            image: "assets/hero-poncho.png",
            tag: "Hecho a Mano"
        }
    ]
};

// --- Product Data ---
const PRODUCTS = [
    {
        id: 1,
        name: "Mantel Antimanchas Premium",
        description: "Mantelería de alta gama con tratamiento antimanchas. Durabilidad y estilo para tu mesa institucional o del hogar.",
        price: 15990,
        category: "Mantelería",
        badge: "DESTACADO",
        badgeClass: "bg-primary",
        image: "assets/manteleria.png"
    },
    {
        id: 2,
        name: "Turbante Microfibra Pro",
        description: "Diseñado para un secado de cabello ultra-rápido sin daño. Ligero, absorbente y con ajuste perfecto.",
        price: 7500,
        category: "Turbantes",
        badge: "NUEVO",
        badgeClass: "bg-earth-sand",
        image: "assets/turbante.png"
    },
    {
        id: 3,
        name: "Telas Naranja Premium",
        description: "Telas de alta calidad para confecciones especiales. Suavidad y resistencia garantizada.",
        price: 9990,
        category: "Telas",
        badge: "BEST SELLER",
        badgeClass: "bg-earth-moss",
        image: "assets/telas-naranja.png"
    },
    {
        id: 4,
        name: "Poncho Microfibra",
        description: "Poncho ideal para playa o piscina. Secado rápido y máxima comodidad.",
        price: 14500,
        category: "Protección",
        badge: "PROMO",
        badgeClass: "bg-primary",
        image: "assets/hero-poncho.png"
    }
];

// --- State Management ---
let cart = JSON.parse(localStorage.getItem('mr_confecciones_cart_real')) || [];

// --- DOM Elements ---
const productsGrid = document.getElementById('products-grid');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const cartFooter = document.getElementById('cart-footer');
const openCartBtn = document.getElementById('open-cart');
const closeCartBtn = document.getElementById('close-cart');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toast-msg');
const contactForm = document.getElementById('contact-form');

// --- Functions ---

// --- Carousel State ---
let currentSlide = 0;
const slidesContainer = document.getElementById('carousel-slides');
const dotsContainer = document.getElementById('carousel-dots');
const prevBtn = document.getElementById('prev-slide');
const nextBtn = document.getElementById('next-slide');

function init() {
    renderCarousel();
    renderProducts();
    updateCartUI();
    setupEventListeners();
    startCarouselAutoPlay();
}

function renderCarousel() {
    if (!slidesContainer) return;

    // Render slides
    slidesContainer.innerHTML = DESIGNER_CONFIG.heroBanners.map(banner => `
        <div class="min-w-full h-full relative flex items-center px-6 lg:px-20 py-20 overflow-hidden">
            <!-- Background Image -->
            <div class="absolute inset-0 z-0">
                <img src="${banner.image}" alt="" class="w-full h-full object-cover opacity-60 scale-105" 
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/1920x1080?text=${banner.title.replace(/ /g, '+')}'">
                <div class="absolute inset-0 bg-background-dark/40"></div>
            </div>
            
            <div class="max-w-7xl mx-auto w-full relative z-20">
                <div class="flex flex-col gap-8 max-w-4xl">
                    <div class="inline-flex items-center gap-2 bg-primary/20 px-5 py-2 rounded-full w-fit border border-primary/30">
                        <span class="material-symbols-outlined text-primary text-sm">verified</span>
                        <span class="text-xs font-bold uppercase tracking-[0.2em] text-primary">${banner.tag}</span>
                    </div>
                    <h1 class="text-6xl lg:text-8xl font-extrabold leading-[0.9] tracking-tighter text-white">
                        ${banner.title.split(' ').slice(0, -1).join(' ')} <span class="text-earth-sand">${banner.title.split(' ').pop()}</span>
                    </h1>
                    <p class="text-lg lg:text-xl text-slate-300 max-w-lg leading-relaxed font-medium">
                        ${banner.subtitle}
                    </p>
                    <div class="flex flex-col sm:flex-row gap-5 mt-4">
                        <a href="#shop" class="btn-gradient hover:scale-105 text-white px-12 py-5 rounded-2xl font-black text-lg transition-all shadow-2xl flex items-center justify-center gap-3 group">
                            ${banner.btnText}
                            <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">east</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Render dots
    dotsContainer.innerHTML = DESIGNER_CONFIG.heroBanners.map((_, i) => `
        <button onclick="goToSlide(${i})" class="w-3 h-3 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-primary w-10' : 'bg-white/20 hover:bg-white/40'}"></button>
    `).join('');
}

window.goToSlide = function (index) {
    currentSlide = index;
    updateCarouselPosition();
};

function nextSlide() {
    currentSlide = (currentSlide + 1) % DESIGNER_CONFIG.heroBanners.length;
    updateCarouselPosition();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + DESIGNER_CONFIG.heroBanners.length) % DESIGNER_CONFIG.heroBanners.length;
    updateCarouselPosition();
}

function updateCarouselPosition() {
    if (!slidesContainer) return;
    slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Update dots
    const dots = dotsContainer.querySelectorAll('button');
    dots.forEach((dot, i) => {
        if (i === currentSlide) {
            dot.classList.add('bg-primary', 'w-10');
            dot.classList.remove('bg-white/20', 'w-3');
        } else {
            dot.classList.remove('bg-primary', 'w-10');
            dot.classList.add('bg-white/20', 'w-3');
        }
    });
}

let carouselAutoPlay;
function startCarouselAutoPlay() {
    clearInterval(carouselAutoPlay);
    carouselAutoPlay = setInterval(nextSlide, 6000);
}

function renderProducts() {
    productsGrid.innerHTML = PRODUCTS.map(product => `
        <div class="glass-card p-6 rounded-[2rem] group flex flex-col h-full hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10">
            <div class="relative overflow-hidden rounded-2xl mb-8 aspect-[4/5] bg-[#050b18] border border-white/5">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
                     onerror="this.src='https://via.placeholder.com/400x500?text=${product.name.replace(/ /g, '+')}'">
                ${product.badge ? `<span class="absolute top-4 left-4 ${product.badgeClass} text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-xl uppercase tracking-widest">${product.badge}</span>` : ''}
            </div>
            <div class="flex flex-col flex-grow">
                <div class="mb-4">
                    <span class="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2 block">${product.category}</span>
                    <h3 class="text-2xl font-black mb-2 tracking-tighter">${product.name}</h3>
                    <p class="text-slate-400 text-sm leading-relaxed line-clamp-2">${product.description}</p>
                </div>
                <div class="mt-auto flex items-center justify-between border-t border-white/5 pt-6">
                    <div class="flex flex-col">
                        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Precio</span>
                        <span class="text-2xl font-black text-white">$${product.price.toLocaleString('es-CL')}</span>
                    </div>
                    <button onclick="addToCart(${product.id})" class="w-14 h-14 bg-white/5 hover:bg-primary text-white rounded-2xl transition-all flex items-center justify-center border border-white/10 hover:border-primary active:scale-95 group/btn">
                        <span class="material-symbols-outlined text-2xl group-hover/btn:rotate-12 transition-transform">shopping_cart_checkout</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

window.addToCart = function (productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    showToast(`${product.name} añadido.`);
};

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Bounce animation
    cartCount.classList.remove('scale-150');
    void cartCount.offsetWidth;
    cartCount.classList.add('scale-150');
    setTimeout(() => cartCount.classList.remove('scale-150'), 300);

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                <span class="material-symbols-outlined text-6xl">shopping_cart</span>
                <p class="text-sm font-bold uppercase tracking-widest">Carrito Vacío</p>
            </div>
        `;
        cartFooter.style.display = 'none';
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="flex gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/5 group">
                <div class="w-16 h-16 rounded-xl overflow-hidden bg-[#050b18]">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover" 
                         onerror="this.src='https://via.placeholder.com/100?text=MR'">
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="font-black text-xs uppercase tracking-tighter truncate">${item.name}</h4>
                    <p class="text-primary font-black text-sm">$${item.price.toLocaleString('es-CL')}</p>
                    <div class="flex items-center gap-4 mt-3">
                        <div class="flex items-center bg-background-dark rounded-lg p-1 border border-white/5">
                            <button onclick="updateQty(${item.id}, -1)" class="w-6 h-6 flex items-center justify-center hover:text-primary transition-colors text-xs">－</button>
                            <span class="text-[10px] font-black w-6 text-center">${item.quantity}</span>
                            <button onclick="updateQty(${item.id}, 1)" class="w-6 h-6 flex items-center justify-center hover:text-earth-sand transition-colors text-xs">＋</button>
                        </div>
                    </div>
                </div>
                <button onclick="removeFromCart(${item.id})" class="text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2">
                    <span class="material-symbols-outlined text-xl">delete</span>
                </button>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `$${total.toLocaleString('es-CL')}`;
        cartFooter.style.display = 'block';
    }
}

window.updateQty = function (productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) removeFromCart(productId);
    else { saveCart(); updateCartUI(); }
};

window.removeFromCart = function (productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
};

function saveCart() {
    localStorage.setItem('mr_confecciones_cart_real', JSON.stringify(cart));
}

function showToast(message) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
    }, 4000);
}

function setupEventListeners() {
    // --- Cart Toggle ---
    if (openCartBtn) openCartBtn.addEventListener('click', () => {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('open');
    });
    if (closeCartBtn) closeCartBtn.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('open');
    });
    if (cartOverlay) cartOverlay.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('open');
    });

    // --- Carousel Navigation ---
    if (nextBtn) nextBtn.addEventListener('click', () => {
        nextSlide();
        startCarouselAutoPlay();
    });
    if (prevBtn) prevBtn.addEventListener('click', () => {
        prevSlide();
        startCarouselAutoPlay();
    });

    // --- Contact Form (Supabase) ---
    if (contactForm) {
        // Remove any existing listeners to be safe
        const newForm = contactForm.cloneNode(true);
        contactForm.parentNode.replaceChild(newForm, contactForm);

        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            console.log("Iniciando envío de formulario...");
            const btn = newForm.querySelector('button');
            const originalText = btn.innerHTML;
            const formData = new FormData(newForm);

            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                requirement: newForm.querySelector('textarea').value,
                created_at: new Date().toISOString()
            };

            btn.disabled = true;
            btn.innerHTML = '<span class="material-symbols-outlined animate-spin mr-2">sync</span> ENVIANDO...';

            try {
                if (!supabase) {
                    console.log("Supabase no inicializado, usando modo demo");
                    setTimeout(() => {
                        showToast(`¡Gracias ${data.name}! (Modo Demo)`);
                        newForm.reset();
                        btn.disabled = false;
                        btn.innerHTML = originalText;
                    }, 1000);
                    return;
                }

                const { error } = await supabase.from('contact_messages').insert([data]);
                if (error) throw error;

                showToast(`¡Gracias ${data.name}! Mensaje enviado.`);
                newForm.reset();
            } catch (err) {
                console.error('Error detallado:', err);
                showToast('Error al enviar: ' + (err.message || 'Intenta de nuevo'));
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        });
    }

    // --- Checkout / Quotation (Supabase) ---
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            if (cart.length === 0) {
                showToast('Añade productos para cotizar');
                return;
            }

            const originalText = checkoutBtn.innerHTML;
            checkoutBtn.disabled = true;
            checkoutBtn.innerHTML = '<span class="material-symbols-outlined animate-spin mr-2">sync</span> GUARDANDO...';

            const quoteData = {
                items: cart,
                total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                created_at: new Date()
            };

            if (supabase) {
                try {
                    const { error } = await supabase.from('quotations').insert([quoteData]);
                    if (error) throw error;
                    showToast('¡Cotización guardada! Te contactaremos.');
                } catch (err) {
                    console.error('Supabase error:', err);
                    showToast('Error al guardar cotización.');
                }
            }

            setTimeout(() => {
                const message = `Hola MR Confecciones, me interesa cotizar:\n${cart.map(i => `- ${i.quantity}x ${i.name}`).join('\n')}\nTotal aprox: $${quoteData.total.toLocaleString()}`;
                window.open(`https://wa.me/569XXXXXXXX?text=${encodeURIComponent(message)}`, '_blank');
                checkoutBtn.disabled = false;
                checkoutBtn.innerHTML = originalText;
            }, 800);
        });
    }

    // --- Utilities ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === "#") return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

init();

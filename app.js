/* =============================================
   MR CONFECCIONES — Logic v2.1 (Security Fix)
   ============================================= */

// --- CONFIGURATION ---
const SUPABASE_URL = 'https://mrcroztqbiwytkcbbfsq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yY3JvenRxYml3eXRrY2JiZnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTUxNzAsImV4cCI6MjA4Njc3MTE3MH0.Hm7iV_58dx9TysDTWnp7ZsoINCPi4YQLvoWX8Sl1TB4';

const ASSETS = {
    manteleria: "assets/manteleria.png",
    turbante: "assets/turbante.png",
    poncho: "assets/hero-poncho.png",
    telas: "assets/telas-naranja.png",
    logo: "assets/logo-circular.png"
};

const DESIGNER_CONFIG = {
    heroBanners: [
        {
            title: "MANTELERÍA INSTITUCIONAL",
            subtitle: "Elegancia y durabilidad para eventos y hogar.",
            btnText: "Ver Catálogo",
            image: ASSETS.manteleria,
            tag: "Calidad Premium"
        },
        {
            title: "TURBANTES DE MICROFIBRA",
            subtitle: "Secado ultra rápido que cuida tu cabello.",
            btnText: "Comprar Ahora",
            image: ASSETS.turbante,
            tag: "Secado Rápido"
        },
        {
            title: "CONFECCIÓN PERSONALIZADA",
            subtitle: "Trabajos a medida con las mejores telas del mercado.",
            btnText: "Cotizar Ahora",
            image: ASSETS.poncho,
            tag: "Hecho a Mano"
        }
    ]
};

const PRODUCTS = [
    { id: 1, name: "Mantel Antimanchas Premium", description: "Alta gama con tratamiento antimanchas.", price: 15990, category: "Mantelería", badge: "DESTACADO", badgeClass: "bg-primary", image: ASSETS.manteleria },
    { id: 2, name: "Turbante Microfibra Pro", description: "Secado ultra-rápido sin daño capilar.", price: 7500, category: "Turbantes", badge: "NUEVO", badgeClass: "bg-earth-sand", image: ASSETS.turbante },
    { id: 3, name: "Telas Naranja Premium", description: "Resistencia y suavidad garantizada.", price: 9990, category: "Telas", badge: "BEST SELLER", badgeClass: "bg-earth-moss", image: ASSETS.telas },
    { id: 4, name: "Poncho Microfibra", description: "Ideal para playa o piscina. Máxima comodidad.", price: 14500, category: "Protección", badge: "PROMO", badgeClass: "bg-primary", image: ASSETS.poncho }
];

// --- Global State ---
let cart = JSON.parse(localStorage.getItem('mr_confecciones_cart_real')) || [];
let currentSlide = 0;
let supabaseClient = null; // Renamed to avoid syntax collision
let dom = {};

// --- Core Functions ---

function init() {
    console.log("MR Confecciones: Aplicación cargada.");

    // Initializing DOM references
    dom = {
        productsGrid: document.getElementById('products-grid'),
        cartSidebar: document.getElementById('cart-sidebar'),
        cartOverlay: document.getElementById('cart-overlay'),
        cartItems: document.getElementById('cart-items'),
        cartCount: document.getElementById('cart-count'),
        cartTotal: document.getElementById('cart-total'),
        cartFooter: document.getElementById('cart-footer'),
        openCart: document.getElementById('open-cart'),
        closeCart: document.getElementById('close-cart'),
        toast: document.getElementById('toast'),
        toastMsg: document.getElementById('toast-msg'),
        contactForm: document.getElementById('contact-form'),
        slides: document.getElementById('carousel-slides'),
        dots: document.getElementById('carousel-dots')
    };

    // Initializing Supabase
    if (window.supabase) {
        // Use the global SDK to create the client
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("Supabase: Inicializado correctamente.");
    } else {
        console.warn("Supabase: SDK no encontrado, asegúrate de tener internet.");
    }

    renderCarousel();
    renderProducts();
    updateCartUI();
    setupListeners();

    // Auto-play carousel
    setInterval(nextSlide, 6000);
}

function renderCarousel() {
    if (!dom.slides) return;
    dom.slides.innerHTML = DESIGNER_CONFIG.heroBanners.map(banner => `
        <div class="min-w-full h-full relative flex items-center px-6 lg:px-20 py-20 overflow-hidden">
            <div class="absolute inset-0 z-0">
                <img src="${banner.image}" alt="" class="w-full h-full object-cover opacity-60 scale-105" onerror="this.src='https://via.placeholder.com/1920x1080'">
                <div class="absolute inset-0 bg-background-dark/40"></div>
            </div>
            <div class="max-w-7xl mx-auto w-full relative z-20">
                <div class="flex flex-col gap-8 max-w-4xl text-left">
                    <div class="inline-flex items-center gap-2 bg-primary/20 px-5 py-2 rounded-full w-fit border border-primary/30">
                        <span class="text-xs font-bold uppercase tracking-[0.2em] text-primary">${banner.tag}</span>
                    </div>
                    <h1 class="text-4xl lg:text-8xl font-extrabold leading-tight tracking-tighter text-white">
                        ${banner.title}
                    </h1>
                    <p class="text-lg lg:text-xl text-slate-300 max-w-lg font-medium">${banner.subtitle}</p>
                    <a href="#shop" class="btn-gradient w-fit text-white px-12 py-5 rounded-2xl font-black text-lg shadow-2xl">
                        ${banner.btnText}
                    </a>
                </div>
            </div>
        </div>
    `).join('');

    if (dom.dots) {
        dom.dots.innerHTML = DESIGNER_CONFIG.heroBanners.map((_, i) => `<button onclick="goToSlide(${i})" class="w-3 h-3 rounded-full transition-all ${i === 0 ? 'bg-primary w-10' : 'bg-white/20'}"></button>`).join('');
    }
}

window.goToSlide = (i) => { currentSlide = i; updateCarousel(); };
function nextSlide() { currentSlide = (currentSlide + 1) % DESIGNER_CONFIG.heroBanners.length; updateCarousel(); }
window.prevSlide = () => { currentSlide = (currentSlide - 1 + DESIGNER_CONFIG.heroBanners.length) % DESIGNER_CONFIG.heroBanners.length; updateCarousel(); };

function updateCarousel() {
    if (!dom.slides) return;
    dom.slides.style.transform = `translateX(-${currentSlide * 100}%)`;
    if (dom.dots) {
        const dotsArray = dom.dots.querySelectorAll('button');
        dotsArray.forEach((dot, i) => {
            dot.className = `w-3 h-3 rounded-full transition-all ${i === currentSlide ? 'bg-primary w-10' : 'bg-white/20'}`;
        });
    }
}

function renderProducts() {
    if (!dom.productsGrid) return;
    dom.productsGrid.innerHTML = PRODUCTS.map(p => `
        <div class="glass-card p-6 rounded-[2rem] flex flex-col h-full hover:border-primary/50 transition-all duration-500">
            <div class="relative overflow-hidden rounded-2xl mb-8 aspect-[4/5] bg-navy-blue">
                <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover opacity-90" onerror="this.src='https://via.placeholder.com/400x500'">
                <span class="absolute top-4 left-4 ${p.badgeClass} text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">${p.badge}</span>
            </div>
            <div class="flex flex-col flex-grow">
                <span class="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">${p.category}</span>
                <h3 class="text-2xl font-black mb-2 tracking-tighter">${p.name}</h3>
                <p class="text-slate-400 text-sm line-clamp-2">${p.description}</p>
                <div class="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                    <span class="text-2xl font-black">$${p.price.toLocaleString('es-CL')}</span>
                    <button onclick="addToCart(${p.id})" class="w-12 h-12 bg-white/5 hover:bg-primary rounded-xl transition-all flex items-center justify-center border border-white/10">
                        <span class="material-symbols-outlined">add_shopping_cart</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

window.addToCart = (id) => {
    const p = PRODUCTS.find(x => x.id === id);
    const item = cart.find(x => x.id === id);
    if (item) item.quantity++; else cart.push({ ...p, quantity: 1 });
    saveCart(); updateCartUI(); showToast(`${p.name} añadido`);
};

function updateCartUI() {
    if (!dom.cartCount) return;
    const count = cart.reduce((s, i) => s + i.quantity, 0);
    dom.cartCount.textContent = count;

    if (cart.length === 0) {
        dom.cartItems.innerHTML = '<p class="text-center py-10 opacity-40">Carrito vacío</p>';
        dom.cartFooter.style.display = 'none';
    } else {
        dom.cartItems.innerHTML = cart.map(i => `
            <div class="flex items-center gap-4 bg-white/5 p-4 rounded-xl">
                <img src="${i.image}" class="w-12 h-12 rounded-lg object-cover">
                <div class="flex-1">
                    <h4 class="text-xs font-bold uppercase truncate">${i.name}</h4>
                    <p class="text-primary font-bold">$${(i.price * i.quantity).toLocaleString('es-CL')}</p>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="updateQty(${i.id}, -1)" class="w-6 h-6 bg-white/5 rounded">-</button>
                    <span class="text-xs font-bold">${i.quantity}</span>
                    <button onclick="updateQty(${i.id}, 1)" class="w-6 h-6 bg-white/5 rounded">+</button>
                </div>
            </div>
        `).join('');
        const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
        dom.cartTotal.textContent = `$${total.toLocaleString('es-CL')}`;
        dom.cartFooter.style.display = 'block';
    }
}

window.updateQty = (id, delta) => {
    const i = cart.find(x => x.id === id);
    if (!i) return;
    i.quantity += delta;
    if (i.quantity <= 0) cart = cart.filter(x => x.id !== id);
    saveCart(); updateCartUI();
};

function saveCart() { localStorage.setItem('mr_confecciones_cart_real', JSON.stringify(cart)); }

function showToast(msg) {
    if (!dom.toast || !dom.toastMsg) return;
    dom.toastMsg.textContent = msg;
    dom.toast.classList.replace('opacity-0', 'opacity-100');
    dom.toast.classList.replace('translate-y-20', 'translate-y-0');
    setTimeout(() => {
        dom.toast.classList.replace('opacity-100', 'opacity-0');
        dom.toast.classList.replace('translate-y-0', 'translate-y-20');
    }, 4000);
}

function setupListeners() {
    // --- Cart Toggle ---
    if (dom.openCart) dom.openCart.onclick = () => { dom.cartSidebar.classList.add('open'); dom.cartOverlay.classList.add('open'); };
    if (dom.closeCart) dom.closeCart.onclick = () => { dom.cartSidebar.classList.remove('open'); dom.cartOverlay.classList.remove('open'); };
    if (dom.cartOverlay) dom.cartOverlay.onclick = () => { dom.cartSidebar.classList.remove('open'); dom.cartOverlay.classList.remove('open'); };

    // --- Contact Form ---
    if (dom.contactForm) {
        console.log("Formulario: Listo.");
        dom.contactForm.onsubmit = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            console.log("Formulario: Iniciando envío...");
            const btn = dom.contactForm.querySelector('button');
            const data = {
                name: new FormData(dom.contactForm).get('name'),
                email: new FormData(dom.contactForm).get('email'),
                requirement: dom.contactForm.querySelector('textarea').value,
                created_at: new Date().toISOString()
            };

            btn.disabled = true;
            btn.textContent = "ENVIANDO...";

            try {
                if (!supabaseClient) throw new Error("Base de datos desconectada.");

                const { error } = await supabaseClient.from('contact_messages').insert([data]);
                if (error) throw error;

                console.log("Formulario: Éxito total.");
                showToast("¡Mensaje enviado con éxito!");
                dom.contactForm.reset();
            } catch (err) {
                console.error("Formulario Error:", err);
                showToast("Error: " + err.message);
            } finally {
                btn.disabled = false;
                btn.textContent = "ENVIAR MENSAJE";
            }
            return false;
        };
    }

    // --- Checkout ---
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.onclick = async () => {
            if (cart.length === 0) return showToast("Añade productos.");

            checkoutBtn.disabled = true;
            const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);

            try {
                if (supabaseClient) {
                    await supabaseClient.from('quotations').insert([{
                        items: cart,
                        total,
                        created_at: new Date().toISOString()
                    }]);
                }
                const msg = `Hola MR Confecciones, cotización:\n${cart.map(i => `- ${i.quantity}x ${i.name}`).join('\n')}\nTotal: $${total.toLocaleString('es-CL')}`;
                window.open(`https://wa.me/569XXXXXXXX?text=${encodeURIComponent(msg)}`, '_blank');
            } catch (err) {
                console.error("Checkout Error:", err);
            } finally {
                checkoutBtn.disabled = false;
            }
        };
    }
}

// Start application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

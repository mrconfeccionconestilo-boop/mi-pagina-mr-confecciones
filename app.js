/* =============================================
   MR CONFECCIONES — Logic v2.4 (EmailJS direct)
   ============================================= */

// --- CONFIGURATION ---
const SUPABASE_URL = 'https://mrcroztqbiwytkcbbfsq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yY3JvenRxYml3eXRrY2JiZnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTUxNzAsImV4cCI6MjA4Njc3MTE3MH0.Hm7iV_58dx9TysDTWnp7ZsoINCPi4YQLvoWX8Sl1TB4';

const EMAILJS_SERVICE_ID = 'service_cpbelnt';
const EMAILJS_TEMPLATE_ID = 'template_3uzu4by';
const EMAILJS_PUBLIC_KEY = 'h95_EWCJMHAz-OBUq';
const MP_PUBLIC_KEY = 'APP_USR-bf94019e-d379-4f27-a242-0f60177dcddf'; // Clave de Producción de MR Confecciones

// --- INITIALIZATION ---
let mp = null;
if (window.MercadoPago) {
    mp = new MercadoPago(MP_PUBLIC_KEY, { locale: 'es-CL' });
}

const ASSETS = {
    manteleria: "assets/manteleria.png",
    turbante: "assets/turbante.png",
    poncho: "assets/hero-poncho.png",
    telas: "assets/telas-naranja.png",
    logo: "assets/logo-circular.png"
};

const DESIGNER_CONFIG = {
    heroBanners: [
        { title: "MANTELERÍA INSTITUCIONAL", subtitle: "Elegancia y durabilidad para eventos y hogar.", btnText: "Ver Catálogo", image: ASSETS.manteleria, tag: "Calidad Premium" },
        { title: "TURBANTES DE MICROFIBRA", subtitle: "Secado ultra rápido que cuida tu cabello.", btnText: "Comprar Ahora", image: ASSETS.turbante, tag: "Secado Rápido" },
        { title: "CONFECCIÓN PERSONALIZADA", subtitle: "Trabajos a medida con las mejores telas del mercado.", btnText: "Cotizar Ahora", image: ASSETS.poncho, tag: "Hecho a Mano" }
    ]
};

const PRODUCTS = [
    { id: 1, name: "Mantel Antimanchas Premium", description: "Alta gama con tratamiento antimanchas.", price: 15990, category: "Mantelería", badge: "DESTACADO", badgeClass: "bg-primary", image: ASSETS.manteleria },
    { id: 2, name: "Turbante Microfibra Pro", description: "Secado ultra-rápido sin daño capilar.", price: 7500, category: "Turbantes", badge: "NUEVO", badgeClass: "bg-earth-sand", image: ASSETS.turbante },
    { id: 3, name: "Telas Naranja Premium", description: "Resistencia y suavidad garantizada.", price: 9990, category: "Telas", badge: "BEST SELLER", badgeClass: "bg-earth-moss", image: ASSETS.telas },
    { id: 4, name: "Poncho Microfibra", description: "Ideal para playa o piscina. Máxima comodidad.", price: 14500, category: "Protección", badge: "PROMO", badgeClass: "bg-primary", image: ASSETS.poncho }
];

let cart = JSON.parse(localStorage.getItem('mr_confecciones_cart_real')) || [];
let currentSlide = 0;
let supabaseClient = null;
let dom = {};

function init() {
    console.log("MR Confecciones: v2.4");
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

    if (window.supabase) supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    renderCarousel(); renderProducts(); updateCartUI(); setupListeners();
    setInterval(nextSlide, 6000);
}

function renderCarousel() {
    if (!dom.slides) return;
    dom.slides.innerHTML = DESIGNER_CONFIG.heroBanners.map(banner => `
        <div class="min-w-full h-full relative flex items-center px-6 lg:px-20 py-20 overflow-hidden">
            <div class="absolute inset-0 z-0"><img src="${banner.image}" class="w-full h-full object-cover opacity-60 scale-105" onerror="this.src='https://via.placeholder.com/1920x1080'"><div class="absolute inset-0 bg-background-dark/40"></div></div>
            <div class="max-w-7xl mx-auto w-full relative z-20">
                <div class="flex flex-col gap-8 max-w-4xl text-left">
                    <div class="inline-flex items-center gap-2 bg-primary/20 px-5 py-2 rounded-full w-fit border border-primary/30"><span class="text-xs font-bold uppercase tracking-[0.2em] text-primary">${banner.tag}</span></div>
                    <h1 class="text-5xl lg:text-8xl font-light leading-tight tracking-tight text-white heading-luxury">
                        ${banner.title.split(' ').map((word, i) => i === 1 ? `<span class="luxury-text-gradient italic">${word}</span>` : word).join(' ')}
                    </h1>
                    <p class="text-lg lg:text-xl text-slate-400 max-w-lg font-light italic leading-relaxed">${banner.subtitle}</p>
                    <a href="#shop" class="btn-gradient w-fit text-white px-14 py-6 rounded-3xl font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl mt-4">${banner.btnText}</a>
                </div>
            </div>
        </div>
    `).join('');
    if (dom.dots) dom.dots.innerHTML = DESIGNER_CONFIG.heroBanners.map((_, i) => `<button onclick="goToSlide(${i})" class="w-3 h-3 rounded-full transition-all ${i === 0 ? 'bg-primary w-10' : 'bg-white/20'}"></button>`).join('');
}

window.goToSlide = (i) => { currentSlide = i; updateCarousel(); };
function nextSlide() { currentSlide = (currentSlide + 1) % DESIGNER_CONFIG.heroBanners.length; updateCarousel(); }
function updateCarousel() {
    if (!dom.slides) return;
    dom.slides.style.transform = `translateX(-${currentSlide * 100}%)`;
    if (dom.dots) {
        dom.dots.querySelectorAll('button').forEach((dot, i) => {
            dot.className = `w-3 h-3 rounded-full transition-all ${i === currentSlide ? 'bg-primary w-10' : 'bg-white/20'}`;
        });
    }
}

function renderProducts() {
    if (!dom.productsGrid) return;
    dom.productsGrid.innerHTML = PRODUCTS.map(p => `
        <div class="glass-card p-6 flex flex-col h-full hover:border-primary/50 transition-all duration-700 group relative">
            <div class="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 blur-[50px] rounded-full group-hover:bg-primary/10 transition-colors"></div>
            
            <div class="relative overflow-hidden rounded-[2.5rem] mb-8 aspect-[4/5] image-soft-gradient flex items-center justify-center p-4">
                <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover opacity-90 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-100" onerror="this.src='https://via.placeholder.com/400x500'">
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <span class="absolute top-6 left-6 ${p.badgeClass} text-white text-[8px] font-black px-4 py-2 rounded-full uppercase tracking-[0.3em] shadow-2xl backdrop-blur-md">${p.badge}</span>
            </div>
            
            <div class="flex flex-col flex-grow px-4">
                <span class="text-[9px] font-black text-primary uppercase tracking-[0.4em] mb-3 opacity-60">${p.category}</span>
                <h3 class="text-3xl font-light mb-4 heading-luxury luxury-text-gradient">${p.name}</h3>
                <p class="text-slate-500 text-xs font-light leading-relaxed mb-8 line-clamp-2 italic">${p.description}</p>
                
                <div class="mt-auto flex items-center justify-between pt-8 border-t border-white/5">
                    <div class="flex flex-col">
                        <span class="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] mb-1">Price Tier</span>
                        <span class="text-2xl font-light heading-luxury">$${p.price.toLocaleString('es-CL')}</span>
                    </div>
                    <button onclick="addToCart(${p.id})" class="w-16 h-16 bg-white/[0.02] hover:bg-primary text-white rounded-full transition-all duration-700 flex items-center justify-center border border-white/5 hover:border-primary hover:shadow-[0_0_40px_rgba(176,93,60,0.3)] group/btn">
                        <span class="material-symbols-outlined text-3xl transition-transform group-hover/btn:scale-110">shopping_cart</span>
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
    dom.cartCount.textContent = cart.reduce((s, i) => s + i.quantity, 0);
    if (cart.length === 0) {
        dom.cartItems.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20 py-20">
                <span class="material-symbols-outlined text-6xl">inventory_2</span>
                <p class="text-[10px] font-black uppercase tracking-[0.4em]">Sin artículos seleccionados</p>
            </div>`;
        dom.cartFooter.style.display = 'none';
    } else {
        dom.cartItems.innerHTML = cart.map(i => `
            <div class="group relative flex items-center gap-6 p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-all duration-500">
                <div class="w-20 h-20 rounded-2xl overflow-hidden bg-navy-blue flex-shrink-0">
                    <img src="${i.image}" class="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700">
                </div>
                <div class="flex-1 space-y-1">
                    <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-white/90 truncate">${i.name}</h4>
                    <p class="text-primary font-black tracking-tight italic">$${(i.price * i.quantity).toLocaleString('es-CL')}</p>
                    <div class="flex items-center gap-3 pt-2">
                        <button onclick="updateQty(${i.id}, -1)" class="w-6 h-6 flex items-center justify-center bg-white/5 hover:bg-primary rounded-md transition-all text-xs">-</button>
                        <span class="text-[10px] font-black w-4 text-center">${i.quantity}</span>
                        <button onclick="updateQty(${i.id}, 1)" class="w-6 h-6 flex items-center justify-center bg-white/5 hover:bg-primary rounded-md transition-all text-xs">+</button>
                    </div>
                </div>
            </div>
        `).join('');
        dom.cartTotal.textContent = `$${cart.reduce((s, i) => s + (i.price * i.quantity), 0).toLocaleString('es-CL')}`;
        dom.cartFooter.style.display = 'block';
    }
}

window.updateQty = (id, delta) => {
    const i = cart.find(x => x.id === id);
    if (!i) return; i.quantity += delta;
    if (i.quantity <= 0) cart = cart.filter(x => x.id !== id);
    saveCart(); updateCartUI();
};

function saveCart() { localStorage.setItem('mr_confecciones_cart_real', JSON.stringify(cart)); }

function showToast(msg) {
    if (!dom.toast || !dom.toastMsg) return;
    dom.toastMsg.textContent = msg;
    dom.toast.className = "fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 opacity-100 translate-y-0";
    setTimeout(() => { dom.toast.className = "fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 opacity-0 translate-y-20"; }, 4000);
}

function setupListeners() {
    if (dom.openCart) dom.openCart.onclick = () => { dom.cartSidebar.classList.add('open'); dom.cartOverlay.classList.add('open'); };
    if (dom.closeCart) dom.closeCart.onclick = () => { dom.cartSidebar.classList.remove('open'); dom.cartOverlay.classList.remove('open'); };
    if (dom.cartOverlay) dom.cartOverlay.onclick = () => { dom.cartSidebar.classList.remove('open'); dom.cartOverlay.classList.remove('open'); };

    if (dom.contactForm) {
        dom.contactForm.onsubmit = async (e) => {
            e.preventDefault();
            const btn = dom.contactForm.querySelector('button');
            const formData = new FormData(dom.contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                message: dom.contactForm.querySelector('textarea').value
            };

            btn.disabled = true;
            btn.textContent = "ENVIANDO...";

            try {
                // 1. Supabase
                if (supabaseClient) {
                    await supabaseClient.from('contact_messages').insert([{
                        name: data.name, email: data.email, requirement: data.message, created_at: new Date().toISOString()
                    }]);
                }

                // 2. EmailJS (Direct call)
                if (window.emailjs) {
                    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                        from_name: data.name,
                        from_email: data.email,
                        message: data.message
                    }, EMAILJS_PUBLIC_KEY);
                }

                showToast("¡Mensaje enviado con éxito!");
                dom.contactForm.reset();
            } catch (err) {
                console.error("Error:", err);
                showToast("Mensaje guardado. ¡Te contactaremos!");
            } finally {
                btn.disabled = false; btn.textContent = "ENVIAR MENSAJE";
            }
            return false;
        };
    }

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.onclick = async () => {
            if (cart.length === 0) return showToast("Añade productos.");

            checkoutBtn.disabled = true;
            checkoutBtn.textContent = "PROCESANDO...";

            const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
            const orderData = {
                items: cart,
                total,
                status: 'pending',
                created_at: new Date().toISOString()
            };

            try {
                // 1. Guardar en Supabase para registro
                let orderId = null;
                if (supabaseClient) {
                    const { data, error } = await supabaseClient.from('quotations').insert([orderData]).select();
                    if (data) orderId = data[0].id;
                }

                // 2. Crear preferencia de Mercado Pago llamando a la Edge Function
                let preferenceUrl = null;
                if (supabaseClient) {
                    try {
                        // Intentamos invocar incluso si no hay orderId (usamos uno temporal)
                        const { data: functionData, error: functionError } = await supabaseClient.functions.invoke('create-preference', {
                            body: { items: cart, orderId: orderId || `TMP-${Date.now()}` }
                        });

                        if (functionData && functionData.init_point) {
                            preferenceUrl = functionData.init_point;
                        } else {
                            console.error("No se recibió init_point:", functionData, functionError);
                        }
                    } catch (fErr) {
                        console.error("Error al invocar Edge Function:", fErr);
                    }
                }

                if (preferenceUrl) {
                    showToast("Redirigiendo a Mercado Pago...");
                    setTimeout(() => {
                        window.location.href = preferenceUrl;
                    }, 1500);
                } else {
                    // Respaldo de WhatsApp si falla la función (usamos location.href para evitar bloqueos)
                    showToast("Enviando orden vía WhatsApp...");
                    const msg = `Hola MR Confecciones, pedido #${orderId || 'NUEVO'}:\n${cart.map(i => `- ${i.quantity}x ${i.name}`).join('\n')}\nTotal: $${total.toLocaleString('es-CL')}`;
                    setTimeout(() => {
                        window.location.href = `https://wa.me/56998745436?text=${encodeURIComponent(msg)}`;
                    }, 1500);
                }

            } catch (err) {
                console.error(err);
                showToast("Error al procesar. Intenta nuevamente.");
                checkoutBtn.disabled = false;
                checkoutBtn.textContent = "PROCEDER AL PAGO";
            }
        };
    }
    // Scroll Header Effect
    window.addEventListener('scroll', () => {
        const header = document.getElementById('main-header');
        if (window.scrollY > 50) {
            header.classList.add('nav-scrolled', 'py-4');
            header.classList.remove('py-6');
        } else {
            header.classList.remove('nav-scrolled', 'py-4');
            header.classList.add('py-6');
        }
    });

    // Reveal Animations
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        section.classList.add('section-reveal');
        observer.observe(section);
    });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

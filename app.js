// Base de datos de Productos (Nintendo y PlayStation)
const products = [
    {
        id: 1,
        title: "The Legend of Zelda: Tears of the Kingdom",
        platform: "nintendo",
        price: 59.99,
        oldPrice: 69.99,
        tag: "Nintendo Switch",
        icon: "fa-feather",
        desc: "Explora los cielos de Hyrule en esta secuela épica de mundo abierto."
    },
    {
        id: 2,
        title: "Marvel's Spider-Man 2",
        platform: "playstation",
        price: 49.99,
        oldPrice: 69.99,
        tag: "PlayStation 5",
        icon: "fa-spider",
        desc: "Balanceate por Nueva York con Peter Parker y Miles Morales."
    },
    {
        id: 3,
        title: "Super Mario Bros. Wonder",
        platform: "nintendo",
        price: 45.99,
        oldPrice: 59.99,
        tag: "Nintendo Switch",
        icon: "fa-seedling",
        desc: "Una experiencia plataformera llena de sorpresas y flores maravilla."
    },
    {
        id: 4,
        title: "God of War Ragnarök",
        platform: "playstation",
        price: 39.99,
        oldPrice: 69.99,
        tag: "PlayStation 5",
        icon: "fa-axe",
        desc: "Acompaña a Kratos y Atreus en su viaje por los nueve reinos nórdicos."
    },
    {
        id: 5,
        title: "Metroid Prime Remastered",
        platform: "nintendo",
        price: 34.99,
        oldPrice: 39.99,
        tag: "Nintendo Switch",
        icon: "fa-helmet-safety",
        desc: "La obra maestra de Samus Aran optimizada con gráficos alucinantes."
    },
    {
        id: 6,
        title: "EA Sports FC 26",
        platform: "playstation",
        price: 54.99,
        oldPrice: 69.99,
        tag: "PlayStation 5",
        icon: "fa-futbol",
        desc: "El simulador de fútbol definitivo con HyperMotion y plantillas actualizadas."
    }
];

// Planes de Suscripción (Mensual / Anual)
const subscriptions = {
    monthly: [
        { name: "Nintendo Switch Online", price: "$3.99/mes", features: ["Multijugador online", "Juegos clásicos NES/SNES", "Guardado en la nube"], popular: false },
        { name: "PS Plus Essential", price: "$9.99/mes", features: ["Juegos mensuales gratis", "Multijugador online", "Descuentos exclusivos"], popular: true },
        { name: "PS Plus Extra / Deluxe", price: "$14.99/mes", features: ["Catálogo con más de 400 juegos", "Clásicos de PS1, PS2 y PSP", "Pruebas de juegos"], popular: false }
    ],
    yearly: [
        { name: "Nintendo Switch Online", price: "$19.99/año", features: ["Multijugador online anual", "Juegos clásicos NES/SNES", "Guardado en la nube"], popular: false },
        { name: "PS Plus Essential", price: "$79.99/año", features: ["Juegos mensuales gratis", "Multijugador online", "Descuentos exclusivos"], popular: true },
        { name: "PS Plus Extra / Deluxe", price: "$119.99/año", features: ["Catálogo con más de 400 juegos", "Clásicos de PS1, PS2 y PSP", "Pruebas de juegos"], popular: false }
    ]
};

let cart = JSON.parse(localStorage.getItem('nexus_cart')) || [];
let discountMultiplier = 1;

// Elementos DOM opcionales según la página actual
const productGrid = document.getElementById("product-grid");
const gameCarousel = document.getElementById("game-carousel");
const pricingGrid = document.getElementById("pricing-grid");
const cartBtn = document.getElementById("cart-btn");
const closeCartBtn = document.getElementById("close-cart-btn");
const cartSidebar = document.getElementById("cart-sidebar");
const overlay = document.getElementById("overlay");
const cartCount = document.getElementById("cart-count");
const cartCountSidebar = document.getElementById("cart-count-sidebar");
const cartItemsContainer = document.getElementById("cart-items-container");
const cartTotalPrice = document.getElementById("cart-total-price");
const billingToggle = document.getElementById("billing-toggle");
const couponInput = document.getElementById("coupon-input");
const applyCouponBtn = document.getElementById("apply-coupon-btn");
const searchInput = document.getElementById("search-input");
const filterPills = document.querySelectorAll(".pill");
const switchBtns = document.querySelectorAll(".switch-btn");

// Inicialización global al cargar cualquier HTML
document.addEventListener("DOMContentLoaded", () => {
    // Recuperar la plataforma guardada o usar 'all' por defecto
    const savedPlatform = localStorage.getItem("nexus_platform") || "all";
    applyPlatformThemeAndFilter(savedPlatform);

    if (productGrid) renderProducts(products);
    if (gameCarousel) renderCarousel(products);
    if (pricingGrid) renderSubscriptions("monthly");
    
    updateCartUI();
    setupEventListeners();
});

// Función central para cambiar plataforma en todo el sitio
function switchPlatform(platform) {
    localStorage.setItem("nexus_platform", platform);
    applyPlatformThemeAndFilter(platform);
}

function applyPlatformThemeAndFilter(platform) {
    document.body.setAttribute("data-theme", platform);

    // Actualizar estado visual de los botones switch en el navbar
    switchBtns.forEach(btn => {
        if(btn.getAttribute("data-platform") === platform) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // Si estamos en la página de juegos o inicio, filtrar automáticamente
    if(productGrid) {
        if(platform === 'all') {
            renderProducts(products);
        } else {
            const filtered = products.filter(p => p.platform === platform);
            renderProducts(filtered);
        }
    }
}

// Renderizar Productos
function renderProducts(items) {
    if (!productGrid) return;
    productGrid.innerHTML = "";
    if(items.length === 0) {
        productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:var(--text-muted); padding: 40px;">No se encontraron videojuegos para esta plataforma.</p>`;
        return;
    }

    items.forEach(product => {
        const tagClass = product.platform === 'nintendo' ? 'tag-nintendo' : 'tag-playstation';
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <div class="product-thumb">
                <span class="product-tag ${tagClass}">${product.tag}</span>
                <i class="fa-solid ${product.icon}"></i>
            </div>
            <div class="product-info">
                <h4>${product.title}</h4>
                <p>${product.desc}</p>
                <div class="product-footer">
                    <div>
                        <span class="price">$${product.price}</span>
                        <span class="old-price">$${product.oldPrice}</span>
                    </div>
                    <button class="add-cart-btn" onclick="addToCart(${product.id})"><i class="fa-solid fa-plus"></i> Añadir</button>
                </div>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

// Renderizar Carrusel
function renderCarousel(items) {
    if (!gameCarousel) return;
    gameCarousel.innerHTML = "";
    items.forEach(product => {
        const item = document.createElement("div");
        item.style.minWidth = "280px";
        item.style.flex = "0 0 280px";
        item.className = "product-card";
        item.innerHTML = `
            <div class="product-thumb" style="height: 140px; font-size: 2.2rem;">
                <i class="fa-solid ${product.icon}"></i>
            </div>
            <div class="product-info" style="padding: 15px;">
                <h4 style="font-size: 1rem;">${product.title}</h4>
                <div class="product-footer" style="margin-top: 10px;">
                    <span class="price" style="font-size: 1.1rem;">$${product.price}</span>
                    <button class="add-cart-btn" style="padding: 5px 10px;" onclick="addToCart(${product.id})">Comprar</button>
                </div>
            </div>
        `;
        gameCarousel.appendChild(item);
    });
}

// Renderizar Suscripciones
function renderSubscriptions(type) {
    if (!pricingGrid) return;
    pricingGrid.innerHTML = "";
    const plans = subscriptions[type];
    plans.forEach(plan => {
        const card = document.createElement("div");
        card.className = `pricing-card ${plan.popular ? 'featured' : ''}`;
        card.innerHTML = `
            <h3>${plan.name}</h3>
            <div class="price-tag">${plan.price}</div>
            <ul>
                ${plan.features.map(f => `<li><i class="fa-solid fa-check"></i> ${f}</li>`).join('')}
            </ul>
            <button class="btn-primary" onclick="alert('¡Suscripción añadida con éxito!')">Elegir Plan</button>
        `;
        pricingGrid.appendChild(card);
    });
}

// Control del Carrito
function addToCart(id) {
    const product = products.find(p => p.id === id);
    cart.push(product);
    localStorage.setItem('nexus_cart', JSON.stringify(cart));
    updateCartUI();
    openCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('nexus_cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    if (cartCount) cartCount.textContent = cart.length;
    if (cartCountSidebar) cartCountSidebar.textContent = cart.length;

    if (!cartItemsContainer) return;

    if(cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="empty-cart-msg">Tu carrito está vacío 😢</p>`;
        if(cartTotalPrice) cartTotalPrice.textContent = "$0.00";
        return;
    }

    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        const div = document.createElement("div");
        div.className = "cart-item-card";
        div.innerHTML = `
            <i class="fa-solid ${item.icon}" style="font-size: 1.5rem; color:#00f0ff;"></i>
            <div class="cart-item-info">
                <h5>${item.title}</h5>
                <p>$${item.price}</p>
            </div>
            <button class="remove-item-btn" onclick="removeFromCart(${index})"><i class="fa-solid fa-trash"></i></button>
        `;
        cartItemsContainer.appendChild(div);
    });

    const finalTotal = total * discountMultiplier;
    if(cartTotalPrice) cartTotalPrice.textContent = `$${finalTotal.toFixed(2)}`;
}

function openCart() {
    if(cartSidebar) cartSidebar.classList.add("open");
    if(overlay) overlay.classList.add("active");
}

function closeCart() {
    if(cartSidebar) cartSidebar.classList.remove("open");
    if(overlay) overlay.classList.remove("active");
}

// Configurar Event Listeners
function setupEventListeners() {
    if(cartBtn) cartBtn.addEventListener("click", openCart);
    if(closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
    if(overlay) overlay.addEventListener("click", closeCart);

    // Switch de Plataformas en el Header
    switchBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const platform = btn.getAttribute("data-platform");
            switchPlatform(platform);
        });
    });

    // Filtros por píldoras en la página de juegos
    if(filterPills.length > 0) {
        filterPills.forEach(pill => {
            pill.addEventListener("click", () => {
                filterPills.forEach(p => p.classList.remove("active"));
                pill.classList.add("active");
                const filter = pill.getAttribute("data-filter");

                if(filter === 'all') {
                    renderProducts(products);
                } else if(filter === 'offer') {
                    const offered = products.filter(p => p.oldPrice > p.price);
                    renderProducts(offered);
                } else {
                    const filtered = products.filter(p => p.platform === filter);
                    renderProducts(filtered);
                }
            });
        });
    }

    // Toggle de Suscripciones (Mensual / Anual)
    if(billingToggle) {
        billingToggle.addEventListener("change", (e) => {
            renderSubscriptions(e.target.checked ? "yearly" : "monthly");
        });
    }

    // Aplicar Cupón
    if(applyCouponBtn && couponInput) {
        applyCouponBtn.addEventListener("click", () => {
            const code = couponInput.value.trim().toUpperCase();
            if(code === "GAMER20") {
                discountMultiplier = 0.8;
                updateCartUI();
                alert("¡Cupón GAMER20 aplicado con éxito! 20% de descuento.");
            } else {
                alert("Código de cupón inválido o expirado.");
            }
        });
    }

    // Buscador instantáneo
    if(searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            const results = products.filter(p => p.title.toLowerCase().includes(query) || p.tag.toLowerCase().includes(query));
            renderProducts(results);
        });
    }

    // Carrusel desplazamiento automático con botones
    const track = document.getElementById("game-carousel");
    const nextBtn = document.getElementById("carousel-next");
    const prevBtn = document.getElementById("carousel-prev");

    if(track && nextBtn && prevBtn) {
        nextBtn.addEventListener("click", () => track.scrollBy({ left: 300, behavior: 'smooth' }));
        prevBtn.addEventListener("click", () => track.scrollBy({ left: -300, behavior: 'smooth' }));
    }
}
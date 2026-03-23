let products = [];

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    initMobileMenu();
    setCurrentYear();
    initContactForm();
    initModalClose();
    initSmoothScroll();
    initScrollAnimations();
});

async function loadProducts() {
    const localProducts = localStorage.getItem('hahavia_products');
    if (localProducts) {
        products = JSON.parse(localProducts);
        renderProducts();
        return;
    }
    
    try {
        const response = await fetch('/data/products.json');
        products = await response.json();
        localStorage.setItem('hahavia_products', JSON.stringify(products));
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        alert('Failed to load products');
    }
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    products.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-card overflow-hidden cursor-pointer group';
        card.style.animationDelay = `${index * 0.1}s`;
        card.onclick = () => openProductModal(product);

        card.innerHTML = `
            <div class="overflow-hidden">
                <img src="${product.image_url}" alt="${product.name}" class="w-full h-72 object-cover" onerror="this.src='${getFallbackImage(product.name)}'">
            </div>
            <div class="p-6">
                <h3 class="text-xl font-semibold mb-2 text-slate-800" style="font-family: 'Playfair Display', serif;">${product.name}</h3>
                <p class="text-slate-500 text-sm mb-4" style="font-family: 'Lato', sans-serif;">${product.fabric}${product.fabric_weight ? `, ${product.fabric_weight}` : ''}</p>
                <div class="flex justify-end">
                    <span class="text-sm text-slate-400" style="font-family: 'Lato', sans-serif;">MOQ: ${product.moq || '-'}</span>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });
}

function getFallbackImage(productName) {
    const encodedName = encodeURIComponent(productName);
    return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodedName}%20fashion%20photography%20on%20white%20background&image_size=square`;
}

function openProductModal(product) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');

    modalTitle.textContent = product.name;

    modalContent.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="relative">
                <img src="${product.image_url}" alt="${product.name}" class="w-full h-96 object-cover" onerror="this.src='${getFallbackImage(product.name)}'">
            </div>
            <div>
                <div class="space-y-5">
                    <div>
                        <h4 class="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1" style="font-family: 'Lato', sans-serif;">Fabric Details</h4>
                        <p class="text-lg text-slate-700" style="font-family: 'Lato', sans-serif;">${product.fabric || '-'}</p>
                    </div>
                    ${product.fabric_weight ? `
                    <div>
                        <h4 class="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1" style="font-family: 'Lato', sans-serif;">Fabric Weight</h4>
                        <p class="text-lg text-slate-700" style="font-family: 'Lato', sans-serif;">${product.fabric_weight}</p>
                    </div>
                    ` : ''}
                    ${product.sleeve_yarn ? `
                    <div>
                        <h4 class="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1" style="font-family: 'Lato', sans-serif;">Sleeve Yarn</h4>
                        <p class="text-lg text-slate-700" style="font-family: 'Lato', sans-serif;">${product.sleeve_yarn}</p>
                    </div>
                    ` : ''}
                    <div class="pt-4 border-t border-slate-200">
                        <h4 class="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1" style="font-family: 'Lato', sans-serif;">Minimum Order Quantity</h4>
                        <p class="text-lg text-slate-700" style="font-family: 'Lato', sans-serif;">${product.moq || '-'}</p>
                    </div>
                    ${product.description ? `
                    <div class="pt-4 border-t border-slate-200">
                        <h4 class="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1" style="font-family: 'Lato', sans-serif;">Description</h4>
                        <p class="text-slate-600 leading-relaxed" style="font-family: 'Lato', sans-serif;">${product.description}</p>
                    </div>
                    ` : ''}
                </div>
                <div class="mt-8">
                    <a href="#contact" class="inline-block bg-emerald-700 text-white px-8 py-4 hover:bg-emerald-800 transition-all duration-300 font-medium tracking-widest" onclick="closeProductModal()" style="font-family: 'Lato', sans-serif;">
                        Inquire Now
                    </a>
                </div>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (!menuBtn || !mobileMenu) return;

    menuBtn.onclick = () => {
        mobileMenu.classList.toggle('hidden');
    };

    const menuLinks = mobileMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
        link.onclick = () => {
            mobileMenu.classList.add('hidden');
        };
    });
}

function setCurrentYear() {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

function initContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');

    if (!form) return;

    form.onsubmit = async (e) => {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!name) {
            e.preventDefault();
            alert('Please enter your name');
            return;
        }

        if (!email || !isValidEmail(email)) {
            e.preventDefault();
            alert('Please enter a valid email address');
            return;
        }

        if (!message) {
            e.preventDefault();
            alert('Please enter your message');
            return;
        }

        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
    };
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function initModalClose() {
    const closeBtn = document.getElementById('closeModal');
    const modal = document.getElementById('productModal');

    if (closeBtn && modal) {
        closeBtn.onclick = closeProductModal;

        modal.onclick = (e) => {
            if (e.target === modal) {
                closeProductModal();
            }
        };

        document.onkeydown = (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                closeProductModal();
            }
        };
    }
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 100;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

function initScrollAnimations() {
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(section);
    });
}

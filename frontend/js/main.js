const API_BASE = 'http://localhost:3001/api';
let products = [];

document.addEventListener('DOMContentLoaded', () => {
    loadSampleProducts();
    initMobileMenu();
    setCurrentYear();
    initContactForm();
    initModalClose();
    initSmoothScroll();
    initScrollAnimations();
});

async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        products = await response.json();
        renderProducts();
    } catch (error) {
        console.error('Error loading products from API, using local data:', error);
        loadSampleProducts();
    }
}

function loadSampleProducts() {
    products = [
        { id: 1, name: 'padded jacket', fabric: '100% nylon', fabric_weight: '50g/m2', price: 68, moq: '800 PCS/COLOR', description: '', image_url: '/images/products/product-01.png' },
        { id: 2, name: 'Padded jacket', fabric: '100% nylon', fabric_weight: '50g/m2', price: 79, moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-02.png' },
        { id: 3, name: 'padded coat', fabric: '100% nylon', fabric_weight: '60g/m2', price: 83, moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-03.png' },
        { id: 4, name: 'Padded coat', fabric: '100% nylon', fabric_weight: '50G/m2', price: 87, moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-04.png' },
        { id: 5, name: 'padded jacket', fabric: '100% nylon', fabric_weight: '60g/m2', price: 87, moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-05.png' },
        { id: 6, name: 'padded jacket', fabric: '100% polyester', fabric_weight: '60G/M2', price: 88, moq: '800 PCS/COLOR', description: '', image_url: '/images/products/product-06.png' },
        { id: 7, name: 'padded coat', fabric: '100% nylon', sleeve_yarn: '97% cotton 3% spandex', price: 96, moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-07.png' },
        { id: 8, name: 'padded coat', fabric: '100% nylon', sleeve_yarn: '97% cotton 3% spandex', price: 97, moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-08.png' },
        { id: 9, name: 'Padded coat', fabric: '100% polyester', fabric_weight: '70G/m2', price: 105, moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-09.png' },
        { id: 10, name: 'Men\'s jacket', fabric: '100% Polyester', fabric_weight: '280g/m2', price: 65, moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-10.png' },
        { id: 11, name: 'Men\'s jacket', fabric: '73% Polyester/15% Polyamide/12% Cotton', fabric_weight: '95G/m2', price: 89, moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-11.png' },
        { id: 12, name: 'vest', fabric: '100% polyester', fabric_weight: '280g/m2', price: 72, moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-12.png' },
        { id: 13, name: 'padded jacket', fabric: '100% polyester', price: 94, moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-13.png' },
        { id: 14, name: 'Padded jacket', fabric: '100% polyester', price: 95, moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-14.png' },
        { id: 15, name: 'WolLEN coat', fabric: '100% polyester', fabric_weight: '450g/m2', price: 93, moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-15.png' },
        { id: 16, name: 'leather jacket', fabric: 'pu leather', fabric_weight: '300G/M2', price: 87, moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-16.png' },
        { id: 17, name: 'leather jacket', fabric: 'pu leather', fabric_weight: '280G/M2', price: 88, moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-17.png' },
        { id: 18, name: 'leather jacket', fabric: 'pu leather', fabric_weight: '300G/M2', price: 89, moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-18.png' }
    ];
    renderProducts();
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
                <div class="flex justify-between items-center">
                    <span class="text-2xl font-bold text-emerald-700" style="font-family: 'Playfair Display', serif;">¥${product.price}</span>
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
                        <h4 class="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1" style="font-family: 'Lato', sans-serif;">Price</h4>
                        <p class="text-4xl font-bold text-emerald-700" style="font-family: 'Playfair Display', serif;">¥${product.price}</p>
                    </div>
                    <div>
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
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!name) {
            alert('Please enter your name');
            return;
        }

        if (!email || !isValidEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }

        if (!message) {
            alert('Please enter your message');
            return;
        }

        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');

        const formData = {
            customer_name: name,
            email: email,
            phone: phone,
            message: message,
            status: 'pending'
        };

        try {
            const response = await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Thank you for your message! We will get back to you soon.');
                form.reset();
            } else {
                throw new Error('Failed to submit');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Thank you for your message! We will get back to you soon.');
            form.reset();
        } finally {
            submitBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
        }
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

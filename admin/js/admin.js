let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    const savedUser = localStorage.getItem('admin_user');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
        initDashboardEventListeners();
        loadProducts();
    } else {
        showLogin();
    }
    
    initEventListeners();
}

function initEventListeners() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

function initDashboardEventListeners() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            switchPage(page);
        });
    });
    
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => openProductModal());
    }
    
    const closeProductModalBtn = document.getElementById('closeProductModal');
    if (closeProductModalBtn) {
        closeProductModalBtn.addEventListener('click', closeProductModal);
    }
    
    const cancelProductBtn = document.getElementById('cancelProductBtn');
    if (cancelProductBtn) {
        cancelProductBtn.addEventListener('click', closeProductModal);
    }
    
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
    
    const resetProductsBtn = document.getElementById('resetProductsBtn');
    if (resetProductsBtn) {
        resetProductsBtn.addEventListener('click', resetProducts);
    }
}

function showLogin() {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('adminDashboard').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');
    document.getElementById('currentUser').textContent = currentUser.username;
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    if (username === 'admin' && password === 'admin123') {
        currentUser = { id: 1, username: 'admin', role: 'admin' };
        localStorage.setItem('admin_user', JSON.stringify(currentUser));
        errorDiv.classList.add('hidden');
        showDashboard();
        initDashboardEventListeners();
        loadProducts();
    } else {
        errorDiv.textContent = '用户名或密码错误';
        errorDiv.classList.remove('hidden');
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('admin_user');
    showLogin();
}

function switchPage(page) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });
    
    document.querySelectorAll('.page-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    const titles = {
        products: '产品管理',
        orders: '表单管理'
    };
    document.getElementById('pageTitle').textContent = titles[page];
    document.getElementById(`${page}Page`).classList.remove('hidden');
    
    if (page === 'products') loadProducts();
    if (page === 'orders') loadOrders();
}

async function loadProducts() {
    let products = localStorage.getItem('hahavia_products');
    if (products) {
        products = JSON.parse(products);
    } else {
        try {
            const response = await fetch('../data/products.json');
            products = await response.json();
            localStorage.setItem('hahavia_products', JSON.stringify(products));
        } catch (error) {
            console.error('Error loading default products:', error);
            products = [];
        }
    }
    renderProducts(products);
}

function renderProducts(products) {
    const tbody = document.getElementById('productsTable');
    tbody.innerHTML = products.map(product => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${product.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.fabric || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.moq || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                <button onclick="editProduct(${product.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteProduct(${product.id})" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function openProductModal(product = null) {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    const form = document.getElementById('productForm');
    
    form.reset();
    
    if (product) {
        title.textContent = '编辑产品';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productFabric').value = product.fabric || '';
        document.getElementById('productFabricWeight').value = product.fabric_weight || '';
        document.getElementById('productSleeveYarn').value = product.sleeve_yarn || '';
        document.getElementById('productMoq').value = product.moq || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productImageUrl').value = product.image_url || '';
    } else {
        title.textContent = '添加产品';
        document.getElementById('productId').value = '';
    }
    
    modal.classList.remove('hidden');
}

function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
}

function handleProductSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const productData = {
        id: productId ? parseInt(productId) : Date.now(),
        name: document.getElementById('productName').value,
        fabric: document.getElementById('productFabric').value,
        fabric_weight: document.getElementById('productFabricWeight').value,
        sleeve_yarn: document.getElementById('productSleeveYarn').value,
        moq: document.getElementById('productMoq').value,
        description: document.getElementById('productDescription').value,
        image_url: document.getElementById('productImageUrl').value
    };
    
    let products = JSON.parse(localStorage.getItem('hahavia_products') || '[]');
    
    if (productId) {
        const index = products.findIndex(p => p.id === parseInt(productId));
        if (index !== -1) {
            products[index] = productData;
        }
    } else {
        products.push(productData);
    }
    
    localStorage.setItem('hahavia_products', JSON.stringify(products));
    
    closeProductModal();
    loadProducts();
}

function editProduct(id) {
    const products = JSON.parse(localStorage.getItem('hahavia_products') || '[]');
    const product = products.find(p => p.id === id);
    if (product) {
        openProductModal(product);
    }
}

function deleteProduct(id) {
    if (!confirm('确定要删除这个产品吗？')) return;
    
    let products = JSON.parse(localStorage.getItem('hahavia_products') || '[]');
    products = products.filter(p => p.id !== id);
    localStorage.setItem('hahavia_products', JSON.stringify(products));
    
    loadProducts();
}

async function resetProducts() {
    if (!confirm('确定要重置产品数据吗？这将恢复默认的18个产品。')) return;
    
    try {
        const response = await fetch('../data/products.json');
        const products = await response.json();
        localStorage.setItem('hahavia_products', JSON.stringify(products));
        loadProducts();
        alert('产品数据已重置');
    } catch (error) {
        console.error('Error resetting products:', error);
        alert('重置失败');
    }
}

async function loadOrders() {
    try {
        const response = await fetch('/api/contacts');
        if (response.ok) {
            const orders = await response.json();
            renderOrders(orders);
        } else {
            renderOrders([]);
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        renderOrders([]);
    }
}

function renderOrders(orders) {
    const tbody = document.getElementById('ordersTable');
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${order.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.email}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.phone || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 py-1 rounded-full text-xs font-medium status-${order.status?.toLowerCase() || 'pending'}">${order.status || 'Pending'}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.created_at ? new Date(order.created_at).toLocaleString() : '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                <button onclick="updateOrderStatus('${order.id}')" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="viewOrder('${order.id}')" class="text-gray-600 hover:text-gray-900">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function updateOrderStatus(id) {
    const statuses = ['Pending', 'Processing', 'Completed', 'Cancelled'];
    const newStatus = prompt('输入新状态 (Pending, Processing, Completed, Cancelled):');
    
    if (!newStatus || !statuses.includes(newStatus)) {
        alert('无效的状态');
        return;
    }
    
    try {
        const response = await fetch(`/api/contacts?id=${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            loadOrders();
        }
    } catch (error) {
        console.error('Error updating order:', error);
    }
}

async function viewOrder(id) {
    try {
        const response = await fetch('/api/contacts');
        const orders = await response.json();
        const order = orders.find(o => o.id === id);
        
        if (order) {
            alert(`
表单详情：
客户姓名: ${order.name}
邮箱: ${order.email}
电话: ${order.phone || '-'}
状态: ${order.status || 'Pending'}
消息: ${order.message || '-'}
创建时间: ${order.created_at ? new Date(order.created_at).toLocaleString() : '-'}
            `);
        }
    } catch (error) {
        console.error('Error loading order:', error);
        alert('加载表单详情失败');
    }
}

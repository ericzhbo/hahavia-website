const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api' 
  : 'https://hahavia-backend.up.railway.app/api';

let authToken = null;
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        showDashboard();
        loadProducts();
    } else {
        showLogin();
    }
    
    initEventListeners();
}

function initEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            switchPage(page);
        });
    });
    
    document.getElementById('addProductBtn').addEventListener('click', () => openProductModal());
    document.getElementById('closeProductModal').addEventListener('click', closeProductModal);
    document.getElementById('cancelProductBtn').addEventListener('click', closeProductModal);
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
    
    document.getElementById('addUserBtn').addEventListener('click', () => openUserModal());
    document.getElementById('closeUserModal').addEventListener('click', closeUserModal);
    document.getElementById('cancelUserBtn').addEventListener('click', closeUserModal);
    document.getElementById('userForm').addEventListener('submit', handleUserSubmit);
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

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            errorDiv.classList.add('hidden');
            showDashboard();
            loadProducts();
        } else {
            errorDiv.textContent = data.error || '登录失败';
            errorDiv.classList.remove('hidden');
        }
    } catch (error) {
        errorDiv.textContent = '网络错误，请稍后重试';
        errorDiv.classList.remove('hidden');
    }
}

function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
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
        orders: '表单管理',
        users: '用户管理'
    };
    document.getElementById('pageTitle').textContent = titles[page];
    document.getElementById(`${page}Page`).classList.remove('hidden');
    
    if (page === 'products') loadProducts();
    if (page === 'orders') loadOrders();
    if (page === 'users') loadUsers();
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
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

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const productData = {
        name: document.getElementById('productName').value,
        fabric: document.getElementById('productFabric').value,
        fabric_weight: document.getElementById('productFabricWeight').value,
        sleeve_yarn: document.getElementById('productSleeveYarn').value,
        moq: document.getElementById('productMoq').value,
        description: document.getElementById('productDescription').value,
        image_url: document.getElementById('productImageUrl').value
    };
    
    try {
        const url = productId ? `${API_BASE}/products/${productId}` : `${API_BASE}/products`;
        const method = productId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            closeProductModal();
            loadProducts();
        }
    } catch (error) {
        console.error('Error saving product:', error);
    }
}

async function editProduct(id) {
    try {
        const response = await fetch(`${API_BASE}/products/${id}`);
        const product = await response.json();
        openProductModal(product);
    } catch (error) {
        console.error('Error loading product:', error);
    }
}

async function deleteProduct(id) {
    if (!confirm('确定要删除这个产品吗？')) return;
    
    try {
        const response = await fetch(`${API_BASE}/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            loadProducts();
        }
    } catch (error) {
        console.error('Error deleting product:', error);
    }
}

async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE}/orders`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const orders = await response.json();
        renderOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

function renderOrders(orders) {
    const tbody = document.getElementById('ordersTable');
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${order.customer_name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.email}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.phone || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 py-1 rounded-full text-xs font-medium status-${order.status}">${order.status}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(order.created_at).toLocaleString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                <button onclick="updateOrderStatus(${order.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="viewOrder(${order.id})" class="text-gray-600 hover:text-gray-900">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE}/users`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const users = await response.json();
        renderUsers(users);
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function renderUsers(users) {
    const tbody = document.getElementById('usersTable');
    tbody.innerHTML = users.map(user => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${user.username}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.role}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(user.created_at).toLocaleString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                ${user.id !== currentUser.id ? `
                    <button onclick="editUser(${user.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteUser(${user.id})" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : '<span class="text-gray-400">当前用户</span>'}
            </td>
        </tr>
    `).join('');
}

function openUserModal(user = null) {
    const modal = document.getElementById('userModal');
    const title = document.getElementById('userModalTitle');
    const form = document.getElementById('userForm');
    
    form.reset();
    
    if (user) {
        title.textContent = '编辑用户';
        document.getElementById('userId').value = user.id;
        document.getElementById('userName').value = user.username;
        document.getElementById('userRole').value = user.role;
    } else {
        title.textContent = '添加用户';
        document.getElementById('userId').value = '';
    }
    
    modal.classList.remove('hidden');
}

function closeUserModal() {
    document.getElementById('userModal').classList.add('hidden');
}

async function handleUserSubmit(e) {
    e.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const userData = {
        username: document.getElementById('userName').value,
        role: document.getElementById('userRole').value
    };
    
    const password = document.getElementById('userPassword').value;
    if (password) {
        userData.password = password;
    }
    
    try {
        const url = userId ? `${API_BASE}/users/${userId}` : `${API_BASE}/users`;
        const method = userId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            closeUserModal();
            loadUsers();
        }
    } catch (error) {
        console.error('Error saving user:', error);
    }
}

async function editUser(id) {
    try {
        const response = await fetch(`${API_BASE}/users/${id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const user = await response.json();
        openUserModal(user);
    } catch (error) {
        console.error('Error loading user:', error);
    }
}

async function deleteUser(id) {
    if (!confirm('确定要删除这个用户吗？')) return;
    
    try {
        const response = await fetch(`${API_BASE}/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            loadUsers();
        }
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}

async function updateOrderStatus(id) {
    const statuses = ['pending', 'processing', 'completed', 'cancelled'];
    const newStatus = prompt('输入新状态 (pending, processing, completed, cancelled):');
    
    if (!newStatus || !statuses.includes(newStatus)) {
        alert('无效的状态');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/orders/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
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
        const response = await fetch(`${API_BASE}/orders/${id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const order = await response.json();
        
        alert(`
表单详情：
客户姓名: ${order.customer_name}
邮箱: ${order.email}
电话: ${order.phone || '-'}
状态: ${order.status}
消息: ${order.message || '-'}
创建时间: ${new Date(order.created_at).toLocaleString()}
        `);
    } catch (error) {
        console.error('Error loading order:', error);
        alert('加载表单详情失败');
    }
}

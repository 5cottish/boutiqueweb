// script.js

// Data Store
const store = {
    currentUser: null,
    products: [
        { id: 1, name: 'Silk Evening Dress', sku: 'DRS-001', category: 'dresses', price: 299.99, stock: 15, threshold: 5, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100&h=100&fit=crop', sales: 45 },
        { id: 2, name: 'Cashmere Sweater', sku: 'TOP-002', category: 'tops', price: 189.99, stock: 8, threshold: 10, image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=100&h=100&fit=crop', sales: 32 },
        { id: 3, name: 'Designer Handbag', sku: 'ACC-003', category: 'accessories', price: 450.00, stock: 3, threshold: 5, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100&h=100&fit=crop', sales: 28 },
        { id: 4, name: 'Leather Ankle Boots', sku: 'SHO-004', category: 'shoes', price: 275.00, stock: 12, threshold: 8, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=100&h=100&fit=crop', sales: 56 },
        { id: 5, name: 'Pleated Midi Skirt', sku: 'BOT-005', category: 'bottoms', price: 145.00, stock: 20, threshold: 10, image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0ujf0?w=100&h=100&fit=crop', sales: 38 },
        { id: 6, name: 'Wool Coat', sku: 'OUT-006', category: 'dresses', price: 525.00, stock: 6, threshold: 5, image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=100&h=100&fit=crop', sales: 19 }
    ],
    sales: [
        { id: 'ORD-001', date: '2024-03-26', customer: 'Emma Wilson', items: 3, total: 845.97, payment: 'Credit Card', status: 'completed' },
        { id: 'ORD-002', date: '2024-03-26', customer: 'James Brown', items: 1, total: 299.99, payment: 'PayPal', status: 'completed' },
        { id: 'ORD-003', date: '2024-03-25', customer: 'Sophie Chen', items: 2, total: 634.99, payment: 'Credit Card', status: 'pending' },
        { id: 'ORD-004', date: '2024-03-25', customer: 'Michael Davis', items: 4, total: 1250.00, payment: 'Bank Transfer', status: 'completed' },
        { id: 'ORD-005', date: '2024-03-24', customer: 'Lisa Anderson', items: 2, total: 475.00, payment: 'Credit Card', status: 'completed' }
    ],
    activities: [
        { type: 'sale', title: 'New sale completed', time: '2 minutes ago', amount: '+$845.97', icon: 'fa-shopping-bag' },
        { type: 'stock', title: 'Stock alert: Designer Handbag', time: '1 hour ago', amount: '3 remaining', icon: 'fa-exclamation-triangle' },
        { type: 'add', title: 'New product added', time: '3 hours ago', amount: 'Wool Coat', icon: 'fa-plus' },
        { type: 'sale', title: 'New sale completed', time: '5 hours ago', amount: '+$299.99', icon: 'fa-shopping-bag' }
    ]
};

// Chart Instances
let salesChart, revenueChart, categoryChart;

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const app = document.getElementById('app');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');
const productModal = document.getElementById('productModal');
const addProductBtn = document.getElementById('addProductBtn');
const addInventoryBtn = document.getElementById('addInventoryBtn');
const closeModal = document.getElementById('closeModal');
const cancelModal = document.getElementById('cancelModal');
const productForm = document.getElementById('productForm');
const toast = document.getElementById('toast');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    renderDashboard();
    renderInventory();
    renderSales();
    renderAnalytics();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Login
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;
            switchView(view);
            updateActiveNav(item);
        });
    });
    
    // Modal
    addProductBtn.addEventListener('click', openModal);
    addInventoryBtn.addEventListener('click', openModal);
    closeModal.addEventListener('click', closeModalFn);
    cancelModal.addEventListener('click', closeModalFn);
    productForm.addEventListener('submit', handleAddProduct);
    
    // Filters
    document.getElementById('categoryFilter')?.addEventListener('change', filterInventory);
    document.getElementById('stockFilter')?.addEventListener('change', filterInventory);
    document.getElementById('inventorySearch')?.addEventListener('input', filterInventory);
    
    // Close modal on outside click
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) closeModalFn();
    });
}

// Authentication
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Simple validation (in real app, this would be an API call)
    if (username && password) {
        store.currentUser = { username };
        loginScreen.classList.add('hidden');
        app.classList.remove('hidden');
        showToast('Welcome back, Sarah!');
    }
}

function handleLogout() {
    store.currentUser = null;
    app.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Navigation
function switchView(viewName) {
    views.forEach(view => view.classList.remove('active'));
    document.getElementById(viewName + 'View').classList.add('active');
    
    // Refresh charts when switching to analytics
    if (viewName === 'analytics') {
        setTimeout(() => {
            updateCharts();
        }, 100);
    }
}

function updateActiveNav(activeItem) {
    navItems.forEach(item => item.classList.remove('active'));
    activeItem.classList.add('active');
}

// Modal Functions
function openModal() {
    productModal.classList.add('active');
    document.getElementById('productName').focus();
}

function closeModalFn() {
    productModal.classList.remove('active');
    productForm.reset();
}

// Add Product
function handleAddProduct(e) {
    e.preventDefault();
    
    const newProduct = {
        id: store.products.length + 1,
        name: document.getElementById('productName').value,
        sku: document.getElementById('productSKU').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        threshold: parseInt(document.getElementById('productThreshold').value),
        image: `https://images.unsplash.com/photo-1558171813-4c088753af8f?w=100&h=100&fit=crop`,
        sales: 0
    };
    
    store.products.push(newProduct);
    
    // Add activity
    store.activities.unshift({
        type: 'add',
        title: `New product added: ${newProduct.name}`,
        time: 'Just now',
        amount: newProduct.sku,
        icon: 'fa-plus'
    });
    
    closeModalFn();
    renderDashboard();
    renderInventory();
    showToast('Product added successfully!');
}

// Render Functions
function renderDashboard() {
    // Update stats
    const todaySales = store.sales
        .filter(s => s.date === '2024-03-26')
        .reduce((sum, s) => sum + s.total, 0);
    
    document.getElementById('todaySales').textContent = `$${todaySales.toLocaleString()}`;
    document.getElementById('totalProducts').textContent = store.products.length;
    
    const lowStock = store.products.filter(p => p.stock <= p.threshold);
    document.getElementById('lowStockCount').textContent = lowStock.length;
    
    const todayOrders = store.sales.filter(s => s.date === '2024-03-26').length;
    document.getElementById('ordersToday').textContent = todayOrders;
    
    // Render activity list
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = store.activities.slice(0, 4).map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="activity-details">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
            <div class="activity-amount">${activity.amount}</div>
        </div>
    `).join('');
    
    // Render low stock table
    const lowStockTable = document.getElementById('lowStockTable');
    lowStockTable.innerHTML = lowStock.map(product => `
        <tr>
            <td>
                <div class="product-cell">
                    <img src="${product.image}" alt="${product.name}" class="product-img">
                    <div class="product-info">
                        <h4>${product.name}</h4>
                        <span>${product.sku}</span>
                    </div>
                </div>
            </td>
            <td>${product.category}</td>
            <td>${product.stock}</td>
            <td>${product.threshold}</td>
            <td><span class="status-badge low-stock">Low Stock</span></td>
            <td><button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.875rem;">Restock</button></td>
        </tr>
    `).join('');
}

function renderInventory() {
    const tbody = document.getElementById('inventoryTable');
    tbody.innerHTML = store.products.map(product => {
        const status = product.stock === 0 ? 'out-of-stock' : 
                      product.stock <= product.threshold ? 'low-stock' : 'in-stock';
        const statusText = product.stock === 0 ? 'Out of Stock' : 
                          product.stock <= product.threshold ? 'Low Stock' : 'In Stock';
        
        return `
        <tr>
            <td>
                <div class="product-cell">
                    <img src="${product.image}" alt="${product.name}" class="product-img">
                    <div class="product-info">
                        <h4>${product.name}</h4>
                        <span>${product.sku}</span>
                    </div>
                </div>
            </td>
            <td>${product.sku}</td>
            <td>${product.category}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td><span class="status-badge ${status}">${statusText}</span></td>
            <td>
                <div class="action-btns">
                    <button class="action-btn" onclick="editProduct(${product.id})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn" onclick="deleteProduct(${product.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `}).join('');
}

function renderSales() {
    const tbody = document.getElementById('salesTable');
    tbody.innerHTML = store.sales.map(sale => `
        <tr>
            <td><strong>${sale.id}</strong></td>
            <td>${sale.date}</td>
            <td>${sale.customer}</td>
            <td>${sale.items} items</td>
            <td>$${sale.total.toFixed(2)}</td>
            <td>${sale.payment}</td>
            <td><span class="status-badge ${sale.status}">${sale.status}</span></td>
        </tr>
    `).join('');
    
    // Update summary
    const totalRevenue = store.sales.reduce((sum, s) => sum + s.total, 0);
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toLocaleString()}`;
    
    const monthRevenue = store.sales
        .filter(s => s.date.startsWith('2024-03'))
        .reduce((sum, s) => sum + s.total, 0);
    document.getElementById('monthRevenue').textContent = `$${monthRevenue.toLocaleString()}`;
    
    const avgOrder = totalRevenue / store.sales.length;
    document.getElementById('avgOrder').textContent = `$${Math.round(avgOrder)}`;
}

function renderAnalytics() {
    // Top products
    const topProducts = [...store.products]
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);
    
    const topProductsList = document.getElementById('topProductsList');
    topProductsList.innerHTML = topProducts.map((product, index) => `
        <div class="top-product-item">
            <div class="top-product-rank">${index + 1}</div>
            <img src="${product.image}" alt="${product.name}" class="product-img">
            <div class="top-product-info">
                <div class="top-product-name">${product.name}</div>
                <div class="top-product-sales">${product.sales} sold</div>
            </div>
            <div class="top-product-revenue">$${(product.sales * product.price).toLocaleString()}</div>
        </div>
    `).join('');
}

// Filter Functions
function filterInventory() {
    const category = document.getElementById('categoryFilter').value;
    const stock = document.getElementById('stockFilter').value;
    const search = document.getElementById('inventorySearch').value.toLowerCase();
    
    let filtered = store.products;
    
    if (category) {
        filtered = filtered.filter(p => p.category === category);
    }
    
    if (stock) {
        filtered = filtered.filter(p => {
            if (stock === 'in-stock') return p.stock > p.threshold;
            if (stock === 'low-stock') return p.stock > 0 && p.stock <= p.threshold;
            if (stock === 'out-of-stock') return p.stock === 0;
        });
    }
    
    if (search) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(search) || 
            p.sku.toLowerCase().includes(search)
        );
    }
    
    const tbody = document.getElementById('inventoryTable');
    tbody.innerHTML = filtered.map(product => {
        const status = product.stock === 0 ? 'out-of-stock' : 
                      product.stock <= product.threshold ? 'low-stock' : 'in-stock';
        const statusText = product.stock === 0 ? 'Out of Stock' : 
                          product.stock <= product.threshold ? 'Low Stock' : 'In Stock';
        
        return `
        <tr>
            <td>
                <div class="product-cell">
                    <img src="${product.image}" alt="${product.name}" class="product-img">
                    <div class="product-info">
                        <h4>${product.name}</h4>
                        <span>${product.sku}</span>
                    </div>
                </div>
            </td>
            <td>${product.sku}</td>
            <td>${product.category}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td><span class="status-badge ${status}">${statusText}</span></td>
            <td>
                <div class="action-btns">
                    <button class="action-btn" onclick="editProduct(${product.id})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn" onclick="deleteProduct(${product.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `}).join('');
}

// Chart Initialization
function initializeCharts() {
    // Sales Chart
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    salesChart = new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Sales',
                data: [1200, 1900, 1500, 2200, 1800, 2800, 2400],
                borderColor: '#6c5ce7',
                backgroundColor: 'rgba(108, 92, 231, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f1f2f6' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
    
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    revenueChart = new Chart(revenueCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue',
                data: [15000, 22000, 18000, 25000, 32000, 28000],
                backgroundColor: '#6c5ce7',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f1f2f6' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
    
    // Category Chart
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: ['Dresses', 'Tops', 'Bottoms', 'Accessories', 'Shoes'],
            datasets: [{
                data: [30, 25, 20, 15, 10],
                backgroundColor: [
                    '#6c5ce7',
                    '#fd79a8',
                    '#00b894',
                    '#fdcb6e',
                    '#e17055'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 20, usePointStyle: true }
                }
            }
        }
    });
}

function updateCharts() {
    if (salesChart) salesChart.update();
    if (revenueChart) revenueChart.update();
    if (categoryChart) categoryChart.update();
}

// Utility Functions
function showToast(message) {
    const toastEl = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => {
        toastEl.classList.remove('show');
    }, 3000);
}

function editProduct(id) {
    showToast('Edit functionality coming soon!');
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        store.products = store.products.filter(p => p.id !== id);
        renderInventory();
        renderDashboard();
        showToast('Product deleted successfully!');
    }
}

// Simulate real-time updates
setInterval(() => {
    // Randomly update today's sales for demo effect
    const currentSales = parseFloat(document.getElementById('todaySales').textContent.replace(/[$,]/g, ''));
    if (Math.random() > 0.7) {
        const newSales = currentSales + Math.floor(Math.random() * 100);
        document.getElementById('todaySales').textContent = `$${newSales.toLocaleString()}`;
    }
}, 10000);
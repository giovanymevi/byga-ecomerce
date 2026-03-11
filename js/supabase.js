// Configuración de Supabase
const SUPABASE_URL = 'https://spqttbwecnbqlfpgqrdg.supabase.co';
// ⚠️ ¡CAMBIO DE SEGURIDAD URGENTE! No uses la clave service_role aquí.
// Ve a tu panel de Supabase -> Project Settings -> API y usa la clave "anon" (public).
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwcXR0YndlY25icWxmcGdxcmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxODc0MzgsImV4cCI6MjA4ODc2MzQzOH0.9A1IqgXEymEcHjF8Xkdu1UBFsxlSxuA5TdB3YH2FUiA'; // <-- REEMPLAZA ESTO

// Inicializar Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variables globales
let currentProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 12;

// Función para obtener productos
async function fetchProducts() {
    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        currentProducts = data;
        filteredProducts = data;
        displayProducts();
        displayCategories();
    } catch (error) {
        console.error('Error fetching products:', error);
        showNotification('Error al cargar los productos', 'error');
    }
}

// Función para mostrar productos
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const productsToShow = filteredProducts.slice(start, end);

    productsGrid.innerHTML = productsToShow.map(product => `
        <div class="product-card">
            <img src="${product.image_url}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-category">${product.category}</p>
                <p class="product-price">${product.price.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</p>
                <p class="product-stock">Stock: ${product.stock}</p>
                <button onclick="addToCart(${product.id})" class="btn-add-cart" ${product.stock === 0 ? 'disabled' : ''}>
                    ${product.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
                </button>
            </div>
        </div>
    `).join('');

    displayPagination();
}

// Función para mostrar categorías
function displayCategories() {
    const categoryGrid = document.getElementById('categoryGrid');
    const navDropdown = document.getElementById('nav-categories-dropdown');
    if (!categoryGrid && !navDropdown) return;

    const categories = [...new Set(currentProducts.map(p => p.category))];
    const categoryIcons = {
        'Zapatillas': 'fa-shoe-prints',
        'Botines': 'fa-hiking',
        'Zapatos': 'fa-shoe-prints',
        'Sandalias': 'fa-shoe-prints',
        'Botas': 'fa-hiking',
        'Ojotas': 'fa-shoe-prints',
        'Infantil': 'fa-child'
    };

    if (categoryGrid) {
        categoryGrid.innerHTML = categories.map(category => `
            <div class="category-card" onclick="filterByCategory('${category}')">
                <i class="fas ${categoryIcons[category] || 'fa-shoe-prints'}"></i>
                <h3>${category}</h3>
            </div>
        `).join('');
    }

    if (navDropdown) {
        // Populate the navbar dropdown
        navDropdown.innerHTML = categories.map(category => 
            `<a href="#productos" onclick="filterByCategoryAndScroll('${category}')">${category}</a>`
        ).join('');
    }
}

// Función para mostrar paginación
function displayPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    let buttons = '';
    for (let i = 1; i <= totalPages; i++) {
        buttons += `<button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
    }
    
    pagination.innerHTML = buttons;
}

// Función para cambiar página
function changePage(page) {
    currentPage = page;
    displayProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Función para filtrar por categoría
function filterByCategory(category) {
    document.getElementById('categoryFilter').value = category;
    filterProducts();
}

// Función para filtrar desde el menú y hacer scroll
function filterByCategoryAndScroll(category) {
    filterByCategory(category);
    scrollToProducts();

    // Cerrar menú móvil si está abierto
    if (window.innerWidth <= 768) {
        const navLinks = document.getElementById('nav-links');
        const dropdownMenu = document.querySelector('.dropdown-menu');
        navLinks.classList.remove('active');
        dropdownMenu.classList.remove('active');
        document.querySelector('.dropdown-toggle i').classList.remove('rotated');
    }
}

// Función para filtrar productos
function filterProducts() {
    const category = document.getElementById('categoryFilter').value;
    const sortBy = document.getElementById('sortFilter').value;

    // Filtrar por categoría
    filteredProducts = category 
        ? currentProducts.filter(p => p.category === category)
        : [...currentProducts];

    // Ordenar
    if (sortBy === 'price-asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    currentPage = 1;
    displayProducts();
}

// Función para ordenar productos
function sortProducts() {
    filterProducts();
}

// Función para mostrar notificaciones
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Scroll a productos
function scrollToProducts() {
    document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    initCart();
});
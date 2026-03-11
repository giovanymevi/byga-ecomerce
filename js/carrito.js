// Variables del carrito
let cart = [];

// Inicializar carrito
function initCart() {
    // Cargar carrito del localStorage
    const savedCart = localStorage.getItem('bygaCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCartUI();
    createCartSidebar();
}

// Crear sidebar del carrito
function createCartSidebar() {
    const cartSidebar = document.createElement('div');
    cartSidebar.className = 'cart-sidebar';
    cartSidebar.id = 'cartSidebar';
    document.body.appendChild(cartSidebar);
    
    // Evento para abrir/cerrar carrito
    document.querySelector('.cart-icon').addEventListener('click', toggleCart);
    
    // Cerrar carrito al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!cartSidebar.contains(e.target) && !e.target.closest('.cart-icon')) {
            cartSidebar.classList.remove('active');
        }
    });
}

// Toggle carrito
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.classList.toggle('active');
    updateCartSidebar();
}

// Agregar al carrito
async function addToCart(productId) {
    const product = currentProducts.find(p => p.id === productId);
    
    if (!product || product.stock === 0) {
        showNotification('Producto sin stock', 'error');
        return;
    }

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            showNotification('Stock máximo alcanzado', 'error');
            return;
        }
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image_url,
            quantity: 1,
            maxStock: product.stock
        });
    }

    saveCart();
    updateCartUI();
    showNotification('Producto agregado al carrito');
}

// Actualizar UI del carrito
function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Actualizar sidebar del carrito
function updateCartSidebar() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (!cartSidebar) return;

    if (cart.length === 0) {
        cartSidebar.innerHTML = `
            <div class="cart-header">
                <h3>Carrito de Compras</h3>
                <button class="close-cart" onclick="toggleCart()">&times;</button>
            </div>
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-shopping-cart" style="font-size: 4rem; color: #ddd;"></i>
                <p style="margin-top: 1rem;">Tu carrito está vacío</p>
            </div>
        `;
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartSidebar.innerHTML = `
        <div class="cart-header">
            <h3>Carrito de Compras</h3>
            <button class="close-cart" onclick="toggleCart()">&times;</button>
        </div>
        <div class="cart-items">
            ${cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">${item.price.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                    <button onclick="removeFromCart(${item.id})" style="background: none; border: none; color: #e74c3c; cursor: pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('')}
        </div>
        <div class="cart-total">
            Total: ${total.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
        </div>
        <button class="btn-checkout" onclick="checkout()">Proceder al Pago</button>
    `;
}

// Actualizar cantidad
function updateQuantity(productId, newQuantity) {
    const item = cart.find(i => i.id === productId);
    
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    if (newQuantity > item.maxStock) {
        showNotification('Stock máximo alcanzado', 'error');
        return;
    }

    item.quantity = newQuantity;
    saveCart();
    updateCartUI();
    updateCartSidebar();
}

// Eliminar del carrito
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    updateCartSidebar();
    showNotification('Producto eliminado del carrito');
}

// Guardar carrito
function saveCart() {
    localStorage.setItem('bygaCart', JSON.stringify(cart));
}

// Procesar compra
async function checkout() {
    if (cart.length === 0) {
        showNotification('El carrito está vacío', 'error');
        return;
    }

    const phoneNumber = '584247423318'; // Número de WhatsApp de la tienda

    // Construir el mensaje con los detalles del pedido
    let message = '¡Hola Calzados Byga! 👋\n\nQuisiera realizar el siguiente pedido:\n\n';

    cart.forEach(item => {
        const itemPrice = item.price.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
        message += `*Producto:* ${item.name}\n`;
        message += `*Cantidad:* ${item.quantity}\n`;
        message += `*Precio Unitario:* ${itemPrice}\n\n`;
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalFormatted = total.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
    message += `*Total a Pagar: ${totalFormatted}*\n\n`;
    message += 'Para la entrega, por favor, indícame tu dirección. 🚚\n\n';
    message += '¡Quedo a la espera de tu respuesta para coordinar el pago y envío!';

    // Codificar el mensaje para la URL y crear el enlace de WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    // Redirigir a WhatsApp en una nueva pestaña y limpiar el carrito localmente
    window.open(whatsappURL, '_blank');
    showNotification('Te estamos redirigiendo a WhatsApp para completar tu pedido...', 'success');
    
    setTimeout(() => {
        cart = [];
        saveCart();
        updateCartUI();
        toggleCart();
    }, 2000);
}
// Cart Management
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart') || '[]');
        this.updateCartUI();
    }

    // Add item to cart
    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartUI();
        this.showNotification(`${product.name} adicionado ao carrinho!`, 'success');
    }

    // Remove item from cart
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartUI();
    }

    // Update item quantity
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartUI();
            }
        }
    }

    // Clear cart
    clear() {
        this.items = [];
        this.saveCart();
        this.updateCartUI();
    }

    // Get cart total
    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Get cart count
    getCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    // Update cart UI
    updateCartUI() {
        // Update cart count
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = this.getCount();
        }

        // Update cart items in modal
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        if (cartItems) {
            if (this.items.length === 0) {
                cartItems.innerHTML = '<p class="empty-cart">Seu carrinho está vazio</p>';
            } else {
                cartItems.innerHTML = this.items.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-image" style="background-image: url('${item.image}')"></div>
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">R$ ${item.price.toFixed(2)}</div>
                            <div class="cart-item-quantity">
                                <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                                <span>${item.quantity}</span>
                                <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                            </div>
                        </div>
                        <button class="remove-item" onclick="cart.removeItem('${item.id}')">Remover</button>
                    </div>
                `).join('');
            }
        }

        if (cartTotal) {
            cartTotal.textContent = this.getTotal().toFixed(2);
        }
    }

    // Show notification
    showNotification(message, type = 'success') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    color: white;
                    font-weight: 600;
                    z-index: 10000;
                    animation: slideIn 0.3s ease-out;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                }
                
                .notification.success {
                    background: linear-gradient(135deg, #2ed573, #26d465);
                }
                
                .notification.error {
                    background: linear-gradient(135deg, #ff4757, #ff3838);
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        // Add to document
        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Checkout process
    checkout() {
        if (this.items.length === 0) {
            this.showNotification('Seu carrinho está vazio!', 'error');
            return;
        }

        // Simulate checkout process
        const customerName = prompt('Digite seu nome:');
        const customerEmail = prompt('Digite seu email:');
        
        if (!customerName || !customerEmail) {
            this.showNotification('Informações obrigatórias não preenchidas!', 'error');
            return;
        }

        // Create sale record
        const sale = {
            customer: {
                name: customerName,
                email: customerEmail
            },
            items: this.items,
            total: this.getTotal(),
            status: 'completed'
        };

        // Save sale
        window.db.addSale(sale, () => {
            this.showNotification('Compra realizada com sucesso!', 'success');
            this.clear();
            toggleCart();
            
            // Update product stock
            this.items.forEach(item => {
                window.db.getProducts((products) => {
                    const product = products.find(p => p.id === item.id);
                    if (product) {
                        window.db.updateProduct(item.id, {
                            stock: Math.max(0, product.stock - item.quantity)
                        });
                    }
                });
            });
        });
    }
}

// Initialize cart
const cart = new Cart();

// Cart toggle functions
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.toggle('open');
        cartOverlay.classList.toggle('show');
    }
}

// Checkout function
function checkout() {
    cart.checkout();
}

// Add to cart function
function addToCart(product) {
    cart.addItem(product);
}

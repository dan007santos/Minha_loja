// Main JavaScript for the store
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    loadProducts();
    setupEventListeners();
    setupSmoothScrolling();
}

// Load and display products
function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    // Show loading state
    productsGrid.innerHTML = '<div class="loading">Carregando produtos...</div>';

    // Load products from database
    window.db.getProducts((products) => {
        if (products.length === 0) {
            productsGrid.innerHTML = '<div class="loading">Nenhum produto encontrado.</div>';
            return;
        }

        // Generate product cards HTML
        const productsHTML = products.map(product => createProductCard(product)).join('');
        productsGrid.innerHTML = productsHTML;

        // Add fade-in animation
        const productCards = productsGrid.querySelectorAll('.product-card');
        productCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'all 0.5s ease';
                
                requestAnimationFrame(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });
            }, index * 100);
        });
    });
}

// Create product card HTML
function createProductCard(product) {
    const stockStatus = product.stock > 0 ? '' : '<div class="out-of-stock">Esgotado</div>';
    const addButtonDisabled = product.stock > 0 ? '' : 'disabled style="opacity: 0.5; cursor: not-allowed;"';
    
    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image" style="background-image: url('${product.image}')">
                ${stockStatus}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">R$ ${product.price.toFixed(2)}</div>
                <div class="product-stock">Estoque: ${product.stock} unidades</div>
                <div class="product-actions">
                    <button class="btn-add-cart" onclick="handleAddToCart('${product.id}')" ${addButtonDisabled}>
                        <i class="fas fa-cart-plus"></i> Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Handle add to cart
function handleAddToCart(productId) {
    window.db.getProducts((products) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            if (product.stock > 0) {
                cart.addItem(product);
            } else {
                cart.showNotification('Produto fora de estoque!', 'error');
            }
        }
    });
}

// Cart functions for new modal structure
function openCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Close cart when clicking outside
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.addEventListener('click', function(e) {
            if (e.target === cartModal) {
                closeCart();
            }
        });
    }

    // Handle escape key to close cart
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeCart();
        }
    });

    // Handle window resize
    window.addEventListener('resize', handleResize);
}

// Handle window resize
function handleResize() {
    // Handle any resize-related updates
}

// Setup smooth scrolling
function setupSmoothScrolling() {
    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight || 70;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Smooth scroll for CTA button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            e.preventDefault();
            const targetElement = document.querySelector('#products');
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight || 70;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
}

// Scroll to function for buttons
function scrollTo(selector) {
    const element = document.querySelector(selector);
    if (element) {
        const headerHeight = document.querySelector('.header').offsetHeight || 70;
        const targetPosition = element.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Checkout function
function checkout() {
    cart.checkout();
}

// Add CSS for modal and new structure
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .cart-modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        align-items: center;
        justify-content: center;
    }

    .cart-content {
        background-color: white;
        padding: 20px;
        border-radius: 15px;
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
    }

    .close-cart {
        position: absolute;
        top: 15px;
        right: 20px;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
        background: none;
        border: none;
        color: #aaa;
    }

    .close-cart:hover {
        color: #000;
    }

    .cart-content h2 {
        margin-top: 0;
        margin-bottom: 20px;
        color: #333;
    }

    .checkout-btn {
        width: 100%;
        padding: 15px;
        background: #ff4757;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 15px;
        transition: background 0.3s;
    }

    .checkout-btn:hover {
        background: #ff3838;
    }

    .out-of-stock {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(255, 71, 87, 0.9);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 600;
    }
    
    .product-stock {
        font-size: 0.9rem;
        color: #666;
        margin-bottom: 1rem;
    }
    
    .product-card .product-actions button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .empty-cart {
        text-align: center;
        color: #666;
        padding: 20px;
    }

    .cart-total {
        text-align: center;
        font-size: 1.2rem;
        margin: 15px 0;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
    }
`;
document.head.appendChild(additionalStyles);

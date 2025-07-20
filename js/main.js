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

// Setup event listeners
function setupEventListeners() {
    // Close cart when clicking outside
    document.addEventListener('click', function(e) {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartIcon = document.querySelector('.cart-icon');
        
        if (cartSidebar && cartSidebar.classList.contains('open')) {
            if (!cartSidebar.contains(e.target) && !cartIcon.contains(e.target)) {
                toggleCart();
            }
        }
    });

    // Handle escape key to close cart
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const cartSidebar = document.getElementById('cartSidebar');
            if (cartSidebar && cartSidebar.classList.contains('open')) {
                toggleCart();
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', handleResize);
}

// Handle window resize
function handleResize() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar && window.innerWidth <= 768) {
        cartSidebar.style.width = '100vw';
    } else if (cartSidebar) {
        cartSidebar.style.width = '400px';
    }
}

// Setup smooth scrolling
function setupSmoothScrolling() {
    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('.nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll to function for buttons
function scrollTo(selector) {
    const element = document.querySelector(selector);
    if (element) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = element.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Search functionality
function searchProducts(query) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    window.db.getProducts((products) => {
        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase())
        );

        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = '<div class="loading">Nenhum produto encontrado para sua busca.</div>';
        } else {
            const productsHTML = filteredProducts.map(product => createProductCard(product)).join('');
            productsGrid.innerHTML = productsHTML;
        }
    });
}

// Filter products by price range
function filterByPrice(minPrice, maxPrice) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    window.db.getProducts((products) => {
        const filteredProducts = products.filter(product => 
            product.price >= minPrice && product.price <= maxPrice
        );

        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = '<div class="loading">Nenhum produto encontrado nesta faixa de preço.</div>';
        } else {
            const productsHTML = filteredProducts.map(product => createProductCard(product)).join('');
            productsGrid.innerHTML = productsHTML;
        }
    });
}

// Sort products
function sortProducts(criteria) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    window.db.getProducts((products) => {
        let sortedProducts = [...products];

        switch (criteria) {
            case 'price-low':
                sortedProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                sortedProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'stock':
                sortedProducts.sort((a, b) => b.stock - a.stock);
                break;
        }

        const productsHTML = sortedProducts.map(product => createProductCard(product)).join('');
        productsGrid.innerHTML = productsHTML;
    });
}

// Newsletter subscription (mock)
function subscribeNewsletter(email) {
    if (!email || !email.includes('@')) {
        alert('Por favor, insira um email válido.');
        return;
    }

    // Mock subscription
    alert('Obrigado por se inscrever na nossa newsletter!');
}

// Contact form submission (mock)
function submitContactForm(formData) {
    // Mock form submission
    alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
}

// Utility functions
const utils = {
    // Format currency
    formatCurrency: (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },

    // Format date
    formatDate: (date) => {
        return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
    },

    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Add CSS for out of stock
const outOfStockStyles = document.createElement('style');
outOfStockStyles.textContent = `
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
`;
document.head.appendChild(outOfStockStyles);

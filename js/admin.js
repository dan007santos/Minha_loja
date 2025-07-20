// Admin Panel JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

// Initialize admin panel
function initializeAdmin() {
    loadDashboardStats();
    loadProductsTable();
    loadSalesTable();
    setupAdminEventListeners();
}

// Load dashboard statistics
function loadDashboardStats() {
    // Load products count
    window.db.getProducts((products) => {
        document.getElementById('totalProducts').textContent = products.length;
    });

    // Load sales data
    window.db.getSales((sales) => {
        document.getElementById('totalSales').textContent = sales.length;
        
        const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        document.getElementById('totalRevenue').textContent = totalRevenue.toFixed(2);
    });
}

// Load products table
function loadProductsTable() {
    const tableBody = document.getElementById('productsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="5" class="loading">Carregando produtos...</td></tr>';

    window.db.getProducts((products) => {
        if (products.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #666;">Nenhum produto cadastrado</td></tr>';
            return;
        }

        tableBody.innerHTML = products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>R$ ${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>
                    <button class="btn-edit" onclick="editProduct('${product.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-danger" onclick="deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </td>
            </tr>
        `).join('');
    });
}

// Load sales table
function loadSalesTable() {
    const tableBody = document.getElementById('salesTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="5" class="loading">Carregando vendas...</td></tr>';

    window.db.getSales((sales) => {
        if (sales.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #666;">Nenhuma venda registrada</td></tr>';
            return;
        }

        const sortedSales = sales.sort((a, b) => new Date(b.date) - new Date(a.date));

        tableBody.innerHTML = sortedSales.map(sale => {
            const date = sale.date ? new Date(sale.date).toLocaleDateString('pt-BR') : 'N/A';
            const customer = sale.customer ? sale.customer.name : 'Cliente não informado';
            const itemsCount = sale.items ? sale.items.length : 0;
            const total = sale.total || 0;
            const status = sale.status || 'pending';

            return `
                <tr>
                    <td>${date}</td>
                    <td>${customer}</td>
                    <td>${itemsCount} item(s)</td>
                    <td>R$ ${total.toFixed(2)}</td>
                    <td>
                        <span class="status-badge status-${status}">
                            ${status === 'completed' ? 'Concluído' : 'Pendente'}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
    });
}

// Setup admin event listeners
function setupAdminEventListeners() {
    // Add product form
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }

    // Modal close events
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAddProductModal();
        }
    });
}

// Show add product modal
function showAddProductModal() {
    const modal = document.getElementById('addProductModal');
    const overlay = document.getElementById('modalOverlay');
    
    if (modal && overlay) {
        modal.classList.add('show');
        overlay.classList.add('show');
        
        // Focus on first input
        const firstInput = modal.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

// Close add product modal
function closeAddProductModal() {
    const modal = document.getElementById('addProductModal');
    const overlay = document.getElementById('modalOverlay');
    
    if (modal && overlay) {
        modal.classList.remove('show');
        overlay.classList.remove('show');
        
        // Reset form
        const form = document.getElementById('addProductForm');
        if (form) {
            form.reset();
        }
    }
}

// Handle add product
function handleAddProduct(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const product = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        image: document.getElementById('productImage').value,
        stock: parseInt(document.getElementById('productStock').value)
    };

    // Validate product data
    if (!product.name || !product.description || !product.price || !product.image || product.stock < 0) {
        showAdminNotification('Por favor, preencha todos os campos corretamente.', 'error');
        return;
    }

    // Add product to database
    window.db.addProduct(product, () => {
        showAdminNotification('Produto adicionado com sucesso!', 'success');
        closeAddProductModal();
        loadProductsTable();
        loadDashboardStats();
    });
}

// Edit product
function editProduct(productId) {
    window.db.getProducts((products) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        // Simple prompt-based edit (can be enhanced with a proper modal)
        const newName = prompt('Nome do produto:', product.name);
        if (newName === null) return;

        const newPrice = prompt('Preço:', product.price);
        if (newPrice === null) return;

        const newStock = prompt('Estoque:', product.stock);
        if (newStock === null) return;

        const updatedProduct = {
            name: newName,
            price: parseFloat(newPrice),
            stock: parseInt(newStock)
        };

        // Validate
        if (!updatedProduct.name || isNaN(updatedProduct.price) || isNaN(updatedProduct.stock)) {
            showAdminNotification('Dados inválidos!', 'error');
            return;
        }

        window.db.updateProduct(productId, updatedProduct, () => {
            showAdminNotification('Produto atualizado com sucesso!', 'success');
            loadProductsTable();
            loadDashboardStats();
        });
    });
}

// Delete product
function deleteProduct(productId) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
        return;
    }

    window.db.deleteProduct(productId, () => {
        showAdminNotification('Produto excluído com sucesso!', 'success');
        loadProductsTable();
        loadDashboardStats();
    });
}

// Show admin notification
function showAdminNotification(message, type = 'success') {
    // Remove existing notification
    const existingNotification = document.querySelector('.admin-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    // Add styles if not already present
    if (!document.querySelector('#admin-notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'admin-notification-styles';
        styles.textContent = `
            .admin-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                z-index: 10000;
                animation: slideInAdmin 0.3s ease-out;
                box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                min-width: 300px;
            }
            
            .admin-notification.success {
                background: linear-gradient(135deg, #2ed573, #26d465);
            }
            
            .admin-notification.error {
                background: linear-gradient(135deg, #ff4757, #ff3838);
            }
            
            .admin-notification .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                margin-left: auto;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            @keyframes slideInAdmin {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // Add to document
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideInAdmin 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Export data functionality
function exportData(type) {
    if (type === 'products') {
        window.db.getProducts((products) => {
            downloadJSON(products, 'produtos.json');
        });
    } else if (type === 'sales') {
        window.db.getSales((sales) => {
            downloadJSON(sales, 'vendas.json');
        });
    }
}

// Download JSON helper
function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showAdminNotification(`Dados exportados para ${filename}`, 'success');
}

// Analytics functions
const analytics = {
    // Get top selling products
    getTopProducts: function(callback) {
        window.db.getSales((sales) => {
            const productSales = {};
            
            sales.forEach(sale => {
                if (sale.items) {
                    sale.items.forEach(item => {
                        if (!productSales[item.id]) {
                            productSales[item.id] = {
                                name: item.name,
                                quantity: 0,
                                revenue: 0
                            };
                        }
                        productSales[item.id].quantity += item.quantity;
                        productSales[item.id].revenue += item.price * item.quantity;
                    });
                }
            });
            
            const topProducts = Object.values(productSales)
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5);
            
            callback(topProducts);
        });
    },

    // Get sales by month
    getSalesByMonth: function(callback) {
        window.db.getSales((sales) => {
            const salesByMonth = {};
            
            sales.forEach(sale => {
                if (sale.date) {
                    const month = new Date(sale.date).toISOString().slice(0, 7);
                    if (!salesByMonth[month]) {
                        salesByMonth[month] = {
                            count: 0,
                            revenue: 0
                        };
                    }
                    salesByMonth[month].count++;
                    salesByMonth[month].revenue += sale.total || 0;
                }
            });
            
            callback(salesByMonth);
        });
    }
};

// Initialize analytics if needed
function loadAnalytics() {
    // This can be expanded to show charts and detailed analytics
    analytics.getTopProducts((topProducts) => {
        console.log('Top Products:', topProducts);
    });

    analytics.getSalesByMonth((salesByMonth) => {
        console.log('Sales by Month:', salesByMonth);
    });
}

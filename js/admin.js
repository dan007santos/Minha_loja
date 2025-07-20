// Admin Panel JavaScript - Orders Focus
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

// Initialize admin panel
function initializeAdmin() {
    loadOrders();
    loadStats();
    setupAutoRefresh();
}

// Load orders from database
function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;

    // Show loading state
    ordersList.innerHTML = '<p class="loading">Carregando pedidos...</p>';

    // Load sales (orders) from database
    window.db.getSales((orders) => {
        if (orders.length === 0) {
            ordersList.innerHTML = '<p class="loading">Nenhum pedido encontrado ainda. 📦</p>';
            return;
        }

        // Sort orders by date (most recent first)
        const sortedOrders = orders.sort((a, b) => {
            const dateA = new Date(a.date || 0);
            const dateB = new Date(b.date || 0);
            return dateB - dateA;
        });

        // Generate orders HTML
        const ordersHTML = sortedOrders.map(order => createOrderCard(order)).join('');
        ordersList.innerHTML = ordersHTML;
    });
}

// Create order card HTML
function createOrderCard(order) {
    const orderId = order.id || generateOrderId();
    const orderDate = order.date ? new Date(order.date).toLocaleString('pt-BR') : 'Data não disponível';
    const customerName = order.customer?.name || 'Cliente não identificado';
    const customerEmail = order.customer?.email || 'Email não fornecido';
    const total = order.total || 0;
    const status = order.status || 'pending';
    
    // Generate items list
    let itemsHTML = '';
    if (order.items && order.items.length > 0) {
        itemsHTML = order.items.map(item => `
            <div class="order-item">
                <span>${item.name || 'Produto'}</span>
                <span>${item.quantity || 1}x R$ ${(item.price || 0).toFixed(2)}</span>
            </div>
        `).join('');
    } else {
        itemsHTML = '<div class="order-item"><span>Itens não disponíveis</span></div>';
    }

    const statusColor = status === 'completed' ? '#2ed573' : '#ffa502';
    const statusText = status === 'completed' ? '✅ Concluído' : '⏳ Pendente';

    return `
        <div class="order-card">
            <div class="order-header">
                <div class="order-id">Pedido #${orderId}</div>
                <div class="order-date">${orderDate}</div>
            </div>
            <div class="order-customer">
                <h4>👤 ${customerName}</h4>
                <p>📧 ${customerEmail}</p>
            </div>
            <div class="order-items">
                <strong>📋 Itens do Pedido:</strong>
                ${itemsHTML}
            </div>
            <div class="order-status" style="color: ${statusColor}; margin-bottom: 1rem;">
                <strong>${statusText}</strong>
            </div>
            <div class="order-total">
                💰 Total: R$ ${total.toFixed(2)}
            </div>
        </div>
    `;
}

// Generate order ID
function generateOrderId() {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Load statistics
function loadStats() {
    const totalOrdersEl = document.getElementById('totalOrders');
    const totalRevenueEl = document.getElementById('totalRevenue');

    window.db.getSales((orders) => {
        if (totalOrdersEl) {
            totalOrdersEl.textContent = orders.length;
        }

        if (totalRevenueEl) {
            const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
            totalRevenueEl.textContent = `R$ ${totalRevenue.toFixed(2)}`;
        }
    });
}

// Setup auto refresh every 30 seconds
function setupAutoRefresh() {
    setInterval(() => {
        loadOrders();
        loadStats();
    }, 30000); // Refresh every 30 seconds
}

// Utility functions for notifications
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

// Page visibility handling for real-time updates
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Page became visible, refresh data
        loadOrders();
        loadStats();
    }
});

console.log('🔧 Admin Panel carregado - Monitoramento de pedidos ativo!');

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

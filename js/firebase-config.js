// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB8XvH8Nz7K9qY6wP3L1fM5gN2oQ4rS8tU",
    authDomain: "minha-loja-virtual.firebaseapp.com",
    databaseURL: "https://minha-loja-virtual-default-rtdb.firebaseio.com/",
    projectId: "minha-loja-virtual",
    storageBucket: "minha-loja-virtual.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc123def456ghi789"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
    
    // Get database reference
    window.database = firebase.database();
    
    // Initialize sample data if needed
    initializeSampleData();
    
} catch (error) {
    console.error('Firebase initialization error:', error);
    
    // Fallback to localStorage if Firebase fails
    console.log('Using localStorage as fallback');
    window.useLocalStorage = true;
}

// Initialize sample data
function initializeSampleData() {
    if (window.useLocalStorage) {
        // Initialize localStorage data
        if (!localStorage.getItem('products')) {
            localStorage.setItem('products', JSON.stringify(getSampleProducts()));
        }
        if (!localStorage.getItem('sales')) {
            localStorage.setItem('sales', JSON.stringify([]));
        }
    } else {
        // Initialize Firebase data
        const productsRef = database.ref('products');
        productsRef.once('value', (snapshot) => {
            if (!snapshot.exists()) {
                const sampleProducts = getSampleProducts();
                sampleProducts.forEach(product => {
                    productsRef.push(product);
                });
            }
        });
    }
}

// Sample products data
function getSampleProducts() {
    return [
        {
            name: "Smartphone Galaxy Pro",
            description: "Smartphone de última geração com câmera de 108MP e tela OLED de 6.7 polegadas. Perfeito para quem busca tecnologia e qualidade.",
            price: 1299.99,
            image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop&crop=center",
            stock: 15
        },
        {
            name: "Notebook Gamer Ultra",
            description: "Notebook gamer com placa de vídeo RTX 4060, processador Intel i7 e 16GB RAM. Ideal para jogos e trabalho pesado.",
            price: 3499.99,
            image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop&crop=center",
            stock: 8
        },
        {
            name: "Fone Bluetooth Premium",
            description: "Fone de ouvido wireless com cancelamento de ruído ativo e autonomia de 30 horas. Som cristalino e design elegante.",
            price: 299.99,
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&crop=center",
            stock: 25
        },
        {
            name: "Smartwatch Fitness",
            description: "Relógio inteligente com monitor cardíaco, GPS integrado e resistência à água. Acompanhe sua saúde 24/7.",
            price: 899.99,
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop&crop=center",
            stock: 12
        },
        {
            name: "Tablet Pro 12.9",
            description: "Tablet profissional com tela Liquid Retina, processador M2 e suporte para Apple Pencil. Perfeito para criatividade.",
            price: 2199.99,
            image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop&crop=center",
            stock: 6
        },
        {
            name: "Câmera DSLR 4K",
            description: "Câmera profissional com gravação 4K, lente 18-55mm incluída e sensor APS-C. Capture momentos únicos com qualidade excepcional.",
            price: 1899.99,
            image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop&crop=center",
            stock: 4
        }
    ];
}

// Database helper functions
window.db = {
    // Get all products
    getProducts: function(callback) {
        if (window.useLocalStorage) {
            const products = JSON.parse(localStorage.getItem('products') || '[]');
            callback(products);
        } else {
            database.ref('products').once('value', (snapshot) => {
                const products = [];
                snapshot.forEach((child) => {
                    products.push({
                        id: child.key,
                        ...child.val()
                    });
                });
                callback(products);
            });
        }
    },
    
    // Add product
    addProduct: function(product, callback) {
        if (window.useLocalStorage) {
            const products = JSON.parse(localStorage.getItem('products') || '[]');
            const newProduct = {
                ...product,
                id: Date.now().toString()
            };
            products.push(newProduct);
            localStorage.setItem('products', JSON.stringify(products));
            if (callback) callback(newProduct);
        } else {
            database.ref('products').push(product, callback);
        }
    },
    
    // Update product
    updateProduct: function(id, product, callback) {
        if (window.useLocalStorage) {
            const products = JSON.parse(localStorage.getItem('products') || '[]');
            const index = products.findIndex(p => p.id === id);
            if (index !== -1) {
                products[index] = { ...products[index], ...product };
                localStorage.setItem('products', JSON.stringify(products));
            }
            if (callback) callback();
        } else {
            database.ref(`products/${id}`).update(product, callback);
        }
    },
    
    // Delete product
    deleteProduct: function(id, callback) {
        if (window.useLocalStorage) {
            const products = JSON.parse(localStorage.getItem('products') || '[]');
            const filtered = products.filter(p => p.id !== id);
            localStorage.setItem('products', JSON.stringify(filtered));
            if (callback) callback();
        } else {
            database.ref(`products/${id}`).remove(callback);
        }
    },
    
    // Add sale
    addSale: function(sale, callback) {
        if (window.useLocalStorage) {
            const sales = JSON.parse(localStorage.getItem('sales') || '[]');
            const newSale = {
                ...sale,
                id: Date.now().toString(),
                date: new Date().toISOString()
            };
            sales.push(newSale);
            localStorage.setItem('sales', JSON.stringify(sales));
            if (callback) callback(newSale);
        } else {
            database.ref('sales').push({
                ...sale,
                date: firebase.database.ServerValue.TIMESTAMP
            }, callback);
        }
    },
    
    // Get sales
    getSales: function(callback) {
        if (window.useLocalStorage) {
            const sales = JSON.parse(localStorage.getItem('sales') || '[]');
            callback(sales);
        } else {
            database.ref('sales').once('value', (snapshot) => {
                const sales = [];
                snapshot.forEach((child) => {
                    sales.push({
                        id: child.key,
                        ...child.val()
                    });
                });
                callback(sales);
            });
        }
    }
};

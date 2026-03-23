const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

// Initialize database
const db = new sqlite3.Database('./sunnic.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initDatabase();
    }
});

// Initialize database tables
function initDatabase() {
    db.serialize(() => {
        // Products table
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            fabric TEXT,
            fabric_weight TEXT,
            sleeve_yarn TEXT,
            price REAL NOT NULL,
            moq TEXT,
            description TEXT,
            image_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Orders table
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            message TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating users table:', err);
            } else {
                // Insert default admin user if not exists
                const defaultPassword = bcrypt.hashSync('admin123', 10);
                db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)`,
                    ['admin', defaultPassword, 'admin']);
            }
        });

        // Insert sample products if table is empty
        db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
            if (err) {
                console.error('Error checking products count:', err);
            } else if (row.count === 0) {
                insertSampleProducts();
            }
        });
    });
}

// Insert sample products
function insertSampleProducts() {
    const products = [
        { name: 'Padded Jacket', fabric: '100% nylon', fabric_weight: '50g/m2', price: 68, moq: '800 PCS/COLOR', description: 'High-quality padded jacket with 100% nylon fabric.', image_url: '/images/products/product-01.png' },
        { name: 'Padded Jacket', fabric: '100% nylon', fabric_weight: '50g/m2', price: 79, moq: '1000 PCS/COLOR', description: 'Premium padded jacket with excellent insulation properties.', image_url: '/images/products/product-02.png' },
        { name: 'Padded Coat', fabric: '100% nylon', fabric_weight: '60g/m2', price: 83, moq: '1000 PCS/COLOR', description: 'Elegant padded coat suitable for both casual and formal occasions.', image_url: '/images/products/product-03.png' },
        { name: 'Padded Coat', fabric: '100% nylon', fabric_weight: '50g/m2', price: 87, moq: '1000 PCS/COLOR', description: 'Stylish padded coat with modern design.', image_url: '/images/products/product-04.png' },
        { name: 'Padded Jacket', fabric: '100% nylon', fabric_weight: '60g/m2', price: 87, moq: '1000 PCS/COLOR', description: 'Durable padded jacket perfect for outdoor activities.', image_url: '/images/products/product-05.png' },
        { name: 'Padded Jacket', fabric: '100% polyester', fabric_weight: '60g/m2', price: 88, moq: '800 PCS/COLOR', description: 'Lightweight padded jacket with polyester fabric.', image_url: '/images/products/product-06.png' },
        { name: 'Padded Coat', fabric: '100% nylon', sleeve_yarn: '97% cotton 3% spandex', price: 96, moq: '1000 PCS/COLOR', description: 'Premium padded coat with cotton blend sleeves.', image_url: '/images/products/product-07.png' },
        { name: 'Padded Coat', fabric: '100% nylon', sleeve_yarn: '97% cotton 3% spandex', price: 97, moq: '1000 PCS/COLOR', description: 'High-end padded coat with superior quality.', image_url: '/images/products/product-08.png' },
        { name: 'Padded Coat', fabric: '100% polyester', fabric_weight: '70g/m2', price: 105, moq: '1000 PCS/COLOR', description: 'Luxury padded coat for extreme cold.', image_url: '/images/products/product-09.png' },
        { name: 'Men\'s Jacket', fabric: '100% polyester', fabric_weight: '280g/m2', price: 65, moq: '1000 PCS/COLOR', description: 'Classic men\'s jacket with durable polyester.', image_url: '/images/products/product-10.png' },
        { name: 'Men\'s Jacket', fabric: '73% polyester 15% polyamide 12% cotton', fabric_weight: '95g/m2', price: 89, moq: '1000 PCS/COLOR', description: 'Premium men\'s jacket with blend fabric.', image_url: '/images/products/product-11.png' },
        { name: 'Vest', fabric: '100% polyester', fabric_weight: '280g/m2', price: 72, moq: '1000 PCS/COLOR', description: 'Versatile vest perfect for layering.', image_url: '/images/products/product-12.png' },
        { name: 'Padded Jacket', fabric: '100% polyester', price: 94, moq: '1000 PCS/COLOR', description: 'Comfortable padded jacket for everyday wear.', image_url: '/images/products/product-13.png' },
        { name: 'Padded Jacket', fabric: '100% polyester', price: 95, moq: '1000 PCS/COLOR', description: 'Stylish padded jacket with modern aesthetic.', image_url: '/images/products/product-14.png' },
        { name: 'Woolen Coat', fabric: '100% polyester', fabric_weight: '450g/m2', price: 93, moq: '1000 PCS/COLOR', description: 'Elegant woolen-style coat.', image_url: '/images/products/product-15.png' },
        { name: 'Leather Jacket', fabric: 'PU leather', fabric_weight: '300g/m2', price: 87, moq: '1000 PCS/COLOR', description: 'Classic leather jacket with PU material.', image_url: '/images/products/product-16.png' },
        { name: 'Leather Jacket', fabric: 'PU leather', fabric_weight: '280g/m2', price: 88, moq: '1000 PCS/COLOR', description: 'Lightweight leather jacket for year-round wear.', image_url: '/images/products/product-17.png' },
        { name: 'Leather Jacket', fabric: 'PU leather', fabric_weight: '300g/m2', price: 89, moq: '1000 PCS/COLOR', description: 'Premium leather jacket with superior craftsmanship.', image_url: '/images/products/product-18.png' }
    ];

    const stmt = db.prepare(`INSERT INTO products (name, fabric, fabric_weight, sleeve_yarn, price, moq, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    products.forEach(product => {
        stmt.run([product.name, product.fabric, product.fabric_weight, product.sleeve_yarn, product.price, product.moq, product.description, product.image_url]);
    });
    stmt.finalize();
    console.log('Sample products inserted');
}

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access denied' });
    }
    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
}

// ==================== Products API ====================

// Get all products
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products ORDER BY id', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
    db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!row) {
            res.status(404).json({ error: 'Product not found' });
        } else {
            res.json(row);
        }
    });
});

// Create product (admin only)
app.post('/api/products', verifyToken, (req, res) => {
    const { name, fabric, fabric_weight, sleeve_yarn, price, moq, description, image_url } = req.body;
    db.run(`INSERT INTO products (name, fabric, fabric_weight, sleeve_yarn, price, moq, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, fabric, fabric_weight, sleeve_yarn, price, moq, description, image_url],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.status(201).json({ id: this.lastID, name, fabric, fabric_weight, sleeve_yarn, price, moq, description, image_url });
            }
        });
});

// Update product (admin only)
app.put('/api/products/:id', verifyToken, (req, res) => {
    const { name, fabric, fabric_weight, sleeve_yarn, price, moq, description, image_url } = req.body;
    db.run(`UPDATE products SET name = ?, fabric = ?, fabric_weight = ?, sleeve_yarn = ?, price = ?, moq = ?, description = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [name, fabric, fabric_weight, sleeve_yarn, price, moq, description, image_url, req.params.id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (this.changes === 0) {
                res.status(404).json({ error: 'Product not found' });
            } else {
                res.json({ id: req.params.id, name, fabric, fabric_weight, sleeve_yarn, price, moq, description, image_url });
            }
        });
});

// Delete product (admin only)
app.delete('/api/products/:id', verifyToken, (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Product not found' });
        } else {
            res.json({ message: 'Product deleted successfully' });
        }
    });
});

// ==================== Orders API ====================

// Get all orders (admin only)
app.get('/api/orders', verifyToken, (req, res) => {
    db.all('SELECT * FROM orders ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Get single order (admin only)
app.get('/api/orders/:id', verifyToken, (req, res) => {
    db.get('SELECT * FROM orders WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!row) {
            res.status(404).json({ error: 'Order not found' });
        } else {
            res.json(row);
        }
    });
});

// Create order
app.post('/api/orders', (req, res) => {
    const { customer_name, email, phone, message, status } = req.body;
    db.run(`INSERT INTO orders (customer_name, email, phone, message, status) VALUES (?, ?, ?, ?, ?)`,
        [customer_name, email, phone, message, status || 'pending'],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.status(201).json({ id: this.lastID, customer_name, email, phone, message, status: status || 'pending' });
            }
        });
});

// Update order (admin only)
app.put('/api/orders/:id', verifyToken, (req, res) => {
    const { status } = req.body;
    db.run(`UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [status, req.params.id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (this.changes === 0) {
                res.status(404).json({ error: 'Order not found' });
            } else {
                res.json({ message: 'Order updated' });
            }
        });
});

// ==================== Auth API ====================

// Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
        } else {
            const passwordMatch = bcrypt.compareSync(password, user.password);
            if (!passwordMatch) {
                res.status(401).json({ error: 'Invalid credentials' });
            } else {
                const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
                res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
            }
        }
    });
});

// ==================== Users API (admin only) ====================

// Get all users
app.get('/api/users', verifyToken, (req, res) => {
    db.all('SELECT id, username, role, created_at FROM users', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Get single user
app.get('/api/users/:id', verifyToken, (req, res) => {
    db.get('SELECT id, username, role, created_at FROM users WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!row) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.json(row);
        }
    });
});

// Create user
app.post('/api/users', verifyToken, (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
        [username, hashedPassword, role || 'admin'],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.status(201).json({ id: this.lastID, username, role: role || 'admin' });
            }
        });
});

// Update user
app.put('/api/users/:id', verifyToken, (req, res) => {
    const { username, password, role } = req.body;
    if (password) {
        const hashedPassword = bcrypt.hashSync(password, 10);
        db.run(`UPDATE users SET username = ?, password = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [username, hashedPassword, role || 'admin', req.params.id],
            function(err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else if (this.changes === 0) {
                    res.status(404).json({ error: 'User not found' });
                } else {
                    res.json({ id: req.params.id, username, role: role || 'admin' });
                }
            });
    } else {
        db.run(`UPDATE users SET username = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [username, role || 'admin', req.params.id],
            function(err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else if (this.changes === 0) {
                    res.status(404).json({ error: 'User not found' });
                } else {
                    res.json({ id: req.params.id, username, role: role || 'admin' });
                }
            });
    }
});

// Delete user
app.delete('/api/users/:id', verifyToken, (req, res) => {
    db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.json({ message: 'User deleted successfully' });
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
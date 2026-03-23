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
            price REAL,
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
        { name: 'padded jacket', fabric: '100% nylon', fabric_weight: '50g/m2', moq: '800 PCS/COLOR', description: '', image_url: '/images/products/product-01.png' },
        { name: 'Padded jacket', fabric: '100% nylon', fabric_weight: '50g/m2', moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-02.png' },
        { name: 'padded coat', fabric: '100% nylon', fabric_weight: '60g/m2', moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-03.png' },
        { name: 'Padded coat', fabric: '100% nylon', fabric_weight: '50G/m2', moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-04.png' },
        { name: 'padded jacket', fabric: '100% nylon', fabric_weight: '60g/m2', moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-05.png' },
        { name: 'padded jacket', fabric: '100% polyester', fabric_weight: '60G/M2', moq: '800 PCS/COLOR', description: '', image_url: '/images/products/product-06.png' },
        { name: 'padded coat', fabric: '100% nylon', sleeve_yarn: '97% cotton 3% spandex', moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-07.png' },
        { name: 'padded coat', fabric: '100% nylon', sleeve_yarn: '97% cotton 3% spandex', moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-08.png' },
        { name: 'Padded coat', fabric: '100% polyester', fabric_weight: '70G/m2', moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-09.png' },
        { name: 'Men\'s jacket', fabric: '100% Polyester', fabric_weight: '280g/m2', moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-10.png' },
        { name: 'Men\'s jacket', fabric: '73% Polyester/15% Polyamide/12% Cotton', fabric_weight: '95G/m2', moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-11.png' },
        { name: 'vest', fabric: '100% polyester', fabric_weight: '280g/m2', moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-12.png' },
        { name: 'padded jacket', fabric: '100% polyester', moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-13.png' },
        { name: 'Padded jacket', fabric: '100% polyester', moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-14.png' },
        { name: 'WolLEN coat', fabric: '100% polyester', fabric_weight: '450g/m2', moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-15.png' },
        { name: 'leather jacket', fabric: 'pu leather', fabric_weight: '300G/M2', moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-16.png' },
        { name: 'leather jacket', fabric: 'pu leather', fabric_weight: '280G/M2', moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-17.png' },
        { name: 'leather jacket', fabric: 'pu leather', fabric_weight: '300G/M2', moq: '1000 PCS/COLOR', description: '', image_url: '/images/products/product-18.png' }
    ];

    const stmt = db.prepare(`INSERT INTO products (name, fabric, fabric_weight, sleeve_yarn, moq, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    products.forEach(product => {
        stmt.run([product.name, product.fabric, product.fabric_weight, product.sleeve_yarn, product.moq, product.description, product.image_url]);
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
    const { name, fabric, fabric_weight, sleeve_yarn, moq, description, image_url } = req.body;
    db.run(`INSERT INTO products (name, fabric, fabric_weight, sleeve_yarn, moq, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, fabric, fabric_weight, sleeve_yarn, moq, description, image_url],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.status(201).json({ id: this.lastID, name, fabric, fabric_weight, sleeve_yarn, moq, description, image_url });
            }
        });
});

// Update product (admin only)
app.put('/api/products/:id', verifyToken, (req, res) => {
    const { name, fabric, fabric_weight, sleeve_yarn, moq, description, image_url } = req.body;
    db.run(`UPDATE products SET name = ?, fabric = ?, fabric_weight = ?, sleeve_yarn = ?, moq = ?, description = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [name, fabric, fabric_weight, sleeve_yarn, moq, description, image_url, req.params.id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (this.changes === 0) {
                res.status(404).json({ error: 'Product not found' });
            } else {
                res.json({ id: req.params.id, name, fabric, fabric_weight, sleeve_yarn, moq, description, image_url });
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
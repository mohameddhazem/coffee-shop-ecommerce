const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const db_access = require('./Db.js')
const db = db_access.db
const cookieParser = require('cookie-parser');
const server = express()
const port = 555
const secret_key = 'DdsdsdKKFDDFDdvfddvxvc4dsdvdsvdb'
server.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))
server.use(express.json())
server.use(cookieParser())
const generateToken = (id, isAdmin) => {
    return jwt.sign({ id, isAdmin }, secret_key, { expiresIn: '1h' })
}
const verifyToken = (req, res, next) => {
    const token = req.cookies.authToken
    console.log(token);
    if (!token)
        return res.status(401).send('unauthorized')
    jwt.verify(token, secret_key, (err, details) => {
        if (err)
            return res.status(403).send('invalid or expired token')
        req.userDetails = details

        next()
    })
}
server.post('/user/login', (req, res) => {
    const email = req.body.email
    const password = req.body.password
    db.get(`SELECT * FROM USER WHERE EMAIL=?  `, [email], (err, row) => {
        bcrypt.compare(password, row.PASSWORD, (err, isMatch) => {
            if (err) {
                return res.status(500).send('error comparing password.')
            }
            if (!isMatch) {
                return res.status(401).send('invalid credentials')
            }
            else {
                let userID = row.ID
                let isAdmin = row.ISADMIN
                const token = generateToken(userID, isAdmin)

                res.cookie('authToken', token, {
                    httpOnly: true,
                    sameSite: 'none',
                    secure: true,
                    expiresIn: '1h'
                })
                return res.status(200).json({ id: userID, admin: isAdmin, token })
            }
        })
    })
})

server.post(`/user/register`, (req, res) => {
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).send('error hashing password')
        }
        db.run(`INSERT INTO USER (name,email,password,isadmin) VALUES (?,?,?,?)`, [name, email, hashedPassword, 0], (err) => {
            if (err) {

                return res.status(401).send(err)
            }
            else
                return res.status(200).send(`registration successfull`)
        })
    })
})

// Add a new product (Admin only)
server.post('/product', verifyToken, async (req, res) => {
    if (!req.userDetails.isAdmin)
        return res.status(403).send('Admin access required');
    const { name, description, price, stock, image } = req.body;
    const query = `INSERT INTO PRODUCT (NAME, DESCRIPTION, PRICE, STOCK, IMAGE) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [name, description, price, stock, image], (err) => {
        if (err)
            return res.status(500).send('Error adding products: ' + err.message);
        return res.status(201).send("Product added successfully");
    });
});


// Update product (Admin Only)
server.put('/product/:id', verifyToken, (req, res) => {
    if (!req.userDetails.isAdmin)
        return res.status(403).send('Admin access required.');

    const { name, description, price, stock, image } = req.body;
    const productId = req.params.id;

    const query = `UPDATE PRODUCT SET NAME = ?, DESCRIPTION = ?, PRICE = ?, STOCK = ?, IMAGE = ? WHERE ID = ?`;
    db.run(query, [name, description, price, stock, image, productId], function (err) {
        if (err)
            return res.status(500).send('Error updating product: ' + err.message);
        if (this.changes === 0)
            return res.status(404).send('Product not found.');
        res.status(200).send('Product updated successfully.');
    });
});

// Delete product (Admin Only)
server.delete('/product/:id', verifyToken, (req, res) => {
    if (!req.userDetails.isAdmin)
        return res.status(403).send('Admin access required.');

    const productId = req.params.id;

    db.run(`DELETE FROM PRODUCT WHERE ID = ?`, [productId], function (err) {
        if (err) return res.status(500).send('Error deleting product: ' + err.message);
        if (this.changes === 0) return res.status(404).send('Product not found.');
        res.status(200).send('Product deleted successfully.');
    });
});

// Get all products
server.get('/products', (req, res) => {
    db.all(`SELECT * FROM PRODUCT`, [], (err, rows) => {
        if (err)
            return res.status(500).send('Error fetching products: ' + err.message);
        res.status(200).json(rows);
    });
});

// Get product details by ID
server.get('/products/:id', (req, res) => {
    const productId = req.params.id;

    db.get(`SELECT * FROM PRODUCT WHERE ID = ?`, [productId], (err, row) => {
        if (err)
            return res.status(500).send('Error fetching product: ' + err.message);
        if (!row)
            return res.status(404).send('Product not found.');
        res.status(200).json(row);
    });
});

// Add item to cart
server.post('/cart', verifyToken, (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.userDetails.id;

    // Check if the product already exists in the cart
    const checkQuery = `SELECT * FROM CART WHERE USER_ID = ? AND PRODUCT_ID = ?`;
    db.get(checkQuery, [userId, productId], (err, row) => {
        if (err)
            return res.status(500).send('Error checking cart: ' + err.message);

        if (row) {
            // Update quantity if the product already exists
            const updateQuery = `UPDATE CART SET QUANTITY = QUANTITY + ? WHERE USER_ID = ? AND PRODUCT_ID = ?`;
            db.run(updateQuery, [quantity, userId, productId], function (err) {
                if (err)
                    return res.status(500).send('Error updating cart: ' + err.message);
                return res.status(200).send('Cart updated successfully.');
            });
        } else {
            // Add new product to the cart
            const insertQuery = `INSERT INTO CART (USER_ID, PRODUCT_ID, QUANTITY) VALUES (?, ?, ?)`;
            db.run(insertQuery, [userId, productId, quantity], function (err) {
                if (err)
                    return res.status(500).send('Error adding to cart: ' + err.message);
                return res.status(201).send('Product added to cart successfully.');
            });
        }
    });
});

// Update cart item quantity
server.put('/cart/:id', verifyToken, (req, res) => {
    const cartId = req.params.id;
    const { quantity } = req.body;

    const updateQuery = `UPDATE CART SET QUANTITY = ? WHERE ID = ?`;
    db.run(updateQuery, [quantity, cartId], function (err) {
        if (err)
            return res.status(500).send('Error updating cart: ' + err.message);
        if (this.changes === 0)
            return res.status(404).send('Cart item not found.');
        res.status(200).send('Cart item updated successfully.');
    });
});

// Remove item from cart
server.delete('/cart/:id', verifyToken, (req, res) => {
    const cartId = req.params.id;

    const deleteQuery = `DELETE FROM CART WHERE ID = ?`;
    db.run(deleteQuery, [cartId], function (err) {
        if (err)
            return res.status(500).send('Error deleting cart item: ' + err.message);
        if (this.changes === 0)
            return res.status(404).send('Cart item not found.');
        res.status(200).send('Cart item deleted successfully.');
    });
});

// View all items in the cart
server.get('/cart', verifyToken, (req, res) => {
    const userId = req.userDetails.id;

    const selectQuery = `
        SELECT CART.ID, PRODUCT.NAME, PRODUCT.PRICE, CART.QUANTITY, (PRODUCT.PRICE * CART.QUANTITY) AS TOTAL_PRICE
        FROM CART
        JOIN PRODUCT ON CART.PRODUCT_ID = PRODUCT.ID
        WHERE CART.USER_ID = ?
    `;
    db.all(selectQuery, [userId], (err, rows) => {
        if (err)
            return res.status(500).send('Error fetching cart items: ' + err.message);
        res.status(200).json(rows);
    });
});

// Place an order
server.post('/order', verifyToken, (req, res) => {
    const userId = req.userDetails.id;

    // Get all cart items for the user
    const cartQuery = `
        SELECT CART.ID AS CART_ID, PRODUCT.ID AS PRODUCT_ID, PRODUCT.PRICE, CART.QUANTITY
        FROM CART
        JOIN PRODUCT ON CART.PRODUCT_ID = PRODUCT.ID
        WHERE CART.USER_ID = ?
    `;

    db.all(cartQuery, [userId], (err, cartItems) => {
        if (err)
            return res.status(500).send('Error fetching cart items');
        if (cartItems.length === 0)
            return res.status(400).send('Cart is empty');
        console.log(cartItems);
        // Calculate total price
        const totalPrice = cartItems.reduce((total, item) => total + (item.QUANTITY * item.PRICE), 0);
        console.log(totalPrice);

        // Add order to the Orders table
        const insertOrderQuery = `INSERT INTO ORDERS (USER_ID, TOTAL_PRICE, STATUS) VALUES (?, ?, 'Preparing')`;
        db.run(insertOrderQuery, [userId, totalPrice], function (err) {
            if (err)
                return res.status(500).send('Error placing order');

            const orderId = this.lastID;

            // Move cart items to the Order_Items table
            const orderItemsQuery = `INSERT INTO ORDER_ITEMS (ORDER_ID, PRODUCT_ID, QUANTITY, PRICE) VALUES (?, ?, ?, ?)`;
            const q = db.prepare(orderItemsQuery);

            cartItems.forEach(item => {
                q.run(orderId, item.PRODUCT_ID, item.QUANTITY, item.PRICE);
            });

            q.finalize();

            // Clear the cart
            db.run(`DELETE FROM CART WHERE USER_ID = ?`, [userId], err => {
                if (err)
                    return res.status(500).send('Error clearing cart');
                res.status(201).send('Order placed successfully');
            });
        });
    });
});

// View order history
server.get('/orders', verifyToken, (req, res) => {
    const userId = req.userDetails.id;

    const ordersQuery = `
        SELECT ORDERS.ID AS ORDER_ID, ORDERS.TOTAL_PRICE, ORDERS.STATUS, ORDERS.CREATED_AT
        FROM ORDERS
        WHERE ORDERS.USER_ID = ?
    `;
    db.all(ordersQuery, [userId], (err, rows) => {
        if (err)
            return res.status(500).send('Error fetching orders');
        res.status(200).json(rows);
    });
});

// View all orders (Admin Only)
server.get('/admin/orders', verifyToken, (req, res) => {
    if (!req.userDetails.isAdmin)
        return res.status(403).send('Admin access required');

    const adminOrdersQuery = `
        SELECT ORDERS.ID AS ORDER_ID, ORDERS.USER_ID, ORDERS.TOTAL_PRICE, ORDERS.STATUS, ORDERS.CREATED_AT
        FROM ORDERS
    `;
    db.all(adminOrdersQuery, [], (err, rows) => {
        if (err)
            return res.status(500).send('Error fetching all orders');
        res.status(200).json(rows);
    });
});


server.listen(port, () => {
    console.log(`server started at port ${port}`)
    db.serialize(() => {
        db.run(db_access.createUserTable, (err) => {
            if (err)
                console.log("error creating user table " + err)
        });

        db.run(db_access.createProductTable, (err) => {
            if (err) console.log("Error creating product table: " + err);
        });

        db.run(db_access.createCartTable, (err) => {
            if (err) console.log("Error creating cart table: " + err);
        });

        db.run(db_access.createOrdersTable, (err) => {
            if (err) console.log("Error creating order table: " + err);
        });

        db.run(db_access.createOrderItemsTable, (err) => {
            if (err) console.log("Error creating order-item table: " + err);
        });
    })
})

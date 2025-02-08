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

server.listen(port, () => {
    console.log(`server started at port ${port}`)
    db.serialize(() => {
        db.run(db_access.createUserTable, (err) => {
            if (err)
                console.log("error creating user table " + err)
        });

        db.run(db_access.createProductTable, (err) => {
            if (err) console.log("Error creating PRODUCT table: " + err);
        });
    })
})

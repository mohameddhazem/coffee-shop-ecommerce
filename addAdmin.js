const sqlite = require('sqlite3')
const bcrypt = require('bcrypt');
const db = new sqlite.Database('coffee-house.db')
bcrypt.hash('admin', 10, (err, hashedPassword) => {
    if (err) {
        return res.status(500).send('error hashing password')
    }
    db.run(`INSERT INTO USER (name,email,password,isadmin) VALUES ('admin','admin',?,1)`, [hashedPassword], (err) => {
        if (err)
            console.log(err.message)
        else
            console.log('admin added')
    })
});


//db.run(`DELETE FROM USER WHERE ID = 3`);

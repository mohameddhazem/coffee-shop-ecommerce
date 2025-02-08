const sqlite = require('sqlite3')

const db = new sqlite.Database('coffee-house.db')

const createUserTable = `CREATE TABLE IF NOT EXISTS USER (ID INTEGER PRIMARY KEY AUTOINCREMENT,
NAME TEXT NOT NULL,
EMAIL TEXT UNIQUE NOT NULL,
PASSWORD TEXT NOT NULL,
ISADMIN INT)`

const createProductTable = `
    CREATE TABLE IF NOT EXISTS PRODUCT (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        NAME TEXT NOT NULL,
        DESCRIPTION TEXT,
        PRICE REAL NOT NULL,
        STOCK INTEGER NOT NULL,
        IMAGE TEXT
    )
`;

module.exports = { db, createUserTable, createProductTable }
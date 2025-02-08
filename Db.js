const sqlite = require('sqlite3')

const db = new sqlite.Database('coffee-house.db')

const createUserTable = `CREATE TABLE IF NOT EXISTS USER (ID INTEGER PRIMARY KEY AUTOINCREMENT,
NAME TEXT NOT NULL,
EMAIL TEXT UNIQUE NOT NULL,
PASSWORD TEXT NOT NULL,
ISADMIN INT)`

module.exports = { db, createUserTable }
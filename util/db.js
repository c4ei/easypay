const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();
// console.log(`
// host: ${process.env.DB_HOST},
// user: ${process.env.DB_USER},
// password: ${process.env.DB_PASSWORD},
// database: ${process.env.DB_DATABASE},
// `);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise(); // promise()를 사용하여 promise 기반의 쿼리를 사용할 수 있게 함

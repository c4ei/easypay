const dotenv = require('dotenv');
dotenv.config();
//database.js
var mysql = require('mysql2');
var db_info = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
}
module.exports = {
    init: function () {
        return mysql.createConnection(db_info);
    },
    connect: function(conn) {
        conn.connect(function(err) {
            if(err) { 
                console.error('mysql connection error : ' + err);}
            else { 
                //console.log('mysql is connected successfully!');
            }
        });
    },
    constr: function () {
        return db_info;
    }
}
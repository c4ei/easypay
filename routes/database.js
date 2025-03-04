const dotenv = require('dotenv');
dotenv.config();
// database.js
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
            if (err) { 
                console.error('mysql connection error : ' + err);
            } else { 
                console.log('mysql is connected successfully!');
            }
        });

        // query 함수 오버라이드해서 자동 escape 처리
        let originalQuery = conn.query;

        conn.query = function(sql, params, callback) {
            if (typeof params === 'function') {
                // params가 없는 경우 (두 번째 인자가 callback인 경우)
                callback = params;
                params = [];
            }

            // params가 존재하면 mysql.format으로 자동 escape
            if (params && params.length > 0) {
                sql = mysql.format(sql, params);
            }

            return originalQuery.call(conn, sql, params, callback);
        };
    },
    constr: function () {
        return db_info;
    }
}

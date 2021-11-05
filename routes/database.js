const dotenv = require('dotenv');
dotenv.config();
//database.js
var mysql = require('mysql');
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

// //connection 은 한정되어 있어서 풀을 만들어 그 안에서 사용한다. connection 할때도 비용이 들어감, 만들고 닫고
// var pool = mySql.createPool({
//   connectionLimit: 10,            //접속을 10개 만들고 10개를 재사용
//   host: 'localhost',
//   user:'ctppossible',
//   password: 'MaybeorNo!tCtp!2',   //MySql 설치할때의 비번을 입력하면 됨!!
//   database: 'citypay',
//   debug: false
// });

// function getUserIP(req) {
// 	const addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress
// 	return addr
// }

// var gameingCheck = function (game_idx, user_idx, user_coin, coin_address ){
// 	var ip = req.headers['x-forwarded-for'] ||req.connection.remoteAddress ||req.socket.remoteAddress ||req.connection.socket.remoteAddress;
// 	console.log('input game_idx :' + game_idx + '//user_idx : ' + user_idx + '//user_coin : ' + user_coin + '//coin_address : ' + coin_address + '//ip : ' + ip);
// 	pool.getConnection(function (err, poolConn) {
// 		if (err) {
// 			if (poolConn) {
// 				poolConn.release();     //pool 반환처리
// 			}
// 			callback(err, null);
// 			return;
// 		}
// 		console.log('데이터베이스 연결 스레드 아이디' + poolConn.threadId);

// 		var exec = poolConn.query("INSERT INTO `tbl_game`(`game_idx`, `user_idx`, `user_coin`, `coin_address`, `yyyymmdd`, `ip`) VALUES (?,?,?,?,CURDATE()+0,?) ONDUPLICATE KEY UPDATE minuteCnt = minuteCnt + 1 "
// 		, game_idx, user_idx, user_coin, coin_address, ip,
// 			function (err, rows)
// 			{
// 				poolConn.release();     //pool 반환처리
// 				console.log('실행된 ssql : ' + exec.sql);
// 				if (err) {
// 					callback(err, null);
// 					return;
// 				}
// 				if (rows.length > 0) {
// 					console.log('사용자 찾음');
// 					callback(null, rows);
// 				} else {
// 					console.log('사용자 찾지 못함');
// 					callback(null, null);
// 				}
// 			}
// 		);
// 	}
// 	);

// };


// var authUseridx = function (id, callback) {
// 	console.log('input id :' + id );

// 	pool.getConnection(function (err, poolConn) {
// 		if (err) {
// 			if (poolConn) {
// 				poolConn.release();     //pool 반환처리
// 			}
// 			callback(err, null);
// 			return;
// 		}
// 		console.log('데이터베이스 연결 스레드 아이디' + poolConn.threadId);
// 		var tablename = 'users';
// 		var columns = [	'id','username', 'locked', 'CTP', 'CTP_address', 'JDJ', 'JDJ_address', 'UTB', 'UTB_address'];
// 		//id 와 pw 가 같은것을 조회한다
// 		var exec = poolConn.query("select ?? from ?? where id = ? ", [columns, tablename, id],
// 			function (err, rows)
// 			{
// 				poolConn.release();     //pool 반환처리
// 				console.log('실행된 ssql : ' + exec.sql);
// 				if (err) {
// 					callback(err, null);
// 					return;
// 				}
// 				if (rows.length > 0) {
// 					console.log('사용자 찾음');
// 					callback(null, rows);
// 				} else {
// 					console.log('사용자 찾지 못함');
// 					callback(null, null);
// 				}
// 			}
// 		);
// 	}
// 	);
// };


// var authUser = function (id, password, callback) {
// 	console.log('input id :' + id + '  :  pw : ' + password);

// 	pool.getConnection(function (err, poolConn) {
// 		if (err) {
// 			if (poolConn) {
// 				poolConn.release();     //pool 반환처리
// 			}
// 			callback(err, null);
// 			return;
// 		}
// 		console.log('데이터베이스 연결 스레드 아이디' + poolConn.threadId);
// 		var tablename = 'users';
// 		var columns = [	'id','username', 'locked', 'CTP', 'CTP_address', 'JDJ', 'JDJ_address', 'UTB', 'UTB_address'];
// 		//id 와 pw 가 같은것을 조회한다
// 		var exec = poolConn.query("select ?? from ?? where username = ? and passwords=?", [columns, tablename, id, password],
// 			function (err, rows)
// 			{
// 				poolConn.release();     //pool 반환처리
// 				console.log('실행된 ssql : ' + exec.sql);
// 				if (err) {
// 					callback(err, null);
// 					return;
// 				}
// 				if (rows.length > 0) {
// 					console.log('사용자 찾음');
// 					callback(null, rows);
// 				} else {
// 					console.log('사용자 찾지 못함');
// 					callback(null, null);
// 				}
// 			}
// 		);
// 	}
// 	);
// };

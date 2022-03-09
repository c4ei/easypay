import React from "react";
// yarn remove mysql
// //npm install sync-request@2.2.0
// // yarn add sync-request@2.2.0
// yarn remove sync-request
// let db_config = require(__dirname + '/database.js');// 2020-09-13
// let sync_mysql = require('sync-mysql'); //2020-01-28
// let sync_connection = new sync_mysql(db_config.constr());

// let YY_W="";
// let sql = "SELECT concat( DATE_FORMAT(NOW(), '%Y') ,'_' ,WEEK(NOW()) ) YY_W";
// let result = sync_connection.query(sql);
// YY_W = result[0].YY_W;
// console.log("############# " + YY_W +" : rtn #############");

// conn.query(sql, function (err, rows, fields) {
//   if (err) { 
//     console.log('query is not excuted. select fail...\n' + err); 
//   } else { 
//     if (rows.length > 0) { YY_W = rows[0].YY_W; }
//   }
// }

// var sql = "SELECT concat( DATE_FORMAT(NOW(), '%Y') ,'_' ,WEEK(NOW()) ) YY_W" ;
// console.log("############# " + YY_W +" : rtn #############");

const Header = () => {

  return (
    <header>
      <h1>Lotto 6/45</h1>
    </header>
  );
};

export default Header;

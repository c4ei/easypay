var createError = require('http-errors');
// var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const express = require("express");
const dotenv = require('dotenv');
const cors = require("cors");
const HttpException = require('./app/utils/HttpException.utils');
const errorMiddleware = require('./app/middlewares/error.middleware');
const userRouter = require('./routes/user.route');
//npm install --save md5
var md5 = require('md5');

// Init express
const app = express();
// Init environment
dotenv.config();
// parse requests of content-type: application/json
// parses incoming requests with JSON payloads
app.use(express.json());
// enabling cors for all requests by using cors middleware
app.use(cors());
// Enable pre-flight
app.options("*", cors());
//###########################
//npm install --save express-session
// npm install --save session-file-store
const session = require('express-session');
const FileStore = require('session-file-store')(session); // 1
app.use(session({  // 2
  secret: process.env.SessionSecret,  // 암호화
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}));

// var bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// express를 설치했다면 body-parser가 필요 없다
////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded
////////////////////////////////////////////////////////////////////////////////////////////////////////////
// app.use(
//   bodyParser.raw({ type: 'application/x-www-form-urlencoded' }),
//   function (req, res, next) {
//   try {
//   req.body = JSON.parse(req.body)
//   } catch (err) {
//   log.info('application/x-www-form-urlencoded JSON PARSE ERROR : ', err);
//   req.body = require('qs').parse(req.body.toString());
//   }
//   next();
//   }
// );
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
////////////////////////////////////////////////////////////////////////////////////////////////////////////
// res.send() => res.body에 값을 입력할 수 있습니다. res.send({username: "darren"}) 이면 res.body에 username이란 이름으로 값을 넣어줍니다.
// res.status() => 상태코드
// res.json() => json 형태로 응답함.
// res.end() => 끝냄
//###########################

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', cookieParser(process.env.COOKIE_SECRET));
app.use('/', indexRouter);
app.use('/users', usersRouter);
//####################################
app.use(`/api/v1/users`, userRouter);
// Error middleware
app.use(errorMiddleware);


// // // post 로 넘어 오면 !!! 게임
// app.use('/ulogin', cookieParser(process.env.COOKIE_SECRET));
// app.post('/ulogin', function (req, res) {
//   // var md5 = require('md5'); 2021-05-27 delete
//   var param_username = req.body.username;
//   var param_password = req.body.password;
//   console.log('요청 파라미터 >> username : ' + param_username);

//   // var conn = db_config.init();//2020-09-13
//   // db_config.connect(conn);
//   // var sql = "SELECT a.id,a.name,email,role,status,avatar,password ,CAST((SELECT balance FROM accounts WHERE user_id=a.id) as DECIMAL(20)) as POT FROM users a WHERE email='" + param_username + "' "; // and password ='" + md5(param_password) + "'
//   // // console.log(sql);
//   // conn.query(sql, function (err, rows, fields) {
//   //   if (err) {
//   //     console.log('query is not excuted. select fail...\n' + err);
//   //     res.writeHead("200", { "Content-Type": "text/html;charset=utf-8" });
//   //     res.end("<h1>error. query is not excuted </h1>");
//   //     res.sendFile(STATIC_PATH + '/ulogin.html')
//   //   }
//   //   else {

//   //     if (rows.length > 0) {
//   //       var user_dbpwd = rows[0].password;
//   //       console.log('index 168 #user_dbpwd : '+user_dbpwd+' // param_password : '+param_password); //
//   //       var bcrypt = require('bcrypt');
//   //       user_dbpwd = user_dbpwd.replace(/^\$2y(.+)$/i, '$2a$1');
//   //       if(bcrypt.compareSync(param_password, user_dbpwd)){
//   //         console.log('login ok');
//   //       }else{
//   //         console.log('login fail...\n' + err);
//   //         res.writeHead("200", { "Content-Type": "text/html;charset=utf-8" });
//   //         res.end("<h1>error. login fail password maybe wrong </h1>");
//   //         res.sendFile(STATIC_PATH + '/ulogin.html')
//   //         // res.writeHead("200", { "Content-Type": "text/html;charset=utf-8" });
//   //         // res.end("<script>alert('password maybe wrong');document.location.href='/';</script>");
//   //       }
//         let user_idx  = rows[0].id;
//         let user_ip   = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
//         res.cookie('user_idx', user_idx); // 2020-01-27

//         // login 성공
//         if (req.cookies.pre_sid == "" || req.cookies.pre_sid === undefined) {
//           console.log('################ index.js 253 빈폼 날리기  ################');
//           res.writeHead("200", { "Content-Type": "text/html;charset=utf-8" });
//           res.end("<html lang='en'><head><title>temp</title></head><body onload='document.frm.submit();'><form id='frm' name='frm' method='post' action='/'><input type='hidden' name='user_idx' id='user_idx' value='"+user_idx+"'><input type='hidden' name='loginok' id='loginok' value='loginok'></form></body></html>");
//         } else {
//           let sid = req.cookies.pre_sid;
//           console.log('################ index.js 260  /sessionn 뒤 존재 cookies sid : '+sid+' ################');
//           res.cookie('pre_sid', ""); // diff url 
//           res.redirect('/session/' + sid); //최초 링크대로 전달 bug fix
//         }

//       // } else {
//       //   res.writeHead("200", { "Content-Type": "text/html;charset=utf-8" });
//       //   res.end("<script>alert('password maybe wrong');document.location.href='/';</script>");
//       //   //   res.sendFile(STATIC_PATH + '/ulogin.html')
//       // }
//     // }
//   // });
// })

// starting the server
// app.listen(port, () => console.log(`🚀 Server running on port ${port}!`));
//####################################

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// 404 error
app.all('*', (req, res, next) => {
  const err = new HttpException(404, 'Endpoint Not Found');
  next(err);
  res.render('msgpage', { title: 'oops', msg : '500 error '+err+''});
});
// Error middleware
app.use(errorMiddleware);


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render('error');
  res.render('msgpage', { title: 'oops', msg : '500 error '+err+''});
});

// const port = Number(process.env.PORT || 3331);
// // starting the server
// app.listen(port, () =>
//     console.log(`🚀 Server running on port ${port}!`));

module.exports = app;

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
//######################################################
var compression = require('compression');
app.use(compression());

// ######## IP 주소 차단 start ######## yarn add express-ipfilter
app.set('trust proxy', true); // trust proxy 설정은 최상단에 위치
const { IpFilter, IpDeniedError } = require('express-ipfilter');
// 차단, 허용할 특정 IP 목록  // var ips = [['192.168.0.10', '192.168.0.20'], '192.168.0.100']; // 범위 사용 예시
const ips = ['80.66.83.210','103.194.185.58','194.38.23.18','103.212.98.106','45.148.10.80','196.251.73.83','122.136.188.132']; 
app.use(IpFilter(ips, {
  log: false,
  detectIp: (req) => req.ip // trust proxy 설정 후 req.ip 사용 가능
})); // IP 필터 적용

// 에러 핸들러
app.use((err, req, res, _next) => {
  if (err instanceof IpDeniedError) {
    res.status(401).send('Access Denied');
  } else {
    res.status(err.status || 500).end();
  }
});
// ######## 1초에 3번 이상 같은 IP에서 오는 요청 차단 start ######## yarn add express-rate-limit
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 1000, // 1초
  max: 3, // 최대 3회
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip // trust proxy 설정 후 req.ip 사용 가능
});

app.use(limiter); // app.use('/order_cnt', limiter); // 특정 라우트에 적용
//    ######## 1초에 5번 이상 같은 IP에서 오는 요청 차단 end ########
// ######## IP 주소 차단 end ######## 
//######################################################

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded
////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

// 404 error
app.all('*', (req, res, next) => {
  const err = new HttpException(404, 'Endpoint Not Found');
  var user_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
  console.log("### 93 ### : "+req.originalUrl +""+ getCurTimestamp() + " user_ip :"+user_ip);
  // /admin
  next(err);
  return res.render('msgpage', { title: `oops - ${user_ip}`, msg : '500 error '+err+''});
});
// Error middleware
app.use(errorMiddleware);


// error handler
app.use(function(err, req, res, next) {
  // 개발 환경에서만 에러 정보를 제공
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // 에러 페이지 렌더링
  // return res.status(err.status || 500);
  var user_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
  console.log(`${user_ip} ${getCurTimestamp()}: ${req.originalUrl} - Error: ${err.message}`);

  try {
    if (err) {
      if (!res.headersSent) {
        // 에러 발생 시 500 상태 코드로 응답
        // res.status(500).send('Error occurred');
        res.render('error', { 'msg': user_ip+' - '+err });
      }
      return;
    }
  } catch (e) {
    res.end();
  }
  // res.render('msgpage', { title: 'oops', msg : '500 error ' + err });
});

function getCurTimestamp() {
  const d = new Date();

  return new Date(
    Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds()
    )
  // `toIsoString` returns something like "2017-08-22T08:32:32.847Z"
  // and we want the first part ("2017-08-22")
  ).toISOString().replace('T','_').replace('Z','');
}

module.exports = app;

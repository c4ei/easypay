const _ver = "1.001";
const _game = "c4ei";
require("dotenv").config();
const express = require("express");
const cookieParser = require('cookie-parser');
const path = require("path");
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { IpFilter, IpDeniedError } = require('express-ipfilter');
const session = require('express-session');
const passport = require('passport');


const {
  isAdmin, isLogin, executeQuery, getUserTbl, getCurTimestamp,fn_sendGmail, fn_shortenAddress, fn_logVisitor
} = require("./util/co_util");

// 라우터 모듈 불러오기
// const authRouter = require('./routes/auth');
// const userRouter = require('./routes/user');
// const paypalRouter = require('./routes/paypal');

const app = express();

// 환경 변수 및 상수
const PORT = process.env.PORT || 3888;
const SESSION_SECRET = process.env.SESSION_SECRET;
const AAH_BANK_DEPOSIT_ADDRESS = process.env.AAH_BANK_DEPOSIT_ADDRESS;
const RATE_LIMIT_WINDOW_MS = 5000; // 5초
const RATE_LIMIT_MAX = 50; // 최대 50회
const IP_FILTER_IPS = ['122.136.188.132']; // 차단, 허용할 특정 IP 목록

// 미들웨어 설정
app.set('trust proxy', true); // trust proxy 설정은 최상단에 위치
app.use(compression()); // gzip 압축 미들웨어 추가
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(cookieParser()); // 쿠키사용
app.use(express.static('public'));

// 세션 설정
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Passport 초기화
app.use(passport.initialize());
app.use(passport.session());

// IP 필터 적용
app.use(IpFilter(IP_FILTER_IPS, {
  log: false,
  detectIp: (req) => req.ip // trust proxy 설정 후 req.ip 사용 가능
}));

// 요청 제한 (Rate Limiting) 미들웨어
const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip // trust proxy 설정 후 req.ip 사용 가능
});
app.use(limiter);

// 공통 에러 처리 함수
const sendError = (res, status, message) => {
  return res.status(status).send(message);
};

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  if (err instanceof IpDeniedError) {
    return res.status(401).send('Access Denied');
  }

  console.error("Global Error Handler:", err); // 에러 로그 출력

  // Web3 관련 에러 처리
  if (err.message.includes("Failed to connect to the RPC endpoint")) {
    return res.status(500).send("AAH 블록체인 네트워크 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }

  // 기타 에러 처리
  res.status(err.status || 500).send('Internal Server Error');
});

// 홈페이지 라우트
app.get('/', async (req, res, next) => {
  try {
    await fn_logVisitor(req,'MainPage');
    const total_visits = 0;
    res.render('index', { 
      title: "AAH 블록체인", 
      usersTbl: res.locals.usersTbl, // res.locals.usersTbl 사용
      usesTokens: res.locals.usesTokens, // res.locals.usesTokens 사용
      aah_balance: res.locals.aah_balance, // res.locals.aah_balance 사용
      total_visits 
    });
  } catch (error) {
    next(error); // 에러를 전역 에러 핸들러로 전달
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} https://c4ei.net `);
});


const pool = require('./db'); // 데이터베이스 연결 풀
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken'); // JWT 패키지

/**
 * 데이터베이스 쿼리 실행 함수
 * @param {string} sql - 실행할 SQL 쿼리
 * @param {Array} params - 쿼리에 사용할 매개변수 배열
 * @returns {Promise<Array>} 쿼리 결과 배열
 * @throws {Error} 데이터베이스 쿼리 실패 시 에러 발생
 */
async function executeQuery(sql, params = []) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (err) {
        console.error("Database error:", err);
        throw new Error("Database query failed");
    }
}

/**
 * 이메일로 입금 주소 개수 조회
 * @param {string} email - 사용자 이메일
 * @returns {Promise<number|null>} 입금 주소 개수 또는 null
 * @throws {Error} 사용자 정보 조회 실패 시 에러 발생
 */
async function getDepositWalletAddressCountByEmail(email) {
    try {
        if (!email) {
            return null; // 이메일이 없는 경우 null 반환
        }
        const getWalletAddressQuery = "SELECT COUNT(*) AS Cnt FROM aahWallet WHERE email=?";
        const walletAddressResult = await executeQuery(getWalletAddressQuery, [email]);
        if (!walletAddressResult || walletAddressResult.length === 0) {
            return null; // 결과가 없는 경우 null 반환
        }
        return walletAddressResult[0].Cnt; // 입금 주소 개수 반환
    } catch (error) {
        console.error("Error in getDepositWalletAddressCountByEmail:", error.message);
        throw new Error("Failed to retrieve deposit wallet address count. Please try again later.");
    }
}

/**
 * 이메일로 입금 주소 조회
 * @param {string} email - 사용자 이메일
 * @returns {Promise<string|null>} 입금 주소 또는 null
 * @throws {Error} 사용자 정보 조회 실패 시 에러 발생
 */
async function getDepositWalletAddressByEmail(email) {
    try {
        if (!email) {
            return null; // 이메일이 없는 경우 null 반환
        }
        const getWalletAddressQuery = "SELECT pub_key FROM aahWallet WHERE email=?";
        const walletAddressResult = await executeQuery(getWalletAddressQuery, [email]);
        if (!walletAddressResult || walletAddressResult.length === 0) {
            return null; // 결과가 없는 경우 null 반환
        }
        return walletAddressResult[0].pub_key; // 입금 주소 반환
    } catch (error) {
        console.error("Error in getDepositWalletAddressByEmail:", error.message);
        throw new Error("Failed to retrieve deposit wallet address. Please try again later.");
    }
}

/**
 * 공개키로 사용자 정보 조회
 * @param {string} pubKey - 사용자 공개키
 * @returns {Promise<Object|null>} 사용자 정보 또는 null
 * @throws {Error} 사용자 정보 조회 실패 시 에러 발생
 */
async function getUserTbl(pubKey) {
    try {
        const getUserQuery = `
            SELECT email, aah_addr, coin, rcvCoin, miningYN, 
                TIMESTAMPDIFF(SECOND, upd_date, NOW()) AS pass_sec, 
                TIMESTAMPDIFF(MINUTE, upd_date, NOW()) AS pass_min, 
                TIMESTAMPDIFF(HOUR, upd_date, NOW()) AS pass_hour, 
                CASE WHEN TIMESTAMPDIFF(SECOND, upd_date, NOW()) >= 60 THEN 'Y' ELSE 'N' END AS pass_60sec_YN,
                CASE WHEN TIMESTAMPDIFF(MINUTE, upd_date, NOW()) >= 5 THEN 'Y' ELSE 'N' END AS pass_5min_YN,
                CASE WHEN TIMESTAMPDIFF(HOUR, upd_date, NOW()) >= 1 THEN 'Y' ELSE 'N' END AS pass_1hour_YN
            FROM users
            WHERE aah_addr = ?
        `;
        const userResult = await executeQuery(getUserQuery, [pubKey]);
        if (!userResult || userResult.length === 0) {
            return null; // 결과가 없는 경우 null 반환
        }
        return userResult[0]; // 사용자 정보 반환
    } catch (error) {
        console.error("Error in getUserTbl:", error.message);
        throw new Error("Failed to retrieve user information. Please try again later.");
    }
}

/**
 * 이메일로 사용자 정보 조회
 * @param {string} email - 사용자 이메일
 * @returns {Promise<Object|null>} 사용자 정보 또는 null
 * @throws {Error} 사용자 정보 조회 실패 시 에러 발생
 */
async function getUserByEmail(email) {
    try {
        if (!email) {
            return null; // 이메일이 없는 경우 null 반환
        }
        const getUserQuery = `SELECT * FROM users WHERE email = ?`;
        const userResult = await executeQuery(getUserQuery, [email]);
        if (!userResult || userResult.length === 0) {
            return null; // 결과가 없는 경우 null 반환
        }
        return userResult[0]; // 사용자 정보 반환
    } catch (error) {
        console.error("Error in getUserByEmail:", error.message);
        throw new Error("Failed to retrieve user information. Please try again later.");
    }
}

/**
 * 현재 타임스탬프 반환 (YYYY-MM-DD_HH:MM:SS)
 * @returns {string} 현재 타임스탬프
 */
function getCurrentTimestamp() {
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
    ).toISOString().replace('T', '_').replace('Z', '');
}

/**
 * 이메일 전송 함수
 * @param {string} userEmail - 수신자 이메일 주소
 * @returns {string} 생성된 랜덤 코드
 * @throws {Error} 메일 전송 실패 시 에러 발생
 */
function sendGmail(userEmail) {
    const code_pwd = generateRandomCode(6); // 6자리 랜덤 코드 생성

    // 메일 설정
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        prot: 587,
        host: 'smtp.gmail.com',
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.NODEMAILER_USER, // 발신 메일 주소
            pass: process.env.NODEMAILER_PASS // 발신 메일 2차 비밀번호
        }
    });

    // 메일 옵션 설정
    const mailOptions = {
        from: `"FUN.C4EI.NET" <${process.env.NODEMAILER_USER}>`,
        to: userEmail,
        subject: "[FUN.C4EI.NET] 인증번호를 입력해주세요.",
        html: `<h1>이메일 인증</h1>
        <div>
          인증번호 [${code_pwd}]를 인증 창에 입력하세요.
        </div>
        <br/>
        <div>
          <a href='${process.env.SERVER_URL}'>fun.c4ei.net 으로 가기</a>
        </div>`,
    };

    // 메일 발송
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error("Error sending email:", error);
            throw new Error("Failed to send email.");
        } else {
            console.log('Email sent: ' + info.response);
        }
        console.log('code_pwd :' + code_pwd);
    });
    return code_pwd;
}

/**
 * n자리 랜덤 코드 생성
 * @param {number} n - 생성할 코드의 자릿수
 * @returns {string} 생성된 랜덤 코드
 */
function generateRandomCode(n) {
    let str = '';
    for (let i = 0; i < n; i++) {
        str += Math.floor(Math.random() * 10);
    }
    return str;
}

/**
 * 관리자 권한 확인 미들웨어
 * @param {Object} req - 요청 객체
 * @param {Object} res - 응답 객체
 * @param {Function} next - 다음 미들웨어 함수
 * @returns {Function} 다음 미들웨어 함수 또는 로그인 페이지 렌더링
 */
async function isAdmin(req, res, next) {
    // isLogin 미들웨어를 먼저 실행하여 로그인 여부 확인
    await isLogin(req, res, async (err) => {
        if (err) {
            return next(err); // 에러 발생 시 다음 에러 핸들러로 전달
        }
        // 로그인 성공 후 관리자 여부 확인
        if (res.locals.isAdmin) {
            return next(); // 관리자인 경우 다음 미들웨어로 진행
        } else {
            return res.status(403).send('관리자 권한이 필요합니다.'); // 관리자가 아닌 경우 403 에러 반환
        }
    });
}


async function isLogin(req, res, next) {
    const token = req.cookies.token;

    // Initialize locals with defaults
    res.locals.usersTbl = null;
    res.locals.aah_balance = 0; // Default balance
    res.locals.usesTokens = []; // Default token list
    res.locals.isAdmin = false;

    if (!token) {
        await fn_logVisitor(req, 'NotLogIn');
        // Don't render login here, just proceed. Routes should handle lack of req.user
        return next(); // Proceed without user data
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Optional: Check token version or structure if needed
        // if (decoded.version !== '1.0') { ... }

        req.user = decoded;
        res.locals.isAdmin = req.user && req.user.userType === 'A';

        // --- Fetch user-specific data ---
        // Check if essential user info exists in token before proceeding
        if (req.user && req.user.email && req.user.aah_addr) {
            try {
                const { getBalanceWeb3, fromWeiWeb3, getAllMemeTokens } = require("./sendTransaction");
                // Fetch DB data first
                const usersTbl = await getUserByEmail(req.user.email);
                res.locals.usersTbl = usersTbl; // Set DB data

                // Fetch Blockchain data (functions now handle G_RPC internally)
                const aahBalanceWei = await getBalanceWeb3(req.user.aah_addr); // Returns '0' if RPC disabled/error
                const aahBalanceEther = parseFloat(await fromWeiWeb3(aahBalanceWei)); // Handles '0' input
                res.locals.aah_balance = aahBalanceEther;

                // Fetch tokens (returns [] if RPC disabled/error)
                try {
                    const usesTokens = await getAllMemeTokens();
                    res.locals.usesTokens = usesTokens;
                } catch (tokenError) {
                    // Log the error, but usesTokens remains []
                    console.error("Error fetching meme tokens within isLogin:", tokenError.message);
                    // You might want to flash a message to the user here if needed
                    // e.g., req.flash('error', 'Could not load token list.');
                    // The specific "AAH 블록체인 네트워크 연결 실패" error is already thrown by getAllMemeTokens
                    // if it's enabled but fails. We can catch it here to prevent crashing.
                    if (tokenError.message.includes("AAH 블록체인 네트워크 연결에 실패했습니다")) {
                         // Optionally set a specific flag or message for the view
                         res.locals.rpcConnectionError = true;
                    }
                    // Keep res.locals.usesTokens as [] (default)
                }

            } catch (fetchError) {
                // Catch errors from getUserByEmail, getBalanceWeb3, fromWeiWeb3
                console.error('Error fetching user data in isLogin:', fetchError);
                // Keep defaults for res.locals.aah_balance and res.locals.usesTokens
                // usersTbl might be null if getUserByEmail failed
            }
        } else {
            console.error("User email or aah_addr missing in JWT token.");
            // Keep defaults for res.locals
        }
        // --- End Fetch user-specific data ---

    } catch (err) { // Catch JWT verification errors
        console.error('JWT verification failed:', err.message);
        res.clearCookie('token');

        let message = '유효하지 않은 토큰입니다. 다시 로그인하세요.';
        let logMemo = 'InvalidToken';

        if (err.name === 'TokenExpiredError') {
            message = '로그인 시간이 만료되었습니다. 다시 로그인하세요.';
            logMemo = 'TokenExpired';
        } // ... other JWT error checks

        await fn_logVisitor(req, logMemo);
        // Don't render login here. Let the route handler decide based on lack of req.user.
        // If rendering login is desired for *any* JWT error, uncomment below:
        // return res.render('login', { title: "밈토큰 AAH 블록체인 - 로그인", message });
    }

    // Proceed to the next middleware/route handler
    next();
}

/*
async function isLogin(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        // 토큰이 없는 경우
        await fn_logVisitor(req, 'NotLogIn');
        // return res.render('login', { title: "밈토큰 AAH 블록체인 - 로그인", message: '로그인이 필요합니다.' }); // 로그인 페이지로 이동하는것은 삭제
        next(); // 로그인 하지 않은 경우 다음 미들웨어로 진행
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.version !== '1.0') {
            console.error('JWT 검증 실패: 토큰 버전 불일치');
            res.clearCookie('token');
            return res.render('login', { title: "밈토큰 AAH 블록체인 - 로그인", message: '토큰 구조가 변경되었습니다. 다시 로그인하세요.' });
        }

        req.user = decoded;
        // 관리자 여부 확인
        res.locals.isAdmin = req.user && req.user.userType === 'A'; // 관리자 여부 확인
        // next(); // 사용자 데이터 로딩은 다음 단계에서 처리 // 사용자 데이터 로딩을 여기서 처리
    } catch (err) {
        console.error('JWT verification failed:', err.message);
        res.clearCookie('token');

        let message = '유효하지 않은 토큰입니다. 다시 로그인하세요.';
        let logMemo = 'InvalidToken';

        if (err.name === 'TokenExpiredError') {
            message = '로그인 시간이 만료되었습니다. 다시 로그인하세요.';
            logMemo = 'TokenExpired';
        } else if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
            message = '잘못된 토큰입니다. 다시 로그인하세요.';
            logMemo = 'MalformedToken';
        }

        await fn_logVisitor(req, logMemo);
        return res.render('login', { title: "밈토큰 AAH 블록체인 - 로그인", message });
    }
    // 사용자 데이터 가져오기
    const { getBalanceWeb3, fromWeiWeb3, getAllMemeTokens } = require("./sendTransaction");
    try {
        if (req.user && req.user.email && req.user.aah_addr) {
            const usersTbl = await getUserByEmail(req.user.email);
            const aahBalance = await getBalanceWeb3(req.user.aah_addr);
            const aahBalanceEther = parseFloat(await fromWeiWeb3(aahBalance));
            let usesTokens = [];
            try {
                usesTokens = await getAllMemeTokens();
            } catch (error) {
                console.error("Failed to fetch meme tokens:", error);
                // Web3 연결 실패 시 에러 처리
                if (error.message.includes("Failed to connect to the RPC endpoint")) {
                    return res.status(500).send("AAH 블록체인 네트워크 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
                }
            }
            res.locals.usersTbl = usersTbl;
            res.locals.aah_balance = aahBalanceEther;
            res.locals.usesTokens = usesTokens;
        } else {
            console.error("req.user.email or req.user.aah_addr is undefined");
            // throw new Error('Invalid user data in token'); // 에러를 던지지 않고 null로 처리
            res.locals.usersTbl = null;
            res.locals.aah_balance = null;
            res.locals.usesTokens = [];
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.locals.usersTbl = null;
        res.locals.aah_balance = null;
        res.locals.usesTokens = [];
    }
    next();
}

*/

// 방문자 로그를 남기는 함수 (유지)
async function fn_logVisitor(req, memo) {
    const user_ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress;
    const user_agent = req.headers['user-agent'];
    const email = req.user?.email || "";
    await executeQuery(`INSERT INTO visitors (ip_address, user_agent, email, memo) VALUES (?, ?, ?, ?)`, [user_ip, user_agent, email, memo]);
    await executeQuery(`UPDATE visitor_stats SET total_visits = total_visits + 1 WHERE id=1`);
}

function fn_getCurTimestamp() {
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
    
/**
 * 주소 단축 함수 (예: 0x1234...abcd)
 * @param {string} address - 단축할 주소
 * @returns {string} 단축된 주소
 */
function fn_shortenAddress(address) {
    const start = address.slice(0, 4);
    const end = address.slice(-4);
    return `${start}...${end}`;
}

module.exports = {
    isAdmin,
    isLogin,
    executeQuery,
    getUserTbl,
    getCurrentTimestamp,
    getDepositWalletAddressCountByEmail,
    getDepositWalletAddressByEmail,
    getUserByEmail,
    sendGmail,
    fn_shortenAddress,
    fn_logVisitor,
    fn_getCurTimestamp
};

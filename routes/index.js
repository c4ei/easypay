var express = require('express');
var router = express.Router();
var QRCode = require('qrcode');
var path = require('path');

// var cookieParser = require('cookie-parser');
const STATIC_PATH = path.join(__dirname, '../public')

const userController = require('../app/controllers/user.controller');
const auth = require('../app/middlewares/auth.middleware');
const Role = require('../app/utils/userRoles.utils');
const awaitHandlerFactory = require('../app/middlewares/awaitHandlerFactory.middleware');
const { createUserSchema, updateUserSchema, validateLogin } = require('../app/middlewares/validators/userValidator.middleware');
// add web3 2021-11-08
//npm install web3
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.1.185:21004"));

// npm i caver-js
const Caver = require('caver-js')
const caver = new Caver('http://192.168.1.157:8217/')
// const wallet = caver.klay.accounts.create(process.env.C4EI_ADDR_PWD);

////////////////////////////////////////////////////////////////////////
// add vchat --
////////////////////////////////////////////////////////////////////////
// const app = express();
// const server = require('http').Server(app);
// //npm install socket.io
// const io = require('socket.io')(server);
// const { v4: uuidV4 } = require('uuid');
// // app.get('/', (req, res) => {
// //   res.redirect(`/${uuidV4()}`);
// // });

// router.get('/:room', (req, res) => {
//   if (req.cookies.user_idx == "" || req.cookies.user_idx === undefined) {
//     res.sendFile(STATIC_PATH + '/ulogin.html')
//     return;
//   }
//   else {
//     // res.render('room', { roomId: req.params.room });
//     res.render('room', { roomId: req.cookies.user_idx });
//   }
// });

// io.on('connection', socket => {
//   socket.on('join-room', (roomId, userId) => {
//     socket.join(roomId);
//     socket.to(roomId).broadcast.emit('user-connected', userId);

//     socket.on('disconnect', () => {
//       socket.to(roomId).broadcast.emit('user-disconnected', userId);
//     });
//   });
// });
////////////////////////////////////////////////////////////////////////
// add vchat --
////////////////////////////////////////////////////////////////////////

// npm i sync-mysql
var db_config = require(__dirname + '/database.js');// 2020-09-13
var sync_mysql = require('sync-mysql'); //2020-01-28
let sync_connection = new sync_mysql(db_config.constr());

const mysql2 = require('mysql2/promise'); 
const pool = mysql2.createPool(db_config.constr()); 

router.get('/session2cookie', function(req, res, next) {
  //# added ggoogle auth
  // console.log(req.session.user_idx +" / "+req.session.user_email); 
  let tem_user_idx = req.session.user_idx;
  let tem_user_email = req.session.user_email;
  if (tem_user_idx !="" && tem_user_email !="" ){
    // console.log(tem_user_idx +" / "+tem_user_email); 
    res.cookie('user_idx', tem_user_idx);
    res.cookie('user_email', tem_user_email);

    req.session.user_idx = null;
    req.session.user_email = null;
  }
  res.redirect('/');
});

router.get('/', function(req, res, next) {
  if (req.cookies.user_idx == "" || req.cookies.user_idx === undefined) {
    // res.sendFile(STATIC_PATH + '/ulogin.html')
    res.sendFile(STATIC_PATH + '/main.html')
    return;
  }
  else {
    /////////////////////////
    let user_email = req.cookies.user_email;
    let result = sync_connection.query("SELECT id, c4ei_addr, c4ei_balance, pot, bck_balance, klay_addr, klay_balance, klay_ceik_addr, klay_ceik_balance FROM user a WHERE a.email='" + user_email + "'");
    let user_id = result[0].id;
    let c4ei_addr = result[0].c4ei_addr;
    let c4ei_balance = result[0].c4ei_balance;
    let pot_balance = result[0].pot;
    let bck_balance = result[0].bck_balance;
    let klay_addr = result[0].klay_addr;
    let klay_balance = result[0].klay_balance;
    let klay_ceik_addr = result[0].klay_ceik_addr;
    let klay_ceik_balance = result[0].klay_ceik_balance;

    // 
    // fn_ChkC4eiNetAlive();
    /////////////////////////
    // console.log("97 c4ei_addr :"+c4ei_addr);
    if( (c4ei_addr=="" || c4ei_addr==null) 
    || (klay_addr=="" || klay_addr==null)
    ){
      res.redirect('/address_generator');
    }
    /// c4ei_block_bal balance update 
    /////////////////////////
    if ((c4ei_addr!="" &&c4ei_addr!=null) && user_id > 0){
      var wallet_balance = web3.eth.getBalance(c4ei_addr, function(error, result) {
        // console.log("[/home/dev/www]/easypay/routes/index.js 39] wallet_balance : "+ web3.utils.fromWei(result, "ether")); //0x21725F3b26F74C8E451d851e040e717Fbcf19E5b
        // console.log("86 result :"+result);
        wallet_balance = web3.utils.fromWei(result, "ether");
        // wallet_balance = getAmtWei(result);
        if (wallet_balance != c4ei_balance){
          // let result = sync_connection.query("update user set c4ei_balance='"+wallet_balance+"' WHERE id='" + user_id + "'");
          let result = sync_connection.query("update user set c4ei_block_bal='"+wallet_balance+"' WHERE id='" + user_id + "'");
          console.log("wallet_balance :"+wallet_balance);
          c4ei_balance = wallet_balance;
        }
      });
    }
    /////////////////////////
    /////////////////////////
    const msg = "https://c4ei.net/rcv?rcv_email="+user_email+"&rcv_adr="+c4ei_addr+"&rcv_amt=0&tt="+getCurTimestamp();  //Date.now()
    console.log("msg :"+msg);
    QRCode.toDataURL(msg,function(err, url){
      res.render('index', { title: 'easypay', c4ei_addr : c4ei_addr, c4ei_balance : c4ei_balance, email: user_email, pot:pot_balance, dataUrl : url });
      // , uuidV4:uuidV4()
    });
  }
});

router.get('/htmlLogin', function(req, res, next) {
  // if (req.cookies.user_idx == "" || req.cookies.user_idx === undefined) {
    res.sendFile(STATIC_PATH + '/ulogin.html')
    return;
  // }
});

router.get('/mybal', function(req, res, next) {
  if (req.cookies.user_idx == "" || req.cookies.user_idx === undefined) {
    res.sendFile(STATIC_PATH + '/ulogin.html')
    return;
  }
  else {
    /////////////////////////
    let user_email = req.cookies.user_email;
    let result = sync_connection.query("SELECT id, c4ei_addr, c4ei_balance, pot, bck_balance, klay_addr, klay_balance, klay_ceik_addr, klay_ceik_balance FROM user a WHERE a.email='" + user_email + "'");
    let user_id = result[0].id;
    let c4ei_addr = result[0].c4ei_addr;
    let c4ei_balance = result[0].c4ei_balance;
    let pot_balance = result[0].pot_balance;
    let bck_balance = result[0].bck_balance;
    let klay_addr = result[0].klay_addr;
    let klay_balance = result[0].klay_balance;
    let klay_ceik_addr = result[0].klay_ceik_addr;
    let klay_ceik_balance = result[0].klay_ceik_balance;

    getBalanceC4eiToken("BCK", c4ei_addr, user_email, bck_balance);

    res.render('mybal', { title: 'easypay my bal', email: user_email, c4ei_addr : c4ei_addr, c4ei_balance : c4ei_balance, 
      pot:pot_balance, bck_balance:bck_balance, klay_addr:klay_addr, klay_balance:klay_balance, klay_ceik_addr:klay_ceik_addr
      , klay_ceik_balance:klay_ceik_balance
    });
  }
});

router.get('/syncbalance', function(req, res, next) {
  if (req.cookies.user_idx == "" || req.cookies.user_idx === undefined) {
    res.sendFile(STATIC_PATH + '/ulogin.html')
    return;
  }
  else {
    /////////////////////////
    let user_email = req.cookies.user_email;
    let result = sync_connection.query("SELECT id, c4ei_addr, c4ei_balance, pot, bck_balance, klay_addr, klay_balance, klay_ceik_addr, klay_ceik_balance FROM user a WHERE a.email='" + user_email + "'");
    let user_id = result[0].id;
    let c4ei_addr = result[0].c4ei_addr;
    let c4ei_balance = result[0].c4ei_balance;
    let pot_balance = result[0].pot;
    let bck_balance = result[0].bck_balance;
    let klay_addr = result[0].klay_addr;
    let klay_balance = result[0].klay_balance;
    let klay_ceik_addr = result[0].klay_ceik_addr;
    let klay_ceik_balance = result[0].klay_ceik_balance;

    // console.log("c4ei_addr :"+c4ei_addr);
    if ((c4ei_addr!="" &&c4ei_addr!=null) && user_id > 0){
      var wallet_balance = web3.eth.getBalance(c4ei_addr, function(error, result) {
        // console.log("wallet_balance : "+ web3.utils.fromWei(result, "ether")); //0x21725F3b26F74C8E451d851e040e717Fbcf19E5b
        wallet_balance = web3.utils.fromWei(result, "ether");
        // wallet_balance = getAmtWei(result);
        if (wallet_balance != c4ei_balance){
          let result = sync_connection.query("update user set c4ei_balance='"+wallet_balance+"' WHERE id='" + user_id + "'");
          console.log("wallet_balance :"+wallet_balance);
          c4ei_balance = wallet_balance;
        }
      });
    }
    /////////////////////////
  }
  res.redirect('/');
});

///////
router.get('/rcv', function(req, res, next) {
  if (req.cookies.user_idx == "" || req.cookies.user_idx === undefined) {
    res.sendFile(STATIC_PATH + '/ulogin.html')
    return;
  }
  else {
    /////////////////////////
    let user_email = req.cookies.user_email;
    let result = sync_connection.query("SELECT id, c4ei_addr, c4ei_balance, pot, bck_balance, klay_addr, klay_balance, klay_ceik_addr, klay_ceik_balance FROM user a WHERE a.email='" + user_email + "'");
    let user_id = result[0].id;
    let c4ei_addr = result[0].c4ei_addr;
    let c4ei_balance = result[0].c4ei_balance;
    let pot_balance = result[0].pot;
    let bck_balance = result[0].bck_balance;
    let klay_addr = result[0].klay_addr;
    let klay_balance = result[0].klay_balance;
    let klay_ceik_addr = result[0].klay_ceik_addr;
    let klay_ceik_balance = result[0].klay_ceik_balance;

    // console.log("c4ei_addr :"+c4ei_addr);
    if ((c4ei_addr!="" &&c4ei_addr!=null) && user_id > 0){
      var wallet_balance = web3.eth.getBalance(c4ei_addr, function(error, result) {
        // console.log("wallet_balance : "+ web3.utils.fromWei(result, "ether")); //0x21725F3b26F74C8E451d851e040e717Fbcf19E5b
        wallet_balance = web3.utils.fromWei(result, "ether");
        // wallet_balance = getAmtWei(result);
        if (wallet_balance != c4ei_balance){
          let result = sync_connection.query("update user set c4ei_balance='"+wallet_balance+"' WHERE id='" + user_id + "'");
          console.log("wallet_balance :"+wallet_balance);
          c4ei_balance = wallet_balance;
        }
      });
    }
    /////////////////////////
    var rcv_email = req.query.rcv_email;
    var rcv_adr = req.query.rcv_adr;
    var rcv_amt = req.query.rcv_amt;
    console.log("rcv_email :"+rcv_email + '/ rcv_adr : ' + rcv_adr);
    res.render('rcv', { title: 'easypay Send', c4ei_addr : c4ei_addr, c4ei_balance : c4ei_balance, email: user_email, 
      rcv_email :rcv_email,rcv_adr:rcv_adr,rcv_amt:rcv_amt});
  }
});

//https://c4ei.net/rcv?rcv_email=his001@nate.com&rcv_adr=0x0077b5723B4017b38471F80725f7e3c3347FfB03&rcv_amt=10&tt=2021-11-09_10:19:19.000
//sendTr
router.post('/sendTr', function(req, res, next) {
  console.log('sendTr');
  if (req.cookies.user_idx == "" || req.cookies.user_idx === undefined) {
    res.sendFile(STATIC_PATH + '/ulogin.html')
    return;
  }
  else {
    /////////////////////////
    var txt_my_email    = req.body.txt_my_email;
    var txt_my_addr     = req.body.txt_my_addr;
    var txt_my_balance  = req.body.txt_my_balance;
    var txt_to_address  = req.body.txt_to_address;
    var txt_to_amt      = req.body.txt_to_amt;

    let user_email = req.cookies.user_email;
    let result = sync_connection.query("SELECT id, c4ei_addr, c4ei_balance, pot, bck_balance, klay_addr, klay_balance, klay_ceik_addr, klay_ceik_balance FROM user a WHERE a.email='" + user_email + "'");
    let user_id = result[0].id;
    let c4ei_addr = result[0].c4ei_addr;
    let c4ei_balance = result[0].c4ei_balance;
    // let pot_balance = result[0].pot;
    // let bck_balance = result[0].bck_balance;
    // let klay_addr = result[0].klay_addr;
    // let klay_balance = result[0].klay_balance;
    // let klay_ceik_addr = result[0].klay_ceik_addr;
    // let klay_ceik_balance = result[0].klay_ceik_balance;

    if(txt_my_email != user_email){ console.log('email different so can`t send'); return; }
    if(c4ei_addr!=txt_my_addr){ console.log('c4ei_addr different so can`t send'); return; }
    // balance changed ... 
    if(c4ei_balance!=txt_my_balance){ 
      console.log('balance different so can`t send'); 
      res.render('msgpage', { title: 'oops', msg : 'balance different so can`t send'});
      return; 
    }
    if((c4ei_balance-txt_to_amt)<0){ 
      console.log('not enough balance so can`t send'); 
      res.render('msgpage', { title: 'oops', msg : 'not enough balance so can`t send'});
      return; 
    }

    //발송 주소에 해당하는 회원이 없습니다.
    let result1 = sync_connection.query("SELECT id, email, c4ei_addr, c4ei_balance FROM user WHERE c4ei_addr='" + txt_to_address + "'");
    let to_id = result1[0].id;
    let to_email = result1[0].email;
    
    if(to_id == undefined ||to_id==""){
      res.render('msgpage', { title: 'oops', msg : '발송 주소에 해당하는 회원이 없습니다'});
      return; 
    }

    // console.log("c4ei_addr :"+c4ei_addr);
    if ((c4ei_addr!="" &&c4ei_addr!=null) && user_id > 0){
      //https://c4ei.net/rcv?rcv_email=his001@nate.com&rcv_adr=0x0077b5723B4017b38471F80725f7e3c3347FfB03&rcv_amt=10&tt=2021-11-09_10:19:19.000
      let user_ip   = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
      save_db_user_bal(user_id, txt_to_address, txt_to_amt, user_ip);
      var txt_memo =txt_my_email +" : c4ei->"+to_email +":"+txt_to_amt;
      save_db_sendlog(user_id, txt_my_addr, txt_to_address, txt_to_amt, user_ip, txt_memo);
    }
    /////////////////////////
    res.render('sendok', { title: 'easypay Send OK',email:user_email, my_email : txt_my_email, my_addr:txt_my_addr
            , my_balance:txt_my_balance-txt_to_amt, to_address:txt_to_address ,to_amt:txt_to_amt});
  }
});

///////
router.get('/exPot2C4ei', function(req, res, next) {
  if (req.cookies.user_idx == "" || req.cookies.user_idx === undefined) {
    res.sendFile(STATIC_PATH + '/ulogin.html')
    return;
  }
  else {
    /////////////////////////
    let user_email = req.cookies.user_email;
    let result = sync_connection.query("SELECT id, c4ei_addr, c4ei_balance, pot, bck_balance, klay_addr, klay_balance, klay_ceik_addr, klay_ceik_balance FROM user a WHERE a.email='" + user_email + "'");
    let user_id = result[0].id;
    let c4ei_addr = result[0].c4ei_addr;
    let c4ei_balance = result[0].c4ei_balance;
    let pot_balance = result[0].pot;
    let bck_balance = result[0].bck_balance;
    let klay_addr = result[0].klay_addr;
    let klay_balance = result[0].klay_balance;
    let klay_ceik_addr = result[0].klay_ceik_addr;
    let klay_ceik_balance = result[0].klay_ceik_balance;

    // console.log("c4ei_addr :"+c4ei_addr);
    if ((c4ei_addr!="" &&c4ei_addr!=null) && user_id > 0){
      var wallet_balance = web3.eth.getBalance(c4ei_addr, function(error, result) {
        // console.log("wallet_balance : "+ web3.utils.fromWei(result, "ether")); //0x21725F3b26F74C8E451d851e040e717Fbcf19E5b
        wallet_balance = web3.utils.fromWei(result, "ether");
        // wallet_balance = getAmtWei(result);
        if (wallet_balance != c4ei_balance){
          let result = sync_connection.query("update user set c4ei_balance='"+wallet_balance+"' WHERE id='" + user_id + "'");
          console.log(user_email +" wallet_balance :"+wallet_balance);
          c4ei_balance = wallet_balance;
        }
      });
    }
    /////////////////////////
    res.render('exPot2C4ei', { title: 'easypay Send', c4ei_addr : c4ei_addr, c4ei_balance : c4ei_balance, email: user_email, 
      pot:pot_balance});
  }
});

router.get('/exC4ei2Pot', function(req, res, next) {
  if (req.cookies.user_idx == "" || req.cookies.user_idx === undefined) {
    res.sendFile(STATIC_PATH + '/ulogin.html')
    return;
  }
  else {
    /////////////////////////
    let user_email = req.cookies.user_email;
    let result = sync_connection.query("SELECT id, c4ei_addr, c4ei_balance, pot, bck_balance, klay_addr, klay_balance, klay_ceik_addr, klay_ceik_balance FROM user a WHERE a.email='" + user_email + "'");
    let user_id = result[0].id;
    let c4ei_addr = result[0].c4ei_addr;
    let c4ei_balance = result[0].c4ei_balance;
    let pot_balance = result[0].pot;
    let bck_balance = result[0].bck_balance;
    let klay_addr = result[0].klay_addr;
    let klay_balance = result[0].klay_balance;
    let klay_ceik_addr = result[0].klay_ceik_addr;
    let klay_ceik_balance = result[0].klay_ceik_balance;

    // console.log("c4ei_addr :"+c4ei_addr);
    if ((c4ei_addr!="" &&c4ei_addr!=null) && user_id > 0){
      var wallet_balance = web3.eth.getBalance(c4ei_addr, function(error, result) {
        // console.log("wallet_balance : "+ web3.utils.fromWei(result, "ether")); //0x21725F3b26F74C8E451d851e040e717Fbcf19E5b
        wallet_balance = web3.utils.fromWei(result, "ether");
        // wallet_balance = getAmtWei(result);
        if (wallet_balance != c4ei_balance){
          let result = sync_connection.query("update user set c4ei_balance='"+wallet_balance+"' WHERE id='" + user_id + "'");
          console.log(user_email +" wallet_balance :"+wallet_balance);
          c4ei_balance = wallet_balance;
        }
      });
    }
    /////////////////////////
    res.render('exC4ei2Pot', { title: 'easypay Send', c4ei_addr : c4ei_addr, c4ei_balance : c4ei_balance, email: user_email, 
      pot:pot_balance});
  }
});

//////////////////////////// start klay ////////////////////////////

//klay ceik
router.get('/exCeik2Pot', function(req, res, next) {
  if (req.cookies.user_idx == "" || req.cookies.user_idx === undefined) {
    res.sendFile(STATIC_PATH + '/ulogin.html')
    return;
  }
  else {
    /////////////////////////
    let user_email = req.cookies.user_email;
    let result = sync_connection.query("SELECT id, c4ei_addr, c4ei_balance, pot, bck_balance, klay_addr, klay_balance, klay_ceik_addr, klay_ceik_balance FROM user a WHERE a.email='" + user_email + "'");
    let user_id = result[0].id;
    let c4ei_addr = result[0].c4ei_addr;
    let c4ei_balance = result[0].c4ei_balance;
    let pot_balance = result[0].pot;
    let bck_balance = result[0].bck_balance;
    let klay_addr = result[0].klay_addr;
    let klay_balance = result[0].klay_balance;
    let klay_ceik_addr = result[0].klay_ceik_addr;
    let klay_ceik_balance = result[0].klay_ceik_balance;
    // console.log("klay_addr :"+klay_addr);
    let err_msg = "";
    if ((klay_addr!="" &&klay_addr!=null) && user_id > 0){
      // let klay_balance_block =  getBalanceKlay(klay_addr);
      // caver.rpc.klay.getBalance(address).then((response) => {
      //   const klay_balance_block = caver.utils.convertFromPeb(caver.utils.hexToNumberString(response));
      //   if (klay_balance_block != klay_balance){
      //     let result = sync_connection.query("update user set klay_balance='"+klay_balance_block+"' WHERE id='" + user_id + "'");
      //     console.log(user_email +" klay_balance_block :"+klay_balance_block);
      //     klay_balance = klay_balance_block;
      //   }
      // });
      //caver.rpc.klay.getBalance('0x0011A1cad2cA5d23Fde3cc0DefB10e1a8C3Df0c4').then(console.log)
      var wallet_balance = caver.rpc.klay.getBalance(klay_addr, function(error, result) {
        // if(result != "undefined" || result != undefined){
        if(error == ""){
          wallet_balance = caver.utils.convertFromPeb(caver.utils.hexToNumberString(result));
          // wallet_balance = caver.utils.convertFromPeb(result, "KLAY");
          if (wallet_balance != klay_balance){
            let result = sync_connection.query("update user set klay_balance='"+wallet_balance+"' WHERE id='" + user_id + "'");
            console.log(user_email +" wallet_balance :"+wallet_balance);
            klay_balance = wallet_balance;
          }
        }else{
          err_msg = "caver.rpc.klay.getBalance maybe wrong";
          console.log(err_msg);
        }
        // console.log("klay_wallet_balance : "+ caver.rpc.utils.convertFromPeb(result, "KLAY")); //0x0011A1cad2cA5d23Fde3cc0DefB10e1a8C3Df0c4
         //0x0011A1cad2cA5d23Fde3cc0DefB10e1a8C3Df0c4
      });
    }
    /////////////////////////
    
    res.render('exCeik2Pot', { title: 'easypay Send Ceik2Pot', 
      c4ei_addr : c4ei_addr, c4ei_balance : c4ei_balance, email: user_email, 
      pot:pot_balance, klay_addr:klay_addr, klay_balance:klay_balance, klay_ceik_addr:klay_ceik_addr,
      klay_ceik_balance:klay_ceik_balance, err_msg : err_msg
    });
  }
});

//klay ceik
router.post('/exTrCeikToPot', function(req, res, next) {
  console.log('/exTrCeikToPot');
  if (req.cookies.user_idx == "" || req.cookies.user_idx === undefined) {
    res.sendFile(STATIC_PATH + '/ulogin.html')
    return;
  }
  else {
    /////////////////////////
    var txt_my_email    = req.body.txt_my_email;
    var txt_my_addr     = req.body.txt_my_addr;
    var txt_my_balance  = req.body.txt_my_balance;
    var txt_pot_balance = req.body.txt_pot_balance;
    var txt_chg_ceik    = req.body.txt_chg_ceik;
    var txt_chg_pot     = req.body.txt_chg_pot;

    let user_email = req.cookies.user_email;
    let result = sync_connection.query("SELECT id, c4ei_addr, c4ei_balance, pot, bck_balance, klay_addr, klay_balance, klay_ceik_addr, klay_ceik_balance FROM user a WHERE a.email='" + user_email + "'");
    let user_id = result[0].id;
    let c4ei_addr = result[0].c4ei_addr;
    let c4ei_balance = result[0].c4ei_balance;
    let pot_balance = result[0].pot;
    let bck_balance = result[0].bck_balance;
    let klay_addr = result[0].klay_addr;
    let klay_balance = result[0].klay_balance;
    let klay_ceik_addr = result[0].klay_ceik_addr;
    let klay_ceik_balance = result[0].klay_ceik_balance;

    if(txt_my_email != user_email){ console.log('email different so can`t send'); return; }
    if(klay_ceik_addr!=txt_my_addr){ console.log('klay_ceik_addr different so can`t send'); return; }
    // balance changed ... 
    if(klay_ceik_balance!=txt_my_balance){ 
      console.log('balance different so can`t send'); 
      res.render('msgpage', { title: 'oops', msg : 'klay_ceik balance different so can`t send'});
      return; 
    }
    if((klay_ceik_balance-txt_chg_ceik)<0){ 
      console.log('not enough balance so can`t send'); 
      res.render('msgpage', { title: 'oops', msg : 'not enough balance so can`t send'});
      return; 
    }
    if(pot_balance!=txt_pot_balance){ 
      //
    }
    // console.log("c4ei_addr :"+c4ei_addr);
    if ((klay_ceik_addr!="" &&klay_ceik_addr!=null) && user_id > 0){
      let user_ip   = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
      save_db_ceik2pot(user_id, txt_chg_ceik, txt_chg_pot, user_ip);
      var txt_to_address ="0x7C720ca152B43fa72a24eCcd51ccDAFBF74A884e"; // clip klay
      var txt_memo =txt_chg_ceik +" c4ei -> "+txt_chg_pot+" pot self ";
      save_db_send_ceik_log(user_id, txt_my_addr, txt_to_address, txt_chg_ceik, user_ip,txt_memo);
    }
    /////////////////////////
    // res.render('exP0t2C4eiok', { title: 'easypay Send OK', my_email : txt_my_email, my_addr:txt_my_addr, my_balance:txt_my_balance-txt_to_amt, to_address:txt_to_address ,to_amt:txt_to_amt});
    res.redirect('/');
  }
});

async function save_db_ceik2pot(user_id, txt_chg_ceik, txt_chg_pot, user_ip){
  console.log("save_db_ceik2pot");
  const connection = await pool.getConnection(async conn => conn); 
  let strsql ="update user set klay_ceik_balance=klay_ceik_balance-'"+txt_chg_ceik+"',pot=pot+'"+txt_chg_pot+"', last_reg=now(),last_ip='"+user_ip+"' where id = '" + user_id + "'";
  console.log(strsql);
  try { 
    await connection.beginTransaction(); 
    await connection.query(strsql); 
    await connection.commit(); 
    console.log('save_db_ceik2pot update 1 success!'); 
  } catch (err) { 
    await connection.rollback(); 
    throw err; 
  } finally { 
    connection.release();
  }
}

async function save_db_send_ceik_log(user_id,txt_my_addr,txt_to_address,txt_to_amt,user_ip,txt_memo){
  //######################################################################################
  // async save test !!!!
  //######################################################################################
  var fromAmt = await getAmt(txt_my_addr); fromAmt = await getAmtWei(fromAmt);
  var toAmt = await getAmt(txt_to_address); toAmt = await getAmtWei(toAmt);
  var strsql = "insert into sendlog_klay (userIdx ,fromAddr ,fromAmt ,toAddr ,toAmt ,sendAmt ,regip, memo)";
  strsql = strsql + " values ('" + user_id + "','" + txt_my_addr + "','" + fromAmt + "','" + txt_to_address + "','" + toAmt + "','" + txt_to_amt + "','" + user_ip + "','"+txt_memo+"')";
  const connection = await pool.getConnection(async conn => conn); 
  try { 
    await connection.beginTransaction(); 
    await connection.query(strsql); 
    await connection.commit(); 
    console.log('save_db_send_ceik_log insert success!'); 
  } catch (err) { 
    await connection.rollback(); 
    throw err; 
  } finally { 
    connection.release();

    // sync
    let result1 = sync_connection.query("select max(tidx) as maxtidx from sendlog_klay where userIdx = '" + user_id + "'");
    let tidx = result1[0].maxtidx;
    console.log("############# " + tidx +" : rtn #############");
    sendTr_klay(txt_my_addr, txt_to_address, txt_to_amt, tidx);

  }
}

async function sendTr_klay(txt_my_addr, txt_to_address, txt_to_amt, tidx){
  console.log('CEIK 트랜잭션 수행');
  if (await fn_unlockAccount_klay(txt_my_addr))
  {
    var log="";
    caver.klay.sendTransaction({
      from: txt_my_addr,
      to: txt_to_address,
      value: caver.utils.convertFromPeb(caver.utils.hexToNumberString(txt_to_amt)),
      gas: 100000
    }).
    //on('confirmation', function(confNumber, receipt, latestBlockHash){ console.log('CONFIRMED'); })
    once('sent', function(payload){ console.log('sent'); })
    .then(function(receipt){
      save_db_sendlog_ceik_end(tidx ,receipt.blockNumber, receipt.contractAddress, receipt.blockHash, receipt.transactionHash ,'Y');
    });
  }
}

async function fn_unlockAccount_klay(addr){
  let rtn_result = false;
  await caver.klay.personal.unlockAccount(addr, process.env.C4EI_ADDR_PWD, 500).then(function (result) {
    rtn_result = result;
    console.log('fn_unlockAccount_klay result :' + result);
  });
  return await rtn_result;
}

async function save_db_sendlog_ceik_end(tidx ,blockNumber,contractAddress,blockHash,transactionHash , successYN){
  console.log("save_db_sendlog_ceik_end");
  const connection = await pool.getConnection(async conn => conn); 
  let strsql ="update sendlog_klay set blockNumber='"+blockNumber+"',contractAddress='"+contractAddress+"',blockHash='"+blockHash+"',transactionHash='"+transactionHash+"', successYN='"+successYN+"', last_reg=now() where tidx = '" + tidx + "'";
  try { 
    await connection.beginTransaction(); 
    await connection.query(strsql); 
    await connection.commit(); 
    console.log('save_db_sendlog_ceik_end insert success!'); 
  } catch (err) { 
    await connection.rollback(); 
    throw err; 
  } finally { 
    connection.release();
  }
}

// const getBalanceKlay = (address) => {
// 	return caver.rpc.klay.getBalance(address).then((response) => {
// 		const _balance = caver.utils.convertFromPeb(caver.utils.hexToNumberString(response));
// 		console.log(`BALANCE: ${_balance}`);
// 		return _balance;
// 	})
// }

//////////////////////////// end klay ////////////////////////////

router.post('/exTrCP', function(req, res, next) {
  console.log('/exTrCP');
  if (req.cookies.user_idx == "" || req.cookies.user_idx === undefined) {
    res.sendFile(STATIC_PATH + '/ulogin.html')
    return;
  }
  else {
    /////////////////////////
    var txt_my_email    = req.body.txt_my_email;
    var txt_my_addr     = req.body.txt_my_addr;
    var txt_my_balance  = req.body.txt_my_balance;
    var txt_pot_balance = req.body.txt_pot_balance;
    var txt_chg_c4ei    = req.body.txt_chg_c4ei;
    var txt_chg_pot     = req.body.txt_chg_pot;

    let user_email = req.cookies.user_email;
    let result = sync_connection.query("SELECT id, c4ei_addr, c4ei_balance, pot, bck_balance, klay_addr, klay_balance, klay_ceik_addr, klay_ceik_balance FROM user a WHERE a.email='" + user_email + "'");
    let user_id = result[0].id;
    let c4ei_addr = result[0].c4ei_addr;
    let c4ei_balance = result[0].c4ei_balance;
    let pot_balance = result[0].pot;
    let bck_balance = result[0].bck_balance;
    let klay_addr = result[0].klay_addr;
    let klay_balance = result[0].klay_balance;
    let klay_ceik_addr = result[0].klay_ceik_addr;
    let klay_ceik_balance = result[0].klay_ceik_balance;

    if(txt_my_email != user_email){ console.log('email different so can`t send'); return; }
    if(c4ei_addr!=txt_my_addr){ console.log('c4ei_addr different so can`t send'); return; }
    // balance changed ... 
    if(c4ei_balance!=txt_my_balance){ 
      console.log('balance different so can`t send'); 
      res.render('msgpage', { title: 'oops', msg : 'balance different so can`t send'});
      return; 
    }
    if((c4ei_balance-txt_chg_c4ei)<0){ 
      console.log('not enough balance so can`t send'); 
      res.render('msgpage', { title: 'oops', msg : 'not enough balance so can`t send'});
      return; 
    }
    if(pot_balance!=txt_pot_balance){ 
      //
    }
    // console.log("c4ei_addr :"+c4ei_addr);
    if ((c4ei_addr!="" &&c4ei_addr!=null) && user_id > 0){
      //https://c4ei.net/rcv?rcv_email=his001@nate.com&rcv_adr=0x0077b5723B4017b38471F80725f7e3c3347FfB03&rcv_amt=10&tt=2021-11-09_10:19:19.000
      let user_ip   = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
      save_db_c4ei2pot(user_id, txt_chg_c4ei, txt_chg_pot, user_ip);
      var txt_to_address ="0x66ec272cf68967ff821db6fd5ab8ae2ed35014e4";
      var txt_memo =txt_chg_c4ei +" c4ei -> "+txt_chg_pot+" pot self ";
      save_db_sendlog(user_id, txt_my_addr, txt_to_address, txt_chg_c4ei, user_ip,txt_memo);
    }
    /////////////////////////
    // res.render('exP0t2C4eiok', { title: 'easypay Send OK', my_email : txt_my_email, my_addr:txt_my_addr, my_balance:txt_my_balance-txt_to_amt, to_address:txt_to_address ,to_amt:txt_to_amt});
    res.redirect('/');
  }
});

router.post('/exTrPC', function(req, res, next) {
  console.log('/exTrPC');
  if (req.cookies.user_idx == "" || req.cookies.user_idx === undefined) {
    res.sendFile(STATIC_PATH + '/ulogin.html')
    return;
  }
  else {
    /////////////////////////
    var txt_my_email    = req.body.txt_my_email;
    var txt_my_addr     = req.body.txt_my_addr;
    var txt_my_balance  = req.body.txt_my_balance;
    var txt_pot_balance = req.body.txt_pot_balance;
    var txt_chg_c4ei    = req.body.txt_chg_c4ei;
    var txt_chg_pot     = req.body.txt_chg_pot;

    let user_email = req.cookies.user_email;
    let result = sync_connection.query("SELECT id, c4ei_addr, c4ei_balance, pot, bck_balance, klay_addr, klay_balance, klay_ceik_addr, klay_ceik_balance FROM user a WHERE a.email='" + user_email + "'");
    let user_id = result[0].id;
    let c4ei_addr = result[0].c4ei_addr;
    let c4ei_balance = result[0].c4ei_balance;
    let pot_balance = result[0].pot;
    let bck_balance = result[0].bck_balance;
    let klay_addr = result[0].klay_addr;
    let klay_balance = result[0].klay_balance;
    let klay_ceik_addr = result[0].klay_ceik_addr;
    let klay_ceik_balance = result[0].klay_ceik_balance;

    if(txt_my_email != user_email){ console.log('email different so can`t send'); return; }
    if(c4ei_addr!=txt_my_addr){ console.log('c4ei_addr different so can`t send'); return; }
    // balance changed ... 
    // if(c4ei_balance!=txt_my_balance){ 
    //   console.log('balance different so can`t send'); 
    //   res.render('msgpage', { title: 'oops', msg : 'balance different so can`t send'});
    //   return; 
    // }
    if((pot_balance-txt_chg_pot)<0){ 
      console.log('not enough balance so can`t send'); 
      res.render('msgpage', { title: 'oops', msg : 'not enough balance so can`t send'});
      return; 
    }
    if(pot_balance!=txt_pot_balance){ 
      //
    }
    // console.log("c4ei_addr :"+c4ei_addr);
    if ((c4ei_addr!="" &&c4ei_addr!=null) && user_id > 0){
      //https://c4ei.net/rcv?rcv_email=his001@nate.com&rcv_adr=0x0077b5723B4017b38471F80725f7e3c3347FfB03&rcv_amt=10&tt=2021-11-09_10:19:19.000
      let user_ip   = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
      save_db_pot2c4ei(user_id, txt_chg_c4ei, txt_chg_pot, user_ip);
      var txt_to_address ="0x66ec272cf68967ff821db6fd5ab8ae2ed35014e4";
      var txt_memo = txt_chg_pot + " : pot --> " + txt_chg_c4ei +" : c4ei ->  self ";
      /////////////////////////
      // save_db_sendlog(user_id, txt_my_addr, txt_to_address, txt_chg_c4ei, user_ip,txt_memo);
      //username : bankC4ei
      //id : 17
      //email : wwwggbbest@gmail.com
      //address : 0x014B0c7D9b22469fE13abf585b1E38676A4a136f
      save_db_sendlog(17, "0x014B0c7D9b22469fE13abf585b1E38676A4a136f", c4ei_addr, txt_chg_c4ei, user_ip,txt_memo);
      /////////////////////////
    }
    /////////////////////////
    // res.render('exP0t2C4eiok', { title: 'easypay Send OK', my_email : txt_my_email, my_addr:txt_my_addr, my_balance:txt_my_balance-txt_to_amt, to_address:txt_to_address ,to_amt:txt_to_amt});
    res.redirect('/');
  }
});

async function save_db_pot2c4ei(user_id, txt_chg_c4ei, txt_chg_pot, user_ip){
  console.log("save_db_pot2c4ei");
  const connection = await pool.getConnection(async conn => conn); 
  let strsql ="update user set c4ei_balance=c4ei_balance+'"+txt_chg_c4ei+"',pot=pot-'"+txt_chg_pot+"', last_reg=now(),last_ip='"+user_ip+"' where id = '" + user_id + "'";
  console.log(strsql);
  try { 
    await connection.beginTransaction(); 
    await connection.query(strsql); 
    await connection.commit(); 
    console.log('save_db_pot2c4ei update 1 success!'); 
  } catch (err) { 
    await connection.rollback(); 
    throw err; 
  } finally { 
    connection.release();
  }
}

async function save_db_c4ei2pot(user_id, txt_chg_c4ei, txt_chg_pot, user_ip){
  console.log("save_db_c4ei2pot");
  const connection = await pool.getConnection(async conn => conn); 
  let strsql ="update user set c4ei_balance=c4ei_balance-'"+txt_chg_c4ei+"',pot=pot+'"+txt_chg_pot+"', last_reg=now(),last_ip='"+user_ip+"' where id = '" + user_id + "'";
  console.log(strsql);
  try { 
    await connection.beginTransaction(); 
    await connection.query(strsql); 
    await connection.commit(); 
    console.log('save_db_c4ei2pot update 1 success!'); 
  } catch (err) { 
    await connection.rollback(); 
    throw err; 
  } finally { 
    connection.release();
  }
}

async function save_db_user_bal(user_id, txt_to_address, txt_to_amt, user_ip){
  console.log("save_db_user_bal");

  let result1 = sync_connection.query("SELECT id, c4ei_addr, c4ei_balance FROM user WHERE c4ei_addr='" + txt_to_address + "'");
  let to_id = result1[0].id;

  const connection = await pool.getConnection(async conn => conn); 
  let strsql ="update user set c4ei_balance=c4ei_balance-'"+txt_to_amt+"', last_reg=now(),last_ip='"+user_ip+"' where id = '" + user_id + "'";
  try { 
    await connection.beginTransaction(); 
    await connection.query(strsql); 
    await connection.commit(); 
    console.log('save_db_user_bal update 1 success!'); 
  } catch (err) { 
    await connection.rollback(); 
    throw err; 
  } finally { 
    connection.release();
  }
  let strsql2 ="update user set c4ei_balance=c4ei_balance+'"+txt_to_amt+"', last_reg=now() where id = '" + to_id + "'";
  try { 
    await connection.beginTransaction(); 
    await connection.query(strsql2); 
    await connection.commit(); 
    console.log('save_db_user_bal update 2 success!'); 
  } catch (err) { 
    await connection.rollback(); 
    throw err; 
  } finally { 
    connection.release();
  }

}

async function save_db_sendlog(user_id,txt_my_addr,txt_to_address,txt_to_amt,user_ip,txt_memo){
  //######################################################################################
  // async save test !!!!
  //######################################################################################
  var fromAmt = await getAmt(txt_my_addr); fromAmt = await getAmtWei(fromAmt);
  var toAmt = await getAmt(txt_to_address); toAmt = await getAmtWei(toAmt);
  var strsql = "insert into sendlog (userIdx ,fromAddr ,fromAmt ,toAddr ,toAmt ,sendAmt ,regip, memo)";
  strsql = strsql + " values ('" + user_id + "','" + txt_my_addr + "','" + fromAmt + "','" + txt_to_address + "','" + toAmt + "','" + txt_to_amt + "','" + user_ip + "','"+txt_memo+"')";
  const connection = await pool.getConnection(async conn => conn); 
  try { 
    await connection.beginTransaction(); 
    await connection.query(strsql); 
    await connection.commit(); 
    console.log('save_db_sendlog insert success!'); 
  } catch (err) { 
    await connection.rollback(); 
    throw err; 
  } finally { 
    connection.release();

    // sync
    let result1 = sync_connection.query("select max(tidx) as maxtidx from sendlog where userIdx = '" + user_id + "'");
    let tidx = result1[0].maxtidx;
    console.log("############# " + tidx +" : rtn #############");
    sendTr(txt_my_addr, txt_to_address, txt_to_amt, tidx);

  }
}

async function fn_unlockAccount(addr){
  let rtn_result = false;
  await web3.eth.personal.unlockAccount(addr, process.env.C4EI_ADDR_PWD, 500).then(function (result) {
    rtn_result = result;
    console.log('fn_unlockAccount result :' + result);
  });
  return await rtn_result;
}

async function sendTr(txt_my_addr, txt_to_address, txt_to_amt, tidx){
  console.log('C4EI 트랜잭션 수행');
  if (await fn_unlockAccount(txt_my_addr))
  {
    // web3.eth.sendTransaction({from: '0x123...', data: '0x432...'})
    // .once('sending', function(payload){ ... })
    // .once('sent', function(payload){ ... })
    // .once('transactionHash', function(hash){ ... })
    // .once('receipt', function(receipt){ ... })
    // .on('confirmation', function(confNumber, receipt, latestBlockHash){ ... })
    // .on('error', function(error){ ... })
    // .then(function(receipt){
    //   // will be fired once the receipt is mined
    // }); and it does not recognize .once, .on, or.then
    // or.catch

    var log="";
    web3.eth.sendTransaction({
      from: txt_my_addr,
      to: txt_to_address,
      value: web3.utils.toWei(txt_to_amt,'ether'),
      gas: 100000
    }).
    //on('confirmation', function(confNumber, receipt, latestBlockHash){ console.log('CONFIRMED'); })
    once('sent', function(payload){ console.log('sent'); })
    .then(function(receipt){
      save_db_sendlog_end(tidx ,receipt.blockNumber, receipt.contractAddress, receipt.blockHash, receipt.transactionHash ,'Y');
    });
  }
}

async function save_db_sendlog_end(tidx ,blockNumber,contractAddress,blockHash,transactionHash , successYN){
  console.log("save_db_sendlog_end");
  const connection = await pool.getConnection(async conn => conn); 
  let strsql ="update sendlog set blockNumber='"+blockNumber+"',contractAddress='"+contractAddress+"',blockHash='"+blockHash+"',transactionHash='"+transactionHash+"', successYN='"+successYN+"', last_reg=now() where tidx = '" + tidx + "'";
  try { 
    await connection.beginTransaction(); 
    await connection.query(strsql); 
    await connection.commit(); 
    console.log('save_db_sendlog insert success!'); 
  } catch (err) { 
    await connection.rollback(); 
    throw err; 
  } finally { 
    connection.release();
  }
}

async function getAmt(address){
  try {
    var showAmt = await web3.eth.getBalance(address, function(error, result) { 
      showAmt = getAmtWei(result) ;
      // console.log(showAmt +" : showAmt");
    });
  } catch (e) {
    return -1;
  }
  return showAmt;
}

async function getAmtWei(amt){
  try {
    amt = await web3.utils.fromWei(amt, "ether");
    // console.log(amt +" : amt - async function - 198");
    return amt;
  } catch (e) {
    return -1;
  }
}


// async function isUnlocked (web3, address) {
//   try {
//       await web3.eth.sign("", address);
//   } catch (e) {
//       return false;
//   }
//   return true;
// }

router.get('/address_generator', function(req, res, next) {
  if (req.cookies.user_idx == "" || req.cookies.user_idx === undefined) {
    res.sendFile(STATIC_PATH + '/ulogin.html')
    return;
  }
  else {
    /////////////////////////
    console.log("address_generator ");
    let user_email = req.cookies.user_email;
    let result1 = sync_connection.query("SELECT id, c4ei_addr, c4ei_balance, pot, bck_balance, klay_addr, klay_balance, klay_ceik_addr, klay_ceik_balance FROM user a WHERE a.email='" + user_email + "'");
    let user_id = result1[0].id;
    let c4ei_addr = result1[0].c4ei_addr;
    let klay_addr = result1[0].klay_addr;
    let klay_balance = result1[0].klay_balance;
    let klay_ceik_addr = result1[0].klay_ceik_addr;
    let klay_ceik_balance = result1[0].klay_ceik_balance;
    let user_ip   = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

    // let c4ei_balance = result1[0].c4ei_balance;
    if ((c4ei_addr=="" ||c4ei_addr==null) && user_id > 0){
      let result2 = sync_connection.query("SELECT idx,address,cur_bal FROM address WHERE useYN='Y' and mappingYN='N' AND cur_bal=0 AND user_id=0 LIMIT 1");
      let new_address = result2[0].address;
      console.log("new_address :"+ new_address);
      let result3 = sync_connection.query("UPDATE address SET email='"+user_email+"',user_id='" + user_id + "',mappingYN='Y',last_reg=now() WHERE  address ='"+new_address+"'");
      let result4 = sync_connection.query("UPDATE user SET c4ei_addr='"+new_address+"',regip='"+user_ip+"',last_reg=now() WHERE id='" + user_id + "'");
      console.log("result4 end");
    }
    // klay
    if ((klay_addr=="" ||klay_addr==null) && user_id > 0){
      let result5 = sync_connection.query("SELECT idx,address,cur_bal FROM address_klay WHERE useYN='Y' and mappingYN='N' AND cur_bal=0 AND user_id=0 LIMIT 1");
      let new_address_klay = result5[0].address;
      console.log("new_address_klay :"+ new_address_klay);
      let result6 = sync_connection.query("UPDATE address_klay SET email='"+user_email+"',user_id='" + user_id + "',mappingYN='Y',last_reg=now() WHERE  address ='"+new_address_klay+"'");
      let result7 = sync_connection.query("UPDATE user SET klay_addr='"+new_address_klay+"', klay_ceik_addr='"+new_address_klay+"',regip='"+user_ip+"',last_reg=now() WHERE id='" + user_id + "'");
      console.log("result7 end");
    }

    res.redirect('/');
    /////////////////////////
  }
});

router.get('/logout', function(req, res, next) {
  res.cookie('user_idx', ''); // 2021-11-08
  res.cookie('user_email', ''); // 2021-11-08
  res.redirect('/');
});

router.get('/', auth(), awaitHandlerFactory(userController.getAllUsers)); // localhost:3000/api/v1/users
router.get('/id/:id', auth(), awaitHandlerFactory(userController.getUserById)); // localhost:3000/api/v1/users/id/1
router.get('/username/:username', auth(), awaitHandlerFactory(userController.getUserByuserName)); // localhost:3000/api/v1/users/usersname/julia
router.get('/whoami', auth(), awaitHandlerFactory(userController.getCurrentUser)); // localhost:3000/api/v1/users/whoami
router.post('/', 
  createUserSchema, 
  awaitHandlerFactory(userController.createUser)
); // localhost:3000/api/v1/users
router.patch('/id/:id', auth(Role.Admin), updateUserSchema, awaitHandlerFactory(userController.updateUser)); // localhost:3000/api/v1/users/id/1 , using patch for partial update
router.delete('/id/:id', auth(Role.Admin), awaitHandlerFactory(userController.deleteUser)); // localhost:3000/api/v1/users/id/1
router.post('/login', validateLogin, awaitHandlerFactory(userController.userLogin)); // localhost:3000/api/v1/users/login


////////////////////////////////////////////////////////////////////////
//https://stackoverflow.com/questions/63458440/save-google-authenticated-user-into-mysql-database-with-node-js-and-passport-js
//npm install passport passport-google-oauth2
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const passport = require("passport");
router.use(passport.initialize());

passport.serializeUser((user, done) => { 
  // console.log("passport.serializeUser"); 
  done(null, user);
  
});

passport.deserializeUser((req, user, done) => {
  // console.log("passport.deserializeUser");
  sync_connection.query("SELECT id, username, email, google_id, google_token FROM user WHERE google_id = ?", [user.google_id], (err, rows) => {
      if (err) {
          console.log(err);
          return done(null, err);
      }
      done(null, user);
  });
});

passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CLIENT_CALLBACK,
      passReqToCallback: true,
      // profileFields: configAuth.googleAuth.profileFields
  }, 
  function (req, accessToken, refreshToken, profile, done) {
    var user_ip   = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    process.nextTick(function () {
      try{
        let result1 = sync_connection.query("SELECT id, username, email, google_id, google_token FROM user WHERE google_id ='" + profile.id + "'");
        let user_idx = result1[0].id;
        let user_email = result1[0].email;
        let google_id = result1[0].google_id;
        let google_token = result1[0].google_token;
        let google_name = result1[0].username;

        //####################################
        req.session.user_idx = user_idx;
        req.session.user_email = user_email;
        //####################################

        let user = { google_id: google_id, google_token: google_token, google_email: user_email, google_name: google_name }
        return done(null, user);
      }catch (err){
        console.log(err + ":err");
        let newUser = {
          google_id: profile.id,
          google_token: accessToken,
          google_email: profile.emails[0].value,
          google_name: profile.name.givenName + ' ' + profile.name.familyName
          }
          save_db_googleid(newUser.google_name, newUser.google_email, newUser.google_id, newUser.google_token, user_ip);
          return done(null, newUser);
        }
      });
    }
));

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: '/session2cookie',
    failureRedirect: '/htmlLogin'
}));

function save_db_googleid(username, email, google_id, google_token, user_ip){
  //######################################################################################
  // async save test !!!!
  //######################################################################################
  var strsql = "INSERT INTO user (username, email, google_id, google_token, password, regip) values ('" + username + "','" + email + "','" + google_id + "','" + google_token + "','$2a$08$kCv8ZIWU1pMiTm8BNJl.eeTYr2iopCY5YsuG1KGcB3D2qk6kiUv7a','"+user_ip+"')";
  // console.log(strsql);
  try { 
    let result1 = sync_connection.query(strsql);
    console.log("############# google insert success #############");
  } catch (err) { 
    console.log("############# google insert fail #############");
  } 
}
////////////////////////////////////////////////////////////////////////

////////////////////////// start erc token c4ei //////////////////////////
const minABI = [
  // balanceOf
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
];
function getC4eiTokenNameToAddress(tokenName) {
  var  tokenAddress = "";
  switch (tokenName) {
    case "BCK": tokenAddress = "0x1d187BbeCeF8d7b1731339c301ab8354d4F0A50b"; // BCK (BlockChainKorea)
    break;
    // case "RNT": tokenAddress = "0x7E6af705dB981D0E391B4e063E39a6bbDF60e66f"; // RNT (RENTAL)
    // break;
    default : tokenAddress = "0x1d187BbeCeF8d7b1731339c301ab8354d4F0A50b"; // BCK (BlockChainKorea)
    break;
  }
  return tokenAddress;
}
async function getBalanceC4eiToken(tokenName, walletAddress, email, pre_bck_balance) {
  var tokenAddress = getC4eiTokenNameToAddress(tokenName);
  const Web3 = require("web3");
  const provider = "http://192.168.1.185:21004"
  const Web3Client = new Web3(new Web3.providers.HttpProvider(provider));
  const contract = new Web3Client.eth.Contract(minABI, tokenAddress);
  const result = await contract.methods.balanceOf(walletAddress).call(); // 
  let tokenbal = Web3Client.utils.fromWei(result); // 10
  console.log("getBalanceC4eiToken block bck bal : "+tokenbal + " / db bck bal : " + pre_bck_balance);
  if (pre_bck_balance != tokenbal){
    const connection = await pool.getConnection(async conn => conn); 
    let strsql ="update user set bck_balance='"+tokenbal+"' WHERE email='" + email + "'";
    try { 
      await connection.beginTransaction(); 
      await connection.query(strsql); 
      await connection.commit(); 
      console.log('getBalanceC4eiToken update success!'); 
    } catch (err) { 
      await connection.rollback(); 
      throw err; 
    } finally { 
      connection.release();
    }
  }
}

//send
async function fn_unlockAccount_C4eiToken(addr){
  let rtn_result = false;
  await web3.eth.personal.unlockAccount(addr, process.env.C4EI_ADDR_PWD, 500).then(function (result) {
    rtn_result = result;
    console.log('fn_unlockAccount_C4eiToken result :' + result);
  });
  return await rtn_result;
}
async function sendC4eiToken(tokenName, sendAddress, recvAddress, sendAmt, send_email){
    const bckExchangeAbi = require("../app/abi/erc20abi.json");
    var tokenAddress = getC4eiTokenNameToAddress(tokenName);
    const TokenInstance = new web3.eth.Contract(bckExchangeAbi, tokenAddress)
    TokenInstance.methods.transfer(recvAddress, web3.utils.toWei(sendAmt,'ether')).send({from: sendAddress})
    .on('transactionHash', (hash) => { console.log("### transactionHash ###"); console.log(hash);})
    .once('receipt', (receipt) => {
      console.log(send_email +":send_email / "+"blockNumber " + receipt.blockNumber + " / contractAddress" + receipt.contractAddress + " / blockHash" + receipt.blockHash + " / transactionHash" + receipt.transactionHash);
      save_db_sendlogC4eiToken_end(tidx ,receipt.blockNumber, receipt.contractAddress, receipt.blockHash, receipt.transactionHash ,'Y');
    })
    // .on('confirmation', (confirmationNumber, receipt) => { console.log("### confirmation ###" + confirmationNumber);})
    .on('error', console.error);
}
async function sendC4eiTokenBCK(tokenName, sendAddress, recvAddress, sendAmt, send_email){
  if (await fn_unlockAccount_C4eiToken(sendAddress)){
    await sendC4eiToken(tokenName, sendAddress, recvAddress, sendAmt, send_email);
  }
}
async function save_db_sendlogC4eiToken(user_id,txt_my_addr,txt_to_address,txt_to_amt,user_ip,txt_memo){
  //######################################################################################
  // async save test !!!!
  //######################################################################################
  var fromAmt = await getAmt(txt_my_addr); fromAmt = await getAmtWei(fromAmt);
  var toAmt = await getAmt(txt_to_address); toAmt = await getAmtWei(toAmt);
  var strsql = "insert into sendlog (userIdx ,fromAddr ,fromAmt ,toAddr ,toAmt ,sendAmt ,regip, memo)";
  strsql = strsql + " values ('" + user_id + "','" + txt_my_addr + "','" + fromAmt + "','" + txt_to_address + "','" + toAmt + "','" + txt_to_amt + "','" + user_ip + "','"+txt_memo+"')";
  const connection = await pool.getConnection(async conn => conn); 
  try { 
    await connection.beginTransaction(); 
    await connection.query(strsql); 
    await connection.commit(); 
    console.log('save_db_sendlog insert success!'); 
  } catch (err) { 
    await connection.rollback(); 
    throw err; 
  } finally { 
    connection.release();

    // sync
    let result1 = sync_connection.query("select max(tidx) as maxtidx from sendlog where userIdx = '" + user_id + "'");
    let tidx = result1[0].maxtidx;
    console.log("############# " + tidx +" : rtn #############");
    sendTr(txt_my_addr, txt_to_address, txt_to_amt, tidx);

  }
}
async function save_db_sendlogC4eiToken_end(tidx ,blockNumber,contractAddress,blockHash,transactionHash , successYN){
  console.log("save_db_sendlogC4eiToken_end");
  const connection = await pool.getConnection(async conn => conn); 
  let strsql ="update sendlog set blockNumber='"+blockNumber+"',contractAddress='"+contractAddress+"',blockHash='"+blockHash+"',transactionHash='"+transactionHash+"', successYN='"+successYN+"', last_reg=now() where tidx = '" + tidx + "'";
  try { 
    await connection.beginTransaction(); 
    await connection.query(strsql); 
    await connection.commit(); 
    console.log('save_db_sendlogC4eiToken_end update success!'); 
  } catch (err) { 
    await connection.rollback(); 
    throw err; 
  } finally { 
    connection.release();
  }
}

////////////////////////// end erc token c4ei //////////////////////////

function fn_ChkC4eiNetAlive(res){
  if(!chkNetwork()){
    console.log("network access fail! :");
    res.sendFile(STATIC_PATH + '/network.html')
    return;
  }
}

function chkNetwork(){
  web3.eth.net.isListening().then((s) => {
    console.log('####################################');
    console.log('We\'re still connected to the node');
    console.log('####################################');
    return true;
  }).catch((e) => {
    console.log('####################################');
    console.log('Lost connection to the node, reconnecting');
    console.log('####################################');
    //////web3.setProvider(your_provider_here);
    return false;
  });
}

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

module.exports = router;

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
const web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.0.185:21004"));

// npm i sync-mysql
var db_config = require(__dirname + '/database.js');// 2020-09-13
var sync_mysql = require('sync-mysql'); //2020-01-28
let sync_connection = new sync_mysql(db_config.constr());


router.get('/', function(req, res, next) {
  if (req.cookies.user_idx == "" || req.cookies.user_idx === undefined) {
    res.sendFile(STATIC_PATH + '/ulogin.html')
    return;
  }
  else {
    /////////////////////////
    let user_email = req.cookies.user_email;
    let result = sync_connection.query("SELECT id, c4ei_addr, c4ei_balance FROM user a WHERE a.email='" + user_email + "'");
    let user_id = result[0].id;
    let c4ei_addr = result[0].c4ei_addr;
    let c4ei_balance = result[0].c4ei_balance;
    console.log("49 c4ei_addr :"+c4ei_addr);
    // fn_ChkC4eiNetAlive();
    if ((c4ei_addr!="" &&c4ei_addr!=null) && user_id > 0){
      var wallet_balance = web3.eth.getBalance(c4ei_addr, function(error, result) {
        // console.log("[/home/dev/www]/easypay/routes/index.js 39] wallet_balance : "+ web3.utils.fromWei(result, "ether")); //0x21725F3b26F74C8E451d851e040e717Fbcf19E5b
        // console.log("42 result :"+result);
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
    const msg = "https://easy.c4ei.net/rcv?rcv_email="+user_email+"&rcv_adr="+c4ei_addr+"&rcv_amt=0&tt="+getCurTimestamp();  //Date.now()
    console.log("msg :"+msg);
    QRCode.toDataURL(msg,function(err, url){
      res.render('index', { title: 'easypay', c4ei_addr : c4ei_addr, c4ei_balance : c4ei_balance, email: user_email, dataUrl : url});
    });
  }
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
    let result = sync_connection.query("SELECT id, c4ei_addr, c4ei_balance FROM user a WHERE a.email='" + user_email + "'");
    let user_id = result[0].id;
    let c4ei_addr = result[0].c4ei_addr;
    let c4ei_balance = result[0].c4ei_balance;
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

//https://easy.c4ei.net/rcv?rcv_email=his001@nate.com&rcv_adr=0x0077b5723B4017b38471F80725f7e3c3347FfB03&rcv_amt=10&tt=2021-11-09_10:19:19.000
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
    let result = sync_connection.query("SELECT id, c4ei_addr, c4ei_balance FROM user a WHERE a.email='" + user_email + "'");
    let user_id = result[0].id;
    let c4ei_addr = result[0].c4ei_addr;
    let c4ei_balance = result[0].c4ei_balance;
    if(txt_my_email != user_email){ console.log('email different so can\'t send'); return; }
    if(c4ei_addr!=txt_my_addr){ console.log('c4ei_addr different so can\'t send'); return; }
    // balance changed ... 
    if(c4ei_balance!=txt_my_balance){ 
      console.log('balance different so can\'t send'); 
      res.writeHead("200", { "Content-Type": "text/html;charset=utf-8" });
      res.end("<script>alert('balance different so can\'t send');document.location.href='/';</script>");
      return; 
    }

    // console.log("c4ei_addr :"+c4ei_addr);
    if ((c4ei_addr!="" &&c4ei_addr!=null) && user_id > 0){
      console.log('C4EI 트랜잭션 수행');
      web3.eth.personal.unlockAccount(txt_my_addr, process.env.C4EI_ADDR_PWD, 500)
      .then(data => console.log(data))
      .catch(err => console.log(err));

      var sendErrorCnt=0;
      try
      {
        web3.eth.sendTransaction({
          from: txt_my_addr,
          to: txt_to_address,
          value: web3.utils.toWei(txt_to_amt,'ether'),
          gas: 100000
        }).once('confirmation', () => {console.log('CONFIRMED');})
        .then( console.log )
        .catch( console.log );
      }catch(e){
        console.log( e + ' : sendTransaction ');
        sendErrorCnt = 1;
      }

      var successYN ="Y";
      if (sendErrorCnt == 1){
        successYN="N";
      }

      //https://easy.c4ei.net/rcv?rcv_email=his001@nate.com&rcv_adr=0x0077b5723B4017b38471F80725f7e3c3347FfB03&rcv_amt=10&tt=2021-11-09_10:19:19.000
      // var fromAmt = JSON.stringify(getAmt(txt_my_addr));
      // var fromAmt = getAmt(txt_my_addr);
      // console.log(fromAmt + " : fromAmt 158");
      // var toAmt = getAmt(txt_to_address);
      // console.log(toAmt + " : toAmt 160");
      let user_ip   = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
      var fromAmt = web3.eth.getBalance(txt_my_addr, function(error, result1) {
        var toAmt = web3.eth.getBalance(txt_to_address, function(error, result2) {
          fromAmt = web3.utils.fromWei(result1, "ether");
          toAmt = web3.utils.fromWei(result2, "ether");
          var strsql = "insert into sendlog (userIdx ,fromAddr ,fromAmt ,toAddr ,toAmt ,sendAmt ,successYN ,regip)";
          strsql = strsql + " values ('" + user_id + "','" + txt_my_addr + "','" + fromAmt + "','" + txt_to_address + "','" + toAmt + "','" + txt_to_amt + "','"+successYN+"','" + user_ip + "')";
          let result = sync_connection.query(strsql);
          console.log(result +" :last insert Tidx");
        });      
      });
    }
    /////////////////////////
    res.render('sendok', { title: 'easypay Send OK', my_email : txt_my_email, my_addr:txt_my_addr
            , my_balance:txt_my_balance, to_address:txt_to_address ,to_amt:txt_to_amt});
  }
});

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
    let result1 = sync_connection.query("SELECT id, c4ei_addr, c4ei_balance FROM user a WHERE a.email='" + user_email + "'");
    let user_id = result1[0].id;
    let c4ei_addr = result1[0].c4ei_addr;
    // let c4ei_balance = result1[0].c4ei_balance;
    if ((c4ei_addr=="" ||c4ei_addr==null) && user_id > 0){
      let result2 = sync_connection.query("SELECT idx,address,cur_bal FROM address WHERE useYN='Y' and mappingYN='N' AND cur_bal=0 AND user_id=0 LIMIT 1");
      let new_address = result2[0].address;
      console.log("new_address :"+ new_address);
      let result3 = sync_connection.query("UPDATE address SET email='"+user_email+"',user_id='" + user_id + "',mappingYN='Y',last_reg=now() WHERE  address ='"+new_address+"'");
      let user_ip   = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
      let result4 = sync_connection.query("UPDATE user SET c4ei_addr='"+new_address+"',regip='"+user_ip+"',last_reg=now() WHERE id='" + user_id + "'");
      console.log("result4 end");
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

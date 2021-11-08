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

/* GET home page. */
// router.get('/', async function(req, res, next) {
//   const msg = "https://easypay.c4ei.net/sAd=assdaasdas&rAd=asadsad&amt=0.0001&tt="+Date.now();
//   const url = await QRCode.toDataURL(msg);
//   res.render('index', { title: 'Express', dataUrl : url});
// });
router.get('/', function(req, res, next) {

  if (req.cookies.user_idx == "" || req.cookies.user_idx === undefined) {
    res.sendFile(STATIC_PATH + '/ulogin.html')
    return;
  }
  else {
    // npm i sync-mysql
    var db_config = require(__dirname + '/database.js');// 2020-09-13
    var sync_mysql = require('sync-mysql'); //2020-01-28
    let sync_connection = new sync_mysql(db_config.constr());

    let user_email = req.cookies.user_email;
    let result = sync_connection.query("SELECT id, c4ei_addr, c4ei_balance FROM user a WHERE a.email='" + user_email + "'");
    let user_id = result[0].id;
    let c4ei_addr = result[0].c4ei_addr;
    let c4ei_balance = result[0].c4ei_balance;
    if (c4ei_addr!=""){
      const wallet_balance = web3.eth.getBalance(c4ei_addr, function(error, result) {
        console.log("wallet_balance : "+result);
      });
    }

    const msg = "https://easy.c4ei.net/remail="+user_email+"&rAd="+c4ei_addr+"&amt=0&tt="+Date.now();
    // const url = QRCode.toDataURL(msg);
    QRCode.toDataURL(msg,function(err, url){
      res.render('index', { title: 'easy', c4ei_addr : c4ei_addr, c4ei_balance : c4ei_balance, email: user_email, dataUrl : url});
    });
    // // res.render('pages/login', get_user_info_json(user_id));
    // try{
    //   console.log('######### index.js 119 get_user_info_json ######### '+req.cookies.user_idx+' #########');
    //   res.render('pages/login', get_user_info_json(req.cookies.user_idx));
    // }catch(e){
    //     // alert(e);
    // }
  }
});
//ulogin


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



module.exports = router;

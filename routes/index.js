var express = require('express');
var router = express.Router();
var QRCode = require('qrcode');

/* GET home page. */
// router.get('/', async function(req, res, next) {
//   const msg = "https://easypay.c4ei.net/sAd=assdaasdas&rAd=asadsad&amt=0.0001&tt="+Date.now();
//   const url = await QRCode.toDataURL(msg);
//   res.render('index', { title: 'Express', dataUrl : url});
// });
router.get('/', function(req, res, next) {
  const msg = "https://easypay.c4ei.net/sAd=assdaasdas&rAd=asadsad&amt=0.0001&tt="+Date.now();
  // const url = QRCode.toDataURL(msg);
  QRCode.toDataURL(msg,function(err, url){
    res.render('index', { title: 'Express', dataUrl : url});
  });  
});

module.exports = router;

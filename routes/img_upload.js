const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
var app = express();
var connection = require('../dataBase/db');
var router = express.Router();
var url = require('url');
const bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');

app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: false}));

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 100000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('myImage');

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

/*router.get('/', (req, res) { 
  res.render('upload_photo')
  
});*/
router.get("/", function(req, res, next) {
    var q = url.parse(req.url, true);
	  var qdata = q.query;
	  console.log(qdata);
	  res.cookie('post_id_photo', qdata.post_id);
    res.render('upload_photo');
});

router.post('/', (req, res) => {
  console.log("in post");
  console.log(req.cookies.post_id_photo);
  var post_id_photo=req.cookies.post_id_photo;
  upload(req, res, (err) => {
    if(err){
      res.render('upload_photo', {
        msg: err
      });
    }else {
      if(req.file == undefined ){
          res.render('upload_photo', {
            msg: 'Error: No File Selected!'
        });
      }else{
        
        /*if (req.body.user_id != 'undefined'){
          console.log('your user is here: ' + req.body.user_id)
        }*/
        //Upload to database
        //var photo_user_id = current_user;
        //var photo_user_id = req.user.user_id;
        
        var photo_user_id = req.cookies.c;

        console.log(req.file.filename);
        //var t=sicount();
        var t=1642020;
        var info = [[photo_user_id,req.file.filename, t]];
        if(post_id_photo=='not_post')
        {
          //var sql = 'INSERT INTO user_to_photo (user_id,filename) VALUES ?';
          var sql = "delete from user_to_photo where user_id='"+photo_user_id+"'";
          console.log(sql);
          //connection.query(sql, [info], function (err, result) {
          connection.query(sql, function (err, result) {
              if (err) throw err
          });
          var sql = "INSERT INTO user_to_photo VALUES ('"+photo_user_id+"', '"+req.file.filename+"', '"+t+"')";
          console.log(sql);
          //connection.query(sql, [info], function (err, result) {
          connection.query(sql, function (err, result) {
              if (err) throw err
          });
          var sql = "update user_information set icon_path = '"+req.file.filename+"' where user_id='"+photo_user_id+"'";
          console.log(sql);
          //connection.query(sql, [info], function (err, result) {
          connection.query(sql, function (err, result) {
              if (err) throw err
          });
        }else{
            var sql = "delete from post_to_photo where post_id='"+post_id_photo+"'";
            connection.query(sql, function (err, result) {
                if (err) throw err
            });
            var sql = "INSERT INTO post_to_photo VALUES ('"+post_id_photo+"', '"+req.file.filename+"', '"+t+"')";
            connection.query(sql, function (err, result) {
                if (err) throw err
            });
            var sql = "update post set post_icon_path = '"+req.file.filename+"' where post_id='"+post_id_photo+"'";
            connection.query(sql, function (err, result) {
                if (err) throw err
            });
        }
        //render to upload_photo
        res.render('upload_photo', {
          msg: 'File Uploaded!',
          file:`uploads/${req.file.filename}`
        });
      }
    }
  });
});

module.exports = router;
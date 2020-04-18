const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
var connection = require('../dataBase/db');
var router = express.Router();

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

router.get('/', (req, res) => res.render('upload_photo'));

router.post('/', (req, res) => {
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
        
        if (req.user != 'undefined'){
          console.log('your user is here: ' + Object.keys(req.user))
        }
        //Upload to database
        //var photo_user_id = current_user;
        var photo_user_id = req.user.user_id;
        console.log(req.file.filename);
        //var t=sicount();
        var t=1642020;
        var info = [[photo_user_id,req.file.filename, t]];
        //var sql = 'INSERT INTO user_to_photo (user_id,filename) VALUES ?';
        var sql = "INSERT INTO user_to_photo VALUES ('"+photo_user_id+"', '"+req.file.filename+"', '"+t+"')";
        //connection.query(sql, [info], function (err, result) {
        connection.query(sql, function (err, result) {
            if (err) throw err
        });

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
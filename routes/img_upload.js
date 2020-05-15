const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
var app = express();
var connection = require('../dataBase/db');
var router = express.Router();
var url = require('url');
const bodyParser = require('body-parser')
var fs = require('fs');
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
    //callback if selected file not in image type
    cb('Error: Images Only!');
  }
}

// Render to upload_photo page
router.get("/", function(req, res, next) {
    var q = url.parse(req.url, true);
	  var qdata = q.query;
	  console.log(qdata);
	  res.cookie('post_id_photo', qdata.post_id);
    res.render('upload_photo');
});

/*Check if the submission of upload success or not,
  If success, update the corresponding table in database
    Else if submit without selected image, show error msg 'No File Selected!'
*/
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
      
      // Error msg if submit without selected image
      if(req.file == undefined ){
          res.render('upload_photo', {
            msg: 'Error: No File Selected!'
        });
      }else{
        
        var photo_user_id = req.cookies.c;

        console.log(req.file.filename);

        var t=1642020;
        var info = [[photo_user_id,req.file.filename, t]];
        
        /* Determine the image is corresponding post or user profile */
        if(post_id_photo=='not_post')
        {
          //Upload for user profile
          
          var sql = "select icon_path from user_information where user_id='"+photo_user_id+"'";
          connection.query(sql, function (err, result) {
              if (err) throw err
              if( result[0].icon_path != "user-512.png" )
              {
                  fs.unlink('./public/uploads/'+result[0].icon_path+'', (err) => {
                  if (err) {
                    console.error(err)
                    return
                  }
                });
              }
          });

          //Remove the former image path from the user_to_photo table
          var sql = "delete from user_to_photo where user_id='"+photo_user_id+"'";
          console.log(sql);
          
          connection.query(sql, function (err, result) {
              if (err) throw err
              
          });
          
          //Insert the recent upload image path into user_to_photo table
          var sql = "INSERT INTO user_to_photo VALUES ('"+photo_user_id+"', '"+req.file.filename+"', '"+t+"')";
          console.log(sql);

          connection.query(sql, function (err, result) {
              if (err) throw err
          });
          
          //Update the path of recent upload image in icon_path table which has same user_id
          var sql = "update user_information set icon_path = '"+req.file.filename+"' where user_id='"+photo_user_id+"'";
          console.log(sql);
          connection.query(sql, function (err, result) {
              if (err) throw err
          });
        }else{
          
            //Upload for post information
            
            var sql = "select post_icon_path from post where post_id='"+post_id_photo+"'";
            connection.query(sql, function (err, result) {
              console.log("Photo:");
              console.log(result[0].post_icon_path);
              console.log(sql);
              if (err) throw err
              if( result[0].post_icon_path != "camera-icon.png" )
                {
                    fs.unlink('./public/uploads/'+result[0].post_icon_path+'', (err) => {
                    if (err) {
                      console.error(err)
                      return
                    }
                  });
                }
            });
            
            //Remove the former image path from the post_to_photo table
            var sql = "delete from post_to_photo where post_id='"+post_id_photo+"'";
            connection.query(sql, function (err, result) {
                if (err) throw err
            });
            //Insert the recent upload image path into post_to_photo table
            var sql = "INSERT INTO post_to_photo VALUES ('"+post_id_photo+"', '"+req.file.filename+"', '"+t+"')";
            connection.query(sql, function (err, result) {
                if (err) throw err
            });
            //Update the path of recent upload image in post_icon_path table which has same post_id
            var sql = "update post set post_icon_path = '"+req.file.filename+"' where post_id='"+post_id_photo+"'";
            connection.query(sql, function (err, result) {
                if (err) throw err
            });
        }
        
        //Render to upload_photo
        res.render('upload_photo', {
          msg: 'File Uploaded!',
          file:`uploads/${req.file.filename}`
        });
      }
    }
  });
});

module.exports = router;
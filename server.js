var fs = require('fs');
var express = require("express");
var http = require("http");
var url = require('url');
var app = express();
var mysql = require('mysql');
var current_user;
var other=require("./other_function");
const server = require('http').Server(app);
const io = require('socket.io')(server);
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
//jason start
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser')
//jason end



//var parser = require('ua-parser-js');
var cookieParser = require('cookie-parser');

app.use(cookieParser());



// -------------------------------------------------express setting-------------------------------------------------
app.use(bodyParser.urlencoded({extended: false}));
//hei start
app.set('view engine', 'ejs');
app.use(session({
    secret : 'Secret',
    resave : false,
    saveUninitialized : false
}))



// -------------------------------------------------router require moduels-------------------------------------------------
const img_upload = require('./routes/img_upload');
app.use('/img_upload', img_upload);
app.use(express.static('./public'));

const lnr_route = require('./routes/l_and_r_route');
app.use('/login-system', lnr_route)


// important！！！！ 
module.exports.getIO = function(){
    return io;
}

const chatRoom = require('./routes/chatRoom');
app.use('/chatRoom', chatRoom); //here!!

const group_module = require('./routes/group_module');
app.use('/group_module', group_module);

const user_module = require('./routes/user_module');
app.use('/user_module', user_module);

const post_module = require('./routes/post_module');
app.use('/post_module', post_module);

const room_module = require('./routes/room_module');
app.use('/room_module', room_module);




var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "csci3100",
  database: "teamder"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

app.get("/", function(req, res, next) {
    console.log("time:"+other.sicount());
    //res.redirect('/login-system/login');
    res.cookie('c', 'guest');
    res.cookie('nickname', 'guest');
    //res.redirect('/who.html');
    res.redirect('/index');
});

app.get("/who.html", function(req, res, next) {
    var sql ="Select user_id from user_account";
    con.query(sql, function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            //console.log("length: "+result.length);
            res.render('who', {result: result}); 
         });
    //res.render('who'); 
});

app.get("/know_who", function(req, res, next) {
	console.log("Trying to know a new user...");
	var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log("who: "+qdata.who);
    current_user=qdata.who;
	console.log("current_user: "+qdata.who);
	res.cookie('c', qdata.who);
    res.redirect('/index');
	return res.end();
});

app.get("/index", function(req, res, next) {
    //Open a file on the server and return its content:
    //console.log(output);
    var q = url.parse(req.url, true);
	var qdata = q.query;
    try {
        console.log("display");
        console.log("display");
        console.log("id in index:"+req.cookies.c);
        //console.log("id in index:"+req.session.passport.user);
        //current_user=req.user.user_id;
    } catch(e){
        console.log('error ah');
        //current_user='guest';
    }
    
    
    con.query("SELECT * FROM group_info", function (err, group_result, fields) {
        if (err) console.log("Database error!");
        console.log("action:");
        console.log(qdata.action);
        if(qdata.action=="search_id_of_post")
            var sql = "Select post_id, title, description FROM post WHERE post_id = '"+qdata.search_post_id+"'";
        else if(qdata.action=="filter_is_joined")
            var sql= "SELECT post_id, title, description FROM post where post_id in (Select post_id from post_to_join where joiner_id = '"+req.cookies.c+"')";
        else if(qdata.action=="filter_group")
            var sql = "Select post_id, title, description FROM post WHERE group_id = '"+qdata.group_id+"' and post_id not in (Select post_id from post_to_join where joiner_id = '"+req.cookies.c+"')";
        else if(qdata.action=="filter_subgroup")
            var sql = "Select post_id, title, description FROM post WHERE subgroup_id = '"+qdata.subgroup_id+"' and post_id not in (Select post_id from post_to_join where joiner_id = '"+req.cookies.c+"')";
        else
            var sql= "SELECT post_id, title, description FROM post where post_id not in (Select post_id from post_to_join where joiner_id = '"+req.cookies.c+"')";
        //var sql="SELECT post_id, title, description FROM post where post_id not in (Select post_id from post_to_join where joiner_id = '"+current_user+"')";
        //var sql= "SELECT post_id, title, description FROM post where post_id not in (Select post_id from post_to_join where joiner_id = '"+current_user+"')";
        console.log(sql);
        console.log("cookies:"+req.cookies.c);
        con.query(sql, function (err, result, fields) {
            if (err) throw err;
            console.log(group_result);
            console.log(result);
            var sql_subgroup="SELECT * FROM subgroup_info";
            console.log("sql_subgroup:");
            con.query(sql_subgroup, function (err, subgroup_result, fields) {
                if (err) throw err;
                console.log("subgroup:");
                console.log(subgroup_result);
                res.render('index', {result: result, user_id: req.cookies.c, group_result: group_result, user_name: req.cookies.nickname, subgroup_result: subgroup_result});
             });
         });
    });
});

app.get("/admin", function(req, res, next) {
	console.log("in admin");
	//console.log(qdata.ref);
    res.render('admin');
});

/*app.get("/search_name_of_post", function(req, res, next) {
    console.log("try to search post name");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log("post name: "+qdata.search_post_name);
	var sql = "Select post_id, title, description FROM post";
	console.log(sql);
    con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    console.log("length: "+result.length);
    var i;
    var temp;
    var test;
    for(i=0;i<result.length;i++)
    {
        console.log(result[i].title);
        temp=result[i].title;
        test[i]=testpartstring(temp, qdata.search_post_name);
        console.log(test[i]);
    }       
    res.render('index_searched', {result: result, user: current_user}); 
  });
});*/

app.get("/back", function(req, res, next) {
	console.log("Trying to back to index");
    res.redirect('/index');
	return res.end();
});

app.get("/indexuser_account", function(req, res, next) {
    console.log("try to see user_account");
	var sql = "Select * FROM user_account";
	console.log(sql);
    con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.render('indexuser_account', {result: result}); 
  });
});






/*
//chat room my code here
let numOfOnline = 0;
var chatroomID = 0;
var ID = 0;



app.get('/selectchat', checkAuthenticated, function (req, res) { //login左先可以去到
    
    var q = url.parse(req.url, true);
    var qdata = q.query;
    //chatroomID = 123;
    chatroomID = qdata.chatroom;
    console.log("in chatroom: "+chatroomID);
    records.setData(chatroomID)
    res.render('chatroom',{chatroom : chatroomID}); // chatroom 應該係 ＝＝ post id 
    //res.render('chatroom',{chatroom : qdata.chatroom}); 
});
 

//----------------------------------------------------------------------when there is a new connection--------------------------------------------------------------
io.on('connection', (socket) => {
    console.log("i am in server!");
    numOfOnline++;
    // 發送人數給網頁
    io.emit("online", numOfOnline);

    // 當有new connection la, send 返 完整嘅 chat record 比 new client 
    
    records.getData((msgs) => {
        
        socket.emit("chatRecord", msgs);
    });
 
    socket.on("greet", () => {
        socket.emit("greet", numOfOnline);
    });
 
    socket.on("send", (msg) => {
        records.setData(chatroomID)
        ID = msg.roomID
        records.insertData(msg);
        
    });
 
    socket.on('disconnect', () => {
        // when someone disconnect the server
        if (numOfOnline > 0){
            numOfOnline = numOfOnline - 1;
        }else{
            numOfOnline = 0 ;
        }
        io.emit("online", numOfOnline); 
    });
});


//-------------------------------------------------when there are new message, then send to different clients-----------------------------------------------------
records.on("new_message", (msg) => {
    // for sending new msg to client 
    // no new connection here
    records.setData(chatroomID)
    //console.log("Yes You got the msg\n");
    //console.log(ID + "Test " + msg.roomID)
    // msg.roomID == which room does the msg belongs to



// jason start
/*
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


// EJS
app.set('view engine', 'ejs');

// Public Folder
app.use(express.static('./public'));

app.get('/upload', (req, res) => res.render('upload_photo'));

app.post('/upload', (req, res) => {
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

        //Upload to database
        var photo_user_id = current_user;
        console.log(req.file.filename);
        var t=sicount();
        var info = [[photo_user_id,req.file.filename, t]];
        //var sql = 'INSERT INTO user_to_photo (user_id,filename) VALUES ?';
        var sql = "INSERT INTO user_to_photo VALUES ('"+photo_user_id+"', '"+req.file.filename+"', '"+t+"')";
        //connection.query(sql, [info], function (err, result) {
        con.query(sql, function (err, result) {
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
*/
//jason end

server.listen(8080, () => {
    console.log("Server Start");
});

//http.createServer(app).listen(8080);
//console.log('Server On and Port number: 8080');
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
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser')
const partials = require('express-partials')
var cookieParser = require('cookie-parser');

app.use(cookieParser());


// -------------------------------------------------express setting-------------------------------------------------
app.use(bodyParser.urlencoded({extended: false}));
app.set('view engine', 'ejs');
app.use(session({
    secret : 'Secret',
    resave : false,
    saveUninitialized : false
}))

app.use(express.static("public"));

app.use(partials());


// -------------------------------------------------router require moduels-------------------------------------------------
const img_upload = require('./routes/img_upload');
app.use('/img_upload', img_upload);

const lnr_route = require('./routes/l_and_r_route');
app.use('/login-system', lnr_route)

const da_route = require('./routes/data_analysis');
app.use('/data-analysis', da_route)


module.exports.getIO = function(){
    return io;
}


const group_module = require('./routes/group_module');
app.use('/group_module', group_module);

const user_module = require('./routes/user_module');
app.use('/user_module', user_module);


const post_module = require('./routes/post_module');
app.use('/post_module', post_module);

const room_module = require('./routes/test');
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
    res.cookie('c', 'guest');  // save infomation to cookies
    res.cookie('nickname', 'guest');
    res.cookie('icon', 'user-512.png');
    res.redirect('/index?test=123'); // go to index page
});


app.get("/know_who", function(req, res, next) {
	var q = url.parse(req.url, true);
	var qdata = q.query;
    current_user=qdata.who;
	res.cookie('c', qdata.who);
    res.redirect('/index');
	return res.end();
});

app.get("/index",function(req, res, next) {
    var q = url.parse(req.url, true);
	var qdata = q.query;
    if(req.cookies.c!='guest')// not guest
    {
        var sql="SELECT icon_path FROM user_information where user_id = '"+req.cookies.c+"'"; //get photo
        con.query(sql, function (err, result, fields) {
            if (err) throw err;
            res.cookie('icon', result[0].icon_path);
            });
    }
    con.query("SELECT * FROM group_info", function (err, group_result, fields) {// get group_info
        if (err) console.log("Database error!");
        if(qdata.action=="search_id_of_post") //112-125 filter post by some citeria
            var sql = "Select post_id, title, description, host_id, nickname, hitrate, group_id, post_icon_path FROM post, user_information WHERE post.host_id=user_information.user_id and post_id = '"+qdata.search_post_id+"'";
        else if(qdata.action=="search_name_of_post")
            var sql = "Select post_id, title, description, host_id, nickname, hitrate, group_id, post_icon_path FROM post, user_information where post.host_id=user_information.user_id and title like '%"+qdata.search_post_name+"%'";
        else if(qdata.action=="search_id_of_user")
            var sql = "Select DISTINCT post.post_id, title, description, host_id, nickname, hitrate, group_id, post_icon_path FROM post, post_to_join, user_information WHERE (host_id = '"+qdata.search_user_id+"' or joiner_id = '"+qdata.search_user_id+"') and post.post_id=post_to_join.post_id and post.host_id=user_information.user_id";
        else if(qdata.action=="filter_is_joined")
            var sql= "SELECT post_id, title, description, host_id, nickname, hitrate, group_id, post_icon_path FROM post, user_information where post.host_id=user_information.user_id and post_id in (Select post_id from post_to_join where joiner_id = '"+req.cookies.c+"')";
        else if(qdata.action=="filter_group")
            var sql = "Select post_id, title, description, host_id, nickname, hitrate, group_id, post_icon_path FROM post, user_information where post.host_id=user_information.user_id and group_id = '"+qdata.group_id+"' and post_id not in (Select post_id from post_to_join where joiner_id = '"+req.cookies.c+"')";
        else if(qdata.action=="filter_subgroup")
            var sql = "Select post_id, title, description, host_id, nickname, hitrate, group_id, post_icon_path FROM post, user_information where post.host_id=user_information.user_id and subgroup_id = '"+qdata.subgroup_id+"' and post_id not in (Select post_id from post_to_join where joiner_id = '"+req.cookies.c+"')";
        else
            var sql= "SELECT post_id, title, description, host_id, nickname, hitrate, group_id, post_icon_path FROM post, user_information where post.host_id=user_information.user_id and post_id not in (Select post_id from post_to_join where joiner_id = '"+req.cookies.c+"')";
        var order="";
        if(qdata.action=="order_by_hitrate")// post order
            order="order by hitrate desc";
        if(qdata.action=="order_by_time")
            order="order by t desc";
        sql=sql+order;
        con.query(sql, function (err, result, fields) {//get post from DB
            if (err) throw err;
            var sql_subgroup="SELECT * FROM subgroup_info";
            con.query(sql_subgroup, function (err, subgroup_result, fields) {//get subgroup info from db
                if (err) throw err;
               var sql_admin="SELECT is_admin FROM user_information where user_id = '"+req.cookies.c+"'";
                con.query(sql_admin, function (err, admin_result, fields) {//get admin info from db
                    if (err) throw err;
                    var is_admin;
                    if(req.cookies.c=='guest')
                        is_admin=0;
                    else
                        is_admin=admin_result[0].is_admin;
                    res.render('index', {post_all_result: result, user_id: req.cookies.c, group_result: group_result, user_name: req.cookies.nickname, subgroup_result: subgroup_result, is_admin: is_admin, current_name: req.cookies.nickname, current_id: req.cookies.c, icon: req.cookies.icon});//go to index page
                 });
             });
         });
    });
});

app.get("/admin", function(req, res, next) {
    res.render('admin', {current_name: req.cookies.nickname, current_id: req.cookies.c});//go to admin page
});



app.get("/back", function(req, res, next) {//back to index page
    res.redirect('/index');
	return res.end();
});

app.get("/indexuser_account", function(req, res, next) {//show all of the user information
	var sql = "Select * FROM user_information";
    con.query(sql, function (err, result, fields) {
    if (err) throw err;
    res.render('indexuser_account', {result: result, current_name: req.cookies.nickname, current_id: req.cookies.c}); 
  });
});

server.listen(8080, () => {
    console.log("Server Start");
});


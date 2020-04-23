var fs = require('fs');
var express = require("express");
var http = require("http");
var url = require('url');
var app = express();
var mysql = require('mysql');
var other=require("../other_function");
var con = require('../dataBase/db');
const server = require('http').Server(app);
const bodyParser = require('body-parser')

app.set('view engine', 'ejs');

var router = express.Router();

var cookieParser = require('cookie-parser');

app.use(cookieParser());


app.use(bodyParser.urlencoded({extended: false}));

router.get("/show_your_room", function(req, res, next) {
    //Open a file on the server and return its content:
    console.log("show room");
    var sql = "Select post.title, post.description, post.post_id, post.host_id FROM post, post_to_join WHERE post.post_id = post_to_join.post_id AND post_to_join.joiner_id = '"+req.cookies.c+"'";
    console.log(sql);
    con.query(sql, function (err, result, fields) {
    if (err) {
        console.log("error");
        res.redirect('../index');
    }
    console.log(result);
    res.render('show_your_room', {result: result, user: req.cookies.c, current_name: req.cookies.nickname, current_id: req.cookies.c, icon: req.cookies.icon});
  });
});

router.get("/enter_room", function(req, res, next) {
    console.log("try to enter room");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	if(qdata.action=="add_joiner")
	{
	    console.log("try to add joiner in final version!");
    	    var sql = "INSERT INTO post_to_join VALUES ('"+qdata.post_id+"', '"+qdata.new_user_id+"', 0);";
            console.log(sql);
            con.query(sql, function (err, result, fields) {
            if (err) {
                console.log("error in add joiner in final version");
                res.redirect('../index');
                }
            });
	} else if(qdata.action=="change_host")
	{
	    console.log("try to change host!");
	    var sql = "update post set host_id = '"+qdata.changed_host_id+"' where post_id = '"+qdata.post_id+"'";
        console.log(sql);
        con.query(sql, function (err, result, fields) {
        if (err) {
            console.log("error");
            res.redirect('../index');
        }
        console.log(result);
        });
	} else if(qdata.action=="delete_joiner")
	{
	    console.log("try to delete joiner!");
	    var sql = "Delete FROM post_to_join WHERE post_id = '"+qdata.post_id+"' AND joiner_id = '"+qdata.delete_joiner_id+"'";
        console.log(sql);
        con.query(sql, function (err, result, fields) {
        if (err) {
            console.log("error");
            res.redirect('../index');
        }
        console.log(result);
        });
	}
	console.log(qdata.post_id);
	var sql = "Select * FROM post, post_to_join, user_information WHERE post.post_id = post_to_join.post_id AND post_to_join.joiner_id = user_information.user_id AND post.post_id = '"+qdata.post_id+"'";
	console.log(sql);
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        console.log("post_id: "+result[0].post_id);
        //res.render('room_display', {result: result[0], all_result: result, user_id: req.cookies.c});
        var sqlf = "Select * FROM post_to_join where post_id = '"+qdata.post_id+"' and joiner_id = '"+req.cookies.c+"'";
    	console.log(sqlf);
        con.query(sqlf, function (err, finish_result, fields) {
                if (err) throw err;
                console.log(finish_result);
                console.log("post_id: "+result[0].post_id);
                //res.render('room_display', {result: result[0], all_result: result, user_id: req.cookies.c, finish_result: finish_result[0].finish}); 
                var sql_host_name = "Select nickname FROM user_information WHERE user_id = '"+result[0].host_id+"'";
    	        console.log(sql_host_name);
                con.query(sql_host_name, function (err, host_name_result, fields) {
                    if (err) throw err;
                    res.render('room_display', {result: result[0], all_result: result, user_id: req.cookies.c, finish_result: finish_result[0].finish, host_name: host_name_result[0].nickname, current_name: req.cookies.nickname, current_id: req.cookies.c, icon: req.cookies.icon}); 
                });
              });
      });
});

router.get("/withdraw_room", function(req, res, next) {
    //Open a file on the server and return its content:
    console.log("try to withdraw room");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log(qdata);
    var sql = "Delete FROM post_to_join WHERE post_to_join.post_id = '"+qdata.withdraw_post_id+"' AND post_to_join.joiner_id = '"+req.cookies.c+"'";
    console.log(sql);
    con.query(sql, function (err, result, fields) {
    if (err) {
        console.log("error");
        res.redirect('../index');
    }
    console.log(result);
    res.redirect('show_your_room');
  });
});

router.get("/finish_room", function(req, res, next) {
    console.log("try to finish the users");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log(qdata.finish_post_id);
	var sql = "Select * FROM post_to_join WHERE post_id = '"+qdata.finish_post_id+"' and not joiner_id = '"+req.cookies.c+"'";
	console.log(sql);
    con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.render('rate_user', {all_result: result, post_id: qdata.finish_post_id, current_name: req.cookies.nickname, current_id: req.cookies.c, icon: req.cookies.icon}); 
  });
});

module.exports = router;
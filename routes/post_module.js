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

router.get("/creating_post", function(req, res, next) {
	console.log("Trying to creating a new post...");
    res.render('create_post', {user: req.cookies.c});
	return res.end();
});

router.get("/create_post", function(req, res, next) {
	console.log("Trying to create a new post...");
	var q = url.parse(req.url, true);
	var qdata = q.query;
	var host_id=req.cookies.c;
	console.log("create:"+req.cookies.c);
	var t=other.sicount();
	var post_id=""+host_id+t;
	var sql = "INSERT INTO post VALUES ('"+qdata.title+"', '"+ qdata.description+"', '"+post_id+"', '"+host_id+"', '"+qdata.group_id+"', '"+qdata.type_of_game+"', '"+t+"', '"+qdata.hashtag+"', '"+qdata.subgroup_id+"');";
	console.log(sql);
	con.query(sql, function (err, result) {
    if (err) console.log('error');
    else console.log("1 record inserted");
  });
    var sql = "INSERT INTO post_to_join VALUES ('"+post_id+"', '"+host_id+"', '"+req.cookies.nickname+"', 0);";
	console.log(sql);
	con.query(sql, function (err, result) {
    if (err) console.log('error');
    else console.log("1 record inserted");
  });
    //console.log(sql);
    res.redirect('../index');
	return res.end();
});

router.get("/delete_post", function(req, res, next) {
	console.log("Trying to delete a post...");
	var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log("delete post_id: "+qdata.post_id);
	var sql = "DELETE FROM post WHERE post_id = '"+qdata.post_id+"'";
    console.log(sql);
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("records deleted:");
        });
    res.redirect('../index');
	return res.end();
});

router.get("/show_post", function(req, res, next) {
    console.log("try to see post");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log(qdata.post_id);
	if(qdata.action=="join_post")
	{
	    var sql = "INSERT INTO post_to_join VALUES ('"+qdata.post_id+"', '"+req.cookies.c+"', '"+req.cookies.nickname+"', 0)";
        console.log(sql);
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("records is updated");
        });
	} else if (qdata.action=="change_content_post")
	{
	    var sqltitle="";
    	var sqldescription="";
    	var sqltype_of_game="";
    	var sqlhashtag="";
    	var sqlgroup_id="";
    	var sqlsubgroup_id="";
    	console.log(qdata.post_id);
    	console.log(qdata.title);
    	console.log(qdata.description);
    	console.log(qdata.type_of_game);
    	console.log(qdata.hashtag);
    	console.log(qdata.group_id);
    	if(qdata.title)
    	    sqltitle="title = '"+qdata.title+"', ";
    	if(qdata.description)
    	    sqldescription="description = '"+qdata.description+"', ";
    	if(qdata.type_of_game)
    	    sqltype_of_game="type_of_game = '"+qdata.type_of_game+"', ";
    	if(qdata.hashtag)
    	    sqlhashtag="hashtag = '"+qdata.hashtag+"', ";
    	if(qdata.group_id)
    	    sqlgroup_id="group_id = '"+qdata.group_id+"', ";
        if(qdata.subgroup_id)
    	    sqlsubgroup_id="subgroup_id = '"+qdata.subgroup_id+"', ";
    	var sql = "Update post set "+sqltitle+sqldescription+sqltype_of_game+sqlhashtag+sqlgroup_id+sqlsubgroup_id+"post_id='"+qdata.post_id+"' WHERE post_id = '"+qdata.post_id+"'";
    	console.log(sql);
        con.query(sql, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        console.log("it is updated");
        });
	} else if (qdata.action=="new_comment")
	{
	    var t= other.sicount();
    	var comment_id=""+req.cookies.c+t;
    	var sql = "insert into comment values ('"+comment_id+"', '"+qdata.post_id+"', '"+req.cookies.c+"', '"+t+"', '"+qdata.new_comment+"')";
    	console.log(sql);
        con.query(sql, function (err, result, fields) {
        if (err) throw err;
            console.log("new comment is added.")
            console.log(result);
        });
	} else if(qdata.action=="change_comment")
	{
	    var sql = "UPDATE comment SET comment_content = '"+qdata.change_comment+"' WHERE comment_id = '"+qdata.comment_id+"'";
    	console.log(sql);
        con.query(sql, function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            console.log("a comment is changed");
        });
	} else if (qdata.action=="delete_comment")
	{
	    var sql = "delete from comment where comment_id= '"+qdata.comment_id+"'";
    	console.log(sql);
        con.query(sql, function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            console.log("a comment is deleted");
        });
	}
	var sqlc = "Select * FROM comment WHERE post_id = '"+qdata.post_id+"' order by comment_date";
	console.log(sqlc);
    con.query(sqlc, function (err, comment_result, fields) {
        if (err) throw err;
        console.log("comment:");
        console.log(comment_result);
        //var sqlp = "Select * FROM post, post_to_join WHERE post.post_id = post_to_join.post_id AND post.post_id = '"+qdata.post_id+"'";
        var sqlp = "Select * FROM post, post_to_join, user_information WHERE post.post_id = post_to_join.post_id AND post.host_id = user_information.user_id AND post.post_id = '"+qdata.post_id+"'";
    	console.log(sqlp);
        con.query(sqlp, function (err, post_result, fields) {
            if (err) throw err;
            console.log("comment:");
            console.log(comment_result);
            console.log("post:");
            console.log(post_result);
            //console.log(post_result[0].post_to_join.nickname);
            //console.log(post_result[1].post_to_join.nickname);
            //console.log("post_id: "+result[0].post_id);
            res.render('postdisplay', {result: post_result[0], all_result: post_result, comment: comment_result, user_id: req.cookies.c}); 
        });
        //console.log("post_id: "+result[0].post_id);
        //res.render('postdisplay', {result: result[0], all_result: result}); 
    });
	/*var sql = "Select * FROM post, post_to_join WHERE post.post_id = post_to_join.post_id AND post.post_id = '"+qdata.post_id+"'";
	console.log(sql);
    con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    console.log("post_id: "+result[0].post_id);
    res.render('postdisplay', {result: result[0], all_result: result}); 
  });*/
});

router.get("/change_post", function(req, res, next) {
    console.log("try to see post");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log(qdata);
	console.log("post.id: "+qdata.post_id);
	var sql = "Select * FROM post WHERE post_id = '"+qdata.post_id+"'";
	console.log(sql);
    con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    console.log("post_id: "+result[0].post_id);
    res.render('change_content_post', {result: result[0]}); 
  });
});

module.exports = router;
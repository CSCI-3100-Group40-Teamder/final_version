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


router.get("/create_post", function(req, res, next) {//insert new post to db
	var q = url.parse(req.url, true);
	var qdata = q.query;
	var host_id=req.cookies.c;
	var t=other.sicount();
	var post_id=""+host_id+t;
	var sql = "INSERT INTO post (title, description, post_id, host_id, group_id, subgroup_id, t, hitrate, suppose_place, suppose_time, suppose_duration, suppose_date, post_icon_path) VALUES ('"+qdata.title+"', '"+ qdata.description+"', '"+post_id+"', '"+host_id+"', '"+qdata.group_id+"', '"+qdata.subgroup_id+"', '"+t+"', 0, '"+qdata.suppose_place+"', '"+qdata.suppose_time+"', '"+qdata.suppose_duration+"', '"+qdata.suppose_date+"', 'camera-icon.png')";
	con.query(sql, function (err, result) {
        if (err) throw err;
      });
    var sql = "INSERT INTO post_to_join VALUES ('"+post_id+"', '"+host_id+"', 0);";
	con.query(sql, function (err, result) {
        if (err) throw err;
      });
    res.redirect('../index');
	return res.end();
});

router.get("/delete_post", function(req, res, next) {//delete post in db
	var q = url.parse(req.url, true);
	var qdata = q.query;
	var sql = "DELETE FROM post WHERE post_id = '"+qdata.post_id+"'";
    con.query(sql, function (err, result) {
        if (err) throw err;
        });
    res.redirect('../index');
	return res.end();
});

router.get("/show_post", function(req, res, next) {//get post from db
    var q = url.parse(req.url, true);
	var qdata = q.query;
	if(qdata.action=="join_post")//line 56-92 opeartion of changing post
	{
	    var sql = "INSERT INTO post_to_join VALUES ('"+qdata.post_id+"', '"+req.cookies.c+"', 0)";
        con.query(sql, function (err, result) {
            if (err) throw err;
        });
	} else if (qdata.action=="change_content_post")
	{
	    var sqltitle="";
    	var sqldescription="";
    	var sqlgroup_id="";
    	var sqlsubgroup_id="";
    	var sql_suppose_date="";
    	var sql_suppose_place="";
    	var sql_suppose_time="";
    	var sql_suppose_duration="";
    	if(qdata.title)
    	    sqltitle="title = '"+qdata.title+"', ";
    	if(qdata.description)
    	    sqldescription="description = '"+qdata.description+"', ";
    	if(qdata.group_id)
    	    sqlgroup_id="group_id = '"+qdata.group_id+"', ";
        if(qdata.subgroup_id)
    	    sqlsubgroup_id="subgroup_id = '"+qdata.subgroup_id+"', ";
        if(qdata.suppose_date)
    	    sql_suppose_date="suppose_date = '"+qdata.suppose_date+"', ";
    	if(qdata.suppose_place)
    	    sql_suppose_place="suppose_place = '"+qdata.suppose_place+"', ";
    	if(qdata.suppose_time)
    	    sql_suppose_time="suppose_time = '"+qdata.suppose_time+"', ";
    	if(qdata.suppose_duration)
    	    sql_suppose_duration="suppose_duration = '"+qdata.suppose_duration+"', ";
    	var sql = "Update post set "+sqltitle+sqldescription+sqlgroup_id+sqlsubgroup_id+sql_suppose_date+sql_suppose_place+sql_suppose_time+sql_suppose_duration+"post_id='"+qdata.post_id+"' WHERE post_id = '"+qdata.post_id+"'";
        con.query(sql, function (err, result, fields) {
        if (err) throw err;
        });
	} else if (qdata.action=="new_comment") //line92-118 operation of changing comment in post
	{
	    var t= other.sicount();
    	var comment_id=""+req.cookies.c+t;
    	var sql = "insert into comment values ('"+comment_id+"', '"+qdata.post_id+"', '"+req.cookies.c+"', '"+t+"', '"+qdata.new_comment+"')";
        con.query(sql, function (err, result, fields) {
        if (err) throw err;
        });
	} else if(qdata.action=="change_comment")
	{
	    var sql = "UPDATE comment SET comment_content = '"+qdata.change_comment+"' WHERE comment_id = '"+qdata.comment_id+"'";
        con.query(sql, function (err, result, fields) {
            if (err) throw err;
        });
	} else if (qdata.action=="delete_comment")
	{
	    var sql = "delete from comment where comment_id= '"+qdata.comment_id+"'";
        con.query(sql, function (err, result, fields) {
            if (err) throw err;
        });
	} else
	{
	    var sql = "update post set hitrate = hitrate +1 where post_id = '"+qdata.post_id+"'";
        con.query(sql, function (err, result, fields) {
            if (err) throw err;
        });
	}
	var sqlc = "Select * FROM comment, user_information WHERE user_information.user_id=comment.comment_user_id and post_id = '"+qdata.post_id+"' order by comment_date";//get comment from db
    con.query(sqlc, function (err, comment_result, fields) {
        if (err) throw err;
        var sqlp = "Select * FROM post, post_to_join, user_information a, user_information b WHERE post.post_id = post_to_join.post_id AND post.host_id = a.user_id AND post_to_join.joiner_id = b.user_id and post.post_id = '"+qdata.post_id+"'";//get post and user information from db
        con.query(sqlp, function (err, post_result, fields) {
            if (err) throw err;
            var sql_host_name = "Select nickname FROM user_information WHERE user_id = '"+post_result[0].host_id+"'";//get nickname from db
            con.query(sql_host_name, function (err, host_name_result, fields) {
                if (err) throw err;
                var sql_admin="SELECT is_admin FROM user_information where user_id = '"+req.cookies.c+"'";//get admin_info from db
        	    con.query(sql_admin, function (err, admin_result, fields) {
                    if (err) throw err;
                    var is_admin;
                    if(req.cookies.c=='guest')
                        is_admin=0;
                    else
                        is_admin=admin_result[0].is_admin;
                    var sql_group="SELECT * FROM group_info";//get group_info from db
                    con.query(sql_group, function (err, group_result, fields) {
                        if (err) throw err;
                        var sql_subgroup="SELECT * FROM subgroup_info";//get subgroup_info from db
                        con.query(sql_subgroup, function (err, subgroup_result, fields) {
                            if (err) throw err;
                            res.render('postdisplay', {post_result_0: post_result[0], post_all_result: post_result, comment: comment_result, user_id: req.cookies.c, host_name: host_name_result[0].nickname, is_admin: is_admin, current_name: req.cookies.nickname, current_id: req.cookies.c, group_result: group_result, subgroup_result: subgroup_result, icon: req.cookies.icon}); //go to post page
                        });
                    });
                });
            });
        });
    });
});

router.get("/change_post", function(req, res, next) {//change content of post here
    var q = url.parse(req.url, true);
	var qdata = q.query;
	var sql = "Select * FROM post WHERE post_id = '"+qdata.post_id+"'";
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        var sql_group="SELECT * FROM group_info";
        con.query(sql_group, function (err, group_result, fields) {
            if (err) throw err;
            var sql_subgroup="SELECT * FROM subgroup_info";
            con.query(sql_subgroup, function (err, subgroup_result, fields) {
                if (err) throw err;
                res.render('change_content_post', {post_result_0: result[0], current_name: req.cookies.nickname, current_id: req.cookies.c, group_result: group_result, subgroup_result: subgroup_result, icon: req.cookies.icon});
            });
        });
  });
});

module.exports = router;
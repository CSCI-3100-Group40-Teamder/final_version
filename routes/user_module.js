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
const path = require('path');

app.set('view engine', 'ejs');

var router = express.Router();

var cookieParser = require('cookie-parser');

app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: false}));

router.get("/show_your_user_information", function(req, res, next) {//show the profile
    var q = url.parse(req.url, true);
	var qdata = q.query;
	if(qdata.action=="change_content_user_information")//change content in profile
	{
	    var sql_user_first_name="";
    	var sql_user_last_name="";
    	var sql_nickname="";
    	var sql_phone_number="";
    	var sql_age="";
    	var sql_introduction="";
    	var sql_sex="";
    	var sql_perference1="";
    	var sql_perference2="";
    	var sql_perference3="";
    	var sql_admin="";
    	if(qdata.user_first_name)
    	    sql_user_first_name="user_first_name = '"+qdata.user_first_name+"', ";
    	if(qdata.user_last_name)
    	    sql_user_last_name="user_last_name = '"+qdata.user_last_name+"', ";
    	if(qdata.nickname)
    	    sql_nickname="nickname = '"+qdata.nickname+"', ";
    	if(qdata.phone_number)
    	    sql_phone_number="phone_number = '"+qdata.phone_number+"', ";
    	if(qdata.age)
    	    sql_age="age = '"+qdata.age+"', ";
    	if(qdata.introduction)
    	    sql_introduction="introduction = '"+qdata.introduction+"', ";
    	if(qdata.sex)
    	    sql_sex="sex = '"+qdata.sex+"', ";
    	if(qdata.perference1)
    	    sql_perference1="perference1 = '"+qdata.perference1+"', ";
    	if(qdata.perference2)
    	    sql_perference2="perference2 = '"+qdata.perference2+"', ";
    	if(qdata.perference3)
    	    sql_perference3="perference3 = '"+qdata.perference3+"', ";
    	if(qdata.is_admin)
    	    sql_admin="is_admin = '"+qdata.is_admin+"', ";
    	var sql = "Update user_information set "+sql_user_first_name+sql_user_last_name+sql_nickname+sql_phone_number+sql_age+sql_introduction+sql_sex+sql_perference1+sql_perference2+sql_perference3+sql_admin+"user_id='"+qdata.user_id+"' WHERE user_id = '"+qdata.user_id+"'";
        con.query(sql, function (err, result, fields) {
            if (err) throw err;
            if(qdata.nickname)
    	        res.cookie('nickname', qdata.nickname);
        });
	}
	var user_id=qdata.user_id;
    var sql= "SELECT * FROM user_information where user_id = '"+user_id+"'";//get user_info from db
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        var sqlr= "SELECT AVG(rating) FROM user_to_rating where user_id = '"+user_id+"'";//get rate from db
        con.query(sqlr, function (err, rating_result, fields) {
                if (err) throw err;
                var sqlp= "SELECT photo_url FROM user_to_photo where user_id = '"+user_id+"'";//get photo_url from db
                con.query(sqlp, function (err, photo_result, fields) {
                    if (err) throw err;
                    var sql_admin="SELECT is_admin FROM user_information where user_id = '"+req.cookies.c+"'";//get admin_info from db
                    con.query(sql_admin, function (err, admin_result, fields) {
                        if (err) throw err;
                        var is_admin;
                        if(req.cookies.c=='guest')
                            is_admin=0;
                        else
                            is_admin=admin_result[0].is_admin;
                        var sql_post="SELECT * FROM post, user_information where post.host_id=user_information.user_id and post_id in (Select post_id from post_to_join where joiner_id = '"+user_id+"')";//get post_info from db
                        con.query(sql_post, function (err, post_result, fields) {
                            if (err) throw err;
                            var sql_group="SELECT * FROM group_info";//get group_info from db
                            con.query(sql_group, function (err, group_result, fields) {
                                if (err) throw err;
                                var sql_subgroup="SELECT * FROM subgroup_info";//get subgroup_info from db
                                con.query(sql_subgroup, function (err, subgroup_result, fields) {
                                    if (err) throw err;
                                    res.render('user_information_display', {result: result[0], user_id: user_id, rate: rating_result[0]['AVG(rating)'], photo_result: photo_result, is_admin: is_admin, post_all_result: post_result, current_name: req.cookies.nickname, current_id: req.cookies.c, group_result: group_result, subgroup_result: subgroup_result, icon: req.cookies.icon}); 
                                 });
                             });
                         });
                     });
                });
        });
    });
});

router.get("/change_user_information", function(req, res, next) {//change user_info in db
    var q = url.parse(req.url, true);
	var qdata = q.query;
	var sql = "Select * FROM user_information WHERE user_id = '"+qdata.user_id+"'";
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        var sqlr= "SELECT AVG(rating) FROM user_to_rating where user_id = '"+qdata.user_id+"'";
        con.query(sqlr, function (err, rating_result, fields) {
                if (err) throw err;
                var sql_admin="SELECT is_admin FROM user_information where user_id = '"+req.cookies.c+"'";
                    con.query(sql_admin, function (err, admin_result, fields) {
                        if (err) throw err;
                        var is_admin;
                        if(req.cookies.c=='guest')
                            is_admin=0;
                        else
                            is_admin=admin_result[0].is_admin;
                        var sql_group="SELECT * FROM group_info";
                            con.query(sql_group, function (err, group_result, fields) {
                                if (err) throw err;
                                var sql_subgroup="SELECT * FROM subgroup_info";
                                con.query(sql_subgroup, function (err, subgroup_result, fields) {
                                    if (err) throw err;
                                    res.render('change_user_information', {result: result[0], user_id: qdata.user_id, rate: rating_result[0]['AVG(rating)'], is_admin: is_admin, current_name: req.cookies.nickname, current_id: req.cookies.c, group_result: group_result, subgroup_result: subgroup_result, icon: req.cookies.icon});
                                 });
                             });
                     });
        }); 
    });
});

router.get("/delete_account", function(req, res, next) {//delete user_account
	var q = url.parse(req.url, true);
	var qdata = q.query;
	var sql = "DELETE FROM user_account WHERE user_id = '"+qdata.delete_user_id+"'";
    con.query(sql, function (err, result) {
        if (err) throw err;
        });
    res.cookie('c', 'guest');
    res.cookie('nickname', 'guest');
    res.redirect('../index');
	return res.end();
});

router.get("/create_id", function(req, res, next) {
	var q = url.parse(req.url, true);
	var qdata = q.query;
	var sql = "INSERT INTO user_account (user_id, password) VALUES ('"+qdata.new_id+"', '"+qdata.new_password+"')";
	con.query(sql, function (err, result) {
    if (err) console.log('error');
    else console.log("1 record inserted");
  });
    var sql = "INSERT INTO user_information VALUES ('"+qdata.new_id+"', '"+qdata.user_first_name+"', '"+qdata.user_last_name+"', '"+qdata.email+"', '"+qdata.phone_number+"', '"+qdata.age+"', '"+qdata.introduction+"', '"+qdata.sex+"',  '"+qdata.perference1+"', '"+qdata.perference2+"', '"+qdata.perference3+"', '"+qdata.is_admin+"')";
	con.query(sql, function (err, result) {
    if (err) console.log('error');
    else console.log("1 record inserted");
  });  
    var sql = "INSERT INTO user_to_rating VALUES ('"+qdata.new_id+"', "+5+")";
	con.query(sql, function (err, result) {
    if (err) console.log('error');
    else console.log("1 record inserted");
    });  
    res.redirect('../index');
	return res.end();
});

router.get("/delete_id", function(req, res, next) {
	var q = url.parse(req.url, true);
	var qdata = q.query;
	var sql = "DELETE FROM user_account WHERE user_id = '"+qdata.delete_id+"'";
    con.query(sql, function (err, result) {
        if (err) throw err;
        });
    res.redirect('../index');
	return res.end();
});

router.get("/search_user_id", function(req, res, next) {//search_user_id when user need to add joiner or change host
	var q = url.parse(req.url, true);
	var qdata = q.query;
	if(qdata.action=="change_host")
	    var sql = "select * from user_information, post_to_join where user_information.user_id=post_to_join.joiner_id and post_to_join.post_id='"+qdata.post_id+"' and nickname like '%"+qdata.nickname+"%'";
    else if(qdata.action=="add_joiner")
        var sql = "select * from user_information where nickname like '%"+qdata.nickname+"%' and user_id not in (select joiner_id from post_to_join where post_id='"+qdata.post_id+"')";
    con.query(sql, function (err, result, fields) {
                if (err) throw err;
                res.render('search_user_id', {all_result: result, post_id: qdata.post_id, action: qdata.action, current_name: req.cookies.nickname, current_id: req.cookies.c, icon: req.cookies.icon}); 
                });
});

router.get("/rate_user", function(req, res, next) {//rate user
    var i=0;
    var q = url.parse(req.url, true);
    var qdata = q.query;
    qdata.length=qdata.length/1-1;
    if(qdata.length>=2)
    {
        var sql="insert into user_to_rating (user_id, rating) values ";//input rate to db
        for(i=0;i<qdata.length;i++)
        {
            sql=sql+"('"+qdata.joiner_id[i]+"', "+qdata.rate_of_user[i]/1+")";
            if(i!=qdata.length-1)
                sql=sql+", ";
        }
    }
    else
        var sql="insert into user_to_rating (user_id, rating) values ('"+qdata.joiner_id+"', "+qdata.rate_of_user/1+")";//input rate to db
    con.query(sql, function (err, result) {
        if (err) throw err;
    });
    var sql="update post_to_join set finish = 1 where joiner_id = '"+req.cookies.c+"' and post_id = '"+qdata.post_id+"'";//update to db which the user has rated other users
    con.query(sql, function (err, result) {
        if (err) throw err;
    });
    var sql="select * from post_to_join where finish = 1 and post_id = '"+qdata.post_id+"'";//get the number of people who have finished rating
    con.query(sql, function (err, result) {
        if (err) throw err;
        var length=qdata.length/1+1;
        if(result.length==(length))//all of the people
        {
            var sql ="delete from post_to_join where post_id = '"+qdata.post_id+"'";//delete that post
            con.query(sql, function (err, result) {
                if (err) throw err;
            });
            var sql ="delete from post where post_id = '"+qdata.post_id+"'";
            con.query(sql, function (err, result) {
                if (err) throw err;
            });
        }
    });
    res.redirect("../index");
});

module.exports = router;
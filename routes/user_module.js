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

router.get("/show_your_user_information", function(req, res, next) {
    console.log("try to show your information");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	if(qdata.action=="change_content_user_information")
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
    	console.log(qdata.user_first_name);
    	console.log(qdata.user_last_name);
    	console.log(qdata.nickname);
    	console.log(qdata.phone_number);
    	console.log(qdata.age);
    	console.log(qdata.introduction);
    	console.log(qdata.sex);
    	console.log(qdata.perference1);
    	console.log(qdata.perference2);
    	console.log(qdata.perference3);
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
    	var sql = "Update user_information set "+sql_user_first_name+sql_user_last_name+sql_nickname+sql_phone_number+sql_age+sql_introduction+sql_sex+sql_perference1+sql_perference2+sql_perference3+"user_id='"+qdata.user_id+"' WHERE user_id = '"+qdata.user_id+"'";
    	console.log(sql);
        con.query(sql, function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            console.log("user_information is updated");
        });
	}
	var user_id=qdata.user_id;
    var sql= "SELECT * FROM user_information where user_id = '"+user_id+"'";
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        var sqlr= "SELECT AVG(rating) FROM user_to_rating where user_id = '"+user_id+"'";
        con.query(sqlr, function (err, rating_result, fields) {
                if (err) throw err;
                console.log("avg rating:");
                console.log(rating_result[0]['AVG(rating)']);
                var sqlp= "SELECT photo_url FROM user_to_photo where user_id = '"+user_id+"'";
                con.query(sqlp, function (err, photo_result, fields) {
                    if (err) throw err;
                    console.log(photo_result);
                    //var photo_url="uploads/"+photo_result[photo_result.length-1].photo_url+"";
                    console.log("user_id in cookies:"+req.cookies.c);
                    res.render('user_information_display', {result: result[0], user_id: req.cookies.c, rate: rating_result[0]['AVG(rating)'], photo_result: photo_result}); 
                });
        });
    });
});

router.get("/change_user_information", function(req, res, next) {
    console.log("try to change user info");
	console.log("user.id: "+req.cookies.c);
	var sql = "Select * FROM user_information WHERE user_id = '"+req.cookies.c+"'";
	console.log(sql);
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        var sqlr= "SELECT AVG(rating) FROM user_to_rating where user_id = '"+req.cookies.c+"'";
        con.query(sqlr, function (err, rating_result, fields) {
                if (err) throw err;
                console.log("avg rating:");
                console.log(rating_result[0]['AVG(rating)']);
                res.render('change_user_information', {result: result[0], user_id: req.cookies.c, rate: rating_result[0]['AVG(rating)']}); 
        }); 
    });
});

router.get("/delete_account", function(req, res, next) {
	console.log("Trying to delete a post...");
	var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log("delete user_id: "+qdata.delete_user_id);
	var sql = "DELETE FROM user_account WHERE user_id = '"+qdata.delete_user_id+"'";
    console.log(sql);
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("records deleted:");
        });
    res.redirect('../index');
	return res.end();
});

router.get("/create_id", function(req, res, next) {
	console.log("Trying to create a new user...");
	var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log(qdata.new_id);
	console.log(qdata.new_password);
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
    //console.log(sql);
    res.redirect('../index');
	return res.end();
});

router.get("/delete_id", function(req, res, next) {
	console.log("Trying to delete a new user...");
	var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log(qdata.delete_id);
	var sql = "DELETE FROM user_account WHERE user_id = '"+qdata.delete_id+"'";
    console.log(sql);
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("records deleted:");
        });
    res.redirect('../index');
	return res.end();
});

router.get("/rate_user", function(req, res, next) {
    console.log("try to rate the users");
    var i=0;
    var q = url.parse(req.url, true);
    var qdata = q.query;
    console.log(q);
    console.log(qdata);
    console.log(qdata.length);
    if(qdata.length>=2)
    {
        var sql="insert into user_to_rating (user_id, rating) values ";
        for(i=0;i<qdata.length;i++)
        {
            console.log(qdata);
            console.log("joiner"+i+": "+qdata.joiner_id[i]);
            sql=sql+"('"+qdata.joiner_id[i]+"', "+qdata.rate_of_user[i]/1+")";
            if(i!=qdata.length-1)
                sql=sql+", ";
        }
    }
    else
        var sql="insert into user_to_rating (user_id, rating) values ('"+qdata.joiner_id+"', "+qdata.rate_of_user/1+")";
    console.log(sql);
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log(result.affectedRows + " record(s) updated");
    });
    var sql="update post_to_join set finish = 1 where joiner_id = '"+req.cookies.c+"' and post_id = '"+qdata.post_id+"'";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log(result.affectedRows + " record(s) updated");
    });
    var sql="select * from post_to_join where finish = 1 and post_id = '"+qdata.post_id+"'";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("result.length:"+result.length);
        var length=qdata.length/1+1;
        console.log("qdata.length+1:"+length);
        if(result.length==(length))
        {
            console.log("the record should be deleted");
            var sql ="delete from post_to_join where post_id = '"+qdata.post_id+"'";
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log(result);
            });
            var sql ="delete from post where post_id = '"+qdata.post_id+"'";
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log(result);
            });
        }
    });
    res.redirect("../index");
});

module.exports = router;
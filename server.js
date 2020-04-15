var fs = require('fs');
var express = require("express");
var http = require("http");
var url = require('url');
var app = express();
var mysql = require('mysql');
var current_user;
const server = require('http').Server(app);
const io = require('socket.io')(server);
const records = require('./records.js');
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
//jason start
const multer = require('multer');
const path = require('path');
var connection = require('./db');
//jason end
// -------------------------------------------------custom moduels-------------------------------------------------
const passportModules = require('./passport-config')
const initialize = passportModules.initialize
const registerFunction = passportModules.registerFunction

initialize(passport)
//var parser = require('ua-parser-js');
//var cookieParser = require('cookie-parser');

//app.use(cookieParser());

const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({extended: false}));
//hei start
app.use(flash())
app.use(session({
    secret : 'Secret',
    resave : false,
    saveUninitialized : false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
//hei end
app.set('view engine', 'ejs');

function sicount(){
		var date = new Date;

        var seconds = date.getSeconds();
        var minutes = date.getMinutes();
        var hour = date.getHours();

        var year = date.getFullYear();
        var month = date.getMonth()+1; // beware: January = 0; February = 1, etc.
        var day = date.getDate();
        if (month<10)
            month='0'+month;
        if (day<10)
            day='0'+day;
        if (hour<10)
            hour='0'+hour;
        if (minutes<10)
            minutes='0'+minutes;
        if (seconds<10)
            seconds='0'+seconds;
        var t=''+year+month+day+hour+minutes+seconds;
    		return t;
}

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

function test_join(post_id, user_id)
{
    var sql = "Select * FROM post_to_join WHERE post_id = '"+post_id+"' and joiner_id = '"+user_id+"'";
    var output=0;
	console.log(sql);
    con.query(sql, function (err, result, fields) {
            if (err) throw err;
            console.log("length:"+result.length);
            console.log(result);
            if(result.length)
                output=1;
            console.log(output);
            });
}

var  get_group_info_FromDB = function(callback) {

con.query("SELECT * FROM group_info", function (err, result, fields) {
    if (err) return callback(err);;
   // console.log(result[0].user_id);
   // console.log(output);
    callback(null,result);
  });
};

var  get_comment_FromDB = function(post_id, callback) {
    console.log("post_id in get: "+post_id);
    con.query("SELECT * FROM comment where post_id='"+post_id+"'", function (err, result, fields) {
    if (err) return callback(err);;
   // console.log(result[0].user_id);
   console.log("comment result: "+result);
    callback(null,result);
  });
};

app.get("/", function(req, res, next) {
    res.redirect('/who.html');
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
	//res.cookie('c', qdata.who);
    res.redirect('/index');
	return res.end();
});

app.get("/index", function(req, res, next) {
    //Open a file on the server and return its content:
    //console.log(output);
    console.log("in index");
    try {
        console.log("display");
        console.log("display");
        console.log("id in index:"+req.user.user_id);
    } catch(e){
        console.log('error ah');
    }
    get_group_info_FromDB(function (err, group_result) {
        if (err) console.log("Database error!");
        var sql="SELECT post_id, title, description FROM post";
        //var sql="SELECT post_id, title, description FROM post where post_id not in (Select post_id from post_to_join where joiner_id = '"+current_user+"')";
        //var sql= "SELECT post_id, title, description FROM post where post_id not in (Select post_id from post_to_join where joiner_id = '"+current_user+"')";
        console.log(sql);
        //console.log("cookies:"+req.cookies.c);
        con.query(sql, function (err, result, fields) {
            if (err) throw err;
            console.log(group_result);
            console.log(result);
            res.render('index', {result: result, user_id: current_user, group_result: group_result});
         });
  });
});

app.get("/filter_not_joined", function(req, res, next) {
    console.log("try to filter post");
	get_group_info_FromDB(function (err, group_result) {
        if (err) console.log("Database error!");
        var sql= "SELECT post_id, title, description FROM post where post_id not in (Select post_id from post_to_join where joiner_id = '"+current_user+"')";
        con.query(sql, function (err, result, fields) {
            if (err) throw err;
            console.log(group_result);
            console.log(result);
            //console.log("length: "+result.length);
            res.render('index', {result: result, user_id: current_user, group_result: group_result});
         });
    });
});

app.get("/admin", function(req, res, next) {
	console.log("in admin");
	//console.log(qdata.ref);
    res.render('admin');
});

app.get("/show_your_user_information", function(req, res, next) {
    console.log("try to show your information");
    var q = url.parse(req.url, true);
	var qdata = q.query;
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
                res.render('user_information_display', {result: result[0], user_id: current_user, rate: rating_result[0]['AVG(rating)']}); 
        });
    });
});

app.get("/change_user_information", function(req, res, next) {
    console.log("try to change user info");
	console.log("user.id: "+current_user);
	var sql = "Select * FROM user_information WHERE user_id = '"+current_user+"'";
	console.log(sql);
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        var sqlr= "SELECT AVG(rating) FROM user_to_rating where user_id = '"+current_user+"'";
        con.query(sqlr, function (err, rating_result, fields) {
                if (err) throw err;
                console.log("avg rating:");
                console.log(rating_result[0]['AVG(rating)']);
                res.render('user_information_display', {result: result[0], user_id: current_user, rate: rating_result[0]['AVG(rating)']}); 
        }); 
    });
});

app.get("/change_content_user_information", function(req, res, next) {
    console.log("try to change content of post");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	var sql_user_first_name="";
	var sql_user_last_name="";
	var sql_phone_number="";
	var sql_age="";
	var sql_introduction="";
	var sql_sex="";
	var sql_perference1="";
	var sql_perference2="";
	var sql_perference3="";
	console.log(qdata.user_first_name);
	console.log(qdata.user_last_name);
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
	var sql = "Update user_information set "+sql_user_first_name+sql_user_last_name+sql_phone_number+sql_age+sql_introduction+sql_sex+sql_perference1+sql_perference2+sql_perference3+"user_id='"+current_user+"' WHERE user_id = '"+current_user+"'";
	console.log(sql);
    con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    console.log("it is updated");
    res.redirect('/index');
    });
});

app.get("/delete_account", function(req, res, next) {
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
    res.redirect('/index');
	return res.end();
});

app.get("/create_id", function(req, res, next) {
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
    res.redirect('/index');
	return res.end();
});

app.get("/search_id_of_post", function(req, res, next) {
    console.log("try to search post id");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log(qdata.search_post_id);
	get_group_info_FromDB(function (err, group_result) {
        if (err) console.log("Database error!");
        var sql = "Select post_id, title, description FROM post WHERE post_id = '"+qdata.search_post_id+"'";
        con.query(sql, function (err, result, fields) {
            if (err) throw err;
            console.log(group_result);
            console.log(result);
            //console.log("length: "+result.length);
            res.render('index', {result: result, user_id: current_user, group_result: group_result}); 
         });
    });
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

app.get("/creating_post", function(req, res, next) {
	console.log("Trying to creating a new post...");
    res.render('create_post', {user: current_user});
	return res.end();
});

app.get("/create_post", function(req, res, next) {
	console.log("Trying to create a new post...");
	var q = url.parse(req.url, true);
	var qdata = q.query;
	var host_id=current_user;
	console.log("create:"+current_user);
	var t=sicount();
	var post_id=""+host_id+t;
	var sql = "INSERT INTO post VALUES ('"+qdata.title+"', '"+ qdata.description+"', '"+post_id+"', '"+host_id+"', '"+qdata.group_id+"', '"+qdata.type_of_game+"', '"+t+"', '"+qdata.hashtag+"');";
	console.log(sql);
	con.query(sql, function (err, result) {
    if (err) console.log('error');
    else console.log("1 record inserted");
  });
    var sql = "INSERT INTO post_to_join VALUES ('"+post_id+"', '"+host_id+"');";
	console.log(sql);
	con.query(sql, function (err, result) {
    if (err) console.log('error');
    else console.log("1 record inserted");
  });
    //console.log(sql);
    res.redirect('/index');
	return res.end();
});

app.get("/delete_id", function(req, res, next) {
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
    res.redirect('/index');
	return res.end();
});

app.get("/delete_post", function(req, res, next) {
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
    res.redirect('/index');
	return res.end();
});

app.get("/show_post", function(req, res, next) {
    console.log("try to see post");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log(qdata.post_id);
	var sqlc = "Select * FROM comment WHERE post_id = '"+qdata.post_id+"'";
	console.log(sqlc);
    con.query(sqlc, function (err, comment_result, fields) {
        if (err) throw err;
        console.log("comment:");
        console.log(comment_result);
        var sqlp = "Select * FROM post, post_to_join WHERE post.post_id = post_to_join.post_id AND post.post_id = '"+qdata.post_id+"'";
    	console.log(sqlp);
        con.query(sqlp, function (err, post_result, fields) {
            if (err) throw err;
            console.log("comment:");
            console.log(comment_result);
            console.log("post:");
            console.log(post_result);
            //console.log("post_id: "+result[0].post_id);
            res.render('postdisplay', {result: post_result[0], all_result: post_result, comment: comment_result, user_id: current_user}); 
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

app.get("/change_post", function(req, res, next) {
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

app.get("/change_content_post", function(req, res, next) {
    console.log("try to change content of post");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	var sqltitle="";
	var sqldescription="";
	var sqltype_of_game="";
	var sqlhashtag="";
	var sqlgroup_id="";
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
	var sql = "Update post set "+sqltitle+sqldescription+sqltype_of_game+sqlhashtag+sqlgroup_id+"post_id='"+qdata.post_id+"' WHERE post_id = '"+qdata.post_id+"'";
	console.log(sql);
    con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    console.log("it is updated");
    res.redirect('/index');
    });
});

app.get("/join_post", function(req, res, next) {
    console.log("try to see post");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log(qdata);
	console.log("post.id: "+qdata.join_post_id);
	var sql = "INSERT INTO post_to_join VALUES ('"+qdata.join_post_id+"', '"+current_user+"')";
	console.log(sql);
    con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    console.log("you have join that post!");
    res.redirect('/index');
  });
});

app.get("/filter_group", function(req, res, next) {
    console.log("try to filter post");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log(qdata.group_id);
	get_group_info_FromDB(function (err, group_result) {
        if (err) console.log("Database error!");
        var sql = "Select post_id, title, description FROM post WHERE group_id = '"+qdata.group_id+"'";
        con.query(sql, function (err, result, fields) {
            if (err) throw err;
            console.log(group_result);
            console.log(result);
            //console.log("length: "+result.length);
            res.render('index', {result: result, user_id: current_user, group_result: group_result}); 
         });
    });
});

app.get("/modify_group", function(req, res, next) {
    var sql = "Select * FROM group_info";
        con.query(sql, function (err, group_result, fields) {
            if (err) throw err;
            console.log(group_result);
            //console.log("length: "+result.length);
            res.render('modify_group', {group_result: group_result}); 
         });
});

app.get("/create_new_group", function(req, res, next) {
    console.log("try to delete a comment");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log(qdata);
	var sql = "insert into group_info values ('"+qdata.new_group_ID+"', '"+qdata.new_group_name+"', '"+qdata.new_group_description+"')";
	console.log(sql);
    con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    });
    var sql = "Select * FROM group_info";
    con.query(sql, function (err, group_result, fields) {
        if (err) throw err;
        console.log(group_result);
        //console.log("length: "+result.length);
        res.render('modify_group', {group_result: group_result}); 
    });
});

app.get("/change_group", function(req, res, next) {
    console.log("try to delete a comment");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log(qdata);
	var sql_group_name="";
	var sql_group_description="";
	if(qdata.change_group_name)
	    sql_group_name="group_name = '"+qdata.change_group_name+"', ";
	if(qdata.change_group_descripton)
	    sql_group_description="group_descripton = '"+qdata.change_group_descripton+"', ";
	var sql = "Update group_info set "+sql_group_name+sql_group_description+"group_id='"+qdata.change_group_id+"' WHERE group_id = '"+qdata.change_group_id+"'";
	console.log(sql);
    con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    });
    var sql = "Select * FROM group_info";
    con.query(sql, function (err, group_result, fields) {
        if (err) throw err;
        console.log(group_result);
        //console.log("length: "+result.length);
        res.render('modify_group', {group_result: group_result}); 
    });
});

app.get("/delete_group", function(req, res, next) {
    console.log("try to delete a comment");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log(qdata);
	var sql = "delete from group_info where group_id= '"+qdata.delete_group_id+"'";
	console.log(sql);
    con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    });
    var sql = "Select * FROM group_info";
    con.query(sql, function (err, group_result, fields) {
        if (err) throw err;
        console.log(group_result);
        //console.log("length: "+result.length);
        res.render('modify_group', {group_result: group_result}); 
    });
});

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

app.get("/show_your_room", function(req, res, next) {
    //Open a file on the server and return its content:
    console.log("show room");
    var sql = "Select post.title, post.description, post.post_id FROM post, post_to_join WHERE post.post_id = post_to_join.post_id AND post_to_join.joiner_id = '"+current_user+"'";
    console.log(sql);
    con.query(sql, function (err, result, fields) {
    if (err) {
        console.log("error");
        res.redirect('/index');
    }
    console.log(result);
    res.render('show_your_room', {result: result, user: current_user});
  });
});

app.get("/enter_room", function(req, res, next) {
    console.log("try to enter room");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	if(qdata.action=="add_joiner")
	{
	    console.log("try to add joiner!");
	    var sql = "insert into post_to_join values ('"+qdata.post_id+"', '"+qdata.new_user_id+"')";
        console.log(sql);
        con.query(sql, function (err, result, fields) {
        if (err) {
            console.log("error");
            res.redirect('/index');
        }
        console.log(result);
        });
	} else if(qdata.action=="change_host")
	{
	    console.log("try to change host!");
	    var sql = "update post set host_id = '"+qdata.changed_host_id+"' where post_id = '"+qdata.post_id+"'";
        console.log(sql);
        con.query(sql, function (err, result, fields) {
        if (err) {
            console.log("error");
            res.redirect('/index');
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
            res.redirect('/index');
        }
        console.log(result);
        });
	}
	console.log(qdata.post_id);
	var sql = "Select * FROM post, post_to_join WHERE post.post_id = post_to_join.post_id AND post.post_id = '"+qdata.post_id+"'";
	console.log(sql);
    con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    console.log("post_id: "+result[0].post_id);
    res.render('room_display', {result: result[0], all_result: result, user_id: current_user}); 
  });
});

app.get("/withdraw_room", function(req, res, next) {
    //Open a file on the server and return its content:
    console.log("try to withdraw room");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log(qdata);
    var sql = "Delete FROM post_to_join WHERE post_to_join.post_id = '"+qdata.withdraw_post_id+"' AND post_to_join.joiner_id = '"+current_user+"'";
    console.log(sql);
    con.query(sql, function (err, result, fields) {
    if (err) {
        console.log("error");
        res.redirect('/index');
    }
    console.log(result);
    res.redirect('show_your_room');
  });
});

app.get("/add_joiner", function(req, res, next) {
    //Open a file on the server and return its content:
    console.log("try to add user");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log(qdata);
    var sql = "insert into post_to_join values ('"+qdata.add_user_post_id+"', '"+qdata.new_user_id+"')";
    console.log(sql);
    con.query(sql, function (err, result, fields) {
    if (err) {
        console.log("error");
        res.redirect('/index');
    }
    console.log(result);
    });
    var sql = "Select * FROM post, post_to_join WHERE post.post_id = post_to_join.post_id AND post.post_id = '"+qdata.add_user_post_id+"'";
	console.log(sql);
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        res.render('room_display', {result: result[0], all_result: result, user_id: current_user}); 
      });
});

app.get("/change_host", function(req, res, next) {
    //Open a file on the server and return its content:
    console.log("try to change host");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log(qdata);
    var sql = "update post set host_id = '"+qdata.changed_host_id+"' where post_id = '"+qdata.changed_host_post_id+"'";
    console.log(sql);
    con.query(sql, function (err, result, fields) {
    if (err) {
        console.log("error");
        res.redirect('/index');
    }
    console.log(result);
    });
    var sql = "Select * FROM post, post_to_join WHERE post.post_id = post_to_join.post_id AND post.post_id = '"+qdata.changed_host_post_id+"'";
	console.log(sql);
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        res.render('room_display', {result: result[0], all_result: result, user_id: current_user});
      });
});

app.get("/delete_joiner", function(req, res, next) {
    //Open a file on the server and return its content:
    console.log("try to delete joiner");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log(qdata);
    var sql = "Delete FROM post_to_join WHERE post_id = '"+qdata.that_post_id+"' AND joiner_id = '"+qdata.delete_joiner_id+"'";
    console.log(sql);
    con.query(sql, function (err, result, fields) {
    if (err) {
        console.log("error");
        res.redirect('/index');
    }
    console.log(result);
    });
    var sql = "Select * FROM post, post_to_join WHERE post.post_id = post_to_join.post_id AND post.post_id = '"+qdata.that_post_id+"'";
	console.log(sql);
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        res.render('room_display', {result: result[0], all_result: result, user_id: current_user}); 
      });
});

app.get("/finish_room", function(req, res, next) {
    console.log("try to finish the users");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log(qdata.finish_post_id);
	var sql = "Select * FROM post_to_join WHERE post_id = '"+qdata.finish_post_id+"' and not joiner_id = '"+current_user+"'";
	console.log(sql);
    con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.render('rate_user', {all_result: result}); 
  });
});

app.get("/rate_user", function(req, res, next) {
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
    res.redirect("index");
});

app.get("/new_comment", function(req, res, next) {
    console.log("try to write a new comment");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log(qdata);
	var t= sicount();
	var comment_id=""+current_user+t;
	var sql = "insert into comment values ('"+comment_id+"', '"+qdata.post_id+"', '"+current_user+"', '"+t+"', '"+qdata.new_comment+"')";
	console.log(sql);
    con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    });
    var sqlc = "Select * FROM comment WHERE post_id = '"+qdata.post_id+"'";
	console.log(sqlc);
    con.query(sqlc, function (err, comment_result, fields) {
        if (err) throw err;
        console.log("comment:");
        console.log(comment_result);
        var sqlp = "Select * FROM post, post_to_join WHERE post.post_id = post_to_join.post_id AND post.post_id = '"+qdata.post_id+"'";
    	console.log(sqlp);
        con.query(sqlp, function (err, post_result, fields) {
            if (err) throw err;
            console.log("comment:");
            console.log(comment_result);
            console.log("post:");
            console.log(post_result);
            res.render('postdisplay', {result: post_result[0], all_result: post_result, comment: comment_result, user_id: current_user}); 
        });
    });
});

app.get("/change_comment", function(req, res, next) {
    console.log("try to change a comment");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log(qdata);
	var sql = "UPDATE comment SET comment_content = '"+qdata.change_comment+"' WHERE comment_id = '"+qdata.comment_id+"'";
	console.log(sql);
    con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    });
    var sqlc = "Select * FROM comment WHERE post_id = '"+qdata.post_id+"'";
	console.log(sqlc);
    con.query(sqlc, function (err, comment_result, fields) {
        if (err) throw err;
        console.log("comment:");
        console.log(comment_result);
        var sqlp = "Select * FROM post, post_to_join WHERE post.post_id = post_to_join.post_id AND post.post_id = '"+qdata.post_id+"'";
    	console.log(sqlp);
        con.query(sqlp, function (err, post_result, fields) {
            if (err) throw err;
            console.log("comment:");
            console.log(comment_result);
            console.log("post:");
            console.log(post_result);
            res.render('postdisplay', {result: post_result[0], all_result: post_result, comment: comment_result, user_id: current_user}); 
        });
    });
});

app.get("/delete_comment", function(req, res, next) {
    console.log("try to delete a comment");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log(qdata);
	var sql = "delete from comment where comment_id= '"+qdata.comment_id+"'";
	console.log(sql);
    con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    });
    var sqlc = "Select * FROM comment WHERE post_id = '"+qdata.post_id+"'";
	console.log(sqlc);
    con.query(sqlc, function (err, comment_result, fields) {
        if (err) throw err;
        console.log("comment:");
        console.log(comment_result);
        var sqlp = "Select * FROM post, post_to_join WHERE post.post_id = post_to_join.post_id AND post.post_id = '"+qdata.post_id+"'";
    	console.log(sqlp);
        con.query(sqlp, function (err, post_result, fields) {
            if (err) throw err;
            console.log("comment:");
            console.log(comment_result);
            console.log("post:");
            console.log(post_result);
            res.render('postdisplay', {result: post_result[0], all_result: post_result, comment: comment_result, user_id: current_user}); 
        });
    });
});

//chat room

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
    io.emit("msg", msg)
    
});


//register
app.get('/register',  checkNotAuthenticated, (req, res) => {
    res.render("register.ejs")
})

app.post('/register', checkNotAuthenticated, (req, res) => {
    registerFunction(req,res)
})

function checkAuthenticated(req, res, next) {//login先可以入url

    if (req.isAuthenticated()) {
        return next()
    }
    
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    
    next()
}

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render("login.ejs")
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/index')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/index',
    failureRedirect: '/login',
    failureFlash: true
}))

// hei end

// jason start

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
        var photo_user_id = 1;
        console.log(req.file.filename);
        var info = [[photo_user_id,req.file.filename]];
        var sql = 'INSERT INTO imgUpload (user_id,filename) VALUES ?';
        connection.query(sql, [info], function (err, result) {
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

//jason end

/*app.get("/", function(req, res, next) {
    //Open a file on the server and return its content:
    //console.log(output);
    var b=0;
    getInformationFromDB(function (err, result) {
  if (err) console.log("Database error!");
  else console.log('a'+result[0].user_id);
  if(result=='1155079553')
        b=1;
    //res.render('main', {person: result});
    res.render('post', {id: result[0].user_id, password: result[0].password});
    });
});*/

/*app.get("/", function(req, res, next) {
    //Open a file on the server and return its content:
  fs.readFile('main.html', function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end(); //for send back information
  });
});
app.get("/input.html", function(req, res, next) {
    //Open a file on the server and return its content:
  fs.readFile('input.html', function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end();
  });
});
app.get("/register.html", function(req, res, next) {
    fs.readFile('register.html', function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end();
  });
});
app.get("/t1.html", function(req, res, next) {
    fs.readFile('t1.html', function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end();
  });
});
app.get("/t2.html", function(req, res, next) {
    fs.readFile('t2.html', function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end();
  });
});
app.get("/main.html", function(req, res, next) {
    fs.readFile('main.html', function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end();
  });
});
app.get("/all.html", function(req, res, next) {
    fs.readFile('all.html', function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end();
  });
});
app.get("/football.html", function(req, res, next) {
    fs.readFile('football.html', function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end();
  });
});
app.get("/basketball.html", function(req, res, next) {
    fs.readFile('basketball.html', function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end();
  });
});
app.get("/user_information.html", function(req, res, next) {
    fs.readFile('user_information.html', function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end();
  });
});*/

server.listen(8080, () => {
    console.log("Server Start");
});

//http.createServer(app).listen(8080);
//console.log('Server On and Port number: 8080');
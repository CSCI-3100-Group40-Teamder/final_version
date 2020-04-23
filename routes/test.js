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
const records = require('./records.js');


app.set('view engine', 'ejs');

var router = express.Router();

var cookieParser = require('cookie-parser');

app.use(cookieParser());

//-----------------------------------------------------------Jacky's Code Start-------------------------------------------------------

var theServer = require('../server.js'); // for getting the var from the server
var io = theServer.getIO(); 


//some global var
let numOfOnline = 0;
var chatroomID = 0;
var ID = 0;

/*router.get('/',  function (req, res) { //login左先可以去到
    
    var q = url.parse(req.url, true);
    var qdata = q.query;
    //chatroomID = 123;
    chatroomID = qdata.chatroom;
    console.log("in chatroom: "+chatroomID);
    const user_ID = qdata.user_id;
    records.setData(chatroomID)
    console.log(user_ID);
    res.render('chatroom',{chatroom : chatroomID, user_ID : user_ID}); // chatroom 應該係 ＝＝ post id 
    //res.render('chatroom',{chatroom : qdata.chatroom}); 
});*/
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

//-------------------------------------------------Jacky's code end-----------------------------------------------------------------------------

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
        var sql_group="SELECT * FROM group_info";
        con.query(sql_group, function (err, group_result, fields) {
            if (err) throw err;
            var sql_subgroup="SELECT * FROM subgroup_info";
            con.query(sql_subgroup, function (err, subgroup_result, fields) {
                if (err) throw err;
                res.render('show_your_room', {post_all_result: result, user_id: req.cookies.c, current_name: req.cookies.nickname, current_id: req.cookies.c, group_result: group_result, subgroup_result: subgroup_result, icon: req.cookies.icon});
            });
        });
      });
});

router.get("/enter_room", function(req, res, next) {
    console.log("try to enter room");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	var message='';
	console.log("qdata:  ");
	console.log(qdata);
	console.log("post_id:  ");
	console.log(qdata.post_id);
	if(qdata.action=="add_joiner")
	{
	    console.log("try to add joiner!");
	    var sql="select * from user_information where user_id = '"+qdata.user_id+"'";
	    con.query(sql, function (err, result_for_name, fields) {
            if (err) {
                console.log("error in add joiner");
                res.redirect('../index');
                }
    	    var sql = "INSERT INTO post_to_join VALUES ('"+qdata.post_id+"', '"+qdata.user_id+"', 0);";
            console.log(sql);
            con.query(sql, function (err, result, fields) {
            if (err) {
                console.log("error in add joiner");
                res.redirect('../index');
                }
                message="The user is added. Please refresh to see the new joiner."
            });
        });
	} else if(qdata.action=="change_host")
	{
	    console.log("try to change host!");
	    var sql = "update post set host_id = '"+qdata.user_id+"' where post_id = '"+qdata.post_id+"'";
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
                records.setData(result[0].post_id) // my new line
                //res.render('showRoom', {result: result[0], all_result: result, user_id: req.cookies.c, finish_result: finish_result[0].finish}); 
                var sql_host_name="select nickname from user_information where user_id = '"+result[0].host_id+"'";
                con.query(sql_host_name, function (err, host_name_result, fields) {
                    if (err) throw err;
                    console.log(host_name_result);
                    records.setData(result[0].post_id) // my new line
                    if(qdata.action=="add_joiner")
                        res.redirect("/room_module/enter_room?post_id="+qdata.post_id+"");
                    var sql_group="SELECT * FROM group_info";
                    con.query(sql_group, function (err, group_result, fields) {
                        if (err) throw err;
                        var sql_subgroup="SELECT * FROM subgroup_info";
                        con.query(sql_subgroup, function (err, subgroup_result, fields) {
                            if (err) throw err;
                            //res.render('showRoom', {post_result_0: result[0], post_all_result: result, post_id: qdata.post_id, user_id: req.cookies.c, finish_result: finish_result[0].finish, host_name: host_name_result[0].nickname, message: message, current_name: req.cookies.nickname, current_id: req.cookies.c, group_result: group_result, subgroup_result: subgroup_result, icon: req.cookies.icon});
                            var sql_admin="SELECT is_admin FROM user_information where user_id = '"+req.cookies.c+"'";
                            con.query(sql_admin, function (err, admin_result, fields) {
                                if (err) throw err;
                                res.render('showRoom', {post_result_0: result[0], post_all_result: result, post_id: qdata.post_id, user_id: req.cookies.c, finish_result: finish_result[0].finish, host_name: host_name_result[0].nickname, message: message, current_name: req.cookies.nickname, current_id: req.cookies.c, group_result: group_result, subgroup_result: subgroup_result, icon: req.cookies.icon, is_admin: admin_result[0].is_admin}); 
                            });
                        });
                    });
                  });
              });
      });
});

router.get("/refresh", function(req, res, next) {
    //Open a file on the server and return its content:
    console.log("try to withdraw room");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log("in refresh");
	console.log(qdata.post_id);
	res.redirect("/enter_room?post_id='"+qdata.post_id+"'");
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
    res.redirect('../index');
  });
});

router.get("/finish_room", function(req, res, next) {
    console.log("try to finish the users");
    var q = url.parse(req.url, true);
	var qdata = q.query;
	console.log(qdata.finish_post_id);
	var sql = "Select * FROM post_to_join, user_information WHERE post_to_join.post_id = '"+qdata.finish_post_id+"' and post_to_join.joiner_id = user_information.user_id and not post_to_join.joiner_id = '"+req.cookies.c+"'";
	console.log(sql);
    con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.render('rate_user', {all_result: result, post_id: qdata.finish_post_id, current_name: req.cookies.nickname, current_id: req.cookies.c, icon: req.cookies.icon}); 
  });
});

module.exports = router;
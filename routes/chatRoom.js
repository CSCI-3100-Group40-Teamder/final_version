const express = require('express');
const app = express();
const records = require('./records.js');
var url = require('url');
app.set('view engine', 'ejs');
var router = express.Router();


var theServer = require('../server.js'); // for getting the var from the server
var io = theServer.getIO(); 


//some global var
let numOfOnline = 0;
var chatroomID = 0;
var ID = 0;

router.get('/',  function (req, res) { //login左先可以去到
    
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


module.exports = router;
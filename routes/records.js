const {EventEmitter} = require("events");

var recordObject;

var chatroomID =0
const mysql_method = require('../dataBase/createTable') // need to change
var other=require("../other_function");

const connection = mysql_method.connection

class Records extends EventEmitter {
    constructor () {
        super();
    }

    setData(input){
        chatroomID = input
    }
//----------------------------------------------------------------------insert Data to the dataBAse-------------------------------------------------------------------
    insertData (msg) {

        // need to save to the database
        // using hei's example as a ref
        var sender_id = msg.sender_id // sender_id
        var content = msg.content 
        var room_id = msg.roomID // it is our post_id
        var today = new Date();
        //var time = other.sicount(); // current time
        var time = today.getMonth()+1 + "/" + today.getDate() +" "+ today.getHours() + ":" + today.getMinutes()  // current time
        var chat_time  = time
         //console.log("sender_id"+sender_id);
         msg.chat_time = time
        
        var select_userName_sql = "SELECT * FROM user_information WHERE user_id = '"+sender_id+"'";
        connection.query(select_userName_sql, (error, results, fields) => {
                if (error) throw error
                console.log(results)
                msg.sender_id = results[0].nickname;
                sender_id = results[0].nickname;
                console.log("sender_id"+sender_id);
                console.log("nickname"+results.nickname);
                
                const insert_chat_sql = `INSERT INTO  chat (room_id, sender_id, content, chat_time) VALUES (?,?,?,?)`
        
                connection.query(insert_chat_sql, [room_id, results[0].nickname, content, chat_time], (error, results, fields) => {
                        if (error) throw(error);
                        
                        console.log('chat has already inerted to the dataBase')
                        
                        this.emit("new_message", msg) // send to records.on("new_message", (msg) 
                    })  
                
            })
            
        
        
    }

//----------------------------------------------------------when there are new connection, then send him/her records---------------------------------------------------
    getData(callback) {
        
        const select_chat_sql = 'SELECT * FROM chat WHERE room_id = ?' 

        connection.query(select_chat_sql, [chatroomID],(error, results, fields) => {
            if (error) throw error
            //console.log(results)
            
            callback(results)
        })
        
    }

}
 
module.exports = (function () {
    
    if (recordObject === undefined) {
        recordObject = new Records();
    }
 
    return recordObject;
})();
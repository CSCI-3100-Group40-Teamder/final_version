const {EventEmitter} = require("events");

var recordObject;

var chatroomID =0
const mysql_method = require('./dataBase/createTable')


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
        const sender_id = msg.sender_id // sender_id
        const content = msg.content 
        const room_id = msg.roomID // it is our post_id
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds(); // current time
        const chat_time  = time

        const insert_chat_sql = `INSERT INTO  chat (room_id, sender_id, content, chat_time) VALUES (?,?,?,?)`

        connection.query(insert_chat_sql, [room_id, sender_id, content, chat_time], (error, results, fields) => {
            if (error) throw(error);
            
            console.log('chat has already inerted to the dataBase')
           
            this.emit("new_message", msg) // send to records.on("new_message", (msg) 
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
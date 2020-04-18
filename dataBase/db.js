const mysql = require('mysql');

//Create connection to mysql database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "csci3100",
  database: "teamder"
}) 

//Connet to that connection
connection.connect(function(err) {
    if (err) throw err;
});


module.exports = connection;

/*// Get all photo upload by a user
var user_id = 0;
var sql = 'SELECT filename FROM user_to_photo WHERE user_id = ?';
connection.query(sql, [user_id], function (err, result) {
    if (err) throw err
    console.log(result);
});*/
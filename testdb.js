const mysql = require('mysql')

const connection = mysql.createConnection({
    host:"database-testing.ccgcttjz3ptu.ap-southeast-1.rds.amazonaws.com",
    port:'3306',
    user:"admin",
    password:"csci3100",
    database: "user"
}) 

connection.query('SELECT * FROM user_account', (e, res) => {
    console.log(res)
})

connection.end()
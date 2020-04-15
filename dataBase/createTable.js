var mysql = require('mysql')

const connection = mysql.createConnection({
    host:"database-testing.ccgcttjz3ptu.ap-southeast-1.rds.amazonaws.com",
    port:'3306',
    user:"admin",
    password:"csci3100",
    database: "user"
})


/*const create_table_sql = `CREATE TABLE IF NOT EXISTS chat (
                        room_id varchar(10),
                        sender_id varchar(10),
                        content varchar(350),
                        chat_time varchar(10))`
connection.query(create_table_sql, (error, results, fields) => {
    if (error) throw error
    console.log('created database')
})*/

module.exports = {
    connection: connection
}
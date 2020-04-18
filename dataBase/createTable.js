var mysql = require('mysql')

const connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "csci3100",
      database: "teamder"
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
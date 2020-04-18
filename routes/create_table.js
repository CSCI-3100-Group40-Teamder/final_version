var mysql = require('mysql')

const connection = mysql.createConnection({
    host:"database-testing.ccgcttjz3ptu.ap-southeast-1.rds.amazonaws.com",
    port:'3306',
    user:"admin",
    password:"csci3100",
    database: "user"
})

function createTable() {
    const create_table_sql = `CREATE TABLE IF NOT EXISTS user (
                                id INTEGER NOT NULL AUTO_INCREMENT, 
                                name TEXT,
                                email VARCHAR(50),
                                password TEXT,
                                PRIMARY KEY(id),
                                UNIQUE(email))`

    connection.query(create_table_sql, (error, results, fields) => {
        if (error) throw error
    })

    console.log('created database')
}


module.exports = {
    createTable: createTable,
    connection: connection
}
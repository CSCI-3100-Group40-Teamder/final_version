const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const mysql_method = require('./database-dev/create_table')


mysql_method.createTable()
const connection = mysql_method.connection

function initialize(passport) {
    const authenticateUser = (email, password, done) =>{
        connection.query(`SELECT * FROM user_account where email = "${email}"`, async (e, res) => {
            if (e) return done(e)
            const user = res[0]
            // cannot find the email from the database
            if (user == null) {
                return done(null, false, { message: 'No user with that email'})
            } else{
                try{
                    // correct password
                    if (await bcrypt.compare(password, user.password)){
                        return done(null, user)
                    // incorrect password
                    } else {
                        return done(null, false, { message : 'Password incorrect'})
                        }
                } catch(e) {
                    return done(e)
                }
            }
        })
    }
    
    
    passport.use(new localStrategy({ usernameField : 'email'}, authenticateUser))
    passport.serializeUser( (user, done) => {
        done(null, user.user_id)
    })
    
    passport.deserializeUser( (id, done) => {
        console.log(id)
        connection.query(`SELECT * FROM user_account where user_id = "${id}"`,  (e, res) => {
            if (e) return done(e)
            done(null, res[0])
        })
    })
}

async function registerFunction(req, res) {
    // Check if there is any invalid input. If invalid, reload the registration page and flash error message
    if (!validate_input(req, res)) return
    
    // Valid email
    try {
        await bcrypt.hash(req.body.password, 10, (e, pw) => {
            
            // store the encrypted user information to db
            const email = req.body.email
            
            const insert_user_sql = `INSERT INTO  user_account (user_id, email, password) VALUES (?,?,?)`
    
            // Insert the registration into user table
            connection.query(insert_user_sql, [null, email, pw], (error, results, fields) => {
                // If there is any error
                if (error != null){
                    
                    // If the email is already existed in the table, error
                    if (error.code == 'ER_DUP_ENTRY'){
                        req.flash('reg_error', 'This email has already been registered')
                        res.redirect('/register')
                        
                    // other errors
                    } else {
                        console.log(error)
                    }
                    
                // Successfully stored user to database
                } else{
                    
                    // Save the user_id to the user_infromation db
                    connection.query(`SELECT user_id FROM user_account WHERE email = "${email}"`, (e, resu, f) => {
                        to_user_info_db(req, res, email, resu[0].user_id)
                    })
                    console.log(`Register user email : ${email}`)
                    
                }
            })
        })            
    } catch(e) {
        console.log(e)
        res.redirect('/register')
    }    
}


// -------------------------------------------------custom functions-------------------------------------------------
function validate_input(req, res) {

    // Check if the email is valid
    if ( ! req.body.email.includes('@') ) {
        req.flash('reg_error', 'Please enter a valid email')
        res.redirect('/register')
        return false

    // Check if the password has length > 6
    } else if (req.body.password.length < 6) {
        req.flash('reg_error', 'Please enter at least 6 characters for password')
        res.redirect('/register')
        return false
    }
    return true
}

function to_user_info_db(req, res, email, user_id){
    
    // If does not input nickname, nickname = first_name
    var nickname = req.body.nickname
    
    if (nickname == ''){
        nickname = req.body.first_name
    } 
    
    const insert_user_sql = `INSERT INTO  user_information (user_id, user_first_name, user_last_name, nickname, email) VALUES (?,?,?,?,?)`
    connection.query(insert_user_sql, [user_id, req.body.first_name, req.body.last_name, nickname, email], (error, results, fields) => {
        if (error) throw error
        res.redirect("/login")
    })
}


// -------------------------------------------------export modules-------------------------------------------------
module.exports = {
    initialize: initialize,
    registerFunction: registerFunction
}
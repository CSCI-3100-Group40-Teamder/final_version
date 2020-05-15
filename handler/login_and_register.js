const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const mysql_method = require('../database-dev/create_table')

mysql_method.createTable()
const connection = mysql_method.connection


// It will initialize a passport instance.
function initialize(passport) {
    
    // Function to authenticate the user email and password
    const authenticateUser = (email, password, done) =>{
        
        // Search the email input from the database
        connection.query(`SELECT * FROM user_account where email = "${email}"`, async (e, res) => {
            if (e) return done(e)
            const user = res[0]
            
            // cannot find the email from the database, then error message
            if (user == null) {
                return done(null, false, { message: 'No user with that email'})
                
            // can find the email from the database
            } else{
                try{
                    
                    // correct password, then chekch the password with the encrypted password using bcrypt
                    if (await bcrypt.compare(password, user.password)){
                        return done(null, user)
                        
                    // incorrect password, then error message
                    } else {
                        return done(null, false, { message : 'Password incorrect'})
                        }
                // Prevent any error from bcrypt
                } catch(e) {
                    return done(e)
                }
            }
        })
    }
    
    // Passport will use a new local strategy that is specified by us.
    passport.use(new localStrategy({ usernameField : 'email'}, authenticateUser))
    
    // Serialize the user object to userid
    passport.serializeUser( (user, done) => {
        done(null, user.user_id)
    })
    
    // Deserialize the userid to a user object
    passport.deserializeUser( (id, done) => {
        connection.query(`SELECT * FROM user_account where user_id = "${id}"`,  (e, res) => {
            if (e) return done(e)
            done(null, res[0])
        })
    })
}

// It will be called when register
async function registerFunction(req, res) {
    
    // Check if there is any invalid input. If invalid, reload the registration page and flash error message
    if (!validate_input(req, res)) return
    
    // Valid email
    try {
        // Encrypt password using bcrypt
        await bcrypt.hash(req.body.password, 10, (e, pw) => {
            
            // store the encrypted user information to db
            const email = req.body.email
            
            // Store the user to the database
            const insert_user_sql = `INSERT INTO  user_account (user_id, email, password) VALUES (?,?,?)`
            
            // Generate id for user_account
            var id=""+Math.floor(Math.random() * 10000)+1;
            
            // Insert the registration into user table
            connection.query(insert_user_sql, [id, email, pw], (error, results, fields) => {
                // If there is any error
                if (error != null){
                    
                    // If the email is already existed in the table, error
                    if (error.code == 'ER_DUP_ENTRY'){
                        req.flash('reg_error', 'This email has already been registered')
                        res.redirect('/login-system/register')
                        
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
                }
            })
        })            
    } catch(e) {
        console.log(e)
        res.redirect('/login-system/register')
    }    
}


// -------------------------------------------------custom functions-------------------------------------------------
// Validate the input from registration to prevent any error
function validate_input(req, res) {
    
    // Check if the phone number is valid
    if ( isNaN(req.body.phone_number) ) {
        req.flash('reg_error', 'Please enter a valid phone number')
        res.redirect('/login-system/register')
        return false
        
    // Check if the email is valid
    } else if ( ! req.body.email.includes('@') ) {
        req.flash('reg_error', 'Please enter a valid email')
        res.redirect('/login-system/register')
        return false

    // Check if the password has length > 6
    } else if (req.body.password.length < 6) {
        req.flash('reg_error', 'Please enter at least 6 characters for password')
        res.redirect('/login-system/register')
        return false
    }
    return true
}

// function to store the email and user id to the user info database
function to_user_info_db(req, res, email, user_id){
    
    // If does not input nickname, nickname = first_name
    var nickname = req.body.nickname
    
    if (nickname == ''){
        nickname = req.body.first_name
    } 
    
    const insert_user_sql = `INSERT INTO user_information (user_id, user_first_name, user_last_name, nickname, email, phone_number, age, sex, is_admin, icon_path) 
                            VALUES ("${user_id}", "${req.body.first_name}", "${req.body.last_name}", "${nickname}", "${email}", "${req.body.phone_number}", "${req.body.birthdate}", "${req.body.sex}", 0, 'user-512.png')`;
                            
    connection.query(insert_user_sql, (error, results, fields) => {
        if (error) throw error
        res.redirect("/login-system/login")
    })
}


// -------------------------------------------------export modules-------------------------------------------------
module.exports = {
    initialize: initialize,
    registerFunction: registerFunction
}
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
    const email = req.body.email
    const pw = req.body.password

    // Check if the email is valid
    if ( ! email.includes('@') ) {
        req.flash('reg_error', 'Please enter a valid email')
        res.redirect('/login')

    // Check if the password has length > 6
    } else if (pw.length < 6) {
        req.flash('reg_error', 'Please enter at least 6 characters for password')
        res.redirect('/login')
    } else {
        try {
             await bcrypt.hash(pw, 10, (e, pw) => {
                const insert_user_sql = `INSERT INTO  user_account (user_id, email, password) VALUES (?,?,?)`
    
                // Insert the registration into user table
                connection.query(insert_user_sql, [null, email, pw], (error, results, fields) => {
                    if (error != null){
                        // If the email is already existed in the table, error
                        if (error.code == 'ER_DUP_ENTRY'){
                            req.flash('reg_error', 'This email has already been registered')
                            res.redirect('/login')
                        // other errors
                        } else {
                            console.log(error)
                        }
                        } else{
                        // Successfully stored user to database
                        console.log(`Register user email : ${email}`)
                        res.redirect("/login")
                }})            
        })
        } catch(e) {
            console.log(e)
            res.redirect('/login')
        }    
    }
}

module.exports = {
    initialize: initialize,
    registerFunction: registerFunction
}
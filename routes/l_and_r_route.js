const passport = require('passport')
const flash = require('express-flash')
const methodOverride = require('method-override')
const mysql_method = require('../database-dev/create_table')
const connection = mysql_method.connection

// -------------------------------------------------custom modules -------------------------------------------------
const lnr_modules = require('../handler/login_and_register')
const initialize = lnr_modules.initialize
const registerFunction = lnr_modules.registerFunction


// -------------------------------------------------router configuration -------------------------------------------------
const express = require('express')
var app = express();
var cookieParser = require('cookie-parser');

app.use(cookieParser());
app.set('view engine', 'ejs');
var router = express.Router();

router.use(passport.initialize())
router.use(passport.session())
router.use(methodOverride('_method'))
router.use(flash())

// -------------------------------------------------passport configuration -------------------------------------------------
initialize(passport)

// -------------------------------------------------register -------------------------------------------------
router.get('/register',  checkNotAuthenticated, (req, res) => {
    res.render("register.ejs")
})

router.post('/register', checkNotAuthenticated, (req, res) => {
    registerFunction(req,res)
})

// -------------------------------------------------login -------------------------------------------------
router.get('/login', checkNotAuthenticated, (req, res) => {
    res.cookie('c', 'guest');
    res.cookie('nickname', 'guest');
    res.cookie('icon', 'user-512.png');
    res.render("login.ejs")
})

// loading page for login
router.post('/loading', checkNotAuthenticated, (req, res) => {

    var sql="select * from user_information where email = '"+req.body.email+"'";

    connection.query(sql, function (err, result, fields) {
            if (err) res.redirect('login.ejs');

            if (result.length == 0){
                res.render('login.ejs', {messages :{error:'No user with this Email'}})
            } else {
                res.cookie('c', result[0].user_id);
                res.cookie('nickname', result[0].nickname);

                res.render('loading', {email: req.body.email, password: req.body.password});
            }
         });

})

router.get('/logincheck', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/index',
    failureRedirect: '/login-system/login',
    failureFlash: true
}))

// -------------------------------------------------logout -------------------------------------------------
// logout and delete all the user info in the cookie
router.delete('/logout', (req, res) => {
    res.cookie('c', 'guest');
    res.cookie('nickname', 'guest');
    res.cookie('icon', 'user-512.png');
    req.logOut()
    res.redirect('/index')
})

// -------------------------------------------------Authenticate Functions -------------------------------------------------
// Authenticate whether or not the user has logged in. If logged in, fire a callback, otherwise redirect to login page
function checkAuthenticated(req, res, next) {

    if (req.isAuthenticated()) {
        return next()
    }
    
    res.redirect('/login-system/login')
}

// Authenticate whether or not the user has logged in. If logged in, redirect to home page. Otherwise, fire the callback
function checkNotAuthenticated(req, res, next) {
    
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    
    next()
}

module.exports = router;
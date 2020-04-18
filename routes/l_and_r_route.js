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
    res.render("login.ejs")
})

router.post('/loading', checkNotAuthenticated, (req, res) => {
    console.log("i am in post.login");
    console.log(req.body.email);
    console.log(req.body.password);
    var sql="select * from user_information where email = '"+req.body.email+"'";
    console.log(sql);
    connection.query(sql, function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            res.cookie('c', result[0].user_id);
            res.cookie('nickname', result[0].nickname);
            console.log("in: "+req.cookies.c);
            res.render('loading', {email: req.body.email, password: req.body.password});
         });
    console.log("out: "+req.cookies.c);
    //res.render('loading', {email: req.body.email, password: req.body.email});
})

router.get('/logincheck', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/index',
    failureRedirect: '/login-system/login',
    failureFlash: true
}))

/*router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/index',
    failureRedirect: '/login-system/login',
    failureFlash: true
}))*/

// -------------------------------------------------logout -------------------------------------------------
router.delete('/logout', (req, res) => {
    res.cookie('c', 'guest');
    res.cookie('nickname', 'guest');
    req.logOut()
    res.redirect('/index')
})

// -------------------------------------------------Authenticate Functions -------------------------------------------------
function checkAuthenticated(req, res, next) {//login先可以入url

    if (req.isAuthenticated()) {
        return next()
    }
    
    res.redirect('/login-system/login')
}

function checkNotAuthenticated(req, res, next) {
    
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    
    next()
}

module.exports = router;
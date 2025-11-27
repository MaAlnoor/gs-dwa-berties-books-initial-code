// Create a new router
const express = require("express")
const router = express.Router()
const bcrypt = require('bcrypt')
const { check, validationResult } = require('express-validator');


const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('../users/login') // redirect to the login page
    } else { 
        next (); // move to the next middleware function
    } 
}

router.get('/register', function (req, res, next) {
    res.render('register.ejs')
})

router.post('/registered', [
    check('first').notEmpty(),
    check('last').notEmpty(),
    check('username').isLength({ min: 5, max: 20 }),
    check('email').notEmpty().isEmail(),
    check('password').isLength({ min: 8 })
], function (req, res, next) 
{

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('./register')
    }
    else { 
        const saltRounds = 10
        const plainPassword = req.body.password

        // Check if username or email already exists
        let checkQuery = "SELECT * FROM users WHERE username = ? OR email = ?";
        db.query(checkQuery, [req.body.username, req.body.email], function (err, results) {
            if (err) {
                next(err)
            }
            else if (results.length > 0) {
                res.send("Username or email already exists. Please choose another.")
            }
            else {
                // If not existing, hash password and insert
                bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
                    if (err) {
                        next(err)
                    }

                    let sqlquery = "INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?,?,?,?,?)";
                    let newrecord = [
                        req.sanitize(req.body.username),
                        req.sanitize(req.body.first),
                        req.sanitize(req.body.last),
                        req.body.email,
                        hashedPassword
                    ];

                    db.query(sqlquery, newrecord, (err, result) => {
                        if (err) {
                            next(err)
                        }
                        else {
                            res.send(' Hello ' + req.sanitize(req.body.first) + ' ' + req.sanitize(req.body.last) +
                                    ', you are now registered! We will send an email to ' +
                                    req.body.email)
                        }
                    })
                })
            }
        }) 
    }

    // saving data in database
}); 

router.get('/login', function (req, res, next) {
    res.render('login.ejs')
})



router.post('/loggedin', [
    check('username').notEmpty().trim().escape(),
    check('password').notEmpty()
], function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('./login')
    }
    else { 
        let sqlquery = "SELECT * FROM users WHERE username = ?"
        db.query(sqlquery, [req.body.username], (err, results) => {
            if (err) {
                next(err)
            }
            else if (results.length === 0) {

                // Log failed login: username does not exist
                let auditFail = "INSERT INTO audit_log (username, status) VALUES (?, ?)"
                db.query(auditFail, [req.body.username, "FAIL"], () => {})

                res.send("Invalid username or password.")
            }
            else {

                let hashedPassword = results[0].hashedPassword

                bcrypt.compare(req.body.password, hashedPassword, function(err, result) {
                    if (err) {
                        res.send("An error occurred.")
                    }

                    else if (result == true) {
                        // Save user session here, when login is successful
                        req.session.userId = req.body.username;

                        // Log successful login
                        let auditSuccess = "INSERT INTO audit_log (username, status) VALUES (?, ?)"
                        db.query(auditSuccess, [req.body.username, "SUCCESS"], () => {})

                        res.send("Welcome back " + results[0].first_name + " " + results[0].last_name + "!")
                    }
                    else {

                        // Log failed login: bad password
                        let auditFail = "INSERT INTO audit_log (username, status) VALUES (?, ?)"
                        db.query(auditFail, [req.body.username, "FAIL"], () => {})

                        res.send("Invalid username or password.")
                    }
                })
            }
        })
    }
    
});

router.get('/audit', redirectLogin, function (req, res, next) {
    let sqlquery = "SELECT * FROM audit_log"

    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        else {
            res.render('audit.ejs', { auditLog: result })
        }
    })
})


// Export the router object so index.js can access it
module.exports = router;
module.exports.redirectLogin = redirectLogin;

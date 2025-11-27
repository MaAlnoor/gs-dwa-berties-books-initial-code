// Create a new router
const express = require("express")
const router = express.Router()
const users = require('./users');
const redirectLogin = users.redirectLogin;
const { check, validationResult } = require('express-validator');

// Handle our routes
router.get('/',function(req, res, next){
    res.render('index.ejs')
});

router.get('/about',function(req, res, next){
    res.render('about.ejs')
});

router.get('/addbook', redirectLogin, function(req, res, next) {
    res.render("addbook.ejs")
});


router.post('/bookadded', [
    check('name').notEmpty().trim().escape(),
    check('price').notEmpty().isFloat({ min: 0.01 })
], function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('./addbook')
    }
    else { 
        // saving data in database
        let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)"
        // execute sql query
        let newrecord = [req.sanitize(req.body.name), req.body.price]
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
                next(err)
            }
            else
                res.send(' This book is added to database, name: '+ req.body.name + ' price '+ req.body.price)
        })
    }
});


router.get('/logout', redirectLogin, (req,res) => {
    req.session.destroy(err => {
    if (err) {
      return res.redirect('./')
    }
    res.send('you are now logged out. <a href='+'./'+'>Home</a>');
    })
})

// Export the router object so index.js can access it
module.exports = router
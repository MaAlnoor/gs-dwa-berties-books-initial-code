// Create a new router
const express = require("express")
const router = express.Router()
const users = require('./users');
const redirectLogin = users.redirectLogin;
const { check, validationResult } = require('express-validator');
const request = require('request');

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

router.get('/weather', (req,res) => {
    let apiKey = '81bc15c09c64c7cac3b07e81efb12bc5'
    let city = req.query.city || 'london'
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
                     
    request(url, function (err, response, body) {
        if(err){
            next(err)
        } else {
            //res.send(body)
            var weather = JSON.parse(body)

            if (weather!==undefined && weather.main!==undefined) {
                var wmsg =
                '<!doctype html>' +
                '<html>' +
                '  <head>' +
                '    <title>Weather now</title>' +
                '    <link rel="stylesheet" type="text/css" href="/main.css" />' +
                '  </head>' +
                '  <body>' +
                '    <h1>Weather now</h1>' +
                '    <p>City: ' + weather.name + '</p>' +
                '    <p>Temperature: ' + weather.main.temp + '&deg;C</p>' +
                (weather.weather && weather.weather[0]
                    ? '    <p>Condition: ' + weather.weather[0].description + '</p>'
                    : '') +
                '    <p>Humidity: ' + weather.main.humidity + '%</p>' +
                '    <p>Wind speed: ' + weather.wind.speed + ' m/s</p>' +
                '    <p>Wind direction: ' + weather.wind.deg + '&deg;</p>' +
                '    <h2>Change city</h2>' +
                '    <form method="get" action="/weather">' +
                '      <p>City: <input type="text" name="city" value="' + city + '" /></p>' +
                '      <input type="submit" value="Get weather" />' +
                '    </form>' +
                '  </body>' +
                '</html>'

                res.send(wmsg);
            }
            else {
                res.send ("No data found");
            }
        } 
    });
})

// Export the router object so index.js can access it
module.exports = router
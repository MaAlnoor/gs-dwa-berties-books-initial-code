// Create a new router
const express = require("express")
const router = express.Router()

router.get('/books', function (req, res, next) {

    // Query database to get all the books
    // base query
    let sqlquery = "SELECT * FROM books"
    let conditions = []

    if (req.query.search) {
        let search = req.query.search
        conditions.push("name LIKE '%" + search + "%'")
    }

    if (req.query.minprice) {
        let min = parseFloat(req.query.minprice)
        if (!isNaN(min)) {
            conditions.push("price >= " + min)
        }
    }

    if (req.query.max_price) {
        let max = parseFloat(req.query.max_price)
        if (!isNaN(max)) {
            conditions.push("price <= " + max)
        }
    }

    if (conditions.length > 0) {
        sqlquery += " WHERE " + conditions.join(" AND ")
    }

    if (req.query.sort === 'name') {
        sqlquery += " ORDER BY name"
    } else if (req.query.sort === 'price') {
        sqlquery += " ORDER BY price"
    }

    // Execute the sql query
    db.query(sqlquery, (err, result) => {
        // Return results as a JSON object
        if (err) {
            res.json(err)
            next(err)
        }
        else {
            res.json(result)
        }
    })
})

// Export the router object so index.js can access it
module.exports = router

# Berties Books

Sample code for Dynamic Web Applications module.

Uses node.js with Express and EJS.

To install and run:

npm install
node index.js


# Dotenv

Install dotenv:

npm install dotenv


Create a .env file in the project root and add the database configuration:

DB_HOST=localhost
DB_USER=berties_books_app
DB_PASSWORD=your_password_here
DB_NAME=berties_books


Add .env to .gitignore so it is never committed to GitHub.

In index.js, dotenv is loaded using:

require('dotenv').config();


All database credentials are now accessed securely using:

process.env.DB_HOST
process.env.DB_USER
process.env.DB_PASSWORD
process.env.DB_NAME

# Audit

An audit logging feature was added to track all login attempts in the application. A new database table named audit_log was created to store the username, whether the attempt was successful or failed, and the time of the attempt. The login route was updated so that every successful login inserts a record with a status of "SUCCESS", and every failed login inserts a record with "FAIL".

A new route /users/audit was implemented to retrieve all the audit entries from the database and display them in a table using the audit.ejs view. This allows administrators to view the full history of login activity, including repeated failed attempts or suspicious behaviour.


I added access control to the search page, audit page, bargain books page, and add-book page so only logged-in users can access them. The About and Register pages remain public because users can not log in if they are not registered and new users would want to see what the website is about. Testing confirmed that protected pages redirect unauthenticated users to the login page, while logged-in users can access them normally.


I added server-side validation to the pages where users submit information, such as the registration form, login form and the book-adding page. These checks make sure users enter valid details — for example, the username has the right length, the email is valid, the password is at least 8 characters, and book details are filled in properly. I didn’t add validation to simple pages like the About page or pages that don’t take any user input, such as the book list or bargain books. The goal was to ensure the important forms are safe and reliable without overcomplicating the rest of the site.

I added sanitisation to all free-text fields on the registration form, including the first name, last name, and username fields, to protect the site from XSS attacks and ensure that no harmful HTML or script code can be submitted. I did not apply sanitisation to the email or password fields; the email is validated separately using express-validator, and passwords must not be modified before hashing. This approach protects user input where necessary without breaking important fields that rely on exact values.

I added sanitisation to any part of the site where users can submit free-text input, such as the registration form (first name, last name, username), the add-book form (book name). These fields could otherwise be used to inject HTML or JavaScript, so sanitisation helps protect against XSS attacks. I did not sanitise fields like passwords, emails, prices, or system values, because these need to stay unchanged for hashing, validation, or database accuracy. Only the fields that present an actual XSS risk were sanitised.

I added a weather feature at /weather/now that uses the OpenWeatherMap API to show the current temperature, humidity and wind information for a chosen city, with a text box that lets the user change the city and reload the data. 

I also a JSON books API at /api/books, which returns all books by default but supports optional query parameters: search to filter books by title (for example http://localhost:8000/api/books?search=world), minprice and max_price to filter by a price range (for example http://localhost:8000/api/books?minprice=5&max_price=10), and sort to sort the results by name or price (for example http://localhost:8000/api/books?sort=price).
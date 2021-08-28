import express from "express";
import exphbs from "express-handlebars";
import mysql from "mysql";
import { v4 as genGuid } from "uuid";

const PORT = process.env.PORT || 3000;
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "secret";
const DB_NAME = process.env.DB_NAME || "restu_db";

const app = express();
var hbs = exphbs.create({
});

// Connect to DB
console.log("connecting to db")
var connection = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
});
var attempt = 0;
function tryConnect() {

    attempt++;
    console.log("Attempt " + attempt);

    connection.connect((error) => {
        if (error) {
            console.error(error.stack)
            setTimeout(tryConnect, 5000);
            return;
        }
    });
}

tryConnect();

// Set up DB Tables
connection.query(
    `
CREATE TABLE IF NOT EXISTS restuarants (
    restuarant_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);
`
);

connection.query(`
INSERT IGNORE INTO restuarants (restuarant_id, name)
VALUES(1, 'Vad jobbar du med? Köra bil.');
`);

connection.query(`
SELECT * FROM restuarants;
`, (error, results, fields) => {
    console.log(results);
})


// Set template engine
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars")
app.set("views", "src/views")
// define a route handler for the default home page
app.get("/home", (_, res) => {
    connection.query(`SELECT * FROM restuarants;`,
        (error, results, _fields) => {
            if (results !== undefined) {
                res.render('home', {
                    restuarants: results.map((x: any) => x.name),
                });
            } else {
                res.render("error", { error: error })
            }
        })
});

app.get("/home/add", (req, res) => {
    const guid = genGuid();
    connection.query(`INSERT INTO restuarants (name) VALUES (?)`, [guid],
        (error, results, _fields) => {
            if (error) {
                res.render("error", { error: error })
            } else {
                res.render('add', {
                    name: guid,
                })
            }
        })
})

// start the Express server
app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`server started at http://localhost:${PORT}`);
});
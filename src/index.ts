
import express from "express";
import exphbs from "express-handlebars";
import { v4 as guid } from "uuid";
import { createSqlClient } from "./repositories/SqlClient.js";
import { createUserRepository } from "./repositories/userRepository.js";

const PORT = process.env.PORT || 3000;

const app = express();
var hbs = exphbs.create({
});

// Connect to DB
const sqlClient = await createSqlClient();

const userRepository = createUserRepository(sqlClient);
await userRepository.createUser(guid(), guid(), "Mr Bean");

// Set template engine
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars")
app.set("views", "src/views")
// define a route handler for the default home page
app.get("/home", async (_, res) => {
    const { result, error } = await sqlClient.query(`SELECT * FROM users;`);
    if (result !== undefined) {
        res.render('home', {
            restuarants: JSON.stringify(
                (result as any)
            ),
        });
    } else {
        res.render("error", { error })
    }
});


// start the Express server
app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`server started at http://localhost:${PORT}`);
});
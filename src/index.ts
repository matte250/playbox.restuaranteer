
import express from "express";
import exphbs from "express-handlebars";
import { createSqlClient } from "./SqlClient.js";
import connectLiveReload from "connect-livereload";
import livereload from "livereload";
import { createRouter } from "./createRouter.js";
import { globalControllers } from "./controllers.js";

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || "development";

const app = express();

var hbs = exphbs.create({
});

// Use live reload
if (ENV == "development") {
    app.use(connectLiveReload())
    const liveReloadServer = livereload.createServer();
    liveReloadServer.server.once("connection", () => {
        setTimeout(() => {
            liveReloadServer.refresh("/");
        }, 100);
    });
}

// Connect to DB
const sqlClient = await createSqlClient();

// Set template engine
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars")
app.set("views", "src/views")

app.use(express.json());
app.use(express.urlencoded());


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
// Register and map controllers to routes
var router = createRouter(globalControllers);
app.use("/", router)


// start the Express server
app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`server started at http://localhost:${PORT}`);
});
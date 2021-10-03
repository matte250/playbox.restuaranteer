
import express, { NextFunction, Response } from "express";
import exphbs from "express-handlebars";
import { createSqlClient } from "./SqlClient.js";
import connectLiveReload from "connect-livereload";
import livereload from "livereload";
import { createRouter } from "./createRouter.js";
import { createAuthController } from "./services/auth/controller.js";
import { createAuthRepository } from "./services/auth/respository.js";
import { createPlacesRepository } from "./services/places/respository.js";
import { createExperiencesController } from "./services/experiences/controller.js";
import { createExperiencesRepository } from "./services/experiences/respository.js"
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { IRequest } from "./types";
import { createPlacesController } from "./services/places/controller.js";
import { createReviewsRepository } from "./services/reviews/respository.js";
import { createReviewsController } from "./services/reviews/controller.js"
import { ENV, PORT, ACCESS_TOKEN_SECRET, DB_PASSWORD, DB_HOST } from "./env.js";

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

app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded());

// Setup Authentication
const authenticate = (req: IRequest, res: Response, next: NextFunction) => {
    req.context = {};
    const token = req?.cookies?.["jwt"] ?? null
    if (token == null) return next();

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err: any, user: typeof req.context.user) => {
        if(user !== undefined){
            res.locals.user = user;
            req.context.user = user;
        }
        
    })
    return next();
}

app.use(authenticate)

// Create repositories and inject dependencies
var authRepo = createAuthRepository(sqlClient)
var placesRepo = createPlacesRepository(sqlClient)
var experiencesRepo = createExperiencesRepository(sqlClient)
var reviewsRepo = createReviewsRepository(sqlClient)
// Create controllers and inject dependencies
var controllers = [
    ...createAuthController(authRepo),
    ...createPlacesController(placesRepo),
    ...createExperiencesController(experiencesRepo, placesRepo),
    ...createReviewsController(reviewsRepo, placesRepo, experiencesRepo)
]
// Register and map controllers to routes
var router = createRouter(controllers);
app.use("/", router)

// define a route handler for the default home page
app.get("/home", async (_, res) => {
    const { type, obj } = await authRepo.fetchAllUsers() 
    if (obj !== undefined) {
        res.render('home', {
            restuarants: JSON.stringify(
                (obj as any)
            ),
        });
    }
});

// start the Express server
app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`server started at http://localhost:${PORT}`);
});
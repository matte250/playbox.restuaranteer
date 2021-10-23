import express, { NextFunction, Response } from 'express';
import exphbs from 'express-handlebars';
import connectLiveReload from 'connect-livereload';
import livereload from 'livereload';
import { createRouter } from './createRouter';
import { createAuthController } from './services/auth/controller';
import { createAuthRepository } from './services/auth/respository';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { IRequest } from './types';
import { ENV, PORT, ACCESS_TOKEN_SECRET, DB_PASSWORD, DB_HOST } from './env';
import { PrismaClient } from '.prisma/client';
import { createAuthService } from './services/auth/service';

const app = express();

const hbs = exphbs.create({});

// Use live reload
if (ENV == 'development') {
	app.use(connectLiveReload());
	const liveReloadServer = livereload.createServer();
	liveReloadServer.server.once('connection', () => {
		setTimeout(() => {
			liveReloadServer.refresh('/');
		}, 100);
	});
}

// Connect to DB
const prisma = new PrismaClient();

// Set template engine
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', 'src/views');

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded());

// Setup Authentication
const authenticate = (req: IRequest, res: Response, next: NextFunction) => {
	req.context = {};
	const token = req?.cookies?.['jwt'] ?? null;
	if (token == null) return next();

	jwt.verify(
		token,
		ACCESS_TOKEN_SECRET,
		(err: any, user: typeof req.context.user) => {
			if (user !== undefined) {
				res.locals.user = user;
				req.context.user = user;
			}
		},
	);

	return next();
};

app.use(authenticate);

// Create repositories and inject dependencies
const authRepo = createAuthRepository(prisma);
// Create services and inject dependencies
const authService = createAuthService(authRepo);
// Create controllers and inject dependencies
const controllers = [createAuthController(authService)];
// Register and map controllers to routes
const router = createRouter(controllers);
app.use('/', router);

// define a route handler for the default home page
app.get('/home', async (_, res) => {
	const users = await authService.getUsers();
	res.render('home', {
		restuarants: JSON.stringify(users),
	});
});

// start the Express server
app.listen(Number(PORT), '0.0.0.0', () => {
	console.log(`server started at http://localhost:${PORT}`);
});

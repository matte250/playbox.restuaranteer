import express, { NextFunction, request, Response } from 'express';
import { createAuthController } from './services/auth/controller';
import { createAuthRepository } from './services/auth/repository';
import cookieParser from 'cookie-parser';
import { IRequest } from './types';
import { PORT } from './env';
import { PrismaClient } from '.prisma/client';
import { createAuthService } from './services/auth/service';
import { createRouter } from './router/createRouter';
import cors from 'cors';

const app = express();
// Connect to DB
const prisma = new PrismaClient();

// Set template engine
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded());

app.use(
	cors({
		origin: '*',
	}),
);

// Setup Authentication(This does nothing atm)
const authenticate = (req: IRequest, res: Response, next: NextFunction) => {
	req.context = {};
	const token = req?.cookies?.['jwt'] ?? null;
	if (token == null) return next();

	return next();
};

app.use(authenticate as any);

// Create repositories and inject dependencies
const authRepo = createAuthRepository(prisma);
// Create services and inject dependencies
const authService = createAuthService(authRepo);
// Create controllers and inject dependencies
const controllers = [createAuthController(authService)];
// Register and map controllers to routes
const router = createRouter(controllers);

app.use('/', router);

// start the Express server
app.listen(Number(PORT), '0.0.0.0', () => {
	console.log(`server started at http://localhost:${PORT}`);
});

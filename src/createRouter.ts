import express, { Response } from 'express';
import { IRequest } from './types';
type ControllerFunction = (req: IRequest, res: Response) => void;

type Controllers = Controller[];

export type Controller = {
	domain: string;
	version: number;
	routes: Array<{
		path: string;
		httpMethod: HttpMethod;
		func: ControllerFunction;
	}>;
};

export type HttpMethod = 'get' | 'post' | 'put' | 'delete';

export const createRouter = (controllers: Controllers) => {
	const router = express.Router();
	controllers.forEach((controller) => {
		controller.routes.forEach((route) => {
			router[route.httpMethod](
				`/${controller.domain}/v${controller.version}/${route.path}`,
				route.func,
			);
		});
	});

	return router;
};

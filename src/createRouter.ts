import express, { Response } from 'express';
import { IRequest } from './types';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

interface IResponse<T = never> {
	readonly statusCode: StatusCodes;
	readonly response?: T;
}

export class Ok<T = never> implements IResponse<T> {
	readonly statusCode = StatusCodes.OK;
	constructor(readonly response?: T) {}
}

export class Conflict<T = never> implements IResponse<T> {
	readonly statusCode = StatusCodes.CONFLICT;
	constructor(readonly response?: T) {}
}

type Controllers = Controller<{ [key: string]: any }>[];

export type Controller<T extends Record<string, unknown>> = {
	domain: string;
	version: number;
	routes: { [Key in keyof T]: Route<T[Key]> };
};

interface RequestMap<T> {
	(arg: {
		body: Record<string, unknown>;
		query: Record<string, unknown>;
		param: Record<string, unknown>;
	}): T;
}

export type Route<T> = {
	path: string;
	httpMethod: HttpMethod;
	response: (
		request: T,
	) => Promise<IResponse<never>> | Promise<IResponse<unknown>>;
	requestMap: RequestMap<T>;
};

export type HttpMethod = 'get' | 'post' | 'put' | 'delete';

const createRequestFunction =
	<T>(route: Route<T>) =>
	async (req: IRequest, res: Response) => {
		let mappedRequest: T;

		try {
			mappedRequest = route.requestMap({
				body: req.body as Record<string, unknown>,
				param: req.params as Record<string, unknown>,
				query: req.query as Record<string, unknown>,
			});
		} catch (ex: unknown) {
			if (ex instanceof TypeError)
				return res
					.status(400)
					.json({ error: { type: ex.name, msg: ex.message } });
			else throw ex;
		}

		let response: IResponse<unknown>;

		try {
			response = await route.response(mappedRequest);
		} catch (ex) {
			if (ex instanceof Error)
				return res
					.status(500)
					.json({ error: { type: ex.name ?? '', msg: ex.message } });
			else return res.status(500).json(ex);
		}

		res.status(response.statusCode);
		if (response.response !== undefined)
			return res.json({ result: response.response });
		else return res.json(getReasonPhrase(response.statusCode));
	};

export const createRouter = (controllers: Controllers) => {
	const router = express.Router();
	controllers.forEach((controller) => {
		Object.keys(controller.routes).forEach((key) => {
			const route = controller.routes[key];
			router[route.httpMethod](
				`/${controller.domain}/v${controller.version}/${route.path}`,
				createRequestFunction(route) as any,
			);
		});
	});

	return router;
};

import express, { Response } from 'express';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import { IRequest } from '../types';
import { IResponse } from './responseTypes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Controllers = Controller<Record<string, any>>[];

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
} & (
	| {
			response: () =>
				| Promise<IResponse<never>>
				| Promise<IResponse<unknown>>;
	  }
	| {
			response: (
				request: T,
			) => Promise<IResponse<never>> | Promise<IResponse<unknown>>;
			requestMap: RequestMap<T>;
	  }
);

export type HttpMethod = 'get' | 'post' | 'put' | 'delete';

export const createRequestFunction =
	<T>(route: Route<T>) =>
	async (req: IRequest, res: Response) => {
		let requestFunc: () =>
			| Promise<IResponse<never>>
			| Promise<IResponse<unknown>>;
		let mappedRequest: T;

		if ('requestMap' in route) {
			try {
				mappedRequest = route.requestMap({
					body: req.body as Record<string, unknown>,
					param: req.params as Record<string, unknown>,
					query: req.query as Record<string, unknown>,
				});
				requestFunc = route.response.bind(null, mappedRequest);
			} catch (ex: unknown) {
				if (ex instanceof TypeError)
					return res
						.status(StatusCodes.BAD_REQUEST)
						.json({ error: { type: ex.name, msg: ex.message } });
				else
					return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
						error:
							ex instanceof Error
								? { type: ex.name, msg: ex.message }
								: ex,
					});
			}
		} else {
			requestFunc = route.response;
		}

		let result: IResponse<unknown>;

		try {
			result = await requestFunc();
		} catch (ex) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				error:
					ex instanceof Error
						? { type: ex.name, msg: ex.message }
						: ex,
			});
		}

		res.status(result.statusCode);
		if (result.response !== undefined)
			return res.json({ result: result.response });
		else return res.json(getReasonPhrase(result.statusCode));
	};

export const createRouter = (controllers: Controllers) => {
	const router = express.Router();
	controllers.forEach((controller) => {
		Object.keys(controller.routes).forEach((key) => {
			const route = controller.routes[key];
			router[route.httpMethod](
				`/${controller.domain}/v${controller.version}/${route.path}`,
				createRequestFunction(route) as any, // It does not like IRequest, it wants request instead even tho it is a lie,
			);
		});
	});

	return router;
};

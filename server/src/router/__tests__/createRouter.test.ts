import {
	Controller,
	createRequestFunction,
	createRouter,
	HttpMethod,
} from '../createRouter';
import { Ok } from '../responseTypes';
import { mockDeep } from 'jest-mock-extended';
import { IRequest } from '../../types';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { MockResponse, mockResponse } from '../../mocks/responseMock';

const fakeReq = mockDeep<IRequest>();
let mockRes: MockResponse;
beforeEach(() => {
	mockRes = mockResponse();
});

const fakeController = (): Controller => ({
	domain: 'test',
	version: 1,
	routes: {
		testGet: {
			path: 'test1',
			httpMethod: 'get',
			requestMap: () => ({
				value: 'test',
			}),
			response: async ({ value }) => {
				return new Ok(value);
			},
		},
		testPost: {
			path: 'test2',
			httpMethod: 'post',
			response: async () => {
				return new Ok();
			},
		},
		testPut: {
			path: 'test3',
			httpMethod: 'put',
			response: async () => new Ok(),
		},
	},
});

describe('createRouter()', () => {
	it('returns a router that contains endpoints with correct paths({domain}/v{version}/{path})', () => {
		const router = createRouter([fakeController()]);

		const routes = router.stack.map((x) => ({
			path: x.route.path as string,
			method: x.route.stack[0].method as HttpMethod,
		}));

		expect(routes.length).toBe(3);
		expect(routes).toStrictEqual(
			expect.arrayContaining([
				{ path: '/test/v1/test1', method: 'get' },
				{ path: '/test/v1/test2', method: 'post' },
				{ path: '/test/v1/test3', method: 'put' },
			]),
		);
	});
});

describe('createRequestFunction() => requestFunction()', () => {
	it('responds with status 500 and expection given response throws an error', async () => {
		const requestFunction = createRequestFunction({
			httpMethod: 'get',
			path: '',
			response: async () => {
				throw new Error('test error');
			},
		});
		await requestFunction(fakeReq, mockRes);

		expect(mockRes.status).toHaveBeenCalledTimes(1);
		expect(mockRes.status).toHaveBeenCalledWith(
			StatusCodes.INTERNAL_SERVER_ERROR,
		);

		expect(mockRes.json).toHaveBeenCalledTimes(1);
		expect(mockRes.json).toHaveBeenCalledWith({
			error: { type: 'Error', msg: 'test error' },
		});
	});

	it('responds with status 500 and expection given response throws an unknown expection', async () => {
		const requestFunction = createRequestFunction({
			httpMethod: 'get',
			path: '',
			response: async () => {
				throw { test: 'test' };
			},
		});
		await requestFunction(fakeReq, mockRes);

		expect(mockRes.status).toHaveBeenCalledTimes(1);
		expect(mockRes.status).toHaveBeenCalledWith(
			StatusCodes.INTERNAL_SERVER_ERROR,
		);

		expect(mockRes.json).toHaveBeenCalledTimes(1);
		expect(mockRes.json).toHaveBeenCalledWith({
			error: { test: 'test' },
		});
	});

	it('responds with status 400 and error given a route with a requestMap that throws a TypeError', async () => {
		const requestFunction = createRequestFunction({
			httpMethod: 'get',
			path: '',
			requestMap: () => {
				throw new TypeError('test');
			},
			response: async () => new Ok(),
		});
		await requestFunction(fakeReq, mockRes);

		expect(mockRes.status).toHaveBeenCalledTimes(1);
		expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);

		expect(mockRes.json).toHaveBeenCalledTimes(1);
		expect(mockRes.json).toHaveBeenCalledWith({
			error: { type: 'TypeError', msg: 'test' },
		});
	});

	it('responds with status 500 and error given a route with a requestMap that throws an error(Not TypeError)', async () => {
		const requestFunction = createRequestFunction({
			httpMethod: 'get',
			path: '',
			requestMap: () => {
				throw new Error('test');
			},
			response: async () => new Ok(),
		});
		await requestFunction(fakeReq, mockRes);

		expect(mockRes.status).toHaveBeenCalledTimes(1);
		expect(mockRes.status).toHaveBeenCalledWith(
			StatusCodes.INTERNAL_SERVER_ERROR,
		);

		expect(mockRes.json).toHaveBeenCalledTimes(1);
		expect(mockRes.json).toHaveBeenCalledWith({
			error: { type: 'Error', msg: 'test' },
		});
	});

	it('responds with status 200 and OK and error given a route with a response that returns OK', async () => {
		const requestFunction = createRequestFunction({
			httpMethod: 'get',
			path: '',
			response: async () => new Ok(),
		});
		await requestFunction(fakeReq, mockRes);

		expect(mockRes.status).toHaveBeenCalledTimes(1);
		expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);

		expect(mockRes.json).toHaveBeenCalledTimes(1);
		expect(mockRes.json).toHaveBeenCalledWith(
			getReasonPhrase(StatusCodes.OK),
		);
	});
	it('responds with status 200 and string and error given a route with a requestMap and response that returns OK(string)', async () => {
		const requestFunction = createRequestFunction({
			httpMethod: 'get',
			path: '',
			requestMap: () => 'test',
			response: async (request) => new Ok(request),
		});
		await requestFunction(fakeReq, mockRes);

		expect(mockRes.status).toHaveBeenCalledTimes(1);
		expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);

		expect(mockRes.json).toHaveBeenCalledTimes(1);
		expect(mockRes.json).toHaveBeenCalledWith({
			result: 'test',
		});
	});
});

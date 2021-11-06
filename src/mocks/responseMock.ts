import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { Response } from 'express';

export const mockResponse = () => {
	const mock = mockDeep<Response>() as DeepMockProxy<Response>;
	mock.status.mockReturnValue(mock);
	return mock;
};

export type MockResponse = DeepMockProxy<Response>;

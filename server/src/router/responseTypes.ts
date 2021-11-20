import { StatusCodes } from 'http-status-codes';

export interface IResponse<T = never> {
	readonly statusCode: StatusCodes;
	readonly response?: T;
}

export class Ok<T = never> implements IResponse<T> {
	readonly statusCode = StatusCodes.OK;
	constructor(readonly response?: T) {}
}

export class NotFound<T = never> implements IResponse<T> {
	readonly statusCode = StatusCodes.NOT_FOUND;
	constructor(readonly response?: T) {}
}

export class Conflict<T = never> implements IResponse<T> {
	readonly statusCode = StatusCodes.CONFLICT;
	constructor(readonly response?: T) {}
}

export class NotImplemented<T = never> implements IResponse<T> {
	readonly statusCode = StatusCodes.NOT_IMPLEMENTED;
	constructor(readonly response?: T) {}
}

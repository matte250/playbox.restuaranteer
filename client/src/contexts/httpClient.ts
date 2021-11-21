import { StatusCodes } from 'http-status-codes';
import { getContext, setContext } from 'svelte';

export class HttpClient {
	private readonly baseUrl = process.env.API_URL ?? '';
	token = '';
	setToken(token: string) {
		this.token = token;
	}

	private async sendRequest(
		path: string,
		method: 'get' | 'post',
		data?: { body: any },
	) {
		const response = await fetch(`${this.baseUrl}/api${path}`, {
			body: data?.body ? JSON.stringify(data.body) : undefined,
			headers: new Headers({
				'Content-Type': 'application/json',
				Authorization: this.token ? `Bearer ${this.token}` : '',
			}),
			method,
		});
		const json = await response.json();
		return new HttpResponse(
			response.status,
			response.status === StatusCodes.OK,
			json,
		);
	}

	post(path: string, data?: { body: any }) {
		return this.sendRequest(path, 'post', data);
	}
	get(path: string, data?: { body: any }) {
		return this.sendRequest(path, 'get', data);
	}
}

export class HttpResponse {
	constructor(
		readonly statusCode: StatusCodes,
		readonly success: boolean,
		readonly data: any,
	) {}
}

const httpClientKey = {};

export const setHttpClient = (httpClient: HttpClient) =>
	setContext(httpClientKey, httpClient);
export const useHttpClient = () => getContext<HttpClient>(httpClientKey);

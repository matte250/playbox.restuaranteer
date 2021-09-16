import { Request } from "express"

export interface IRequest extends Request {
    context: {
        user?: {
            email: string,
            id: string,
            name: string,
        }
    }
}
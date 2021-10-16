
import express, { Router, IRouterMatcher, Request, Response } from "express"
import { IRequest } from "./types";
type ControllerFunction = (req: IRequest, res: Response) => void;

export type Controllers = Controller[];
export type Controller = {
    path: string,
    get?: ControllerFunction,
    post?: ControllerFunction,
    put?: ControllerFunction,
    delete?: ControllerFunction,
};

type HttpMethod = "get" | "post" | "put" | "delete";
const httpMethodsToMatch: HttpMethod[] = ["get", "post", "put", "delete"];

export const createRouter = (controllers: Controllers) => {
    var router = express.Router()
    controllers.forEach(x => 
        httpMethodsToMatch.forEach(httpMethod => {
            const controllerFunction = x[httpMethod];
            if(!controllerFunction)
                return;
            router[httpMethod](x.path, controllerFunction)
        })
    )
    return router;
}
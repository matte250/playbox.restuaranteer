
import express, { Router, IRouterMatcher, Request, Response } from "express"
type ControllerFunction = (req: Request, res: Response) => void;

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

const matchControllerToHttpMethod = (router: Router, path: string, conntrollerFunction: ControllerFunction, routerMatcher: IRouterMatcher<Router>, method: HttpMethod) => {
    if (conntrollerFunction !== undefined) 
        router[method](path, conntrollerFunction)
}

export const createRouter = (controllers: Controllers) => {
    var router = express.Router()
    controllers.forEach(x => httpMethodsToMatch.forEach(httpMethod => matchControllerToHttpMethod(router, x.path, x[httpMethod], router[httpMethod], httpMethod)))
    return router;
}
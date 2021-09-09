type RouteFunc = (req: Express.Request, res: Express.Response) => void;
type RouteProviders = RouteProvider[];
interface RouteProvider {
    path: string,
    get: RouteFunc,
    post: RouteFunc,
    put: RouteFunc,
    delete: RouteFunc,
};
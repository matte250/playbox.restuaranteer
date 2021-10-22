import { Controller } from "../../createRouter.js"
import { validate, IValidationDef } from "../../validation/validator.js"
import { validators } from "../../validation/validators.js"
import { IAuthService } from "./service.js"

const registerValidationDef: IValidationDef = {
    email: {
        $req: true,
        $lbl: "Email",
        $: validators.isEmail,
    },
    name: {
        $req: true,
        $lbl: "Name",
    },
    password: {
        $req: true,
        $lbl: "Password",
        $: validators.isPassword,
    },
}

const loginValidationDef: IValidationDef = {
    email: {
        $req: true,
        $lbl: "Email",
        $: validators.isEmail,
    },
    password: {
        $req: true,
        $lbl: "Password",
        $: validators.isPassword,
    },
}

export const createAuthController = (service: IAuthService): Controller => ({
    domain: "auth",
    version: 1,
    routes: [
        {
            httpMethod: "post",
            path: "register",
            func: async (req, res) => {
                const errors = validate(req.body, registerValidationDef).onlyMsg()
                const { email = "", name = "", password = "" } = { ...req.body };
                if (errors.length > 0)
                    return res.status(400);

                var msg = await service.createUser(email, password, name)
                if (msg == "email-already-in-use")
                    return res.status(409)

                return res.status(200)
            }
        },
        {
            httpMethod: "post",
            path: "login",
            func: async (req, res) => {
                const errors = validate(req.body, loginValidationDef).onlyMsg()
                const { email = "", password = "" } = req.body;
                if (errors.length > 0)
                    return res.status(400);

                const result = await service.signIn(email, password);
                if (result.msg === "sign-in-failed")
                    return res.status(409);

                res.setHeader("Authorization", "Bearer " + result.cookie)
                res.cookie("jwt", result.cookie)
                return res.json(result.cookie)
            }
        },
        {
            httpMethod: "post",
            path: "logout",
            func: async (req, res) => {
                if (req.context.user === undefined)
                    return res.status(401)
                res.clearCookie("jwt")
                res.locals.user = undefined
                req.context.user = undefined 
                return res.status(200)
            },
        }
    ]
})
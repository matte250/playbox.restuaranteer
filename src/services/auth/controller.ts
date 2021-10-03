import { Controllers } from "../../createRouter.js"
import { validate, IValidationDef } from "../../validation/validator.js"
import { validators } from "../../validation/validators.js"
import { IAuthRepo } from "./respository.js"
import jwt from "jsonwebtoken"
import { ACCESS_TOKEN_SECRET } from "../../env.js"

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



export const createAuthController = (repo: IAuthRepo): Controllers => (
    [
        {
            path: "/register",
            get: (_, res) => res.render("register"),
            post: async (req, res) => {
                const errors = validate(req.body, registerValidationDef).onlyMsg()
                const { email = "", name = "", password = "" } = { ...req.body };
                if (errors.length > 0)
                    return res.render("register", {
                        errors,
                        email,
                        name
                    })

                var { type } = await repo.createUser(email, password, name)
                if (type == "userexists")
                    return res.render("register", {
                        errors: ["There is already an user with that email"],
                        name,
                    })

                res.redirect("home")
            },
        },
        {
            path: "/login",
            get: (_, res) => res.render("login"),
            post: async (req, res) => {
                const errors = validate(req.body, loginValidationDef).onlyMsg()
                const { email = "", password = "" } = req.body;
                if (errors.length > 0)
                    return res.render("login", {
                        errors,
                        email,
                    })

                var repoRes = await repo.getUserWithCredentials(email, password)
                if (repoRes.type === "usernotauthorized")
                    return res.render("login", {
                        errors: ["Wrong email or password"],
                    })

                const jwtObj = {
                    ...repoRes.obj
                }
                res.locals.user = repoRes.obj;
                req.context.user = repoRes.obj;
                const accessToken = jwt.sign(jwtObj, ACCESS_TOKEN_SECRET)
                res.setHeader("Authorization", "Bearer " + accessToken)
                res.cookie("jwt", accessToken)
                res.render("home", {
                    msg: `Welcome ${repoRes.obj.name}!`
                })

            },
        },
        {
            path: "/logout",
            post: async (req, res) => {
                if (req.context.user === undefined)
                    return res.render("login", {
                        errors: ["Not authorized"]
                    })
                res.clearCookie("jwt");
                res.locals.user = undefined
                req.context.user = undefined 
                return res.render("login", { msg: "Logged out succesfully" })
            },
        }
    ]
)

import { Controllers } from "../../createRouter.js"
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

export const createAuthController = (service: IAuthService): Controllers => (
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

                var msg = await service.createUser(email, password, name)
                if (msg == "email-already-in-use")
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

                const result = await service.signIn(email, password);
                if (result.msg === "sign-in-failed")
                    return res.render("login", {
                        errors: ["Login failed"],
                        email
                    })
                res.setHeader("Authorization", "Bearer " + result.cookie)
                res.cookie("jwt", result.cookie)
                res.render("home", {
                    msg: `Welcome!`
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

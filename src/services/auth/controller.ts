import { Controller, Controllers } from "../../createRouter.js"
import { validate, IValidationDef } from "../../validation/validator.js"
import { validators } from "../../validation/validators.js"
import { IAuthRepo } from "./respository.js"

const validationDef: IValidationDef = {
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

export const createAuthController = (repo: IAuthRepo): Controllers => (
    [
        {
            path: "/register",
            get: (_, res) => res.render("register"),
            post: async (req, res) => {
                const errors = validate(req.body, validationDef).onlyMsg()
                const { email = "", name = "", password = "" } = { ...req.body };
                if (errors.length > 0) {
                    res.render("register", {
                        errors,
                        email,
                        name
                    })
                    return;
                }
                var { type } = await repo.createUser(email, password, name)
                if (type == "userexists") {
                    res.render("register", {
                        errors: ["There is already an user with that email"],
                        name,
                    })
                    return;
                }
                else if (type == "usercreated") {
                    res.redirect("home")
                    return;
                }
            },
        }
    ]
)

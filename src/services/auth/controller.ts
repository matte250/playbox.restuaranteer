import { Controllers } from "../../registerController";

export const authController: Controllers = [
    {
        path: "/register",
        get: (_, res) => res.render("register"),
        post: (req, res) => {
            console.log("body", req.body, "query", req.query);
            const { email = "", name = "", password = ""} = { ...req.body };
            res.render("register", {
                error: "Password needs to be between 6 and 128 characters",
                msg: "Account created!",
                email,
                name,
                password
            })
        },
    }
]
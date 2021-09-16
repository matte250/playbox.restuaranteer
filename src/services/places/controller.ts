import { validate, IValidationDef } from "../../validation/validator.js"
import { validators } from "../../validation/validators.js"
import { Controllers } from "../../createRouter.js"
import { IPlacesRepo } from "./respository.js"

const addPlaceValidator: IValidationDef = {
    name: {
        $req: true,
        $lbl: "Name",
    },
    googleMapsLink: {
        $: validators.isGoogleMapsLink
    }
}

export const createPlacesController = (repo: IPlacesRepo): Controllers => (
    [
        {
            path: "/places",
            get: async (_, res) => {
                const { obj } = await repo.getPlaces();
                return res.render("places", { places: obj })
            },
            post: async (req, res) => {
                if (!req.context.user)
                    return res.sendStatus(401);

                const errors = validate(req.body, addPlaceValidator).onlyMsg()
                const { name = "", googleMapsLink = "" } = req.body;
                if (errors.length > 0)
                    return res.render("addplace", {
                        errors,
                        name,
                        googleMapsLink,
                    })

                await repo.createPlace(name, req.context.user.id, googleMapsLink);
                return res.redirect("places")
            },

        },
        {
            path: "/places/:id",
            put: async (req, res) => {
                if (!req.context.user)
                    return res.sendStatus(401);

                const errors = validate(req.body, addPlaceValidator).onlyMsg()
                const { name = "", googleMapsLink = "" } = req.body;
                const { id = "" } = req.params;
                if (errors.length > 0)
                    return res.render("editplace", {
                        errors,
                        name,
                        googleMapsLink,
                    })

                const result = await repo.editPlace(id, name, googleMapsLink);
                if (result.type == "placenotfound")
                    return res.sendStatus(404)

                return res.redirect("places")
            }
        },
        {
            path: "/addplaces",
            get: async (_, res) => {
                return res.render("addplace")
            }
        },
        {
            path: "/editplaces/:id",
            get: async (req, res) => {
                const { id = "" } = req.params;
                const result = await repo.getPlace(id)
                if (result.type === "placenotfound")
                    return res.sendStatus(404)

                return res.render("editplace", {
                    ...result.obj,
                })
            }
        },
    ]
)

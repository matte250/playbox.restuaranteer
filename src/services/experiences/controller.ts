import { validate, IValidationDef } from "../../validation/validator.js"
import { validators } from "../../validation/validators.js"
import { Controllers } from "../../createRouter.js"
import { IExperiencesRepo } from "./respository.js"
import { IPlacesRepo } from "../places/respository.js"

/*
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    at VARCHAR(36) NOT NULL,
    when DATETIME NOT NULL,
    [createdBy] VARCHAR(36) NOT NULL,
    FOREIGN KEY (at) REFERENCES places(id),
    FOREIGN KEY (createdBy) REFERENCES users(id)
*/
const addExperience: IValidationDef = {
    at: {
        $req: true,
        $lbl: "Place",
    },
    when: {
        $req: true,
    }
}

export const createExperiencesController = (repo: IExperiencesRepo, placesRepo: IPlacesRepo): Controllers => (
    [
        {
            path: "/experiences",
            get: async (_, res) => {
                const { obj } = await repo.getExperiences();

                return res.render("experiences", { experiences: obj })
            },
    
            post: async (req, res) => {
                if (!req.context.user)
                    return res.sendStatus(401);

                const errors = validate(req.body, addExperience).onlyMsg()
                const { at = "", when = "" } = req.body;
                if (errors.length > 0)
                    return res.render("addplace", {
                        errors,
                        at,
                        when,
                    })

                await repo.createExperience(at, when, req.context.user.id);
                return res.redirect("experiences")
            },
            
        },
        /*
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
        */
        {
            path: "/addexperience",
            get: async (_, res) => {
                const placesResult = await placesRepo.getPlaces();
                const now = new Date();
                now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
                now.setMilliseconds(null);
                const isoString = now.toISOString();
                
                // TODO: Fix this disgusting mess called datetime handling
                return res.render("addexperience", { places: placesResult.obj, when: isoString.substring(0, (isoString.indexOf("T")|0) + 6|0)/*.toLocaleString("se", options as any)*/ })
            }
        },
        /*
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
    */]
)

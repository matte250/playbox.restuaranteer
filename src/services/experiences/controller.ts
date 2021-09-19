import { validate, IValidationDef } from "../../validation/validator.js"
import { validators } from "../../validation/validators.js"
import { Controllers } from "../../createRouter.js"
import { IExperiencesRepo } from "./respository.js"
import { IPlacesRepo } from "../places/respository.js"
import { newAppLocaleDateTimeString, toLocaleDatetimeString } from "../../dateutils.js";

/*
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    at VARCHAR(36) NOT NULL,
    when DATETIME NOT NULL,
    [createdBy] VARCHAR(36) NOT NULL,
    FOREIGN KEY (at) REFERENCES places(id),
    FOREIGN KEY (createdBy) REFERENCES users(id)
*/
const addExperienceValidator: IValidationDef = {
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

                return res.render("experiences", {
                    experiences: obj.map(x =>
                        ({ ...x, when: x.when.toLocaleString("se")})
                    )
                })
            },
            post: async (req, res) => {
                if (!req.context.user)
                    return res.sendStatus(401);

                const errors = validate(req.body, addExperienceValidator).onlyMsg()
                const { at = "", when = "" } = req.body;
                if (errors.length > 0)
                    return res.render("addexperience", {
                        errors,
                        at,
                        when,
                    })

                await repo.createExperience(at, when, req.context.user.id);
                return res.redirect("experiences")
            },
        },
        {
            path: "/addexperience",
            get: async (_, res) => {
                const placesResult = await placesRepo.getPlaces();
                return res.render("addexperience", { places: placesResult.obj, when: newAppLocaleDateTimeString() })
            }
        },
        {
            path: "/editexperience/:id",
            get: async (req, res) => {
                const { id = "" } = req.params;
                const experienceResult = await repo.getExperience(id);
                if (experienceResult.type === "experiencenotfound")
                    return res.sendStatus(404)

                const placesResult = await placesRepo.getPlaces();
                return res.render("editexperience", {
                    ...experienceResult.obj,
                    when: toLocaleDatetimeString(experienceResult.obj.when),
                    places: placesResult.obj.map(x => {
                        if(x.id === experienceResult.obj.at.id)
                            return { ...x, selected: true}
                        else
                            return { ...x }
                    }),
                })
            },
            post: async (req, res) => {
                if (!req.context.user)
                    return res.sendStatus(401);

                const errors = validate(req.body, addExperienceValidator).onlyMsg()
                const { at = "", when = "" } = req.body;
                const { id = "" } = req.params;
                if (errors.length > 0)
                    return res.render("editexperience", {
                        errors,
                        at,
                        when,
                    })

                await repo.editExperience(id, at, when);
                return res.redirect("/experiences")
            },
        },
    ]
)

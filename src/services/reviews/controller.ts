import { validate, IValidationDef } from "../../validation/validator.js"
import { validators } from "../../validation/validators.js"
import { Controllers } from "../../createRouter.js"
import { IReviewsRepo } from "./respository.js"
import { IExperiencesRepo } from "../experiences/respository.js"
import { IPlacesRepo } from "../places/respository.js"
import { newAppLocaleDateTimeString, toLocaleDatetimeString } from "../../dateutils.js";

/*
export interface DbReview {
    id: string
    experience: DbExperience,
    score: number,
    created: Date,
    mealName: string,
    note: string,
}
*/

export const createReviewsController = (repo: IReviewsRepo, placesRepo: IPlacesRepo, experiencesRepo: IExperiencesRepo): Controllers => [
    {
        path: "/reviews",
        get: async (_, res) => {
            const { obj } = await repo.getReviews();
            return res.render("reviews", {
                reviews: obj.map(x => ({ ...x, experience: { ...x.experience, when: x.experience.when.toLocaleString("se")}}))
            })
        }
    }
]
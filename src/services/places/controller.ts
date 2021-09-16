import { Controllers } from "../../createRouter.js"
import { IPlacesRepo } from "./respository.js"

export const createPlacesController = (repo: IPlacesRepo): Controllers => (
    [
        {
            path: "/places",
            get: async (_, res) => {
                const { obj } = await repo.getPlaces();
                return res.render("places", {places: obj})
            }
        },
    ]
)

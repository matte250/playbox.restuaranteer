import { Controllers } from "./createRouter";
import { authController } from "./services/auth/controller.js";

export const globalControllers: Controllers = [
    ...authController
]
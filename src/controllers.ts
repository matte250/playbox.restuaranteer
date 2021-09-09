import { Controllers } from "./registerController";
import { authController } from "./services/auth/controller.js";

export const globalControllers: Controllers = [
    ...authController
]
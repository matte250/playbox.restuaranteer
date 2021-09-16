import { createValidatorFunctions } from "./validator.js";

const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

export const validators = createValidatorFunctions({
    isEmail: {
        func: (value) => !emailRegex.test(value),
        msg: "Invalid email address"
    },
    isPassword: {
        func: (value) => !/\S{6,128}/.test(value),
        msg: "Password needs to be 6 to 128 characters long"
    },
    isGoogleMapsLink: {
        func: (value) => !/(https|http):\/\/(www\.|)google\.[a-z]+\/maps/.test(value),
        msg: "Needs to be a valid Google Maps link"
    }
})
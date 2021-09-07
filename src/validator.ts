import { validate } from "uuid";

type RequestValidationProvider<T> = (request: T) => RequestValidator<T>[]

interface RequestValidator<T> {
    failed: string
    success: string
    validate: (request: T) => boolean;
}

const createRequestValidatorProvider = () => {

}

const runRequestValidation = (request: any, provider: RequestValidationProvider<typeof request>) => {
    var failed, success: string[] = []
    provider(request).forEach(x => {
        if (x.validate(request))
            success.push(x.success)
        else
            failed.push(x.failed)
    });
    return [failed, success]
}
export const validate = (value: any, validationDef: IValidationDef, key?: string) => {
    let failed: ValidationResults = [];

    const onlyMsg = () => onlyMessages(failed);
    const { $, $req, $lbl, $map, $brk } = validationDef;
    key = key ?? "[object]";

    if ($req && (value === undefined || value === ""))
        return {
            failed: [{
                type: "required",
                keyTrace: key,
                msg: $lbl
                    ? `${$lbl} cant be empty`
                    : `${key} is undefined`
            } as FailedValidation],
            onlyMsg
        }

    const defKeys = Object.keys(validationDef).filter(x => !x.startsWith("$") && value[x] !== undefined)

    defKeys.forEach(x => {
        const res = validate(value[x as any], validationDef[x], `${key}.${x}`).failed
        if (res)
            failed = failed.concat(res)
    })

    if ($) {
        const res = $.func(value)
        if (res)
            failed.push({
                type: "validation",
                keyTrace: key,
                validationKey: $.key,
                msg: $.msg,
            })
    }

    if ($map) {
        if (!Array.isArray(value)) {
            failed.push({
                type: "invalidtype",
                keyTrace: key,
                msg: `${key} is not a collection`
            })
        }
        else {
            var func = $brk ? value.forEach : value.some;
            func(x => {
                failed = failed.concat(validate(x, $map, `${key}[]`).failed)
            })
        }
    }
    return { failed, onlyMsg: () => onlyMessages(failed) }
}

const onlyMessages = (failed: ValidationResults) => failed.reduce((pre, cur) => pre.concat(cur.msg), [] as string[])

export const createValidatorFunctions = (funcs: ValidationFunctions) => Object.keys(funcs).reduce((pre, cur) =>
({
    ...pre,
    [cur]: {
        ...funcs[cur],
        key: cur
    }
}), {} as ValidationFunctionsWithKeys)

export interface ValidationFunctions {
    [key: string]: ValidationFunction
}

interface ValidationFunctionsWithKeys {
    [key: string]: ValidationFunctionWithKey
}

interface ValidationFunctionWithKey extends ValidationFunction {
   key: string
}

interface ValidationFunction {
    func: (value: any) => boolean
    msg: string
}

export type IValidationDef = {
    [key: string]: any
    $?: ValidationFunctionWithKey
    $req?: boolean | string,
    $lbl?: string,
    $map?: IValidationDef
    $brk?: boolean // If map should break on first error
}

type FailedValidation = ({
    type: "validation"
    validationKey?: string,
} | {
    type: "required" | "invalidtype"
}) & {
    keyTrace: string,
    msg: string,
}

type ValidationResults = Array<FailedValidation>

import { RowType } from "../types/Types";

const parseCondition = (cond: Array<any>, model: any): boolean => {
    const targetKey = cond[0];
    const operation = cond[1];
    const value = cond[2];

    let bool = false;
    switch (operation) {
        case '!=':
            bool = model[targetKey] !== value;
            break;
        case "==":
            bool = model[targetKey] === value;
            break;
        case ">":
            bool = model[targetKey] > value;
            break;
        case ">=":
            bool = model[targetKey] >= value;
            break;
        case "<":
            bool = model[targetKey] < value;
            break;
        case "<=":
            bool = model[targetKey] <= value;
            break;
        case "exists":
            bool = model.hasOwnProperty(targetKey) === value
            break;
    }
    return bool;
}

export const evaluateConditionalDisplay = (rowConfig: RowType, model: any) => {
    const criteria = rowConfig.criteria;
    if (criteria) {
        return parseCondition(criteria, model);
    } else {
        return true
    }
}

export const evaluateReadonlyCondition = (val: boolean | Array<any>, model: any): boolean => {
    if (typeof val === 'boolean') {
        return val;
    }
    else {
        return parseCondition(val as Array<any>, model)
    }
}
import { type EnumType, type ParamType } from './treesitter_queries';
export declare function getConstraintFunctions(): {
    fname_lower: string;
    constraint_name: string;
    constraint_type: string;
    params_list: {
        is_enum: boolean;
        type: string;
        identifier: string;
        optional_value?: string | undefined;
    }[];
    definition_params: string;
    call_params: string;
    fname: string;
}[];
export declare function getEnums(): EnumType[];
export declare function getFunctionTypesTypescript(): {
    return_type: string;
    fname: string;
    args: string;
}[];
export declare function params_to_definition_string(params: ParamType[]): string;
export declare function params_to_call_string(params: ParamType[]): string;

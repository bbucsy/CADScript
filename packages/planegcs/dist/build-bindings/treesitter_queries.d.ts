import { type Input, type InputReader } from 'tree-sitter';
type StringInput = string | Input | InputReader;
export type ParamType = {
    type: string;
    identifier: string;
    optional_value?: string;
};
export type EnumType = {
    name: string;
    is_enum_class: boolean;
    values: {
        name: string;
        value: number;
    }[];
};
export default class TreeSitterQueries {
    private parser;
    constructor();
    queryConstraintFunctions(src_string: StringInput): {
        fname: string;
        params_list: ParamType[];
    }[];
    queryEnum(enum_name: string, src_string: StringInput): EnumType;
    queryFunctionTypes(src_string: StringInput): {
        return_type: string;
        fname: string;
        params: ParamType[];
    }[];
    private getParameters;
}
export {};

export interface SchemaType {
    rows: ReadonlyArray<RowType>;
    labelWidth: string;
}

export interface RowType {
    type: 'text' | 'password' | 'checkbox' | 'boolean' | 'textarea' | 'textbox' | 'select' | 'radio' | 'nested' | 'date' | 'number' | 'mask' | 'cidr';
    readonly?: boolean | Array<any>;
    field: string
    options?: string | Array<any>
    optionLabel?: string
    optionValue?: string
    label?: string
    mask?: string
    columns?: Array<RowType>
    criteria?: Array<any>
}
import { Text, TextArea, Number, Checkbox, Select, Radio, Nested, Mask, CIDR } from './inputs';

const getComponent = (type: string) => {
    switch (type) {
        case 'text':
            return Text;
        case 'date':
            return Text;
        case 'number':
            return Number;
        case 'password':
            return Text;
        case 'checkbox':
            return Checkbox;
        case 'boolean':
            return Checkbox;
        case 'textarea':
            return TextArea;
        case 'textbox':
            return TextArea;
        case 'select':
            return Select;
        case 'radio':
            return Radio;
        case 'nested':
            return Nested;
        case 'mask':
            return Mask;
        case 'cidr':
            return CIDR;
    }
};

export default getComponent;

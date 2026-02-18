import { VariableDef } from './types';

export class InputBuilder {
    string(label: string, options: Partial<VariableDef<string>> = {}): VariableDef<string> {
        return { type: 'string', label, name: '', ...options };
    }
    number(label: string, options: Partial<VariableDef<number>> = {}): VariableDef<number> {
        return { type: 'number', label, name: '', ...options };
    }
    boolean(label: string, options: Partial<VariableDef<boolean>> = {}): VariableDef<boolean> {
        return { type: 'boolean', label, name: '', ...options };
    }
    address(label: string, options: Partial<VariableDef<string>> = {}): VariableDef<string> {
        return { type: 'address', label, name: '', ...options };
    }
}

export const Step = {
    input: new InputBuilder()
};

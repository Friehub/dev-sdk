import { VariableDef } from './types';

/**
 * Fluent builder for defining TaaS Recipe input schemas.
 */
export class InputBuilder {
    /** Defines a strictly-typed string input. */
    string(label: string, options: Partial<VariableDef<string>> = {}): VariableDef<string> {
        return { type: 'string', label, name: '', ...options };
    }
    /** Defines a strictly-typed numeric input. */
    number(label: string, options: Partial<VariableDef<number>> = {}): VariableDef<number> {
        return { type: 'number', label, name: '', ...options };
    }
    /** Defines a strictly-typed boolean input. */
    boolean(label: string, options: Partial<VariableDef<boolean>> = {}): VariableDef<boolean> {
        return { type: 'boolean', label, name: '', ...options };
    }
    /** Defines a strictly-typed Ethereum address input (checksum verified). */
    address(label: string, options: Partial<VariableDef<string>> = {}): VariableDef<string> {
        return { type: 'address', label, name: '', ...options };
    }
}

/**
 * Main utility for constructing Recipe steps and inputs.
 */
export const Step = {
    /** Builder for handling incoming user parameters. */
    input: new InputBuilder()
};

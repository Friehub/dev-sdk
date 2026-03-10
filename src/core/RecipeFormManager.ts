import { VariableDef } from './types';
import { TruthGatewayClient } from './GatewayClient';

export interface FormFieldState {
    name: string;
    label: string;
    type: string;
    value: any;
    error?: string;
    loading: boolean;
    options: { label: string; value: any }[];
    component: string;
    hint?: string;
}

/**
 * Universal Headless State Manager for TaaS Recipes.
 * Manages input state, validation, and dynamic discovery resolution.
 */
export class RecipeFormManager {
    private fields: Record<string, FormFieldState> = {};
    private listeners: ((fields: FormFieldState[]) => void)[] = [];

    constructor(
        private template: any,
        private gateway: TruthGatewayClient
    ) {
        this.init();
    }

    private init() {
        const variables = this.template.ui?.variables || [];
        variables.forEach((v: VariableDef) => {
            this.fields[v.name] = {
                name: v.name,
                label: v.label,
                type: v.type,
                value: '',
                loading: false,
                options: v.options || [],
                component: v.component || 'text',
                hint: v.hint
            };
        });
    }

    /**
     * Updates a field value and triggers re-validation or discovery.
     */
    async updateField(name: string, value: any) {
        const field = this.fields[name];
        if (!field) return;

        field.value = value;
        this.notify();

        // Check if this field triggers discovery updates for other fields
        // (Currently: discovery is usually called once on focus or based on dependencies)
    }

    /**
     * Resolves dynamic options for a field via Gateway Discovery.
     */
    async fetchDiscovery(name: string, query?: string) {
        const fieldDef = this.template.ui?.variables.find((v: any) => v.name === name);
        if (!fieldDef?.discoverySrc) return;

        const field = this.fields[name];
        field.loading = true;
        this.notify();

        try {
            const results = await this.gateway.discover(fieldDef.discoverySrc, { query });
            field.options = results.map((r: any) => ({ label: r.label, value: r.value }));
        } catch (err) {
            field.error = "Discovery failed";
        } finally {
            field.loading = false;
            this.notify();
        }
    }

    /**
     * Validates all fields against the template constraints.
     */
    validate(): boolean {
        let isValid = true;
        const variables = this.template.ui?.variables || [];

        variables.forEach((v: any) => {
            const field = this.fields[v.name];
            field.error = undefined;

            if (v.required && !field.value) {
                field.error = "Required field";
                isValid = false;
            }

            if (v.constraints) {
                if (v.type === 'number') {
                    const num = Number(field.value);
                    if (v.constraints.min !== undefined && num < v.constraints.min) {
                        field.error = `Min value: ${v.constraints.min}`;
                        isValid = false;
                    }
                    if (v.constraints.max !== undefined && num > v.constraints.max) {
                        field.error = `Max value: ${v.constraints.max}`;
                        isValid = false;
                    }
                }
            }
        });

        this.notify();
        return isValid;
    }

    /**
     * Returns the current state as a RecipeRequest input blob.
     */
    getInputs(): Record<string, any> {
        const inputs: Record<string, any> = {};
        Object.keys(this.fields).forEach(key => {
            inputs[key] = this.fields[key].value;
        });
        return inputs;
    }

    /**
     * Subscription for UI frameworks (React hooks, etc.)
     */
    subscribe(callback: (fields: FormFieldState[]) => void) {
        this.listeners.push(callback);
        callback(Object.values(this.fields));
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private notify() {
        const state = Object.values(this.fields);
        this.listeners.forEach(l => l(state));
    }
}

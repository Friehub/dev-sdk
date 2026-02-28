// Mirroring the Execution Engine Schema
export type NodeId = string;
export type VarName = string;

export interface LogicNode {
    id: NodeId;
    type: string;
    targetVar: VarName;
    dependencies?: NodeId[];
    [key: string]: any;
}

export interface VariableDef<T = any> {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'address';
    label: string;
    required?: boolean;
    constraints?: any;
    default?: any;
    _tsType?: T; // Phantom type for inference
}

export interface Recipe {
    id: string; // Auto-generated slug
    metadata: {
        name: string;
        description: string;
        category: string;
        version: string;
        id?: string;
    };
    ui: {
        titleTemplate: string;
        variables: VariableDef[];
        outcomeType: 'BINARY' | 'MULTIPLE_CHOICE' | 'SCALAR' | 'CATEGORICAL';
        outcomeLabels?: string[];
    };
    logic: {
        pipeline: LogicNode[];
        attestation: {
            type: string;
            config: any;
        };
        /** @deprecated Use attestation */
        resolution?: {
            type: string;
            config: any;
        };
    };
}
export interface RecipeExecutionResult {
    success: boolean;
    truth: any; // NEW: Replaces winningOutcome
    /** @deprecated Use truth */
    winningOutcome?: any;
    confidence: number;
    proof?: {
        recipeHash: string;
        attestation: string;
        [key: string]: any;
    };
    logs?: string[];
    [key: string]: any;
}

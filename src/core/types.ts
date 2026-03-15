import {
    RecipeTemplate,
    RecipeBlueprint,
    VariableDef,
    RecipeExecutionResult
} from '@taas/interfaces';

export type NodeId = string;
export type VarName = string;

export interface LogicNode {
    type: 'transform' | 'aggregate' | 'consensus' | 'standard-feed' | 'universal-request' | 'graphql-request' | 'chain-rpc' | 'condition' | 'script';
    id: string;
    dependencies: string[];
    targetVar: string;
    [key: string]: any;
}

export interface ScriptNode extends LogicNode {
    type: 'script';
    language: string;
    code: string;
}

export type { RecipeTemplate, RecipeBlueprint, LogicNode, VariableDef, RecipeExecutionResult };

/**
 * @deprecated Use `RecipeTemplate` instead. Will be removed in v4.0.0.
 */
export type IRecipe = RecipeTemplate;

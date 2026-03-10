import {
    RecipeTemplate,
    RecipeBlueprint,
    LogicNode,
    VariableDef,
    RecipeExecutionResult
} from '@friehub/taas-interfaces';

export type NodeId = string;
export type VarName = string;

export type { RecipeTemplate, RecipeBlueprint, LogicNode, VariableDef, RecipeExecutionResult };

/**
 * @deprecated Use `RecipeTemplate` instead. Will be removed in v4.0.0.
 */
export type IRecipe = RecipeTemplate;

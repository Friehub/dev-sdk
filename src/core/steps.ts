import { VariableDef } from './types';
import { BuilderContext } from './context';

/**
 * Fluent builder for defining TaaS Recipe input schemas.
 */
export class InputBuilder {
    /** Defines a strictly-typed string input. */
    string(label: string, options: Partial<VariableDef> = {}): VariableDef {
        return { type: 'string', label, name: '', ...options };
    }
    /** Defines a strictly-typed numeric input. */
    number(label: string, options: Partial<VariableDef> = {}): VariableDef {
        return { type: 'number', label, name: '', ...options };
    }
    /** Defines a strictly-typed boolean input. */
    boolean(label: string, options: Partial<VariableDef> = {}): VariableDef {
        return { type: 'boolean', label, name: '', ...options };
    }
    /** Defines a strictly-typed Ethereum address input (checksum verified). */
    address(label: string, options: Partial<VariableDef> = {}): VariableDef {
        return { type: 'address', label, name: '', ...options };
    }
}

/**
 * Fluent builder for complex DAG logic.
 */
export class LogicBuilder {
    /** Mark the previous/specified node as optional (won't break DAG on failure). */
    optional(nodeId?: string) {
        const ctx = BuilderContext.get();
        const nodes = ctx.getNodes();
        const target = nodeId ? nodes.find(n => n.id === nodeId) : nodes[nodes.length - 1];
        if (target) target.optional = true;
        return target;
    }

    /** Conditional execution branch. */
    condition(expression: string, onTrue: string[], onFalse: string[] = []) {
        const ctx = BuilderContext.get();
        const id = `cond_${Math.floor(Math.random() * 10000)}`;
        ctx.addNode({
            id,
            type: 'condition',
            expression,
            onTrue,
            onFalse,
            targetVar: id,
            dependencies: [...expression.matchAll(/\$\{([^}]+)\}/g)].map(m => m[1]).filter(Boolean)
        });
        return id;
    }

    /** Robust fallback between two variables/nodes. */
    fallback(primaryVar: string, secondaryNodeId: string) {
        return this.condition(`\${${primaryVar}} == null`, [secondaryNodeId]);
    }
}

/**
 * Main utility for constructing Recipe steps and inputs.
 */
export const Step = {
    /** Builder for handling incoming user parameters. */
    input: new InputBuilder(),
    /** Builder for DAG flow control and resilience. */
    logic: new LogicBuilder()
};

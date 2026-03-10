import { VariableDef } from './types';
import { BuilderContext } from './context';

/**
 * Wrapper to provide fluent, chainable methods for a VariableDef.
 */
class FluentVariable {
    constructor(public def: VariableDef) { }

    /** Specifies the UI component to render this input */
    renderAs(component: VariableDef['component']): this {
        this.def.component = component;
        return this;
    }

    /** Provides a hint/description below the input */
    hint(text: string): this {
        this.def.hint = text;
        return this;
    }

    /** Groups this input with others in the UI */
    group(name: string): this {
        this.def.group = name;
        return this;
    }

    /** Sets static options for select/dropdown components */
    options(items: { label: string; value: string | number | boolean }[]): this {
        this.def.options = items;
        return this;
    }

    /** Sets a dynamic gateway source for dynamic-search components */
    source(gatewayMethod: string, params?: Record<string, string | number | boolean>): this {
        this.def.source = { gatewayMethod, params };
        return this;
    }

    /** Adds validation constraints (min, max, pattern, etc) */
    validation(constraints: VariableDef['constraints']): this {
        this.def.constraints = { ...this.def.constraints, ...constraints };
        return this;
    }

    /** Sets placeholder text */
    placeholder(text: string): this {
        this.def.placeholder = text;
        return this;
    }

    /** NEW: Sets a discovery source for dynamic selection (v4.0) - Tier 2 */
    discovery(src: string): this {
        this.def.discoverySrc = src;
        this.renderAs('dynamic-search');
        return this;
    }

    /** NEW: Tier 3 - Constrained Numerical Input */
    range(min: number, max: number, step?: number): this {
        this.def.constraints = { ...this.def.constraints, min, max, step };
        this.renderAs('slider');
        return this;
    }
}

/**
 * Fluent builder for defining TaaS Recipe input schemas.
 */
export class InputBuilder {
    string(label: string, options: Partial<VariableDef> = {}) {
        return new FluentVariable({ type: 'string', label, name: '', required: true, ...options });
    }
    number(label: string, options: Partial<VariableDef> = {}) {
        return new FluentVariable({ type: 'number', label, name: '', required: true, ...options });
    }
    boolean(label: string, options: Partial<VariableDef> = {}) {
        return new FluentVariable({ type: 'boolean', label, name: '', required: true, ...options });
    }
    address(label: string, options: Partial<VariableDef> = {}) {
        return new FluentVariable({ type: 'address', label, name: '', required: true, ...options });
    }
    select(label: string, options: Partial<VariableDef> = {}) {
        return new FluentVariable({ type: 'select', label, name: '', required: true, ...options });
    }
    date(label: string, options: Partial<VariableDef> = {}) {
        return new FluentVariable({ type: 'date', label, name: '', required: true, ...options });
    }

    /** Tier 1: Static Enum (Hardly Changes) */
    enum(label: string, options: string[], component: VariableDef['component'] = 'select') {
        return new FluentVariable({
            type: 'string',
            label,
            name: '',
            required: true,
            component,
            options: options.map(o => ({ label: o, value: o }))
        });
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
        const id = ctx.getNextId('cond');
        ctx.addNode({
            id,
            type: 'condition',
            params: {},
            expression,
            onTrue,
            onFalse,
            targetVar: id,
            dependencies: [...expression.matchAll(/\$\{([^${}]+)\}/g)].map(m => m[1].replace(/^\$\{/, '')).filter(Boolean)
        } as any);
        return id;
    }

    /** Robust fallback between two variables/nodes. */
    fallback(primaryVar: string, secondaryNodeId: string) {
        return this.condition(`\${${primaryVar}} == null`, [secondaryNodeId]);
    }

    /** NEW: Fluent Comparison - Greater Than */
    gt(left: string, right: string | number) {
        return this.condition(`\${${left}} > ${typeof right === 'string' ? `\${${right}}` : right}`, ["true"], ["false"]);
    }

    /** NEW: Fluent Comparison - Less Than */
    lt(left: string, right: string | number) {
        return this.condition(`\${${left}} < ${typeof right === 'string' ? `\${${right}}` : right}`, ["true"], ["false"]);
    }

    /** NEW: Fluent Comparison - Equals */
    eq(left: string, right: string | number | boolean) {
        return this.condition(`\${${left}} == ${typeof right === 'string' ? `\${${right}}` : right}`, ["true"], ["false"]);
    }

    /** NEW: Fluent Logical - AND */
    and(left: string, right: string) {
        return this.condition(`\${${left}} && \${${right}}`, ["true"], ["false"]);
    }

    /** NEW: Fluent Logical - OR */
    or(left: string, right: string) {
        return this.condition(`\${${left}} || \${${right}}`, ["true"], ["false"]);
    }

    /** NEW: Fluent Logical - NOT */
    not(variable: string) {
        return this.condition(`!\${${variable}}`, ["true"], ["false"]);
    }
}

/**
 * Fluent builder for data fetching (replaces hardcoded feeds).
 */
export class DataBuilder {
    fetch(category: string, method: string, params: Record<string, any> = {}, options: { dataPath?: string, timeout?: number } = {}) {
        const ctx = BuilderContext.get();
        const id = ctx.getNextId('truth');
        ctx.addNode({
            id,
            type: 'standard-feed',
            category: category as any,
            method,
            params,
            args: [],
            targetVar: id,
            dataPath: options.dataPath,
            timeout: options.timeout
        });
        return id;
    }

    /**
     * NEW: State Snapshots (v4.5)
     * Persists a variable value for historical lookups.
     */
    snapshot(key: string, valueVar: string, ttl: number = 86400) {
        const ctx = BuilderContext.get();
        const id = ctx.getNextId('snapshot');
        ctx.addNode({
            id,
            type: 'snapshot',
            key,
            valueVar,
            ttl,
            targetVar: id
        });
        return id;
    }
}

/**
 * Main utility for constructing Recipe steps and inputs.
 */
export const Step = {
    /** Builder for handling incoming user parameters. */
    input: new InputBuilder(),
    /** Builder for DAG flow control and resilience. */
    logic: new LogicBuilder(),
    /** Builder for generic data fetching via Gateway. */
    data: new DataBuilder()
};

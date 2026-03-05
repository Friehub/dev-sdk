import { LogicNode } from './types';
import { AsyncLocalStorage } from 'async_hooks';

/**
 * Thread-safe Context for building Recipe DAGs.
 * Uses AsyncLocalStorage to prevent node leakage between concurrent builds.
 */
export class BuilderContext {
    private static storage = new AsyncLocalStorage<BuilderContext>();
    private nodes: LogicNode[] = [];
    private active: boolean = false;

    /**
     * Retrieves the context for the current asynchronous execution branch.
     * Falls back to a global singleton ONLY if no active session is found (for legacy/simple scripts).
     */
    static get(): BuilderContext {
        const context = this.storage.getStore();
        if (!context) {
            // Fallback for non-concurrent usage
            return global['__taas_global_ctx'] || (global['__taas_global_ctx'] = new BuilderContext());
        }
        return context;
    }

    /**
     * Executes a build handler within a secure, isolated context.
     */
    static run<T>(fn: (ctx: BuilderContext) => T): T {
        const context = new BuilderContext();
        context.active = true;
        return this.storage.run(context, () => fn(context));
    }

    start() {
        this.nodes = [];
        this.active = true;
    }

    stop() {
        this.active = false;
        return [...this.nodes];
    }

    addNode(node: LogicNode) {
        this.nodes.push(node);
    }

    getNodes() {
        return this.nodes;
    }
}

import { LogicNode } from './types';

export class BuilderContext {
    private static instance: BuilderContext;
    private nodes: LogicNode[] = [];
    private active: boolean = false;

    // Singleton for the current build session
    static get(): BuilderContext {
        if (!BuilderContext.instance) {
            BuilderContext.instance = new BuilderContext();
        }
        return BuilderContext.instance;
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
        if (!this.active) {
            // If not active, we might be just defining a recipe, or running in a test.
            // For the Transpiler, we expect to be in a 'compile' phase.
            // checking active might be too strict if we want to test steps individually.
            // For now, let's allow it but warn.
            // console.warn("BuilderContext: Adding node outside active build session");
        }
        this.nodes.push(node);
    }

    getNodes() {
        return this.nodes;
    }
}

import { RecipeScanner, RecipeRenderer } from '../src';
import { RecipeBlueprint } from '../src/core/types';

console.log('--- TaaS SDK Unification Verification ---');

// 1. Verify RecipeScanner
console.log('\n[1/2] Verifying RecipeScanner...');
const mockRecipe: RecipeBlueprint = {
    id: 'test-recipe',
    metadata: {
        id: 'test-recipe',
        name: 'Test Recipe',
        description: 'Testing unification',
        category: 'test',
        version: '1.0',
        outcome_type: 'binary'
    },
    ui: {
        title_template: 'Test',
        variables: [],
        truth_type: 'binary'
    },
    logic: {
        pipeline: [
            {
                id: 'node1',
                type: 'transform',
                expression: '1 + 1',
                targetVar: 'result',
                dependencies: []
            }
        ],
        attestation: {
            type: 'expression',
            config: { expression: 'result == 2' }
        }
    }
};

const scanResult = RecipeScanner.scan(mockRecipe);
if (scanResult.valid) {
    console.log('✅ RecipeScanner imported and functional.');
} else {
    console.error('❌ RecipeScanner failed validation:', scanResult.errors);
}

// 2. Verify RecipeRenderer
console.log('\n[2/2] Verifying RecipeRenderer...');
if (typeof RecipeRenderer === 'function') {
    console.log('✅ RecipeRenderer (React Component) imported successfully.');
} else {
    console.error('❌ RecipeRenderer not found or invalid.');
}

console.log('\n--- Verification Complete ---');

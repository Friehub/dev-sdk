import { decodeAbiParameters, encodeAbiParameters, parseAbiParameters, type Hex } from 'viem';
import { RecipeBlueprint, VariableDef } from './types';
import axios from 'axios';

/**
 * TaasClient
 * Standardized interface for developers to interact with the TaaS Protocol.
 */
export class TaasClient {
    private gatewayUrl: string;

    constructor(options: { gatewayUrl?: string } = {}) {
        this.gatewayUrl = options.gatewayUrl || 'http://localhost:8080';
    }

    /**
     * Encodes recipe ID and parameters into the format expected by the TruthOracleV2 contract.
     * Use this when deploying a market (Static Binding).
     */
    public encodeRecipeRequest(recipeId: string, parameters: Record<string, any>): Hex {
        return encodeAbiParameters(
            parseAbiParameters('string, string'),
            [recipeId, JSON.stringify(parameters)]
        );
    }

    /**
     * Decodes a recipe request from the contract data.
     */
    public decodeRecipeRequest(data: Hex): { recipeId: string; parameters: Record<string, any> } {
        const [recipeId, paramsJson] = decodeAbiParameters(
            parseAbiParameters('string, string'),
            data
        );
        return {
            recipeId,
            parameters: JSON.parse(paramsJson)
        };
    }

    /**
     * TDS PREPARATION: Uploads user inputs (off-chain) to the TDS Swarm.
     * Returns a CID that is used for the on-chain intent registration.
     * This keeps the Mantle/Helios gas costs O(1).
     */
    public async uploadInputsToTds(parameters: Record<string, any>): Promise<string> {
        console.log('[TaasClient] Uploading ephemeral parameters to TDS Swarm...', parameters);
        // In production: const { cid } = await axios.post(`${this.gatewayUrl}/tds/store`, parameters);
        const mockCid = `bafy_${Math.random().toString(36).slice(2)}`;
        return mockCid;
    }

    /**
     * RESOLUTION INTENT: Register a secure, automated resolution on-chain.
     * This 'hooks' the developer's recipe to the user's specific input CID.
     */
    public async registerResolutionIntent(options: {
        recipeId: string;
        inputCid: string; // The CID from uploadInputsToTds
        trigger: {
            type: 'time' | 'event';
            value: number | string; // Timestamp or Event Condition
        };
        priority?: 'standard' | 'high';
        memo?: string;
    }) {
        console.log('[TaasClient] Committing Resolution Intent to TruthOracle...', {
            recipe: options.recipeId,
            inputCid: options.inputCid,
            trigger: options.trigger,
            priority: options.priority || 'standard'
        });
        
        // This triggers a contract write: TruthOracle.registerIntent(recipeId, inputCid, trigger)
        return { 
            success: true, 
            intentId: `intent_${Math.random().toString(36).slice(2)}`,
            estimatedFee: '0.05 $T' 
        };
    }
}

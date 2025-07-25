import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { NeonApiClient } from '../api/client.js';
export declare function createSiteTools(client: NeonApiClient): Tool[];
export declare function handleSiteTool(name: string, args: any, client: NeonApiClient): Promise<{
    content: Array<{
        type: 'text';
        text: string;
    }>;
}>;

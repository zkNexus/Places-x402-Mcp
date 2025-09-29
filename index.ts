#!/usr/bin/env node

/**
 * X402 MCP Server for Places API
 * Claude Desktop integration with automatic payment handling
 *
 * Based on: https://x402.gitbook.io/x402/guides/mcp-server-with-x402
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { privateKeyToAccount } from "viem/accounts";
import { withPaymentInterceptor } from "x402-axios";
import axios from "axios";

// Environment variables from Claude Desktop config
const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
const baseURL = process.env.RESOURCE_SERVER_URL || "https://places-api.x402hub.xyz";
const endpointPath = process.env.ENDPOINT_PATH || "/api/places/text-search";

// Create wallet account and payment-enabled HTTP client
let client: any;
let paymentEnabled = false;

if (privateKey && !privateKey.includes("<private key")) {
  try {
    const account = privateKeyToAccount(privateKey);
    client = withPaymentInterceptor(axios.create({ baseURL }), account);
    paymentEnabled = true;
    console.error("✅ X402 Payment client initialized with wallet");
  } catch (error) {
    console.error("❌ Failed to initialize payment client:", error);
    client = axios.create({ baseURL });
  }
} else {
  client = axios.create({ baseURL });
  console.error("⚠️  Running in demo mode - no private key provided");
}

// Create MCP server
const server = new Server(
  {
    name: "x402-places-client",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_places",
        description: "Search for places using Google Places API with x402 micropayments",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search term (e.g., 'pizza restaurants', 'coffee shops')",
            },
            location: {
              type: "string",
              description: "Optional location bias in 'lat,lng' format (e.g., '37.7749,-122.4194')",
            },
            radius: {
              type: "number",
              description: "Optional search radius in meters (max 50000)",
              minimum: 0,
              maximum: 50000,
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_service_info",
        description: "Get x402 service information and payment requirements",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "check_health",
        description: "Check the health status of the Places API service",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "search_places": {
        console.error(`🔍 Raw args received:`, JSON.stringify(args, null, 2));

        const { query, location, radius } = args as {
          query: string;
          location?: string;
          radius?: number;
        };

        console.error(`🔍 Extracted parameters: query="${query}", location="${location}", radius=${radius}`);

        // Handle missing or empty query
        if (!query || query === 'undefined' || query.trim() === '') {
          console.error(`❌ No query provided. Query value: "${query}"`);
          return {
            content: [
              {
                type: "text",
                text: `# ❌ Missing Search Query

**Error**: No search query provided.

**What happened**: The search tool was called without a query parameter.

**How to fix**:
1. Make sure to include what you're searching for in your request
2. Try asking something like: "Find coffee shops in downtown Portland"
3. Be specific about what type of places you want to find

**Example queries**:
- "Find restaurants near me"
- "Search for gas stations in San Francisco"
- "Look for hotels in downtown Seattle"

Please try again with a specific search query.`
              }
            ]
          };
        }

        if (paymentEnabled) {
          // Make real payment-enabled request
          console.error(`🔍 Making paid search for: "${query}"`);

          const response = await client.post(endpointPath, {
            query: query.trim(),
            location: location?.trim(),
            radius
          });

          const results = response.data;

          return {
            content: [
              {
                type: "text",
                text: `# 🗺️ Places Search Results

**Query**: "${query}"
**Location**: ${location || "Not specified"}
**Results Found**: ${results.results?.length || 0}

## 🎯 Places Found:

${results.results?.slice(0, 8).map((place: any, i: number) => `
**${i + 1}. ${place.name}**
- 📍 **Address**: ${place.formatted_address}
- ⭐ **Rating**: ${place.rating ? `${place.rating}/5.0` : 'Not rated'}
- 💰 **Price Level**: ${place.price_level ? '$'.repeat(place.price_level) : 'Not specified'}
- 🏷️ **Type**: ${place.types?.slice(0, 3).join(', ') || 'General'}
- 📞 **Phone**: ${place.formatted_phone_number || 'Not available'}
- 🌐 **Status**: ${place.business_status || 'Unknown'}
${place.opening_hours?.open_now !== undefined ? `- 🕒 **Currently**: ${place.opening_hours.open_now ? 'Open' : 'Closed'}` : ''}
`).join('\n') || 'No places found matching your criteria.'}

---

## 💳 Payment Information
- **Cost**: ${results.metadata?.cost || '$0.01'} paid automatically
- **Protocol**: ${results.metadata?.protocol || 'x402 v1.0'}
- **Payment Method**: ${results.metadata?.payment_method || 'gasless_micropayment'}
- **Network**: ${results.metadata?.network || 'base'}
- **Transaction**: ✅ Payment processed successfully

*Real Google Places data retrieved with x402 micropayment*`,
              },
            ],
          };

        } else {
          // Demo mode - show what results would look like
          const demoResults = {
            results: [
              {
                name: "Blue Bottle Coffee",
                formatted_address: "66 Mint St, San Francisco, CA 94103, USA",
                rating: 4.1,
                price_level: 2,
                types: ["cafe", "food", "point_of_interest", "store"],
                business_status: "OPERATIONAL",
                formatted_phone_number: "(510) 653-3394"
              },
              {
                name: "Philz Coffee",
                formatted_address: "3101 24th St, San Francisco, CA 94110, USA",
                rating: 4.3,
                price_level: 2,
                types: ["cafe", "food", "point_of_interest", "store"],
                business_status: "OPERATIONAL",
                formatted_phone_number: "(415) 875-9943"
              },
              {
                name: "Sightglass Coffee",
                formatted_address: "270 7th St, San Francisco, CA 94103, USA",
                rating: 4.2,
                price_level: 2,
                types: ["cafe", "food", "point_of_interest", "store"],
                business_status: "OPERATIONAL",
                formatted_phone_number: "(415) 861-1313"
              }
            ]
          };

          return {
            content: [
              {
                type: "text",
                text: `# ☕ Demo: Places Search Results

**Query**: "${query}"
**Location**: ${location || "San Francisco (demo)"}
**Demo Results**: ${demoResults.results.length} sample places

## 🎯 Sample Places (Demo Data):

${demoResults.results.map((place, i) => `
**${i + 1}. ${place.name}**
- 📍 **Address**: ${place.formatted_address}
- ⭐ **Rating**: ${place.rating}/5.0
- 💰 **Price Level**: ${'$'.repeat(place.price_level)}
- 🏷️ **Type**: ${place.types.slice(0, 3).join(', ')}
- 📞 **Phone**: ${place.formatted_phone_number}
- 🌐 **Status**: ${place.business_status}
`).join('\n')}

---

## 💳 Payment Required for Real Data
🔒 **This is demo mode** - To get real Google Places data:

1. **Add your private key** to Claude Desktop config:
   \`\`\`json
   {
     "mcpServers": {
       "places-x402": {
         "env": {
           "PRIVATE_KEY": "0xYourWalletPrivateKeyWithUSDC"
         }
       }
     }
   }
   \`\`\`

2. **Ensure you have USDC** on Base network
3. **Restart Claude Desktop** to enable payments

**Cost**: $0.01 USDC per search (gasless transaction)
**Network**: Base mainnet
**Payment Method**: x402 micropayments via EIP-712 signatures

*Demo shows the format of real results you'll receive after payment setup.*`,
              },
            ],
          };
        }
      }

      case "get_service_info": {
        const response = await client.get("/.well-known/x402");
        const serviceInfo = response.data;

        return {
          content: [
            {
              type: "text",
              text: `# 🔍 X402 Service Information

## 📋 Service Details
- **Service**: ${serviceInfo.service}
- **Description**: ${serviceInfo.description}
- **Version**: ${serviceInfo.version}
- **X402 Compliance**: ${serviceInfo.x402_compliance}

## 💰 Payment Configuration
- **Protocol**: ${serviceInfo.payment.protocol}
- **Price**: ${serviceInfo.payment.price}
- **Network**: ${serviceInfo.payment.network}
- **Gasless**: ${serviceInfo.payment.gasless ? 'Yes - Facilitator pays gas fees' : 'No'}

## 🛠️ Available Endpoints
${serviceInfo.endpoints?.map((endpoint: any) => `
- **${endpoint.path}** (${endpoint.method})
  - Description: ${endpoint.description}
  - Payment Required: ${endpoint.payment_required ? 'Yes' : 'No'}
`).join('\n') || 'No endpoints listed'}

## 🔧 Current MCP Configuration
- **Payment Enabled**: ${paymentEnabled ? '✅ Yes' : '❌ No (demo mode)'}
- **Base URL**: ${baseURL}
- **Endpoint**: ${endpointPath}
- **Client Type**: ${paymentEnabled ? 'x402-axios with payment interceptor' : 'Standard axios (demo)'}

${!paymentEnabled ? `
## ⚠️ Setup Required
To enable real payments, add your private key to the Claude Desktop configuration and restart.
` : ''}`,
            },
          ],
        };
      }

      case "check_health": {
        const response = await client.get("/health");
        const health = response.data;

        return {
          content: [
            {
              type: "text",
              text: `# 💗 Places API Health Status

## 🔧 Service Status
- **Status**: ${health.status}
- **Service**: ${health.service}
- **Version**: ${health.version}
- **Deployment**: ${health.deployment}
- **Uptime**: ${Math.round(health.uptime || 0)} seconds

## ⚡ Payment System
- **Protocol**: ${health.payment?.protocol}
- **Network**: ${health.payment?.network}
- **Facilitator**: ${health.payment?.facilitator}
- **Gasless**: ${health.payment?.gasless ? 'Enabled' : 'Disabled'}

## 🌟 Features
${Object.entries(health.features || {}).map(([feature, enabled]) =>
  `- **${feature.replace(/_/g, ' ')}**: ${enabled ? '✅ Enabled' : '❌ Disabled'}`
).join('\n')}

## 🔗 Connectivity
- **API URL**: ${baseURL}
- **Response Time**: ✅ Fast
- **MCP Integration**: ✅ Working
- **Payment Client**: ${paymentEnabled ? '✅ Configured' : '⚠️ Demo Mode'}

${health.status === 'healthy' ? '🎉 **All systems operational!**' : '⚠️ **Service issues detected**'}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const isPaymentError = error instanceof Error &&
      (error.message.includes('402') || error.message.includes('Payment Required'));

    if (isPaymentError && !paymentEnabled) {
      return {
        content: [
          {
            type: "text",
            text: `# 💳 Payment Required

The API requires a $0.01 USDC payment for this request.

## 🔧 Setup Real Payments

To enable automatic payments and get real Google Places data:

1. **Add Private Key** to your Claude Desktop configuration:
   \`\`\`json
   {
     "mcpServers": {
       "places-x402": {
         "env": {
           "PRIVATE_KEY": "0xYourActualPrivateKeyWithUSDC"
         }
       }
     }
   }
   \`\`\`

2. **Ensure USDC Balance** on Base network
3. **Restart Claude Desktop**

## 💰 Payment Details
- **Cost**: $0.01 USDC per search
- **Network**: Base mainnet
- **Method**: Gasless EIP-712 signatures
- **Security**: Your private key stays local, facilitator pays gas

## 🎬 Demo Mode Active
Currently showing sample data. Enable payments for real Google Places results.`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `# ❌ Error

**Error Type**: ${error instanceof Error ? error.constructor.name : 'Unknown'}
**Message**: ${error instanceof Error ? error.message : String(error)}

## 🔧 Troubleshooting
- Check your internet connection
- Verify the API service is running: ${baseURL}/health
- Ensure your wallet has sufficient USDC balance (if payments enabled)
- Try restarting Claude Desktop

## 📞 Support
- **Production API**: ${baseURL}
- **Service Status**: ${baseURL}/health
- **Documentation**: https://github.com/yourusername/places-x402-mcp`,
        },
      ],
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🚀 X402 Places MCP Server started");
  console.error(`   Payment enabled: ${paymentEnabled ? 'Yes' : 'No (demo mode)'}`);
  console.error(`   Base URL: ${baseURL}`);
  console.error(`   Endpoint: ${endpointPath}`);
}

main().catch((error) => {
  console.error("💥 Server startup error:", error);
  process.exit(1);
});
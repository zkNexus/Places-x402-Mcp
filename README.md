# X402 Places MCP Server

**Claude Desktop integration** for Google Places API with automatic x402 micropayments.

> 🔒 **Zero Gas Fees**: Clients pay $0.01 USDC per search, facilitator pays gas
> 🤖 **AI Native**: Built for Claude Desktop and AI agents
> ⚡ **Instant Payments**: EIP-712 signatures, sub-second processing
> 🗺️ **Real Data**: Live Google Places API integration

## What is This?

This is a **Model Context Protocol (MCP) server** that allows Claude Desktop to search Google Places using **x402 micropayments**. You pay $0.01 USDC per search with zero gas fees.

### Key Features

- ✅ **Real Data**: Live Google Places results for $0.01 USDC
- ✅ **Gasless**: Facilitator pays all gas fees
- ✅ **Secure**: Private keys stay local, EIP-712 signatures
- ✅ **Fast**: Sub-second payment processing

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/places-x402-mcp.git
cd places-x402-mcp
pnpm install
```

### 2. Configure Claude Desktop

Add to your Claude Desktop config at:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

**Configuration**:
```json
{
  "mcpServers": {
    "places-x402": {
      "command": "pnpm",
      "args": [
        "--silent",
        "-C",
        "/absolute/path/to/places-x402-mcp",
        "dev"
      ],
      "env": {
        "PRIVATE_KEY": "0xYourWalletPrivateKeyWithUSDC",
        "RESOURCE_SERVER_URL": "https://places-api.x402hub.xyz",
        "ENDPOINT_PATH": "/api/places/text-search"
      }
    }
  }
}
```

**Important**: Replace `/absolute/path/to/places-x402-mcp` with the actual path where you cloned the repository.

### 3. Restart Claude Desktop

Close and reopen Claude Desktop to load the MCP server.

### 4. Try It Out

Ask Claude:
- "Find coffee shops in San Francisco"
- "Search for restaurants near 37.7749,-122.4194 within 2km"
- "Look for gas stations in downtown Portland"

## Requirements

1. **Wallet Private Key**: With USDC on Base network
2. **USDC Balance**: At least $0.10 USDC recommended
3. **Base Network**: Mainnet (production) or Sepolia (testing)

### Getting USDC on Base

**Option 1: Bridge from Ethereum**
1. Visit [Base Bridge](https://bridge.base.org/)
2. Connect your wallet
3. Bridge USDC from Ethereum mainnet to Base

**Option 2: Buy on Base**
1. Use [Coinbase](https://www.coinbase.com/) to buy USDC
2. Withdraw to your Base network address

**Option 3: Testnet (Base Sepolia)**
1. Get test ETH from [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)
2. Swap for test USDC on Base Sepolia

## Available Tools

The MCP server provides 3 tools Claude can use:

### 1. search_places
Search for places using Google Places API.

**Parameters**:
- `query` (required): Search term (e.g., "pizza restaurants")
- `location` (optional): Lat,lng format (e.g., "37.7749,-122.4194")
- `radius` (optional): Search radius in meters (max 50000)

**Example**:
```
Claude: Find coffee shops in downtown Seattle
```

### 2. get_service_info
Get x402 service information and payment requirements.

**Example**:
```
Claude: What are the payment requirements for the Places API?
```

### 3. check_health
Check the health status of the Places API service.

**Example**:
```
Claude: Check if the Places API is working
```

## How X402 Payments Work

1. **Claude sends search request** → MCP server
2. **MCP server creates EIP-712 signature** → Your wallet signs locally
3. **Signature sent to API** → No gas fee for you
4. **Facilitator verifies & executes** → Pays gas fee
5. **USDC transferred** → $0.01 from your wallet to API
6. **Google Places results** → Returned to Claude

**Security Notes**:
- ✅ Private key stays local (never sent anywhere)
- ✅ EIP-712 signatures are cryptographically secure
- ✅ Each signature is single-use (anti-replay)
- ✅ Facilitator is trusted third-party (Coinbase CDP)

## Production API Details

- **URL**: https://places-api.x402hub.xyz
- **Network**: Base Mainnet
- **Token**: USDC
- **Price**: $0.01 per search
- **Protocol**: x402 v1.0
- **Facilitator**: CDP x402 Facilitator (Coinbase)

## Development

### Project Structure

```
places-x402-mcp/
├── index.ts          # Main MCP server implementation
├── package.json      # NPM package configuration
├── tsconfig.json     # TypeScript configuration
└── README.md         # This file
```

## Troubleshooting

### MCP Server Not Loading
1. Check Claude Desktop config file syntax (valid JSON)
2. Verify file path is correct for your OS
3. Restart Claude Desktop completely
4. Check Claude Desktop logs for errors

### Payment Failures
1. **Check USDC balance**: Need at least $0.01 USDC
2. **Verify network**: Must be Base mainnet (not Ethereum)
3. **Check wallet**: Private key must be valid and start with `0x`
4. **Restart Claude Desktop**: After any config changes

### API Errors
1. **Check service status**: https://places-api.x402hub.xyz/health
2. **Verify connectivity**: Test internet connection
3. **Check API URL**: Must be correct in config
4. **Try again**: Temporary network issues

## Security Best Practices

### Private Key Safety
- ⚠️ **Never share** your private key
- ⚠️ **Use dedicated wallet** with minimal funds
- ⚠️ **Rotate keys** regularly
- ⚠️ **Keep backups** secure

### Recommended Wallet Setup
1. Create new wallet specifically for MCP payments
2. Fund with only $1-5 USDC
3. Never store large amounts in this wallet
4. Monitor transactions regularly

## Support & Resources

- **Production API**: https://places-api.x402hub.xyz
- **X402 Docs**: https://docs.cdp.coinbase.com/x402/
- **MCP Protocol**: https://modelcontextprotocol.io/
- **GitHub Issues**: https://github.com/yourusername/places-x402-mcp/issues

## License

MIT License - see LICENSE file for details

## Related Projects

- [x402 Protocol](https://x402.org/) - HTTP 402 micropayment standard
- [x402-axios](https://www.npmjs.com/package/x402-axios) - Axios with payment support
- [Model Context Protocol](https://modelcontextprotocol.io/) - AI integration standard

---

**Built with ❤️ for Claude Desktop**
**Powered by x402 Protocol**
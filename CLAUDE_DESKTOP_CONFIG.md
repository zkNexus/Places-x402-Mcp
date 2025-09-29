# Claude Desktop Configuration Guide

Quick reference for configuring the X402 Places MCP Server in Claude Desktop.

## Configuration File Location

**macOS**:
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows**:
```
%APPDATA%\Claude\claude_desktop_config.json
```

## Configuration

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

### Important Notes

1. **Path**: Replace `/absolute/path/to/places-x402-mcp` with the actual path where you cloned the repository
2. **Private Key**: Your wallet must have USDC on Base network and must start with `0x`
3. **Security**: Private key stays local, never sent to servers
4. **Balance**: Keep at least $0.10 USDC for testing
5. **Network**: Uses Base mainnet (production)

## Testing the Configuration

After updating the config file:

1. **Save** the claude_desktop_config.json file
2. **Restart** Claude Desktop completely
3. **Test** by asking: "Find coffee shops in San Francisco"

### Expected Behavior

- Real Google Places results
- Payment information shown ($0.01 USDC)
- Confirmation of successful payment

## Troubleshooting

### MCP Server Not Loading

1. Check JSON syntax (use [JSONLint](https://jsonlint.com/))
2. Verify file path is correct for your OS
3. Check permissions on config file
4. Look at Claude Desktop logs

### Payment Not Working

1. **Verify private key format**: Must start with `0x`
2. **Check USDC balance**: Need at least $0.01 USDC on Base network
3. **Confirm network**: Must be Base mainnet, not Ethereum
4. **Verify path**: Ensure absolute path to repository is correct
5. **Restart required**: Must restart Claude Desktop after config changes

## Advanced Configuration

### Custom API Endpoint

To use a different x402-enabled API:

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
        "PRIVATE_KEY": "0xYourPrivateKey",
        "RESOURCE_SERVER_URL": "https://your-custom-api.com",
        "ENDPOINT_PATH": "/api/endpoint"
      }
    }
  }
}
```

### Multiple MCP Servers

You can configure multiple MCP servers in Claude Desktop:

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
        "PRIVATE_KEY": "0xYourPrivateKey",
        "RESOURCE_SERVER_URL": "https://places-api.x402hub.xyz",
        "ENDPOINT_PATH": "/api/places/text-search"
      }
    },
    "another-server": {
      "command": "node",
      "args": ["/path/to/another-server.js"]
    }
  }
}
```

## Security Recommendations

### Private Key Safety

1. **Dedicated Wallet**: Create a new wallet just for MCP payments
2. **Minimal Balance**: Keep only $1-5 USDC in this wallet
3. **Regular Monitoring**: Check transactions periodically
4. **Key Rotation**: Change keys every few months

### Config File Permissions

**macOS/Linux**:
```bash
chmod 600 ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

This ensures only your user account can read the config file.

## Getting Help

- **MCP Server Issues**: https://github.com/yourusername/places-x402-mcp/issues
- **X402 Protocol**: https://docs.cdp.coinbase.com/x402/
- **Claude Desktop**: https://claude.ai/desktop

## Example Queries

Once configured, try these with Claude:

- "Find coffee shops in San Francisco"
- "Search for restaurants near 37.7749,-122.4194"
- "Look for gas stations in downtown Portland within 5km"
- "Find highly rated pizza places in New York"
- "Check if the Places API is working"
- "What are the payment requirements?"
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.5.x   | :white_check_mark: |
| 0.4.x   | :white_check_mark: |
| < 0.4   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in the Australian History MCP Server, please report it responsibly.

### How to Report

1. **Do not** open a public GitHub issue for security vulnerabilities
2. **Email** security concerns to: security@littlebearapps.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

### Response Timeline

- **Acknowledgement:** Within 48 hours
- **Initial assessment:** Within 7 days
- **Fix timeline:** Depends on severity (critical: 24-72 hours)

### What to Expect

1. We will acknowledge your report promptly
2. We will investigate and validate the issue
3. We will work on a fix and coordinate disclosure
4. We will credit you (unless you prefer anonymity)

## Security Considerations

### API Keys

This MCP server handles API keys for external services:

- **Trove API key:** Required for Trove/NLA access
- Store API keys securely (environment variables, secrets management)
- Never commit API keys to version control
- Rotate keys if potentially compromised

### Data Sensitivity

The server accesses publicly available archival data. However:

- Some records may contain personal information
- Respect the terms of service of each data source
- Be mindful of rate limits to avoid service disruption
- Do not use harvested data in ways that violate source licenses

### Network Security

- All external API calls use HTTPS
- The server runs locally via stdio (no network listeners)
- When integrating with MCP clients, follow their security guidelines

## Dependencies

We monitor dependencies for known vulnerabilities:

- npm audit runs in CI
- Dependabot enabled for automated updates
- Critical vulnerabilities addressed promptly

## Disclosure Policy

We follow responsible disclosure practices:

1. Reporter contacts us privately
2. We assess and fix the vulnerability
3. We release a patch
4. We publicly disclose after the fix is available
5. We credit the reporter (with permission)

Thank you for helping keep Australian History MCP secure!

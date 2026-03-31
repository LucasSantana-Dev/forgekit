# Security Policy

## Reporting a Vulnerability

Report security issues to [security@forgespace.co](mailto:security@forgespace.co). Do not open a public issue.

## Scope

- **Installer scripts** (`tools/*.sh`, `tools/*.ps1`) — shell injection, insecure downloads
- **Example code** in patterns/ — hardcoded credentials, insecure practices
- **CI/CD configuration** (`.github/workflows/`) — workflow injection, secrets exposure

## Response

| Severity | Response time |
|---|---|
| Critical | 48 hours |
| High | 1 week |
| Medium/Low | Best effort |

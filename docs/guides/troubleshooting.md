# Troubleshooting

## Node ≥22 required

```bash
node --version
```

If you see `v20.*` or earlier, update via your package manager or [nodejs.org](https://nodejs.org).

## Shell compatibility

Some tools only work in bash or zsh:

```bash
echo $SHELL
```

If needed: `exec bash` or `exec zsh`

## Permission issues

If forge-kit reports errors writing to `~/.claude`:

```bash
chmod -R u+rwx ~/.claude
```

## Invalid provider combinations

Not all fallback chains are valid (e.g., Anthropic + Ollama). The setup wizard guides you to supported pairings. Verify your manual `~/.forge-setup.json` against the docs.

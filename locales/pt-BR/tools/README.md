# CLI Tools

## The Stack

| Tool | What | Why |
|------|------|-----|
| [lazygit](https://github.com/jesseduffield/lazygit) | TUI git client | Interactive staging, rebase, stash — faster than CLI |
| [fzf](https://github.com/junegunn/fzf) | Fuzzy finder | Ctrl+R history, Ctrl+T file picker, Alt+C directory jump |
| [bat](https://github.com/sharkdp/bat) | Better `cat` | Syntax highlighting, line numbers, git integration |
| [eza](https://github.com/eza-community/eza) | Better `ls` | Git status column, tree view, icons |
| [delta](https://github.com/dandavison/delta) | Better `git diff` | Syntax highlighting, side-by-side, line numbers |
| [zoxide](https://github.com/ajeetdsouza/zoxide) | Smart `cd` | Learns your directories, `z project` jumps there |
| [atuin](https://github.com/atuinsh/atuin) | Shell history | Synced across machines, searchable, timestamped |
| [btop](https://github.com/aristocratos/btop) | System monitor | CPU, memory, disk, network — catch runaway processes |
| [jq](https://github.com/jqlang/jq) | JSON processor | Parse API responses, transform data |
| [yq](https://github.com/mikefarah/yq) | YAML processor | Edit CI configs, k8s manifests |
| [fd](https://github.com/sharkdp/fd) | Better `find` | Fast, respects .gitignore |
| [ripgrep](https://github.com/BurntSushi/ripgrep) | Better `grep` | Fast, respects .gitignore |

## Recommended Aliases

```bash
alias lg='lazygit'
alias ll='eza -la --git'
alias lt='eza -la --tree --level=2 --git'
alias cat='bat'
```

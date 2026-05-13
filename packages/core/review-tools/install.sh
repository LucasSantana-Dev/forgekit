#!/usr/bin/env bash
# forge-kit review-tools installer
#
# Installs the multi-repo PR review-tools stack into the current repo:
#   - .github/workflows/review-tools.yml — caller for org-level reusable workflows
#   - .coderabbit.yaml                    — chill profile config
#   - dangerfile.ts                       — deterministic Danger.js rules (per repo-type variant)
#   - .review-tools-config.json           — version lockfile (read by drift detector)
#
# Per ADR 2026-05-10-multi-repo-review-tools-rollout.md, workflow logic
# lives once in LucasSantana-Dev/.github (reusable workflows). This script
# only writes consumer-side files; the central tag is pinned via inputs.
#
# Usage:
#   sh install.sh [options]
#
# Options:
#   --target <dir>     Target repo directory (default: pwd)
#   --variant <name>   Dangerfile variant: ts-monorepo, node, bash-iac, minimal
#                      (default: auto-detect)
#   --tag <tag>        Pin to LucasSantana-Dev/.github@<tag> (default: v1)
#   --dry-run          Print actions without writing files
#   --force            Overwrite existing files instead of skipping
#   --uninstall        Remove the 4 files (cannot remove what wasn't tracked)
#   --status           Show installation status of the target repo
#   --help             Show this help

set -e

REVIEW_TOOLS_DIR="${REVIEW_TOOLS_DIR:-$(cd "$(dirname "$0")" && pwd)}"
TEMPLATES_DIR="$REVIEW_TOOLS_DIR/templates"

TARGET="$(pwd)"
VARIANT="auto"
CENTRAL_TAG="v1"
DRY_RUN="false"
FORCE="false"
ACTION="install"

log_info() { printf '\033[36m[review-tools]\033[0m %s\n' "$*"; }
log_warn() { printf '\033[33m[review-tools] WARN:\033[0m %s\n' "$*" >&2; }
log_error() { printf '\033[31m[review-tools] ERROR:\033[0m %s\n' "$*" >&2; }
log_step() { printf '\033[35m[review-tools]\033[0m %s\n' "$*"; }

show_help() {
    sed -n '2,/^$/p' "$0" | sed 's/^# \{0,1\}//'
}

while [ "$#" -gt 0 ]; do
    case "$1" in
        --target) TARGET="$2"; shift 2 ;;
        --variant) VARIANT="$2"; shift 2 ;;
        --tag) CENTRAL_TAG="$2"; shift 2 ;;
        --dry-run) DRY_RUN="true"; shift ;;
        --force) FORCE="true"; shift ;;
        --uninstall) ACTION="uninstall"; shift ;;
        --status) ACTION="status"; shift ;;
        --help|-h) show_help; exit 0 ;;
        *) log_error "unknown argument: $1"; show_help; exit 1 ;;
    esac
done

if [ ! -d "$TARGET" ]; then
    log_error "target directory does not exist: $TARGET"
    exit 1
fi

cd "$TARGET"

# --- variant detection ------------------------------------------------------
detect_variant() {
    if [ -f "package.json" ] && [ -d "packages" ]; then
        echo "ts-monorepo"
    elif [ -f "package.json" ]; then
        echo "node"
    elif find . -maxdepth 3 -name '*.tf' -o -name '*.tfvars' 2>/dev/null | head -1 | grep -q .; then
        echo "bash-iac"
    elif [ -f "go.mod" ] || [ -f "Cargo.toml" ] || [ -f "pyproject.toml" ]; then
        echo "minimal"
    else
        echo "minimal"
    fi
}

if [ "$VARIANT" = "auto" ]; then
    VARIANT="$(detect_variant)"
    log_info "auto-detected variant: $VARIANT"
fi

# Validate variant
case "$VARIANT" in
    ts-monorepo|node|bash-iac|minimal) ;;
    *)
        log_error "unknown variant: $VARIANT (allowed: ts-monorepo, node, bash-iac, minimal)"
        exit 1
        ;;
esac

DANGERFILE_TEMPLATE="$TEMPLATES_DIR/dangerfile.${VARIANT}.ts"
if [ ! -f "$DANGERFILE_TEMPLATE" ]; then
    log_error "missing template: $DANGERFILE_TEMPLATE"
    exit 1
fi

# --- file inventory ---------------------------------------------------------
FILES_TO_INSTALL="
.github/workflows/review-tools.yml
.coderabbit.yaml
dangerfile.ts
.review-tools-config.json
"

# --- status action ----------------------------------------------------------
if [ "$ACTION" = "status" ]; then
    log_info "target: $TARGET"
    log_info "variant: $VARIANT"
    for f in $FILES_TO_INSTALL; do
        if [ -f "$f" ]; then
            printf '  \033[32m✓\033[0m %s\n' "$f"
        else
            printf '  \033[31m✗\033[0m %s (missing)\n' "$f"
        fi
    done
    if [ -f ".review-tools-config.json" ]; then
        log_info "lockfile content:"
        cat .review-tools-config.json
    fi
    exit 0
fi

# --- uninstall action -------------------------------------------------------
if [ "$ACTION" = "uninstall" ]; then
    for f in $FILES_TO_INSTALL; do
        if [ -f "$f" ]; then
            if [ "$DRY_RUN" = "true" ]; then
                log_step "[dry-run] would remove $f"
            else
                rm "$f"
                log_step "removed $f"
            fi
        fi
    done
    log_info "uninstalled (note: dangerfile.ts customizations are gone — restore from git if needed)"
    exit 0
fi

# --- install action ---------------------------------------------------------
log_info "installing review-tools into $TARGET (variant: $VARIANT, tag: $CENTRAL_TAG)"

mkdir -p .github/workflows

install_file() {
    local src="$1"
    local dst="$2"
    if [ -f "$dst" ] && [ "$FORCE" != "true" ]; then
        log_warn "skip $dst (exists; pass --force to overwrite)"
        return 0
    fi
    if [ "$DRY_RUN" = "true" ]; then
        log_step "[dry-run] would write $dst from $src"
    else
        # Substitute placeholders
        sed -e "s|@CENTRAL_TAG@|$CENTRAL_TAG|g" \
            -e "s|@VARIANT@|$VARIANT|g" \
            -e "s|@INSTALL_DATE@|$(date +%Y-%m-%d)|g" \
            "$src" > "$dst"
        log_step "wrote $dst"
    fi
}

install_file "$TEMPLATES_DIR/review-tools.yml.tmpl" ".github/workflows/review-tools.yml"
install_file "$TEMPLATES_DIR/.coderabbit.yaml.tmpl" ".coderabbit.yaml"
install_file "$DANGERFILE_TEMPLATE" "dangerfile.ts"
install_file "$TEMPLATES_DIR/.review-tools-config.json.tmpl" ".review-tools-config.json"

if [ "$DRY_RUN" = "true" ]; then
    log_info "dry-run complete — no files written"
else
    log_info "install complete"
    log_info "next steps:"
    log_info "  1. Add ANTHROPIC_API_KEY to repo Actions secrets"
    log_info "  2. Customize dangerfile.ts for repo-specific rules (recommended)"
    log_info "  3. Commit and push — workflow fires on next PR"
fi

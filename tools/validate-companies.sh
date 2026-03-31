#!/usr/bin/env bash
set -euo pipefail

COMPANIES_DIR="$(dirname "$0")/../companies"
ERRORS=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

check_frontmatter_field() {
  local file="$1"
  local field="$2"
  if ! grep -qE "^${field}:" "$file"; then
    echo -e "${RED}ERROR${NC}: Missing required field '${field}' in ${file}"
    ERRORS=$((ERRORS + 1))
  fi
}

check_section() {
  local file="$1"
  local section="$2"
  if ! grep -qF "## ${section}" "$file"; then
    echo -e "${RED}ERROR${NC}: Missing section '## ${section}' in ${file}"
    ERRORS=$((ERRORS + 1))
  fi
}

echo "Validating companies..."

for company_dir in "$COMPANIES_DIR"/*/; do
  company=$(basename "$company_dir")
  echo "  Checking company: ${company}"

  # Validate all AGENTS.md files
  while IFS= read -r -d '' agent_file; do
    agent_dir=$(dirname "$agent_file")
    agent_name=$(basename "$agent_dir")

    # Required frontmatter fields
    check_frontmatter_field "$agent_file" "name"
    check_frontmatter_field "$agent_file" "title"
    check_frontmatter_field "$agent_file" "skills"

    # Required sections
    check_section "$agent_file" "What triggers you"
    check_section "$agent_file" "What you do"
    check_section "$agent_file" "What you produce"
    check_section "$agent_file" "Who you hand off to"

    # Validate reportsTo references exist (skip if null or missing)
    if grep -qE "^reportsTo:" "$agent_file"; then
      reports_to=$(grep -E "^reportsTo:" "$agent_file" | sed 's/reportsTo: *//' | tr -d '[:space:]')
      if [ -n "$reports_to" ] && [ "$reports_to" != "null" ] && [ ! -d "${company_dir}agents/${reports_to}" ]; then
        echo -e "${RED}ERROR${NC}: Agent '${agent_name}' reportsTo '${reports_to}' but no such agent exists in ${company}/agents/"
        ERRORS=$((ERRORS + 1))
      fi
    fi
  done < <(find "$company_dir/agents" -name "AGENTS.md" -print0 2>/dev/null)

  # Validate all SKILL.md files
  while IFS= read -r -d '' skill_file; do
    check_frontmatter_field "$skill_file" "name"
  done < <(find "$company_dir/skills" -name "SKILL.md" -print0 2>/dev/null)

done

if [ "$ERRORS" -eq 0 ]; then
  echo -e "${GREEN}All company validations passed.${NC}"
else
  echo -e "${RED}${ERRORS} validation error(s) found.${NC}"
  exit 1
fi

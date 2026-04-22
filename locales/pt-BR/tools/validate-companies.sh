#!/usr/bin/env bash
set -euo pipefail

COMPANIES_DIR="$(dirname "$0")/../companies"
ERRORS=0

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

  # Required directories must exist
  if [ ! -d "${company_dir}agents" ]; then
    echo -e "${RED}ERROR${NC}: Company '${company}' missing required agents/ directory"
    ERRORS=$((ERRORS + 1))
    continue
  fi
  if [ ! -d "${company_dir}skills" ]; then
    echo -e "${RED}ERROR${NC}: Company '${company}' missing required skills/ directory"
    ERRORS=$((ERRORS + 1))
    continue
  fi

  # Collect and validate all AGENTS.md files
  agent_count=0
  while IFS= read -r -d '' agent_file; do
    agent_count=$((agent_count + 1))
    agent_name=$(basename "$(dirname "$agent_file")")

    check_frontmatter_field "$agent_file" "name"
    check_frontmatter_field "$agent_file" "title"
    check_frontmatter_field "$agent_file" "skills"

    check_section "$agent_file" "What triggers you"
    check_section "$agent_file" "What you do"
    check_section "$agent_file" "What you produce"
    check_section "$agent_file" "Who you hand off to"

    # Validate reportsTo references exist (null = hierarchy root, allowed)
    if grep -qE "^reportsTo:" "$agent_file"; then
      reports_to=$(grep -E "^reportsTo:" "$agent_file" | sed 's/reportsTo: *//' | tr -d '[:space:]')
      if [ -n "$reports_to" ] && [ "$reports_to" != "null" ] && [ ! -d "${company_dir}agents/${reports_to}" ]; then
        echo -e "${RED}ERROR${NC}: Agent '${agent_name}' reportsTo '${reports_to}' but no such agent exists in ${company}/agents/"
        ERRORS=$((ERRORS + 1))
      fi
    fi

    # Validate referenced skills exist
    while IFS= read -r skill_ref; do
      skill_ref=$(echo "$skill_ref" | sed 's/^[[:space:]]*-[[:space:]]*//' | tr -d '[:space:]')
      if [ -n "$skill_ref" ] && [ ! -d "${company_dir}skills/${skill_ref}" ]; then
        echo -e "${RED}ERROR${NC}: Agent '${agent_name}' references skill '${skill_ref}' but no such skill exists in ${company}/skills/"
        ERRORS=$((ERRORS + 1))
      fi
    done < <(awk '/^skills:/{found=1; next} found && /^  - /{print} found && !/^  - /{exit}' "$agent_file")

  done < <(find "${company_dir}agents" -name "AGENTS.md" -print0)

  if [ "$agent_count" -eq 0 ]; then
    echo -e "${RED}ERROR${NC}: Company '${company}' has no AGENTS.md files in agents/"
    ERRORS=$((ERRORS + 1))
  fi

  # Collect and validate all SKILL.md files
  skill_count=0
  while IFS= read -r -d '' skill_file; do
    skill_count=$((skill_count + 1))
    check_frontmatter_field "$skill_file" "name"
  done < <(find "${company_dir}skills" -name "SKILL.md" -print0)

  if [ "$skill_count" -eq 0 ]; then
    echo -e "${RED}ERROR${NC}: Company '${company}' has no SKILL.md files in skills/"
    ERRORS=$((ERRORS + 1))
  fi

  echo "    agents: ${agent_count}, skills: ${skill_count}"
done

if [ "$ERRORS" -eq 0 ]; then
  echo -e "${GREEN}All company validations passed.${NC}"
else
  echo -e "${RED}${ERRORS} validation error(s) found.${NC}"
  exit 1
fi

#!/usr/bin/env sh
# forge-kit: JSON merge helpers via python3 (no jq dependency)

# Merge override JSON into base JSON file, writing result to output path.
# Existing keys in base are preserved; new keys from override are added.
# Usage: json_merge base.json override.json output.json
json_merge() {
	base="$1"
	override="$2"
	output="$3"

	python3 - "$base" "$override" "$output" <<'PYEOF'
import json, sys
from pathlib import Path

base_path, override_path, out_path = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])

base_data    = json.loads(base_path.read_text()) if base_path.exists() and base_path.stat().st_size > 0 else {}
override_data = json.loads(override_path.read_text()) if override_path.exists() and override_path.stat().st_size > 0 else {}

def deep_merge(base, override):
    result = dict(base)
    for k, v in override.items():
        if k in result and isinstance(result[k], dict) and isinstance(v, dict):
            result[k] = deep_merge(result[k], v)
        elif k not in result:
            result[k] = v
    return result

merged = deep_merge(base_data, override_data)
out_path.write_text(json.dumps(merged, indent=2) + "\n")
PYEOF
}

# Add a top-level key to a JSON file if not already present (idempotent)
# Usage: json_add_key file.json key value_json
json_add_key() {
	file="$1"
	key="$2"
	value="$3"

	python3 - "$file" "$key" "$value" <<'PYEOF'
import json, sys
from pathlib import Path

path = Path(sys.argv[1])
key  = sys.argv[2]
val  = json.loads(sys.argv[3])

data = json.loads(path.read_text()) if path.exists() and path.stat().st_size > 0 else {}
if key not in data:
    data[key] = val
    path.write_text(json.dumps(data, indent=2) + "\n")
PYEOF
}

# Pretty-print a JSON file in-place
json_format() {
	python3 - "$1" <<'PYEOF'
import json, sys
from pathlib import Path
p = Path(sys.argv[1])
p.write_text(json.dumps(json.loads(p.read_text()), indent=2) + "\n")
PYEOF
}

# Extract a section from rules.md by section name
# Usage: extract_section rules.md identity
# Outputs the content between <!-- section: X --> and <!-- /section -->
extract_section() {
	rules_file="$1"
	section_name="$2"

	python3 - "$rules_file" "$section_name" <<'PYEOF'
import sys, re
from pathlib import Path

content = Path(sys.argv[1]).read_text()
name    = sys.argv[2]

pattern = r'<!--\s*section:\s*' + re.escape(name) + r'\s*-->(.*?)<!--\s*/section\s*-->'
match   = re.search(pattern, content, re.DOTALL)
if match:
    sys.stdout.write(match.group(1).strip())
PYEOF
}

# Extract multiple sections from rules.md
# Usage: extract_sections rules.md "identity code-standards workflow"
extract_sections() {
	rules_file="$1"
	sections="$2"

	for section in $sections; do
		content="$(extract_section "$rules_file" "$section")"
		if [ -n "$content" ]; then
			printf '## %s\n\n%s\n\n' "$(printf '%s' "$section" | tr '-' ' ' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1))substr($i,2)}1')" "$content"
		fi
	done
}

install_skills() {
	skills_src="$1"
	skills_dst="$2"

	if [ ! -d "$skills_src" ]; then
		return
	fi

	ensure_dir "$skills_dst"

	if [ "${FORGE_DRY_RUN:-false}" != "true" ]; then
		: >"$skills_dst/.forge-kit"
	fi

	count=0
	for skill_file in "$skills_src"/*.md; do
		if [ -f "$skill_file" ]; then
			filename="$(basename "$skill_file")"
			dst="$skills_dst/$filename"

			if [ -f "$dst" ]; then
				old_sha="$(file_sha256 "$dst")"
				new_sha="$(file_sha256 "$skill_file")"
				if [ "$old_sha" = "$new_sha" ]; then
					log_dim "  (skip) $filename"
					continue
				fi
			fi

			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "  [DRY RUN] Would copy $filename"
			else
				cp "$skill_file" "$dst"
				count=$((count + 1))
			fi
		fi
	done

	if [ "${FORGE_DRY_RUN:-false}" != "true" ]; then
		log_success "$count skills installed"
	fi
}

uninstall_skills() {
	skills_dst="$1"

	if [ -d "$skills_dst" ]; then
		if [ -f "$skills_dst/.forge-kit" ] || grep -qm1 "^---" "$skills_dst"/*.md 2>/dev/null; then
			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "[DRY RUN] Would remove $skills_dst/"
			else
				rm -rf "$skills_dst"
				log_success "Removed skills directory"
			fi
		fi
	fi
}

#!/usr/bin/env sh
# forge-kit: OS detection and path normalization

get_os() {
	case "$(uname -s 2>/dev/null)" in
	Darwin) printf 'macos' ;;
	Linux) printf 'linux' ;;
	MINGW* | MSYS* | CYGWIN*) printf 'windows' ;;
	*) printf 'unknown' ;;
	esac
}

get_home() {
	printf '%s' "${HOME:-$USERPROFILE}"
}

# Resolve a config dir that may vary by OS/tool version
# Usage: resolve_dir "/primary/path" "/fallback/path"
resolve_dir() {
	if [ -d "$1" ]; then
		printf '%s' "$1"
	elif [ -d "$2" ]; then
		printf '%s' "$2"
	else
		printf '%s' "$1"
	fi
}

# Ensure a directory exists, creating it if needed
ensure_dir() {
	[ -d "$1" ] || mkdir -p "$1"
}

# SHA256 of a file (cross-platform)
file_sha256() {
	if command -v sha256sum >/dev/null 2>&1; then
		sha256sum "$1" | cut -d' ' -f1
	elif command -v shasum >/dev/null 2>&1; then
		shasum -a 256 "$1" | cut -d' ' -f1
	else
		return 1
	fi
}

# Return 0 if two files have the same content
files_equal() {
	if command -v cmp >/dev/null 2>&1; then
		cmp -s "$1" "$2"
		return $?
	fi

	h1="$(file_sha256 "$1")" || return 1
	h2="$(file_sha256 "$2")" || return 1
	[ "$h1" = "$h2" ]
}

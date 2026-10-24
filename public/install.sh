#!/bin/sh
# GoPort CLI installer for Linux and macOS.
#
#   curl -fsSL https://goport.uz/install.sh | sh
#
# Downloads the latest release for this system from GitHub, checks it against
# the release's checksums.txt (SHA-256) and installs it as /usr/local/bin/goport.
# Set GOPORT_INSTALL_DIR to install somewhere else, e.g. $HOME/.local/bin.

set -eu

RELEASE_URL="https://github.com/muhammad-deve/GoPort/releases/latest/download"
INSTALL_DIR="${GOPORT_INSTALL_DIR:-/usr/local/bin}"

say() {
	printf '%s\n' "$*"
}

fail() {
	printf 'goport install: %s\n' "$*" >&2
	exit 1
}

download() {
	if command -v curl >/dev/null 2>&1; then
		curl -fsSL --proto '=https' --tlsv1.2 --retry 2 -o "$2" "$1" || fail "download failed: $1"
	elif command -v wget >/dev/null 2>&1; then
		wget -q -O "$2" "$1" || fail "download failed: $1"
	else
		fail "curl or wget is needed to download GoPort"
	fi
}

sha256_of() {
	if command -v sha256sum >/dev/null 2>&1; then
		sha256sum "$1" | awk '{print $1}'
	elif command -v shasum >/dev/null 2>&1; then
		shasum -a 256 "$1" | awk '{print $1}'
	else
		fail "sha256sum or shasum is needed to verify the download"
	fi
}

detect_asset() {
	os=$(uname -s)
	arch=$(uname -m)
	case "$os" in
	Linux) os=linux ;;
	Darwin) os=darwin ;;
	MINGW* | MSYS* | CYGWIN* | Windows*)
		fail "this script is for Linux and macOS. On Windows run: choco install goport (or get the installer from https://goport.uz)"
		;;
	*) fail "unsupported operating system: $os" ;;
	esac
	case "$arch" in
	x86_64 | amd64) arch=amd64 ;;
	arm64 | aarch64) arch=arm64 ;;
	*) fail "unsupported CPU architecture: $arch" ;;
	esac
	# An x86_64 shell under Rosetta on Apple Silicon: use the native build.
	if [ "$os" = darwin ] && [ "$arch" = amd64 ] && [ "$(sysctl -n sysctl.proc_translated 2>/dev/null || echo 0)" = 1 ]; then
		arch=arm64
	fi
	if [ "$os" = linux ] && [ "$arch" = arm64 ]; then
		fail "there is no Linux arm64 build of GoPort yet. See https://github.com/muhammad-deve/GoPort/releases for the builds that exist."
	fi
	echo "goport-$os-$arch"
}

main() {
	asset=$(detect_asset)

	tmp=$(mktemp -d 2>/dev/null || mktemp -d -t goport)
	trap 'rm -rf "$tmp"' EXIT
	trap 'rm -rf "$tmp"; exit 1' HUP INT TERM

	say "Downloading $asset..."
	download "$RELEASE_URL/$asset" "$tmp/$asset"
	download "$RELEASE_URL/checksums.txt" "$tmp/checksums.txt"

	expected=$(awk -v name="$asset" '{ sub(/\r$/, "") } $2 == name || $2 == "*" name { print tolower($1); exit }' "$tmp/checksums.txt")
	[ -n "$expected" ] || fail "checksums.txt has no entry for $asset"
	actual=$(sha256_of "$tmp/$asset" | tr 'A-F' 'a-f')
	if [ "$actual" != "$expected" ]; then
		fail "checksum mismatch for $asset (expected $expected, got $actual). Nothing was installed."
	fi
	say "Checksum verified."

	target="$INSTALL_DIR/goport"
	if [ -L "$target" ]; then
		fail "$target is a symlink, probably from Homebrew. Update with: brew upgrade goport (or set GOPORT_INSTALL_DIR)"
	fi

	sudo=""
	mkdir -p "$INSTALL_DIR" 2>/dev/null || true
	if [ ! -d "$INSTALL_DIR" ] || [ ! -w "$INSTALL_DIR" ]; then
		if [ "$(id -u)" != 0 ]; then
			command -v sudo >/dev/null 2>&1 || fail "cannot write to $INSTALL_DIR. Run as root, or set GOPORT_INSTALL_DIR to a folder you own, e.g. GOPORT_INSTALL_DIR=\$HOME/.local/bin"
			say "Installing to $INSTALL_DIR needs administrator rights; using sudo."
			sudo="sudo"
		fi
	fi

	# Copy next to the target, then rename: the swap is atomic, so a running
	# goport or an interrupted install never sees a half-written file.
	staged="$INSTALL_DIR/.goport.new.$$"
	$sudo mkdir -p "$INSTALL_DIR" || fail "could not create $INSTALL_DIR"
	if ! $sudo cp "$tmp/$asset" "$staged" || ! $sudo chmod 755 "$staged" || ! $sudo mv -f "$staged" "$target"; then
		$sudo rm -f "$staged" 2>/dev/null || true
		fail "could not install to $target"
	fi

	if version=$("$target" --version 2>/dev/null); then
		say "Installed $version to $target"
	else
		say "Installed goport to $target"
	fi
	case ":$PATH:" in
	*":$INSTALL_DIR:"*) ;;
	*) say "Note: $INSTALL_DIR is not on your PATH. Add it, or run $target directly." ;;
	esac
	say "Get started: goport http 3000"
}

main "$@"

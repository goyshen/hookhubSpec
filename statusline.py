#!/usr/bin/env python3
"""Claude Code statusline: model, context usage, output style and git branch."""

import json
import subprocess
import sys


def git_branch(cwd: str) -> str:
    if not cwd:
        return ""
    try:
        result = subprocess.run(
            ["git", "-C", cwd, "branch", "--show-current"],
            capture_output=True,
            text=True,
            timeout=2,
        )
    except (OSError, subprocess.SubprocessError):
        return ""
    return result.stdout.strip() if result.returncode == 0 else ""


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        data = {}

    model = (data.get("model") or {}).get("display_name") or "Claude"
    used = (data.get("context_window") or {}).get("used_percentage")
    used = 0 if used is None else round(used)
    output_style = (data.get("output_style") or {}).get("name") or "default"
    workspace = data.get("workspace") or {}
    cwd = workspace.get("current_dir") or data.get("cwd") or ""
    branch = git_branch(cwd)

    # Dim cyan ANSI color for the label, reset at the end.
    parts = [
        f"[{model}] {used}% context",
        f"\033[2;36mstyle:\033[0m {output_style}",
    ]
    if branch:
        parts.append(f"branch: {branch}")
    print(" | ".join(parts))


if __name__ == "__main__":
    main()

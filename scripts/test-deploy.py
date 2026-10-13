#!/usr/bin/env python3
"""Exercise the real publish command against an isolated repository/local remote."""
import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUTHOR = "konglong <konglong@com>"


def run(args, cwd, env=None, success=True):
    result = subprocess.run(args, cwd=cwd, env=env, text=True, capture_output=True)
    if success and result.returncode:
        raise AssertionError(f"{args} failed:\n{result.stdout}\n{result.stderr}")
    if not success and result.returncode == 0:
        raise AssertionError(f"{args} unexpectedly passed")
    return result


def git(repo, *args):
    return run(["git", *args], repo).stdout.strip()


def main():
    hugo = os.environ.get("HUGO_BIN", "hugo")
    env = dict(os.environ, HUGO_BIN=hugo, HUGO_BASEURL="http://127.0.0.1:9999/")
    env.update(GIT_AUTHOR_NAME="Fixture Bot", GIT_AUTHOR_EMAIL="fixture@example.invalid",
               GIT_COMMITTER_NAME="Fixture Bot", GIT_COMMITTER_EMAIL="fixture@example.invalid")
    (ROOT / ".build").mkdir(exist_ok=True)
    results = []
    with tempfile.TemporaryDirectory(prefix="deploy-test-", dir=ROOT / ".build") as temporary:
        root = Path(temporary)
        repo, remote = root / "repo", root / "remote.git"
        repo.mkdir()
        for name in (".gitignore", "README.md", "scripts"):
            source, destination = ROOT / name, repo / name
            if source.is_dir():
                shutil.copytree(source, destination, ignore=shutil.ignore_patterns("__pycache__"))
            else:
                shutil.copy2(source, destination)
        shutil.copytree(ROOT / "blog", repo / "blog", ignore=shutil.ignore_patterns(
            "themes", "public", "docs", "resources", ".hugo_build.lock"))
        run(["git", "init", "--bare", str(remote)], root)
        run(["git", "init", "--initial-branch=main"], repo)
        git(repo, "remote", "add", "origin", str(remote))
        git(repo, "add", ".")
        run(["git", "commit", "-m", "fixture baseline"], repo, env)
        git(repo, "push", "origin", "main")
        baseline = git(repo, "rev-parse", "HEAD")
        publish = ["bash", "blog/deploy.sh", "fixture: publish six projects"]

        unrelated = repo / "unrelated.txt"
        unrelated.write_text("must remain outside publication\n")
        git(repo, "add", "unrelated.txt")
        rejected = run(publish, repo, env, success=False)
        assert "Unrelated staged file" in rejected.stderr
        assert git(repo, "rev-parse", "HEAD") == baseline
        assert not (repo / "docs").exists(), "Staged-file refusal must happen before build"
        git(repo, "reset", "--", "unrelated.txt")
        results.append("unrelated-staged-file rejected before build")

        run(publish, repo, env)
        published = git(repo, "rev-parse", "HEAD")
        assert published != baseline, "Publish must create a real commit"
        assert git(remote, "rev-parse", "main") == published, "Publish must push to the local remote"
        assert git(repo, "show", "-s", "--format=%an <%ae>") == AUTHOR
        assert git(repo, "show", "-s", "--format=%cn <%ce>") == AUTHOR
        assert unrelated.read_text() == "must remain outside publication\n"
        run(["git", "ls-files", "--error-unmatch", "unrelated.txt"], repo, success=False)
        for entry in [repo / "docs/index.html", *(repo / "docs/projects").glob("*/index.html")]:
            assert "127.0.0.1:9999" not in entry.read_text(), "Preview URL leaked into publication"
        results.append("real build/check/commit/push; exact identity; unrelated file preserved; preview URL stripped")

        run(publish, repo, env)
        assert git(repo, "rev-parse", "HEAD") == published
        assert git(remote, "rev-parse", "main") == published
        results.append("second publication is idempotent")

        failing_hugo = root / "failing-hugo"
        failing_hugo.write_text('#!/bin/sh\nif [ "$1" = version ]; then echo "hugo v0.111.3 fixture"; else exit 43; fi\n')
        failing_hugo.chmod(0o755)
        with (repo / "blog/config.toml").open("a") as config:
            config.write("\n# pending source change\n")
        run(publish, repo, dict(env, HUGO_BIN=str(failing_hugo)), success=False)
        assert git(repo, "rev-parse", "HEAD") == published
        assert git(remote, "rev-parse", "main") == published
        assert not git(repo, "diff", "--cached", "--name-only")
        results.append("failed build stops staging, commit and push")

        fixture = repo / "scripts/project-fixtures.json"
        original = fixture.read_text()
        broken = json.loads(original)
        broken["projects"][0]["title"] = "deliberately wrong expected title"
        fixture.write_text(json.dumps(broken))
        rejected = run(publish, repo, env, success=False)
        assert "Wrong project title" in rejected.stderr
        assert git(repo, "rev-parse", "HEAD") == published
        assert git(remote, "rev-parse", "main") == published
        assert not git(repo, "diff", "--cached", "--name-only")
        fixture.write_text(original)
        git(repo, "restore", "blog/config.toml")
        results.append("failed publication check stops staging, commit and push")

        # Simulate a commit whose prior push failed. An unchanged build must still push it.
        with (repo / "README.md").open("a") as readme:
            readme.write("\nPending push fixture.\n")
        git(repo, "add", "README.md")
        run(["git", "commit", "-m", "fixture pending push"], repo, env)
        pending = git(repo, "rev-parse", "HEAD")
        assert git(remote, "rev-parse", "main") != pending
        run(publish, repo, env)
        assert git(repo, "rev-parse", "HEAD") == pending
        assert git(remote, "rev-parse", "main") == pending
        results.append("unchanged build retries pending push")
    print(json.dumps({"status": "passed", "scenarios": results, "fixtures_cleaned": True}, indent=2))


if __name__ == "__main__":
    main()

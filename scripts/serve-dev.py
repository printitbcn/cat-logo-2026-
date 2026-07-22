#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Static file server with dev API: list projects, reveal in Finder, open in browser."""
from __future__ import annotations

import json
import os
import subprocess
import sys
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent.parent
PROJECTS_FILE = ROOT / "projects.json"
HOST = os.environ.get("PRINTIT_SERVE_HOST", "0.0.0.0")
PORT = int(os.environ.get("PRINTIT_SERVE_PORT", "8080"))


def load_manifest() -> dict[str, Any]:
    if not PROJECTS_FILE.is_file():
        return {"scanRoots": [], "projects": []}
    with PROJECTS_FILE.open(encoding="utf-8") as fh:
        return json.load(fh)


def resolve_folder(folder: str) -> Path:
    return (ROOT / folder).resolve()


def allowed_roots(manifest: dict[str, Any]) -> list[Path]:
    roots = {ROOT.resolve()}
    for rel in manifest.get("scanRoots", []):
        try:
            roots.add((ROOT / rel).resolve())
        except OSError:
            pass
    for entry in manifest.get("projects", []):
        folder = entry.get("folder")
        if folder:
            try:
                roots.add(resolve_folder(folder))
            except OSError:
                pass
    return sorted(roots)


def path_is_allowed(path: Path, roots: list[Path]) -> bool:
    try:
        resolved = path.resolve()
    except OSError:
        return False
    return any(resolved == root or root in resolved.parents for root in roots)


def normalize_project(entry: dict[str, Any], manifest: dict[str, Any]) -> dict[str, Any] | None:
    folder_raw = entry.get("folder")
    if not folder_raw:
        return None
    try:
        folder = resolve_folder(folder_raw)
    except OSError:
        return None
    if not folder.is_dir():
        return None

    entry_file = entry.get("entry") or "index.html"
    entry_path = folder / entry_file
    has_entry = entry_path.is_file()

    browser_url = entry.get("browserUrl")
    if not browser_url and has_entry and entry.get("id") == "prop-catalogo":
        browser_url = f"http://127.0.0.1:{PORT}/"

    return {
        "id": entry.get("id") or folder.name,
        "name": entry.get("name") or folder.name,
        "description": entry.get("description") or "",
        "group": entry.get("group") or "Otros",
        "folder": str(folder),
        "entry": entry_file,
        "hasEntry": has_entry,
        "browserUrl": browser_url or "",
        "isCurrentRepo": folder.resolve() == ROOT.resolve(),
    }


def discover_projects(manifest: dict[str, Any], known_ids: set[str]) -> list[dict[str, Any]]:
    found: list[dict[str, Any]] = []
    for rel in manifest.get("scanRoots", []):
        scan_root = (ROOT / rel).resolve()
        if not scan_root.is_dir():
            continue
        try:
            children = list(scan_root.iterdir())
        except OSError:
            continue
        for child in children:
            if not child.is_dir() or child.name.startswith("."):
                continue
            index = child / "index.html"
            if not index.is_file():
                continue
            slug = child.name.strip().lower().replace(" ", "-")
            pid = f"discovered-{slug}"
            if pid in known_ids:
                continue
            found.append(
                {
                    "id": pid,
                    "name": child.name.strip(),
                    "description": "Auto-detected (index.html)",
                    "group": scan_root.name.strip() or "Detectados",
                    "folder": str(child.resolve()),
                    "entry": "index.html",
                    "hasEntry": True,
                    "browserUrl": "",
                    "isCurrentRepo": child.resolve() == ROOT.resolve(),
                    "discovered": True,
                }
            )
            known_ids.add(pid)
    return found


def build_project_list() -> list[dict[str, Any]]:
    manifest = load_manifest()
    projects: list[dict[str, Any]] = []
    known_ids: set[str] = set()
    known_folders: set[str] = set()

    for entry in manifest.get("projects", []):
        normalized = normalize_project(entry, manifest)
        if not normalized:
            continue
        projects.append(normalized)
        known_ids.add(normalized["id"])
        known_folders.add(str(Path(normalized["folder"]).resolve()))

    for discovered in discover_projects(manifest, known_ids):
        folder = str(Path(discovered["folder"]).resolve())
        if folder in known_folders:
            continue
        projects.append(discovered)
        known_folders.add(folder)

    projects.sort(key=lambda p: (p.get("group", ""), p.get("name", "").lower()))
    return projects


def find_project(project_id: str) -> dict[str, Any] | None:
    for project in build_project_list():
        if project["id"] == project_id:
            return project
    return None


def run_open(target: str) -> None:
    if sys.platform == "darwin":
        subprocess.run(["open", target], check=False)
        return
    if sys.platform == "win32":
        os.startfile(target)  # noqa: S606
        return
    subprocess.run(["xdg-open", target], check=False)


class DevHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt: str, *args: Any) -> None:
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def _send_json(self, status: int, payload: Any) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json_body(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0:
            return {}
        raw = self.rfile.read(length)
        try:
            data = json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            return {}
        return data if isinstance(data, dict) else {}

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/projects":
            query = parse_qs(parsed.query)
            include_missing = query.get("all", ["0"])[0] == "1"
            projects = build_project_list()
            if not include_missing:
                projects = [p for p in projects if p.get("hasEntry") or Path(p["folder"]).is_dir()]
            self._send_json(200, {"projects": projects, "serverPort": PORT})
            return
        super().do_GET()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        manifest = load_manifest()
        roots = allowed_roots(manifest)
        body = self._read_json_body()

        if parsed.path == "/api/reveal":
            project = None
            if body.get("id"):
                project = find_project(str(body["id"]))
            target_path = None
            if project:
                target_path = Path(project["folder"])
            elif body.get("path"):
                target_path = Path(str(body["path"]))
            if not target_path or not path_is_allowed(target_path, roots):
                self._send_json(403, {"ok": False, "error": "Path not allowed"})
                return
            if not target_path.exists():
                self._send_json(404, {"ok": False, "error": "Folder does not exist"})
                return
            if sys.platform == "darwin":
                subprocess.run(["open", "-R", str(target_path)], check=False)
            else:
                run_open(str(target_path))
            self._send_json(200, {"ok": True, "path": str(target_path)})
            return

        if parsed.path == "/api/open-browser":
            project = find_project(str(body.get("id", ""))) if body.get("id") else None
            if not project:
                self._send_json(404, {"ok": False, "error": "Project not found"})
                return
            folder = Path(project["folder"])
            entry = folder / (project.get("entry") or "index.html")
            url = (project.get("browserUrl") or "").strip()
            if url:
                run_open(url)
                self._send_json(200, {"ok": True, "opened": url, "mode": "url"})
                return
            if entry.is_file():
                run_open(str(entry))
                self._send_json(200, {"ok": True, "opened": str(entry), "mode": "file"})
                return
            self._send_json(404, {"ok": False, "error": "No URL or index.html"})
            return

        self.send_error(404)


def main() -> None:
    server = ThreadingHTTPServer((HOST, PORT), DevHandler)
    print(f"Dev server: http://127.0.0.1:{PORT}/")
    print(f"Projects hub: http://127.0.0.1:{PORT}/projects.html")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()

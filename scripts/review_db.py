# -*- coding: utf-8 -*-
"""SQLite helpers for Print It review sticky pins."""
from __future__ import annotations

import hashlib
import sqlite3
import uuid
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "review" / "data" / "pins.sqlite"
SCHEMA_PATH = ROOT / "review" / "SCHEMA.sql"


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    schema = SCHEMA_PATH.read_text(encoding="utf-8")
    with _connect() as conn:
        conn.executescript(schema)
        conn.commit()


def sha256_hex(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def login(user_id: str, password: str) -> dict[str, Any] | None:
    init_db()
    digest = sha256_hex(password)
    with _connect() as conn:
        row = conn.execute(
            "SELECT id, display_name, color FROM reviewers WHERE id = ? AND password_hash = ?",
            (user_id, digest),
        ).fetchone()
    if not row:
        return None
    return {
        "ok": True,
        "user": row["id"],
        "display_name": row["display_name"],
        "color": row["color"],
    }


def _pin_dict(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "page_key": row["page_key"],
        "x_pct": float(row["x_pct"]),
        "y_pct": float(row["y_pct"]),
        "number": int(row["number"]),
        "author": row["author"],
        "body": row["body"] or "",
        "status": row["status"],
        "hidden": bool(row["hidden"]),
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


def list_pins(page_key: str) -> list[dict[str, Any]]:
    init_db()
    with _connect() as conn:
        rows = conn.execute(
            "SELECT * FROM catalog_pins WHERE page_key = ? ORDER BY number ASC",
            (page_key,),
        ).fetchall()
    return [_pin_dict(r) for r in rows]


def next_number(page_key: str) -> int:
    init_db()
    with _connect() as conn:
        row = conn.execute(
            "SELECT COALESCE(MAX(number), 0) AS m FROM catalog_pins WHERE page_key = ?",
            (page_key,),
        ).fetchone()
    return int(row["m"] or 0) + 1


def create_pin(payload: dict[str, Any]) -> dict[str, Any]:
    init_db()
    page_key = str(payload.get("page_key") or "")
    author = str(payload.get("author") or "")
    if not page_key or not author:
        raise ValueError("page_key and author required")
    x_pct = float(payload.get("x_pct", 50))
    y_pct = float(payload.get("y_pct", 50))
    x_pct = max(0.0, min(100.0, x_pct))
    y_pct = max(0.0, min(100.0, y_pct))
    number = int(payload.get("number") or next_number(page_key))
    body = str(payload.get("body") or "")
    pin_id = str(uuid.uuid4())
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO catalog_pins (id, page_key, x_pct, y_pct, number, author, body, status, hidden)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 0)
            """,
            (pin_id, page_key, x_pct, y_pct, number, author, body),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM catalog_pins WHERE id = ?", (pin_id,)).fetchone()
    return _pin_dict(row)


def update_pin(pin_id: str, patch: dict[str, Any]) -> dict[str, Any] | None:
    init_db()
    allowed = {"body", "status", "hidden", "x_pct", "y_pct"}
    fields: list[str] = []
    values: list[Any] = []
    for key, val in patch.items():
        if key not in allowed:
            continue
        if key == "hidden":
            values.append(1 if val else 0)
        elif key == "status":
            if val not in ("pending", "resolved"):
                continue
            values.append(val)
        else:
            values.append(val)
        fields.append(f"{key} = ?")
    if not fields:
        raise ValueError("no valid fields")
    fields.append("updated_at = datetime('now')")
    values.append(pin_id)
    with _connect() as conn:
        cur = conn.execute(
            f"UPDATE catalog_pins SET {', '.join(fields)} WHERE id = ?",
            values,
        )
        if cur.rowcount == 0:
            return None
        conn.commit()
        row = conn.execute("SELECT * FROM catalog_pins WHERE id = ?", (pin_id,)).fetchone()
    return _pin_dict(row) if row else None


def delete_pin(pin_id: str) -> bool:
    init_db()
    with _connect() as conn:
        cur = conn.execute("DELETE FROM catalog_pins WHERE id = ?", (pin_id,))
        conn.commit()
        return cur.rowcount > 0

"""
Vercel Serverless Function entrypoint for CYBERPRO.

Maps dynamic routes (/api/*, /lms, /admin, /admin/crm, /healthz, /uploads/*)
into server.Handler using Vercel's native BaseHTTPRequestHandler support.
"""

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

os.environ.setdefault("VERCEL", "1")
os.environ.setdefault("CYBERPRO_COOKIE_SECURE", "1")
os.environ.setdefault("CYBERPRO_TRUST_PROXY", "1")

import server  # noqa: E402

server.ensure_db_initialized()


class handler(server.Handler):
    """Vercel Python Runtime handler entrypoint."""
    pass

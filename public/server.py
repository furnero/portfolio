#!/usr/bin/env python3

import http.server
import socketserver
import os
from urllib.parse import urlparse, unquote
from pathlib import Path

PORT = 8050
BASE = Path(__file__).parent

class SecureHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = unquote(parsed_path.path)

        # Basic security checks
        if path.endswith("/") and path != "/":
            self.send_error(403, "Directory listing disabled")
            return
        
        if "/." in path or path.startswith("/."):
            self.send_error(403, "Access denied")
            return

        blocked_extensions = [".htaccess", ".env", ".git", ".py", ".sh", ".sql", ".bak", ".conf", ".ds_store"]
        if any(path.lower().endswith(ext) for ext in blocked_extensions):
            self.send_error(403, "Access denied")
            return

        if ".." in path:
            self.send_error(403, "Access denied")
            return

        # Default to index.html for directory access
        file_path = self.translate_path(path)
        if os.path.isdir(file_path):
            index_path = os.path.join(file_path, "index.html")
            if os.path.exists(index_path):
                # Redirect internal logic to serve index.html without changing URL
                path = path.rstrip("/") + "/index.html"
                self.path = path
            else:
                self.send_error(403, "Directory listing disabled")
                return

        return super().do_GET()

    def end_headers(self):
        # Security headers
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-XSS-Protection", "1; mode=block")
        self.send_header("Cache-Control", "no-cache, must-revalidate")
        # CORS (optional, good for local dev if fetching assets across ports)
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

    def log_message(self, format, *args):
        # Custom logging format
        print(f"{self.address_string()} - {format % args}")

def main():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), SecureHTTPRequestHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        print("Press Ctrl+C to stop")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
        finally:
            httpd.server_close()

if __name__ == "__main__":
    main()

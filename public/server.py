#!/usr/bin/env python3
import http.server
import socketserver
import os
from urllib.parse import urlparse, unquote
from pathlib import Path

PORT = 8050
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), SecureHTTPRequestHandler) as httpd:
    httpd.serve_forever()
with socketserver.TCPServer(("", PORT), SecureHTTPRequestHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()
BASE = Path(__file__).parent
BOMB_DIR = BASE / "htmlbomb"

class SecureHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = unquote(parsed_path.path)
        if path == "/htmlbomb/bomb.html":
            accept = self.headers.get("Accept-Encoding", "")
            try:
                if "gzip" in accept:
                    data = (BOMB_DIR / "bomb.html.gz").read_bytes()
                    self.send_response(200)
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                    self.send_header("Content-Encoding", "gzip")
                    self.send_header("Content-Length", str(len(data)))
                    self.end_headers()
                    self.wfile.write(data)
                else:
                    data = (BOMB_DIR / "bomb.html").read_bytes()
                    self.send_response(200)
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                    self.send_header("Content-Length", str(len(data)))
                    self.end_headers()
                    self.wfile.write(data)
            except FileNotFoundError:
                self.send_error(404, "Bomb file not found")
            return
        if path.endswith('/') and path != '/':
            self.send_error(403, "Directory listing disabled")
            return
        if '/.' in path or path.startswith('/.'):
            self.send_error(403, "Access denied")
            return
        blocked_extensions = ['.htaccess', '.env', '.git', '.py', '.sh', '.sql', '.bak', '.conf']
        if any(path.endswith(ext) for ext in blocked_extensions):
            self.send_error(403, "Access denied")
            return
        if '..' in path:
            self.send_error(403, "Access denied")
            return
        file_path = self.translate_path(path)
        if os.path.isdir(file_path):
            index_path = os.path.join(file_path, 'index.html')
            if os.path.exists(index_path):
                path = path.rstrip('/') + '/index.html'
                self.path = path
            else:
                self.send_error(403, "Directory listing disabled")
                return
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

    def end_headers(self):
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Cache-Control', 'no-cache, must-revalidate')
        http.server.SimpleHTTPRequestHandler.end_headers(self)

    def log_message(self, format, *args):
        print(f"{self.address_string()} - {format % args}")

with socketserver.TCPServer(("", PORT), SecureHTTPRequestHandler) as httpd:
    print(f"Server running at http://localhost:{PORT}")
    print(f"Press Ctrl+C to stop - Use a screen window to keep this running.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Server stopped")

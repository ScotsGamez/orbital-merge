#!/usr/bin/env python3
"""
Orbital Merge - Local Network Game & Issue Tracker Server
Serves static files and syncs issues between all connected LAN devices and FEATURE_TRACKER.md.
"""
import http.server
import socketserver
import json
import os
import sys

PORT = 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ISSUES_FILE = os.path.join(BASE_DIR, 'issues.json')
TRACKER_MD = os.path.join(BASE_DIR, 'FEATURE_TRACKER.md')

def load_issues():
    if os.path.exists(ISSUES_FILE):
        try:
            with open(ISSUES_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return []

def save_issues(issues):
    with open(ISSUES_FILE, 'w', encoding='utf-8') as f:
        json.dump(issues, f, indent=2)

    # Sync to FEATURE_TRACKER.md
    try:
        with open(TRACKER_MD, 'r', encoding='utf-8') as f:
            content = f.read()

        # Generate active table rows
        rows = []
        for issue in issues:
            status_tag = '✅ **Resolved**' if issue.get('status') == 'Resolved' else '💡 **Open**'
            rows.append(f"| **#{issue.get('id')}** | **{issue.get('title')}** | `{issue.get('type')}` | {status_tag} | {issue.get('desc')} |")

        table_header = "| ID | Title | Type | Status | Description |\n| :--- | :--- | :--- | :--- | :--- |"
        new_table = table_header + "\n" + "\n".join(rows)

        # Replace active table
        start_marker = "## 🚀 Active Feature & Issue Board\n\n"
        end_marker = "\n\n---\n\n## 📝 How to Submit New Ideas & Bugs"

        if start_marker in content and end_marker in content:
            pre = content.split(start_marker)[0] + start_marker
            post = end_marker + content.split(end_marker)[1]
            updated_content = pre + new_table + post
            with open(TRACKER_MD, 'w', encoding='utf-8') as f:
                f.write(updated_content)
    except Exception as e:
        print(f"Error syncing FEATURE_TRACKER.md: {e}", file=sys.stderr)

class OrbitalHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        if self.path == '/api/issues':
            issues = load_issues()
            payload = json.dumps(issues).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(payload)))
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(payload)
            return

        super().do_GET()

    def do_POST(self):
        if self.path == '/api/issues':
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            try:
                data = json.loads(body.decode('utf-8'))
                issues = load_issues()
                new_id = (max([i.get('id', 0) for i in issues]) if issues else 0) + 1
                new_issue = {
                    'id': new_id,
                    'title': data.get('title', 'Untitled'),
                    'type': data.get('type', 'Feature Request'),
                    'status': 'Open',
                    'desc': data.get('desc', '')
                }
                issues.append(new_issue)
                save_issues(issues)

                resp = json.dumps({'success': True, 'issue': new_issue}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(resp)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(resp)
                return
            except Exception as e:
                err = json.dumps({'error': str(e)}).encode('utf-8')
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(err)))
                self.end_headers()
                self.wfile.write(err)
                return

        self.send_error(404, 'Endpoint Not Found')

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('0.0.0.0', PORT), OrbitalHandler) as httpd:
        print(f"Orbital Merge server live on http://0.0.0.0:{PORT}")
        httpd.serve_forever()

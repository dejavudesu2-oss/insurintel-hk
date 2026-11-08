"""
scripts/capture_phase_b_screenshots.py
Python script to capture the 6 required screenshots using Headless Chrome
"""
import os
import sys
import time
import subprocess
import shutil
import http.server
import socketserver
import threading

PORT = 3333
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DIST_DIR = os.path.join(REPO_ROOT, "dist")
SCREENSHOTS_DIR = os.path.join(DIST_DIR, "screenshots")
ARTIFACTS_SCREENSHOTS_DIR = r"C:\Users\rain2\.gemini\antigravity\brain\1b870b1c-62ef-43c1-aaaf-3caf86d37e28\screenshots"
TEMP_USER_DATA = r"C:\Users\rain2\AppData\Local\Temp\chrome_shot_data"

os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
os.makedirs(ARTIFACTS_SCREENSHOTS_DIR, exist_ok=True)
os.makedirs(TEMP_USER_DATA, exist_ok=True)

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR, **kwargs)

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"[Server] Serving {DIST_DIR} on http://localhost:{PORT}")
        httpd.serve_forever()

# Start background server
t = threading.Thread(target=start_server, daemon=True)
t.start()
time.sleep(1)

TARGET_VIEWS = [
    {
        "name": "01_client_neutral_view.png",
        "url": f"http://localhost:{PORT}/index.html?mode=demo&view=client",
        "desc": "Client Neutral View (Clean Tear-Sheet with Statutory Warning & Fictional Plans)"
    },
    {
        "name": "02_agent_cockpit.png",
        "url": f"http://localhost:{PORT}/index.html?mode=demo&view=agent",
        "desc": "Agent Tactical Cockpit (Internal HUD with Counter-Pitch Arguments)"
    },
    {
        "name": "03_gn16_chart.png",
        "url": f"http://localhost:{PORT}/index.html?mode=demo&modal=gn16",
        "desc": "GN16 Fulfillment Ratio Tracker (Historical Corridor vs Illustration Curve)"
    },
    {
        "name": "04_scanner_pii_scrub.png",
        "url": f"http://localhost:{PORT}/index.html?mode=demo&modal=scanner",
        "desc": "AI Proposal Scanner (Client-Side Deterministic PII Scrubber & Actuarial Parse)"
    },
    {
        "name": "05_offline_mode.png",
        "url": f"http://localhost:{PORT}/index.html?mode=demo&offline=true",
        "desc": "Offline Mode Indicator (LocalStorage & ServiceWorker Offline Resilience)"
    },
    {
        "name": "06_pricing_modal.png",
        "url": f"http://localhost:{PORT}/index.html?mode=demo&modal=pricing",
        "desc": "Single Source of Truth Pricing Modal ($49, $199, $2480, $12800)"
    }
]

print(f"\n[InsurIntel Screenshot Engine] Capturing {len(TARGET_VIEWS)} high-resolution screenshots...\n")

for item in TARGET_VIEWS:
    out_file = os.path.join(SCREENSHOTS_DIR, item["name"])
    if os.path.exists(out_file):
        os.remove(out_file)

    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        f"--user-data-dir={TEMP_USER_DATA}",
        "--window-size=1280,900",
        f"--screenshot={out_file}",
        item["url"]
    ]
    p = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(out_file) and os.path.getsize(out_file) > 1000:
        size_kb = os.path.getsize(out_file) / 1024
        print(f"  [SUCCESS] {item['name']} ({size_kb:.1f} KB) -> {item['desc']}")
        # Copy to artifacts directory
        artifact_copy = os.path.join(ARTIFACTS_SCREENSHOTS_DIR, item["name"])
        shutil.copyfile(out_file, artifact_copy)
    else:
        print(f"  [ERROR] Failed to capture {item['name']}. stderr: {p.stderr}")

print(f"\n[InsurIntel Screenshot Engine] All screenshots saved to {SCREENSHOTS_DIR} and {ARTIFACTS_SCREENSHOTS_DIR}!")

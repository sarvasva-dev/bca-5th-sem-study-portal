import os
import json
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler

UPSTREAM_URL = "https://api.sarvam.ai/text-to-speech"
ALLOWED_SPEAKERS = {
    "aditya", "ritu", "ashutosh", "priya", "neha", "rahul", "pooja", 
    "rohan", "simran", "kavya", "amit", "dev", "ishita", "shreya", 
    "ratan", "varun", "manan", "sumit", "roopa", "kabir", "aayan"
}

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        # 1. Check for API key in server-side environment
        api_key = os.environ.get("SARVAM_API_KEY")
        if not api_key:
            self._send_json(503, {
                "error": "SARVAM_API_KEY is not configured on the server.",
                "code": "LIVE_TTS_TEST_BLOCKED_MISSING_CREDENTIAL"
            })
            return

        # 2. Parse and validate JSON request
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length <= 0 or content_length > 10000:
            self._send_json(400, {"error": "Invalid Content-Length", "code": "INVALID_REQUEST"})
            return

        try:
            body = self.rfile.read(content_length).decode("utf-8")
            data = json.loads(body)
        except Exception as e:
            self._send_json(400, {"error": "Malformed JSON payload", "code": "INVALID_JSON"})
            return

        text = data.get("text", "").strip()
        if not text or len(text) > 1500:
            self._send_json(400, {
                "error": "Text must be non-empty and less than 1500 characters.",
                "code": "INVALID_TEXT_LENGTH"
            })
            return

        target_lang = data.get("target_language_code", "hi-IN")
        speaker = data.get("speaker", "aditya")
        if speaker not in ALLOWED_SPEAKERS:
            speaker = "aditya"

        model = data.get("model", "bulbul:v3")

        # 3. Securely forward to official Sarvam endpoint
        upstream_payload = json.dumps({
            "inputs": [text],
            "target_language_code": target_lang,
            "speaker": speaker,
            "model": model
        }).encode("utf-8")

        req = urllib.request.Request(
            UPSTREAM_URL,
            data=upstream_payload,
            headers={
                "api-subscription-key": api_key,
                "Content-Type": "application/json"
            },
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                resp_data = resp.read().decode("utf-8")
                parsed = json.loads(resp_data)
                audios = parsed.get("audios", [])
                if not audios:
                    self._send_json(502, {"error": "Upstream returned empty audio payload", "code": "EMPTY_AUDIO"})
                    return

                self._send_json(200, {
                    "audio_base64": audios[0],
                    "format": "wav",
                    "speaker": speaker,
                    "language": target_lang
                })
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            self._send_json(e.code, {
                "error": "Upstream Sarvam API returned an error",
                "upstream_code": e.code,
                "detail": err_body[:200]
            })
        except Exception as e:
            self._send_json(504, {
                "error": "Failed to connect to upstream TTS service",
                "code": "GATEWAY_TIMEOUT"
            })

    def _send_json(self, status, payload):
        resp_bytes = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(resp_bytes)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(resp_bytes)

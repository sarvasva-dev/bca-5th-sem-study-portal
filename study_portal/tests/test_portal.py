#!/usr/bin/env python3
"""
Automated Test Suite for BCA 5th Semester Verified Exam Study Portal
Validates:
1. File existence (All 19 syllabus units + 1 Index Hub)
2. Internal link integrity across all pages
3. MCQ Engine integration & question counts (min 5 per unit)
4. Mobile viewport and accessibility metadata
5. CSS and JS asset linkages
6. Color discipline: No unauthorized generic AI blue/purple palettes
7. Integrity of academic data manifests (sources.json, pyqs.json, syllabus-coverage.json)
"""

import os
import re
import json
import sys

PORTAL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
REQUIRED_PAGES = [
    "index.html",
    # BCA-5004: Numerical Methods (5 units)
    "bca5004_unit1.html",
    "bca5004_unit2.html",
    "bca5004_unit3.html",
    "bca5004_unit4.html",
    "bca5004_unit5.html",
    # BCA-5003: Computer Networks (5 units)
    "bca5003_unit1.html",
    "bca5003_unit2.html",
    "bca5003_unit3.html",
    "bca5003_unit4.html",
    "bca5003_unit5.html",
    # BCA-5002: Java & Webpage Design (5 units)
    "bca5002_unit1.html",
    "bca5002_unit2.html",
    "bca5002_unit3.html",
    "bca5002_unit4.html",
    "bca5002_unit5.html",
    # BCA-5001: Knowledge Management (4 units)
    "bca5001_unit1.html",
    "bca5001_unit2.html",
    "bca5001_unit3.html",
    "bca5001_unit4.html"
]

BANNED_AI_COLORS = [
    "#3b82f6", "#2563eb", "#1d4ed8",  # generic bright blue
    "#6366f1", "#4f46e5",             # indigo
    "#8b5cf6", "#7c3aed", "#6d28d9",  # purple
    "#a855f7", "#9333ea"              # violet
]

def run_tests():
    print("=" * 70)
    print("🚀 RUNNING STUDY PORTAL ACCEPTANCE TEST SUITE")
    print(f"Directory: {PORTAL_DIR}")
    print("=" * 70)

    total_tests = 0
    passed_tests = 0
    failed_tests = []

    def check(condition, test_name, detail=""):
        nonlocal total_tests, passed_tests
        total_tests += 1
        if condition:
            passed_tests += 1
            print(f"  [PASS] {test_name}")
        else:
            failed_tests.append((test_name, detail))
            print(f"  [FAIL] {test_name} -> {detail}")

    # TEST 1: Page Existence
    print("\n--- Phase 1: Checking HTML Pages Existence (20 Required) ---")
    for page in REQUIRED_PAGES:
        page_path = os.path.join(PORTAL_DIR, page)
        exists = os.path.isfile(page_path)
        size = os.path.getsize(page_path) if exists else 0
        check(exists and size > 2000, f"Page: {page}", f"Exists: {exists}, Size: {size} bytes")

    # TEST 2: Static Assets
    print("\n--- Phase 2: Core Assets (CSS & JS) ---")
    css_path = os.path.join(PORTAL_DIR, "css", "style.css")
    js_path = os.path.join(PORTAL_DIR, "js", "common.js")
    check(os.path.isfile(css_path) and os.path.getsize(css_path) > 3000, "style.css exists and non-empty")
    check(os.path.isfile(js_path) and os.path.getsize(js_path) > 2000, "common.js exists and non-empty")

    # TEST 3: Link Integrity & Mobile Requirements
    print("\n--- Phase 3: Link Integrity & Standards ---")
    href_pattern = re.compile(r'href=["\']([^"\']+)["\']')
    
    for page in REQUIRED_PAGES:
        page_path = os.path.join(PORTAL_DIR, page)
        if not os.path.exists(page_path):
            continue
        with open(page_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Viewport check
        check('name="viewport"' in content, f"{page} contains viewport meta tag")
        # CSS link check
        check('href="css/style.css"' in content, f"{page} links to css/style.css")

        # Internal link validation
        links = href_pattern.findall(content)
        for link in links:
            if link.startswith("http") or link.startswith("#") or link.startswith("mailto"):
                continue
            # Strip fragment
            clean_link = link.split('#')[0]
            if not clean_link:
                continue
            target_path = os.path.normpath(os.path.join(PORTAL_DIR, clean_link))
            check(os.path.exists(target_path), f"{page} -> link '{clean_link}' resolves", f"Missing: {target_path}")

    # TEST 4: MCQ Quiz Engine on Unit Pages
    print("\n--- Phase 4: Unit MCQ Engine Validation (19 Unit Pages) ---")
    mcq_container_pattern = re.compile(r'id=["\']unit-mcq-container["\']')
    mcq_init_pattern = re.compile(r'new\s+MCQEngine\s*\(\s*["\']unit-mcq-container["\']\s*,\s*([a-zA-Z0-9_]+)\s*\)')

    for page in REQUIRED_PAGES:
        if page == "index.html":
            continue
        page_path = os.path.join(PORTAL_DIR, page)
        if not os.path.exists(page_path):
            continue
        with open(page_path, 'r', encoding='utf-8') as f:
            content = f.read()

        has_container = bool(mcq_container_pattern.search(content))
        has_init = bool(mcq_init_pattern.search(content))
        # Estimate question count by counting "question:" in script
        q_count = content.count('question:')
        
        check(has_container, f"{page} has MCQ container element")
        check(has_init, f"{page} initializes MCQEngine instance")
        check(q_count >= 5, f"{page} contains at least 5 questions (Found: {q_count})")

    # TEST 5: Color Palette Constraint (No Generic AI Purple/Blue)
    print("\n--- Phase 5: Palette Constraint Verification ---")
    with open(css_path, 'r', encoding='utf-8') as f:
        css_content = f.read().lower()
    
    for banned in BANNED_AI_COLORS:
        check(banned not in css_content, f"CSS free from banned color {banned}")

    # TEST 6: Academic Data Artifacts
    print("\n--- Phase 6: Academic Data Artifacts Integrity ---")
    data_files = [
        ("sources.json", "data/sources.json"),
        ("pyqs.json", "data/pyqs.json"),
        ("syllabus-coverage.json", "data/syllabus-coverage.json")
    ]
    for label, rel_path in data_files:
        full_path = os.path.join(PORTAL_DIR, rel_path)
        exists = os.path.isfile(full_path)
        check(exists, f"{label} exists")
        if exists:
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                check(True, f"{label} parses as valid JSON (Type: {type(data).__name__})")
            except Exception as e:
                check(False, f"{label} JSON parsing", str(e))

    # SUMMARY
    print("\n" + "=" * 70)
    print(f"📊 TEST EXECUTION SUMMARY: {passed_tests} / {total_tests} Passed")
    if failed_tests:
        print(f"❌ {len(failed_tests)} TESTS FAILED:")
        for name, detail in failed_tests:
            print(f"   - {name}: {detail}")
        print("=" * 70)
        return False
    else:
        print("🎉 ALL ACCEPTANCE TESTS PASSED WITH 100% SUCCESS!")
        print("=" * 70)
        return True

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)

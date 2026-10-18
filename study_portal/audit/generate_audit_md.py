import json

with open('study_portal/data/sources.json') as f:
    inventory = json.load(f)

with open('study_portal/audit/source-inventory.md', 'w') as mf:
    mf.write('# Academic Source Inventory & Extraction Status\n\n')
    mf.write(f'**Total Discovered Academic Files:** {len(inventory)}\n\n')
    mf.write('| Source ID | Filename | Subject | Pages | Text Chars | Extraction Status |\n')
    mf.write('|---|---|---|---|---|---|\n')
    for e in inventory:
        mf.write(f"| {e['source_id']} | `{e['filename']}` | {e['subject']} | {e['pages']} | {e['text_chars']} | `{e['status']}` |\n")

print(f"Updated source-inventory.md with {len(inventory)} entries.")

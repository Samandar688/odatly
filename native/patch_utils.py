import sys

with open('src/utils.ts', 'r', encoding='utf-8') as f:
    content = f.read()

import re
content = re.sub(r'export function formatTimeInput\([\s\S]*?\}\n*', '', content)

with open('src/utils.ts', 'w', encoding='utf-8') as f:
    f.write(content)

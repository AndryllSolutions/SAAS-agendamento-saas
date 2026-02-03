#!/usr/bin/env python3

import json
import sys

def check_endpoints():
    data = json.load(sys.stdin)
    paths = data.get('paths', {})
    
    print("Endpoints encontrados:")
    for path in sorted(paths.keys()):
        if 'settings' in path:
            print(f"  {path}")

if __name__ == "__main__":
    check_endpoints()

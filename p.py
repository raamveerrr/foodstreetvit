import subprocess
from pathlib import Path
import os

result = subprocess.run(
    ["git", "ls-files", "-z"],
    capture_output=True,
    check=True
)

files = result.stdout.decode().split("\0")

for file in files:
    if not file:
        continue

    path = Path(file)

    if path.is_file():
        os.utime(path, None)

print("Updated local timestamps for tracked files.")
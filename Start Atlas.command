#!/bin/zsh -l
set -eu
cd "${0:A:h}"
if ! command -v npm >/dev/null 2>&1; then
  print "Atlas needs Node.js/npm. Ask Codex to help restore the existing Node setup."
  read "?Press Return to close."
  exit 1
fi
if /usr/sbin/lsof -iTCP:3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
  print "Port 3000 is already in use. Check http://localhost:3000 for Atlas."
  print "No existing process was stopped."
  read "?Press Return to close."
  exit 0
fi
if [[ ! -f .next/BUILD_ID ]]; then
  npm run build
fi
print "Open http://localhost:3000 in your usual browser. Keep this window open while using Atlas."
exec npm run start -- --hostname 127.0.0.1 --port 3000

#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------------------------
# 0️⃣ Setup – audit identifier & environment snapshot
# ---------------------------------------------------------------
AUDIT_ID="AUD-$(date +%Y-%m-%d)-RC1"
echo "$AUDIT_ID" > audit/audit_id.txt

cat <<EOF > audit/environment.json
{
  "git": {
    "commit": "$(git rev-parse HEAD)",
    "branch": "$(git rev-parse --abbrev-ref HEAD)",
    "dirty": $(test -n "$(git status --porcelain)" && echo true || echo false)
  },
  "node": "$(node -v)",
  "npm": "$(npm -v)",
  "os": "$(uname -s) $(uname -m)",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "next": "$(npx next --version)",
  "react": "$(node -e 'const p=require("./package.json"); console.log(p.dependencies.react)')"
}
EOF

mkdir -p audit/raw audit/normalized audit/reports

# ---------------------------------------------------------------
# 1️⃣ Collect static raw evidence (audit/raw/)
# ---------------------------------------------------------------
node scripts/generate_inventory.js > audit/raw/inventory.json
node scripts/generate_dependency_graph.js > audit/raw/dependency_graph.json
node scripts/detect_dead_code.js > audit/raw/dead_code_report.json
node scripts/design_system_check.js > audit/raw/design_system_raw.json
node scripts/reader_journey_audit.js > audit/raw/reader_journey_raw.json

# Canonical Audit-as-Code framework (audit/plugins) – clean of demo plugins
node scripts/capture_plugin_audit.js > audit/raw/plugin_audit.json

# ---------------------------------------------------------------
# 2️⃣ Static quality checks (each captured as traceable evidence)
# ---------------------------------------------------------------
node scripts/capture_check.js build --timeout 1500000 -- npm run build > audit/raw/build_result.json
node scripts/capture_check.js typecheck --timeout 600000 -- npx tsc --noEmit > audit/raw/typecheck_result.json
node scripts/capture_check.js lint --timeout 600000 -- npm run lint > audit/raw/lint_result.json
node scripts/capture_check.js test --timeout 1500000 -- npm test > audit/raw/test_result.json

# ---------------------------------------------------------------
# 3️⃣ Dynamic evidence – Playwright + Lighthouse (needs server)
# ---------------------------------------------------------------
# Start a production server on the build just produced (unless one is already up).
SERVER_PID=""
if ! curl -s http://localhost:3000 >/dev/null; then
  npm run start > audit/raw/server.log 2>&1 &
  SERVER_PID=$!
  for i in $(seq 1 150); do
    if curl -s http://localhost:3000 >/dev/null; then break; fi
    sleep 1
  done
fi

if ! curl -s http://localhost:3000 >/dev/null; then
  echo "ERROR: server did not become reachable on :3000 – see audit/raw/server.log"
  exit 1
fi

node scripts/capture_playwright.js > audit/raw/playwright_result.json
node scripts/capture_lighthouse.js > audit/raw/lighthouse_result.json

if [ -n "$SERVER_PID" ]; then
  kill $SERVER_PID 2>/dev/null || true
  # npm wrapper may leave the `next start` child holding :3000 – force-kill the listener tree
  LISTENER=$(netstat -ano 2>/dev/null | awk '/:3000 .*LISTENING/ {print $NF; exit}')
  if [ -n "${LISTENER:-}" ]; then
    taskkill //F //T //PID "$LISTENER" >/dev/null 2>&1 || true
  fi
fi

# ---------------------------------------------------------------
# 4️⃣ Normalize evidence (audit/normalized/)
# ---------------------------------------------------------------
normalize() {
  local raw="$1"
  if [ -f "audit/raw/$raw.json" ]; then
    node scripts/normalize.js "audit/raw/$raw.json" > "audit/normalized/$raw.normalized.json"
  fi
}

for artifact in inventory dependency_graph dead_code_report design_system_raw \
  reader_journey_raw plugin_audit build_result typecheck_result lint_result \
  test_result playwright_result lighthouse_result; do
  normalize "$artifact"
done

# ---------------------------------------------------------------
# 5️⃣ Evaluate evidence against launch gates & assemble report
# ---------------------------------------------------------------
node scripts/evaluate_audit.js audit/normalized > audit/reports/evaluation_summary.json || true
node scripts/assemble_report.js

# ---------------------------------------------------------------
# 6️⃣ Final packaging
# ---------------------------------------------------------------
BUNDLE="audit_bundle_$(date +%Y%m%d_%H%M%S).zip"
powershell.exe -NoProfile -Command "Compress-Archive -Path audit/raw,audit/normalized,audit/reports,audit/audit_id.txt,audit/environment.json,audit_report.md -DestinationPath '$BUNDLE' -Force" >/dev/null
echo "Audit completed – see audit_report.md"
echo "Evidence bundle: $BUNDLE"

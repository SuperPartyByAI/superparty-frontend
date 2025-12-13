#!/usr/bin/env bash
set -u

echo "## PWD"; pwd
echo
echo "## package.json"; ls -la package.json 2>/dev/null || true
echo
echo "## STRUCTURA"
ls -la
echo
echo "## app/ pages/ src/"
ls -la app 2>/dev/null || echo "app/ nu exista"
ls -la pages 2>/dev/null || echo "pages/ nu exista"
ls -la src 2>/dev/null || echo "src/ nu exista"
echo
echo "## app/api pages/api"
ls -la app/api 2>/dev/null || echo "app/api nu exista"
ls -la pages/api 2>/dev/null || echo "pages/api nu exista"
echo
echo "## GREP AUTH (head 260)"
grep -RInE --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude-dir=dist --exclude-dir=build --exclude-dir=out \
"localStorage|sp_token|sp_user|Authorization|Bearer|token|Set-Cookie|cookie|cors\\(|credentials|SameSite|Secure|trust proxy|/me|/login|/logout|redirect\\(|router\\.push" . 2>/dev/null | head -n 260
echo
echo "## PUBLIC GREP (head 200)"
if [ -d public ]; then
  grep -RInE --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git \
  "login|auth|cookie|sp_token|sp_user" public 2>/dev/null | head -n 200
else
  echo "public/ nu exista"
fi

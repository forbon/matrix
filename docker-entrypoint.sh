#!/bin/sh
cat > /usr/share/nginx/html/config.js <<EOF
window.__MATRIX_CONFIG__ = {
  impressumUrl: '${IMPRESSUM_URL:-}',
  privacyUrl: '${PRIVACY_URL:-}',
};
EOF
exec "$@"

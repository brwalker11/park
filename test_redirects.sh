#!/bin/bash
# Simple redirect testing script for monetize-parking.com
# Usage: ./test_redirects.sh [optional-path]
# Example: ./test_redirects.sh /about/

DOMAIN="monetize-parking.com"
PATH="${1:-/}"

echo "==========================================="
echo "Redirect Testing: $DOMAIN$PATH"
echo "==========================================="
echo ""

test_url() {
    local url="$1"
    local label="$2"

    echo "Testing: $label"
    echo "URL: $url"
    echo "---"

    # Use curl to follow redirects and show the chain
    curl -s -I -L -w "\nFinal URL: %{url_effective}\nHTTP Code: %{http_code}\nRedirect Count: %{num_redirects}\n" \
         -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
         "$url" | grep -E "HTTP|Location|Final URL|HTTP Code|Redirect Count"

    echo ""
    echo "=========================================="
    echo ""
}

# Test all 4 patterns
test_url "http://$DOMAIN$PATH" "HTTP without www"
test_url "http://www.$DOMAIN$PATH" "HTTP with www"
test_url "https://$DOMAIN$PATH" "HTTPS without www"
test_url "https://www.$DOMAIN$PATH" "HTTPS with www"

echo ""
echo "Testing complete!"
echo ""
echo "What to look for:"
echo "  ✓ All should redirect to the same final URL"
echo "  ✓ All HTTP should redirect to HTTPS (301)"
echo "  ✓ Redirect count should be 1 (not 2+)"
echo "  ✓ Final HTTP code should be 200"

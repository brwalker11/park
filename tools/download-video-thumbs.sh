#!/bin/bash
# Download YouTube thumbnails and convert to WebP
# Run this script from the repository root: bash tools/download-video-thumbs.sh

cd "$(dirname "$0")/../images/thumbs" || exit 1

declare -A VIDEOS=(
  ["master-lease-parking-lot"]="wIK0LgC3ldk"
  ["ai-parking-enforcement"]="4v_URcIY4w4"
  ["do-you-like-money-parking"]="AG_5yFbpDRw"
  ["parking-lot-size-requirements"]="KZTv4oe2IY4"
  ["cameras-stop-parking-abuse"]="pHgjjnZt3rE"
  ["ai-parking-too-good-to-be-true"]="TOCoMIIr_Lg"
  ["calculate-parking-lot-value"]="aTJDpiPMRcw"
  ["ai-parking-compliance-rates"]="xNbPfmoBbeU"
  ["stuck-in-2005-parking-technology"]="G6_6L03Eims"
  ["stop-parking-lot-abuse"]="NByiTbr-0ns"
  ["church-parking-non-profit-status"]="VVoqE1zlfRo"
  ["ai-cameras-vs-gates-scan-to-pay"]="UFk8jyL_gls"
  ["increase-parking-revenue"]="4LO262zGQ2I"
  ["cameras-vs-towing-parking"]="K0xGhqOCCcI"
  ["custom-parking-rules-tenants-visitors"]="udOVuBuMMRI"
  ["parking-real-estate-deal"]="9nL8ziuSpow"
  ["parking-revenue-retirement-account"]="pL8_CD6h1cI"
  ["how-parking-master-leases-work"]="wDt-5P0cYWY"
  ["paid-parking-seasonal-towns"]="uC6FOHphGAI"
  ["parking-mountain-river-towns"]="Nna9HKrEBGI"
  ["parking-revenue-split-comparison"]="9sVaQrKrqh4"
  ["tenant-parking-exemptions"]="TPmAGyD1sHA"
  ["smallest-parking-lot-size"]="It5rX30iBSM"
  ["parking-payment-options"]="1XCCAgML3AM"
  ["parking-technology-enforcement"]="R5HGHoblWKc"
  ["old-parking-technology-problems"]="0oscOafsbj4"
  ["parking-lot-referral-earnings"]="5cyv5E0xcQ0"
  ["parking-referral-program"]="v5SmhKUIVAg"
  ["tourist-town-parking-abuse"]="BQuoxwlIof0"
  ["parking-is-real-estate-deal"]="fRfOpXEkAv4"
)

for slug in "${!VIDEOS[@]}"; do
  vid="${VIDEOS[$slug]}"
  echo "Downloading: $slug ($vid)"
  curl -s -o "${slug}.jpg" "https://img.youtube.com/vi/${vid}/maxresdefault.jpg"

  # Check if maxresdefault exists (YouTube returns a small placeholder if not)
  filesize=$(stat -f%z "${slug}.jpg" 2>/dev/null || stat --printf="%s" "${slug}.jpg" 2>/dev/null)
  if [ "$filesize" -lt 5000 ]; then
    echo "  maxresdefault not available, trying hqdefault..."
    curl -s -o "${slug}.jpg" "https://img.youtube.com/vi/${vid}/hqdefault.jpg"
  fi

  # Convert to WebP
  if command -v cwebp &> /dev/null; then
    cwebp -q 80 "${slug}.jpg" -o "${slug}.webp" 2>/dev/null
    rm "${slug}.jpg"
    echo "  Saved: ${slug}.webp"
  else
    echo "  cwebp not found, keeping as JPG: ${slug}.jpg"
  fi
done

echo "Done. $(ls *.webp 2>/dev/null | wc -l) WebP files, $(ls *.jpg 2>/dev/null | wc -l) JPG files"

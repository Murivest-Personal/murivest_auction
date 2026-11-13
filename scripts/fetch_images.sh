#!/bin/bash
# Fetch property images via z-ai image-search (parallel batches).
# Captures stdout JSON (skipping the banner lines).
mkdir -p /tmp/imgsearch

fetch() {
  name="$1"; query="$2"
  if [ -s "/tmp/imgsearch/$name.json" ] && grep -q '"success": true' "/tmp/imgsearch/$name.json" 2>/dev/null; then
    echo "SKIP $name"
    return
  fi
  timeout 150 z-ai image-search -q "$query" -c 4 --gl us --no-rank 2>/dev/null \
    | sed -n '/^{/,$p' > "/tmp/imgsearch/$name.json"
  if [ -s "/tmp/imgsearch/$name.json" ] && grep -q '"success": true' "/tmp/imgsearch/$name.json"; then
    echo "OK $name"
  else
    echo "FAIL $name"
    rm -f "/tmp/imgsearch/$name.json"
  fi
}

run_all() {
  fetch hero-home "Nairobi city skyline at dusk with modern towers" &
  fetch hero-kenya "Nairobi skyline with Kenyatta International Convention Centre tower" &
  fetch hero-uk "London skyline City office towers at dusk" &
  wait
  fetch rahimtulla-main "period office building on a busy street in Nairobi CBD" &
  fetch rahimtulla-alt "Moi Avenue street scene Nairobi CBD" &
  fetch kenyatta-main "storefront retail building street level Nairobi" &
  wait
  fetch kenyatta-alt "Kenyatta Avenue Nairobi street scene with shops" &
  fetch mombasa-main "commercial retail building on Moi Avenue Mombasa" &
  fetch mombasa-alt "street scene in Mombasa old town Kenya" &
  wait
  fetch riverside-main "modern glass office building Westlands Nairobi" &
  fetch riverside-alt "landscaped modern office park driveway Nairobi" &
  fetch mlolongo-main "large logistics warehouse building exterior with loading bays" &
  wait
  fetch mlolongo-alt "industrial yard with trucks and hardstanding" &
  fetch kisumu-main "commercial building in Kisumu town centre Kenya" &
  fetch kisumu-alt "street scene in Kisumu city centre Kenya" &
  wait
  fetch chiswell-main "Georgian and modern office building City of London street" &
  fetch chiswell-alt "City of London street with office buildings" &
  fetch peckham-main "mixed-use retail and residential building London high street" &
  wait
  fetch peckham-alt "Peckham high street London shopfronts" &
  fetch trafford-main "single storey industrial unit with yard in Manchester" &
  fetch trafford-alt "industrial estate road with units Greater Manchester" &
  wait
  fetch birmingham-main "high street retail shop unit building Birmingham" &
  fetch birmingham-alt "commercial street in Birmingham city centre" &
  fetch leeds-main "traditional red brick public house pub building England" &
  wait
  fetch leeds-alt "victorian terrace commercial buildings street Leeds" &
  fetch bristol-main "cleared urban development site with hoarding" &
  fetch bristol-alt "main road through an inner city area of Bristol" &
  wait
}

run_all
# Retry any failures once more, sequentially
for f in hero-home hero-kenya hero-uk rahimtulla-main rahimtulla-alt kenyatta-main kenyatta-alt mombasa-main mombasa-alt riverside-main riverside-alt mlolongo-main mlolongo-alt kisumu-main kisumu-alt chiswell-main chiswell-alt peckham-main peckham-alt trafford-main trafford-alt birmingham-main birmingham-alt leeds-main leeds-alt bristol-main bristol-alt; do
  if [ ! -s "/tmp/imgsearch/$f.json" ]; then
    echo "RETRY $f"
  fi
done
echo "DONE — $(ls /tmp/imgsearch/*.json 2>/dev/null | wc -l) files"

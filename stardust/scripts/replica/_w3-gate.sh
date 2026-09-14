#!/bin/zsh
# W3 local gates (no live hits): EDS emulation (:3013) and replica prototype (:8812) vs the cached live PNGs of the 3 representative siblings,
# chrome crops (header 129/60 px, footer 1010/1619 px = the archetype gate's bands), the boliglan 1440 regression, then prototype↔EDS content-diffs.
cd /Users/paolo/stardust/2026-08/sparebank1
R=stardust/scripts/replica; G=stardust/replica/gates
imgh() { node -e 'const fs=require("fs");const b=fs.readFileSync(process.argv[1]);console.log(b.readUInt32BE(20))' "$1"; }
gate() { # short slug dapath width
  local short=$1 slug=$2 dap=$3 w=$4; local hdr=$([ $w = 1440 ] && echo 129 || echo 60); local fth=$([ $w = 1440 ] && echo 1010 || echo 1619)
  local L=$G/$short-$w/live.png
  # EDS
  local D=$G/$short-eds-$w; mkdir -p $D; cp $L $D/live.png
  node $R/stitch-shot.mjs "http://localhost:3013$dap" $D/proto.png --width $w --settle 2>&1 | tail -1
  node $R/pixel-compare.mjs $D/live.png $D/proto.png --out $D/diff-iter1.png --threshold 10 > $D/pixel-iter1.txt 2>&1; head -2 $D/pixel-iter1.txt | tail -1 | sed "s/^/  EDS $short-$w: /"
  node $R/crop-compare.mjs $D/live.png $D/proto.png --y 0 --height $hdr --out $D/chrome-header-diff.png --threshold 2 > $D/chrome-header.txt 2>&1
  [ $w = 360 ] && node $R/crop-compare.mjs $D/live.png $D/proto.png --y 0 --x 115 --height $hdr --out $D/chrome-header-x115-diff.png --threshold 2 > $D/chrome-header-x115.txt 2>&1
  local lh=$(imgh $D/live.png) ph=$(imgh $D/proto.png); node $R/crop-compare.mjs $D/live.png $D/proto.png --y $((lh-fth)) --y-b $((ph-fth)) --height $fth --out $D/chrome-footer-diff.png --threshold 2 > $D/chrome-footer.txt 2>&1
  # replica prototype
  local P=$G/$short-$w
  node $R/stitch-shot.mjs "http://localhost:8812/$slug-proposed.html" $P/proto.png --width $w --settle 2>&1 | tail -1
  node $R/pixel-compare.mjs $P/live.png $P/proto.png --out $P/diff-iter1.png --threshold 10 > $P/pixel-iter1.txt 2>&1; head -2 $P/pixel-iter1.txt | tail -1 | sed "s/^/  PROTO $short-$w: /"
  node $R/crop-compare.mjs $P/live.png $P/proto.png --y 0 --height $hdr --out $P/chrome-header-diff.png --threshold 2 > $P/chrome-header.txt 2>&1
  local ph2=$(imgh $P/proto.png); node $R/crop-compare.mjs $P/live.png $P/proto.png --y $((lh-fth)) --y-b $((ph2-fth)) --height $fth --out $P/chrome-footer-diff.png --threshold 2 > $P/chrome-footer.txt 2>&1
}
for w in 1440 360; do
  gate forbrukslan nb-bank-privat-lan-forbrukslan-html /nb/bank/privat/lan/forbrukslan $w
  gate mobilbank nb-bank-privat-daglig-bruk-mobilbank-html /nb/bank/privat/daglig-bruk/mobilbank $w
  gate eksperter nb-bank-om-oss-vare-eksperter-html /nb/bank/om-oss/vare-eksperter $w
done
# boliglan regression (1440, emulation vs the archetype's cached live PNG)
D=$G/boliglan-eds-1440; node $R/stitch-shot.mjs "http://localhost:3013/nb/bank/privat/lan/boliglan" $D/_w3-proto.png --width 1440 --settle 2>&1 | tail -1
node $R/pixel-compare.mjs $D/live.png $D/_w3-proto.png --out $D/_w3-diff.png --threshold 10 > $D/_w3-pixel.txt 2>&1; head -2 $D/_w3-pixel.txt | tail -1 | sed "s/^/  REGRESSION boliglan-1440: /"
echo GATES-DONE
cd() { builtin cd "$@"; }
cdiff() { node stardust/scripts/diff/content-diff.mjs "http://localhost:8812/$1-proposed.html" "http://localhost:3013$2" --profile generic --width 1440 --main main > $3 2>&1; echo "  cdiff $1: $(grep -c '🔴' $3) 🔴 lines · $(grep -c '🟡' $3) 🟡 lines"; }
cdiff nb-bank-privat-lan-forbrukslan-html /nb/bank/privat/lan/forbrukslan $G/forbrukslan-eds-1440/content-diff-emu.txt
cdiff nb-bank-privat-daglig-bruk-mobilbank-html /nb/bank/privat/daglig-bruk/mobilbank $G/mobilbank-eds-1440/content-diff-emu.txt
cdiff nb-bank-om-oss-vare-eksperter-html /nb/bank/om-oss/vare-eksperter $G/eksperter-eds-1440/content-diff-emu.txt
mkdir -p $G/_w3-eyeball; cdiff nb-bank-bedrift-betaling-utenlandsbetaling-html /nb/bank/bedrift/betaling/utenlandsbetaling $G/_w3-eyeball/cdiff-utenlandsbetaling.txt
cdiff nb-bank-privat-forsikring-bilforsikring-html /nb/bank/privat/forsikring/bilforsikring $G/_w3-eyeball/cdiff-bilforsikring.txt
cdiff nb-bank-privat-daglig-bruk-bankkort-html /nb/bank/privat/daglig-bruk/bankkort $G/_w3-eyeball/cdiff-bankkort.txt
echo CDIFF-DONE

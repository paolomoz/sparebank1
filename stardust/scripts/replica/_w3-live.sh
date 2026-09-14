#!/bin/zsh
# W3 live PNG captures for the 3 representative siblings (once, reused) + sibling-variance; hits spaced ≥ 25 s
cd /Users/paolo/stardust/2026-08/sparebank1
C='button:has-text("Godta alle")'; SS=stardust/scripts/replica/stitch-shot.mjs
cap() { mkdir -p stardust/replica/gates/$2-$3; node $SS "$1" stardust/replica/gates/$2-$3/live.png --width $3 --settle --consent "$C" 2>&1 | tail -1; sleep 25; }
cap https://www.sparebank1.no/nb/bank/privat/lan/forbrukslan.html forbrukslan 1440
cap https://www.sparebank1.no/nb/bank/privat/daglig-bruk/mobilbank.html mobilbank 1440
cap https://www.sparebank1.no/nb/bank/om-oss/vare-eksperter.html eksperter 1440
cap https://www.sparebank1.no/nb/bank/privat/lan/forbrukslan.html forbrukslan 360
cap https://www.sparebank1.no/nb/bank/privat/daglig-bruk/mobilbank.html mobilbank 360
cap https://www.sparebank1.no/nb/bank/om-oss/vare-eksperter.html eksperter 360
echo CAPTURES-DONE
node stardust/scripts/replica/sibling-variance.mjs https://www.sparebank1.no/nb/bank/privat/lan/boliglan.html https://www.sparebank1.no/nb/bank/privat/lan/forbrukslan.html https://www.sparebank1.no/nb/bank/privat/daglig-bruk/mobilbank.html https://www.sparebank1.no/nb/bank/om-oss/vare-eksperter.html --width 1440 --consent "$C" --probe hero='main .columns-grid' --probe pt='.price-and-terms' --probe gc='.guide-carousel' --probe bio='.biolist' --probe usp='.usp' --probe faq='.faq' --json > stardust/replica/progress/_w3-sibling-variance.json 2> /tmp/_w3-sibvar.err
echo SIBVAR-DONE

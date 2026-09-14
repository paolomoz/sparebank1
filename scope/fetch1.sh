#!/bin/sh
u="$1"; f=$(echo "$u" | sed "s#https://www.sparebank1.no/##; s#/#__#g")
code=$(curl -sL -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36" -o "census/$f" -w "%{http_code}" "$u")
pt=$(grep -oE 'pageType: "[^"]*"' "census/$f" | head -1 | sed 's/pageType: //; s/"//g')
tpl=$(grep -oE 'data-template="[^"]*"|class="page [^"]*"' "census/$f" | head -1)
ttl=$(grep -oE '<title>[^<]*' "census/$f" | head -1 | sed 's/<title>//')
sz=$(wc -c < "census/$f" | tr -d ' ')
echo "$code|$pt|$tpl|$sz|$u|$ttl"

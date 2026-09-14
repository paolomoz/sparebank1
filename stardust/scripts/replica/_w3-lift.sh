#!/bin/zsh
# W3 live lifts (one hit per page per width, spaced ≥ 25 s) → stardust/replica/lift/_w3-<kind>-<w>.json
cd /Users/paolo/stardust/2026-08/sparebank1
L=stardust/scripts/replica/lift-styles.mjs; D=stardust/replica/lift
lift() { node $L "$1" --width $2 --sel "$3" --out $D/_w3-$4-$2.json 2>&1 | head -3; sleep 25; }
PT='.price-and-terms,.price-and-terms__wrapper,.price-and-terms__title,.price-and-terms__title h2,.price-and-terms__wrap-price-and-terms,.price-and-terms__wrap-terms,.price-and-terms__item,.price-and-terms__price,.price-and-terms__before-text,.price-and-terms__number-text,.price-and-terms__after-text,.price-and-terms__terms-wrap,.price-and-terms__terms,.price-and-terms__term,.price-and-terms__list-link,.price-and-terms__list-link a,.price-and-terms__sub-text,.price-and-terms__sub-text p,.price-and-terms__sub-text a,main .button-wrapper.center,main .button-wrapper.center a,main > .button,main > .text'
GC='.guide-carousel,.guide-carousel__wrap,.cmp-carousel__content,.guide-carousel__title,.guide__indicators,.cmp-carousel__item--active,.guide-item,.cmp-teaser,.cmp-teaser__image,.cmp-teaser__image img,.cmp-teaser__content,.cmp-teaser__title,.cmp-teaser__description,.cmp-teaser__description p,.cmp-teaser__description li,.cmp-carousel__actions,.cmp-carousel__action,.cmp-carousel__action-icon,.cmp-carousel__action svg'
BIO='.contentfragmentlist,.biolist,.bio,.bio__image,.bio__image .image,.bio__image img,.bio__text,.bio__name,.bio__org,.bio__jobtitle,.bio__desc,.bio__link,.bio__link-icon,.bio__link a,main .title,main .title h1,main .text-wrapper,main .text-wrapper p'
PD='.progressive-disclosure,.progressive-disclosure__align-center,.progressive-disclosure__btn,.progressive-disclosure__btn .ffe-button__label,.progressive-disclosure__btn svg,.progressive-disclosure .content,.progressive-disclosure .content h2,.progressive-disclosure .content p,.progressive-disclosure .button-wrapper,.progressive-disclosure .ffe-button--primary,main .image .image-center,main .image .image-center img,main .image .Left,main .image .Left img'
ST='.step-by-step,.step__wrap,.step__header,.step__header h2,.step__list,.step-item__wrapper,.step-item__choice,.step-item__choice--active,.step__number,.step__number span,.step__title,.step__title a,.step-item__icon-wrap,.step-item__icon,.step__info,.step-item__content-info,.step-item__content-info .text,.step__info p,.step__info li,.step__info h3,.accordion-wrap,.accordion-container,.accordion-container h3,.accordion-container .ffe-sub-lead-paragraph,.accordion-container .ffe-accordion,.accordion-container .ffe-accordion-item,.accordion-container .ffe-accordion-item__heading-button,.accordion-container .ffe-accordion-item__heading-button-content,.accordion-container .ffe-accordion-item__heading-icon,.accordion-container .accordion__content,.accordion-container .ffe-accordion-item__body'
for w in 1440 360; do
  lift https://www.sparebank1.no/nb/bank/privat/lan/forbrukslan.html $w "$PT" pt
  lift https://www.sparebank1.no/nb/bank/privat/daglig-bruk/mobilbank.html $w "$GC" gc
  lift https://www.sparebank1.no/nb/bank/om-oss/vare-eksperter.html $w "$BIO" bio
  lift https://www.sparebank1.no/nb/bank/privat/daglig-bruk/bankkort.html $w "$PD" pd
  lift https://www.sparebank1.no/nb/bank/bedrift/betaling/utenlandsbetaling.html $w "$ST" st
done
echo LIFTS-DONE

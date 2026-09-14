/**
 * encoders/kundeservice-hub.mjs — family encoders for the kundeservice hubs (/nb/bank/privat/kundeservice.html, bedrift).
 * The shared hub walker (band / cols / chat columns) lives in category-hub.mjs and is family-gated to both hub families;
 * this file adds the top-level related-products icon list (core relatedTopics reads only .newsfeed cards → 0 rows).
 */
import * as L from '../lib.mjs';
import { ENCODERS as CORE, bandBg, styleOf } from '../encoders.mjs';
import { hubRelated, isHub, tint } from './category-hub.mjs';

export default {
  'related-products': (root, ctx) => {
    if (!isHub(ctx) || !L.q(root, '.card-list')) return CORE['related-products'](root, ctx);
    const r = hubRelated(root, ctx);
    return { html: L.section(r.parts, { style: styleOf('related', tint(bandBg(root))) }), blocks: r.blocks };
  },
};

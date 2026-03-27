OG Template Assets - Brightnest Institute
=========================================

Generated at:
- public/images/og-templates/watermark-light.png
- public/images/og-templates/watermark-dark.png
- public/images/og-templates/og-fallback-1200x630.png
- public/images/og-templates/og-series-1200x630.png
- public/images/og-templates/badge-premium.png

Recommended usage:
1) watermark-light.png
   - For dark/blue backgrounds.
2) watermark-dark.png
   - For bright/light backgrounds.
3) og-fallback-1200x630.png
   - Fallback OG image for article/news/publication when no valid main image.
4) og-series-1200x630.png
   - Fallback OG image for series/table content.
5) badge-premium.png
   - Overlay badge for premium teaser preview.

Fallback rule suggestion:
- Use uploaded image only when width >= 1200 and the file is readable/public.
- If missing, unreadable, broken, or width < 1200:
  - series => use og-series-1200x630.png
  - non-series => use og-fallback-1200x630.png

Note on long titles/leads:
- Full title/lead can still be passed from content.
- In rendering, text can be wrapped and clipped (ellipsis) by layout area.

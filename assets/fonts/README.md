# Self-hosted fonts

## Inter (variable)

| | |
|---|---|
| Files | `inter-v20-latin-roman.woff2` (73,016 bytes), `inter-v20-latin-italic.woff2` (79,744 bytes) |
| Version | Inter v20, as served by Google Fonts |
| Source | `fonts.gstatic.com`, retrieved 2026-08-07 |
| Subset | Latin only. Same `unicode-range` Google ships, mirrored in the `@font-face` rules |
| Axes | `wght` 100 to 900, `opsz` 14 to 32 |
| License | SIL Open Font License 1.1 |
| Copyright | The Inter Project Authors (https://github.com/rsms/inter) |

Declared by two `@font-face` rules at the top of `/styles.css`, which 147 of
149 rendered pages load. The two consultation pages are frozen and still load
Inter from Google Fonts; they move to these files during their own pass.

Filenames carry the version so `_headers` can cache `/assets/*` as `immutable`.
A future Inter version gets a new filename. Do not replace a file in place.

The roman file is preloaded on the 113 pages that load `styles.css` through the
async preload-onload pattern, where the `@font-face` would otherwise not be
discovered until after first paint. Italic is not preloaded; site-wide italic
usage is 5 CSS declarations and 3 article fragments.

**Outstanding:** the full OFL 1.1 license text is not committed here. The OFL
requires the license to accompany redistributed files. Add `OFL.txt` from the
Inter repository before this reaches production.

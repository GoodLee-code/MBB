# 双11福利 H5 — participation, query and outcome-state QA

final result: blocked

## Comparison target and evidence

- Source visual truth: `/Users/goodlee/Documents/MBB/assets/double11-registration-reference.png`, user-supplied 850 × 1850px full-page reference. Opened with `view_image` during this revision.
- Query-state source visual truth: `/Users/goodlee/Documents/MBB/assets/double11-results-reference.png`, user-supplied 852 × 1616px image. Opened with `view_image` for the current change.
- Winning-state source visual truth: `/Users/goodlee/Documents/MBB/assets/double11-winner-reference.png`, user-supplied 850 × 1850px image, opened with `view_image`. All three generated winning posters were also opened and inspected individually.
- Non-winning source visual truth: `/Users/goodlee/Documents/MBB/assets/double11-nonwinner-reference.png`, user-supplied 851 × 1848px image, opened with `view_image`. The generated 850 × 1850px poster was also opened and inspected.
- Implementation: `/Users/goodlee/Documents/MBB/double11.html`, embedding `/Users/goodlee/Documents/MBB/double11-content.html`.
- Required viewport: fixed 375 × 812 CSS px phone container, internally scrolling. The host now adds the requested right-side preview state tabs; phone dimensions remain fixed, without scale-to-fit or outer document scrolling.
- Implementation screenshot path: unavailable. Browser access to local project pages was blocked earlier in this conversation. No alternate browser, HTTP/CDP path, or rendering workaround was used.
- Density normalization: source CSS size/density is unknown; its physical image is 850 × 1850px. A full-document comparison would normalize its width to 375 CSS px, while testing the implementation's 812px viewport independently. No runtime capture or normalized pair exists yet.
- State: participation form, result-query view and dedicated winning page, plus validation, uploaded image, submitting, pending-draw receipt, query loading/non-winning/pending/no-record/error, image fallback and SN-helper states require rendered capture.
- Full-view comparison evidence: blocked, missing browser-rendered implementation.
- Focused region comparison evidence: blocked for hero/prize cards, form rows, address counter/upload, rules/CTA and dialogs. These are required because typography, wrapping and interactive geometry are material.

## Verification blocker

The source and individual generated assets were inspected, but no source-versus-rendered comparison was performed. Do not treat the static audit, file existence or isolated VM interaction checks as visual verification. There is no passed visual QA iteration for this revision.

## Required fidelity surfaces

1. **Fonts and typography:** runtime unverified. Source-compatible Chinese sans, 20px section heading, 16px field values and helper copy at least 12px are specified in CSS; text must remain readable without scaling the phone.
2. **Spacing and layout rhythm:** runtime unverified. Hero, three prize cards, inline form, process strip, rules and CTA are in source order. Phone scroll containment and narrow wrapping need live inspection.
3. **Colors and tokens:** runtime unverified. Updated campaign tokens follow the supplied blue/white form, orange/red CTA and warm promotional hero. Console tokens remain separate.
4. **Image quality and asset fidelity:** hero and all three product cutouts were opened individually and checked against the supplied source. They use raster assets generated through the built-in Image Gen tool, not flattened form artwork. Crop/scale/alpha-edge quality at actual mobile sizes remains unverified. Phosphor icons are unmodified licensed assets.
5. **Copy and content:** source copy transcribed, including Nov 1–11 dates, Nov 12 12:00 draw wording, prize counts, 200-character address, JPG/PNG upload ≤10MB and supplied declarations. The pictured redemption deadline is the same time as the draw; copied without inventing a new business rule. Runtime clipping/wrapping remains unverified.

## Interaction evidence (isolated VM, not browser)

- `/private/tmp/mbb-double11-registration-check.js`: passed. Asset/handler bindings, inline field order, required-field and address-length validation, upload options/count guard, preview/dialog scroll lock, pending-draw feedback, duplicate prevention, submission-failure recovery, unsupported scanner fallback, successful scan and late-result cancellation.
- `/private/tmp/mbb-screenshot-options-check.js`: passed. Existing admin defaults remain 5MB JPG/PNG/WEBP; explicit H5 options are 10MB JPG/PNG. Size boundary, extension/MIME/content signature and decode failure paths verified.
- Admin inline scripts parse; lottery H5 link remains; coupon reporting card remains removed; fixed phone viewport preserved.
- Strict project audit: `/private/tmp/mbb-double11-registration-audit.json`. 42 existing project findings remain; zero findings in changed H5/screenshot helper files. This audit does not establish browser compliance.
- Browser console and touch-device behavior: not checked.

## Comparison history

- Iteration 1: source inspected; four generated assets inspected; implementation and VM tests completed. Visual comparison remains blocked by missing runtime capture. No visual pass asserted.

## Remaining verification checklist

1. Open the H5 in an authorized browser and refresh the existing entry.
2. Capture the unscaled 375 × 812 viewport and full scrollable content.
3. Compare the source and capture together, then inspect focused regions listed above.
4. Exercise wheel/trackpad/touch scrolling, keyboard validation, upload/preview, modal focus restoration, submission and scanner fallback; inspect console errors.
5. Fix any P0/P1/P2 differences and repeat capture/comparison before changing `final result` to `passed`.

## Hook follow-up: contrast and hierarchy

The current H5 detector now reports zero primary findings after deepening helper/placeholder text, white-on-warm badge/action backgrounds and small link colors, and raising section/dialog headings to 20px. Numeric checks confirm changed body-text/background pairs are at least 4.5:1. `.impeccable/design.json` has been refreshed from current tokens and component CSS. No new detector ignores were added. These checks do not replace the still-blocked browser capture and visual comparison.

## Current result-query revision

- Source: 852 × 1616px query screenshot; implementation screen remains 375 × 812 CSS px. Runtime density and image normalization are still unverified because no implementation capture is available.
- Existing raster hero, prize cutouts, typography family, palette, SN field, scan helper and primary action are reused. The query heading uses the documented 24px/34px step. One shared rules section moves to the active view; participation values and uploads remain in memory.
- `/private/tmp/mbb-double11-results-check.js`: passed isolated VM checks for right-side tab selection, roving Up/Down/Home/End focus, message-source validation, fixed host geometry declarations, no iframe reload on tab activation, required SN, clear, duplicate prevention, each mock outcome, unknown SN, offline/retry, stale-request cancellation, shared scanner targeting, session-submission lookup, draft preservation and per-view scroll restoration.
- Existing registration and screenshot-option checks passed again. No production result API is connected; fixtures use explicit `MBB-DEMO-*` SNs, without assigning random prizes to unknown inputs.
- The primary image detector reports no broken image or other primary findings. No new ignores were added. Static checks do not establish visual fidelity, actual focus/scroll geometry, mobile touch behavior or console cleanliness.
- Required focused comparison regions: preview state rail, query hero/card overlap, heading and SN/scan/clear geometry, result messages/prize images, and shared rules panel. These remain blocked pending an authorized browser capture.
- Final result remains blocked solely for missing rendered visual evidence; the new interaction checks are script evidence, not a browser QA pass.

## Winning-state revision

- Current selected visual: 850 × 1850px second-prize winning screenshot. The fixed runtime phone remains 375 × 812 CSS px, with content scrolling inside the iframe. The three generated posters are each 850 × 1850px; no device chrome or live notice/back control was baked into them.
- Fonts and typography: source promotional type stays in the poster; live result heading uses the existing 20px/28px title role, and notice copy uses 16px/24px. Rendered wrapping and fallback fonts remain unverified.
- Spacing and layout: default second-prize notice starts at 64% of poster height; the power-bank variant uses 66% to clear its lower count pill. The fixed 375 × 812 host and no outer scrolling declarations are preserved. Actual card bounds and touch scrolling remain unverified.
- Colors: notice tokens are documented in DESIGN.md and match the H5 CSS variables. Live notice text uses the established darker campaign red and a dark warm body color on cream. Raster skies/confetti are source artwork, not CSS drawings.
- Asset fidelity: all three generated posters were inspected for Chinese copy, prize rank/name/count, composition and clear notice area. The second-prize poster closely follows the supplied cup image. This asset inspection is not a rendered-page comparison.
- Copy and behavior: direct 中奖 preview defaults to 二等奖/儿童保温水杯/800份. Successful explicit mock SN queries open the corresponding prize page. Physical-prize notice follows the screenshot; coupon notice uses the previously confirmed validity/package restrictions. No claim form or backend prize allocation was added.
- `/private/tmp/mbb-double11-winner-check.js`: passed isolated VM checks for default preview, three prize mappings, state visibility, query-to-winning navigation, restored drafts/query/scroll, pending/non-winning/missing records staying in query, stale-request cancellation, image error/retry/cached fallback, host tab sync, keyboard wrap and source checks without message echo or iframe reload.
- Existing registration and result-query checks passed after adding the third state. These are script checks only; no browser screenshot, console or touch-device claim is made.
- Full-view and focused comparison remain blocked. Required captures include the default second-prize page, first/third-prize variants, top-left back control, notice wrapping, artwork failure, and the right-side selected state. `final result: blocked` remains in effect.

## Non-winning revision

- The selected visual is the supplied 851 × 1848px non-winning screenshot; the new raster is 850 × 1850px, while the runtime remains the fixed 375 × 812 CSS px viewport. No implementation screenshot is available, so no normalized source/implementation comparison or visual pass is claimed.
- Typography and copy: dimensional headline and ribbon text stay in the raster; the live notice uses the existing 20px/28px title and 16px/24px body roles. Copy follows the screenshot verbatim. Actual line wrapping remains unverified.
- Layout and color: notice is a cool variant of the established outcome card at 62% of poster height, with the existing blue megaphone, navy heading, darker muted copy and pale panel. The 375 × 812 viewport, inside scrolling and no outer scrolling declarations are preserved. Raster artwork is visually inspected, not recreated through CSS.
- Behavior: explicit mock non-winning outcomes open this state; pending, awaiting-update, unknown and failed queries retain separate feedback. Direct preview is available as the fourth state. Back and host-tab sync reuse the established navigation; shared image fallback/retry logic serves both outcome pages.
- `/private/tmp/mbb-double11-nonwinner-check.js`: passed isolated VM checks covering direct preview, both non-winning SNs, return/draft/query/scroll restoration, shared image fallback/retry and cached errors, stale and clear cancellation, four-tab keyboard/source/message synchronization without reload or echo, and separation from pending/no-record/error.
- Registration, query and winner checks remain regression evidence. Live rendering, focus geometry, touch scrolling and browser console remain unverified. Required focused captures: four-state rail, raster headline/empty gift, notice heading/body wrap, back control and image-failure state. `final result: blocked` remains due to missing authorized browser capture.

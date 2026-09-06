**Comparison Target**

- Source visual truth: `/var/folders/49/lxglpvh14pbg1n2wljrc4xcm0000gn/T/codex-clipboard-ffd81b75-52de-41e9-93ea-fc14fb8a3aab.png`
- Implementation screenshot: `/Users/goodlee/Documents/MBB/activity-card-qa.png`
- Viewport: `1768 x 889`
- State: 运营管理 / 活动中心，感恩回馈活动卡片默认状态

**Full-View Comparison Evidence**

- The reference and implementation were opened together at the same viewport for comparison.
- The implementation preserves the existing MBB navigation and page shell while matching the reference card's 2.4:1 proportion, white surface, light border, soft shadow, rounded corners, left-aligned icon and text, dashed divider, and creation-time row.

**Focused Region Comparison Evidence**

- A separate crop was not required because the complete implementation card is readable at `660 x 274` in the full-view screenshot.
- The extracted gift and clock assets were inspected separately at their source resolution before placement.

**Findings**

- Fonts and typography: passed. Title, subtitle, metadata label, and date reproduce the reference hierarchy without truncation or negative letter spacing.
- Spacing and layout rhythm: passed after iteration. Icon/title offsets, divider position, card aspect ratio, and lower metadata spacing align with the reference.
- Colors and visual tokens: passed. The card uses the existing theme blue and reference-like neutral grays without introducing a conflicting palette.
- Image quality and asset fidelity: passed. The gift and clock icons are extracted from the supplied reference and remain sharp at rendered size.
- Copy and content: passed. `感恩回馈`、`免费送充电宝` and the creation time match the reference.
- Interaction: passed. The card remains keyboard focusable and clicking it opens the activity detail page.
- Console errors: none observed.

**Comparison History**

- Iteration 1: divider and creation-time row rendered slightly higher than the source.
- Fix: increased card height from `268px` to `274px`, moved the divider down, and increased spacing before the metadata row.
- Iteration 2: no actionable P0/P1/P2 differences remained.

**Implementation Checklist**

- [x] Replace the compact card with the reference composition.
- [x] Use source-faithful gift and clock assets.
- [x] Preserve hover, focus, keyboard, and click behavior.
- [x] Verify responsive fallback under `760px`.
- [x] Verify detail-page navigation and console errors.

**Follow-up Polish**

- No blocking polish items remain.

final result: passed

---

## 顶部搜索栏 UI 对照检查（2026-09-04）

**Comparison Target**

- Source visual truth: `/Users/goodlee/Documents/MBB/top-search-reference.png`
- Implementation screenshot: `/Users/goodlee/Documents/MBB/top-search-qa.png`
- Combined comparison: `/Users/goodlee/Documents/MBB/top-search-comparison.png`
- Viewport: `1264 x 714`
- Source pixels: `489 x 57`; implementation focused region: `489 x 57`; CSS search size: `354 x 28`; density normalization: `1x`
- State: 顶部栏默认状态，搜索类型为“流量卡查询”，输入框为空

**Full-View Comparison Evidence**

- The complete page screenshot confirms the search bar remains centered in the existing top navigation and does not disturb the logo or account area.
- The existing blue-green topbar background is intentionally preserved because the supplied reference only defines the search control itself.

**Focused Region Comparison Evidence**

- The reference and implementation were placed side by side in `top-search-comparison.png` at the same `489 x 57` frame size.
- The implementation matches the reference control structure: white pill container, blue left label, light placeholder text, and compact blue search button with icon.

**Findings**

- Fonts and typography: passed after removing the inherited ellipsis that truncated “流量卡查询”.
- Spacing and layout rhythm: passed. Search control is `354 x 28`, with a `66px` left section and `60 x 22` action button.
- Colors and visual tokens: passed. The control uses the project theme blue and reference-like neutral border and placeholder colors.
- Image quality and asset fidelity: passed. No raster assets are required; the existing project search icon style remains sharp at the compact size.
- Copy and content: passed. Label, placeholder, and action copy match the supplied reference.
- Interaction: passed. Type selection opens and closes correctly; the input accepts and clears text; no console errors were observed.

**Comparison History**

- Iteration 1: the left label was truncated as “流量卡...”.
- Fix: applied a search-local override to keep the complete label visible without changing shared dropdown behavior.
- Iteration 2: no actionable P0/P1/P2 differences remained.

**Implementation Checklist**

- [x] Match compact pill dimensions and border radius.
- [x] Match label, placeholder, icon, and button composition.
- [x] Preserve the existing topbar layout and background.
- [x] Verify input and dropdown interaction.
- [x] Check browser console errors.

**Follow-up Polish**

- No blocking polish items remain.

final result: passed

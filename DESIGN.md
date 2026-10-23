---
version: alpha
name: "MBB 无线宽带运营平台"
description: "高密度、低装饰的运营后台，以蓝色强调任务状态与主要操作。"
colors:
  primary: "#1687E8"
  background: "#FFFFFF"
  surface: "#FBFCFE"
  text: "#1F2329"
  muted: "#667085"
  border: "#E6EBF2"
  success: "#1A9B5A"
  warning: "#D78B16"
  danger: "#F04438"
  campaign-red: "#cc3f29"
  campaign-orange: "#b34f0c"
  campaign-badge: "#c8441b"
  campaign-link: "#1265bb"
  campaign-ink: "#10194f"
  campaign-blue: "#228cff"
  campaign-paper: "#edf8ff"
  campaign-white: "#fff"
  campaign-muted: "#626b8f"
  campaign-border: "#d9e2f7"
  campaign-error: "#d92837"
  campaign-scroll: "#81b0da"
  campaign-scroll-hover: "#427cad"
  campaign-sky: "#d7eeff"
  campaign-panel: "#f5faffed"
  campaign-winner-sky: "#b4e2ff"
  campaign-winner-card: "#fff5ed"
  campaign-winner-copy: "#98471f"
typography:
  sans:
    fontFamily: "Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "13px"
    lineHeight: "1.5"
  data:
    fontFamily: "Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "12px"
    lineHeight: "1.5"
  campaign-body:
    fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "14px"
  campaign-title:
    fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "20px"
    fontWeight: 800
    lineHeight: "28px"
  campaign-field:
    fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "16px"
    lineHeight: "22px"
  campaign-query-title:
    fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "24px"
    fontWeight: 800
    lineHeight: "34px"
rounded:
  DEFAULT: "4px"
  sm: "3px"
  md: "6px"
  campaign-field: "6px"
  campaign-action: "999px"
  campaign-panel: "16px"
  campaign-sheet: "16px"
spacing:
  page: "16px"
  control-gap: "12px"
  section-gap: "16px"
  campaign-gutter: "10px"
  campaign-panel-gap: "10px"
components:
  button:
    height: "32px"
    primary: "#1687E8"
    radius: "3px"
  input:
    height: "34px"
    border: "#E5E7EB"
    radius: "4px"
  table:
    header: "#FBFCFE"
    row-height: "42px"
    border: "#E7EBF1"
  campaign-primary-button:
    backgroundColor: "{colors.campaign-red}"
    textColor: "{colors.campaign-white}"
    rounded: "{rounded.campaign-action}"
    padding: "12px 18px"
  campaign-secondary-button:
    backgroundColor: "#f5faff"
    textColor: "{colors.campaign-blue}"
    rounded: "{rounded.campaign-action}"
    padding: "12px 18px"
  campaign-input:
    backgroundColor: "#f7fbff"
    textColor: "{colors.campaign-ink}"
    typography: "{typography.campaign-field}"
    rounded: "{rounded.campaign-field}"
    padding: "10px"
  campaign-information-panel:
    backgroundColor: "{colors.campaign-panel}"
    textColor: "{colors.campaign-ink}"
    rounded: "{rounded.campaign-panel}"
    padding: "12px 14px"
  campaign-sheet:
    backgroundColor: "{colors.campaign-white}"
    textColor: "{colors.campaign-ink}"
    rounded: "{rounded.campaign-sheet}"
    width: "calc(100% - 24px)"
---

# MBB 无线宽带运营平台 Design System

## Overview

### Creative North Star

The product follows the visual language of a dependable operations console: a quiet white work surface, a blue action rail, and compact data tables that keep high-volume workflows readable.

### Product context and register

- **Audience and primary job:** Operations, support, finance, and network teams manage devices, SIM cards, orders, notifications, and monitoring rules.
- **Target market(s) and evidence:** Chinese-language internal operations product; the existing interface and business labels are the source evidence.
- **Locale(s) and language policy:** Simplified Chinese labels with familiar enterprise terminology; identifiers and numbers remain in their source formats.
- **Usage scene:** Desktop browser, long sessions, dense tables, frequent filter and tab changes.
- **Register:** Product/admin.
- **Memorable signature:** Blue active rails and status dots make navigation and state readable without decorative noise.
- **Restraint:** Preserve the existing shell, spacing, and table density; feature pages should not introduce hero banners or marketing decoration.
- **Anti-references:** Avoid marketing cards, large gradients, oversized display typography, and rounded mobile-first controls.
- **Token ownership/runtime mapping:** This file documents the existing token evidence. Runtime styles remain in `index.html` and feature styles in `assets/*.js`.

## Colors

Blue `#1687E8` is reserved for primary actions, active tabs, links, and navigation rails. White surfaces carry the work area; `#FBFCFE` separates table headers from rows. Text uses `#1F2329` and `#667085` for secondary labels. Green, amber, and red communicate success, warning, and failure with text or status dots in addition to color.

## Typography

The interface uses an Arial-first sans stack with Chinese fallbacks. Controls and dense table data stay at 12–13px; section titles use weight and spacing rather than oversized type. Identifiers and timestamps remain unbroken where table width permits and scroll horizontally when necessary.

## Layout

The application uses a fixed top bar, a 226px navigation rail, a tab strip, and a 16px content inset. Query controls use four-column grids on desktop and collapse to fewer columns at narrow widths. Tables own horizontal overflow while pagination remains outside the table frame.

Whenever navigation selects a secondary menu page or one of its detail pages, expand its parent menu and synchronize the arrow direction. This applies to sidebar links, application tabs and links within pages. Other menu groups retain their current expansion state.

When a page places an action row between its search/reset controls and list, keep 16px between the search/reset controls and action buttons, and 16px between the action buttons and the list.

优惠券管理 under 订单中心 reuses the payment query grid, search/reset row, left-aligned primary action, bordered native table, sticky action column and bottom pagination. Keep the nine reference columns and the existing compact density. New/edit/delete overlays reuse the shared console modal title, body, field and footer styles. The opt-in keyboard extension for the authored select preserves its incumbent trigger/popup geometry and adds focus/highlight states; the shared admin overlay helper owns focus trapping, background inertness, Escape and restoration without changing legacy flows.

The coupon-reporting card was removed from activity management at the user's request; retain its existing report implementation without adding a replacement entry. Its detail panel reuses the shared custom select, authored date-range picker, 20-row client pagination for prototype data, and primary export action. Filters follow column order. A validity-range query matches overlapping record-validity intervals. Export includes every filtered record across pages. “查看订单” uses the exact usage order number in order management and preserves the coupon page's filters and current page when returning. A coupon without a usage order shows text instead of an enabled action.

Coupon totals between the export action row and table reuse the device-flow summary cards, with three columns on desktop and one on narrow screens. The usage-rate explanation reuses the service-account statistic help icon and tooltip, available on hover and keyboard focus. The rate displays two decimal places and summarizes all matching query results across pages. Initially and after resetting filters, statistics cover the whole activity.

The 双11福利 list uses the same three-card summary and formula tooltip. Keep it between the export row and table, with the existing 16px section rhythm. 优惠券领取状态/优惠券领取时间 and 优惠券核销状态/优惠券核销时间 reuse independent instances of the shared custom select and date-range picker; non-applicable cells use `--`. Query order follows the list columns. The sticky action column contains 查看核销订单 only for redeemed coupons, alongside the established edit/delete actions. The ten-column table has a 1680px minimum width and uses separate borders with zero spacing and a single 1px #E7EBF1 grid, preserving reliable borders beside the sticky actions. Activity order links share `openOrderByNumber`, so destination filtering and restoration follow one navigation path.

## Elevation & Depth

Hierarchy comes from borders, light gray surfaces, and the active blue rail. Static content stays flat. Shadows are reserved for menus, dialogs, and transient overlays.

## Shapes

Controls use compact 3–4px corners. Tables use square borders and thin dividers. Status dots are small and semantic; they are paired with text labels.

## Components

### Foundational visual states

Default controls use white surfaces and light borders. Hover uses a pale blue surface, focus uses the primary border, selected navigation uses a blue text and rail, disabled controls reduce contrast, and error states use red borders with text guidance.

### Buttons and actions

Primary buttons are blue with white text. Secondary and reset actions are white with gray borders. The primary action in a CRUD page appears in the action row and keeps its label consistent through the flow.

### Navigation and data display

The left navigation is collapsible at the first-level group. Open pages appear as closable tabs in the tab strip. Tables keep field names explicit, use a light header row, and place pagination below the table surface.

### Forms and overlays

Forms use 32px controls, left labels, explicit required markers, authored dropdowns, and inline validation. Date fields follow the surrounding product control language. Uploads and notification targets stay close to the field they configure.

### Iconography

The shell reuses its existing compact line icon set. Icons support labels and never carry meaning alone.

### Motion

Motion is limited to short open/close transitions for menus and overlays. Reduced-motion users retain the same state changes without decorative movement.

### Content and data visualization

Use direct Chinese action labels such as “搜索”“重置”“规则新增”“保存规则”. Show timestamps in `YYYY-MM-DD HH:mm:ss` and usage with a clear unit.

### Double 11 public H5

The current source is the user's 2026-10-22 registration-page screenshot, recorded in `assets/double11-assets.md`. Match its blue-sky and gift-field hero, dimensional gold/orange promotional lettering, three prize cards, an activity title immediately followed by the blue process strip, white participation form, orange/red submission action and complete rules below it. The previous prize wheel and immediate-draw dialogs are no longer active. Keep the operations-console design separate.

**Runtime and tokens.** `double11.html` keeps the established fixed 375 × 812px iframe preview. The outer desktop page does not scroll or scale the phone. `double11-content.html` owns native vertical scrolling, wheel/trackpad/touch input and contained overscroll. Do not compress type, controls or whitespace to fit all content on one screen. The existing `#participate` deep link scrolls to the inline form. `assets/double11-h5.css` maps campaign color tokens to same-named CSS properties; CTA uses campaign-red through campaign-orange. The body uses Chinese sans, input values remain 16px, helper copy is at least 12px, and form fields have a minimum 44px height. Secondary text and placeholders use the darker campaign-muted token; small blue links and rule markers use campaign-link. White badge and CTA text use deeper warm backgrounds to keep contrast at least 4.5:1. Dialog headings share the 20px title step. The UI uses the existing Phosphor icon family; product images and hero are generated raster assets, with source prompts kept adjacent.

**Form and feedback.** The participation form contains device SN followed by the recharge screenshot; contact phone and shipping address are no longer collected or shown in the receipt. Labels align to the top of their field rows. The single JPG/PNG upload allows up to 10MB, reusing `ActivityScreenshot.read` with explicit options; admin uploads keep their existing defaults. Selection, preview, removal, reading, validation and retry feedback stay in the form. Submit reserves its dimensions, prevents duplicate submissions and shows a pending-draw receipt instead of inventing an instant prize. Data remains in the local prototype session.

**Overlays and device tools.** Receipt, image preview and the SN scan helper use native dialogs inside the iframe, keep page scroll locked while open and restore it afterward. Scanning detects platform support; unsupported environments keep manual SN input available. A selected barcode photo can populate one unambiguous SN or report a recoverable error. Dismissing a scan discards late results. Back returns to the existing admin application. Reduced-motion users receive the same states without animation. Date and rule text belong to `PRODUCT.md`.

**Activity state preview and result lookup.** The fixed phone is accompanied by a right-side vertical tab bar: 参与活动 / 查询中奖结果 / 中奖 / 未中奖. These are preview controls outside the iframe; on a narrow host viewport they float at the upper right without shrinking the 375 × 812 screen. Tabs use roving keyboard focus, Up/Down/Home/End, explicit selected state and one labelled preview panel. Switching views sends a constrained message to the existing iframe instead of reloading it. The host and iframe verify message source and allowed state values. Each view retains its scroll position, and draft participation values remain intact.

The query view follows `assets/double11-results-reference.png`: existing hero, centered 24px/34px query heading and search icon, short helper text, white SN form with scan and clear actions, warm primary query button and a separate white rules panel. Per the user's subsequent adjustment, the query SN label sits above its full-width input with an 8px gap; the participation form keeps its existing field layout. Reuse the shared form field, primary button, image assets, dialogs and campaign colors. The rules section is moved between views rather than duplicated. Loading, inline validation, completed results and retry feedback stay with the query form. Known demo winners open the dedicated winning view; the completed text result remains in the query form for return navigation. Images failing to load are hidden while textual results remain usable. Do not place SNs in document titles or URLs.

**Winning state.** The new reference is `assets/double11-winner-reference.png` (850 × 1850px). A full-bleed raster poster contains the sky/confetti/crown, dimensional congratulatory lettering, campaign ribbon, prize, laurels, rank, prize name and quantity. Three 850 × 1850px poster variants share that composition. The cream notice card remains semantic HTML, with a Phosphor confetti icon, 20px/28px red heading and 16px/24px warm body text, using campaign-winner-card/copy tokens. It sits at 64% of poster height (66% for the taller power-bank composition), leaving the art unobscured. Reuse the round back control. The winning view hides the participation/query content, preserves the fixed phone viewport and restores the previous state and scroll position when returning. Direct preview defaults to the second-prize cup before any successful query. A successful query supplies the corresponding known mock prize and synchronizes the outer selected tab. If artwork fails, show textual prize details and a retry action without collapsing page geometry.

**Non-winning state.** `assets/double11-nonwinner-reference.png` supplies the blue sky, dimensional 很遗憾/未中奖 lettering, campaign ribbon, empty blue gift box and clouds. A dedicated generated 850 × 1850px raster contains this artwork, excluding the live back button and notice. Reuse the winning page's poster/viewport, back control and shared artwork-failure/retry behavior. The separate notice begins at 62% of poster height, uses the existing pale campaign-panel surface, a blue Phosphor megaphone beside its 20px/28px navy title, and 16px/24px campaign-muted copy spanning the card below. This is an intentional cool variant of the warm winning notice. Query navigation and the fourth preview tab select the same state; back restores the previous view without clearing data. Pending, no-record and failed queries stay in the query panel.

## Do's and Don'ts

- **Do:** Extend existing query, table, tab, pagination, and status patterns before adding a new variant.
- **Do:** Keep independent business fields separate when the workflow names them separately.
- **Don't:** Add a page hero or decorative region that pushes the working form below the fold.
- **Don't:** Use color alone to communicate status or make an action look primary when it is destructive.

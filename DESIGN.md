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
typography:
  sans:
    fontFamily: "Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "13px"
    lineHeight: "1.5"
  data:
    fontFamily: "Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "12px"
    lineHeight: "1.5"
rounded:
  DEFAULT: "4px"
  sm: "3px"
  md: "6px"
spacing:
  page: "16px"
  control-gap: "12px"
  section-gap: "16px"
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

## Do's and Don'ts

- **Do:** Extend existing query, table, tab, pagination, and status patterns before adding a new variant.
- **Do:** Keep independent business fields separate when the workflow names them separately.
- **Don't:** Add a page hero or decorative region that pushes the working form below the fold.
- **Don't:** Use color alone to communicate status or make an action look primary when it is destructive.

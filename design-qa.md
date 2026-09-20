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

## 规则中心增量检查（2026-09-19）

**Comparison Target**

- Source visual truth: `/Users/goodlee/Downloads/yuque_diagram.jpg`（规则中心结构图，2684 x 2888）
- Implementation: `http://127.0.0.1:8770/index.html`，Codex In-app Browser live capture at `1280 x 720`
- State: 首页默认状态；规则中心展开后的规则管理、触发记录、规则新增页签

**Full-View Comparison Evidence**

- 结构图定义的规则管理查询区、规则新增操作、规则列表字段、触发记录查询区和列表字段均已映射到独立页面。
- 页面沿用现有 MBB 后台的蓝色顶栏、左侧一级菜单、面包屑页签、查询网格、表格、状态点和表格外分页布局。

**Focused Region Comparison Evidence**

- 规则列表重点检查：规则名称与规则类型为独立列，规则新增为主按钮，筛选下拉提供完整示例选项，分页位于列表框外。
- 规则新增重点检查：基础信息、监测范围（全平台监测、自定义监测、范围监测同级展示）、监测规则、生效时间和通知方式均可见；供应商、商户、运营商仅在选择范围监测时显示并可编辑，选择自定义监测时才显示上传文件入口。

**Findings**

- Fonts and typography: passed. New screens use the existing Arial/中文回退字体和 12–13px 后台密度。
- Spacing and layout rhythm: passed. 查询区、表格、页签和分页沿用现有页面节奏，新增页未引入独立头图区域。
- Colors and visual tokens: passed. 新增页面使用现有主题蓝、边框灰和状态色。
- Image quality and asset fidelity: passed. 结构图没有需要额外导入的图片资产，菜单图标复用现有线性图标。
- Copy and content: passed. 图中字段均有对应中文标签，供应商、商户、运营商保持独立。
- Interaction: passed. 一级菜单展开、规则管理/触发记录切换、规则新增面包屑页签、下拉筛选、自定义监测上传入口和保存返回列表均已验证。
- Console errors: none observed in the browser-rendered check.

**Implementation Checklist**

- [x] 新增规则中心一级菜单及规则管理、触发记录二级菜单。
- [x] 新增规则管理列表和触发记录列表页面。
- [x] 新增规则新增页签及表单交互。
- [x] 将范围监测调整为与全平台监测、自定义监测同级，范围监测不显示上传文件入口。
- [x] 通知方式选中后展示对应配置行，可选择通知模板，并通过账号管理弹窗多选通知对象。
- [x] 保持首页默认打开，其他一级菜单默认折叠。
- [x] 保留现有页面内容，仅新增 `assets/rule-center.js` 和脚本挂接。

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

# MBB — confirmed product context

## Order center and coupon definitions

The user renamed 支付中心 to 订单中心 and added 优惠券管理 as its secondary menu, alongside the existing order/refund pages. The current columns are 优惠券ID、优惠券名称、优惠券类型、使用门槛、优惠金额、备注、创建人、创建时间、操作. Search by 优惠券名称 (substring), 优惠券类型 (single selection) and 优惠券ID (exact match). Both 满减券 and 抵扣券 are available in filtering, creation and editing. Keep 搜索、重置 and the left-aligned 新增优惠券 action in the existing console patterns, with 16px around the action row and pagination at the page bottom.

新增优惠券 and 编辑 edit name, type, threshold, discount amount and optional long-text remark. ID is generated monotonically; creator and creation time are set on creation and preserved during edits. Required fields and decimal syntax (at most two decimal places) are validated inline, with the first invalid field focused. The reference includes duplicate names, signed amounts and a zero threshold; reproduce those local examples without inventing a name-uniqueness rule or a financial calculation policy. This prototype manages local definitions only. It does not issue coupons, change checkout calculations, alter order history, or modify activity claim/redemption records.

使用门槛 follows the selected 优惠券类型: 满减券 shows only 满 x 元可用; 抵扣券 shows only 套餐有效天数 ≥ x 天可用. This latest requirement supersedes the earlier simultaneous selection of both rules. Changing type selects and enables its applicable checkbox/input, hides and disables the other rule, and clears obsolete threshold errors. Preserve draft values during switching, but validate and save only the rule applicable to the chosen type. Keep the existing required-group behavior and default new definitions to 满减券. Editing restores the corresponding type, visible rule and value; list summaries likewise show only the applicable condition. Amount precision follows the existing decimal contract; package days accept non-negative safe integers. Existing 满减券 examples retain their values; the local 抵扣券 example uses a 180-day condition. The local prototype stores and displays these conditions only; it does not introduce a checkout eligibility evaluator or assume a financial calculation policy.

删除 opens an app-owned confirmation naming both coupon name and ID. Cancel leaves data intact. Save/delete update the current query result, clamp pagination and announce the outcome. Search state and local mutations stay in this document's memory, matching the static console's tab navigation; they are not persisted to URLs or storage because this project has no route/data service. Empty results retain all nine headers and a correct spanning row.

Canonical UI ownership for this flow: `index.html` owns page/tab navigation, parent-menu expansion, query-input clear controls and the authored `.custom-select` pointer primitive; `assets/admin-ui.js` adds its opt-in keyboard variant and shared modal focus/inert/restore behavior. Existing `.payment-filter`, `.btn`, `.table-card`, `.pagination`, `.modal`, `.modal-body`, `.form-row` and `.modal-actions` own visual geometry. `assets/coupon-management.css` supplies only coupon table/field sizing, the existing 16px action rhythm and scoped state treatment. `assets/coupon-management.js` owns local CRUD, validation, filtering and 20-row pagination. Legacy flows keep their existing owners.

## Activity status

### Coupon reporting activity — card entry removed

The user removed the “双11福利优惠券领取情况” card from activity management on 2026-10-22. The existing report implementation remains in the project; do not reintroduce the card without a new request. Its activity dates are 2026-11-01 through 2026-11-11. The report is a read-only activity detail table with device SN, claim time, redemption status, validity interval, usage time and a view-order action. Queries follow those business fields; export covers all matching rows across pages. Redeemed coupons open the exact usage order in order management; coupons without a usage order do not navigate to unrelated orders. Sample claim/validity dates and linked orders are local prototype fixtures, not coupon issuance rules or accounting data.

The activity detail summarizes issued total, used total and coupon usage rate immediately above the list. The user-defined formula is used total / issued total × 100%, explained through a help icon. Both totals follow the current query conditions and cover all matching records across pages. Initially and after resetting filters, statistics cover all activity records. Issued total counts the successfully issued coupon records matching the query (represented by the claim fixtures here). Display the rate to two decimal places and show 0.00% when no records match.

The status field is named “核销状态” in the activity query, table and export, with values “已核销” and “未核销”. Usage totals count “已核销” records. The existing usage-rate and usage-time labels and the separate order-management coupon field retain their current terminology.

### Restored lottery activity

At the user's request on 2026-10-22, restore the “双11福利 / 充值下单免费抽奖” activity from its pre-removal backup. Restore the activity card, record-management page, filters, export, record details, single-image screenshot preview/upload, edit/delete flows and H5 entry documents. Keep the later coupon-reporting activity and its query-driven statistics and redemption status intact. The activity brief below again describes the restored prototype.

The user confirmed the admin record prize names as “充电宝”, “水杯” and “5元充值优惠券”. Retain these names in the internal record data and H5 result views. The first two are physical prizes and the coupon is virtual.

### Current 双11福利 admin fields and coupon statistics

The current requirements remove 微信UnionID、抽奖记录ID、订单状态、充值时间、充值金额（元）、中奖状态、参与时间、奖品名称、奖品类型、收货地址 from the query, list and export. The list columns are 序号、手机号码、设备SN、所属商户、订单截图、优惠券领取状态、优惠券领取时间、优惠券核销状态、优惠券核销时间、操作. Queries cover 手机号码、设备SN、所属商户 and the four coupon claim/redemption fields. Internal record IDs remain implementation keys. Remove the 查看详情 action and its obsolete detail drawer; keep screenshot preview, edit, delete and export.

Existing admin demo rows retain their shipping addresses, and the admin editor still rejects empty or whitespace-only addresses. The latest H5 participation request removes contact phone and shipping address from entry, validation, submission data and receipt; participation now requires only device SN and one recharge screenshot. The existing admin mock dataset remains separate from H5 submissions.

Use 优惠券领取状态 (已领取 / 未领取) and 优惠券领取时间 in place of the former 兑奖状态/兑奖时间 labels. Add independent 优惠券核销状态 (已核销 / 未核销) and 优惠券核销时间 in the query, list and export. Store claim and redemption timestamps separately; claiming a coupon does not imply redemption. Coupon winners without a successfully issued coupon show 未领取, without a claim time or redemption fields; non-coupon records show `--` for all four fields. Issued coupons have a claim timestamp and redemption status; only redeemed coupons have a redemption timestamp and usage order number. Local sample claim timestamps are on November 12, separately from the sample redemption on November 13. Only redeemed coupons expose 查看核销订单, navigating to order management with the corresponding order number and clearing unrelated order filters. Demo usage orders are independent fixtures; editing or deleting an activity row never rewrites or deletes the order history.

Place coupon totals directly above the list. Apply the current query to every total across pages; the initial and reset states cover all records. 优惠券发放总数 counts actually issued coupons, excluding physical prizes and failed/pending issuance. 优惠券核销总数 counts redeemed issued coupons. 优惠券核销率 = 优惠券核销总数 / 优惠券发放总数 × 100%, with a help icon explaining the formula and scope. Display two decimal places and 0.00% when the denominator is zero. The prototype contains both redeemed and unredeemed issued coupons and a failed-issuance example.

<!-- impeccable:product-schema 1 -->

## Platform

web, mobile H5 in the existing 375 × 812px preview container.

## Users and purpose

Consumers submit participation information after a mini-program recharge. The H5 remains available as the standalone `double11.html` prototype. At the user's request, the entire activity-page link area, including its link and open-H5 button, has been removed from the 双11福利 admin page. This is a local frontend prototype, without a production entry, verification or prize-issuing service.

## Current H5 source and requirements

### Participation and result-query states

The user added a right-side preview tab bar with “参与活动” selected initially and a second “查询中奖结果” state. The query visual reference is `assets/double11-results-reference.png` (852 × 1616px). Reuse the existing promotional hero and one shared activity-rules section; hide prize cards and participation fields in the query state.

Query by required device SN through an explicit submit button or Enter. Reuse the SN photo-recognition/manual fallback helper, with the result written to the active form only. Include clear, loading, winning, non-winning, pending-draw, missing-record and recoverable error states. Switching views preserves form values, uploaded screenshot, completed query and each view's scroll position; cancel pending queries so stale results cannot overwrite the visible state. SN query values remain in memory, never in the URL or persistent browser storage.

The prototype uses explicit local demo SNs `MBB-DEMO-0001` through `MBB-DEMO-0012`, matching the admin demo outcomes: 0001/0002/0012 power bank, 0003/0011 cup, 0004/0005/0009 coupon, 0006/0010 non-winning, 0007 pending, 0008 awaiting result update. Unknown SNs return no participation record, without assigning random prizes. Newly submitted SNs can be queried as pending in the same page session. No production result lookup or prize issuance is connected.

### Winning state

The right-side preview now includes “中奖”, matching `assets/double11-winner-reference.png` (850 × 1850px). Participation remains the initial state. Before a successful query, the winning preview shows the supplied second-prize example: 儿童保温水杯, 二等奖, 共800份. Known winning SNs open the winning page with the corresponding prize/rank/count: 充电宝/一等奖/500份, 水杯/二等奖/800份 or 5元充值优惠券/三等奖/1500份. This displays existing mock outcomes; it does not perform a new draw or allocate a prize.

Physical-prize copy follows the screenshot: “恭喜您获得{奖项}！” and “请耐心等待奖品发放，我们会尽快与您联系。” Coupon copy retains the existing half-year validity and half-year/year-package restriction. The top-left back control returns to the preceding participation/query state with its values and scroll restored. Query-driven navigation synchronizes the host's selected tab without reloading the iframe. The current draft and any query SN remain in memory only. There is no added claim form, delivery service or backend mutation.

### Non-winning state

The right-side preview also includes “未中奖”, matching `assets/double11-nonwinner-reference.png` (851 × 1848px). The page displays “很遗憾，未中奖”, the campaign ribbon, an open empty gift box, and the supplied notice: “感谢您的参与！” / “本次未中奖，别灰心，下次还有机会，更多精彩好礼等你来抽！”

Only explicit non-winning mock outcomes (`MBB-DEMO-0006`, `MBB-DEMO-0010`) navigate to this page after a query. Missing records, pending draws, awaiting updates and query failures retain their distinct query feedback; they are never converted into non-winning outcomes. A direct preview remains available without changing any outcome record. Back returns to the prior view and restores its SN, draft and scroll position. The host tab stays synchronized without reloading the iframe or exposing SNs in URLs. No draw, prize allocation, or other backend effect is introduced.

The 2026-10-22 user screenshot `codex-clipboard-da3ab50b-2ddb-4153-bf4a-1df0a5fe06e8.png` supersedes the earlier instant-wheel screen:

- Activity: 2026-11-01 through 2026-11-11, mini-program recharge orders qualify for participation after entry submission.
- First prize: 10000mAh power bank, 500 units. Second: children's insulated cup, 800 units. Third: 5 yuan recharge coupon, 1500 units. Admin names remain 充电宝、水杯、5元充值优惠券.
- Inline form order: required device SN, required single recharge screenshot. Contact phone and shipping address have been removed, including their validation, receipt display and submission properties.
- Screenshot: one JPG/PNG, no more than 10MB. Preserve the admin screenshot behavior through explicit per-use options rather than changing its defaults.
- Submit collects information and returns a pending-draw receipt. Do not select a client-side prize or run the former wheel.
- The screenshot gives public random drawing at November 12, 12:00. The pictured redemption wording also asks winners to fill the address before November 12, 12:00; reproduce it as supplied, without inventing another deadline or implementing an automated deadline decision.
- Prize pictures are illustrative; real physical prizes govern, with no cash conversion or replacement.
- The 5 yuan coupon lasts half a year and is limited to half-year/year package recharges.
- Orders are checked after receipt information submission; ineligible participation loses the right to claim. Incorrect shipping information that prevents delivery is deemed abandonment.
- The final-interpretation statement names 诺达通讯, as in the supplied screenshot.

## Prototype boundaries

All fields and the core upload/validation/submission feedback are interactive. SN recognition uses the optional browser barcode detector with manual input fallback, not a real mini-program scanning integration. Submission stays in page memory and never claims a drawn prize. No live eligibility, odds, user-account binding, order verification, batch drawing or prize delivery service has been supplied. Back-end activity lists remain separate mock datasets. There is no new history entry, no marketing footer and no coupon-reporting card restoration.

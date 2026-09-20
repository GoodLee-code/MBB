(function(){
  'use strict';

  const RULE_PAGE_TYPES = ['ruleList','ruleTriggerRecords','ruleTriggerSummary','ruleCreate','ruleDetail'];
  const RULE_TITLES = {
    ruleList: '规则管理',
    ruleTriggerRecords: '触发明细',
    ruleTriggerSummary: '触发记录',
    ruleCreate: '规则新增',
    ruleDetail: '规则详情'
  };
  const ruleTypes = ['流量用量监测'];
  const ruleStatuses = ['开启','关闭'];
  const triggerStatuses = ['已触发','未触发'];
  const reminderTypes = ['阈值提醒','间隔提醒'];
  const notificationTypes = ['邮箱','企业微信','短信通知','站内通知'];
  const notificationTypeKeys = {'邮箱':'email','企业微信':'wechat','短信通知':'sms','站内通知':'inbox'};
  const ruleScopeFieldIds = ['ruleCreateMerchant','ruleCreateCardGroup','ruleCreateSupplier','ruleCreateOperator'];
  let ruleNotificationTargets = {};
  let ruleSharedNotificationTargets = [];
  let ruleNotificationConfigMode = 'shared';
  let ruleNotificationChannelSelections = {};
  let ruleIndividualNotificationSettings = {};
  let ruleNotificationModalChannel = '';
  let ruleNotificationTime = 'immediate';
  let currentRuleDetailId = '';
  let ruleThresholdReminderValues = [''];
  let ruleIntervalReminderValue = '';
  let ruleScopeFileName = '';
  let ruleScopeIccids = [];
  let ruleEffectiveMonthView = new Date(new Date().getFullYear(),new Date().getMonth(),1);
  const ruleRecords = [
    {id:'RULE202609180001',name:'月度流量阈值提醒',type:'流量用量监测',status:'生效中',effectiveAt:'2026-09-18',createdAt:'2026-09-18 09:12:08',updatedAt:'2026-09-18 09:12:08',operator:'陈思远',scopeMode:'iccid',scopeLabel:'指定ICCID',scopeFileName:'ICCID监测名单_20260918.xlsx',scopeIccids:['89860488192540182881']},
    {id:'RULE202609150003',name:'企业卡用量间隔通知',type:'流量用量监测',status:'生效中',effectiveAt:'2026-09-01',createdAt:'2026-09-15 16:40:21',updatedAt:'2026-09-16 10:18:30',operator:'周文博'},
    {id:'RULE202609120006',name:'南区流量高峰提醒',type:'流量用量监测',status:'待生效',effectiveAt:'2026-10-01',createdAt:'2026-09-12 14:25:16',updatedAt:'2026-09-12 14:25:16',operator:'林若安'},
    {id:'RULE202609080004',name:'套餐流量提前通知',type:'流量用量监测',status:'生效中',effectiveAt:'2026-09-08',createdAt:'2026-09-08 11:06:45',updatedAt:'2026-09-08 11:06:45',operator:'张可昕'},
    {id:'RULE202608270002',name:'区域流量高峰提醒',type:'流量用量监测',status:'已停用',effectiveAt:'2026-08-01',createdAt:'2026-08-26 17:32:10',updatedAt:'2026-09-02 09:05:44',operator:'段玉'},
    {id:'RULE202608190007',name:'备用卡流量监控',type:'流量用量监测',status:'生效中',effectiveAt:'2026-08-19',createdAt:'2026-08-19 13:48:02',updatedAt:'2026-08-19 13:48:02',operator:'李凡'}
  ];
  const triggerRecords = [
    {type:'流量用量监测',id:'RULE202609180001',name:'月度流量阈值提醒',triggerAt:'2026-09-19 09:28:42',msisdn:'138****2468',iccid:'89860488192540182881',merchant:'上海智联商贸',supplier:'中国移动',operator:'中国移动',usage:'4,096.00',condition:'达到 4,000 MB',action:'仅通知',actionResult:'成功',notificationRecordIndex:0},
    {type:'流量用量监测',id:'RULE202609150003',name:'企业卡用量间隔通知',triggerAt:'2026-09-19 08:16:20',msisdn:'139****7214',iccid:'89860488192540182905',merchant:'杭州云旅科技',supplier:'中国联通',operator:'中国联通',usage:'2,048.72',condition:'达到 2,000 MB',action:'仅通知',actionResult:'成功',notificationRecordIndex:1},
    {type:'流量用量监测',id:'RULE202609120006',name:'南区流量高峰提醒',triggerAt:'2026-09-18 23:40:12',msisdn:'136****9182',iccid:'89860488192540182764',merchant:'苏州星河酒店',supplier:'中国电信',operator:'中国电信',usage:'0.00',condition:'达到 0 MB',action:'通知并关闭流量数据服务',actionResult:'失败',notificationRecordIndex:2},
    {type:'流量用量监测',id:'RULE202609080004',name:'套餐流量提前通知',triggerAt:'2026-09-18 18:02:07',msisdn:'137****5061',iccid:'89860488192540182690',merchant:'深圳远帆科技',supplier:'中国移动',operator:'中国联通',usage:'812.40',condition:'达到 800 MB',action:'仅通知',actionResult:'成功',notificationRecordIndex:0},
    {type:'流量用量监测',id:'RULE202608270002',name:'区域流量高峰提醒',triggerAt:'2026-09-18 16:45:33',msisdn:'150****4638',iccid:'89860488192540182571',merchant:'上海智联商贸',supplier:'中国联通',operator:'中国移动',usage:'6,240.18',condition:'达到 6,000 MB',action:'通知并关闭流量数据服务',actionResult:'成功',notificationRecordIndex:1}
  ];

  const escapeHtml = value => String(value == null ? '' : value)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\"/g,'&quot;').replace(/'/g,'&#39;');

  const selectMarkup = (id, placeholder, options, extraClass='') => `
    <div class="select custom-select rule-select ${extraClass}" id="${id}" data-value="" data-placeholder="${escapeHtml(placeholder)}">
      <span class="select-value">${escapeHtml(placeholder)}</span>
      <span class="select-clear" role="button" tabindex="0" aria-label="清除${escapeHtml(placeholder)}" title="清除"></span>
      <div class="dropdown-menu">${options.map(option => `<div class="dropdown-option" data-value="${escapeHtml(option)}">${escapeHtml(option)}</div>`).join('')}</div>
    </div>`;

  const ruleMenuMarkup = `
    <div class="menu rule-center-menu" id="menuRuleCenter" onclick="toggleMenuGroup('ruleCenterSubMenu','menuRuleCenter')">
      <svg class="menu-generic-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7.5 12 3l8 4.5-8 4.5-8-4.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M4 7.5v9L12 21l8-4.5v-9M12 12v9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
      <span class="menu-title">规则中心</span><span class="collapse-icon"></span>
    </div>
    <div class="sub-group collapsed" id="ruleCenterSubMenu">
      <div class="sub" id="menuRuleList" onclick="showPage('ruleList')">规则管理</div>
      <div class="sub" id="menuRuleTriggerRecords" onclick="showPage('ruleTriggerRecords')">触发记录</div>
    </div>`;

  const rulePagesMarkup = `
    <section id="ruleListPage" class="content hidden rule-center-page">
      <div class="system-filter rule-center-filter" id="ruleListFilter">
        <input class="input" id="ruleListKeyword" placeholder="规则ID/规则名称" aria-label="规则ID或规则名称">
        ${selectMarkup('ruleListTypeFilter','规则类型',ruleTypes)}
        ${selectMarkup('ruleListStatusFilter','生效状态',ruleStatuses)}
        ${selectMarkup('ruleListTriggerStatusFilter','触发状态',triggerStatuses)}
        <div class="device-date-range" id="ruleListRecentTriggerRange" data-range="ruleListRecentTrigger" onclick="openUnifiedRangePicker(event,'ruleListRecentTrigger')">
          <span class="date-icon"></span><span class="device-date-text" data-part="start">最近触发开始日期</span><span class="date-range-to">至</span><span class="device-date-text" data-part="end">最近触发结束日期</span><span class="date-range-clear" onclick="clearUnifiedRange(event,'ruleListRecentTrigger')"></span>
          <input id="ruleListRecentTriggerStartInput" type="hidden"><input id="ruleListRecentTriggerEndInput" type="hidden"><div class="calendar-panel device-date-panel range-calendar-panel" id="ruleListRecentTriggerPanel"></div>
        </div>
        <div class="filter-actions new-row"><button type="button" class="btn line" id="ruleListSearchBtn">搜索</button><button type="button" class="btn gray" id="ruleListResetBtn">重置</button></div>
      </div>
      <div class="action-row rule-center-actions"><button type="button" class="btn" id="ruleCreateBtn">规则新增</button></div>
      <div class="table-card rule-table-wrap">
        <table class="rule-table"><thead><tr><th>规则ID</th><th>规则名称</th><th>规则类型</th><th>生效状态</th><th>触发状态</th><th>生效时间</th><th>最近触发时间</th><th>创建时间</th><th>更新时间</th><th>操作人</th><th class="sticky-action">操作</th></tr></thead><tbody id="ruleListRows"></tbody></table>
      </div>
      <div class="pagination rule-pagination" id="ruleListPagination"></div>
    </section>

    <section id="ruleTriggerSummaryPage" class="content hidden rule-center-page">
      <div class="inner-tabs rule-trigger-tabs" role="tablist" aria-label="规则触发页面切换">
        <span class="inner-tab active" role="tab" aria-selected="true">触发记录</span>
        <span class="inner-tab" role="tab" aria-selected="false" onclick="showPage('ruleTriggerRecords')">触发明细</span>
      </div>
      <div class="system-filter rule-center-filter" id="ruleTriggerSummaryFilter">
        ${selectMarkup('triggerSummaryRuleTypeFilter','触发规则类型',ruleTypes)}
        <input class="input" id="triggerSummaryRuleKeyword" placeholder="触发规则ID/触发规则名称" aria-label="触发规则ID或触发规则名称">
        <div class="device-date-range" id="triggerSummaryTimeRange" data-range="triggerSummaryTime" onclick="openUnifiedRangePicker(event,'triggerSummaryTime')">
          <span class="date-icon"></span><span class="device-date-text" data-part="start">触发开始日期</span><span class="date-range-to">至</span><span class="device-date-text" data-part="end">触发结束日期</span><span class="date-range-clear" onclick="clearUnifiedRange(event,'triggerSummaryTime')"></span>
          <input id="triggerSummaryTimeStartInput" type="hidden"><input id="triggerSummaryTimeEndInput" type="hidden"><div class="calendar-panel device-date-panel range-calendar-panel" id="triggerSummaryTimePanel"></div>
        </div>
        <div class="filter-actions new-row"><button type="button" class="btn line" id="triggerSummarySearchBtn">搜索</button><button type="button" class="btn gray" id="triggerSummaryResetBtn">重置</button></div>
      </div>
      <div class="table-card rule-table-wrap"><table class="rule-table trigger-summary-table"><thead><tr><th>触发记录ID</th><th>触发规则类型</th><th>触发规则ID</th><th>触发规则名称</th><th>触发时间</th><th>触发卡数</th><th>通知记录ID</th></tr></thead><tbody id="ruleTriggerSummaryRows"></tbody></table></div>
      <div class="pagination rule-pagination" id="ruleTriggerSummaryPagination"></div>
    </section>

    <section id="ruleTriggerRecordsPage" class="content hidden rule-center-page">
      <div class="inner-tabs rule-trigger-tabs" role="tablist" aria-label="规则触发页面切换">
        <span class="inner-tab" role="tab" aria-selected="false" onclick="showPage('ruleTriggerSummary')">触发记录</span>
        <span class="inner-tab active" role="tab" aria-selected="true">触发明细</span>
      </div>
      <div class="system-filter rule-center-filter" id="ruleTriggerFilter">
        <input class="input" id="triggerRecordIdFilter" placeholder="触发记录ID" aria-label="触发记录ID">
        ${selectMarkup('triggerRuleTypeFilter','触发规则类型',ruleTypes)}
        <input class="input" id="triggerRuleKeyword" placeholder="触发规则ID/触发规则名称" aria-label="触发规则ID或触发规则名称">
        <div class="device-date-range" id="triggerDetailTimeRange" data-range="triggerDetailTime" onclick="openUnifiedRangePicker(event,'triggerDetailTime')">
          <span class="date-icon"></span><span class="device-date-text" data-part="start">触发开始日期</span><span class="date-range-to">至</span><span class="device-date-text" data-part="end">触发结束日期</span><span class="date-range-clear" onclick="clearUnifiedRange(event,'triggerDetailTime')"></span>
          <input id="triggerDetailTimeStartInput" type="hidden"><input id="triggerDetailTimeEndInput" type="hidden"><div class="calendar-panel device-date-panel range-calendar-panel" id="triggerDetailTimePanel"></div>
        </div>
        <input class="input" id="triggerMsisdnIccid" placeholder="MSISDN/ICCID" aria-label="MSISDN或ICCID">
        <div class="filter-actions new-row"><button type="button" class="btn line" id="triggerSearchBtn">搜索</button><button type="button" class="btn gray" id="triggerResetBtn">重置</button></div>
      </div>
      <div class="table-card rule-table-wrap"><table class="rule-table trigger-table"><thead><tr><th>触发记录ID</th><th>触发规则类型</th><th>触发规则ID</th><th>触发规则名称</th><th>触发时间</th><th>MSISDN</th><th>ICCID</th><th>所属商户</th><th>供应商</th><th>运营商</th><th>使用量（MB）</th><th>触发条件</th><th>触发动作</th><th>动作结果</th><th>通知记录ID</th></tr></thead><tbody id="ruleTriggerRows"></tbody></table></div>
      <div class="pagination rule-pagination" id="ruleTriggerPagination"></div>
    </section>

    <section id="ruleCreatePage" class="content hidden rule-center-page rule-create-page">
      <div class="rule-create-shell">
        <section class="rule-form-section"><div class="rule-form-title">基础信息</div><div class="rule-form-grid">
          <label class="rule-field"><span class="rule-field-label req">规则类型</span>${selectMarkup('ruleCreateType','请选择规则类型',ruleTypes)}</label>
          <label class="rule-field"><span class="rule-field-label req">规则名称</span><input class="input" id="ruleCreateName" placeholder="请输入规则名称"></label>
          <div class="rule-field rule-field-wide"><span class="rule-field-label">备注<span class="rule-field-optional">（选填）</span></span><textarea class="textarea rule-remark-textarea" id="ruleCreateRemark" placeholder="请输入备注"></textarea></div>
        </div></section>
        <section class="rule-form-section"><div class="rule-form-title">监测范围</div><div class="rule-notification-base-row"><span class="rule-field-label req">监测范围</span><div class="rule-radio-row" role="radiogroup" aria-label="监测范围"><label><input type="radio" name="ruleScope" value="iccid" checked>指定ICCID</label><label><input type="radio" name="ruleScope" value="range">指定范围</label></div></div><div class="rule-upload-row hidden" id="ruleScopeUploadRow"><label class="rule-upload-btn">上传ICCID文件<input type="file" id="ruleScopeUpload" accept=".txt,.csv,.xlsx,.xls"></label><span id="ruleScopeUploadName">支持 TXT、CSV、XLSX、XLS 文件</span></div><div class="rule-form-grid rule-scope-grid">
          <label class="rule-field"><span class="rule-field-label req">商户</span>${selectMarkup('ruleCreateMerchant','请选择商户',['全部','上海智联商贸','杭州云旅科技','苏州星河酒店','深圳远帆科技'])}</label>
          <label class="rule-field"><span class="rule-field-label req">卡组</span>${selectMarkup('ruleCreateCardGroup','请选择卡组',['全部','华东移动优先卡组','旅游渠道三网卡组','酒店轻量卡组','物流高稳卡组','代理体验卡组'])}</label>
          <label class="rule-field"><span class="rule-field-label req">供应商</span>${selectMarkup('ruleCreateSupplier','请选择供应商',['全部','中国移动','中国联通','中国电信'])}</label>
          <label class="rule-field"><span class="rule-field-label req">运营商</span>${selectMarkup('ruleCreateOperator','请选择运营商',['全部','中国移动','中国联通','中国电信'])}</label>
        </div></section>
        <section class="rule-form-section"><div class="rule-form-title">监测规则</div><div class="rule-form-grid">
          <label class="rule-field"><span class="rule-field-label req">提醒方式</span>${selectMarkup('ruleCreateReminder','请选择提醒方式',reminderTypes)}</label>
          <div class="rule-threshold-reminders rule-field-wide hidden" id="ruleThresholdReminders"></div>
          <div class="rule-interval-reminder rule-field-wide hidden" id="ruleIntervalReminder"><div class="rule-interval-line">数据使用每增加 <input class="input rule-interval-input" id="ruleCreateIntervalValue" placeholder="请输入数值" inputmode="decimal" type="number" min="0" step="0.01"> MB，下发一次提醒，直到不再触发。</div></div>
          <div class="rule-field rule-field-wide hidden" id="ruleFollowUpField"><span class="rule-field-label req">跟进动作</span><div class="rule-radio-row"><label><input type="radio" name="ruleFollowUp" value="no" checked>仅通知</label><label><input type="radio" name="ruleFollowUp" value="yes">通知并关闭流量数据服务</label></div></div>
          <label class="rule-field rule-field-wide" id="ruleRestoreField"><span class="rule-field-label req">次月是否恢复流量数据服务</span><div class="rule-radio-row"><label><input type="radio" name="ruleRestore" value="yes" checked>次月恢复流量数据服务</label><label><input type="radio" name="ruleRestore" value="no">不恢复</label></div></label>
        </div></section>
        <section class="rule-form-section"><div class="rule-form-title">生效时间</div><div class="rule-notification-base-row"><span class="rule-field-label req">生效时间</span><div class="rule-radio-row" role="radiogroup" aria-label="生效时间"><label><input type="radio" name="ruleEffective" value="now" checked>立即生效</label><label><input type="radio" name="ruleEffective" value="scheduled">指定日期生效</label><div class="rule-effective-control hidden" id="ruleEffectiveControl"><div class="rule-month-picker" id="ruleEffectiveMonthPicker"><input class="input rule-effective-input" id="ruleCreateEffectiveDate" placeholder="请选择生效年月" aria-label="指定生效年月" readonly><span class="rule-month-clear" role="button" tabindex="0" aria-label="清除生效年月" title="清除"></span><span class="rule-month-trigger" aria-hidden="true"></span><div class="rule-month-panel"><div class="rule-month-toolbar"><button type="button" class="rule-month-nav" data-month-nav="prev" aria-label="上一年">‹</button><span class="rule-month-year" id="ruleMonthYear"></span><button type="button" class="rule-month-nav" data-month-nav="next" aria-label="下一年">›</button></div><div class="rule-month-grid" id="ruleMonthGrid"></div></div></div><div class="rule-effective-help">默认当月1日0点生效</div></div></div></div></section>
        <section class="rule-form-section"><div class="rule-form-title">通知配置</div><div class="rule-notification-base">
          <div class="rule-notification-base-row"><span class="rule-field-label req">通知对象</span><div><button type="button" class="rule-target-picker" id="ruleSharedTargetPicker" onclick="openRuleNotificationAccountModal('shared')"><span>请选择通知对象</span></button></div></div>
          <div class="rule-notification-target-list-row" id="ruleSharedTargetList"></div>
          <div class="rule-notification-base-row"><span class="rule-field-label req">配置方式</span><div class="rule-radio-row" role="radiogroup" aria-label="通知配置方式"><label><input type="radio" name="ruleNotificationConfigMode" value="shared" checked>所有通知对象统一配置</label><label><input type="radio" name="ruleNotificationConfigMode" value="individual">按通知对象分别配置</label></div></div>
          <div id="ruleSharedNotificationSettings">
            <div class="rule-notification-base-row"><span class="rule-field-label req">通知时间</span><div><div class="rule-radio-row" role="radiogroup" aria-label="通知时间"><label><input type="radio" name="ruleNotificationTime" value="immediate" checked>规则触发后立即通知</label><div class="rule-notification-scheduled-option"><label><input type="radio" name="ruleNotificationTime" value="scheduled">指定通知时间</label><div class="rule-notification-time-control hidden" id="ruleNotificationTimeControl"><input class="input rule-notification-time-input" id="ruleNotificationTimeInput" type="time" step="60" aria-label="指定通知时间"><span class="rule-effective-help">请选择时、分</span></div></div></div></div></div>
            <div class="rule-notification-base-row"><span class="rule-field-label req">通知方式</span><div class="rule-check-row" role="group" aria-label="通知方式">${notificationTypes.map((item,index)=>`<label><input type="checkbox" name="ruleNotify" value="${escapeHtml(item)}" ${index === 0 || index === 3 ? 'checked' : ''}>${escapeHtml(item)}</label>`).join('')}</div></div>
            <div id="ruleNotificationConfigList" class="rule-notification-config-list"></div>
          </div>
          <div id="ruleIndividualNotificationSettings" class="rule-individual-settings hidden"></div>
        </div></section>
        <div class="rule-create-actions"><button type="button" class="btn gray" id="ruleCreateCancelBtn">取消</button><button type="button" class="btn" id="ruleCreateSaveBtn">保存规则</button></div>
      </div>
    </section>

    <section id="ruleDetailPage" class="content hidden rule-center-page rule-detail-page">
      <div class="rule-detail-shell" id="ruleDetailShell"></div>
    </section>

    <div class="rule-detail-drawer-mask" id="ruleDetailDrawerMask" onclick="if(event.target===this)closeRuleDetailDrawer()">
      <aside class="rule-detail-drawer" role="dialog" aria-modal="true" aria-labelledby="ruleDetailDrawerTitle">
        <div class="rule-detail-drawer-head"><strong id="ruleDetailDrawerTitle">规则详情</strong><button type="button" class="rule-detail-drawer-close" aria-label="关闭规则详情" onclick="closeRuleDetailDrawer()">×</button></div>
        <div class="rule-detail-drawer-body" id="ruleDetailDrawerBody"></div>
      </aside>
    </div>`;

  const style = document.createElement('style');
  style.textContent = `
    .rule-center-menu .menu-generic-icon{color:#5e6d80}
    .rule-center-page{gap:0}
    .rule-center-filter{padding-top:0}
    .rule-center-filter .filter-actions{grid-column:1 / -1}
    .rule-center-actions{margin-bottom:10px}
    .rule-table-wrap{min-height:0;overflow:auto}
    .rule-table{min-width:1180px;table-layout:auto}
    .rule-table th,.rule-table td{white-space:nowrap;font-size:12px}
    .rule-table td{height:44px}
    .rule-detail-drawer-mask{position:fixed;inset:0;z-index:30;display:none;align-items:stretch;justify-content:flex-end;overflow:hidden;background:rgba(15,23,42,.22)}
    .rule-detail-drawer-mask.open{display:flex}
    .rule-detail-drawer{width:min(880px,92vw);height:100%;background:#fff;box-shadow:-10px 0 28px rgba(31,35,41,.16);display:flex;flex-direction:column;transform:translateX(0);animation:rule-detail-drawer-in .2s ease-out both}
    .rule-detail-drawer-head{height:52px;flex:0 0 52px;padding:0 18px 0 24px;border-bottom:1px solid #edf0f5;display:flex;align-items:center;justify-content:space-between;color:#1f2329;font-size:16px}
    .rule-detail-drawer-close{width:28px;height:28px;padding:0;border:0;background:transparent;color:#7b8797;font-size:24px;line-height:24px;cursor:pointer}
    .rule-detail-drawer-close:hover{color:#1f2329;background:#f5f7fa}
    .rule-detail-drawer-body{min-height:0;flex:1 1 auto;overflow:auto;padding:20px 24px 28px}
    .rule-detail-drawer-body .rule-detail-shell{border:0}
    .rule-detail-drawer-body .rule-field{grid-template-columns:180px minmax(0,1fr);align-items:start}
    .rule-detail-drawer-body .rule-notification-base-row{grid-template-columns:180px minmax(0,1fr)}
    .rule-detail-drawer-body .rule-field > .rule-detail-radio-row,
    .rule-detail-drawer-body .rule-field > .rule-detail-check-row{min-width:0;display:flex;align-items:center;gap:18px;flex-wrap:wrap;line-height:20px}
    .rule-detail-drawer-body .rule-field > .rule-detail-radio-row label,
    .rule-detail-drawer-body .rule-field > .rule-detail-check-row label{display:inline-flex;align-items:center;gap:7px;min-width:0;white-space:normal;line-height:20px}
    .rule-detail-drawer-body .rule-field > .rule-detail-radio-row .rule-detail-radio,
    .rule-detail-drawer-body .rule-field > .rule-detail-check-row .rule-detail-check{margin-right:0;flex:0 0 14px}
    .rule-detail-drawer-body .rule-detail-threshold-reminders{padding-left:18px;text-align:left}
    .rule-detail-drawer-body .rule-detail-threshold-reminders .rule-threshold-row{justify-content:flex-start;text-align:left}
    .rule-detail-file-row{display:flex;align-items:center;gap:10px;margin-top:14px;color:#667085;font-size:12px}
    .rule-detail-file-name{display:flex;align-items:center;min-height:32px;max-width:100%;padding:0 10px;border:1px solid #e5e7eb;border-radius:4px;background:#f8fafc;color:#4e5969;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    @keyframes rule-detail-drawer-in{from{transform:translateX(100%)}to{transform:translateX(0)}}
    .rule-table .sticky-action{min-width:150px}
    .rule-table .link-action{border:0;padding:0;background:transparent;color:#1687e8;cursor:pointer;margin:0 5px;font:inherit;font-size:12px}
    .rule-table .link-action:hover{text-decoration:underline;color:#0b6ed0}
    .rule-status{display:inline-flex;align-items:center;gap:5px;font-weight:500}
    .rule-status:before{content:"";width:6px;height:6px;border-radius:50%;background:#aab2bd}
    .rule-status.active{color:#1a9b5a}.rule-status.active:before{background:#1a9b5a}
    .rule-status.pending{color:#d78b16}.rule-status.pending:before{background:#d78b16}
    .rule-status.off{color:#8b95a5}.rule-status.off:before{background:#8b95a5}
    .rule-trigger-status{font-weight:500}.rule-trigger-status.triggered{color:#e2473f}.rule-trigger-status.untriggered{color:#8b95a5}
    .rule-action-result.success{color:#1a9b5a;font-weight:500}.rule-action-result.fail{color:#e2473f;font-weight:500}
    .rule-create-shell{width:100%;background:#fff;border:1px solid #e6ebf2}
    .rule-form-section{padding:20px 24px;border-bottom:1px solid #edf0f5}
    .rule-form-section:last-of-type{border-bottom:0}
    .rule-form-title{font-size:14px;font-weight:600;color:#1f2937;margin-bottom:18px;position:relative;padding-left:10px}
    .rule-form-title:before{content:"";position:absolute;left:0;top:3px;width:3px;height:14px;background:#1687e8;border-radius:2px}
    .rule-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 40px}
    .rule-scope-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
    .rule-notify-grid{grid-template-columns:repeat(2,minmax(0,1fr));margin-top:18px}
    .rule-notification-config-list{display:flex;flex-direction:column;gap:10px;margin-top:14px}
    .rule-notification-base{display:flex;flex-direction:column;gap:16px}
    .rule-notification-base-row{display:grid;grid-template-columns:128px minmax(0,1fr);align-items:start;gap:12px}
    .rule-notification-target-list-row{padding-left:140px;margin-top:-8px}
    .rule-individual-settings{display:flex;flex-direction:column;gap:10px;margin-top:14px}
    .rule-individual-notification-card{padding:18px 20px;border:1px solid #dfe7f1;background:#fbfcfe}
    .rule-individual-notification-title{display:flex;align-items:center;gap:9px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #e7edf5;color:#1f2937;font-size:14px;font-weight:600}
    .rule-individual-notification-title:before{content:"";width:8px;height:8px;border-radius:50%;background:#1687e8}
    .rule-individual-notification-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 40px;padding:0 4px}
    .rule-individual-notification-grid .rule-field{align-items:start}
    .rule-individual-template-list{display:flex;flex-direction:column;gap:12px;margin:16px 4px 0;padding:14px 0 0 16px;border-left:2px solid #e7edf5}
    .rule-individual-template-row{display:grid;grid-template-columns:128px minmax(0,1fr);align-items:start;gap:12px}
    .rule-individual-channel-config{display:flex;flex-direction:column;gap:10px;padding:12px 0;border-top:1px solid #edf0f5}
    .rule-individual-channel-config:first-child{padding-top:0;border-top:0}
    .rule-individual-channel-title{display:flex;align-items:center;gap:8px;color:#4e5969;font-size:13px;font-weight:600}
    .rule-individual-channel-title:before{content:"";width:6px;height:6px;border-radius:50%;background:#1687e8}
    .rule-individual-template-field{display:grid;grid-template-columns:96px minmax(0,1fr);align-items:center;gap:12px}
    .rule-individual-template-row .rule-template-preview{margin:8px 0 0}
    .rule-notification-scheduled-option{display:inline-flex;align-items:center;gap:10px;white-space:nowrap}
    .rule-notification-time-control{display:flex;align-items:center;gap:10px;margin-top:8px}
    .rule-notification-scheduled-option .rule-notification-time-control{margin-top:0}
    .rule-notification-time-input{width:160px!important;color:#1f2329}
    .rule-detail-shell{width:100%;background:#fff;border:1px solid #e6ebf2}
    .rule-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 40px}
    .rule-detail-item{display:grid;grid-template-columns:128px minmax(0,1fr);align-items:start;gap:12px;min-height:32px}
    .rule-detail-label{color:#8b95a5;line-height:32px;white-space:nowrap}
    .rule-detail-value{min-width:0;min-height:32px;padding:7px 10px;border:1px solid #edf0f5;background:#f8fafc;color:#4e5969;line-height:18px;white-space:pre-wrap;word-break:break-word}
    .rule-detail-item.span-all{grid-column:1 / -1}
    .rule-detail-status{display:inline-flex;align-items:center;min-height:18px}
    .rule-detail-readonly{display:flex;align-items:center;min-width:0;min-height:32px;padding:0 10px;border:1px solid #e5e7eb;border-radius:4px;background:#f8fafc;color:#4e5969;line-height:20px;white-space:pre-wrap;word-break:break-word}
    .rule-detail-readonly.multiline{height:auto;align-items:flex-start;padding-top:6px;padding-bottom:6px}
    .rule-detail-readonly.select-value{justify-content:space-between}
    .rule-detail-radio-row,.rule-detail-check-row{pointer-events:none}
    .rule-detail-radio-row label,.rule-detail-check-row label{cursor:default}
    .rule-detail-radio,.rule-detail-check{display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;flex:none;border:1px solid #b8c0cc;background:#fff}
    .rule-detail-radio{border-radius:50%}
    .rule-detail-radio.selected{border-color:#1687e8}
    .rule-detail-radio.selected:after{content:"";width:6px;height:6px;border-radius:50%;background:#1687e8}
    .rule-detail-check{border-radius:2px}
    .rule-detail-check.selected{border-color:#1687e8;background:#1687e8;position:relative}
    .rule-detail-check.selected:after{content:"";width:7px;height:4px;border-left:1.5px solid #fff;border-bottom:1.5px solid #fff;transform:rotate(-45deg) translate(1px,-1px)}
    .rule-detail-radio-row .rule-detail-radio,.rule-detail-check-row .rule-detail-check{margin-right:7px}
    .rule-detail-target-picker{cursor:default!important;color:#4e5969!important;background:#f8fafc!important}
    .rule-detail-target-picker:after{display:none}
    .rule-detail-target-table .rule-target-table th:last-child,.rule-detail-target-table .rule-target-table td:last-child{display:none}
    .rule-detail-upload{display:flex;align-items:center;min-height:32px;padding:0 10px;border:1px solid #e5e7eb;border-radius:4px;background:#f8fafc;color:#4e5969;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .rule-detail-notification-time{width:160px}
    .rule-detail-threshold-reminders{padding-left:140px}
    .rule-detail-threshold-reminders .rule-threshold-row{align-items:center}
    .rule-detail-threshold-reminders .rule-threshold-value{width:190px}
    .rule-detail-threshold-reminders .rule-threshold-value .rule-detail-readonly{padding-right:42px}
    .rule-detail-interval-line{display:flex;align-items:center;gap:6px;min-height:32px;color:#4e5969;font-size:13px;line-height:20px;flex-wrap:nowrap;white-space:nowrap}
    .rule-detail-interval-value{width:120px}
    .rule-detail-template-value{width:100%}
    .rule-notification-card{padding:14px 16px;border:1px solid #edf0f5;background:#fbfcfe}
    .rule-notification-card-title{display:flex;align-items:center;gap:8px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #edf0f5;color:#30343b;font-size:13px;font-weight:600}
    .rule-notification-card-title:before{content:"";width:6px;height:6px;border-radius:50%;background:#1687e8}
    .rule-notification-card-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 40px}
    .rule-notification-card .rule-field{grid-template-columns:96px minmax(0,1fr)}
    .rule-template-preview{grid-column:1 / -1;margin:0 0 2px 108px;padding:10px 12px;border:1px solid #edf0f5;background:#f8fafc;color:#606a78;line-height:20px;white-space:pre-wrap;word-break:break-word}
    .rule-template-preview-label{display:block;margin-bottom:4px;color:#8b95a5;font-size:12px}
    .rule-template-preview-content{color:#4e5969}
    .rule-target-picker{width:100%;height:32px;border:1px solid #e5e7eb;border-radius:4px;background:#fff;color:#9aa4b2;padding:0 10px;text-align:left;cursor:pointer;font:inherit;display:flex;align-items:center;justify-content:space-between}
    .rule-target-picker:hover{border-color:#1687e8;color:#1687e8}
    .rule-target-picker.has-value{color:#1f2329}
    .rule-target-picker:after{content:"";width:7px;height:7px;border-right:1px solid #b8c0cc;border-bottom:1px solid #b8c0cc;transform:rotate(45deg);margin-top:-4px}
    .rule-target-summary{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}
    .rule-target-chip{display:inline-flex;align-items:center;min-height:24px;padding:2px 8px;border:1px solid #d8e6f6;border-radius:3px;background:#f4f9ff;color:#1687e8;font-size:12px}
    .rule-target-table-wrap{margin-top:8px;border:1px solid #edf0f5;overflow:auto;background:#fff}
    .rule-target-table{width:100%;min-width:0;table-layout:fixed;border-collapse:collapse;font-size:12px;color:#4e5969}
    .rule-target-table th{height:32px;background:#f7f9fc;color:#8b95a5;font-weight:500;text-align:center;white-space:nowrap}
    .rule-target-table td{height:36px;border-top:1px solid #edf0f5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .rule-target-table th,.rule-target-table td{padding:0 10px}
    .rule-target-table th:nth-child(1),.rule-target-table td:nth-child(1){width:12%}
    .rule-target-table th:nth-child(2),.rule-target-table td:nth-child(2){width:15%}
    .rule-target-table th:nth-child(3),.rule-target-table td:nth-child(3){width:24%}
    .rule-target-table th:nth-child(4),.rule-target-table td:nth-child(4){width:10%}
    .rule-target-table th:nth-child(5),.rule-target-table td:nth-child(5){width:13%}
    .rule-target-table th:nth-child(6),.rule-target-table td:nth-child(6){width:18%}
    .rule-target-table th:nth-child(7),.rule-target-table td:nth-child(7){width:8%;min-width:58px}
    .rule-target-table .rule-target-remove{border:0;background:transparent;color:#f04438;cursor:pointer;font:inherit;padding:0}
    .rule-target-table .rule-target-remove:hover{text-decoration:underline;color:#d92d20}
    .rule-field{display:grid;grid-template-columns:128px minmax(0,1fr);align-items:center;gap:12px;min-width:0}
    .rule-field-wide{grid-column:1 / -1}
    .rule-field-label{font-size:13px;color:#4e5969;line-height:32px;white-space:nowrap}
    .rule-field-optional{color:#9aa4b2;font-size:12px;font-weight:400;margin-left:4px}
    .rule-remark-textarea{min-height:92px;height:92px;resize:none;color:#1f2329!important;line-height:20px}
    .rule-field .input,.rule-field .custom-select{width:100%;min-width:0}
    .rule-center-page .query-input-wrap{width:100%;min-width:0}
    .rule-center-page .query-input-wrap.has-value>input,.rule-center-page .custom-select.has-value .select-value{color:#1f2329}
    .rule-center-page .rule-input-unit .query-input-clear{right:34px;top:50%;line-height:normal}
    .rule-center-page .rule-input-unit .query-input-wrap>input{padding-right:60px}
    .rule-threshold-reminders{display:flex;flex-direction:column;gap:10px;padding-left:140px}
    .rule-threshold-row{display:flex;align-items:center;gap:10px;min-height:32px;color:#4e5969;font-size:13px}
    .rule-threshold-row-label{white-space:nowrap}
    .rule-threshold-value{position:relative;width:190px;flex:none}
    .rule-threshold-value .query-input-wrap>input{padding-right:60px}
    .rule-threshold-value .query-input-clear{right:34px}
    .rule-threshold-unit{position:absolute;right:12px;top:0;line-height:32px;color:#667085;font-size:13px;pointer-events:none}
    .rule-threshold-remove{width:24px;height:24px;border:0;border-radius:50%;background:transparent;color:#a4adba;font-size:18px;line-height:22px;cursor:pointer;padding:0}
    .rule-threshold-remove:hover{background:#edf3fb;color:#1687e8}
    .rule-threshold-add{align-self:flex-start;border:0;background:transparent;color:#1687e8;font:inherit;font-size:13px;cursor:pointer;padding:0 0 0 2px}
    .rule-threshold-add:hover{text-decoration:underline;color:#0b6ed0}
    .rule-interval-reminder{padding-left:140px}
    .rule-interval-line{display:flex;align-items:center;gap:6px;min-height:32px;color:#4e5969;font-size:13px;line-height:20px;flex-wrap:nowrap;white-space:nowrap}
    .rule-interval-input{width:160px!important;text-align:left;flex:none}
    .rule-interval-line .query-input-wrap{width:160px!important;min-width:160px;flex:0 0 160px}
    .rule-interval-line .query-input-wrap>input{width:160px!important;min-width:160px}
    .rule-input-unit{position:relative;width:100%}
    .rule-input-unit .input{padding-right:42px}
    .rule-input-unit .rule-input-unit-label{position:absolute;right:12px;top:0;line-height:32px;color:#667085;font-size:13px}
    .rule-radio-row,.rule-check-row{display:flex;align-items:center;gap:24px;min-height:32px;color:#4e5969;font-size:13px;flex-wrap:wrap}
    .rule-radio-row label,.rule-check-row label{display:inline-flex;align-items:center;gap:7px;cursor:pointer;white-space:nowrap}
    .rule-radio-row input,.rule-check-row input{accent-color:#1687e8}
    .rule-radio-row.rule-invalid,.rule-check-row.rule-invalid{border-radius:4px;box-shadow:0 0 0 2px rgba(240,68,56,.08)}
    .rule-scope-caption{margin:18px 0 12px;font-size:12px;color:#667085}
    .rule-upload-row{display:flex;align-items:center;gap:10px;margin-top:14px;color:#9aa4b2;font-size:12px}
    .rule-upload-row > span{white-space:nowrap;flex:none}
    .rule-upload-row.rule-invalid .rule-upload-btn{border-color:#f04438;color:#f04438}
    .rule-upload-btn{display:inline-flex;align-items:center;height:32px;padding:0 16px;border:1px solid #d9dee8;border-radius:4px;color:#1687e8;background:#fff;cursor:pointer}
    .rule-upload-btn:hover{border-color:#1687e8;background:#f4f9ff}
    .rule-upload-btn input{display:none}
    .rule-scope-grid.is-disabled{opacity:.52}
    .rule-scope-grid.is-disabled .custom-select{pointer-events:none;background:#f7f8fa}
    .rule-invalid{border-color:#f04438!important;box-shadow:0 0 0 2px rgba(240,68,56,.08)}
    .rule-help{grid-column:2;color:#9aa4b2;font-size:12px;line-height:18px;margin-bottom:-4px}
    .rule-effective-control{display:flex;flex-direction:row;align-items:center;gap:8px;margin-left:8px;flex-wrap:wrap}
    .rule-month-picker{position:relative;width:220px;z-index:4}
    .rule-effective-input{width:220px!important;padding-right:58px!important;color:#596273}
    .rule-month-picker.open{z-index:1002}
    .rule-month-trigger{position:absolute;right:12px;top:9px;width:13px;height:13px;border:1px solid #b8c0cc;border-radius:2px;pointer-events:none}
    .rule-month-trigger:before{content:"";position:absolute;left:2px;right:2px;top:3px;border-top:1px solid #b8c0cc}
    .rule-month-trigger:after{content:"";position:absolute;left:2px;right:2px;top:7px;border-top:1px solid #b8c0cc;box-shadow:0 3px 0 #b8c0cc}
    .rule-month-clear{display:none;position:absolute;right:34px;top:50%;width:16px;height:16px;border-radius:50%;transform:translateY(-50%);color:#a4adba;cursor:pointer;transition:transform .16s ease,background-color .16s ease,color .16s ease,box-shadow .16s ease;z-index:3}
    .rule-month-picker.has-value .rule-month-clear{display:block}
    .rule-month-clear:before,.rule-month-clear:after{content:"";position:absolute;left:4px;top:7px;width:8px;height:1.5px;background:currentColor;border-radius:2px}
    .rule-month-clear:before{transform:rotate(45deg)}
    .rule-month-clear:after{transform:rotate(-45deg)}
    .rule-month-clear:hover{background:#edf3fb;color:#1687e8;box-shadow:0 4px 10px rgba(22,135,232,.18);transform:translateY(calc(-50% - 2px))}
    .rule-month-panel{display:none;position:absolute;left:0;top:calc(100% + 4px);width:220px;background:#fff;border:1px solid #dfe5ee;border-radius:3px;box-shadow:0 8px 20px rgba(0,0,0,.12);padding:12px;z-index:1500;color:#4e5969}
    .rule-month-picker.open .rule-month-panel{display:block}
    .rule-month-toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
    .rule-month-year{font-size:13px;font-weight:600;color:#4b5563}
    .rule-month-nav{width:26px;height:26px;border:1px solid #dfe5ee;background:#fff;border-radius:3px;color:#606a78;cursor:pointer;font-size:18px;line-height:20px}
    .rule-month-nav:hover{border-color:var(--theme-color);color:#1687e8;background:#f4f9ff}
    .rule-month-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
    .rule-month-option{height:30px;border:0;border-radius:3px;background:#fff;color:#4e5969;cursor:pointer;font:inherit;font-size:12px}
    .rule-month-option:hover{background:#f4f8ff;color:#1687e8}
    .rule-month-option.active{background:var(--theme-color);color:#fff}
    .rule-effective-help{color:#9aa4b2;font-size:12px;line-height:18px;white-space:nowrap}
    .rule-create-actions{height:68px;display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:0 24px;border-top:1px solid #edf0f5}
    .rule-create-actions .btn{min-width:88px}
    @media(max-width:1000px){.rule-scope-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.rule-form-grid{gap:14px 20px}}
    @media(max-width:720px){.rule-form-grid,.rule-scope-grid,.rule-notify-grid,.rule-notification-card-grid,.rule-detail-grid{grid-template-columns:1fr}.rule-field-wide{grid-column:auto}.rule-field,.rule-notification-base-row,.rule-detail-item,.rule-individual-template-row{grid-template-columns:110px minmax(0,1fr)}.rule-notification-target-list-row{padding-left:122px}.rule-effective-control{margin-left:0}.rule-effective-input{width:220px!important}.rule-threshold-reminders,.rule-interval-reminder{padding-left:0}.rule-threshold-row{align-items:flex-start;flex-wrap:wrap}.rule-threshold-value{width:calc(100% - 10px)}}
  `;

  function closeRuleSelects(except){
    document.querySelectorAll('.rule-select.open').forEach(select => { if(select !== except) select.classList.remove('open'); });
  }
  function setRuleSelectValue(select,value,label){
    select.dataset.value = value || '';
    const display = select.querySelector('.select-value');
    if(display){display.textContent = value ? label : (select.dataset.placeholder || '请选择');}
    select.classList.toggle('has-value',Boolean(value));
    select.classList.remove('open');
  }
  function clearRuleSelect(select){
    if(ruleScopeFieldIds.includes(select.id)){
      setRuleSelectValue(select,'全部','全部');
      return;
    }
    setRuleSelectValue(select,'',select.dataset.placeholder || '请选择');
    if(select.id === 'ruleListTypeFilter' || select.id === 'ruleListStatusFilter' || select.id === 'ruleListTriggerStatusFilter'){renderRuleList();}
    if(select.id === 'triggerRuleTypeFilter'){renderTriggerRecords();}
    if(select.id === 'ruleCreateReminder'){syncReminderMode('');}
    if(select.classList.contains('rule-notification-channel-select')){syncRuleNotificationChannelSelection(select);}
    if(select.classList.contains('rule-individual-notification-select')){renderRuleIndividualNotificationTemplatePreview(select);}
    else if(select.classList.contains('rule-notification-select')){renderRuleNotificationTemplatePreview(select);}
  }
  function wireRuleSelects(){
    document.querySelectorAll('#ruleCenterPages .rule-select').forEach(select => {
      if(select.dataset.ruleWired === 'true'){return}
      select.dataset.ruleWired = 'true';
      select.addEventListener('click', event => {
        if(event.target.closest('.select-clear')){
          clearRuleSelect(select);
          event.stopPropagation();
          return;
        }
        const option = event.target.closest('.dropdown-option');
        if(option){
          setRuleSelectValue(select,option.dataset.value || '',option.textContent.trim());
          if(select.id === 'ruleListTypeFilter' || select.id === 'ruleListStatusFilter' || select.id === 'ruleListTriggerStatusFilter'){renderRuleList();}
          if(select.id === 'triggerRuleTypeFilter'){renderTriggerRecords();}
          if(select.id === 'ruleCreateReminder'){syncReminderMode(select.dataset.value || '');}
          if(select.classList.contains('rule-notification-channel-select')){syncRuleNotificationChannelSelection(select);}
          if(select.classList.contains('rule-individual-notification-select')){renderRuleIndividualNotificationTemplatePreview(select);}
          else if(select.classList.contains('rule-notification-select')){renderRuleNotificationTemplatePreview(select);}
          event.stopPropagation();
          return;
        }
        closeRuleSelects(select);
        select.classList.toggle('open');
        event.stopPropagation();
      });
      select.querySelector('.select-clear')?.addEventListener('keydown', event => {
        if(event.key === 'Enter' || event.key === ' '){
          event.preventDefault();
          clearRuleSelect(select);
        }
      });
    });
  }
  function syncRuleInputClear(input){
    const wrapper = input?.closest('.query-input-wrap');
    if(wrapper){
      wrapper.classList.toggle('has-value',Boolean(input.value));
      wrapper.classList.toggle('hidden',input.classList.contains('hidden'));
    }
  }
  function clearRuleInput(event,input){
    if(event){event.stopPropagation();}
    input.value = '';
    input.dispatchEvent(new Event('input',{bubbles:true}));
    input.dispatchEvent(new Event('change',{bubbles:true}));
    syncRuleInputClear(input);
    input.focus();
  }
  function wireRuleInputClears(){
    document.querySelectorAll('#ruleCenterPages input.input').forEach(input => {
      const type = (input.getAttribute('type') || 'text').toLowerCase();
      if(['hidden','date','month','datetime-local','file','checkbox','radio'].includes(type) || input.readOnly){return;}
      let wrapper = input.closest('.query-input-wrap');
      if(!wrapper){
        wrapper = document.createElement('span');
        wrapper.className = 'query-input-wrap';
        input.parentNode.insertBefore(wrapper,input);
        wrapper.appendChild(input);
      }
      if(!wrapper.querySelector('.query-input-clear')){
        const clear = document.createElement('span');
        clear.className = 'query-input-clear';
        clear.setAttribute('role','button');
        clear.setAttribute('tabindex','0');
        clear.setAttribute('aria-label',`清除${input.getAttribute('placeholder') || '输入内容'}`);
        clear.setAttribute('title','清除');
        clear.addEventListener('click',event => clearRuleInput(event,input));
        clear.addEventListener('keydown',event => {
          if(event.key === 'Enter' || event.key === ' '){
            event.preventDefault();
            clearRuleInput(event,input);
          }
        });
        wrapper.appendChild(clear);
      }
      input.addEventListener('input',() => syncRuleInputClear(input));
      syncRuleInputClear(input);
    });
  }
  function textValue(id){return (document.getElementById(id)?.value || '').trim();}
  function selectValue(id){return document.getElementById(id)?.dataset.value || '';}
  function matchText(value,keyword){return !keyword || String(value).toLowerCase().includes(keyword.toLowerCase());}
  function statusClass(status){return status === '生效中' ? 'active' : status === '待生效' ? 'pending' : 'off';}
  function ruleStatusFilterValue(status){return status === '已停用' ? '关闭' : '开启';}
  function ruleStatusSwitch(row){
    const enabled = row.status !== '已停用';
    return `<span class="switch-toggle rule-status-switch${enabled ? ' on' : ''}" role="switch" aria-checked="${enabled ? 'true' : 'false'}" aria-label="${enabled ? '关闭规则' : '开启规则'}" title="${enabled ? '关闭' : '开启'}" onclick="toggleRuleStatus('${escapeHtml(row.id)}')"></span>`;
  }
  function actionResultClass(status){return status === '成功' ? 'success' : 'fail';}
  function ruleNotificationRecordData(){
    const data = window.notificationRecordData || (typeof notificationRecordData !== 'undefined' ? notificationRecordData : []);
    return Array.isArray(data) ? data : [];
  }
  function notificationRecordIdForTrigger(row,index){
    const records = ruleNotificationRecordData();
    const record = records[row.notificationRecordIndex] || records[index % records.length];
    return record?.id || row.notificationRecordId || '--';
  }

  function renderPagination(id,count){
    const node = document.getElementById(id);
    if(!node){return}
    node.innerHTML = `共${count}条 <span class="pagebtn">20条/页</span><span class="pagebtn active">1</span> 前往 <span class="pagebtn">1</span> 页`;
  }
  function latestTriggerTimeForRule(row){
    const latest = triggerRecords.filter(record => record.id === row.id).sort((a,b) => String(b.triggerAt).localeCompare(String(a.triggerAt)))[0];
    return latest?.triggerAt || '--';
  }
  function ruleTriggerTimeInRange(row,start,end){
    if(!start && !end){return true;}
    const latest = latestTriggerTimeForRule(row);
    const date = latest === '--' ? '' : latest.slice(0,10);
    return Boolean(date && (!start || date >= start) && (!end || date <= end));
  }
  function triggerStatusForRule(row){
    return triggerRecords.some(record => record.id === row.id) ? '已触发' : '未触发';
  }
  function renderRuleList(){
    const keyword = textValue('ruleListKeyword');
    const type = selectValue('ruleListTypeFilter');
    const status = selectValue('ruleListStatusFilter');
    const triggerStatus = selectValue('ruleListTriggerStatusFilter');
    const recentTriggerStart = document.getElementById('ruleListRecentTriggerStartInput')?.value || '';
    const recentTriggerEnd = document.getElementById('ruleListRecentTriggerEndInput')?.value || '';
    const rows = ruleRecords.filter(row => matchText(`${row.id}${row.name}`,keyword) && (!type || row.type === type) && (!status || ruleStatusFilterValue(row.status) === status) && (!triggerStatus || triggerStatusForRule(row) === triggerStatus) && ruleTriggerTimeInRange(row,recentTriggerStart,recentTriggerEnd));
    const tbody = document.getElementById('ruleListRows');
    if(!tbody){return}
    tbody.innerHTML = rows.length ? rows.map(row => `<tr><td>${escapeHtml(row.id)}</td><td>${escapeHtml(row.name)}</td><td>${escapeHtml(row.type)}</td><td>${ruleStatusSwitch(row)}</td><td><span class="rule-trigger-status ${triggerStatusForRule(row) === '已触发' ? 'triggered' : 'untriggered'}">${escapeHtml(triggerStatusForRule(row))}</span></td><td>${escapeHtml(row.effectiveAt)}</td><td>${escapeHtml(latestTriggerTimeForRule(row))}</td><td>${escapeHtml(row.createdAt)}</td><td>${escapeHtml(row.updatedAt)}</td><td>${escapeHtml(row.operator)}</td><td class="sticky-action"><button type="button" class="link-action" onclick="openRuleCreatePage('${escapeHtml(row.id)}')">编辑</button><button type="button" class="link-action" onclick="openRuleDetail('${escapeHtml(row.id)}')">查看</button></td></tr>`).join('') : '<tr><td colspan="11" class="rule-empty">暂无符合条件的规则</td></tr>';
    renderPagination('ruleListPagination',rows.length);
  }
  function ruleDetailItemMarkup(label,value,spanAll=false){
    return `<div class="rule-detail-item${spanAll ? ' span-all' : ''}"><span class="rule-detail-label">${escapeHtml(label)}</span><div class="rule-detail-value">${escapeHtml(value == null || value === '' ? '--' : value)}</div></div>`;
  }
  function ruleDetailReadonlyField(label,value,extraClass=''){
    const display = value == null || value === '' ? '--' : value;
    const triggerClass = label === '触发状态' ? ` rule-trigger-status ${value === '已触发' ? 'triggered' : 'untriggered'}` : '';
    return `<div class="rule-field${extraClass ? ` ${extraClass}` : ''}"><span class="rule-field-label">${escapeHtml(label)}</span><div class="rule-detail-readonly${triggerClass}">${escapeHtml(display)}</div></div>`;
  }
  function ruleDetailRadioMarkup(options,selected){
    return `<div class="rule-radio-row rule-detail-radio-row" role="radiogroup">${options.map(option => `<label><span class="rule-detail-radio${option.value === selected ? ' selected' : ''}" aria-hidden="true"></span>${escapeHtml(option.label)}</label>`).join('')}</div>`;
  }
  function ruleDetailCheckMarkup(options,selected){
    const values = Array.isArray(selected) ? selected : [];
    return `<div class="rule-check-row rule-detail-check-row" role="group">${options.map(option => `<label><span class="rule-detail-check${values.includes(option) ? ' selected' : ''}" aria-hidden="true"></span>${escapeHtml(option)}</label>`).join('')}</div>`;
  }
  function ruleDetailTargetTableMarkup(people){
    if(!people.length){return '';}
    return `<div class="rule-target-table-wrap rule-detail-target-table"><table class="rule-target-table"><thead><tr><th>账号</th><th>手机号</th><th>邮箱</th><th>姓名</th><th>角色</th><th>所属商户</th><th>操作</th></tr></thead><tbody>${people.map(person => `<tr><td>${escapeHtml(person.account || '--')}</td><td>${escapeHtml(person.phone || '--')}</td><td>${escapeHtml(person.email || '--')}</td><td>${escapeHtml(person.name || '--')}</td><td>${escapeHtml(person.role || '--')}</td><td>${escapeHtml(person.merchant || '--')}</td><td>--</td></tr>`).join('')}</tbody></table></div>`;
  }
  function ruleDetailPeople(row){
    if(typeof notificationPeople === 'undefined'){return [];}
    return (row.notificationTargetIds || []).map(id => notificationPeople.find(person => person.id === id)).filter(Boolean);
  }
  function ruleDetailTemplateEntry(channel,row){
    const entries = ruleNotificationTemplateEntries(channel);
    const selections = row.notificationTemplates || {};
    const selectedId = selections[channel] || selections[notificationTypeKeys[channel] || ''];
    return (selectedId && entries.find(item => item.id === selectedId)) || entries[0] || null;
  }
  function ruleDetailChannelEntry(channel,row){
    const entries = ruleNotificationChannelEntries(channel);
    const selections = row.notificationChannelSelections || {};
    const selectedId = selections[channel] || selections[notificationTypeKeys[channel] || ''];
    return (selectedId && entries.find(item => item.id === selectedId)) || entries[0] || null;
  }
  function ruleDetailIndividualNotificationMarkup(row,people){
    const settings = row.notificationObjectSettings || {};
    return people.map(person => {
      const setting = settings[person.id] || {time:'immediate',scheduledTime:'',channels:[],channelSelections:{}};
      const time = setting.time === 'scheduled' ? 'scheduled' : 'immediate';
      const channels = Array.isArray(setting.channels) ? setting.channels : [];
      const channelSelections = setting.channelSelections || {};
      const templates = setting.templates || {};
      const templateRows = channels.map(channel => {
        const channelEntry = ruleNotificationChannelEntries(channel).find(item => item.id === channelSelections[channel]) || ruleNotificationChannelEntries(channel)[0];
        const entries = ruleNotificationTemplateEntries(channel);
        const selectedId = templates[channel] || templates[notificationTypeKeys[channel] || ''] || '';
        const entry = selectedId ? entries.find(item => item.id === selectedId) : null;
        const content = ruleNotificationTemplateContent(entry) || '未选择通知模板';
        return `<div class="rule-individual-channel-config"><div class="rule-individual-channel-title">通知方式：${escapeHtml(channel)}</div><div class="rule-individual-template-field"><span class="rule-field-label">通知渠道</span><div class="rule-detail-readonly rule-detail-template-value">${escapeHtml(channelEntry?.name || '--')}</div></div><div class="rule-individual-template-field"><span class="rule-field-label">通知模板</span><div class="rule-detail-readonly rule-detail-template-value">${escapeHtml(entry?.name || '--')}</div></div><div class="rule-template-preview"><span class="rule-template-preview-label">模板内容</span><div class="rule-template-preview-content">${escapeHtml(content)}</div></div></div>`;
      }).join('');
      return `<div class="rule-individual-notification-card"><div class="rule-individual-notification-title">通知对象：${escapeHtml(person.name || person.account || person.id)}${person.account ? `（${escapeHtml(person.account)}）` : ''}</div><div class="rule-individual-notification-grid"><div class="rule-field rule-field-wide"><span class="rule-field-label">通知时间</span><div>${ruleDetailRadioMarkup([{value:'immediate',label:'规则触发后立即通知'},{value:'scheduled',label:'指定通知时间'}],time)}${time === 'scheduled' ? `<div class="rule-notification-time-control"><div class="rule-detail-readonly rule-detail-notification-time">${escapeHtml(setting.scheduledTime || '--')}</div><span class="rule-effective-help">请选择时、分</span></div>` : ''}</div></div><div class="rule-field rule-field-wide"><span class="rule-field-label">通知方式</span>${ruleDetailCheckMarkup(notificationTypes,channels)}</div></div>${templateRows ? `<div class="rule-individual-template-list">${templateRows}</div>` : ''}</div>`;
    }).join('');
  }
  function ruleDetailSectionsMarkup(row){
    const scopeMode = row.scopeMode === 'range' ? 'range' : 'iccid';
    const reminder = row.reminder || '阈值提醒';
    const followUp = row.followUp || '通知并关闭流量数据服务';
    const restore = row.restore || '次月恢复流量数据服务';
    const thresholds = row.thresholds && row.thresholds.length ? row.thresholds : ['--'];
    const intervalReminder = row.intervalReminder || '--';
    const effectiveAt = row.effectiveAt || '--';
    const isScheduled = /^\d{4}-\d{2}-01$/.test(effectiveAt);
    const channels = row.notificationChannels || ['邮箱','站内通知'];
    const notificationMode = row.notificationConfigMode === 'individual' ? 'individual' : 'shared';
    const notificationTime = row.notificationTime && row.notificationTime !== 'immediate' ? row.notificationTime : 'immediate';
    const people = ruleDetailPeople(row);
    const notificationOptions = notificationTypes.slice();
    const notificationCards = channels.map(channel => {
      const channelEntry = ruleDetailChannelEntry(channel,row);
      const entry = ruleDetailTemplateEntry(channel,row);
      const content = ruleNotificationTemplateContent(entry) || '暂无模板内容';
      return `<div class="rule-notification-card" data-rule-channel="${escapeHtml(channel)}"><div class="rule-notification-card-title">通知方式：${escapeHtml(channel)}</div><div class="rule-notification-card-grid"><div class="rule-field rule-field-wide"><span class="rule-field-label">通知渠道</span><div class="rule-detail-readonly rule-detail-template-value">${escapeHtml(channelEntry?.name || '--')}</div></div><div class="rule-field rule-field-wide"><span class="rule-field-label">通知模板</span><div class="rule-detail-readonly rule-detail-template-value">${escapeHtml(entry?.name || '--')}</div></div><div class="rule-template-preview"><span class="rule-template-preview-label">模板内容</span><div class="rule-template-preview-content">${escapeHtml(content)}</div></div></div></div>`;
    }).join('');
    return `<div class="rule-detail-sections">
      <section class="rule-form-section"><div class="rule-form-title">基础信息</div><div class="rule-form-grid">
        ${ruleDetailReadonlyField('规则类型',row.type)}
        ${ruleDetailReadonlyField('规则名称',row.name)}
        ${ruleDetailReadonlyField('规则ID',row.id)}
        ${ruleDetailReadonlyField('生效状态',row.status)}
        ${ruleDetailReadonlyField('触发状态',triggerStatusForRule(row))}
        ${ruleDetailReadonlyField('创建时间',row.createdAt)}
        ${ruleDetailReadonlyField('更新时间',row.updatedAt)}
        ${ruleDetailReadonlyField('操作人',row.operator)}
        ${ruleDetailReadonlyField('备注',row.remark,'rule-field-wide')}
      </div></section>
      <section class="rule-form-section"><div class="rule-form-title">监测范围</div>
        ${ruleDetailRadioMarkup([{value:'iccid',label:'指定ICCID'},{value:'range',label:'指定范围'}],scopeMode)}
        ${scopeMode === 'iccid' ? `<div class="rule-detail-file-row"><div class="rule-detail-file-name" title="${escapeHtml(row.scopeFileName || '未上传ICCID文件')}">${escapeHtml(row.scopeFileName || '未上传ICCID文件')}</div>${row.scopeIccids && row.scopeIccids.length ? `<span>共${row.scopeIccids.length}个ICCID</span>` : ''}</div>` : ''}
        ${scopeMode === 'range' ? `<div class="rule-form-grid rule-scope-grid">
          ${ruleDetailReadonlyField('商户',row.merchant || '全部')}
          ${ruleDetailReadonlyField('卡组',row.cardGroup || '全部')}
          ${ruleDetailReadonlyField('供应商',row.supplier || '全部')}
          ${ruleDetailReadonlyField('运营商',row.operatorScope || '全部')}
        </div>` : ''}
      </section>
      <section class="rule-form-section"><div class="rule-form-title">监测规则</div><div class="rule-form-grid">
        ${ruleDetailReadonlyField('提醒方式',reminder)}
        ${reminder === '阈值提醒' ? `<div class="rule-threshold-reminders rule-detail-threshold-reminders rule-field-wide">${thresholds.map((value,index) => `<div class="rule-threshold-row"><span class="rule-threshold-row-label">第${thresholdReminderOrdinal(index)}次通知提醒：单卡累计数据使用量达到</span><div class="rule-threshold-value"><div class="rule-detail-readonly">${escapeHtml(value || '--')}</div><span class="rule-threshold-unit">MB</span></div></div>`).join('')}</div>` : ''}
        ${reminder === '间隔提醒' ? `<div class="rule-field rule-field-wide"><span class="rule-field-label">提醒规则</span><div class="rule-detail-interval-line">数据使用每增加 <div class="rule-detail-readonly rule-detail-interval-value">${escapeHtml(intervalReminder)}</div> MB，下发一次提醒，直到不再触发。</div></div>` : ''}
        ${reminder === '阈值提醒' ? `<div class="rule-field rule-field-wide"><span class="rule-field-label">跟进动作</span>${ruleDetailRadioMarkup([{value:'仅通知',label:'仅通知'},{value:'通知并关闭流量数据服务',label:'通知并关闭流量数据服务'}],followUp)}</div>` : ''}
        ${reminder !== '间隔提醒' && followUp !== '仅通知' ? `<div class="rule-field rule-field-wide"><span class="rule-field-label">次月是否恢复流量数据服务</span>${ruleDetailRadioMarkup([{value:'次月恢复流量数据服务',label:'次月恢复流量数据服务'},{value:'不恢复',label:'不恢复'}],restore)}</div>` : ''}
      </div></section>
      <section class="rule-form-section"><div class="rule-form-title">生效时间</div>
        ${ruleDetailRadioMarkup([{value:'now',label:'立即生效'},{value:'scheduled',label:'指定日期生效'}],isScheduled ? 'scheduled' : 'now')}
        ${isScheduled ? `<div class="rule-effective-control"><div class="rule-detail-readonly rule-detail-notification-time">${escapeHtml(effectiveAt.slice(0,7))}</div><div class="rule-effective-help">默认当月1日0点生效</div></div>` : ''}
      </section>
      <section class="rule-form-section"><div class="rule-form-title">通知配置</div><div class="rule-notification-base">
        <div class="rule-notification-base-row"><span class="rule-field-label">通知对象</span><div><div class="rule-target-picker rule-detail-target-picker"><span>${escapeHtml(people.length ? `已选择 ${people.length} 个通知对象` : (row.notificationTargetLabel || '按共享通知对象配置'))}</span></div>${ruleDetailTargetTableMarkup(people)}</div></div>
        <div class="rule-notification-base-row"><span class="rule-field-label">配置方式</span>${ruleDetailRadioMarkup([{value:'shared',label:'所有通知对象统一配置'},{value:'individual',label:'按通知对象分别配置'}],notificationMode)}</div>
        ${notificationMode === 'shared' ? `<div class="rule-notification-base-row"><span class="rule-field-label">通知时间</span><div>${ruleDetailRadioMarkup([{value:'immediate',label:'规则触发后立即通知'},{value:'scheduled',label:'指定通知时间'}],notificationTime)}${notificationTime !== 'immediate' ? `<div class="rule-notification-time-control"><div class="rule-detail-readonly rule-detail-notification-time">${escapeHtml(notificationTime)}</div><span class="rule-effective-help">请选择时、分</span></div>` : ''}</div></div><div class="rule-notification-base-row"><span class="rule-field-label">通知方式</span>${ruleDetailCheckMarkup(notificationOptions,channels)}</div>` : ''}
      </div>${notificationMode === 'shared' ? `<div class="rule-notification-config-list">${notificationCards || '<div class="rule-empty">请先选择通知方式</div>'}</div>` : `<div class="rule-individual-settings">${ruleDetailIndividualNotificationMarkup(row,people) || '<div class="rule-empty">请先选择通知对象</div>'}</div>`}</section>
    </div>`;
  }
  function renderRuleDetail(){
    const shell = document.getElementById('ruleDetailShell');
    if(!shell){return;}
    const row = ruleRecords.find(item => item.id === currentRuleDetailId);
    shell.innerHTML = row ? ruleDetailSectionsMarkup(row) : '<div class="rule-empty">暂无规则详情</div>';
  }
  function renderRuleDetailDrawer(){
    const body = document.getElementById('ruleDetailDrawerBody');
    if(!body){return;}
    const row = ruleRecords.find(item => item.id === currentRuleDetailId);
    body.innerHTML = row ? ruleDetailSectionsMarkup(row) : '<div class="rule-empty">暂无规则详情</div>';
  }
  function triggerSummaryRows(){
    const groups = new Map();
    triggerRecords.forEach((row,index) => {
      const key = `${row.notificationRecordIndex ?? 'record'}|${row.id}|${row.triggerAt}`;
      const current = groups.get(key);
      if(current){
        current.cardCount += 1;
        current.actionResults.push(row.actionResult);
        return;
      }
      groups.set(key,{...row,groupKey:key,triggerRecordId:`TRIGGER${String(groups.size + 1).padStart(4,'0')}`,firstIndex:index,cardCount:1,actionResults:[row.actionResult]});
    });
    return Array.from(groups.values()).map(row => ({
      ...row,
      summaryResult: row.actionResults.every(result => result === '成功') ? '成功' : row.actionResults.every(result => result === '失败') ? '失败' : '部分成功',
      notificationRecordId: notificationRecordIdForTrigger(row,row.firstIndex)
    }));
  }
  function triggerRecordIdForTrigger(row,index){
    const key = `${row.notificationRecordIndex ?? 'record'}|${row.id}|${row.triggerAt}`;
    const summary = triggerSummaryRows().find(item => item.groupKey === key);
    return summary?.triggerRecordId || `TRIGGER${String(index + 1).padStart(4,'0')}`;
  }
  function triggerDateInRange(value,start,end){
    const date = String(value || '').slice(0,10);
    return Boolean(date && (!start || date >= start) && (!end || date <= end));
  }
  function renderTriggerSummary(){
    const type = selectValue('triggerSummaryRuleTypeFilter');
    const keyword = textValue('triggerSummaryRuleKeyword');
    const start = document.getElementById('triggerSummaryTimeStartInput')?.value || '';
    const end = document.getElementById('triggerSummaryTimeEndInput')?.value || '';
    const rows = triggerSummaryRows().filter(row => (!type || row.type === type) && matchText(`${row.id}${row.name}`,keyword) && triggerDateInRange(row.triggerAt,start,end));
    const tbody = document.getElementById('ruleTriggerSummaryRows');
    if(!tbody){return}
    tbody.innerHTML = rows.length ? rows.map(row => `<tr><td><button type="button" class="link-action" onclick="openTriggerDetailByRecordId('${escapeHtml(row.triggerRecordId)}')">${escapeHtml(row.triggerRecordId)}</button></td><td>${escapeHtml(row.type)}</td><td>${escapeHtml(row.id)}</td><td>${escapeHtml(row.name)}</td><td>${escapeHtml(row.triggerAt)}</td><td>${escapeHtml(row.cardCount)}</td><td>${escapeHtml(row.notificationRecordId)}</td></tr>`).join('') : '<tr><td colspan="7" class="rule-empty">暂无符合条件的触发记录</td></tr>';
    renderPagination('ruleTriggerSummaryPagination',rows.length);
  }
  function renderTriggerRecords(){
    const recordId = textValue('triggerRecordIdFilter');
    const type = selectValue('triggerRuleTypeFilter');
    const keyword = textValue('triggerRuleKeyword');
    const start = document.getElementById('triggerDetailTimeStartInput')?.value || '';
    const end = document.getElementById('triggerDetailTimeEndInput')?.value || '';
    const identity = textValue('triggerMsisdnIccid');
    const rows = triggerRecords.map((row,index) => ({row,index})).filter(entry => {
      const row = entry.row;
      return (!recordId || matchText(triggerRecordIdForTrigger(row,entry.index),recordId)) && (!type || row.type === type) && matchText(`${row.id}${row.name}`,keyword) && triggerDateInRange(row.triggerAt,start,end) && matchText(`${row.msisdn}${row.iccid}`,identity);
    });
    const tbody = document.getElementById('ruleTriggerRows');
    if(!tbody){return}
    tbody.innerHTML = rows.length ? rows.map(entry => {const row = entry.row; const index = entry.index; return `<tr><td>${escapeHtml(triggerRecordIdForTrigger(row,index))}</td><td>${escapeHtml(row.type)}</td><td>${escapeHtml(row.id)}</td><td>${escapeHtml(row.name)}</td><td>${escapeHtml(row.triggerAt)}</td><td>${escapeHtml(row.msisdn)}</td><td>${escapeHtml(row.iccid)}</td><td>${escapeHtml(row.merchant)}</td><td>${escapeHtml(row.supplier)}</td><td>${escapeHtml(row.operator)}</td><td>${escapeHtml(row.usage)}</td><td>${escapeHtml(row.condition)}</td><td>${escapeHtml(row.action)}</td><td><span class="rule-action-result ${actionResultClass(row.actionResult)}">${escapeHtml(row.actionResult)}</span></td><td>${escapeHtml(notificationRecordIdForTrigger(row,index))}</td></tr>`;}).join('') : '<tr><td colspan="15" class="rule-empty">暂无符合条件的触发明细</td></tr>';
    renderPagination('ruleTriggerPagination',rows.length);
  }
  function resetRuleSelect(id){
    const select = document.getElementById(id);
    if(select){setRuleSelectValue(select,'',select.dataset.placeholder || '请选择');}
  }
  function resetRuleList(){
    ['ruleListKeyword'].forEach(id => {const input=document.getElementById(id);if(input){input.value='';}});
    resetRuleSelect('ruleListTypeFilter');
    resetRuleSelect('ruleListStatusFilter');
    resetRuleSelect('ruleListTriggerStatusFilter');
    if(typeof window.setUnifiedRangeValues === 'function'){window.setUnifiedRangeValues('ruleListRecentTrigger','','',false);}
    document.querySelectorAll('#ruleListFilter input.input').forEach(syncRuleInputClear);
    renderRuleList();
  }
  function resetTriggerRecords(){
    ['triggerRecordIdFilter','triggerRuleKeyword','triggerMsisdnIccid'].forEach(id => {const input=document.getElementById(id);if(input){input.value='';}});
    resetRuleSelect('triggerRuleTypeFilter');
    if(typeof window.setUnifiedRangeValues === 'function'){window.setUnifiedRangeValues('triggerDetailTime','','',false);}
    document.querySelectorAll('#ruleTriggerFilter input.input').forEach(syncRuleInputClear);
    renderTriggerRecords();
  }
  function openTriggerDetailByRecordId(recordId){
    ['triggerRuleKeyword','triggerMsisdnIccid'].forEach(id => {const input=document.getElementById(id);if(input){input.value='';}});
    resetRuleSelect('triggerRuleTypeFilter');
    if(typeof window.setUnifiedRangeValues === 'function'){window.setUnifiedRangeValues('triggerDetailTime','','',false);}
    const input = document.getElementById('triggerRecordIdFilter');
    if(input){input.value = recordId || '';syncRuleInputClear(input);}
    if(typeof window.showPage === 'function'){window.showPage('ruleTriggerRecords');}
    renderTriggerRecords();
  }
  function resetTriggerSummary(){
    const input = document.getElementById('triggerSummaryRuleKeyword');
    if(input){input.value='';}
    resetRuleSelect('triggerSummaryRuleTypeFilter');
    if(typeof window.setUnifiedRangeValues === 'function'){window.setUnifiedRangeValues('triggerSummaryTime','','',false);}
    document.querySelectorAll('#ruleTriggerSummaryFilter input.input').forEach(syncRuleInputClear);
    renderTriggerSummary();
  }
  function openRuleCreatePage(){
    if(typeof window.showPage === 'function'){window.showPage('ruleCreate');}
  }
  function openRuleDetail(id){
    if(!ruleRecords.some(row => row.id === id)){return;}
    currentRuleDetailId = id;
    renderRuleDetailDrawer();
    const mask = document.getElementById('ruleDetailDrawerMask');
    if(mask){mask.classList.add('open');mask.style.display='flex';}
  }
  function closeRuleDetailDrawer(){
    const mask = document.getElementById('ruleDetailDrawerMask');
    if(mask){mask.classList.remove('open');mask.style.display='none';}
  }
  function toggleRuleStatus(id){
    const row = ruleRecords.find(item => item.id === id);
    if(!row){return;}
    const enabling = row.status === '已停用';
    const message = enabling
      ? `确定要启用规则“${row.name}”吗？启用后规则将开始执行。`
      : `确定要停用规则“${row.name}”吗？停用后规则将停止执行。`;
    if(!window.confirm(message)){return;}
    row.status = enabling ? '生效中' : '已停用';
    row.updatedAt = new Date().toISOString().slice(0,19).replace('T',' ');
    renderRuleList();
    if(currentRuleDetailId === id){renderRuleDetail();renderRuleDetailDrawer();}
  }
  function resetCreatePage(){
    ['ruleCreateName','ruleCreateRemark','ruleCreateEffectiveDate','ruleNotificationTimeInput'].forEach(id => {const input=document.getElementById(id);if(input){input.value='';}});
    ['ruleCreateType','ruleCreateSupplier','ruleCreateMerchant','ruleCreateCardGroup','ruleCreateOperator','ruleCreateReminder'].forEach(resetRuleSelect);
    document.querySelectorAll('#ruleCreatePage input[type="radio"]').forEach(input => {
      const defaultValue = input.name === 'ruleScope' ? 'iccid' : input.name === 'ruleEffective' ? 'now' : input.name === 'ruleFollowUp' ? 'no' : input.name === 'ruleRestore' ? 'yes' : input.name === 'ruleNotificationConfigMode' ? 'shared' : input.name === 'ruleNotificationTime' ? 'immediate' : '';
      input.checked = input.value === defaultValue;
    });
    document.querySelectorAll('#ruleCreatePage input[type="checkbox"]').forEach((input,index) => {input.checked = index === 0 || index === 3;});
    ruleNotificationTargets = {};
    ruleSharedNotificationTargets = [];
    ruleNotificationConfigMode = 'shared';
    ruleNotificationChannelSelections = {};
    ruleIndividualNotificationSettings = {};
    ruleNotificationTime = 'immediate';
    ruleThresholdReminderValues = [''];
    ruleIntervalReminderValue = '';
    ruleScopeFileName = '';
    ruleScopeIccids = [];
    const scopeUpload = document.getElementById('ruleScopeUpload');
    if(scopeUpload){scopeUpload.value = '';}
    const scopeUploadName = document.getElementById('ruleScopeUploadName');
    if(scopeUploadName){scopeUploadName.textContent = '支持 TXT、CSV、XLSX、XLS 文件';}
    renderRuleNotificationCards();
    renderSharedRuleNotificationTargets();
    document.querySelectorAll('#ruleCreatePage input.input').forEach(syncRuleInputClear);
    const effectiveDate = document.getElementById('ruleCreateEffectiveDate');
    if(effectiveDate){effectiveDate.value = '';}
    ruleEffectiveMonthView = new Date(new Date().getFullYear(),new Date().getMonth(),1);
    document.getElementById('ruleEffectiveMonthPicker')?.classList.remove('open');
    renderRuleMonthPicker();
    syncRuleMonthClear();
    syncReminderMode('');
    syncFollowUpMode('no');
    syncEffectiveMode('now');
    syncNotificationTimeMode('immediate');
    syncRuleNotificationConfigMode('shared');
    syncScopeMode('iccid');
  }
  function syncReminderMode(value){
    const field = document.getElementById('ruleFollowUpField');
    const restore = document.getElementById('ruleRestoreField');
    const interval = document.getElementById('ruleIntervalReminder');
    if(field){field.classList.toggle('hidden',value !== '阈值提醒');}
    if(restore){restore.classList.toggle('hidden',value === '间隔提醒' || document.querySelector('#ruleCreatePage input[name="ruleFollowUp"]:checked')?.value === 'no');}
    if(interval){interval.classList.toggle('hidden',value !== '间隔提醒');}
    const intervalInput = document.getElementById('ruleCreateIntervalValue');
    if(intervalInput){intervalInput.value = value === '间隔提醒' ? ruleIntervalReminderValue : '';}
    if(value === '间隔提醒'){
      intervalInput?.addEventListener('input',()=>{ruleIntervalReminderValue = intervalInput.value;});
      syncRuleInputClear(intervalInput);
    }
    renderThresholdReminderRows();
  }
  function syncFollowUpMode(value){
    const field = document.getElementById('ruleRestoreField');
    const reminder = selectValue('ruleCreateReminder');
    if(field){field.classList.toggle('hidden',value === 'no' || reminder === '间隔提醒');}
  }
  function thresholdReminderOrdinal(index){
    const n = index + 1;
    const digits = ['零','一','二','三','四','五','六','七','八','九'];
    if(n <= 10){return n === 10 ? '十' : digits[n];}
    if(n < 20){return `十${digits[n - 10]}`;}
    return String(n);
  }
  function renderThresholdReminderRows(){
    const container = document.getElementById('ruleThresholdReminders');
    if(!container){return;}
    const visible = selectValue('ruleCreateReminder') === '阈值提醒';
    container.classList.toggle('hidden',!visible);
    if(!visible){return;}
    if(!ruleThresholdReminderValues.length){ruleThresholdReminderValues = [''];}
    container.innerHTML = `${ruleThresholdReminderValues.map((value,index) => `<div class="rule-threshold-row"><span class="rule-threshold-row-label">第${thresholdReminderOrdinal(index)}次通知提醒：单卡累计数据使用量达到</span><div class="rule-threshold-value"><input class="input" data-threshold-index="${index}" placeholder="请输入阈值" inputmode="decimal" value="${escapeHtml(value)}"><span class="rule-threshold-unit">MB</span></div>${ruleThresholdReminderValues.length > 1 ? `<button type="button" class="rule-threshold-remove" data-threshold-remove="${index}" aria-label="移除第${thresholdReminderOrdinal(index)}次通知提醒" title="移除">×</button>` : ''}</div>`).join('')}<button type="button" class="rule-threshold-add" id="ruleThresholdAddBtn">+ 添加</button>`;
    container.querySelectorAll('input[data-threshold-index]').forEach(input => input.addEventListener('input',()=>{
      ruleThresholdReminderValues[Number(input.dataset.thresholdIndex)] = input.value;
    }));
    container.querySelectorAll('[data-threshold-remove]').forEach(button => button.addEventListener('click',()=>{
      if(ruleThresholdReminderValues.length <= 1){return;}
      ruleThresholdReminderValues.splice(Number(button.dataset.thresholdRemove),1);
      renderThresholdReminderRows();
    }));
    container.querySelector('#ruleThresholdAddBtn')?.addEventListener('click',()=>{
      ruleThresholdReminderValues.push('');
      renderThresholdReminderRows();
    });
    wireRuleInputClears();
  }
  function syncEffectiveMode(value){
    const control = document.getElementById('ruleEffectiveControl');
    if(control){control.classList.toggle('hidden',value !== 'scheduled');}
    const input = document.getElementById('ruleCreateEffectiveDate');
    if(input && value !== 'scheduled'){input.value = '';}
    syncRuleMonthClear();
  }
  function syncRuleMonthClear(){
    const picker = document.getElementById('ruleEffectiveMonthPicker');
    const input = document.getElementById('ruleCreateEffectiveDate');
    if(picker && input){picker.classList.toggle('has-value',Boolean(input.value));}
  }
  function renderRuleMonthPicker(){
    const yearNode = document.getElementById('ruleMonthYear');
    const grid = document.getElementById('ruleMonthGrid');
    const input = document.getElementById('ruleCreateEffectiveDate');
    if(!yearNode || !grid){return;}
    const year = ruleEffectiveMonthView.getFullYear();
    yearNode.textContent = `${year}年`;
    grid.innerHTML = Array.from({length:12},(_,index)=>{
      const value = `${year}-${String(index + 1).padStart(2,'0')}`;
      const active = input?.value === value ? ' active' : '';
      return `<button type="button" class="rule-month-option${active}" data-month-value="${value}">${index + 1}月</button>`;
    }).join('');
  }
  function wireRuleMonthPicker(){
    const picker = document.getElementById('ruleEffectiveMonthPicker');
    const input = document.getElementById('ruleCreateEffectiveDate');
    if(!picker || !input || picker.dataset.wired === 'true'){return;}
    picker.dataset.wired = 'true';
    input.addEventListener('click',event=>{
      picker.classList.toggle('open');
      renderRuleMonthPicker();
      event.stopPropagation();
    });
    picker.querySelectorAll('[data-month-nav]').forEach(button=>button.addEventListener('click',event=>{
      const direction = button.dataset.monthNav === 'next' ? 1 : -1;
      ruleEffectiveMonthView = new Date(ruleEffectiveMonthView.getFullYear() + direction,ruleEffectiveMonthView.getMonth(),1);
      renderRuleMonthPicker();
      event.stopPropagation();
    }));
    document.getElementById('ruleMonthGrid')?.addEventListener('click',event=>{
      const option = event.target.closest('[data-month-value]');
      if(!option){return;}
      input.value = option.dataset.monthValue || '';
      ruleEffectiveMonthView = new Date(Number(input.value.slice(0,4)),Number(input.value.slice(5,7)) - 1,1);
      picker.classList.remove('open');
      syncRuleMonthClear();
      input.dispatchEvent(new Event('input',{bubbles:true}));
      event.stopPropagation();
    });
    picker.querySelector('.rule-month-clear')?.addEventListener('click',event=>{
      input.value = '';
      picker.classList.remove('open');
      syncRuleMonthClear();
      input.dispatchEvent(new Event('input',{bubbles:true}));
      event.stopPropagation();
      input.focus();
    });
    picker.querySelector('.rule-month-clear')?.addEventListener('keydown',event=>{
      if(event.key === 'Enter' || event.key === ' '){
        event.preventDefault();
        picker.querySelector('.rule-month-clear').click();
      }
    });
    document.addEventListener('click',event=>{
      if(!picker.contains(event.target)){picker.classList.remove('open');}
    });
    renderRuleMonthPicker();
    syncRuleMonthClear();
  }
  function selectedRuleNotificationTypes(){
    return Array.from(document.querySelectorAll('#ruleCreatePage input[name="ruleNotify"]:checked')).map(input => input.value);
  }
  function ruleNotificationTemplateEntries(channel){
    const type = notificationTypeKeys[channel] || '';
    const data = window.notificationTemplateData || (typeof notificationTemplateData !== 'undefined' ? notificationTemplateData : []);
    return data.filter(item => item.type === type);
  }
  function ruleNotificationChannelEntries(channel){
    const type = notificationTypeKeys[channel] || '';
    const data = window.notificationChannelData || (typeof notificationChannelData !== 'undefined' ? notificationChannelData : []);
    return data.filter(item => item.type === type && item.enabled !== false);
  }
  function ruleNotificationChannelSelectMarkup(channel,selectedId='',personId=''){
    const key = notificationTypeKeys[channel] || channel;
    const entries = ruleNotificationChannelEntries(channel);
    const selected = entries.find(item => item.id === selectedId);
    const id = personId ? `ruleIndividualChannel_${personId}_${key}` : `ruleChannel_${key}`;
    return `<div class="select custom-select rule-select rule-notification-channel-select" id="${escapeHtml(id)}" data-value="${escapeHtml(selected?.id || '')}" data-placeholder="请选择通知渠道" data-notification-channel="${escapeHtml(channel)}" data-template-person-id="${escapeHtml(personId)}"><span class="select-value">${escapeHtml(selected?.name || '请选择通知渠道')}</span><span class="select-clear" role="button" tabindex="0" aria-label="清除通知渠道" title="清除"></span><div class="dropdown-menu">${entries.map(item => `<div class="dropdown-option" data-value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</div>`).join('')}</div></div>`;
  }
  function syncRuleNotificationChannelSelection(select){
    const channel = select?.dataset.notificationChannel || '';
    const personId = select?.dataset.templatePersonId || '';
    if(!channel){return;}
    if(personId){
      const setting = ruleIndividualNotificationSettings[personId];
      if(setting){
        setting.channelSelections = setting.channelSelections || {};
        setting.channelSelections[channel] = select.dataset.value || '';
      }
    }else{
      ruleNotificationChannelSelections[channel] = select.dataset.value || '';
    }
  }
  function ruleNotificationTemplateContent(item){
    if(!item){return ''}
    if(item.type === 'sms'){return item.templateContent || ''}
    const title = item.title || '';
    const body = item.body || '';
    return `${title}${body ? `：${body}` : ''}`;
  }
  function ruleNotificationTemplateSelectMarkup(channel,entries){
    const key = notificationTypeKeys[channel] || channel;
    const id = `ruleTemplate_${key}`;
    return `<div class="select custom-select rule-select rule-notification-select" id="${id}" data-value="" data-placeholder="请选择通知模板" data-template-channel="${escapeHtml(channel)}"><span class="select-value">请选择通知模板</span><span class="select-clear" role="button" tabindex="0" aria-label="清除通知模板" title="清除"></span><div class="dropdown-menu">${entries.map(item => `<div class="dropdown-option" data-value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</div>`).join('')}</div></div>`;
  }
  function ruleIndividualNotificationTemplateSelectMarkup(personId,channel,entries,selectedId){
    const key = notificationTypeKeys[channel] || channel;
    const id = `ruleIndividualTemplate_${personId}_${key}`;
    const selected = entries.find(item => item.id === selectedId);
    return `<div class="select custom-select rule-select rule-notification-select rule-individual-notification-select" id="${escapeHtml(id)}" data-value="${escapeHtml(selected?.id || '')}" data-placeholder="请选择通知模板" data-template-channel="${escapeHtml(channel)}" data-template-person-id="${escapeHtml(personId)}"><span class="select-value">${escapeHtml(selected?.name || '请选择通知模板')}</span><span class="select-clear" role="button" tabindex="0" aria-label="清除通知模板" title="清除"></span><div class="dropdown-menu">${entries.map(item => `<div class="dropdown-option" data-value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</div>`).join('')}</div></div>`;
  }
  function renderRuleNotificationTemplatePreview(select){
    const preview = select?.closest('.rule-notification-card')?.querySelector('.rule-template-preview');
    if(!preview){return}
    const id = select.dataset.value || '';
    const data = window.notificationTemplateData || (typeof notificationTemplateData !== 'undefined' ? notificationTemplateData : []);
    const entry = id ? data.find(item => item.id === id) : null;
    const content = ruleNotificationTemplateContent(entry);
    preview.classList.toggle('hidden',!content);
    const contentNode = preview.querySelector('.rule-template-preview-content');
    if(contentNode){contentNode.textContent = content || '选择模板后展示模板消息内容';}
  }
  function renderRuleIndividualNotificationTemplatePreview(select){
    const personId = select?.dataset.templatePersonId || '';
    const channel = select?.dataset.templateChannel || '';
    const setting = ruleIndividualNotificationSettings[personId];
    if(setting){
      setting.templates = setting.templates || {};
      setting.templates[channel] = select.dataset.value || '';
    }
    const preview = select?.closest('.rule-individual-channel-config, .rule-individual-template-row')?.querySelector('.rule-template-preview');
    if(!preview){return}
    const id = select.dataset.value || '';
    const data = window.notificationTemplateData || (typeof notificationTemplateData !== 'undefined' ? notificationTemplateData : []);
    const entry = id ? data.find(item => item.id === id) : null;
    const content = ruleNotificationTemplateContent(entry);
    preview.classList.toggle('hidden',!content);
    const contentNode = preview.querySelector('.rule-template-preview-content');
    if(contentNode){contentNode.textContent = content || '选择模板后展示模板消息内容';}
  }
  function ruleNotificationPeople(channel){
    const ids = channel === 'shared' ? ruleSharedNotificationTargets : (ruleNotificationTargets[channel] || []);
    if(typeof notificationPeople === 'undefined'){return []}
    return ids.map(id => notificationPeople.find(person => person.id === id)).filter(Boolean);
  }
  function ruleNotificationTargetTableMarkup(channel,people){
    if(!people.length){return '';}
    return `<div class="rule-target-table-wrap"><table class="rule-target-table"><thead><tr><th>账号</th><th>手机号</th><th>邮箱</th><th>企业微信userid</th><th>姓名</th><th>角色</th><th>所属商户</th><th>操作</th></tr></thead><tbody>${people.map(person => `<tr><td>${escapeHtml(person.account || '--')}</td><td>${escapeHtml(person.phone || '--')}</td><td>${escapeHtml(person.email || '--')}</td><td>${escapeHtml(person.wechatUserId || person.wechat || '--')}</td><td>${escapeHtml(person.name || '--')}</td><td>${escapeHtml(person.role || '--')}</td><td>${escapeHtml(person.merchant || '--')}</td><td><button type="button" class="rule-target-remove" data-rule-remove-channel="${escapeHtml(channel)}" data-rule-remove-id="${escapeHtml(person.id)}">移除</button></td></tr>`).join('')}</tbody></table></div>`;
  }
  function renderSharedRuleNotificationTargets(){
    const button = document.getElementById('ruleSharedTargetPicker');
    const list = document.getElementById('ruleSharedTargetList');
    if(!button || !list){return;}
    const people = ruleNotificationPeople('shared');
    const targetText = people.length ? `已选择 ${people.length} 个通知对象` : '请选择通知对象';
    button.classList.toggle('has-value',Boolean(people.length));
    const text = button.querySelector('span');
    if(text){text.textContent = targetText;}
    list.innerHTML = ruleNotificationTargetTableMarkup('shared',people);
    list.querySelectorAll('[data-rule-remove-channel]').forEach(removeButton => removeButton.addEventListener('click',()=>removeRuleNotificationTarget(removeButton.dataset.ruleRemoveChannel,removeButton.dataset.ruleRemoveId)));
    renderIndividualRuleNotificationSettings();
  }
  function notificationPersonById(id){
    if(typeof notificationPeople === 'undefined'){return null;}
    return notificationPeople.find(person => person.id === id) || null;
  }
  function ensureIndividualRuleNotificationSettings(){
    const selectedIds = ruleSharedNotificationTargets.slice();
    selectedIds.forEach(id => {
      if(!ruleIndividualNotificationSettings[id]){
        ruleIndividualNotificationSettings[id] = {time:'immediate',scheduledTime:'',channels:['邮箱','站内通知'],channelSelections:{},templates:{}};
      }
      const setting = ruleIndividualNotificationSettings[id];
      setting.channels = Array.isArray(setting.channels) && setting.channels.length ? setting.channels : ['邮箱','站内通知'];
      setting.time = setting.time === 'scheduled' ? 'scheduled' : 'immediate';
      setting.channelSelections = setting.channelSelections && typeof setting.channelSelections === 'object' ? setting.channelSelections : {};
      setting.templates = setting.templates && typeof setting.templates === 'object' ? setting.templates : {};
      Object.keys(setting.channelSelections).forEach(channel => {
        if(!setting.channels.includes(channel)){delete setting.channelSelections[channel];}
      });
      Object.keys(setting.templates).forEach(channel => {
        if(!setting.channels.includes(channel)){delete setting.templates[channel];}
      });
    });
    Object.keys(ruleIndividualNotificationSettings).forEach(id => {
      if(!selectedIds.includes(id)){delete ruleIndividualNotificationSettings[id];}
    });
  }
  function renderIndividualRuleNotificationSettings(){
    const container = document.getElementById('ruleIndividualNotificationSettings');
    if(!container){return;}
    ensureIndividualRuleNotificationSettings();
    if(ruleNotificationConfigMode !== 'individual'){
      container.innerHTML = '';
      return;
    }
    const people = ruleSharedNotificationTargets.map(notificationPersonById).filter(Boolean);
    if(!people.length){
      container.innerHTML = '<div class="rule-empty">请先选择通知对象</div>';
      return;
    }
    container.innerHTML = people.map(person => {
      const setting = ruleIndividualNotificationSettings[person.id];
      const key = escapeHtml(person.id);
      const templateRows = setting.channels.map(channel => {
        const selectedChannelId = setting.channelSelections[channel] || '';
        const entries = ruleNotificationTemplateEntries(channel);
        const selectedId = setting.templates[channel] || '';
        const selected = entries.find(item => item.id === selectedId);
        const content = ruleNotificationTemplateContent(selected);
        return `<div class="rule-individual-channel-config" data-template-person-id="${key}" data-template-channel="${escapeHtml(channel)}"><div class="rule-individual-channel-title">通知方式：${escapeHtml(channel)}</div><div class="rule-individual-template-field"><span class="rule-field-label req">通知渠道</span>${ruleNotificationChannelSelectMarkup(channel,selectedChannelId,person.id)}</div><div class="rule-individual-template-field"><span class="rule-field-label req">通知模板</span>${ruleIndividualNotificationTemplateSelectMarkup(person.id,channel,entries,selectedId)}</div><div class="rule-template-preview${content ? '' : ' hidden'}"><span class="rule-template-preview-label">模板内容</span><div class="rule-template-preview-content">${escapeHtml(content || '选择模板后展示模板消息内容')}</div></div></div>`;
      }).join('');
      return `<div class="rule-individual-notification-card" data-rule-individual-person="${key}"><div class="rule-individual-notification-title">通知对象：${escapeHtml(person.name || person.account || person.id)}${person.account ? `（${escapeHtml(person.account)}）` : ''}</div><div class="rule-individual-notification-grid"><div class="rule-field rule-field-wide"><span class="rule-field-label req">通知时间</span><div><div class="rule-radio-row" role="radiogroup" aria-label="通知时间"><label><input type="radio" name="ruleIndividualTime_${key}" value="immediate" data-rule-individual-time-mode="${key}" ${setting.time === 'immediate' ? 'checked' : ''}>规则触发后立即通知</label><div class="rule-notification-scheduled-option"><label><input type="radio" name="ruleIndividualTime_${key}" value="scheduled" data-rule-individual-time-mode="${key}" ${setting.time === 'scheduled' ? 'checked' : ''}>指定通知时间</label><div class="rule-notification-time-control${setting.time === 'scheduled' ? '' : ' hidden'}"><input class="input rule-notification-time-input" type="time" step="60" aria-label="${escapeHtml(person.name || person.account || person.id)}指定通知时间" data-rule-individual-time="${key}" value="${escapeHtml(setting.scheduledTime || '')}"><span class="rule-effective-help">请选择时、分</span></div></div></div></div></div><div class="rule-field rule-field-wide"><span class="rule-field-label req">通知方式</span><div class="rule-check-row" role="group" aria-label="通知方式">${notificationTypes.map(channel => `<label><input type="checkbox" data-rule-individual-channel="${key}" value="${escapeHtml(channel)}" ${setting.channels.includes(channel) ? 'checked' : ''}>${escapeHtml(channel)}</label>`).join('')}</div></div></div>${templateRows ? `<div class="rule-individual-template-list">${templateRows}</div>` : ''}</div>`;
    }).join('');
    container.querySelectorAll('[data-rule-individual-time-mode]').forEach(input => input.addEventListener('change',()=>{
      const setting = ruleIndividualNotificationSettings[input.dataset.ruleIndividualTimeMode];
      if(!setting){return;}
      setting.time = input.value === 'scheduled' ? 'scheduled' : 'immediate';
      renderIndividualRuleNotificationSettings();
      wireRuleInputClears();
    }));
    container.querySelectorAll('[data-rule-individual-time]').forEach(input => input.addEventListener('input',()=>{
      const setting = ruleIndividualNotificationSettings[input.dataset.ruleIndividualTime];
      if(setting){setting.scheduledTime = input.value;}
    }));
    container.querySelectorAll('[data-rule-individual-channel]').forEach(input => input.addEventListener('change',()=>{
      const setting = ruleIndividualNotificationSettings[input.dataset.ruleIndividualChannel];
      if(!setting){return;}
      setting.channels = Array.from(container.querySelectorAll(`[data-rule-individual-channel="${input.dataset.ruleIndividualChannel}"]:checked`)).map(item => item.value);
      const templates = setting.templates || {};
      setting.templates = {};
      setting.channels.forEach(channel => {if(templates[channel]){setting.templates[channel] = templates[channel];}});
      renderIndividualRuleNotificationSettings();
    }));
    wireRuleSelects();
    wireRuleInputClears();
  }
  function syncRuleNotificationConfigMode(mode){
    ruleNotificationConfigMode = mode === 'individual' ? 'individual' : 'shared';
    document.getElementById('ruleSharedNotificationSettings')?.classList.toggle('hidden',ruleNotificationConfigMode !== 'shared');
    document.getElementById('ruleIndividualNotificationSettings')?.classList.toggle('hidden',ruleNotificationConfigMode !== 'individual');
    renderIndividualRuleNotificationSettings();
  }
  function renderRuleNotificationCards(){
    const container = document.getElementById('ruleNotificationConfigList');
    if(!container){return}
    const selected = selectedRuleNotificationTypes();
    container.innerHTML = selected.length ? selected.map(channel => {
      const selectedChannelId = ruleNotificationChannelSelections[channel] || '';
      const entries = ruleNotificationTemplateEntries(channel);
      return `<div class="rule-notification-card" data-rule-channel="${escapeHtml(channel)}"><div class="rule-notification-card-title">通知方式：${escapeHtml(channel)}</div><div class="rule-notification-card-grid"><label class="rule-field rule-field-wide"><span class="rule-field-label req">通知渠道</span>${ruleNotificationChannelSelectMarkup(channel,selectedChannelId)}</label><label class="rule-field rule-field-wide"><span class="rule-field-label req">通知模板</span>${ruleNotificationTemplateSelectMarkup(channel,entries)}</label><div class="rule-template-preview hidden"><span class="rule-template-preview-label">模板内容</span><div class="rule-template-preview-content"></div></div></div></div>`;
    }).join('') : '<div class="rule-empty">请先选择通知方式</div>';
    wireRuleSelects();
  }
  function removeRuleNotificationTarget(channel,id){
    if(channel === 'shared'){
      ruleSharedNotificationTargets = ruleSharedNotificationTargets.filter(personId => personId !== id);
      renderSharedRuleNotificationTargets();
      return;
    }
    ruleNotificationTargets[channel] = (ruleNotificationTargets[channel] || []).filter(personId => personId !== id);
    renderRuleNotificationCards();
  }
  function openRuleNotificationAccountModal(channel){
    ruleNotificationModalChannel = channel;
    const targetCheck = document.getElementById('notificationTargetCheck');
    if(targetCheck){targetCheck.checked = true;}
    const currentIds = channel === 'shared' ? ruleSharedNotificationTargets : (ruleNotificationTargets[channel] || []);
    if(typeof notificationSelectedPeopleIds !== 'undefined'){
      notificationSelectedPeopleIds = currentIds.slice();
    }
    if(typeof notificationAccountTempSelection !== 'undefined'){
      notificationAccountTempSelection = currentIds.slice();
    }
    if(typeof window.openNotificationAccountModal === 'function'){
      window.openNotificationAccountModal();
    }
  }
  function syncNotificationTimeMode(value){
    ruleNotificationTime = value === 'scheduled' ? 'scheduled' : 'immediate';
    const control = document.getElementById('ruleNotificationTimeControl');
    if(control){control.classList.toggle('hidden',ruleNotificationTime !== 'scheduled');}
    const input = document.getElementById('ruleNotificationTimeInput');
    if(input && ruleNotificationTime !== 'scheduled'){
      input.value = '';
      syncRuleInputClear(input);
    }
  }
  function syncScopeMode(mode){
    const upload = document.getElementById('ruleScopeUploadRow');
    const scopeGrid = document.querySelector('.rule-scope-grid');
    const uploadVisible = mode === 'iccid';
    const fieldsEnabled = mode === 'range';
    if(upload){upload.classList.toggle('hidden',!uploadVisible);}
    if(scopeGrid){
      scopeGrid.classList.toggle('hidden',!fieldsEnabled);
      scopeGrid.classList.toggle('is-disabled',!fieldsEnabled);
      scopeGrid.querySelectorAll('.rule-select').forEach(select => {
        select.setAttribute('aria-disabled',fieldsEnabled ? 'false' : 'true');
      });
    }
    if(fieldsEnabled){
      ruleScopeFieldIds.forEach(id => {
        const select = document.getElementById(id);
        if(select && !select.dataset.value){setRuleSelectValue(select,'全部','全部');}
      });
    }
  }
  function updateRuleScopeUploadName(){
    const node = document.getElementById('ruleScopeUploadName');
    if(!node){return;}
    if(!ruleScopeFileName){
      node.textContent = '支持 TXT、CSV、XLSX、XLS 文件';
      return;
    }
    node.textContent = ruleScopeIccids.length ? `已选择 ${ruleScopeFileName}，识别 ${ruleScopeIccids.length} 个ICCID` : `已选择 ${ruleScopeFileName}`;
  }
  function handleRuleScopeFileChange(file){
    ruleScopeFileName = file?.name || '';
    ruleScopeIccids = [];
    if(!file){
      updateRuleScopeUploadName();
      return;
    }
    const isTextFile = /\.(txt|csv)$/i.test(file.name) || String(file.type || '').startsWith('text/');
    if(typeof FileReader !== 'undefined' && isTextFile){
      const reader = new FileReader();
      reader.onload = () => {
        const values = String(reader.result || '').match(/\b\d{10,22}\b/g) || [];
        ruleScopeIccids = Array.from(new Set(values));
        updateRuleScopeUploadName();
      };
      reader.onerror = updateRuleScopeUploadName;
      reader.readAsText(file);
    } else {
      updateRuleScopeUploadName();
    }
  }
  function markRuleInvalid(target){
    if(!target){return false;}
    target.classList.add('rule-invalid');
    target.setAttribute('aria-invalid','true');
    if(typeof target.focus === 'function'){target.focus();}
    setTimeout(()=>{target.classList.remove('rule-invalid');target.removeAttribute('aria-invalid');},1600);
    return false;
  }
  function validateRuleRequiredFields(scopeMode,reminder,effectiveMode){
    if(!selectValue('ruleCreateType')){return markRuleInvalid(document.getElementById('ruleCreateType'));}
    if(!textValue('ruleCreateName')){return markRuleInvalid(document.getElementById('ruleCreateName'));}
    if(scopeMode === 'iccid' && !ruleScopeFileName){return markRuleInvalid(document.getElementById('ruleScopeUploadRow'));}
    if(scopeMode === 'range'){
      for(const id of ruleScopeFieldIds){
        if(!selectValue(id)){return markRuleInvalid(document.getElementById(id));}
      }
    }
    if(!reminder){return markRuleInvalid(document.getElementById('ruleCreateReminder'));}
    if(reminder === '阈值提醒'){
      const emptyIndex = ruleThresholdReminderValues.findIndex(value => !String(value || '').trim());
      if(emptyIndex >= 0){return markRuleInvalid(document.querySelector(`#ruleThresholdReminders input[data-threshold-index="${emptyIndex}"]`));}
    }
    if(reminder === '间隔提醒' && !String(ruleIntervalReminderValue || '').trim()){
      return markRuleInvalid(document.getElementById('ruleCreateIntervalValue'));
    }
    if(effectiveMode === 'scheduled' && !textValue('ruleCreateEffectiveDate')){
      return markRuleInvalid(document.getElementById('ruleCreateEffectiveDate'));
    }
    if(!ruleSharedNotificationTargets.length){return markRuleInvalid(document.getElementById('ruleSharedTargetPicker'));}
    if(ruleNotificationConfigMode === 'shared'){
      const channels = selectedRuleNotificationTypes();
      if(!channels.length){return markRuleInvalid(document.querySelector('#ruleSharedNotificationSettings .rule-check-row'));
      }
      if(ruleNotificationTime === 'scheduled' && !textValue('ruleNotificationTimeInput')){return markRuleInvalid(document.getElementById('ruleNotificationTimeInput'));}
      for(const channel of channels){
        const channelSelect = document.querySelector(`#ruleNotificationConfigList [data-rule-channel="${channel}"] .rule-notification-channel-select`);
        if(!channelSelect?.dataset.value){return markRuleInvalid(channelSelect);}
        const select = document.querySelector(`#ruleNotificationConfigList [data-rule-channel="${channel}"] .rule-notification-select`);
        if(!select?.dataset.value){return markRuleInvalid(select);}
      }
    }else{
      for(const personId of ruleSharedNotificationTargets){
        const setting = ruleIndividualNotificationSettings[personId];
        if(!setting || !Array.isArray(setting.channels) || !setting.channels.length){return markRuleInvalid(document.querySelector(`[data-rule-individual-person="${personId}"] .rule-check-row`));}
        if(setting.time === 'scheduled' && !String(setting.scheduledTime || '').trim()){
          return markRuleInvalid(document.querySelector(`[data-rule-individual-person="${personId}"] [data-rule-individual-time="${personId}"]`));
        }
        for(const channel of setting.channels){
          const channelSelect = document.querySelector(`[data-template-person-id="${personId}"][data-template-channel="${channel}"] .rule-notification-channel-select`);
          if(!channelSelect?.dataset.value){return markRuleInvalid(channelSelect);}
          const select = document.querySelector(`[data-template-person-id="${personId}"][data-template-channel="${channel}"] .rule-notification-select`);
          if(!select?.dataset.value){return markRuleInvalid(select);}
        }
      }
    }
    return true;
  }
  function saveRule(){
    const name = textValue('ruleCreateName');
    const type = selectValue('ruleCreateType');
    const effectiveMonth = textValue('ruleCreateEffectiveDate');
    const scopeMode = document.querySelector('#ruleCreatePage input[name="ruleScope"]:checked')?.value || 'iccid';
    const scopeLabel = scopeMode === 'range' ? '指定范围' : '指定ICCID';
    if(scopeMode === 'range'){syncScopeMode('range');}
    const supplier = scopeMode === 'range' ? selectValue('ruleCreateSupplier') : '';
    const merchant = scopeMode === 'range' ? selectValue('ruleCreateMerchant') : '';
    const cardGroup = scopeMode === 'range' ? selectValue('ruleCreateCardGroup') : '';
    const operatorScope = scopeMode === 'range' ? selectValue('ruleCreateOperator') : '';
    const reminder = selectValue('ruleCreateReminder');
    const effectiveMode = document.querySelector('#ruleCreatePage input[name="ruleEffective"]:checked')?.value || 'now';
    if(!validateRuleRequiredFields(scopeMode,reminder,effectiveMode)){return;}
    const followUp = document.querySelector('#ruleCreatePage input[name="ruleFollowUp"]:checked')?.value === 'no' ? '仅通知' : '通知并关闭流量数据服务';
    const restore = document.querySelector('#ruleCreatePage input[name="ruleRestore"]:checked')?.value === 'no' ? '不恢复' : '次月恢复流量数据服务';
    const now = new Date();
    const immediateDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    ruleRecords.unshift({id:`RULE${new Date().toISOString().slice(0,10).replace(/-/g,'')}${String(ruleRecords.length+1).padStart(4,'0')}`,name,type,remark:textValue('ruleCreateRemark'),status:'待生效',scopeMode,scopeLabel,scopeFileName:scopeMode === 'iccid' ? ruleScopeFileName : '',scopeIccids:scopeMode === 'iccid' ? ruleScopeIccids.slice() : [],supplier,merchant,cardGroup,operatorScope,reminder,intervalReminder:reminder === '间隔提醒' ? ruleIntervalReminderValue : '',followUp,restore,effectiveAt:effectiveMonth ? `${effectiveMonth}-01` : immediateDate,thresholds:reminder === '阈值提醒' ? ruleThresholdReminderValues.slice() : [],notificationTargetIds:ruleSharedNotificationTargets.slice(),notificationConfigMode:ruleNotificationConfigMode,notificationObjectSettings:ruleNotificationConfigMode === 'individual' ? JSON.parse(JSON.stringify(ruleIndividualNotificationSettings)) : {},notificationChannels:ruleNotificationConfigMode === 'shared' ? selectedRuleNotificationTypes() : [],notificationChannelSelections:ruleNotificationConfigMode === 'shared' ? {...ruleNotificationChannelSelections} : {},notificationTime:ruleNotificationConfigMode === 'shared' && ruleNotificationTime === 'scheduled' ? textValue('ruleNotificationTimeInput') : 'immediate',createdAt:'2026-09-19 10:00:00',updatedAt:'2026-09-19 10:00:00',operator:'当前用户'});
    resetCreatePage();
    if(typeof window.showPage === 'function'){window.showPage('ruleList');}
    renderRuleList();
  }
  function syncRuleNav(type){
    const menu = document.getElementById('menuRuleCenter');
    const group = document.getElementById('ruleCenterSubMenu');
    const active = RULE_PAGE_TYPES.includes(type);
    if(menu){menu.classList.toggle('active',active);}
    document.getElementById('menuRuleList')?.classList.toggle('active',type === 'ruleList' || type === 'ruleCreate' || type === 'ruleDetail');
    document.getElementById('menuRuleTriggerRecords')?.classList.toggle('active',['ruleTriggerRecords','ruleTriggerSummary'].includes(type));
    if(group && active && type !== 'ruleCreate'){group.classList.remove('collapsed');menu?.classList.remove('collapsed');}
  }
  function boot(){
    if(document.getElementById('menuRuleCenter')){return;}
    document.head.appendChild(style);
    const side = document.getElementById('sideMenu');
    const main = document.querySelector('main.main');
    if(!side || !main){return;}
    const insertBefore = document.getElementById('menuNotification');
    if(insertBefore){insertBefore.insertAdjacentHTML('beforebegin',ruleMenuMarkup);}else{side.insertAdjacentHTML('beforeend',ruleMenuMarkup);}
    const tabbar = document.getElementById('tabbar');
    if(tabbar){tabbar.insertAdjacentHTML('afterend',`<div id="ruleCenterPages">${rulePagesMarkup}</div>`);}
    if(typeof pageTitles === 'object'){
      Object.keys(RULE_TITLES).forEach(key => {pageTitles[key] = RULE_TITLES[key];});
    }
    wireRuleSelects();
    wireRuleInputClears();
    wireRuleMonthPicker();
    renderRuleList();
    renderTriggerSummary();
    renderTriggerRecords();
    renderRuleDetail();
    renderRuleNotificationCards();
    renderSharedRuleNotificationTargets();
    document.getElementById('ruleListSearchBtn')?.addEventListener('click',renderRuleList);
    document.getElementById('ruleListResetBtn')?.addEventListener('click',resetRuleList);
    document.getElementById('triggerSummarySearchBtn')?.addEventListener('click',renderTriggerSummary);
    document.getElementById('triggerSummaryResetBtn')?.addEventListener('click',resetTriggerSummary);
    document.getElementById('triggerSearchBtn')?.addEventListener('click',renderTriggerRecords);
    document.getElementById('triggerResetBtn')?.addEventListener('click',resetTriggerRecords);
    document.getElementById('ruleCreateBtn')?.addEventListener('click',()=>{resetCreatePage();openRuleCreatePage();});
    document.getElementById('ruleCreateCancelBtn')?.addEventListener('click',()=>{resetCreatePage();if(typeof window.showPage === 'function'){window.showPage('ruleList');}});
    document.getElementById('ruleCreateSaveBtn')?.addEventListener('click',saveRule);
    document.querySelectorAll('#ruleCreatePage input[name="ruleScope"]').forEach(input => input.addEventListener('change',()=>syncScopeMode(input.value)));
    document.getElementById('ruleScopeUpload')?.addEventListener('change',event=>handleRuleScopeFileChange(event.target.files?.[0]));
    document.querySelectorAll('#ruleCreatePage input[name="ruleEffective"]').forEach(input => input.addEventListener('change',()=>syncEffectiveMode(input.value)));
    document.querySelectorAll('#ruleCreatePage input[name="ruleFollowUp"]').forEach(input => input.addEventListener('change',()=>syncFollowUpMode(input.value)));
    document.querySelectorAll('#ruleCreatePage input[name="ruleNotificationTime"]').forEach(input => input.addEventListener('change',()=>syncNotificationTimeMode(input.value)));
    document.querySelectorAll('#ruleCreatePage input[name="ruleNotificationConfigMode"]').forEach(input => input.addEventListener('change',()=>syncRuleNotificationConfigMode(input.value)));
    document.querySelectorAll('#ruleCreatePage input[name="ruleNotify"]').forEach(input => input.addEventListener('change',renderRuleNotificationCards));
    document.querySelectorAll('#ruleCenterPages input').forEach(input => input.addEventListener('input',()=>{
      if(input.id.startsWith('ruleList')){renderRuleList();}
      if(input.id.startsWith('triggerSummary')){renderTriggerSummary();}
      else if(input.id.startsWith('trigger')){renderTriggerRecords();}
      input.classList.remove('rule-invalid');input.removeAttribute('aria-invalid');
    }));
    const syncRulePageState = type => {
      RULE_PAGE_TYPES.forEach(page => document.getElementById(`${page}Page`)?.classList.toggle('hidden',type !== page));
      syncRuleNav(type);
      if(type === 'ruleList'){renderRuleList();}
      if(type === 'ruleTriggerSummary'){renderTriggerSummary();}
      if(type === 'ruleTriggerRecords'){renderTriggerRecords();}
      if(type === 'ruleDetail'){renderRuleDetail();}
    };
    const baseApply = window.applyPageState;
    if(typeof baseApply === 'function'){
      window.applyPageState = function(type){
        baseApply(type);
        syncRulePageState(type);
      };
    }
    const baseActivate = window.activateTab;
    if(typeof baseActivate === 'function'){
      window.activateTab = function(type){
        baseActivate(type);
        syncRulePageState(type);
      };
    }
    if(typeof window.confirmNotificationAccounts === 'function'){
      window.confirmNotificationAccounts = function(){
        if(typeof notificationSelectedPeopleIds !== 'undefined' && typeof notificationAccountTempSelection !== 'undefined'){
          notificationSelectedPeopleIds = notificationAccountTempSelection.slice();
          if(ruleNotificationModalChannel){
            if(ruleNotificationModalChannel === 'shared'){
              ruleSharedNotificationTargets = notificationSelectedPeopleIds.slice();
            }else{
              ruleNotificationTargets[ruleNotificationModalChannel] = notificationSelectedPeopleIds.slice();
            }
          }
        }
        if(typeof window.closeNotificationAccountModal === 'function'){window.closeNotificationAccountModal();}
        renderSharedRuleNotificationTargets();
        renderRuleNotificationCards();
      };
    }
    const baseToggle = window.toggleMenuGroup;
    if(typeof baseToggle === 'function'){
      window.toggleMenuGroup = function(groupId,menuId){
        baseToggle(groupId,menuId);
      };
    }
    syncRuleNav(typeof activePage === 'string' ? activePage : 'home');
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',boot,{once:true});
  }else{
    boot();
  }
  window.openRuleCreatePage = openRuleCreatePage;
  window.openRuleDetail = openRuleDetail;
  window.openTriggerDetailByRecordId = openTriggerDetailByRecordId;
  window.closeRuleDetailDrawer = closeRuleDetailDrawer;
  window.toggleRuleStatus = toggleRuleStatus;
  window.renderRuleList = renderRuleList;
  window.renderTriggerSummary = renderTriggerSummary;
  window.renderTriggerRecords = renderTriggerRecords;
  window.ruleTriggerRecords = triggerRecords;
  window.openRuleNotificationAccountModal = openRuleNotificationAccountModal;
})();

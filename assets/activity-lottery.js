(function(){
  'use strict';

  const scenarios = [
    {drawStatus:'已中奖',prizeName:'充电宝',prizeType:'实物',fulfillmentStatus:'已发放'},
    {drawStatus:'已中奖',prizeName:'充电宝',prizeType:'实物',fulfillmentStatus:'待发放'},
    {drawStatus:'已中奖',prizeName:'水杯',prizeType:'实物',fulfillmentStatus:'待领取'},
    {drawStatus:'已中奖',prizeName:'5元充值优惠券',prizeType:'虚拟',fulfillmentStatus:'已发放'},
    {drawStatus:'已中奖',prizeName:'5元充值优惠券',prizeType:'虚拟',fulfillmentStatus:'发放失败',fulfillmentFailure:'接收账号校验失败'},
    {drawStatus:'未中奖'},
    {drawStatus:'待抽奖'},
    {drawStatus:'抽奖失败',drawFailure:'抽奖服务暂不可用'},
    {drawStatus:'已中奖',prizeName:'5元充值优惠券',prizeType:'虚拟',fulfillmentStatus:'已发放'},
    {drawStatus:'未中奖',orderStatus:'已退款'},
    {drawStatus:'已中奖',prizeName:'水杯',prizeType:'实物',fulfillmentStatus:'发放失败',fulfillmentFailure:'收货信息校验失败'},
    {drawStatus:'已中奖',prizeName:'充电宝',prizeType:'实物',fulfillmentStatus:'已发放'}
  ];
  const merchants = ['上海智联商贸','杭州云旅科技','苏州星河酒店','深圳远帆科技'];
  const records = scenarios.map((scenario,index) => {
    const suffix = String(index+1).padStart(4,'0');
    const hour = String(8+index).padStart(2,'0');
    const won = scenario.drawStatus === '已中奖';
    const claimed = won && scenario.fulfillmentStatus !== '待领取';
    const shipped = scenario.prizeType === '实物' && scenario.fulfillmentStatus === '已发放';
    const couponEligible = won && scenario.prizeName === '5元充值优惠券';
    const couponIssued = couponEligible && scenario.fulfillmentStatus === '已发放';
    const couponRedeemed = couponIssued && index === 3;
    return {
      id:'DL20261111'+suffix,
      phone:'1380000'+String(1101+index),
      sn:'MBB-DEMO-'+suffix,
      merchant:merchants[index%merchants.length],
      amount:[59,99,199,299][index%4],
      orderStatus:'支付成功',
      paidAt:'2026-11-11 '+hour+':10:00',
      drawAt:scenario.drawStatus === '待抽奖' ? '' : '2026-11-11 '+hour+':15:00',
      couponIssued,
      couponClaimStatus:couponEligible ? (couponIssued ? '已领取' : '未领取') : '',
      couponClaimedAt:couponIssued ? '2026-11-12 12:'+String(10+index).padStart(2,'0')+':00' : '',
      couponRedemptionStatus:couponIssued ? (couponRedeemed ? '已核销' : '未核销') : '',
      couponRedeemedAt:couponRedeemed ? '2026-11-13 14:30:00' : '',
      couponOrderNo:couponRedeemed ? 'ORDDL202611'+suffix : '',
      prizeName:'',prizeType:'',fulfillmentStatus:'',
      receiver:claimed && scenario.prizeType === '实物' ? '演示收货人'+String(index+1).padStart(2,'0') : '',
      receiverPhone:claimed && scenario.prizeType === '实物' ? '139****'+String(2201+index) : '',
      address:['上海市浦东新区示例路88号 演示小区1栋101室','浙江省杭州市余杭区示例街道66号 演示园区2栋201室','江苏省苏州市工业园区示例路18号 演示公寓3栋301室','广东省深圳市南山区示例大道28号 演示大厦4层'][index%4]+'（示例地址）',
      logisticsCompany:shipped ? '顺丰速运' : '',
      trackingNo:shipped ? 'DEMO-SF-20261111'+suffix : '',
      drawFailure:'',fulfillmentFailure:'',
      remark:'本条为双11活动列表演示数据，用户、订单及金额仅用于原型展示。',
      ...scenario
    };
  });
  // Local order fixtures make redemption links resolve to real rows in this prototype.
  // No checkout, pricing calculation or external order creation is performed.
  const orderTemplate = paymentOrderData.find(row => row.status === '已支付' && row.orderType === '套餐充值') || paymentOrderData[0];
  records.filter(row => row.couponOrderNo).forEach(row => {
    if(paymentOrderData.some(order => order.orderNo === row.couponOrderNo)){return}
    paymentOrderData.push({
      ...orderTemplate,orderNo:row.couponOrderNo,sn:row.sn,merchant:row.merchant,mainMerchant:row.merchant,
      packageName:'活动核销示例套餐',couponName:'5元充值优惠券',coupon:'已使用',
      packagePrice:'99.00',speedPackPrice:'0.00',discountPrice:'99.00',payablePrice:'99.00',
      couponDeduct:'5.00',paidPrice:'94.00',wechatAmount:'94.00',walletAmount:'0.00',
      status:'已支付',orderType:'套餐充值',payType:'微信支付',createdAt:row.couponRedeemedAt,paidAt:row.couponRedeemedAt,
      payNo:'WXDL'+row.id.slice(2),beforeExpire:'--',afterExpire:'--',creator:'系统',autoRenew:'关闭'
    });
  });
  const pageSize = 20;
  let page = 1;
  const overlayStack = [];
  let editDraft = null;
  let confirmAction = null;
  const screenshotLimit = 1;
  const screenshotMaxBytes = 5*1024*1024;
  const escape = value => String(value == null ? '' : value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const display = value => value == null || value === '' ? '--' : String(value);
  const inputValue = id => (document.getElementById(id)?.value || '').trim();
  const money = value => value != null && value !== '' && Number.isFinite(Number(value)) ? Number(value).toFixed(2) : '--';
  function orderScreenshotData(row){
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="620" viewBox="0 0 360 620"><rect width="360" height="620" fill="#f7f8fa"/><g font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif"><rect width="360" height="64" fill="#fff"/><text x="180" y="39" text-anchor="middle" font-size="18" fill="#1f2329">充值订单</text><text x="180" y="116" text-anchor="middle" font-size="20" fill="#1f2329">'+escape(row.orderStatus)+'</text><text x="180" y="163" text-anchor="middle" font-size="32" fill="#1f2329">¥ '+escape(money(row.amount))+'</text><rect x="16" y="198" width="328" height="302" rx="4" fill="#fff"/><g font-size="13" fill="#667085"><text x="30" y="231">抽奖记录ID</text><text x="30" y="301">设备SN</text><text x="30" y="371">手机号码</text><text x="30" y="441">充值时间</text></g><g font-size="13" fill="#1f2329"><text x="30" y="258">'+escape(row.id)+'</text><text x="30" y="328">'+escape(row.sn)+'</text><text x="30" y="398">'+escape(row.phone)+'</text><text x="30" y="468">'+escape(row.paidAt)+'</text></g><text x="180" y="551" text-anchor="middle" font-size="14" fill="#667085">示例订单截图</text><text x="180" y="578" text-anchor="middle" font-size="12" fill="#667085">仅用于原型展示，非真实订单凭证</text></g></svg>';
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  }
  records.forEach((row,index) => {row.orderScreenshots = index === 6 ? [] : [orderScreenshotData(row)];});
  const textFilters = [
    ['activityLotteryPhoneInput','phone'],
    ['activityLotterySnInput','sn'],['activityLotteryMerchantInput','merchant']
  ];
  const selectFilters = [
    ['activityLotteryCouponClaimStatusFilter','couponClaimStatus','优惠券领取状态'],
    ['activityLotteryCouponRedemptionStatusFilter','couponRedemptionStatus','优惠券核销状态']
  ];

  function inDateRange(value,start,end){
    if(!start && !end){return true}
    const date = String(value || '').slice(0,10);
    return Boolean(date && (!start || date >= start) && (!end || date <= end));
  }
  function filteredRecords(){
    const texts = textFilters.map(([id,key]) => [key,inputValue(id).toLowerCase()]);
    const selects = selectFilters.map(([id,key]) => [key,document.getElementById(id)?.dataset.value || '']);
    const claimStart = inputValue('activityLotteryCouponClaimStartInput');
    const claimEnd = inputValue('activityLotteryCouponClaimEndInput');
    const redemptionStart = inputValue('activityLotteryCouponRedemptionStartInput');
    const redemptionEnd = inputValue('activityLotteryCouponRedemptionEndInput');
    return records.filter(row => texts.every(([key,value]) => !value || String(row[key] || '').toLowerCase().includes(value)) && selects.every(([key,value]) => !value || row[key] === value) && inDateRange(row.couponClaimedAt,claimStart,claimEnd) && inDateRange(row.couponRedeemedAt,redemptionStart,redemptionEnd));
  }
  function statusMarkup(value){
    if(!value){return '--'}
    const intent = ['支付成功','已中奖','已发放','已领取','已核销'].includes(value) ? 'success' : ['抽奖失败','发放失败'].includes(value) ? 'failed' : ['待领取','待发放','已退款'].includes(value) ? 'partial' : 'unsent';
    return '<span class="notification-result '+intent+'">'+escape(value)+'</span>';
  }
  function screenshotMarkup(row){
    if(!row.orderScreenshots.length){return '<span class="activity-lottery-media-empty">未上传</span>'}
    return '<span class="activity-lottery-screenshots">'+row.orderScreenshots.map((src,index) => '<button type="button" class="activity-lottery-screenshot" title="查看订单截图'+(index+1)+'" aria-label="查看设备 '+escape(row.sn)+' 的订单截图'+(index+1)+'" onclick="openActivityLotteryScreenshot(\''+escape(row.id)+'\','+index+')"><img width="36" height="52" src="'+escape(src)+'" alt="" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span hidden>查看截图</span></button>').join('')+'</span>';
  }
  function renderActivityLotteryRecords(){
    const body = document.getElementById('activityLotteryRows');
    if(!body){return}
    const rows = filteredRecords();
    const issuedTotal = rows.filter(row => row.couponIssued).length;
    const usedTotal = rows.filter(row => row.couponIssued && row.couponRedemptionStatus === '已核销').length;
    document.getElementById('activityLotteryCouponIssuedTotal').textContent = issuedTotal+' 张';
    document.getElementById('activityLotteryCouponUsedTotal').textContent = usedTotal+' 张';
    document.getElementById('activityLotteryCouponUsageRate').textContent = (issuedTotal ? usedTotal/issuedTotal*100 : 0).toFixed(2)+'%';
    const pages = Math.ceil(rows.length/pageSize);
    page = Math.max(1,Math.min(page,Math.max(1,pages)));
    const start = (page-1)*pageSize;
    body.innerHTML = rows.length ? rows.slice(start,start+pageSize).map((row,index) => `<tr>
      <td>${start+index+1}</td><td>${escape(row.phone)}</td><td>${escape(row.sn)}</td><td>${escape(row.merchant)}</td>
      <td>${screenshotMarkup(row)}</td><td>${statusMarkup(row.couponClaimStatus)}</td><td>${escape(display(row.couponClaimedAt))}</td><td>${statusMarkup(row.couponRedemptionStatus)}</td><td>${escape(display(row.couponRedeemedAt))}</td>
      <td class="sticky-action"><span class="activity-lottery-actions">${row.couponIssued && row.couponRedemptionStatus === '已核销' ? `<button type="button" class="text-action" onclick="viewActivityLotteryCouponOrder('${escape(row.id)}')">查看核销订单</button>` : ''}<button type="button" class="text-action" data-lottery-edit="${escape(row.id)}" onclick="openActivityLotteryEditor('${escape(row.id)}')">编辑</button><button type="button" class="text-action danger" onclick="requestActivityLotteryDelete('${escape(row.id)}')">删除</button></span></td>
    </tr>`).join('') : '<tr><td colspan="10" class="notification-empty">暂无符合条件的抽奖记录</td></tr>';
    const pager = document.getElementById('activityLotteryPagination');
    if(pager){
      const startPage = Math.max(1,Math.min(page-2,pages-4));
      const endPage = Math.min(pages,startPage+4);
      let buttons = '';
      for(let number=startPage;number<=endPage;number++){
        buttons += '<button type="button" class="pagebtn'+(page === number ? ' active' : '')+'"'+(page === number ? ' aria-current="page"' : '')+' aria-label="第'+number+'页" onclick="changeActivityLotteryPage('+number+')">'+number+'</button>';
      }
      pager.innerHTML = '<span>共'+rows.length+'条</span><span>'+pageSize+'条/页</span><button type="button" class="pagebtn" '+(page <= 1 ? 'disabled ' : '')+'onclick="changeActivityLotteryPage('+(page-1)+')">上一页</button>'+buttons+'<button type="button" class="pagebtn" '+(page >= pages ? 'disabled ' : '')+'onclick="changeActivityLotteryPage('+(page+1)+')">下一页</button>';
    }
    const exportButton = document.getElementById('activityLotteryExportButton');
    if(exportButton){exportButton.disabled = rows.length === 0;}
  }
  function searchActivityLotteryRecords(){
    page = 1;
    const status = document.getElementById('activityLotteryExportStatus');
    if(status){status.textContent = '';}
    renderActivityLotteryRecords();
  }
  function resetActivityLotteryRecords(){
    textFilters.forEach(([id]) => {const input=document.getElementById(id);if(input){input.value='';syncQueryInputClear(input);}});
    selectFilters.forEach(([id,,label]) => resetCustomSelect(id,label));
    setUnifiedRangeValues('activityLotteryCouponClaim','','',false);
    setUnifiedRangeValues('activityLotteryCouponRedemption','','',false);
    searchActivityLotteryRecords();
  }
  function changeActivityLotteryPage(value){
    if(!Number.isInteger(value) || value < 1){return}
    page = value;
    renderActivityLotteryRecords();
  }
  function buildCsv(rows){
    const header = ['序号','手机号码','设备SN','所属商户','订单截图数量','优惠券领取状态','优惠券领取时间','优惠券核销状态','优惠券核销时间'];
    const values = rows.map((row,index) => [index+1,row.phone,row.sn,row.merchant,row.orderScreenshots.length,row.couponClaimStatus,row.couponClaimedAt,row.couponRedemptionStatus,row.couponRedeemedAt]);
    const cell = value => {
      let text = String(value == null ? '' : value);
      if(/^[\s]*[=+@-]/.test(text)){text = "'"+text;}
      return '"'+text.replace(/"/g,'""')+'"';
    };
    return '\uFEFF'+[header,...values].map(row => row.map(cell).join(',')).join('\r\n');
  }
  function exportActivityLotteryRecords(){
    const rows = filteredRecords();
    if(!rows.length){return}
    const url = URL.createObjectURL(new Blob([buildCsv(rows)],{type:'text/csv;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = '双11活动抽奖记录.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),1000);
    const status = document.getElementById('activityLotteryExportStatus');
    if(status){status.textContent = '已导出 '+rows.length+' 条抽奖记录，订单截图请在页面中查看';}
  }

  function openLotteryOverlay(mask){
    if(mask.style.display === 'flex'){return}
    const parent = overlayStack[overlayStack.length-1];
    if(parent){parent.mask.querySelector('[role="dialog"],[role="alertdialog"]').setAttribute('aria-modal','false');}
    overlayStack.push({
      mask,trigger:document.activeElement,wasInert:mask.inert,overflow:document.body.style.overflow,
      background:Array.from(document.body.children).filter(node => node !== mask && !['SCRIPT','STYLE','LINK'].includes(node.tagName)).map(node => ({node,wasInert:node.inert}))
    });
    overlayStack[overlayStack.length-1].background.forEach(({node}) => {node.inert = true;});
    mask.inert = false;
    document.body.style.overflow = 'hidden';
    mask.style.display = 'flex';
    mask.querySelector('.activity-lottery-drawer-close').focus();
  }
  function closeLotteryOverlay(mask,fallback){
    const state = overlayStack[overlayStack.length-1];
    if(!state || state.mask !== mask){return}
    overlayStack.pop();
    mask.style.display = 'none';
    mask.inert = state.wasInert;
    document.body.style.overflow = state.overflow;
    state.background.forEach(({node,wasInert}) => {if(node.isConnected){node.inert = wasInert;}});
    const parent = overlayStack[overlayStack.length-1];
    if(parent){parent.mask.querySelector('[role="dialog"],[role="alertdialog"]').setAttribute('aria-modal','true');}
    const trigger = state.trigger && state.trigger.isConnected ? state.trigger : fallback || (parent && parent.mask.querySelector('.activity-lottery-drawer-close')) || document.getElementById('activityLotteryPhoneInput');
    if(trigger){trigger.focus();}
  }
  function trapLotteryOverlayKeydown(event,close){
    if(event.key === 'Escape'){event.preventDefault();event.stopPropagation();close();return}
    if(event.key !== 'Tab'){return}
    const buttons = Array.from(event.currentTarget.querySelectorAll('button:not(:disabled),input:not([type="hidden"]):not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href],[tabindex]:not([tabindex="-1"])')).filter(node => node.getClientRects().length);
    if(!buttons.length){event.preventDefault();event.currentTarget.focus();return}
    const first=buttons[0],last=buttons[buttons.length-1];
    if(event.shiftKey && document.activeElement === first){event.preventDefault();last.focus();}
    else if(!event.shiftKey && document.activeElement === last){event.preventDefault();first.focus();}
  }
  function openActivityLotteryScreenshot(id,index=0){
    const row = records.find(item => item.id === id);
    if(!row || !Number.isInteger(index) || !row.orderScreenshots[index]){return}
    showLotteryScreenshot(row.orderScreenshots[index],row.sn+' · 订单截图 '+(index+1));
  }
  function showLotteryScreenshot(src,caption){
    const mask = document.getElementById('activityLotteryScreenshotMask');
    const image = document.getElementById('activityLotteryScreenshotImage');
    if(!mask || !image){return}
    image.hidden = true;
    document.getElementById('activityLotteryScreenshotStatus').textContent = '图片加载中…';
    document.getElementById('activityLotteryScreenshotRetry').hidden = true;
    document.getElementById('activityLotteryScreenshotCaption').textContent = caption;
    image.alt = caption;
    openLotteryOverlay(mask);
    image.src = src;
  }
  function closeActivityLotteryScreenshot(){
    const mask = document.getElementById('activityLotteryScreenshotMask');
    if(!mask || mask.style.display !== 'flex'){return}
    closeLotteryOverlay(mask);
  }
  function handleActivityLotteryScreenshotResult(success){
    if(document.getElementById('activityLotteryScreenshotMask')?.style.display !== 'flex'){return}
    document.getElementById('activityLotteryScreenshotImage').hidden = !success;
    document.getElementById('activityLotteryScreenshotStatus').textContent = success ? '' : '图片加载失败，请重试。';
    document.getElementById('activityLotteryScreenshotRetry').hidden = success;
  }
  function retryActivityLotteryScreenshot(){
    const image = document.getElementById('activityLotteryScreenshotImage');
    const src = image.getAttribute('src');
    if(!src){return}
    image.hidden = true;
    document.getElementById('activityLotteryScreenshotStatus').textContent = '图片加载中…';
    document.getElementById('activityLotteryScreenshotRetry').hidden = true;
    document.querySelector('#activityLotteryScreenshotMask .activity-lottery-drawer-close').focus();
    image.removeAttribute('src');
    image.src = src;
  }
  function handleActivityLotteryScreenshotKeydown(event){trapLotteryOverlayKeydown(event,closeActivityLotteryScreenshot);}
  function setLotteryFieldError(key,message){
    const field = document.getElementById('activityLotteryEdit'+key);
    const error = document.getElementById('activityLotteryEdit'+key+'Error');
    if(field){field.setAttribute('aria-invalid',message ? 'true' : 'false');}
    if(error){error.textContent = message;}
  }
  function clearActivityLotteryFieldError(field){setLotteryFieldError(field.id.slice('activityLotteryEdit'.length),'');}
  function renderLotteryDraftImages(){
    const container = document.getElementById('activityLotteryEditImages');
    if(!container || !editDraft){return}
    container.innerHTML = editDraft.images.length ? editDraft.images.map((image,index) => '<div class="activity-lottery-edit-image"><button type="button" class="activity-lottery-screenshot" aria-label="预览订单截图'+(index+1)+'" onclick="previewActivityLotteryDraftScreenshot('+index+')"><img width="36" height="52" src="'+escape(image.src)+'" alt="" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span hidden>查看截图</span></button><span class="activity-lottery-file-name">'+escape(image.name)+'</span><button type="button" class="text-action danger" aria-label="移除订单截图'+(index+1)+'" '+(editDraft.reading ? 'disabled ' : '')+'onclick="removeActivityLotteryDraftScreenshot('+index+')">移除</button></div>').join('') : '<span class="activity-lottery-media-empty">暂无订单截图</span>';
    document.getElementById('activityLotteryEditUpload').disabled = editDraft.reading;
    document.getElementById('activityLotteryEditScreenshots').disabled = editDraft.reading;
    document.getElementById('activityLotteryEditSave').disabled = editDraft.reading;
    document.getElementById('activityLotteryEditorForm').setAttribute('aria-busy',String(editDraft.reading));
    document.getElementById('activityLotteryEditReadStatus').textContent = editDraft.reading ? '正在读取图片，请稍候…' : '已选择 '+editDraft.images.length+' 张订单截图';
  }
  function openActivityLotteryEditor(id){
    const row = records.find(item => item.id === id);
    const mask = document.getElementById('activityLotteryEditorMask');
    if(!row || !mask || editDraft){return}
    editDraft = {
      id,images:row.orderScreenshots.map((src,index) => ({src,name:row.orderScreenshotNames?.[index] || '订单截图'+(index+1)})),
      original:{phone:row.phone,sn:row.sn,address:row.address,images:row.orderScreenshots.slice()},reading:false,readers:new Set()
    };
    document.getElementById('activityLotteryEditPhone').value = row.phone;
    document.getElementById('activityLotteryEditSn').value = row.sn;
    document.getElementById('activityLotteryEditAddress').value = row.address;
    document.getElementById('activityLotteryEditScreenshots').value = '';
    ['Phone','Sn','Address','Screenshots'].forEach(key => setLotteryFieldError(key,''));
    renderLotteryDraftImages();
    openLotteryOverlay(mask);
    document.getElementById('activityLotteryEditPhone').focus();
  }
  function lotteryEditorIsDirty(){
    if(!editDraft){return false}
    const original = editDraft.original;
    return editDraft.reading || inputValue('activityLotteryEditPhone') !== original.phone || inputValue('activityLotteryEditSn') !== original.sn || inputValue('activityLotteryEditAddress') !== original.address || editDraft.images.length !== original.images.length || editDraft.images.some((image,index) => image.src !== original.images[index]);
  }
  function discardLotteryEditor(){
    if(!editDraft){return}
    const draft = editDraft;
    editDraft = null;
    draft.readers.forEach(reader => reader.abort());
    closeLotteryOverlay(document.getElementById('activityLotteryEditorMask'));
    document.getElementById('activityLotteryEditImages').innerHTML = '';
    document.getElementById('activityLotteryEditScreenshots').value = '';
  }
  function requestCloseActivityLotteryEditor(){
    if(!editDraft){return}
    if(lotteryEditorIsDirty()){openLotteryConfirm({type:'discard'});return}
    discardLotteryEditor();
  }
  function removeActivityLotteryDraftScreenshot(index){
    if(!editDraft || editDraft.reading || !Number.isInteger(index) || !editDraft.images[index]){return}
    editDraft.images.splice(index,1);
    setLotteryFieldError('Screenshots','');
    renderLotteryDraftImages();
    document.getElementById('activityLotteryEditUpload').focus();
  }
  function previewActivityLotteryDraftScreenshot(index){
    if(!editDraft || !Number.isInteger(index) || !editDraft.images[index]){return}
    showLotteryScreenshot(editDraft.images[index].src,editDraft.id+' · '+editDraft.images[index].name);
  }
  function readLotteryScreenshot(file,draft){
    return ActivityScreenshot.read(file,{maxBytes:screenshotMaxBytes,readers:draft.readers});
  }
  async function selectActivityLotteryScreenshots(input){
    const files = Array.from(input.files || []);
    if(!editDraft || editDraft.reading || !files.length){return}
    if(editDraft.images.length+files.length > screenshotLimit){
      setLotteryFieldError('Screenshots','订单截图只能上传1张，请先移除已有图片后重新选择。');
      input.value = '';
      return;
    }
    const draft = editDraft;
    draft.reading = true;
    setLotteryFieldError('Screenshots','');
    renderLotteryDraftImages();
    const results = await Promise.allSettled(files.map(file => readLotteryScreenshot(file,draft)));
    if(editDraft !== draft){return}
    const errors = [];
    results.forEach((result,index) => {
      if(result.status === 'fulfilled'){draft.images.push(result.value);}
      else{errors.push(files[index].name+'：'+result.reason.message);}
    });
    draft.reading = false;
    input.value = '';
    renderLotteryDraftImages();
    setLotteryFieldError('Screenshots',errors.join('；'));
  }
  function saveActivityLotteryEditor(event){
    if(event){event.preventDefault();}
    if(!editDraft || editDraft.reading){return}
    if(editDraft.images.length > screenshotLimit){
      setLotteryFieldError('Screenshots','订单截图只能上传1张，请移除多余图片。');
      document.getElementById('activityLotteryEditUpload').focus();
      return;
    }
    const phone = inputValue('activityLotteryEditPhone');
    const sn = inputValue('activityLotteryEditSn');
    const address = inputValue('activityLotteryEditAddress');
    const errors = [
      ['Phone',!/^1[3-9]\d{9}$/.test(phone) ? '请输入完整的11位手机号码。' : ''],
      ['Sn',!sn ? '请输入设备SN。' : sn.length > 100 ? '设备SN不能超过100个字符。' : ''],
      ['Address',!address ? '请输入收货地址。' : address.length > 500 ? '收货地址不能超过500个字符。' : '']
    ];
    errors.forEach(([key,message]) => setLotteryFieldError(key,message));
    const first = errors.find(([,message]) => message);
    if(first){document.getElementById('activityLotteryEdit'+first[0]).focus();return}
    const row = records.find(item => item.id === editDraft.id);
    if(!row){return}
    Object.assign(row,{phone,sn,address,orderScreenshots:editDraft.images.map(image => image.src),orderScreenshotNames:editDraft.images.map(image => image.name)});
    editDraft = null;
    renderActivityLotteryRecords();
    closeLotteryOverlay(document.getElementById('activityLotteryEditorMask'),document.querySelector('[data-lottery-edit="'+row.id+'"]'));
    document.getElementById('activityLotteryEditImages').innerHTML = '';
    document.getElementById('activityLotteryEditScreenshots').value = '';
    document.getElementById('activityLotteryExportStatus').textContent = '已保存设备「'+row.sn+'」的参与记录';
  }
  function openLotteryConfirm(action){
    if(confirmAction){return}
    confirmAction = action;
    const deleting = action.type === 'delete';
    const target = deleting ? records.find(row => row.id === action.id) : null;
    document.getElementById('activityLotteryConfirmTitle').textContent = deleting ? '抽奖记录删除' : '放弃修改';
    document.getElementById('activityLotteryConfirmMessage').textContent = deleting ? '确定删除设备「'+(target?.sn || '--')+'」的参与记录？删除后，该记录将从双11福利列表移除。' : '当前修改尚未保存，确定放弃本次修改？';
    document.getElementById('activityLotteryConfirmSubmit').textContent = deleting ? '删除' : '放弃修改';
    openLotteryOverlay(document.getElementById('activityLotteryConfirmMask'));
    document.getElementById('activityLotteryConfirmCancel').focus();
  }
  function requestActivityLotteryDelete(id){
    if(records.some(row => row.id === id)){openLotteryConfirm({type:'delete',id});}
  }
  function closeActivityLotteryConfirm(){
    if(!confirmAction){return}
    confirmAction = null;
    closeLotteryOverlay(document.getElementById('activityLotteryConfirmMask'));
  }
  function confirmActivityLotteryAction(){
    if(!confirmAction){return}
    const action = confirmAction;
    if(action.type === 'discard'){
      closeActivityLotteryConfirm();
      discardLotteryEditor();
      return;
    }
    const index = records.findIndex(row => row.id === action.id);
    if(index >= 0){records.splice(index,1);renderActivityLotteryRecords();}
    closeActivityLotteryConfirm();
    document.getElementById('activityLotteryExportStatus').textContent = '已删除参与记录';
  }
  function handleActivityLotteryEditorKeydown(event){trapLotteryOverlayKeydown(event,requestCloseActivityLotteryEditor);}
  function handleActivityLotteryConfirmKeydown(event){trapLotteryOverlayKeydown(event,closeActivityLotteryConfirm);}
  window.addEventListener('beforeunload',event => {if(lotteryEditorIsDirty()){event.preventDefault();event.returnValue = '';}});
  function viewActivityLotteryCouponOrder(id){
    const row = records.find(item => item.id === id);
    if(!row?.couponIssued || row.couponRedemptionStatus !== '已核销'){return}
    if(!openOrderByNumber(row.couponOrderNo)){
      document.getElementById('activityLotteryExportStatus').textContent = '核销订单暂不可用，请稍后重试。';
    }
  }
  Object.assign(window,{viewActivityLotteryCouponOrder,renderActivityLotteryRecords,searchActivityLotteryRecords,resetActivityLotteryRecords,changeActivityLotteryPage,exportActivityLotteryRecords,openActivityLotteryScreenshot,closeActivityLotteryScreenshot,handleActivityLotteryScreenshotResult,retryActivityLotteryScreenshot,handleActivityLotteryScreenshotKeydown,openActivityLotteryEditor,requestCloseActivityLotteryEditor,clearActivityLotteryFieldError,selectActivityLotteryScreenshots,removeActivityLotteryDraftScreenshot,previewActivityLotteryDraftScreenshot,saveActivityLotteryEditor,requestActivityLotteryDelete,closeActivityLotteryConfirm,confirmActivityLotteryAction,handleActivityLotteryEditorKeydown,handleActivityLotteryConfirmKeydown});
})();

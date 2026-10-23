(function(){
  'use strict';
  const pageSize = 20;
  const ranges = ['activityCouponClaim','activityCouponValidity','activityCouponUsed'];
  const inputIds = ['activityCouponSnInput',...ranges.flatMap(key => [key+'StartInput',key+'EndInput'])];
  let page = 1;
  const byId = id => document.getElementById(id);
  const value = id => (byId(id)?.value || '').trim();
  const escape = text => String(text == null ? '' : text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

  // Local prototype fixtures. Validity dates are record data, not an issuance rule.
  const records = Array.from({length:24},(_,index) => {
    const day = String(index%11+1).padStart(2,'0');
    const suffix = String(index+1).padStart(4,'0');
    const used = index%3 === 1;
    return {
      id:'COUPON202611'+suffix,
      sn:'MBB20261101'+suffix,
      claimedAt:'2026-11-'+day+' 09:20:00',
      status:used ? '已核销' : '未核销',
      validFrom:'2026-11-'+day,
      validUntil:'2027-05-'+day,
      usedAt:used ? '2026-11-'+day+' 10:35:00' : '',
      orderNo:used ? 'ORDCP202611'+suffix : ''
    };
  });

  // Used-coupon links resolve to actual rows in the existing order-management prototype.
  // Other order fields reuse its mock schema; no checkout or financial calculation is introduced.
  const orderTemplate = paymentOrderData.find(row => row.status === '已支付' && row.orderType === '套餐充值') || paymentOrderData[0];
  records.filter(row => row.orderNo).forEach(row => {
    if(paymentOrderData.some(order => order.orderNo === row.orderNo)){return}
    paymentOrderData.push({
      ...orderTemplate,orderNo:row.orderNo,sn:row.sn,
      couponName:'双11福利优惠券（示例）',coupon:'已使用',
      createdAt:row.usedAt,paidAt:row.usedAt,payNo:'WXCP'+row.id.slice(6),
      beforeExpire:'--',afterExpire:'--',autoRenew:'关闭'
    });
  });

  function dateMatches(date,start,end){
    if(!start && !end){return true}
    const day = String(date || '').slice(0,10);
    return Boolean(day && (!start || day >= start) && (!end || day <= end));
  }
  function filteredRecords(){
    const sn = value('activityCouponSnInput').toLowerCase();
    const status = byId('activityCouponStatusFilter')?.dataset.value || '';
    const validityStart = value('activityCouponValidityStartInput');
    const validityEnd = value('activityCouponValidityEndInput');
    return records.filter(row =>
      (!sn || row.sn.toLowerCase().includes(sn)) &&
      (!status || row.status === status) &&
      dateMatches(row.claimedAt,value('activityCouponClaimStartInput'),value('activityCouponClaimEndInput')) &&
      (!validityStart || row.validUntil >= validityStart) &&
      (!validityEnd || row.validFrom <= validityEnd) &&
      dateMatches(row.usedAt,value('activityCouponUsedStartInput'),value('activityCouponUsedEndInput'))
    );
  }
  function render(){
    const body = byId('activityCouponRows');
    if(!body){return}
    const rows = filteredRecords();
    const issuedTotal = rows.length;
    const usedTotal = rows.filter(row => row.status === '已核销').length;
    byId('activityCouponIssuedTotal').textContent = issuedTotal+' 张';
    byId('activityCouponUsedTotal').textContent = usedTotal+' 张';
    byId('activityCouponUsageRate').textContent = (issuedTotal ? usedTotal/issuedTotal*100 : 0).toFixed(2)+'%';
    const pages = Math.max(1,Math.ceil(rows.length/pageSize));
    page = Math.min(Math.max(1,page),pages);
    body.innerHTML = rows.length ? rows.slice((page-1)*pageSize,page*pageSize).map(row => `<tr>
      <td>${escape(row.sn)}</td><td>${escape(row.claimedAt)}</td><td>${escape(row.status)}</td>
      <td>${escape(row.validFrom)} ～ ${escape(row.validUntil)}</td><td>${escape(row.usedAt || '--')}</td>
      <td class="sticky-action">${row.orderNo ? `<button type="button" class="text-action" onclick="viewActivityCouponOrder('${escape(row.id)}')">查看订单</button>` : '<span class="activity-coupon-no-order">暂无使用订单</span>'}</td>
    </tr>`).join('') : '<tr><td colspan="6" class="notification-empty">暂无符合条件的领取记录</td></tr>';
    byId('activityCouponPagination').innerHTML = `<span>共${rows.length}条</span><span>${pageSize}条/页</span><button type="button" class="pagebtn" ${page===1 ? 'disabled' : ''} onclick="changeActivityCouponPage(${page-1})">上一页</button>${Array.from({length:pages},(_,index) => `<button type="button" class="pagebtn${page===index+1 ? ' active' : ''}" ${page===index+1 ? 'aria-current="page"' : ''} onclick="changeActivityCouponPage(${index+1})">${index+1}</button>`).join('')}<button type="button" class="pagebtn" ${page===pages ? 'disabled' : ''} onclick="changeActivityCouponPage(${page+1})">下一页</button>`;
    byId('activityCouponExportButton').disabled = !rows.length;
  }
  function search(){
    page = 1;
    byId('activityCouponExportStatus').textContent = '';
    render();
  }
  function reset(){
    inputIds.forEach(id => {const input=byId(id);input.value='';if(typeof syncQueryInputClear === 'function'){syncQueryInputClear(input);}});
    resetCustomSelect('activityCouponStatusFilter','核销状态');
    ranges.forEach(key => setUnifiedRangeValues(key,'','',false));
    search();
  }
  function changePage(number){
    const pages = Math.max(1,Math.ceil(filteredRecords().length/pageSize));
    if(!Number.isInteger(number) || number < 1 || number > pages){return}
    page = number;
    render();
  }
  function csvCell(input){
    let text = String(input == null ? '' : input);
    if(/^[=+\-@\t\r]/.test(text)){text="'"+text;}
    return '"'+text.replace(/"/g,'""')+'"';
  }
  function exportRecords(){
    const rows = filteredRecords();
    if(!rows.length){byId('activityCouponExportStatus').textContent='暂无可导出的领取记录';return}
    const values = [['设备SN','领取时间','核销状态','有效期','使用时间'],...rows.map(row => [row.sn,row.claimedAt,row.status,row.validFrom+' ～ '+row.validUntil,row.usedAt])];
    const blob = new Blob(['\ufeff'+values.map(row => row.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href=url;
    link.download='双11福利优惠券领取情况_2026-11-01_2026-11-11.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url),1000);
    byId('activityCouponExportStatus').textContent='已导出'+rows.length+'条领取记录';
  }
  function viewOrder(id){
    const row = records.find(item => item.id === id);
    if(!row?.orderNo){return}
    if(!openOrderByNumber(row.orderNo)){byId('activityCouponExportStatus').textContent='关联订单暂不可用，请稍后重试。';}
  }
  Object.assign(window,{
    renderActivityCouponRecords:render,
    searchActivityCouponRecords:search,
    resetActivityCouponRecords:reset,
    changeActivityCouponPage:changePage,
    exportActivityCouponRecords:exportRecords,
    viewActivityCouponOrder:viewOrder
  });
})();

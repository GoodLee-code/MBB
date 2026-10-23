(function(){
  'use strict';
  // Definition-only local fixtures from the supplied reference, independent of issued coupons and order history.
  const records=[
    {id:30,name:'100-20',type:'满减券',threshold:'100',amount:'20',remark:'',creator:'吴璟锋',createdAt:'2026-05-19 16:21:09'},
    {id:29,name:'满20.01-6',type:'满减券',threshold:'20.01',amount:'6',remark:'',creator:'吴璟锋',createdAt:'2026-05-18 17:43:43'},
    {id:28,name:'代金券',type:'满减券',threshold:'10',amount:'2',remark:'测试',creator:'陈启安',createdAt:'2026-01-06 16:13:23'},
    {id:27,name:'ljp-test',type:'满减券',threshold:'100',amount:'20',remark:'ljp-test',creator:'林嘉鹏',createdAt:'2025-12-18 18:07:03'},
    {id:26,name:'代金券',type:'满减券',threshold:'-200',amount:'-70',remark:'测试',creator:'陈启安',createdAt:'2025-10-27 16:46:54'},
    {id:25,name:'代金券',type:'满减券',threshold:'-200',amount:'-70',remark:'测试',creator:'刘嵘峥',createdAt:'2025-07-25 16:23:46'},
    {id:24,name:'满25减20',type:'满减券',threshold:'30',amount:'9',remark:'测试',creator:'刘嵘峥',createdAt:'2025-07-25 16:22:34'},
    {id:23,name:'优惠券',type:'满减券',threshold:'1',amount:'0.2',remark:'',creator:'张可昕',createdAt:'2025-02-19 19:21:26'},
    {id:22,name:'满1-0.3',type:'满减券',threshold:'1',amount:'0.3',remark:'',creator:'张可昕',createdAt:'2025-02-19 12:25:15'},
    {id:21,name:'优惠券',type:'满减券',threshold:'5.55',amount:'1.55',remark:'',creator:'张可昕',createdAt:'2025-02-19 12:09:58'},
    {id:18,name:'满30-10',type:'满减券',threshold:'30',amount:'9',remark:'',creator:'张可昕',createdAt:'2025-02-19 11:12:31'},
    {id:17,name:'10元',type:'抵扣券',thresholdDays:'180',amount:'20',remark:'国庆',creator:'张可昕',createdAt:'2025-02-19 11:10:47'},
    {id:11,name:'测试满减券2',type:'满减券',threshold:'10',amount:'1',remark:'',creator:'',createdAt:'2025-02-10 16:30:28'},
    {id:10,name:'测试满减券',type:'满减券',threshold:'33',amount:'10',remark:'测试',creator:'',createdAt:'2025-02-10 14:52:01'}
  ].map(({threshold,thresholdDays=null,...row})=>({...row,thresholds:{amount:row.type==='满减券' ? threshold : null,days:row.type==='抵扣券' ? thresholdDays : null}}));
  const byId=id=>document.getElementById(id);
  const input=id=>byId(id).value.trim();
  const escape=text=>String(text ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const pageSize=20;
  let page=1,nextId=31,editingId=null,deletingId=null;
  function thresholdText(row){
    const parts=[];
    if(row.type==='满减券' && row.thresholds.amount!==null){parts.push('满 '+escape(row.thresholds.amount)+' 元可用');}
    if(row.type==='抵扣券' && row.thresholds.days!==null){parts.push('套餐有效天数 ≥ '+escape(row.thresholds.days)+' 天可用');}
    return parts.map(text=>'<div>'+text+'</div>').join('');
  }
  function filtered(){
    const name=input('couponManageNameInput').toLowerCase(),id=input('couponManageIdInput');
    const type=byId('couponManageTypeFilter').dataset.value || '';
    return records.filter(row=>(!name || row.name.toLowerCase().includes(name)) && (!id || String(row.id)===id) && (!type || row.type===type));
  }
  function render(){
    const rows=filtered(),pages=Math.max(1,Math.ceil(rows.length/pageSize));
    page=Math.max(1,Math.min(page,pages));
    const start=(page-1)*pageSize;
    byId('couponManageRows').innerHTML=rows.length ? rows.slice(start,start+pageSize).map(row=>`<tr>
      <td>${row.id}</td><td class="coupon-name">${escape(row.name)}</td><td><span class="coupon-manage-type">${escape(row.type)}</span></td>
      <td class="coupon-threshold-summary">${thresholdText(row)}</td><td>${escape(row.amount)}</td><td class="coupon-remark">${escape(row.remark || '--')}</td><td>${escape(row.creator || '--')}</td><td>${escape(row.createdAt)}</td>
      <td class="sticky-action"><button type="button" class="text-action" data-coupon-edit="${row.id}" onclick="CouponManagement.openEditor(${row.id})" aria-label="编辑优惠券${row.id}">编辑</button><button type="button" class="text-action danger" onclick="CouponManagement.requestDelete(${row.id})" aria-label="删除优惠券${row.id}">删除</button></td>
    </tr>`).join('') : '<tr><td colspan="9" class="notification-empty">暂无符合条件的优惠券</td></tr>';
    const first=Math.max(1,Math.min(page-2,pages-4));
    let buttons='';
    for(let number=first;number<=Math.min(pages,first+4);number++){
      buttons+=`<button type="button" class="pagebtn${number===page ? ' active' : ''}" ${number===page ? 'aria-current="page"' : ''} aria-label="第${number}页" onclick="CouponManagement.changePage(${number})">${number}</button>`;
    }
    byId('couponManagePagination').innerHTML=`<span>共${rows.length}条</span><span>${pageSize}条/页</span><button type="button" class="pagebtn" ${page===1 ? 'disabled' : ''} onclick="CouponManagement.changePage(${page-1})">上一页</button>${buttons}<button type="button" class="pagebtn" ${page===pages ? 'disabled' : ''} onclick="CouponManagement.changePage(${page+1})">下一页</button>`;
  }
  function search(event){
    if(event?.isComposing){return}
    page=1;byId('couponManageStatus').textContent='';render();
  }
  function reset(){
    ['couponManageNameInput','couponManageIdInput'].forEach(id=>{byId(id).value='';syncQueryInputClear(byId(id));});
    resetCustomSelect('couponManageTypeFilter','优惠券类型');search();
  }
  function changePage(value){if(Number.isInteger(value) && value>0){page=value;render();}}
  function clearError(key){
    setError(key,'');
  }
  function setError(key,message,targetId){
    byId('couponEditor'+key).setAttribute('aria-invalid',String(Boolean(message)));
    byId('couponEditor'+key+'Field').classList.toggle('invalid',Boolean(message));
    byId('couponEditor'+key+'Error').textContent=message;
    if(key==='Threshold'){
      ['AmountEnabled','DaysEnabled','Amount','Days'].forEach(part=>byId('couponEditorThreshold'+part).setAttribute('aria-invalid','false'));
      if(message && targetId){byId(targetId).setAttribute('aria-invalid','true');}
    }
  }
  function syncThresholds(){
    const type=byId('couponEditorType').dataset.value;
    ['Amount','Days'].forEach(part=>{
      const available=type===(part==='Amount' ? '满减券' : '抵扣券');
      const toggle=byId('couponEditorThreshold'+part+'Enabled');
      byId('couponEditorThreshold'+part+'Option').hidden=!available;
      toggle.disabled=!available;
      const enabled=available && toggle.checked;
      const field=byId('couponEditorThreshold'+part);
      field.disabled=!enabled;field.required=enabled;
    });
    byId('couponEditorThresholdHint').textContent=type==='抵扣券' ? '勾选后填写套餐有效天数。' : '勾选后填写满额门槛。';
    clearError('Threshold');
  }
  function changeType(){
    clearError('Type');
    const part=byId('couponEditorType').dataset.value==='抵扣券' ? 'Days' : 'Amount';
    byId('couponEditorThreshold'+part+'Enabled').checked=true;
    syncThresholds();
  }
  function openEditor(id=null){
    if(byId('couponEditorMask').style.display==='flex' || byId('couponDeleteMask').style.display==='flex'){return}
    const row=id===null ? null : records.find(item=>item.id===id);
    if(id!==null && !row){return}
    editingId=id;
    byId('couponEditorTitle').textContent=row ? '编辑优惠券' : '新增优惠券';
    ['Name','Amount','Remark'].forEach(key=>{byId('couponEditor'+key).value=row ? row[key.toLowerCase()] : '';clearError(key);});
    const type=row?.type || '满减券';
    setCustomSelectValue('couponEditorType',type,type,false);
    ['Amount','Days'].forEach(part=>{
      const value=row ? row.thresholds[part.toLowerCase()] : null;
      byId('couponEditorThreshold'+part+'Enabled').checked=type===(part==='Amount' ? '满减券' : '抵扣券');
      byId('couponEditorThreshold'+part).value=value ?? '';
    });
    syncThresholds();
    clearError('Type');
    closeDropdowns();AdminUI.openDialog(byId('couponEditorMask'),byId('couponEditorName'));
  }
  function closeEditor(restoreFocus=true){
    closeDropdowns();AdminUI.closeDialog(byId('couponEditorMask'),byId('couponManageAddButton'),restoreFocus);
    editingId=null;
  }
  function now(){
    const date=new Date(),pad=part=>String(part).padStart(2,'0');
    return date.getFullYear()+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate())+' '+pad(date.getHours())+':'+pad(date.getMinutes())+':'+pad(date.getSeconds());
  }
  function save(event){
    event?.preventDefault();
    if(byId('couponEditorMask').style.display!=='flex'){return}
    const name=input('couponEditorName'),type=byId('couponEditorType').dataset.value || '';
    const amount=input('couponEditorAmount'),remark=input('couponEditorRemark');
    const thresholds={
      amount:type==='满减券' && byId('couponEditorThresholdAmountEnabled').checked ? input('couponEditorThresholdAmount') : null,
      days:type==='抵扣券' && byId('couponEditorThresholdDaysEnabled').checked ? input('couponEditorThresholdDays') : null
    };
    // Only numeric syntax is validated; the reference includes signed values and duplicate names.
    const decimal=value=>/^-?\d+(?:\.\d{1,2})?$/.test(value) && Number.isFinite(Number(value)) && Math.abs(Number(value))<=Number.MAX_SAFE_INTEGER/100;
    let thresholdError='',thresholdTarget=type==='抵扣券' ? 'couponEditorThresholdDaysEnabled' : 'couponEditorThresholdAmountEnabled';
    if(thresholds.amount===null && thresholds.days===null){thresholdError=type==='抵扣券' ? '请勾选套餐有效天数使用门槛。' : '请勾选满额使用门槛。';}
    else if(thresholds.amount!==null && !decimal(thresholds.amount)){
      thresholdError='请输入有效的满额门槛，最多保留两位小数。';thresholdTarget='couponEditorThresholdAmount';
    }else if(thresholds.days!==null && !(/^\d+$/.test(thresholds.days) && Number.isSafeInteger(Number(thresholds.days)))){
      thresholdError='请输入有效的套餐天数，须为非负整数。';thresholdTarget='couponEditorThresholdDays';
    }
    const errors=[['Name',!name ? '请输入优惠券名称。' : name.length>100 ? '优惠券名称不能超过100个字符。' : ''],
      ['Type',['满减券','抵扣券'].includes(type) ? '' : '请选择优惠券类型。'],
      ['Threshold',thresholdError,thresholdTarget],
      ['Amount',decimal(amount) ? '' : '请输入有效的优惠金额，最多保留两位小数。'],
      ['Remark',remark.length>500 ? '备注不能超过500个字符。' : '']];
    errors.forEach(([key,message,targetId])=>setError(key,message,targetId));
    const invalid=errors.find(([,message])=>message);
    if(invalid){byId(invalid[2] || 'couponEditor'+invalid[0]).focus();return}
    const editing=editingId!==null;
    const savedId=editingId ?? nextId;
    if(editing){
      const row=records.find(item=>item.id===editingId);
      if(!row){return}
      Object.assign(row,{name,type,thresholds,amount,remark});
    }else{
      const creator=document.querySelector('.topbar .user')?.textContent.replace('⌄','').trim() || '当前用户';
      records.unshift({id:nextId++,name,type,thresholds,amount,remark,creator,createdAt:now()});page=1;
    }
    render();closeEditor();
    byId('couponManageStatus').textContent=(editing ? '已保存优惠券「' : '已新增优惠券「')+name+'」。'+(!filtered().some(row=>row.id===savedId) ? '当前查询条件下未显示该优惠券。' : '');
  }
  function requestDelete(id){
    const row=records.find(item=>item.id===id);
    if(!row || byId('couponDeleteMask').style.display==='flex' || byId('couponEditorMask').style.display==='flex'){return}
    deletingId=id;
    byId('couponDeleteMessage').textContent='确定删除优惠券「'+row.name+'」（ID：'+row.id+'）？删除后将从优惠券管理列表移除。';
    AdminUI.openDialog(byId('couponDeleteMask'),byId('couponDeleteCancel'));
  }
  function closeDelete(restoreFocus=true){
    AdminUI.closeDialog(byId('couponDeleteMask'),byId('couponManageAddButton'),restoreFocus);deletingId=null;
  }
  function confirmDelete(){
    if(deletingId===null){return}
    const index=records.findIndex(row=>row.id===deletingId);
    if(index<0){closeDelete();return}
    const name=records[index].name;
    records.splice(index,1);render();closeDelete();byId('couponManageStatus').textContent='已删除优惠券「'+name+'」。';
  }
  function closeDialogs(){closeDelete(false);closeEditor(false);}
  window.CouponManagement=Object.freeze({render,search,reset,changePage,openEditor,closeEditor,clearError,syncThresholds,changeType,save,requestDelete,closeDelete,confirmDelete,closeDialogs});
})();

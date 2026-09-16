(function(){
  const initialState = {
    keyword:'',
    source:'manual',
    clipboardStatus:'idle',
    queryStatus:'idle',
    results:[],
    noticeVisible:false,
    queryToken:0
  };
  let state = Object.assign({}, initialState);
  let nodes = {};
  let clipboardReadInFlight = false;
  let lastAutoReadAt = 0;

  function escapeText(value){
    return String(value === undefined || value === null ? '' : value).replace(/[&<>"']/g, char => ({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;',
      "'":'&#39;'
    }[char]));
  }
  function normalize(value){
    return String(value === undefined || value === null ? '' : value).trim().toLowerCase();
  }
  function getGlobalData(name){
    try{
      const value = Function(`return typeof ${name} === "undefined" ? [] : ${name}`)();
      return Array.isArray(value) ? value : [];
    }catch(error){
      return [];
    }
  }
  function getDetailRows(){
    try{
      const data = Function('return typeof detailData === "undefined" ? {} : detailData')();
      return Object.values(data || {}).flat();
    }catch(error){
      return [];
    }
  }
  function uniqueRows(rows,keyFn){
    const seen = new Set();
    return rows.filter(row => {
      const key = keyFn(row);
      if(!key || seen.has(key)){return false}
      seen.add(key);
      return true;
    });
  }
  function findMatches(keyword){
    const query = normalize(keyword);
    if(!query){return []}
    const simSource = uniqueRows(getDetailRows().concat(getGlobalData('deviceRealnameData')), row => row.iccid);
    const deviceSource = getGlobalData('deviceManagementData');
    const orderSource = getGlobalData('paymentOrderData');

    const simMatches = simSource.filter(row => ['iccid','imsi','msisdn'].some(key => normalize(row[key]) === query));
    const deviceSnMatches = deviceSource.filter(row => [row.sn,row.externalSn].some(value => normalize(value) === query));
    const orderNoMatches = orderSource.filter(row => normalize(row.orderNo) === query);
    const orderDeviceMatches = orderSource.filter(row => normalize(row.sn) === query);
    const results = [];

    if(simMatches.length){
      results.push({
        type:'sim',
        label:'SIM卡',
        field:'ICCID',
        value:keyword,
        count:simMatches.length,
        matches:simMatches
      });
    }
    if(deviceSnMatches.length){
      results.push({
        type:'device',
        label:'设备',
        field:'设备SN',
        value:keyword,
        count:deviceSnMatches.length,
        matches:deviceSnMatches
      });
    }
    if(orderNoMatches.length || orderDeviceMatches.length){
      const matches = uniqueRows(orderNoMatches.concat(orderDeviceMatches), row => row.orderNo);
      results.push({
        type:'order',
        label:'订单',
        field:orderNoMatches.length ? '订单号' : '设备SN',
        value:keyword,
        count:matches.length,
        matches
      });
    }
    return results;
  }
  function querySystem(keyword){
    return new Promise(resolve => {
      window.setTimeout(() => resolve(findMatches(keyword)), 260);
    });
  }
  function setState(patch){
    state = Object.assign({}, state, patch);
    render();
  }
  function showToast(message){
    if(!nodes.toast){return}
    nodes.toast.textContent = message;
    nodes.toast.classList.remove('hidden');
    window.clearTimeout(nodes.toastTimer);
    nodes.toastTimer = window.setTimeout(() => nodes.toast.classList.add('hidden'), 1800);
  }
  function renderTopStatus(){
    const clipboardState = state.source === 'clipboard' && state.clipboardStatus === 'success';
    if(!clipboardState){
      nodes.status.classList.add('hidden');
      nodes.statusText.textContent = '';
      return;
    }
    nodes.status.classList.remove('hidden');
    nodes.statusText.textContent = state.queryStatus === 'empty' ? '未查询到剪贴板中的内容' : '已获取剪贴板内容';
  }
  function resultIconHtml(type){
    if(type === 'sim'){return '<span class="cqs-sim-icon" aria-hidden="true"></span>'}
    if(type === 'device'){return '<span class="cqs-device-icon" aria-hidden="true"><span></span></span>'}
    return '<span class="cqs-order-icon" aria-hidden="true"></span>';
  }
  function renderResults(){
    const hasResults = state.queryStatus === 'success' && state.results.length > 0;
    nodes.title.classList.toggle('hidden', !hasResults);
    nodes.list.classList.toggle('hidden', !hasResults);
    if(!hasResults){
      nodes.title.textContent = '';
      nodes.list.innerHTML = '';
      return;
    }
    nodes.title.textContent = `可能的查询结果（${state.results.length}）`;
    nodes.list.innerHTML = state.results.map((result,index) => `
      <div class="cqs-result-card" data-index="${index}" role="button" tabindex="0">
        <div class="cqs-result-icon-wrap ${result.type === 'order' ? 'order' : ''}">${resultIconHtml(result.type)}</div>
        <div class="cqs-result-main">
          <div class="cqs-result-name">${escapeText(result.label)} · ${escapeText(result.field)}</div>
          <div class="cqs-result-value">${escapeText(result.value)}</div>
        </div>
        <div class="cqs-result-action">
          <button type="button" class="cqs-result-button">${escapeText(getResultActionText(result.type))}</button>
          <span class="cqs-arrow" aria-hidden="true"></span>
        </div>
      </div>
    `).join('');
  }
  function renderPanel(){
    const showPanel = state.queryStatus === 'success' && state.results.length > 0;
    nodes.panel.classList.toggle('hidden', !showPanel);
    renderResults();
  }
  function render(){
    if(document.activeElement !== nodes.input && nodes.input.value !== state.keyword){
      nodes.input.value = state.keyword;
    }
    renderTopStatus();
    renderPanel();
    const hasClearableState = Boolean(state.keyword || state.clipboardStatus === 'success' || state.results.length || state.queryStatus === 'empty');
    nodes.clear.classList.toggle('hidden', !hasClearableState);
    const loading = state.queryStatus === 'loading';
    nodes.submit.disabled = loading || !state.keyword.trim();
    nodes.spinner.classList.toggle('hidden', !loading);
  }
  function runQuery(source){
    const keyword = nodes.input.value.trim();
    if(!keyword){return}
    const token = state.queryToken + 1;
    setState({
      keyword,
      source,
      queryStatus:'loading',
      results:[],
      noticeVisible:source === 'clipboard',
      queryToken:token
    });
    querySystem(keyword).then(results => {
      if(token !== state.queryToken){return}
      setState({
        results,
        queryStatus:results.length ? 'success' : 'empty',
        noticeVisible:source === 'clipboard'
      });
      if(!results.length){
        showToast('抱歉，没有找到您搜索的相关内容，请尝试其他搜索词。');
      }
    }).catch(() => {
      if(token !== state.queryToken){return}
      setState({queryStatus:'error',results:[],noticeVisible:false});
      showToast('查询失败，请稍后重试');
    });
  }
  function resetAll(){
    state = Object.assign({}, initialState, {queryToken:state.queryToken + 1});
    if(nodes.input){nodes.input.value = ''}
    render();
    if(nodes.input){nodes.input.focus()}
  }
  function handleManualInput(){
    setState({
      keyword:nodes.input.value,
      source:'manual',
      clipboardStatus:'idle',
      queryStatus:'idle',
      results:[],
      noticeVisible:false,
      queryToken:state.queryToken + 1
    });
  }
  function getResultActionText(type){
    if(type === 'sim'){return '查看SIM卡'}
    if(type === 'device'){return '查看设备'}
    return '查看订单';
  }
  function setInputValue(id,value){
    const input = document.getElementById(id);
    if(!input){return}
    input.value = value;
    if(typeof syncQueryInputClear === 'function'){syncQueryInputClear(input)}
  }
  function navigateSim(result){
    const matchedSim = (result.matches || []).find(row => normalize(row.iccid) === normalize(result.value) || normalize(row.imsi) === normalize(result.value) || normalize(row.msisdn) === normalize(result.value)) || (result.matches || [])[0];
    if(matchedSim && typeof openSimDetail === 'function'){
      openSimDetail(matchedSim.iccid || result.value);
      return;
    }
    if(typeof showPage === 'function'){showPage('config')}
    if(typeof switchAuthManageTab === 'function'){switchAuthManageTab('sim')}
    setInputValue('simIccidInput', result.value);
    if(typeof searchSimRecords === 'function'){searchSimRecords()}
  }
  function navigateDevice(result){
    if(result.matches && result.matches[0] && typeof openDeviceDetail === 'function'){
      openDeviceDetail(result.matches[0].sn);
      return;
    }
  }
  function navigateOrder(result){
    if(typeof showPage === 'function'){showPage('order')}
    const matchedOrder = (result.matches || []).find(row => normalize(row.orderNo) === normalize(result.value) || normalize(row.sn) === normalize(result.value)) || (result.matches || [])[0] || {};
    setInputValue('orderNoInput', matchedOrder.orderNo || (result.field === '订单号' ? result.value : ''));
    setInputValue('orderSnInput', matchedOrder.sn || (result.field === '设备SN' ? result.value : ''));
    if(typeof searchOrderRecords === 'function'){searchOrderRecords()}
  }
  function hideResultPanel(){
    setState({
      queryStatus:'idle',
      results:[],
      noticeVisible:false
    });
  }
  function openResult(index){
    const result = state.results[index];
    if(!result){return}
    if(result.type === 'sim'){navigateSim(result)}
    if(result.type === 'device'){navigateDevice(result)}
    if(result.type === 'order'){navigateOrder(result)}
    hideResultPanel();
  }
  function bindEvents(){
    nodes.input.addEventListener('input', handleManualInput);
    nodes.input.addEventListener('keydown', event => {
      if(event.key === 'Enter'){runQuery('manual')}
    });
    nodes.submit.addEventListener('click', () => runQuery('manual'));
    nodes.clear.addEventListener('click', resetAll);
    nodes.list.addEventListener('click', event => {
      const card = event.target.closest('.cqs-result-card');
      if(card){openResult(Number(card.dataset.index))}
    });
    nodes.list.addEventListener('keydown', event => {
      if(event.key !== 'Enter' && event.key !== ' '){return}
      const card = event.target.closest('.cqs-result-card');
      if(card){
        event.preventDefault();
        openResult(Number(card.dataset.index));
      }
    });
  }
  function renderShell(root){
    root.innerHTML = `
      <div class="cqs-box">
        <span class="cqs-leading-icon" aria-hidden="true"></span>
        <input class="cqs-input" type="text" autocomplete="off" placeholder="请输入或粘贴 ICCID / IMSI / MSISDN / 设备SN / 订单号" aria-label="快捷搜索">
        <div class="cqs-status-pill hidden"><span class="cqs-clipboard-icon" aria-hidden="true"></span><span class="cqs-status-text"></span></div>
        <button type="button" class="cqs-box-clear hidden" aria-label="清空快捷搜索">×</button>
        <button type="button" class="cqs-submit"><span class="cqs-spinner hidden" aria-hidden="true"></span><span>搜索</span></button>
      </div>
      <div class="cqs-panel hidden">
        <div class="cqs-title hidden"></div>
        <div class="cqs-result-list hidden"></div>
      </div>
      <div class="cqs-toast hidden" role="status" aria-live="polite"></div>
    `;
  }
  function cacheNodes(root){
    nodes = {
      root,
      input:root.querySelector('.cqs-input'),
      status:root.querySelector('.cqs-status-pill'),
      statusText:root.querySelector('.cqs-status-text'),
      clear:root.querySelector('.cqs-box-clear'),
      submit:root.querySelector('.cqs-submit'),
      spinner:root.querySelector('.cqs-spinner'),
      panel:root.querySelector('.cqs-panel'),
      title:root.querySelector('.cqs-title'),
      list:root.querySelector('.cqs-result-list'),
      toast:root.querySelector('.cqs-toast')
    };
  }
  function shouldSkipRepeatedClipboardValue(keyword){
    return keyword === state.keyword && state.source === 'clipboard' && ['loading','success','empty'].includes(state.queryStatus);
  }
  function tryReadClipboard(options){
    const config = Object.assign({silent:false}, options || {});
    if(!navigator.clipboard || !navigator.clipboard.readText){
      if(!config.silent){setState({clipboardStatus:'denied'})}
      return;
    }
    if(clipboardReadInFlight){
      return;
    }
    clipboardReadInFlight = true;
    if(!config.silent){setState({clipboardStatus:'loading'})}
    navigator.clipboard.readText().then(text => {
      const keyword = String(text || '').trim();
      if(!keyword){
        if(!config.silent){setState({clipboardStatus:'idle'})}
        return;
      }
      if(shouldSkipRepeatedClipboardValue(keyword)){
        setState({clipboardStatus:'success'});
        return;
      }
      nodes.input.value = keyword;
      setState({
        keyword,
        source:'clipboard',
        clipboardStatus:'success',
        queryStatus:'idle',
        results:[],
        noticeVisible:false
      });
      runQuery('clipboard');
    }).catch(() => {
      if(!config.silent){setState({clipboardStatus:'denied',queryStatus:'idle',noticeVisible:false})}
    }).finally(() => {
      clipboardReadInFlight = false;
    });
  }
  function tryReadClipboardOnReturn(){
    if(document.visibilityState && document.visibilityState !== 'visible'){return}
    const now = Date.now();
    if(now - lastAutoReadAt < 600){return}
    lastAutoReadAt = now;
    tryReadClipboard({silent:true});
  }
  function initClipboardSmartSearch(selector){
    const root = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if(!root){return}
    state = Object.assign({}, initialState);
    renderShell(root);
    cacheNodes(root);
    bindEvents();
    render();
    tryReadClipboard();
    document.addEventListener('visibilitychange', () => {
      if(document.visibilityState === 'visible'){tryReadClipboardOnReturn()}
    });
    window.addEventListener('focus', tryReadClipboardOnReturn);
    window.addEventListener('pageshow', tryReadClipboardOnReturn);
  }
  window.initClipboardSmartSearch = initClipboardSmartSearch;
})();

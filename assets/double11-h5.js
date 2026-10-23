(function(){
  'use strict';
  const byId = id => document.getElementById(id);
  const value = id => byId(id).value.trim();
  const escape = input => String(input == null ? '' : input).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const readers = new Set();
  const openPanels = new Set();
  const triggers = new Map();
  let screenshot = null;
  let reading = false;
  let submitting = false;
  let scanning = false;
  let scanSequence = 0;
  let previousOverflow = '';
  let previousRootOverflow = '';
  let submittedFingerprint = '';
  let submitted = false;
  let currentView = 'participate';
  let scanTarget = 'entrySn';
  let querying = false;
  let querySequence = 0;
  const viewScroll = {participate:0,results:0,winner:0,nonwinner:0};
  const viewLabels = {participate:'参与活动',results:'中奖查询',winner:'中奖结果',nonwinner:'未中奖结果'};
  let winningPrize = '水杯';
  let winnerReturnView = 'results';
  let nonwinnerReturnView = 'results';
  const outcomeArtwork = {
    winner:{image:'winnerPoster',status:'winnerAssetStatus',fallback:'winnerPrizeFallback'},
    nonwinner:{image:'nonwinnerPoster',status:'nonwinnerAssetStatus',fallback:'nonwinnerImageFallback'}
  };
  // Explicit local fixtures mirror the admin demo outcomes; arbitrary SNs never receive invented prizes.
  const demoOutcomes = [
    '充电宝','充电宝','水杯','5元充值优惠券','5元充值优惠券',
    '未中奖','待开奖','结果待更新','5元充值优惠券','未中奖','水杯','充电宝'
  ];
  const resultRecords = new Map(demoOutcomes.map((outcome,index)=>['MBB-DEMO-'+String(index+1).padStart(4,'0'),outcome]));
  const prizeImages = {
    '充电宝':'assets/double11-registration-powerbank.png',
    '水杯':'assets/double11-registration-cups.png',
    '5元充值优惠券':'assets/double11-registration-coupon.png'
  };
  const winningPrizes = {
    '充电宝':{key:'powerbank',rank:'一等奖',name:'10000mAh充电宝',count:500,poster:'assets/double11-winner-powerbank.png'},
    '水杯':{key:'cup',rank:'二等奖',name:'儿童保温水杯',count:800,poster:'assets/double11-winner-cup.png'},
    '5元充值优惠券':{key:'coupon',rank:'三等奖',name:'5元充值优惠券',count:1500,poster:'assets/double11-winner-coupon.png'}
  };

  function setError(id,message){
    byId(id).setAttribute('aria-invalid',message ? 'true' : 'false');
    byId(id+'Error').textContent = message;
  }
  function setBusy(){
    ['entrySn','entryScreenshot','uploadButton','removeScreenshot','scanButton'].forEach(id => {byId(id).disabled = submitting || reading;});
    byId('submitButton').disabled = submitting || reading || submitted;
    byId('submitButton').setAttribute('aria-busy',String(submitting));
    byId('entryForm').setAttribute('aria-busy',String(submitting || reading));
    byId('submitButtonText').textContent = submitting ? '正在提交…' : submitted ? '已提交参与信息' : '提交并参与抽奖';
  }
  function markEdited(){
    if(submitted){submitted=false;byId('entryStatus').textContent='';setBusy();}
  }
  function clearError(field){setError(field.id,'');markEdited();}
  function renderScreenshot(){
    byId('uploadButton').hidden = Boolean(screenshot);
    byId('uploadedImage').hidden = !screenshot;
    if(screenshot){
      const image=document.createElement('img');
      Object.assign(image,{src:screenshot.src,alt:'已选择的充值截图',width:60,height:80});
      image.onerror=()=>{setError('entryScreenshot','图片预览失败，请移除后重新选择。');};
      byId('screenshotThumbnailHost').replaceChildren(image);
      byId('screenshotName').textContent = screenshot.name;
    }else{
      byId('screenshotThumbnailHost').replaceChildren();
      byId('screenshotName').textContent = '';
    }
  }
  async function selectScreenshot(input){
    if(reading || submitting){return}
    const files=Array.from(input.files || []);
    if(!files.length){return}
    if(files.length !== 1 || screenshot){setError('entryScreenshot','只能上传1张截图，如需更换请先移除已有图片。');input.value='';return}
    reading=true;
    setError('entryScreenshot','');
    byId('uploadStatus').textContent='正在读取图片…';
    setBusy();
    try{
      screenshot=await ActivityScreenshot.read(files[0],{readers,maxBytes:10*1024*1024,allowedTypes:['image/jpeg','image/png']});
      markEdited();
      renderScreenshot();
      byId('uploadStatus').textContent='';
    }catch(error){setError('entryScreenshot',error.message || '图片无法读取，请重新选择。');byId('uploadStatus').textContent='';}
    finally{reading=false;input.value='';setBusy();}
  }
  function removeScreenshot(){
    if(reading || submitting){return}
    screenshot=null;
    byId('entryScreenshot').value='';
    byId('uploadStatus').textContent='';
    setError('entryScreenshot','');
    markEdited();renderScreenshot();setBusy();
    byId('uploadButton').focus();
  }
  function openPanel(id){
    const panel=byId(id);
    if(panel.open){return}
    triggers.set(id,document.activeElement);
    if(!openPanels.size){previousOverflow=document.body.style.overflow;previousRootOverflow=document.documentElement.style.overflowY;}
    openPanels.add(id);
    document.body.style.overflow='hidden';document.documentElement.style.overflowY='hidden';
    panel.showModal();
  }
  function unlockPanel(id){
    openPanels.delete(id);
    if(!openPanels.size){document.body.style.overflow=previousOverflow;document.documentElement.style.overflowY=previousRootOverflow;}
    const trigger=triggers.get(id);triggers.delete(id);
    if(trigger && trigger.isConnected && !trigger.disabled){trigger.focus();}
  }
  function closePanel(id){
    const panel=byId(id);
    if(!panel.open){return}
    if(id==='scanDialog'){scanSequence++;}
    panel.close();
    if(openPanels.has(id)){unlockPanel(id);}
  }
  function openImage(){
    if(!screenshot){return}
    byId('imageError').textContent='';
    const image=document.createElement('img');
    Object.assign(image,{src:screenshot.src,alt:'充值截图',className:'preview-image'});
    image.onerror=()=>{byId('imageError').textContent='图片加载失败，请关闭后重新选择图片。';};
    byId('previewImageHost').replaceChildren(image);openPanel('imageDialog');
  }
  function showReceipt(payload){
    const fields=[['设备SN',payload.sn],['充值截图',payload.screenshot.name],['参与状态','待开奖']];
    byId('receiptSummary').innerHTML=fields.map(([label,text])=>'<dt>'+escape(label)+'</dt><dd>'+escape(text)+'</dd>').join('');
    openPanel('receiptDialog');
  }
  async function submit(event){
    event.preventDefault();
    if(submitting || reading){return}
    const sn=value('entrySn');
    const errors=[
      ['entrySn',!sn ? '请输入本次充值对应的设备SN。' : sn.length>100 ? '设备SN不能超过100个字符。' : ''],
      ['entryScreenshot',screenshot ? '' : '请上传1张充值截图。']
    ];
    errors.forEach(([id,message])=>setError(id,message));
    const invalid=errors.find(([,message])=>message);
    if(invalid){byId(invalid[0]==='entryScreenshot' ? 'uploadButton' : invalid[0]).focus();return}
    const payload={sn,screenshot:{...screenshot}};
    const fingerprint=JSON.stringify(payload);
    if(fingerprint===submittedFingerprint){submitted=true;setBusy();showReceipt(payload);return}
    submitting=true;setBusy();byId('entryStatus').textContent='正在提交参与信息，请稍候…';
    try{
      // Local prototype submission only. No real entry, random draw or prize issuance API is connected.
      await new Promise(resolve=>window.setTimeout(resolve,650));
      const submittedSn=payload.sn.toUpperCase();
      if(!resultRecords.has(submittedSn)){resultRecords.set(submittedSn,'待开奖');}
      submittedFingerprint=fingerprint;submitted=true;
      byId('entryStatus').textContent='参与信息已提交，开奖时间：11月12日12:00。';
      if(currentView==='participate'){showReceipt(payload);}
    }catch(error){byId('entryStatus').textContent='暂时无法提交，请保留当前信息后重试。';}
    finally{submitting=false;setBusy();}
  }
  function setQueryBusy(){
    byId('queryResultButton').disabled=querying;
    byId('queryResultButton').setAttribute('aria-busy',String(querying));
    byId('resultQueryForm').setAttribute('aria-busy',String(querying));
    byId('queryResultButtonText').textContent=querying ? '正在查询…' : '查询中奖结果';
  }
  function cancelResultQuery(){
    querySequence++;
    if(querying){byId('queryResult').hidden=true;}
    querying=false;setQueryBusy();
  }
  function editResultQuery(){
    cancelResultQuery();setError('resultSn','');
    byId('clearResultSn').hidden=!byId('resultSn').value;
    byId('queryResult').hidden=true;
  }
  function clearResultQuery(){
    byId('resultSn').value='';editResultQuery();byId('resultSn').focus();
  }
  function showQueryResult(state,title,message,sn,prize){
    const panel=byId('queryResult');
    panel.dataset.state=state;
    byId('queryResultTitle').textContent=title;
    byId('queryResultMessage').textContent=message;
    byId('queryResultDevice').textContent=sn ? '设备SN：'+sn : '';
    const image=byId('queryPrizeImage');
    image.hidden=!prize;
    if(prize){image.src=prizeImages[prize];image.alt=prize;image.onerror=()=>{image.hidden=true;};}
    panel.hidden=false;
  }
  async function queryResult(event){
    event?.preventDefault();
    if(querying || event?.isComposing){return}
    const sn=value('resultSn');
    setError('resultSn',!sn ? '请输入设备SN。' : sn.length>100 ? '设备SN不能超过100个字符。' : '');
    if(!sn || sn.length>100){byId('queryResult').hidden=true;byId('resultSn').focus();return}
    const request=++querySequence;
    querying=true;setQueryBusy();
    showQueryResult('loading','正在查询','正在查询本次活动的中奖结果，请稍候。',sn);
    try{
      await new Promise(resolve=>window.setTimeout(resolve,450));
      if(request!==querySequence){return}
      if(window.navigator?.onLine===false){throw new Error('offline');}
      const outcome=resultRecords.get(sn.toUpperCase());
      if(prizeImages[outcome]){
        showQueryResult('won','恭喜您中奖啦！','本次中奖奖品：'+outcome+'。请以平台订单核验结果为准。',sn,outcome);
        querying=false;setQueryBusy();
        winningPrize=outcome;viewScroll.winner=0;renderWinner();setView('winner');
      }else if(outcome==='未中奖'){
        showQueryResult('not-won','本次未中奖','感谢您参与双11福利活动。',sn);
        querying=false;setQueryBusy();viewScroll.nonwinner=0;setView('nonwinner');
      }else if(outcome==='待开奖'){
        showQueryResult('pending','待开奖','开奖时间：11月12日12:00，请在开奖后查询。',sn);
      }else if(outcome==='结果待更新'){
        showQueryResult('pending','中奖结果待更新','该设备的中奖结果暂未公布，请稍后重新查询。',sn);
      }else{
        showQueryResult('not-found','未找到参与记录','未找到该设备SN的参与记录，请核对后重新查询。',sn);
      }
    }catch(error){
      if(request===querySequence){showQueryResult('error','查询失败','暂时无法查询，请检查网络后点击“查询中奖结果”重试。',sn);}
    }finally{
      if(request===querySequence){querying=false;setQueryBusy();}
    }
  }
  function renderWinner(){
    const prize=winningPrizes[winningPrize];
    byId('winnerPanel').dataset.prize=prize.key;
    byId('winnerTitle').textContent='恭喜中奖！'+prize.rank+'，'+prize.name+'，共'+prize.count+'份。';
    byId('winnerMessageTitle').textContent='恭喜您获得'+prize.rank+'！';
    byId('winnerMessageText').textContent=prize.key==='coupon' ? '优惠券有效期半年，\n限半年/年套餐充值使用。' : '请耐心等待奖品发放，\n我们会尽快与您联系。';
    byId('winnerPrizeFallback').textContent=prize.rank+' · '+prize.name+' · 共'+prize.count+'份';
    const image=byId('winnerPoster');
    if(image.getAttribute('src')!==prize.poster){image.src=prize.poster;image.style.visibility='visible';byId('winnerAssetStatus').hidden=true;byId('winnerPrizeFallback').hidden=true;}
    checkOutcomeArtwork('winner');
  }
  function checkOutcomeArtwork(view){
    const image=byId(outcomeArtwork[view].image);
    if(image.complete){handleOutcomeArtwork(view,image.naturalWidth>0);}
  }
  function handleOutcomeArtwork(view,loaded){
    const fields=outcomeArtwork[view];
    byId(fields.image).style.visibility=loaded ? 'visible' : 'hidden';
    byId(fields.status).hidden=loaded;
    byId(fields.fallback).hidden=loaded;
  }
  function retryOutcomeArtwork(view){byId(outcomeArtwork[view].image).src=view==='winner' ? winningPrizes[winningPrize].poster : 'assets/double11-nonwinner.png';}
  function handleWinnerArtwork(loaded){handleOutcomeArtwork('winner',loaded);}
  function handleNonwinnerArtwork(loaded){handleOutcomeArtwork('nonwinner',loaded);}
  function retryWinnerArtwork(){retryOutcomeArtwork('winner');}
  function retryNonwinnerArtwork(){retryOutcomeArtwork('nonwinner');}
  function backFromWinner(){setView(winnerReturnView);}
  function backFromNonwinner(){setView(nonwinnerReturnView);}
  function setView(view){
    if(!Object.hasOwn(viewLabels,view) || view===currentView){return}
    viewScroll[currentView]=window.scrollY || 0;
    triggers.clear();
    Array.from(openPanels).reverse().forEach(closePanel);
    cancelResultQuery();
    if(view==='winner'){winnerReturnView=currentView;renderWinner();byId('winnerBackButton').setAttribute('aria-label','返回'+viewLabels[currentView]);}
    if(view==='nonwinner'){nonwinnerReturnView=currentView;checkOutcomeArtwork('nonwinner');byId('nonwinnerBackButton').setAttribute('aria-label','返回'+viewLabels[currentView]);}
    currentView=view;
    const isResults=view==='results';
    const isParticipation=view==='participate';
    byId('campaign').dataset.view=view;
    byId('campaignHero').hidden=view==='winner' || view==='nonwinner';
    byId('prizePanel').hidden=!isParticipation;
    byId('participate').hidden=!isParticipation;
    byId('resultsPanel').hidden=!isResults;
    byId('queryRulesHost').hidden=!isResults;
    byId('winnerPanel').hidden=view!=='winner';
    byId('nonwinnerPanel').hidden=view!=='nonwinner';
    byId(isResults ? 'queryRulesHost' : 'entryForm').appendChild(byId('activityRules'));
    document.title=view==='nonwinner' ? '双11福利 · 未中奖' : view==='winner' ? '双11福利 · 中奖' : isResults ? '双11福利 · 查询中奖结果' : '双11福利 · 充值下单免费抽奖';
    window.scrollTo({top:viewScroll[view],behavior:'instant'});
    if(window.parent && window.parent!==window){window.parent.postMessage({type:'double11:view-changed',view},'*');}
  }
  function openScanner(target='entrySn'){
    if(!['entrySn','resultSn'].includes(target) || (target==='entrySn' && (submitting || reading))){return}
    scanTarget=target;
    const supported=typeof window.BarcodeDetector==='function';
    byId('scanPhotoButton').hidden=!supported;
    byId('scanStatus').textContent=supported ? '请将条码完整、清晰地拍入画面。' : '当前浏览器暂不支持条码识别，请手动填写设备SN。';
    openPanel('scanDialog');
  }
  function enterSnManually(){closePanel('scanDialog');byId(scanTarget).focus();}
  function extractSn(raw){
    const text=String(raw || '').trim();
    if(/^https?:\/\//i.test(text)){
      try{
        const params=new URL(text).searchParams;
        for(const [key,value]of params){if(['sn','devicesn','device_sn'].includes(key.toLowerCase()) && value.trim()){return value.trim();}}
      }catch(error){return '';}
      return '';
    }
    return text.replace(/^(?:设备\s*)?SN\s*[:：=]\s*/i,'').trim();
  }
  async function scanPhoto(input){
    const file=input.files?.[0];
    if(!file || scanning || typeof window.BarcodeDetector!=='function'){return}
    if(!/^image\//.test(file.type) || file.size>10*1024*1024){byId('scanStatus').textContent='请选择不超过10MB的条码图片。';input.value='';return}
    const attempt=++scanSequence;
    scanning=true;byId('scanPhotoButton').disabled=true;byId('scanStatus').textContent='正在识别设备SN…';
    let bitmap;
    try{
      bitmap=await window.createImageBitmap(file);
      const results=await new window.BarcodeDetector().detect(bitmap);
      if(attempt!==scanSequence || !byId('scanDialog').open){return}
      const candidates=[...new Set(results.map(result=>extractSn(result.rawValue)).filter(sn=>sn && sn.length<=100))];
      if(candidates.length!==1){byId('scanStatus').textContent=candidates.length ? '图片包含多个条码，请只拍摄设备SN对应的条码，或手动填写。' : '未识别到设备SN，请重新拍摄条码，或手动填写。';return}
      byId(scanTarget).value=candidates[0];
      if(scanTarget==='resultSn'){editResultQuery();}else{clearError(byId('entrySn'));}
      closePanel('scanDialog');byId(scanTarget).focus();
    }catch(error){if(attempt===scanSequence && byId('scanDialog').open){byId('scanStatus').textContent='未能识别条码，请重新拍摄或手动填写设备SN。';}}
    finally{bitmap?.close();scanning=false;byId('scanPhotoButton').disabled=false;input.value='';}
  }
  document.querySelectorAll('dialog').forEach(panel=>{
    panel.addEventListener('cancel',event=>{event.preventDefault();closePanel(panel.id);});
    panel.addEventListener('close',()=>{if(!panel.open && openPanels.has(panel.id)){unlockPanel(panel.id);}});
  });
  window.addEventListener('beforeunload',event=>{
    if(!submitted && (value('entrySn') || screenshot)){event.preventDefault();event.returnValue='';}
  });
  function scrollToEntry(){
    if(window.location.hash==='#nonwinner'){setView('nonwinner');}
    else if(window.location.hash==='#winner'){setView('winner');}
    else if(window.location.hash==='#results'){setView('results');}
    else if(window.location.hash==='#participate'){setView('participate');byId('participate').scrollIntoView({behavior:'instant',block:'start'});}
  }
  window.addEventListener('message',event=>{
    if(event.source===window.parent && event.data?.type==='double11:view'){setView(event.data.view);}
  });
  window.Double11=Object.freeze({submit,clearError,selectScreenshot,removeScreenshot,openImage,closePanel,openScanner,scanPhoto,enterSnManually,queryResult,editResultQuery,clearResultQuery,setView,backFromWinner,handleWinnerArtwork,retryWinnerArtwork,backFromNonwinner,handleNonwinnerArtwork,retryNonwinnerArtwork});
  renderScreenshot();setBusy();scrollToEntry();
  window.addEventListener('hashchange',scrollToEntry);
  if(window.parent && window.parent!==window){window.parent.postMessage({type:'double11:ready'},'*');}
})();

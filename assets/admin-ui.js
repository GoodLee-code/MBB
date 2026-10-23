(function(){
  'use strict';
  // Shared behavior for authored admin overlays and opt-in keyboard selects.
  const stack=[];
  function openDialog(mask,initialFocus){
    if(!mask || stack.some(state=>state.mask===mask)){return}
    const parent=stack[stack.length-1];
    if(parent){parent.mask.querySelector('[role="dialog"],[role="alertdialog"]').setAttribute('aria-modal','false');}
    const state={mask,trigger:document.activeElement,inert:mask.inert,overflow:document.body.style.overflow,
      background:Array.from(document.body.children).filter(node=>node!==mask && !['SCRIPT','STYLE','LINK'].includes(node.tagName)).map(node=>({node,inert:node.inert}))};
    stack.push(state);
    state.background.forEach(({node})=>{node.inert=true;});
    mask.inert=false;mask.style.display='flex';document.body.style.overflow='hidden';
    mask.querySelector('[role="dialog"],[role="alertdialog"]').setAttribute('aria-modal','true');
    (initialFocus || mask.querySelector('button')).focus();
  }
  function closeDialog(mask,fallback,restoreFocus=true){
    const state=stack[stack.length-1];
    if(!state || state.mask!==mask){return}
    stack.pop();mask.style.display='none';mask.inert=state.inert;
    document.body.style.overflow=state.overflow;
    state.background.forEach(({node,inert})=>{if(node.isConnected){node.inert=inert;}});
    const parent=stack[stack.length-1];
    if(parent){parent.mask.querySelector('[role="dialog"],[role="alertdialog"]').setAttribute('aria-modal','true');}
    const target=state.trigger?.isConnected && !state.trigger.disabled ? state.trigger : fallback;
    if(restoreFocus && target){target.focus();}
  }
  function dialogKeydown(event,close){
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();return}
    if(event.key!=='Tab'){return}
    const targets=Array.from(event.currentTarget.querySelectorAll('button:not(:disabled),input:not(:disabled):not([type="hidden"]),textarea:not(:disabled),[tabindex="0"]')).filter(node=>node.getClientRects().length);
    if(!targets.length){event.preventDefault();event.currentTarget.focus();return}
    const first=targets[0],last=targets[targets.length-1];
    if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
  }
  function enhanceSelect(select){
    if(select.dataset.keyboardReady){return}
    select.dataset.keyboardReady='true';
    const popup=select.querySelector('.dropdown-menu');
    const options=Array.from(popup.querySelectorAll('.dropdown-option'));
    popup.id=select.id+'Options';popup.setAttribute('role','listbox');
    select.tabIndex=0;select.setAttribute('role','combobox');select.setAttribute('aria-haspopup','listbox');select.setAttribute('aria-controls',popup.id);
    options.forEach((option,index)=>{option.id=select.id+'Option'+index;option.setAttribute('role','option');});
    let active=-1;
    function sync(){
      const open=select.classList.contains('open');
      select.setAttribute('aria-expanded',String(open));
      if(open && active<0){active=Math.max(0,options.findIndex(option=>option.dataset.value===select.dataset.value));}
      if(!open){active=-1;select.removeAttribute('aria-activedescendant');}
      options.forEach((option,index)=>{
        option.setAttribute('aria-selected',String(option.dataset.value===select.dataset.value));
        option.classList.toggle('keyboard-active',open && index===active);
      });
      if(open && active>=0){select.setAttribute('aria-activedescendant',options[active].id);options[active].scrollIntoView({block:'nearest'});}
    }
    function open(){
      closeDropdowns(select);closeDatePickers();closeInputCombos();
      select.classList.add('open');
      active=Math.max(0,options.findIndex(option=>option.dataset.value===select.dataset.value));
    }
    select.addEventListener('keydown',event=>{
      if(event.isComposing){return}
      const expanded=select.classList.contains('open');
      if(event.key==='Tab'){select.classList.remove('open');sync();return}
      if(event.key==='Escape'){
        if(expanded){event.preventDefault();event.stopPropagation();select.classList.remove('open');sync();}
        return;
      }
      if(['ArrowDown','ArrowUp','Home','End','Enter',' '].includes(event.key)){
        event.preventDefault();event.stopPropagation();
        if(!expanded){open();}
        else if(event.key==='Enter' || event.key===' '){
          const option=options[active<0 ? 0 : active];
          if(option){setCustomSelectValue(select,option.dataset.value,option.textContent.trim(),true);}
          select.classList.remove('open');
        }else if(event.key==='Home'){active=0;}
        else if(event.key==='End'){active=options.length-1;}
        else{active=(active+(event.key==='ArrowDown' ? 1 : -1)+options.length)%options.length;}
        sync();return;
      }
      if(['Backspace','Delete'].includes(event.key) && !select.classList.contains('no-clear')){
        event.preventDefault();clearCustomSelect(select);sync();return;
      }
      if(event.key.length===1 && !event.ctrlKey && !event.metaKey && !event.altKey && !event.isComposing){
        const found=options.findIndex(option=>option.textContent.trim().startsWith(event.key));
        if(found>=0){event.preventDefault();open();active=found;sync();}
      }
    });
    new MutationObserver(sync).observe(select,{attributes:true,attributeFilter:['class','data-value']});
    sync();
  }
  window.AdminUI=Object.freeze({openDialog,closeDialog,dialogKeydown,enhanceSelect});
})();

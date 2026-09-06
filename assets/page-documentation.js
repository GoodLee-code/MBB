(function(){
  const state = {pageKey:'',open:false,highlightTimer:null};
  let trigger;
  let panel;
  let body;

  function escapeHtml(value){
    return String(value == null ? '' : value)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }

  function isPending(value){
    return String(value || '').indexOf('待补充') !== -1;
  }

  function renderText(value){
    const className = isPending(value) ? ' page-doc-pending' : '';
    return `<span class="${className.trim()}">${escapeHtml(value || '待补充')}</span>`;
  }

  function getDocumentation(){
    return window.pageDocumentation || {};
  }

  function getPageConfig(pageKey){
    const documentation = getDocumentation();
    return documentation[pageKey] || null;
  }

  function getFieldTarget(field){
    const selectors = Array.isArray(field.selectors) ? field.selectors : [field.selectors];
    let fallback = null;
    for(const selector of selectors){
      if(!selector){continue}
      try{
        const nodes = Array.from(document.querySelectorAll(selector));
        if(!fallback && nodes[0]){fallback = nodes[0]}
        const visible = nodes.find(node => node.offsetParent !== null && !node.closest('.page-doc-panel'));
        if(visible){return visible}
      }catch(error){
        continue;
      }
    }
    return fallback;
  }

  function bindPageFields(pageKey){
    const config = getPageConfig(pageKey);
    if(!config){return}
    (config.fields || []).forEach(field => {
      const selectors = Array.isArray(field.selectors) ? field.selectors : [field.selectors];
      selectors.forEach(selector => {
        if(!selector){return}
        try{
          document.querySelectorAll(selector).forEach(node => node.setAttribute('data-doc-field',field.id));
        }catch(error){
          return;
        }
      });
    });
  }

  function renderList(items,emptyText){
    if(!items || !items.length){return `<div class="page-doc-empty">${escapeHtml(emptyText || '待补充')}</div>`}
    return `<ul class="page-doc-list">${items.map(item => `<li class="${isPending(item) ? 'page-doc-pending' : ''}">${escapeHtml(item)}</li>`).join('')}</ul>`;
  }

  function renderFields(fields){
    if(!fields || !fields.length){return '<div class="page-doc-empty">字段说明待补充</div>'}
    return `<div class="page-doc-field-list">${fields.map(field => {
      const target = getFieldTarget(field);
      return `<button type="button" class="page-doc-field${target ? '' : ' page-doc-field-missing'}" data-doc-target="${escapeHtml(field.id)}"${target ? '' : ' title="当前页面暂未定位到该字段"'}><span class="page-doc-field-name">${escapeHtml(field.name)}</span><span class="page-doc-field-desc${isPending(field.description) ? ' page-doc-pending' : ''}">${escapeHtml(field.description || '待补充')}</span></button>`;
    }).join('')}</div>`;
  }

  function renderMetaRow(label,value){
    if(!value){return ''}
    return `<span class="page-doc-meta-label">${escapeHtml(label)}</span><span class="page-doc-meta-value">${renderText(value)}</span>`;
  }

  function renderChapters(chapters){
    return chapters.map(chapter => `
      <section class="page-doc-chapter">
        <h3 class="page-doc-chapter-title">${escapeHtml(chapter.title || '')}</h3>
        <ol class="page-doc-numbered-list">
          ${(chapter.items || []).map(item => `
            <li>
              <span class="page-doc-numbered-title">${escapeHtml(item.title || '')}：</span>
              <span class="page-doc-numbered-desc">${escapeHtml(item.description || '')}</span>
            </li>
          `).join('')}
        </ol>
      </section>
    `).join('');
  }

  function renderSupportingSections(config){
    const sections = [
      {title:'功能逻辑',items:config.functions,emptyText:'功能逻辑待补充'},
      {title:'业务规则',items:config.businessRules,emptyText:'业务规则待补充'},
      {title:'交互说明',items:config.interactions,emptyText:'交互说明待补充'}
    ];
    return sections
      .filter(section => Array.isArray(section.items) && section.items.length)
      .map(section => `
        <section class="page-doc-section">
          <h3 class="page-doc-section-title">${escapeHtml(section.title)}</h3>
          ${renderList(section.items,section.emptyText)}
        </section>
      `).join('');
  }

  function render(){
    if(!body){return}
    const config = getPageConfig(state.pageKey);
    if(!config){
      body.innerHTML = '';
      return;
    }
    if(Array.isArray(config.chapters) && config.chapters.length){
      body.innerHTML = renderChapters(config.chapters) + renderSupportingSections(config);
      return;
    }
    const info = config.page || {};
    const titleHtml = info.title ? `<div class="page-doc-main-title">${escapeHtml(info.title)}</div>` : '';
    const fieldSection = config.hideFields ? '' : `
      <section class="page-doc-section">
        <h3 class="page-doc-section-title">字段说明</h3>
        ${renderFields(config.fields)}
      </section>`;
    const businessSection = config.hideBusinessRules ? '' : `
      <section class="page-doc-section">
        <h3 class="page-doc-section-title">业务规则</h3>
        ${renderList(config.businessRules,'业务规则待补充')}
      </section>`;
    body.innerHTML = `
      ${titleHtml}
      <section class="page-doc-section">
        <h3 class="page-doc-section-title">${escapeHtml(info.sectionTitle || '页面说明')}</h3>
        <p class="page-doc-copy">${escapeHtml(info.purpose || '待补充')}</p>
        <div class="page-doc-meta">
          ${renderMetaRow('前置条件',info.prerequisites)}
          ${renderMetaRow('异常与限制',info.limitations)}
        </div>
      </section>
      ${fieldSection}
      <section class="page-doc-section">
        <h3 class="page-doc-section-title">功能逻辑</h3>
        ${renderList(config.functions,'功能逻辑待补充')}
      </section>
      ${businessSection}
      <section class="page-doc-section">
        <h3 class="page-doc-section-title">交互说明</h3>
        ${renderList(config.interactions,'交互说明待补充')}
      </section>`;
  }

  function open(){
    if(!getPageConfig(state.pageKey)){return}
    state.open = true;
    document.body.classList.add('page-doc-open');
    panel.classList.add('open');
    panel.setAttribute('aria-hidden','false');
    trigger.setAttribute('aria-expanded','true');
  }

  function close(){
    state.open = false;
    document.body.classList.remove('page-doc-open');
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden','true');
    trigger.setAttribute('aria-expanded','false');
    trigger.focus({preventScroll:true});
  }

  function focusField(fieldId){
    const config = getPageConfig(state.pageKey);
    const field = config && (config.fields || []).find(item => item.id === fieldId);
    if(!field){return}
    bindPageFields(state.pageKey);
    const target = getFieldTarget(field);
    if(!target){return}
    const highlightTarget = target.closest('.input-combo,.range-control,.condition-control,.device-date-range,.custom-select') || target;
    if(state.highlightTimer){window.clearTimeout(state.highlightTimer)}
    document.querySelectorAll('.page-doc-field-highlight').forEach(node => node.classList.remove('page-doc-field-highlight'));
    highlightTarget.classList.add('page-doc-field-highlight');
    target.scrollIntoView({behavior:'smooth',block:'center',inline:'center'});
    state.highlightTimer = window.setTimeout(() => highlightTarget.classList.remove('page-doc-field-highlight'),2000);
  }

  function setPage(pageKey){
    state.pageKey = pageKey;
    const available = Boolean(getPageConfig(pageKey));
    if(!available && state.open){close()}
    if(trigger){trigger.hidden = !available}
    window.setTimeout(() => {
      bindPageFields(pageKey);
      render();
      if(body){body.scrollTop = 0}
    },0);
  }

  function init(){
    const layout = document.querySelector('.layout');
    if(!layout || document.getElementById('pageDocumentationPanel')){return}
    trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'page-doc-trigger';
    trigger.id = 'pageDocumentationTrigger';
    trigger.textContent = '页面说明';
    trigger.setAttribute('aria-controls','pageDocumentationPanel');
    trigger.setAttribute('aria-expanded','false');
    trigger.hidden = true;
    trigger.addEventListener('click',open);

    panel = document.createElement('aside');
    panel.className = 'page-doc-panel';
    panel.id = 'pageDocumentationPanel';
    panel.setAttribute('aria-hidden','true');
    panel.innerHTML = '<div class="page-doc-panel-inner"><header class="page-doc-header"><div class="page-doc-title">页面说明</div><button type="button" class="page-doc-close" aria-label="关闭页面说明"></button></header><div class="page-doc-body"></div></div>';
    body = panel.querySelector('.page-doc-body');
    panel.querySelector('.page-doc-close').addEventListener('click',close);
    body.addEventListener('click',event => {
      const button = event.target.closest('[data-doc-target]');
      if(button && !button.classList.contains('page-doc-field-missing')){focusField(button.dataset.docTarget)}
    });
    document.addEventListener('keydown',event => {
      if(event.key === 'Escape' && state.open){close()}
    });
    document.body.appendChild(trigger);
    layout.appendChild(panel);
  }

  window.PageDocumentation = {init,setPage,open,close,refresh:render};
  init();
})();

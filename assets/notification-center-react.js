(function(){
  'use strict';

  if(!window.React || !window.ReactDOM || !window.antd || !window.dayjs){return}

  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const antd = window.antd;
  const dayjs = window.dayjs;
  const h = React.createElement;
  const Fragment = React.Fragment;
  const {
    Alert,
    Button,
    Card,
    Checkbox,
    ConfigProvider,
    Divider,
    Form,
    Input,
    List,
    Modal,
    Radio,
    Select,
    Space,
    Switch,
    Table,
    Tag,
    TimePicker,
    Typography,
    message
  } = antd;

  let mountedRoot = null;
  const currentProjectTheme = {
    token:{
      colorPrimary:'#1687e8',
      colorInfo:'#1687e8',
      colorText:'#4d5664',
      colorTextSecondary:'#8b95a5',
      colorTextPlaceholder:'#b8c0cc',
      colorBorder:'#e5e7eb',
      colorBgContainer:'#fff',
      colorBgLayout:'#fff',
      borderRadius:3,
      borderRadiusSM:3,
      controlHeight:32,
      fontSize:12,
      fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",Arial,sans-serif'
    },
    components:{
      Button:{primaryShadow:'none',defaultShadow:'none',borderRadius:3,controlHeight:32,paddingInline:18},
      Card:{borderRadiusLG:0,boxShadowTertiary:'none'},
      Input:{activeBorderColor:'#1687e8',hoverBorderColor:'#c6ceda',borderRadius:3},
      Select:{activeBorderColor:'#1687e8',hoverBorderColor:'#c6ceda',borderRadius:3},
      Table:{headerBg:'#fbfcfe',headerColor:'#4d5664',borderColor:'#e6ebf2',cellPaddingBlockSM:10,cellPaddingInlineSM:12},
      Form:{labelColor:'#4d5664',labelFontSize:13}
    }
  };

  function dataConfigs(){
    return typeof notificationConfigs !== 'undefined' ? notificationConfigs : [];
  }
  function dataEvents(){
    return typeof notificationEvents !== 'undefined' ? notificationEvents : [];
  }
  function dataPeople(){
    return typeof notificationPeople !== 'undefined' ? notificationPeople : [];
  }
  function currentEditorItem(){
    if(typeof notificationEditorMode === 'undefined' || notificationEditorMode === 'add'){return null}
    return dataConfigs()[notificationEditingIndex] || null;
  }
  function eventByName(name){
    return dataEvents().find(item => item.name === name) || null;
  }
  function formatTime(value){
    return value ? dayjs(value,'HH:mm') : null;
  }
  function selectedPeopleByIds(ids){
    return dataPeople().filter(person => ids.includes(person.id));
  }
  function recipientLabel(item){
    const labels = [];
    if(item.recipients && item.recipients.initiator){labels.push('任务发起人')}
    selectedPeopleByIds(item.recipients && item.recipients.people || []).forEach(person => labels.push(person.name));
    return labels.join('、') || '未配置';
  }
  function methodTags(methods){
    return h(Space,{size:[4,4],wrap:true},(methods || []).map(method => h(Tag,{key:method},method)));
  }
  function configPageStyle(){
    return {width:'100%',maxWidth:'none',margin:0};
  }
  function editorFormLayout(){
    return {labelCol:{flex:'128px'},wrapperCol:{flex:1}};
  }
  function statusText(status){
    return status === '启用' ? '是' : '否';
  }

  function NotificationConfigList(){
    const [,setVersion] = React.useState(0);
    const [eventFilter,setEventFilter] = React.useState('');
    const [statusFilter,setStatusFilter] = React.useState('');
    const [appliedFilters,setAppliedFilters] = React.useState({event:'',status:''});
    const configs = dataConfigs();
    const filteredConfigs = configs.filter(item => (!appliedFilters.event || item.event === appliedFilters.event) && (!appliedFilters.status || item.status === appliedFilters.status));
    const columns = [
      {title:'通知事件',dataIndex:'event',key:'event',width:190,align:'center'},
      {title:'通知对象',key:'recipients',width:180,align:'center',render:(_,item) => recipientLabel(item)},
      {title:'通知方式',key:'channels',width:210,align:'center',render:(_,item) => methodTags(item.channels)},
      {title:'是否启用',key:'status',width:110,align:'center',render:(_,item) => h(Switch,{checked:item.status === '启用',onChange:checked => {
        item.status = checked ? '启用' : '停用';
        item.updatedAt = '2026-09-15 10:30:00';
        item.updatedBy = '当前用户';
        setVersion(value => value + 1);
      }})},
      {title:'更新时间',dataIndex:'updatedAt',key:'updatedAt',width:180,align:'center'},
      {title:'更新人',dataIndex:'updatedBy',key:'updatedBy',width:110,align:'center'},
      {title:'操作',key:'action',fixed:'right',width:130,align:'center',render:(_,item,index) => h(Space,{size:4},[
        h(Button,{key:'view',type:'link',size:'small',onClick:() => window.openNotificationConfigEditor('view',index)},'查看'),
        h(Button,{key:'edit',type:'link',size:'small',onClick:() => window.openNotificationConfigEditor('edit',index)},'编辑')
      ])}
    ];
    return h(ConfigProvider,{theme:currentProjectTheme},
          h('div',{className:'notification-react-page',style:configPageStyle()},
        h(Space,{direction:'vertical',size:16,style:{display:'flex',width:'100%'}},[
          h('div',{key:'filters',style:{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:12,padding:'14px 0 12px',marginBottom:0,width:'100%',background:'#fff'}},[
            h(Select,{key:'eventFilter',value:eventFilter || undefined,allowClear:true,showSearch:true,optionFilterProp:'label',placeholder:'通知事件',options:dataEvents().map(item => ({value:item.name,label:item.name})),style:{width:'100%'},onChange:value => setEventFilter(value || '')}),
            h(Select,{key:'statusFilter',value:statusFilter || undefined,allowClear:true,placeholder:'是否启用',options:[{value:'启用',label:'开启'},{value:'停用',label:'停用'}],style:{width:'100%'},onChange:value => setStatusFilter(value || '')}),
            h('div',{key:'filterActions',className:'filter-actions',style:{display:'flex',alignItems:'center',gap:8}},[
              h(Button,{key:'search',className:'btn line',onClick:() => setAppliedFilters({event:eventFilter,status:statusFilter})},'搜索'),
              h(Button,{key:'reset',className:'btn gray',onClick:() => {setEventFilter('');setStatusFilter('');setAppliedFilters({event:'',status:''})}},'重置')
            ])
          ]),
          h('div',{key:'actions',style:{display:'flex',alignItems:'center',gap:8}},h(Button,{type:'primary',onClick:() => window.openNotificationConfigEditor('add')},'通知配置新增')),
          h(Card,{key:'table',styles:{body:{padding:0}},style:{borderRadius:0}},
            h(Table,{rowKey:'id',columns,dataSource:filteredConfigs,pagination:false,scroll:{x:1040},size:'middle'})
          ),
          h('div',{key:'pagination',className:'pagination',style:{width:'100%'}},[
            `共${filteredConfigs.length}条`,
            h('span',{key:'size',className:'pagebtn'},'20条/页'),
            h('span',{key:'current',className:'pagebtn active'},'1'),
            '前往',
            h('span',{key:'total',className:'pagebtn'},'1'),
            '页'
          ])
        ])
      )
    );
  }

  function AccountPickerModal({open,selectedIds,onCancel,onConfirm}){
    const [merchant,setMerchant] = React.useState('');
    const [keyword,setKeyword] = React.useState('');
    const [tempIds,setTempIds] = React.useState(selectedIds);
    React.useEffect(() => {if(open){setMerchant('');setKeyword('');setTempIds(selectedIds)}},[open,selectedIds]);
    const people = dataPeople().filter(person => {
      const merchantMatch = !merchant || person.merchant.includes(merchant);
      const keywordMatch = !keyword || [person.account,person.phone,person.name,person.wechatUserId || person.wechat || ''].some(value => value.includes(keyword));
      return merchantMatch && keywordMatch;
    });
    const columns = [
      {title:'账号',dataIndex:'account',key:'account',align:'center'},
      {title:'手机号',dataIndex:'phone',key:'phone',align:'center',render:value => value || '--'},
      {title:'邮箱',dataIndex:'email',key:'email',align:'center',render:value => value || '--'},
      {title:'企业微信userid',key:'wechatUserId',align:'center',render:(_,person) => person.wechatUserId || person.wechat || '--'},
      {title:'姓名',dataIndex:'name',key:'name',align:'center'},
      {title:'角色',dataIndex:'role',key:'role',align:'center'},
      {title:'所属商户',dataIndex:'merchant',key:'merchant',align:'center'}
    ];
    const rowSelection = {selectedRowKeys:tempIds,onChange:keys => setTempIds(keys),preserveSelectedRowKeys:true};
    return h(Modal,{open,title:'选择通知对象',width:900,destroyOnClose:true,onCancel,onOk:() => onConfirm(tempIds),okText:'确认选择',cancelText:'取消'},
      h(Space,{direction:'vertical',size:12,style:{width:'100%'}},[
        h(Space,{key:'filters',wrap:true},[
          h(Input,{key:'merchant',placeholder:'商户名称',value:merchant,onChange:event => setMerchant(event.target.value),style:{width:220}}),
          h(Input,{key:'keyword',placeholder:'账号/手机号/姓名/企业微信userid',value:keyword,onChange:event => setKeyword(event.target.value),style:{width:240}}),
          h(Button,{key:'reset',onClick:() => {setMerchant('');setKeyword('')}},'重置')
        ]),
        h(Table,{key:'table',rowKey:'id',rowSelection,columns,dataSource:people,pagination:false,size:'small',scroll:{y:360}})
      ])
    );
  }

  function ChannelCard({channel,title,children}){
    return h(Card,{type:'inner',size:'small',title,styles:{body:{padding:16}},style:{marginTop:12,borderRadius:0,boxShadow:'none'}},children);
  }

  function NotificationConfigEditor(){
    const item = currentEditorItem();
    const viewOnly = typeof notificationEditorMode !== 'undefined' && notificationEditorMode === 'view';
    const initial = item || {};
    const [form] = Form.useForm();
    const [eventName,setEventName] = React.useState(initial.event || '');
    const [initiator,setInitiator] = React.useState(item ? Boolean(initial.recipients && initial.recipients.initiator) : true);
    const [targetEnabled,setTargetEnabled] = React.useState(Boolean(initial.recipients && initial.recipients.people && initial.recipients.people.length));
    const [selectedIds,setSelectedIds] = React.useState((initial.recipients && initial.recipients.people || []).slice());
    const [accountModalOpen,setAccountModalOpen] = React.useState(false);
    const [scheduleMode,setScheduleMode] = React.useState(initial.notificationTime && initial.notificationTime.mode || 'instant');
    const [uniformTime,setUniformTime] = React.useState(initial.notificationTime && initial.notificationTime.uniformTime || '');
    const [individualTimes,setIndividualTimes] = React.useState(initial.notificationTime && initial.notificationTime.individualTimes || {});
    const notificationChannelOptions = ['站内通知','短信','邮件','企业微信'];
    const initialMethods = initial.notificationMethods || {};
    const [methodMode,setMethodMode] = React.useState(initialMethods.mode || 'uniform');
    const [channels,setChannels] = React.useState((initialMethods.uniform || initial.channels || []).slice());
    const [individualMethods,setIndividualMethods] = React.useState(Object.assign({},initialMethods.individual || {}));
    const [methodError,setMethodError] = React.useState('');
    const templates = initial.templates || {};
    const [stationTitle,setStationTitle] = React.useState(templates.station && templates.station.title || '');
    const [stationBody,setStationBody] = React.useState(templates.station && templates.station.body || '');
    const [emailTitle,setEmailTitle] = React.useState(templates.email && templates.email.title || '');
    const [emailBody,setEmailBody] = React.useState(templates.email && templates.email.body || '');
    const [wechatTitle,setWechatTitle] = React.useState(templates.wechat && templates.wechat.title || '');
    const [wechatBody,setWechatBody] = React.useState(templates.wechat && templates.wechat.body || '');
    const [smsTemplateId,setSmsTemplateId] = React.useState(templates.sms && templates.sms.templateId || '');
    const [smsMappings,setSmsMappings] = React.useState(templates.sms && templates.sms.mappings || {});
    const event = eventByName(eventName);
    const people = selectedPeopleByIds(selectedIds);
    const recipientItems = [];
    if(initiator){recipientItems.push({id:'initiator',label:'任务发起人'})}
    people.forEach(person => recipientItems.push({id:person.id,label:person.name + '（' + person.account + '）'}));
    const objectValues = [];
    if(initiator){objectValues.push('initiator')}
    if(targetEnabled){objectValues.push('target')}
    const initiatorRow = {id:'initiator',name:'任务发起人',account:'任务发起人账号',phone:'--',email:'--',role:'任务发起人',merchant:'--',isInitiator:true};
    const showIndividualRecipientRows = methodMode === 'individual' || scheduleMode === 'individual';
    const targetTableRows = showIndividualRecipientRows && initiator ? [initiatorRow].concat(people) : people;
    const effectiveChannels = methodMode === 'uniform' ? channels : Array.from(new Set(recipientItems.flatMap(recipient => individualMethods[recipient.id] || [])));
    const missingContact = [];
    if(effectiveChannels.includes('短信')){people.filter(person => !person.phone).forEach(person => missingContact.push(person.name + '未配置手机号'))}
    if(effectiveChannels.includes('邮件')){people.filter(person => !person.email).forEach(person => missingContact.push(person.name + '未配置邮箱'))}
    if(effectiveChannels.includes('企业微信')){people.filter(person => !person.wechat).forEach(person => missingContact.push(person.name + '未配置企业微信账号'))}
    const updateIndividualTime = (id,value) => setIndividualTimes(current => ({...current,[id]:value ? value.format('HH:mm') : ''}));
    const updateIndividualMethods = (id,values) => setIndividualMethods(current => ({...current,[id]:values}));
    const smsTemplates = [
      {value:'SMS_100021',label:'任务执行结果通知（SMS_100021）',body:'您的{1}任务已执行完成，成功{2}条，失败{3}条。',variables:['{1}','{2}','{3}']},
      {value:'SMS_100033',label:'退款处理结果通知（SMS_100033）',body:'您的退款处理结果：成功{1}笔，失败{2}笔。',variables:['{1}','{2}']}
    ];
    const smsTemplate = smsTemplates.find(template => template.value === smsTemplateId);
    const fieldsForValidation = [];
    fieldsForValidation.push(['站内通知标题',stationTitle],['站内通知正文',stationBody],['邮件标题',emailTitle],['邮件正文',emailBody],['企业微信消息标题',wechatTitle],['企业微信消息正文',wechatBody]);
    const missingContentChannels = effectiveChannels.filter(channel => {
      if(channel === '短信'){return !smsTemplateId}
      if(channel === '站内通知'){return !stationTitle.trim() || !stationBody.trim()}
      if(channel === '邮件'){return !emailTitle.trim() || !emailBody.trim()}
      if(channel === '企业微信'){return !wechatTitle.trim() || !wechatBody.trim()}
      return false;
    });
    function save(){
      form.validateFields().then(() => {
        if(!initiator && !selectedIds.length){message.error('至少选择一种通知对象');return}
        if(!effectiveChannels.length){message.error('至少选择一种通知方式');return}
        if(missingContentChannels.length){setMethodError(`未配置${missingContentChannels.map(channel => channel + '通知内容').join('、')}`);return}
        setMethodError('');
        const usedVariables = fieldsForValidation.flatMap(field => Array.from(field[1].matchAll(/\{([^}]+)\}/g)).map(match => match[1]));
        const unsupported = usedVariables.find(variable => !event || !event.variables.includes(variable));
        if(unsupported){message.error(`通知内容包含当前通知事件不支持的变量：${unsupported}`);return}
        const business = event ? event.business : '';
        const updated = {
          id:item ? item.id : `NC${Date.now()}`,
          name:item ? item.name : `${eventName}通知配置`,
          business,
          event:eventName,
          recipients:{initiator,people:selectedIds.slice()},
          notificationTime:{mode:scheduleMode,uniformTime,individualTimes:{...individualTimes}},
          notificationMethods:{mode:methodMode,uniform:channels.slice(),individual:Object.assign({},individualMethods)},
          channels:effectiveChannels.slice(),
          status:item ? item.status : '启用',
          updatedAt:'2026-09-15 10:30:00',
          updatedBy:'当前用户',
          templates:{station:{title:stationTitle,body:stationBody},sms:{templateId:smsTemplateId,templateName:smsTemplate ? smsTemplate.label : '',mappings:{...smsMappings}},email:{title:emailTitle,body:emailBody},wechat:{title:wechatTitle,body:wechatBody}}
        };
        const configs = dataConfigs();
        if(item){configs[notificationEditingIndex] = updated}else{configs.unshift(updated)}
        message.success('通知配置已保存');
        window.backNotificationConfigList();
      }).catch(() => {});
    }
    const channelCards = [
      h(ChannelCard,{key:'station',channel:'station',title:'站内通知'},h(Fragment,null,
        h(Form.Item,{label:'通知标题'},h(Input,{value:stationTitle,disabled:viewOnly,placeholder:'请输入通知标题',onChange:event => {setStationTitle(event.target.value);setMethodError('')}})),
        h(Form.Item,{label:'通知正文'},h(Input.TextArea,{value:stationBody,disabled:viewOnly,placeholder:'请输入通知正文',autoSize:{minRows:4,maxRows:8},onChange:event => {setStationBody(event.target.value);setMethodError('')}}))
      )),
      h(ChannelCard,{key:'sms',channel:'sms',title:'短信'},h(Fragment,null,
        h(Form.Item,{label:'短信模板'},h(Select,{value:smsTemplateId || undefined,disabled:viewOnly,placeholder:'请选择已审核通过的腾讯云短信模板',options:smsTemplates.map(template => ({value:template.value,label:template.label})),onChange:value => {setSmsTemplateId(value);setMethodError('')}}))
      )),
      h(ChannelCard,{key:'email',channel:'email',title:'邮件'},h(Fragment,null,
        h(Form.Item,{label:'邮件标题'},h(Input,{value:emailTitle,disabled:viewOnly,placeholder:'请输入邮件标题',onChange:event => {setEmailTitle(event.target.value);setMethodError('')}})),
        h(Form.Item,{label:'邮件正文'},h(Input.TextArea,{value:emailBody,disabled:viewOnly,placeholder:'请输入邮件正文',autoSize:{minRows:4,maxRows:8},onChange:event => {setEmailBody(event.target.value);setMethodError('')}}))
      )),
      h(ChannelCard,{key:'wechat',channel:'wechat',title:'企业微信'},h(Fragment,null,
        h(Form.Item,{label:'消息标题'},h(Input,{value:wechatTitle,disabled:viewOnly,placeholder:'请输入消息标题',onChange:event => {setWechatTitle(event.target.value);setMethodError('')}})),
        h(Form.Item,{label:'消息正文'},h(Input.TextArea,{value:wechatBody,disabled:viewOnly,placeholder:'请输入消息正文',autoSize:{minRows:4,maxRows:8},onChange:event => {setWechatBody(event.target.value);setMethodError('')}}))
      ))
    ];
    const targetColumns = [
      {title:'姓名',dataIndex:'name',key:'name',width:110,render:value => h('span',{className:'notification-target-name'},value)},
      {title:'账号',dataIndex:'account',key:'account',width:130},
      {title:'手机号',dataIndex:'phone',key:'phone',width:140,render:value => value || '--'},
      {title:'邮箱',dataIndex:'email',key:'email',width:190,render:value => value || '--'},
      {title:'企业微信userid',key:'wechatUserId',width:160,render:(_,person) => person.wechatUserId || person.wechat || '--'},
      {title:'角色',dataIndex:'role',key:'role',width:120},
      {title:'所属商户',dataIndex:'merchant',key:'merchant',width:170}
    ];
    if(scheduleMode === 'individual'){
      targetColumns.push({title:'通知时间',key:'notificationTime',width:150,render:(_,person) => h(TimePicker,{value:formatTime(individualTimes[person.id]),disabled:viewOnly,format:'HH:mm',minuteStep:1,placeholder:'请选择时间',onChange:value => updateIndividualTime(person.id,value)})});
    }
    if(methodMode === 'individual'){
      targetColumns.push({title:'通知方式',key:'notificationMethods',width:280,render:(_,person) => h(Checkbox.Group,{options:notificationChannelOptions.map(channel => ({label:channel,value:channel})),value:individualMethods[person.id] || [],disabled:viewOnly,onChange:values => updateIndividualMethods(person.id,values),className:'notification-target-channel-group'})});
    }
    if(!viewOnly){
      targetColumns.push({title:'操作',key:'action',width:80,align:'center',render:(_,person) => person.isInitiator ? null : h(Button,{type:'link',danger:true,size:'small',onClick:() => setSelectedIds(current => current.filter(id => id !== person.id))},'移除')});
    }
    return h(ConfigProvider,{theme:currentProjectTheme},
      h('div',{className:`notification-react-page${viewOnly ? ' notification-view-mode' : ''}`,style:configPageStyle()},
        [
          h(Form,Object.assign({key:'form',form,layout:'horizontal',labelAlign:'left',colon:false,disabled:viewOnly},editorFormLayout()),[
          h(Card,{key:'basic',className:'notification-recipient-card notification-basic-info-card',title:'基本信息',styles:{body:{padding:'20px 24px 24px'}},style:{marginBottom:16,borderRadius:0}},[
            h(Form.Item,{key:'event',label:'通知事件',name:'event',required:true,rules:[{required:true,message:'请选择通知事件'}]},h(Select,{placeholder:'请选择通知事件',value:eventName || undefined,options:dataEvents().map(item => ({value:item.name,label:item.name})),onChange:value => {setEventName(value);form.setFieldsValue({event:value})}})),
            h(Form.Item,{key:'method',label:'通知方式',required:true,validateStatus:methodError ? 'error' : undefined,help:methodError || null},[
              h(Radio.Group,{key:'methodMode',className:'notification-radio-row',value:methodMode,disabled:viewOnly,onChange:event => {setMethodMode(event.target.value);setMethodError('')}},[
                h('span',{key:'uniform',className:'notification-option-inline'},[h(Radio,{value:'uniform'},'统一设置'),h(Typography.Text,{type:'secondary'},'所有目标对象使用相同通知方式')]),
                h('span',{key:'individual',className:'notification-option-inline'},[h(Radio,{value:'individual'},'单独设置'),h(Typography.Text,{type:'secondary'},'为每个目标对象单独设置通知方式')])
              ]),
              methodMode === 'uniform' ? h('div',{key:'uniformMethods',className:'notification-uniform-methods'},h(Checkbox.Group,{options:notificationChannelOptions.map(channel => ({label:channel,value:channel})),value:channels,disabled:viewOnly,onChange:values => {setChannels(values);setMethodError('')}})) : h(Typography.Text,{key:'individualMethodsHint',type:'secondary',style:{display:'block',marginTop:8}},'请在下方目标对象列表中单独设置通知方式')
            ]),
            h(Form.Item,{key:'time',label:'通知时间',required:true},[
              h(Radio.Group,{key:'mode',className:'notification-radio-row',value:scheduleMode,disabled:viewOnly,onChange:event => setScheduleMode(event.target.value)},[
                h('span',{key:'instant',className:'notification-option-inline'},[
                  h(Radio,{value:'instant'},'即时通知'),
                  h(Typography.Text,{type:'secondary'},'任务执行完成后立即发送通知')
                ]),
                h('span',{key:'uniform',className:'notification-option-inline'},[
                  h(Radio,{value:'uniform'},'统一设置'),
                  h(Typography.Text,{type:'secondary'},'所有通知对象在相同的时间发送'),
                  scheduleMode === 'uniform' ? h(TimePicker,{key:'picker',className:'notification-uniform-time',value:formatTime(uniformTime),disabled:viewOnly,format:'HH:mm',minuteStep:1,placeholder:'请选择时间',onChange:value => setUniformTime(value ? value.format('HH:mm') : '')}) : null
                ]),
                h('span',{key:'individual',className:'notification-option-inline'},[
                  h(Radio,{value:'individual'},'单独设置'),
                  h(Typography.Text,{type:'secondary'},'可为每个通知对象单独设置发送时间')
                ])
              ])
            ]),
            h(Form.Item,{key:'objects',label:'通知对象',required:true},[
              h(Checkbox.Group,{key:'group',value:objectValues,options:[{label:'任务发起人',value:'initiator'},{label:'目标对象',value:'target'}],onChange:values => {const hasInitiator=values.includes('initiator');const hasTarget=values.includes('target');setInitiator(hasInitiator);setTargetEnabled(hasTarget);if(!hasTarget){setSelectedIds([])}}}),
              h(Typography.Text,{key:'hint',type:'secondary',style:{display:'block',marginTop:8}},'可同时选择多个通知对象')
            ]),
            (targetEnabled || selectedIds.length || (initiator && showIndividualRecipientRows)) ? h(Form.Item,{key:'targets',label:null},[
              targetEnabled && !viewOnly ? h(Button,{key:'select',type:'default',className:'notification-target-add',icon:h('span',{className:'notification-plus-icon','aria-hidden':'true'}),onClick:() => setAccountModalOpen(true)},'选择通知对象') : null,
              h(Table,{key:'targetTable',rowKey:'id',bordered:true,size:'middle',pagination:false,scroll:{x:1100},style:{marginTop:targetEnabled ? 12 : 0},locale:{emptyText:'暂未选择目标对象'},dataSource:targetTableRows,columns:targetColumns})
            ]) : null,
            missingContact.length ? h(Alert,{key:'warning',type:'warning',showIcon:true,message:missingContact.join('；') + '，无法通过对应渠道接收通知'}) : null
          ]),
            h(Card,{key:'channels',title:'通知方式与内容',styles:{body:{padding:16}},style:{marginBottom:16,borderRadius:0}},channelCards),
            viewOnly ? null : h(Space,{key:'actions',style:{display:'flex',justifyContent:'flex-end'},size:8},[
              h(Button,{key:'cancel',onClick:() => window.backNotificationConfigList()},'取消'),
              h(Button,{key:'save',type:'primary',htmlType:'submit',onClick:save},'保存配置')
            ])
          ]),
          h(AccountPickerModal,{key:'accountModal',open:accountModalOpen,selectedIds,onCancel:() => setAccountModalOpen(false),onConfirm:ids => {setSelectedIds(ids);setTargetEnabled(true);setAccountModalOpen(false)}})
        ]
      )
    );
  }

  function render(kind){
    const rootId = kind === 'edit' ? 'notificationConfigEditReactRoot' : 'notificationConfigReactRoot';
    const pageId = kind === 'edit' ? 'notificationConfigEditPage' : 'notificationConfigPage';
    const rootNode = document.getElementById(rootId);
    const pageNode = document.getElementById(pageId);
    if(!rootNode || !pageNode){return}
    if(mountedRoot){mountedRoot.unmount();mountedRoot = null}
    rootNode.innerHTML = '';
    pageNode.classList.add('notification-react-ready');
    mountedRoot = ReactDOM.createRoot(rootNode);
    mountedRoot.render(kind === 'edit' ? h(NotificationConfigEditor) : h(NotificationConfigList));
  }

  window.NotificationCenterReact = {render};
})();

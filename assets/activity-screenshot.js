(function(){
  'use strict';
  function read(file,options={}){
    return new Promise((resolve,reject) => {
      const types = {jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp'};
      const type = types[String(file.name || '').split('.').pop().toLowerCase()];
      const maxBytes = options.maxBytes || 5*1024*1024;
      const allowedTypes = options.allowedTypes || ['image/jpeg','image/png','image/webp'];
      const formatNames = {'image/jpeg':'JPG','image/png':'PNG','image/webp':'WEBP'};
      if(!type || !allowedTypes.includes(type) || (file.type && file.type !== type)){reject(new Error('仅支持 '+allowedTypes.map(value => formatNames[value] || value).join('、')+' 图片'));return}
      if(!file.size || file.size > maxBytes){reject(new Error('图片不能为空，且单张不能超过'+(maxBytes/(1024*1024))+'MB'));return}
      const reader = new FileReader();
      const release = () => options.readers?.delete(reader);
      options.readers?.add(reader);
      reader.onerror = () => {release();reject(new Error('读取失败，请重新选择'));};
      reader.onabort = () => {release();reject(new Error('已取消读取'));};
      reader.onload = async () => {
        release();
        try{
          const encoded = String(reader.result).split(',')[1] || '';
          const bytes = atob(encoded.slice(0,32));
          const valid = type === 'image/png' ? bytes.startsWith('\x89PNG\r\n\x1a\n') : type === 'image/jpeg' ? bytes.startsWith('\xff\xd8\xff') : bytes.startsWith('RIFF') && bytes.slice(8,12) === 'WEBP';
          if(!valid){throw new Error('图片内容与格式不符，请选择有效图片')}
          const src = 'data:'+type+';base64,'+encoded;
          const image = new Image();
          image.src = src;
          await image.decode().catch(() => {throw new Error('图片无法识别，请重新选择');});
          if(!image.naturalWidth || !image.naturalHeight){throw new Error('图片无法识别，请重新选择')}
          resolve({src,name:file.name});
        }catch(error){reject(new Error(error.message || '图片无法识别，请重新选择'));}
      };
      try{reader.readAsDataURL(file);}catch(error){release();reject(new Error('读取失败，请重新选择'));}
    });
  }
  window.ActivityScreenshot = Object.freeze({read});
})();


(function(global){
  const IMG_INDEX = [
    'aston-martin-vantage-2d-red-2024.png','audi-a6-avant-stw-black-2025.png','audi-a7-4d-blau-2019.png','bmw-1-hatch-4d-black-2025.png','bmw-2-activ-tourer-grey-2022.png','bmw-2-gran-coupe-4d-grey-2021.png','bmw-3-sedan-4d-white-2023-JV.png','bmw-3-touring-stw-4d-grey-2023-JV.png','bmw-5-touring-stw-black-2024.png','bmw-7-4d-blue-2023.png','bmw-8-gran-coupe-grey-2022.png','bmw-m235i-grancoupe-4d-blue-2023.png','bmw-m3-amg-stw-lila-2023.png','bmw-m8-coupe-2d-black-2023-JV.png','bmw-x1-m35-suv-grey-2025.png','bmw-x3-m50-suv-black-2025.png','bmw-x3-suv-silver-2025.png','bmw-x5-suv-4d-grey-2023-JV.png','bmw-x5m-suv-4d-black-2023-JV.png','bmw-x7-m60i-suv-white-2023.png','bmw-x7-suv-4d-silver-2023-JV.png','cupra-formentor-suv-grey-2025.png','land-rover-range-rover-hse-suv-black-2025.png','land-rover-range-rover-sport-5d-suv-grey-2022.png','maserati-grecale-suv-4d-blue-2023-JV.png','mb-gls63-amg-suv-4d-grey-2025.png','mb-s-long-sedan-4d-silver-2021-JV.png','mb-sl63-amg-convertible-silver-2022.png','mb-v-class-extralong-van-black-2024.png','mb-vito-van-black-2020.png','nissan-primastar-van-white-2022.png','opel-combo-van-black-2024.png','peugeot-408-4d-white-2022.png','porsche-911-carrera-4s-convertible-2d-blue-2024.png','porsche-911-carrera-4s-coupe-2d-silver-2019-JV.png','porsche-macan-suv-white-2025.png','porsche-panamera-sedan-4d-black-2021-JV.png','vw-golf-variant-stw-4d-grey-2022.png','vw-t-roc-convertible-white-open-2023.png','vw-t-roc-suv-4d-white-2022-JV.png','vw-tiguan-suv-black-2024.png','vw-touran-van-grey-2021.png'
  ];
  
  const ALIAS = {
    'porsche 911 carrera': 'porsche-911-carrera-4s-convertible-2d-blue-2024.png',
    'audi a6 45 avant': 'audi-a6-avant-stw-black-2025.png'
  };
  const normalize = (s) => String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ');
  const score = (name, pattern) => { const n = normalize(name), p = normalize(pattern); let sc = 0; p.split(' ').filter(Boolean).forEach(tok => { if (n.includes(tok)) sc += tok.length; }); return sc; };
  function findBestImage(make, model){
    const target = `${make||''} ${model||''}`.trim();
    let best = ''; let bestScore = 0;
    IMG_INDEX.forEach(file => { const s = score(file, target); if (s > bestScore) { bestScore = s; best = file; } });
    return best ? `/images/cars/${best}` : '';
  }
  function inIndex(path){
    if (!path) return false;
    const name = String(path).split('/').pop().replace(/\.jpg$/i,'.png');
    return IMG_INDEX.includes(name);
  }
  function guessFromPath(path){
    try{
      const file = String(path||'').split('/').pop().replace(/\.(png|jpg|jpeg|webp)$/i,'');
      const tokens = file.split(/[-_]+/).filter(Boolean);
      if (!tokens.length) return { make:'', model:'' };
      const map = { vw:'VW', volkswagen:'Volkswagen', bmw:'BMW', audi:'Audi', mercedes:'Mercedes', 'mercedes-benz':'Mercedes', porsche:'Porsche', cupra:'Cupra', peugeot:'Peugeot', range:'Range Rover', rover:'Range Rover' };
      let make = '';
      let start = 1;
      if (tokens[0]==='range' && tokens[1]==='rover'){ make='Range Rover'; start=2; }
      else { make = map[tokens[0]] || (tokens[0].charAt(0).toUpperCase()+tokens[0].slice(1)); }
      const model = tokens.slice(start).map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(' ');
      return { make, model };
    }catch(e){ return { make:'', model:'' }; }
  }
  function resolveVehicleImage(v){
    let img = (v && (v.image_url || v.image)) || '';
    if (img && (/^[a-zA-Z]:\\/.test(img) || img.includes('\\'))) {
      img = `/images/cars/${img.split('\\').pop()}`;
    }
    if (img && !img.startsWith('/')) {
      img = img.startsWith('images/') ? `/${img}` : `/images/cars/${img}`;
    }
    if (/\.jpg$/i.test(img)) img = img.replace(/\.jpg$/i, '.png');
    
    if (!inIndex(img)) {
      const g = (!v?.make || !v?.model) ? guessFromPath(img) : { make: v.make, model: v.model };
      const aliasKey = `${(g.make||'').toLowerCase()} ${(g.model||'').toLowerCase()}`.trim();
      const aliased = ALIAS[aliasKey];
      const best = aliased ? `/images/cars/${aliased}` : findBestImage(g.make, g.model);
      img = best || img;
    }
    if (!img) img = findBestImage(v?.make, v?.model);
    return img || '/images/cars/vw-t-roc-suv-4d-white-2022-JV.png';
  }
  global.resolveVehicleImage = resolveVehicleImage;
})(window);


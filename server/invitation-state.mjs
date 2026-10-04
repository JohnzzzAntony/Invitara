export function invitationState(catalog,input,themeId,eventDate){
 const result=catalog.EVER_siteDefaults(themeId),baseLayout=catalog.EVER_findLayout(result.layoutId),layout={...baseLayout,sections:[...baseLayout.sections]};
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Invalid invitation content.');
 if(input.sectionTypes!==undefined){
  if(!input.sectionTypes||typeof input.sectionTypes!=='object'||Array.isArray(input.sectionTypes)||Object.keys(input.sectionTypes).length>20)throw new Error('Invalid additional sections.');
  result.sectionTypes={};
  for(const [key,type] of Object.entries(input.sectionTypes)){
   const source=baseLayout.sections.find(s=>s.id===type);
   if(!/^[a-z]+Copy\d+$/.test(key)||!source||['hero','rsvp','contact','date'].includes(type))throw new Error('This section cannot be duplicated.');
   result.sectionTypes[key]=type;result.sections[key]=JSON.parse(JSON.stringify(result.sections[type]));layout.sections.push({...source,id:key});
  }
 }
 const scalar=(value,field)=>{if(field.type==='check'){if(typeof value!=='boolean')throw new Error('Invalid switch.');return value;}if(field.type==='number'){const n=Number(value);if(!Number.isFinite(n)||n<1||n>50)throw new Error('Guest limit must be between 1 and 50.');return n;}if(typeof value!=='string'||value.length>(field.type==='photo'?10000000:10000))throw new Error('Invalid or oversized field.');if(field.type==='color'&&value&&!/^#[a-f0-9]{6}$/i.test(value))throw new Error('Invalid colour.');return value;};
 for(const key of ['nameFont','bodyFont','accent','btnShape','spacing'])if(input[key]!==undefined){if(typeof input[key]!=='string'||input[key].length>100)throw new Error('Invalid design option.');result[key]=input[key];}
 for(const field of layout.basics)if(input.basics?.[field.k]!==undefined)result.basics[field.k]=scalar(input.basics[field.k],field);
 if(input.sections!==undefined&&(!input.sections||typeof input.sections!=='object'||Array.isArray(input.sections)))throw new Error('Invalid sections.');
 for(const spec of layout.sections){const source=input.sections?.[spec.id];if(source===undefined)continue;if(!source||typeof source!=='object'||Array.isArray(source))throw new Error('Invalid section.');const target=result.sections[spec.id];if(source.on!==undefined)target.on=scalar(source.on,{type:'check'});for(const field of spec.fields)if(source[field.k]!==undefined)target[field.k]=scalar(source[field.k],field);if(spec.list&&source[spec.list.k]!==undefined){const rows=source[spec.list.k];if(!Array.isArray(rows)||rows.length>50)throw new Error('Use at most 50 itinerary entries.');target[spec.list.k]=rows.map(row=>{if(!row||typeof row!=='object')throw new Error('Invalid itinerary entry.');const item={};for(const field of spec.list.fields)item[field.k]=scalar(row[field.k]??'',field);return item;});}}
 if(input.order!==undefined){const keys=layout.sections.map(s=>s.id);if(!Array.isArray(input.order)||new Set(input.order).size!==input.order.length||input.order.some(k=>!keys.includes(k)))throw new Error('Invalid section order.');result.order=[...input.order];}
 if(input.elementStyles!==undefined){
  if(!input.elementStyles||typeof input.elementStyles!=='object'||Array.isArray(input.elementStyles)||Object.keys(input.elementStyles).length>500)throw new Error('Invalid element styles.');
  const paths=new Set(layout.basics.map(f=>'basics.'+f.k));
  for(const section of layout.sections){paths.add('sections.'+section.id);for(const field of section.fields)paths.add('sections.'+section.id+'.'+field.k);if(section.list)for(let i=0;i<(result.sections[section.id][section.list.k]||[]).length;i++)for(const field of section.list.fields)paths.add('sections.'+section.id+'.'+section.list.k+'.'+i+'.'+field.k);}
  const choices={fontFamily:['','Cormorant Garamond','Playfair Display','DM Sans','Jost','Cinzel','Great Vibes'],fontWeight:['400','500','600','700'],fontStyle:['normal','italic'],textAlign:['left','center','right'],objectFit:['cover','contain'],objectPosition:['center','top','bottom','left','right']};
  const ranges={fontSize:[10,180,'px'],letterSpacing:[-3,15,'px'],lineHeight:[.8,3,''],borderRadius:[0,150,'px'],padding:[0,160,'px'],minHeight:[0,1400,'px'],opacity:[.1,1,'']};
  result.elementStyles={};
  for(const [key,styles] of Object.entries(input.elementStyles)){
   if(!paths.has(key)||!styles||typeof styles!=='object'||Array.isArray(styles))throw new Error('Invalid styled element.');
   const safe={};
   for(const [property,value] of Object.entries(styles)){
    if(typeof value!=='string'||value.length>100)throw new Error('Invalid element style.');
    let valid=false;
    if(choices[property])valid=choices[property].includes(value);
    if(property==='objectPosition'&&/^\d{1,3}% \d{1,3}%$/.test(value))valid=value.split(' ').every(n=>parseInt(n,10)<=100);
    if(property==='filter')valid=['none','grayscale(1)','sepia(.4)','brightness(.65)'].includes(value);
    if(['color','backgroundColor'].includes(property))valid=/^#[a-f0-9]{6}$/i.test(value);
    if(ranges[property]){const [min,max,unit]=ranges[property];const pattern=unit?/^-?\d+(?:\.\d+)?px$/:/^\d+(?:\.\d+)?$/;const n=parseFloat(value);valid=pattern.test(value)&&n>=min&&n<=max;}
    if(!valid)throw new Error('Invalid element style.');safe[property]=value;
   }
   result.elementStyles[key]=safe;
  }
 }
 if(input.theme!==undefined){
  if(!input.theme||typeof input.theme!=='object'||Array.isArray(input.theme))throw new Error('Invalid theme.');result.theme={};
  const colors=['primary','secondary','accent','background','text','muted','border','button'];
  const choices={headingSize:['40px','54px','72px'],bodySize:['14px','16px','18px'],sectionSpacing:['40px','70px','100px'],containerWidth:['700px','1100px','1400px'],radius:['0px','4px','24px'],alignment:['left','center','right'],lineHeight:['1.4','1.7','2'],letterSpacing:['0px','1px','2px'],shadow:['none','0 8px 24px #203e361a','0 12px 38px #203e3633'],accentFont:['Cormorant Garamond','Playfair Display','Great Vibes','Cinzel','Jost'],motion:['full','gentle','none'],imageTreatment:['natural','mono','warm'],decoration:['template','botanical','ornate','minimal'],overlay:['.2','.45','.7'],headingWeight:['400','500','600','700']};
  for(const [k,v] of Object.entries(input.theme)){if(typeof v!=='string'||!(colors.includes(k)?/^#[a-f0-9]{6}$/i.test(v):choices[k]?.includes(v)))throw new Error('Invalid theme option.');result.theme[k]=v;}
 }
 if(input.elementLinks!==undefined){if(!input.elementLinks||typeof input.elementLinks!=='object'||Array.isArray(input.elementLinks)||Object.keys(input.elementLinks).length>100)throw new Error('Invalid button links.');result.elementLinks={};for(const [k,v] of Object.entries(input.elementLinks)){if(!/^sections\.[a-zA-Z0-9]+\.button$/.test(k)||!result.sections[k.split('.')[1]]||typeof v!=='string'||v.length>2000||! /^(https:\/\/|mailto:|#ws-sec-)/.test(v))throw new Error('Invalid button link.');result.elementLinks[k]=v;}}
 result.basics.date=eventDate;return result;
}

/* Physical geography currently tracks scores within each practice round. */
const physicalKinds={mountains:'Mountain ranges',rivers:'Rivers',lakes:'Lakes',waterways:'Seas & waterways',all:'All features'};
const northAmericaRegions={continent:{name:'North America',bounds:[-180,5,-10,84]},us:{name:'Contiguous United States',bounds:[-125.5,24,-66,50]},north:{name:'Canada & Alaska',bounds:[-180,40,-48,79]},south:{name:'Mexico, Central America & Caribbean',bounds:[-119,5,-58,34]}};
const europeRegions={continent:{name:'Europe',bounds:[-26,30,70,78]},north:{name:'Northern Europe',bounds:[-26,48,48,78]},west:{name:'Western Europe',bounds:[-12,35,18,61]},south:{name:'Southern & Central Europe',bounds:[-11,29,46,53]},east:{name:'Eastern Europe',bounds:[17,35,70,73]}};
let physicalContinent='na',physicalRegions=northAmericaRegions;
function physicalCatalog(){return physicalContinent==='europe'?EUROPE_PHYSICAL:US_PHYSICAL}
function physicalContinentName(){return physicalContinent==='europe'?'Europe':'North America'}
function selectPhysicalContinent(value){physicalContinent=value;physicalRegions=value==='europe'?europeRegions:northAmericaRegions;physicalRegion='continent';physicalBatch='all';resetPhysical()}
let physicalRegion='continent',physicalBatch='all';
function physicalBounds(){const b=[...physicalRegions[physicalRegion].bounds];if(['continent','north'].includes(physicalRegion)&&['waterways','all'].includes(physicalKind)){if(physicalContinent==='na')b[0]=-200;else b[3]=84;}return b}
function physicalHeight(){const b=physicalBounds();return Math.max(420,Math.min(740,900*(b[3]-b[1])/((b[2]-b[0])*Math.cos((b[1]+b[3])*Math.PI/360))))}
function physicalProject(lon,lat){return project(lon>150?lon-360:lon,lat,physicalBounds(),900,physicalHeight())}
function physicalSource(){return physicalCatalog().filter(p=>(physicalRegion==='continent'||p.regions.includes(physicalRegion))&&(physicalKind==='all'||p.kind===physicalKind))}
let physicalKind='mountains',physicalTask='find',physicalSelected='rockies',physicalQueue=[],physicalIndex=0,physicalScore=0,physicalTries=0,physicalAnswered=false,physicalMissed=[],physicalMessage='',physicalTone='',physicalHighlight=null,physicalZoom=1;
function isPhysical(){return mode==='physicalLearn'||mode==='physicalTest'}
function physicalItems(){const items=physicalSource();return physicalBatch==='all'?items:items.slice(Number(physicalBatch)*5,Number(physicalBatch)*5+5)}
function resetPhysical(items=physicalItems()){
 cancelAdvance();physicalQueue=shuffle(items);physicalIndex=0;physicalScore=0;physicalTries=0;physicalAnswered=false;physicalMissed=[];physicalMessage='';physicalTone='';physicalHighlight=null;physicalZoom=1;
 if(!physicalItems().some(p=>p.id===physicalSelected))physicalSelected=physicalItems()[0].id;
}
function physicalPath(g){
 const line=points=>points.map(([lon,lat],i)=>{const [x,y]=physicalProject(lon,lat);return `${i?'L':'M'}${x.toFixed(1)},${y.toFixed(1)}`}).join('');
 if(g.type==='LineString')return line(g.coordinates);
 if(g.type==='MultiLineString')return g.coordinates.map(line).join('');
 const polygons=g.type==='Polygon'?[g.coordinates]:g.coordinates;
 return polygons.map(poly=>poly.map(ring=>line(ring)+'Z').join('')).join('');
}
function physicalCoordinates(value){return typeof value[0]==='number'?[value]:value.flatMap(physicalCoordinates)}
function physicalTarget(p){
 const ref=physicalProject(...p.point),xy=p.geometries.flatMap(g=>physicalCoordinates(g.coordinates)).map(pt=>physicalProject(...pt));
 const visible=xy.filter(pt=>pt[0]>=10&&pt[0]<=890&&pt[1]>=10&&pt[1]<=physicalHeight()-10);
 let point=ref;
 if((p.kind==='rivers'||p.linear||ref[0]<10||ref[0]>890||ref[1]<10||ref[1]>physicalHeight()-10)&&visible.length)point=visible.reduce((a,b)=>Math.hypot(a[0]-ref[0],a[1]-ref[1])<Math.hypot(b[0]-ref[0],b[1]-ref[1])?a:b);
 const xs=xy.map(pt=>pt[0]),ys=xy.map(pt=>pt[1]);
 return {point,small:Math.max(...xs)-Math.min(...xs)<18||Math.max(...ys)-Math.min(...ys)<12};
}
function physicalMap(){
 const learning=mode==='physicalLearn',target=physicalQueue[physicalIndex];
 const current=learning?physicalSelected:physicalHighlight||(physicalTask==='name'?target?.id:null);
 const states=physicalContinent==='europe'?[]:[...new Map(all.filter(p=>p.kind==='State'&&!['Alaska','Hawaii'].includes(p.name)).map(p=>[p.id,p])).values()];
 const items=[...physicalItems()].sort((a,b)=>({waterways:0,mountains:1,lakes:2,rivers:3}[a.kind]-{waterways:0,mountains:1,lakes:2,rivers:3}[b.kind]));
 return `<svg id="physical-map" viewBox="0 0 900 ${physicalHeight()}" preserveAspectRatio="xMidYMid meet" style="width:${physicalZoom*100}%;height:${physicalZoom*100}%" aria-label="${physicalContinentName()} physical features"><defs><clipPath id="physical-clip"><rect x="0" y="0" width="900" height="${physicalHeight()}"/></clipPath><pattern id="mountain-texture" width="16" height="15" patternUnits="userSpaceOnUse"><path d="M2 12L7 4L12 12M7 4L8 8" fill="none" stroke="#795a32" stroke-width=".8" opacity=".55"/></pattern></defs><g clip-path="url(#physical-clip)">${WORLD.map(p=>`<path class="physical-context" d="${pathOf(p.polygons,physicalBounds(),900,physicalHeight())}"/>`).join('')}${states.map(p=>`<path class="physical-land" d="${pathOf(p.polygons,physicalBounds(),900,physicalHeight())}"/>`).join('')}${items.map((p,i)=>{
 const d=p.geometries.map(physicalPath).join(''),active=current===p.id;
 const {point:[x,y],small}=physicalTarget(p);
 return `<g class="physical-feature ${p.kind} ${p.linear?'linear':''} ${active?'highlighted':''} ${physicalTone==='correct'&&physicalHighlight===p.id?'solved':''}" data-physical="${p.id}" role="button" tabindex="0" aria-label="${learning?esc(p.name):'Physical feature '+(i+1)}"><path class="feature-hit" d="${d}"/><path class="feature-shape" d="${d}"/>${p.kind==='mountains'?`<path class="mountain-pattern" d="${d}" fill="url(#mountain-texture)"/>`:''}${!learning&&(small||p.kind==='waterways')?`<circle class="physical-small-target" cx="${x}" cy="${y}" r="8"/>`:''}${learning?`<circle class="physical-number-bg" cx="${x}" cy="${y}" r="10"/><text class="physical-number" x="${x}" y="${y+4}" text-anchor="middle">${physicalItems().findIndex(f=>f.id===p.id)+1}</text>`:''}</g>`;
 }).join('')}</g><text x="875" y="25" text-anchor="end" class="north-label">N ↑</text></svg>`;
}
function physicalStudy(){
 if(mode==='physicalLearn'){
 const p=physicalCatalog().find(p=>p.id===physicalSelected)||physicalItems()[0];
 return `<p class="eyebrow">EXPLORE</p><h2>${esc(p.name)}</h2><p>${esc(p.fact)}</p><p class="physical-help">Tap a feature or choose its name below the map.</p><button class="primary" id="physical-start">Test this set</button>`;
 }
 const p=physicalQueue[physicalIndex];
 if(!p)return `<p class="eyebrow">ROUND COMPLETE</p><h2>${physicalScore} / ${physicalQueue.length}</h2><p>Correct on the first try.</p>${physicalMissed.length?'<button class="primary" id="physical-retry">Practice missed features</button>':'<p>All clear!</p>'}<button id="physical-again">Play again</button><button id="physical-learn">Learn this set</button>`;
 return `<div class="round-progress">${physicalIndex+1} / ${physicalQueue.length}<span>✦ ${physicalScore}</span></div><progress value="${physicalIndex}" max="${physicalQueue.length}"></progress><p class="eyebrow">${physicalTask==='find'?'FIND IT':'NAME IT'}</p><h2>${physicalTask==='find'?'Find '+esc(p.name):'Name the gold feature'}</h2>${physicalTask==='find'?'<p>Tap it on the map.</p>':`<form id="physical-answer-form"><label for="physical-answer">Feature name</label><input id="physical-answer" autocomplete="off" spellcheck="false" ${physicalAnswered?'disabled':''}><button class="primary" ${physicalAnswered?'disabled':''}>Check answer</button></form>`}<p id="physical-feedback" class="${physicalTone}" role="status">${esc(physicalMessage)}</p><div class="question-actions"><button id="physical-hint" ${physicalAnswered?'disabled':''}>Give me a hint</button><button id="physical-show" ${physicalAnswered?'disabled':''}>Show answer</button>${physicalAnswered?'<button id="physical-next" class="primary">Next feature →</button>':''}</div>`;
}
function physicalMiss(){physicalTries++;const p=physicalQueue[physicalIndex];if(p&&!physicalMissed.some(f=>f.id===p.id))physicalMissed.push(p)}
function physicalAnswer(value){
 if(mode!=='physicalTest'||physicalAnswered||!physicalQueue[physicalIndex])return;
 const p=physicalQueue[physicalIndex],clean=s=>normalize(s).replace(/river$|mountains$|mountain$|range$/g,'');
 const good=physicalTask==='find'?value===p.id:[p.name,...(p.aliases||[]),p.name.replace(/^Lake /,''),p.id,p.id==='rockies'?'Rockies':p.name,p.id==='cascades'?'Cascades':p.name,p.id==='appalachians'?'Appalachians':p.name].some(v=>clean(v)===clean(value));
 if(good){physicalAnswered=true;physicalHighlight=p.id;physicalTone='correct';physicalMessage='Correct! '+p.name+'.';if(!physicalTries)physicalScore++;renderPhysical();advanceTimer=setTimeout(physicalNext,1100)}
 else{physicalMiss();physicalTone='incorrect';physicalMessage='Not quite. Try again, or ask for a hint.';renderPhysical();$('#physical-answer')?.focus({preventScroll:true})}
}
function physicalNext(){cancelAdvance();physicalIndex++;physicalTries=0;physicalAnswered=false;physicalHighlight=null;physicalMessage='';physicalTone='';renderPhysical();$('#physical-answer')?.focus({preventScroll:true})}
function renderPhysical(){
 const learning=mode==='physicalLearn',items=physicalItems();
 $('main').innerHTML=`<div class="physical-heading"><div><p class="eyebrow">${physicalContinentName().toUpperCase()} · PHYSICAL GEOGRAPHY</p><h1>Mountains, rivers, lakes & waterways</h1><p>${physicalRegions[physicalRegion].name} · ${items.length} of ${physicalSource().length} features in this set</p></div><button id="physical-back">Back to class maps</button></div><nav class="modes" aria-label="Physical geography modes"><button data-physical-mode="physicalLearn" class="${learning?'active':''}" aria-pressed="${learning}">Learn Mountains and Rivers</button><button data-physical-mode="physicalTest" class="${!learning?'active':''}" aria-pressed="${!learning}">Test Mountains and Rivers</button></nav><div class="physical-toolbar"><label>Continent<select id="physical-continent"><option value="na" ${physicalContinent==='na'?'selected':''}>North America</option><option value="europe" ${physicalContinent==='europe'?'selected':''}>Europe</option></select></label><label>Map region<select id="physical-region">${Object.entries(physicalRegions).map(([k,r])=>`<option value="${k}" ${physicalRegion===k?'selected':''}>${r.name}</option>`).join('')}</select></label><label>Study set<select id="physical-kind">${Object.entries(physicalKinds).map(([k,v])=>`<option value="${k}" ${physicalKind===k?'selected':''}>${v}</option>`).join('')}</select></label><label>Practice size<select id="physical-batch"><option value="all">All ${physicalSource().length} features</option>${Array.from({length:Math.ceil(physicalSource().length/5)},(_,i)=>`<option value="${i}" ${physicalBatch===String(i)?'selected':''}>Set ${i+1} · ${i*5+1}–${Math.min(i*5+5,physicalSource().length)}</option>`).join('')}</select></label>${!learning?`<label>Question type<select id="physical-task"><option value="find" ${physicalTask==='find'?'selected':''}>Find it on the map</option><option value="name" ${physicalTask==='name'?'selected':''}>Name the highlighted feature</option></select></label>`:''}<p class="physical-legend"><span>▲ Mountains</span><span>〰 Rivers</span><span>● Lakes</span><span>◌ Seas & waterways</span></p></div><div class="workspace physical-workspace"><section class="map-panel"><div class="map-top"><strong>${learning?'Tap a feature to explore':physicalTask==='find'?'Find the named feature':'Name the gold feature'}</strong><div><button id="physical-zoom-in" aria-label="Zoom in">＋</button><button id="physical-zoom-out" aria-label="Zoom out">−</button><button id="physical-reset">Reset view</button></div></div><div class="map-scroll" id="physical-scroll" style="--physical-ratio:${physicalHeight()/9}cqw">${physicalMap()}</div><p class="map-note">Brown = mountain regions · Blue = rivers and lakes · Gold = highlighted feature. Mountain and sea shading shows approximate regions. Regional views show portions of cross-border features; ${physicalContinentName()} shows the full context. Small features and waterways have circular touch targets.</p></section><aside class="study-panel">${physicalStudy()}</aside></div>${learning?`<section class="place-list"><h2 class="physical-list-title">Choose a feature</h2><div class="physical-list">${items.map((p,i)=>`<button data-physical-pick="${p.id}" class="${p.id===physicalSelected?'active':''}"><span>${i+1}</span>${esc(p.name)}</button>`).join('')}</div></section>`:''}<p class="physical-preview-note">Scores for these activities are kept for the current practice round and are not added to saved account totals.</p><details class="physical-sources"><summary>About this physical map</summary><p>Feature selection follows the Geography Coloring Book’s ${physicalContinentName()} physical-land lesson, with additional regional features. Rivers, lakes, and approximate mountain and sea regions use <a href="https://www.naturalearthdata.com/downloads/10m-physical-vectors/" target="_blank" rel="noopener">Natural Earth physical vectors</a> (public domain). Features that cross borders continue into neighboring countries. The ${physicalCatalog().length}-feature set includes major mountain ranges, rivers, lakes, seas, and waterways. ${physicalContinent==='europe'?'Common alternative names are accepted, including Dnipro / Dnieper, Tagus / Tajo / Tejo, and Lake Constance / Bodensee. The Caspian Sea is an inland lake despite its name.':'The two Red Rivers and the two Churchill Rivers are separate questions. Both Lake America / Lake Ontario and Gulf of America / Gulf of Mexico names are accepted.'} Islands and mountain peaks are not separate questions in this activity.</p></details>`;
 $('#physical-back').onclick=()=>{cancelAdvance();mode='explore';setPool();render()};
 document.querySelectorAll('[data-physical-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.physicalMode;resetPhysical();renderPhysical()});
 $('#physical-kind').onchange=e=>{physicalKind=e.target.value;physicalBatch='all';resetPhysical();renderPhysical()};
 $('#physical-continent').onchange=e=>{selectPhysicalContinent(e.target.value);renderPhysical()};
 $('#physical-region').onchange=e=>{physicalRegion=e.target.value;physicalBatch='all';resetPhysical();renderPhysical()};
 $('#physical-batch').onchange=e=>{physicalBatch=e.target.value;resetPhysical();renderPhysical()};
 if($('#physical-task'))$('#physical-task').onchange=e=>{physicalTask=e.target.value;resetPhysical();renderPhysical()};
 const pick=id=>{if(learning){physicalSelected=id;renderPhysical()}else if(physicalTask==='find')physicalAnswer(id)};
 document.querySelectorAll('[data-physical]').forEach(el=>{el.onclick=()=>pick(el.dataset.physical);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(el.dataset.physical)}}});
 document.querySelectorAll('[data-physical-pick]').forEach(b=>b.onclick=()=>pick(b.dataset.physicalPick));
 if($('#physical-start'))$('#physical-start').onclick=()=>{mode='physicalTest';resetPhysical();renderPhysical()};
 if($('#physical-answer-form'))$('#physical-answer-form').onsubmit=e=>{e.preventDefault();physicalAnswer($('#physical-answer').value)};
 if($('#physical-hint'))$('#physical-hint').onclick=()=>{physicalMiss();const p=physicalQueue[physicalIndex];physicalHighlight=p.id;physicalMessage=physicalTask==='find'?'Look for the gold feature.':'It begins with “'+p.name.slice(0,3)+'”.';physicalTone='';renderPhysical()};
 if($('#physical-show'))$('#physical-show').onclick=()=>{physicalMiss();physicalAnswered=true;physicalHighlight=physicalQueue[physicalIndex].id;physicalMessage=physicalQueue[physicalIndex].name;physicalTone='';renderPhysical()};
 if($('#physical-next'))$('#physical-next').onclick=physicalNext;
 if($('#physical-again'))$('#physical-again').onclick=()=>{resetPhysical();renderPhysical()};
 if($('#physical-retry'))$('#physical-retry').onclick=()=>{resetPhysical([...physicalMissed]);renderPhysical()};
 if($('#physical-learn'))$('#physical-learn').onclick=()=>{mode='physicalLearn';resetPhysical();renderPhysical()};
 const zoomTo=z=>{physicalZoom=Math.max(1,Math.min(4,z));const svg=$('#physical-map');svg.style.width=physicalZoom*100+'%';svg.style.height=physicalZoom*100+'%';if(physicalZoom===1){$('#physical-scroll').scrollTop=0;$('#physical-scroll').scrollLeft=0}};
 $('#physical-zoom-in').onclick=()=>zoomTo(physicalZoom+.5);$('#physical-zoom-out').onclick=()=>zoomTo(physicalZoom-.5);$('#physical-reset').onclick=()=>zoomTo(1);
}

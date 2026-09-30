/* World foundations: classroom coordinates are rounded to half a degree. */
const worldLines=[
 {name:'Equator',lat:0,fact:'0° latitude. The Equator divides Earth into the Northern and Southern Hemispheres.'},
 {name:'Tropic of Cancer',lat:23.5,fact:'About 23.5° north latitude. This is the northern boundary of the tropics.'},
 {name:'Tropic of Capricorn',lat:-23.5,fact:'About 23.5° south latitude. This is the southern boundary of the tropics.'},
 {name:'Arctic Circle',lat:66.5,fact:'About 66.5° north latitude. Within the Arctic Circle, places can have a full day of sunlight or darkness at certain times of year.'},
 {name:'Antarctic Circle',lat:-66.5,fact:'About 66.5° south latitude. This circle surrounds the south polar region.'},
 {name:'Prime Meridian',lon:0,fact:'0° longitude. Longitude measures how far east or west a place is from this reference meridian. The historic Prime Meridian runs through Greenwich, England.'},
 {name:'Greenwich, England',point:[0,51.48],fact:'Greenwich is part of London, England, and home to the Royal Observatory and the historic Prime Meridian. It lies at about 51.5° north latitude, near 0° longitude.'}
];
let worldSet='places',worldSelected=null,worldQueue=[],worldIndex=0,worldScore=0,worldWrong=false,worldAnswered=false,worldMessage='';
function worldItems(){return worldSet==='lines'?worldLines:continentPoints.filter((p,i)=>worldSet==='continents'?i<7:worldSet==='oceans'?i>=7:true).map(([name,lon,lat])=>({name,point:[lon,lat],fact:worldFacts[name]}))}
function resetWorld(){cancelAdvance();worldQueue=shuffle(worldItems());worldIndex=0;worldScore=0;worldWrong=false;worldAnswered=false;worldMessage='';worldTarget=worldQueue[0]?.name;worldSelected=worldItems()[0]?.name}
function worldNext(){cancelAdvance();worldIndex++;worldWrong=false;worldAnswered=false;worldMessage='';worldTarget=worldQueue[worldIndex]?.name;render()}
function answerWorld(name){
 if(worldMode==='explore'){worldSelected=name;render();return}
 if(worldAnswered||!worldTarget)return;
 if(name!==worldTarget){worldWrong=true;worldMessage='Not quite. Try another line or marker.';$('#world-feedback').textContent=worldMessage;return}
 worldAnswered=true;if(!worldWrong)worldScore++;worldMessage='Correct! '+worldTarget;render();advanceTimer=setTimeout(worldNext,1100);
}
function worldLandPath(polys,b,w,h){return polys.map(poly=>poly.every(ring=>ring.every(pt=>pt[1]<-55))?poly.map(ring=>ring.map(([lon,lat],i)=>{const [x,y]=project(lon,lat,b,w,h);return (i?'L':'M')+x+','+y}).join('')+'Z').join(''):pathOf([poly],b,w,h)).join('')}
const worldLandColors={'North America':'#e9b56b','South America':'#9bcf83','Europe':'#c4a1da','Africa':'#f0d775','Asia':'#efab9c','Oceania':'#d6ba97','Antarctica':'#ece9de'};
const worldOceanColors={'Pacific Ocean':'#88bfe0','Atlantic Ocean':'#afd9ed','Indian Ocean':'#609dca','Arctic Ocean':'#d5eaf7','Southern Ocean':'#397eae'};
function worldColorBackdrop(b,w,h){
 const path=pts=>pts.map(([lon,lat],i)=>{const [x,y]=project(lon,lat,b,w,h);return (i?'L':'M')+x+','+y}).join('')+'Z';
 // Broad teaching divisions, clipped behind land; not maritime boundaries.
 const oceanRegions=[
 ['Atlantic Ocean',[[-100,90],[25,90],[25,65],[15,35],[35,30],[45,12],[20,-35],[20,-60],[-68,-60],[-68,-55],[-80,-5],[-78,8],[-84,10],[-100,25]]],
 ['Indian Ocean',[[20,-60],[20,-35],[45,12],[35,30],[100,30],[100,5],[120,-8],[145,-12],[147,-42],[147,-60]]],
 ['Arctic Ocean',[[-180,66.5],[180,66.5],[180,90],[-180,90]]],
 ['Southern Ocean',[[-180,-90],[180,-90],[180,-60],[-180,-60]]]];
 const europeEdge=[[-25,90],[60,90],[60,70],[59,60],[59,54],[51,51],[51,47],[48,43],[42,42],[40,41],[29,41],[26,40],[26,35],[-25,35]];
 const split=new Set(['Russia','Kazakhstan','Turkey','Georgia','Azerbaijan']);
 return `<defs><clipPath id="world-europe-color"><path d="${path(europeEdge)}"/></clipPath></defs><rect width="1000" height="500" fill="${worldOceanColors['Pacific Ocean']}"/>`+oceanRegions.map(([name,pts])=>`<path d="${path(pts)}" fill="${worldOceanColors[name]}"/>`).join('')+WORLD.map(p=>{const d=worldLandPath(p.polygons,b,w,h),color=worldLandColors[split.has(p.name)?'Asia':p.continent]||worldLandColors.Oceania;return `<path class="world-colored-land" d="${d}" fill="${color}"/>${split.has(p.name)?`<path class="world-colored-land" d="${d}" fill="${worldLandColors.Europe}" clip-path="url(#world-europe-color)"/>`:''}`}).join('');
}
function renderWorld(){
 const learning=worldMode==='explore',items=worldItems(),done=!learning&&worldIndex>=worldQueue.length;
 const selected=items.find(p=>p.name===worldSelected)||items[0];
 const b=[-180,-90,180,90],w=1000,h=500;
 const coords=p=>p.point?project(...p.point,b,w,h):p.lat!==undefined?project(-150,p.lat,b,w,h):project(p.lon,-43,b,w,h);
 const shapes=items.map((p,i)=>{const [x,y]=coords(p),active=learning?selected.name===p.name:worldAnswered&&worldTarget===p.name;
 const d=p.lat!==undefined?`M0 ${y}H1000`:p.lon!==undefined?`M${x} 0V500`:null;
 return `<g class="world-feature ${active?'chosen':''}" data-world="${esc(p.name)}" tabindex="0" role="button" aria-label="${learning?esc(p.name):'Map feature '+(i+1)}">${d?`<path class="world-line-hit" d="${d}"/><path class="world-line" d="${d}"/>`:''}<circle cx="${x}" cy="${y}" r="12"/><text x="${x}" y="${y+4}" text-anchor="middle" class="world-number">${i+1}</text>${learning?`<text class="world-label" x="${p.lat!==undefined?x+20:x}" y="${p.lat!==undefined?y-8:y-19}" text-anchor="${p.lat!==undefined?'start':'middle'}">${esc(p.name)}${p.lat!==undefined?' · '+Math.abs(p.lat)+'°'+(p.lat>0?'N':p.lat<0?'S':''):p.lon!==undefined?' · 0°':''}</text>`:''}</g>`;
 }).join('');
 return `<nav class="modes" aria-label="World practice modes"><button id="world-explore" class="${learning?'active':''}">Learn</button><button id="world-find" class="${!learning?'active':''}">Test · Find on the map</button></nav><label class="world-set-label">Study set <select id="world-set">${Object.entries({places:'Continents & oceans',continents:'Seven continents',oceans:'Five oceans',lines:'Latitude, longitude & Greenwich'}).map(([key,label])=>`<option value="${key}" ${worldSet===key?'selected':''}>${label}</option>`).join('')}</select></label><div class="world-question"><h2>${learning?esc(selected.name):done?'Round complete: '+worldScore+' / '+worldQueue.length:'Find '+esc(worldTarget)}</h2><p id="world-feedback" role="status">${learning?esc(selected.fact):done?'Correct on the first try.':esc(worldMessage||'Tap the correct line or numbered marker.')}</p>${!learning&&!done?`<p>Question ${worldIndex+1} / ${worldQueue.length} · ${worldScore} points</p>`:''}${done?'<button id="world-again">Try this set again</button>':''}</div><div class="world-map world-basics-map"><svg viewBox="0 0 1000 500" role="group" aria-label="World study map">${worldColorBackdrop(b,w,h)}${shapes}</svg></div>${learning?`<div class="physical-list">${items.map((p,i)=>`<button data-world="${esc(p.name)}">${i+1}. ${esc(p.name)}</button>`).join('')}</div>`:''}<p class="map-note">${worldSet==='lines'?'Latitude measures north or south of the Equator; its lines run east–west. Longitude measures east or west of the Prime Meridian; its lines run pole to pole. These are imaginary reference lines. The tropics and polar circles use rounded classroom coordinates. Greenwich is a place, marked by a dot.':'This course uses seven continents and five oceans. Australia is the continent; Oceania includes the wider island region. Markers show example locations. Ocean colors show broad study regions, not exact boundaries. The Pacific appears at both edges of this flat map.'}</p>${learning?`<div class="world-color-key" aria-label="Map color key">${Object.entries({...worldLandColors,...worldOceanColors}).map(([name,color])=>`<span><i style="background:${color}"></i>${name==='Oceania'?'Australia / Oceania':name}</span>`).join('')}</div>`:''}<p class="physical-preview-note">Practice points apply to this round and are not added to saved account totals.</p><details><summary>About these reference lines</summary><p>See <a href="https://oceanservice.noaa.gov/facts/latitude.html" target="_blank" rel="noopener">NOAA’s latitude explanation</a> and <a href="https://www.rmg.co.uk/stories/time/what-prime-meridian-why-it-greenwich" target="_blank" rel="noopener">Royal Museums Greenwich</a>. Modern satellite longitude uses a reference meridian slightly east of the historic observatory line; this difference is too small to show at this map scale.</p></details>`;
}
function bindWorld(){
 if(!$('#world-explore'))return;
 $('#world-explore').onclick=()=>{worldMode='explore';resetWorld();render()};
 $('#world-find').onclick=()=>{worldMode='find';resetWorld();render()};
 $('#world-set').onchange=e=>{worldSet=e.target.value;resetWorld();render()};
 if($('#world-again'))$('#world-again').onclick=()=>{resetWorld();render()};
 document.querySelectorAll('[data-world]').forEach(el=>{el.onclick=()=>answerWorld(el.dataset.world);el.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();answerWorld(el.dataset.world)}}});
}

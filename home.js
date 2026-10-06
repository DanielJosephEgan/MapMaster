const homeContinents=[
 {id:'na',name:'North America',color:'#e9b56b',classes:[1,2,3,4,5,6,8],description:'States, capitals, countries, and the Caribbean.'},
 {id:'sa',name:'South America',color:'#9bcf83',classes:[9],description:'Countries, capitals, mountains, and rivers.'},
 {id:'europe',name:'Europe',color:'#c4a1da',classes:[10,11,12,13],description:'Explore countries, capitals, and physical features.'},
 {id:'africa',name:'Africa',color:'#f0d775',classes:[21,22,23,24,25],description:'Discover countries, capitals, and landmarks.'},
 {id:'asia',name:'Asia',color:'#efab9c',classes:[14,15,16,17,18],description:'Travel from the Middle East to East Asia.'},
 {id:'australia',name:'Australia & Oceania',color:'#d6ba97',classes:[20],description:'Australia, New Zealand, and the Pacific islands.'},
 {id:'antarctica',name:'Antarctica',color:'#ece9de',classes:[],description:'Explore mountains, seas, ice shelves, and the South Pole.'}
];
let homeContinent=null;
function goHome(){cancelAdvance();homeContinent=null;mode='home';render();window.scrollTo?.(0,0)}
function openHomeLesson(id){classId=id;mode='explore';batch='all';review=false;setPool();render();window.scrollTo?.(0,0)}
function openHomePhysical(id,practice){mode=practice?'physicalTest':'physicalLearn';physicalKind='all';selectPhysicalContinent(id);render();window.scrollTo?.(0,0)}
function renderHome(){
 const continent=homeContinents.find(c=>c.id===homeContinent);
 if(!continent){
 $('main').innerHTML=`<section class="home-intro"><p class="eyebrow">WELCOME TO MAP MASTER</p><h1>Where will you explore today?</h1><p>Choose a continent to learn its places, practice your maps, and discover something new.</p></section><nav class="home-grid" aria-label="Choose a continent"><button class="home-card home-world" id="home-world"><img class="home-card-art" src="home-art/world.svg" alt="" aria-hidden="true"><span class="home-card-tag">START WITH THE WORLD</span><strong>Continents and Oceans</strong><span>The whole world, latitude, longitude, and Greenwich.</span><span class="home-card-arrow" aria-hidden="true">Explore →</span></button>${homeContinents.map(c=>`<button class="home-card" data-home-continent="${c.id}" style="--continent-color:${c.color}"><img class="home-card-art" src="home-art/${c.id}.svg" alt="" aria-hidden="true"><strong>${c.name}</strong><span>${c.description}</span><span class="home-card-arrow" aria-hidden="true">Explore →</span></button>`).join('')}</nav><div class="home-class-link"><button id="home-classes">Browse all class lessons</button><p>Follow your Fall and Spring class schedule.</p></div>`;
 $('#home-world').onclick=()=>{worldSet='places';worldSelected=null;mode='world';render();window.scrollTo?.(0,0)};
 $('#home-classes').onclick=()=>openHomeLesson(1);
 document.querySelectorAll('[data-home-continent]').forEach(b=>b.onclick=()=>{homeContinent=b.dataset.homeContinent;renderHome();window.scrollTo?.(0,0)});
 return;
 }
 const physicalChoices=continent.id==='australia'?[['australia','Australia'],['pacific','New Zealand & Pacific islands']]:[[continent.id,continent.name]];
 $('main').innerHTML=`<button id="home-back">← All continents</button><section class="home-intro"><p class="eyebrow">CHOOSE YOUR ACTIVITY</p><h1>${continent.name}</h1><p>${continent.description}</p></section>${continent.classes.length?`<section class="home-section"><h2>${continent.id==='na'?'States, countries & capitals':'Countries & capitals'}</h2><p>Choose a lesson, then try map games, flags, flashcards, or Build a Map.</p><div class="home-lessons">${continent.classes.map(id=>{const c=CLASSES.find(c=>c.id===id);return `<button data-home-lesson="${id}"><small>Class ${id}</small><strong>${esc(c.title)}</strong></button>`}).join('')}</div></section>`:''}<section class="home-section"><h2>Physical geography</h2><p>Mountains, rivers, lakes, oceans, and landmarks${continent.id==='antarctica'?'—including ice shelves and the South Pole':''}.</p><div class="home-lessons">${physicalChoices.map(([id,name])=>`<div class="home-physical-card"><h3>${name}</h3><button data-home-physical="${id}" data-practice="learn">Learn physical features</button><button data-home-physical="${id}" data-practice="test">Test physical features</button></div>`).join('')}</div></section>`;
 $('#home-back').onclick=goHome;
 document.querySelectorAll('[data-home-lesson]').forEach(b=>b.onclick=()=>openHomeLesson(Number(b.dataset.homeLesson)));
 document.querySelectorAll('[data-home-physical]').forEach(b=>b.onclick=()=>openHomePhysical(b.dataset.homePhysical,b.dataset.practice==='test'));
}

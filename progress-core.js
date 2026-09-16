/* Shared question descriptions for student progress, independent of sign-in provider. */
function progressQuestion(place=queue[index]) {
  if (!place) return null;
  const phase=mode==='identifyBoth'?(step===0?'name':'capital'):'';
  let prompt='',answer=place.name;
  if(mode==='find')prompt=`Find ${place.name} on the map.`;
  else if(mode==='findCapital'){prompt=`Find the place whose capital is ${place.capital}.`;}
  else if(mode==='identify'||(mode==='identifyBoth'&&phase==='name'))prompt=`Name the highlighted ${place.kind==='State'?'state':'country or territory'}.`;
  else if(mode==='capitals'||mode==='identifyBoth'){prompt=`Name the ${(place.capitalLabel||'capital').toLowerCase()} of ${place.name}.`;answer=place.capital;}
  else if(mode==='flags')prompt=`Match the flag to ${place.name} on the map.`;
  else if(mode==='compass'){prompt=`Find a place ${compassDirections[place.compassDirection].name} of ${place.compassFrom.name}.`;answer=`${place.name} (one correct answer)`;}
  else if(mode==='build')prompt=`Place ${place.name} in the map puzzle.`;
  else return null;
  return {key:[mode,place.id,phase,place.compassFrom?.id||'',place.compassDirection??''].join('|'),mode,classId,placeId:place.id,phase,fromId:place.compassFrom?.id||null,direction:place.compassDirection??null,prompt,answer};
}
function summarizeProgress(events,day) {
  const summary={totalPoints:0,todayPoints:0,missed:[]},questions=new Map(),seen=new Set();
  for(const event of events){
    if(seen.has(event.id))continue;
    seen.add(event.id);
    if(event.result==='correct'&&event.points===1){summary.totalPoints++;if(event.day===day)summary.todayPoints++;}
    if(!event.question)continue;
    let item=questions.get(event.question.key);
    if(!item){item={...event.question,wrongCount:0,assistedCount:0,lastWrongAt:null,lastCorrectAt:null};questions.set(event.question.key,item);}
    if(event.result==='wrong'){item.wrongCount++;if(!item.lastWrongAt||event.at>item.lastWrongAt)item.lastWrongAt=event.at;}
    if(event.result==='assisted')item.assistedCount++;
    if(event.result==='correct'&&(!item.lastCorrectAt||event.at>item.lastCorrectAt))item.lastCorrectAt=event.at;
  }
  summary.missed=[...questions.values()].filter(q=>q.wrongCount>0).map(q=>({...q,needsPractice:!q.lastCorrectAt||q.lastCorrectAt<q.lastWrongAt})).sort((a,b)=>Number(b.needsPractice)-Number(a.needsPractice)||b.lastWrongAt.localeCompare(a.lastWrongAt));
  return summary;
}
if(typeof module!=='undefined')module.exports={summarizeProgress};

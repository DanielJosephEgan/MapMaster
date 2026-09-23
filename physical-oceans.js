// Ocean markers identify open-water locations, not ocean boundaries.
function addPhysicalOcean(catalog,id,name,point,regionPoints,fact,aliases=[]){
 catalog.push({id,name,kind:'oceans',point,regionPoints,regions:Object.keys(regionPoints),fact,aliases:[name.replace(' Ocean',''),...aliases],geometries:[{type:'Point',coordinates:point}]});
}
addPhysicalOcean(US_PHYSICAL,'na-pacific','Pacific Ocean',[-145,25],{us:[-122,29],north:[-155,51],south:[-110,14]},'Find the ocean west of North America.');
addPhysicalOcean(US_PHYSICAL,'na-atlantic','Atlantic Ocean',[-35,38],{us:[-69,30],north:[-52,47],south:[-61,27]},'Find the ocean east of North America.');
addPhysicalOcean(US_PHYSICAL,'na-arctic','Arctic Ocean',[-130,81],{north:[-135,76]},'Find the ocean north of Alaska and Canada.');
addPhysicalOcean(EUROPE_PHYSICAL,'eu-atlantic','Atlantic Ocean',[-19,43],{north:[-19,55],west:[-10,45],south:[-9,33]},'Find the ocean west of Europe.');
addPhysicalOcean(EUROPE_PHYSICAL,'eu-arctic','Arctic Ocean',[15,81],{north:[15,81],east:[45,81]},'Find the ocean north of Europe, beyond its northern seas.');
addPhysicalOcean(SOUTH_AMERICA_PHYSICAL,'sa-pacific','Pacific Ocean',[-85,-20],{north:[-82,1],central:[-81,-20],south:[-77,-38]},'Find the ocean west of South America.');
addPhysicalOcean(SOUTH_AMERICA_PHYSICAL,'sa-atlantic','Atlantic Ocean',[-32,-25],{north:[-47,8],central:[-35,-20],south:[-42,-43]},'Find the ocean east of South America.');
addPhysicalOcean(SOUTH_AMERICA_PHYSICAL,'sa-southern','Southern Ocean',[-59,-62],{south:[-59,-62]},'Look farther south than Cape Horn. This activity uses 60° south latitude as the northern limit of the ocean surrounding Antarctica.',['Antarctic Ocean']);

addPhysicalOcean(ASIA_PHYSICAL,'as-arctic','Arctic Ocean',[110,83],{north:[110,83]},'Find the ocean north of Siberia.');
addPhysicalOcean(ASIA_PHYSICAL,'as-pacific','Pacific Ocean',[165,22],{north:[180,48],east:[165,27],southeast:[138,10]},'Find the ocean east of Asia.');
addPhysicalOcean(ASIA_PHYSICAL,'as-indian','Indian Ocean',[80,-8],{west:[60,8],south:[78,3],southeast:[94,-5]},'Find the ocean south of Asia.');

addPhysicalOcean(AFRICA_PHYSICAL,'af-atlantic','Atlantic Ocean',[-14,-10],{north:[-16,29],west:[-19,5],central:[9,-8],south:[10,-28]},'Find the ocean west of Africa.');
addPhysicalOcean(AFRICA_PHYSICAL,'af-indian','Indian Ocean',[54,-12],{east:[54,-7],south:[48,-30]},'Find the ocean east of Africa.');

addPhysicalOcean(AUSTRALIA_PHYSICAL,'au-indian','Indian Ocean',[112,-24],{west:[112,-26],north:[119,-14],south:[115,-39]},'Find the ocean west of Australia.');
addPhysicalOcean(AUSTRALIA_PHYSICAL,'au-pacific','Pacific Ocean',[159,-25],{east:[159,-24],north:[155,-15]},'Find the ocean east of Australia.');
addPhysicalOcean(AUSTRALIA_PHYSICAL,'au-southern','Southern Ocean',[135,-62],{south:[135,-62]},'Look far south of Australia. This activity uses 60° south as the northern limit of the Southern Ocean.',['Antarctic Ocean']);

addPhysicalOcean(PACIFIC_PHYSICAL,'oc-pacific','Pacific Ocean',[-155,-5],{nz:[179,-37],melanesia:[175,-5],micronesia:[175,18],polynesia:[-140,-5],hawaii:[-156,24]},'Find the ocean surrounding the Pacific island groups.');
addPhysicalOcean(PACIFIC_PHYSICAL,'oc-southern','Southern Ocean',[175,-62],{nz:[175,-62]},'Look far south of New Zealand. This activity uses 60° south as the northern limit of the Southern Ocean.',['Antarctic Ocean']);

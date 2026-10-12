(function(){
var sections=[
{name:"A. Common 5W1H",hint:"Answer directly in a complete sentence.",questions:[
"What do you usually do after school?","What do you like to do during the school holidays?","What do you usually bring on a school trip?","Where do you usually spend time with your family at weekends?","Where would you like to go for your next holiday?","Where do you usually study at home?","When do you usually do your homework?","When do you usually exercise?","When would you like to go on a holiday with your family?","Who do you usually spend your free time with?","Who would you ask for help if you lost something at school?","Who would you invite to your birthday celebration?","Why do you enjoy your favourite school subject?","Why do you like spending time with your friends?","Why is it important to keep your classroom clean?","How do you usually travel to school?","How do you prepare for an examination?","How do you help your family at home?"
]},
{name:"B. Suggest",hint:"Give one suitable suggestion and add a short detail.",questions:[
"Suggest a place you can visit when you are going on an overseas holiday.","Suggest an activity you can do during a family picnic.","Suggest something you should bring when you go camping.","Suggest a gift you can give to your friend on his or her birthday.","Suggest a food you can prepare for a class party.","Suggest a sport you can try during the school holidays.","Suggest a way you can help your parents at home.","Suggest a place you can visit during a school trip.","Suggest an activity you can do with your friends after school.","Suggest something you can do to stay healthy."
]},
{name:"C. Explain How",hint:"Explain the steps or method clearly.",questions:[
"Explain how you can prepare for a school camping trip.","Explain how you can get ready for an important examination.","Explain how you can keep your classroom clean.","Explain how you can help a friend who is feeling sad.","Explain how you can save money when you go shopping.","Explain how you can travel safely on a long journey.","Explain how you can prepare for a sports competition.","Explain how you can take care of a pet at home.","Explain how you can stay safe when using the Internet.","Explain how you can help your family prepare for a celebration."
]},
{name:"D. Describe",hint:"Use clear details to tell what it is like.",questions:[
"Describe a place you enjoy visiting with your family.","Describe an activity you enjoy doing during the school holidays.","Describe a meal you enjoy eating with your family.","Describe a school event you enjoy taking part in.","Describe a sport you enjoy playing.","Describe a place you would like to visit in another country.","Describe an outdoor activity you would like to try.","Describe a useful item you always bring to school.","Describe a celebration you enjoy with your family.","Describe an interesting place near your home."
]},
{name:"E. Explain Why",hint:"State your idea, then give a reason.",questions:[
"Explain why you would like to visit another country.","Explain why you enjoy spending time with your friends.","Explain why you think exercise is important.","Explain why you would recommend your favourite place to a friend.","Explain why you think pupils should read every day.","Explain why you would like to join a school club.","Explain why you think helping others is important.","Explain why you enjoy your favourite school subject.","Explain why you think school trips are useful.","Explain why you would like to learn a new skill."
]},
{name:"F. What Should You Do?",hint:"Say what you should do and why it is sensible.",questions:[
"What should you bring when you go on a beach holiday?","What should you do before going on a long journey?","What should you wear when you take part in an outdoor activity?","What should you do if it rains during a picnic?","What should you do if you lose something at school?","What should you do if your friend gets hurt during a game?","What should you do if you arrive late for an event?","What should you do if you forget to bring your homework?","What should you do if you get lost in a shopping centre?","What should you do if you find a lost wallet?"
]},
{name:"G. Choose and Give a Reason",hint:"Choose one option clearly and support your choice.",questions:[
"Which activity would you choose for a school holiday programme and why?","Which place would you choose for a family holiday and why?","Which sport would you like to learn and why?","Which school club would you like to join and why?","Which type of transport would you choose for a long journey and why?","Which activity would you choose for a class party and why?","Which place would you recommend to a tourist visiting your town?","Which subject would you like to improve and why?","Which new skill would you like to learn and why?","Which activity would you choose to do with your friends at the weekend?"
]}];

var KEY="part6-drill-settings-v1";
var state={section:0,index:0,shuffled:false,orders:[],classes:{},currentClass:"",called:[]};
var ids=["sectionSelect","questionLabel","questionText","hintText","progressText","prevBtn","nextBtn","shuffleBtn","settingsBtn","settingsOverlay","closeSettings","classSelect","className","rosterInput","saveSettingsBtn","newClassBtn","deleteClassBtn","settingsStatus","leftName","rightName","leftClass","rightClass","calledHistory","callLeft","callRight","phoneLeft","phoneRight","mobileCallLeft","mobileCallRight","mobileLeftName","mobileRightName"];
var el={};ids.forEach(function(id){el[id]=document.getElementById(id);});

function resetOrders(){state.orders=sections.map(function(s){return s.questions.map(function(_,i){return i;});});}
function defaults(){return {classes:{
"6 Cemerlang":["AHMAD AMMAR BIN SUPERI","ARIANA SYAKIRAH BINTI ZAIDI","DAMIA SYARAFANA BINTI SOPHIAN","DHIA AUFA ADELIA BINTI MOHAMAD RAZALI","ERIYANA BINTI YAHYA","HAIFA FAIQIHAH BINTI HAMZANI ZEN","IZZ AIRIS ZAHRAN BIN HADI SHAM","MOHAMAD AMMAR NAUFAL BIN ABDULLAH","MOHAMAD JOHAZMI DARWIN BIN MOHAMAD JOHAIRI","MOHAMMAD DAANISH RAFA BIN MOHAMMAD ZULHELMI","MU'AZ BIN MAWARDY","MUHAMMAD ASYRAF BIN ASIKURAHMAN","MUHAMMAD YUSUF BIN ABDUL LATIF","NUR AINA IMANINA BINTI AWANG MAMIT","NUR AMNI AQILA BINTI ASMAWI","NUR ARISSA SOFEA BINTI MUHAMAD NURASMADI","NUR DHIYA QAISARA BINTI MOHAMAD FADLIE","NUR FARHANI KADIR BINTI ABDULLAH","NUR NAJIHATUNNISA BINTI SAFLI","NUR SARA SARFINA BINTI ABDUL GHAFFAR","NURUL SAIDATUL QAIRINA BINTI AWANG SHARI","SYAZANA BINTI AZRUL","WARDINA WITRA BINTI SHEIKH HADZREI ADAM"],
"6 Gemilang":["ADAM MUKHRIZ BIN AHMAD NAFIS","ADIB AAKIF WAZIEN BIN MATNOR","AHMAD ZAFRI KHALIS BIN SENAWI","AIERISH MAZUQ BIN SHAHLIZAN","AISYAH ELESYA BINTI NOOR IKHRAM","ALISHA IZARA BINTI MOHAMAD SHAH","ALISYA AMANDA BINTI MOHD KHAIRUL","DAYANG NUR ALISHA SAFIYA BINTI AWANG HAMDANI","ILFA AQWA BINTI MOHAMMAD NOOR","MOHAMMAD ANNAS FITRI BIN SUMARDI","MOHAMMAD ILSYAM ILHAM BIN MOHAMMAD SHAHRIL LIZAM","MOHAMMAD SAFWAN HANIF BIN MOHAMMAD SUFRI","MUHAMMAD AAQIF ZHAFRAN BIN MOHAMMAD NASRUL HADI","MUHAMMAD AZZA ARYAN BIN MUHAMMAD AZIZI","MUHAMMAD QAYYUM BIN AWANG RADINI","MUHAMMAD SHAFIQ AQEEL BIN MOHD. SAMSUL","NUR ADELIA FARANISSA MUHAMMAD FAIZAL BINTI KAMARUDDIN","NUR ADRIANA BATRISYA BINTI NORMAN","NUR ASSYIFA NAQIYAH BINTI JULE","NUR INSYIRAH FARISHA BINTI ADZMI","NUR IRDINA BATRISYIA BINTI RHOMA","NURSYAZIE ZAFWAN BIN NURUL HIDAYAT","NURULHUDA SAFIRAH BINTI MURAH","QHAIRYSSA DARLEEN BINTI JUMYZZAN SHAFIQ","WARDINA ZAHRA BINTI AWANG MOHAMMAD SAID"],
"6 Terbilang":["ALIF WAZIEN BIN JUPRI","AZMIE MIKHAIL BIN ASPARMETA","DANG QHAYLA AZRA BINTI ABDUL TAIB","DAYANGKU NUR NAIRA SYABELLA BINTI AWANGKU RABAHA","DHIYA KHAYLA BINTI MOHD HARDY ISKANDAR","HARIANA ROSE BINTI MOHD FADZLI","HARRAZ MISHARY BIN HAMSANI","IZZNI NATALIA BINTI MOHD NOR BUSTARI","MARSYA AQILAH SYAMIMI SYIFA BINTI MASRIZAL","MASHAMEERA WAFIA BINTI LATIROSWADI","MOHAMAD ADAM MIQAIL BIN ABDULLAH","MOHAMAD RAYQAL AKIF BIN MOHAMAD RIZAN","MOHAMMAD ADAM NAZRIL BIN NAZWI ADLIZAN","MOHAMMAD HARRAZ MIRZA BIN ABDULLAH","MUHAMMAD ANIQ AZFAR BIN MOHD AZHAR","MUHAMMAD ANIQ AZIB BIN DURANI","MUHAMMAD NORNAIEM BIN NORISMAN","MUHAMMAD WAFIE HENDRY BIN ABDULLAH","NUR ERYNA KHUZAIMAH BINTI ROSLAN","NUR MASYITAH DALILAH BINTI ABDULLAH","NUR QALEESHA BINTI NAZIRUL","NUR QISYA DAMIA BINTI JUMAT","NUR QISYA ERYNA BINTI MD HADZMEER FITRY","NUR SYAKILA ZULAIKHA BINTI JUHAIBI","NURUL AINOL AFRINA BINTI MOHIDIN","NURUL SYAHRIANIE BINTI SYAHRUZAIMI"]
},currentClass:"6 Cemerlang"};}
function load(){var d,base=defaults();try{d=JSON.parse(localStorage.getItem(KEY)||"null")||base;}catch(e){d=base;}state.classes=d.classes&&typeof d.classes==="object"?d.classes:{};["Year 5","Year 6"].forEach(function(old){if(Array.isArray(state.classes[old])&&state.classes[old].length===0){delete state.classes[old];}});Object.keys(base.classes).forEach(function(cls){if(!Array.isArray(state.classes[cls])||state.classes[cls].length===0){state.classes[cls]=base.classes[cls].slice();}});var keys=Object.keys(state.classes);state.currentClass=d.currentClass&&state.classes[d.currentClass]!==undefined?d.currentClass:base.currentClass;if(state.currentClass==="Year 5"||state.currentClass==="Year 6"){state.currentClass=base.currentClass;}saveStore();}
function saveStore(){localStorage.setItem(KEY,JSON.stringify({classes:state.classes,currentClass:state.currentClass}));}
function roster(){var r=state.classes[state.currentClass];return Array.isArray(r)?r:[];}
function currentQuestion(){return sections[state.section].questions[state.orders[state.section][state.index]];}
function render(){var s=sections[state.section];el.questionLabel.textContent=s.name;el.questionText.textContent=currentQuestion();el.hintText.textContent=s.hint;el.progressText.textContent=(state.index+1)+" of "+s.questions.length;el.sectionSelect.value=String(state.section);el.prevBtn.disabled=state.section===0&&state.index===0;el.nextBtn.textContent=(state.section===sections.length-1&&state.index===s.questions.length-1)?"Start again ↻":"Next →";updateClassUI();}
function updateClassUI(){var list=roster(),cls=state.currentClass||"No class",disabled=!list.length;el.leftClass.textContent=cls;el.rightClass.textContent=cls;[el.callLeft,el.callRight,el.mobileCallLeft,el.mobileCallRight].forEach(function(b){b.disabled=disabled;});el.calledHistory.textContent=list.length?"Called this round: "+state.called.length+" / "+list.length:"Add pupil names in Settings";}
function buildSections(){sections.forEach(function(s,i){var o=document.createElement("option");o.value=i;o.textContent=s.name;el.sectionSelect.appendChild(o);});}
function next(){var len=sections[state.section].questions.length;if(state.index<len-1){state.index++;}else if(state.section<sections.length-1){state.section++;state.index=0;}else{state.section=0;state.index=0;}render();}
function prev(){if(state.index>0){state.index--;}else if(state.section>0){state.section--;state.index=sections[state.section].questions.length-1;}render();}
function shuffle(){state.shuffled=!state.shuffled;resetOrders();if(state.shuffled){state.orders.forEach(function(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}});}state.index=0;el.shuffleBtn.textContent=state.shuffled?"↩︎ Order":"🔀 Shuffle";render();}
var callingBusy=false,cycleTimer=null,audioCtx=null,dialNodes=[],activeCallSide="left";

function ensureAudioCtx(){
  try{
    var AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return null;
    if(!audioCtx)audioCtx=new AC();
    if(audioCtx.state==="suspended")audioCtx.resume();
    return audioCtx;
  }catch(e){return null;}
}
function startDialTone(){
  stopDialTone();
  var ctx=ensureAudioCtx();
  if(!ctx)return;
  var master=ctx.createGain();
  master.gain.value=.055;
  master.connect(ctx.destination);
  [350,440].forEach(function(freq){
    var o=ctx.createOscillator();
    o.type="sine";
    o.frequency.value=freq;
    o.connect(master);
    o.start();
    dialNodes.push(o);
  });
  dialNodes.push(master);
}
function stopDialTone(){
  dialNodes.forEach(function(n){
    try{if(typeof n.stop==="function")n.stop();}catch(e){}
    try{n.disconnect();}catch(e){}
  });
  dialNodes=[];
}
function playConnectSound(){
  var ctx=ensureAudioCtx();
  if(!ctx)return;
  var o=ctx.createOscillator(),g=ctx.createGain();
  o.type="sine";
  o.frequency.setValueAtTime(720,ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(980,ctx.currentTime+.08);
  g.gain.setValueAtTime(.001,ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(.08,ctx.currentTime+.01);
  g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.1);
  o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.11);
}
function getNextPupil(){
  var pupils=roster();
  if(state.called.length>=pupils.length)state.called=[];
  var remaining=pupils.filter(function(n){return state.called.indexOf(n)===-1;});
  return remaining[Math.floor(Math.random()*remaining.length)];
}
function commitPupil(name){
  state.called.push(name);
  var nameEl=activeCallSide==="left"?el.leftName:el.rightName;
  var mob=activeCallSide==="left"?el.mobileLeftName:el.mobileRightName;
  nameEl.textContent=name;
  mob.textContent=name;
  updateClassUI();
}
function openCalling(side){
  if(!roster().length){openSettings();return;}
  activeCallSide=side||"left";
  var modal=document.getElementById("callingModal");
  modal.classList.add("open");
  startCalling();
}
function closeCalling(){
  if(cycleTimer){clearTimeout(cycleTimer);clearInterval(cycleTimer);}
  cycleTimer=null;
  callingBusy=false;
  stopDialTone();
  document.getElementById("callingModal").classList.remove("open");
  document.getElementById("calloutPhone").classList.remove("is-calling");
}
function startCalling(){
  if(callingBusy)return;
  var pupils=roster();
  if(!pupils.length)return;
  callingBusy=true;
  var phone=document.getElementById("calloutPhone");
  var nameEl=document.getElementById("calledName");
  var heading=document.getElementById("callHeading");
  var status=document.getElementById("callStatus");
  var remain=document.getElementById("callRemaining");
  var another=document.getElementById("anotherCallBtn");
  var cls=document.getElementById("calloutClass");
  phone.classList.add("is-calling");
  nameEl.classList.remove("selected");
  nameEl.classList.add("cycling");
  heading.textContent="Calling...";
  status.textContent="Finding a pupil...";
  remain.textContent="";
  cls.textContent=state.currentClass;
  another.disabled=true;
  var pick=getNextPupil();
  var startIndex=Math.floor(Math.random()*pupils.length);
  var fullCycle=[];
  for(var i=0;i<pupils.length;i++)fullCycle.push(pupils[(startIndex+i)%pupils.length]);
  var idx=0,shown=0,delay=68;
  var totalShows=fullCycle.length+10;
  startDialTone();
  function advance(){
    if(shown>=totalShows){
      nameEl.textContent=pick;
      nameEl.classList.remove("cycling");
      nameEl.classList.add("selected");
      phone.classList.remove("is-calling");
      heading.textContent="Connected";
      status.textContent="Your turn.";
      commitPupil(pick);
      var left=pupils.length-state.called.length;
      remain.textContent=left>0?left+" pupil"+(left===1?"":"s")+" remaining before names can repeat.":"Everyone has been called. The next call starts a new cycle.";
      stopDialTone();
      playConnectSound();
      another.disabled=false;
      callingBusy=false;
      cycleTimer=null;
      return;
    }
    nameEl.textContent=fullCycle[idx%fullCycle.length];
    idx++;shown++;
    if(shown>totalShows-8)delay+=30;
    else if(shown>totalShows-14)delay+=12;
    cycleTimer=setTimeout(advance,delay);
  }
  advance();
}
function fillClassSelect(){el.classSelect.innerHTML="";Object.keys(state.classes).forEach(function(name){var o=document.createElement("option");o.value=name;o.textContent=name;el.classSelect.appendChild(o);});el.classSelect.value=state.currentClass;}
function loadForm(){fillClassSelect();el.className.value=state.currentClass;el.rosterInput.value=roster().join("\n");el.settingsStatus.textContent="";}
function openSettings(){loadForm();el.settingsOverlay.classList.add("open");setTimeout(function(){el.className.focus();},0);}
function closeSettings(){el.settingsOverlay.classList.remove("open");}
function saveSettings(){var old=state.currentClass;var name=el.className.value.trim()||old||"Class";var names=el.rosterInput.value.split(/\r?\n/).map(function(x){return x.trim();}).filter(Boolean);names=Array.from(new Set(names));if(name!==old){delete state.classes[old];}state.classes[name]=names;state.currentClass=name;state.called=[];saveStore();loadForm();render();el.settingsStatus.textContent="Saved "+names.length+" pupil"+(names.length===1?"":"s")+" in "+name+".";}
function newClass(){var base="New Class",name=base,n=2;while(state.classes[name]!==undefined){name=base+" "+n++;}state.classes[name]=[];state.currentClass=name;state.called=[];saveStore();loadForm();el.className.select();render();}
function deleteClass(){var keys=Object.keys(state.classes);if(keys.length<=1){el.settingsStatus.textContent="Keep at least one class. Rename this class instead.";return;}delete state.classes[state.currentClass];state.currentClass=Object.keys(state.classes)[0];state.called=[];saveStore();loadForm();render();el.settingsStatus.textContent="Class deleted.";}

function bindPhone(phone,side){
  phone.setAttribute("role","button");
  phone.setAttribute("tabindex","0");
  phone.setAttribute("aria-label","Call a pupil");
  phone.addEventListener("click",function(e){
    if(e.target&&e.target.closest&&e.target.closest("button"))return;
    openCalling(side);
  });
  phone.addEventListener("keydown",function(e){
    if(e.key==="Enter"||e.key===" "){e.preventDefault();openCalling(side);}
  });
}
resetOrders();load();buildSections();render();bindPhone(el.phoneLeft,"left");bindPhone(el.phoneRight,"right");
el.sectionSelect.addEventListener("change",function(){state.section=Number(el.sectionSelect.value)||0;state.index=0;render();});
el.prevBtn.addEventListener("click",prev);el.nextBtn.addEventListener("click",next);el.shuffleBtn.addEventListener("click",shuffle);
el.settingsBtn.addEventListener("click",openSettings);el.closeSettings.addEventListener("click",closeSettings);
el.settingsOverlay.addEventListener("click",function(e){if(e.target===el.settingsOverlay){closeSettings();}});
el.classSelect.addEventListener("change",function(){state.currentClass=el.classSelect.value;state.called=[];el.className.value=state.currentClass;el.rosterInput.value=roster().join("\n");saveStore();render();});
el.saveSettingsBtn.addEventListener("click",saveSettings);el.newClassBtn.addEventListener("click",newClass);el.deleteClassBtn.addEventListener("click",deleteClass);
el.callLeft.addEventListener("click",function(){openCalling("left");});el.callRight.addEventListener("click",function(){openCalling("right");});el.mobileCallLeft.addEventListener("click",function(){openCalling("left");});el.mobileCallRight.addEventListener("click",function(){openCalling("right");});document.getElementById("closeCallingBtn").addEventListener("click",closeCalling);document.getElementById("endCallBtn").addEventListener("click",closeCalling);document.getElementById("anotherCallBtn").addEventListener("click",startCalling);document.getElementById("callingModal").addEventListener("click",function(e){if(e.target===this)closeCalling();});
document.addEventListener("keydown",function(e){if(document.getElementById("callingModal").classList.contains("open")){if(e.key==="Escape")closeCalling();return;}if(el.settingsOverlay.classList.contains("open")){if(e.key==="Escape"){closeSettings();}return;}if(["INPUT","TEXTAREA","SELECT"].indexOf(document.activeElement.tagName)!==-1){return;}if(e.key==="ArrowRight"||e.key===" "){e.preventDefault();next();}if(e.key==="ArrowLeft"){e.preventDefault();prev();}if(e.key.toLowerCase()==="c"){openCalling(Math.random()<.5?"left":"right");}});
})();
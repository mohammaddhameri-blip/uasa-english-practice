(()=>{"use strict";
const $=id=>document.getElementById(id);
const A=["A","B","C","D"], HEX={A:"#ffe633",B:"#49fa28",C:"#e235db",D:"#22e5e9"};
const STORAGE="colourcard-scan-v1:";
const s={rows:4,cols:7,nodes:[],pupils:[],answers:[],candidates:[],selected:0,mode:"review",stream:null,animation:0,lastAnalysis:0,videoReady:false,demo:false,frozen:false,lastStats:null,drag:null};
const stage=$("cameraStage"),video=$("video"),canvas=$("overlay"),ctx=canvas.getContext("2d"),pixelCanvas=document.createElement("canvas"),pctx=pixelCanvas.getContext("2d",{willReadFrequently:true});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function nodeIndex(r,c){return r*(s.cols+1)+c}
function makeNodes(rows,cols){
 const out=[];
 for(let r=0;r<=rows;r++){const t=r/rows;const y=.12+.79*t;const lx=.19*(1-t)+.025*t;const rx=.81*(1-t)+.975*t;
  for(let c=0;c<=cols;c++)out.push({x:lx+(rx-lx)*c/cols,y:y});
 }return out;
}
function resetData(rows,cols,keep){
 const oldP=s.pupils.slice(),oldA=s.answers.slice();s.rows=rows;s.cols=cols;s.nodes=makeNodes(rows,cols);
 s.pupils=Array.from({length:rows*cols},(_,i)=>keep?oldP[i]||"":"");
 s.answers=Array.from({length:rows*cols},(_,i)=>keep&&oldA[i]?oldA[i]:null);
 s.candidates=Array.from({length:rows*cols},()=>({colour:"",n:0}));s.selected=clamp(s.selected,0,rows*cols-1);
 $("rows").value=rows;$("cols").value=cols;renderAll();
}
function key(){return STORAGE+($("className").value.trim().toUpperCase()||"DEFAULT")}
function payload(){
 return {version:1,className:$("className").value.trim(),rows:s.rows,cols:s.cols,nodes:s.nodes,pupils:s.pupils,answers:s.answers,question:$("question").value,choices:A.map(a=>$("choice"+a).value),correct:$("correctAnswer").value,mirror:$("mirror").checked};
}
function putSaved(silent=true){try{localStorage.setItem(key(),JSON.stringify(payload()));if(!silent)notice("Class layout saved locally.","good")}catch(e){if(!silent)notice("Cannot save: this browser may block local storage.","bad")}}
function loadObject(obj){
 if(!obj||obj.version!==1||!Number.isInteger(obj.rows)||!Number.isInteger(obj.cols)||obj.rows<1||obj.rows>10||obj.cols<1||obj.cols>12)throw Error("Unsupported layout or grid size.");
 const n=obj.rows*obj.cols;if(!Array.isArray(obj.nodes)||obj.nodes.length!==(obj.rows+1)*(obj.cols+1))throw Error("Invalid grid calibration.");
 const nodes=obj.nodes.map(p=>({x:Number(p.x),y:Number(p.y)}));
 if(nodes.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.x>1||p.y<0||p.y>1))throw Error("Invalid grid positions.");
 s.rows=obj.rows;s.cols=obj.cols;s.nodes=nodes;
 s.pupils=Array.from({length:n},(_,i)=>String(obj.pupils?.[i]||"").slice(0,90));
 s.answers=Array.from({length:n},(_,i)=>{const x=obj.answers?.[i];return x&&A.includes(x.letter)?{letter:x.letter,source:x.source==="manual"?"manual":x.source==="demo"?"demo":"camera",locked:x.source==="manual"}:null});
 s.candidates=Array.from({length:n},()=>({colour:"",n:0}));
 s.selected=0;s.frozen=false;
 $("rows").value=s.rows;$("cols").value=s.cols;
 if(typeof obj.question==="string")$("question").value=obj.question.slice(0,1000);
 if(Array.isArray(obj.choices))A.forEach((a,i)=>{$("choice"+a).value=String(obj.choices[i]||"").slice(0,240)});
 if(A.includes(obj.correct))$("correctAnswer").value=obj.correct;
 $("mirror").checked=!!obj.mirror;syncMirror();renderAll();
}
function tryLoadClass(){const raw=localStorage.getItem(key());if(!raw)return false;loadObject(JSON.parse(raw));return true}
function notice(msg,kind=""){const el=$("status");el.textContent=msg;el.className="status "+kind;$("cameraHelp").textContent=msg}
function zonePoints(i){const r=Math.floor(i/s.cols),c=i%s.cols;return [s.nodes[nodeIndex(r,c)],s.nodes[nodeIndex(r,c+1)],s.nodes[nodeIndex(r+1,c+1)],s.nodes[nodeIndex(r+1,c)]]}
function pointInPoly(x,y,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const p=poly[i],q=poly[j];if((p.y>y)!==(q.y>y)&&x<(q.x-p.x)*(y-p.y)/(q.y-p.y)+p.x)yes=!yes}return yes}
function locateZone(x,y){for(let i=0;i<s.rows*s.cols;i++)if(pointInPoly(x,y,zonePoints(i)))return i;return -1}
function center(poly){return {x:poly.reduce((a,b)=>a+b.x,0)/4,y:poly.reduce((a,b)=>a+b.y,0)/4}}
function resizeCanvas(){
 const bounds=stage.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
 const w=Math.max(1,Math.round(bounds.width*dpr)),h=Math.max(1,Math.round(bounds.height*dpr));
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
 ctx.setTransform(dpr,0,0,dpr,0,0);draw();
}
function path(poly,w,h){ctx.beginPath();ctx.moveTo(poly[0].x*w,poly[0].y*h);for(let j=1;j<poly.length;j++)ctx.lineTo(poly[j].x*w,poly[j].y*h);ctx.closePath()}
function draw(){
 const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;
 ctx.clearRect(0,0,w,h);
 for(let i=0;i<s.rows*s.cols;i++){
  const poly=zonePoints(i),v=s.answers[i],isCurrent=i===s.selected;
  path(poly,w,h);
  ctx.fillStyle=v?hexAlpha(HEX[v.letter],s.demo ? .24 : .17):isCurrent?"rgba(113,180,255,.15)":"rgba(0,0,0,.045)";
  ctx.fill();ctx.lineWidth=isCurrent?2.5:1.15;ctx.strokeStyle=isCurrent?"#e6f4ff":s.mode==="calibrate"?"rgba(255,215,126,.9)":"rgba(208,229,255,.6)";ctx.stroke();
  const p=center(poly),fontSize=clamp(w/(s.cols*5.6),11,23);
  const lab=(i+1).toString().padStart(2,"0")+(v?" · "+v.letter:"");
  ctx.font="700 "+fontSize+"px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";
  const tw=ctx.measureText(lab).width;
  ctx.fillStyle="rgba(5,15,28,.76)";ctx.beginPath();ctx.rect(p.x*w-tw/2-7,p.y*h-fontSize*.75,tw+14,fontSize*1.5);ctx.fill();
  ctx.fillStyle=v?HEX[v.letter]:"#fff";ctx.fillText(lab,p.x*w,p.y*h);
  if(s.demo&&v){const px=p.x*w,py=p.y*h-fontSize*1.85,cardSize=Math.min(w/s.cols*.34,h/s.rows*.4);ctx.fillStyle=HEX[v.letter];ctx.fillRect(px-cardSize*.5,py-cardSize*.6,cardSize,cardSize*.95)}
 }
 if(s.mode==="calibrate"){
  ctx.fillStyle="#ffe7b2";for(const p of s.nodes){ctx.beginPath();ctx.arc(p.x*w,p.y*h,5.2,0,Math.PI*2);ctx.fill();ctx.lineWidth=2;ctx.strokeStyle="#2f291b";ctx.stroke()}
  if(s.drag){const p=s.nodes[s.drag.i];ctx.beginPath();ctx.arc(p.x*w,p.y*h,10,0,Math.PI*2);ctx.strokeStyle="#fff";ctx.lineWidth=3;ctx.stroke()}
 }
}
function hexAlpha(hex,alpha){const x=parseInt(hex.slice(1),16);return "rgba("+((x>>16)&255)+","+((x>>8)&255)+","+(x&255)+","+alpha+")"}
function renderRoster(){
 const root=$("rosterGrid");root.replaceChildren();
 for(let i=0;i<s.rows*s.cols;i++){
  const b=document.createElement("button"),v=s.answers[i];b.type="button";
  b.className="seatbtn"+(i===s.selected?" active":"")+(v?" answered":"");
  if(s.frozen&&v&&v.letter!==$("correctAnswer").value)b.classList.add("wrong");
  const number=document.createElement("b");number.textContent=(i+1).toString().padStart(2,"0")+(v?" "+v.letter:"");
  const nm=document.createElement("small");nm.textContent=s.pupils[i]||"Seat "+(i+1);
  b.append(number,nm);b.setAttribute("aria-label","Seat "+(i+1)+", "+(s.pupils[i]||"unnamed")+", "+(v?v.letter:"unanswered"));
  b.addEventListener("click",()=>selectZone(i));root.append(b);
 }
}
function renderEditor(){
 const i=s.selected,v=s.answers[i];$("selectedNumber").textContent="Seat "+(i+1).toString().padStart(2,"0");
 $("selectedDetection").textContent=v?(v.letter+" · "+(v.source==="manual"?"manual":v.source==="demo"?"demo":"camera")):"No answer";
 if(document.activeElement!==$("pupilName"))$("pupilName").value=s.pupils[i]||"";
 document.querySelectorAll("#manualButtons button").forEach(b=>b.classList.toggle("active",!!v&&b.dataset.answer===v.letter));
}
function renderCounters(){const n=s.answers.filter(x=>x).length;$("counter").textContent=n+" / "+s.answers.length+" recorded"}
function renderAll(){renderCounters();renderRoster();renderEditor();draw();if(s.frozen)showResults()}
function selectZone(i){if(i<0||i>=s.rows*s.cols)return;s.selected=i;$("pupilName").value=s.pupils[i]||"";renderAll()}
function manualAnswer(colour){s.answers[s.selected]=colour?{letter:colour,source:"manual",locked:true}:null;s.candidates[s.selected]={colour:"",n:0};renderAll();putSaved()}
function clearAnswers(){s.answers.fill(null);s.candidates=Array.from({length:s.rows*s.cols},()=>({colour:"",n:0}));s.frozen=false;$("freeze").disabled=false;$("resume").disabled=true;$("results").hidden=true;$("markingStatus").textContent="Not marked";renderAll();putSaved()}
function showResults(){const answered=s.answers.filter(x=>x).length,correct=s.answers.filter(x=>x&&x.letter===$("correctAnswer").value).length;
 $("results").hidden=false;$("results").innerHTML="<strong>"+correct+" correct</strong> out of "+s.answers.length+" seats · "+answered+" answered · "+(s.answers.length-answered)+" missing";
 $("markingStatus").textContent="Frozen · "+(answered?Math.round(correct/answered*100):0)+"% of responses correct";
}
function setMode(mode){s.mode=mode;$("modeReview").classList.toggle("active",mode==="review");$("modeCalibrate").classList.toggle("active",mode==="calibrate");$("modeReview").setAttribute("aria-pressed",mode==="review");$("modeCalibrate").setAttribute("aria-pressed",mode==="calibrate");
 stage.classList.toggle("calibrating",mode==="calibrate");$("modeHint").textContent=mode==="calibrate"?"Drag any yellow grid intersection to match the raised-card positions. Changes auto-save.":"Review mode: tap any numbered cell to edit an answer.";draw()}
function pointerPosition(ev){const b=canvas.getBoundingClientRect();return{x:clamp((ev.clientX-b.left)/b.width,0,1),y:clamp((ev.clientY-b.top)/b.height,0,1)}}
canvas.addEventListener("pointerdown",ev=>{
 const p=pointerPosition(ev);if(s.mode!=="calibrate"){const i=locateZone(p.x,p.y);if(i!==-1)selectZone(i);return}
 let closest=-1,dist=Infinity;
 s.nodes.forEach((n,i)=>{const d=Math.hypot((n.x-p.x)*stage.clientWidth,(n.y-p.y)*stage.clientHeight);if(d<dist){dist=d;closest=i}});
 if(closest>=0&&dist<Math.max(20,Math.min(36,stage.clientWidth/26))){s.drag={i:closest,pointer:ev.pointerId};canvas.setPointerCapture(ev.pointerId);draw()}
});
canvas.addEventListener("pointermove",ev=>{if(!s.drag||s.drag.pointer!==ev.pointerId)return;const p=pointerPosition(ev);s.nodes[s.drag.i]={x:clamp(p.x,.003,.997),y:clamp(p.y,.003,.997)};draw()});
function finishDrag(ev){if(!s.drag||s.drag.pointer!==ev.pointerId)return;s.drag=null;draw();putSaved()}
canvas.addEventListener("pointerup",finishDrag);canvas.addEventListener("pointercancel",finishDrag);
function syncMirror(){video.classList.toggle("mirrored",$("mirror").checked)}
function deactivateCamera(){
 if(s.stream){for(const track of s.stream.getTracks())track.stop()}
 s.stream=null;s.videoReady=false;video.srcObject=null;video.classList.remove("on");
 $("placeholder").classList.remove("hidden");$("startCamera").disabled=false;$("stopCamera").disabled=true;
 if(s.animation)cancelAnimationFrame(s.animation);s.animation=0;
 $("stageLabel").textContent=s.demo?"DEMO · SIMULATED ANSWERS":"CAMERA OFF · PREVIEW GRID";
}
async function listCameras(){try{const devices=await navigator.mediaDevices.enumerateDevices(),select=$("cameraDevice"),existing=select.value;
  select.innerHTML="<option value=\"\">Default camera</option>";
  for(const d of devices.filter(x=>x.kind==="videoinput")){const o=document.createElement("option");o.value=d.deviceId;o.textContent=d.label||"Camera "+(select.options.length);select.append(o)}
  select.value=[...select.options].some(x=>x.value===existing)?existing:"";
 }catch(e){}}
async function startCamera(){
 if(!navigator.mediaDevices?.getUserMedia){notice("Webcam unavailable. Use a modern browser over HTTPS.","bad");return}
 deactivateCamera();s.demo=false;draw();$("stageLabel").textContent="REQUESTING CAMERA";
 const deviceId=$("cameraDevice").value;
 try{
  const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:deviceId?{deviceId:{exact:deviceId},width:{ideal:1280},height:{ideal:720}}:{width:{ideal:1280},height:{ideal:720},facingMode:"user"}});
  s.stream=stream;video.srcObject=stream;await video.play();s.videoReady=true;
  if(video.videoWidth&&video.videoHeight)stage.style.aspectRatio=video.videoWidth+"/"+video.videoHeight;
  video.classList.add("on");$("placeholder").classList.add("hidden");
  $("startCamera").disabled=true;$("stopCamera").disabled=false;
  $("stageLabel").textContent="LIVE CAMERA · LOCAL ANALYSIS";
  s.lastAnalysis=0;notice("Camera live. Raise coloured cards and align the grid.","good");
  await listCameras();resizeCanvas();s.animation=requestAnimationFrame(loop);
  stream.getVideoTracks()[0]?.addEventListener("ended",()=>{deactivateCamera();notice("Camera disconnected.","bad")},{once:true});
 }catch(e){deactivateCamera();notice("Camera unavailable: "+(e.name==="NotAllowedError"?"permission denied":e.message||e.name)+". Check HTTPS, browser and camera permissions.","bad")}
}
function frameMask(w,h){
 pixelCanvas.width=w;pixelCanvas.height=h;
 pctx.save();if($("mirror").checked){pctx.translate(w,0);pctx.scale(-1,1)}pctx.drawImage(video,0,0,w,h);pctx.restore();
 return pctx.getImageData(0,0,w,h).data;
}
function classColour(r,g,b){
 const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;
 if(mx<85||d<68||d/(mx||1)<.42)return 0;
 let h=0;
 if(d===0)return 0;
 if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;
 h=(h*60+360)%360;
 if(h>=41&&h<=72)return 1;
 if(h>=83&&h<=158)return 2;
 if(h>=164&&h<=203)return 4;
 if(h>=276&&h<=337)return 3;
 return 0;
}
function findBlobs(w,h,raw){
 const n=w*h,mask=new Uint8Array(n),seen=new Uint8Array(n),queue=new Int32Array(n),minSize=Number($("sensitivity").value);
 for(let i=0,j=0;i<n;i++,j+=4)mask[i]=classColour(raw[j],raw[j+1],raw[j+2]);
 const blobs=[];
 for(let k=0;k<n;k++){
  const color=mask[k];if(!color||seen[k])continue;
  let head=0,tail=1;queue[0]=k;seen[k]=1;
  let area=0,sumX=0,sumY=0,minX=w,minY=h,maxX=0,maxY=0;
  while(head<tail){
   const v=queue[head++],x=v%w,y=(v-x)/w;area++;sumX+=x;sumY+=y;
   if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
   const neighbours=[x>0?v-1:-1,x<w-1?v+1:-1,y>0?v-w:-1,y<h-1?v+w:-1];
   for(let j=0;j<4;j++){const t=neighbours[j];if(t>=0&&!seen[t]&&mask[t]===color){seen[t]=1;queue[tail++]=t}}
  }
  if(area<minSize||area>n*.12)continue;
  const bw=maxX-minX+1,bh=maxY-minY+1,ratio=bw/bh,fill=area/(bw*bh);
  if(ratio<.35||ratio>3.2||fill<.25)continue;
  blobs.push({colour:A[color-1],area,x:(sumX/area+.5)/w,y:(sumY/area+.5)/h});
 }
 return blobs;
}
function detect(){
 if(!s.stream||s.frozen||s.mode==="calibrate"||!s.videoReady||video.readyState<2)return;
 const w=320,h=clamp(Math.round(w*video.videoHeight/video.videoWidth),140,320);
 let blobs;try{blobs=findBlobs(w,h,frameMask(w,h))}catch(e){notice("Camera frame could not be analysed: "+e.message,"bad");return}
 const found=Array.from({length:s.rows*s.cols},()=>[]);
 for(const blob of blobs){const i=locateZone(blob.x,blob.y);if(i>=0)found[i].push(blob)}
 let changed=false;
 for(let i=0;i<found.length;i++){
  if(s.answers[i]?.locked)continue;
  const arr=found[i].sort((a,b)=>b.area-a.area);let c="";
  if(arr.length&&!(arr.length>1&&arr[1].colour!==arr[0].colour&&arr[1].area>arr[0].area*.5))c=arr[0].colour;
  const previous=s.candidates[i];
  if(!c){s.candidates[i]={colour:"",n:0};continue}
  s.candidates[i]={colour:c,n:previous.colour===c?previous.n+1:1};
  if(s.candidates[i].n>=Number($("stableFrames").value)&&s.answers[i]?.letter!==c){
   s.answers[i]={letter:c,source:"camera",locked:false};changed=true;
  }
 }
 if(changed){renderAll();putSaved()}
}
function loop(timestamp){if(!s.stream)return;if(timestamp-s.lastAnalysis>230){s.lastAnalysis=timestamp;detect()}s.animation=requestAnimationFrame(loop)}
function download(name,blob,type){const a=document.createElement("a"),url=URL.createObjectURL(new Blob([blob],{type}));a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}
function csvCell(text){return '"'+String(text??"").replaceAll('"','""')+'"'}
function csvExport(){
 const rows=[["Class","Question","Seat","Pupil","Answer","Correct answer","Result","Source"]];
 for(let i=0;i<s.answers.length;i++){const v=s.answers[i];rows.push([$("className").value,$("question").value,i+1,s.pupils[i],v?.letter||"",$("correctAnswer").value,v?(v.letter===$("correctAnswer").value?"Correct":"Incorrect"):"Unanswered",v?.source||""])}
 download("colourcard-"+safeFilename($("className").value)+"-results.csv",rows.map(r=>r.map(csvCell).join(",")).join("\r\n"),"text/csv;charset=utf-8");
}
function safeFilename(t){return t.replace(/[^a-z0-9_-]/gi,"_").slice(0,40)||"class"}
function demo(){
 deactivateCamera();s.demo=true;clearAnswers();
 for(let i=0;i<s.answers.length;i++){if(i%9===0)continue;const letter=A[(i*7+Math.floor(i/3))%4];s.answers[i]={letter,source:"demo",locked:false}}
 $("stageLabel").textContent="DEMO MODE · SIMULATED ANSWERS";notice("Demo answers are simulated, not detected from a webcam.","good");renderAll();
}
$("startCamera").addEventListener("click",startCamera);
$("stopCamera").addEventListener("click",()=>{deactivateCamera();notice("Camera stopped.")});
$("cameraDevice").addEventListener("change",()=>{if(s.stream)startCamera()});
$("demo").addEventListener("click",demo);
$("mirror").addEventListener("change",()=>{syncMirror();putSaved()});
$("sensitivity").addEventListener("input",()=>{$("sensitivityValue").textContent=$("sensitivity").value});
$("modeReview").addEventListener("click",()=>setMode("review"));
$("modeCalibrate").addEventListener("click",()=>setMode("calibrate"));
$("resetGrid").addEventListener("click",()=>{s.nodes=makeNodes(s.rows,s.cols);renderAll();putSaved()});
$("buildGrid").addEventListener("click",()=>{
 const rows=Number($("rows").value),cols=Number($("cols").value);
 if(!Number.isInteger(rows)||!Number.isInteger(cols)||rows<1||rows>10||cols<1||cols>12){notice("Grid limits: 1–10 rows and 1–12 columns.","bad");return}
 resetData(rows,cols,true);putSaved();notice("Grid changed to "+rows+" × "+cols+". Check pupil assignments.","good");
});
$("pupilName").addEventListener("input",e=>{s.pupils[s.selected]=e.target.value.slice(0,90);renderRoster();putSaved()});
$("manualButtons").addEventListener("click",e=>{const b=e.target.closest("button[data-answer]");if(b)manualAnswer(b.dataset.answer)});
$("showRoster").addEventListener("click",()=>{
 const el=$("rosterEditor"),opening=el.hidden;el.hidden=!opening;$("showRoster").textContent=opening?"Close list":"Edit list";
 if(opening)$("rosterText").value=s.pupils.join("\n");
});
$("applyRoster").addEventListener("click",()=>{
 const lines=$("rosterText").value.replace(/\r/g,"").split("\n");s.pupils=s.pupils.map((_,i)=>(lines[i]||"").trim().slice(0,90));renderAll();putSaved();notice("Pupil names applied.","good");
});
$("newQuestion").addEventListener("click",()=>{clearAnswers();notice("Answers cleared for the next question.","good")});
$("freeze").addEventListener("click",()=>{s.frozen=true;$("freeze").disabled=true;$("resume").disabled=false;renderAll();putSaved()});
$("resume").addEventListener("click",()=>{s.frozen=false;$("freeze").disabled=false;$("resume").disabled=true;$("results").hidden=true;$("markingStatus").textContent="Not marked";renderAll()});
$("correctAnswer").addEventListener("change",()=>{if(s.frozen)renderAll();putSaved()});
$("exportCsv").addEventListener("click",csvExport);
$("saveLayout").addEventListener("click",()=>putSaved(false));
$("loadLayout").addEventListener("click",()=>{try{if(tryLoadClass())notice("Saved class loaded.","good");else notice("No saved layout for this class.","bad")}catch(e){notice("Could not load layout: "+e.message,"bad")}});
$("exportLayout").addEventListener("click",()=>download("colourcard-"+safeFilename($("className").value)+"-layout.json",JSON.stringify(payload(),null,2),"application/json"));
$("importLayout").addEventListener("change",async ev=>{
 const file=ev.target.files?.[0];if(!file)return;
 try{if(file.size>1e6)throw Error("File is too large");const obj=JSON.parse(await file.text());loadObject(obj);$("className").value=String(obj.className||"Imported").slice(0,24);putSaved();notice("Layout imported and saved.","good")}
 catch(e){notice("Import failed: "+e.message,"bad")}finally{ev.target.value=""}
});
$("className").addEventListener("change",()=>{
 try{if(!tryLoadClass()){resetData(s.rows,s.cols,false);notice("New class. Assign pupils, then save this layout.","good")}else notice("Saved class loaded.","good")}
 catch(e){resetData(4,7,false);notice("Saved data invalid. Started fresh.","bad")}
});
["question","choiceA","choiceB","choiceC","choiceD"].forEach(id=>$(id).addEventListener("input",()=>putSaved()));
window.addEventListener("resize",resizeCanvas);
new ResizeObserver(resizeCanvas).observe(stage);
window.addEventListener("pagehide",()=>{if(s.stream)for(const track of s.stream.getTracks())track.stop()});
resetData(4,7,false);
try{tryLoadClass()}catch(e){notice("Could not load saved layout: "+e.message,"bad")}
syncMirror();resizeCanvas();
})();
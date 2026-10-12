/* Printable, original B&W vector story art for Year 2 writing drills. */
(function(){
'use strict';
var A={scenes:{}};
A.svg=function(kind){
 var f=A.scenes[kind];if(!f)return null;
 var labels={swing:'Two children on the swings',slide:'Child playing on the playground slide',icecream:'Children eating ice cream',sweep:'Child sweeping the floor',wash:'Child washing dishes',plants:'Child watering flowers',balloons:'Children decorating with birthday balloons',sing:'Children singing at a birthday party',cake:'Child eating a slice of cake',parrots:'Parrots at the zoo',lunch:'Family eating lunch at the zoo',photos:'Child photographing an elephant',sandcastle:'Child building a sandcastle',shells:'Child collecting seashells',picnic:'Family enjoying a beach picnic'};
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 212" role="img" aria-label="'+labels[kind]+' black-and-white cartoon"><g stroke="#191919" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" fill="none">'+f()+'</g><rect x="2" y="2" width="316" height="208" rx="7" stroke="#191919" stroke-width="1.5" fill="none"/></svg>';
};
A.cloud=function(x,y){return '<path d="M'+x+' '+y+' q-10 -12 3 -18 q12 -18 29 -2 q17 -8 23 7 q17 1 14 14z" fill="white"/>';};
A.sky=function(){return '<path d="M0 171 Q77 153 160 169 T320 161 M0 188 Q140 170 320 187"/>'+A.cloud(17,42)+'<circle cx="280" cy="31" r="15"/><path d="M280 9 v-5 m0 49 v5 M258 31 h-6 m50 0 h7 M264 15 l-5 -5 m38 38 l6 6 M296 15 l6 -5"/>';};
A.room=function(){return '<path d="M0 169 H320 M19 169 v42 M302 169 v42 M227 21 h66 v74 h-66z M260 21 v74 M227 58 h66 M22 24 h68 v37 H22z M30 53 l17 -18 l16 13 l10 -7 l9 12"/>';};
A.beach=function(){return A.cloud(17,29)+'<circle cx="281" cy="35" r="14"/><path d="M0 97 Q77 88 154 100 T320 99 M0 114 Q76 105 157 117 T320 112 M0 140 Q100 128 190 141 T320 135"/>';};
A.tree=function(x,y,s){return '<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M0 0 v-83 M0 -44 l-25 -25 M0 -53 l20 -22" stroke-width="7"/><path d="M-43 -77 Q-49 -100 -27 -111 Q-18 -135 5 -128 Q29 -141 42 -118 Q66 -122 75 -97 Q88 -76 67 -61 Q44 -44 25 -61 Q6 -41 -16 -59 Q-45 -49 -48 -74Z" fill="white"/><path d="M-22 -88 l9 -8 M17 -115 l13 -6 M47 -78 l8 -7"/></g>';};
A.table=function(x,y,w){return '<path d="M'+x+' '+y+' h'+w+' v10 h-'+w+'z M'+(x+13)+' '+(y+10)+' v34 M'+(x+w-13)+' '+(y+10)+' v34" fill="white"/>';};
A.child=function(x,y,s,pose,girl){
 var poses={stand:['M-15 -45 l-19 15','M15 -45 l19 15','M-11 -20 l-4 20','M11 -20 l5 20'],wave:['M-15 -45 l-18 -29','M15 -45 l18 15','M-11 -20 l-4 20','M11 -20 l5 20'],hold:['M-15 -45 l-21 16 l23 -4','M15 -45 l23 16 l-23 -4','M-11 -20 l-4 20','M11 -20 l5 20'],sit:['M-15 -45 l-23 17','M15 -45 l23 17','M-11 -20 l-24 6 l-8 14','M11 -20 l25 6 l8 14'],run:['M-15 -45 l-25 -18','M15 -45 l26 16','M-11 -20 l-28 19','M11 -20 l30 14'],reach:['M-15 -45 l-26 -24','M15 -45 l29 -24','M-11 -20 l-4 20','M11 -20 l5 20'],bend:['M-15 -45 l-28 27','M15 -45 l27 25','M-11 -20 l-16 20','M11 -20 l8 20']};
 var a=poses[pose]||poses.stand;
 var hair=girl?'<path d="M-20 -79 Q-31 -111 -6 -111 Q18 -125 26 -85 L34 -61 Q22 -50 17 -72 Q1 -93 -19 -73 M-20 -82 l-9 22" fill="white"/>':'<path d="M-23 -81 L-17 -100 L-8 -96 L0 -110 L11 -99 L19 -105 L27 -85 Q8 -90 -6 -81Z" fill="white"/>';
 return '<g transform="translate('+x+' '+y+') scale('+s+')" stroke="#191919" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round"><path d="'+a[2]+' '+a[3]+'" stroke-width="9" fill="none"/><path d="'+a[0]+' '+a[1]+'" stroke-width="10" fill="none"/><path d="M-18 -49 q18 -9 36 0 l4 30 h-44z" fill="white"/><path d="M-13 -44 l13 6 l13 -6 M-11 -28 h22"/><circle cx="0" cy="-82" r="22" fill="white"/>'+hair+'<circle cx="-8" cy="-82" r="2.5" fill="#191919" stroke="none"/><circle cx="8" cy="-82" r="2.5" fill="#191919" stroke="none"/><path d="M-6 -72 q6 7 13 -1" fill="none"/><path d="M-14 -1 h17 M9 -1 h18" stroke-width="5"/></g>';
};
A.balloon=function(x,y){return '<ellipse cx="'+x+'" cy="'+y+'" rx="14" ry="19" fill="white"/><path d="M'+x+' '+(y+19)+' l-3 5 h6z M'+x+' '+(y+24)+' q-8 18 0 42"/>';};
A.cake=function(x,y){return '<g transform="translate('+x+' '+y+')"><path d="M-36 0 h72 v37 q-36 12 -72 0z" fill="white"/><ellipse cx="0" cy="0" rx="36" ry="10" fill="white"/><path d="M-36 15 q9 15 18 0 q9 15 18 0 q9 15 18 0 q9 15 18 0"/><path d="M-16 -6 v-20 M0 -8 v-23 M16 -6 v-20"/><path d="M-16 -27 q-5 -7 0 -13 q5 6 0 13 M0 -33 q-5 -6 0 -12 q5 6 0 12 M16 -27 q-5 -7 0 -13 q5 6 0 13" fill="white"/></g>';};
A.shell=function(x,y,s){return '<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M-23 8 Q-32 -9 -17 -20 Q-8 -31 0 -21 Q13 -31 20 -17 Q31 -8 23 8Z" fill="white"/><path d="M0 -21 v29 M-15 -16 l8 24 M15 -17 l-8 25 M-23 8 Q0 17 23 8"/></g>';};
window.Y2Art=A;
window.lineArtScene=function(kind){return A.svg(kind);};
})();
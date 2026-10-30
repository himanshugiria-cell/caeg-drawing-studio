'use strict';
const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
const examples={P:[30,40],Q:[25,-35],R:[-32,-45],S:[-35,42],T:[0,-30],U:[-40,0],V:[35,0],W:[0,48],A:[0,0]};
let currentPoint='P', stage=3, answersVisible=false;
const placeHP=h=>h===0?'on HP':`${Math.abs(h)} mm ${h>0?'above':'below'} HP`;
const placeVP=d=>d===0?'on VP':`${Math.abs(d)} mm ${d>0?'in front of':'behind'} VP`;
const viewText=n=>n===0?'on XY':`${Math.abs(n)} mm ${n>0?'above':'below'} XY`;
function pointLocation(h,d){if(h===0&&d===0)return'ON BOTH PLANES';if(h===0)return'ON HP';if(d===0)return'ON VP';return h>0?(d>0?'FIRST QUADRANT':'SECOND QUADRANT'):(d>0?'FOURTH QUADRANT':'THIRD QUADRANT');}
function setPosition(name){const [h,d]=examples[name];currentPoint=name;q('#point-preset').value=name;q('#hp-side').value=h===0?'on':h>0?'above':'below';q('#vp-side').value=d===0?'on':d>0?'front':'behind';q('#hp-distance').value=Math.abs(h);q('#vp-distance').value=Math.abs(d);drawPoint();}
function drawPoint(){
 const H=q('#hp-distance'),D=q('#vp-distance'),hs=q('#hp-side').value,ds=q('#vp-side').value;
 H.disabled=hs==='on';D.disabled=ds==='on';if(H.disabled)H.value=0;if(D.disabled)D.value=0;
 const ok=(H.disabled||H.checkValidity())&&(D.disabled||D.checkValidity());q('#point-error').hidden=ok;if(!ok){q('#point-error').textContent='Enter whole-number distances from 0 to 60 mm.';return;}
 const h=hs==='on'?0:Number(H.value)*(hs==='above'?1:-1),d=ds==='on'?0:Number(D.value)*(ds==='front'?1:-1);
 const n=currentPoint.toLowerCase(),x=340,y=250,k=3.7,f=y-h*k,t=y+d*k,same=f===t;
 q('#point-location').textContent=pointLocation(h,d);q('#point-summary').textContent=`${currentPoint} is ${placeHP(h)} and ${placeVP(d)}. ${stage===1?'The perpendicular projector will carry both views.':stage===2?`The front view ${n}′ lies ${viewText(h)}.`:`The front view ${n}′ lies ${viewText(h)}. The top view ${n} lies ${viewText(-d)}.${same?' The views coincide.':''}`}`;
 q('#front-reading').textContent=stage>=2?`${n}′: ${viewText(h)}`:'Next: mark the front view';q('#top-reading').textContent=stage>=3?`${n}: ${viewText(-d)}`:'Next: mark the top view';
 qa('[data-stage]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.stage)===stage)));
 const text=(str,xx,yy,col='#214d68',anchor='start')=>`<text x="${xx}" y="${yy}" fill="${col}" text-anchor="${anchor}" font-size="19">${str}</text>`;
 const line=(x1,y1,x2,y2,col,width=1.5)=>`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${col}" stroke-width="${width}"/>`;
 const mark=(yy,col)=>`<circle cx="${x}" cy="${yy}" r="4.5" fill="${col}"/>`;
 const dimension=(val,yy,dx,col)=>!val?'':line(x,y,dx,y,col,1)+line(x,yy,dx,yy,col,1)+line(dx,y,dx,yy,col,1)+line(dx-4,y-5,dx+4,y+5,col)+line(dx-4,yy-5,dx+4,yy+5,col)+text(Math.abs(val)+' mm',dx-12,(y+yy)/2+6,col,'end');
 let svg=`<path d="M${x} 15V485" stroke="#a9bba8" stroke-dasharray="5 6"/>${line(45,y,620,y,'#214d68')}${text('X',22,y+6)}${text('Y',630,y+6)}`;
 if(stage>=2){svg+=mark(f,'#1266a5')+dimension(h,f,235,'#1266a5');if(!(stage===3&&same))svg+=text(n+'′',x+16,Math.min(475,Math.max(25,stage===3&&Math.abs(f-t)<45?(f<t?f-13:f+26):f-10)),'#1266a5');}
 if(stage>=3){svg+=mark(t,'#ad5031')+dimension(d,t,520,'#ad5031');svg+=same?text(n+', '+n+'′',x+16,t+26):text(n,x+16,Math.min(484,Math.max(25,Math.abs(f-t)<45?(t<f?t-13:t+26):t+24)),'#ad5031');}
 const s=q('#point-svg');s.innerHTML=svg;s.setAttribute('aria-label',`Point ${currentPoint}, ${placeHP(h)}, ${placeVP(d)}. ${stage>=2?`Front view ${viewText(h)}.`:''} ${stage>=3?`Top view ${viewText(-d)}.`:''}`);
}
q('#point-preset').addEventListener('change',e=>{if(e.target.value==='custom'){currentPoint='A';drawPoint();}else setPosition(e.target.value);});
qa('.distance-control input,.distance-control select').forEach(el=>el.addEventListener('input',()=>{currentPoint='A';q('#point-preset').value='custom';drawPoint();}));
qa('[data-stage]').forEach(b=>b.addEventListener('click',()=>{stage=Number(b.dataset.stage);drawPoint();}));
q('#reset-point').addEventListener('click',()=>{stage=3;setPosition('P');});
q('#point-example-rows').innerHTML=Object.entries(examples).filter(([n])=>n!=='A').map(([n,[h,d]])=>`<tr><th scope="row"><button type="button" class="point-example-button" data-point="${n}" aria-label="Explore point ${n}">${n} ↗</button></th><td>${placeHP(h)}, ${placeVP(d)}</td><td class="answer-column" hidden>${n.toLowerCase()}′: ${viewText(h)}</td><td class="answer-column" hidden>${n.toLowerCase()}: ${viewText(-d)}</td></tr>`).join('');
qa('[data-point]').forEach(b=>b.addEventListener('click',()=>{stage=3;setPosition(b.dataset.point);q('#point-studio').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});q('#point-preset').focus({preventScroll:true});}));
q('#toggle-point-answers').addEventListener('click',()=>{answersVisible=!answersVisible;qa('.answer-column').forEach(el=>el.hidden=!answersVisible);q('#toggle-point-answers').setAttribute('aria-expanded',String(answersVisible));q('#toggle-point-answers').textContent=answersVisible?'Hide the answers −':'Show the answers +';});
setPosition('P');

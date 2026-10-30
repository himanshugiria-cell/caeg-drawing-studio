(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const rad = Math.PI / 180;
  const EPS = 1e-8;
  const navy = '#214d68', orange = '#b95434', green = '#9aaa99', muted = '#69746d';
  const fmt = (n) => (Math.abs(n) < 0.0005 ? '0' : Number(n.toFixed(2)).toString());
  const cases = {
    1: { L:50, theta:0, phi:0, z:60, y:25, title:'Parallel to HP and VP', given:'50 mm; parallel to both HP and VP. A: 60 mm above HP, 25 mm in front of VP.' },
    2: { L:60, theta:90, phi:0, z:20, y:40, title:'Perpendicular to HP', given:'60 mm; perpendicular to HP. A: 20 mm above HP. The line is 40 mm in front of VP.' },
    3: { L:60, theta:0, phi:90, z:40, y:20, title:'Perpendicular to VP', given:'60 mm; perpendicular to VP. A: 20 mm in front of VP. The line is 40 mm above HP.' },
    4: { L:80, theta:30, phi:0, z:20, y:40, title:'30° to HP; parallel to VP', given:'80 mm; 30° to HP, parallel to VP. A: 20 mm above HP, 40 mm in front of VP.' },
    5: { L:80, theta:0, phi:30, z:20, y:20, title:'30° to VP; parallel to HP', given:'80 mm; 30° to VP, parallel to HP. A: 20 mm above HP, 20 mm in front of VP.' },
    6: { L:60, theta:0, phi:30, z:0, y:20, title:'In HP; 30° to VP', given:'60 mm; situated in HP, 30° to VP. A: 20 mm in front of VP.' },
    7: { L:70, theta:30, phi:0, z:25, y:0, title:'In VP; 30° to HP', given:'70 mm; situated in VP, 30° to HP. A: 25 mm above HP.' },
    8: { L:70, theta:45, phi:30, z:20, y:30, title:'Inclined to both planes', given:'70 mm; 45° to HP and 30° to VP. A: 20 mm above HP, 30 mm in front of VP.' }
  };
  let stage = 3;
  function geometry(p) {
    const dy = p.L * Math.sin(p.phi * rad), dz = p.L * Math.sin(p.theta * rad);
    const square = p.L * p.L - dy * dy - dz * dz;
    if (square < -1e-7) return null;
    const dx = Math.sqrt(Math.max(0, square));
    const clean = (v) => Math.abs(v) < 1e-6 ? 0 : v;
    const g = { ...p, dx:clean(dx), dy:clean(dy), dz:clean(dz) };
    g.fv = Math.hypot(g.dx,g.dz); g.tv = Math.hypot(g.dx,g.dy);
    g.alpha = g.fv < EPS ? null : Math.atan2(g.dz,g.dx) / rad;
    g.beta = g.tv < EPS ? null : Math.atan2(g.dy,g.dx) / rad;
    return g;
  }
  function traceData(g) {
    const result = [];
    if (Math.abs(g.dz) > EPS) {
      const t = -g.z / g.dz;
      result.push({ name:'H', x:t*g.dx, y:g.y+t*g.dy, z:0 });
    }
    if (Math.abs(g.dy) > EPS) {
      const t = -g.y / g.dy;
      result.push({ name:'V', x:t*g.dx, y:0, z:g.z+t*g.dz });
    }
    return result;
  }
  function svgText(x,y,text,color=navy,size=16,anchor='start') {
    return `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-family="SFMono-Regular,Consolas,monospace" text-anchor="${anchor}">${text}</text>`;
  }
  function drawProjection(svg,g,opts={}) {
    const width=opts.width || 800, height=opts.height || 520, currentStage=opts.stage || 3;
    const allTraces=opts.traces ? traceData(g) : [];
    const traces=allTraces.filter(t=>Math.max(Math.abs(t.x),Math.abs(t.y),Math.abs(t.z))<=450);
    const xs=[0,g.dx,...traces.map(t=>t.x)];
    const ys=[0,g.z,g.z+g.dz,-g.y,-g.y-g.dy,...traces.flatMap(t=>[t.z,-t.y])];
    let minX=Math.min(-20,...xs)-13, maxX=Math.max(60,...xs)+22;
    let minY=Math.min(-45,...ys)-20, maxY=Math.max(45,...ys)+20;
    const k=Math.min((width-130)/(maxX-minX),(height-95)/(maxY-minY));
    const ox=(width-(maxX-minX)*k)/2-minX*k, oy=(height-(maxY-minY)*k)/2+maxY*k;
    const X=x=>ox+x*k, Y=y=>oy-y*k;
    const pt=(x,y)=>`${X(x)},${Y(y)}`;
    let body=`<defs><marker id="arrow-${svg.id}" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto-start-reverse"><path d="M0 0 7 3.5 0 7" fill="${muted}"/></marker></defs>`;
    body+=`<path d="M30 ${Y(0)}H${width-25}" stroke="${navy}" stroke-width="1.5"/>${svgText(22,Y(0)-9,'X',navy,15)}${svgText(width-22,Y(0)-9,'Y',navy,15,'end')}`;
    const lo=Math.min(0,g.z,g.z+g.dz,-g.y,-g.y-g.dy)-10, hi=Math.max(0,g.z,g.z+g.dz,-g.y,-g.y-g.dy)+10;
    body+=`<path d="M${X(0)} ${Y(lo)}V${Y(hi)}" stroke="${green}" stroke-width="1.1" stroke-dasharray="5 5"/>`;
    if(currentStage>=2 && g.dx>EPS) body+=`<path d="M${X(g.dx)} ${Y(lo)}V${Y(hi)}" stroke="${green}" stroke-width="1.1" stroke-dasharray="5 5"/>`;
    if (opts.traces && currentStage===3) {
      if (traces.length && g.fv>EPS) {
        const f=[{x:0,y:g.z},{x:g.dx,y:g.z+g.dz},...traces.map(t=>({x:t.x,y:t.z}))].sort((a,b)=>g.dx>EPS?a.x-b.x:a.y-b.y);
        body+=`<path d="M${pt(f[0].x,f[0].y)}L${pt(f.at(-1).x,f.at(-1).y)}" fill="none" stroke="${navy}" stroke-width="1.3" stroke-dasharray="7 6"/>`;
      }
      if (traces.length && g.tv>EPS) {
        const t=[{x:0,y:-g.y},{x:g.dx,y:-g.y-g.dy},...traces.map(q=>({x:q.x,y:-q.y}))].sort((a,b)=>g.dx>EPS?a.x-b.x:a.y-b.y);
        body+=`<path d="M${pt(t[0].x,t[0].y)}L${pt(t.at(-1).x,t.at(-1).y)}" fill="none" stroke="${orange}" stroke-width="1.3" stroke-dasharray="7 6"/>`;
      }
      traces.forEach(t=>{
        body+=`<path d="M${X(t.x)} ${Y(t.z)}V${Y(-t.y)}" stroke="${green}" stroke-width="1" stroke-dasharray="4 4"/>`;
        body+=`<circle cx="${X(t.x)}" cy="${Y(t.z)}" r="3.5" fill="${navy}"/><circle cx="${X(t.x)}" cy="${Y(-t.y)}" r="5" fill="none" stroke="${orange}" stroke-width="1.4"/>`;
        body+=svgText(X(t.x)-9,Y(t.z)-12,t.name==='H'?'h′':'v′',navy,15,'end');
        body+=svgText(X(t.x)-9,Y(-t.y)+22,t.name==='H'?'h':'v',orange,15,'end');
      });
    }
    if (currentStage===3) {
      body+=`<path d="M${pt(0,g.z)}L${pt(g.dx,g.z+g.dz)}" fill="none" stroke="${navy}" stroke-width="3" stroke-linecap="round"/><path d="M${pt(0,-g.y)}L${pt(g.dx,-g.y-g.dy)}" fill="none" stroke="${orange}" stroke-width="3" stroke-linecap="round"/>`;
      if(g.fv>EPS) body+=svgText(X(g.dx/2)-4,Y(g.z+g.dz/2)-13,`${fmt(g.fv)} mm`,navy,14,'middle');
      if(g.tv>EPS) body+=svgText(X(g.dx/2),Y(-g.y-g.dy/2)+29,`${fmt(g.tv)} mm`,orange,14,'middle');
    }
    const dot=(x,y,color,hollow=false)=>`<circle cx="${X(x)}" cy="${Y(y)}" r="${hollow?6:4}" fill="${hollow?'#fafaf5':color}" stroke="${color}" stroke-width="${hollow?1.7:1}"/>`;
    body+=dot(0,g.z,navy)+dot(0,-g.y,orange,true);
    const fvSame=g.fv<EPS, tvSame=g.tv<EPS;
    body+=svgText(X(0)-10,Y(g.z)-13,currentStage>=2&&fvSame?'a′, b′':'a′',navy,17,'end');
    body+=svgText(X(0)-10,Y(-g.y)+24,currentStage>=2&&tvSame?'a, b':'a',orange,17,'end');
    if(currentStage>=2) {
      if(!fvSame) body+=dot(g.dx,g.z+g.dz,navy)+svgText(X(g.dx)+10,Y(g.z+g.dz)-13,'b′',navy,17);
      if(!tvSame) body+=dot(g.dx,-g.y-g.dy,orange,true)+svgText(X(g.dx)+10,Y(-g.y-g.dy)+24,'b',orange,17);
    }
    const loc = (value,pos,neg) => Math.abs(value)<EPS?'on XY':`${fmt(Math.abs(value))} ${value>0?pos:neg} XY`;
    body+=svgText(30,height-15,currentStage===1?'A only · locate the first endpoint':currentStage===2?'A and B · endpoints share their projectors':'Join a′b′ and ab · matching views only',muted,12);
    svg.innerHTML=body;
    svg.setAttribute('aria-label',`Line AB, true length ${fmt(g.L)} millimetres. Front view ${g.fv<EPS?'is a point':`${fmt(g.fv)} millimetres`}; top view ${g.tv<EPS?'is a point':`${fmt(g.tv)} millimetres`}. A front view ${loc(g.z,'above','below')}; A top view ${loc(-g.y,'above','below')}. Construction stage ${currentStage}.`);
  }
  function drawSpatial(svg,g) {
    const xMax=Math.max(95,g.dx+35), yLo=Math.min(-12,g.y-12), yHi=Math.max(55,g.y+g.dy+12), zLo=Math.min(-12,g.z-12), zHi=Math.max(70,g.z+g.dz+12);
    const P=(x,y,z)=>[x-.64*y,.26*x+.40*y-z];
    const hp=[[0,yLo,0],[xMax,yLo,0],[xMax,yHi,0],[0,yHi,0]], vp=[[0,0,zLo],[xMax,0,zLo],[xMax,0,zHi],[0,0,zHi]];
    const points=[...hp,...vp,[15,g.y,g.z],[15+g.dx,g.y+g.dy,g.z+g.dz]].map(v=>P(...v));
    const minX=Math.min(...points.map(v=>v[0])), maxX=Math.max(...points.map(v=>v[0])), minY=Math.min(...points.map(v=>v[1])),maxY=Math.max(...points.map(v=>v[1]));
    const k=Math.min(530/(maxX-minX),270/(maxY-minY));
    const S=(x,y,z)=>{const q=P(x,y,z);return[60+(q[0]-minX)*k,45+(q[1]-minY)*k];};
    const ps=(v)=>S(...v).join(',');
    let h=`<polygon points="${hp.map(ps).join(' ')}" fill="#cbd6c4" fill-opacity=".45" stroke="#a7b6a4" stroke-width="1"/><polygon points="${vp.map(ps).join(' ')}" fill="#cfdae1" fill-opacity=".4" stroke="#99aebd" stroke-width="1"/>`;
    const a=S(15,g.y,g.z), b=S(15+g.dx,g.y+g.dy,g.z+g.dz);
    [[15,g.y,g.z],[15+g.dx,g.y+g.dy,g.z+g.dz]].forEach((v,i)=>{if(i===1&&stage<2)return;h+=`<path d="M${ps(v)}L${ps([v[0],v[1],0])}M${ps(v)}L${ps([v[0],0,v[2]])}" fill="none" stroke="${green}" stroke-width="1" stroke-dasharray="4 4"/>`;});
    if(stage===3)h+=`<path d="M${a.join(',')}L${b.join(',')}" stroke="${navy}" stroke-width="3"/>`;
    h+=`<circle cx="${a[0]}" cy="${a[1]}" r="4" fill="${orange}"/>${svgText(a[0]-10,a[1]-12,'A',navy,17,'end')}`;
    if(stage>=2)h+=`<circle cx="${b[0]}" cy="${b[1]}" r="4" fill="${orange}"/>${svgText(b[0]+10,b[1]-8,'B',navy,17)}`;
    const hpLabel=S(xMax*.75,yHi,0),vpLabel=S(xMax*.75,0,zHi);
    h+=svgText(hpLabel[0],hpLabel[1]+23,'HP',muted,16)+svgText(vpLabel[0],vpLabel[1]-12,'VP',navy,16);
    svg.innerHTML=h;
    svg.setAttribute('aria-label',`Three-dimensional schematic of line AB relative to horizontal plane HP and vertical plane VP. True length ${fmt(g.L)} millimetres; true inclination to HP ${fmt(g.theta)} degrees and to VP ${fmt(g.phi)} degrees. ${stage===1?'Only endpoint A is revealed.':stage===2?'Endpoints A and B are revealed.':'The endpoints are joined.'}`);
  }
  function sideWord(v,pos,neg,on='on the plane'){return Math.abs(v)<EPS?on:`${fmt(Math.abs(v))} mm ${v>0?pos:neg}`;}
  function render() {
    const p={L:Number($('#line-length').value),theta:Number($('#line-theta').value),phi:Number($('#line-phi').value),z:Number($('#line-height').value),y:Number($('#line-depth').value)};
    const valid=$$('.line-input-group input').every(el=>el.value.trim()!==''&&el.checkValidity()&&Number.isFinite(Number(el.value)));
    const g=valid?geometry(p):null;
    $('#line-error').hidden=Boolean(g);
    if(!g){
      $('#line-error').textContent=valid?'These two true inclinations cannot belong to one real line. Reduce θ or φ: sin² θ + sin² φ must not exceed 1.':'Enter all five values within the ranges shown: length 1–150 mm, angles 0–90°, and A distances −100 to 150 mm.';
      ['#line-svg','#line-spatial-svg'].forEach(s=>{$(s).innerHTML='';$(s).setAttribute('aria-label','Drawing unavailable. Correct the input values.');});
      ['#line-tl-reading','#line-fv-reading','#line-tv-reading'].forEach(s=>$(s).textContent='—');
      $('#line-fv-angle').textContent='';$('#line-tv-angle').textContent='';$('#line-endpoint-readings').textContent='';$('#line-summary').textContent='Correct the input values to draw the line.';$('#line-trace-reading').hidden=true;return;
    }
    drawProjection($('#line-svg'),g,{stage,traces:$('#show-line-traces').checked});
    drawSpatial($('#line-spatial-svg'),g);
    $('#line-tl-reading').textContent=`${fmt(g.L)} mm`;
    $('#line-fv-reading').textContent=g.fv<EPS?'A point':`${fmt(g.fv)} mm`;
    $('#line-tv-reading').textContent=g.tv<EPS?'A point':`${fmt(g.tv)} mm`;
    $('#line-fv-angle').textContent=g.alpha===null?'FV has no angle: it is a point.':`FV angle α to XY: ${fmt(g.alpha)}°`;
    $('#line-tv-angle').textContent=g.beta===null?'TV has no angle: it is a point.':`TV angle β to XY: ${fmt(g.beta)}°`;
    const viewPosition=(v)=>Math.abs(v)<EPS?'on XY':`${fmt(Math.abs(v))} mm ${v>0?'above':'below'} XY`;
    $('#line-endpoint-readings').innerHTML=`<span>A → a′: ${viewPosition(g.z)}; a: ${viewPosition(-g.y)}.</span>${stage>=2?`<span>B → b′: ${viewPosition(g.z+g.dz)}; b: ${viewPosition(-g.y-g.dy)}.</span>`:''}`;
    const key=$('#line-preset').value;
    $('#line-case-title').textContent=key==='custom'?'CUSTOM LINE':`EXAMPLE 8.${key}`;
    let principle=g.fv<EPS?'The front view collapses to a point because AB is perpendicular to VP.':g.tv<EPS?'The top view collapses to a point because AB is perpendicular to HP.':g.phi===0&&g.theta===0?'Both views show true length and lie parallel to XY.':g.phi===0?'Parallel to VP: the front view shows the true length and the true HP inclination.':g.theta===0?'Parallel to HP: the top view shows the true length and the true VP inclination.':'Inclined to both planes: both views are shorter than TL. Their angles with XY are apparent angles.';
    if(g.dx<EPS&&g.fv>EPS&&g.tv>EPS)principle+=' Here both views are perpendicular to XY because Δx = 0.';
    $('#line-summary').textContent=`${principle} B is ${sideWord(g.z+g.dz,'above HP','below HP','on HP')} and ${sideWord(g.y+g.dy,'in front of VP','behind VP','on VP')}.`;
    const showTraces=$('#show-line-traces').checked;
    $('#line-trace-reading').hidden=!showTraces;
    if(showTraces){
      const ts=traceData(g),h=ts.find(t=>t.name==='H'),v=ts.find(t=>t.name==='V');
      const hs=h?`H: horizontal change from A = ${fmt(h.x)} mm; ${sideWord(h.y,'in front of VP','behind VP','on VP')}.`:Math.abs(g.z)<EPS?'AB lies in HP: no unique horizontal trace.':'AB is parallel to HP: no finite horizontal trace.';
      const vs=v?`V: horizontal change from A = ${fmt(v.x)} mm; ${sideWord(v.z,'above HP','below HP','on HP')}.`:Math.abs(g.y)<EPS?'AB lies in VP: no unique vertical trace.':'AB is parallel to VP: no finite vertical trace.';
      const outside=ts.some(t=>Math.max(Math.abs(t.x),Math.abs(t.y),Math.abs(t.z))>450);
      $('#line-trace-reading').textContent=(stage<3?'Complete stage 3 to display the extended views. ':'')+hs+' '+vs+(outside?' A distant trace is outside the drawing window.':'');
    }
  }
  function loadCase(key,scroll=false){
    const p=cases[key]; if(!p)return;
    $('#line-preset').value=String(key);[['#line-length',p.L],['#line-theta',p.theta],['#line-phi',p.phi],['#line-height',p.z],['#line-depth',p.y]].forEach(([s,v])=>$(s).value=v);render();
    if(scroll)$('#line-studio').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  }
  $('#line-preset').addEventListener('change',e=>{if(e.target.value!=='custom')loadCase(e.target.value);else render();});
  $$('.line-input-group input').forEach(el=>el.addEventListener('input',()=>{$('#line-preset').value='custom';render();}));
  $$('[data-line-stage]').forEach(b=>b.addEventListener('click',()=>{stage=Number(b.dataset.lineStage);$$('[data-line-stage]').forEach(q=>q.setAttribute('aria-pressed',String(q===b)));render();}));
  $('#show-line-traces').addEventListener('change',render);
  $('#reset-line').addEventListener('click',()=>{stage=3;$$('[data-line-stage]').forEach(q=>q.setAttribute('aria-pressed',String(q.dataset.lineStage==='3')));$('#show-line-traces').checked=false;loadCase(1);});
  $('#line-manual-rows').innerHTML=Object.entries(cases).map(([key,p])=>{const g=geometry(p);return `<tr><td><button type="button" class="line-case-link" data-open-line="${key}">8.${key} ↗</button></td><td>${p.given}</td><td>${g.fv<EPS?'A point':`${fmt(g.fv)} mm`}<small>${g.alpha===null?'No direction angle':`${fmt(g.alpha)}° to XY`}</small></td><td>${g.tv<EPS?'A point':`${fmt(g.tv)} mm`}<small>${g.beta===null?'No direction angle':`${fmt(g.beta)}° to XY`}</small></td></tr>`;}).join('');
  $$('[data-open-line]').forEach(b=>b.addEventListener('click',()=>{stage=3;$$('[data-line-stage]').forEach(q=>q.setAttribute('aria-pressed',String(q.dataset.lineStage==='3')));loadCase(b.dataset.openLine,true);}));
  $('#trace-example').addEventListener('click',()=>{stage=3;$$('[data-line-stage]').forEach(q=>q.setAttribute('aria-pressed',String(q.dataset.lineStage==='3')));$('#show-line-traces').checked=true;loadCase(8,true);});
  drawProjection($('#worked-simple-svg'),geometry(cases[4]),{width:700,height:470});
  function rotationDiagram(svg,final=false){
    const k=2.4,X=x=>150+x*k,Y=z=>225-z*k,dx0=70*Math.cos(45*rad),dz=70*Math.sin(45*rad),dx=35,dy=35;
    let h=`<path d="M35 225H615" stroke="${navy}" stroke-width="1.4"/>${svgText(25,216,'X',navy,14)}${svgText(620,216,'Y',navy,14)}`;
    h+=`<path d="M${X(0)} ${Y(79.5)}V${Y(-77)}M${X(dx0)} ${Y(79.5)}V${Y(-77)}" stroke="${green}" stroke-width="1" stroke-dasharray="5 5"/>`;
    h+=`<path d="M${X(0)} ${Y(20)}L${X(dx0)} ${Y(20+dz)}M${X(0)} ${Y(-30)}H${X(dx0)}" fill="none" stroke="${final?green:navy}" stroke-width="${final?1.5:2.7}" ${final?'stroke-dasharray="6 5"':''}/>`;
    h+=`<path d="M${X(0)} ${Y(20)}H${X(25)}" stroke="${green}" stroke-width="1"/>${svgText(X(18),Y(20)-12,'45°',muted,13)}`;
    h+=svgText(X(0)-10,Y(20)-10,'a′',navy,17,'end')+svgText(X(0)-10,Y(-30)+22,'a',orange,17,'end')+svgText(X(dx0)+10,Y(20+dz)-8,'b₁′',final?muted:navy,15)+svgText(X(dx0)+10,Y(-30)+20,'b₁',muted,15);
    if(!final){h+=svgText(X(21),Y(48)-9,'70 mm',navy,15)+svgText(X(dx0/2),Y(-30)+24,'49.50 mm',orange,15,'middle');}
    else {
      h+=`<path d="M${X(-12)} ${Y(20+dz)}H${X(dx0+17)}M${X(-12)} ${Y(-65)}H${X(dx0+17)}M${X(dx)} ${Y(79.5)}V${Y(-77)}" fill="none" stroke="${green}" stroke-width="1" stroke-dasharray="4 4"/>`;
      const arc=[];for(let a=0;a<=45;a+=1)arc.push([X(dx0*Math.cos(a*rad)),Y(-30-dx0*Math.sin(a*rad))]);
      h+=`<path d="M${arc.map(v=>v.join(',')).join('L')}" fill="none" stroke="${muted}" stroke-width="1.4" stroke-dasharray="5 5"/>`;
      h+=`<path d="M${X(0)} ${Y(20)}L${X(dx)} ${Y(20+dz)}" stroke="${navy}" stroke-width="2.8"/><path d="M${X(0)} ${Y(-30)}L${X(dx)} ${Y(-65)}" stroke="${orange}" stroke-width="2.8"/>`;
      h+=svgText(X(dx)-10,Y(20+dz)-14,'b′',navy,17,'end')+svgText(X(dx)+11,Y(-65)+15,'b',orange,17);
      h+=svgText(X(dx0+17),Y(-65)+4,'65 below XY',muted,11)+svgText(X(dx0+17),Y(20+dz)+18,'69.50 above XY',muted,11);
      h+=svgText(X(7),Y(44),'60.62',navy,13,'end')+svgText(X(17),Y(-48)+15,'49.50',orange,13,'end');
    }
    [[0,20],[dx0,20+dz],[0,-30],[dx0,-30],...(final?[[dx,20+dz],[dx,-65]]:[])].forEach(([x,z])=>h+=`<circle cx="${X(x)}" cy="${Y(z)}" r="3.1" fill="${z>=0?navy:orange}"/>`);
    h+=svgText(30,414,final?'Final α ≈ 54.74° · β = 45°':'Hold A fixed. Retain the temporary endpoints.',muted,12);
    svg.innerHTML=h;
  }
  rotationDiagram($('#rotation-initial-svg'));rotationDiagram($('#rotation-final-svg'),true);
  loadCase(1);
})();

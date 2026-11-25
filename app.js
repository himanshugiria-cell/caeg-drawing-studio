'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const svgNS='http://www.w3.org/2000/svg';
const fmt=(n,d=2)=>new Intl.NumberFormat('en',{maximumFractionDigits:d}).format(n);
function points(a){return a.map(p=>p.join(',')).join(' ')}
function makeHero(){
 const p=(x,y,z)=>[320+(x-y)*4.7,305+(x+y)*2.35-z*4.7];
 const poly=(a,fill)=>`<polygon points="${points(a.map(v=>p(...v)))}" fill="${fill}" stroke="#244c62" stroke-width="1.6" stroke-linejoin="round"/>`;
 const dim=(a,b,label,offset)=>{const A=p(...a),B=p(...b),a2=[A[0]+offset[0],A[1]+offset[1]],b2=[B[0]+offset[0],B[1]+offset[1]];return `<path d="M${A} L${a2} M${B} L${b2} M${a2} L${b2}" fill="none" stroke="#ba6548" stroke-width="1"/><path d="M${a2[0]-4},${a2[1]-6}l8 12 M${b2[0]-4},${b2[1]-6}l8 12" stroke="#ba6548" stroke-width="1"/><text x="${(a2[0]+b2[0])/2+4}" y="${(a2[1]+b2[1])/2-10}" fill="#a65033" font-size="15" text-anchor="middle">${label}</text>`};
 $('#hero-drawing').innerHTML=`<defs><pattern id="iso-grid" width="47" height="23.5" patternUnits="userSpaceOnUse"><path d="M0 0 47 23.5 M0 23.5 47 0" stroke="#b9cac21f" fill="none"/></pattern></defs><rect width="700" height="560" fill="url(#iso-grid)"/><path d="M110 432 352 312 609 440 M320 82v390" stroke="#aebfb5" stroke-dasharray="5 6" fill="none"/>
 ${poly([[0,0,20],[30,0,20],[30,30,20],[0,30,20]],'#e5ebe4')}
 ${poly([[0,30,0],[50,30,0],[50,30,40],[30,30,40],[30,30,20],[0,30,20]],'#f1f1e7')}
 ${poly([[50,0,0],[50,30,0],[50,30,40],[50,0,40]],'#c6d5ce')}
 ${poly([[30,0,40],[50,0,40],[50,30,40],[30,30,40]],'#e0e7dd')}
 ${dim([0,30,0],[50,30,0],'50',[0,48])}
 ${dim([50,0,0],[50,30,0],'30',[42,25])}
 ${dim([50,0,0],[50,0,40],'40',[55,-3])}
 <path d="M163 137H405L461 188" stroke="#244c62" stroke-width="1" fill="none"/><text x="101" y="130" fill="#3d655c" font-size="11" letter-spacing="1">VISIBLE EDGES</text><circle cx="461" cy="188" r="2.6" fill="#c45b38"/><text x="73" y="504" fill="#667d70" font-size="10">THREE DIMENSIONS, ONE OBJECT</text><text x="622" y="504" fill="#a65033" font-size="11" text-anchor="end">50 × 30 × 40</text>`;
}
makeHero();
function projection(mode='first'){
 const first=mode==='first', topY=first?435:82, sideX=first?135:655;
 $('#projection-mode-label').textContent=first?'FIRST ANGLE':'THIRD ANGLE';
 $('#projection-explanation').textContent=first?'The object lies between the observer and the plane. The top view goes below the front view. The right-side view goes to its left.':'The plane lies between the observer and the object. The top view goes above the front view. The right-side view goes to its right.';
 const s=$('#projection-svg');s.setAttribute('aria-label',`${first?'First':'Third'}-angle arrangement. Front view at the centre, top view ${first?'below':'above'}, right-side view to the ${first?'left':'right'}.`);
 s.innerHTML=`<defs><marker id="dim-arrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto-start-reverse"><path d="m0 0 7 3.5L0 7" fill="#c45b38"/></marker></defs><path class="guide" d="M355 125V525 M505 125V525 M45 210h690 M45 330h690"/>
 <g class="view-group" transform="translate(430,270)"><path class="view-shape" d="M-75 60H75V-60H15V0H-75Z"/><text class="label" x="0" y="89" text-anchor="middle">FRONT VIEW</text><path class="dimension" d="M-75 100v15 M75 100v15 M-71 110H71" marker-start="url(#dim-arrow)" marker-end="url(#dim-arrow)"/><text class="dim-label" x="0" y="133" text-anchor="middle">50 mm</text></g>
 <g class="view-group" transform="translate(430,${topY})"><rect class="view-shape" x="-75" y="-45" width="150" height="90"/><path class="edge" d="M15-45v90"/><text class="label" x="0" y="69" text-anchor="middle">TOP VIEW</text></g>
 <g class="view-group" transform="translate(${sideX},270)"><rect class="view-shape" x="-45" y="-60" width="90" height="120"/><path class="hidden" d="M-45 0h90"/><text class="label" x="0" y="89" text-anchor="middle">RIGHT-SIDE VIEW</text><text class="dim-label" transform="translate(68 0) rotate(-90)" text-anchor="middle">40 mm</text></g>
 <text class="label" x="37" y="550">WIDTH = 50</text><text class="label" x="300" y="550">DEPTH = 30</text><text class="label" x="560" y="550">HEIGHT = 40</text>`;
}
$$('input[name=projection]').forEach(el=>el.addEventListener('change',()=>projection(el.value)));projection();
const tabs=$$('.studio-tabs [role=tab]');
function activateTab(name,focus=false){tabs.forEach(b=>{const active=b.dataset.tab===name;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;$('#panel-'+b.dataset.tab).hidden=!active;if(active&&focus)b.focus();});}
tabs.forEach((b,i)=>{b.addEventListener('click',()=>activateTab(b.dataset.tab));b.addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();let next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length;activateTab(tabs[next].dataset.tab,true);});});
function pathForConic(e,start,end,sign,X,Y){let d='';for(let i=0;i<=350;i++){let x=start+(end-start)*i/350;let yy=(e*x)**2-(x-50)**2;if(yy<-.0001)continue;let p=[X(x),Y(sign*Math.sqrt(Math.max(0,yy)))];d+=(d?'L':'M')+p.map(v=>v.toFixed(3)).join(' ');}return d;}
function conic(e){
 const kind=Math.abs(e-1)<1e-6?'Parabola':e<1?'Ellipse':'Hyperbola';
 const exactE=Math.abs(e-2/3)<1e-7?'2/3':fmt(e,2);
 const V=50/(1+e),station=V+10,r=e*station,yp=Math.sqrt(Math.max(0,r*r-(station-50)**2));
 const X=x=>75+x*2.3,Y=y=>220-y*2.3,end=e<1?Math.min(260,50/(1-e)):260;
 $('#e-value').textContent=exactE;$('#conic-label').textContent=kind.toUpperCase()+' / e = '+exactE;
 $('#vertex-value').textContent=fmt(V)+' mm';$('#station-value').textContent=fmt(station)+' mm';$('#radius-value').textContent=fmt(r)+' mm';
 $('#conic-explanation').textContent=`${kind}: ${e<1?'0 < e < 1':Math.abs(e-1)<1e-6?'e = 1':'e > 1'}. At the vertex, VF ÷ VA = e. The first ordinate gives a compass radius of ${fmt(r)} mm.`;
 $('#curve-window-note').textContent=e<1?(50/(1-e)<=260?'The ellipse closes at its second vertex on the axis.':'This window shows part of the ellipse. Continue to the second vertex to close the curve.'):Math.abs(e-1)<1e-6?'The parabola continues beyond this window. Plot enough points for the required portion.':'The branch through V is shown. A complete hyperbola has a second, separate branch.';
 $$('.preset-row button').forEach(b=>{const active=Math.abs(Number(b.dataset.e)-e)<.001;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 const s=$('#conic-svg');s.setAttribute('aria-label',`${kind} with eccentricity ${exactE}, focus F 50 millimetres from directrix CD, vertex V ${fmt(V)} millimetres from A.`);
 s.innerHTML=`<defs><clipPath id="conic-clip"><rect x="34" y="22" width="635" height="360"/></clipPath></defs><g clip-path="url(#conic-clip)"><path d="M75 25V380" stroke="#244c62" stroke-width="1.7"/><path d="M50 220H675" stroke="#8eaa98" stroke-width="1"/>
 <path d="M75 220L${X(260)} ${Y(e*260)}" stroke="#a9bda9" stroke-width="1.4"/><path d="M${X(V)} 220V${Y(e*V)}" stroke="#a9bda9" stroke-width="1.2"/><circle cx="${X(V)}" cy="${Y(e*V)}" r="2.8" fill="#5b7d65"/><text x="${X(V)-14}" y="${Y(e*V)-5}" font-size="11" fill="#5b7d65">E</text><path d="M${X(station)} 380V22" stroke="#a9bda9" stroke-dasharray="5 6"/><circle cx="${X(50)}" cy="220" r="${r*2.3}" fill="none" stroke="#c45b38" stroke-width="1" stroke-dasharray="5 5"/>
 <path d="${pathForConic(e,V,end,1,X,Y)}" fill="none" stroke="#214d68" stroke-width="2.8"/><path d="${pathForConic(e,V,end,-1,X,Y)}" fill="none" stroke="#214d68" stroke-width="2.8"/>
 <path d="M${X(50)} 220L${X(station)} ${Y(yp)}" stroke="#c45b38" stroke-width="1.6"/>
 <circle cx="${X(station)}" cy="${Y(yp)}" r="4" fill="#c45b38"/><circle cx="${X(station)}" cy="${Y(-yp)}" r="4" fill="#c45b38"/>
 <circle cx="${X(50)}" cy="220" r="3.5" fill="#c45b38"/><circle cx="${X(V)}" cy="220" r="3.5" fill="#214d68"/><circle cx="75" cy="220" r="2.8" fill="#214d68"/>
 <text x="${X(station)+9}" y="${Y(yp)-6}" font-size="12" fill="#aa5034">P₁</text><text x="${X(station)+8}" y="${Y(-yp)+16}" font-size="12" fill="#aa5034">P₁′</text><text x="${X(station)-10}" y="${Y(e*station)-10}" font-size="11" fill="#5b7d65">Q₁</text>
 </g><text x="57" y="30" font-size="12" fill="#244c62">C</text><text x="57" y="386" font-size="12" fill="#244c62">D</text><text x="59" y="242" font-size="12" fill="#244c62">A</text><text x="${X(V)-10}" y="242" font-size="12" fill="#214d68">V</text><text x="${X(50)+4}" y="242" font-size="12" fill="#aa5034">F</text><text x="${X(station)-4}" y="263" font-size="11" fill="#5b7d65">1</text><text x="592" y="212" font-size="11" fill="#5b7d65">AXIS</text><text x="96" y="414" font-size="11" fill="#5b7d65">DIRECTRIX CD</text><text x="340" y="414" font-size="11" fill="#5b7d65">FOCUS F STAYS FIXED</text>`;
}
$('#eccentricity').addEventListener('input',e=>conic(Number(e.target.value)));$$('[data-e]').forEach(b=>b.addEventListener('click',()=>{$('#eccentricity').value=b.dataset.e;conic(Number(b.dataset.e));}));conic(1);
function scale(){
 const n=Number($('#rf-numerator').value),d=Number($('#rf-denominator').value),m=Number($('#max-length').value),unit=$('#scale-unit').value,conversion={mm:1,cm:10,dm:100,m:1000};
 const valid=Number.isFinite(n)&&Number.isFinite(d)&&Number.isFinite(m)&&n>0&&d>0&&m>0&&$('#scale-form').checkValidity()&&Number.isFinite(n/d*m*conversion[unit]);
 $('#scale-error').hidden=valid;
 if(!valid){$('#scale-error').textContent='Enter positive numbers within the allowed input ranges.';$('#scale-result').textContent='—';$('#scale-working').textContent='Check the entries to calculate the length.';$('#scale-svg').innerHTML='';return;}
 const actual=m*conversion[unit],length=n/d*actual,step=m/5;
 $('#scale-result').innerHTML=fmt(length)+' <small>mm</small>';$('#scale-working').textContent=`(${fmt(n)} ÷ ${fmt(d)}) × ${fmt(actual)} mm = ${fmt(length)} mm`;
 $('#scale-type').textContent=n===d?'FULL-SIZE SCALE':n<d?'REDUCING SCALE':'ENLARGING SCALE';
 let divisions='';for(let i=0;i<=5;i++){let x=70+i*112;divisions+=`<path d="M${x} 60v30" stroke="#214d68" stroke-width="1.5"/><text x="${x}" y="119" font-size="13" fill="#214d68" text-anchor="middle">${i===0?fmt(step):fmt((i-1)*step)}</text>`;if(i<5&&i%2)divisions+=`<rect x="${x}" y="70" width="112" height="10" fill="#214d68"/>`;}
 for(let i=1;i<10;i++){let x=70+i*11.2;divisions+=`<path d="M${x} 60v30" stroke="#214d68" stroke-width=".8"/>`;if(i%2===0)divisions+=`<rect x="${x}" y="70" width="11.2" height="10" fill="#214d68"/>`;}
 $('#scale-svg').innerHTML=`<rect x="70" y="60" width="560" height="30" fill="none" stroke="#214d68" stroke-width="1.5"/>${divisions}<text x="70" y="154" font-size="10" fill="#69746d">10 SUBDIVISIONS</text><text x="630" y="154" font-size="10" fill="#69746d" text-anchor="end">UNITS: ${unit.toUpperCase()}</text>`;
}
$('#scale-form').addEventListener('submit',e=>e.preventDefault());$$('#scale-form input, #scale-form select').forEach(el=>el.addEventListener('input',scale));scale();
const units=[
 ['CAD fundamentals','CAD interface, drawing area, coordinate system, command line and status bar. Zooming, selecting and erasing objects.'],
 ['Isometric views','Isometric views of lines and planes, simple solids and compound solids.'],
 ['Drawing principles & conventions','Drawing instruments, sheet layout and title block. Lettering, types of lines and dimensioning systems.'],
 ['Engineering scales','Representative fraction, types of scales and length of scale. Plain, diagonal and vernier scales.'],
 ['Conic sections','Ellipse, parabola and hyperbola by the eccentricity method. Paper construction and the allocated AutoCAD drawing.'],
 ['Projection systems','Meaning and types of projection. First-angle and third-angle methods, projection symbols and arrangement of views.'],
 ['Projections of points','Positions of a point, notation and a systematic approach to front and top views. The manual specifies one AutoCAD drawing and one sketchbook assignment.'],
 ['Projections of lines','Lines parallel, perpendicular or inclined to reference planes. Lines inclined to both planes and traces of a line.'],
 ['Projections of planes: basics','Plane figures parallel, perpendicular or inclined to the reference planes.'],
 ['Planes inclined to both planes','True shape, distance of a point from a plane and angle between two planes.'],
 ['Projections of regular solids','Basic solids, frustums and truncated solids. Inclinations to the reference planes and auxiliary views.'],
 ['Sections of solids','Theory of sectioning. Sections of prisms, cubes, pyramids, tetrahedra, cylinders, cones and spheres.']];
$('#course-list').innerHTML=units.map((u,i)=>`<details id="unit-${i+1}" ${i===9?'open':''}><summary><span class="unit-number">${String(i+1).padStart(2,'0')}</span><span class="unit-title">${u[0]}</span><span class="unit-marker" aria-hidden="true">+</span></summary><div>${u[1]}${i===6?'<br><a href="experiment-07.html">Open the interactive point-projection lesson ↗</a>':''}${i===7?'<br><a href="experiment-08.html">Open the interactive line-projection lesson ↗</a>':''}${i===8?'<br><a href="experiment-09.html">Open the interactive plane-projection lesson ↗</a>':''}${i===9?'<br><a href="experiment-10.html">Open the inclined-plane lesson ↗</a>':''}${i===10?'<br><a href="materials/CAEG_Experiment_11.pdf">Open the classroom slides ↗</a>':''}${i>=3&&i<=10?'<br><a href="#library">Find the classroom materials ↗</a>':''}</div></details>`).join('');
const materials=[
 {unit:'06–11',title:'Post-midsemester revision PDF',description:'Experiments 6–11 in one file, with a linked contents page.',type:'pdf',file:'CAEG_Post_Midsemester_Revision.pdf'},
 {unit:'11',title:'Projections of regular solids',description:'14 theory slides with the worked square pyramid, axis inclinations, auxiliary views and frustums.',type:'pptx',file:'CAEG_Experiment_11.pptx'},
 {unit:'10',title:'Planes inclined to both RPs: classroom slides',description:'42 slides with the manual rectangle, true shape, distance, angle and AutoCAD.',type:'pptx',file:'planes-advanced.pptx'},
 {unit:'10',title:'Inclined planes: student notes',description:'Complete step-by-step learning material, solved examples, practice and viva.',type:'pdf',file:'planes-advanced-notes.pdf'},
 {unit:'09',title:'Projection of planes: classroom slides',description:'True shape, edge view, manual square and pentagon constructions.',type:'pptx',file:'planes.pptx'},
 {unit:'09',title:'Projection of planes: student notes',description:'Step-by-step constructions, practice, answers and viva.',type:'pdf',file:'planes-notes.pdf'},
 {unit:'08',title:'Projections of lines',description:'A step-by-step classroom lesson with eight official manual examples, true and apparent angles, projections and traces.',type:'pptx',file:'lines.pptx'},
 {unit:'08',title:'Projections of lines: student notes',description:'Complete construction notes, solved examples, AutoCAD coordinates and practice with answers.',type:'pdf',file:'lines-notes.pdf'},
 {unit:'07',title:'Projections of points',description:'36 classroom slides with progressive construction, all eight manual examples P–W, AutoCAD coordinates and self-check answers.',type:'pptx',file:'points.pptx'},
 {unit:'06',title:'Projection systems',description:'26 classroom slides covering first angle, third angle, symbols and the manual’s worked example.',type:'pptx',file:'projections.pptx'},
 {unit:'05',title:'Conic sections',description:'A classroom presentation covering the eccentricity method and construction of ellipse, parabola and hyperbola.',type:'pptx',file:'conic-sections.pptx'},
 {unit:'05',title:'Conic sections: student notes',description:'Nine pages of worked constructions, point 1 selection, applications and self-check answers.',type:'pdf',file:'conic-notes.pdf'},
 {unit:'04',title:'Plain & diagonal scales',description:'Step-by-step manual constructions using the lab manual examples.',type:'pptx',file:'scales.pptx'}];
let resourceFilter='all';
function renderResources(){const q=$('#resource-search').value.trim().toLowerCase();const terms=q.split(/\s+/).filter(Boolean).map(t=>t.length>3?t.replace(/s$/,''):t);let a=materials.filter(r=>{const haystack=(r.title+' '+r.description+' '+r.unit+' '+Number(r.unit)+' unit experiment '+r.type).toLowerCase();return(resourceFilter==='all'||r.type===resourceFilter)&&terms.every(t=>haystack.includes(t));});$('#resources').innerHTML=a.length?a.map(r=>`<article class="resource-row"><span class="resource-icon" aria-hidden="true">${r.type.toUpperCase()}</span><div><p class="resource-meta">UNIT ${r.unit} / ${r.type==='pdf'?'STUDENT NOTES':'CLASSROOM PRESENTATION'}</p><h3>${r.title}</h3><p class="resource-description">${r.description}</p></div><a class="resource-link" href="materials/${r.file}" ${r.type==='pdf'?'target="_blank" rel="noopener"':'download'} aria-label="${r.type==='pdf'?'Open':'Download'} ${r.title}">${r.type==='pdf'?'Open notes':'Download slides'} <span aria-hidden="true">${r.type==='pdf'?'↗':'↓'}</span></a></article>`).join(''):'<p class="empty-resources">No materials match this search. Try “scales”, “conic” or “projections”.</p>';$('#resource-count').textContent=`${a.length} ${a.length===1?'resource':'resources'} shown`;}
$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{resourceFilter=b.dataset.filter;$$('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});renderResources();}));$('#resource-search').addEventListener('input',renderResources);renderResources();
const viva=[
 [1,'What does CAD stand for? Why do engineers use it?','Computer-Aided Design. It helps create, modify and communicate accurate drawings and designs.'],
 [1,'What is the purpose of the command line?','It accepts commands, coordinates and values, and displays prompts from the CAD software.'],
 [1,'Which commands draw a straight line and a circle?','LINE and CIRCLE. Their usual aliases are L and C.'],
 [1,'What is the difference between MOVE and COPY?','MOVE changes the position of an object. COPY creates another instance while retaining the original.'],
 [1,'What does OFFSET do?','It creates a parallel or concentric object at a specified distance.'],
 [1,'Does ZOOM change the actual size of an object?','ZOOM changes the displayed magnification. SCALE changes the size of the drawing object.'],
 [2,'What is an isometric view?','A pictorial representation showing three dimensions with equal scale along the three principal axes.'],
 [2,'What is the angle between two isometric axes?','120°. In the usual orientation, one axis is vertical and the other two lie at 30° to the horizontal.'],
 [2,'What is an isometric line?','A line parallel to one of the three isometric axes.'],
 [2,'How do you draw a non-isometric line?','Locate its endpoints using distances along the isometric axes, then join them.'],
 [2,'How does a circle on an isometric plane generally appear?','As an ellipse. An enclosing isometric rhombus helps with the construction.'],
 [2,'What is a compound solid?','A combination of two or more simple solids, such as a cylinder mounted on a cube.'],
 [3,'Why is engineering drawing a graphical language?','It communicates shape, size and other details through standard lines, symbols, views and dimensions.'],
 [3,'How do a compass and a divider differ?','A compass draws circles and arcs. A divider transfers distances or divides lengths.'],
 [3,'Where is the title block located?','Usually at the bottom-right corner within the drawing space. It contains the drawing title, number, scale and identification details.'],
 [3,'What makes lettering clear?','Legibility and uniformity of letter height, style and spacing.'],
 [3,'Which lines represent visible, hidden and centre features?','Visible edges use continuous wide lines. Hidden edges use dashed narrow lines. Centre lines use long-dashed dotted narrow lines.'],
 [3,'How do dimension lines and extension lines differ?','A dimension line indicates the measured distance. Extension lines identify the features between which that distance is measured.'],
 [4,'What is representative fraction?','R.F. is drawing length divided by corresponding actual length, with both in the same unit. It has no unit.'],
 [4,'How do you identify a reducing scale?','Its R.F. is less than 1. Full-size scales have R.F. = 1, while enlarging scales have R.F. greater than 1.'],
 [4,'Find the scale length for R.F. 1:4 and a maximum of 5 dm.','5 dm = 500 mm. Scale length = (1 ÷ 4) × 500 = 125 mm.'],
 [4,'Why is zero placed after the first main division?','The first division, to the left of zero, provides smaller subdivisions. Read main units to the right.'],
 [4,'How does a diagonal scale differ from a plain scale?','A plain scale commonly reads a unit and its immediate subdivision. A diagonal scale adds a finer subdivision using similar triangles.'],
 [4,'What is the least count of a vernier scale?','The smallest measurement it can resolve. For the verniers in the manual, it is the magnitude of the difference between one main-scale division and one vernier-scale division.'],
 [5,'How does eccentricity classify a conic?','Ellipse: 0 < e < 1. Parabola: e = 1. Hyperbola: e > 1. A circle has e = 0.'],
 [5,'What are the focus, directrix and eccentricity?','The focus F is a fixed point. The directrix is a fixed straight line. At a curve point P, e = PF ÷ PM, where PM is perpendicular to the directrix.'],
 [5,'With AF = 50 mm, where is the near vertex in our examples?','Parabola, e = 1: AV = 25 mm. Ellipse, e = 2/3: AV = 30 mm. Hyperbola, e = 3/2: AV = 20 mm.'],
 [5,'Why do we draw VE = VF and join A to E?','It makes VE ÷ VA equal to the eccentricity. The extended line AE gives the compass radius at each selected station.'],
 [5,'How do you choose mark 1 and locate its curve points?','Choose a suitable station to the right of V. Measure the axis-to-AE length at that station. Centre the compass at F and cut its perpendicular above and below the axis.'],
 [5,'Give an application of each conic.','Parabola: axial section of a dish antenna reflector. Ellipse: pitch curves of elliptical gears. Hyperbola: axial profile of a hyperboloid cooling tower.']];
let questions=[...viva],questionIndex=0;
function renderViva(){const q=questions[questionIndex];$('#viva-topic').textContent=`EXPERIMENT ${String(q[0]).padStart(2,'0')} / ${units[q[0]-1][0].toUpperCase()}`;$('#viva-counter').textContent=`QUESTION ${String(questionIndex+1).padStart(2,'0')} / ${questions.length}`;$('#viva-question').textContent=q[1];$('#viva-answer').textContent=q[2];$('#viva-answer').hidden=true;$('#reveal-answer').setAttribute('aria-expanded','false');$('#reveal-answer').innerHTML='Reveal the answer <span aria-hidden="true">+</span>';$('#previous-question').disabled=questionIndex===0;$('#next-question').disabled=questionIndex===questions.length-1;}
$('#viva-unit').addEventListener('change',e=>{questions=viva.filter(q=>e.target.value==='all'||q[0]===Number(e.target.value));questionIndex=0;renderViva();});
$('#reveal-answer').addEventListener('click',()=>{const show=$('#viva-answer').hidden;$('#viva-answer').hidden=!show;$('#reveal-answer').setAttribute('aria-expanded',String(show));$('#reveal-answer').innerHTML=show?'Hide the answer <span aria-hidden="true">−</span>':'Reveal the answer <span aria-hidden="true">+</span>';});
$('#previous-question').addEventListener('click',()=>{if(questionIndex>0){questionIndex--;renderViva();}});$('#next-question').addEventListener('click',()=>{if(questionIndex<questions.length-1){questionIndex++;renderViva();}});
$('#shuffle-viva').addEventListener('click',()=>{for(let i=questions.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[questions[i],questions[j]]=[questions[j],questions[i]];}questionIndex=0;renderViva();});renderViva();

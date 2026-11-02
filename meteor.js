(() => {
  "use strict";
  const canvas=document.getElementById("meteor-canvas");
  if(!canvas)return;
  const ctx=canvas.getContext("2d");
  const button=document.getElementById("meteor-start");
  const scoreEl=document.getElementById("meteor-score");
  const bestEl=document.getElementById("meteor-best");
  const timeEl=document.getElementById("meteor-time");
  const message=document.getElementById("meteor-message");
  const W=canvas.width,H=canvas.height,DURATION=30000;
  const BEST_KEY="lumina-meteor-best-v1";
  let best=0;
  try {best=Math.max(0,Math.min(9999,Number(localStorage.getItem(BEST_KEY))||0))}catch{}
  bestEl.textContent=String(best).padStart(2,"0");
  let active=false,score=0,misses=0,meteors=[],particles=[],elapsed=0,lastFrame=0,lastSpawn=0,raf=0;
  let bgSeed=90712;
  const random=()=>{bgSeed=(bgSeed*1664525+1013904223)>>>0;return bgSeed/4294967296};
  const distantStars=Array.from({length:64},()=>({x:random()*W,y:random()*H,r:random()*1.7+.6,a:random()*.6+.3}));
  const updateHud=()=>{
    scoreEl.textContent=String(score).padStart(2,"0");
    bestEl.textContent=String(Math.max(best,score)).padStart(2,"0");
    timeEl.textContent=Math.max(0,Math.ceil((DURATION-elapsed)/1000))+"s";
  };
  const burst=(x,y)=>{
    for(let j=0;j<11;j++){
      const a=(j/11)*Math.PI*2, v=50+Math.random()*70;
      particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.65});
    }
  };
  const spawn=()=>{
    const x=40+Math.random()*(W-80);
    meteors.push({x,y:-26,r:17+Math.random()*11,speed:85+Math.random()*75,phase:Math.random()*6.28});
  };
  const paint=()=>{
    const gradient=ctx.createLinearGradient(0,0,0,H);
    gradient.addColorStop(0,"#111d42");gradient.addColorStop(1,"#354774");
    ctx.fillStyle=gradient;ctx.fillRect(0,0,W,H);
    for(const s of distantStars){
      ctx.globalAlpha=s.a;ctx.fillStyle="#e8dbf9";
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
    ctx.strokeStyle="#d8cefa22";ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(W/2,H/2,280,155,-.25,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.ellipse(W/2,H/2,230,100,-.25,0,Math.PI*2);ctx.stroke();
    for(const m of meteors){
      ctx.save();
      ctx.globalAlpha=.45;
      const trail=ctx.createLinearGradient(m.x,m.y-65,m.x,m.y+9);
      trail.addColorStop(0,"#fde7b400");trail.addColorStop(1,"#ffe4b6c0");
      ctx.strokeStyle=trail;ctx.lineWidth=5;
      ctx.beginPath();ctx.moveTo(m.x-13,m.y-68);ctx.lineTo(m.x,m.y);ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.translate(m.x,m.y);ctx.rotate(Math.sin(elapsed/560+m.phase)*.2);
      ctx.shadowColor="#ffe6b5";ctx.shadowBlur=20;ctx.fillStyle="#fff0c7";
      ctx.beginPath();
      for(let i=0;i<8;i++){
        const a=Math.PI*i/4-Math.PI/2;
        const r=i%2?m.r*.43:m.r;
        const x=Math.cos(a)*r,y=Math.sin(a)*r;
        if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.closePath();ctx.fill();
      ctx.shadowBlur=0;ctx.restore();
    }
    for(const p of particles) {
      ctx.globalAlpha=Math.max(0,p.life/.65);
      ctx.fillStyle="#ffedb5";ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
    if(!active){
      ctx.fillStyle="#0c1536a6";
      ctx.fillRect(0,0,W,H);
      ctx.fillStyle="#fff1d6";ctx.textAlign="center";
      ctx.font="600 42px Outfit,sans-serif";ctx.fillText("✦",W/2,177);
      ctx.font="600 23px 'Noto Sans JP',sans-serif";ctx.fillText(score>0?"星たち、ありがとう！":"流れ星を集めよう",W/2,238);
      ctx.font="500 14px 'Noto Sans JP',sans-serif";ctx.fillText("上のボタンからスタート",W/2,273);
      ctx.textAlign="start";
    }
  };
  const finish=()=>{
    active=false;cancelAnimationFrame(raf);
    if(score>best){
      best=score;
      try {localStorage.setItem(BEST_KEY,String(best))} catch {}
      message.textContent="✦ 新記録！ "+score+"個の星を集めたよ。おめでとう！";
    }else{
      message.textContent="✧ "+score+"個の星を集めたよ。また一緒に遊ぼう！";
    }
    button.textContent="もう一度チャレンジ ↻";
    updateHud();paint();
  };
  const animate=now=>{
    if(!active)return;
    const dt=Math.min((now-lastFrame)/1000,.06);
    lastFrame=now;elapsed+=dt*1000;
    if(elapsed-lastSpawn>530){spawn();lastSpawn=elapsed;}
    meteors.forEach(m=>m.y+=m.speed*dt);
    const before=meteors.length;
    meteors=meteors.filter(m=>m.y<H+40);
    misses+=before-meteors.length;
    particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;});
    particles=particles.filter(p=>p.life>0);
    updateHud();paint();
    if(elapsed>=DURATION){elapsed=DURATION;finish();return;}
    raf=requestAnimationFrame(animate);
  };
  const start=()=>{
    cancelAnimationFrame(raf);
    active=true;score=0;misses=0;elapsed=0;lastSpawn=-400;
    meteors=[];particles=[];
    lastFrame=performance.now();
    message.textContent="落ちてくる星をつかまえてね！";
    button.textContent="最初からやり直す ↻";
    canvas.focus({preventScroll:true});
    updateHud();raf=requestAnimationFrame(animate);
  };
  const catchAt=(x,y,keyboard=false)=>{
    if(!active)return false;
    let chosen=-1,nearest=Infinity;
    meteors.forEach((m,i)=>{
      const d=Math.hypot(m.x-x,m.y-y);
      if(d<nearest){nearest=d;chosen=i;}
    });
    if(chosen<0 || (!keyboard && nearest>meteors[chosen].r+19)) return false;
    const m=meteors.splice(chosen,1)[0];
    score++;burst(m.x,m.y);
    if(score===1)message.textContent="✦ いい調子！ このまま星を集めよう。";
    else if(score===10)message.textContent="✳ 10個達成！ ルミナも驚いているよ。";
    updateHud();paint();
    return true;
  };
  canvas.addEventListener("pointerdown",event=>{
    const rect=canvas.getBoundingClientRect();
    catchAt((event.clientX-rect.left)*W/rect.width,(event.clientY-rect.top)*H/rect.height);
  });
  canvas.addEventListener("keydown",event=>{
    if(event.code==="Space"||event.code==="Enter"){
      event.preventDefault();
      if(!active){start();return;}
      // Assistive keyboard mode: catch the lowest currently falling star.
      if(meteors.length){
        const nearest=meteors.reduce((a,b)=>a.y>b.y?a:b);
        catchAt(nearest.x,nearest.y,true);
      }
    }
  });
  button.addEventListener("click",start);
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden&&active)finish();
  });
  updateHud();paint();
})();

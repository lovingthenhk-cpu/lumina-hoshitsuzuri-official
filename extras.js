(() => {
  "use strict";

  // Only anonymous progress is saved. We never store messages, names or postcards.
  const STORE_KEY = "lumina-star-passport-v1";
  const skyModeButton = document.getElementById("sky-mode-toggle");
  let skyMode="night";
  try { skyMode = localStorage.getItem("lumina-sky-mode")==="aurora"?"aurora":"night"; } catch {}
  const updateSkyMode = () => {
    document.body.classList.toggle("sky-aurora",skyMode==="aurora");
    skyModeButton.setAttribute("aria-pressed",String(skyMode==="aurora"));
    skyModeButton.textContent = skyMode==="aurora"?"☾ NIGHT":"☀ AURORA";
  };
  skyModeButton.addEventListener("click",()=>{
    skyMode=skyMode==="aurora"?"night":"aurora";
    try{localStorage.setItem("lumina-sky-mode",skyMode)}catch{}
    updateSkyMode();
  });
  updateSkyMode();
  if("serviceWorker" in navigator && window.isSecureContext) {
    window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
  }
  document.getElementById("share-site").addEventListener("click",async()=>{
    const url="https://lovingthenhk-cpu.github.io/lumina-hoshitsuzuri-official/";
    try {
      if(navigator.share) {
        await navigator.share({title:"星綴ルミナ公式サイト",text:"星の郵便局へようこそ！",url});
      } else if(navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        const btn=document.getElementById("share-site");
        btn.textContent="✓ COPIED";
        setTimeout(()=>btn.textContent="✧ SHARE",2600);
      } else {
        window.prompt("URLをコピーしてください",url);
      }
    } catch { /* User cancelled or permission denied: do not claim success. */ }
  });
  const toast=document.getElementById("stamp-toast");
  let toastTimeout=0;
  const announceStamp = name => {
    clearTimeout(toastTimeout);
    toast.textContent="✦ 新しい切手を獲得！  "+name;
    toast.hidden=false;
    toastTimeout=setTimeout(()=>{toast.hidden=true},4500);
  };

  const STAMP_KEYS = ["visitor", "explorer", "oracle", "quiz", "postcard", "letter"];
  const initial = { stamps: [], visited: [0] };
  const readProgress = () => {
    try {
      const value = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (!value || !Array.isArray(value.stamps) || !Array.isArray(value.visited)) return { ...initial, stamps: [], visited: [0] };
      return {
        stamps: value.stamps.filter(k => STAMP_KEYS.includes(k)),
        visited: value.visited.filter(n => Number.isInteger(n) && n >= 0 && n <= 5)
      };
    } catch { return { ...initial, stamps: [], visited: [0] }; }
  };
  let progress = readProgress();
  const saveProgress = () => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(progress)); } catch { /* private mode: memory-only */ }
  };
  const progressStatus = document.getElementById("collection-status");
  const drawStamps = () => {
    document.querySelectorAll("[data-stamp]").forEach(el => {
      const unlocked = progress.stamps.includes(el.dataset.stamp);
      el.classList.toggle("is-unlocked", unlocked);
      el.setAttribute("aria-label", el.querySelector("strong").textContent + (unlocked ? "、獲得済み" : "、未獲得"));
    });
    document.getElementById("stamps-count").textContent = progress.stamps.length + " / " + STAMP_KEYS.length;
  };
  const unlock = key => {
    if (!STAMP_KEYS.includes(key) || progress.stamps.includes(key)) return;
    progress.stamps.push(key);
    saveProgress();
    drawStamps();
    const name=document.querySelector('[data-stamp="' + key + '"] strong').textContent;
    progressStatus.textContent = "新しい切手を獲得しました: " + name;
    if (key!=="visitor") announceStamp(name);
  };
  drawStamps();
  unlock("visitor");
  document.getElementById("collection-reset").addEventListener("click", () => {
    const confirmed = window.confirm("星図の発見記録と切手の進捗をリセットしますか？");
    if (!confirmed) return;
    progress = { stamps: [], visited: [0] };
    saveProgress();
    drawStamps();
    updateMap();
    progressStatus.textContent = "星のパスポートをリセットしました。";
  });

  const places = [
    {name:"星の郵便局",en:"STAR POST OFFICE",icon:"✉",description:"星明かりの入った封筒が、毎晩届く場所。ルミナはここから、誰かの大切な気持ちを届けに旅立ちます。"},
    {name:"月の図書室",en:"MOONLIGHT LIBRARY",icon:"☾",description:"月の裏側にある、眠らない図書室。まだ書かれていない物語のページが、空白のまま誰かを待っています。"},
    {name:"流星駅",en:"METEOR TERMINAL",icon:"✦",description:"一晩に一度だけ、星の列車が停まる小さな駅。落とし物の傘は、たいてい彗星のしっぽでできています。"},
    {name:"夜明けの庭",en:"DAWN GARDEN",icon:"❁",description:"朝が来る直前にだけ咲く光の花。ルミナはここで、届け終えた手紙の数だけ花を数えるのが好き。"},
    {name:"忘れもの雲",en:"LOST & FOUND CLOUD",icon:"☁",description:"言いそびれた『ありがとう』や、失くした夢がふわふわ漂う雲。星の郵便局が届け先を探しています。"},
    {name:"星くず喫茶",en:"STARDUST TEA ROOM",icon:"☕",description:"いつでもミルクティーが温かい喫茶室。名物は三日月クッキー。配達終わりのルミナがよく寄り道します。"}
  ];
  let selectedPlace = 0;
  const updateMap = () => {
    const p = places[selectedPlace];
    document.getElementById("place-index").textContent = "LOCATION / " + String(selectedPlace+1).padStart(2,"0");
    document.getElementById("place-name").textContent = p.name;
    document.getElementById("place-subname").textContent = p.en;
    document.getElementById("place-icon").textContent = p.icon;
    document.getElementById("place-description").textContent = p.description;
    const unique = new Set(progress.visited);
    document.getElementById("map-progress").textContent = unique.size + " / 6";
    document.getElementById("map-progress-fill").style.width = (unique.size / 6 * 100) + "%";
    document.querySelectorAll("[data-place]").forEach(btn => {
      const active = Number(btn.dataset.place) === selectedPlace;
      btn.classList.toggle("is-selected",active);
      btn.setAttribute("aria-pressed",String(active));
    });
  };
  document.querySelectorAll("[data-place]").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedPlace = Number(btn.dataset.place);
      if (!progress.visited.includes(selectedPlace)) { progress.visited.push(selectedPlace); saveProgress(); }
      updateMap();
      if (new Set(progress.visited).size === 6) unlock("explorer");
    });
  });
  updateMap();

  // Fixed daily content based on Japan's civil date. Fictional entertainment only.
  const today = (() => {
    try { return new Intl.DateTimeFormat("sv-SE",{timeZone:"Asia/Tokyo",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date()); }
    catch { return new Date().toISOString().slice(0,10); }
  })();
  const messages = [
    {symbol:"✦",title:"ひとつ、小さな冒険を",message:"いつもと違う道を歩いてみて。見慣れた景色の中にも、新しい星が隠れているかもしれません。",item:"古い地図"},
    {symbol:"☾",title:"月灯りの休息日",message:"今日は頑張りすぎなくても大丈夫。温かい飲み物と静かな時間が、あなたの夜空を整えてくれそう。",item:"ミルクティー"},
    {symbol:"✧",title:"届かなかった言葉を",message:"ほんの短い『ありがとう』が、誰かにとっての流れ星になる日。言葉を少しだけ外へ出してみよう。",item:"便箋"},
    {symbol:"✳",title:"夜明けの気配",message:"長く続けてきたことに、小さな変化が訪れる予感。結果よりも、そこまでの歩みを褒めてあげてね。",item:"花のしおり"},
    {symbol:"❁",title:"偶然の星めぐり",message:"ふと目にとまったものに、今日のヒントが。寄り道してみると、思いがけない気分転換になるかも。",item:"星の切手"},
    {symbol:"✉",title:"思い出の封筒",message:"久しぶりの歌や写真が、忘れていた優しい記憶を連れてきそう。大切なものをひとつ見返してみよう。",item:"アルバム"},
    {symbol:"✺",title:"あなたのペースで",message:"空の星はそれぞれ違う速さで輝いています。比べすぎないで、あなたらしいリズムを大事にしてね。",item:"懐中時計"}
  ];
  const index = [...today].reduce((acc,chr)=>((acc*31+chr.charCodeAt(0))>>>0),7) % messages.length;
  document.getElementById("oracle-date").textContent = today.replaceAll("-",".");
  document.getElementById("oracle-draw").addEventListener("click", () => {
    const m = messages[index];
    document.getElementById("oracle-symbol").textContent = m.symbol;
    document.getElementById("oracle-heading").textContent = m.title;
    document.getElementById("oracle-message").textContent = m.message;
    document.getElementById("oracle-item").textContent = m.item;
    document.getElementById("oracle-lucky").hidden = false;
    document.getElementById("oracle-draw").innerHTML = "今日はこの星便りだよ <span>✧</span>";
    unlock("oracle");
  });

  const questions = [
    {text:"星の旅に出るなら、何を持っていく？",options:[["星図と小さな羅針盤",0],["お気に入りの温かい飲み物",1],["まだ書いていない手紙",2]]},
    {text:"休日の夜、あなたが惹かれるのは？",options:[["まだ知らない場所への散歩",0],["誰かと静かに過ごす時間",1],["夢中で何かを作ること",3]]},
    {text:"友達に贈るなら、どんなプレゼント？",options:[["驚きのある小さな冒険",0],["心を込めた手書きの言葉",2],["明日が楽しみになる道具",3]]},
    {text:"好きな星の光り方を選ぶなら？",options:[["一瞬で空を駆ける流れ星",0],["そっと見守る月の明かり",1],["色が混ざり合う星雲",2]]}
  ];
  const types = [
    {symbol:"✦",name:"流星タイプ",desc:"好奇心いっぱいの旅人。まだ知らない世界に一歩踏み出すことで、あなたの星は強く輝きます。"},
    {symbol:"☾",name:"月灯タイプ",desc:"静かな優しさを持つ聞き上手。人の小さな気持ちに気づけることが、あなたの特別な魔法です。"},
    {symbol:"✧",name:"星雲タイプ",desc:"想いをつなぐ空想家。言葉や絵、音楽に気持ちを込めて、誰かの心へ届けるのが得意です。"},
    {symbol:"✳",name:"暁光タイプ",desc:"未来を明るくする創造家。迷っても何度でも工夫して、まだない明日の景色を作っていきます。"}
  ];
  let quizAt = 0;
  let answers = [];
  const quizQuestion = document.getElementById("quiz-question");
  const quizOptions = document.getElementById("quiz-options");
  const quizResult = document.getElementById("quiz-result");
  const quizQuestionArea = document.getElementById("quiz-question-area");
  const setQuiz = () => {
    quizQuestionArea.hidden = false;
    quizResult.hidden = true;
    document.getElementById("quiz-progress-text").textContent = "QUESTION " + String(quizAt+1).padStart(2,"0") + " / 04";
    document.getElementById("quiz-progress-fill").style.width = (quizAt / questions.length * 100) + "%";
    quizQuestion.textContent = questions[quizAt].text;
    quizOptions.replaceChildren();
    questions[quizAt].options.forEach(([label,score],i) => {
      const button = document.createElement("button");
      button.type = "button";
      const prefix = document.createElement("span");
      prefix.textContent = ["A","B","C"][i];
      button.append(prefix,document.createTextNode(label));
      button.addEventListener("click", () => {
        answers.push(score);
        quizAt++;
        if (quizAt < questions.length) { setQuiz(); }
        else { showResult(); }
      });
      quizOptions.appendChild(button);
    });
  };
  const showResult = () => {
    const counts = [0,0,0,0];
    answers.forEach(a => counts[a]++);
    const max = Math.max(...counts);
    const which = counts.indexOf(max);
    const type = types[which];
    quizQuestionArea.hidden = true;
    quizResult.hidden = false;
    document.getElementById("quiz-progress-text").textContent = "RESULT / YOUR STAR TYPE";
    document.getElementById("quiz-progress-fill").style.width = "100%";
    document.getElementById("quiz-result-symbol").textContent = type.symbol;
    document.getElementById("quiz-result-name").textContent = type.name;
    document.getElementById("quiz-result-desc").textContent = type.desc;
    unlock("quiz");
  };
  const resetQuiz = () => {quizAt=0;answers=[];setQuiz();};
  document.getElementById("quiz-again").addEventListener("click",resetQuiz);
  document.getElementById("quiz-reset").addEventListener("click",resetQuiz);
  resetQuiz();

  const diaries = [
    {date:"2026.11.03 / TUESDAY",title:"迷子の流れ星",body:"きのう、流星駅の近くで道に迷っていた小さな星を見つけたの。帰り道がわからなくなっちゃったんだって。だから、いっしょに星図を広げてみたよ。\n\n星だって、たまには迷子になるんだね。……わたしもよく迷うから、ちょっと親近感。"},
    {date:"2026.10.27 / TUESDAY",title:"真夜中のミルクティー",body:"今日は配達が少し長引いちゃったから、星くず喫茶でひと休み。マスターが小さな三日月クッキーをおまけしてくれたよ。\n\nカップから上がる湯気が、まるで天の川みたいだった。誰かと一緒に見たいな。"},
    {date:"2026.10.18 / SUNDAY",title:"切手屋さんの秘密",body:"新しい切手を買いに行ったら、『この切手は手紙じゃなくて勇気を運ぶんだ』って教えてもらったの。\n\n勇気って、封筒に入るのかな？ 次の配達で、こっそり試してみようと思う。"},
    {date:"2026.10.08 / THURSDAY",title:"雨のち星空",body:"天球第七区に、珍しく雨が降った日。郵便局の窓には小さな水玉がいっぱい。\n\n配達が終わる頃に雲が晴れて、星がいつもより近くに見えたよ。今日の『おつかれさま』は、空からもらった気がする。"}
  ];
  const tabs = [...document.querySelectorAll("[data-diary]")];
  const chooseDiary = i => {
    const item = diaries[i];
    document.getElementById("diary-date").textContent = item.date;
    document.getElementById("diary-entry-title").textContent = item.title;
    const body = document.getElementById("diary-entry-body");
    body.replaceChildren();
    item.body.split("\n\n").forEach((part,n) => {
      if (n) body.append(document.createElement("br"),document.createElement("br"));
      body.append(document.createTextNode(part));
    });
    document.getElementById("diary-article").setAttribute("aria-labelledby",tabs[i].id);
    tabs.forEach((tab,n) => {tab.setAttribute("aria-selected",String(n===i));tab.tabIndex=n===i?0:-1;});
  };
  tabs.forEach((tab,i) => {
    tab.addEventListener("click",()=>chooseDiary(i));
    tab.addEventListener("keydown",event => {
      const direction= event.key==="ArrowRight"||event.key==="ArrowDown"?1:event.key==="ArrowLeft"||event.key==="ArrowUp"?-1:0;
      if (!direction) return;
      event.preventDefault();
      const next=(i+direction+tabs.length)%tabs.length;
      chooseDiary(next);
      tabs[next].focus();
    });
  });

  // Canvas2D export does not use an external screenshot service or network.
  const canvas=document.getElementById("postcard-canvas");
  const ctx=canvas.getContext("2d");
  const postcardTo=document.getElementById("postcard-to");
  const postcardBody=document.getElementById("postcard-body");
  const postcardFrom=document.getElementById("postcard-from");
  let postcardTheme="midnight";
  const portrait=new Image();
  portrait.src="assets/lumina-generated.png";
  portrait.addEventListener("load",drawPostcard);
  const themes={
    midnight:{a:"#14264d",b:"#494c8b",star:"#f3e0b5",text:"#fffafb",haze:"#8585bb"},
    dawn:{a:"#7c769e",b:"#efcbd4",star:"#fff4d6",text:"#fffdfa",haze:"#e9a2b7"},
    moon:{a:"#192442",b:"#536d93",star:"#fff8dc",text:"#fffdfa",haze:"#a6bada"}
  };
  function wrapCanvasText(text,maxWidth,maxRows) {
    const lines = [];
    const paragraphs=text.split(/\r?\n/);
    for (const paragraph of paragraphs) {
      if (!paragraph) { lines.push(""); continue; }
      let line="";
      for (const chr of Array.from(paragraph)) {
        if (ctx.measureText(line+chr).width>maxWidth && line) {lines.push(line);line="";}
        line+=chr;
      }
      if (line) lines.push(line);
    }
    if (lines.length>maxRows) {lines.length=maxRows;lines[maxRows-1]=lines[maxRows-1].slice(0,-1)+"…";}
    return lines;
  }
  function drawPostcard() {
    if (!ctx) return;
    const t=themes[postcardTheme];
    ctx.clearRect(0,0,1200,750);
    const grad=ctx.createLinearGradient(0,0,1200,750);
    grad.addColorStop(0,t.a);grad.addColorStop(1,t.b);
    ctx.fillStyle=grad;ctx.fillRect(0,0,1200,750);
    ctx.save();
    ctx.strokeStyle=t.star;ctx.globalAlpha=.28;ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(920,400,340,250,-.3,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.ellipse(935,400,260,185,-.3,0,Math.PI*2);ctx.stroke();
    ctx.restore();
    let seed=23917;
    const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    for(let i=0;i<78;i++) {
      const x=rand()*1200,y=rand()*750,size=rand()*3+1;
      ctx.globalAlpha=.28+rand()*.7;ctx.fillStyle=t.star;
      ctx.beginPath();ctx.arc(x,y,size,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
    const fg=ctx.createLinearGradient(0,0,860,0);
    fg.addColorStop(0,t.a+"ff");fg.addColorStop(.8,t.a+"e0");fg.addColorStop(1,t.a+"00");
    ctx.fillStyle=fg;ctx.fillRect(0,0,990,750);
    if (portrait.complete && portrait.naturalWidth>0) {
      ctx.save();
      ctx.globalAlpha=.86;
      ctx.drawImage(portrait,680,184,660,427);
      ctx.restore();
    }
    ctx.strokeStyle=t.star;ctx.globalAlpha=.45;ctx.lineWidth=3;ctx.strokeRect(35,35,1130,680);ctx.globalAlpha=1;
    ctx.fillStyle=t.star;ctx.font="600 21px Outfit, sans-serif";ctx.fillText("✦   STAR POST OFFICE / LETTER No. 007",72,104);
    ctx.fillStyle=t.text;ctx.font="700 44px 'Noto Sans JP',sans-serif";
    const recipient=wrapCanvasText(postcardTo.value.trim()||"あなたへ",610,2);
    recipient.forEach((line,i)=>ctx.fillText(line,83,215+i*57));
    ctx.font="500 29px 'Noto Sans JP',sans-serif";
    const lines=wrapCanvasText(postcardBody.value.trim()||"星明かりの手紙をどうぞ。",575,5);
    lines.forEach((line,i)=>ctx.fillText(line,83,322+i*54));
    ctx.fillStyle=t.star;ctx.font="italic 28px Georgia,serif";
    ctx.fillText("from  "+(postcardFrom.value.trim()||"ルミナ"),83,644);
    ctx.globalAlpha=.7;ctx.font="600 16px Outfit,sans-serif";ctx.fillText("HOSHITSUZURI LUMINA — SENDING YOU A LITTLE STARLIGHT",83,692);ctx.globalAlpha=1;
  }
  for(const el of [postcardTo,postcardBody,postcardFrom]) el.addEventListener("input",drawPostcard);
  document.querySelectorAll("[data-postcard-theme]").forEach(btn=>btn.addEventListener("click",()=>{
    postcardTheme=btn.dataset.postcardTheme;
    document.querySelectorAll("[data-postcard-theme]").forEach(b=>{const active=b===btn;b.classList.toggle("is-active",active);b.setAttribute("aria-pressed",String(active));});
    drawPostcard();
  }));
  document.getElementById("postcard-form").addEventListener("submit",e=>e.preventDefault());
  document.getElementById("postcard-download").addEventListener("click",()=>{
    drawPostcard();
    canvas.toBlob(blob=>{
      if(!blob) return;
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=url;a.download="lumina-star-postcard.png";document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),3000);
      unlock("postcard");
    },"image/png");
  });
  if(document.fonts && document.fonts.ready)document.fonts.ready.then(drawPostcard);
  drawPostcard();

  // Existing demo form keeps letter contents in RAM; only its completion event unlocks a stamp.
  document.getElementById("letter-form").addEventListener("submit",event=>{
    if(document.getElementById("letter-message").value.trim())unlock("letter");
  });
})();

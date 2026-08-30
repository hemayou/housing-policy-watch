/* 《纸屋》· 828 新政的四本账 —— 零依赖交互层
   三处 Canvas 2D 粒子：① 封面文件雨 ② 停贷潮账本碎裂 ③ 沙盘液体流
   粒子数按设备降级；prefers-reduced-motion 全部降级为静态。 */
(function () {
'use strict';

var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var SMALL = window.matchMedia('(max-width: 640px)').matches;
var DPR = Math.min(window.devicePixelRatio || 1, 2);
/* 设备档：粒子预算 */
var BUDGET = SMALL ? 0.45 : (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4 ? 0.7 : 1);

function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }

/* ═══════════ 主题 ═══════════ */
var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6"/></svg>';
var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.3A8.6 8.6 0 1 1 9.7 3.5a6.9 6.9 0 0 0 10.8 10.8z"/></svg>';
function isDark() {
  var a = document.documentElement.getAttribute('data-theme');
  if (a) return a === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
function paintThemeBtn() { $('#themeBtn').innerHTML = isDark() ? SUN : MOON; }
$('#themeBtn').addEventListener('click', function () {
  var next = isDark() ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('hpw-theme', next); } catch (e) {}
  paintThemeBtn();
  if (rig.on) rig.recolor();
});
paintThemeBtn();

/* ═══════════ 顶栏 / 进度条 ═══════════ */
var hud = $('#hud'), rail = $('#rail');
function onScroll() {
  var y = window.scrollY;
  hud.classList.toggle('on', y > window.innerHeight * 0.72);
  var h = document.documentElement.scrollHeight - window.innerHeight;
  rail.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ═══════════ 显现观察器 ═══════════ */
var io = new IntersectionObserver(function (es) {
  es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
function watch(root) { $$('.beat, .node', root || document).forEach(function (el) { io.observe(el); }); }
watch();

/* ═══════════ 粒子① · 封面文件雨 ═══════════ */
(function fileRain() {
  var cv = $('#rainCanvas'), ctx = cv.getContext('2d'), w = 0, h = 0, sheets = [];
  function size() {
    var r = cv.getBoundingClientRect();
    w = r.width; h = r.height;
    cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  function make(n) {
    sheets = [];
    for (var i = 0; i < n; i++) sheets.push({
      x: Math.random() * w, y: Math.random() * h * 1.4 - h * 0.2,
      s: 12 + Math.random() * 26,            // 半宽
      vy: 12 + Math.random() * 26,           // px/s
      a: Math.random() * Math.PI * 2, va: (Math.random() - .5) * 0.7,
      sw: 0.25 + Math.random() * 0.75,       // 侧摆
      o: 0.18 + Math.random() * 0.5,
      lines: 2 + (Math.random() * 3 | 0)
    });
  }
  function draw(p) {
    var W = p.s, H = p.s * 1.36;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
    ctx.globalAlpha = p.o;
    ctx.fillStyle = FILL; ctx.strokeStyle = LINE; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.rect(-W / 2, -H / 2, W, H); ctx.fill(); ctx.stroke();
    ctx.globalAlpha = p.o * 0.65; ctx.strokeStyle = TXT; ctx.lineWidth = 0.9;
    for (var i = 1; i <= p.lines; i++) {
      var yy = -H / 2 + (H / (p.lines + 1)) * i;
      ctx.beginPath(); ctx.moveTo(-W / 2 + W * 0.16, yy); ctx.lineTo(W / 2 - W * 0.16 - (i === p.lines ? W * 0.24 : 0), yy); ctx.stroke();
    }
    ctx.restore();
  }
  var FILL, LINE, TXT;
  function colors() { FILL = css('--paper'); LINE = css('--hairline-2'); TXT = css('--ink-3'); }
  var last = 0, raf;
  function loop(t) {
    var dt = last ? Math.min((t - last) / 1000, 0.05) : 0.016; last = t;
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < sheets.length; i++) {
      var p = sheets[i];
      p.y += p.vy * dt; p.a += p.va * dt; p.x += Math.sin(p.y * 0.012) * p.sw * dt * 30;
      if (p.y - p.s > h) { p.y = -p.s * 2; p.x = Math.random() * w; }
      draw(p);
    }
    raf = requestAnimationFrame(loop);
  }
  function boot() {
    size(); colors();
    make(Math.max(14, Math.round((RM ? 26 : 52) * BUDGET)));
    if (RM) { ctx.clearRect(0, 0, w, h); sheets.forEach(draw); return; }
    if (raf) cancelAnimationFrame(raf); last = 0; raf = requestAnimationFrame(loop);
  }
  boot();
  var to; window.addEventListener('resize', function () { clearTimeout(to); to = setTimeout(boot, 220); });
  window.addEventListener('hpw-theme', boot);
})();

/* 封面红戳 */
setTimeout(function () { $$('.seal-stamp').forEach(function (s) { s.classList.add('hit'); }); }, 900);
$('#enterBtn').addEventListener('click', function () {
  $('#act1').scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
});

/* ═══════════ 粒子② · 账本碎裂 ═══════════ */
(function shatter() {
  var cv = $('#shatterCanvas'); if (!cv) return;
  var ctx = cv.getContext('2d'), w = 0, h = 0, bits = [], started = false, raf, last = 0, t0 = 0;
  function size() {
    var r = cv.getBoundingClientRect(); w = r.width; h = r.height;
    cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  function build() {
    bits = [];
    var cols = SMALL ? 9 : 14, rows = SMALL ? 6 : 8;
    var bw = Math.min(w * 0.78, 460), bh = Math.min(h * 0.72, 168);
    var ox = (w - bw) / 2, oy = (h - bh) / 2;
    var cw = bw / cols, ch = bh / rows;
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var cx = ox + c * cw, cy = oy + r * ch;
      var dx = (c + 0.5) / cols - 0.5, dy = (r + 0.5) / rows - 0.5;
      bits.push({
        x: cx, y: cy, w: cw - 0.6, h: ch - 0.6, ox: cx, oy: cy,
        vx: dx * (250 + Math.random() * 280), vy: dy * (215 + Math.random() * 240),
        a: 0, va: (Math.random() - .5) * 4.4,
        d: Math.random() * 0.32, o: 1,
        row: r
      });
    }
  }
  function paint(prog) {
    ctx.clearRect(0, 0, w, h);
    var FILL = css('--paper'), LINE = css('--hairline'), INK = css('--ink-3'), RED = css('--seal');
    for (var i = 0; i < bits.length; i++) {
      var b = bits[i];
      ctx.save(); ctx.globalAlpha = Math.max(0, b.o);
      ctx.translate(b.x + b.w / 2, b.y + b.h / 2); ctx.rotate(b.a);
      ctx.fillStyle = FILL; ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.strokeStyle = LINE; ctx.lineWidth = 0.6; ctx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.strokeStyle = (b.row % 3 === 1) ? RED : INK; ctx.lineWidth = 1;
      ctx.globalAlpha = Math.max(0, b.o) * 0.5;
      ctx.beginPath(); ctx.moveTo(-b.w / 2 + 2.5, 0); ctx.lineTo(b.w / 2 - 2.5 - (i % 4) * 1.6, 0); ctx.stroke();
      ctx.restore();
    }
  }
  function loop(t) {
    if (!t0) t0 = t;
    var dt = last ? Math.min((t - last) / 1000, 0.04) : 0.016; last = t;
    var el = (t - t0) / 1000;
    for (var i = 0; i < bits.length; i++) {
      var b = bits[i];
      if (el < b.d) continue;
      b.x += b.vx * dt; b.y += b.vy * dt; b.a += b.va * dt;
      var drag = Math.pow(0.05, dt);              /* 强阻尼：炸开后迅速定格 */
      b.vx *= drag; b.vy *= drag; b.va *= drag;
      b.x = Math.max(2, Math.min(w - b.w - 2, b.x));
      b.y = Math.max(2, Math.min(h - b.h - 46, b.y));
      b.o = Math.max(0.62, b.o - dt * 0.5);
    }
    paint();
    if (el < 2.8) raf = requestAnimationFrame(loop); else { /* 定格于炸开的末态 */ }
  }
  function go() {
    if (started) return; started = true;
    size(); build();
    if (RM) {  /* 静态：直接画出裂开后的定格 */
      bits.forEach(function (b) { b.x = Math.max(2, Math.min(w - b.w - 2, b.x + b.vx * 0.15)); b.y = Math.max(2, Math.min(h - b.h - 46, b.y + b.vy * 0.15)); b.a = b.va * 0.15; b.o = 0.72; });
      paint(); return;
    }
    last = 0; t0 = 0; raf = requestAnimationFrame(loop);
  }
  size(); build(); paint();  /* 初始：完整的账本 */
  var so = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting && e.intersectionRatio > 0.4) { setTimeout(go, 900); so.disconnect(); } });
  }, { threshold: [0, 0.4, 0.7] });
  so.observe(cv);
  window.addEventListener('resize', function () { if (!started) { size(); build(); paint(); } });
})();

/* ═══════════ 角色线 ═══════════ */
var ROLES = {
  family: { title: '买房家庭：一张纸的七年', kicker: 'Act Ⅲ · 主线',
    who: '你是 2019 年秋天在售楼处签下合同的那个人。以下每一个制度性数字都可溯源，家庭财务数字为合成案例——人物是虚构的，事情是真的。',
    end: '这条线的完整版本在主报告第六章《买房的人：三十年信任的重建与代价》。' },
  mayor: { title: '市长：拆掉自己那台托市机器', kicker: 'Act Ⅲ · 辅线',
    who: '你管着一座二线城市。三十年来你的第二财政叫土地出让金，你的融资工具叫城投，两者靠同一块抵押品咬合在一起。',
    end: '这条线的完整版本在主报告第四章《地方政府：发动机熄火之后》。' },
  cfo: { title: '房企 CFO：回款推到竣工之后', kicker: 'Act Ⅲ · 辅线',
    who: '你是一家全国性开发商的财务负责人。你的模型建立在一个假设上：房子卖在盖起来之前。',
    end: '这条线的完整版本在主报告第五章《开发商：五种命运》。' },
  banker: { title: '银行行长：从中转站到终点站', kicker: 'Act Ⅲ · 辅线',
    who: '你分管一家全国性银行的对公与零售房地产业务。三十年里你都站在风险传导链的中间。',
    end: '这条线的完整版本在主报告第八章《银行：最后的承接者》。' }
};
var done = {}, current = null;

function openRole(key) {
  current = key;
  var r = ROLES[key];
  $('#lineKicker').textContent = r.kicker;
  $('#lineTitle').textContent = r.title;
  $('#lineWho').textContent = r.who;
  $('#endDesc').textContent = r.end + (Object.keys(done).length >= 1 ? '' : ' 走完任意一条线，就能打开沙盘——那台可以自己拨的装置。');
  $$('.line').forEach(function (l) { l.hidden = l.id !== 'line-' + key; });
  var nodes = $$('#line-' + key + ' .node');
  var prog = $('#lineProg'); prog.innerHTML = '';
  nodes.forEach(function () { var i = document.createElement('i'); prog.appendChild(i); });
  nodes.forEach(function (n) { n.classList.remove('in'); });
  watch($('#line-' + key));
  /* 进度点亮 */
  if (window._progIO) window._progIO.disconnect();
  window._progIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) {
        var idx = nodes.indexOf(e.target);
        $$('i', prog).forEach(function (b, k) { if (k <= idx) b.classList.add('on'); });
        if (idx === nodes.length - 1) done[key] = true;
      }
    });
  }, { rootMargin: '0px 0px -40% 0px' });
  nodes.forEach(function (n) { window._progIO.observe(n); });

  $('#act3').classList.add('on');
  $$('.role-card').forEach(function (c) { c.classList.toggle('done', !!done[c.dataset.role]); });
  setTimeout(function () { $('#act3').scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); }, 40);
}
$$('.role-card').forEach(function (c) {
  c.addEventListener('click', function () { openRole(c.dataset.role); });
});
$('#backRoles').addEventListener('click', function () {
  if (current) done[current] = true;
  $$('.role-card').forEach(function (c) { c.classList.toggle('done', !!done[c.dataset.role]); });
  $('#act2').scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
});
$('#restartBtn').addEventListener('click', function () {
  $('#act2').scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
});
$('#againBtn').addEventListener('click', function () {
  $('#act2').scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
});
$('#rigBtn').addEventListener('click', function () {
  $('#act4').scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
});
$('#toSandbox').addEventListener('click', function () {
  if (current) done[current] = true;
  rig.reveal();
});

/* ═══════════ 沙盘 ═══════════ */
var rig = (function () {
  var S = { s1: false, s2: false, s3: false, s4: false, s5: false };
  var on = false, fluidStarted = false;

  var M = {
    family: function (s) {
      var risk = (s.s1 ? 2 : 0) + (s.s4 ? 2 : 0) + (s.s3 ? 1 : 0);
      var deliver = risk >= 5 ? ['↓', '很低 · 所见即所得', 'good']
        : risk >= 3 ? ['↓', '明显下降', 'good']
        : risk >= 1 ? ['↘', '有所下降', 'flat']
        : ['↑', '高 · 停工即损失', 'up'];
      var pay = s.s5 ? (s.s4 ? ['↓', '下降，且起点后移', 'good'] : ['↓', '月供下降 · 40 年', 'good'])
        : (s.s4 ? ['→', '起点后移至竣工后', 'good'] : ['→', '基准 · 30 年', 'flat']);
      var quota = s.s5 ? ['↑', '上升 · 偿债比上限 60%', 'up'] : ['→', '基准 · 沿用 55%', 'flat'];
      var note = risk === 0 && !s.s5 ? '828 之前：你在为一个还不存在的房子还月供，而且是这条链上唯一没有抵押物的债权人。'
        : (s.s1 && s.s4) ? '交付风险被从根上拿掉：房子建成才放款，钱建成才付。代价是新房供应节奏被拉长，短期可选的新盘变少。'
        : s.s4 ? '「能拿房、再还贷」——放款时点后移，但项目本身仍可能烂尾，你只是不再替它垫资。'
        : s.s5 ? '月供轻了，总利息更重了。期限延长直接效果是平滑现金流，不是降低购房总成本。'
        : '风险还在你这一端。';
      return { deliver: deliver, pay: pay, quota: quota, note: note };
    },
    cfo: function (s) {
      var cash = (s.s1 && s.s4) ? ['↑', '全部推迟到竣工之后', 'up']
        : s.s4 ? ['↑', '个贷部分推迟到竣工备案后', 'up']
        : s.s1 ? ['↗', '推迟到主体封顶后', 'up']
        : ['→', '预售即回款', 'flat'];
      var lev = s.s2 ? ['↓', '切断 · 须自有资金购地', 'down'] : ['→', '可举债缴地价', 'flat'];
      var dur = s.s1 ? (s.s3 ? ['↑', '现售 ≤5 年最长 7 年 · 单一主办行', 'good'] : ['↑', '现售 ≤5 年，最长 7 年', 'good'])
        : (s.s3 ? ['→', '预售 ≤3 年最长 5 年 · 单一主办行', 'flat'] : ['→', '预售 ≤3 年，最长 5 年', 'flat']);
      var note = (s.s1 && s.s4 && !s.s3) ? '最难受的组合：回款全部推到竣工之后，而资金封闭管理还没到位——现金流缺口靠什么补，文件没有给答案。'
        : (s.s1 && s.s2) ? '两头同时收紧：买地要自己的钱，卖房要等房子盖完。高融资成本的房企在这一格里出局。'
        : (s.s1 && s.s3) ? '被拉长的销售周期换来被拉长的贷款期限（7 年）与一条稳定的主办行通道——这是文件给的对冲。'
        : s.s2 ? '拿地杠杆归零。土地款要靠自有资金，行业的扩张速度上限被重新定义。'
        : '高周转模型还成立：预售款是启动扭矩，自有资金只是引信。';
      return { cash: cash, lev: lev, dur: dur, note: note };
    },
    mayor: function (s) {
      var d = (s.s2 ? 2 : 0) + (s.s1 ? 1 : 0);
      var land = d >= 3 ? ['↓', '大幅下调', 'down'] : d === 2 ? ['↓', '明显下调', 'down'] : d === 1 ? ['↘', '小幅下调', 'flat'] : ['→', '基准 · 依存度 78.9%', 'flat'];
      var lgfv = s.s2 ? ['↓', '掐断 · 托市机器停摆', 'down'] : ['→', '畅通 · 2022 年占购地 31.8%', 'flat'];
      var coll = s.s2 ? ['↓', '重估 · 量价背离转为价跌量现', 'down'] : ['→', '由城投高价购地托住', 'flat'];
      var note = s.s2 ? '「以地抵押→借款→买地→再抵押」的循环在缴款环节被掐断。抵押品先重估，再融资收缩随后；短期负债率会机械上行，因为分母骤缩而分子刚性。'
        : s.s1 ? '现房销售拉长开发周期，土地需求端先降温，但托市机器还在——地价可以继续被托住，量继续掉。'
        : '这就是 2020—2022 年那套办法：成交面积 −43.1%，地价 +11.0%。价格由行政与城投共同管理。';
      return { land: land, lgfv: lgfv, coll: coll, note: note };
    },
    banker: function (s) {
      var conc = s.s3 ? ['↑', '一项目一主办行，结清前不得变更', 'up'] : ['→', '多头授信可分散', 'flat'];
      var tenor = (s.s1 && s.s5) ? ['↑', '两端同时拉长 · 7 年 + 40 年', 'up']
        : s.s5 ? ['↑', '个贷最长 40 年', 'up'] : s.s1 ? ['↑', '开发贷最长 7 年', 'up'] : ['→', '基准', 'flat'];
      var expo = s.s4 ? ['→', '后移至竣工备案后', 'good'] : ['→', '主体结构封顶时', 'flat'];
      var note = (s.s3 && s.s4 && s.s1) ? '你从风险传递链的中转站变成了终点站：按揭晚放、开发贷拉长、单项目不可解绑——而这发生在房地产贷款全面负增长、息差历史最低的时刻。'
        : s.s3 ? '封闭管理让你第一次真正掌握项目的全部资金流向，代价是你不能再中途退出。'
        : s.s4 ? '敞口开始得更晚，但也意味着建设期的资金缺口要由开发贷来填——那笔钱也是你的。'
        : '钱从你这里流过去，风险落在买房的人身上。这是 828 之前的分工。';
      return { conc: conc, tenor: tenor, expo: expo, note: note };
    }
  };

  var NOTES = [
    { test: function (s) { return !s.s1 && !s.s2 && !s.s3 && !s.s4 && !s.s5; },
      t: '这是 828 之前的世界',
      b: '购房人的钱为开发建设融资，城投借钱托住地价，银行在链条中间做中转。三条线都通着，机器就能转——只要地价还在涨。',
      c: '对照：2022 年土地成交面积较 2019 年 −43.1%，地价 +11.0%（CWX, RFS 2026, Tables 2/3）' },
    { test: function (s) { return s.s2 && !s.s1 && !s.s3 && !s.s4 && !s.s5; },
      t: '只拨②：托市机器被单独拆掉',
      b: '城投购地的资金多为债务性资金。缴款环节一断，2022 年那笔占成交近三分之一、且高出市场 11.7% 的托底买盘就消失了。地价失去支撑后补跌，此前被拖住的价格调整集中显性化——量价背离切换为价跌量现。地方账本上，土地收入预期下调、城投融资管道变细。',
      c: '依据 Chang, Wang & Xiong (RFS 2026) 托市机制；见专题《地方债务：七篇文献》' },
    { test: function (s) { return s.s1 && s.s4 && !s.s3; },
      t: '①④ 开、③ 关：房企的现金流断点',
      b: '销售端的回款被整体推到竣工之后，而资金封闭管理与主办银行通道还没建立。建设期的缺口只能靠开发贷或自有资金填——这正是文件要求「实现开发贷款发放与项目建设周期相匹配」的原因。少了③，保护购房人的两条款会直接变成对开发商的挤压。',
      c: '建房规〔2026〕3 号 三（二）；《商品住房开发贷款管理办法（试行）》第四条' },
    { test: function (s) { return s.s5 && !s.s1 && !s.s2 && !s.s3 && !s.s4; },
      t: '只拨⑤：唯一往回松的那一档',
      b: '五个抓手里，只有这一个是放松：期限 30→40 年、月所有债务偿债比 55%→60%。它降的是月供，不是总成本。放在居民部门连续 13 个季度贷款负增长、杠杆率已从峰值回落约 6 个百分点的背景下，它面对的不是被压抑的加杠杆意愿，而是资产负债表收缩。',
      c: '《个人住房贷款管理办法（试行）》第十三条、第十条；NIFD 2026Q2' },
    { test: function (s) { return s.s1 && s.s2 && s.s3 && s.s4 && s.s5; },
      t: '五个全开：828 之后的世界',
      b: '风险沿着原来的链条被整体反向推回：家庭不再垫资，房企不再靠别人的钱扩张，地方政府失去土地金融的杠杆，银行成为承接方。方向上文献高度一致——这是在拆病根。所有警告都集中在过渡期：化债置换是否按城投暴露定向分配、一般债与转移支付能否补位、地方支出效率跟不跟得上。',
      c: '见专题《地方债务：七篇文献》；Li & Kohl (2026) §7；王劲松等（2024）' },
    { test: function (s) { return s.s3 && !s.s1 && !s.s4; },
      t: '只拨③：把应急机制改成常态制度',
      b: '主办银行制首见于 2024 年住建部与金融监管总局的「白名单」——单独建账、指定一家主办银行、防止多家银行同时抽贷。828 把它常态化了。单独看，它堵的是 2022 年那两个漏洞：钱没进监管账户，进了也被总包或集团挪走。',
      c: '《商品住房开发贷款管理办法（试行）》第七条、第八条；金融监管总局答记者问' }
  ];
  var DEFAULT_NOTE = { t: '继续拨', b: '每个开关旁边都写着它出自哪份文件的哪一条。试试把某一个单独关掉，看哪一本账最先变——这台装置想说明的正是：这五件事不是并列的五条措施，它们是一个整体，拆开任何一件，别处就会出现缺口。', c: '' };

  function apply() {
    ['family', 'cfo', 'mayor', 'banker'].forEach(function (k) {
      var r = M[k](S), box = $('.book[data-book="' + k + '"]');
      $$('.v', box).forEach(function (el) {
        var v = r[el.dataset.m]; if (!v) return;
        el.className = 'v ' + v[2];
        el.innerHTML = '<span class="arrow">' + v[0] + '</span>' + v[1];
      });
      $('[data-note]', box).textContent = r.note;
    });
    /* 管道 */
    function set(id, wdt, cut) {
      var e = document.getElementById(id);
      e.setAttribute('stroke-width', wdt);
      e.style.opacity = cut ? 0.14 : 0.62;
      e.classList.toggle('pipe-cut', !!cut);
    }
    set('f1', S.s4 ? 3 : (S.s1 ? 6 : 11), false);            // 购房款：预售款融资功能被弱化
    set('f2', S.s3 ? 13 : 9, false);                          // 开发贷：成为主渠道
    set('f3', S.s5 ? 12 : 9, false);                          // 个人房贷：额度与期限放宽
    set('f4', S.s2 ? 4 : (S.s1 ? 7 : 10), false);             // 土地出让价款
    set('f5', 2.5, S.s2);                                     // 城投融资：被禁贷缴地价掐断
    set('f6', S.s2 ? 2.5 : 10, S.s2);                         // 城投购地
    /* 纸屋重新折叠 */
    var n = (S.s1 ? 1 : 0) + (S.s2 ? 1 : 0) + (S.s3 ? 1 : 0) + (S.s4 ? 1 : 0) + (S.s5 ? 1 : 0);
    $('#houseFold').style.transform = 'rotate(' + (-1.6 + n * 0.7).toFixed(2) + 'deg) scale(' + (1 + n * 0.012).toFixed(3) + ')';
    /* 旁批 */
    var note = DEFAULT_NOTE;
    for (var i = 0; i < NOTES.length; i++) if (NOTES[i].test(S)) { note = NOTES[i]; break; }
    $('#marginNote').innerHTML = '<b>' + note.t + '</b>' + note.b + (note.c ? '<span class="src">' + note.c + '</span>' : '');
    if (fluid) fluid.retune();
  }

  $$('.sw').forEach(function (b) {
    b.addEventListener('click', function () {
      S[b.dataset.sw] = !S[b.dataset.sw];
      b.classList.toggle('on', S[b.dataset.sw]);
      b.setAttribute('aria-pressed', String(S[b.dataset.sw]));
      apply();
    });
    b.setAttribute('aria-pressed', 'false');
  });
  $$('.preset').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = b.dataset.preset;
      var m = { none: [], s2: ['s2'], s1s4: ['s1', 's4'], all: ['s1', 's2', 's3', 's4', 's5'] }[p] || [];
      Object.keys(S).forEach(function (k) { S[k] = m.indexOf(k) >= 0; });
      $$('.sw').forEach(function (x) { x.classList.toggle('on', S[x.dataset.sw]); x.setAttribute('aria-pressed', String(S[x.dataset.sw])); });
      apply();
    });
  });

  /* ═══ 粒子③ · 玻璃管道里的液体 ═══ */
  var fluid = null;
  function startFluid() {
    if (fluidStarted) return; fluidStarted = true;
    var cv = $('#fluidCanvas'), ctx = cv.getContext('2d');
    var svg = cv.previousElementSibling, VBW = 800, VBH = 470;
    var W = 0, H = 0, k = 1, ox = 0, oy = 0;
    var defs = [
      { id: 'p1', c: '--fluid-money', dir: 1 }, { id: 'p2', c: '--fluid-credit', dir: 1 },
      { id: 'p3', c: '--fluid-credit', dir: 1 }, { id: 'p4', c: '--fluid-land', dir: 1 },
      { id: 'p5', c: '--fluid-credit', dir: 1 }, { id: 'p6', c: '--fluid-land', dir: 1 }
    ];
    var tracks = [];
    function size() {
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      k = W / VBW; ox = 0; oy = (H - VBH * k) / 2;
    }
    function build() {
      tracks = defs.map(function (d) {
        var el = document.getElementById(d.id);
        var L = el.getTotalLength();
        var pts = [], N = Math.max(24, Math.round(L / 6));
        for (var i = 0; i <= N; i++) { var p = el.getPointAtLength(L * i / N); pts.push([p.x, p.y]); }
        return { def: d, L: L, pts: pts, flowEl: document.getElementById('f' + d.id[1]), parts: [] };
      });
      retune();
    }
    function retune() {
      if (!tracks.length) return;
      tracks.forEach(function (t) {
        var w = parseFloat(t.flowEl.getAttribute('stroke-width')) || 0;
        var cut = t.flowEl.classList.contains('pipe-cut');
        var n = cut ? 0 : Math.max(0, Math.round(w * 1.5 * BUDGET));
        while (t.parts.length > n) t.parts.pop();
        while (t.parts.length < n) t.parts.push({ u: Math.random(), v: 0.10 + Math.random() * 0.09, r: 1.6 + Math.random() * 2.2, o: 0.35 + Math.random() * 0.5 });
        t.w = w;
      });
    }
    function at(t, u) {
      var f = u * (t.pts.length - 1), i = Math.floor(f), a = t.pts[Math.min(i, t.pts.length - 1)], b = t.pts[Math.min(i + 1, t.pts.length - 1)], m = f - i;
      return [a[0] + (b[0] - a[0]) * m, a[1] + (b[1] - a[1]) * m];
    }
    var last = 0, raf;
    function frame(ts) {
      var dt = last ? Math.min((ts - last) / 1000, 0.05) : 0.016; last = ts;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < tracks.length; i++) {
        var t = tracks[i]; if (!t.parts.length) continue;
        ctx.fillStyle = css(t.def.c);
        for (var j = 0; j < t.parts.length; j++) {
          var p = t.parts[j];
          p.u += p.v * dt * (260 / t.L) * 4;
          if (p.u > 1) p.u -= 1;
          var xy = at(t, p.u);
          ctx.globalAlpha = p.o;
          ctx.beginPath(); ctx.arc(ox + xy[0] * k, oy + xy[1] * k, p.r * k * 1.05, 0, 6.2832); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    function staticDraw() {
      ctx.clearRect(0, 0, W, H);
      tracks.forEach(function (t) {
        ctx.fillStyle = css(t.def.c);
        t.parts.forEach(function (p) {
          var xy = at(t, p.u); ctx.globalAlpha = p.o;
          ctx.beginPath(); ctx.arc(ox + xy[0] * k, oy + xy[1] * k, p.r * k * 1.05, 0, 6.2832); ctx.fill();
        });
      });
      ctx.globalAlpha = 1;
    }
    size(); build();
    fluid = { retune: function () { retune(); if (RM) staticDraw(); } };
    if (RM) { staticDraw(); }
    else { last = 0; raf = requestAnimationFrame(frame); }
    var to; window.addEventListener('resize', function () { clearTimeout(to); to = setTimeout(function () { size(); if (RM) staticDraw(); }, 200); });
  }

  return {
    get on() { return on; },
    recolor: function () { apply(); },
    reveal: function () {
      var sec = $('#act4');
      if (!on) {
        on = true; sec.classList.add('on'); $('#act5').classList.add('on');
        apply();
        $('#stage').classList.add('flash');
        setTimeout(startFluid, 60);
        setTimeout(function () {   /* 窄屏时把管道图居中，两侧都留出可滑动的提示 */
          var r = $('.rig'); if (r && r.scrollWidth > r.clientWidth) r.scrollLeft = (r.scrollWidth - r.clientWidth) / 2;
        }, 120);
      }
      setTimeout(function () { sec.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); }, 30);
    }
  };
})();

/* 键盘可达性：卡片 Enter/Space */
$$('.role-card, .sw, .preset').forEach(function (el) { el.setAttribute('tabindex', '0'); });

})();

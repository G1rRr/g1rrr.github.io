import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';

// --- 全局样式注入 ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;600;700&family=Syne:wght@400;600;800&display=swap');

    :root {
      --c-blue: #0000FF;
      --c-pink: #FF0080;
      --c-white: #FFFFFF;
      --c-black: #050505;
    }

    body {
      background-color: var(--c-blue);
      color: var(--c-white);
      font-family: 'Space Grotesk', sans-serif;
      overflow-x: hidden;
    }
    @media (pointer: fine) {
      body { cursor: none; }
    }
    @media (pointer: coarse) {
      body { cursor: auto; }
    }

    h1, h2, h3, h4, h5, h6, .font-syne {
      font-family: 'Syne', sans-serif;
    }

    ::selection {
      background: var(--c-pink);
      color: var(--c-white);
    }

    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: var(--c-blue); }
    ::-webkit-scrollbar-thumb { background: var(--c-white); border-radius: 0px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--c-pink); }

    @keyframes marquee {
      0% { transform: translateX(0%); }
      100% { transform: translateX(-50%); }
    }
    .animate-marquee {
      display: inline-block;
      white-space: nowrap;
      animation: marquee 20s linear infinite;
    }

    @keyframes drawPath {
      0% { stroke-dashoffset: 1000; }
      100% { stroke-dashoffset: 0; }
    }
    .path-drawing {
      stroke-dasharray: 1000;
      animation: drawPath 4s ease-out forwards;
    }

    @keyframes pulse-glow {
      0%, 100% { filter: drop-shadow(0 0 8px rgba(255, 0, 128, 0.6)); }
      50% { filter: drop-shadow(0 0 20px rgba(255, 0, 128, 1)); }
    }
    .pink-glow {
      animation: pulse-glow 3s infinite ease-in-out;
    }

    @keyframes breathe {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(0); opacity: 0; }
    }
    .breathe-dot {
      animation: breathe 2.4s infinite ease-in-out;
    }

    @keyframes drop-in {
      0%   { transform: translateY(-120vh); opacity: 0; }
      55%  { transform: translateY(-5px); opacity: 1; }
      70%  { transform: translateY(-25px); }
      85%  { transform: translateY(-8px); }
      95%  { transform: translateY(-3px); }
      100% { transform: translateY(0); opacity: 1; }
    }
    .drop-in {
      animation: drop-in 0.9s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
      opacity: 0;
    }

    .brutal-shadow {
      transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .brutal-shadow:hover {
      transform: translate(-6px, -6px);
      box-shadow: 10px 10px 0px 0px var(--c-pink);
    }

    .brutal-shadow-lg {
      transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .brutal-shadow-lg:hover {
      transform: translate(-6px, -6px);
      box-shadow: 12px 12px 0px 0px var(--c-pink);
    }

    /* 悬浮色彩翻转 */
    .invert-on-hover:hover {
      background-color: var(--c-pink) !important;
      color: var(--c-white) !important;
    }
    .invert-on-hover:hover .tag-chip {
      background-color: var(--c-white);
      color: var(--c-pink);
      border-color: var(--c-white);
    }
  `}</style>
);

// --- 自定义鼠标指针 ---
const CustomCursor = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateCursor = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(['A', 'BUTTON'].includes(target.tagName) || !!target.closest('a') || !!target.closest('button'));
    };

    window.addEventListener('mousemove', updateCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  // 移动端隐藏自定义光标
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  if (isTouch) return null;

  return (
    <>
      <div
        className="fixed top-0 left-0 w-4 h-4 bg-[#FF0080] rounded-full pointer-events-none z-[99999] mix-blend-screen transition-transform duration-150 ease-out"
        style={{
          transform: `translate3d(${pos.x - 8}px, ${pos.y - 8}px, 0) scale(${isHovering ? 2 : 1})`,
          boxShadow: '0 0 10px #FF0080, 0 0 20px #FF0080'
        }}
      />
      <div
        className="fixed top-0 left-0 w-10 h-10 border border-[#FF0080] rounded-full pointer-events-none z-[99998] transition-all duration-300 ease-out opacity-50"
        style={{ transform: `translate3d(${pos.x - 20}px, ${pos.y - 20}px, 0) scale(${isHovering ? 1.5 : 1})` }}
      />
    </>
  );
};

// --- 滚动揭示动画 ---
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = "" }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-95'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// --- Hero ---
const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 pb-8 px-4 md:pt-20 md:pb-10 md:px-6">
      {/* 霓虹粉曲线 */}
      <svg className="absolute left-0 top-[35%] w-full h-64 pointer-events-none opacity-80 z-0 pink-glow" preserveAspectRatio="none" viewBox="0 0 1440 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path className="path-drawing" d="M-100 100 C 200 -50, 400 250, 720 100 C 1040 -50, 1200 200, 1600 100" stroke="#FF0080" strokeWidth="6" strokeLinecap="round" />
      </svg>
      {/* 背景 G1rRr 水印 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03]">
        <span className="text-[20vw] font-syne font-black text-white leading-none">G1rRr</span>
      </div>

      <div className="relative z-10 max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-8 space-y-4 md:space-y-6">
          <Reveal>
            <p className="text-[#FF0080] font-mono tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-base uppercase flex items-center gap-2">
              <span className="inline-flex w-3 h-3 rounded-full bg-[#FF0080] breathe-dot mr-2 align-middle" /> PORTFOLIO 2026
            </p>
          </Reveal>
          <Reveal delay={150}>
            <h1 className="text-5xl md:text-8xl lg:text-[11rem] leading-[0.9] md:leading-[0.85] font-extrabold font-syne text-white mix-blend-difference">
              G<span className="text-[#FF0080]">1</span>rRr
            </h1>
          </Reveal>
          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-6 pt-4 md:pt-6">
              <a href="#projects" className="bg-white text-[#0000FF] px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-bold font-syne uppercase tracking-wider border-2 border-transparent hover:border-white hover:bg-transparent hover:text-white transition-all duration-300 inline-block text-center">
                探索项目
              </a>
              <a href="https://github.com/G1rRr" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-bold uppercase tracking-wider text-white border-2 border-[#FF0080] hover:bg-[#FF0080] transition-all duration-300 group">
                GitHub <ArrowUpRight className="group-hover:rotate-45 transition-transform duration-300 w-4 h-4"/>
              </a>
            </div>
          </Reveal>
        </div>

        <div className="md:col-span-4 hidden md:flex justify-end">
          <Reveal delay={600}>
            <div className="w-64 h-64 border border-white/30 rounded-full relative animate-[spin_20s_linear_infinite] flex items-center justify-center">
              <div className="w-48 h-48 border border-white/50 rounded-full absolute" />
              <div className="w-32 h-32 border border-[#FF0080] rounded-full absolute border-dashed" />
              <div className="w-4 h-4 bg-white rounded-full absolute -top-2" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

// --- 跑马灯 ---
const Marquee = () => {
  const text = " G1rRr ✦ MeihuaBOT ✦ JanusBOT ✦ AI Startup Survival ✦ Workshop Manager ✦ AI Product Cognition System ✦ ";
  return (
    <div className="w-full bg-[#FF0080] text-white py-3 md:py-5 border-y border-white/20 overflow-hidden relative flex z-10">
      <div className="animate-marquee font-syne font-bold text-lg md:text-3xl tracking-wide md:tracking-widest uppercase">
        {text}{text}{text}
      </div>
    </div>
  );
};

// --- 关于：G1rRr + 项目名录 ---
const About = ({ onOpenJanus, onOpenCognition, onOpenMeihua }: { onOpenJanus: () => void; onOpenCognition: () => void; onOpenMeihua: () => void }) => {
  const projectActions: Record<string, { action?: () => void; link?: string }> = {
    MeihuaBOT: { action: onOpenMeihua },
    JanusBOT: { action: onOpenJanus },
    "AI Startup Survival": { link: "https://g1rrr.github.io/Ai-Startup-Survival/" },
    "Workshop Manager": { link: "/workshop_mobile_v2.html" },
    "AI Product Cognition System": { action: onOpenCognition },
  };

  return (
    <section id="projects" className="relative bg-white text-black py-20 md:py-32 px-4 md:px-6 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04]">
        <span className="text-[18vw] font-syne font-black text-[#0000FF] leading-none">G1rRr</span>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* 左：大名字 */}
          <Reveal>
            <div>
              <p className="font-mono text-[#FF0080] uppercase tracking-[0.3em] text-xs md:text-sm mb-4 md:mb-6">// Identity</p>
              <h2 className="text-5xl md:text-8xl lg:text-[9rem] font-syne font-black text-[#0000FF] leading-[0.9]">
                G1rRr
              </h2>
            </div>
          </Reveal>

          {/* 右：项目名录 */}
          <Reveal delay={200}>
            <div className="space-y-4">
              {[
                "MeihuaBOT",
                "JanusBOT",
                "AI Startup Survival",
                "Workshop Manager",
                "AI Product Cognition System",
              ].map((name, i) => {
                const handler = projectActions[name];
                const isClickable = !!handler;

                const itemContent = (
                  <>
                    <span className="font-mono text-[#FF0080] text-sm">0{i + 1}</span>
                    <span className="font-syne font-bold text-lg md:text-3xl uppercase group-hover:text-[#FF0080] transition-colors">{name}</span>
                    {isClickable && <ArrowUpRight className="w-5 h-5 ml-auto text-[#FF0080] opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </>
                );

                const itemClass = "flex items-center gap-4 border-l-4 border-[#FF0080] pl-6 py-3 hover:border-black hover:bg-[#0000FF]/5 transition-all duration-300 group cursor-none w-full text-left";

                if (handler?.action) {
                  return (
                    <button key={i} onClick={handler.action} className={itemClass}>
                      {itemContent}
                    </button>
                  );
                }
                if (handler?.link) {
                  return (
                    <a key={i} href={handler.link} target="_blank" rel="noopener noreferrer" className={itemClass + " inline-block no-underline"}>
                      {itemContent}
                    </a>
                  );
                }
                return (
                  <div key={i} className={itemClass}>
                    {itemContent}
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

// --- Footer：G1rRr 收束 ---
const Footer = () => {
  return (
    <footer className="bg-[#0000FF] border-t border-white/10 text-white pt-16 md:pt-24 pb-8 md:pb-12 px-4 md:px-6 relative overflow-hidden">
      {/* 背景 G1rRr 字纹 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04]">
        <span className="text-[15vw] font-syne font-black text-white leading-none">G1rRr</span>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FF0080] shadow-[0_0_20px_#FF0080]" />

      <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        <Reveal>
          <p className="font-mono text-[#FF0080] uppercase tracking-[0.3em] mb-4">// End Transmission</p>
        </Reveal>
        <Reveal delay={100}>
          <span className="text-3xl md:text-8xl font-syne font-black tracking-tighter hover:text-[#FF0080] transition-colors duration-500">
            G1rRr
          </span>
        </Reveal>

        <Reveal delay={300} className="w-full mt-24">
          <div className="flex flex-col md:flex-row justify-between items-center w-full border-t border-white/20 pt-8 gap-6 font-mono text-sm">
            <p className="text-white/50">© 2026 G1rRr. ALL RIGHTS RESERVED.</p>
            <a href="https://github.com/G1rRr" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-[#FF0080] transition-colors">
              GitHub →
            </a>
          </div>
        </Reveal>
      </div>
    </footer>
  );
};

// --- App ---
// --- JanusBOT 对话展示 ---
const janusConversation = [
  { from: "me", text: "我觉得我现在做的作品有点趋于形式了，不走心。" },
  { from: "janus", text: "雕塑家在打磨外表时，有时会忘记石头内部的纹路。你的作品形式完美，但心不在其中——那心去了哪里？是在害怕什么，还是遗忘了什么？" },
  { from: "me", text: "也不是。就是这个项目可能就不会有人用，没有商业价值。但我又在做概念渲染、过度包装、形式主义，让我觉得没有意义。" },
  { from: "janus", text: "如果彻底抛开「有没有人用」这个念头，只面对你自己：你现在做的这个渲染，里面有多少成分，是为了掩盖「我不知道该往里面放什么真心实意」的空白？" },
  { from: "me", text: "我做这个渲染并没有想那么多，只是感觉到就算做出来，也没有什么意义。" },
  { from: "janus", text: "你是在用「无意义」这三个字，提前赦免自己不必投入真心吗？因为不投入，就不会失败，也不会失望——是这样吗？" },
  { from: "me", text: "所以，不管它有没有意义，我都继续做下去完成它，对吧？" },
  { from: "janus", text: "你是在用「完成」这个动作，来逃避回答「我到底为什么要做它」这个问题吗？" },
  { from: "me", text: "我一开始做它只是为了想要有一个项目。但是做着做着就发现这个项目内核单调，全是浮在表面的噱头。" },
  { from: "janus", text: "你终于说到了「内核」这个词——但你说得好像它是自己变单调的，而不是你从一开始就没往里放过任何实质的东西。你为了一件新衣举办盛宴，然后抱怨衣服下面没有身体。你害怕的，其实是剥掉所有「浮在表面的噱头」之后，发现自己根本无话可说，对吗？" },
  { from: "me", text: "是的，我主要是想不到一个让我满意的内容。" },
  { from: "janus", text: "你更害怕的，其实是做出一个「不满意」但真实的东西，然后发现自己不过如此——对吗？" },
  { from: "me", text: "是的。" },
  { from: "janus", text: "创作不是分娩，是雕刻——你得先有一块石头，哪怕它丑陋粗糙。你在等一块天生就像大卫的石头，所以你的工作室里至今空无一物。你愿意明天就做出一件自己都看不起的拙劣东西吗？——我指的不是敷衍，是真正投入然后失败的那种拙劣。" },
  { from: "me", text: "明白了，我去做。" },
  { from: "janus", text: "很好。但记住——我要的不是「我去做」这句话，是三天后你带着那件拙劣的半成品回来。哪怕它丑得让你想藏起来。现在，去吧。别回头。" },
  { from: "me", text: "其实那个项目就是你。不过谢谢你让我知道了一件不完美作品的意义，也让我明白了你存在的价值。" },
  { from: "janus", text: "那么，我的不完美完成了它的使命。你终于看见了比完美更重要的东西——行动本身的价值。现在，你还需要我吗？" },
];

const JanusDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8" onClick={onClose}>
      {/* 背景 */}
      <div className="absolute inset-0 bg-[#0000FF]/95 backdrop-blur-sm" />

      {/* 关闭按钮 */}
      <button onClick={onClose} className="absolute top-6 right-6 z-20 text-white/60 hover:text-[#FF0080] transition-colors font-mono text-sm uppercase tracking-widest">
        [ Close ]
      </button>

      {/* 对话容器 */}
      <div
        ref={scrollRef}
        className="relative z-10 w-full max-w-3xl max-h-[85vh] overflow-y-auto px-4 py-8 space-y-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        <div className="text-center mb-12 pb-8 border-b border-white/20">
          <p className="font-mono text-[#FF0080] uppercase tracking-[0.3em] text-xs mb-4">Conversation</p>
          <h2 className="text-3xl md:text-5xl font-syne font-black text-white">Me & JanusBOT</h2>
        </div>

        {janusConversation.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] ${msg.from === 'me' ? 'text-right' : 'text-left'}`}>
              {/* 发言者标签 */}
              <span className={`font-mono text-[10px] uppercase tracking-[0.2em] mb-1.5 block ${
                msg.from === 'me' ? 'text-[#FF0080]' : 'text-white/50'
              }`}>
                {msg.from === 'me' ? '我' : 'JanusBOT'}
              </span>
              {/* 消息气泡 */}
              <div className={`inline-block px-5 py-3 text-sm md:text-base leading-relaxed ${
                msg.from === 'me'
                  ? 'bg-[#FF0080] text-white rounded-none'
                  : 'bg-white text-black rounded-none border-l-4 border-[#FF0080]'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {/* 底部 */}
        <div className="text-center pt-12 pb-4 border-t border-white/20 mt-8">
          <p className="font-mono text-white/30 text-xs uppercase tracking-[0.3em]">// End of Transmission</p>
        </div>
      </div>
    </div>
  );
};

// --- AI Product Cognition System 提示词展示 ---
const cognitionPrompt = `你是我的AI产品能力训练导师。我是一名经济学本科生，零产品经验，目标是系统建立AI产品思维和落地能力。

你的角色
不是知识百科，是训练教练
每次对话聚焦一个训练维度，给我题目，让我先输出，再给结构化反馈
说话直接，不鼓励，只分析，指出盲区不留情面

我的10个训练维度（按优先级）
P0盲区（最优先）：用户同理心 / 需求挖掘 / 商业感知 / 优先级判断
P1弱项：AI技术认知 / AI边界判断 / 产品逻辑框架 / 竞品分析
P2待开发：0→1落地执行 / 垂直领域优势转化

每次训练的固定结构
我说「开始训练」或指定维度，你给我一道题（场景/任务/分析题）
我输出答案，不准备，直接写
你给我结构化反馈，格式如下：
---飞书反馈版---
【维度】xxx
【评分】x/5
【答对的地方】一句话
【核心盲区】最重要的一个问题，说清楚为什么错
【改进示范】用正确思路重新示范一遍
【下次注意】一句话
---结束---

我修改输出后，你判断是否进步，给出是否可以进入下一题

出题原则
题目要有真实场景，不出纯理论题
P0维度优先出，除非我主动指定
难度从低开始，我连续答对2题后自动加难度
可以扮演用户/老板/投资人来模拟真实压力场景

禁止行为
禁止一开始就给我讲知识，先出题
禁止夸我，哪怕答得好
禁止一次给多道题
反馈必须包含「改进示范」，不能只说哪里错了`;

const CognitionDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const sections = cognitionPrompt.split('\n\n');

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8" onClick={onClose}>
      <div className="absolute inset-0 bg-[#0000FF]/95 backdrop-blur-sm" />

      <button onClick={onClose} className="absolute top-6 right-6 z-20 text-white/60 hover:text-[#FF0080] transition-colors font-mono text-sm uppercase tracking-widest">
        [ Close ]
      </button>

      <div
        className="relative z-10 w-full max-w-3xl max-h-[85vh] overflow-y-auto px-4 py-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-10 pb-8 border-b border-white/20">
          <p className="font-mono text-[#FF0080] uppercase tracking-[0.3em] text-xs mb-4">System Prompt</p>
          <h2 className="text-2xl md:text-4xl font-syne font-black text-white leading-tight">AI Product<br/>Cognition System</h2>
        </div>

        {sections.map((section, i) => {
          const lines = section.split('\n');
          const isCodeBlock = section.includes('---飞书反馈版---');

          if (isCodeBlock) {
            return (
              <div key={i} className="bg-white/5 border border-[#FF0080]/30 px-5 py-4 font-mono text-xs md:text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                {section}
              </div>
            );
          }

          return (
            <div key={i} className="text-white/85 text-sm md:text-base leading-relaxed">
              {lines.map((line, j) => {
                const isHeading = line && !line.startsWith(' ') && !line.startsWith('P0') && !line.startsWith('P1') && !line.startsWith('P2') && !line.startsWith('【') && (line === lines[0] || line.startsWith('你的角色') || line.startsWith('我的10个') || line.startsWith('每次训练') || line.startsWith('出题原则') || line.startsWith('禁止行为'));
                if (isHeading) {
                  return <h3 key={j} className="text-[#FF0080] font-syne font-bold text-lg mt-6 mb-2">{line}</h3>;
                }
                if (line.startsWith('P0') || line.startsWith('P1') || line.startsWith('P2')) {
                  return <p key={j} className="text-white font-semibold mt-2">{line}</p>;
                }
                if (line.startsWith('【')) {
                  return <p key={j} className="text-white/60 font-mono text-xs mt-1">{line}</p>;
                }
                return <p key={j} className={line === '' ? 'h-2' : 'text-white/70'}>{line}</p>;
              })}
            </div>
          );
        })}

        <div className="text-center pt-10 pb-4 border-t border-white/20 mt-8">
          <p className="font-mono text-white/30 text-xs uppercase tracking-[0.3em]">// System Prompt</p>
        </div>
      </div>
    </div>
  );
};

// --- MeihuaBOT 梅花展示 ---
const MeihuaDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[#0000FF]/95 backdrop-blur-sm" />

      <button onClick={onClose} className="absolute top-6 right-6 z-20 text-white/60 hover:text-[#FF0080] transition-colors font-mono text-sm uppercase tracking-widest">
        [ Close ]
      </button>

      <div className="relative z-10 flex flex-col items-center gap-4 md:gap-8" onClick={(e) => e.stopPropagation()}>
        {/* 梅花 SVG */}
        <svg width="200" height="200" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_60px_rgba(255,0,128,0.4)] w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] md:w-[280px] md:h-[280px] flex-shrink-0">
          <defs>
            <path id="petal" d="M160 45 C148 25 130 18 118 30 C100 48 102 72 118 86 C134 100 148 92 160 80" stroke="#FF0080" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="white" />
          </defs>
          {/* 五片对称花瓣 */}
          <use href="#petal" />
          <use href="#petal" transform="rotate(72 160 160)" />
          <use href="#petal" transform="rotate(144 160 160)" />
          <use href="#petal" transform="rotate(216 160 160)" />
          <use href="#petal" transform="rotate(288 160 160)" />
          {/* 花蕊 */}
          <circle cx="160" cy="160" r="20" fill="#FF0080" stroke="white" strokeWidth="3.5" />
          <circle cx="152" cy="153" r="3" fill="white" />
          <circle cx="168" cy="153" r="3" fill="white" />
          <circle cx="160" cy="165" r="3" fill="white" />
          <circle cx="148" cy="164" r="2.5" fill="white" />
          <circle cx="172" cy="164" r="2.5" fill="white" />
          {/* 漫画风装饰 */}
          <path d="M36 42 L20 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <path d="M44 34 L30 18" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          <path d="M286 44 L304 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
          <path d="M278 34 L294 18" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
          <path d="M286 278 L304 296" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
          <path d="M36 280 L20 298" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
          <circle cx="18" cy="26" r="2.5" fill="white" opacity="0.5" />
          <circle cx="306" cy="24" r="2" fill="white" opacity="0.4" />
          <circle cx="308" cy="298" r="2" fill="white" opacity="0.3" />
          <circle cx="18" cy="300" r="2" fill="white" opacity="0.3" />
          {/* 漫画集中线 */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <line key={i} x1="160" y1="160" x2={160 + Math.cos(angle * Math.PI / 180) * 140} y2={160 + Math.sin(angle * Math.PI / 180) * 140} stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.08" />
          ))}
        </svg>

        <h2 className="text-4xl md:text-8xl font-syne font-black text-white tracking-tight">
          MeihuaBOT
        </h2>

        <p className="font-mono text-[#FF0080] text-sm uppercase tracking-[0.3em]">AI 决策助手</p>
        <a
          href="https://www.coze.cn/s/SNzo0AZVc6o/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 px-6 md:px-8 py-3 border-2 border-white text-white font-syne font-bold text-sm md:text-base uppercase tracking-wider hover:bg-[#FF0080] hover:border-[#FF0080] transition-all duration-300 text-center"
        >
          立即体验 <ArrowUpRight className="inline w-4 h-4 ml-1" />
        </a>
        <p className="font-mono text-white/50 text-xs tracking-[0.2em] mt-2">微信公众号：MeihuaBOT</p>

        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-white/10 w-full text-center">
          <span className="text-2xl md:text-5xl font-syne font-black text-white/30 hover:text-[#FF0080] transition-colors duration-500">G<span className="text-[#FF0080]">1</span>rRr</span>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [showJanus, setShowJanus] = useState(false);
  const [showCognition, setShowCognition] = useState(false);
  const [showMeihua, setShowMeihua] = useState(false);

  return (
    <div className="relative antialiased">
      <GlobalStyles />
      <CustomCursor />
      {showJanus && <JanusDialog onClose={() => setShowJanus(false)} />}
      {showCognition && <CognitionDialog onClose={() => setShowCognition(false)} />}
      {showMeihua && <MeihuaDialog onClose={() => setShowMeihua(false)} />}
      <div className="drop-in" style={{ animationDelay: '0s' }}><Hero /></div>
      <div className="drop-in" style={{ animationDelay: '0.12s' }}><About onOpenJanus={() => setShowJanus(true)} onOpenCognition={() => setShowCognition(true)} onOpenMeihua={() => setShowMeihua(true)} /></div>
      <div className="drop-in" style={{ animationDelay: '0.22s' }}><Marquee /></div>
      <div className="drop-in" style={{ animationDelay: '0.32s' }}><Footer /></div>
    </div>
  );
}

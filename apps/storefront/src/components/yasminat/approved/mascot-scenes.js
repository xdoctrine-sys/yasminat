// Approved design's silent scene director, adapted to the native React lifecycle.
// Owns only this dock. No API, cart, authentication, upload or order operations.
export function mountMascotDock(
  root,
  { shell, language, onOpen, isPanelOpen },
) {
  const motion = matchMedia("(prefers-reduced-motion: reduce)"),
    review = new URLSearchParams(location.search).get("mascotReview") === "1";
  const names = {
    jump: ["النطة والتركيب", "Jump & reassemble"],
    blink: ["رمشة وغمزة", "Blink & wink"],
    photographer: ["المصوّر", "Photographer"],
    gardener: ["البستاني", "Gardener"],
    gift: ["الهدية", "Gift"],
  };
  const captions = {
    jump: [
      [0, "استعداد", "Ready"],
      [0.35, "تفكيك", "Separate"],
      [0.57, "تركيب", "Reassemble"],
      [0.9, "عودة", "Return"],
    ],
    blink: [
      [0, "نظرة", "Look"],
      [0.22, "رمشة", "Blink"],
      [0.63, "غمزة", "Wink"],
      [0.94, "عودة", "Return"],
    ],
    photographer: [
      [0, "استعداد", "Ready"],
      [0.19, "من خلف الجسم", "Reach behind"],
      [0.4, "رفع الكاميرا", "Raise camera"],
      [0.62, "التقاط الصور", "Take photos"],
      [0.89, "إخفاء الكاميرا", "Put away"],
    ],
    gardener: [
      [0, "انطلاق", "Set off"],
      [0.19, "خارج الطرف", "Past the edge"],
      [0.36, "رجع بالإبريق", "Return with can"],
      [0.53, "سقي النبات", "Water the plant"],
      [0.9, "ترتيب", "Tidy up"],
    ],
    gift: [
      [0, "يفكّر", "Thinking"],
      [0.32, "من خلف الجسم", "Reach behind"],
      [0.6, "يمسك الهدية", "Hold the gift"],
      [0.75, "يقدّمها", "Present it"],
      [0.94, "عودة", "Return"],
    ],
  };
  const tr = (ar, en) => (language === "en" ? en : ar);
  let director,
    tools,
    scrollTimer = null,
    anchorRevision = 0,
    disposed = false,
    frozenFrame = null;
  let quiet = false;
  try {
    quiet = sessionStorage.getItem("yasminat-mascot-quiet") === "1";
  } catch {}
  const parts = [
    ["cap", "inset(0 0 76% 0)"],
    ["head", "polygon(0% 24%,100% 24%,100% 52%,29% 52%,23% 44%,0% 44%)"],
    ["left-arm", "polygon(0% 44%,23% 44%,29% 52%,39% 57%,34% 66%,0% 66%)"],
    [
      "body",
      "polygon(29% 52%,69% 52%,66% 59%,65% 70%,70% 78%,30% 78%,34% 66%,39% 57%)",
    ],
    ["right-arm", "polygon(69% 52%,100% 52%,100% 78%,70% 78%,65% 70%,66% 59%)"],
    ["wheel", "inset(78% 0 0 0)"],
  ];
  const frameReady = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      frozenFrame = c.toDataURL("image/png");
      resolve(frozenFrame);
    };
    img.onerror = () => resolve(null);
    img.src = "/assets/mascot/yasminat-anime.webp";
  });
  function art() {
    return `<svg class="dock-stage" viewBox="0 0 480 360" aria-hidden="true" focusable="false"><defs><linearGradient id="dock-lid" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#103d2c"/><stop offset="1" stop-color="#124a34"/></linearGradient></defs>
 <ellipse class="dock-ground" cx="353" cy="322" rx="75" ry="9" fill="#244638" opacity=".12"/>
 <g data-plant opacity="0"><ellipse cx="120" cy="324" rx="44" ry="6" fill="#244638" opacity=".12"/><path d="M91 283h54l-8 39h-38z" fill="#C26D4A"/><path d="M90 281h56v9H90z" fill="#A64E2E"/><path d="M119 283v-48" stroke="#435648" stroke-width="4"/><path d="M118 259c-34-2-34-31-11-24 13 4 11 24 11 24M120 271c34-2 42-32 18-27-14 3-18 27-18 27" fill="#668969"/><path d="M118 247c-14-19 4-38 13-23 6 10-13 23-13 23" fill="#244638"/></g>
 <g data-water opacity="0" fill="#4d9ca4"><path data-water-stream d="M133 249q0 17-12 33" fill="none" stroke="#4d9ca4" stroke-width="4" stroke-linecap="round" stroke-dasharray="3 8"/><ellipse cx="132" cy="250" rx="3" ry="5"/><ellipse cx="128" cy="265" rx="3" ry="5"/><ellipse cx="121" cy="278" rx="3" ry="4"/></g>
 <g transform="translate(260 65) scale(.55)"><g data-actor><g data-props-back></g>${parts.map(([part, clip]) => `<g data-part="${part}" style="clip-path:${clip}"><image data-robot-image href="${frozenFrame || "/assets/mascot/yasminat-anime.webp"}" width="324" height="405"/></g>`).join("")}
 <g data-eyes><g data-blink-left opacity="0"><ellipse cx="130" cy="153" rx="28" ry="21" fill="url(#dock-lid)"/><path d="M111 153q19 9 38-3" fill="none" stroke="#aff6bf" stroke-width="6" stroke-linecap="round"/></g><g data-blink-right opacity="0"><ellipse cx="198" cy="147" rx="27" ry="20" fill="url(#dock-lid)"/><path d="M180 148q18 8 35-2" fill="none" stroke="#aff6bf" stroke-width="6" stroke-linecap="round"/></g></g><g data-props-front></g><g data-hands-front></g><path data-dock-hit d="M120 10 280 20 294 190 310 316 225 327 222 390 140 390 135 320 20 300 30 165 80 195 80 100Z" fill="transparent" style="pointer-events:all;cursor:pointer"/></g></g>
 <g data-thought opacity="0" fill="#FAF7F0" stroke="#435648" stroke-width="2"><circle cx="355" cy="70" r="5"/><circle cx="368" cy="53" r="8"/><path d="M360 23q0-18 20-17 12-16 27 0 22 0 20 19 6 20-16 21h-35q-20 1-16-23Z"/><path d="M387 16q-10 0-9 9m9-9q10 0 9 9m-9-9v19" fill="none" stroke-width="3"/><path d="M376 25h23v16h-23z" fill="#E7EFE5"/></g>
 <g data-flash opacity="0" transform="translate(55 42)" fill="#f8e6a5"><path d="m327 134 6-17 6 17 18 6-18 6-6 17-6-17-18-6z"/><path d="m362 112 3-8 3 8 8 3-8 3-3 8-3-8-8-3z"/></g>
 <g data-prop="camera" opacity="0"><rect x="0" y="14" width="125" height="77" rx="14" fill="#244638" stroke="#dce4d8" stroke-width="4"/><path d="m21 14 10-14h36l10 14" fill="#435648"/><rect x="91" y="24" width="20" height="12" rx="3" fill="#F8E6A5"/><circle cx="61" cy="52" r="29" fill="#FAF7F0"/><circle cx="61" cy="52" r="21" fill="#435648"/><circle cx="61" cy="52" r="13" fill="#1a3028"/><circle cx="56" cy="47" r="5" fill="#88c0a9"/></g>
 <g data-prop="can" opacity="0"><path d="M7 28q-38-21-34 15 0 22 32 24" fill="none" stroke="#668969" stroke-width="12"/><path d="M0 26h81l-7 75H10z" fill="#87a287" stroke="#435648" stroke-width="3"/><path d="m78 55 47-41 12 12-58 59" fill="#87a287" stroke="#435648" stroke-width="3"/><path d="m122 12 15 15 11-8-18-18Z" fill="#244638"/><path d="M20 25V13h35v12" fill="#668969"/><path d="M21 38h37" stroke="#E7EFE5" stroke-width="5"/></g>
 <g data-prop="gift" opacity="0"><rect x="0" y="20" width="120" height="88" rx="6" fill="#C26D4A" stroke="#A64E2E" stroke-width="3"/><path d="M-5 15h130v25H-5z" fill="#F8ECE6" stroke="#A64E2E" stroke-width="3"/><path d="M49 17h23v91H49z" fill="#E7EFE5"/><path d="M59 17C8 18 32-21 60 12c28-33 54 6-1 5Z" fill="none" stroke="#435648" stroke-width="8" stroke-linecap="round"/></g></svg>`;
  }
  class Director {
    constructor(el) {
      this.el = el;
      this.tracks = [];
      this.locks = new Set();
      this.scene = "idle";
      this.duration = 0;
      this.idleTimer = null;
      this.order = [
        "jump",
        "blink",
        "photographer",
        "blink",
        "gardener",
        "gift",
      ];
      this.index = 0;
      this.frame = 0;
      this.running = false;
      this.prop = null;
      this.auto = !review;
      this.reset();
      this.schedule();
    }
    node(s) {
      return this.el.querySelector(s);
    }
    animate(selector, keys, duration) {
      const n = typeof selector === "string" ? this.node(selector) : selector;
      const a = n.animate(keys, { duration, fill: "both", easing: "linear" });
      this.tracks.push(a);
      if (this.locks.size) a.pause();
      return a;
    }
    restoreArms() {
      const actor = this.node("[data-actor]");
      actor.insertBefore(
        this.node('[data-part="left-arm"]'),
        this.node('[data-part="body"]'),
      );
      actor.insertBefore(
        this.node('[data-part="right-arm"]'),
        this.node('[data-part="wheel"]'),
      );
    }
    reset() {
      this.restoreArms();
      this.tracks.forEach((a) => a.cancel());
      this.tracks = [];
      cancelAnimationFrame(this.frame);
      this.prop = null;
      for (const n of this.el.querySelectorAll("[data-prop]")) {
        this.el.querySelector("svg").append(n);
        n.style.opacity = "0";
        n.style.transform = "";
      }
      this.node("[data-actor]").style.transform = "";
      this.el.dataset.scene = "idle";
      this.el.dataset.phase = "idle";
      delete this.el.dataset.progress;
      this.scene = "idle";
      this.running = false;
      this.duration = 0;
      this.node("[data-water]").style.opacity = "0";
      this.node("[data-plant]").style.opacity = "0";
      this.node("[data-thought]").style.opacity = "0";
      this.node("[data-flash]").style.opacity = "0";
      this.notify();
    }
    stop() {
      clearTimeout(this.idleTimer);
      this.reset();
    }
    lock(name, locked) {
      if (this.locks.has(name) === locked) return;
      locked ? this.locks.add(name) : this.locks.delete(name);
      this.tracks.forEach((a) => {
        if (this.locks.size) a.pause();
        else if (a.playState === "paused") a.play();
      });
      if (this.locks.size) {
        clearTimeout(this.idleTimer);
        cancelAnimationFrame(this.frame);
      } else if (this.running) this.tick();
      else this.schedule();
      this.notify();
    }
    notify() {
      if (this.el !== root) return;
      if (root) {
        root.dataset.quiet = String(quiet || motion.matches);
        root.dataset.pauseReasons = [...this.locks].join(",");
      }
      if (tools) {
        const out = tools.querySelector("output");
        out.textContent =
          this.scene === "idle"
            ? tr("جاهز · حركة صامتة", "Ready · Silent motion")
            : tr(...names[this.scene]) + " · " + (this.el.dataset.phase || "");
        for (const b of tools.querySelectorAll("[data-scene]"))
          b.disabled =
            this.running ||
            motion.matches ||
            ["protected", "overlay", "panel"].some((reason) =>
              this.locks.has(reason),
            );
        tools.querySelector("[data-scene-pause]").textContent = this.locks.has(
          "review",
        )
          ? tr("استكمال", "Resume")
          : tr("إيقاف مؤقت", "Pause");
      }
    }
    schedule() {
      clearTimeout(this.idleTimer);
      if (!this.auto || this.running || this.locks.size) return;
      this.idleTimer = setTimeout(
        () => this.run(this.order[this.index++ % this.order.length]),
        6500 + Math.random() * 2500,
      );
    }
    blink(at, duration, wink = false) {
      const dt = (wink ? 400 : 200) / duration,
        k = [
          { opacity: 0, offset: 0 },
          { opacity: 0, offset: at },
          { opacity: 1, offset: at + dt * 0.25 },
          { opacity: 1, offset: at + dt * 0.55 },
          { opacity: 0, offset: at + dt },
          { opacity: 0, offset: 1 },
        ];
      this.animate("[data-blink-left]", k, duration);
      if (!wink) this.animate("[data-blink-right]", k, duration);
    }
    run(name) {
      if (this.running || motion.matches) return false;
      clearTimeout(this.idleTimer);
      this.reset();
      this.running = true;
      this.scene = name;
      this.el.dataset.scene = name;
      this.duration = {
        jump: 3600,
        blink: 2500,
        photographer: 9000,
        gardener: 11000,
        gift: 9500,
      }[name];
      const D = this.duration;
      this.master = this.animate(
        "[data-clock]",
        [{ opacity: 1 }, { opacity: 1 }],
        D,
      );
      const pose = (selector, frames) =>
        this.animate(
          selector,
          frames.map(([offset, transform]) => ({ offset, transform })),
          D,
        );
      const alpha = (selector, frames) =>
        this.animate(
          selector,
          frames.map(([offset, opacity]) => ({ offset, opacity })),
          D,
        );
      const arm = (part, origin, frames) => {
        this.node(`[data-part="${part}"]`).style.transformOrigin = origin;
        pose(`[data-part="${part}"]`, frames);
      };
      const ID = "translate(0px,0px) rotate(0deg)";
      if (name === "jump") {
        pose("[data-actor]", [
          [0, "translateY(0px)"],
          [0.14, "translateY(-15px)"],
          [0.51, "translateY(-9px)"],
          [0.78, "translateY(0px)"],
          [0.92, "translateY(-5px)"],
          [1, "translateY(0px)"],
        ]);
        const shifts = {
          cap: [-0, -40, -7],
          head: [-13, -20, 7],
          "left-arm": [-52, 8, -18],
          body: [6, 12, -4],
          "right-arm": [52, 16, 18],
          wheel: [0, 48, -12],
        };
        for (const [p, [x, y, r]] of Object.entries(shifts)) {
          this.node(`[data-part="${p}"]`).style.transformOrigin = "162px 223px";
          pose(`[data-part="${p}"]`, [
            [0, ID],
            [0.24, ID],
            [0.4, `translate(${x}px,${y}px) rotate(${r}deg)`],
            [0.51, `translate(${x}px,${y}px) rotate(${r}deg)`],
            [0.74, ID],
            [1, ID],
          ]);
        }
        this.blink(0.8, D);
      } else if (name === "blink") {
        // One opacity track per eye, so the wink cannot replace the earlier blink.
        alpha('[data-blink-left]',[[0,0],[.12,0],[.14,1],[.164,1],[.2,0],[.57,0],[.61,1],[.658,1],[.73,0],[1,0]]);
        alpha('[data-blink-right]',[[0,0],[.12,0],[.14,1],[.164,1],[.2,0],[1,0]]);
      } else {
        this.prop = this.node(
          `[data-prop="${name === "photographer" ? "camera" : name === "gardener" ? "can" : "gift"}"]`,
        );
        this.node("[data-props-back]").append(this.prop);
        if (name === "photographer") {
          pose(this.prop, [
            [0, "translate(180px,255px) scale(.25) rotate(25deg)"],
            [0.12, "translate(180px,255px) scale(.25) rotate(25deg)"],
            [0.25, "translate(235px,230px) scale(.8) rotate(12deg)"],
            [0.4, "translate(132px,183px) scale(1) rotate(0deg)"],
            [0.72, "translate(132px,183px) scale(1) rotate(0deg)"],
            [0.84, "translate(235px,230px) scale(.8) rotate(12deg)"],
            [0.94, "translate(180px,255px) scale(.25) rotate(25deg)"],
            [1, "translate(180px,255px) scale(.25) rotate(25deg)"],
          ]);
          alpha(this.prop, [
            [0, 0],
            [0.14, 0],
            [0.2, 1],
            [0.9, 1],
            [0.95, 0],
            [1, 0],
          ]);
          arm("right-arm", "224px 242px", [
            [0, ID],
            [0.12, "rotate(32deg)"],
            [0.26, "rotate(25deg)"],
            [0.4, "translate(-40px,-20px) rotate(-40deg)"],
            [0.72, "translate(-40px,-20px) rotate(-40deg)"],
            [0.88, "rotate(32deg)"],
            [1, ID],
          ]);
          arm("left-arm", "106px 231px", [
            [0, ID],
            [0.26, ID],
            [0.4, "rotate(145deg)"],
            [0.72, "rotate(145deg)"],
            [0.88, ID],
            [1, ID],
          ]);
          alpha("[data-flash]", [
            [0, 0],
            [0.46, 0],
            [0.47, 1],
            [0.49, 0],
            [0.57, 0],
            [0.58, 1],
            [0.6, 0],
            [0.68, 0],
            [0.69, 1],
            [0.71, 0],
            [1, 0],
          ]);
          this.blink(0.31, D);
        } else if (name === "gardener") {
          pose("[data-actor]", [
            [0, "translateX(0px)"],
            [0.2, "translateX(200px)"],
            [0.28, "translateX(200px)"],
            [0.43, "translateX(-230px)"],
            [0.74, "translateX(-230px)"],
            [0.86, "translateX(130px)"],
            [0.94, "translateX(130px)"],
            [1, "translateX(0px)"],
          ]);
          pose(this.prop, [
            [0, "translate(215px,235px) rotate(0deg)"],
            [0.3, "translate(215px,235px) rotate(0deg)"],
            [0.46, "translate(210px,235px) rotate(0deg)"],
            [0.53, "translate(80px,229px) rotate(120deg)"],
            [0.7, "translate(80px,229px) rotate(120deg)"],
            [0.78, "translate(215px,235px) rotate(0deg)"],
            [1, "translate(215px,235px) rotate(0deg)"],
          ]);
          alpha(this.prop, [
            [0, 0],
            [0.25, 0],
            [0.3, 1],
            [0.86, 1],
            [0.9, 0],
            [1, 0],
          ]);
          alpha("[data-plant]", [
            [0, 0],
            [0.28, 0],
            [0.36, 1],
            [0.79, 1],
            [0.9, 0],
            [1, 0],
          ]);
          alpha("[data-water]", [
            [0, 0],
            [0.52, 0],
            [0.54, 1],
            [0.7, 1],
            [0.72, 0],
            [1, 0],
          ]);
          this.animate(
            "[data-water-stream]",
            [
              { strokeDashoffset: "0", offset: 0 },
              { strokeDashoffset: "0", offset: 0.53 },
              { strokeDashoffset: "-60", offset: 0.71 },
              { strokeDashoffset: "-60", offset: 1 },
            ],
            D,
          );
          pose("[data-water]", [
            [0, "translateY(-10px)"],
            [0.53, "translateY(0px)"],
            [0.7, "translateY(20px)"],
            [1, "translateY(10px)"],
          ]);
          arm("right-arm", "224px 242px", [
            [0, ID],
            [0.3, ID],
            [0.46, "rotate(-32deg)"],
            [0.55, "rotate(-70deg)"],
            [0.7, "rotate(-70deg)"],
            [0.79, ID],
            [1, ID],
          ]);
          this.blink(0.42, D);
        } else {
          alpha("[data-thought]", [
            [0, 0],
            [0.07, 1],
            [0.23, 1],
            [0.3, 0],
            [1, 0],
          ]);
          pose('[data-part="head"]', [
            [0, "rotate(0deg)"],
            [0.12, "rotate(-8deg)"],
            [0.26, "rotate(-8deg)"],
            [0.36, "rotate(0deg)"],
            [1, "rotate(0deg)"],
          ]);
          this.node('[data-part="head"]').style.transformOrigin = "162px 188px";
          pose(this.prop, [
            [0, "translate(185px,265px) scale(.2) rotate(18deg)"],
            [0.27, "translate(185px,265px) scale(.2) rotate(18deg)"],
            [0.42, "translate(233px,235px) scale(.75) rotate(12deg)"],
            [0.58, "translate(105px,218px) scale(1.12) rotate(0deg)"],
            [0.78, "translate(105px,208px) scale(1.22) rotate(0deg)"],
            [0.87, "translate(233px,235px) scale(.75) rotate(12deg)"],
            [0.96, "translate(185px,265px) scale(.2) rotate(18deg)"],
            [1, "translate(185px,265px) scale(.2) rotate(18deg)"],
          ]);
          alpha(this.prop, [
            [0, 0],
            [0.29, 0],
            [0.36, 1],
            [0.92, 1],
            [0.98, 0],
            [1, 0],
          ]);
          arm("right-arm", "224px 242px", [
            [0, ID],
            [0.28, "rotate(32deg)"],
            [0.43, "rotate(24deg)"],
            [0.59, "translate(0px,0px) rotate(40deg)"],
            [0.79, "translate(0px,-10px) rotate(40deg)"],
            [0.9, "rotate(32deg)"],
            [1, ID],
          ]);
          arm("left-arm", "106px 231px", [
            [0, ID],
            [0.43, ID],
            [0.59, "rotate(210deg)"],
            [0.79, "translateY(-10px) rotate(210deg)"],
            [0.9, ID],
            [1, ID],
          ]);
          this.blink(0.13, D, true);
        }
      }
      this.master.onfinish = () => {
        if (!this.running) return;
        this.reset();
        this.schedule();
      };
      this.tick();
      this.notify();
      return true;
    }
    tick() {
      cancelAnimationFrame(this.frame);
      if (!this.running) return;
      const t = Math.min(
          1,
          Number(this.master.currentTime || 0) / this.duration,
        ),
        steps = captions[this.scene];
      const phase = [...steps].reverse().find((s) => t >= s[0]) || steps[0];
      this.el.dataset.phase = tr(phase[1], phase[2]);
      this.el.dataset.progress = String(t.toFixed(3));
      if (this.prop) {
        const front =
          this.scene === "gardener"
            ? t >= 0.29 && t < 0.86
            : this.scene === "gift"
              ? t >= 0.45 && t < 0.89
              : t >= 0.29 && t < 0.86;
        const parent = this.node(
          front ? "[data-props-front]" : "[data-props-back]",
        );
        if (this.prop.parentNode !== parent) parent.append(this.prop);
        if (front) {
          const hands = this.node("[data-hands-front]");
          for (const part of ["left-arm", "right-arm"]) {
            const arm = this.node(`[data-part="${part}"]`);
            if (arm.parentNode !== hands) hands.append(arm);
          }
        } else this.restoreArms();
      }
      this.notify();
      if (!this.locks.size)
        this.frame = requestAnimationFrame(() => this.tick());
    }
    seek(fraction) {
      if (!this.running) return;
      this.lock("review", true);
      this.tracks.forEach(
        (a) =>
          (a.currentTime =
            Math.min(0.999, Math.max(0, fraction)) * this.duration),
      );
      this.tick();
    }
  }
  function reviewTools() {
    if (!review) return;
    const wasOpen = tools?.open;
    tools?.remove();
    tools = document.createElement("details");
    tools.className = "mascot-scene-review";
    tools.innerHTML = `<summary>${tr("مراجعة حركات الروبوت", "Mascot scene review")}</summary><div class="scene-review-body"><p>${tr("نفس التصميم · تشغيل يدوي صامت", "Same design · Silent manual review")}</p><div>${Object.entries(
      names,
    )
      .map(
        ([key, label]) =>
          `<button data-scene="${key}">${tr(...label)}</button>`,
      )
      .join(
        "",
      )}</div><label>${tr("لقطة المشهد", "Scene pose")}<select aria-label="${tr("لقطة المشهد", "Scene pose")}"><option value="">${tr("اختر لقطة لإيقافها", "Choose a pose to hold")}</option><option value="0.15">15% · ${tr("الرمشة / التفكير", "Blink / thinking")}</option><option value="0.18">18% · ${tr("الاستعداد / خلف الجسم", "Ready / behind body")}</option><option value="0.4">40% · ${tr("الإخراج / الرجوع", "Pull out / return")}</option><option value="0.58">58% · ${tr("فلاش / إبريق مائل", "Flash / tilted can")}</option><option value="0.6">60% · ${tr("غمزة / إمساك", "Wink / grip")}</option><option value="0.62">62% · ${tr("التصوير / السقي / التقديم", "Photos / watering / present")}</option><option value="0.9">90% · ${tr("الترتيب والعودة", "Tidy up and return")}</option></select></label><button data-scene-pause>${tr("إيقاف مؤقت", "Pause")}</button><button data-scene-auto>${tr("تشغيل التنويع التلقائي", "Enable varied autoplay")}</button><output aria-live="off"></output></div>`;
    document.body.append(tools);
    tools.open = !!wasOpen;
    tools.querySelectorAll("[data-scene]").forEach(
      (b) =>
        (b.onclick = () => {
          director.lock("review", false);
          tools.querySelector("select").value = "";
          director.run(b.dataset.scene);
        }),
    );
    tools.querySelector("select").onchange = (e) => {
      if (e.target.value) director.seek(Number(e.target.value));
    };
    tools.querySelector("[data-scene-pause]").onclick = () =>
      director.lock("review", !director.locks.has("review"));
    tools.querySelector("[data-scene-auto]").onclick = () => {
      director.auto = !director.auto;
      tools.querySelector("[data-scene-auto]").textContent = director.auto
        ? tr("إيقاف التنويع التلقائي", "Disable varied autoplay")
        : tr("تشغيل التنويع التلقائي", "Enable varied autoplay");
      director.schedule();
    };
  }

  root.innerHTML =
    art() +
    `<img class="dock-placeholder" src="/assets/mascot/yasminat-logo-64.png" alt=""><span data-clock hidden></span><button type="button" class="dock-launch" aria-label="${tr("افتح مساعد ياسمينات — معاينة", "Open Yasminat companion — preview")}" aria-haspopup="dialog"></button><button type="button" class="dock-quiet" data-dock-quiet aria-label="${tr("هدوء الحركة", "Quiet motion")}" aria-pressed="${quiet}">${quiet ? "▶" : "Ⅱ"}</button>`;
  root.dir = language === "ar" ? "rtl" : "ltr";
  root.dataset.release = "mascot-scenes-v1";
  root
    .querySelector('[data-part="head"]')
    .append(root.querySelector("[data-eyes]"));
  const abort = new AbortController();
  const on = (node, event, fn, options = {}) =>
    node.addEventListener(event, fn, { ...options, signal: abort.signal });
  director = new Director(root);
  const open = () => {
    // Opening the dock hands off from an existing inline introduction.
    document.querySelectorAll("[data-mascot-welcome] audio,.mascot-presentation video").forEach(media=>media.pause());
    director.lock("panel", true);
    onOpen();
  };
  on(root.querySelector(".dock-launch"), "click", open);
  on(root.querySelector("[data-dock-hit]"), "click", open);
  on(root.querySelector("[data-dock-quiet]"), "click", () => {
    quiet = !quiet;
    try {
      sessionStorage.setItem("yasminat-mascot-quiet", quiet ? "1" : "0");
    } catch {}
    director.lock("quiet", quiet);
    root
      .querySelector("[data-dock-quiet]")
      .setAttribute("aria-pressed", String(quiet));
    root.querySelector("[data-dock-quiet]").textContent = quiet ? "▶" : "Ⅱ";
  });
  director.lock("quiet", quiet);
  director.lock("reduced", motion.matches);
  director.lock("hidden", document.hidden);
  frameReady.then((frame) => {
    if (disposed || !frame || !root.isConnected) return;
    root
      .querySelectorAll("[data-robot-image]")
      .forEach((n) => n.setAttribute("href", frame));
    root.dataset.artReady = "true";
  });
  function overlayState() {
    const occluded =
      !!shell.querySelector(".screen")?.inert ||
      [...document.querySelectorAll('dialog[open],[aria-modal="true"]')].some(
        (n) => !n.closest(".mascot-dock-panel"),
      );
    root.dataset.occluded = String(occluded);
    director.lock("overlay", occluded);
    if (root.inert !== occluded) root.inert = occluded;
  }
  function position() {
    if (!root || !shell) return;
    const screen = shell.querySelector(".screen"),
      tabs = shell.querySelector(".mobile-tabs");
    // Layout dimensions ignore scroll positions and the tab bar's hide/show transform.
    const floor = Math.max(
      0,
      shell.clientHeight - screen.offsetTop - screen.offsetHeight,
    );
    const tabHeight =
      tabs && getComputedStyle(tabs).display !== "none" ? tabs.offsetHeight : 0;
    const protectedPage = ["YAS-005", "YAS-006", "YAS-010", "YAS-011"].includes(
      shell.id,
    );
    const bottom = floor + Math.max(4, (protectedPage ? 96 : tabHeight) - 18);
    const edge =
      (language === "ar" ? "rtl" : "ltr") === "rtl" ? "left" : "right";
    const contact = shell.querySelector(".mobile-contact-dock");
    const inset =
      contact && getComputedStyle(contact).display !== "none" ? 62 : 10;
    root.dataset.edge = edge;
    root.dataset.protected = String(protectedPage);
    root.style.left = edge === "left" ? inset + "px" : "auto";
    root.style.right = edge === "right" ? inset + "px" : "auto";
    root.style.bottom = `calc(${bottom}px + env(safe-area-inset-bottom,0px))`;
    root.dataset.anchor = `${edge}:${inset}:${bottom}`;
    root.dataset.anchorRevision = String(++anchorRevision);
    director.lock("protected", protectedPage);
    overlayState();
    checkOverlap();
  }
  function checkOverlap() {
    if (!root?.isConnected || document.hidden || isPanelOpen()) return;
    // One read batch after scrolling settles. Never move the corner to avoid content.
    const hit = root.querySelector("[data-dock-hit]").getBoundingClientRect(),
      quietRect = root.querySelector(".dock-quiet").getBoundingClientRect();
    const view = shell.querySelector(".screen").getBoundingClientRect();
    const controls = [
      ...shell.querySelectorAll(
        ".screen button,.screen input,.screen select,.screen textarea,.screen a,.screen .promotion-cta,.whatsapp-float",
      ),
    ]
      .filter((n) => n.getClientRects().length)
      .map((n) => n.getBoundingClientRect());
    const overlap = controls.some(
      (r) =>
        r.bottom > view.top &&
        r.top < view.bottom &&
        r.right > view.left &&
        r.left < view.right &&
        [hit, quietRect].some(
          (b) =>
            r.left < b.right &&
            r.right > b.left &&
            r.top < b.bottom &&
            r.bottom > b.top,
        ),
    );
    root.dataset.passThrough = String(overlap);
    root.dataset.controlOverlap = overlap ? "pass-through" : "0";
  }

  function scrollState(event) {
    if (event.target !== shell.querySelector(".screen")) return;
    if (root.dataset.scrolling !== "true") root.dataset.scrolling = "true";
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      root.dataset.scrolling = "false";
      checkOverlap();
    }, 180);
  }
  const mediaLock = () =>
    director.lock(
      "media",
      [
        ...document.querySelectorAll(
          "[data-mascot-welcome] audio,.mascot-presentation video",
        ),
      ].some((m) => !m.paused && !m.ended),
    );
  on(shell.querySelector(".screen"), "scroll", scrollState, { passive: true });
  on(document, "visibilitychange", () =>
    director.lock("hidden", document.hidden),
  );
  on(window, "pagehide", () => director.lock("hidden", true));
  on(motion, "change", () => {
    if (motion.matches) director.stop();
    director.lock("reduced", motion.matches);
  });
  for (const event of ["play", "pause", "ended"])
    on(document, event, mediaLock, { capture: true });
  let layoutFrame = 0;
  const resize = () => {
    cancelAnimationFrame(layoutFrame);
    layoutFrame = requestAnimationFrame(position);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(shell);
  on(window, "resize", resize);
  if (window.visualViewport) on(window.visualViewport, "resize", resize);
  const overlayObserver = new MutationObserver(overlayState);
  overlayObserver.observe(shell, {
    subtree: true,
    attributes: true,
    attributeFilter: ["open", "inert", "aria-modal"],
    childList: true,
  });
  reviewTools();
  position();
  return {
    panelChanged(open) {
      director.lock("panel", open);
      if (!open) {
        mediaLock();
        overlayState();
        checkOverlap();
      }
    },
    destroy() {
      disposed = true;
      director.stop();
      abort.abort();
      observer.disconnect();
      overlayObserver.disconnect();
      clearTimeout(scrollTimer);
      cancelAnimationFrame(layoutFrame);
      tools?.remove();
      root.replaceChildren();
    },
  };
}

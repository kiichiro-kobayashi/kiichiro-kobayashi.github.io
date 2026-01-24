// 1) フッター年号を自動で今年にする
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// 2) スクロール位置に合わせてナビをハイライト（安定版）
const navLinks = document.querySelectorAll(".nav-link");
const sectionIds = ["about", "works", "cv", "contact"];
const sections = sectionIds
  .map((id) => document.getElementById(id))
  .filter(Boolean);

function setActive(id) {
  navLinks.forEach((a) => {
    a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`);
  });
}

// ヘッダー高さ（固定ヘッダー分のズレ対策）
const headerEl = document.querySelector(".site-header");
const headerH = headerEl ? headerEl.offsetHeight : 0;

// IntersectionObserver：thresholdに0を入れる＆rootMarginでヘッダー分を相殺
if ("IntersectionObserver" in window && sections.length > 0) {
  let currentId = null;

  const io = new IntersectionObserver(
    (entries) => {
      // 画面内に入っているものだけ
      const visible = entries.filter((e) => e.isIntersecting);
      if (!visible.length) return;

      // 「ヘッダー直下に最も近いセクション」を採用（Worksの取りこぼしを防ぐ）
      visible.sort((a, b) => {
        const aTop = Math.abs(a.boundingClientRect.top - (headerH + 8));
        const bTop = Math.abs(b.boundingClientRect.top - (headerH + 8));
        return aTop - bTop;
      });

      const id = visible[0].target.id;
      if (id && id !== currentId) {
        currentId = id;
        setActive(id);
      }
    },
    {
      // 上：ヘッダー分だけ「見えてる判定」を下げる
      // 下：次のセクションが少し入っても切り替わりにくくする
      rootMargin: `-${headerH + 12}px 0px -60% 0px`,
      threshold: [0, 0.01, 0.1, 0.2],
    }
  );

  sections.forEach((sec) => io.observe(sec));

  // クリックした瞬間にもハイライト（体感のズレ防止）
  navLinks.forEach((a) => {
    a.addEventListener("click", () => {
      const href = a.getAttribute("href") || "";
      const id = href.startsWith("#") ? href.slice(1) : "";
      if (id) setActive(id);
    });
  });
} else {
  // 古いブラウザ用：とりあえずAboutをアクティブ
  setActive("about");
}

// 3) Works：クリックでモーダル表示（iPhoneで「何度も押す」対策も少し入れる）
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalMeta = document.getElementById("modalMeta");
const modalDesc = document.getElementById("modalDesc");

function openModal({ src, title, meta, desc }) {
  if (!modal || !modalImg) return;

  modalImg.src = src;
  modalImg.alt = title || "Artwork";
  if (modalTitle) modalTitle.textContent = title || "";
  if (modalMeta) modalMeta.textContent = meta || "";
  if (modalDesc) modalDesc.textContent = desc || "";

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (!modal) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  if (modalImg) modalImg.src = "";
  document.body.style.overflow = "";
}

// iOSで「タップが効きにくい」体感がある時の保険（連打・二重発火も抑制）
let lastOpenAt = 0;

function handleWorkOpen(e, a) {
  e.preventDefault();
  const now = Date.now();
  if (now - lastOpenAt < 350) return;
  lastOpenAt = now;

  openModal({
    src: a.getAttribute("href") || "",
    title: a.dataset.title || "",
    meta: a.dataset.meta || "",
    desc: a.dataset.desc || "",
  });
}

document.querySelectorAll(".work-link").forEach((a) => {
  a.addEventListener("click", (e) => handleWorkOpen(e, a));
  a.addEventListener(
    "touchend",
    (e) => handleWorkOpen(e, a),
    { passive: false }
  );
});

// 背景 or × で閉じる
if (modal) {
  modal.addEventListener("click", (e) => {
    const t = e.target;
    if (t instanceof HTMLElement && t.dataset.close === "true") closeModal();
  });
}

// ESCで閉じる
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});
// 1) フッター年号を自動で今年にする
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// 2) スクロール位置に合わせてナビをハイライト
const navLinks = document.querySelectorAll(".nav-link");
const sectionIds = ["about", "works", "cv", "contact"];
const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

function setActive(id) {
  navLinks.forEach(a => {
    a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`);
  });
}

if ("IntersectionObserver" in window && sections.length > 0) {
  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target?.id) setActive(visible.target.id);
    },
    { threshold: [0.2, 0.35, 0.5, 0.65] }
  );

  sections.forEach(sec => io.observe(sec));
} else {
  // 古いブラウザでも最低限
  setActive("about");
}

// 3) Works：クリックでモーダル表示
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

document.querySelectorAll(".work-link").forEach(a => {
  a.addEventListener("click", (e) => {
    e.preventDefault();

    openModal({
      src: a.getAttribute("href") || "",
      title: a.dataset.title || "",
      meta: a.dataset.meta || "",
      desc: a.dataset.desc || ""
    });
  });
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
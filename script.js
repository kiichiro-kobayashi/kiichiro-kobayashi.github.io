/* script.js (ES5) */

/* =========================
   1) Footer year
========================= */
(function () {
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

/* =========================
   2) Nav active (Scroll Spy)
   - IntersectionObserverは使わない（端末差でズレるため）
   - スクロール位置で確実に判定する
========================= */
(function () {
  var navLinks = document.querySelectorAll(".nav-link");
  var ids = ["about", "works", "cv", "contact"];
  var sections = [];
  var i;

  for (i = 0; i < ids.length; i++) {
    var sec = document.getElementById(ids[i]);
    if (sec) sections.push(sec);
  }

  function setActive(id) {
    for (var j = 0; j < navLinks.length; j++) {
      var a = navLinks[j];
      var href = a.getAttribute("href");
      a.classList.toggle("is-active", href === ("#" + id));
    }
  }

  function getHeaderH() {
    var headerEl = document.querySelector(".site-header");
    return headerEl ? headerEl.offsetHeight : 0;
  }

  function updateActiveFromScroll() {
    var headerH = getHeaderH();
    var line = headerH + 32; // ヘッダー直下の判定ライン（微調整しやすい値）
    var activeId = "about";

    for (var k = 0; k < sections.length; k++) {
      var top = sections[k].getBoundingClientRect().top;
      if (top <= line) activeId = sections[k].id;
    }

    setActive(activeId);
  }

  var ticking = false;
  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateActiveFromScroll();
      ticking = false;
    });
  }

  // 初回
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateActiveFromScroll);
  } else {
    updateActiveFromScroll();
  }

  // スクロール/リサイズ/向き変更で更新
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  window.addEventListener("orientationchange", requestUpdate);

  // クリック直後にも反映（体感のズレ防止）
  for (i = 0; i < navLinks.length; i++) {
    navLinks[i].addEventListener("click", function () {
      var href = this.getAttribute("href") || "";
      if (href.charAt(0) === "#") setActive(href.slice(1));
    });
  }
})();

/* =========================
   3) Works modal
   - Androidでスクロールしようとしても開かないようにする
   - 「タップ（指の移動が小さい）」ときだけ開く
========================= */
(function () {
  var modal = document.getElementById("modal");
  var modalImg = document.getElementById("modalImg");
  var modalTitle = document.getElementById("modalTitle");
  var modalMeta = document.getElementById("modalMeta");
  var modalDesc = document.getElementById("modalDesc");

  function openModal(data) {
    if (!modal || !modalImg) return;

    modalImg.src = data.src || "";
    modalImg.alt = data.title || "Artwork";
    if (modalTitle) modalTitle.textContent = data.title || "";
    if (modalMeta) modalMeta.textContent = data.meta || "";
    if (modalDesc) modalDesc.textContent = data.desc || "";

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

  // ---- タップ判定（これがAndroidの誤爆を止める）
  var TAP_MOVE_PX = 10; // 10px以上動いたら「スクロール」とみなす
  var startX = 0;
  var startY = 0;
  var moved = false;

  function getPoint(e) {
    if (e.touches && e.touches.length) return e.touches[0];
    if (e.changedTouches && e.changedTouches.length) return e.changedTouches[0];
    return e;
  }

  function onDown(e) {
    var p = getPoint(e);
    startX = p.clientX;
    startY = p.clientY;
    moved = false;
  }

  function onMove(e) {
    var p = getPoint(e);
    if (Math.abs(p.clientX - startX) > TAP_MOVE_PX || Math.abs(p.clientY - startY) > TAP_MOVE_PX) {
      moved = true;
    }
  }

  function openFromLink(e, a) {
    // スクロールしていたら開かない
    if (moved) return;

    if (e && e.preventDefault) e.preventDefault();

    openModal({
      src: a.getAttribute("href") || "",
      title: a.getAttribute("data-title") || "",
      meta: a.getAttribute("data-meta") || "",
      desc: a.getAttribute("data-desc") || ""
    });
  }

  // work-link に付与
  var workLinks = document.querySelectorAll(".work-link");
  for (var i = 0; i < workLinks.length; i++) {
    (function (a) {
      // Pointer Eventsが使える端末はそれを優先（Androidに強い）
      if (window.PointerEvent) {
        a.addEventListener("pointerdown", onDown, { passive: true });
        a.addEventListener("pointermove", onMove, { passive: true });
        a.addEventListener("pointerup", function (e) { openFromLink(e, a); }, { passive: false });
        a.addEventListener("pointercancel", function () { moved = true; }, { passive: true });
      } else {
        // フォールバック
        a.addEventListener("touchstart", onDown, { passive: true });
        a.addEventListener("touchmove", onMove, { passive: true });
        a.addEventListener("touchend", function (e) { openFromLink(e, a); }, { passive: false });
        a.addEventListener("click", function (e) {
          // clickは保険。touch環境では二重発火しやすいので、touchで開いた後はprevent
          e.preventDefault();
        }, false);
      }

      // PC等：クリックで開く
      a.addEventListener("click", function (e) {
        // pointer/touchで既に開く端末でも「クリックだけ」発火する場合があるため、
        // movedがtrueの時（＝スクロール）には開かない
        if (moved) return;
        if (e && e.preventDefault) e.preventDefault();
        openFromLink(e, a);
      });
    })(workLinks[i]);
  }

  // 背景 or × を押したら閉じる（data-close="true"）
  if (modal) {
    modal.addEventListener("click", function (e) {
      var t = e.target;
      if (t && t.getAttribute && t.getAttribute("data-close") === "true") {
        closeModal();
      }
    });
  }

  // ESCで閉じる
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });
})();
/* script.js (ES5-compatible) */

(function () {
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

/* Language switch */
(function () {
  var button = document.getElementById("languageToggle");
  var jpElements = document.querySelectorAll(".lang-ja");
  var enElements = document.querySelectorAll(".lang-en");
  var currentLabel = button ? button.querySelector(".language-toggle__current") : null;
  var otherLabel = button ? button.querySelector(".language-toggle__other") : null;
  var language = "ja";

  function applyLanguage(nextLanguage) {
    var i;
    language = nextLanguage === "en" ? "en" : "ja";
    document.documentElement.lang = language;
    document.body.setAttribute("data-language", language);

    for (i = 0; i < jpElements.length; i++) {
      jpElements[i].hidden = language !== "ja";
    }
    for (i = 0; i < enElements.length; i++) {
      enElements[i].hidden = language !== "en";
    }

    if (button) {
      button.setAttribute("aria-pressed", language === "en" ? "true" : "false");
      button.setAttribute("aria-label", language === "ja" ? "Switch to English" : "日本語に切り替える");
    }
    if (currentLabel) currentLabel.textContent = language === "ja" ? "JP" : "EN";
    if (otherLabel) otherLabel.textContent = language === "ja" ? "EN" : "JP";

    try {
      window.localStorage.setItem("portfolioLanguage", language);
    } catch (error) {
      /* Local storage may be unavailable; the site still works. */
    }
  }

  function getInitialLanguage() {
    var saved = "";
    try {
      saved = window.localStorage.getItem("portfolioLanguage") || "";
    } catch (error) {
      saved = "";
    }
    if (saved === "ja" || saved === "en") return saved;
    return "ja";
  }

  if (button) {
    button.addEventListener("click", function () {
      applyLanguage(language === "ja" ? "en" : "ja");
    });
  }

  window.portfolioLanguage = function () {
    return language;
  };

  applyLanguage(getInitialLanguage());
})();

/* Navigation highlight */
(function () {
  var navLinks = document.querySelectorAll(".nav-link");
  var ids = ["about", "works", "cv", "contact"];
  var sections = [];
  var ticking = false;
  var i;

  for (i = 0; i < ids.length; i++) {
    var section = document.getElementById(ids[i]);
    if (section) sections.push(section);
  }

  function setActive(id) {
    var j;
    for (j = 0; j < navLinks.length; j++) {
      var link = navLinks[j];
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
    }
  }

  function getHeaderHeight() {
    var header = document.querySelector(".site-header");
    return header ? header.offsetHeight : 0;
  }

  function updateActive() {
  var rootStyles = window.getComputedStyle(document.documentElement);
  var cssOffset = parseFloat(rootStyles.getPropertyValue("--header-offset"));
  var line = isNaN(cssOffset) ? getHeaderHeight() + 36 : cssOffset + 1;
  var activeId = "";
  var j;

  /* ページ最下部では Contact を必ず現在地にする */
  var scrollBottom =
    window.pageYOffset + window.innerHeight;

  var documentHeight =
    Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );

  if (scrollBottom >= documentHeight - 8) {
    setActive("contact");
    return;
  }

  for (j = 0; j < sections.length; j++) {
    if (sections[j].getBoundingClientRect().top <= line) {
      activeId = sections[j].id;
    }
  }

  setActive(activeId);
}

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateActive();
      ticking = false;
    });
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  window.addEventListener("orientationchange", requestUpdate);
  window.addEventListener("load", updateActive);

  for (i = 0; i < navLinks.length; i++) {
    navLinks[i].addEventListener("click", function () {
      var href = this.getAttribute("href") || "";
      if (href.charAt(0) === "#") setActive(href.slice(1));
    });
  }

  updateActive();
})();

/* Works modal: open only after a deliberate tap/click */
(function () {
  var modal = document.getElementById("modal");
  var modalImg = document.getElementById("modalImg");
  var modalTitle = document.getElementById("modalTitle");
  var modalMeta = document.getElementById("modalMeta");
  var modalDesc = document.getElementById("modalDesc");
  var workLinks = document.querySelectorAll(".work-link");
  var lastFocused = null;
  var startX = 0;
  var startY = 0;
  var moved = false;
  var moveLimit = 10;
  var i;

  function currentLanguage() {
    if (typeof window.portfolioLanguage === "function") return window.portfolioLanguage();
    return document.documentElement.lang === "en" ? "en" : "ja";
  }

  function openModal(link) {
    var isEnglish = currentLanguage() === "en";
    if (!modal || !modalImg) return;

    lastFocused = link;
    modalImg.src = link.getAttribute("href") || "";
    modalImg.alt = isEnglish
      ? (link.getAttribute("data-title-en") || link.getAttribute("data-title") || "Artwork")
      : (link.getAttribute("data-title") || "作品");
    modalTitle.textContent = isEnglish
      ? (link.getAttribute("data-title-en") || link.getAttribute("data-title") || "")
      : (link.getAttribute("data-title") || "");
    modalMeta.textContent = link.getAttribute("data-meta") || "";
    modalDesc.textContent = isEnglish
      ? (link.getAttribute("data-desc-en") || link.getAttribute("data-desc") || "")
      : (link.getAttribute("data-desc") || "");

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    var closeButton = modal.querySelector(".modal__close");
    if (closeButton) closeButton.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (modalImg) modalImg.src = "";
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function pointFromEvent(event) {
    if (event.touches && event.touches.length) return event.touches[0];
    if (event.changedTouches && event.changedTouches.length) return event.changedTouches[0];
    return event;
  }

  function onDown(event) {
    var point = pointFromEvent(event);
    startX = point.clientX;
    startY = point.clientY;
    moved = false;
  }

  function onMove(event) {
    var point = pointFromEvent(event);
    if (Math.abs(point.clientX - startX) > moveLimit || Math.abs(point.clientY - startY) > moveLimit) {
      moved = true;
    }
  }

  function bindLink(link) {
    if (window.PointerEvent) {
      link.addEventListener("pointerdown", onDown, { passive: true });
      link.addEventListener("pointermove", onMove, { passive: true });
      link.addEventListener("pointercancel", function () { moved = true; }, { passive: true });
    } else {
      link.addEventListener("touchstart", onDown, { passive: true });
      link.addEventListener("touchmove", onMove, { passive: true });
      link.addEventListener("touchcancel", function () { moved = true; }, { passive: true });
    }

    link.addEventListener("click", function (event) {
      event.preventDefault();
      if (moved) {
        moved = false;
        return;
      }
      openModal(link);
    });
  }

  for (i = 0; i < workLinks.length; i++) bindLink(workLinks[i]);

  if (modal) {
    modal.addEventListener("click", function (event) {
      var target = event.target;
      if (target && target.getAttribute && target.getAttribute("data-close") === "true") closeModal();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal && modal.classList.contains("is-open")) closeModal();
  });
})();

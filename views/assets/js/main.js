/**
 * Page interactions: scroll-reveal, scroll progress, sticky CTA bar,
 * back-to-top, hero parallax, button ripple. Each piece is independent
 * and no-ops safely if its target markup isn't present, so this file
 * can be reused on other pages without modification.
 */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* -------------------------------------------------------
     Scroll-reveal
     Adds .is-visible the first time a .reveal element enters
     the viewport, then stops observing it (one-shot).
     ------------------------------------------------------- */
  (function initReveal() {
    var revealEls = document.querySelectorAll(".reveal");
    if (!revealEls.length) return;

    function revealAll() {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealAll();
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });

    // Safety net: an instant jump (anchor link, "End" key, dragging the
    // scrollbar) can move past an element in a single frame with no
    // intermediate paint for the observer to catch, which would leave
    // it stuck invisible. Catch that on scroll and reveal it immediately.
    var ticking = false;
    function checkSkippedElements() {
      revealEls.forEach(function (el) {
        if (el.classList.contains("is-visible")) return;
        var rect = el.getBoundingClientRect();
        if (rect.bottom < 0) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      });
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(checkSkippedElements);
          ticking = true;
        }
      },
      { passive: true }
    );
  })();

  /* -------------------------------------------------------
     Scroll progress bar
     ------------------------------------------------------- */
  var progressBar = document.getElementById("scrollProgress");

  /* -------------------------------------------------------
     Sticky CTA bar
     Visible whenever the hero is scrolled out of view.
     ------------------------------------------------------- */
  var stickyBar = document.getElementById("stickyBar");
  var hero = document.querySelector(".hero");

  function setStickyBarVisible(visible) {
    if (!stickyBar) return;
    stickyBar.classList.toggle("is-visible", visible);
    stickyBar.setAttribute("aria-hidden", visible ? "false" : "true");
    if (visible) {
      stickyBar.removeAttribute("inert");
    } else {
      stickyBar.setAttribute("inert", "");
    }
    stickyBar.querySelectorAll("a, button").forEach(function (btn) {
      btn.tabIndex = visible ? 0 : -1;
    });
  }

  if (stickyBar && hero && "IntersectionObserver" in window) {
    var heroObserver = new IntersectionObserver(
      function (entries) {
        setStickyBarVisible(!entries[0].isIntersecting);
      },
      { threshold: 0 }
    );
    heroObserver.observe(hero);
  }

  /* -------------------------------------------------------
     Back-to-top
     ------------------------------------------------------- */
  var backToTop = document.getElementById("backToTop");

  /* -------------------------------------------------------
     Combined scroll listener (progress bar + back-to-top),
     rAF-throttled so it never runs more than once per frame.
     ------------------------------------------------------- */
  (function initScrollUI() {
    if (!progressBar && !backToTop) return;
    var ticking = false;

    function update() {
      var doc = document.documentElement;
      var scrollTop = window.scrollY || doc.scrollTop;
      var scrollable = doc.scrollHeight - doc.clientHeight;

      if (progressBar) {
        var pct = scrollable > 0 ? (scrollTop / scrollable) * 100 : 0;
        progressBar.style.width = pct + "%";
      }

      if (backToTop) {
        backToTop.classList.toggle("is-visible", scrollTop > window.innerHeight * 0.8);
      }

      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  })();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  }

  /* -------------------------------------------------------
     Hero parallax
     Subtle pointer-follow drift on the hero image collage.
     Desktop with a precise pointer only — skipped on touch
     devices and under reduced motion.
     ------------------------------------------------------- */
  (function initParallax() {
    var visual = document.getElementById("heroVisualInner");
    if (!visual) return;
    if (prefersReducedMotion) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    var heroEl = document.querySelector(".hero");
    if (!heroEl) return;

    var targetX = 0,
      targetY = 0,
      currentX = 0,
      currentY = 0;
    var raf = null;
    var maxOffset = 14; // px, deliberately subtle

    function onMove(e) {
      var rect = heroEl.getBoundingClientRect();
      var relX = (e.clientX - rect.left) / rect.width - 0.5;
      var relY = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = relX * maxOffset;
      targetY = relY * maxOffset;
      if (!raf) raf = window.requestAnimationFrame(render);
    }

    function onLeave() {
      targetX = 0;
      targetY = 0;
      if (!raf) raf = window.requestAnimationFrame(render);
    }

    function render() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      visual.style.transform =
        "translate3d(" + currentX.toFixed(2) + "px, " + currentY.toFixed(2) + "px, 0)";

      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        raf = window.requestAnimationFrame(render);
      } else {
        raf = null;
      }
    }

    heroEl.addEventListener("pointermove", onMove, { passive: true });
    heroEl.addEventListener("pointerleave", onLeave, { passive: true });
  })();

  /* -------------------------------------------------------
     Button ripple
     Decorative click feedback. Position is recorded as CSS
     custom properties consumed by the ::after in main.css.
     ------------------------------------------------------- */
  (function initRipple() {
    if (prefersReducedMotion) return;
    document.querySelectorAll(".btn").forEach(function (btn) {
      btn.addEventListener("pointerdown", function (e) {
        var rect = btn.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        btn.style.setProperty("--ripple-x", x + "%");
        btn.style.setProperty("--ripple-y", y + "%");
        btn.classList.remove("is-rippling");
        // Force reflow so re-triggering the class restarts the animation
        // even on rapid repeated clicks.
        void btn.offsetWidth;
        btn.classList.add("is-rippling");
      });
      btn.addEventListener("animationend", function () {
        btn.classList.remove("is-rippling");
      });
    });
  })();
})();

  /* -------------------------------------------------------
     Theme toggle
     Reads the current data-theme set by the inline FOUC script,
     lets the user flip it, and persists to localStorage so the
     next page load skips the OS-preference fallback.
     ------------------------------------------------------- */
  (function initTheme() {
    var toggle = document.getElementById("themeToggle");
    if (!toggle) return;

    var label = toggle.querySelector(".theme-toggle__label");

    function applyTheme(theme) {
      document.documentElement.dataset.theme = theme;
      try { localStorage.setItem("theme", theme); } catch (e) {}
      var isDark = theme === "dark";
      toggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
      toggle.setAttribute("aria-pressed", isDark ? "true" : "false");
      if (label) label.textContent = isDark ? "Dark" : "Light";
    }

    // Sync label to whatever the FOUC script already set
    applyTheme(document.documentElement.dataset.theme || "light");

    toggle.addEventListener("click", function () {
      var current = document.documentElement.dataset.theme;
      applyTheme(current === "dark" ? "light" : "dark");
    });

    // If the user changes their OS preference mid-session and they
    // haven't manually overridden it yet, follow the system.
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", function (e) {
      try {
        if (localStorage.getItem("theme")) return; // manual choice wins
      } catch (err) {}
      applyTheme(e.matches ? "dark" : "light");
    });
  })();
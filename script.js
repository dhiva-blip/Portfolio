/* ==========================================================================
   Dhiva — Portfolio
   Vanilla JS — no dependencies
   ========================================================================== */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
     Sticky navbar background on scroll
  --------------------------------------------------------------------- */
  const navbar = document.getElementById("navbar");
  const scrollTopBtn = document.getElementById("scrollTop");

  function onScroll() {
    const y = window.scrollY;
    navbar.classList.toggle("scrolled", y > 12);
    scrollTopBtn.classList.toggle("show", y > 480);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  /* ---------------------------------------------------------------------
     Mobile nav toggle
  --------------------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------------------------------------------------------------------
     Active nav link highlighting on scroll
  --------------------------------------------------------------------- */
  const sections = Array.from(document.querySelectorAll("section[id]"));
  const navAnchors = Array.from(navLinks.querySelectorAll("a"));

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute("id");
        const link = navAnchors.find((a) => a.getAttribute("href") === `#${id}`);
        if (!link) return;
        if (entry.isIntersecting) {
          navAnchors.forEach((a) => a.classList.remove("active"));
          link.classList.add("active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((s) => sectionObserver.observe(s));

  /* ---------------------------------------------------------------------
     Scroll reveal animations
  --------------------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------------------------------------------------------------------
     Skill bar fill animation (triggered on view)
  --------------------------------------------------------------------- */
  const skillCards = document.querySelectorAll(".skill-card");
  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          skillObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  skillCards.forEach((card) => skillObserver.observe(card));

  /* ---------------------------------------------------------------------
     Hero role — typing effect
  --------------------------------------------------------------------- */
  const roles = [
    "Frontend Developer",
    "Landing Page Specialist",
    "Building for Startups",
    "Building for Cafés & Restaurants",
    "Building for Small Businesses",
  ];
  const roleEl = document.getElementById("roleType");

  function typeLoop() {
    if (prefersReducedMotion || !roleEl) {
      if (roleEl) roleEl.textContent = roles[0];
      return;
    }
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const current = roles[roleIndex];
      if (!deleting) {
        charIndex++;
        roleEl.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(tick, 1400);
          return;
        }
      } else {
        charIndex--;
        roleEl.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }
      setTimeout(tick, deleting ? 30 : 55);
    }
    tick();
  }
  typeLoop();

  /* ---------------------------------------------------------------------
     Signature hero element: animated code editor that "types" a landing
     page snippet, then reveals a live preview card.
  --------------------------------------------------------------------- */
  const editorBody = document.getElementById("editorBody");

  const codeLines = [
    { html: '<span class="tok-tag">&lt;section</span> <span class="tok-attr">class</span>=<span class="tok-str">"hero"</span><span class="tok-tag">&gt;</span>' },
    { html: '&nbsp;&nbsp;<span class="tok-tag">&lt;h1&gt;</span>Welcome to Adda<span class="tok-tag">&lt;/h1&gt;</span>' },
    { html: '&nbsp;&nbsp;<span class="tok-tag">&lt;p&gt;</span>Coffee, conversation, community.<span class="tok-tag">&lt;/p&gt;</span>' },
    { html: '&nbsp;&nbsp;<span class="tok-tag">&lt;button&gt;</span>View Menu<span class="tok-tag">&lt;/button&gt;</span>' },
    { html: '<span class="tok-tag">&lt;/section&gt;</span>' },
    { html: '' },
    { html: '<span class="tok-comment">// built responsive, fast, ready to ship</span>' },
  ];

  function buildEditor() {
    if (!editorBody) return;

    if (prefersReducedMotion) {
      editorBody.innerHTML = codeLines
        .map(
          (l, i) =>
            `<div class="code-line"><span class="ln">${String(i + 1).padStart(2, "0")}</span>${l.html}</div>`
        )
        .join("");
      showPreview();
      return;
    }

    let lineIndex = 0;

    function typeNextLine() {
      if (lineIndex >= codeLines.length) {
        showPreview();
        setTimeout(() => {
          editorBody.innerHTML = "";
          lineIndex = 0;
          typeNextLine();
        }, 3600);
        return;
      }

      const lineDiv = document.createElement("div");
      lineDiv.className = "code-line";
      const lineNum = document.createElement("span");
      lineNum.className = "ln";
      lineNum.textContent = String(lineIndex + 1).padStart(2, "0");
      lineDiv.appendChild(lineNum);

      const contentSpan = document.createElement("span");
      contentSpan.innerHTML = "";
      const cursor = document.createElement("span");
      cursor.className = "type-cursor";

      lineDiv.appendChild(contentSpan);
      lineDiv.appendChild(cursor);
      editorBody.appendChild(lineDiv);

      const fullHtml = codeLines[lineIndex].html;
      // Type by revealing the raw markup progressively is unsafe for tags,
      // so instead fade the full (already-safe) line in for performance/robustness.
      contentSpan.innerHTML = fullHtml;
      contentSpan.style.opacity = "0";
      requestAnimationFrame(() => {
        contentSpan.style.transition = "opacity 0.25s ease";
        contentSpan.style.opacity = "1";
      });

      lineIndex++;
      setTimeout(typeNextLine, fullHtml === "" ? 180 : 340);
    }

    typeNextLine();
  }

  function showPreview() {
    if (!editorBody) return;
    const wrap = document.createElement("div");
    wrap.className = "editor-preview";
    wrap.innerHTML = `
      <div class="pv-badge"><span class="live"></span>live preview</div>
      <div class="pv-card">
        <div class="pv-title">Welcome to Adda</div>
        <div class="pv-sub">Coffee, conversation, community.</div>
        <span class="pv-btn">View Menu</span>
      </div>
    `;
    editorBody.appendChild(wrap);
    requestAnimationFrame(() => {
      wrap.querySelector(".pv-card").classList.add("show");
    });
  }

  buildEditor();

  /* ---------------------------------------------------------------------
     Contact form — front-end only handling
  --------------------------------------------------------------------- */
  const form = document.getElementById("contactForm");
  const successMsg = document.getElementById("formSuccess");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      successMsg.classList.add("show");
      form.reset();
      setTimeout(() => successMsg.classList.remove("show"), 6000);
    });
  }
})();

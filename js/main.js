(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Fill dynamic bits
  document.title = SITE.title || document.title;
  $("#year").textContent = new Date().getFullYear();

  // Nav menu toggle (mobile)
  const navToggle = $(".nav-toggle");
  const navMenu = $("#nav-menu");
  navToggle?.addEventListener("click", () => {
    const open = navMenu.classList.toggle("show");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  $$("#nav-menu a").forEach(a => a.addEventListener("click", () => navMenu.classList.remove("show")));

  // Theme toggle (persist)
  const themeBtn = $("#themeToggle");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const saved = localStorage.getItem("theme");
  const dark = saved ? saved === "dark" : prefersDark;
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  themeBtn?.addEventListener("click", () => {
    const isDark = document.documentElement.dataset.theme !== "dark" ? true : false;
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });

  // Populate skills
  const skillGrid = $("#skillGrid");
  SITE.skillsCategories.forEach(cat => {
    cat.items.forEach(s => {
      const li = document.createElement("li");
      li.className = "reveal";
      li.innerHTML = `<strong>${s.name}</strong><span class="level">${s.level}</span>`;
      skillGrid.appendChild(li);
    });
  });

  // Populate experience
  const timeline = $("#timeline");
  SITE.experience?.forEach(exp => {
    const li = document.createElement("li");
    li.className = "reveal";
    li.innerHTML = `
      <div class="where">${exp.role} · ${exp.where}</div>
      <div class="when">${exp.when}</div>
      <ul>${exp.what.map(w => `<li>${w}</li>`).join("")}</ul>
    `;
    timeline.appendChild(li);
  });

  // Populate projects + filters
  const projectGrid = $("#projectGrid");
  const renderProjects = (filter = "all") => {
    projectGrid.innerHTML = "";
    PROJECTS?.filter(p => filter === "all" || p.tags.includes(filter)).forEach(p => {
      const card = document.createElement("article");
      card.className = "card reveal";
      card.innerHTML = `
        <img src="${p.image}" alt="${p.title} preview" loading="lazy" decoding="async" />
        <div class="meta">
          <h3>${p.title}</h3>
          <p>${p.blurb}</p>
          <div class="badges">${p.tags.map(t => `<span class="badge">${t}</span>`).join("")}</div>
        </div>
        <div class="actions">
          ${p.links?.live ? `<a class="btn primary" href="${p.links.live}">Live</a>` : ""}
          ${p.links?.code ? `<a class="btn ghost" href="${p.links.code}">Code</a>` : ""}
        </div>
      `;
      projectGrid.appendChild(card);
    });
    reveal(); // animate newly injected cards
  };
  renderProjects();

  $$(".chip").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".chip").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderProjects(btn.dataset.filter);
    });
  });

  // Count-up stats
  const nums = $$(".stat .num");
  const countUp = (el) => {
    const target = +el.dataset.countto || 0;
    const step = Math.max(1, Math.floor(target / 80));
    let current = 0;
    const tick = () => {
      current = Math.min(current + step, target);
      el.textContent = current.toString();
      if (current < target) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // Reveal on scroll
  const revealEls = $$(".reveal");
  let observer;
  const reveal = () => {
    if (!observer) return;
    $$(".reveal").forEach(el => observer.observe(el));
  };
  observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        if (e.target.classList.contains("num")) countUp(e.target);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  reveal();

  // Back to top
  $("#backToTop").addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Netlify form success message (no page refresh)
  const form = document.querySelector("form[data-netlify='true']");
  form?.addEventListener("submit", (e) => {
    const status = $(".form-status");
    status.textContent = "Sending…";
    // Let Netlify handle it—just give quick UX feedback.
    setTimeout(() => (status.textContent = "Thanks! I’ll get back to you soon."), 1200);
  });
})();

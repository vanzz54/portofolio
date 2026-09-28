/* =========================================================
   Vanzz — Portfolio interactions
   Vanilla JS, no dependencies
   ========================================================= */

(() => {
  "use strict";

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- topbar state ---------- */
  const topbar = $("#topbar");
  const scrollBar = $("#scrollBar");

  const onScroll = () => {
    const y = window.scrollY;
    topbar?.classList.toggle("is-scrolled", y > 24);

    if (scrollBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollBar.style.width = max > 0 ? `${(y / max) * 100}%` : "0%";
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile nav ---------- */
  const nav = $("#nav");
  const navToggle = $("#navToggle");

  const closeNav = () => {
    nav?.classList.remove("is-open");
    navToggle?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  navToggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });

  $$(".nav__link").forEach(link => link.addEventListener("click", closeNav));
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeNav(); });

  /* ---------- active section highlighting ---------- */
  const sections = $$("main section[id]");
  const navLinks = $$(".nav__link");

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(l =>
          l.classList.toggle("is-active", l.getAttribute("href") === `#${id}`)
        );
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(s => spy.observe(s));
  }

  /* ---------- reveal on scroll ---------- */
  const revealEls = $$(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(el => el.classList.add("is-visible"));
  } else {
    const revealObs = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // stagger siblings slightly for a natural cascade
        const delay = (Array.from(el.parentElement.children).indexOf(el) % 6) * 70;
        setTimeout(() => el.classList.add("is-visible"), delay);
        obs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

    revealEls.forEach(el => revealObs.observe(el));
  }

  /* ---------- typewriter ---------- */
  const typeEl = $("#typewriter");
  const phrases = [
    "siswa yang betah di terminal Linux.",
    "calon teknisi jaringan yang penasaran.",
    "pemecah masalah lewat wargame & CTF.",
    "calon peserta PKL kelas XII."
  ];

  if (typeEl) {
    if (reduceMotion) {
      typeEl.textContent = phrases[0];
    } else {
      let p = 0, c = 0, deleting = false;

      const tick = () => {
        const word = phrases[p];
        c += deleting ? -1 : 1;
        typeEl.textContent = word.slice(0, c);

        let delay = deleting ? 38 : 72;

        if (!deleting && c === word.length) {
          delay = 1900; deleting = true;
        } else if (deleting && c === 0) {
          deleting = false;
          p = (p + 1) % phrases.length;
          delay = 320;
        }
        setTimeout(tick, delay);
      };

      setTimeout(tick, 700);
    }
  }

  /* ---------- skill bars + counters ---------- */
  const skillsBlock = $("#skills");

  const animateCounter = (el, target) => {
    if (reduceMotion) { el.textContent = `${target}%`; return; }
    const dur = 1400;
    const start = performance.now();
    const step = now => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      el.textContent = `${Math.round(target * eased)}%`;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const runSkills = () => {
    $$(".bar i").forEach(bar => {
      bar.style.width = `${bar.dataset.level}%`;
    });
    $$(".skill__val").forEach(val => {
      animateCounter(val, Number(val.dataset.count));
    });
  };

  if (skillsBlock && "IntersectionObserver" in window) {
    const skillObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        runSkills();
        obs.disconnect();
      });
    }, { threshold: 0.28 });
    skillObs.observe(skillsBlock);
  } else {
    runSkills();
  }

  /* ---------- contact form ---------- */
  const form = $("#form");
  const toast = $("#toast");
  const submitBtn = $("#submitBtn");

  const showToast = (msg, type = "success") => {
    if (!toast) return;
    toast.textContent = msg;
    toast.className = `toast is-show is-${type}`;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("is-show"), 4200);
  };

  const setError = (field, msg) => {
    const wrap = field.closest(".field");
    const err = wrap?.querySelector(".field__err");
    wrap?.classList.toggle("is-error", Boolean(msg));
    if (err) err.textContent = msg || "";
    return !msg;
  };

  const validate = () => {
    if (!form) return false;
    // ambil lewat elements.namedItem: form.name bisa mengembalikan
    // atribut name <form> (string), bukan input-nya
    const name = form.elements.namedItem("name");
    const email = form.elements.namedItem("email");
    const message = form.elements.namedItem("message");
    if (!name || !email || !message) return false;
    let ok = true;

    ok = setError(name, name.value.trim().length < 2
      ? "Mohon isi nama Anda atau perusahaan." : "") && ok;

    ok = setError(email, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())
      ? "" : "Format email belum valid.") && ok;

    ok = setError(message, message.value.trim().length < 10
      ? "Pesan terlalu singkat, minimal 10 karakter." : "") && ok;

    return ok;
  };

  form?.addEventListener("input", e => {
    const wrap = e.target.closest(".field");
    if (wrap?.classList.contains("is-error")) validate();
  });

  /* ---------- Web3Forms (AJAX, tanpa reload) ---------- */
  const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
  const formStatus = $("#formStatus");
  const isKeyReady = () => {
    const key = $("#accessKey")?.value.trim() || "";
    return key.length > 20 && !/TEMPEL_|YOUR_|GANTI_/i.test(key);
  };

  const setStatus = (state, msg) => {
    if (!formStatus) return;
    formStatus.textContent = msg || "";
    formStatus.className = "form__status" + (state ? ` is-${state}` : "");
  };

  const setLoading = on => {
    submitBtn?.classList.toggle("is-loading", on);
    if (submitBtn) submitBtn.disabled = on;
    const label = submitBtn?.querySelector(".btn__label");
    if (label) label.textContent = on ? "Mengirim…" : "Kirim pesan";
  };

  const finishButton = ok => {
    if (!submitBtn) return;
    submitBtn.classList.remove("is-loading");
    submitBtn.classList.add(ok ? "is-done" : "is-fail");
    const label = submitBtn.querySelector(".btn__label");
    if (label) label.textContent = ok ? "Terkirim ✓" : "Gagal";
    setTimeout(() => {
      submitBtn.classList.remove("is-done", "is-fail");
      submitBtn.disabled = false;
      if (label) label.textContent = "Kirim pesan";
    }, 2600);
  };

  form?.addEventListener("submit", async e => {
    e.preventDefault();
    if (!validate()) {
      setStatus("error", "Periksa kembali isian formulir Anda.");
      showToast("Periksa kembali isian formulir Anda.", "error");
      form.querySelector(".is-error input, .is-error textarea")?.focus();
      return;
    }

    if (!isKeyReady()) {
      setStatus("error", "Access key Web3Forms belum dipasang. Lihat README / langkah pengaturan.");
      showToast("Access key Web3Forms belum dipasang.", "error");
      return;
    }

    const payload = Object.fromEntries(new FormData(form).entries());
    delete payload.botcheck;

    setLoading(true);
    setStatus("", "");
    showToast("Mengirim pesan…", "info");

    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        finishButton(true);
        setStatus("success", "Pesan berhasil terkirim! Saya akan membalas segera.");
        showToast("Pesan berhasil terkirim!");
        form.reset();
        form.querySelectorAll(".is-error").forEach(el => el.classList.remove("is-error"));
      } else {
        throw new Error(data.message || "Permintaan ditolak oleh server.");
      }
    } catch (err) {
      console.error("Web3Forms error:", err);
      finishButton(false);
      setStatus("error", "Gagal mengirim pesan. Coba lagi atau email langsung ke vanzz@smkn2banjar.sch.id");
      showToast("Gagal mengirim pesan. Coba lagi.", "error");
    }
  });

  /* ---------- certificate lightbox ---------- */
  const lightbox = $("#lightbox");
  const lbImg = $("#lightboxImg");
  const lbTitle = $("#lightboxTitle");
  const lbMeta = $("#lightboxMeta");
  let lbLastFocus = null;
  let lbCloseTimer = null;

  const openLightbox = trigger => {
    if (!lightbox || !lbImg) return;
    const img = trigger.querySelector("img");
    const src = trigger.dataset.src || img?.src || "";
    if (!src) return;

    clearTimeout(lbCloseTimer); // batalkan penutupan tertunda agar modal tidak langsung tertutup lagi

    lbLastFocus = trigger;
    delete lbImg.dataset.fallback;
    lbImg.src = src;
    lbImg.alt = img?.alt || trigger.dataset.title || "";
    if (lbTitle) lbTitle.textContent = trigger.dataset.title || "";
    if (lbMeta) lbMeta.textContent = trigger.dataset.meta || "";

    lightbox.hidden = false;
    void lightbox.offsetWidth; // paksa reflow supaya transisi fade tetap jalan
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
    lightbox.querySelector(".lightbox__close")?.focus();
  };

  const closeLightbox = () => {
    if (!lightbox || lightbox.hidden) return;
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    clearTimeout(lbCloseTimer);
    lbCloseTimer = setTimeout(() => {
      lightbox.hidden = true;
      lbImg?.removeAttribute("src");
      lbCloseTimer = null;
    }, 300);
    lbLastFocus?.focus();
  };

  $$("[data-lightbox]").forEach(el =>
    el.addEventListener("click", () => openLightbox(el))
  );
  lightbox?.querySelectorAll("[data-lightbox-close]").forEach(el =>
    el.addEventListener("click", closeLightbox)
  );
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeLightbox();
  });

  /* ---------- placeholder bila gambar sertifikat belum ada ---------- */
  const certPlaceholder = "data:image/svg+xml;utf8," + encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='800' height='550'>" +
    "<rect width='800' height='550' fill='#0f1216'/>" +
    "<rect x='18' y='18' width='764' height='514' fill='none' stroke='#6ee7a8' stroke-width='2' stroke-dasharray='10 8' opacity='.45'/>" +
    "<text x='400' y='265' text-anchor='middle' font-family='monospace' font-size='23' fill='#6b7484'>Gambar sertifikat belum dipasang</text>" +
    "<text x='400' y='302' text-anchor='middle' font-family='monospace' font-size='16' fill='#4d5563'>taruh file-nya di folder assets/</text>" +
    "</svg>"
  );

  document.addEventListener("error", e => {
    const el = e.target;
    if (!(el instanceof HTMLImageElement) || el.dataset.fallback) return;
    el.dataset.fallback = "1";
    el.src = certPlaceholder;
  }, true);

  /* ---------- cek file CV tersedia ---------- */
  const cvBtn = $("#cvBtn");
  if (cvBtn && window.location.protocol !== "file:") {
    fetch(cvBtn.getAttribute("href"), { method: "HEAD" })
      .then(r => { if (!r.ok) console.warn(`[CV] file belum ditemukan: ${cvBtn.getAttribute("href")}`); })
      .catch(() => {});
  }

  /* ---------- smooth anchor fallback ---------- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", id);
    });
  });
})();

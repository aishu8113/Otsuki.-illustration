document.addEventListener("DOMContentLoaded", () => {
  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();

  // Tiny star field: generated in JavaScript so the background feels alive.
  const starField = document.querySelector(".star-field");
  if (starField) {
    for (let i = 0; i < 54; i++) {
      const star = document.createElement("span");
      star.className = "star";
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 3}s`;
      star.style.animationDuration = `${2 + Math.random() * 4}s`;
      if (Math.random() > .75) {
        star.style.width = "3px";
        star.style.height = "3px";
      }
      starField.appendChild(star);
    }
  }

  // Reveal elements on scroll.
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  // Mobile navigation.
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }));
  }

  // Filter portfolio pieces.
  const filterButtons = document.querySelectorAll(".filter-btn");
  const workCards = document.querySelectorAll(".work-card");
  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      filterButtons.forEach(btn => btn.classList.toggle("active", btn === button));
      const filter = button.dataset.filter;
      workCards.forEach(card => {
        const visible = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !visible);
      });
    });
  });

  // Artwork detail dialog.
  const dialog = document.querySelector(".work-dialog");
  const dialogTitle = dialog?.querySelector(".dialog-copy h3");
  const dialogDesc = dialog?.querySelector(".dialog-copy p:last-child");
  const dialogImage = dialog?.querySelector(".dialog-image");
  const closeDialog = dialog?.querySelector(".dialog-close");
  workCards.forEach(card => card.addEventListener("click", () => {
    if (!dialog) return;
    dialogTitle.textContent = card.dataset.title || "作品タイトル";
    dialogDesc.textContent = card.dataset.desc || "";
    const source = card.dataset.image;
    const sourceExists = source && /\.(png|jpe?g|webp|gif|svg)$/i.test(source);
    dialogImage.style.backgroundImage = sourceExists ? `url("${source}")` : "";
    dialogImage.style.backgroundSize = "cover";
    dialogImage.style.backgroundPosition = "center";
    const word = dialogImage.querySelector(".art-word");
    if (word) word.textContent = card.dataset.title || "ARTWORK";
    dialog.showModal();
  }));
  closeDialog?.addEventListener("click", () => dialog.close());
  dialog?.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });

  // Gentle pointer glow on devices that support a fine pointer.
  const glow = document.querySelector(".cursor-glow");
  if (glow && window.matchMedia("(pointer:fine)").matches) {
    window.addEventListener("pointermove", event => {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    }, { passive: true });
  }
});

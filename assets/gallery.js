// Portfolio galleries: each gallery becomes a slow, endlessly scrolling strip
// (paused on hover), and clicking an image opens it in a lightbox with its
// description. Descriptions come from each item's data-sub-html attribute.
(function () {
  var SECONDS_PER_ITEM = 12;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var ICONS = {
    close: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg>',
    prev: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3L5 8l5 5"/></svg>',
    next: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3l5 5-5 5"/></svg>'
  };

  // ---- Lightbox (one shared dialog for every gallery) ----

  var dialog, imageEl, titleEl, descEl, counterEl, prevBtn, nextBtn;
  var current = null; // { gallery, index }

  function button(cls, label, icon) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "lightbox-btn " + cls;
    b.setAttribute("aria-label", label);
    b.innerHTML = icon;
    return b;
  }

  function buildLightbox() {
    dialog = document.createElement("dialog");
    dialog.className = "gallery-lightbox";
    dialog.setAttribute("aria-label", "Image viewer");

    var figure = document.createElement("figure");
    figure.className = "lightbox-figure";
    imageEl = document.createElement("img");
    imageEl.className = "lightbox-image";
    imageEl.alt = "";
    var caption = document.createElement("figcaption");
    caption.className = "lightbox-caption";
    titleEl = document.createElement("span");
    titleEl.className = "lightbox-title";
    descEl = document.createElement("p");
    descEl.className = "lightbox-description";
    counterEl = document.createElement("span");
    counterEl.className = "lightbox-counter";
    caption.append(titleEl, descEl, counterEl);
    figure.append(imageEl, caption);

    var closeBtn = button("lightbox-close", "Close", ICONS.close);
    prevBtn = button("lightbox-prev", "Previous image", ICONS.prev);
    nextBtn = button("lightbox-next", "Next image", ICONS.next);

    dialog.append(figure, closeBtn, prevBtn, nextBtn);
    document.body.appendChild(dialog);

    closeBtn.addEventListener("click", closeLightbox);
    prevBtn.addEventListener("click", function () { step(-1); });
    nextBtn.addEventListener("click", function () { step(1); });
    // Clicking the dark area around the image closes it.
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog || event.target === figure) { closeLightbox(); }
    });
    dialog.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") { step(-1); }
      else if (event.key === "ArrowRight") { step(1); }
    });
    dialog.addEventListener("close", function () {
      if (current) { current.gallery.root.classList.remove("is-paused"); }
      current = null;
    });
  }

  function show(gallery, index) {
    var item = gallery.items[index];
    current = { gallery: gallery, index: index };
    imageEl.src = item.src;
    imageEl.alt = item.description;
    titleEl.textContent = gallery.title;
    descEl.textContent = item.description;
    counterEl.textContent = (index + 1) + " / " + gallery.items.length;
    var multiple = gallery.items.length > 1;
    prevBtn.hidden = !multiple;
    nextBtn.hidden = !multiple;
  }

  function openLightbox(gallery, index) {
    if (!dialog) { buildLightbox(); }
    gallery.root.classList.add("is-paused");
    show(gallery, index);
    if (!dialog.open) { dialog.showModal(); }
  }

  function closeLightbox() {
    if (dialog && dialog.open) { dialog.close(); }
  }

  function step(delta) {
    if (!current) { return; }
    var n = current.gallery.items.length;
    show(current.gallery, (current.index + delta + n) % n);
  }

  // ---- Galleries ----

  function initGallery(section) {
    var root = section.querySelector(".lg-react-element");
    if (!root) { return; }
    var originals = Array.prototype.slice.call(root.querySelectorAll(":scope > .gallery-item"));
    if (!originals.length) { return; }

    var heading = section.querySelector("h2");
    var gallery = {
      root: root,
      title: heading ? heading.textContent.trim() : "",
      items: originals.map(function (el) {
        return {
          src: el.getAttribute("data-src") || el.querySelector("img").src,
          description: (el.getAttribute("data-sub-html") || "").trim()
        };
      })
    };

    // Move the items into a track; with motion allowed, append a copy of the
    // set so the strip can loop seamlessly (it slides exactly one set width).
    var track = document.createElement("div");
    track.className = "gallery-track";
    originals.forEach(function (el, i) {
      el.setAttribute("data-index", i);
      track.appendChild(el);
    });
    if (!reduceMotion && originals.length > 1) {
      originals.forEach(function (el) {
        var copy = el.cloneNode(true);
        copy.setAttribute("aria-hidden", "true");
        var link = copy.querySelector("a");
        if (link) { link.tabIndex = -1; }
        track.appendChild(copy);
      });
      track.style.setProperty("--marquee-duration", (originals.length * SECONDS_PER_ITEM) + "s");
    }
    root.appendChild(track);
    root.classList.add("gallery-marquee");

    // Label the links so screen readers announce what they open.
    Array.prototype.forEach.call(track.querySelectorAll(".gallery-item"), function (el) {
      var i = Number(el.getAttribute("data-index"));
      var link = el.querySelector("a");
      if (!link) { return; }
      link.setAttribute("aria-label", "View image: " + gallery.items[i].description);
      link.removeAttribute("target");
      link.addEventListener("click", function (event) {
        event.preventDefault();
        openLightbox(gallery, i);
      });
    });
  }

  function init() {
    var sections = document.querySelectorAll('[data-section-type="Gallery"]');
    for (var i = 0; i < sections.length; i++) { initGallery(sections[i]); }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

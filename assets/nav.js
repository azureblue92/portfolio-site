// Mobile menu: the static export kept the hamburger and its dropdown panel
// but not the script that opened it. Toggle the panel (the hamburger's next
// sibling) and close it on outside click, Escape, or choosing a link.
(function () {
  var toggle = document.querySelector('header [aria-label="Open menu"]');
  var panel = toggle && toggle.nextElementSibling;
  if (!panel) return;

  panel.classList.add("mobile-menu");
  if (!panel.id) panel.id = "mobile-menu";
  toggle.setAttribute("aria-controls", panel.id);
  toggle.setAttribute("aria-expanded", "false");

  function setOpen(open) {
    panel.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    setOpen(!panel.classList.contains("is-open"));
  });
  toggle.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle.click();
    }
  });
  panel.addEventListener("click", function (e) {
    if (e.target.closest("a")) setOpen(false);
  });
  document.addEventListener("click", function (e) {
    if (!panel.contains(e.target)) setOpen(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && panel.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia("(min-width: 992px)").addEventListener("change", function (mq) {
    if (mq.matches) setOpen(false);
  });
})();

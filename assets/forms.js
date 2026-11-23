// Contact forms: on submit, check the required fields, then open the
// visitor's email app with a message addressed to Matt, pre-filled from the form.
(function () {
  var TO_ADDRESS = "portfolio@azure.mozmail.com";
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function fieldLabel(field) {
    return (field.getAttribute("title") || field.id).replace(/\s*\*\s*$/, "");
  }

  function setInvalid(field, message) {
    field.classList.add("is-invalid");
    var feedback = field.parentElement.querySelector(".invalid-feedback");
    if (!feedback) {
      feedback = document.createElement("div");
      feedback.className = "invalid-feedback";
      field.parentElement.appendChild(feedback);
    }
    feedback.textContent = message;
  }

  function clearInvalid(field) {
    field.classList.remove("is-invalid");
  }

  function initForm(section) {
    var button = section.querySelector("button.btn-primary");
    var fields = section.querySelectorAll("input.form-control, textarea.form-control");
    if (!button || !fields.length) { return; }

    var heading = section.querySelector("h2");
    var formTitle = heading ? heading.textContent.trim() : "Website contact";
    var status = document.createElement("p");
    status.className = "mt-3 mb-0 small";
    status.setAttribute("role", "status");
    button.insertAdjacentElement("afterend", status);

    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      if (field.id === "email") {
        field.type = "email";
        field.autocomplete = "email";
      } else if (field.id === "phone") {
        field.type = "tel";
        field.autocomplete = "tel";
      } else if (field.id === "name") {
        field.autocomplete = "name";
      }
      field.addEventListener("input", function () { clearInvalid(this); });
      if (field.tagName === "INPUT") {
        field.addEventListener("keydown", function (event) {
          if (event.key === "Enter") { event.preventDefault(); submit(); }
        });
      }
    }

    function submit() {
      var firstBad = null;
      var values = {};
      for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        var value = field.value.trim();
        var label = fieldLabel(field);
        values[field.id] = value;
        clearInvalid(field);
        if (field.getAttribute("aria-required") === "true" && !value) {
          setInvalid(field, label + " is required.");
          firstBad = firstBad || field;
        } else if (field.id === "email" && value && !EMAIL_PATTERN.test(value)) {
          setInvalid(field, "Please enter a valid email address.");
          firstBad = firstBad || field;
        }
      }
      if (firstBad) {
        firstBad.focus();
        status.textContent = "";
        return;
      }

      var lines = [];
      for (var j = 0; j < fields.length; j++) {
        var f = fields[j];
        if (f.id === "message") { continue; }
        if (values[f.id]) { lines.push(fieldLabel(f) + ": " + values[f.id]); }
      }
      var body = (values.message || "") + "\n\n---\n" + lines.join("\n");
      var subject = formTitle + (values.name ? " - " + values.name : "");

      window.location.href = "mailto:" + TO_ADDRESS +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      status.textContent = "Your email app should open with this message ready to send. " +
        "If it doesn't, email " + TO_ADDRESS + " directly.";
    }

    button.type = "button";
    button.addEventListener("click", submit);
  }

  function init() {
    var sections = document.querySelectorAll('[data-section-type="Contact"]');
    for (var i = 0; i < sections.length; i++) { initForm(sections[i]); }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

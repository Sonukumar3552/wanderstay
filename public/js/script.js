document.addEventListener("DOMContentLoaded", () => {
  'use strict';

  // --- Bootstrap Form Validation ---
  const forms = document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });

 // Night/Day Mode Toggle
const modeToggle = document.getElementById("mode-toggle");
if (modeToggle) {
  // Apply saved mode on page load
  if (localStorage.getItem("nightMode") === "enabled") {
    document.body.classList.add("night-mode");
    const icon = modeToggle.querySelector("i");
    if (icon) {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
    }
  }

  // Toggle night mode
  modeToggle.addEventListener("click", () => {
    document.body.classList.toggle("night-mode");
    const icon = modeToggle.querySelector("i");
    if (icon) {
      if (document.body.classList.contains("night-mode")) {
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
      } else {
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");
      }
    }

    // Save preference
    localStorage.setItem(
      "nightMode",
      document.body.classList.contains("night-mode") ? "enabled" : "disabled"
    );
  });
}

});

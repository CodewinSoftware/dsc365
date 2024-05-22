document.addEventListener("DOMContentLoaded", function () {
  // Get the current page URL
  var currentUrl = window.location.href;

  // Find the sidebar link that matches the current URL
  var sidebarLinks = document.querySelectorAll(".sidebar-link");
  sidebarLinks.forEach(function (link) {
    if (link.href === currentUrl) {
      link.classList.add("active");
    }
  });
});

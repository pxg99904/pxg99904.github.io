const navigationToggle = document.querySelector(".navigation-toggle");
const primaryNavigation = document.querySelector("#primary-navigation");

if (navigationToggle && primaryNavigation) {
  const closeNavigation = () => {
    primaryNavigation.classList.remove("is-open");
    navigationToggle.setAttribute("aria-expanded", "false");
    navigationToggle.setAttribute("aria-label", "Open navigation menu");
  };

  navigationToggle.addEventListener("click", () => {
    const isOpen = navigationToggle.getAttribute("aria-expanded") === "true";
    primaryNavigation.classList.toggle("is-open", !isOpen);
    navigationToggle.setAttribute("aria-expanded", String(!isOpen));
    navigationToggle.setAttribute(
      "aria-label",
      isOpen ? "Open navigation menu" : "Close navigation menu",
    );
  });

  primaryNavigation.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeNavigation();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigationToggle.getAttribute("aria-expanded") === "true") {
      closeNavigation();
      navigationToggle.focus();
    }
  });
}

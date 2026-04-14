const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  {
    threshold: 0.22,
  }
);

document.querySelectorAll(".reveal").forEach((element) => {
  observer.observe(element);
});

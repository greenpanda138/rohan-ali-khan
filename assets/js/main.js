// Rohan Ali Khan — site interactions. Menu, scroll reveals, work-list cursor preview.
(function () {
  "use strict";

  // Mobile menu
  var header = document.querySelector(".nav");
  var btn = document.querySelector(".menu-btn");
  if (header && btn) {
    btn.addEventListener("click", function () {
      var open = header.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Scroll reveals — one pattern, fires once per element
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  // Work page — image preview that follows the cursor (desktop pointers only)
  var preview = document.getElementById("preview");
  var rows = document.querySelectorAll(".work-row[data-img]");
  if (preview && rows.length && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var pimg = preview.querySelector("img");
    var tx = 0, ty = 0, x = 0, y = 0, raf = null;
    function loop() {
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      preview.style.left = x + "px";
      preview.style.top = y + "px";
      if (Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5) {
        raf = requestAnimationFrame(loop);
      } else { raf = null; }
    }
    rows.forEach(function (row) {
      row.addEventListener("mouseenter", function () {
        pimg.src = row.getAttribute("data-img");
        pimg.alt = "";
        preview.classList.add("on");
      });
      row.addEventListener("mouseleave", function () { preview.classList.remove("on"); });
    });
    document.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    });
  }
})();

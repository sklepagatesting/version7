document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in");
        observer.unobserve(entry.target); // animate only once
      }
    });
  }, { threshold: 0.2 }); // trigger when 20% visible

  document.querySelectorAll(".fly-in, .left-in, .right-in, .fly-in-slow, .left-in-slow, .right-in-slow")
    .forEach(el => observer.observe(el));
});



// textAnimations.js
document.addEventListener('fontLoadedAndPageVisible', () => {
  console.log('Font loaded and page visible, initializing text animations.');

  // Combine both classes
  const textElements = document.querySelectorAll('.rise, .sliding-up');

  textElements.forEach(textElement => {
    // Avoid double-processing if innerHTML already contains spans
    if (textElement.querySelector('span')) return;

    const words = textElement.textContent.trim().split(' ');
    textElement.innerHTML = words.map((word, index) => {
      const separator = (index < words.length - 1) ? '&nbsp;' : '';
      return `<span style="animation-delay: ${index * 0.1}s">${word}${separator}</span>`;
    }).join('');

    const observer = new IntersectionObserver((entries, observerInstance) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observerInstance.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });

    observer.observe(textElement);
  });
});





const containers = document.querySelectorAll('.text-container');

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const textLine = entry.target.querySelector('.text-line');
      if (textLine) {
        // Find the index of the current container in the full NodeList
        const index = Array.from(containers).indexOf(entry.target);
        textLine.style.animationDelay = `${index * 0.1}s`; // stagger by 0.5s per item
        textLine.classList.add('animate');
        observer.unobserve(entry.target);
      }
    }
  });
}, {
  threshold: 1
});

containers.forEach(container => {
  observer.observe(container);
});



function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|Tablet|Touch/i.test(navigator.userAgent);
  }

  function setMobileViewportHeight() {
    if (!isMobileDevice()) return;

    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  window.addEventListener('DOMContentLoaded', setMobileViewportHeight);
  window.addEventListener('resize', setMobileViewportHeight);





  document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("playReel");
  const overlayBg = document.getElementById("videoOverlayBg");
  let expanded = false;
  let placeholder = null;

  function toggleVideoOverlay() {
    if (!expanded) {
      // Create placeholder to keep layout
      placeholder = document.createElement("div");
      placeholder.style.width = `${video.offsetWidth}px`;
      placeholder.style.height = `${video.offsetHeight}px`;
      video.parentNode.insertBefore(placeholder, video);

      // Get current video position/size before moving
      const rect = video.getBoundingClientRect();

      // Freeze position & size immediately to avoid jump
      gsap.set(video, {
        position: "fixed",
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        borderRadius: "0px",
        zIndex: 9999,
        margin: 0
      });

      // Move to body AFTER locking styles
      document.body.appendChild(video);

      // Show overlay background
      overlayBg.style.pointerEvents = "auto";
      gsap.to(overlayBg, {
        opacity: 1,
        duration: 0.8,
        ease: "power3.inOut"
      });

      // Expand video
      const target = window.innerWidth > 768
        ? { width: window.innerWidth, height: window.innerHeight }
        : (() => {
            const w = window.innerWidth * 0.9;
            return { width: w, height: w * (9 / 16) };
          })();

      gsap.to(video, {
        top: "50%",
        left: "50%",
        xPercent: -50,
        yPercent: -50,
        ...target,
        borderRadius: "8px",
        duration: 0.8,
        ease: "power3.inOut"
      });

      document.body.classList.add("overlay-active");

    } else {
      // Animate back to placeholder position/size
      const rect = placeholder.getBoundingClientRect();

      gsap.to(video, {
        top: rect.top,
        left: rect.left,
        xPercent: 0,
        yPercent: 0,
        width: rect.width,
        height: rect.height,
        borderRadius: "0px",
        duration: 0.8,
        ease: "power3.inOut",
        onComplete: () => {
          // Restore original position in DOM
          video.style = "";
          placeholder.parentNode.insertBefore(video, placeholder);
          placeholder.remove();
          placeholder = null;
        }
      });

      // Hide overlay background
      gsap.to(overlayBg, {
        opacity: 0,
        pointerEvents: "none",
        duration: 0.8,
        ease: "power3.inOut"
      });

      document.body.classList.remove("overlay-active");
    }

    expanded = !expanded;
  }

  // Event listeners
  video.addEventListener("click", toggleVideoOverlay);
  overlayBg.addEventListener("click", toggleVideoOverlay);

  // Handle resize while expanded
  window.addEventListener("resize", () => {
    if (expanded) {
      const target = window.innerWidth > 768
        ? { width: window.innerWidth, height: window.innerHeight }
        : (() => {
            const w = window.innerWidth * 0.9;
            return { width: w, height: w * (9 / 16) };
          })();
      gsap.set(video, target);
    }
  });
});






// Parallax Image Effect
document.addEventListener('DOMContentLoaded', () => {
  const parallaxImage = document.querySelector('.parallax img');

  if (!parallaxImage) return;

  const parallaxSpeed = 0.4; // Adjust for stronger/weaker parallax

  function updateParallax() {
    const scrollY = window.pageYOffset;
    const container = parallaxImage.parentElement;
    const containerOffsetTop = container.offsetTop;
    const containerHeight = container.offsetHeight;
    const containerBottom = containerOffsetTop + containerHeight;

    // Only apply effect when the container is in the viewport
    if (scrollY + window.innerHeight > containerOffsetTop && scrollY < containerBottom) {
      const distanceScrolled = scrollY - containerOffsetTop;
      const translateY = distanceScrolled * parallaxSpeed;
      parallaxImage.style.transform = `translateY(${translateY}px)`;
    }
  }

  // Optimize scroll performance with requestAnimationFrame
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateParallax();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Initial position
  updateParallax();
});






// --- Get only images with data-transition ---
const currentImage = document.querySelector("[data-transition]#image-current");
const nextImage = document.querySelector("[data-transition]#image-next");
const titles = document.querySelectorAll(".article-title");

let lastSrc = null;
let lastHovered = null;
let lastMoveTime = performance.now();
let lastX = 0;
let lastY = 0;
let currentLink = null; // Track the link of the hovered title

// --- Main function to show new image ---
function showImage(target, e) {
  const newSrc = target.dataset.img;
  if (!newSrc || newSrc === lastSrc) return;

  lastSrc = newSrc;

  // --- Update current link ---
  if (target.tagName.toLowerCase() === "a") {
    currentLink = target.href;
  } else {
    const link = target.closest("a");
    currentLink = link ? link.href : null;
  }

  // --- Remove highlight from old title ---
  if (lastHovered && lastHovered !== target) {
    lastHovered.classList.remove("bg-gray-100");
  }

  // --- Highlight current title ---
  target.classList.add("bg-gray-100");
  lastHovered = target;

  // --- Calculate mouse speed for dynamic duration ---
  const now = performance.now();
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  const dt = now - lastMoveTime;
  const distance = dt > 0 ? Math.sqrt(dx * dx + dy * dy) : 0;
  const speed = dt > 0 ? distance / dt : 0;

  const fastThreshold = 0.5;
  const duration = speed > fastThreshold ? 0.2 : 0.4;

  // --- Stop ongoing animations ---
  gsap.killTweensOf([currentImage, nextImage]);

  // --- Prepare next image ---
  nextImage.src = newSrc;
  gsap.set(nextImage, { scale: 1.1, opacity: 0, zIndex: 2 });
  gsap.set(currentImage, { zIndex: 1 });

  // --- Animate transition ---
  gsap.to(nextImage, {
    opacity: 1,
    scale: 1,
    duration,
    ease: "power2.out",
    onComplete: () => {
      currentImage.src = newSrc;
      gsap.set(currentImage, { opacity: 1 });
      gsap.set(nextImage, { opacity: 0 });
    }
  });
}

// --- Mouse move listener ---
document.addEventListener("mousemove", (e) => {
  lastX = e.clientX;
  lastY = e.clientY;
  lastMoveTime = performance.now();

  const hoveredTitle = [...titles].find(title => title.contains(e.target));
  if (hoveredTitle && hoveredTitle !== lastHovered) {
    showImage(hoveredTitle, e);
  }
});

// --- Click listener for images ---
function handleImageClick() {
  if (currentLink) {
    // Try to find a matching [data-transition] link first
    const linkEl = document.querySelector(`[data-transition][href="${currentLink}"]`);
    if (linkEl) {
      linkEl.click(); // Let transition animation handle navigation
    } else {
      window.location.href = currentLink; // Fallback if no match
    }
  }
}

[currentImage, nextImage].forEach(img => {
  if (img) {
    img.addEventListener("click", handleImageClick);
  }
});

// --- Initial GSAP setup ---
gsap.set(currentImage, { opacity: 0, zIndex: 1 });
gsap.set(nextImage, { opacity: 0, zIndex: 2 });

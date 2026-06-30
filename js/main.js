

/* ==========================================
   MOBILE NAVIGATION
========================================== */

(function() {
  const toggle = document.getElementById('navToggle');
  const drawer = document.getElementById('mobileNavDrawer');
  const closeBtn = document.getElementById('mobileNavClose');

  if (!toggle || !drawer) return;

  function openMenu() {
    drawer.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    drawer.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    if (drawer.classList.contains('open')) closeMenu();
    else openMenu();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  // Close on nav link tap
  drawer.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
})();

/* ==========================================
   COMPARE SLIDER — Optimized for iPhone
========================================== */

(function () {

  const container = document.querySelector(".compare-container");
  const afterWrap = document.getElementById("afterWrapper");
  const handle = document.getElementById("sliderHandle");
  const line = document.querySelector(".slider-line");

  if (!container || !afterWrap || !handle) return;

  let dragging = false;
  let latestX = 0;
  let ticking = false;

  function updateSlider(clientX) {

    const rect = container.getBoundingClientRect();

    let x = clientX - rect.left;
    x = Math.max(0, Math.min(rect.width, x));

    const pct = (x / rect.width) * 100;

    afterWrap.style.width = pct + "%";
    handle.style.left = pct + "%";

    if (line)
      line.style.left = pct + "%";

  }

  function requestUpdate(x) {

    latestX = x;

    if (!ticking) {

      ticking = true;

      requestAnimationFrame(() => {

        updateSlider(latestX);

        ticking = false;

      });

    }

  }

  const fineHover =
    window.matchMedia &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  container.addEventListener("pointerdown", (e) => {

    dragging = true;

    try {
      container.setPointerCapture(e.pointerId);
    } catch (_) {}

    requestUpdate(e.clientX);

    e.preventDefault();

  });

  container.addEventListener("pointermove", (e) => {

    if (dragging) {

      e.preventDefault();

      requestUpdate(e.clientX);

    } else if (fineHover && e.pointerType === "mouse") {

      requestUpdate(e.clientX);

    }

  });

  function stop(e) {

    dragging = false;

    try {
      container.releasePointerCapture(e.pointerId);
    } catch (_) {}

  }

  container.addEventListener("pointerup", stop);
  container.addEventListener("pointercancel", stop);

})();

window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 2000);
  }
});



// NAV SCROLL
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 80) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
});

// MANIFESTO SCROLL
const manifestoLines = document.querySelectorAll('.manifesto-line');
const manifestoObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.4 });
manifestoLines.forEach(l => manifestoObserver.observe(l));

// REVEAL ELEMENTS
const reveals = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
reveals.forEach(r => revealObs.observe(r));

// COUNTER ANIMATION
function animateCounter(el, target) {
  const duration = 2000;
  const start = performance.now();
  const isLarge = target > 999;
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4);
    const val = Math.floor(ease * target);
    el.textContent = isLarge ? val.toLocaleString() : val;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.count').forEach(c => {
        animateCounter(c, parseInt(c.dataset.target));
      });
      counterObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
const statsGrid = document.querySelector('.stats-grid');
if (statsGrid) counterObs.observe(statsGrid);

// FACTORY OBSERVER
const factoryEls = ['factoryEyebrow', 'factoryTitle', 'pillar1', 'pillar2', 'pillar3'];
const factoryObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      factoryObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
factoryEls.forEach(id => {
  const el = document.getElementById(id);
  if (el) factoryObs.observe(el);
});

// TESTIMONIALS
const testimonialObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      testimonialObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.testimonial-card').forEach(c => testimonialObs.observe(c));

// HORIZONTAL SCROLL — SERVICES DRAG
const track = document.getElementById('servicesTrack');
if (track) {
  let isDown = false, startX, scrollLeft;
  track.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });
  track.addEventListener('mouseleave', () => isDown = false);
  track.addEventListener('mouseup', () => isDown = false);
  track.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    track.scrollLeft = scrollLeft - (x - startX) * 1.5;
  });
}

// PARALLAX HERO
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const hero = document.getElementById('hero');
  if (hero && scrollY < window.innerHeight) {
    const grid = hero.querySelector('.hero-grid');
    const content = hero.querySelector('.hero-content');
    if (grid) grid.style.transform = `translateY(${scrollY * 0.3}px)`;
    if (content) content.style.transform = `translateY(${scrollY * 0.2}px)`;
    if (content) content.style.opacity = 1 - scrollY / (window.innerHeight * 0.8);
  }
});

// SMOOTH ANCHOR SCROLLING
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// FORM SUBMIT
document.querySelector('.form-submit')?.addEventListener('click', function() {
  this.textContent = 'Sending...';
  setTimeout(() => {
    this.textContent = '✓ We\'ll be in touch shortly';
    this.style.background = 'var(--gold-deep)'; this.style.color = 'var(--ink)';
  }, 1500);
});

/* EXPERIENCE CENTER AUTO GALLERY */

const experienceImages = [
    "images/experience/exp1.jpg",
    "images/experience/exp2.jpg",
    "images/experience/exp3.jpg",
    "images/experience/exp4.jpg",
    "images/experience/exp5.jpg",
    "images/experience/exp6.jpg"
];

let currentExpIndex = 0;

function changeExperienceImages() {

    const img1 = document.getElementById("expImg1");
    const img2 = document.getElementById("expImg2");
    const img3 = document.getElementById("expImg3");

    if (!img1 || !img2 || !img3) return;

    img1.classList.add("fade-out");
    img2.classList.add("fade-out");
    img3.classList.add("fade-out");

    setTimeout(() => {

        currentExpIndex =
            (currentExpIndex + 1) %
            experienceImages.length;

        img1.src =
            experienceImages[currentExpIndex];

        img2.src =
            experienceImages[
                (currentExpIndex + 1) %
                experienceImages.length
            ];

        img3.src =
            experienceImages[
                (currentExpIndex + 2) %
                experienceImages.length
            ];

        img1.classList.remove("fade-out");
        img2.classList.remove("fade-out");
        img3.classList.remove("fade-out");

    }, 400);
}

setInterval(changeExperienceImages, 4000);

/* ==========================
   STYLE QUIZ - OTHER OPTION
========================== */

const otherStyle = document.getElementById('otherStyle');
const otherStyleInput = document.getElementById('otherStyleInput');

if (otherStyle && otherStyleInput) {

  otherStyleInput.style.display = 'none';

  document.querySelectorAll('input[name="style"]').forEach(radio => {

    radio.addEventListener('change', () => {

      if (radio.id === 'otherStyle') {
        otherStyleInput.style.display = 'block';
      } else {
        otherStyleInput.style.display = 'none';
        otherStyleInput.value = '';
      }

    });

  });

}

 
/* ==========================================
   TESTIMONIAL BEFORE / AFTER SLIDER
========================================== */

const testimonialData = [

    {
        before: "images/testimonials/project1-before.jpg",
        after: "images/testimonials/project1-after.jpg",
        title: "MTC Spaces transformed our dream kitchen.",
        review: "From concept to execution, every detail was handled perfectly. The quality exceeded expectations.",
        client: "Jayabheri The Nirvana",
        location: "Financial District, Hyderabad."
    },
    
    {
        before: "images/testimonials/project2-before.jpg",
        after: "images/testimonials/project2-after.jpg",
        title: "A workspace that looks professional and feels productive.",
        review: "Spaces by MTC transformed our office with a modern layout, smart partitions, and a premium finish that perfectly matches our work culture.",
        client: "BT Convergence Technologies",
        location: "Financial District, Nanakramguda, Hyderabad"
    },
    
    {
        before: "images/testimonials/project3-before.jpg",
        after: "images/testimonials/project3-after.jpg",
        title: "Our kitchen feels beautifully planned and easy to use.",
        review: "Spaces by MTC gave us a kitchen that looks premium, feels spacious, and works perfectly for our everyday lifestyle.",
        client: "Shamma & Shaik Sameer",
        location: "RNP01, Kondapur, Hyderabad"
    },

    {
        before: "images/testimonials/project4-before.jpg",
        after: "images/testimonials/project4-after.jpg",
        title: "Every corner was designed with purpose.",
        review: "The team understood our requirements clearly and created a clean, elegant space with smart storage and beautiful finishing.",
        client: "Mr. Bala Chander",
        location: "My Home Tridasa, Tellapur, Ramachandrapuram, Hyderabad"
    }
    
    ];
    
    let testimonialIndex = 0;
    
    /* ==========================================
       LOAD TESTIMONIAL
    ========================================== */
    
    function loadTestimonial(index) {

    const afterWrapper = document.getElementById("afterWrapper");
    const handle = document.getElementById("sliderHandle");
    const sliderLine = document.querySelector(".slider-line");

    const beforeImage = document.getElementById("beforeImage");
    const afterImage = document.getElementById("afterImage");

    const reviewTitle = document.getElementById("reviewTitle");
    const reviewText = document.getElementById("reviewText");
    const clientName = document.getElementById("clientName");
    const clientLocation = document.getElementById("clientLocation");

    const data = testimonialData[index];

    requestAnimationFrame(() => {
        beforeImage.src = data.before;
        afterImage.src = data.after;

        reviewTitle.textContent = data.title;
        reviewText.textContent = data.review;
        clientName.textContent = data.client;
        clientLocation.textContent = data.location;

        afterWrapper.style.width = "50%";
        handle.style.left = "50%";
        if (sliderLine) sliderLine.style.left = "50%";
    });
}

const prevBtn = document.getElementById("prevTestimonial");
const nextBtn = document.getElementById("nextTestimonial");

if (prevBtn && nextBtn) {

    loadTestimonial(testimonialIndex);

    nextBtn.onclick = () => {
        testimonialIndex =
            (testimonialIndex + 1) % testimonialData.length;

        loadTestimonial(testimonialIndex);
    };

    prevBtn.onclick = () => {
        testimonialIndex =
            (testimonialIndex - 1 + testimonialData.length) %
            testimonialData.length;

        loadTestimonial(testimonialIndex);
    };

}

/* ==========================================
   STYLE QUIZ GOOGLE SHEETS
========================================== */

const quizForm = document.getElementById("styleQuizForm");

if (quizForm) {

  quizForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const getValue = (name) => {
      const selected = document.querySelector(
        `input[name="${name}"]:checked`
      );
      return selected ? selected.value : "";
    };

    const data = {
      formType: "quiz",
      style: getValue("style"),
      feel: getValue("feel"),
      palette: getValue("palette"),
      kitchen: getValue("kitchen"),
      finish: getValue("finish"),
      storage: getValue("storage"),
      bedroom: getValue("bedroom"),
      budget: getValue("budget"),
      mustHave: document.getElementById("mustHave").value
    };

    const message = document.getElementById("quizMessage");

    try {

      message.innerHTML = "Submitting...";
      message.style.color = "#666";

      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxtU--gvYNsOBm8xj7vnOgh0x7qryDVXC51BW0nOF_HdLGPh_-jIAYvCYT6KQRTGO8f/exec",
        {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "text/plain;charset=utf-8"
          },
          body: JSON.stringify(data)
        }
      );

      const result = await response.text();

      console.log("Response:", result);

      message.innerHTML =
        "✅ Checklist submitted successfully.";

      message.style.color = "#8DB600";

      quizForm.reset();

    } catch (error) {

      console.error(
        "QUIZ SUBMISSION ERROR:",
        error
      );

      message.innerHTML =
        `❌ Submission failed.<br>${error.message}`;

      message.style.color = "red";

    }

  });

}

// Autoplay reels (iPhone/Android/Desktop)
document.addEventListener("DOMContentLoaded", () => {
  const videos = document.querySelectorAll(".reel-video");
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const v=entry.target;
      if(entry.isIntersecting){
        v.muted=true;
        v.loop=true;
        v.playsInline=true;
        const p=v.play();
        if(p){p.catch(()=>{});}
      }else{
        v.pause();
      }
    });
  },{threshold:0.6});
  videos.forEach(v=>observer.observe(v));
});
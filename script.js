/* ═══════════════════════════════════════
   BILLWALLAH – script.js
═══════════════════════════════════════ */

// ── Cursor Glow ──
const cursorGlow = document.getElementById('cursorGlow');
window.addEventListener('mousemove', e => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top  = e.clientY + 'px';
});


// ── Navbar: Dynamic Padding + Scroll Darken ──
const navbar = document.getElementById('navbar');

function setNavPadding() {
    const w = window.innerWidth;
    let px;
    if      (w <= 900)  px = 20;
    else if (w <= 1100) px = 32;
    else if (w <= 1400) px = 56;
    else if (w <= 1800) px = Math.round(w * 0.07);
    else                px = Math.round(w * 0.1);
    navbar.style.padding = `0 ${px}px`;
}
setNavPadding();

let navRaf;
window.addEventListener('resize', () => {
    cancelAnimationFrame(navRaf);
    navRaf = requestAnimationFrame(setNavPadding);
});

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
});


// ── Hamburger Menu ──
const menuBtn = document.getElementById('menu-btn');
const navMenu = document.getElementById('nav-menu');

menuBtn.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    menuBtn.innerHTML = open ? '&#10005;' : '&#9776;';
    menuBtn.setAttribute('aria-expanded', open);
});

navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        menuBtn.innerHTML = '&#9776;';
        menuBtn.setAttribute('aria-expanded', false);
    });
});


// ── Active Nav Link on Scroll ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(l => l.classList.remove('active'));
            const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
            if (active) active.classList.add('active');
        }
    });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));


// ── Hero Typed Text ──
const typedEl = document.getElementById('heroTyped');
const phrases = ['Earn Cashback.', 'Pay Smarter.', 'Save More.', 'Live Better.'];
let pIdx = 0, cIdx = 0, deleting = false;

function type() {
    const current = phrases[pIdx];
    if (!deleting) {
        typedEl.textContent = current.slice(0, ++cIdx);
        if (cIdx === current.length) {
            deleting = true;
            setTimeout(type, 1800);
            return;
        }
    } else {
        typedEl.textContent = current.slice(0, --cIdx);
        if (cIdx === 0) {
            deleting = false;
            pIdx = (pIdx + 1) % phrases.length;
        }
    }
    setTimeout(type, deleting ? 48 : 80);
}
type();


// ── Particle Canvas ──
const canvas = document.getElementById('particles-canvas');
const ctx    = canvas.getContext('2d');
const PARTICLE_COUNT = 55;
let particles = [];

function resizeCanvas() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
        this.x        = Math.random() * canvas.width;
        this.y        = init ? Math.random() * canvas.height : canvas.height + 10;
        this.size     = Math.random() * 1.5 + 0.3;
        this.speedY   = -(Math.random() * 0.4 + 0.15);
        this.speedX   = (Math.random() - 0.5) * 0.25;
        this.alpha    = 0;
        this.maxAlpha = Math.random() * 0.35 + 0.08;
        this.fadeIn   = true;
    }
    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        if (this.fadeIn) {
            this.alpha += 0.006;
            if (this.alpha >= this.maxAlpha) this.fadeIn = false;
        } else {
            this.alpha -= 0.002;
        }
        if (this.y < -10 || this.alpha <= 0) this.reset();
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle   = '#7aadff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
}
animateParticles();


// ── Scroll Reveal ──
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });
revealEls.forEach(el => revealObserver.observe(el));


// ── Stat Counter Animation ──
function formatStat(el, val) {
    const divide = parseFloat(el.dataset.divide || 1);
    const target = parseFloat(el.dataset.target);
    const real   = val / divide;
    if      (target === 24000000) return '₹' + (real / 10000000).toFixed(1) + 'Cr+';
    else if (target === 1800000)  return (real / 100000).toFixed(0) + 'L+';
    else                          return real.toFixed(divide > 1 ? 1 : 0) + (el.dataset.suffix || '');
}

const statNums = document.querySelectorAll('.stat-num[data-target]');
const statObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseInt(el.dataset.target);
        const start  = performance.now();
        const dur    = 1800;
        function tick(now) {
            const p    = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            el.textContent = formatStat(el, Math.round(ease * target));
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = formatStat(el, target);
        }
        requestAnimationFrame(tick);
        statObserver.unobserve(el);
    });
}, { threshold: 0.5 });
statNums.forEach(el => statObserver.observe(el));


// ── Smooth Scroll ──
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        window.scrollTo({
            top:      target.getBoundingClientRect().top + window.scrollY - 70,
            behavior: 'smooth'
        });
    });
});


// ── Contact Form (Web3Forms) ──
async function handleContact(e) {
    e.preventDefault();
    const form    = e.target;
    const btn     = form.querySelector('.form-submit');
    const success = document.getElementById('formSuccess');
    const error   = document.getElementById('formError');

    success.classList.remove('show');
    error.classList.remove('show');
    btn.textContent = 'Sending...';
    btn.disabled    = true;

    try {
        const res  = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body:   new FormData(form)
        });
        const json = await res.json();

        if (json.success) {
            btn.textContent = 'Message Sent ✓';
            success.classList.add('show');
            form.reset();
            setTimeout(() => {
                btn.textContent = 'Send Message ✦';
                btn.disabled    = false;
                success.classList.remove('show');
            }, 5000);
        } else {
            throw new Error('Failed');
        }
    } catch {
        btn.textContent = 'Send Message ✦';
        btn.disabled    = false;
        error.classList.add('show');
        setTimeout(() => error.classList.remove('show'), 5000);
    }
}
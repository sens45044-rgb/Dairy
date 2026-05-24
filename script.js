/* =========================================
   SREELELA'S DREAM DIARY - JS ANIMATIONS
   ========================================= */

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

// Global Variables
const cursor = document.getElementById('cursor');
let isMusicPlaying = true;

/* --- 1. CUSTOM CURSOR --- */
document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: "power2.out"
    });
});

// Add hover effect for interactive elements
const interactiveElements = document.querySelectorAll('button, .polaroid, .photo-frame, .note-card');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
});

/* --- 2. LOADING SCREEN --- */
window.addEventListener('load', () => {
    // Animate loader heart
    gsap.from(".heart-loader", {
        scale: 0,
        opacity: 0,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
    });

    // Fade out loader after 2 seconds
    setTimeout(() => {
        gsap.to("#loader", {
            yPercent: -100,
            duration: 1,
            ease: "power4.inOut"
        });
    }, 2000);
});

/* --- 3. DIARY OPENING ANIMATION (The Magic Part) --- */
function openDiary() {
    const music = document.getElementById('bg-music');
    const welcomeSection = document.getElementById('welcome-section');
    const introUI = document.getElementById('intro-ui');
    const mainContent = document.getElementById('main-content');

    // Try to play music (Browser requires user interaction)
    if (music) {
        music.volume = 0.4;
        music.play().catch(err => console.log("Autoplay blocked"));
    }

    // 1. Hide the UI Button
    gsap.to(introUI, { opacity: 0, duration: 0.5, onComplete: () => introUI.style.display = 'none' });

    // 2. Animate Book Opening (3D Transform)
    const tl = gsap.timeline();

    // Step A: Lift the book slightly and open the cover
    tl.to("#diary-book", {
        rotateY: 0, // Reset tilt
        scale: 1.1,
        duration: 1,
        ease: "power2.inOut"
    })
    // Step B: Rotate front cover open (like a real book)
    .to(".front-cover", {
        rotateY: -160, // Opens flat
        duration: 1.5,
        ease: "power3.inOut",
        transformOrigin: "left center"
    }, "-=0.8")
    // Step C: Spread inner pages
    .to(".left-page", { rotateY: 30, x: -20, duration: 1, ease: "power3.out" }, "-=1")
    .to(".right-page", { rotateY: -30, x: 20, duration: 1, ease: "power3.out" }, "<")
    // Step D: The Photo FLIES OUT! (Pop out effect)
    .to(".photo-pop-out", {
        y: -150,         // Moves up
        z: 200,         // Comes closer to screen (3D)
        scale: 1.5,     // Gets bigger
        opacity: 0,    // Fades out as it leaves the book
        duration: 1.2,
        ease: "power2.in"
    }, "-=0.5")
    // Step E: Whole book fades away
    .to("#diary-book", {
        opacity: 0,
        scale: 0.5,
        duration: 0.8,
        ease: "back.in(1.7)"
    }, "-=0.5")
    // Step F: Reveal Main Content
    .call(() => {
        welcomeSection.style.display = "none";
        mainContent.classList.remove("hidden");
        initMainAnimations(); // Start scroll animations
    });
}

/* --- 4. MUSIC TOGGLE --- */
function toggleMusic() {
    const music = document.getElementById('bg-music');
    const btn = document.querySelector('.music-toggle');

    if (isMusicPlaying) {
        music.pause();
        btn.innerHTML = "🔇";
    } else {
        music.play();
        btn.innerHTML = "🎵";
    }
    isMusicPlaying = !isMusicPlaying;
}

/* --- 5. FLOATING HEARTS BACKGROUND --- */
const canvas = document.getElementById('hearts-canvas');
const ctx = canvas.getContext('2d');
let hearts = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Heart {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = Math.random() * 15 + 5;
        this.speed = Math.random() * 1.5 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.drift = (Math.random() * 1) - 0.5;
    }

    update() {
        this.y -= this.speed;
        this.x += this.drift;
        if (this.size > 0.1) this.size -= 0.005;
    }

    draw() {
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(255, 77, 109, ${this.opacity})`;
        
        ctx.beginPath();
        const topCurve = this.size / 2;
        const y = this.y;
        const x = this.x;
        
        // Draw Heart Shape
        ctx.moveTo(x, y + topCurve / 2);
        ctx.bezierCurveTo(x, y, x - this.size, y, x - this.size, y + topCurve);
        ctx.bezierCurveTo(x - this.size, y + (this.size + topCurve) / 2, x, y + (this.size + topCurve) / 2, x, y + this.size);
        ctx.bezierCurveTo(x, y + (this.size + topCurve) / 2, x + this.size, y + (this.size + topCurve) / 2, x + this.size, y + topCurve);
        ctx.bezierCurveTo(x + this.size, y, x, y, x, y + topCurve / 2);
        ctx.fill();
        
        if(this.size <= 0.1) this.reset();
    }

    reset() {
        this.y = canvas.height + 10;
        this.x = Math.random() * canvas.width;
        this.size = Math.random() * 15 + 5;
        this.opacity = Math.random() * 0.5 + 0.1;
    }
}

function initParticles() {
    hearts = [];
    for (let i = 0; i < 40; i++) {
        hearts.push(new Heart());
    }
    animateParticles();
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hearts.forEach(heart => {
        heart.update();
        heart.draw();
    });
    requestAnimationFrame(animateParticles);
}

// Start particles immediately on load
initParticles();

/* --- 6. MAIN CONTENT ANIMATIONS (SCROLL) --- */
function initMainAnimations() {
    // Hero Text
    gsap.from(".cinematic-title", {
        y: 100,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out"
    });

    gsap.from(".fade-text", {
        y: 20,
        opacity: 0,
        duration: 1,
        delay: 0.5
    });

    // Photo Grid Reveal
    gsap.utils.toArray('.polaroid').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
            },
            y: 150,
            opacity: 0,
            rotation: (Math.random() * 20) - 10,
            duration: 1,
            ease: "back.out(1.7)",
            delay: i * 0.2
        });
    });

    // Notes Reveal
    gsap.from(".note-card", {
        scrollTrigger: {
            trigger: ".notes-section",
            start: "top 70%"
        },
        scale: 0.8,
        opacity: 0,
        rotationY: 15,
        duration: 1.5,
        ease: "power2.out"
    });

    // Forever Heart Continuous Animation
    gsap.to(".big-heart", {
        scale: 1.1,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        boxShadow: "0 0 40px rgba(255, 77, 109, 0.6)"
    });
}
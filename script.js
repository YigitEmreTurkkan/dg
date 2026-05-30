document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const backgroundMusic = document.getElementById('backgroundMusic');
    const musicToggle = document.getElementById('musicToggle');
    const giftContainer = document.getElementById('giftContainer');
    const keyContainer = document.getElementById('keyContainer');
    const storybookContainer = document.getElementById('storybookContainer');
    const book = document.getElementById('myBook');
    const bookCover = document.getElementById('bookCover');
    const pages = document.querySelectorAll('.page');
    
    // Countdown Buttons
    const startMagicBtn = document.getElementById('startMagicBtn');
    
    // Navigation Buttons
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const currentPageNum = document.getElementById('currentPageNum');
    
    // Restart Button
    const restartBtn = document.getElementById('restartBtn');

    const steps = {
        step0: document.getElementById('step0'),
        step1: document.getElementById('step1'),
        step2: document.getElementById('step2'),
        step3: document.getElementById('step3'),
        step5: document.getElementById('step5'),
    };

    // --- State Variables ---
    let isMusicPlaying = false;
    let currentBookStep = 0; // 0: Cover closed, 1: Cover open (showing page1 front), 2: Page1 flipped, etc.
    const flipElements = [bookCover, ...pages]; // Elements that can be flipped: Cover, Page1, Page2, Page3, Page4
    const totalBookSteps = flipElements.length;

    // --- 1. Step Transitions ---
    function transitionToStep(targetStepId) {
        const currentActive = document.querySelector('.step.active');
        if (currentActive) {
            currentActive.classList.remove('active');
            currentActive.style.opacity = '0';
        }
        
        const targetStep = steps[targetStepId];
        targetStep.classList.add('active');
        // Trigger reflow for transition
        targetStep.offsetHeight; 
        targetStep.style.opacity = '1';
    }

    // --- 2. Background Music Controller ---
    function toggleMusic(forcePlay = null) {
        const shouldPlay = forcePlay !== null ? forcePlay : backgroundMusic.paused;
        
        if (shouldPlay) {
            backgroundMusic.play()
                .then(() => {
                    isMusicPlaying = true;
                    musicToggle.classList.add('playing');
                    musicToggle.querySelector('.music-tooltip').innerText = "Müziği Kapat";
                })
                .catch(err => {
                    console.log("Müzik çalınamadı (Etkileşim gerekiyor):", err);
                    isMusicPlaying = false;
                    musicToggle.classList.remove('playing');
                });
        } else {
            backgroundMusic.pause();
            isMusicPlaying = false;
            musicToggle.classList.remove('playing');
            musicToggle.querySelector('.music-tooltip').innerText = "Müziği Aç";
        }
    }

    musicToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Don't trigger heart explosion on the button
        toggleMusic();
    });

    // --- 3. Geri Sayım Sayacı (Target: 31 May 2026 00:00:00 GMT+3) ---
    // Let's set the target time to May 31, 2026 at midnight local time
    const targetDate = new Date('2026-05-31T00:00:00+03:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        const daysVal = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hoursVal = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutesVal = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const secondsVal = Math.floor((difference % (1000 * 60)) / 1000);

        // Format with leading zeros
        const formatNumber = num => num < 10 ? `0${num}` : num;

        if (difference < 0) {
            // Target date reached!
            document.getElementById('days').innerText = '00';
            document.getElementById('hours').innerText = '00';
            document.getElementById('minutes').innerText = '00';
            document.getElementById('seconds').innerText = '00';
            clearInterval(countdownInterval);
        } else {
            // Still counting down
            document.getElementById('days').innerText = formatNumber(Math.max(0, daysVal));
            document.getElementById('hours').innerText = formatNumber(Math.max(0, hoursVal));
            document.getElementById('minutes').innerText = formatNumber(Math.max(0, minutesVal));
            document.getElementById('seconds').innerText = formatNumber(Math.max(0, secondsVal));
        }

        // ALWAYS keep it active since it is officially May 31 midnight!
        startMagicBtn.classList.remove('disabled-btn');
        startMagicBtn.removeAttribute('disabled');
        startMagicBtn.querySelector('.btn-text').innerText = "Sihri Başlat 💖";
    }

    // Run immediately and then every second
    let countdownInterval;
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);

    // Start Magic Button Click
    startMagicBtn.addEventListener('click', (e) => {
        createHeartExplosion(e.clientX, e.clientY);
        toggleMusic(true); // Attempt to start music on first major click
        
        transitionToStep('step1');
    });

    // --- 4. Step 1: Gift Box Interaction ---
    giftContainer.addEventListener('click', (e) => {
        giftContainer.classList.add('open');
        createHeartExplosion(e.clientX, e.clientY);
        toggleMusic(true); // Play music on interaction
        
        setTimeout(() => {
            transitionToStep('step2');
        }, 900); // Wait for lid opening animation
    });

    // --- 5. Step 2: Key Interaction ---
    keyContainer.addEventListener('click', (e) => {
        keyContainer.classList.add('unlocking');
        createHeartExplosion(e.clientX, e.clientY);
        
        setTimeout(() => {
            transitionToStep('step3');
            
            // Automatically make the book section visible and open cover after a brief transition delay
            setTimeout(() => {
                storybookContainer.classList.add('visible');
                // Auto-open cover on entering book screen
                flipForward();
            }, 400);
        }, 700); // Wait for key zoom animation
    });

    // --- 6. Manual 3D Book Flipping Engine ---
    function updateBookNavigation() {
        // Update Page Numbers (1 cover + 4 pages = 5 steps total)
        currentPageNum.innerText = currentBookStep + 1;

        // Enable/Disable Prev Button
        if (currentBookStep === 0) {
            prevPageBtn.disabled = true;
        } else {
            prevPageBtn.disabled = false;
        }

        // Handle Next Button & transition to Finale
        if (currentBookStep === totalBookSteps) {
            nextPageBtn.innerText = "Kutlamayı Aç! 🎉";
        } else {
            nextPageBtn.innerText = "İleri ➡️";
        }
    }

    function flipForward() {
        if (currentBookStep < totalBookSteps) {
            const elementToFlip = flipElements[currentBookStep];
            elementToFlip.classList.add('flipped');
            // Invert z-index for flipped page so currently flipped page lies on top on the left side!
            elementToFlip.style.zIndex = currentBookStep + 1;
            
            // If we are flipping the cover, flatten the book angle for readability
            if (currentBookStep === 0) {
                book.classList.add('opened');
            }
            
            currentBookStep++;
            updateBookNavigation();
        } else {
            // Book is completely read, go to Step 5 (Finale)
            transitionToStep('step5');
            // Trigger extra heart burst for finale
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const rx = window.innerWidth * (0.2 + Math.random() * 0.6);
                    const ry = window.innerHeight * (0.2 + Math.random() * 0.6);
                    createHeartExplosion(rx, ry);
                }, i * 300);
            }
        }
    }

    function flipBackward() {
        if (currentBookStep > 0) {
            currentBookStep--;
            const elementToUnflip = flipElements[currentBookStep];
            elementToUnflip.classList.remove('flipped');
            // Restore original z-index from CSS!
            elementToUnflip.style.zIndex = '';
            
            // If we are closing the cover back, tilt the book angle
            if (currentBookStep === 0) {
                book.classList.remove('opened');
            }
            
            updateBookNavigation();
        }
    }

    // Next/Prev Buttons event listeners
    nextPageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        createHeartExplosion(e.clientX, e.clientY);
        flipForward();
    });

    prevPageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        createHeartExplosion(e.clientX, e.clientY);
        flipBackward();
    });

    // Clicking the book itself also flips pages!
    book.addEventListener('click', (e) => {
        createHeartExplosion(e.clientX, e.clientY);
        // Flip page forward on click
        flipForward();
    });

    // --- 7. Restart Celebration ---
    restartBtn.addEventListener('click', (e) => {
        createHeartExplosion(e.clientX, e.clientY);
        
        // Reset book state variables
        currentBookStep = 0;
        book.classList.remove('opened');
        flipElements.forEach(el => {
            el.classList.remove('flipped');
            el.style.zIndex = '';
        });
        
        // Return to Book Step
        transitionToStep('step3');
        updateBookNavigation();
        
        // Auto-open cover again
        setTimeout(() => {
            flipForward();
        }, 600);
    });

    // --- 8. Particle Background System (Floating Hearts & Stars) ---
    function createHearts() {
        const background = document.querySelector('.background-container');
        const heartCount = 35;
        const heartIcons = ['❤️', '💖', '💝', '💕', '✨', '🌸'];

        for (let i = 0; i < heartCount; i++) {
            const heart = document.createElement('div');
            heart.classList.add('floating-heart');
            
            // Random heart character
            heart.innerText = heartIcons[Math.floor(Math.random() * heartIcons.length)];
            
            // Randomize starting position, size, opacity
            const size = Math.random() * 15 + 12; // 12px to 27px
            heart.style.fontSize = `${size}px`;
            heart.style.left = `${Math.random() * 100}vw`;
            heart.style.top = `${Math.random() * 100}vh`;
            heart.style.opacity = (Math.random() * 0.4 + 0.2).toString();
            
            // Slow, floaty animation
            const duration = Math.random() * 15 + 15; // 15s to 30s
            const delay = Math.random() * -20; // Pre-start animation
            heart.style.animation = `floatHeart ${duration}s linear infinite`;
            heart.style.animationDelay = `${delay}s`;
            
            background.appendChild(heart);
        }
    }

    // Inject CSS keyframes for floating hearts dynamically
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
        @keyframes floatHeart {
            0% { transform: translateY(100vh) translateX(0) rotate(0deg); opacity: 0; }
            10% { opacity: 0.6; }
            90% { opacity: 0.6; }
            100% { transform: translateY(-10vh) translateX(50px) rotate(360deg); opacity: 0; }
        }
        
        .click-heart {
            position: fixed;
            pointer-events: none;
            z-index: 9999;
            font-size: 1.5rem;
            animation: burstOut 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            user-select: none;
        }
        
        @keyframes burstOut {
            0% { transform: translate(-50%, -50%) scale(0.5) rotate(0deg); opacity: 1; }
            100% { transform: translate(var(--tx), var(--ty)) scale(1.2) rotate(var(--rot)); opacity: 0; }
        }
    `;
    document.head.appendChild(styleSheet);
    
    createHearts();

    // --- 9. Click Heart Explosion Effect ---
    function createHeartExplosion(x, y) {
        if (!x || !y) return; // Ignore null coordinates (e.g. keyboard events)

        const burstCount = 12;
        const colors = ['❤️', '💖', '💝', '💕', '✨', '💛'];
        
        for (let i = 0; i < burstCount; i++) {
            const h = document.createElement('div');
            h.classList.add('click-heart');
            h.innerText = colors[Math.floor(Math.random() * colors.length)];
            h.style.left = `${x}px`;
            h.style.top = `${y}px`;
            
            // Random direction offsets
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 80 + 30; // 30px to 110px
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            const rot = Math.random() * 360;
            
            h.style.setProperty('--tx', `${tx}px`);
            h.style.setProperty('--ty', `${ty}px`);
            h.style.setProperty('--rot', `${rot}deg`);
            
            document.body.appendChild(h);
            
            // Remove after animation completes
            setTimeout(() => {
                h.remove();
            }, 800);
        }
    }

    // --- 10. Auto-play on First Interaction ---
    // Start music on the very first user interaction anywhere on the page to bypass browser autoplay policies
    const startMusicOnFirstInteraction = () => {
        toggleMusic(true);
        document.removeEventListener('click', startMusicOnFirstInteraction);
        document.removeEventListener('touchstart', startMusicOnFirstInteraction);
    };
    document.addEventListener('click', startMusicOnFirstInteraction);
    document.addEventListener('touchstart', startMusicOnFirstInteraction);

    // Listen for global clicks to spawn hearts
    document.addEventListener('click', (e) => {
        // Spawn hearts on any clicks except standard buttons to avoid cluttering
        if (e.target.tagName !== 'BUTTON' && !e.target.closest('.music-toggle')) {
            createHeartExplosion(e.clientX, e.clientY);
        }
    });
});

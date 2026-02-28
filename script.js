const TRANSLATIONS = {
    ua: {
        title: "Для мого кохання ❤️",
        subtitle_start: "Вибери одну картку і дізнайся, що я відчуваю... 💝",
        subtitle_scratch: "Зітри одну картку пальцем... ✨",
        start_btn: "Почати гру",
        scratch_text: "Зітри мене",
        restart_btn: "Ще раз",
        sentences: [
            "Ти найкраще, що траплялося зі мною ❤️",
            "Твоя усмішка робить мій день яскравішим ✨",
            "Я кохаю тебе більше, ніж учора, але менше, ніж завтра 💖",
            "Відстань ніщо, коли ти поруч у моєму серці 🌍💕",
            "Ти моя найрідніша людина 🫂❤️",
            "З тобою кожна мить особлива 🌟",
            "Моє серце належить тільки тобі 💘",
            "Я сумую за тобою щосекунди 🥺❤️",
            "Ти робиш мене найщасливішою людиною у світі 🥰",
            "Моя любов до тебе не має меж ♾️💖",
            "Ти — моя мрія, яка стала реальністю ✨💕",
            "Дякую за те, що ти є в моєму житті 💝",
            "Твої очі — мій улюблений всесвіт 🌌❤️",
            "Кожна думка про тебе гріє мені душу ☕💖",
            "Я завжди буду поруч, незважаючи ні на що 🤝❤️"
        ]
    },
    en: {
        title: "For My Love ❤️",
        subtitle_start: "Choose a card and see how I feel... 💝",
        subtitle_scratch: "Scratch a card with your finger... ✨",
        start_btn: "Start Game",
        scratch_text: "Scratch Me",
        restart_btn: "Play Again",
        sentences: [
            "You are the best thing that ever happened to me ❤️",
            "Your smile brightens my day ✨",
            "I love you more than yesterday, but less than tomorrow 💖",
            "Distance is nothing when you're in my heart 🌍💕",
            "You are my dearest person 🫂❤️",
            "Every moment with you is special 🌟",
            "My heart belongs only to you 💘",
            "I miss you every second 🥺❤️",
            "You make me the happiest person in the world 🥰",
            "My love for you has no limits ♾️💖",
            "You are a dream come true ✨💕",
            "Thank you for being in my life 💝",
            "Your eyes are my favorite universe 🌌❤️",
            "Every thought of you warms my soul ☕💖",
            "I will always be there, no matter what 🤝❤️"
        ]
    }
};

let currentLang = 'ua';
let gameActive = false;
let selectedCardIndex = null;
let currentShuffledSentences = [];

document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('start-screen');
    const resultScreen = document.getElementById('result-screen');
    const cardGrid = document.getElementById('card-grid');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const floatingHeartsContainer = document.getElementById('floating-hearts');
    const langBtn = document.getElementById('lang-btn');

    function createFloatingHearts() {
        const heartCount = 15;
        for (let i = 0; i < heartCount; i++) {
            const heart = document.createElement('div');
            heart.classList.add('heart');
            heart.style.left = Math.random() * 100 + 'vw';
            heart.style.animationDuration = (Math.random() * 10 + 10) + 's';
            heart.style.animationDelay = (Math.random() * 5) + 's';
            floatingHeartsContainer.appendChild(heart);
        }
    }

    function toggleLanguage() {
        currentLang = currentLang === 'ua' ? 'en' : 'ua';
        langBtn.textContent = currentLang === 'ua' ? '🇺🇦 UA' : '🇬🇧 EN';
        updateUIText();

        // If cards are currently generated, we need to translate their hidden text
        if (currentShuffledSentences.length > 0) {
            const cards = document.querySelectorAll('.card');
            cards.forEach((card, index) => {
                const inner = card.querySelector('.card-inner');
                if (inner) {
                    // Find the original index of this sentence in the TRANSLATIONS array
                    const originalSentenceIndex = currentShuffledSentences[index];
                    inner.textContent = TRANSLATIONS[currentLang].sentences[originalSentenceIndex];

                    // Note: HTML5 Canvas text cannot be updated easily once drawn without redrawing the whole scratch layer.
                    // Instead of redrawing the canvas and losing the user's progress if they are scratching,
                    // we accept that the "Зітри мене / Scratch Me" canvas text stays in the language it was generated in.
                }
            });

            // If the result screen is showing, update that sentence too
            if (resultScreen.classList.contains('active')) {
                const activeCardInner = document.querySelector('.card.selected .card-inner');
                if (activeCardInner) {
                    document.getElementById('result-text').textContent = activeCardInner.textContent;
                }
            }
        }
    }

    function updateUIText() {
        const t = TRANSLATIONS[currentLang];
        document.getElementById('title-text').textContent = t.title;
        document.getElementById('start-text').textContent = t.start_btn;
        document.getElementById('restart-text').textContent = t.restart_btn;

        if (gameActive) {
            document.getElementById('subtitle-text').textContent = t.subtitle_scratch;
        } else {
            document.getElementById('subtitle-text').textContent = t.subtitle_start;
        }
    }

    function init() {
        createFloatingHearts();
        startBtn.addEventListener('click', startGame);
        restartBtn.addEventListener('click', resetGame);
        langBtn.addEventListener('click', toggleLanguage);
    }

    function startGame() {
        startScreen.classList.remove('active');
        startScreen.classList.add('hidden');
        cardGrid.classList.remove('hidden');

        generateCards();

        const cards = document.querySelectorAll('.card');
        cards.forEach(card => card.classList.add('shuffling'));

        setTimeout(() => {
            cards.forEach(card => card.classList.remove('shuffling'));
            gameActive = true;
            document.getElementById('subtitle-text').textContent = TRANSLATIONS[currentLang].subtitle_scratch;
        }, 1200);
    }

    function generateCards() {
        cardGrid.innerHTML = '';
        selectedCardIndex = null;
        gameActive = false;

        // Generate an array of indices [0...14] and shuffle them
        const indices = Array.from({ length: 15 }, (_, i) => i);
        indices.sort(() => 0.5 - Math.random());

        // Save the first 9 shuffled indices so we can translate them on-the-fly later
        currentShuffledSentences = indices.slice(0, 9);

        currentShuffledSentences.forEach((sentenceIndex, displayIndex) => {
            const sentence = TRANSLATIONS[currentLang].sentences[sentenceIndex];

            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.index = displayIndex;

            const inner = document.createElement('div');
            inner.className = 'card-inner';
            inner.textContent = sentence;

            const canvas = document.createElement('canvas');
            canvas.className = 'scratch-layer';
            canvas.dataset.index = displayIndex;

            card.appendChild(inner);
            card.appendChild(canvas);
            cardGrid.appendChild(card);

            // Wait for DOM insertion and layout sizing
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setupScratchCanvas(canvas, card, TRANSLATIONS[currentLang].scratch_text);
                });
            });
        });
    }

    function setupScratchCanvas(canvas, containerElement, scratchText) {
        const ctx = canvas.getContext('2d');
        const width = containerElement.offsetWidth || 100;
        const height = containerElement.offsetHeight || 100;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);

        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#ff9a9e');
        gradient.addColorStop(1, '#fecfef');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 16px Montserrat';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(scratchText, width / 2, height / 2);

        let isDrawing = false;
        let isRevealed = false;

        function getPointerPos(e) {
            const rect = canvas.getBoundingClientRect();
            // Fallbacks for both desktop and mobile
            const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }

        function handleStart(e) {
            if (!gameActive || isRevealed) return;

            const cardIndex = canvas.dataset.index;
            if (selectedCardIndex === null) {
                selectedCardIndex = cardIndex;
                disableOtherCards(selectedCardIndex);
            } else if (selectedCardIndex !== cardIndex) {
                return;
            }

            isDrawing = true;
            const pos = getPointerPos(e);
            scratch(pos.x, pos.y);

            if (e.cancelable) e.preventDefault(); // Prevent scroll
        }

        function handleMove(e) {
            if (!isDrawing || !gameActive || isRevealed) return;
            if (e.cancelable) e.preventDefault(); // Prevent scroll while drawing
            const pos = getPointerPos(e);
            scratch(pos.x, pos.y);
        }

        function handleEnd() {
            if (!isDrawing) return;
            isDrawing = false;
            checkReveal();
        }

        function scratch(x, y) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 18, 0, Math.PI * 2);
            ctx.fill();
        }

        function checkReveal() {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            let transparentPixels = 0;

            const stride = 32;
            let sampledPixels = 0;
            for (let i = 0; i < data.length; i += 4 * stride) {
                sampledPixels++;
                if (data[i + 3] < 128) {
                    transparentPixels++;
                }
            }

            const percentage = (transparentPixels / Math.max(1, sampledPixels)) * 100;

            if (percentage > 45 && !isRevealed) {
                isRevealed = true;
                canvas.style.transition = 'opacity 0.6s ease';
                canvas.style.opacity = '0';
                setTimeout(() => {
                    canvas.style.display = 'none';
                    const sentence = containerElement.querySelector('.card-inner').textContent;
                    showRestartButton(sentence);
                }, 600);
            }
        }

        // Mouse Events
        canvas.addEventListener('mousedown', handleStart);
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);

        // Touch Events
        canvas.addEventListener('touchstart', handleStart, { passive: false });
        canvas.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleEnd);
        canvas.addEventListener('touchcancel', handleEnd);
    }

    function disableOtherCards(selectedIndex) {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            if (card.dataset.index !== selectedIndex) {
                card.classList.add('disabled');
            } else {
                card.classList.add('selected');
            }
        });
    }

    function showRestartButton(sentence) {
        setTimeout(() => {
            document.getElementById('result-text').textContent = sentence;
            resultScreen.classList.remove('hidden');
            resultScreen.classList.add('active');
        }, 2000);
    }

    function resetGame() {
        resultScreen.classList.remove('active');
        resultScreen.classList.add('hidden');
        document.getElementById('subtitle-text').textContent = TRANSLATIONS[currentLang].subtitle_start;
        document.getElementById('result-text').textContent = "";

        startGame();
    }

    // Initialize application
    init();
});

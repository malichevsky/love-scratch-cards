const LOVE_SENTENCES = [
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
];

let gameActive = false;
let selectedCardIndex = null;

document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('start-screen');
    const resultScreen = document.getElementById('result-screen');
    const cardGrid = document.getElementById('card-grid');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const floatingHeartsContainer = document.getElementById('floating-hearts');

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

    function init() {
        createFloatingHearts();
        startBtn.addEventListener('click', startGame);
        restartBtn.addEventListener('click', resetGame);
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
            document.querySelector('.subtitle').textContent = "Зітри одну картку пальцем... ✨";
        }, 1200);
    }

    function generateCards() {
        cardGrid.innerHTML = '';
        selectedCardIndex = null;
        gameActive = false;

        const shuffledPool = [...LOVE_SENTENCES].sort(() => 0.5 - Math.random());
        const selectedSentences = shuffledPool.slice(0, 9);

        selectedSentences.forEach((sentence, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.index = index;

            const inner = document.createElement('div');
            inner.className = 'card-inner';
            inner.textContent = sentence;

            const canvas = document.createElement('canvas');
            canvas.className = 'scratch-layer';
            canvas.dataset.index = index;

            card.appendChild(inner);
            card.appendChild(canvas);
            cardGrid.appendChild(card);

            // Wait for DOM insertion and layout sizing
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setupScratchCanvas(canvas, card);
                });
            });
        });
    }

    function setupScratchCanvas(canvas, containerElement) {
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
        ctx.fillText('Зітри мене', width / 2, height / 2);

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
        document.querySelector('.subtitle').textContent = "Вибери одну картку і дізнайся, що я відчуваю... 💝";
        document.getElementById('result-text').textContent = "";

        startGame();
    }

    // Initialize application
    init();
});

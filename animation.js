(function() {
    'use strict';

    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const time = {
        then: Date.now(),
        now: null,
        delta: 0,
    }
    let objects = [];
    let isRunning = false;
    let frame = null;
    let initDone = false;

    function ready() {
        resize();

        window.addEventListener('resize', resize);
        window.addEventListener('resize', debounce(function() {
            initDone = false;
            stop();
            init();
        }, 80));
        document.addEventListener('visibilitychange', handleVisibilityChange);

        init();
    }

    function resize() {
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;
        const devicePixelRatio = window.devicePixelRatio || 1;

        canvas.height = windowHeight * devicePixelRatio;
        canvas.width = windowWidth * devicePixelRatio;
        canvas.style.height = windowHeight + 'px';
        canvas.style.width = windowWidth + 'px';
        context.scale(devicePixelRatio, devicePixelRatio);
    }

    function initDelta() {
        time.then = Date.now();
        time.delta = 1;
    }

    function updateDelta() {
        time.now = Date.now();
        time.delta = (time.now - time.then) / 100;
        time.then = time.now;
    }

    function init() {
        if (initDone) {
            return;
        }

        initDone = true;
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;
        const itemSize = 5;
        const numberOfDotsX = Math.floor(windowWidth / itemSize);
        const numberOfDotsY = Math.floor(windowHeight / itemSize);

        objects = [];

        for (let i = 0; i < numberOfDotsX; i++) {
            for (let j = 0; j < numberOfDotsY; j++) {
                const x = i * itemSize;
                const y = j * itemSize;

                if (Math.random() > 0.99) {
                    objects.push(new Square(x, y, itemSize, random(itemSize, itemSize * 2)));
                }

                // objects.push(new Square(x, y, itemSize, random(itemSize/4, itemSize/1.5)));
            }
        }

        start();
        canvas.classList.add('show');
    }

    function start() {
        isRunning = true;
        initDelta();
        run();
    }

    function stop() {
        isRunning = false;
        cancelAnimationFrame(frame);
    }

    function handleVisibilityChange() {
        if (document.hidden) {
            stop();
        } else {
            start();
        }
    }

    function run() {
        update();
        draw();

        if (isRunning) {
            frame = requestAnimationFrame(run);
        }
    }

    function update() {
        updateDelta();

        for (const obj of objects) {
            obj.update();
        }
    }

    function draw() {
        /**
         *  Reset canvas
         */
        context.globalCompositeOperation = 'source-over';
        context.fillStyle = 'rgba(0, 0, 0, .8)';
        context.fillRect(0, 0, window.innerWidth, window.innerHeight);

        for (const obj of objects) {
            obj.draw();
        }
    }

    class Square {
        constructor(x, y, size, amplitude) {
            this.x = x;
            this.y = y;
            this.hue = null;
            this.saturation = null;
            this.luminance = random(0, 50);
            this.targetLuminance = null;
            this.size = size;
            this.originalX = x;
            this.originalY = y;
            this.amplitude = amplitude;
            this.targetX = x + Math.random() * this.amplitude;
            this.targetY = y + Math.random() * this.amplitude;
            this.hueVelocity = random(1, 4) / 10
            this.hueBoundaries = [160, 190];
            this.luminanceVelocity = random(1, 4) / 10;

            this.updateColor();
            this.updateLuminance();
        }

        updateColor() {
            this.hue = this.hueVelocity + this.hue;

            if (this.hue > this.hueBoundaries[1]) {
                this.hue = this.hueBoundaries[1];
                this.hueVelocity = -this.hueVelocity;
            } else if (this.hue < this.hueBoundaries[0]) {
                this.hue = this.hueBoundaries[0];
                this.hueVelocity = -this.hueVelocity;
            }

            this.saturation = random(50, 100);
        }

        updateLuminance() {
            this.targetLuminance = random(0, 50);
        }

        draw() {
            context.fillStyle = `hsl(${this.hue}, ${this.saturation}%, ${this.luminance}%)`;
            context.beginPath();
            // context.rect(this.x, this.y, this.size, this.size);
            context.arc(this.x, this.y, this.size/2, 0, Math.PI * 2);
            context.fill();
        }

        update() {
            this.luminance += (this.targetLuminance - this.luminance) * time.delta * this.luminanceVelocity;

            if (Math.abs(this.luminance - this.targetLuminance) < 1) {
                this.updateLuminance();
            }

            this.x += (this.targetX - this.x) * time.delta * 0.1;
            this.y += (this.targetY - this.y) * time.delta * 0.1;

            if (Math.abs(this.x - this.targetX) < 1) {
                if (this.targetX === this.originalX) {
                    this.targetX = this.originalX + Math.random() * this.amplitude;
                } else {
                    this.targetX = this.originalX;
                    this.updateColor();
                }
            }

            if (Math.abs(this.y - this.targetY) < 1) {
                if (this.targetY === this.originalY) {
                    this.targetY = this.originalY + Math.random() * this.amplitude;
                } else {
                    this.targetY = this.originalY;
                    this.updateColor();
                }
            }
        }
    }

    function debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    function random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    ready();
})();
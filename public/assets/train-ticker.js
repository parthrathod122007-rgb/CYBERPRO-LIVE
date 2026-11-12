/**
 * CyberPro Perpetual Train-Motion Ticker Engine
 * Smooth 60fps/120fps continuous linear glide that pauses when cursor hovers over it.
 */
(function () {
    function initTrainTickers() {
        const wrappers = document.querySelectorAll('[data-train-ticker]');
        wrappers.forEach((wrapper) => {
            const track = wrapper.querySelector('.train-track') || wrapper.querySelector('.train-marquee');
            if (!track || wrapper._trainTickerActive) return;
            wrapper._trainTickerActive = true;

            const speed = parseFloat(wrapper.getAttribute('data-speed') || '50');
            const reverse = wrapper.getAttribute('data-direction') === 'reverse';

            track.style.setProperty('display', 'flex', 'important');
            track.style.setProperty('width', 'max-content', 'important');
            track.style.setProperty('flex-direction', 'row', 'important');
            track.style.setProperty('flex-wrap', 'nowrap', 'important');
            track.style.setProperty('white-space', 'nowrap', 'important');
            track.style.setProperty('align-items', 'center', 'important');
            track.style.setProperty('will-change', 'transform', 'important');

            let pos = 0;
            let lastTimestamp = performance.now();
            let isHovered = false;

            wrapper.addEventListener('mouseenter', function () { isHovered = true; });
            wrapper.addEventListener('mouseleave', function () { isHovered = false; });
            wrapper.addEventListener('touchstart', function () { isHovered = true; }, { passive: true });
            wrapper.addEventListener('touchend', function () { isHovered = false; }, { passive: true });

            function getHalfWidth() {
                const chunks = track.children;
                if (chunks.length >= 2 && chunks[0].offsetWidth > 0) {
                    return chunks[0].offsetWidth;
                }
                return track.scrollWidth > 0 ? (track.scrollWidth / 2) : 0;
            }

            let halfWidth = getHalfWidth();
            
            function refreshWidth() {
                const nw = getHalfWidth();
                if (nw > 0) halfWidth = nw;
            }

            window.addEventListener('resize', refreshWidth);
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(refreshWidth);
            }
            setTimeout(refreshWidth, 300);
            setTimeout(refreshWidth, 1000);

            function render(now) {
                if (halfWidth <= 0) {
                    refreshWidth();
                }

                const dt = Math.min((now - lastTimestamp) / 1000, 0.05);
                lastTimestamp = now;

                if (halfWidth > 0 && !isHovered) {
                    if (reverse) {
                        pos -= speed * dt;
                        if (pos <= 0) {
                            pos += halfWidth;
                        }
                    } else {
                        pos += speed * dt;
                        if (pos >= halfWidth) {
                            pos -= halfWidth;
                        }
                    }
                    track.style.transform = 'translate3d(' + (-pos) + 'px, 0, 0)';
                }

                requestAnimationFrame(render);
            }

            requestAnimationFrame(render);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTrainTickers);
    } else {
        initTrainTickers();
    }
    window.addEventListener('load', initTrainTickers);
})();

/* =========================================
   MindGuard · splash.js
   표지 파티클 생성
   ========================================= */

(function () {
  const container = document.getElementById('particles');
  if (!container) return;

  const colors = ['#2dd4bf', '#0ea5e9', '#818cf8', '#f472b6'];

  for (let i = 0; i < 18; i++) {
    const el = document.createElement('div');
    el.className = 'particle';

    const size  = 2 + Math.random() * 3;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const op    = (0.15 + Math.random() * 0.3).toFixed(2);

    el.style.cssText = `
      width:  ${size}px;
      height: ${size}px;
      background: ${color};
      top:  ${5  + Math.random() * 90}%;
      left: ${5  + Math.random() * 90}%;
      --dur:   ${(6  + Math.random() * 10).toFixed(1)}s;
      --delay: ${(Math.random() * 6).toFixed(1)}s;
      --op:    ${op};
    `;
    container.appendChild(el);
  }
})();
// ====== Custom cursor ======
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

if (window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.classList.add('is-visible');
    ring.classList.add('is-visible');
    dot.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
  });
  window.addEventListener('mouseleave', () => {
    dot.classList.remove('is-visible');
    ring.classList.remove('is-visible');
  });

  (function tick() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.transform = `translate(${rx - 16}px, ${ry - 16}px)`;
    requestAnimationFrame(tick);
  })();

  document.querySelectorAll('a, button, input, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width = '56px';
      ring.style.height = '56px';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width = '32px';
      ring.style.height = '32px';
    });
  });
}

// ====== Hero entrance (gradient version, no tile-flip) ======
function triggerHeroText() {
  document.querySelector('.hero-label').classList.add('is-in');
  document.getElementById('heroTitle').classList.add('is-in');
  document.querySelector('.hero-sub').classList.add('is-in');
  document.querySelector('.hero-cta').classList.add('is-in');
}

// sedikit delay biar particle canvas sempat render
window.addEventListener('load', () => {
  setTimeout(triggerHeroText, 200);
});

// ====== Particle canvas ======
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let canvasW = 0, canvasH = 0;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isCoarse = window.matchMedia('(pointer: coarse)').matches;
const PARTICLE_COUNT = isCoarse ? 50 : 90;

function resizeCanvas() {
  const hero = document.querySelector('.hero');
  canvasW = canvas.width = hero.offsetWidth;
  canvasH = canvas.height = hero.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function createParticle() {
  const colors = ['113,136,75', '138,154,91', '74,93,50'];
  return {
    x: Math.random() * canvasW,
    y: Math.random() * canvasH,
    vx: (Math.random() - 0.5) * 0.15,
    vy: -Math.random() * 0.3 - 0.05,
    size: Math.random() * 2.2 + 0.6,
    offset: Math.random() * Math.PI * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    alpha: Math.random() * 0.5 + 0.2,
  };
}
for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(createParticle());

let mouseX = -1000, mouseY = -1000;
if (!isCoarse) {
  document.querySelector('.hero').addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
  document.querySelector('.hero').addEventListener('mouseleave', () => {
    mouseX = -1000; mouseY = -1000;
  });
}

function animateParticles() {
  ctx.clearRect(0, 0, canvasW, canvasH);
  particles.forEach(p => {
    if (!reduced) {
      p.x += p.vx + Math.sin(p.offset + performance.now() * 0.0005) * 0.2;
      p.y += p.vy;
      p.offset += 0.01;
      if (p.y < -10) { p.y = canvasH + 10; p.x = Math.random() * canvasW; }
      if (p.x < -10) p.x = canvasW + 10;
      if (p.x > canvasW + 10) p.x = -10;
    }
    let drawX = p.x, drawY = p.y;
    if (!isCoarse) {
      const dx = p.x - mouseX, dy = p.y - mouseY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 120) {
        const pushFactor = (120 - dist) / 120 * 0.6;
        drawX = p.x + dx * pushFactor * 0.05;
        drawY = p.y + dy * pushFactor * 0.05;
      }
    }
    ctx.beginPath();
    ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
    ctx.fill();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();


// ====== Intersection observer for fade-up ======
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.headline-enter').forEach(el => io.observe(el));

// ====== Product quantity state ======
const state = {
  small: 0,
  large: 0,
  priceSmall: 6000,
  priceLarge: 9000,
};

function formatRupiah(num) {
  return 'Rp ' + num.toLocaleString('id-ID');
}

function updateUI() {
  document.getElementById('qtySmall').textContent = state.small;
  document.getElementById('qtyLarge').textContent = state.large;

  const total = state.small * state.priceSmall + state.large * state.priceLarge;
  const totalQty = state.small + state.large;

  document.getElementById('totalDisplay').textContent = formatRupiah(total);
  document.getElementById('viewSummaryBtn').disabled = totalQty === 0;

  const smallRow = document.querySelector('.summary-row[data-size="small"]');
  const largeRow = document.querySelector('.summary-row[data-size="large"]');
  smallRow.querySelector('.value').textContent = `${state.small} pcs · ${formatRupiah(state.small * state.priceSmall)}`;
  smallRow.classList.toggle('empty', state.small === 0);
  largeRow.querySelector('.value').textContent = `${state.large} pcs · ${formatRupiah(state.large * state.priceLarge)}`;
  largeRow.classList.toggle('empty', state.large === 0);
  document.getElementById('modalTotal').textContent = formatRupiah(total);
  document.getElementById('qrisTotal').textContent = formatRupiah(total);
}

document.querySelectorAll('.qty-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    const size = btn.dataset.size;
    if (action === 'inc') {
      state[size] = Math.min(99, state[size] + 1);
    } else {
      state[size] = Math.max(0, state[size] - 1);
    }
    updateUI();
  });
});

// ====== Modal logic ======
const modalOverlay = document.getElementById('modalOverlay');
const viewSummaryBtn = document.getElementById('viewSummaryBtn');
const modalClose = document.getElementById('modalClose');

viewSummaryBtn.addEventListener('click', () => {
  if (state.small + state.large === 0) return;
  modalOverlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
});

function closeModal() {
  modalOverlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('is-open')) closeModal();
});

// ====== Payment method tabs ======
const paymentTabs = document.querySelectorAll('.payment-tab');
const panelWhatsapp = document.getElementById('panelWhatsapp');
const panelQris = document.getElementById('panelQris');

paymentTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    paymentTabs.forEach(t => t.classList.remove('is-active'));
    tab.classList.add('is-active');
    const method = tab.dataset.method;
    panelWhatsapp.hidden = method !== 'whatsapp';
    panelQris.hidden = method !== 'qris';
  });
});

// ====== Build order message ======
function buildOrderMessage(paidViaQris) {
  const name = document.getElementById('custName').value.trim() || '-';
  const note = document.getElementById('custNote').value.trim() || '-';
  const totalSmall = state.small * state.priceSmall;
  const totalLarge = state.large * state.priceLarge;
  const grandTotal = totalSmall + totalLarge;

  let message = `Halo, saya mau pesan Susu Boba Matcha:\n`;
  message += `- Ukuran Kecil: ${state.small} pcs (Rp ${totalSmall.toLocaleString('id-ID')})\n`;
  message += `- Ukuran Besar: ${state.large} pcs (Rp ${totalLarge.toLocaleString('id-ID')})\n\n`;
  message += `Total Bayar: Rp ${grandTotal.toLocaleString('id-ID')}\n\n`;
  message += `Nama Pemesan: ${name}\n`;
  message += `Catatan: ${note}\n`;
  message += paidViaQris
    ? `Metode Bayar: QRIS (sudah dibayar, bukti terlampir)`
    : `Metode Bayar: Belum dibayar, atur langsung via chat`;

  return message;
}

function openWhatsapp(message) {
  const url = `https://wa.me/6289678442205?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

// ====== WhatsApp redirect (order without upfront payment) ======
document.getElementById('waButton').addEventListener('click', () => {
  openWhatsapp(buildOrderMessage(false));
});

// ====== WhatsApp redirect (paid via QRIS, confirm + send proof) ======
document.getElementById('waConfirmButton').addEventListener('click', () => {
  openWhatsapp(buildOrderMessage(true));
});

updateUI();

const GAME_URL = 'https://rosselynramirezconsulting-spec.github.io/-Project-games/';

export function buildCardCanvas({ score, level, animalsCollected = 0, won }) {
  const W = 350, H = 196;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, won ? '#0a2244' : '#090f1b');
  bg.addColorStop(1, won ? '#1a5a8a' : '#0c1e35');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Outer border
  ctx.strokeStyle = won ? '#ffd700' : '#3a6a9a';
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, W - 4, H - 4);

  // Inner glow border
  ctx.strokeStyle = won ? 'rgba(255,215,0,0.18)' : 'rgba(58,106,154,0.18)';
  ctx.lineWidth = 1;
  ctx.strokeRect(7, 7, W - 14, H - 14);

  // Game title
  ctx.textAlign = 'center';
  ctx.font = 'bold 17px Arial';
  ctx.fillStyle = '#ffe066';
  ctx.fillText("Don't Drown, Noah! 🌊", W / 2, 24);

  // Divider
  ctx.beginPath();
  ctx.strokeStyle = won ? 'rgba(255,215,0,0.35)' : 'rgba(58,106,154,0.35)';
  ctx.lineWidth = 1;
  ctx.moveTo(20, 33); ctx.lineTo(W - 20, 33);
  ctx.stroke();

  // Result
  ctx.font = 'bold 19px Arial';
  ctx.fillStyle = won ? '#44ff88' : '#ff5555';
  ctx.fillText(
    won ? `🏆  Level ${level} Complete!` : `💀  Drowned at Level ${level}`,
    W / 2, 57,
  );

  // Score hero
  ctx.font = 'bold 60px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(score, W / 2, 118);

  // POINTS label
  ctx.font = 'bold 11px Arial';
  ctx.fillStyle = '#8899aa';
  ctx.fillText('POINTS', W / 2, 134);

  // Animals rescued
  if (animalsCollected > 0) {
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#ffcc44';
    ctx.fillText(
      `🦁  ${animalsCollected} animal${animalsCollected !== 1 ? 's' : ''} rescued`,
      W / 2, 157,
    );
  }

  // Challenge hashtag
  ctx.font = 'italic 12px Arial';
  ctx.fillStyle = '#7799bb';
  ctx.fillText('Can you beat me? #DontDrownNoah', W / 2, 176);

  // URL watermark
  ctx.font = '9px Arial';
  ctx.fillStyle = '#334455';
  ctx.fillText(GAME_URL, W / 2, H - 5);

  return cv;
}

export async function shareCard(cv, shareText) {
  const fullText = `${shareText}\n${GAME_URL}`;

  if (navigator.share) {
    try {
      const blob = await new Promise(res => cv.toBlob(res, 'image/png'));
      const file = new File([blob], 'dont-drown-noah.png', { type: 'image/png' });
      const data = (navigator.canShare && navigator.canShare({ files: [file] }))
        ? { files: [file], text: fullText }
        : { text: fullText };
      await navigator.share(data);
      return 'shared';
    } catch (e) {
      if (e.name === 'AbortError') return 'cancelled';
    }
  }

  // Desktop: download the image
  try {
    const a = document.createElement('a');
    a.download = 'dont-drown-noah.png';
    a.href = cv.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return 'downloaded';
  } catch (_) {}

  if (navigator.clipboard) {
    await navigator.clipboard.writeText(fullText).catch(() => {});
    return 'copied';
  }
  return 'none';
}

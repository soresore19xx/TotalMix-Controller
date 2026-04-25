export type LabelSettings = {
  label?: string;
  labelFont?: string;
  labelSize?: number;
};

function makeSvg(text: string, font: string, size: number, active?: boolean): string {
  const color    = active ? 'rgb(0,153,255)' : 'rgb(204,204,204)';
  const safeFont = font.replace(/[<>&"]/g, '');
  const safeText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const y        = Math.round(72 + size * 0.36);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144">`
       + `<rect width="144" height="144" fill="rgb(26,26,46)"/>`
       + `<text x="72" y="${y}" text-anchor="middle" font-family="${safeFont}" font-size="${size}" fill="${color}">${safeText}</text>`
       + `</svg>`;
}

export type DialTitleSettings = {
  titleFont?: string;
  titleSize?: number;
};

export function makeDialTitleImage(text: string, font: string, size: number, color = '#ffffff', width = 90, height = 40, bgColor = ''): string {
  const safeFont  = font.replace(/[<>&"]/g, '');
  const safeText  = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const safeColor = color.replace(/[<>&"]/g, '');
  const safeBg    = bgColor.replace(/[<>&"]/g, '');
  const cx        = Math.round(width / 2);
  const y         = Math.round(height * 0.65);
  const bg        = safeBg ? `<rect width="${width}" height="${height}" fill="${safeBg}"/>` : '';
  const svg       = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`
                  + bg
                  + `<text x="${cx}" y="${y}" text-anchor="middle" font-family="${safeFont}" font-size="${size}" fill="${safeColor}">${safeText}</text>`
                  + `</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export function makeValueImage(text: string, bgColor = '#000000', width = 200, height = 31): string {
  const safeBg   = bgColor.replace(/[<>&"]/g, '');
  const safeText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const bg  = safeBg ? `<rect width="${width}" height="${height}" fill="${safeBg}"/>` : '';
  const cx  = Math.round(width / 2);
  const y   = height - 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`
            + bg
            + `<text x="${cx}" y="${y}" text-anchor="middle" font-family="Arial" font-size="18" fill="white">${safeText}</text>`
            + `</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export function makeGaugeSvg(pct: number, gaugeFill: string, gaugeBg: string, centerFill = false, bgColor = '#000000', valueText = ''): string {
  const svgW = 200, svgH = 78, mx = 8;
  const W = svgW - 2 * mx; // 184
  const segH = 10, ptrH = 10, tickH = 5;
  const N = 20;

  // lay out from bottom up (same physical LCD positions as before)
  const ptrBase   = svgH - 2;                        // 76
  const ptrApexY  = ptrBase - ptrH;                  // 66
  const barBottom = ptrApexY + Math.round(ptrH / 2); // 71 (50% overlap)
  const barTop    = barBottom - segH;                 // 61
  const tickBot   = barTop - 3;                       // 58
  const tickTop   = tickBot - tickH;                  // 53

  let body = '';
  if (centerFill) {
    const ctr  = Math.round(W / 2);
    const edge = Math.round(pct / 100 * (W - 1));
    const lo = Math.min(ctr, edge), hi = Math.max(ctr, edge);
    body += `<rect x="${mx}" y="${barTop}" width="${W}" height="${segH}" fill="${gaugeBg}"/>`;
    body += `<rect x="${mx + lo}" y="${barTop}" width="${hi - lo}" height="${segH}" fill="${gaugeFill}"/>`;
  } else {
    const fillW = Math.round(pct / 100 * W);
    body += `<rect x="${mx}" y="${barTop}" width="${fillW}" height="${segH}" fill="${gaugeFill}"/>`;
    body += `<rect x="${mx + fillW}" y="${barTop}" width="${W - fillW}" height="${segH}" fill="${gaugeBg}"/>`;
  }

  for (let i = 1; i < N; i++) {
    const dx = Math.round(i / N * W);
    body += `<rect x="${mx + dx}" y="${barTop}" width="1" height="${segH}" fill="rgba(0,0,0,0.45)"/>`;
  }

  // tick marks above bar
  let extras = '';
  [0, 25, 50, 75, 100].forEach(t => {
    const tx = mx + Math.round(t / 100 * (W - 1));
    extras += `<line x1="${tx}" y1="${tickTop}" x2="${tx}" y2="${tickBot}" stroke="#666" stroke-width="1"/>`;
  });

  // pointer: apex overlaps bar by ~50%
  const px = mx + Math.round(pct / 100 * (W - 1));
  extras += `<polygon points="${px - 5},${ptrBase} ${px + 5},${ptrBase} ${px},${ptrApexY}" fill="white"/>`;

  // value text just above tick marks
  if (valueText) {
    const safeText = valueText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    extras += `<text x="${svgW / 2}" y="${tickTop - 2}" text-anchor="middle" font-family="Arial" font-size="18" fill="white">${safeText}</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}"><rect width="${svgW}" height="${svgH}" fill="${bgColor || '#000000'}"/>${body}${extras}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyLabel(keyAction: any, settings: LabelSettings, active?: boolean): void {
  const { label, labelFont = 'Arial', labelSize = 24 } = settings;
  if (!label) return;
  const b64 = Buffer.from(makeSvg(label, labelFont, labelSize, active)).toString('base64');
  keyAction.setImage(`data:image/svg+xml;base64,${b64}`);
}

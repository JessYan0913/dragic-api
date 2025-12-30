import sharp from 'sharp';

function randomInt(min: number, max: number) {
  if (max < min) return min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export type PuzzleOptions = {
  imgUrl: string;
  bgWidth?: number;
  bgHeight?: number;
  width?: number;
  height?: number;
  x?: number;
};

export type PuzzleResult = {
  bg: Buffer;
  puzzle: Buffer;
  x: number;
  y: number;
};

function computeDrawRect(origW: number, origH: number, targetW: number, targetH: number) {
  const scale = Math.min(targetW / origW, targetH / origH);
  const finalScale = Math.min(1, scale); // No upscale
  const dw = Math.round(origW * finalScale);
  const dh = Math.round(origH * finalScale);
  const dx = Math.round((targetW - dw) / 2);
  const dy = Math.round((targetH - dh) / 2);
  return { dx, dy, dw, dh, sx: 0, sy: 0, sw: origW, sh: origH };
}

function generatePuzzlePath(width: number, height: number, margin: number = 2): string {
  const r = 8; // 圆角半径
  const bump = 15; // 凸起/凹陷大小
  
  return `
    M ${margin} ${margin + r}
    Q ${margin} ${margin} ${margin + r} ${margin}
    L ${width/2 - bump/2} ${margin}
    Q ${width/2 - bump/4} ${margin - bump/3} ${width/2} ${margin - bump/2}
    Q ${width/2 + bump/4} ${margin - bump/3} ${width/2 + bump/2} ${margin}
    L ${width - margin - r} ${margin}
    Q ${width - margin} ${margin} ${width - margin} ${margin + r}
    L ${width - margin} ${height - margin - r}
    Q ${width - margin} ${height - margin} ${width - margin - r} ${height - margin}
    L ${width/2 + bump/2} ${height - margin}
    Q ${width/2 + bump/4} ${height + bump/3} ${width/2} ${height + bump/2}
    Q ${width/2 - bump/4} ${height + bump/3} ${width/2 - bump/2} ${height - margin}
    L ${margin + r} ${height - margin}
    Q ${margin} ${height - margin} ${margin} ${height - margin - r}
    Z
  `;
}

export async function createPuzzle(options: PuzzleOptions): Promise<PuzzleResult> {
  const { imgUrl, bgWidth = 360, bgHeight = 200, width = 60, height = 60, x: outX } = options;

  const maxOffsetX = bgWidth - width;
  let x = typeof outX === 'undefined' ? randomInt(width, Math.max(width, maxOffsetX)) : outX || 0;
  if (x < 0) x = 0;
  else if (x > maxOffsetX) x = maxOffsetX;

  const maxOffsetY = bgHeight - height;
  let y = randomInt(0, Math.max(0, maxOffsetY));

  // Load and process background image
  const image = sharp(imgUrl);
  const metadata = await image.metadata();
  
  // Resize image to fit background
  const { dx, dy, dw, dh } = computeDrawRect(
    metadata.width || bgWidth,
    metadata.height || bgHeight,
    bgWidth,
    bgHeight
  );

  // Create background with puzzle piece cut out
  const bgSvg = `
    <svg width="${bgWidth}" height="${bgHeight}">
      <defs>
        <mask id="puzzleMask">
          <rect width="100%" height="100%" fill="white"/>
          <path d="${generatePuzzlePath(width, height).replace(/M/g, `M ${x} ${y} l`)}" fill="black"/>
        </mask>
      </defs>
      <foreignObject width="${bgWidth}" height="${bgHeight}" mask="url(#puzzleMask)">
        <img src="data:image/jpeg;base64,${(await image.resize(dw, dh).toBuffer()).toString('base64')}" 
             style="position: absolute; left: ${dx}px; top: ${dy}px; width: ${dw}px; height: ${dh}px;"/>
      </foreignObject>
    </svg>
  `;

  // Create puzzle piece
  const puzzleSvg = `
    <svg width="${width}" height="${bgHeight}">
      <defs>
        <clipPath id="puzzleClip">
          <path d="${generatePuzzlePath(width, height)}"/>
        </clipPath>
      </defs>
      <g clip-path="url(#puzzleClip)">
        <rect x="${-x}" y="${-y}" width="${bgWidth}" height="${bgHeight}" 
              fill="url(#bgImage)" stroke="rgba(255,255,255,0.7)" stroke-width="1"/>
      </g>
      <defs>
        <pattern id="bgImage" x="0" y="0" width="100%" height="100%">
          <image href="data:image/jpeg;base64,${(await image.resize(dw, dh).toBuffer()).toString('base64')}" 
                 x="${dx}" y="${dy}" width="${dw}" height="${dh}"/>
        </pattern>
      </defs>
    </svg>
  `;

  const bgBuffer = Buffer.from(bgSvg);
  const puzzleBuffer = Buffer.from(puzzleSvg);

  return { bg: bgBuffer, puzzle: puzzleBuffer, x, y };
}
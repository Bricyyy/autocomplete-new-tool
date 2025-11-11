interface SvgMarkerOptions {
    color?: string;
    size?: number;
    stroke?: number;
    strokeColor?: string;
    shape?: 'circle' | 'square';
    label?: string;
}

const svgCache: { [key: string]: string } = {};

export function svgMarkerDataUrl({
    color = '#2563eb',
    size = 36,
    stroke = 2,
    strokeColor = '#ffffff',
    shape = 'circle',
    label = '',
}: SvgMarkerOptions = {}): string {
    const key = `${color}|${size}|${stroke}|${strokeColor}|${shape}|${label}`;
    if (svgCache[key]) return svgCache[key];

    const half = size / 2;
    let shapeSvg;
    if (shape === 'square') {
        const r = Math.max(4, Math.round(size * 0.12));
        shapeSvg = `<rect x="${stroke}" y="${stroke}" width="${size - stroke * 2}" height="${size - stroke * 2}" rx="${r}" ry="${r}" fill="${color}" stroke="${strokeColor}" stroke-width="${stroke}" />`;
    } else {
        shapeSvg = `<circle cx="${half}" cy="${half}" r="${half - stroke}" fill="${color}" stroke="${strokeColor}" stroke-width="${stroke}" />`;
    }

    let textSvg = '';
    if (label != null && String(label).length) {
        const fontSize = Math.max(10, Math.round(size * 0.5));
        const safeLabel = String(label).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        textSvg = `<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Inter, Roboto, Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff">${safeLabel}</text>`;
    }

    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>${shapeSvg}${textSvg}</svg>`;
    const dataUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    svgCache[key] = dataUrl;
    return dataUrl;
}

export function createMarkerIcon(state: 'insideRestr' | 'insideBias' | 'outside', label: string) {
    let color = '#6b7280', size = 28;
    if (state === 'insideRestr') {
        color = '#16a34a'; size = 34;
    } else if (state === 'insideBias') {
        color = '#f59e0b'; size = 34;
    }

    const url = svgMarkerDataUrl({ color, size, label });
    return {
        url,
        scaledSize: new google.maps.Size(size, size),
        anchor: new google.maps.Point(size / 2, size / 2),
    };
}

export function createOriginIcon() {
    return {
        url: svgMarkerDataUrl({ color: '#3b82f6', size: 36, stroke: 3 }),
        scaledSize: new google.maps.Size(36, 36),
        anchor: new google.maps.Point(18, 18),
    };
}

export function createCornerIcon(color: string = '#2563eb') {
    return {
        url: svgMarkerDataUrl({ color, size: 20, stroke: 2, shape: 'square' }),
        scaledSize: new google.maps.Size(20, 20),
        anchor: new google.maps.Point(10, 10),
    };
}
   
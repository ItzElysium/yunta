// Avatares dibujados (SVG) generados a partir de una semilla. Sin fotos reales.
(function () {
  const SKIN = ['#F3CFB1', '#E6B48E', '#D29A70', '#B87B52', '#9A623F', '#7A4B30'];
  const HAIR = ['#1E1512', '#2E1D14', '#4A2F1E', '#6B4428', '#1B1B22'];
  const GRAY = ['#B9B4AE', '#D4D0CA', '#9C9690'];
  const BG = ['#EADFF3', '#FBE7B5', '#D7EDE8', '#F7D9D2', '#DCE4F7', '#E9E3D5'];
  const SHIRT = ['#5A2A82', '#B0413E', '#1F6F78', '#C28A12', '#3B5BA5', '#2F7A4D', '#7A3E65', '#444055'];
  const INK = '#2A1E2F';

  function rng(seed) {
    let a = (seed * 2654435761) >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const f = c => Math.max(0, Math.min(255, Math.round(c * k)));
    return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(f).map(c => c.toString(16).padStart(2, '0')).join('');
  }

  // p: { seed, g: 'f'|'m'|'x', age }
  window.avatarSVG = function (p) {
    const r = rng(p.seed || 1);
    const g = p.g === 'x' ? (r() < .5 ? 'f' : 'm') : (p.g || 'x');
    const old = (p.age || 30) >= 55;
    const skin = pick(r, SKIN), skinD = shade(skin, .86);
    const hair = old ? pick(r, GRAY) : pick(r, HAIR);
    const bg = pick(r, BG), shirt = pick(r, SHIRT);
    const styles = g === 'f' ? ['long', 'bob', 'bun', 'curlyL', 'pony'] : (old ? ['bald', 'short', 'side'] : ['short', 'side', 'curly', 'buzz', 'quiff']);
    const style = pick(r, styles);
    const glasses = r() < (old ? .65 : .25);
    const beard = g === 'm' && r() < .35;
    const earring = g === 'f' && r() < .5;
    const smile = r();

    let back = '', front = '';
    switch (style) {
      case 'long': back = `<path d="M17 31c-2-13 4-20 15-20s17 7 15 20l2 19H15z" fill="${hair}"/>`;
        front = `<path d="M19.5 29c0-10 5-16 12.5-16s12.5 6 12.5 16c-5-1-10-5-12-10-2 5-8 9-13 10z" fill="${hair}"/>`; break;
      case 'bob': back = `<path d="M17.5 36c-3-15 3-23 14.5-23s17.5 8 14.5 23z" fill="${hair}"/>`;
        front = `<path d="M19.5 28c0-9 5.5-15 12.5-15s12.5 6 12.5 15c-6 0-14-2-18-7-2 3-4 6-7 7z" fill="${hair}"/>`; break;
      case 'bun': back = `<circle cx="32" cy="11.5" r="5.5" fill="${hair}"/>`;
        front = `<path d="M20 27c0-9 5-14 12-14s12 5 12 14c-3-4-7-6-12-6s-9 2-12 6z" fill="${hair}"/>`; break;
      case 'pony': back = `<path d="M43 20c6 2 8 9 6 18-1-6-4-9-7-10z" fill="${hair}"/>`;
        front = `<path d="M20 27c0-9 5-14 12-14s12 5 12 14c-4-3-8-5-13-5-4 0-8 2-11 5z" fill="${hair}"/>`; break;
      case 'curlyL': back = [[18, 26], [17, 34], [19, 42], [46, 26], [47, 34], [45, 42]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${hair}"/>`).join('');
        front = [[21, 20], [26, 15], [32, 13.5], [38, 15], [43, 20]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.2" fill="${hair}"/>`).join(''); break;
      case 'curly': front = [[21, 21], [25, 16], [31, 14], [37, 15], [42, 19], [44, 24]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.4" fill="${hair}"/>`).join(''); break;
      case 'short': front = `<path d="M20 26c0-9 5-14 12-14s12 5 12 14c-2-4-6-6-12-6s-10 2-12 6z" fill="${hair}"/>`; break;
      case 'side': front = `<path d="M20 27c-1-10 6-15 13-15 7 0 12 5 11 14-3-5-9-7-14-5-4 1-8 3-10 6z" fill="${hair}"/>`; break;
      case 'quiff': front = `<path d="M20 26c0-8 4-13 10-14 3-3 9-3 12 1 3 3 2 8 2 13-3-4-7-6-12-6s-10 2-12 6z" fill="${hair}"/>`; break;
      case 'buzz': front = `<path d="M21 24c1-7 5-11 11-11s10 4 11 11c-3-3-7-4-11-4s-8 1-11 4z" fill="${hair}" opacity=".9"/>`; break;
      case 'bald': front = `<path d="M19.6 31c-.3-4 .6-7 2.4-8.5V31zM44.4 31c.3-4-.6-7-2.4-8.5V31z" fill="${hair}"/>`; break;
    }
    const mouth = smile < .5 ? `<path d="M28.5 35.5q3.5 3 7 0" stroke="${INK}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`
      : smile < .8 ? `<path d="M28 35q4 4.5 8 0z" fill="#fff" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/>`
      : `<path d="M29 36h6" stroke="${INK}" stroke-width="1.5" stroke-linecap="round"/>`;
    const beardSvg = beard ? `<path d="M20.5 30c0 8 5 12.5 11.5 12.5S43.5 38 43.5 30c-1.5 3-3 4-5 4.3-1.5-1.6-4-2.3-6.5-2.3s-5 .7-6.5 2.3c-2-.3-3.5-1.3-5-4.3z" fill="${hair}"/>` : '';
    const glassesSvg = glasses ? `<g fill="none" stroke="${INK}" stroke-width="1.3"><circle cx="27" cy="29" r="3.6"/><circle cx="37" cy="29" r="3.6"/><path d="M30.6 29h2.8"/></g>` : '';
    const wrinkles = old ? `<path d="M23.5 32.5q1 1 2 0M38.5 32.5q1 1 2 0" stroke="${skinD}" stroke-width="1" fill="none"/>` : '';

    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="${bg}"/>
      <clipPath id="c${p.seed}"><circle cx="32" cy="32" r="32"/></clipPath>
      <g clip-path="url(#c${p.seed})">
        ${back}
        <path d="M9 66c0-13 10-20 23-20s23 7 23 20z" fill="${shirt}"/>
        <path d="M26.5 46.5l5.5 5 5.5-5" fill="none" stroke="${shade(shirt, .75)}" stroke-width="1.6"/>
        <rect x="27.5" y="37" width="9" height="10" rx="4" fill="${skinD}"/>
        <circle cx="20" cy="29.5" r="2.6" fill="${skinD}"/><circle cx="44" cy="29.5" r="2.6" fill="${skinD}"/>
        ${earring ? `<circle cx="20" cy="33" r="1.3" fill="#E2B33C"/><circle cx="44" cy="33" r="1.3" fill="#E2B33C"/>` : ''}
        <ellipse cx="32" cy="28.5" rx="12" ry="13.5" fill="${skin}"/>
        ${front}${beardSvg}
        <circle cx="27" cy="29" r="1.5" fill="${INK}"/><circle cx="37" cy="29" r="1.5" fill="${INK}"/>
        <path d="M25 25.3q2-1.2 4 0M35 25.3q2-1.2 4 0" stroke="${old ? hair : INK}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <circle cx="24.5" cy="33" r="2" fill="#E8826F" opacity=".25"/><circle cx="39.5" cy="33" r="2" fill="#E8826F" opacity=".25"/>
        <path d="M32 30.5v2.6h-1.2" stroke="${skinD}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        ${wrinkles}${mouth}${glassesSvg}
      </g></svg>`;
  };
})();

// Base64 encoded wood texture pattern
export const woodPattern = `data:image/svg+xml;base64,${btoa(`
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="woodgrain" patternUnits="userSpaceOnUse" width="100" height="100">
      <rect width="100" height="100" fill="#8B4513"/>
      <filter id='noise' x='0%' y='0%' width='100%' height='100%'>
        <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" result="noise"/>
        <feColorMatrix type="saturate" values="0.1" in="noise" result="noise2"/>
        <feBlend in="SourceGraphic" in2="noise2" mode="multiply"/>
      </filter>
      <rect width="100" height="100" filter="url(#noise)" opacity="0.1"/>
      <path d="M0 20 Q25 18, 50 20 T100 20" stroke="#A0522D" stroke-width="0.5" fill="none" opacity="0.3"/>
      <path d="M0 40 Q25 38, 50 40 T100 40" stroke="#A0522D" stroke-width="0.5" fill="none" opacity="0.3"/>
      <path d="M0 60 Q25 58, 50 60 T100 60" stroke="#A0522D" stroke-width="0.5" fill="none" opacity="0.3"/>
      <path d="M0 80 Q25 78, 50 80 T100 80" stroke="#A0522D" stroke-width="0.5" fill="none" opacity="0.3"/>
    </pattern>
  </defs>
  <rect width="100" height="100" fill="url(#woodgrain)"/>
</svg>
`)}`;

// Base64 encoded metallic pattern
export const metallicPattern = `data:image/svg+xml;base64,${btoa(`
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="metallic" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#B0BEC5;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#CFD8DC;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#B0BEC5;stop-opacity:1" />
    </linearGradient>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise"/>
      <feColorMatrix type="saturate" values="0" in="noise" result="noise2"/>
      <feBlend in="SourceGraphic" in2="noise2" mode="overlay"/>
    </filter>
  </defs>
  <rect width="100" height="100" fill="url(#metallic)" filter="url(#noise)"/>
</svg>
`)}`;

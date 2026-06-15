// icons.jsx — small inline SVG icon set, line-style 1.5 stroke
// All take { size = 16, ...rest } props.

const I = (path, vb = "0 0 24 24") => ({ size = 16, stroke = 1.5, ...rest } = {}) => (
  <svg width={size} height={size} viewBox={vb} fill="none"
       stroke="currentColor" strokeWidth={stroke}
       strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {path}
  </svg>
);

const Icon = {
  // brand / layout
  home:     I(<><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></>),
  search:   I(<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>),
  bell:     I(<><path d="M6 8a6 6 0 1 1 12 0c0 4 1.5 5 2 6H4c.5-1 2-2 2-6Z"/><path d="M10 18a2 2 0 0 0 4 0"/></>),
  settings: I(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8L4.2 7a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></>),
  menu:     I(<><path d="M4 6h16M4 12h16M4 18h16"/></>),
  collapse: I(<><path d="M9 4v16M14 9l-3 3 3 3"/><rect x="3" y="3" width="18" height="18" rx="2"/></>),
  expand:   I(<><path d="M15 4v16M10 9l3 3-3 3"/><rect x="3" y="3" width="18" height="18" rx="2"/></>),
  arrow:    I(<><path d="M5 12h14M13 6l6 6-6 6"/></>),
  chevron:  I(<><path d="m9 6 6 6-6 6"/></>),
  external: I(<><path d="M14 4h6v6"/><path d="m20 4-9 9"/><path d="M20 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5"/></>),
  close:    I(<><path d="M18 6 6 18M6 6l12 12"/></>),
  refresh:  I(<><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></>),
  filter:   I(<><path d="M3 5h18M6 12h12M10 19h4"/></>),
  fullscreen: I(<><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></>),
  more:     I(<><circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/></>),
  download: I(<><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></>),

  // domain
  approve:  I(<><path d="M9 11l3 3 7-7"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/></>),
  transfer: I(<><path d="M3 8h14M14 4l4 4-4 4"/><path d="M21 16H7M10 12l-4 4 4 4"/></>),
  shield:   I(<><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z"/><path d="m9 12 2 2 4-4"/></>),
  flag:     I(<><path d="M4 21V4"/><path d="M4 4h12l-2 4 2 4H4"/></>),
  user:     I(<><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></>),
  users:    I(<><circle cx="9" cy="9" r="3.5"/><path d="M2.5 19c1-3 3.5-5 6.5-5s5.5 2 6.5 5"/><circle cx="17" cy="7" r="3"/><path d="M16 13c2.5 0 5 1.5 5.5 4"/></>),
  chart:    I(<><path d="M4 4v16h16"/><path d="m7 14 3-3 3 3 4-6"/></>),
  pieChart: I(<><path d="M12 3a9 9 0 1 0 9 9h-9Z"/><path d="M14 3a7 7 0 0 1 7 7"/></>),
  ban:      I(<><circle cx="12" cy="12" r="9"/><path d="m6 6 12 12"/></>),
  pulse:    I(<><path d="M3 12h4l3-7 4 14 3-7h4"/></>),
  building: I(<><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 8h2M9 12h2M9 16h2M14 8h2M14 12h2M14 16h2"/></>),
  wallet:   I(<><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><circle cx="16" cy="14" r="1.3" fill="currentColor"/></>),
  key:      I(<><circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M15 4l3 3M19 8l2 2"/></>),
  lock:     I(<><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 1 1 8 0v3"/></>),
  globe:    I(<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></>),
  type:     I(<><path d="M4 7V5h16v2"/><path d="M9 19h6M12 5v14"/></>),
  sun:      I(<><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></>),
  moon:     I(<><path d="M21 13A9 9 0 0 1 11 3a8 8 0 1 0 10 10Z"/></>),
  warning:  I(<><path d="M12 3 2 21h20Z"/><path d="M12 10v5M12 18v.5"/></>),
  info:     I(<><circle cx="12" cy="12" r="9"/><path d="M12 8v.5M12 11v6"/></>),
  check:    I(<><path d="M5 13l4 4L19 7"/></>),
  trend:    I(<><path d="M3 17 9 11l4 4 8-9"/><path d="M14 6h7v7"/></>),
  trendDown:I(<><path d="M3 7 9 13l4-4 8 9"/><path d="M14 18h7v-7"/></>),
  clock:    I(<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>),
  logout:   I(<><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></>),
  plus:     I(<><path d="M12 5v14M5 12h14"/></>),
  eye:      I(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>),
  eyeOff:   I(<><path d="M3 3l18 18"/><path d="M10.6 6.2A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-3.4 4.3M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7c1.8 0 3.4-.5 4.7-1.2"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></>),

  // additional
  bank:     I(<><path d="M3 10 12 4l9 6"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8"/><path d="M3 20h18"/></>),
  doc:      I(<><path d="M6 3h8l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v5h5"/><path d="M8 13h8M8 17h5"/></>),
  support:  I(<><circle cx="12" cy="12" r="9"/><path d="M9 9.5a3 3 0 0 1 5.7 1.5c0 1.5-2 2-2.7 2.5"/><path d="M12 17v.5"/></>),
  hr:       I(<><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/><path d="m18 4 1 1.5L20.5 6 19 7l-1 1.5L17 7l-1.5-1L17 5l1-1Z" fill="currentColor" stroke="none"/></>),
  process:  I(<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><path d="M10 6.5H14M6.5 10v4M14 17.5h-4M17.5 14v-4"/></>),
  fx:       I(<><circle cx="12" cy="12" r="9"/><path d="M8 10l3-3M11 7v3H8M16 14l-3 3M13 17v-3h3"/></>),
  chevDown: I(<><path d="m6 9 6 6 6-6"/></>),
};

window.Icon = Icon;

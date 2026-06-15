/* Epay — App: routing + theme + tweaks */
const { useState: useA, useEffect: useEffA } = React;

const FONT_PAIRS = {
  warm: { label: 'Bricolage · Hanken', display: "'Bricolage Grotesque'", body: "'Hanken Grotesk'" },
  geometric: { label: 'Sora · Manrope', display: "'Sora'", body: "'Manrope'" },
  editorial: { label: 'Space Grotesk · Manrope', display: "'Space Grotesk'", body: "'Manrope'" },
};
const DENSITY = { compact: { pad: 16, h: 64 }, regular: { pad: 22, h: 72 }, comfy: { pad: 28, h: 80 } };

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "brand": "#0C5C4E",
  "accent": "#E8853B",
  "radius": 20,
  "font": "warm",
  "density": "regular",
  "dark": false
}/*EDITMODE-END*/;

function darken(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) - amt, g = ((n >> 8) & 255) - amt, b = (n & 255) - amt;
  r = Math.max(0, r); g = Math.max(0, g); b = Math.max(0, b);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [authed, setAuthed] = useA(false);
  const [route, setRoute] = useA('home');
  const [prefill, setPrefill] = useA(null);
  const [draft, setDraft] = useA(null);
  const [result, setResult] = useA(null);
  const [selTx, setSelTx] = useA(null);
  const [lang, setLang] = useA('TR');
  const [textSize, setTextSize] = useA('m');

  const theme = t.dark ? 'dark' : 'light';

  // apply theme + tweaks to :root
  useEffA(() => {
    const r = document.documentElement;
    r.setAttribute('data-theme', theme);
    if (!t.dark) {
      r.style.setProperty('--brand', t.brand);
      r.style.setProperty('--brand-600', t.brand);
      r.style.setProperty('--brand-700', darken(t.brand, 22));
      r.style.setProperty('--brand-500', darken(t.brand, -26));
      r.style.setProperty('--accent', t.accent);
      r.style.setProperty('--accent-600', darken(t.accent, 20));
    } else {
      ['--brand','--brand-600','--brand-700','--brand-500','--accent','--accent-600'].forEach(k => r.style.removeProperty(k));
    }
    const rad = t.radius;
    r.style.setProperty('--r-lg', rad + 'px');
    r.style.setProperty('--r-xl', (rad + 8) + 'px');
    r.style.setProperty('--r-md', Math.max(8, rad - 6) + 'px');
    const fp = FONT_PAIRS[t.font] || FONT_PAIRS.warm;
    r.style.setProperty('--font-display', fp.display + ', system-ui, sans-serif');
    r.style.setProperty('--font-body', fp.body + ', system-ui, sans-serif');
  }, [t.dark, t.brand, t.accent, t.radius, t.font, theme]);

  // text size
  useEffA(() => {
    const map = { s: 15, m: 16, l: 17.5, xl: 19 };
    document.documentElement.style.fontSize = (map[textSize] || 16) + 'px';
  }, [textSize]);

  function go(r) {
    if (!['domestic', 'intl'].includes(r)) setPrefill(null);
    setRoute(r); window.scrollTo(0, 0);
  }
  function startSend(recip) { setPrefill(recip); setRoute(recip.intl ? 'intl' : 'domestic'); window.scrollTo(0, 0); }
  function review(d) { setDraft(d); setRoute('confirm'); window.scrollTo(0, 0); }
  function approve(res) { setResult(res); setRoute('success'); window.scrollTo(0, 0); }

  if (!authed) return (<><LoginScreen onLogin={() => { setAuthed(true); setRoute('home'); }} /><TweaksUI t={t} setTweak={setTweak} /></>);

  let screen;
  switch (route) {
    case 'home': screen = <HomeScreen go={go} openTx={setSelTx} />; break;
    case 'activity': screen = <ActivityScreen openTx={setSelTx} />; break;
    case 'topup': screen = <LoadMoneyScreen />; break;
    case 'send': screen = <SendHub go={go} />; break;
    case 'recipients': screen = <RecipientsScreen go={go} startSend={startSend} />; break;
    case 'domestic': screen = <DomesticForm prefill={prefill} onReview={review} />; break;
    case 'intl': screen = <IntlForm prefill={prefill} onReview={review} />; break;
    case 'receive': screen = <ReceiveScreen onReview={review} />; break;
    case 'complaint': screen = <ComplaintScreen />; break;
    case 'settings': screen = <SettingsScreen theme={theme} toggleTheme={() => setTweak('dark', !t.dark)} lang={lang} setLang={setLang} textSize={textSize} setTextSize={setTextSize} />; break;
    case 'confirm': screen = <ConfirmScreen draft={draft} onApprove={approve} onCancel={() => go('home')} onEdit={() => go(draft.kind === 'intl' ? 'intl' : draft.kind === 'receive' ? 'receive' : 'domestic')} />; break;
    case 'success': screen = <SuccessScreen result={result} go={go} />; break;
    default: screen = <HomeScreen go={go} openTx={setSelTx} />;
  }

  const hideHeader = ['confirm'].includes(route);

  return (
    <div className="app">
      {!hideHeader && <Header route={route} go={go} theme={theme} toggleTheme={() => setTweak('dark', !t.dark)} lang={lang} setLang={setLang} />}
      <main>{screen}</main>
      {selTx && <TxDetailModal tx={selTx} onClose={() => setSelTx(null)} />}
      <TweaksUI t={t} setTweak={setTweak} />
    </div>
  );
}

function TweaksUI({ t, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Marka" />
      <TweakColor label="Ana renk" value={t.brand} options={['#0C5C4E', '#0E4C7A', '#5B3FA0', '#1F7A4D', '#B23A48']} onChange={v => setTweak('brand', v)} />
      <TweakColor label="Vurgu rengi" value={t.accent} options={['#E8853B', '#E2574C', '#3E8EDE', '#D9A21B', '#11796A']} onChange={v => setTweak('accent', v)} />
      <TweakSection label="Biçim" />
      <TweakSlider label="Köşe yuvarlaklığı" value={t.radius} min={6} max={28} step={2} unit="px" onChange={v => setTweak('radius', v)} />
      <TweakSelect label="Yazı tipi" value={t.font} options={Object.keys(FONT_PAIRS).map(k => ({ value: k, label: FONT_PAIRS[k].label }))} onChange={v => setTweak('font', v)} />
      <TweakSection label="Tema" />
      <TweakToggle label="Koyu tema" value={t.dark} onChange={v => setTweak('dark', v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

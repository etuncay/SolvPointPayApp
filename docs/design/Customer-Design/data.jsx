/* Epay Müşteri — mock data (Türkçe, gerçekçi) */
const DATA = (function () {
  const customer = {
    name: 'Elif Demir',
    no: 'CUS-4827193',
    type: 'individual', // individual | corporate
    initials: 'ED',
    welcome: 'Mavi Vapur 1987', // phishing önlemi karşılama mesajı
    email: 'elif.demir@ornek.com',
    phone: '+90 532 •• •• 047',
    lastLogin: '31 May 2026, 21:14',
    failedAttempt: { when: '31 May 2026, 03:42', ip: '88.241.xx.xx', city: 'Bilinmeyen konum' },
  };

  const wallets = [
    { id: 'w1', type: 'CustomerPersistent', label: 'Ana Cüzdan', no: 'TR-WLT-7741', currency: 'TRY', symbol: '₺', balance: 48250.75, editable: true, accent: 'var(--brand)' },
    { id: 'w2', type: 'CustomerPersistent', label: 'Döviz Cüzdanı', no: 'TR-WLT-7742', currency: 'USD', symbol: '$', balance: 3120.40, editable: true, accent: '#2B6CB0' },
    { id: 'w3', type: 'CustomerPersistent', label: 'Euro Cüzdanı', no: 'TR-WLT-7743', currency: 'EUR', symbol: '€', balance: 1840.00, editable: true, accent: '#6B46C1' },
    { id: 'w4', type: 'CustomerTransactional', label: 'Geçiş Hesabı', no: 'TR-WLT-9920', currency: 'TRY', symbol: '₺', balance: 0.00, editable: false, accent: 'var(--muted)' },
  ];

  const ibans = [
    { id: 'ib1', iban: 'TR42 0006 2000 1234 0000 5577 41', bank: 'Garanti BBVA', currency: 'TRY', wallet: 'w1', walletNo: 'TR-WLT-7741' },
    { id: 'ib2', iban: 'TR19 0001 0000 9988 0000 4412 03', bank: 'İş Bankası', currency: 'USD', wallet: 'w2', walletNo: 'TR-WLT-7742' },
  ];

  // transaction_status: Pending | Sent | Completed | ErrorSend | ErrorReceive
  const tx = [
    { id: 'TRX-250531-0098', date: '31.05.2026 18:42', dir: 'out', type: 'Yurt İçi Transfer', cp: 'Burak Yıldız', cpNo: 'CUS-3310947', acct: 'TR-WLT-2210', iban: '—', ref: 'REF-9F2A7C', cur: 'TRY', sym: '₺', amount: 2500, after: 48250.75, status: 'Completed', desc: 'Kira ödemesi', purpose: 'Kira' },
    { id: 'TRX-250531-0071', date: '31.05.2026 12:05', dir: 'in', type: 'Para Girişi', cp: 'ACME Yazılım A.Ş.', cpNo: 'CUS-1100023', acct: 'TR-WLT-4521', iban: 'TR42 •• 5577 41', ref: 'REF-7C13D9', cur: 'TRY', sym: '₺', amount: 18000, after: 50750.75, status: 'Completed', desc: 'Mayıs maaş', purpose: 'Maaş' },
    { id: 'TRX-250530-0442', date: '30.05.2026 16:20', dir: 'out', type: 'Yurt Dışı Transfer', cp: 'Ahmed Al-Rashid', cpNo: '—', acct: '—', iban: 'AE07 •• 4471', ref: 'REF-3K88M1', cur: 'USD', sym: '$', amount: 600, after: 3120.40, status: 'Sent', desc: 'Aile desteği', purpose: 'Aile Desteği', country: 'BAE', fx: '1 USD = 32.84 TRY' },
    { id: 'TRX-250530-0310', date: '30.05.2026 09:11', dir: 'out', type: 'Yurt İçi Transfer', cp: 'Zeynep Kaya', cpNo: 'CUS-7782214', acct: 'TR-WLT-8890', iban: '—', ref: 'REF-1A0B22', cur: 'TRY', sym: '₺', amount: 450, after: 50750.75, status: 'Completed', desc: 'Doğum günü', purpose: 'Hediye' },
    { id: 'TRX-250529-0205', date: '29.05.2026 20:55', dir: 'in', type: 'Para Girişi (IBAN)', cp: 'Elif Demir', cpNo: 'CUS-4827193', acct: 'TR-WLT-7741', iban: 'TR42 •• 5577 41', ref: 'REF-55ZQ09', cur: 'TRY', sym: '₺', amount: 10000, after: 51200.75, status: 'Completed', desc: 'Banka havalesi — bakiye yükleme', purpose: 'Yükleme' },
    { id: 'TRX-250528-0166', date: '28.05.2026 14:30', dir: 'out', type: 'Yurt Dışı Transfer', cp: 'Maria Schmidt', cpNo: '—', acct: '—', iban: 'DE89 •• 0032', ref: 'REF-9X4P77', cur: 'EUR', sym: '€', amount: 320, after: 1840.00, status: 'Pending', desc: 'Online sipariş', purpose: 'Ticari Ödeme', country: 'Almanya', fx: '1 EUR = 35.60 TRY' },
    { id: 'TRX-250527-0021', date: '27.05.2026 11:02', dir: 'out', type: 'Yurt İçi Transfer', cp: 'Mehmet Şahin', cpNo: 'CUS-2244119', acct: 'TR-WLT-5512', iban: '—', ref: 'REF-K2L9P0', cur: 'TRY', sym: '₺', amount: 1200, after: 51650.75, status: 'Completed', desc: 'Borç ödeme', purpose: 'Diğer' },
    { id: 'TRX-250526-0533', date: '26.05.2026 17:45', dir: 'out', type: 'Yurt Dışı Transfer', cp: 'John Carter', cpNo: '—', acct: '—', iban: 'GB29 •• 1991', ref: 'REF-77BV2A', cur: 'USD', sym: '$', amount: 150, after: 3720.40, status: 'ErrorReceive', desc: 'Partner reddi — tekrar denenecek', purpose: 'Aile Desteği', country: 'İngiltere', fx: '1 USD = 32.80 TRY' },
  ];

  const recipients = [
    { id: 'r1', label: 'Burak — Kardeşim', name: 'Burak Yıldız', country: 'Türkiye', intl: false, phone: '+90 533 •• •• 218', email: 'burak.y@ornek.com', cusNo: 'CUS-3310947', purpose: 'Aile Desteği', desc: '' },
    { id: 'r2', label: 'Ahmed (Dubai)', name: 'Ahmed Al-Rashid', country: 'BAE', intl: true, phone: '+971 50 •• •• 11', email: 'ahmed.r@ornek.ae', cusNo: '', purpose: 'Aile Desteği', desc: 'Aylık destek' },
    { id: 'r3', label: 'Zeynep', name: 'Zeynep Kaya', country: 'Türkiye', intl: false, phone: '+90 542 •• •• 90', email: '', cusNo: 'CUS-7782214', purpose: 'Hediye', desc: '' },
    { id: 'r4', label: 'Maria — Tedarikçi', name: 'Maria Schmidt', country: 'Almanya', intl: true, phone: '', email: 'maria@schmidt-gmbh.de', cusNo: '', purpose: 'Ticari Ödeme', desc: 'GmbH faturaları' },
  ];

  const currencies = [
    { code: 'TRY', sym: '₺', name: 'Türk Lirası' },
    { code: 'USD', sym: '$', name: 'ABD Doları' },
    { code: 'EUR', sym: '€', name: 'Euro' },
    { code: 'GBP', sym: '£', name: 'İngiliz Sterlini' },
  ];

  const purposes = ['Aile Desteği', 'Kira', 'Maaş', 'Hediye', 'Ticari Ödeme', 'Eğitim', 'Sağlık', 'Diğer'];
  const countries = ['Türkiye', 'Almanya', 'BAE', 'İngiltere', 'ABD', 'Hollanda', 'Fransa', 'Suudi Arabistan'];
  const complaintTypes = ['Şikâyet', 'Öneri', 'Dilek / Talep', 'Bilgi Talebi', 'Teknik Sorun'];

  const fxRates = { 'USD>TRY': 32.84, 'EUR>TRY': 35.60, 'TRY>USD': 0.0304, 'TRY>EUR': 0.0281, 'USD>EUR': 0.922, 'EUR>USD': 1.085, 'GBP>TRY': 41.50 };

  const fees = [
    { range: '0 – 5.000', fixed: '0 ₺', rate: '%0,25', cur: 'TRY', campaign: '30.06.2026' },
    { range: '5.001 – 25.000', fixed: '5 ₺', rate: '%0,20', cur: 'TRY', campaign: '30.06.2026' },
    { range: '25.001 +', fixed: '15 ₺', rate: '%0,15', cur: 'TRY', campaign: '—' },
  ];

  function fmt(n, sym) {
    const s = Number(n).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (sym || '') + s;
  }

  return { customer, wallets, ibans, tx, recipients, currencies, purposes, countries, complaintTypes, fxRates, fees, fmt };
})();
window.DATA = DATA;

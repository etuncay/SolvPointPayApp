/** Dekont etiket yerelleştirme tablosu — kaynak: docs/Sablonlar/dekont-sablonu.md §5. */
export type ReceiptLang = 'tr' | 'en' | 'ar';

export type ReceiptLabels = Record<string, string>;

const TR: ReceiptLabels = {
  payment_receipt: 'ÖDEME DEKONTU',
  date_time: 'TARİH & SAAT',
  receipt_no: 'DEKONT NO',
  partner_ref_no: 'PARTNER REF. NO',
  sending_point: 'İŞLEM NOKTASI',
  receiver_information: 'ALICI BİLGİLERİ',
  sender_information: 'GÖNDEREN BİLGİLERİ',
  full_name: 'AD SOYAD / UNVAN',
  identity_no: 'KİMLİK NO',
  tel: 'TELEFON',
  address: 'ADRES',
  payment_information: 'ÖDEME BİLGİLERİ',
  country: 'ÜLKE',
  city: 'ŞEHİR',
  payment_amount: 'ÖDEME TUTARI',
  currency: 'PARA BİRİMİ',
  transaction_details: 'İŞLEM VE TUTARLAR',
  transaction_type: 'İŞLEM TÜRÜ',
  payment_purpose: 'ÖDEME TÜRÜ',
  iban: 'IBAN',
  fixed_fee: 'SABİT ÜCRET',
  proportional_fee: 'ORANSAL ÜCRET',
  total_fee: 'TOPLAM ÜCRET',
  total_paid: 'ÖDENECEK TOPLAM TUTAR',
  exchange_rate: 'DÖVİZ KURU',
  target_currency: 'HEDEF PARA BİRİMİ',
  net_amount: 'ALICININ ALACAĞI NET TUTAR',
  description: 'AÇIKLAMA',
  legal_heading: 'TİCARİ ELEKTRONİK İLETİLER VE KİŞİSEL VERİLERİN KORUNMASI',
  agent_signature: 'TEMSİLCİ İMZASI',
  customer_signature: 'MÜŞTERİ İMZASI',
};

const EN: ReceiptLabels = {
  payment_receipt: 'PAYMENT RECEIPT',
  date_time: 'DATE & TIME',
  receipt_no: 'RECEIPT NO',
  partner_ref_no: 'PARTNER REF. NO',
  sending_point: 'SENDING POINT NAME',
  receiver_information: 'RECEIVER INFORMATION',
  sender_information: 'SENDER INFORMATION',
  full_name: 'FULL NAME',
  identity_no: 'IDENTITY NO',
  tel: 'TEL',
  address: 'ADDRESS',
  payment_information: 'PAYMENT INFORMATION',
  country: 'COUNTRY',
  city: 'CITY',
  payment_amount: 'PAYMENT AMOUNT',
  currency: 'CURRENCY',
  transaction_details: 'TRANSACTION DETAILS',
  transaction_type: 'TRANSACTION TYPE',
  payment_purpose: 'PAYMENT PURPOSE',
  iban: 'IBAN',
  fixed_fee: 'FIXED FEE',
  proportional_fee: 'PROPORTIONAL FEE',
  total_fee: 'TOTAL FEE',
  total_paid: 'TOTAL PAID',
  exchange_rate: 'EXCHANGE RATE',
  target_currency: 'TARGET CURRENCY',
  net_amount: 'NET AMOUNT',
  description: 'DESCRIPTION',
  legal_heading: 'COMMERCIAL ELECTRONIC MESSAGES AND PROTECTION OF PERSONAL DATA',
  agent_signature: 'AGENT SIGNATURE',
  customer_signature: 'CUSTOMER SIGNATURE',
};

const AR: ReceiptLabels = {
  payment_receipt: 'إيصال الدفع',
  date_time: 'التاريخ والوقت',
  receipt_no: 'رقم الإيصال',
  partner_ref_no: 'رقم مرجع الشريك',
  sending_point: 'نقطة الإرسال',
  receiver_information: 'معلومات المستلم',
  sender_information: 'معلومات المرسل',
  full_name: 'الاسم الكامل',
  identity_no: 'رقم الهوية',
  tel: 'الهاتف',
  address: 'العنوان',
  payment_information: 'معلومات الدفع',
  country: 'الدولة',
  city: 'المدينة',
  payment_amount: 'مبلغ الدفع',
  currency: 'العملة',
  transaction_details: 'تفاصيل المعاملة',
  transaction_type: 'نوع المعاملة',
  payment_purpose: 'غرض الدفع',
  iban: 'الآيبان',
  fixed_fee: 'الرسوم الثابتة',
  proportional_fee: 'الرسوم النسبية',
  total_fee: 'إجمالي الرسوم',
  total_paid: 'المبلغ الإجمالي المدفوع',
  exchange_rate: 'سعر الصرف',
  target_currency: 'العملة المستهدفة',
  net_amount: 'المبلغ الصافي',
  description: 'الوصف',
  legal_heading: 'الرسائل الإلكترونية التجارية وحماية البيانات الشخصية',
  agent_signature: 'توقيع الوكيل',
  customer_signature: 'توقيع العميل',
};

export function receiptLabels(lang: ReceiptLang): ReceiptLabels {
  if (lang === 'en') return EN;
  if (lang === 'ar') return AR;
  return TR;
}

const LEGAL: Record<ReceiptLang, string> = {
  tr: 'İşbu dekont kapsamındaki kişisel verileriniz 6698 sayılı KVKK uyarınca işlenmekte; ticari elektronik ileti gönderimi ve yurt dışına veri aktarımı için açık rızanız esas alınmaktadır. Detaylar QR koddaki versiyonlu sözleşme metnindedir.',
  en: 'Your personal data within this receipt is processed under applicable data protection law; your explicit consent is the basis for commercial electronic messages and cross-border data transfer. See the versioned agreement via the QR code.',
  ar: 'تتم معالجة بياناتك الشخصية الواردة في هذا الإيصال وفقًا لقانون حماية البيانات المعمول به؛ وتستند الرسائل الإلكترونية التجارية ونقل البيانات عبر الحدود إلى موافقتك الصريحة. راجع الاتفاقية عبر رمز الاستجابة السريعة.',
};

export function receiptLegalText(lang: ReceiptLang): string {
  return LEGAL[lang];
}

const TX_TYPES: Record<ReceiptLang, Record<string, string>> = {
  tr: {
    WalletWithdrawal: 'Cüzdandan Para Çekme',
    WalletToBankAccount: 'Banka Hesabına',
    WalletToPerson: 'Kişiye Transfer',
    InternationalTransfer: 'Uluslararası Transfer',
    WalletTopUp: 'Cüzdan Yükleme',
    WalletDeposit: 'Para Yatırma',
    InternalTransfer: 'Dahili Transfer',
  },
  en: {
    WalletWithdrawal: 'Wallet withdrawal',
    WalletToBankAccount: 'Wallet to bank',
    WalletToPerson: 'Transfer to person',
    InternationalTransfer: 'International transfer',
    WalletTopUp: 'Wallet top-up',
    WalletDeposit: 'Deposit',
    InternalTransfer: 'Internal transfer',
  },
  ar: {
    WalletWithdrawal: 'سحب من المحفظة',
    WalletToBankAccount: 'إلى حساب بنكي',
    WalletToPerson: 'تحويل إلى شخص',
    InternationalTransfer: 'تحويل دولي',
    WalletTopUp: 'شحن المحفظة',
    WalletDeposit: 'إيداع',
    InternalTransfer: 'تحويل داخلي',
  },
};

/** İşlem türü enum'unu dekont diline göre yerelleştirir; eşleşme yoksa ham değeri döner. */
export function receiptTxType(lang: ReceiptLang, type: string): string {
  return TX_TYPES[lang][type] ?? type;
}

import { useTranslation } from 'react-i18next';
import { PageHead } from '@epay/ui';

/** Henüz implemente edilmemiş Agent ekranları için yer tutucu */
export function StubPage({
  titleKey,
  docRef,
}: {
  titleKey: string;
  /** docs/Agent dosya referansı (ör. 2.hesaplarim.md) */
  docRef?: string;
}) {
  const { t } = useTranslation();

  return (
    <PageHead
      title={t(titleKey)}
      subtitle={
        docRef
          ? t('ag_stub_subtitle_with_doc', { doc: docRef })
          : t('ag_stub_subtitle')
      }
    />
  );
}

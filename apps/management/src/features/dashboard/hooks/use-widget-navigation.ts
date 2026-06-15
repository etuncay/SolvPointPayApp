import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { WidgetCode } from '../domain/types';
import { WIDGET_LINKS } from '../domain/types';

export function useWidgetNavigation() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const goToWidget = (code: WidgetCode) => {
    const link = WIDGET_LINKS[code];
    if (link.soon) {
      toast.info(t('coming_soon'));
      return;
    }
    navigate(link.href);
  };

  const goToRow = (code: WidgetCode, id: string) => {
    const link = WIDGET_LINKS[code];
    if (link.soon) {
      toast.info(t('coming_soon'));
      return;
    }
    const href = link.rowHref?.(id) ?? link.href;
    navigate(href);
  };

  return { goToWidget, goToRow };
}

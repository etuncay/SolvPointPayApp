import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, ChevronRight, Plus, User } from 'lucide-react';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@epay/ui';

export function TypePickerModal({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (kind: 'individual' | 'corporate' | 'prospective') => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('tp_title')}</DialogTitle>
          <p>{t('tp_desc')}</p>
        </DialogHeader>
        <DialogBody>
          <button type="button" className="type-card" onClick={() => onPick('individual')}>
            <div className="ic indv">
              <User size={20} />
            </div>
            <div>
              <b>{t('tp_indv_t')}</b>
              <span className="desc">{t('tp_indv_d')}</span>
            </div>
            <ChevronRight size={14} className="arr" />
          </button>
          <button type="button" className="type-card" onClick={() => onPick('corporate')}>
            <div className="ic corp">
              <Building2 size={20} />
            </div>
            <div>
              <b>{t('tp_corp_t')}</b>
              <span className="desc">{t('tp_corp_d')}</span>
            </div>
            <ChevronRight size={14} className="arr" />
          </button>
          <button type="button" className="type-card" onClick={() => onPick('prospective')}>
            <div className="ic indv" style={{ background: 'var(--bg-sunken)', color: 'var(--fg-soft)' }}>
              <Plus size={20} />
            </div>
            <div>
              <b>{t('tp_pros_t')}</b>
              <span className="desc">{t('tp_pros_d')}</span>
            </div>
            <ChevronRight size={14} className="arr" />
          </button>
        </DialogBody>
        <DialogFooter>Esc · {t('lf_cancel_back')}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  History,
  Landmark,
  Lock,
  MessageSquarePlus,
  Receipt,
  Save,
  Wallet,
} from 'lucide-react';
import { Button, DynamicForm, FormMode, type CustomFunctions } from '@epay/ui';
import { fmtNumber } from '@/lib/format';
import { BalanceBlockModal } from './components/balance-block-modal';
import { WalletNoteModal } from './components/wallet-note-modal';
import { LIMIT_GROUPS, LIMIT_TYPES, type LimitGroup, type WalletLimitSet } from './domain/detail-types';
import { useWalletDetail } from './hooks/use-wallet-detail';
import { buildWalletDetailFormConfig } from './wallet-detail-form-config';
import { walletDetailToFormValues } from './domain/detail-to-form-values';
import { WalletLimitHistoryField } from './components/wallet-limit-history-field';

export function WalletDetailPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();
  const { detail, permissions, limitHistory, notFound, persistLimits, applyBalanceBlock, addNote } =
    useWalletDetail();

  const [limitDraft, setLimitDraft] = useState<WalletLimitSet | null>(null);
  const [blockOpen, setBlockOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  useEffect(() => {
    if (detail) setLimitDraft(structuredClone(detail.limits));
  }, [detail]);

  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const canEditLimits = !!detail && permissions.editLimits && !detail.isSystemWallet;

  const formConfig = useMemo(
    () => buildWalletDetailFormConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const customFunctions: CustomFunctions = useMemo(
    () => ({
      components: {
        WalletLimitHistory: (props) => (
          <WalletLimitHistoryField {...props} componentProps={{ rows: limitHistory }} />
        ),
      },
      onFieldChange: (name, value, allValues) => {
        // Limit alanları flat tutuluyor → WalletLimitSet draft'a senkronla
        const prefix = name.slice(0, 2);
        if (!['w_', 't_', 'i_'].includes(prefix)) return;
        const group: LimitGroup =
          prefix === 'w_' ? 'Withdrawal' : prefix === 't_' ? 'Transfer' : 'International';
        const typeKey = name.slice(2) as (typeof LIMIT_TYPES)[number];
        const n = Number(value ?? 0);
        setLimitDraft((prev) => {
          if (!prev) return prev;
          return { ...prev, [group]: { ...prev[group], [typeKey]: n } };
        });
        void allValues;
      },
    }),
    [limitHistory],
  );

  const initialValues = useMemo(
    () => (detail && limitDraft ? walletDetailToFormValues(detail, lang, translate, canEditLimits) : null),
    [detail, limitDraft, lang, translate, canEditLimits],
  );

  if (notFound) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <h3>{t('wd_not_found_title')}</h3>
        <p className="t-mute">{t('wd_not_found_sub')}</p>
        <Button type="button" onClick={() => navigate('/wallets')} style={{ marginTop: 16 }}>
          {t('wd_back_list')}
        </Button>
      </div>
    );
  }

  if (!detail || !limitDraft || !initialValues) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <p className="t-mute">…</p>
      </div>
    );
  }

  const saveLimits = () => {
    if (!detail) return;
    const result = persistLimits(limitDraft, detail.limits);
    if (!result.ok) {
      toast.error(t(result.error ?? 'dr_save_failed'));
      return;
    }
    if (result.direct) {
      toast.success(t('wd_limits_saved'));
      return;
    }
    toast.success(t('if_sent_to_approval'));
    navigate('/approvals');
  };

  const handleBlock = (input: Parameters<typeof applyBalanceBlock>[0]) => {
    const result = applyBalanceBlock(input);
    if (!result.ok) {
      toast.error(t(result.error ?? 'dr_save_failed'));
      return;
    }
    toast.success(t('wd_block_saved'));
  };

  const handleNote = (text: string) => {
    const result = addNote({ text });
    if (!result.ok) {
      toast.error(t(result.error ?? 'dr_save_failed'));
      return;
    }
    toast.success(t('wd_note_saved'));
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Button type="button" variant="ghost" onClick={() => navigate('/wallets')}>
          <ArrowLeft size={14} /> {t('wd_back_list')}
        </Button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button type="button" variant="ghost" asChild>
            <Link to={`/wallets/${detail.id}/activities`}>
              {t('wd_activities')} <ArrowRight size={13} />
            </Link>
          </Button>
          {permissions.balanceBlock && !detail.isSystemWallet && (
            <Button type="button" variant="ghost" onClick={() => setBlockOpen(true)}>
              <Lock size={13} /> {t('wd_balance_block')}
            </Button>
          )}
          {permissions.addNote && (
            <Button type="button" variant="ghost" onClick={() => setNoteOpen(true)}>
              <MessageSquarePlus size={13} /> {t('wd_add_note')}
            </Button>
          )}
        </div>
      </div>

      {detail.notesDisplay && (
        <div className="fcard" style={{ marginBottom: 16 }}>
          <div className="fcard-body">
            <div className="section-h">{t('scf_notes')}</div>
            <pre className="fs-12 t-mute" style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>
              {detail.notesDisplay}
            </pre>
          </div>
        </div>
      )}

      <DynamicForm
        config={formConfig}
        mode={FormMode.Update}
        permissions={{ view: true, update: canEditLimits }}
        initialValues={initialValues}
        customFunctions={customFunctions}
        t={translate}
        onButtonClick={(key) => {
          if (key === 'saveLimits') saveLimits();
        }}
      />

      <BalanceBlockModal
        open={blockOpen}
        currentBlocked={detail.blocked}
        onClose={() => setBlockOpen(false)}
        onConfirm={handleBlock}
      />
      <WalletNoteModal open={noteOpen} onClose={() => setNoteOpen(false)} onConfirm={handleNote} />
    </>
  );
}

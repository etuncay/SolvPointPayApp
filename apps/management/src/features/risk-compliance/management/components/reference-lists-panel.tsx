import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FormCard } from '@epay/ui';
import { Database, History, Plus, X } from 'lucide-react';
import type { OccupationThreshold, ReferenceListCode, ReferenceListItem } from '../domain/types';
import { REFERENCE_LIST_I18N } from '../domain/reference-list-codes';
import { ReferenceHistoryDrawer } from './reference-history-drawer';
import { OccupationThresholdsTable } from './occupation-thresholds-table';

type Props = {
  listCodes: readonly ReferenceListCode[];
  selectedList: ReferenceListCode;
  onSelectList: (code: ReferenceListCode) => void;
  activeValues: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  historyItems: ReferenceListItem[];
  occupationRows: OccupationThreshold[];
  onOccupationChange: (rows: OccupationThreshold[]) => void;
  canEdit: boolean;
};

export function ReferenceListsPanel({
  listCodes,
  selectedList,
  onSelectList,
  activeValues,
  onAdd,
  onRemove,
  historyItems,
  occupationRows,
  onOccupationChange,
  canEdit,
}: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleAdd = () => {
    onAdd(draft);
    setDraft('');
  };

  return (
    <>
      <FormCard
        id="sec-reference"
        title={t('rm_panel_reference')}
        icon={<Database size={13} />}
        meta={<span className="mono fs-11 t-mute">{listCodes.length}</span>}
        padless
      >
        <div className="rm-ref-layout">
          <nav className="rm-ref-nav" aria-label={t('rm_panel_reference')}>
            {listCodes.map((code) => (
              <button
                key={code}
                type="button"
                className={`rm-ref-nav-btn${selectedList === code ? ' is-active' : ''}`}
                onClick={() => onSelectList(code)}
              >
                {t(REFERENCE_LIST_I18N[code], code)}
              </button>
            ))}
          </nav>

          <div className="rm-ref-editor">
            <div className="rm-ref-toolbar">
              <h3 className="rm-ref-toolbar-title">{t(REFERENCE_LIST_I18N[selectedList], selectedList)}</h3>
              <span className="mono fs-11 t-mute">{activeValues.length}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => setHistoryOpen(true)}>
                <History size={14} /> {t('rm_history')}
              </Button>
            </div>

            {canEdit ? (
              <div className="rm-ref-add">
                <input
                  className="input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAdd();
                    }
                  }}
                  placeholder={t('rm_add_value_ph')}
                />
                <Button type="button" size="sm" variant="primary" onClick={handleAdd}>
                  <Plus size={14} />
                </Button>
              </div>
            ) : null}

            <div className="rm-ref-chips">
              {activeValues.map((v) => (
                <span key={v} className="rm-ref-chip">
                  {v}
                  {canEdit ? (
                    <button
                      type="button"
                      className="rm-ref-chip-remove"
                      onClick={() => onRemove(v)}
                      aria-label={t('rm_remove_value', 'Kaldır')}
                    >
                      <X size={12} />
                    </button>
                  ) : null}
                </span>
              ))}
              {activeValues.length === 0 ? (
                <span className="rm-ref-empty">{t('rm_no_values')}</span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rm-ref-occupation">
          <OccupationThresholdsTable
            rows={occupationRows}
            onChange={onOccupationChange}
            canEdit={canEdit}
          />
        </div>
      </FormCard>

      <ReferenceHistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} items={historyItems} />
    </>
  );
}

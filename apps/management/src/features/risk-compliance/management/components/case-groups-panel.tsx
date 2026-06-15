import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Field, FormCard } from '@epay/ui';
import { ChevronDown, Users } from 'lucide-react';
import { COMPLIANCE_STAFF } from '@/mocks/compliance-staff';
import type { CaseGroup } from '../domain/types';
import { findOperatorManagerOverlap } from '../domain/group-guards';

type Props = {
  groups: CaseGroup[];
  onChange: (groups: CaseGroup[]) => void;
  canEdit: boolean;
};

export function CaseGroupsPanel({ groups, onChange, canEdit }: Props) {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(groups[0]?.id ?? null);
  const overlap = findOperatorManagerOverlap(groups);

  const toggleMember = (groupId: string, userId: string) => {
    onChange(
      groups.map((g) => {
        if (g.id !== groupId) return g;
        const has = g.memberIds.includes(userId);
        const memberIds = has ? g.memberIds.filter((id) => id !== userId) : [...g.memberIds, userId];
        return { ...g, memberIds };
      }),
    );
  };

  const patchName = (groupId: string, name: string) => {
    onChange(groups.map((g) => (g.id === groupId ? { ...g, name } : g)));
  };

  return (
    <FormCard
      id="sec-groups"
      title={t('rm_panel_groups')}
      icon={<Users size={13} />}
      meta={<span className="mono fs-11 t-mute">{groups.length}</span>}
    >
      {overlap.length > 0 ? (
        <p className="rm-overlap-banner">{t('rm_group_overlap', { users: overlap.join(', ') })}</p>
      ) : null}

      <div className="rm-groups">
        {groups.map((g) => {
          const open = expandedId === g.id;
          return (
            <div key={g.id} className="rm-group-card">
              <button
                type="button"
                className="rm-group-head"
                onClick={() => setExpandedId(open ? null : g.id)}
                aria-expanded={open}
              >
                <span className="rm-group-head-main">
                  <span className="rm-group-name">{g.name}</span>
                  <Badge tone="info">{t(`rm_group_type_${g.type}`, g.type)}</Badge>
                  {g.isDefault ? <Badge tone="accent">{t('rm_default_group')}</Badge> : null}
                </span>
                <span className="rm-group-meta">
                  {t('rm_member_count', { count: g.memberIds.length })}
                  <ChevronDown
                    size={14}
                    style={{
                      marginLeft: 8,
                      verticalAlign: -2,
                      transform: open ? 'rotate(180deg)' : undefined,
                      transition: 'transform 0.15s ease',
                    }}
                  />
                </span>
              </button>

              {open ? (
                <div className="rm-group-body">
                  {canEdit ? (
                    <Field label={t('rm_group_name')}>
                      <input
                        className="input"
                        value={g.name}
                        onChange={(e) => patchName(g.id, e.target.value)}
                      />
                    </Field>
                  ) : null}

                  <ul className="rm-group-members">
                    {COMPLIANCE_STAFF.map((s) => (
                      <li key={s.id}>
                        <label className="rm-group-member">
                          <input
                            type="checkbox"
                            checked={g.memberIds.includes(s.id)}
                            disabled={!canEdit}
                            onChange={() => toggleMember(g.id, s.id)}
                          />
                          <span>{s.displayName}</span>
                          <span className="t-mute">({s.role})</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </FormCard>
  );
}

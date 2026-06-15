import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Mail, Plus, Upload, User } from 'lucide-react';
import { Button, DynamicTable, Field, FormCard, FormGrid, FormLayout, FormPrimaryActions, SectionRail, type TableConfig } from '@epay/ui';
import { DEPARTMENTS } from '@/mocks/departments';
import { useEmployeeForm } from './context/employee-context';
import { ForeignWorkerBanner } from './components/foreign-worker-banner';
import { HrDocUploadModal } from './components/hr-doc-upload-modal';
import { MissingDocsBanner } from './components/missing-docs-banner';
import { PhoneOtpModal } from './components/phone-otp-modal';

export function EmployeeForm() {
  const { t } = useTranslation();
  const api = useEmployeeForm();
  const {
    isInsert,
    isView,
    detail,
    register,
    watch,
    addressesArray,
    contactsArray,
    missingDocs,
    onSave,
    onCancel,
    verifyPhone,
    otpOpen,
    setOtpOpen,
    completeOtp,
    docOpen,
    setDocOpen,
    onUploadDocument,
    addAddress,
    addContact,
  } = api;

  const values = watch();
  const [activeSec, setActiveSec] = useState('detail');
  const otpPhone =
    otpOpen && api.otpPhoneIndex != null
      ? values.contacts[api.otpPhoneIndex]?.value ?? ''
      : '';

  const sections = useMemo(
    () => [
      { id: 'detail', no: '1', label: t('ef_panel_detail') },
      { id: 'address', no: '2', label: t('ef_panel_address') },
      { id: 'contact', no: '3', label: t('ef_panel_contact') },
      { id: 'banking', no: '4', label: t('ef_panel_banking') },
    ],
    [t],
  );

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSec(visible[0].target.id.replace('sec-', ''));
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 },
    );
    document
      .querySelectorAll('#sec-detail, #sec-address, #sec-contact, #sec-banking')
      .forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <MissingDocsBanner missingTypes={missingDocs} />
      <ForeignWorkerBanner nationality={values.nationality} />

      <div className="page-head" style={{ alignItems: 'center', marginBottom: 16 }}>
        <div style={{ minWidth: 0 }}>
          <h1 className="page-title">
            {isInsert ? (
              <>
                {t('s_hr_new_employee')}{' '}
                <span className="mono fs-11 t-mute" style={{ fontWeight: 500 }}>
                  13.1
                </span>
              </>
            ) : (
              <>
                {`${values.firstName} ${values.lastName}`.trim() || t('ef_edit_title')}{' '}
                <span className="mono fs-11 t-mute" style={{ fontWeight: 500 }}>
                  13.1
                </span>
              </>
            )}
          </h1>
          <p className="page-subtitle">{t('ef_page_subtitle')}</p>
        </div>
        <div className="head-actions" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <FormPrimaryActions
            showSave={!isView}
            onSave={onSave}
            saveLabel={t('ib_save')}
            showCancel
            onCancel={onCancel}
            cancelLabel={t('lf_cancel_back')}
            trailing={
              !isView ? (
                <Button type="button" onClick={() => setDocOpen(true)}>
                  <Upload size={13} style={{ transform: 'rotate(180deg)' }} />
                  {t('ef_upload_doc')}
                </Button>
              ) : undefined
            }
          />
        </div>
      </div>

      <FormLayout
        rail={
          <SectionRail
            sections={sections}
            activeId={activeSec}
            title={t('ef_page_subtitle')}
            onNavigate={setActiveSec}
          />
        }
      >
        <FormCard id="sec-detail" title={t('ef_panel_detail')} icon={<User size={13} />}>
          <FormGrid cols={2}>
            {!isInsert && detail?.userNo ? (
              <Field label={t('ef_user_no')}>
                <input className="input mono" readOnly value={detail.userNo} />
              </Field>
            ) : null}
            <Field label={t('lv_col_first')} required>
              <input className="input" disabled={isView} {...register('firstName')} />
            </Field>
            <Field label={t('lv_col_last')} required>
              <input className="input" disabled={isView} {...register('lastName')} />
            </Field>
            <Field label={t('ef_identity_type')}>
              <select className="select" disabled={isView} {...register('identityDocument')}>
                <option value="IdentityCard">{t('ef_id_IdentityCard')}</option>
                <option value="Passport">{t('ef_id_Passport')}</option>
                <option value="ResidencePermit">{t('ef_id_ResidencePermit')}</option>
              </select>
            </Field>
            <Field label={t('ef_identity_no')} required>
              <input className="input mono" disabled={isView} {...register('identityNo')} />
            </Field>
            <Field label={t('lv_col_title')} required>
              <input className="input" disabled={isView} {...register('title')} />
            </Field>
            <Field label={t('lv_col_dept')} required>
              <select className="select" disabled={isView} {...register('departmentId')}>
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('ef_hire_date')}>
              <input className="input" type="date" disabled={isView} {...register('hireDate')} />
            </Field>
            <Field label={t('ef_nationality')}>
              <input className="input" disabled={isView} {...register('nationality')} />
            </Field>
            <Field label={t('ef_birth_date')}>
              <input className="input" type="date" disabled={isView} {...register('birthDate')} />
            </Field>
            <Field label={t('ef_birth_place')}>
              <input className="input" disabled={isView} {...register('birthPlace')} />
            </Field>
            <Field label={t('ef_gender')}>
              <select className="select" disabled={isView} {...register('gender')}>
                <option value="Male">{t('ef_gender_Male')}</option>
                <option value="Female">{t('ef_gender_Female')}</option>
                <option value="Other">{t('ef_gender_Other')}</option>
              </select>
            </Field>
            <Field label={t('ef_marital')}>
              <select className="select" disabled={isView} {...register('maritalStatus')}>
                <option value="Single">{t('ef_marital_Single')}</option>
                <option value="Married">{t('ef_marital_Married')}</option>
                <option value="Divorced">{t('ef_marital_Divorced')}</option>
                <option value="Widowed">{t('ef_marital_Widowed')}</option>
              </select>
            </Field>
            <Field label={t('ef_maiden_name')}>
              <input className="input" disabled={isView} {...register('maidenName')} />
            </Field>
            <Field label={t('ef_mother_name')}>
              <input className="input" disabled={isView} {...register('motherName')} />
            </Field>
            <Field label={t('ef_father_name')}>
              <input className="input" disabled={isView} {...register('fatherName')} />
            </Field>
            <Field label={t('ef_doc_serial')}>
              <input className="input mono" disabled={isView} {...register('documentSerialNo')} />
            </Field>
            <Field label={t('ef_doc_issued_by')}>
              <input className="input" disabled={isView} {...register('documentIssuedBy')} />
            </Field>
            <Field label={t('ef_doc_issue_date')}>
              <input className="input" type="date" disabled={isView} {...register('documentIssueDate')} />
            </Field>
            <Field label={t('ef_doc_expiry_date')}>
              <input className="input" type="date" disabled={isView} {...register('documentExpiryDate')} />
            </Field>
            <Field label={t('ef_education')}>
              <select className="select" disabled={isView} {...register('educationLevel')}>
                <option value="Primary">{t('ef_edu_Primary')}</option>
                <option value="Secondary">{t('ef_edu_Secondary')}</option>
                <option value="HighSchool">{t('ef_edu_HighSchool')}</option>
                <option value="Associate">{t('ef_edu_Associate')}</option>
                <option value="Bachelor">{t('ef_edu_Bachelor')}</option>
                <option value="Master">{t('ef_edu_Master')}</option>
                <option value="Doctorate">{t('ef_edu_Doctorate')}</option>
                <option value="Other">{t('ef_edu_Other')}</option>
              </select>
            </Field>
            <Field label={t('ef_last_school')}>
              <input className="input" disabled={isView} {...register('lastSchool')} />
            </Field>
            <Field label={t('ef_graduation_year')}>
              <input className="input" type="number" disabled={isView} {...register('graduationYear')} />
            </Field>
            <Field label={t('ef_tax_country')}>
              <input className="input" disabled={isView} {...register('taxCountry')} />
            </Field>
            <Field label={t('rpt_col_status')}>
              <select className="select" disabled={isView} {...register('employmentStatus')}>
                <option value="Active">{t('ib_status_Active')}</option>
                <option value="OnLeave">{t('ef_status_OnLeave')}</option>
                <option value="Terminated">{t('ef_status_Terminated')}</option>
              </select>
            </Field>
            <Field label={t('cba_col_iban')}>
              <input className="input mono" disabled={isView} {...register('iban')} />
            </Field>
          </FormGrid>
          {values.documents.length > 0 ? (
            <div style={{ marginTop: 16 }}>
              <DynamicTable
                config={
                  {
                    rowKey: 'id',
                    hideTitleBar: true,
                    hideColumnFilters: true,
                    pagination: false,
                    columns: [
                      { key: 'type', title: t('ef_doc_type'), dataIndex: 'type', render: 'renderType' },
                      { key: 'fileName', title: t('scf_doc_name'), dataIndex: 'fileName' },
                    ],
                    api: {
                      method: async () => ({
                        data: values.documents as unknown as Record<string, unknown>[],
                        total: values.documents.length,
                        success: true,
                      }),
                    },
                  } satisfies TableConfig
                }
                permissions={{}}
                customFunctions={{
                  renderType: (_val: unknown, row: Record<string, unknown>) => {
                    const r = row as { typeLabelKey?: string; type?: string };
                    return String(t(r.typeLabelKey ?? '', { defaultValue: r.type ?? '' }));
                  },
                }}
                locale="tr"
                t={(k, fb) => t(k, { defaultValue: fb ?? k })}
              />
            </div>
          ) : null}
        </FormCard>

        <FormCard
          id="sec-address"
          title={t('ef_panel_address')}
          icon={<Home size={13} />}
          meta={
            !isView ? (
              <Button type="button" variant="ghost" onClick={addAddress}>
                <Plus size={13} /> {t('ef_add_row')}
              </Button>
            ) : undefined
          }
        >
          {addressesArray.fields.map((field, index) => (
            <div key={field.id} style={{ marginBottom: 12 }}>
            <FormGrid cols={2}>
              <Field label={t('ef_address_type')}>
                <select className="select" disabled={isView} {...register(`addresses.${index}.addressType`)}>
                  <option value="Registered">{t('ef_addr_Registered')}</option>
                  <option value="Home">{t('ef_addr_Home')}</option>
                  <option value="Work">{t('ef_addr_Work')}</option>
                  <option value="Contact">{t('ef_addr_Contact')}</option>
                  <option value="Other">{t('ef_addr_Other')}</option>
                </select>
              </Field>
              <Field label={t('ef_city')}>
                <input className="input" disabled={isView} {...register(`addresses.${index}.city`)} />
              </Field>
              <Field label={t('ef_postcode')}>
                <input className="input" disabled={isView} {...register(`addresses.${index}.postcode`)} />
              </Field>
              <Field label={t('ef_panel_address')}>
                <textarea className="input" rows={2} disabled={isView} {...register(`addresses.${index}.line`)} />
              </Field>
            </FormGrid>
            </div>
          ))}
        </FormCard>

        <FormCard
          id="sec-contact"
          title={t('ef_panel_contact')}
          icon={<Mail size={13} />}
          meta={
            !isView ? (
              <Button type="button" variant="ghost" onClick={() => addContact('phone')}>
                <Plus size={13} /> {t('ef_add_phone')}
              </Button>
            ) : undefined
          }
        >
          {contactsArray.fields.map((field, index) => {
            const row = values.contacts[index];
            return (
              <div
                key={field.id}
                style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 10, flexWrap: 'wrap' }}
              >
                <Field label={row?.type === 'phone' ? t('fcd_customer_phone') : t('fcd_customer_email')}>
                  <input className="input" disabled={isView} {...register(`contacts.${index}.value`)} />
                </Field>
                {row?.type === 'phone' && !isView ? (
                  <Button
                    type="button"
                    variant={row.verified ? 'ghost' : 'primary'}
                    onClick={() => verifyPhone(index)}
                  >
                    {row.verified ? t('ef_verified') : t('ef_verify_otp')}
                  </Button>
                ) : null}
                {row?.verified ? (
                  <span className="pill fs-11 pill-success">{t('ef_verified')}</span>
                ) : null}
              </div>
            );
          })}
        </FormCard>

        <FormCard id="sec-banking" title={t('ef_panel_banking')} icon={<User size={13} />}>
          <FormGrid cols={2}>
            <Field label={t('ef_bank_name')}>
              <input className="input" disabled={isView} {...register('bankName')} />
            </Field>
            <Field label={t('ef_bank_account_no')}>
              <input className="input mono" disabled={isView} {...register('bankAccountNo')} />
            </Field>
            <Field label={t('ef_emergency_name')}>
              <input className="input" disabled={isView} {...register('emergencyContactName')} />
            </Field>
            <Field label={t('ef_emergency_phone')}>
              <input className="input" disabled={isView} {...register('emergencyContactPhone')} />
            </Field>
          </FormGrid>
        </FormCard>
      </FormLayout>

      <PhoneOtpModal
        open={otpOpen}
        phone={otpPhone}
        onClose={() => setOtpOpen(false)}
        onConfirm={completeOtp}
      />
      <HrDocUploadModal open={docOpen} onClose={() => setDocOpen(false)} onSubmit={onUploadDocument} />
    </>
  );
}

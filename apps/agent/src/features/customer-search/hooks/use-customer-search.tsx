import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { customerSearchService } from '../api';
import type { CustomerDocumentViewRow, CustomerSearchQuery, CustomerSearchResult } from '../domain/types';
import type { DocumentUploadPayload } from '../components/document-upload-modal';

export function useCustomerSearch() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [result, setResult] = useState<CustomerSearchResult | null>(null);
  const [documents, setDocuments] = useState<CustomerDocumentViewRow[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [pendingVisible, setPendingVisible] = useState(false);

  const customerId = result?.profile.customerId ?? null;

  const initialQuery = useMemo(
    (): CustomerSearchQuery => ({
      customerNo: searchParams.get('customerNo') ?? undefined,
      idNo: searchParams.get('idNo') ?? undefined,
    }),
    [searchParams],
  );

  const runSearch = useCallback(
    async (query: CustomerSearchQuery, syncUrl = true) => {
      const customerNo = query.customerNo?.trim();
      const idNo = query.idNo?.trim();
      if (!customerNo && !idNo) {
        toast.error(t('ag_cs_search_required'));
        return;
      }

      setLoading(true);
      setNotFound(false);
      setResult(null);
      setPendingVisible(false);

      try {
        const found = customerSearchService.search({ customerNo, idNo });
        if (!found) {
          setNotFound(true);
          if (syncUrl) {
            const next = new URLSearchParams();
            if (customerNo) next.set('customerNo', customerNo);
            if (idNo) next.set('idNo', idNo);
            setSearchParams(next, { replace: true });
          }
          return;
        }

        setResult(found);
        setDocuments(customerSearchService.listDocuments(found.profile.customerId));
        setPendingVisible(customerSearchService.getPendingTransactions(found.profile.customerId).length > 0);

        if (syncUrl) {
          const next = new URLSearchParams();
          next.set('customerNo', found.profile.customerNo);
          if (idNo) next.set('idNo', idNo);
          setSearchParams(next, { replace: true });
        }
      } finally {
        setLoading(false);
      }
    },
    [setSearchParams, t],
  );

  useEffect(() => {
    const q = initialQuery;
    if (q.customerNo || q.idNo) {
      void runSearch(q, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpload = useCallback(
    (payload: DocumentUploadPayload) => {
      if (customerId == null) return;
      customerSearchService.uploadDocument(customerId, payload);
      setDocuments(customerSearchService.listDocuments(customerId));
      toast.success(t('ag_cs_upload_ok'));
    },
    [customerId, t],
  );

  const refreshDocuments = useCallback(() => {
    if (customerId == null) return;
    setDocuments(customerSearchService.listDocuments(customerId));
  }, [customerId]);

  return {
    loading,
    notFound,
    result,
    customerId,
    documents,
    uploadOpen,
    viewOpen,
    pendingVisible,
    setPendingVisible,
    setUploadOpen,
    setViewOpen,
    runSearch,
    handleUpload,
    refreshDocuments,
    initialQuery,
  };
}

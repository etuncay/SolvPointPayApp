import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { BackOfficeRole } from '@epay/ui';
import { documentsService } from '@/features/dms/api/mock-documents-adapter';

export function useDocumentDetail(role: BackOfficeRole) {
  const navigate = useNavigate();
  const { documentId } = useParams<{ documentId: string }>();
  const id = documentId ?? '';

  const detail = useMemo(
    () => (id ? documentsService.getDetail(role, id) : null),
    [role, id],
  );

  const download = useCallback(() => {
    if (!id) return null;
    return documentsService.download(role, id);
  }, [role, id]);

  const goBack = useCallback(() => navigate('/documents'), [navigate]);

  return {
    detail,
    notFound: Boolean(id && !detail),
    download,
    goBack,
  };
}

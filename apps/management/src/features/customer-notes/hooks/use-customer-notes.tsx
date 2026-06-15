import { useCallback, useMemo, useState } from 'react';
import { customerNotesService } from '../api';
import { DEFAULT_NOTE_FILTERS, type CustomerNoteInput, type NoteFilters } from '../domain/types';

export function useCustomerNotes(initialFilters: NoteFilters = DEFAULT_NOTE_FILTERS) {
  const [filters, setFilters] = useState<NoteFilters>(initialFilters);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const rows = useMemo(() => customerNotesService.list(filters), [filters, version]);

  const updateFilters = useCallback((patch: Partial<NoteFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const create = useCallback(
    (input: CustomerNoteInput) => {
      const result = customerNotesService.create(input);
      if (result.ok) refresh();
      return result;
    },
    [refresh],
  );

  const update = useCallback(
    (id: number, input: CustomerNoteInput) => {
      const result = customerNotesService.update(id, input);
      if (result.ok) refresh();
      return result;
    },
    [refresh],
  );

  const remove = useCallback(
    (id: number) => {
      const result = customerNotesService.softDelete(id);
      if (result.ok) refresh();
      return result;
    },
    [refresh],
  );

  return { filters, updateFilters, rows, create, update, remove, refresh };
}

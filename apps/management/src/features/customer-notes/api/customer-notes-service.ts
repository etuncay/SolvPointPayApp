import type { CustomerNote, CustomerNoteInput, NoteFilters, SaveNoteResult } from '../domain/types';

export type CustomerNotesService = {
  list(filters: NoteFilters): CustomerNote[];
  create(input: CustomerNoteInput): SaveNoteResult;
  update(id: number, input: CustomerNoteInput): SaveNoteResult;
  softDelete(id: number): SaveNoteResult;
  incrementDisplay(id: number): SaveNoteResult;
};

/** DynamicForm / config DSL form modları */
export enum FormMode {
  View = 'view',
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
}

export function isFormView(mode: FormMode): boolean {
  return mode === FormMode.View;
}

export function isFormCreate(mode: FormMode): boolean {
  return mode === FormMode.Create;
}

export function isFormUpdate(mode: FormMode): boolean {
  return mode === FormMode.Update;
}

export function isFormDelete(mode: FormMode): boolean {
  return mode === FormMode.Delete;
}

/** Görüntüleme ve silme onayı — alanlar düzenlenemez */
export function isFormReadOnly(mode: FormMode): boolean {
  return mode === FormMode.View || mode === FormMode.Delete;
}

export function isFormEditable(mode: FormMode): boolean {
  return mode === FormMode.Create || mode === FormMode.Update;
}

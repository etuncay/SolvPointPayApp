import * as React from 'react';
import { PageHead } from '../composite/page-head';
import type { DynamicFormShellProps } from './types';

export function FormShellHead({ shell }: { shell?: DynamicFormShellProps }) {
  if (!shell || shell.hidePageHead) return null;

  const hasActions = shell.leading || shell.trailing || shell.actions;

  return (
    <PageHead
      title={shell.title ?? ''}
      subtitle={shell.subtitle}
      status={shell.status}
      actions={
        hasActions ? (
          <>
            {shell.leading}
            {shell.actions}
            {shell.trailing}
          </>
        ) : undefined
      }
    />
  );
}

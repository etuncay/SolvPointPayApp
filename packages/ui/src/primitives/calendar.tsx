import * as React from 'react';
import { DayPicker, type DayPickerProps } from 'react-day-picker';
import { cn } from '../lib/utils';

import 'react-day-picker/style.css';

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: DayPickerProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--bg-elev)] p-2', className)}
      classNames={classNames}
      {...props}
    />
  );
}


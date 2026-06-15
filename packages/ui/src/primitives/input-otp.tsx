import * as React from 'react';
import { OTPInput, OTPInputContext, REGEXP_ONLY_DIGITS } from 'input-otp';
import { Minus } from 'lucide-react';
import { cn } from '../lib/utils';

export { REGEXP_ONLY_DIGITS };

/** shadcn/ui input-otp ile uyumlu — birleşik slot grubu, gizli native input */
export const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(
  (
    {
      className,
      containerClassName,
      textAlign = 'center',
      pushPasswordManagerStrategy = 'none',
      ...props
    },
    ref,
  ) => (
    <OTPInput
      ref={ref}
      data-slot="input-otp"
      textAlign={textAlign}
      pushPasswordManagerStrategy={pushPasswordManagerStrategy}
      containerClassName={cn('input-otp-container', containerClassName)}
      className={cn('disabled:cursor-not-allowed', className)}
      {...props}
    />
  ),
);
InputOTP.displayName = 'InputOTP';

export const InputOTPGroup = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div data-slot="input-otp-group" className={cn('input-otp-group', className)} {...props} />
);
InputOTPGroup.displayName = 'InputOTPGroup';

export const InputOTPSlot = ({
  index,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { index: number }) => {
  const ctx = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = ctx?.slots?.[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive || undefined}
      className={cn('input-otp-slot', className)}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="input-otp-caret" />
        </div>
      )}
    </div>
  );
};
InputOTPSlot.displayName = 'InputOTPSlot';

export const InputOTPSeparator = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    data-slot="input-otp-separator"
    role="separator"
    className={cn('input-otp-separator', className)}
    {...props}
  >
    <Minus size={16} />
  </div>
);
InputOTPSeparator.displayName = 'InputOTPSeparator';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { Input } from './input';
import { IconButton } from './icon-button';

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<typeof Input>, 'type'> & { defaultVisible?: boolean }
>(({ className, defaultVisible = false, ...props }, ref) => {
  const [visible, setVisible] = React.useState(defaultVisible);

  return (
    <div className={cn('relative', className)}>
      <Input ref={ref} type={visible ? 'text' : 'password'} {...props} style={{ paddingRight: 34, ...(props.style ?? {}) }} />
      <IconButton
        type="button"
        aria-label={visible ? 'Şifreyi gizle' : 'Şifreyi göster'}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-1 top-1"
        style={{ width: 30, height: 30 }}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </IconButton>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';


export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

const BTN_BASE =
  'inline-flex items-center gap-1.5 rounded-lg border font-medium cursor-pointer transition-all duration-150 whitespace-nowrap leading-none disabled:opacity-50 disabled:cursor-not-allowed';

export function btnCls(
  variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'secondary',
  size: 'default' | 'sm' | 'icon' = 'default',
  extra?: string
): string {
  const variants: Record<string, string> = {
    primary:   'bg-accent text-white border-accent hover:opacity-90 active:scale-[0.97]',
    secondary: 'bg-surface text-tx-heading border-border hover:bg-surface-2',
    ghost:     'bg-transparent text-tx-muted border-transparent hover:bg-surface-2 hover:text-tx-heading',
    danger:    'bg-danger-bg text-danger border-transparent hover:opacity-80',
  };
  const sizes: Record<string, string> = {
    default: 'px-4 py-2 text-[13.5px]',
    sm:      'px-[11px] py-[5px] text-[13px]',
    icon:    'p-1.5 w-[30px] h-[30px] justify-center',
  };
  return cn(BTN_BASE, variants[variant], sizes[size], extra);
}

export const INPUT =
  'w-full px-3 py-[9px] border border-border rounded-lg bg-surface text-tx-heading text-[14px] outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:ring-[3px] focus:ring-accent/20 placeholder:text-tx-muted font-[inherit]';

export const LABEL = 'text-[13px] font-medium text-tx-heading';

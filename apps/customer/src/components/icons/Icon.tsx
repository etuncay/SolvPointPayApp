import type { CSSProperties } from 'react';
import {
  Activity,
  ArrowDownLeft,
  ArrowLeft,
  ArrowLeftRight,
  ArrowUpRight,
  RefreshCw,
  Bell,
  Check,
  ChevronDown,
  Filter,
  FileText,
  Flag,
  Paperclip,
  Search,
  Building2,
  Copy,
  Download,
  Info,
  Mail,
  Pencil,
  Plus,
  Trash2,
  Globe,
  Home,
  Lock,
  LogOut,
  Moon,
  Phone,
  Send,
  Settings,
  Sun,
  Upload,
  Users,
  Wallet,
  X,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  Shield,
  Sparkles,
  User,
  type LucideIcon,
} from 'lucide-react';

export type IconName =
  | 'home'
  | 'activity'
  | 'topup'
  | 'send'
  | 'receive'
  | 'complaint'
  | 'users'
  | 'flag'
  | 'globe'
  | 'chevron'
  | 'wallet'
  | 'arrowDownLeft'
  | 'arrowUpRight'
  | 'right'
  | 'close'
  | 'warn'
  | 'shield'
  | 'settings'
  | 'moon'
  | 'sun'
  | 'bell'
  | 'lock'
  | 'left'
  | 'phone'
  | 'check'
  | 'search'
  | 'filter'
  | 'bank'
  | 'copy'
  | 'info'
  | 'plus'
  | 'edit'
  | 'trash'
  | 'mail'
  | 'swap'
  | 'refresh'
  | 'clip'
  | 'receipt'
  | 'user'
  | 'download'
  | 'sparkle';

const MAP: Record<IconName, LucideIcon> = {
  home: Home,
  activity: Activity,
  topup: Upload,
  send: Send,
  receive: ArrowDownLeft,
  complaint: MessageSquare,
  users: Users,
  flag: Flag,
  globe: Globe,
  chevron: ChevronDown,
  wallet: Wallet,
  arrowDownLeft: ArrowDownLeft,
  arrowUpRight: ArrowUpRight,
  right: ArrowRight,
  close: X,
  warn: AlertTriangle,
  shield: Shield,
  settings: Settings,
  moon: Moon,
  sun: Sun,
  bell: Bell,
  lock: Lock,
  left: ArrowLeft,
  phone: Phone,
  check: Check,
  search: Search,
  filter: Filter,
  bank: Building2,
  copy: Copy,
  info: Info,
  plus: Plus,
  edit: Pencil,
  trash: Trash2,
  mail: Mail,
  swap: ArrowLeftRight,
  refresh: RefreshCw,
  clip: Paperclip,
  receipt: FileText,
  user: User,
  download: Download,
  sparkle: Sparkles,
};

export function Icon({
  name,
  style,
  className,
}: {
  name: IconName;
  style?: CSSProperties;
  className?: string;
}) {
  const Cmp = MAP[name] ?? Home;
  return <Cmp style={style} className={className} aria-hidden />;
}

export { LogOut };

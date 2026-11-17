import {
  Award,
  Calculator,
  Calendar,
  ChartLine,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Disc3,
  Dumbbell,
  History,
  House,
  Info,
  Minus,
  Moon,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Scale,
  Search,
  Settings,
  Smartphone,
  Sun,
  Timer,
  Trash2,
  TrendingUp,
  Trophy,
  User,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react-native';

import { useTheme } from '@/context';
import { iconSize, iconStroke } from '@/theme';

/** Lucide whitelist — the only icon set used in the app. */
const icons = {
  home: House,
  wrench: Wrench,
  clipboardList: ClipboardList,
  trendingUp: TrendingUp,
  calculator: Calculator,
  timer: Timer,
  plates: Disc3,
  trophy: Trophy,
  dumbbell: Dumbbell,
  chevronRight: ChevronRight,
  play: Play,
  pause: Pause,
  rotateCcw: RotateCcw,
  refresh: RefreshCw,
  trash: Trash2,
  plus: Plus,
  minus: Minus,
  user: User,
  settings: Settings,
  info: Info,
  alert: CircleAlert,
  search: Search,
  pencil: Pencil,
  award: Award,
  scale: Scale,
  calendar: Calendar,
  history: History,
  chart: ChartLine,
  check: Check,
  close: X,
  sun: Sun,
  moon: Moon,
  smartphone: Smartphone,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

type IconSize = keyof typeof iconSize;

interface IconProps {
  name: IconName;
  size?: IconSize | number;
  /** Defaults to the active primary text color. */
  color?: string;
}

export function Icon({ name, size = 'md', color }: IconProps) {
  const { colors } = useTheme();
  const Component: LucideIcon = icons[name];
  const resolvedSize = typeof size === 'number' ? size : iconSize[size];

  return (
    <Component
      size={resolvedSize}
      color={color ?? colors.textPrimary}
      strokeWidth={iconStroke}
    />
  );
}

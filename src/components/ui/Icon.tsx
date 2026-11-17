import {
  Award,
  Bookmark,
  Calculator,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Clock,
  Dumbbell,
  Home,
  Info,
  Minus,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Search,
  Settings,
  SkipForward,
  Target,
  Trash2,
  TrendingUp,
  User,
  Weight,
  Wrench,
  type LucideIcon,
} from 'lucide-react-native';

import { colors, iconSize } from '@/theme';

const icons = {
  home: Home,
  wrench: Wrench,
  clipboardList: ClipboardList,
  trendingUp: TrendingUp,
  calculator: Calculator,
  clock: Clock,
  weight: Weight,
  dumbbell: Dumbbell,
  chevronRight: ChevronRight,
  play: Play,
  pause: Pause,
  skipForward: SkipForward,
  rotateCcw: RotateCcw,
  trash: Trash2,
  plus: Plus,
  minus: Minus,
  user: User,
  settings: Settings,
  target: Target,
  bookmark: Bookmark,
  info: Info,
  circleHelp: CircleHelp,
  search: Search,
  pencil: Pencil,
  award: Award,
} as const;

export type IconName = keyof typeof icons;

type IconSize = keyof typeof iconSize;

interface IconProps {
  name: IconName;
  size?: IconSize | number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({
  name,
  size = 'md',
  color = colors.textPrimary,
  strokeWidth = 2,
}: IconProps) {
  const Component: LucideIcon = icons[name];
  const resolvedSize = typeof size === 'number' ? size : iconSize[size];

  return <Component size={resolvedSize} color={color} strokeWidth={strokeWidth} />;
}

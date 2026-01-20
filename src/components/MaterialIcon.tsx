import { 
  FileText, Package, Wine, Droplets, Container, Film, 
  CircleDot, Wrench, Cable, GlassWater 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MaterialIconProps {
  icon: string;
  category: 'papel' | 'plastico' | 'metal' | 'vidro';
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onClick?: () => void;
  label?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Package,
  Wine,
  Droplets,
  Container,
  Film,
  CircleDot,
  Wrench,
  Cable,
  GlassWater,
};

const categoryColors: Record<string, string> = {
  papel: 'bg-material-paper',
  plastico: 'bg-material-plastic',
  metal: 'bg-material-metal',
  vidro: 'bg-material-glass',
};

const categoryBorders: Record<string, string> = {
  papel: 'ring-material-paper',
  plastico: 'ring-material-plastic',
  metal: 'ring-material-metal',
  vidro: 'ring-material-glass',
};

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-20 h-20',
};

const iconSizes = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
};

export function MaterialIcon({ 
  icon, 
  category, 
  size = 'md', 
  selected = false, 
  onClick, 
  label 
}: MaterialIconProps) {
  const IconComponent = iconMap[icon] || Package;
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-2 rounded-2xl transition-all duration-200',
        'hover:scale-105 active:scale-95',
        onClick && 'cursor-pointer'
      )}
    >
      <div
        className={cn(
          sizeClasses[size],
          categoryColors[category],
          'rounded-2xl flex items-center justify-center shadow-lg',
          'transition-all duration-200',
          selected && 'ring-4 ring-offset-2',
          selected && categoryBorders[category]
        )}
      >
        <IconComponent className={cn(iconSizes[size], 'text-white')} />
      </div>
      {label && (
        <span className={cn(
          'text-sm font-medium text-center leading-tight',
          selected ? 'text-foreground' : 'text-muted-foreground'
        )}>
          {label}
        </span>
      )}
    </button>
  );
}

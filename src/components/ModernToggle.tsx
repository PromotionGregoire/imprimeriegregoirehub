import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import ToggleSwitch from './ToggleSwitch';

interface ModernToggleProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked?: boolean) => void;
  disabled?: boolean;
  description?: string;
  size?: 'sm' | 'lg';
}

const ModernToggle = ({ 
  id, 
  label, 
  checked, 
  onCheckedChange, 
  disabled = false,
  description,
  size = 'lg'
}: ModernToggleProps) => {
  return (
    <div 
      className="flex items-center justify-between py-3"
      onClick={(e) => e.stopPropagation()} // Empêcher la propagation sur tout le conteneur
    >
      <div className="flex-1">
        <Label 
          htmlFor={id} 
          className={cn(
            "text-sm font-medium cursor-pointer leading-tight",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
        )}
      </div>
      <ToggleSwitch
        id={id}
        checked={checked}
        onChange={onCheckedChange}
        disabled={disabled}
        size={size}
      />
    </div>
  );
};

export default ModernToggle;
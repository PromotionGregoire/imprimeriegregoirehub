import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ModernToggleProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: () => void;
  disabled?: boolean;
  description?: string;
}

const ModernToggle = ({ 
  id, 
  label, 
  checked, 
  onCheckedChange, 
  disabled = false,
  description 
}: ModernToggleProps) => {
  return (
    <div className="flex items-center justify-between py-base-300">
      <div className="flex-1">
        <Label 
          htmlFor={id} 
          className={cn(
            "text-base-300 font-medium cursor-pointer leading-tight",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {label}
        </Label>
        {description && (
          <p className="text-base-200 text-muted-foreground mt-base-100 leading-relaxed">{description}</p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          // Uber-style switch with consistent green color
          "ml-base-400",
          disabled && "opacity-50"
        )}
      />
    </div>
  );
};

export default ModernToggle;
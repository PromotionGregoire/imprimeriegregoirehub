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
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors">
      <div className="flex-1">
        <Label 
          htmlFor={id} 
          className={cn(
            "text-sm font-medium cursor-pointer",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          // Toggle moderne avec couleur verte solide quand actif
          checked && "data-[state=checked]:bg-[#5a7a51] border-[#5a7a51]",
          !checked && "bg-input",
          disabled && "opacity-50"
        )}
      />
    </div>
  );
};

export default ModernToggle;
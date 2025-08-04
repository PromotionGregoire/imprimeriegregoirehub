import React, { useState } from 'react';

// Définition des propriétés que le composant peut recevoir
interface ToggleSwitchProps {
  // L'état initial du toggle (activé ou non)
  initialState?: boolean;
  // La taille du toggle
  size?: 'sm' | 'lg';
  // Fonction à appeler quand le toggle change d'état
  onChange?: (isOn: boolean) => void;
  // État contrôlé depuis l'extérieur
  checked?: boolean;
  // Désactiver le toggle
  disabled?: boolean;
  // ID pour l'accessibilité
  id?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  initialState = false,
  size = 'lg',
  onChange,
  checked,
  disabled = false,
  id,
}) => {
  const [internalState, setInternalState] = useState(initialState);
  
  // Utiliser l'état contrôlé si fourni, sinon utiliser l'état interne
  const isOn = checked !== undefined ? checked : internalState;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher la propagation vers le parent
    
    if (disabled) return;
    
    const newState = !isOn;
    
    // Si pas d'état contrôlé, mettre à jour l'état interne
    if (checked === undefined) {
      setInternalState(newState);
    }
    
    if (onChange) {
      onChange(newState);
    }
  };

  // Définir les classes de taille en fonction de la prop 'size'
  const trackWidth = size === 'lg' ? 'w-14' : 'w-10';
  const trackHeight = size === 'lg' ? 'h-8' : 'h-6';
  const thumbSize = size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
  const thumbTranslate = size === 'lg' ? 'translate-x-7' : 'translate-x-4';

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={isOn}
      onClick={handleToggle}
      disabled={disabled}
      className={`relative inline-flex flex-shrink-0 ${trackWidth} ${trackHeight} cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5a7a51] focus:ring-offset-2 ${
        isOn ? 'bg-[#5a7a51]' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="sr-only">Toggle switch</span>
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block ${thumbSize} transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          isOn ? thumbTranslate : 'translate-x-1'
        }`}
      />
    </button>
  );
};

export default ToggleSwitch;
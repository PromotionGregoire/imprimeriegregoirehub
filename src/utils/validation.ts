export function getLabelText(field: HTMLElement): string | null {
  const id = (field as HTMLInputElement).id;
  let label: HTMLLabelElement | null = null;
  
  // Try to find label by for attribute
  if (id) {
    label = document.querySelector(`label[for="${id}"]`);
  }
  
  // Try to find label by aria-labelledby
  if (!label && field.hasAttribute('aria-labelledby')) {
    const labId = field.getAttribute('aria-labelledby')!;
    label = document.getElementById(labId) as HTMLLabelElement | null;
  }
  
  // Try to find parent label (for cases where input is inside label)
  if (!label) {
    label = field.closest('label') as HTMLLabelElement | null;
  }
  
  return label ? label.textContent?.replace('*', '').trim() ?? null : null;
}

export function isRequired(field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): boolean {
  // Check if field has required attribute or aria-required="true"
  if ((field as any).required || field.getAttribute('aria-required') === 'true') {
    return true;
  }
  
  // Check if associated label contains asterisk
  const labelText = getLabelText(field);
  if (labelText) {
    const labelElement = field.id ? document.querySelector(`label[for="${field.id}"]`) : field.closest('label');
    if (labelElement && /\*/.test(labelElement.textContent ?? '')) {
      return true;
    }
  }
  
  return false;
}

export function validateRequiredFields(form: HTMLFormElement): Record<string, string> {
  const fields = Array.from(form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea'));
  const errors: Record<string, string> = {};
  
  fields.forEach(field => {
    if (!isRequired(field)) return;
    
    const isEmpty = field instanceof HTMLSelectElement 
      ? (field.value === '' || field.value == null)
      : (field.value?.trim() === '');
      
    if (isEmpty) {
      const name = field.name || field.id;
      const label = getLabelText(field);
      
      if (field instanceof HTMLSelectElement) {
        errors[name] = label ? `Veuillez sélectionner ${label}.` : 'Ce champ est requis.';
      } else {
        errors[name] = label ? `${label} est requis.` : 'Ce champ est requis.';
      }
    }
  });
  
  return errors;
}

export function displayFieldErrors(form: HTMLFormElement, errors: Record<string, string>) {
  // Clear previous errors first
  clearFieldErrors(form);
  
  // Display new errors
  Object.keys(errors).forEach(fieldName => {
    const field = form.querySelector<HTMLElement>(`[name="${fieldName}"], #${fieldName}`);
    if (!field) return;
    
    // Mark field as invalid
    field.setAttribute('aria-invalid', 'true');
    field.classList.add('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
    
    // Create error message
    const errorMsg = document.createElement('p');
    errorMsg.className = 'text-red-600 text-sm mt-1';
    errorMsg.setAttribute('data-error-message', '');
    errorMsg.setAttribute('role', 'alert');
    errorMsg.id = `${fieldName}-error`;
    errorMsg.textContent = errors[fieldName];
    
    // Insert error message after field
    const container = field.parentElement!;
    container.appendChild(errorMsg);
    
    // Set aria-describedby
    field.setAttribute('aria-describedby', errorMsg.id);
  });
}

export function clearFieldErrors(form: HTMLFormElement) {
  // Clear previous errors
  form.querySelectorAll('[data-error-message]').forEach(el => el.remove());
  form.querySelectorAll('[aria-invalid="true"]').forEach(el => {
    el.setAttribute('aria-invalid', 'false');
    el.classList.remove('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
  });
}

export function scrollToFirstError(form: HTMLFormElement) {
  const firstErrorField = form.querySelector<HTMLElement>('[aria-invalid="true"]');
  if (firstErrorField) {
    firstErrorField.focus();
    firstErrorField.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
  }
}
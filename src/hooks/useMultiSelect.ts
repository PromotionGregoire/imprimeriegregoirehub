import { useState, useCallback } from 'react';

export const useMultiSelect = <T extends { id: string }>(items: T[] = []) => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelection = useCallback((id: string) => {
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelected(items.map(item => item.id));
  }, [items]);

  const clearSelection = useCallback(() => {
    setSelected([]);
  }, []);

  const isSelected = useCallback((id: string) => {
    return selected.includes(id);
  }, [selected]);

  const selectedItems = items.filter(item => selected.includes(item.id));

  return {
    selected,
    selectedItems,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    hasSelection: selected.length > 0,
    selectedCount: selected.length,
    isAllSelected: selected.length === items.length && items.length > 0
  };
};
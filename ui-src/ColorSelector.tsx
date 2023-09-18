import * as React from 'react';
import { Select } from './Select/Select';

type ColorSelectorProps = {
  selected: null | { colors: string[] };
  selectedColorToChange: string | undefined;
  setSelectedColorToChange: (color: string) => void;
};

export const ColorSelector = ({
  selected,
  selectedColorToChange,
  setSelectedColorToChange
}: ColorSelectorProps) => {
  if (!selected || !selected.colors) {
    return null;
  }

  return (
    <div className='select-container'>
      <Select
        options={selected.colors}
        value={selectedColorToChange ?? ''}
        onChange={setSelectedColorToChange}
        label='Select a color to change: '
      />
    </div>
  );
};

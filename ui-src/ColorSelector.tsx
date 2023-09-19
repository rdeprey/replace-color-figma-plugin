import * as React from 'react';
import { ColorPanel, OnChangeFunction } from './ColorPanel/ColorPanel';
import { Selected } from './main';

type ColorSelectorProps = {
  selected: null | Selected;
  selectedColorsToChange: (string | RGBA)[];
  setSelectedColorsToChange: OnChangeFunction;
};

export const ColorSelector = ({
  selected,
  selectedColorsToChange,
  setSelectedColorsToChange
}: ColorSelectorProps) => {
  if (!selected || !selected.colors) {
    return null;
  }

  return (
    <div className='select-container'>
      <ColorPanel
        options={selected}
        value={selectedColorsToChange ?? ''}
        onChange={setSelectedColorsToChange}
        label='Select color(s) to change: '
      />
    </div>
  );
};

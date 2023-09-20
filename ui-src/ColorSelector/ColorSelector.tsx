import * as React from 'react';
import { ColorPanel } from '../ColorPanel/ColorPanel';

type ColorSelectorProps = {
  selected: null | { colors: string[] };
  selectedColorsToChange: string[];
  setSelectedColorsToChange: (color: string) => void;
};

export const ColorSelector = ({
  selected,
  selectedColorsToChange,
  setSelectedColorsToChange
}: ColorSelectorProps) => {
  if (!selected || !selected.colors) {
    return null;
  }

  React.useEffect(() => {
    if (selectedColorsToChange.length === 0 && selected.colors.length === 1) {
      setSelectedColorsToChange(selected.colors[0]);
    }
  }, [selectedColorsToChange]);

  return (
    <div className='select-container'>
      <ColorPanel
        options={selected.colors}
        value={selectedColorsToChange ?? ''}
        onChange={setSelectedColorsToChange}
        label='Select color(s) to change: '
      />
    </div>
  );
};

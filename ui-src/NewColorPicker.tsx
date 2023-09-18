import * as React from 'react';
import styles from './NewColorPicker.module.css';

type NewColorPickerProps = {
  newColor: string | undefined;
  setNewColor: (color: string) => void;
};

export const NewColorPicker = ({ setNewColor }: NewColorPickerProps) => {
  const [color, setColor] = React.useState<string | undefined>(undefined);

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColor(event.target.value);
    setNewColor(event.target.value);
  };

  return (
    <div className={styles.newColorPicker}>
      <label htmlFor='select-new-color'>Select a new color:</label>
      <div>
        <input
          type='color'
          id='select-new-color'
          onChange={handleColorChange}
        />
        {color && <span>{color}</span>}
      </div>
    </div>
  );
};

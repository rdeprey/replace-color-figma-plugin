import * as React from 'react';
import styles from './NewColorPicker.module.css';

type NewColorPickerProps = {
  newColor: string | undefined;
  setNewColor: (color: string) => void;
};

export const NewColorPicker = ({
  newColor,
  setNewColor
}: NewColorPickerProps) => {
  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewColor(event.target.value);
  };

  // The event.preventDefault() on the label keeps the color picker from
  // re-opening when the user clicks on the label.
  return (
    <div className={styles.newColorPicker}>
      <label
        htmlFor='select-new-color'
        onClick={(event) => event.preventDefault()}>
        Select a new color:
      </label>
      <div>
        <input
          type='color'
          id='select-new-color'
          onChange={handleColorChange}
        />
        {newColor && <span>{newColor}</span>}
      </div>
    </div>
  );
};

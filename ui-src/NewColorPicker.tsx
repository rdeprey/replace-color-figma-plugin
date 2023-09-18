import * as React from 'react';
import styles from './NewColorPicker.module.css';

type NewColorPickerProps = {
  setNewColor: (color: string) => void;
};

export const NewColorPicker = ({ setNewColor }: NewColorPickerProps) => {
  return (
    <div className={styles.newColorPicker}>
      <label htmlFor='select-new-color'>
        What color would you like to change it to?
      </label>
      <input
        type='color'
        id='select-new-color'
        onChange={(event) => setNewColor(event.target.value)}
      />
    </div>
  );
};

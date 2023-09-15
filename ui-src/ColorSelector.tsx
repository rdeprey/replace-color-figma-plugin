import * as React from 'react';
import styles from './ColorSelector.module.css';

type ColorSelectorProps = {
  selected: null | { fills: string[]; strokes: string[] };
  setSelectedColorToChange: (color: string) => void;
};

export const ColorSelector = ({
  selected,
  setSelectedColorToChange
}: ColorSelectorProps) => {
  if (!selected || !selected.fills || !selected.strokes) {
    return null;
  }

  const updateSelectedColor = (event: React.MouseEvent<HTMLSpanElement>) => {
    const selectedColor = (event.target as HTMLInputElement).value;
    setSelectedColorToChange(selectedColor);
  };

  return (
    <div>
      <fieldset>
        <legend>Select a color to replace:</legend>
        <div className='radio-button-group'>
          {[...selected.fills, ...selected.strokes].map((fill, index) => (
            <span
              className={styles.colorSelectorRow}
              onClick={updateSelectedColor}>
              <input
                type='radio'
                checked={index === 0 ? true : false}
                name='selected-color'
                id={fill}
                value={fill}
              />
              <div
                className={styles.colorSwatch}
                style={{ backgroundColor: fill }}></div>
              <label htmlFor={fill}>{fill}</label>
            </span>
          ))}
        </div>
      </fieldset>
    </div>
  );
};

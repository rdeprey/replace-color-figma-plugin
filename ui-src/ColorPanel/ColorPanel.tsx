import * as React from 'react';
import styles from './ColorPanel.module.css';
import { Selected } from '../main';
import { ColorList } from '../ColorList/ColorList';

export type OnChangeFunction = (value: string | RGBA) => void;

interface ColorPanelProps {
  options: Selected;
  value: (string | RGBA)[];
  label: string;
  onChange: OnChangeFunction;
  namespace?: string;
}

export const ColorPanel = ({
  options,
  value,
  label,
  onChange
}: ColorPanelProps) => {
  return (
    <div className={styles.colorPanel}>
      <fieldset>
        <legend>{label}</legend>
        {options.colors.solids.length > 0 && (
          <>
            <h2>Solid Colors</h2>
            <ColorList
              options={options.colors.solids}
              value={value}
              onChange={onChange}
              namespace='solids'
            />
          </>
        )}
        {options.colors.gradients.length > 0 && (
          <>
            <h2>Gradient Colors</h2>
            <ColorList
              options={options.colors.gradients}
              // .map((gradient) => {
              //   return gradient.map((g) => g.color);
              // })
              // .flat()}
              value={value}
              onChange={onChange}
              namespace='gradients'
            />
          </>
        )}
      </fieldset>
    </div>
  );
};

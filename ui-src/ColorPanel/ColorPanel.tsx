import * as React from 'react';
import styles from './ColorPanel.module.css';

type OnChangeFunction = (value: string) => void;

interface ColorPanelProps {
  options: string[];
  value: string[];
  label: string;
  onChange: OnChangeFunction;
  namespace?: string;
}

const select = (value?: string, onChange?: OnChangeFunction) => {
  if (value) {
    onChange && onChange(value);
  }
};

export const ColorPanel = ({
  options,
  value,
  label,
  onChange,
  namespace = 'default'
}: ColorPanelProps) => {
  return (
    <div className={styles.colorPanel}>
      <fieldset>
        <legend>{label}</legend>
        <ul
          role='listbox'
          id={`${namespace}_color_selector`}
          aria-activedescendant={`${namespace}_element_${value}`}
          tabIndex={-1}>
          {options.map((option) => {
            return (
              <li
                key={option}
                id={`${namespace}_element_${option}`}
                aria-selected={value.includes(option)}
                role='option'>
                <label>
                  <input
                    type='checkbox'
                    checked={value.includes(option)}
                    value={option}
                    name={`${namespace}_color_to_change`}
                    className={value.includes(option) ? 'checked' : undefined}
                    onChange={() => select(option, onChange)}
                    onKeyDown={(event) => {
                      if (event.key === ' ' || event.key === 'Enter') {
                        select(option, onChange);
                      }
                    }}
                  />
                  <div aria-hidden={true} className={styles.selectionIndicator}>
                    <div
                      className={styles.colorSwatch}
                      style={{ backgroundColor: option }}></div>
                  </div>
                  <span
                    aria-hidden={true}
                    tabIndex={-1}
                    className='visuallyHidden'>
                    {`Color hex code: ${option}`}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
    </div>
  );
};

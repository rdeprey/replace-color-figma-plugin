import * as React from 'react';
import { OnChangeFunction } from '../ColorPanel/ColorPanel';
import styles from '../ColorPanel/ColorPanel.module.css';

type ColorListProps = {
  options: string[] | GradientPaint[];
  value: (string | RGBA)[];
  onChange: OnChangeFunction;
  namespace?: string;
};

const isOptionsStringArray = (
  options: string[] | GradientPaint[]
): options is string[] => {
  return typeof options[0] === 'string';
};

const select = (value?: string | RGBA, onChange?: OnChangeFunction) => {
  if (value) {
    onChange && onChange(value);
  }
};

export const ColorList = ({
  options,
  value,
  onChange,
  namespace = 'default'
}: ColorListProps) => {
  const chosen = options.filter((option: string | RGBA) => {
    return value.includes(option);
  });

  return (
    <ul
      role='listbox'
      id={`${namespace}_color_selector`}
      aria-activedescendant={`${namespace}_element_${value}`}
      tabIndex={-1}>
      {isOptionsStringArray(options) &&
        options.map((option) => {
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
                <span className='visuallyHidden'>Select color {option}</span>
              </label>
            </li>
          );
        })}
      {!isOptionsStringArray(options) &&
        options.map((option, index) => {
          console.log(
            'background: ',
            `linear-gradient(${option.gradientStops
              .map(
                (stop) =>
                  `rgba(${stop.color.r * 255}, ${stop.color.g * 255}, ${
                    stop.color.b * 255
                  }, ${stop.color.a})`
              )
              .join(', ')})`
          );
          console.log('option', option);
          return (
            <li
              key={`gradient-${index}`}
              id={`${namespace}_element_${option}`}
              aria-selected={value.includes(option)}
              role='option'>
              <label>
                <input
                  type='checkbox'
                  checked={value.includes(option)}
                  value={`gradient-${index}`}
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
                    style={{
                      background: `linear-gradient(45deg, ${option.gradientStops
                        .map(
                          (stop) =>
                            `rgba(${stop.color.r * 255}, ${
                              stop.color.g * 255
                            }, ${stop.color.b * 255}, ${stop.color.a})`
                        )
                        .join(', ')})`
                    }}></div>
                </div>
                <span className='visuallyHidden'>
                  Select color {option.gradientStops.toString()}
                </span>
              </label>
            </li>
          );
        })}
    </ul>
  );
};

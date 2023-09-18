import * as React from 'react';
import styles from './Select.module.css';

interface SelectProps {
  options: string[];
  value: string;
  label: string;
  onChange: (value: string) => void;
  namespace?: string;
}

const isSafari = () => {
  const chromeInAgent = navigator.userAgent.indexOf('Chrome') > -1;
  const safariInAgent = navigator.userAgent.indexOf('Safari') > -1;

  // Chrome userAgent includes "Safari" in it as well, we need to account for that.
  return safariInAgent && !chromeInAgent;
};

const registerClosedDropdownHandlers = ({
  setIsDropdownOpen
}: {
  setIsDropdownOpen: (v: boolean) => void;
}) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Down':
      case 'ArrowDown':
      case 'Up':
      case 'ArrowUp':
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsDropdownOpen(true);
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
};

const registerOpenDropdownHandlers = ({
  activeIndex,
  setActiveIndex,
  optionsLength,
  options,
  select
}: {
  activeIndex: number;
  setActiveIndex: (v: number) => void;
  optionsLength: number;
  options: string[];
  select: (value?: string) => void;
}) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    event.preventDefault();

    switch (event.key) {
      case 'Down':
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex(activeIndex + 1 === optionsLength ? 0 : activeIndex + 1);
        break;
      case 'Up':
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex(activeIndex <= 0 ? optionsLength - 1 : activeIndex - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        select(options[activeIndex]);
        break;
      case 'Escape':
      case 'Esc':
        event.preventDefault();
        select();
        break;
      case 'PageUp':
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'PageDown':
      case 'End':
        event.preventDefault();
        setActiveIndex(optionsLength - 1);
        break;
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
};

const useAccessibleDropdown = (
  options: string[],
  value: string,
  onChange: (value: string) => void
) => {
  const [isDropdownOpen, setIsDropdownOpenInternal] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isFocused, setIsFocused] = React.useState(false);
  const listRef = React.useRef<HTMLUListElement>(null);

  const select = (value?: string) => {
    if (value) {
      onChange && onChange(value);
    }
    setIsDropdownOpen(false);
  };

  const setIsDropdownOpen = (v: boolean) => {
    if (v) {
      const selected = options.findIndex((option) => option === value);
      setActiveIndex(selected < 0 ? 0 : selected);
      if (listRef.current && isSafari()) {
        requestAnimationFrame(() => {
          listRef.current?.focus();
        });
      }
    } else {
      if (listRef.current && isSafari()) {
        requestAnimationFrame(() => {
          (listRef.current?.previousSibling as HTMLElement)?.focus();
        });
      }
    }
    setIsDropdownOpenInternal(v);
  };

  // Handle keyboard events
  React.useEffect(() => {
    if (isDropdownOpen) {
      registerOpenDropdownHandlers({
        activeIndex,
        setActiveIndex,
        optionsLength: options.length,
        options,
        select
      });
    } else {
      isFocused &&
        registerClosedDropdownHandlers({
          setIsDropdownOpen
        });
    }
  }, [isDropdownOpen, isFocused, activeIndex, options, select]);

  return {
    isDropdownOpen,
    setIsDropdownOpen,
    activeIndex,
    setActiveIndex,
    select,
    setIsFocused,
    listRef
  };
};

export const Select = ({
  options,
  value,
  label,
  onChange,
  namespace = 'default_select_namespace'
}: SelectProps) => {
  const {
    isDropdownOpen,
    setIsDropdownOpen,
    activeIndex,
    setActiveIndex,
    select,
    setIsFocused,
    listRef
  } = useAccessibleDropdown(options, value, onChange);

  const chosen = options.find((option) => option === value);

  return (
    <div className='select-container'>
      <label id={`${namespace}_label`}>{label}</label>
      <button
        className={styles.selectButton}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        role='combobox'
        aria-haspopup='listbox'
        aria-expanded={isDropdownOpen}
        aria-activedescendant={`${namespace}_element_${value}`}
        aria-controls={`${namespace}_dropdown`}
        aria-label='Choose a color to replace'>
        <div
          className={styles.colorSwatch}
          style={{ backgroundColor: chosen }}></div>{' '}
        {chosen}
      </button>
      <ul
        className={styles.selectDropdown}
        role='listbox'
        ref={listRef}
        id={`${namespace}_dropdown`}
        tabIndex={-1}
        aria-multiselectable={false}>
        {options.map((optionValue, index) => (
          <li
            key={optionValue}
            id={`${namespace}_element_${optionValue}`}
            aria-selected={index === activeIndex}
            onMouseOver={() => setActiveIndex(index)}
            role='option'>
            <label>
              <input
                type='radio'
                name={`${namespace}_radio`}
                checked={chosen === optionValue}
                value={optionValue}
                onChange={() => select(optionValue)}
                className={chosen === optionValue ? 'checked' : undefined}
              />
              <div
                className={styles.colorSwatch}
                style={{ backgroundColor: optionValue }}></div>
              {optionValue}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

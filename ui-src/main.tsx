import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ColorSelector } from './ColorSelector';
import { NewColorPicker } from './NewColorPicker';

const App = () => {
  const [selected, setSelected] = React.useState<null | {
    colors: string[];
  }>(null);
  const [selectedColorToChange, setSelectedColorToChange] = React.useState<
    string | undefined
  >(undefined);
  const [newColor, setNewColor] = React.useState<string | undefined>(undefined);

  console.log(!selectedColorToChange || !newColor);

  onmessage = (event) => {
    if (event.data.pluginMessage.type !== 'selection') {
      setSelected(null);
      return;
    }

    setSelected(event.data.pluginMessage);
    setSelectedColorToChange(event.data.pluginMessage.colors[0]);
  };

  const replaceColor = () => {
    if (!selectedColorToChange || !newColor) {
      return;
    }

    parent.postMessage(
      {
        pluginMessage: {
          type: 'replace-color',
          colorToReplace: selectedColorToChange,
          newColor
        }
      },
      '*'
    );
  };

  return (
    <div>
      {!selected && (
        <p>
          <strong>To start, select at least one item on the canvas.</strong>
        </p>
      )}
      {selected && (
        <>
          <ColorSelector
            selected={selected}
            selectedColorToChange={selectedColorToChange}
            setSelectedColorToChange={setSelectedColorToChange}
          />
          <NewColorPicker setNewColor={setNewColor} />
          <button
            disabled={!selectedColorToChange || !newColor}
            onClick={replaceColor}>
            Replace Color
          </button>
        </>
      )}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

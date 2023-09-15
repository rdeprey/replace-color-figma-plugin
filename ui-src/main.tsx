import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ColorSelector } from './ColorSelector';
import { NewColorPicker } from './NewColorPicker';

const App = () => {
  const [selected, setSelected] = React.useState<null | {
    fills: string[];
    strokes: string[];
  }>(null);
  const [selectedColorToChange, setSelectedColorToChange] = React.useState<
    string | undefined
  >(undefined);
  const [newColor, setNewColor] = React.useState<string | undefined>(undefined);

  console.log(!selectedColorToChange || !newColor);

  onmessage = (event) => {
    setSelected(event.data.pluginMessage);

    const data = [
      ...event.data.pluginMessage.fills,
      ...event.data.pluginMessage.strokes
    ];
    setSelectedColorToChange(data[0]);
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
      {!selected && <p>To start, select an item on the canvas.</p>}
      {selected && (
        <>
          <ColorSelector
            selected={selected}
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

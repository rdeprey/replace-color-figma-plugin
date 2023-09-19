import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ColorSelector } from './ColorSelector';
import { NewColorPicker } from './NewColorPicker';

enum PluginState {
  IDLE,
  SELECTING,
  DONE
}

export type Selected = {
  colors: {
    solids: string[];
    gradients: GradientPaint[];
  };
};

type State = {
  pluginState: PluginState;
  selected: null | Selected;
  newColor: undefined | string;
  selectedColorsToChange: (string | RGBA)[];
  itemsUpdated: null | number;
};

type Action =
  | { pluginState: PluginState.IDLE }
  | {
      pluginState: PluginState.SELECTING;
      selected?: Selected;
      newColor?: string;
      selectedColorsToChange?: (string | RGBA)[];
    }
  | { pluginState: PluginState.DONE; itemsUpdated: number };

export const isRGBA = (color: string | RGBA): color is RGBA => {
  return typeof color === 'object';
};

function appStateReducer(state: State, action: Action): State {
  if (action.pluginState === PluginState.IDLE) {
    return {
      ...state,
      pluginState: action.pluginState,
      selected: { colors: { solids: [], gradients: [] } },
      newColor: undefined,
      selectedColorsToChange: []
    };
  }

  if (action.pluginState === PluginState.SELECTING) {
    return {
      ...state,
      pluginState: action.pluginState,
      selected: action.selected ?? state.selected,
      newColor: action.newColor ?? state.newColor,
      selectedColorsToChange:
        action.selectedColorsToChange ?? state.selectedColorsToChange
    };
  }

  if (action.pluginState === PluginState.DONE) {
    return {
      ...state,
      pluginState: action.pluginState,
      itemsUpdated: action.itemsUpdated,
      selected: { colors: { solids: [], gradients: [] } },
      newColor: undefined,
      selectedColorsToChange: []
    };
  }

  return state;
}

const App = () => {
  const [
    { pluginState, selected, newColor, selectedColorsToChange, itemsUpdated },
    dispatch
  ] = React.useReducer(appStateReducer, {
    pluginState: PluginState.IDLE,
    selected: { colors: { solids: [], gradients: [] } },
    newColor: undefined,
    selectedColorsToChange: [],
    itemsUpdated: null
  });

  const updateSelectedColors = (color: string | RGBA) => {
    dispatch({
      pluginState: PluginState.SELECTING,
      selectedColorsToChange: selectedColorsToChange.includes(color)
        ? selectedColorsToChange.filter((c) => c !== color)
        : [...selectedColorsToChange, color]
    });
  };

  // Handle messages from the plugin code
  onmessage = (event) => {
    const { type } = event.data.pluginMessage;

    switch (type) {
      case 'selection':
        console.log('selection', event.data.pluginMessage.colors);
        dispatch({
          pluginState: PluginState.SELECTING,
          selected: event.data.pluginMessage.colors
        });
        break;
      case 'replacedColors':
        dispatch({
          pluginState: PluginState.DONE,
          itemsUpdated: event.data.pluginMessage.itemsUpdated
        });
        break;
      default:
        dispatch({ pluginState: PluginState.IDLE });
        break;
    }
  };

  // Post a message to the plugin code to start the color replacement process
  const replaceColor = () => {
    if (selectedColorsToChange.length === 0 || !newColor) {
      return;
    }

    parent.postMessage(
      {
        pluginMessage: {
          type: 'replace-color',
          colorToReplace: selectedColorsToChange,
          newColor
        }
      },
      '*'
    );
  };

  return (
    <div>
      {pluginState === PluginState.IDLE && (
        <p>
          <strong>
            To start, select items on the page with the color you'd like to
            change.
          </strong>
        </p>
      )}
      {pluginState === PluginState.SELECTING && (
        <>
          <ColorSelector
            selected={selected}
            selectedColorsToChange={selectedColorsToChange}
            setSelectedColorsToChange={updateSelectedColors}
          />
          <NewColorPicker
            newColor={newColor}
            setNewColor={(color: string) =>
              dispatch({
                pluginState: PluginState.SELECTING,
                newColor: color
              })
            }
          />
          <button
            disabled={selectedColorsToChange.length === 0 || !newColor}
            onClick={replaceColor}>
            Replace Color
          </button>
        </>
      )}
      {pluginState === PluginState.DONE && (
        <>
          <p>
            <strong>
              Colors replaced! There were {itemsUpdated} items updated on the
              page.
            </strong>
          </p>
          <button onClick={() => dispatch({ pluginState: PluginState.IDLE })}>
            Start over
          </button>
        </>
      )}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

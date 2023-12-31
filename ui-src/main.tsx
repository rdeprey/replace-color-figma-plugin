import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ColorSelector } from './ColorSelector/ColorSelector';
import { NewColorPicker } from './NewColorPicker/NewColorPicker';
import { LoadingIndicator } from './LoadingIndicator/LoadingIndicator';
import selectAnImageGifUrl from './images/select-an-item.gif';
import styles from './main.module.css';

enum PluginState {
  IDLE,
  SELECTING,
  REPLACING,
  DONE
}

type State = {
  pluginState: PluginState;
  selected: { colors: string[] };
  newColor: undefined | string;
  selectedColorsToChange: string[];
  itemsUpdated: number;
};

type Action =
  | { pluginState: PluginState.IDLE }
  | {
      pluginState: PluginState.SELECTING;
      selected?: { colors: string[] };
      newColor?: string;
      selectedColorsToChange?: string[];
    }
  | {
      pluginState: PluginState.REPLACING;
    }
  | { pluginState: PluginState.DONE; itemsUpdated: number };

function appStateReducer(state: State, action: Action): State {
  if (action.pluginState === PluginState.IDLE) {
    return {
      ...state,
      pluginState: action.pluginState,
      selected: { colors: [] },
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

  if (action.pluginState === PluginState.REPLACING) {
    return {
      ...state,
      pluginState: action.pluginState
    };
  }

  if (action.pluginState === PluginState.DONE) {
    return {
      ...state,
      pluginState: action.pluginState,
      itemsUpdated: action.itemsUpdated,
      selected: { colors: [] },
      newColor: undefined,
      selectedColorsToChange: []
    };
  }

  return state;
}

// Post a message to the plugin code to start the color replacement process
const replaceColor = (
  selectedColorsToChange: string[],
  newColor: string | undefined
) => {
  if (selectedColorsToChange.length === 0 || !newColor) {
    return;
  }

  parent.postMessage(
    {
      pluginMessage: {
        type: 'replaceColor',
        colorToReplace: selectedColorsToChange,
        newColor
      }
    },
    '*'
  );
};

const App = () => {
  const [
    { pluginState, selected, newColor, selectedColorsToChange, itemsUpdated },
    dispatch
  ] = React.useReducer(appStateReducer, {
    pluginState: PluginState.IDLE,
    selected: { colors: [] },
    newColor: undefined,
    selectedColorsToChange: [],
    itemsUpdated: 0
  });

  const updateSelectedColors = (color: string) => {
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
        dispatch({
          pluginState: PluginState.SELECTING,
          selected: { colors: event.data.pluginMessage.colors }
        });

        // Let's the plugin know when to render the UI
        // to prevent a flash of content if there are items
        // already selected on the page before the plugin loads
        parent.postMessage(
          {
            pluginMessage: {
              type: 'uiReady'
            }
          },
          '*'
        );

        break;
      case 'replacingColors':
        dispatch({ pluginState: PluginState.REPLACING });
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

  const handleRestart = () => {
    // Deselect the items on the page
    parent.postMessage(
      {
        pluginMessage: {
          type: 'deselectItems'
        }
      },
      '*'
    );
    dispatch({ pluginState: PluginState.IDLE });
  };

  const getNumberItemsUpdatedString = () => {
    if (itemsUpdated === 1) {
      return 'was 1 item';
    }

    return `were ${itemsUpdated} items`;
  };

  return (
    <div className={styles.wrapper} aria-live='polite'>
      {pluginState === PluginState.IDLE && (
        <>
          <p>
            <strong>
              To start, select items on the page with the color(s) you'd like to
              change.
            </strong>
          </p>
          <img style={{ width: '100%' }} src={selectAnImageGifUrl} alt='' />
        </>
      )}
      {pluginState === PluginState.SELECTING && (
        <>
          <p>
            <em>Colors will be updated only on the current page.</em>
          </p>
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
            onClick={() => replaceColor(selectedColorsToChange, newColor)}>
            Replace Color
          </button>
        </>
      )}
      {pluginState === PluginState.REPLACING && <LoadingIndicator />}
      {pluginState === PluginState.DONE && (
        <>
          <p>
            <strong>
              Colors replaced! There {getNumberItemsUpdatedString()} updated on
              the page.
            </strong>
          </p>
          <button onClick={handleRestart}>Start over</button>
        </>
      )}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

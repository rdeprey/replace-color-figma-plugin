import colorsea from 'colorsea';
import { clone, canHaveFill, canHaveStroke } from './utils';

// Store the notification in the global scope so that it can be referenced
// in multiple sub-scopes
let notification: NotificationHandler;

const replaceColor = (colors: string[], newColor: string): void => {
  const updatedNodes = new Set<string>();

  colors.forEach((color) => {
    const rgbCurrentColor = colorsea(`${color}`).rgb();

    figma.currentPage.children.forEach((node: SceneNode) => {
      const supportsFills = canHaveFill(node);
      const supportsStrokes = canHaveStroke(node);

      if (!supportsFills && !supportsStrokes) {
        return;
      }

      if (supportsFills) {
        const fills = clone(node.fills);

        if (fills) {
          fills.forEach((fill: any) => {
            if (fill.type !== 'SOLID') {
              return;
            }

            const rgbColor = [
              Math.round(fill.color.r * 255),
              Math.round(fill.color.g * 255),
              Math.round(fill.color.b * 255)
            ];

            if (
              rgbColor[0] === rgbCurrentColor[0] &&
              rgbColor[1] === rgbCurrentColor[1] &&
              rgbColor[2] === rgbCurrentColor[2]
            ) {
              fill.color.r = parseInt(newColor.slice(1, 3), 16) / 255;
              fill.color.g = parseInt(newColor.slice(3, 5), 16) / 255;
              fill.color.b = parseInt(newColor.slice(5, 7), 16) / 255;

              updatedNodes.add(node.id);
            }
          });

          node.fills = fills as Paint[];
        }
      }

      if (supportsStrokes) {
        const strokes = clone(node.strokes);

        if (strokes) {
          strokes.forEach((stroke: any) => {
            if (stroke.type !== 'SOLID') {
              return;
            }

            const rgbColor = [
              Math.round(stroke.color.r * 255),
              Math.round(stroke.color.g * 255),
              Math.round(stroke.color.b * 255)
            ];

            if (
              rgbColor[0] === rgbCurrentColor[0] &&
              rgbColor[1] === rgbCurrentColor[1] &&
              rgbColor[2] === rgbCurrentColor[2]
            ) {
              stroke.color.r = parseInt(newColor.slice(1, 3), 16) / 255;
              stroke.color.g = parseInt(newColor.slice(3, 5), 16) / 255;
              stroke.color.b = parseInt(newColor.slice(5, 7), 16) / 255;

              updatedNodes.add(node.id);
            }
          });

          node.strokes = strokes as Paint[];
        }
      }
    });
  });

  figma.ui.postMessage({
    type: 'replacedColors',
    itemsUpdated: updatedNodes.size
  });
};

const getSelectedColors = () => {
  // Get the fill colors, convert them to hex,
  // and add them to a set to remove duplicates
  const colors = new Set<string>();

  const colorsInSelection = figma.getSelectionColors();

  if (!colorsInSelection || colorsInSelection.paints.length === 0) {
    return;
  }

  colorsInSelection.paints.forEach((color: Paint) => {
    // Let the user know that gradients aren't supported if they're
    // a part of the user's selection
    if (color.type.startsWith('GRADIENT')) {
      notification = figma.notify(
        `The plugin doesn't currently support gradients.`
      );
      return;
    }

    if (color.type !== 'SOLID') {
      return;
    }

    colors.add(
      colorsea
        .rgb(color.color.r * 255, color.color.g * 255, color.color.b * 255)
        .hex()
    );
  });

  return colors;
};

const getColorsAndPostToUi = (): void | undefined => {
  const colors = getSelectedColors();

  if (!colors || colors.size === 0) {
    return;
  }

  figma.ui.postMessage({
    type: 'selection',
    colors: Array.from(colors)
  });
};

const main = () => {
  if (figma.editorType === 'figma') {
    figma.on('run', () => {
      // Show initial UI if there aren't any items already selected
      // when the plugin starts
      if (figma.currentPage.selection.length === 0) {
        figma.ui.show();
      } else {
        // Otherwise, get the colors from the selected items
        // and let the UI post a `uiReady` message when it's
        // ready to show the UI in the SELECTING state
        getColorsAndPostToUi();
      }
    });

    figma.on('selectionchange', () => {
      // If there's a notification displayed, cancel it before updating the colors
      // displayed from the new item selection or sending a deselection event to
      // the UI
      notification && notification.cancel && notification.cancel();
      if (figma.currentPage.selection.length >= 1) {
        getColorsAndPostToUi();
      } else {
        figma.ui.postMessage({
          type: 'deselection'
        });
      }
    });

    figma.ui.onmessage = (message) => {
      if (message.type === 'replaceColor') {
        figma.ui.postMessage({
          type: 'replacingColors'
        });

        return replaceColor(message.colorToReplace, message.newColor);
      }

      if (message.type === 'deselectItems') {
        return (figma.currentPage.selection = []);
      }

      if (message.type === 'uiReady') {
        return figma.ui.show();
      }
    };

    figma.showUI(__html__, { width: 325, height: 220, visible: false });
  }
};

main();

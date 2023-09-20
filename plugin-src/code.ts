import colorsea from 'colorsea';
import { clone } from './utils';

const canHaveFill = (
  node: SceneNode
): node is
  | RectangleNode
  | FrameNode
  | BooleanOperationNode
  | VectorNode
  | StarNode
  | LineNode
  | EllipseNode
  | PolygonNode
  | TextNode
  | StickyNode
  | ShapeWithTextNode
  | StampNode
  | SectionNode
  | HighlightNode
  | WashiTapeNode
  | TableNode => {
  if (
    node.type !== 'SLICE' &&
    node.type !== 'GROUP' &&
    node.type !== 'CONNECTOR' &&
    node.type !== 'CODE_BLOCK' &&
    node.type !== 'WIDGET' &&
    node.type !== 'INSTANCE' &&
    node.type !== 'COMPONENT' &&
    node.type !== 'COMPONENT_SET' &&
    node.type !== 'EMBED' &&
    node.type !== 'LINK_UNFURL' &&
    node.type !== 'MEDIA'
  ) {
    return true;
  }

  return false;
};

const canHaveStroke = (
  node: SceneNode
): node is
  | RectangleNode
  | FrameNode
  | BooleanOperationNode
  | VectorNode
  | StarNode
  | LineNode
  | EllipseNode
  | PolygonNode
  | TextNode
  | ShapeWithTextNode
  | StampNode
  | HighlightNode
  | WashiTapeNode => {
  if (!canHaveFill(node)) {
    return false;
  }

  if (
    node.type !== 'STICKY' &&
    node.type !== 'SECTION' &&
    node.type !== 'TABLE'
  ) {
    return true;
  }

  return false;
};

const replaceColor = (colors: string[], newColor: string) => {
  const updatedNodes = new Set();

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

    figma.ui.postMessage({
      type: 'replacedColors',
      itemsUpdated: updatedNodes.size
    });
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

const getColorsAndPostToUi = () => {
  const colors = getSelectedColors();

  if (!colors || colors.size === 0) {
    return;
  }

  figma.ui.postMessage({
    type: 'selection',
    colors: Array.from(colors)
  });
};

if (figma.editorType === 'figma') {
  figma.on('run', () => {
    getColorsAndPostToUi();
  });

  figma.on('selectionchange', () => {
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
      return replaceColor(message.colorToReplace, message.newColor);
    }

    if (message.type === 'deselectItems') {
      return (figma.currentPage.selection = []);
    }
  };

  figma.showUI(__html__, { width: 325, height: 220 });
}

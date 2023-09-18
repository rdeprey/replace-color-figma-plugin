import colorsea from 'colorsea';

function clone(val: any): { [key: string]: any } | null {
  const type = typeof val;
  if (val === null) {
    return null;
  } else if (
    type === 'undefined' ||
    type === 'number' ||
    type === 'string' ||
    type === 'boolean'
  ) {
    return val;
  } else if (type === 'object') {
    if (val instanceof Array) {
      return val.map((x) => clone(x));
    } else if (val instanceof Uint8Array) {
      return new Uint8Array(val);
    } else {
      let o: { [key: string]: any } = {};
      for (const key in val) {
        o[key] = clone(val[key]);
      }
      return o;
    }
  }
  throw 'unknown';
}

const replaceColor = (color: string, newColor: string) => {
  const rgbCurrentColor = colorsea(`${color}`).rgb();

  const nodes = figma.currentPage.findAll((node: SceneNode) => {
    if (node.type === 'RECTANGLE') {
      const fills = clone(node.fills);
      const strokes = clone(node.strokes);

      if (!fills && !strokes) {
        return false;
      }

      return true;
    }

    return false;
  });

  if (nodes.length === 0) {
    return;
  }

  nodes.forEach((node: SceneNode) => {
    if (node.type === 'RECTANGLE') {
      const fills = clone(node.fills);
      const strokes = clone(node.strokes);

      if (!fills && !strokes) {
        return;
      }

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
          }
        });

        node.fills = fills as Paint[];
      }

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
          }
        });

        node.strokes = strokes as Paint[];
      }
    }
  });
};

if (figma.editorType === 'figma') {
  figma.showUI(__html__);

  figma.on('selectionchange', () => {
    // TODO: Handle more shapes and types
    if (
      figma.currentPage.selection.length >= 1 &&
      figma.currentPage.selection[0].type === 'RECTANGLE'
    ) {
      // Get the fill colors and convert them to hex
      const colors = new Set();

      figma.currentPage.selection.forEach((selection: any) => {
        const fills = clone(selection.fills);
        if (fills) {
          fills.forEach((fill: any) => {
            colors.add(
              colorsea
                .rgb(fill.color.r * 255, fill.color.g * 255, fill.color.b * 255)
                .hex()
            );
          });
        }

        const strokes = clone(selection.strokes);
        if (strokes) {
          strokes.forEach((stroke: any) => {
            colors.add(
              colorsea
                .rgb(
                  stroke.color.r * 255,
                  stroke.color.g * 255,
                  stroke.color.b * 255
                )
                .hex()
            );
          });
        }
      });

      figma.ui.postMessage({
        type: 'selection',
        colors: Array.from(colors)
      });
    } else {
      figma.ui.postMessage({
        type: 'deselection'
      });
    }
  });

  figma.ui.onmessage = (message) => {
    console.log('got this from the UI', message);
    replaceColor(message.colorToReplace, message.newColor);
  };
}

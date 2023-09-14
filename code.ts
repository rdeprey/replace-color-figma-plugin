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
  console.log('in replace color function');
  const rgbNewColor = colorsea(`${newColor}`).rgb();

  const nodes = figma.currentPage.findAll((node: SceneNode) => {
    if (node.type === 'RECTANGLE') {
      const fills = clone(node.fills);

      if (!fills) {
        return false;
      }

      return true;
    }

    return false;
  });

  console.log('nodes: ', nodes);

  if (nodes.length === 0) {
    return;
  }

  nodes.forEach((node: SceneNode) => {
    if (node.type === 'RECTANGLE') {
      const fills = clone(node.fills);

      console.log('fills', fills);

      if (!fills) {
        return;
      }

      const rgbNewColor = colorsea(`${newColor}`).rgb();
      console.log('rgbNewColor', rgbNewColor);

      fills.forEach((fill: any) => {
        if (fill.type !== 'SOLID') {
          return;
        }

        console.log('fill', fill);
        const rgbColor = [
          fill.color.r * 255,
          fill.color.g * 255,
          fill.color.b * 255
        ];

        console.log('rgbColor', rgbColor);

        if (
          rgbColor[0] !== rgbNewColor[0] ||
          rgbColor[1] !== rgbNewColor[1] ||
          rgbColor[2] !== rgbNewColor[2]
        ) {
          fill.color.r = parseInt(newColor.slice(1, 3), 16) / 255;
          fill.color.g = parseInt(newColor.slice(3, 5), 16) / 255;
          fill.color.b = parseInt(newColor.slice(5, 7), 16) / 255;
        }
      });

      node.fills = fills as Paint[];
    }
  });

  console.log('made it to resetting the selection values');
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
      const fillColors: any[] = [];

      figma.currentPage.selection.forEach((selection: any) => {
        const fills = clone(selection.fills);

        if (!fills) {
          return;
        }

        fills.forEach((fill: any) => {
          fillColors.push(
            colorsea
              .rgb(fill.color.r * 255, fill.color.g * 255, fill.color.b * 255)
              .hex()
          );
        });
      });

      figma.ui.postMessage({
        fills: fillColors,
        strokes: figma.currentPage.selection[0].strokes
      });
    }
  });

  figma.ui.onmessage = (message) => {
    console.log('got this from the UI', message);
    replaceColor(message.color, '#00FF00');
  };
}

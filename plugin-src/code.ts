import colorsea from 'colorsea';

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

const isNotGradientPaint = (paint: Paint): paint is SolidPaint => {
  return paint.type !== 'GRADIENT_LINEAR' && paint.type !== 'GRADIENT_RADIAL';
};

const isGradientPaint = (paint: Paint): paint is GradientPaint => {
  return paint.type === 'GRADIENT_LINEAR' || paint.type === 'GRADIENT_RADIAL';
};

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

const replaceColor = (colors: string[], newColor: string) => {
  colors.forEach((color) => {
    const rgbCurrentColor = colorsea(`${color}`).rgb();

    let updatedNodes = 0;
    figma.currentPage.children.forEach((node: SceneNode) => {
      if (canHaveFill(node)) {
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

              updatedNodes++;
            }
          });

          node.fills = fills as Paint[];
        }
      }

      if (canHaveStroke(node)) {
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

              updatedNodes++;
            }
          });

          node.strokes = strokes as Paint[];
        }
      }
    });

    figma.ui.postMessage({
      type: 'replacedColors',
      itemsUpdated: updatedNodes
    });
  });
};

if (figma.editorType === 'figma') {
  figma.showUI(__html__);

  figma.on('selectionchange', () => {
    if (
      figma.currentPage.selection.length >= 1 &&
      canHaveFill(figma.currentPage.selection[0])
    ) {
      console.log('selection changed', figma.currentPage.selection[0].fills);
    }
    /**
     * If there's only one item selected and it can't have fills (or strokes since strokes expand
     * on the types that don't support fills), then don't show send a message and change the UI.
     */
    if (
      figma.currentPage.selection.length === 1 &&
      !canHaveFill(figma.currentPage.selection[0])
    ) {
      return;
    }

    if (figma.currentPage.selection.length >= 1) {
      // Get the fill colors and convert them to hex
      const colors = {
        solids: new Set<string>(),
        gradients: new Set<GradientPaint>()
      };

      figma.currentPage.selection.forEach((selection: any) => {
        // Don't attempt to show colors for nodes that can't have fills
        if (canHaveFill(selection)) {
          const fills = clone(selection.fills) as Paint[];
          if (fills) {
            fills.forEach((fill) => {
              if (isNotGradientPaint(fill)) {
                colors.solids.add(
                  colorsea
                    .rgb(
                      fill.color.r * 255,
                      fill.color.g * 255,
                      fill.color.b * 255
                    )
                    .hex()
                );
              } else if (isGradientPaint(fill)) {
                colors.gradients.add(fill);
              }
            });
          }
        }

        // Don't attempt to show colors for nodes that can't have strokes
        if (canHaveStroke(selection)) {
          const strokes = clone(selection.strokes) as Paint[];
          if (strokes) {
            strokes.forEach((stroke: Paint) => {
              if (isNotGradientPaint(stroke)) {
                colors.solids.add(
                  colorsea
                    .rgb(
                      stroke.color.r * 255,
                      stroke.color.g * 255,
                      stroke.color.b * 255
                    )
                    .hex()
                );
              } else if (isGradientPaint(stroke)) {
                colors.gradients.add(stroke);
              }
            });
          }
        }

        figma.ui.postMessage({
          type: 'selection',
          colors: {
            colors: {
              solids: Array.from(colors.solids),
              gradients: Array.from(colors.gradients)
            }
          }
        });
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

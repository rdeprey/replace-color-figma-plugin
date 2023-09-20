export const canHaveFill = (
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

export const canHaveStroke = (
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

export function clone(val: any): { [key: string]: any } | null {
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

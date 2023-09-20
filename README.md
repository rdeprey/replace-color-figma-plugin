# Replace Color Figma Plugin

A Figma plugin to replace selected colors on a page

<video width="800" height="400" controls muted="true">
  <source src="app-data/videos/demo.mp4" type="video/mp4">
</video>

## Features

This plugin can be used to:

- Select one or more items on a page that support fills and strokes
- Select one or more colors from the selected items to change
- Choose a new color and replace the selected colors with it

### Supported

- Selection of multiple items to get colors
- Solid colors used for item fills and strokes
- The following items that support fills and strokes:
  - Rectangles
  - Star
  - Line
  - Ellipse
  - Polygon
  - Text
  - Shapes with Text
  - Vectors
  - Frames
  - Sticky Nodes
  - Stamp Nodes
  - Highlights
  - Washi Tape
  - Tables
- Updates all items with the matching color(s) on the current page

### Unsupported

- The following items are unsupported:
  - Components

### Coming Soon

- Support for selecting and replacing gradients in fills and strokes

## Running the Plugin for Local Development

1. Install the local project dependencies by running `npm i` in the root directory
2. Run `npm run build:watch` to run the plugin in watch mode. The plugin will update every time you save your changes.
3. In the Figma desktop app:

- Under the Plugins menu, go to Development > Import plugin from manifest
- Select the `manifest.json` file for this plugin from your local computer
- In the Plugin menu that appears, double click on "Replace Color" to launch the plugin

Further instructions can be found at [https://www.figma.com/plugin-docs/plugin-quickstart-guide/](https://www.figma.com/plugin-docs/plugin-quickstart-guide/).

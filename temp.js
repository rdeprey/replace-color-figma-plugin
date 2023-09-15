let selectedColor = null;

onmessage = (event) => {
  console.log('got this from the plugin code', event.data.pluginMessage);

  if (event.data.pluginMessage) {
    const bodyElem = document.getElementsByTagName('body')[0];

    // Clear current content
    while (bodyElem.firstChild) {
      bodyElem.removeChild(bodyElem.firstChild);
    }

    const paragraph = document.createElement('p');
    paragraph.innerText = 'Select a color to replace:';

    bodyElem.appendChild(paragraph);

    if (event.data.pluginMessage.fills.length > 0) {
      const container = document.createElement('div');
      container.classList.add('container');

      const subHeader = document.createElement('p');
      subHeader.innerText = 'Fills:';
      container.appendChild(subHeader);

      event.data.pluginMessage.fills.forEach((fill, index) => {
        const button = document.createElement('button');
        button.setAttribute('aria-checked', index === 0 ? true : false);

        if (index === 0) {
          selectedColor = fill;
        }

        const divRect = document.createElement('div');
        divRect.setAttribute(
          'style',
          `background-color: ${fill}; width: 10px; height: 10px; display: inline-block;`
        );

        button.appendChild(divRect);
        button.appendChild(document.createTextNode(` ${fill}`));

        button.addEventListener('click', () => {
          button.setAttribute('aria-checked', true);
          selectedColor = fill;
        });

        container.appendChild(button);
      });

      bodyElem.appendChild(container);
    }

    const newColorLabel = document.createElement('label');
    newColorLabel.setAttribute('for', 'new-color');
    newColorLabel.innerText = 'New color:';

    const newColorInput = document.createElement('input');
    newColorInput.setAttribute('type', 'color');
    newColorInput.setAttribute('id', 'new-color');
    newColorInput.setAttribute('name', 'new-color');
    newColorInput.setAttribute('value', '#000000');

    const newColorContainer = document.createElement('div');
    newColorContainer.appendChild(newColorLabel);
    newColorContainer.appendChild(newColorInput);
    bodyElem.appendChild(newColorContainer);

    const replaceButton = document.createElement('button');
    replaceButton.innerText = 'Replace';
    replaceButton.addEventListener('click', () => {
      const newColor = newColorInput.value;

      parent.postMessage(
        {
          pluginMessage: {
            type: 'replace-color',
            colorToReplace: selectedColor,
            newColor: newColor
          }
        },
        '*'
      );
    });

    bodyElem.appendChild(replaceButton);
  }
};

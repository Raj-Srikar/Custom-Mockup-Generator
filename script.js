var allColors,
  myData = {},
  designImage;

/**
 * Retrieves user inputs from the form and stores them in the 'myData' object.
 * 
 * @returns {void}
 */
function getInputs() {
  var data = new FormData(document.querySelector("form"));
  let mockups = [];
  for (const [key, value] of data) {
    myData[key] = value;
  }
  data.forEach(function(value, key) {
    if (key === 'mockups') {
      mockups.push(value);
    }
  });
  myData.mockups = mockups;
  console.log(myData);
}

/**
 * Populates the color options in the form with the provided colors.
 * 
 * @param {Object} colors - An object containing color names as keys and their corresponding hex values as values.
 * @returns {void}
 */
function populateColors(colors) {
  let cg = document.querySelector(".color-group");
  let html = "";

  // Iterate over the colors object
  for (const key in colors) {
    if (colors.hasOwnProperty(key)) {
      // Generate HTML for each color option
      html += `<label for="${key.replaceAll(" ", "-")}">
                <input type="radio" id="${key.replaceAll(
                  " ",
                  "-"
                )}" name="color" value="${key}" required>
                <div class="color-radio">
                  <div class="color-preview" style="background-color: ${
                    colors[key]
                  }; border: 1px solid black"></div>
                  <span>${key}</span>
                </div>
              </label>`;
    }
  }

  // Generate HTML for the custom color option
  html += `<label for="custom-color" onclick="this.querySelector('.color-preview').click();">
                  <input type="radio" id="custom-color" name="color" value="custom" required>
                  <div class="color-radio">
                    <input type="color" name="customColor" class="color-preview" onclick="document.querySelector('#custom-color').click();">
                    <span>Custom</span>
                  </div>
                </label>`;

  // Update the color options in the form
  cg.innerHTML = html;
}

/**
 * Populates the mockup options in the form with the provided images.
 *
 * @param {Array} images - An array of image file names.
 * @returns {void}
 */
function populateImages(images) {
  // Select the mockup group element
  let cg = document.querySelector(".mockup-group");

  // Initialize an empty string for HTML
  let html = "";

  // Iterate over the images array
  for (const c in images) {
    // Extract the image name without extension
    let name = images[c].split(".")[0];

    // Generate HTML for each mockup option
    html += `<label for="${name.replaceAll(" ", "-")}">
                <input type="checkbox" id="${name.replaceAll(
                  " ",
                  "-"
                )}" name="mockups" value="${images[c]}">
                <img src="${"./custom-mockups/" + images[c]}" class="image-chk">
            </label>`;
  }

  // Update the mockup options in the form
  cg.innerHTML = html;
}

// Fetch the color data from the colors.json file
fetch("./colors.json")
  .then((response) => response.json())
  .then((data) => {
    allColors = data;
    populateColors(data);
  });

// Fetch the mockup data from the mockups.json file
fetch("./custom-mockups/mockups.json")
  .then((response) => response.json())
  .then((data) => {
    populateImages(data);
  });

/**
 * Event listener for the design file input field.
 * Reads the selected design file and updates the designImage variable.
 */
document.querySelector("#design").addEventListener("change", (ev) => {
  const files = ev.target.files;
  // If no design file uploaded
  if (!files || !files[0]) {
    // Change file input color back to default
    ev.target.classList.remove('uploaded');
    
    // Remove the file name on the file input and set to default text
    document.querySelector('#choose').innerHTML = '&lArr;&ensp; Choose / Drop your Design file HERE &ensp;&rArr;';
    return alert("No file choosen");
  }
  [...files].forEach(readImage);
  ev.target.classList.add('uploaded');
});



var activeLayerScript,
  imgSection = document.querySelector('section.output'),
  layerName,
  loading = false,
  wnd,
  timer,
  mokcupNo = 0,
  openSmartObject = false,
  isSmartObject = false
  end = false;

/**
 * Called when the iframe with Photopea is fully loaded.
 * It sets the contentWindow of the iframe as a global variable 'wnd' and adds an event listener for the 'message' event.
 *
 * @param {Object} pp - The iframe element or its contentWindow object.
 * @returns {void}
 */
function iframeLoaded(pp) {
  wnd = pp.contentWindow;
  window.addEventListener("message", ppReady);
}

/**
 * Waits for a specified amount of time and then sends a script to the Photopea window.
 * This function is used to ensure that the script is sent after the Photopea window has fully loaded and is ready to receive messages.
 *
 * @param {number} ms - The number of milliseconds to wait before sending the script.
 * @returns {void}
 */
function waitAndCheckLayerName(ms) {
  window.setTimeout(function () {
    console.log("sending name layers script");
    wnd.postMessage(activeLayerScript, "*");
  }, ms);
}

/**
 * Reads the selected design file and updates the designImage variable.
 *
 * @param {File} file - The design file selected by the user.
 * @returns {void}
 */
function readImage(file) {
  // Check if the file type is an image (png, jpg, or gif)
  if (!/^image\/(png|jpe?g|gif)$/.test(file.type)) return;

  // Update the file name on the file input
  document.querySelector('#choose').innerHTML = file.name;
  
  // Create a new FileReader instance
  const reader = new FileReader();

  // Add an event listener for the 'load' event
  reader.addEventListener("load", () => {
    // Update the designImage variable with the data URL of the loaded image
    designImage = reader.result;
  });

  // Start reading the file as a data URL
  reader.readAsDataURL(file);
};

/**
 * Function to handle postMessage events from the Photopea iframe.
 * @param {MessageEvent} e - The postMessage event.
 */
function ppReady(e) {
  console.log(e);

  // Check if the event data is not an ArrayBuffer and contains the "firstLayer=" string
  if (
    loading &&
    e.data.constructor.name !== "ArrayBuffer" &&
    e.data.indexOf("firstLayer=") == 0
  ) {
    // Extract the layer name from the event data
    var name = e.data.substring("firstLayer=".length);

    // If layerName is null, it means we are opening the PSD file
    if (layerName == null) {
      layerName = name;
      
      // Create a new XMLHttpRequest to fetch the PSD file
      var request = new XMLHttpRequest();
      request.open(
        "GET",
        window.location.href +
          "/custom-mockups/" +
          myData.mockups[mokcupNo].split(".")[0] +
          ".psd",
        true
      );
      request.responseType = "blob";

      // When the PSD file is loaded, open it in Photopea
      request.onload = function () {
        var reader = new FileReader();
        reader.readAsDataURL(request.response);
        reader.onload = function (e) {
          wnd.postMessage(
            'app.open("' + e.target.result + '", null, true);',
            "*"
          );
          waitAndCheckLayerName(50);
        };
      };
      request.send();
    }
    else {
      // If the smart object is not yet opened and the first layer is named as "Design"
      if (!openSmartObject && !isSmartObject && name == "Design") {
        layerName = name;
        openSmartObject = true;

        // Open the "Mockup Design Canvas" smart object layer in Photopea and load the uploaded design image from the data URL inside the smart object
        wnd.postMessage(
          `var l = app.activeDocument.layers[0].layers.getByName("Mockup Design Canvas");
                                    app.activeDocument.activeLayer = l;
                                    executeAction(stringIDToTypeID("placedLayerEditContents"));
                                    app.activeDocument.activeLayer.visible = false;
                                    app.open("${designImage}", null, true);`,
          "*"
        );
        waitAndCheckLayerName(50);
      }
      // If the smart object is opened, and the first layer name is "image"
      else if (openSmartObject && name == "image") {
        isSmartObject = true;
        openSmartObject = false;

        // Resize the smart object to fit the size of design canvas
        wnd.postMessage(
          `var design=app.activeDocument.activeLayer;
            var docWidth = app.activeDocument.width;
            var theBounds = app.activeDocument.activeLayer.bounds;
            var designWidth = theBounds[2] - theBounds[0];

            var percent = ((docWidth-designWidth)/designWidth)*100+100;
            design.resize(percent,percent,AnchorPosition.MIDDLECENTER);
                                    ${
                                      // Resize and position the smart object layer if specified by user
                                      Number(myData.xOff) ||
                                      Number(myData.yOff) ||
                                      Number(myData.scale)
                                        ? `design.translate(${Number(
                                            myData.xOff
                                          )},${Number(myData.yOff)});
                                       design.resize(${
                                         100 - Number(myData.scale)
                                       },${
                                            100 - Number(myData.scale)
                                          },AnchorPosition.MIDDLECENTER);
                                      `
                                        : ""
                                    }
                                    app.activeDocument.save();
                                    app.activeDocument.close();
                                    `,
          "*"
        );
        waitAndCheckLayerName(50);
      } else if (isSmartObject && name == "Design") {
        loading = false;
        isSmartObject = false;

        // Set the color of the fill layer to the selected color
        let hex =
          myData.color == "custom"
            ? myData.customColor
            : allColors[myData.color];
        wnd.postMessage(
          `function setColorOfFillLayer( sColor ) {
                                    var desc = new ActionDescriptor();
                                        var ref = new ActionReference();
                                        ref.putEnumerated( stringIDToTypeID('contentLayer'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
                                    desc.putReference( charIDToTypeID('null'), ref );
                                        var fillDesc = new ActionDescriptor();
                                            var colorDesc = new ActionDescriptor();
                                            colorDesc.putDouble( charIDToTypeID('Rd  '), sColor.rgb.red );
                                            colorDesc.putDouble( charIDToTypeID('Grn '), sColor.rgb.green );
                                            colorDesc.putDouble( charIDToTypeID('Bl  '), sColor.rgb.blue );
                                        fillDesc.putObject( charIDToTypeID('Clr '), charIDToTypeID('RGBC'), colorDesc );
                                    desc.putObject( charIDToTypeID('T   '), stringIDToTypeID('solidColorLayer'), fillDesc );
                                    executeAction( charIDToTypeID('setd'), desc, DialogModes.NO );
                                }
                                app.activeDocument.activeLayer = app.activeDocument.layers[1].layers.getByName("Product Color");
                                var sColor =  new SolidColor;
                                sColor.rgb.hexValue = '${hex}';
                                setColorOfFillLayer( sColor );
                                app.activeDocument.saveToOE("png");
                                app.activeDocument.close();
                                `,
          "*"
        );
      } 
      // If the Photopea is processing the previous request
      else {
        timer++;
        console.log("waiting for " + timer * 50 + " ms");
        if (timer < 300) waitAndCheckLayerName(50);
        else loading = false;
      }
    }
  }
  // If the message data returned is an ArrayBuffer, it means the output image has returned
  else if (e.data.constructor.name === "ArrayBuffer") {
    // Get the output image as base64 data URL
    var img = "data:image/png;base64," + _arrayBufferToBase64(e.data);

    // Create link and image tags for downloading the output image and append them to the output section
    let link = document.createElement("a"),
    imgTag = document.createElement("img");
    imgTag.classList.add("output-image");
    imgTag.src = img;
    link.setAttribute("href", img);
    // link.setAttribute("target","_blank");
    link.appendChild(imgTag);
    imgSection.appendChild(link);

    // Increment the mockup counter
    mokcupNo++;

    // Start the next iteration in case of multiple mockups
    if (mokcupNo < myData.mockups.length) {
      loading = true;
      layerName = null;
      wnd.postMessage(activeLayerScript, "*");
    }
    // Remove the "Generating" message and scroll to the bottom at the end of the iterations
    else {
      document.querySelector("#generating").style = "";
      document.querySelector("#download").style = "";
      document.body.style = "";
      setTimeout(
        () =>
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
          }),
        100
      );
    }
  }
}

/**
 * Converts an ArrayBuffer to a base64 encoded string.
 *
 * @param {ArrayBuffer} buffer - The ArrayBuffer to convert.
 * @returns {string} The base64 encoded string.
 */
function _arrayBufferToBase64(buffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Handles the form submission event.
 * Fetches user inputs, resets the state, and starts the image processing.
 *
 * @returns {void}
 */
function formSubmit() {
  // Fetch user inputs
  getInputs();

  // Reset the mockup counter
  mokcupNo = 0;

  // Clear the output section
  imgSection.innerHTML = '';

  // Hide the download button
  document.querySelector("#download").style.display = "none";

  document.body.style.overflow = "hidden";

  // Check if any mockup is selected
  if (myData.mockups.length === 0) {
    alert("Please select atleast one mockup");
    return;
  }

  // Check if the application is already processing an image
  if (loading) {
    return;
  }

  // Reset the layer name, loading status, and timer
  layerName = null;
  loading = true;
  timer = 0;

  // Show the loading indicator
  document.querySelector("#generating").style.display = "flex";

  // Prepare the script to get the first layer name
  console.log("sending name layers script");
  activeLayerScript = `app.echoToOE("firstLayer="+(
      app.documents.length == 0?0:
      app.activeDocument.layers[0].name));`;

  // Send the script to the Photopea window
  wnd.postMessage(activeLayerScript, "*");
}

/**
 * Function to download the output mockup files generated.
 * It creates temporary anchor tags for each output image, sets their download attributes,
 * and triggers a click event to initiate the download.
 *
 * @returns {void}
 */
function downloadOutputFiles() {
  // Select all anchor tags within the output section
  let aTags = document.querySelectorAll('.output>*');

  // Iterate over each mockup anchor tag
  for (let i = 0; i < aTags.length; i++){
    // Create a new temporary anchor tag
    let tempLink = document.createElement('a');

    // Set the href attribute of the temporary anchor tag to the href attribute of the current anchor tag
    tempLink.setAttribute('href', aTags[i].href);

    // Set the download attribute of the temporary anchor tag to a dynamically generated filename
    tempLink.setAttribute(
      "download",
      myData.design.name.split(".")[0] + "-mockup-"+(i+1)+".png"
    );
    tempLink.style.display = 'none';
    
    // Add and trigger a click event on the temporary anchor tag to initiate the download and remove it from the document
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
  }
}
var allColors,
  myData = {},
  designImage;

function getInputs() {
  var data = new FormData(document.querySelector("form"));
  for (const [key, value] of data) {
    myData[key] = value;
  }
  console.log(myData);
}

function populateColors(colors) {
  let rg = document.querySelector(".color-rg");
  let html = "";
  for (const key in colors) {
    if (colors.hasOwnProperty(key)) {
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

  html += `<label for="custom-color" onclick="this.querySelector('.color-preview').click();">
                  <input type="radio" id="custom-color" name="color" value="custom" required>
                  <div class="color-radio">
                    <input type="color" name="customColor" class="color-preview" onclick="document.querySelector('#custom-color').click();">
                    <span>Custom</span>
                  </div>
                </label>`;
  rg.innerHTML = html;
}

function populateImages(images) {
  let rg = document.querySelector(".image-rg");
  let html = "";
  for (const c in images) {
    let name = images[c].split(".")[0];
    html += `<label for="${name.replaceAll(" ", "-")}">
                <input type="radio" id="${name.replaceAll(
                  " ",
                  "-"
                )}" name="image" value="${images[c]}" required>
                <img src="${"/custom-mockups/" + images[c]}" class="image-radio">
            </label>`;
  }
  rg.innerHTML = html;
}

fetch("/colors.json")
  .then((response) => response.json())
  .then((data) => {
    allColors = data;
    populateColors(data);
  });

fetch("/custom-mockups/mockups.json")
  .then((response) => response.json())
  .then((data) => {
    populateImages(data);
  });

document.querySelector("#design").addEventListener("change", (ev) => {
  const files = ev.target.files;
  if (!files || !files[0]) return alert("File upload not supported");
  [...files].forEach(readImage);
  ev.target.style.backgroundColor = "#c7ffc7";
});

var activeLayerScript;
var layerName,
  loading = false,
  wnd,
  timer,
  openPsd = false,
  openSmartObject = false,
  isSmartObject = false;

function iframeLoaded(pp) {
  wnd = pp.contentWindow;
  window.addEventListener("message", ppReady);
}

function waitAndCheckLayerName(ms) {
  window.setTimeout(function () {
    console.log("sending name layers script");
    wnd.postMessage(activeLayerScript, "*");
  }, ms);
}

const readImage = (file) => {
  if (!/^image\/(png|jpe?g|gif)$/.test(file.type)) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    designImage = reader.result;
  });
  reader.readAsDataURL(file);
};

function ppReady(e) {
  console.log(e);
  if (
    loading &&
    e.data.constructor.name !== "ArrayBuffer" &&
    e.data.indexOf("firstLayer=") == 0
  ) {
    var name = e.data.substring("firstLayer=".length);
    if (layerName == null) {
      layerName = name;
      var request = new XMLHttpRequest();
      request.open(
        "GET",
        window.location.origin +
          "/custom-mockups/" +
          myData.image.split(".")[0] +
          ".psd",
        true
      );
      request.responseType = "blob";
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
    } else {
      if (!openSmartObject && !isSmartObject && name == "Design") {
        layerName = name;
        openSmartObject = true;
        wnd.postMessage(
          `var l = app.activeDocument.layers[0].layers.getByName("Mockup Design Canvas");
                                    app.activeDocument.activeLayer = l;
                                    executeAction(stringIDToTypeID("placedLayerEditContents"));
                                    app.activeDocument.activeLayer.visible = false;
                                    app.open("${designImage}", null, true);`,
          "*"
        );
        waitAndCheckLayerName(50);
      } else if (openSmartObject && name == "image") {
        isSmartObject = true;
        openSmartObject = false;
        wnd.postMessage(
          `var design=app.activeDocument.activeLayer;
                                    ${
                                      Number(myData.xOff) ||
                                      Number(myData.yOff) ||
                                      Number(myData.scale)
                                        ? `design.translate(${Number(
                                            myData.xOff
                                          )},${Number(myData.yOff)});
                                       design.resize(${
                                         100 + Number(myData.scale)
                                       },${
                                            100 + Number(myData.scale)
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
                                app.activeDocument.activeLayer = app.activeDocument.layers[1].layers.getByName("Shirt Color");
                                var sColor =  new SolidColor;
                                sColor.rgb.hexValue = '${hex}';
                                setColorOfFillLayer( sColor );
                                app.activeDocument.saveToOE("png");
                                app.activeDocument.close();
                                `,
          "*"
        );
      } else {
        timer++;
        console.log("waiting for " + timer * 50 + " ms");
        if (timer < 300) waitAndCheckLayerName(50);
        else loading = false;
      }
    }
  } else if (e.data.constructor.name === "ArrayBuffer") {
    var img = "data:image/png;base64," + _arrayBufferToBase64(e.data);
    let link = document.querySelector("a");
    let imgTag = document.querySelector(".bottom-image");
    imgTag.src = img;
    imgTag.style = "";
    link.setAttribute("href", img);
    link.setAttribute(
      "download",
      myData.design.name.split(".")[0] + "-mockup.png"
    );
    document.querySelector("#generating").style = "";
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
function _arrayBufferToBase64(buffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function formSubmit() {
  getInputs();
  if (!myData.color || !myData.image || !myData.design.name) {
    alert("Please provide all 3 inputs (design, image, color)");
    return;
  }
  if (loading) {
    return;
  }
  layerName = null;
  loading = true;
  timer = 0;
  document.querySelector("#generating").style.display = "flex";
  console.log("sending name layers script");
  activeLayerScript = `app.echoToOE("firstLayer="+(
      app.documents.length == 0?0:
      app.activeDocument.layers[0].name));`;
  wnd.postMessage(activeLayerScript, "*");
}

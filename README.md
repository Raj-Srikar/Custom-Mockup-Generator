# Custom Mockup Generator
Create and generate your own product mockups for your designs locally within your PC for free. **[Try it here](https://raj-srikar.github.io/Custom-Mockup-Generator/)**!
## Table of Contents
* [Installation](#installation)
* [Mockup file (PSD) creation in Photoshop / Photopea](#mockup-file-psd-creation-in-photoshop--photopea)
* [Usage](#usage)
* [Credits](#credits)
## Installation
**Download the Repository:** Clone or download this repository to your local machine.

**Running a Local Server:** Refer this [document](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Tools_and_setup/set_up_a_local_testing_server#running_a_simple_local_http_server) to run a local server.

**If you have python installed:** Run the [server.bat](/server.bat) file to launch the server and open localhost in your browser. If you're using a different Python Executable, edit the bat file and replace `python` with your specific command (e.g., `python3`, `py`).
## Mockup file (PSD) creation in Photoshop / Photopea
Choose a white color product mockup.
### Layer Hierarchy
This is the basic hierarchy of what a mockup file should look like. Layers highlighted with green **must** be present in the file and should have the same names.

![image](https://github.com/Raj-Srikar/Custom-Mockup-Generator/assets/65415209/7c098fa0-cac2-4815-a749-9bb5e511528c)

- ***Design***: Folder to have your design template smart object in. Must be named as *"Design"*.
- **Background Copy**: A copy of background with "Hard light" blending option and clipping mask, to make the design look like it's on the product.
- ***Mockup Design Canvas***: The [Design template](/Mockup%20Design%20Canvas.png) in which the design will be placed. Name must be the same.
- **Colors**: Folder containing luminosity masks and the color fill layer.
- **LnD**: Folder with a raster mask containing "Lights" and "Darks" luminosity masks.
- **Lights**: Luminosity mask that highlights all the lighter areas in the image.
- **Darks**: Luminosity mask that highlights all the darker areas in the image.
- ***Product Color***: White color fill layer that must be named as it is.
- **Background**: Original background of the image.

### Placing the Design Canvas on the Mockup
After importing your mockup in Photoshop / Photopea, place the [Mockup Design Canvas](/Mockup%20Design%20Canvas.png) template as a smart object. Resize and place it where you want your designs to be placed on your mockup.

Refer this [tutorial](https://www.youtube.com/watch?v=rrxTM5AZALU) by *Philip Andres* for placing the design on a product (t-shirt).

Place the **"Mockup Design Canvas"** and its clipping mask layer inside a folder named **"Design"**. This folder should **always** stay on top in the layer hierarchy. 
### Luminosity Masks
Refer this [tutorial](https://www.youtube.com/watch?v=oe_VQt3Th_M) by *photoshopCAFE* for creating luminosity masks.

Once created, set the opacity of "Lights" layer to around 30% and "Darks" layer to around 70%. Place these layers inside a folder and give it a name of your choice (say "LnD" for now).
### Changing Product Color
Create a white color fill layer and name it as **"Product Color"** and place it below the "LnD" folder. Group the "LnD" folder and the color fill layer in a folder of any name (say "Colors" for now). Select the product using selection tool and create a raster mask and add it to this folder.

Edit the curves of the "Lights" and "Darks" layers so that it can look almost the same as the original white product mockup. You can check by hiding and unhiding the "Colors" folder. Make sure there's little to no difference between your modified mask folder and the original mockup.

**Useful resources (By PiXimperfect):**
- [White color shirt to any color](https://youtu.be/1GiWmuJ4vdo)
- [Any color shirt to any color](https://youtu.be/fRJTnH8q29k)
## Usage
Make a preview image of any format (png / jpg) with the same name as your mockup file. Place the mockup file and the preview image in the `custom-mockups` directory.

Edit the [mockups.json](/custom-mockups/mockups.json) file and add the file name of the preview image along with its file format to the JSON array, which already has 3 sample t-shirt mockups.

This can be done by adding a comma `,` after the last element and adding the file name in between two quotation marks `""`.

After saving the JSON file, refresh your localhost webpage to place your design on your newly created mockups.
## Credits
Thanks to **Photopea** for making this possible with their [API](https://www.photopea.com/api/)!
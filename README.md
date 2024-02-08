# openlp-custom-stageview

An OpenLP Custom Stage View based on the [starter ZIP file](https://manual.openlp.org/stage_view.html#custom-stage-views) provided by OpenLP.

Customisations include:

* larger margins at the edges
* a better-proportioned, more sophisticated and therefore more readable font (Noto Sans)
* larger font size for better readability
  * 60px for the current slide
  * 45px for the upcoming slides
* header containing the verse order and the clock is managed as a flexbox rather than a float
* meta slides displayed in a smaller font (14px) 

<img width="1317" alt="image" src="https://github.com/brettdonald/openlp-custom-stageview/assets/4504348/409ebe4a-32d5-453f-a013-f4bd4198e6a7">

## Setup

To create a custom stage view, go to the OpenLP Data Folder by going to Tools ‣ Open Data Folder. Inside the data folder create a folder names stages. Inside the stages folder you can now create a folder which will be the name of your custom view, an example could be myview. Now copy stage.html, stage.css and stages.js from Custom Stage View Zip and customize them to your needs.

1. Locate the OpenLP data folder using the menu option Tools > Open Data Folder
2. Inside the data folder, create a folder named `stages` if it doesn’t already exist
3. Inside the `stages` folder, create a folder which will be the name of your custom view, for example `mycustom1`
4. Download the files from this GitHub project and place them into the folder `mycustom1`
5. In a web browser, browse the address http://:4316/stage/mycustom1, 

## Meta Slides

Many songs in our database include meta information about the song on slides tagged with
a verse type of Intro or Other. Slides containing meta information are rendered in a much smaller
font size. This custom stage view identifies meta slides as those:

* with a verse type of Intro or Other, **and**
* which contain any of the following strings:
  * ©
  * ccli
  * lyrics
  * music
  * publish

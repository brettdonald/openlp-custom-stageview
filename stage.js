/******************************************************************************
 * OpenLP - Open Source Lyrics Projection                                      *
 * --------------------------------------------------------------------------- *
 * Copyright (c) 2008-2021 OpenLP Developers                                   *
 * --------------------------------------------------------------------------- *
 * This program is free software; you can redistribute it and/or modify it     *
 * under the terms of the GNU General Public License as published by the Free  *
 * Software Foundation; version 2 of the License.                              *
 *                                                                             *
 * This program is distributed in the hope that it will be useful, but WITHOUT *
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or       *
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for    *
 * more details.                                                               *
 *                                                                             *
 * You should have received a copy of the GNU General Public License along     *
 * with this program; if not, write to the Free Software Foundation, Inc., 59  *
 * Temple Place, Suite 330, Boston, MA 02111-1307 USA                          *
 ******************************************************************************/

/* ADDED BY BRETT */

// functions to determine whether the current slide contains meta information such as CCLI details
const isCCLI = i => {
  if (!(typeof i === 'object' && typeof i.tag === 'string')) return false
  return (i.tag.startsWith('I') || i.tag.startsWith('O')) && (i.html.match(/©|ccli|lyrics|music|publish/i) != null)
}
const notCCLI = i => {
  return !isCCLI(i)
}

/* END ADDED BY BRETT */


window.OpenLP = { // Connect to the OpenLP Remote WebSocket to get pushed updates
     myWebSocket: function (data, status) {
      const host = window.location.hostname;
      const websocket_port = 4317;
      var myTwelve;

    ws = new WebSocket(`ws://${host}:${websocket_port}`);
    ws.onmessage = (event) => {
      const reader = new FileReader();
      reader.onload = () => {
        data = JSON.parse(reader.result.toString()).results;
        // set some global var
        OpenLP.myTwelve = data.twelve;
        if (OpenLP.currentItem != data.item ||
            OpenLP.currentService != data.service) {
          OpenLP.currentItem = data.item;
          OpenLP.currentService = data.service;
          OpenLP.loadSlides();
        }
        else if (OpenLP.currentSlide != data.slide) {
          OpenLP.currentSlide = parseInt(data.slide, 10);
          OpenLP.updateSlide();
        }
//        OpenLP.loadService();
      };
    reader.readAsText(event.data);
    };
  },
  
  loadService: function (event) {
    $.getJSON(
      "/api/v2/service/items",
      function (data, status) {
        OpenLP.nextSong = "";
        $("#notes").html("");
        data.forEach(function(item, index, array) {
          //if (data.length > index + 1) {
              //console.log("next title");
              //console.log(data[index + 1].title);
          //};
          if (item.selected) {
            //console.log("notes");
            //console.log(item.notes)
            //$("#notes").html(item.notes).replace(/\n/g, "<br>");
            $("#notes").html(item.notes);
            if (data.length > index + 1) {
              OpenLP.nextSong = data[index + 1].title;
            }
            else {
                OpenLP.nextSong = "End of Service";
            }            
          }
        });
        OpenLP.updateSlide();
      }
    );
  },
  
  loadSlides: function (event) {
    $.getJSON(
      "/api/v2/controller/live-items",
      function (data, status) {
        OpenLP.currentSlides = data.slides;
        OpenLP.currentSlide = 0;
        OpenLP.currentTags = Array();
        var div = $("#verseorder");
        div.html("");
        var tag = "";
        var tags = 0;
        var lastChange = 0;
        $.each(data.slides, function(idx, slide) {
          var prevtag = tag;
          tag = slide["tag"];
          if (tag != prevtag) {
            // If the tag has changed, add new one to the list
            lastChange = idx;
            tags = tags + 1;
            div.append(" <span>");
            $("#verseorder span").last().attr("id", "tag" + tags).text(tag);
          }
          else {
            if ((slide["text"] == data.slides[lastChange]["text"]) &&
              (data.slides.length >= idx + (idx - lastChange))) {
              // If the tag hasn't changed, check to see if the same verse
              // has been repeated consecutively. Note the verse may have been
              // split over several slides, so search through. If so, repeat the tag.
              var match = true;
              for (var idx2 = 0; idx2 < idx - lastChange; idx2++) {
                if(data.slides[lastChange + idx2]["text"] != data.slides[idx + idx2]["text"]) {
                    match = false;
                    break;
                }
              }
              if (match) {
                lastChange = idx;
                tags = tags + 1;
                div.append("&nbsp;<span>");
                $("#verseorder span").last().attr("id", "tag" + tags).text(tag);
              }
            }
          }
          OpenLP.currentTags[idx] = tags;
          if (slide["selected"])
            OpenLP.currentSlide = idx;
        })
        OpenLP.loadService();
      }
    );
  },
  
  loadImage: function (event) {
    $.getJSON(
      "/api/v2/core/live-image",
      function (data, status) {
        document.querySelector('.bd-image-slide').src = data.binary_image
      }
    );
  },
  
  updateSlide: function() {
    if (OpenLP.currentSlide === undefined) return

    // highlight the current verse (sequence tag) at the top of the screen (keeping it in the centre if there are lots of tags)
    $("#verseorder span").removeClass("currenttag")
    const currentTag = document.getElementById("tag" + OpenLP.currentTags[OpenLP.currentSlide])
    currentTag.classList.add("currenttag")
    currentTag.scrollIntoView({behavior: "smooth", block: "nearest", inline: "center"})

    // render contents of current slide
    const slide = OpenLP.currentSlides[OpenLP.currentSlide]
    let text2 = ""
    let ccli = false

    if (slide["img"]) {             // renders a low-res thumbnail image ... the high-res image is fetched at the end of this function
      text2 = '<img class="bd-image-slide" src="' + slide['img'].replace('//thumbnails//', '//thumbnails//') + '">';
    }
    else if (slide["text"]) {
      text2 = slide["text"]
    }
    else {
      text2 = slide["Title"]
    }
    
    // display notes if available
    if (slide["slide_notes"]) {
        text2 += '<br>' + slide["footer"]
    }
    
    ccli = isCCLI(slide)
    if (text2) text2 = text2.replace(/\n/g, ccli ? " " : "<br>")
    
    const cs = document.getElementById('currentslide')
    cs.innerHTML = text2
    if (ccli)
      cs.classList.add('meta')
    else
      cs.classList.remove('meta')
    
    // render contents of next n slides
    text2 = ""
    if (OpenLP.currentSlide < OpenLP.currentSlides.length - 1) {
      for (var idx = OpenLP.currentSlide + 1; idx < OpenLP.currentSlides.length; idx++) {
        ccli = false
        if (OpenLP.currentTags[idx] != OpenLP.currentTags[idx - 1]) {
            ccli = isCCLI(OpenLP.currentSlides[idx])
            text2 += `<p class="nextslide ${ccli ? 'meta' : ''}">`
        }
        if (OpenLP.currentSlides[idx]["text"])
            text2 += (ccli ? OpenLP.currentSlides[idx]["text"].replace(/\n/g, ' ') : OpenLP.currentSlides[idx]["text"])
        else
            text2 += OpenLP.currentSlides[idx]["title"]
        if (OpenLP.currentTags[idx] != OpenLP.currentTags[idx - 1])
            text2 += "</p>"
        else        
            text2 += "<br>"
      }
      text2 = text2.replace(/\n/g, "<br>")
      $("#nextslide").html(text2)
    }
    else {
      text = '<p class="nextslide" style="margin-top: 2em;">' + $("#next-text").val() + ': ' + OpenLP.nextSong + '</p>'
      $("#nextslide").html(text)
    }

    // if this is an image slide, fetch the high-res image and render it
    if (slide["img"]) {
        OpenLP.loadImage();
    }
  },
  
  updateClock: function(data) {  // get time from results
    var div = $("#clock");
    var t = new Date();
    var h = t.getHours();
    if (OpenLP.myTwelve && h > 12)
      h = h - 12;
    var m = t.getMinutes();
    if (m < 10)
      m = '0' + m + '';
    div.html(h + ":" + m);
  },
}
$.ajaxSetup({ cache: false });
setInterval("OpenLP.updateClock();", 500);
OpenLP.myWebSocket();
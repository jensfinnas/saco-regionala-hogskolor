/* Define sankey charts to draw here. Charts are set up with:
- a data source 
- a link sentence writer, that is a function the writes a sentence about a link between two nodes
*/
Array.prototype.filterBy = function(key, value) {
  return this.filter(function(d) { return d[key] == value })
}
Array.prototype.sumBy = function(key) {
  return d3.sum(this.map(function(d) { return d[key] }));
}


var charts = [
  // Follw all students from county X
  {
    id: "follow-students-from-county",
    csv: "data/follow_students_from_county.csv",
    xLabels: ["Gymnasieort", "Studieort", "Boendeort 10 år senare"],
    writers: {
      "title": function(data) {
        var context = {
          "home": data[0].home
        };
        var template = "Vad hände med studenterna från {{home}}?";

        return renderTemplate(template, context);
      },
      // chart description
      "description": function(data) {
        var context = {
          "total": data[0].total,
          "home": data[0].home
        }
        var template = "Här har vi följt de {{ total }} gymnaiseelever från {{ home }} som mellan 2000 och 2002 började studera på högskola.";

        return renderTemplate(template, context);
      },
      // list of main conclusions
      "conclusions": function(data) {
        var context = {
          "total": data[0].total,
          "home": data[0].home,
          "studyHome": d3.sum(data
            .filter(function(d) { return d.target_id == "study_home" })
            .map(function(d) { return d.value })
          ),
          "liveHome": d3.sum(data
            .filter(function(d) { return d.target_id == "live_home" })
            .map(function(d) { return d.value })
          ),
        };

        context.studyHomeShare = context.studyHome / context.total;
        context.studyAwayShare = 1 - context.studyHomeShare;
        context.liveHomeShare = context.liveHome / context.total;

        var template = "<ul>";        

        // Study at home
        if (context.studyHomeShare > 0.5) {
          var studyHomeRounded = Math.round(context.studyHomeShare * 10);
          var liveHomeRounded = Math.round(context.liveHomeShare * 10);
          context.studyHomeRoundedText = numberToText(studyHomeRounded);
          context.studyHomeRoundedTextCap = context.studyHomeRoundedText.capitalize();
          context.liveHomeRoundedText = numberToText(liveHomeRounded);
          context.liveAwayRoundedText = numberToText(10 - liveHomeRounded);
          
          template += "<li>{{ studyHomeRoundedTextCap }} av tio från {{ home}} började också studera i länet.</li>";

          // More people moved home 
          if (liveHomeRounded > studyHomeRounded) {
            template += "<li>Efter tio år bodde {{ liveHomeRoundedText }} av tio kvar i {{ home }}.</li>"
          }
          else if (liveHomeRounded == studyHomeRounded) {
            template += "<li>Tio år senare bodde ungefär lika många kvar i {{ home }}.</li>";
          }
          else {
            template += "<li>Efter tio år bodde {{ liveAwayRoundedText }} av utanför länet.</li>";
          }
        }
        // More people moved away to study
        else {
          var studyAwayRounded = Math.round(context.studyAwayShare * 10);
          var liveHomeRounded = Math.round(context.liveHomeShare * 10);
          context.studyAwayRoundedText = numberToText(studyAwayRounded);
          context.studyAwayRoundedTextCap = context.studyAwayRoundedText.capitalize();
          context.liveHomeRoundedText = numberToText(liveHomeRounded);

          template += "<li>{{ studyAwayRoundedTextCap }} av tio från {{ home }} började studera på i ett annat län.</li>";

          // ... but then returned
          if (liveHomeRounded > 10 - studyAwayRounded) {
            template += "<li>Efter tio år bodde totalt {{ liveHomeRoundedText }} av tio i {{ home }} tack vare återflyttning.</li>";
          }
          // no change
          else if (liveHomeRounded == 10 - studyAwayRounded) {
            template += "<li>Tio år senare bodde ungefär lika många kvar i {{ home }}.</li>"
          }
          // ...and then even more moved
          else {
            template += "<li>Efter tio år bodde bara {{ liveHomeRoundedText }} kvar i {{ home }} på grund av fortsatt utflyttning.</li>"
          }
        }
        template += "</ul>";

        return renderTemplate(template, context);

      }, // end of conclusions writer
      // link sentence writer
      "linkSentence": function(link) {
        var self = this;
        var template;
        // Get the level of the target node
        var level = link.target.id.split("_")[0];
        var context = {
          homeRegion: link.meta.home,
        }

        if (level == "study") {
          var _study = link.target.id.split("_")[1];
          context.value = formatPercentText( link.value / link.meta.total );
          context.studyRegion = (_study == "home") ? "i " + context.homeRegion : "på annan ort";
          template = "{{ value }} procent av alla högskolestudenter från {{ homeRegion }} började studera {{ studyRegion }}."
        }
        else if (level == "live") {
          var _study = link.source.id.split("_")[1];
          var _live = link.target.id.split("_")[1];
          context.value = formatPercentText( link.value / link.source.value );
          context.studyRegion = (_study == "home") ? "i " + context.homeRegion : "på annan ort";
          context.liveRegion = (_live == "home") ? "i " + context.homeRegion : "på annan ort";
          template = "Av de studenter från {{ homeRegion }} som studerade {{ studyRegion }} "
          
          // case: study home, live home
          if (_live == _study && _live == "home") {
            template += "bodde {{ value }} procent kvar i länet efter 10 år."
          }
          // case: study away, live at home
          else if ("home" != _study && _live == "home") {
            template += "återvände {{ value }} procent till {{ homeRegion }}."
          }
          // case: study home, live away
          else if(_study == "home" && _live != "home") {
            template += "flyttade {{ value }} procent till annan ort."
          }
          // case: study away, live away 
          else {
            template += "bodde {{ value }} procent kvar utanför länet efter 10 år."
          }

        }
        return renderTemplate(template, context);
      }
    }
  },
  
  /*  follow-students-in-county
  */ 
  {
    id: "follow-students-in-county",
    csv: "data/follow_students_in_county.csv",
    xLabels: ["Hemort", "Boendeort 10 år senare"],
    writers: {
      "title": function(data) {
        var context = {
          "home": data[0].home
        };
        var template = "Vart flyttade studenterna som började plugga i {{home}}?";

        return renderTemplate(template, context);
      },
      // chart description
      "description": function(data) {
        var context = {
          "total": data[0].total,
          "home": data[0].home
        }
        var template = "Här har vi följt de {{ total }} gymnaiseelever som började studera på högskola i {{ home }} mellan 2000 och 2002.";

        return renderTemplate(template, context);
      },
      // list of main conclusions
      "conclusions": function(data) {
        var context = {
          total: data[0].total,
          home: data[0].home,
          studyHome: data.filterBy("source_id", "origin_home").sumBy("value"),
          //studyHomeStay: data.filter(function(d) { return d.source_id = "origin_home" }).filterAndSum("source_id", "live_home"),
          //studyHomeLeave: data.filter(function(d) { return d.source_id = "origin_home" }).filterAndSum("source_id", "live_away"),
          studyAway: data.filterBy("source_id", "origin_away").sumBy("value"),
        };
        var template = "";
        var studyHomeRounded = Math.round(context.studyHome / context.total * 10);
        var studyHomeRoundedText = numberToText(studyHomeRounded);
        context.studyHomeRoundedTextCap = studyHomeRoundedText.capitalize();

        var studyAwayRounded = Math.round(context.studyAway / context.total * 10);
        var studyAwayRoundedText = numberToText(studyAwayRounded);
        context.studyAwayRoundedTextCap = studyAwayRoundedText.capitalize();

        // studied at home
        if (context.studyHome > context.studyAway) {
          template += "<li>{{ studyHomeRoundedTextCap }} av tio studenter i {{ home }} kom från det egna länet.</li>"
        }
        else {
          template += "<li>{{ studyAwayRoundedTextCap }} av tio studenter i {{ home }} kom från ett annat län.</li>"          
        }

        return renderTemplate(template, context);

      }, // end of conclusions writer
      // link sentence writer
      "linkSentence": function(link) {
        var self = this;
        var template;
        // Get the level of the target node
        var level = link.target.id.split("_")[0];
        var context = {
          home: link.meta.home,
          origin: link.source.name,
          live: link.target.name
        }
        var template = "";

        // Studied at home
        context.value = formatPercentText(link.value / link.source.value);

        if (context.home == context.origin) {
          // Lives at home
          if (context.home == context.live) {
            template += "Av studenterna från {{ home }} som också studerade i länet bodde {{ value }} kvar 10 år senare."   
          }
          // Moved away 
          else {
            template += "Av studenterna från {{ home }} som också studerade i länet hade {{ value }} flyttat 10 år senare."   
          }

        }
        // Moved to county to study
        else {
          // Lives at study region
          if (context.home == context.live) {
            template += "Av studenterna från andra län bodde {{ value }} kvar i {{ home }} 10 år senare."   
          }
          // Moved away 
          else {
            template += "Av studenterna från andra län hade {{ value }} flyttat bort från efter 10 år."   
          }

        }
        return renderTemplate(template, context);
      }
    }
  }
]
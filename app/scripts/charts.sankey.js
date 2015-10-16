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
    xLabels: ["Gymnasielän", "Studielän", "Boendelän 10 år senare"],
    writers: {
      "title": function(data) {
        var context = {
          "home": shortCounty(data[0].home) 
        };
        var template = "Vad hände med studenterna från {{home}}?";

        return renderTemplate(template, context);
      },
      // chart description
      "description": function(data) {
        var context = {
          "total": formatLargeNum(data[0].total),
          "home": data[0].home
        }
        var template = "Här har vi följt de {{ total }} gymnasieelever från {{ home }} som började studera på högskolan mellan höstterminen 2000 och vårterminen 2002 och som var 22 år eller yngre det år de började studera.";

        return renderTemplate(template, context);
      },
      // list of main conclusions
      "conclusions": function(data) {
        /*
          i.      Sju av tio från Hallands län började studera  i ett annat län
          ii.      Av dessa har tre av tio återvänt till Hallands län tio år senare
          iii.       Av de som studerade såväl på gymnasiet som i högskola i Hallands län bodde fyra av tio i ett annat län tio år senare.
          iv.      Av de som gick gymnasiet i Hallands län bodde fyra av tio kvar i länet tio år senare.
        */

        var context = {
          "total": data[0].total,
          "home": data[0].home,
        };

        var studyAway =  data
          .filterBy("target_id", "study_away")
          .sumBy("value");
        var studyHome =  data
          .filterBy("target_id", "study_home")
          .sumBy("value");
        var studyAwayLiveHome = data
          .filterBy("source_id", "study_away")
          .filterBy("target_id", "live_home")
          .sumBy("value");
        var studyHomeLiveAway = data
          .filterBy("source_id", "study_home")
          .filterBy("target_id", "live_away")
          .sumBy("value");
        var liveHome = data
          .filterBy("target_id", "live_home")
          .sumBy("value");

        context.studyAway = (studyAway / context.total).textifyPercent().capitalize();
        context.studyAwayLiveHome = (studyAwayLiveHome / studyAway).textifyPercent();
        context.studyHomeLiveAway = (studyHomeLiveAway / studyHome).textifyPercent();
        context.liveHome = (liveHome / context.total).textifyPercent();

        var template = "<ul>";

        template += "<li>{{ studyAway }} från {{ home }} började studera  i ett annat län.</li>";
        template += "<li>Av dessa har {{ studyAwayLiveHome }} återvänt till {{ home }} tio år senare.</li>";
        template += "<li>Av de som studerade såväl på gymnasiet som i högskola i {{ home }} bodde {{ studyHomeLiveAway }} i ett annat län tio år senare.</li>";
        template += "<li>Av de som gick gymnasiet i {{ home }} bodde {{ liveHome }} kvar i länet tio år senare.</li>";

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
          context.studyRegion = (_study == "home") ? "i " + context.homeRegion : "i ett annat län";
          template = "{{ value }} procent av de som gick gymnasiet i {{ homeRegion }} började studera {{ studyRegion }}."
        }
        else if (level == "live") {
          var _study = link.source.id.split("_")[1];
          var _live = link.target.id.split("_")[1];
          context.value = formatPercentText( link.value / link.source.value );
          context.studyRegion = (_study == "home") ? "i " + context.homeRegion : "i ett annat län";
          context.liveRegion = (_live == "home") ? "i " + context.homeRegion : "i ett annat län";
          template = "Av de studenter från {{ homeRegion }} som studerade {{ studyRegion }} "
          
          // case: study home, live home
          if (_live == _study && _live == "home") {
            template += "bodde {{ value }} procent kvar i länet efter 10 år.";
          }
          // case: study away, live at home
          else if ("home" != _study && _live == "home") {
            template += "återvände {{ value }} procent till {{ homeRegion }}.";
          }
          // case: study home, live away
          else if(_study == "home" && _live != "home") {
            template += "flyttade {{ value }} procent till ett annat län.";
          }
          // case: study away, live away 
          else {
            template += "bodde {{ value }} procent kvar utanför länet efter 10 år.";
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
    xLabels: ["Hemlän", "Boendelän 10 år senare"],
    writers: {
      "title": function(data) {
        var context = {
          "home": shortCounty(data[0].home)
        };
        var template = "Vart flyttade studenterna som började plugga i {{home}}?";

        return renderTemplate(template, context);
      },
      // chart description
      "description": function(data) {
        var context = {
          "total": formatLargeNum(data[0].total),
          "home": data[0].home
        }
        var template = "Här har vi följt de {{ total }} gymnasieelever som började studera på högskola i {{ home }} mellan höstterminen 2000 och vårterminen 2002 och som var 22 år eller yngre det år de började studera.";

        return renderTemplate(template, context);
      },
      // list of main conclusions
      "conclusions": function(data) {
        var context = {
          total: data[0].total,
          home: data[0].home,
        };

        var originHome = data.filterBy("source_id", "origin_home").sumBy("value");
        var originAway = data.filterBy("source_id", "origin_away").sumBy("value");
        var originAwayLiveAway = data
          .filterBy("source_id", "origin_away")
          .filterBy("target_id", "live_away")
          .sumBy("value");
        var originAwayLiveHome = data
          .filterBy("source_id", "origin_home")
          .filterBy("target_id", "live_home")
          .sumBy("value");
        var liveHome = data.filterBy("target_id", "live_home").sumBy("value");

        
        context.originAway = (originAway / context.total).textifyPercent().capitalize();
        context.originAwayLiveAway = (originAwayLiveAway / originAway).textifyPercent();
        context.originHomeLiveHome = (originAwayLiveHome / originHome).textifyPercent();
        context.liveHome = (liveHome / context.total).textifyPercent();


        /*
        i.      Sex av tio av de som studerade i Hallands län kom från andra län.
        ii.      Av dessa hade nio av tio flyttat från Hallands län tio år senare.
        iii.      Av de som studerade såväl på gymnasiet som på högskola i Hallands län bodde sex av tio kvar tio år senare.
        iv.      Av de som studerade vid högskola i Hallands län bodde tre av tio kvar i länet efter tio år.
        */

        template = "<ul>";
        template += "<li>{{ originAway }} av de som studerade i {{ home }} kom från andra län.</li>";
        template += "<li>Av dessa hade {{ originAwayLiveAway }} flyttat från {{ home }} tio år senare.</li>";
        template += "<li>Av de som studerade såväl på gymnasiet som på högskola i {{ home }} bodde {{ originHomeLiveHome }} kvar tio år senare.</li>";
        template += "<li>Av de som studerade vid högskola i {{ home }} bodde {{ liveHome }} kvar i länet efter tio år.</li>";
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
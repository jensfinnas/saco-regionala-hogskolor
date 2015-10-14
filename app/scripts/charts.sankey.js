/* Define sankey charts to draw here. Charts are set up with:
- a data source 
- a link sentence writer, that is a function the writes a sentence about a link between two nodes
*/

var charts = {
  // Follw all students from county X
  "follow-students-from-county": {
    data: "data/students_10_years_later.csv",
    linkSentenceWriter: function(link) {
      var self = this;
      var template;
      // Get the level of the target node
      var level = link.target.id.split("_")[0];
      var context = {
        homeRegion: link.meta.home,
      }

      if (level == "2") {
        var _study = link.target.id.split("_")[1];
        context.value = formatPercentText( link.value / link.meta.total );
        context.studyRegion = (_study == "home") ? "i " + context.homeRegion : "på annan ort";
        template = "{{ value }} procent av alla högskolestudenter från {{ homeRegion }} började studera {{ studyRegion }}."
      }
      else if (level == "3") {
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
}
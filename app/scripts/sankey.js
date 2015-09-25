Sankey = (function() {
  function Sankey(selector, data) {
    var self = this;
    self.data = self.formatData(data);

    // The main container
    self.container = d3.select(selector);
    var containerWidth = self.container[0][0].offsetWidth;
    
    self.chartContainer = self.container.append("div")
      .attr('class', 'chart');

    self.margin = m = {top: 10, right: 5, bottom: 5, left: 5};
    self.width = (containerWidth - m.left - m.right);
    self.height = self.width * 0.7;

    var formatNumber = d3.format(",.0f");    // zero decimal places
    self.format = function(d) { return formatNumber(d) + " " + units; };
    self.color = d3.scale.category20();

    self.drawCanvas();
    self.initChart();

    self.sentenceContainer = self.container.append("div")
      .attr("class", "sentence")

  }

  /* Takes an array of objects and returns a set of nodes
     and links.
  */
  Sankey.prototype.formatData = function(data) {
    var graph = {"nodes" : [], "links" : []};
    var _nodes = [];
    data.forEach(function (d) {
      _nodes.push({ 
        "id": d.source_id,
        "name": d.source_name,
        "class": d.source_class 
      });
      _nodes.push({
        "id": d.target_id,
        "name": d.target_name,
        "class": d.target_class 
      });
      graph.links.push({ "source": d.source_id,
                         "target": d.target_id,
                         "class": d.target_class,
                         "value": +d.value });
     });

    // return only the distinct / unique nodes
    graph.nodes = d3.keys(d3.nest()
      .key(function (d) { return d.id; })
      .map(_nodes));

    // loop through each link replacing the text with its index from node
    graph.links.forEach(function (d, i) {
      graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
      graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
    });

    //now loop through each nodes to make nodes an array of objects
    // rather than an array of strings
    graph.nodes.forEach(function (id, i) {
      graph.nodes[i] = _nodes.filter(function(d) { return d.id == id })[0];
    });
    return graph;
  }

  // Draw base svg
  Sankey.prototype.drawCanvas = function() {
    var self = this;
    var w = self.width;
    var h = self.height;
    var m = self.margin;

    self.svg = self.chartContainer.append('svg')
      .attr('width', w + m.left + m.right)
      .attr('height', h + m.top + m.bottom);

    self.chart = self.svg
      .append('g')
      .attr("transform", "translate(" + (m.left) + "," + (m.top) + ")")
  };

  // Set up scales, draw axes and labels
  Sankey.prototype.initChart = function() {
    var self = this;

    // Set the sankey diagram properties
    var sankey = d3.sankey()
        .nodeWidth(36)
        .nodePadding(3)
        .size([self.width, self.height]);

    var path = sankey.link();

    sankey
      .nodes(self.data.nodes)
      .links(self.data.links)
      .layout(32);

    var link = self.chart.append("g").selectAll(".link")
      .data(self.data.links)
      .enter().append("path")
      .attr("class", function(d) { return "link " + d.class; })
      .attr("d", path)
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) { return b.dy - a.dy; })
      .on("mouseover", function(d) {
        var sentence = self.getSentence(d);
        self.updateSentence(sentence);
      })
      .on("mouseout", function(d) {
        self.updateSentence("");
      });

    // add the link titles
      link.append("title")
        .text(function(d) { return self.getSentence(d); });

    // add in the nodes
      var node = self.chart.append("g").selectAll(".node")
          .data(self.data.nodes)
        .enter().append("g")
          .attr("class", function(d) { return "node " + d.class; })
          .attr("transform", function(d) { 
          return "translate(" + d.x + "," + d.y + ")"; });

    // add the rectangles for the nodes
      node.append("rect")
          .attr("height", function(d) { return d.dy; })
          .attr("width", sankey.nodeWidth())
        .append("title")
          .text(function(d) { 
          return d.name + "\n" + d.value; });

    // add in the title for the nodes
      node.append("text")
        .attr("x", function(d) { return -d.dy / 2 })
        .attr("y", function(d) { return sankey.nodeWidth() / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("class", "label")
        .text(function(d) { return d.name; })
        /*.filter(function(d) { return d.x < self.width / 2; })
          .attr("x", 6 + sankey.nodeWidth())
          .attr("text-anchor", "start");*/
  };
  Sankey.prototype.updateSentence = function(sentence) {
    var self = this;
    self.sentenceContainer.html(sentence);
  }

  Sankey.prototype.getSentence = function(link) {
    var self = this;
    var template;
    // Get the level of the target node
    var level = link.target.id.split("_")[0];
    var context = {
      homeRegion: "Halland",
    }

    if (level == "2") {
      var _study = link.target.id.split("_")[1];
      context.value = Math.round( link.value / 100 * 100 );
      context.studyRegion = (_study == "home") ? "i " + context.homeRegion : "på annan ort";
      template = "{{ value }} procent av alla högskolestudenter från {{ homeRegion }} började studera {{ studyRegion }}."
    }
    else if (level == "3") {
      var _study = link.source.id.split("_")[1];
      var _live = link.target.id.split("_")[1];
      context.value = Math.round( link.value / link.source.value * 100 );
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
        template += "bodde {{ value }} procent kvar utanför länet."
      }

    }
    return renderTemplate(template, context);
  }

  return Sankey;
})();
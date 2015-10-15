Sankey = (function() {
  function Sankey(selector, data, linkSentenceWriter, opts) {
    var self = this;

    var defaultOpts = {
      /*  Columns from the data array that will be available as meta data
          in the links. Practical for tooltips etc.
      */
      "metaColumns": [],
      "xLabels": []
    }
    self.opts = extend(defaultOpts, opts);

    /*  Pass an array of objects as data. 
        The function will transform the data to a node-link structure.
    */
    self.data = self.formatData(data);
    
    /*  A function that writes descriptive sentences about links
    */
    self.getLinkSentence = linkSentenceWriter;

    /*  Draw the main container
    */
    self.container = d3.select(selector);
    
    //  The chart will be as wide as the container
    var containerWidth = self.container[0][0].offsetWidth;
    
    self.chartContainer = self.container.append("div")
      .attr('class', 'chart');

    self.margin = m = {top: 10, right: 5, bottom: 40, left: 5};
    self.width = (containerWidth - m.left - m.right);
    self.height = self.width * 0.7;

    // Draw the svg canvas
    self.drawCanvas();

    // Render the chart
    self.initChart();

    self.sentenceContainer = self.container.append("div")
      .attr("class", "sentence")
  }

  /* Takes an array of objects and returns a set of nodes
     and links.
  */
  Sankey.prototype.formatData = function(data) {
    var self = this;
    var graph = {"nodes" : [], "links" : []};
    var _nodes = [];
    data.forEach(function (d) {
      var _source = { 
        "id": d.source_id,
        "name": d.source_name,
        "class": d.source_class,
        "meta": {}
      }
      var _target = {
        "id": d.target_id,
        "name": d.target_name,
        "class": d.target_class,
        "meta": {}
      }

      var _link = {
        "source": d.source_id,
        "target": d.target_id,
        "class": d.target_class,
        "value": +d.value,
        "meta": {},
      };
      self.opts.metaColumns.forEach(function(column) {
        _link.meta[column] = d[column];
        _source.meta[column] = d[column];
        _target.meta[column] = d[column];
      });

      _nodes.push(_source);
      _nodes.push(_target);
      graph.links.push(_link);
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

    // Set up tooltip
    var tipLink = d3.tip()
      .attr('class', 'd3-tip')
      .offset(function(d) {
        // Hack: Tooltips are drawn outside of canvas when only two levels
        // Manually displace tooltips in those cases
        if (d.source.x < 160 && d.target.x > self.width / 2) {
          return [0, 160];
        }
        else {
          return [0, 0];
        }
      })
      .direction(function(d) {
        // Place label towards center of chart
        if (d.target.x <= self.width / 2) {
          return "e";
        }
        else {
          return "w";
        }
      })
      .html(self.getLinkSentence);

    self.chart.call(tipLink);

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
      .enter();

    link.append("path")
      .attr("class", function(d) { return "link " + d.class; })
      .attr("d", path)
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) { return b.dy - a.dy; })
      .on("mouseover", tipLink.show)
      .on("mouseout", tipLink.hide);

    /*
    // label at link target
    link.append("text")
      .attr("class", "label")
      .attr("y", function(d) { 
        console.log(formatPercent(d.value / d.meta.total), Math.round(d.ty), Math.round(d.target.dy), Math.round(d.target.y))
        return d.target.y + d.ty + (d.target.dy + d.target.y - d.ty) / 2; 
      })
      .attr("x", function(d) { return d.target.x; })
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .text(function(d) {
        return formatPercent(d.value / d.meta.total)
      })*/

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
      /* shorten long labels
      */
      .filter(function(d) {
        var rect = this.parentElement.getElementsByTagName("rect")[0];
        var label = d3.select(this);
        var rectSize = +rect.getAttribute("height")
        var labelSize = this.offsetWidth;

        if (labelSize > rectSize * 0.9) {
          var numberOfChars = Math.round(rectSize / labelSize * label.text().length) - 3;
          label.text(label.text().substring(0, numberOfChars).trim() + "...");
        }
      })
        /*.filter(function(d) { return d.x < self.width / 2; })
          .attr("x", 6 + sankey.nodeWidth())
          .attr("text-anchor", "start");*/

      // Add x-labels
      self.chart.selectAll("text.x-label")
        .data(self.opts.xLabels)
        .enter()
        .append("text")
        .attr("y", self.height + 5)
        .attr("dy", ".75em")
        .attr("x", function(d,i) {
          return i / (self.opts.xLabels.length - 1) * self.width;
        })
        .attr("text-anchor", function(d,i) {
          if (i < (self.opts.xLabels.length - 1) / 2) {
            return "start";
          }
          else if (i > (self.opts.xLabels.length - 1) / 2) {
            return "end";
          }
          else {
            return "middle";
          }
        })
        .attr("class", "x-label")
        .text(function(d) { return d })
  };
  Sankey.prototype.updateSentence = function(sentence) {
    var self = this;
    self.sentenceContainer.html(sentence);
  }

  return Sankey;
})();
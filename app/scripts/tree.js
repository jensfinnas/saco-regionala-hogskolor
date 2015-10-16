Tree = (function() {
  function Tree(selector, data, opts) {
    var self = this;

    var defaultOpts = {
      "domain": [0,1],
      "xLabels": [],
      "minHeight": 180
    };
    self.opts = extend(defaultOpts, opts);

    /*  Pass an array of objects as data. 
        The function will transform the data to a node-link structure.
    */
    self.data = self.formatData(data);
    

    /*  Draw the main container
    */
    self.container = d3.select(selector);

    // Clear container
    self.container.html("");
    
    //  The chart will be as wide as the container
    var containerWidth = self.container[0][0].offsetWidth;
    var smallScreen = containerWidth < 400;
    
    self.chartContainer = self.container.append("div")
      .attr('class', 'chart');

    self.margin = m = {
      top: 10,
      right: smallScreen ? 150 : 200,
      bottom: 30,
      left: smallScreen ? 90 : 120
    };
    self.width = (containerWidth - m.left - m.right);
    self.height = Math.max(self.width * 1, self.opts.minHeight);

    self.max = d3.max(data.map(function(d) { return d.value; }));

    self.nodeScale = d3.scale.sqrt()
      .domain(self.opts.domain)
      .range([1, self.height / self.data[0].children.length]);

    // Draw the svg canvas
    self.drawCanvas();

    // Render the chart
    self.initChart();
  }

  /* Takes an array of objects and returns a set of nodes
     and links.
  */
  Tree.prototype.formatData = function(data) {
    var dataMap = data.reduce(function(map, node) {
      map[node.name] = node;
      return map;
    }, {});

    // create the tree array
    var treeData = [];
    data.forEach(function(node) {
      // add to parent
      var parent = dataMap[node.parent];
      if (parent) {
        // create child array if it doesn't exist
        (parent.children || (parent.children = []))
          // add node to child array
          .push(node);
      } else {
        // parent is null or missing
        treeData.push(node);
      }
    });
    return treeData;
  }

  // Draw base svg
  Tree.prototype.drawCanvas = function() {
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
  Tree.prototype.initChart = function() {
    var self = this;

    // Set up tooltip
    var tipLink = d3.tip()
      .attr('class', 'd3-tip')
      .offset([0,0])
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

    var tree = d3.layout.tree()
      .size([self.height, self.width])
      /*.separation(function(a,b) {
        return parseFloat(a.value) + parseFloat(b.value);
      });*/

    var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.y, d.x]; });

    var root = self.data[0];

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse();
    var links = tree.links(nodes);

    // Normalize for fixed-depth.
    //nodes.forEach(function(d) { d.y = d.depth * 180; });

    // Declare the nodesâ€¦
    var node = self.chart.selectAll("g.node")
      .data(nodes, function(d,i) { return d.id || (d.id = ++i); });

    // Enter the nodes.
    var nodeEnter = node.enter().append("g")
      .attr("class", function(d) {
        var className = (d.home == d.name || d.depth == 0 ? "home" : "away")
        return "node " + className; 
      })
      .attr("transform", function(d) { 
        return "translate(" + d.y + "," + d.x + ")"; });

    nodeEnter.append("circle")
      .attr("r", function(d) {
        return self.nodeScale(d.value) * 0.75;
      })
      .attr("fill-opacity", 0.7);

    var labels = nodeEnter.append("text")
      .attr("class", "label")
      .attr("x", function(d) {
        var dist = self.nodeScale(self.max) * 0.75 + 5;
        return d.children || d._children ? -dist : dist; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { 
        return d.children || d._children ? "end" : "start"; })
      .text(function(d) { 
        if (d.name == "low") {
          return "Elever med låga betyg";
        }
        else if (d.name == "high") {
          return "Elever med höga betyg";
        }
        return shortCounty(d.name) + ", " + formatPercent(d.value); 
      });
    
    labels.filter(function(d) {
      return d.depth == 0;
    }).call(wrap, self.margin.left - self.nodeScale(self.max));



    // Declare the links
    var link = self.chart.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });

    // Enter the links.
    link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", diagonal)
      /*.attr("stroke-width", function(d) {
        return self.linkScale(d.target.value);
      });   */

    // X-labels
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
          return "end";
        }
        else if (i > (self.opts.xLabels.length - 1) / 2) {
          return "start";
        }
        else {
          return "middle";
        }
      })
      .attr("class", "x-label")
      .text(function(d) { return d })
  };

  return Tree;
})();
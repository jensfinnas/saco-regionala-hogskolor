function extend(a, b){
    for(var key in b)
        if(b.hasOwnProperty(key))
            a[key] = b[key];
    return a;
}

// Number and text formating
formatPercent = locale.numberFormat("%");
formatPercentDecimal = locale.numberFormat(".1%");
formatPercentText = function(value) {
    return formatPercent(value).replace("%", " procent");
}
formatLargeNum = locale.numberFormat(",");

numberToText = function(value) {
    var numbers = ["noll", "en", "två", "tre", "fyra", "fem", "sex", "sju", "åtta", "nio", "tio"];
    return numbers[value];
}

// turn a percentage to rounded text ("fyra av tio")
Number.prototype.textifyPercent = function() {
    var value = this;
    var rounded = Math.round(value * 10);
    return numberToText(rounded) + " av tio";
}

shortCounty = function(str) {
    return str.replace("s län","").replace(" län", "");
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}


function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        x = text.attr("x"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }  
    text.attr("y", -(lineNumber + 1) / 2 * lineHeight * 12);  
  });
}

// Computations on arrays
Array.prototype.filterBy = function(key, value) {
  return this.filter(function(d) { return d[key] == value })
}
Array.prototype.sumBy = function(key) {
  return d3.sum(this.map(function(d) { return d[key] }));
}
function extend(a, b){
    for(var key in b)
        if(b.hasOwnProperty(key))
            a[key] = b[key];
    return a;
}

formatPercent = d3.format("%");
formatPercentText = function(value) {
    return formatPercent(value).replace("%", " procent");
}

numberToText = function(value) {
    var numbers = ["noll", "ett", "två", "tre", "fyra", "fem", "sex", "sju", "åtta", "nio", "tio"];
    return numbers[value];
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
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
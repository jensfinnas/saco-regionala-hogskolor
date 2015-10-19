var titleWriter = function(rowCounty, rowTotal, grades) {
    var shareCounty = rowCounty.value / rowCounty.total;
    var shareTotal = rowTotal.value / rowTotal.total;
    var diff = shareCounty - shareTotal;
    var amount; 
    if (diff < -0.06) {
        amount = "Väldigt få";
    }
    else if (diff < -0.04) {
        amount = "Många"
    }
    else if (diff < -0.01) {
        amount = "Förhållandevis få";
    }
    else if (diff < 0.01) {
        amount = "Normalmånga";
    }
    else if (diff < 0.04) {
        amount = "Många"
    }  
    else if (diff < 0.06) {
        amount = "Förhållandevis många"
    }
    else {
        amount = "Väldigt många"
    }
    context = {
        amount: amount,
        grades: grades == "low" ? "låga" : "höga"
    }

    var template = "{{ amount }} studenter med {{ grades }} betyg"
    return renderTemplate(template, context);
}

var gradesBarChart = [
    {
        id: "to-county-high-grades",
        grades: "high",
        writers: {
            "title": titleWriter
        }
    },
    {
        id: "to-county-low-grades",
        grades: "low",
        writers: {
            "title": titleWriter
        }
    },
]
function initGradesBarCharts() {
    gradesBarChart.forEach(function(chart) {
        chart.chart = c3.generate({
            bindto: "#" + chart.id + " .chart",
            data: {
                labels: {
                    format: formatPercentDecimal
                },
                columns: [
                    ['share', 10, 10],
                ],
                type: "bar"
            },
            axis: {
                x: {
                    type: "category",
                    categories: ["I länet", "Hela landet"]
                },
                y: {
                    max: 0.3,
                    tick: {
                        format: formatPercent
                    }
                }
            },
            tooltip: {
                show: false
            },
            legend: {
                show: false
            }
        })
    })
} 
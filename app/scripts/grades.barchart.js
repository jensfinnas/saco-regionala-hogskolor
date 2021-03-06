var titleWriter = function(rowCounty, rowTotal, grades) {
    var shareCounty = rowCounty.value / rowCounty.total;
    var shareTotal = rowTotal.value / rowTotal.total;
    var diff = shareCounty - shareTotal;
    var amount; 
    if (diff < -0.04) {
        amount = "Få"
    }
    else if (diff < -0.01) {
        amount = "Förhållandevis få";
    }
    else if (diff < 0.01) {
        amount = "Normalmånga";
    }
    else if (diff < 0.04) {
        amount = "Förhållandevis många"
    }  
    else {
        amount = "Många"
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
            "title": titleWriter,
            "description": function(home) {
                var context = {
                    home: home
                }
                template = "Såhär stor andel av studenterna som startade sina studier i {{ home }} hade höga betyg jämfört med andelen som hade höga betyg i hela Sverige.";
                
                return renderTemplate(template, context);
            }
        }
    },
    {
        id: "to-county-low-grades",
        grades: "low",
        writers: {
            "title": titleWriter,
            "description": function(home) {
                var context = {
                    home: home
                }
                template = "Såhär stor andel av studenterna som började studera i {{ home }} hade låga betyg jämfört med andelen som hade låga betyg i hela Sverige.";
                
                return renderTemplate(template, context);
            }
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
                    ['share', 0, 0],
                ],
                type: "bar"
            },
            axis: {
                x: {
                    type: "category",
                    categories: ["I länet", "Hela landet"]
                },
                y: {
                    show: false,
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
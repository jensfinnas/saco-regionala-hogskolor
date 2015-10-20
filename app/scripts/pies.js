function initPies() {
    gradesBarChart.forEach(function(chart) {
        var groups = ["county", "total"];
        chart.pieCharts = {};
        groups.forEach(function(group) {
            var selector = "#" + chart.id + " .chart-" + group;
            chart.pieCharts[group] = c3.generate({
                bindto: selector,
                data: {
                    columns: [
                        ['highlight', 0.5],
                        ['fade', 0.5]
                    ],
                    type: "pie"
                },
                legend: {
                    show: false
                }
            })

        })
        
    })
} 
var treeWriters = {
    "title": function(data) {
        var context = {
            "home": shortCounty(data[0].home) 
        }
        var template = "Vart flyttade gymnasisterna från {{ home }}?";
        return renderTemplate(template, context);
    },
    "description": function(data) {
        var context = {
            "home": data[0].home 
        }
        var template = "Här har vi följt de studenter med höga respektive låga betyg från {{ home }} som började studera på högskolan mellan höstterminen 2000 och vårterminen 2002 och som var 22 år eller yngre det året de började studera.<br>Bilden visar de sex vanligaste länen där studenter med höga respektive låga betyg från {{ home }} valde att studera.";
        return renderTemplate(template, context);
    },
    "conclusions": function(data) {
        var context = {
          "total": data[0].total,
          "home": data[0].home,
        };

        var dataHighGradesHome = data
            .filterBy("parent_node", "high")
            .filterBy("name", context.home)[0]
            .value;
        var dataLowGradesHome = data
            .filterBy("parent_node", "low")
            .filterBy("name", context.home)[0]
            .value;

        /*function addAmount(percent) {
            var roundedPercent = Math.round(percent * 10);
            if (roundedPercent < 4) {
                return "Endast " + percent.textifyPercent();
            }
            else if (roundedPercent < 7) {
                return percent.textifyPercent().capitalize();
            }
            else {
                return "Hela " + percent.textifyPercent(); 
            }
        }*/
        function textifyAmount(diff) {
            diff = Math.abs(diff);
            if (diff < 0.05) {
                return "något";
            }
            else if (diff < 0.15) {
                return "betydligt";
            }
            else if (diff < 0.3) {
                return "klart";
            }
            else {
                return "mycket"
            }
        }
        
        context.highGradesHome = dataHighGradesHome.textifyPercent().capitalize();
        context.lowGradesHome = dataLowGradesHome.textifyPercent().capitalize();
        context.diffAmount = textifyAmount(dataHighGradesHome - dataLowGradesHome);

        template = "<ul>";

        if (dataHighGradesHome > dataLowGradesHome) {
            template += "<li>Gymnasister från {{ home }} med höga betyg var {{ diffAmount }} mer benägna att börja studera i hemlänet än studenter med låga betyg.";
            template += "<li>{{ highGradesHome }} studenter med höga betyg valde att studera i {{ home }}.</li>";
        }
        else {
            template += "<li>Gymnasister från {{ home }} med låga betyg var {{ diffAmount }} mer benägna att börja studera i hemlänet än studenter med höga betyg.";            
            template += "<li>{{ lowGradesHome }} studenter med låga betyg valde att studera i {{ home }}.</li>";
        }        
        template += "</ul>";

        return renderTemplate(template, context);
    }
}
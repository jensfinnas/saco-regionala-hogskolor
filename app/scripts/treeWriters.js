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
        var template = "Här har vi följt alla studenter från {{ home }} som mellan 2000 och 2002 började studera på högskola och jämfört vart de med höga, respektive låga betyg sökt sig.";
        return renderTemplate(template, context);
    }
}
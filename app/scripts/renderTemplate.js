function renderTemplate(template, context) {
    for (key in context) {
        var value = context[key];
        var re = new RegExp("{{\\s?" + key + "\\s?}}","g");
        template = template.replace(re, value);
    }
    return template;
}

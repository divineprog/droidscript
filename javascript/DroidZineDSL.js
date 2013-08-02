function page()
{
    var p = {};
    p.panels = [];
    for (var i = 0; i < arguments.length; ++i)
    {
        var obj = arguments[i];
        if (obj.type == "title") { p.title = obj.title; }
        if (obj.type == "author") { p.author = obj.author; }
        if (obj.type == "image") { p.imageUrl = obj.imageUrl; }
        else { p.panels.push(obj); }
    }
    return p;
}

for (var n = 1; n < 101; ++n)
{
    Activity.eval("function panel" + n + "() { return panel(1, arguments); }");
}

function title(s)
{
    return { type: "title", title: s };
}

function author(s)
{
    return { type: "author", author: s };
}

function image(url)
{
    return { type: "image", imageUrl: url };
}

function panel(panelNumber, properties)
{
    var p = {};
    p.panelNumber = panelNumber;
    for (var i = 0; i < properties.length; ++i)
    {
        var prop = properties[i];
        p[prop.type] = prop;
    }
    return p;
}

function box(x, y, w, h)
{
    return { type: "box", x: x, y: y, w: w, h: h };
}

function moves()
{
    var p = {};
    p.type = "moves";
    for (var i = 0; i < arguments.length; ++i)
    {
        var prop = arguments[i];
        p[prop.direction] = prop.panelNumber;
    }
    return p;
}

function right(panelNumber)
{
    return { direction: "right", panelNumber: panelNumber };
}

function left(panelNumber)
{
    return { direction: "left", panelNumber: panelNumber };
}

function up(panelNumber)
{
    return { direction: "up", panelNumber: panelNumber };
}

function down(panelNumber)
{
    return { direction: "down", panelNumber: panelNumber };
}

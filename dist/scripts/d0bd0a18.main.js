function initGradesBarCharts(){gradesBarChart.forEach(function(a){a.chart=c3.generate({bindto:"#"+a.id+" .chart",data:{labels:{format:formatPercentDecimal},columns:[["share",0,0]],type:"bar"},axis:{x:{type:"category",categories:["I länet","Hela landet"]},y:{show:!1,max:.3,tick:{format:formatPercent}}},tooltip:{show:!1},legend:{show:!1}})})}function initPies(){gradesBarChart.forEach(function(a){var b=["county","total"];a.pieCharts={},b.forEach(function(b){var c="#"+a.id+" .chart-"+b;a.pieCharts[b]=c3.generate({bindto:c,data:{columns:[["highlight",.5],["fade",.5]],type:"pie"},legend:{show:!1}})})})}function renderTemplate(a,b){for(key in b){var c=b[key],d=new RegExp("{{\\s?"+key+"\\s?}}","g");a=a.replace(d,c)}return a}function extend(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c]);return a}function wrap(a,b){a.each(function(){for(var a,c=d3.select(this),d=c.text().split(/\s+/).reverse(),e=[],f=0,g=1.1,h=c.attr("y"),i=c.attr("x"),j=parseFloat(c.attr("dy")),k=c.text(null).append("tspan").attr("x",i).attr("y",h).attr("dy",j+"em");a=d.pop();)e.push(a),k.text(e.join(" ")),k.node().getComputedTextLength()>b&&(e.pop(),k.text(e.join(" ")),e=[a],k=c.append("tspan").attr("x",i).attr("y",h).attr("dy",++f*g+j+"em").text(a));c.attr("y",-(f+1)/2*g*12)})}Array.prototype.filterBy=function(a,b){return this.filter(function(c){return c[a]==b})},Array.prototype.sumBy=function(a){return d3.sum(this.map(function(b){return b[a]}))};var charts=[{id:"follow-students-from-county",csv:"data/follow_students_from_county.csv",xLabels:["Gymnasielän","Studielän","Boendelän 10 år senare"],writers:{title:function(a){var b={home:shortCounty(a[0].home)},c="Vad hände med studenterna från {{home}}?";return renderTemplate(c,b)},description:function(a){var b={total:formatLargeNum(a[0].total),home:a[0].home},c="Här har vi följt de {{ total }} gymnasieelever från {{ home }} som började studera på högskolan mellan höstterminen 2000 och vårterminen 2002 och som var 22 år eller yngre det år de började studera.";return renderTemplate(c,b)},conclusions:function(a){var b={total:a[0].total,home:a[0].home},c=a.filterBy("target_id","study_away").sumBy("value"),d=a.filterBy("target_id","study_home").sumBy("value"),e=a.filterBy("source_id","study_away").filterBy("target_id","live_home").sumBy("value"),f=a.filterBy("source_id","study_home").filterBy("target_id","live_away").sumBy("value"),g=a.filterBy("target_id","live_home").sumBy("value");b.studyAway=(c/b.total).textifyPercent().capitalize(),b.studyAwayLiveHome=(e/c).textifyPercent(),b.studyHomeLiveAway=(f/d).textifyPercent(),b.liveHome=(g/b.total).textifyPercent();var h="<ul>";return h+="<li>{{ studyAway }} från {{ home }} började studera  i ett annat län.</li>",h+="<li>Av dessa har {{ studyAwayLiveHome }} återvänt till {{ home }} tio år senare.</li>",h+="<li>Av de som studerade såväl på gymnasiet som i högskola i {{ home }} bodde {{ studyHomeLiveAway }} i ett annat län tio år senare.</li>",h+="<li>Av de som gick gymnasiet i {{ home }} bodde {{ liveHome }} kvar i länet tio år senare.</li>",h+="</ul>",renderTemplate(h,b)},linkSentence:function(a){var b,c=a.target.id.split("_")[0],d={homeRegion:a.meta.home};if("study"==c){var e=a.target.id.split("_")[1];d.value=formatPercentText(a.value/a.meta.total),d.studyRegion="home"==e?"i "+d.homeRegion:"i ett annat län",b="{{ value }} procent av de som gick gymnasiet i {{ homeRegion }} började studera {{ studyRegion }}."}else if("live"==c){var e=a.source.id.split("_")[1],f=a.target.id.split("_")[1];d.value=formatPercentText(a.value/a.source.value),d.studyRegion="home"==e?"i "+d.homeRegion:"i ett annat län",d.liveRegion="home"==f?"i "+d.homeRegion:"i ett annat län",b="Av de studenter från {{ homeRegion }} som studerade {{ studyRegion }} ",b+=f==e&&"home"==f?"bodde {{ value }} procent kvar i länet efter 10 år.":"home"!=e&&"home"==f?"återvände {{ value }} procent till {{ homeRegion }}.":"home"==e&&"home"!=f?"flyttade {{ value }} procent till ett annat län.":"bodde {{ value }} procent kvar utanför länet efter 10 år."}return renderTemplate(b,d)}}},{id:"follow-students-in-county",csv:"data/follow_students_in_county.csv",xLabels:["Hemlän","Boendelän 10 år senare"],writers:{title:function(a){var b={home:shortCounty(a[0].home)},c="Vart flyttade studenterna som började plugga i {{home}}?";return renderTemplate(c,b)},description:function(a){var b={total:formatLargeNum(a[0].total),home:a[0].home},c="Här har vi följt de {{ total }} gymnasieelever som började studera på högskola i {{ home }} mellan höstterminen 2000 och vårterminen 2002 och som var 22 år eller yngre det år de började studera.";return renderTemplate(c,b)},conclusions:function(a){var b={total:a[0].total,home:a[0].home},c=a.filterBy("source_id","origin_home").sumBy("value"),d=a.filterBy("source_id","origin_away").sumBy("value"),e=a.filterBy("source_id","origin_away").filterBy("target_id","live_away").sumBy("value"),f=a.filterBy("source_id","origin_home").filterBy("target_id","live_home").sumBy("value"),g=a.filterBy("target_id","live_home").sumBy("value");return b.originAway=(d/b.total).textifyPercent().capitalize(),b.originAwayLiveAway=(e/d).textifyPercent(),b.originHomeLiveHome=(f/c).textifyPercent(),b.liveHome=(g/b.total).textifyPercent(),template="<ul>",template+="<li>{{ originAway }} av de som studerade i {{ home }} kom från andra län.</li>",template+="<li>Av dessa hade {{ originAwayLiveAway }} flyttat från {{ home }} tio år senare.</li>",template+="<li>Av de som studerade såväl på gymnasiet som på högskola i {{ home }} bodde {{ originHomeLiveHome }} kvar tio år senare.</li>",template+="<li>Av de som studerade vid högskola i {{ home }} bodde {{ liveHome }} kvar i länet efter tio år.</li>",template+="</ul>",renderTemplate(template,b)},linkSentence:function(a){var b,c=(a.target.id.split("_")[0],{home:a.meta.home,origin:a.source.name,live:a.target.name}),b="";return c.value=formatPercentText(a.value/a.source.value),b+=c.home==c.origin?c.home==c.live?"Av studenterna från {{ home }} som också studerade i länet bodde {{ value }} kvar 10 år senare.":"Av studenterna från {{ home }} som också studerade i länet hade {{ value }} flyttat 10 år senare.":c.home==c.live?"Av studenterna från andra län bodde {{ value }} kvar i {{ home }} 10 år senare.":"Av studenterna från andra län hade {{ value }} flyttat bort från efter 10 år.",renderTemplate(b,c)}}}];d3.sankey=function(){function a(){n.forEach(function(a){a.sourceLinks=[],a.targetLinks=[]}),o.forEach(function(a){var b=a.source,c=a.target;"number"==typeof b&&(b=a.source=n[a.source]),"number"==typeof c&&(c=a.target=n[a.target]),b.sourceLinks.push(a),c.targetLinks.push(a)})}function b(){n.forEach(function(a){a.value=Math.max(d3.sum(a.sourceLinks,i),d3.sum(a.targetLinks,i))})}function c(){for(var a,b=n,c=0;b.length;)a=[],b.forEach(function(b){b.x=c,b.dx=k,b.sourceLinks.forEach(function(b){a.push(b.target)})}),b=a,++c;d(c),e((m[0]-k)/(c-1))}function d(a){n.forEach(function(b){b.sourceLinks.length||(b.x=a-1)})}function e(a){n.forEach(function(b){b.x*=a})}function f(a){function b(){var a=d3.min(g,function(a){return(m[1]-(a.length-1)*l)/d3.sum(a,i)});g.forEach(function(b){b.forEach(function(b,c){b.y=c,b.dy=b.value*a})}),o.forEach(function(b){b.dy=b.value*a})}function c(a){function b(a){return h(a.source)*a.value}g.forEach(function(c,d){c.forEach(function(c){if(c.targetLinks.length){var d=d3.sum(c.targetLinks,b)/d3.sum(c.targetLinks,i);c.y+=(d-h(c))*a}})})}function d(a){function b(a){return h(a.target)*a.value}g.slice().reverse().forEach(function(c){c.forEach(function(c){if(c.sourceLinks.length){var d=d3.sum(c.sourceLinks,b)/d3.sum(c.sourceLinks,i);c.y+=(d-h(c))*a}})})}function e(){g.forEach(function(a){var b,c,d,e=0,g=a.length;for(a.sort(f),d=0;g>d;++d)b=a[d],c=e-b.y,c>0&&(b.y+=c),e=b.y+b.dy+l;if(c=e-l-m[1],c>0)for(e=b.y-=c,d=g-2;d>=0;--d)b=a[d],c=b.y+b.dy+l-e,c>0&&(b.y-=c),e=b.y})}function f(a,b){return a.id-b.id}var g=d3.nest().key(function(a){return a.x}).sortKeys(d3.ascending).entries(n).map(function(a){return a.values});b(),e();for(var j=1;a>0;--a)d(j*=.99),e(),c(j),e()}function g(){function a(a,b){return a.source.id-b.source.id}function b(a,b){return a.target.id-b.target.id}n.forEach(function(c){c.sourceLinks.sort(b),c.targetLinks.sort(a)}),n.forEach(function(a){var b=0,c=0;a.sourceLinks.forEach(function(a){a.sy=b,b+=a.dy}),a.targetLinks.forEach(function(a){a.ty=c,c+=a.dy,a.tty=c})})}function h(a){return a.y+a.dy/2}function i(a){return a.value}var j={},k=24,l=8,m=[1,1],n=[],o=[];return j.nodeWidth=function(a){return arguments.length?(k=+a,j):k},j.nodePadding=function(a){return arguments.length?(l=+a,j):l},j.nodes=function(a){return arguments.length?(n=a,j):n},j.links=function(a){return arguments.length?(o=a,j):o},j.size=function(a){return arguments.length?(m=a,j):m},j.layout=function(d){return a(),b(),c(),f(d),g(),j},j.relayout=function(){return g(),j},j.link=function(){function a(a){var c=a.source.x+a.source.dx,d=a.target.x,e=d3.interpolateNumber(c,d),f=e(b),g=e(1-b),h=a.source.y+a.sy+a.dy/2,i=a.target.y+a.ty+a.dy/2;return"M"+c+","+h+"C"+f+","+h+" "+g+","+i+" "+d+","+i}var b=.5;return a.curvature=function(c){return arguments.length?(b=+c,a):b},a},j};var titleWriter=function(a,b,c){var d,e=a.value/a.total,f=b.value/b.total,g=e-f;d=-.06>g?"Väldigt få":-.04>g?"Många":-.01>g?"Förhållandevis få":.01>g?"Normalmånga":.04>g?"Många":.06>g?"Förhållandevis många":"Väldigt många",context={amount:d,grades:"low"==c?"låga":"höga"};var h="{{ amount }} studenter med {{ grades }} betyg";return renderTemplate(h,context)},gradesBarChart=[{id:"to-county-high-grades",grades:"high",writers:{title:titleWriter}},{id:"to-county-low-grades",grades:"low",writers:{title:titleWriter}}],locale=d3.locale({decimal:",",thousands:" ",grouping:[3],currency:["","SEK"],dateTime:"%A den %d %B %Y %X",date:"%Y-%m-%d",time:"%H:%M:%S",periods:["fm","em"],days:["Söndag","Måndag","Tisdag","Onsdag","Torsdag","Fredag","Lördag"],shortDays:["Sön","Mån","Tis","Ons","Tor","Fre","Lör"],months:["Januari","Februari","Mars","April","Maj","Juni","Juli","Augusti","September","Oktober","November","December"],shortMonths:["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"]});console.log("'Allo 'Allo!"),Sankey=function(){function a(a,b,c,d){var e=this,f={metaColumns:[],xLabels:[]};e.opts=extend(f,d),e.isMobile=navigator.userAgent.match(/Android/i)||navigator.userAgent.match(/webOS/i)||navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPad/i)||navigator.userAgent.match(/iPod/i)||navigator.userAgent.match(/BlackBerry/i)||navigator.userAgent.match(/Windows Phone/i),e.data=e.formatData(b),e.getLinkSentence=c,e.container=d3.select(a);var g=e.container[0][0].offsetWidth;e.chartContainer=e.container.append("div").attr("class","chart"),e.margin=m={top:10,right:5,bottom:40,left:5},e.width=g-m.left-m.right,e.height=.7*e.width,e.drawCanvas(),e.initChart(),e.sentenceContainer=e.container.append("div").attr("class","sentence")}return a.prototype.formatData=function(a){var b=this,c={nodes:[],links:[]},d=[];return a.forEach(function(a){var e={id:a.source_id,name:a.source_name,"class":a.source_class,meta:{}},f={id:a.target_id,name:a.target_name,"class":a.target_class,meta:{}},g={source:a.source_id,target:a.target_id,"class":a.target_class,value:+a.value,meta:{}};b.opts.metaColumns.forEach(function(b){g.meta[b]=a[b],e.meta[b]=a[b],f.meta[b]=a[b]}),d.push(e),d.push(f),c.links.push(g)}),c.nodes=d3.keys(d3.nest().key(function(a){return a.id}).map(d)),c.links.forEach(function(a,b){c.links[b].source=c.nodes.indexOf(c.links[b].source),c.links[b].target=c.nodes.indexOf(c.links[b].target)}),c.nodes.forEach(function(a,b){c.nodes[b]=d.filter(function(b){return b.id==a})[0]}),c},a.prototype.drawCanvas=function(){var a=this,b=a.width,c=a.height,d=a.margin;a.svg=a.chartContainer.append("svg").attr("width",b+d.left+d.right).attr("height",c+d.top+d.bottom),a.chart=a.svg.append("g").attr("transform","translate("+d.left+","+d.top+")")},a.prototype.initChart=function(){var a=this,b=d3.tip().attr("class","d3-tip").offset(function(b){return a.isMobile?[-(b.tty-b.ty)/2,0]:b.source.x<160&&b.target.x>a.width/2?[0,160]:[0,0]}).direction(function(b){return a.isMobile?"n":b.target.x<=a.width/2?"e":"w"}).html(a.getLinkSentence);a.chart.call(b);var c=d3.sankey().nodeWidth(36).nodePadding(6).size([a.width,a.height]),d=c.link();c.nodes(a.data.nodes).links(a.data.links).layout(32);var e=a.chart.append("g").attr("class","links").selectAll(".link").data(a.data.links).enter();e.append("path").attr("class",function(a){return"link "+a["class"]}).attr("d",d).style("stroke-width",function(a){return Math.max(1,a.dy)}).sort(function(a,b){return b.dy-a.dy}).on("mouseover",b.show).on("mouseout",b.hide),e.append("text").attr("class","label").attr("y",function(a){return a.target.y+a.tty-(a.tty-a.ty)/2}).attr("x",function(a){return a.target.x}).attr("dx",-5).attr("dy",".35em").attr("text-anchor","end").text(function(a){return formatPercent(a.value/a.meta.total)});var f=a.chart.append("g").selectAll(".node").data(a.data.nodes).enter().append("g").attr("class",function(a){return"node "+a["class"]}).attr("transform",function(a){return"translate("+a.x+","+a.y+")"});f.append("rect").attr("height",function(a){return a.dy}).attr("width",c.nodeWidth()).append("title").text(function(a){return a.name+"\n"+a.value}),f.append("text").attr("x",function(a){return-a.dy/2}).attr("y",function(a){return c.nodeWidth()/2}).attr("dy",".35em").attr("text-anchor","middle").attr("transform","rotate(-90)").attr("class","label").text(function(a){return a.name}).filter(function(a){var b=this.parentElement.getElementsByTagName("rect")[0],c=d3.select(this),d=+b.getAttribute("height"),e=this.offsetWidth;if(e>.9*d){var f=Math.round(d/e*c.text().length)-3;c.text(c.text().substring(0,f).trim()+"...")}}),a.chart.selectAll("text.x-label").data(a.opts.xLabels).enter().append("text").attr("y",a.height+5).attr("dy",".75em").attr("x",function(b,c){return c/(a.opts.xLabels.length-1)*a.width}).attr("text-anchor",function(b,c){return c<(a.opts.xLabels.length-1)/2?"start":c>(a.opts.xLabels.length-1)/2?"end":"middle"}).attr("class","x-label").text(function(a){return a})},a.prototype.updateSentence=function(a){var b=this;b.sentenceContainer.html(a)},a}(),Tree=function(){function a(a,b,c){var d=this,e={domain:[0,1],xLabels:[],minHeight:180};d.opts=extend(e,c),d.data=d.formatData(b),d.container=d3.select(a),d.container.html("");var f=d.container[0][0].offsetWidth,g=400>f;d.chartContainer=d.container.append("div").attr("class","chart"),d.margin=m={top:10,right:g?150:200,bottom:30,left:g?90:120},d.width=f-m.left-m.right,d.height=Math.max(1*d.width,d.opts.minHeight),d.max=d3.max(b.map(function(a){return a.value})),d.nodeScale=d3.scale.sqrt().domain(d.opts.domain).range([1,d.height/d.data[0].children.length]),d.drawCanvas(),d.initChart()}return a.prototype.formatData=function(a){var b=a.reduce(function(a,b){return a[b.name]=b,a},{}),c=[];return a.forEach(function(a){var d=b[a.parent];d?(d.children||(d.children=[])).push(a):c.push(a)}),c},a.prototype.drawCanvas=function(){var a=this,b=a.width,c=a.height,d=a.margin;a.svg=a.chartContainer.append("svg").attr("width",b+d.left+d.right).attr("height",c+d.top+d.bottom),a.chart=a.svg.append("g").attr("transform","translate("+d.left+","+d.top+")")},a.prototype.initChart=function(){var a=this,b=d3.tip().attr("class","d3-tip").offset([0,0]).direction(function(b){return b.target.x<=a.width/2?"e":"w"}).html(a.getLinkSentence);a.chart.call(b);var c=d3.layout.tree().size([a.height,a.width]),d=d3.svg.diagonal().projection(function(a){return[a.y,a.x]}),e=a.data[0],f=c.nodes(e).reverse(),g=c.links(f),h=a.chart.selectAll("g.node").data(f,function(a,b){return a.id||(a.id=++b)}),i=h.enter().append("g").attr("class",function(a){var b=a.home==a.name||0==a.depth?"home":"away";return"node "+b}).attr("transform",function(a){return"translate("+a.y+","+a.x+")"});i.append("circle").attr("r",function(b){return.75*a.nodeScale(b.value)}).attr("fill-opacity",.7);var j=i.append("text").attr("class","label").attr("x",function(b){var c=.75*a.nodeScale(a.max)+5;return b.children||b._children?-c:c}).attr("dy",".35em").attr("text-anchor",function(a){return a.children||a._children?"end":"start"}).text(function(a){return"low"==a.name?"Elever med låga betyg":"high"==a.name?"Elever med höga betyg":shortCounty(a.name)+", "+formatPercent(a.value)});j.filter(function(a){return 0==a.depth}).call(wrap,a.margin.left-a.nodeScale(a.max));var k=a.chart.selectAll("path.link").data(g,function(a){return a.target.id});k.enter().insert("path","g").attr("class","link").attr("d",d),a.chart.selectAll("text.x-label").data(a.opts.xLabels).enter().append("text").attr("y",a.height+5).attr("dy",".75em").attr("x",function(b,c){return c/(a.opts.xLabels.length-1)*a.width}).attr("text-anchor",function(b,c){return c<(a.opts.xLabels.length-1)/2?"end":c>(a.opts.xLabels.length-1)/2?"start":"middle"}).attr("class","x-label").text(function(a){return a})},a}();var treeWriters={title:function(a){var b={home:shortCounty(a[0].home)},c="Vart flyttade gymnasisterna från {{ home }}?";return renderTemplate(c,b)},description:function(a){var b={home:a[0].home},c="Här har vi följt alla studenter från {{ home }} som mellan 2000 och 2002 började studera på högskola och jämfört vart de med höga, respektive låga betyg sökt sig.";return renderTemplate(c,b)}};formatPercent=locale.numberFormat("%"),formatPercentDecimal=locale.numberFormat(".1%"),formatPercentText=function(a){return formatPercent(a).replace("%"," procent")},formatLargeNum=locale.numberFormat(","),numberToText=function(a){var b=["noll","en","två","tre","fyra","fem","sex","sju","åtta","nio","tio"];return b[a]},Number.prototype.textifyPercent=function(){var a=this,b=Math.round(10*a);return numberToText(b)+" av tio"},shortCounty=function(a){return a.replace("s län","").replace(" län","")},String.prototype.capitalize=function(){return this.charAt(0).toUpperCase()+this.slice(1)};
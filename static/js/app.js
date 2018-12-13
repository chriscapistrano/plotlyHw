function init(){
    var selector = document.getElementById('selDataset');
    var url = "/names";
    Plotly.d3.json(url, function(error, response) {
        if (error) return console.warn(error);
        var data = response;
        data.map(function(sample){
            var option = document.createElement('option')
            option.text = sample
            option.value = sample
            selector.appendChild(option)
        });
    });
};

init();

function optionChanged(sample){
    pie(sample);
    bubble(sample);
    updateMetadata(sample);
};

function pie(sample) {
    var sampleURL = `/samples/${sample}`
    Plotly.d3.json(sampleURL,function(error,response){
        if (error) return console.log(error);
        var labels = []
        var values = []
        var hovers = []
        for (i=0; i<10; i++){
            var label = response[0].otu_ids[i];
            labels.push(label);
            var value = response[1].sample_values[i];
            values.push(value);
            var hover = response[2][label - 1];
            hovers.push(hover);
        };
        var trace = {
            values: values,
            labels: labels,
            type: "pie",
            text: hovers,
            hoverinfo: "label+text+value+percent",
            textinfo: "percent"
        };
        var data = [trace]
        var layout = {
            margin: {
                left: 15,
                right: 15,
                bottom: 15,
                top: 15,
                padding: 1
            }
        }

        Plotly.newPlot("pieChart", data, layout)
    });
};

function bubble(sample) {
    var sampleURL = `/samples/${sample}`
    Plotly.d3.json(sampleURL, function (error, response){
        if (error) return console.log(error);
        var otuIDs = response[0].otu_ids;
        var sampleValues = response[1].sample_values
        var otuDescriptions = [];
        for(i=0; i<otuIDs.length; i++) {
            otuDescriptions.push(response[2][otuIDs[i] - 1]);
        };
        var trace = {
            x: otuIDs,
            y: sampleValues,
            mode: 'markers',
            type: 'scatter',
            marker: {
                size: sampleValues,
                color: otuIDs,
                colorscale: 'Viridis'
            },
            text: otuDescriptions,
        };
        var data = [trace]
        Plotly.newPlot("bubbleChart", data)
    });
};

function updateMetadata(sample){
    var sampleURL = `/metadata/${sample}`
    Plotly.d3.json(sampleURL,function(error,response){
        if (error) return console.log(error);
        console.log(response);
        var data = response[0];
        console.log(data)
        var metaList = document.getElementById('sampleMetadata');
        metaList.innerHTML = '';
        var metaItems = [["Sample","SAMPLEID"],["Ethnicity","ETHNICITY"],["Gender","GENDER"],["Age","AGE"],
        ["Wash Frequency","WFREQ"],["Button Type","BBTYPE"],["Country","COUNTRY012"],["Dog Owner","DOG"],["Cat Owner","CAT"]];
        console.log(metaList);
        for(i=0; i<metaItems.length; i++){
            var newLi = document.createElement('li');
            newLi.innerHTML = `${metaItems[i][0]}: ${data[metaItems[i][1]]}`;
            metaList.appendChild(newLi);
        };
    });
};

optionChanged("BB_940");



const storage = firebase.storage();
let width = document.body.clientWidth;
let height = document.body.clientHeight;
let links = [];
let nodes = [];
let forceGraph;

// const dummyItems = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
// for(let i=0; i<dummyItems.length; i++){
//   nodes.push({id: dummyItems[i]});
// }
// for(let i=0; i<500; i++){
//   const src = dummyItems[Math.floor(dummyItems.length * Math.random())];
//   const dst = dummyItems[Math.floor(dummyItems.length * Math.random())];
//   links.push({source: src, target: dst});
// }

let canvasButton = d3.select("body").append("button")
  .text("canvas")
  .style("width", "10%")
  .style("position", "fixed")
  .style("top", "50%")
  .style("left", "35%")
  .on("click", async function(){
    canvasButton.remove();
    svgButton.remove();

    await constructGraphDataStorage();
    const module = await import('./ForceSimulationGraphCanvas.js');
    forceGraph = new module.ForceSimulationGraphCanvas("app", "view", width, height);
    await forceGraph.loadAlphaBar();
    await forceGraph.loadProperties();
    await forceGraph.loadAnalizers();
    forceGraph.add(nodes, links);
    d3.selectAll("input").on("change", updateParameter);
    d3.select("#findButton").on("click", find);
    d3.select("#linkButton").on("click", linkAnalize);
    d3.select("#backgroundButton").on("click", backgroundAnalize);
  });

let svgButton = d3.select("body").append("button")
  .text("svg")
  .style("width", "10%")
  .style("position", "fixed")
  .style("top", "50%")
  .style("left", "66%")
  .on("click", async function(){
    canvasButton.remove();
    svgButton.remove();

    await constructGraphDataStorage();
    const module = await import('./ForceSimulationGraphSVG.js');
    forceGraph = new module.ForceSimulationGraphSVG("app", "view", width, height);
    await forceGraph.loadAlphaBar();
    await forceGraph.loadProperties();
    await forceGraph.loadAnalizers();
    forceGraph.add(nodes, links);
    d3.selectAll("input").on("change", updateParameter);
    d3.select("#findButton").on("click", find);
    d3.select("#linkButton").on("click", linkAnalize);
    d3.select("#backgroundButton").on("click", backgroundAnalize);
  });

async function constructGraphDataStorage(){
  const [ linkDocs, nodeDocs ] = await Promise.all([
    storage.ref('links').getDownloadURL().then(async function(url){
      await fetch(url).then(function(response){
        if (response.ok) {
          return response.json();
        } else {
          return Promise.reject(new Error('error request'));
        }
      }).then(function(json){
        links = links.concat(json);
      }).catch(function(e){
        console.log(e.message);
      })
    }),
    storage.ref('nodes').getDownloadURL().then(async function(url){
      await fetch(url).then(async function(response){
        if (response.ok) {
          return response.json();
        } else {
          return Promise.reject(new Error('error request'));
        }
      }).then(function(json){
        nodes = nodes.concat(json);
      }).catch(function(e){
        console.log(e.message);
      })
    })
  ])
}

function updateParameter(){
  forceGraph.update();
  forceGraph.restart(0.3);
}

function find(){
  forceGraph.find();
}

function linkAnalize(){
  forceGraph.linkAnalize();
}

function backgroundAnalize(){
  forceGraph.backgroundAnalize();
}
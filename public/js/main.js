const firestore = firebase.firestore();
const docLinksRef = firestore.collection("links");
const docNodesRef = firestore.collection("nodes");
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

    await constructGraphData();
    const module = await import('./ForceSimulationGraphCanvas.js');
    forceGraph = new module.ForceSimulationGraphCanvas("app", "view", width, height);
    await forceGraph.loadAlphaBar();
    await forceGraph.loadProperties();
    await forceGraph.loadAnalizers();
    forceGraph.add(nodes, links);
    d3.selectAll("input").on("change", updateParameter);
    d3.select("#findButton").on("click", find);
    d3.select("#linkButton").on("click", linkAnalize);
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

    await constructGraphData();
    const module = await import('./ForceSimulationGraphSVG.js');
    forceGraph = new module.ForceSimulationGraphSVG("app", "view", width, height);
    await forceGraph.loadAlphaBar();
    await forceGraph.loadProperties();
    await forceGraph.loadAnalizers();
    forceGraph.add(nodes, links);
    d3.selectAll("input").on("change", updateParameter);
    d3.select("#findButton").on("click", find);
    d3.select("#linkButton").on("click", linkAnalize);
  });

async function constructGraphData(){
  const [ linkDocs, nodeDocs ] = await Promise.all([
    docLinksRef.get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        links.push({source: doc.data().source, target: doc.data().target});
      });
    }),
    docNodesRef.get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        nodes.push({id: doc.id});
      });
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
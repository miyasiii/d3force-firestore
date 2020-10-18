export class ForceSimulationGraphSVG{
  constructor(parentId, elementId, width, height) {
    this.linkColorScale = null;
    this.forceProperties;
    this.forceAnalizers;
    this.forceAlpha;
    this.parentId = parentId;
    this.elementId = elementId;
    this.width = width;
    this.height = height;
    this.graphData = { "nodes": [], "links": [] };
    this.transform = d3.zoomIdentity;
    this.detail = false;
    this.graphElement = d3.select("#"+parentId)
      .append("svg")
      .attr('id', this.elementId)
      .attr('width', this.width)
      .attr('height', this.height);
    this.forceSimulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(d => d.id));

    this.background = d3.select("#"+elementId)
      .append("rect")
      .attr('id', "background")
      .attr("class", "view")
      .attr("x", 0.5)
      .attr("y", 0.5)
      .attr("width", this.width - 1)
      .attr("height", this.height - 1)
      .on("contextmenu", () => {
        d3.event.preventDefault();
      })
      
    this.svgGroup = d3.select("#"+elementId)
      .append('svg:g')
      .attr("id", "svgGroup");
    
    this.graphLinksGroup = d3.select("#svgGroup")
      .append("g")
      .attr("id", "links")
      .classed('links', true)

    this.graphNodesGroup = d3.select("#svgGroup")
      .append("g")
      .attr("id", "nodes")
      .classed('nodes', true);

    this.background.call(d3.zoom()
      .scaleExtent([0.01, 100.0])
      .on("start", () =>{
        this.forceSimulation.stop();
      })
      .on("zoom", () => {
        this.svgGroup
        .attr("transform",
        `translate(${d3.event.transform.x}, ${d3.event.transform.y})` + " " +
        `scale(${d3.event.transform.k})`);

        if(1.0 <= d3.event.transform.k){
          d3.selectAll("circle").attr("display", null);
        }else{
          d3.selectAll("circle").attr("display", "none");
        }

        if(1.5 <= d3.event.transform.k && this.detail === false){
          d3.selectAll("text").attr("display", null);
          this.detail = true;
        }else if(d3.event.transform.k < 1.5 && this.detail === true){
          d3.selectAll("text").attr("display", "none");
          this.detail = false;
        }
      })
      .on("end", () =>{
        this.forceSimulation.restart();
      })
    )

    this.drag = d3.drag()
      .on("start", d => handleDragStarted(d, this.forceSimulation))
      .on("drag", d => handleDragged(d))
      .on("end", d => handleDragEnded(d, this.forceSimulation))

    function handleDragStarted(d, simulation) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
  
    function handleDragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }
  
    function handleDragEnded(d, simulation) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = undefined;
      d.fy = undefined;
    }
  }

  async loadProperties() {
    const module = await import('./ForceSimulationParameter.js');
    this.forceProperties = new module.ForceSimulationParameter();
  }

  async loadAnalizers() {
    const module = await import('./ForceSimulationAnalizer.js');
    this.forceAnalizers = new module.ForceSimulationAnalizer();
  }

  async loadAlphaBar() {
    const module = await import('./ForceSimulationAlphaBar.js');
    this.forceAlpha = new module.ForceSimulationAlphaBar();
  }

  add(nodesToAdd, linksToAdd){
    if (nodesToAdd) {
      for(let n=0; n<nodesToAdd.length; n++){
        this.graphData.nodes.push(nodesToAdd[n]);
      }
    }
    if (linksToAdd) {
      for(let l=0; l<linksToAdd.length; l++){
        this.graphData.links.push(linksToAdd[l]);
      }
    }

    this.forceSimulation.restart();
    this.forceSimulation.alpha(0);
    this.update(this.graphNodesGroup, this.graphLinksGroup);
  }

  remove(dToRemove){
    let nIndex = this.graphData.nodes.indexOf(dToRemove);
    if (-1 !== nIndex) {
      this.graphData.nodes.splice(nIndex, 1);
    }

    let toRemoveLinks = this.graphData.links.filter(l => {
      return l.source.id === dToRemove.id || l.target.id === dToRemove.id;
    });
    for(let l=0; l<toRemoveLinks.length; l++){
      let lIndex = this.graphData.links.indexOf(toRemoveLinks[l]);
      this.graphData.links.splice(lIndex, 1);
    }

    this.update();
    this.forceSimulation.restart();
    this.forceSimulation.alpha(0.3);
  }

  update() {
    let nodes = this.graphData.nodes;
    let links = this.graphData.links;

    this.forceSimulation.nodes(nodes);
    this.forceSimulation
      .force("charge", d3.forceManyBody().strength(this.forceProperties.manyBody.strength).distanceMin((this.forceProperties.manyBody.distanceMin)).distanceMax((this.forceProperties.manyBody.distanceMax)))
      .force("center", d3.forceCenter(this.width * this.forceProperties.center.x, this.height * this.forceProperties.center.y))
      .force("collide",d3.forceCollide().radius(this.forceProperties.manyBody.radius).strength(this.forceProperties.manyBody.strength).iterations(this.forceProperties.manyBody.iterations))
      .force("x", d3.forceX().strength(this.forceProperties.x.strength).x(this.forceProperties.x.x))
      .force("y", d3.forceY().strength(this.forceProperties.y.strength).y(this.forceProperties.y.y))
      .force("link").distance(this.forceProperties.link.distance).iterations(this.forceProperties.link.iterations).links(links)

    let graphNodesData = this.graphNodesGroup.selectAll("g").data(nodes, d => d.id);
    let graphNodesEnter = graphNodesData.enter().append("g").attr("id", d => d.id)
    .on("contextmenu", (d) => {
      d3.event.preventDefault();
      this.remove(d);
    })
    .call(this.drag);

    
    graphNodesEnter.append("circle")
      .classed('node', true)
      .attr("cursor", "pointer")
      .attr("r", 3)
      .attr("fill-opacity", 0.5)

    graphNodesEnter.append("text")
      .attr("id", d => d.id)
      .attr("font-size", "0.25em")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("cursor", "pointer")
      .attr("display", "none")
      .text(d => { return d.id;})

    graphNodesData.exit().remove();
    graphNodesData = graphNodesEnter.merge(graphNodesData);

    let graphLinksData = this.graphLinksGroup.selectAll("line").data(links);
    let graphLinksEnter = graphLinksData.enter().append("line")
      .style("stroke", "black")
      .style("stroke-opacity", 0.5);

    graphLinksData.exit().remove();
    graphLinksData = graphLinksEnter.merge(graphLinksData);

    this.forceSimulation.on("tick", () => this.render(graphLinksData, graphNodesData));
    this.forceSimulation.on("end", () => this.tickEnded());
  }

  render(graphLinksData, graphNodesData){
    this.forceAlpha.update(this.forceSimulation.alpha());

    graphLinksData
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);
    graphNodesData
      .attr("transform", d => {return 'translate(' + [d.x, d.y] + ')';})
      .style("fill", d => {return d3.interpolateMagma(Math.sqrt(d.vx*d.vx + d.vy*d.vy)/3);})
  }

  tickEnded(){
    this.forceAlpha.update(0.0);
  }

  restart(alpha){
    this.forceSimulation.restart();
    this.forceSimulation.alpha(alpha);
  }

  find(){
    let nodeId = this.forceAnalizers.find.text;
    let secondDegree = [];

    for(let i=0; i<this.graphData.links.length; i++){
      if(this.graphData.links[i].source.id === nodeId){
        this.graphData.links[i].selected = true;
        secondDegree.push(this.graphData.links[i].target.id);
      }
      else if(this.graphData.links[i].target.id === nodeId){
        this.graphData.links[i].selected = true;
        secondDegree.push(this.graphData.links[i].source.id);
      }else{
        delete this.graphData.links[i].selected;
        delete this.graphData.links[i].selectedSecond;
      }
    }

    for(let i=0; i<secondDegree.length; i++){
      for(let j=0; j<this.graphData.links.length; j++){
        if(this.graphData.links[j].source.id === secondDegree[i]){
          this.graphData.links[j].selectedSecond = true;
        }
        else if(this.graphData.links[j].target.id === secondDegree[i]){
          this.graphData.links[j].selectedSecond = true;
        }
      }
    }

    let links = d3.selectAll("line");
    links.classed("selected", false);
    links.classed("selectedSecond", false);

    links.filter(function(d) {
      if(d.source.id === nodeId){
        secondDegree.push(d.target.id);
        return true;
      }
      if(d.target.id === nodeId){
        secondDegree.push(d.source.id);
        return true;
      }
    }).classed("selected", true);

    for(let i=0; i<secondDegree.length; i++){
      links.filter(function(d) {
        if(d.source.id === secondDegree[i]){
          return true;
        }
        if(d.target.id === secondDegree[i]){
          return true;
        }
      }).classed("selectedSecond", true);
    }
  }

  linkAnalize(){
    switch(this.forceAnalizers.link.colorScale){
      case "interpolateBrBG":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateBrBG).domain([0, 1000]);
        break;
      case "interpolatePRGn":
        this.linkColorScale =  d3.scaleSequential(d3.interpolatePRGn).domain([0, 1000]);
        break;
      case "interpolatePiYG":
        this.linkColorScale =  d3.scaleSequential(d3.interpolatePiYG).domain([0, 1000]);
        break;
      case "interpolatePuOr":
        this.linkColorScale =  d3.scaleSequential(d3.interpolatePuOr).domain([0, 1000]);
        break;
      case "interpolateRdBu":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateRdBu).domain([0, 1000]);
        break;
      case "interpolateRdGy":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateRdGy).domain([0, 1000]);
        break;
      case "interpolateRdYlBu":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateRdYlBu).domain([0, 1000]);
        break;
      case "interpolateRdYlGn":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateRdYlGn).domain([0, 1000]);
        break;
      case "interpolateSpectral":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateSpectral).domain([0, 1000]);
        break;
      case "interpolateBlues":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateBlues).domain([0, 1000]);
        break;
      case "interpolateGreens":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateGreens).domain([0, 1000]);
        break;
      case "interpolateGreys":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateGreys).domain([0, 1000]);
        break;
      case "interpolateOranges":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateOranges).domain([0, 1000]);
        break;
      case "interpolatePurples":
        this.linkColorScale =  d3.scaleSequential(d3.interpolatePurples).domain([0, 1000]);
        break;
      case "interpolateReds":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateReds).domain([0, 1000]);
        break;
      case "interpolateViridis":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateViridis).domain([0, 1000]);
        break;
      case "interpolateInferno":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateInferno).domain([0, 1000]);
        break;
      case "interpolateMagma":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateMagma).domain([0, 1000]);
        break;
      case "interpolatePlasma":
        this.linkColorScale =  d3.scaleSequential(d3.interpolatePlasma).domain([0, 1000]);
        break;
      case "interpolateWarm":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateWarm).domain([0, 1000]);
        break;
      case "interpolateCool":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateCool).domain([0, 1000]);
        break;
      case "interpolateCubehelixDefault":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateCubehelixDefault).domain([0, 1000]);
        break;
      case "interpolateBuGn":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateBuGn).domain([0, 1000]);
        break;
      case "interpolateBuPu":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateBuPu).domain([0, 1000]);
        break;
      case "interpolateGnBu":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateGnBu).domain([0, 1000]);
        break;
      case "interpolateOrRd":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateOrRd).domain([0, 1000]);
        break;
      case "interpolatePuBuGn":
        this.linkColorScale =  d3.scaleSequential(d3.interpolatePuBuGn).domain([0, 1000]);
        break;
      case "interpolatePuBu":
        this.linkColorScale =  d3.scaleSequential(d3.interpolatePuBu).domain([0, 1000]);
        break;
      case "interpolatePuRd":
        this.linkColorScale =  d3.scaleSequential(d3.interpolatePuRd).domain([0, 1000]);
        break;
      case "interpolateRdPu":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateRdPu).domain([0, 1000]);
        break;
      case "interpolateYlGnBu":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateYlGnBu).domain([0, 1000]);
        break;
      case "interpolateYlGn":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateYlGn).domain([0, 1000]);
        break;
      case "interpolateYlOrBr":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateYlOrBr).domain([0, 1000]);
        break;
      case "interpolateYlOrRd":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateYlOrRd).domain([0, 1000]);
        break;
      case "interpolateRainbow":
        this.linkColorScale =  d3.scaleSequential(d3.interpolateRainbow).domain([0, 1000]);
        break;
      default:
        this.linkColorScale = null;
        break;
    }

    d3.selectAll("line").style("stroke", d => this.linkColorScale(Math.sqrt(Math.pow(d.source.x - d.target.x, 2) + Math.pow(d.source.y - d.target.y, 2))));
  }
}
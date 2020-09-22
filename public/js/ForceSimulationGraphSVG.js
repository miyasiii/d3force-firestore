export class ForceSimulationGraphSVG{
  constructor(parentId, elementId, width, height) {
    this.forceProperties;
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

    this.update(this.graphNodesGroup, this.graphLinksGroup);
    this.forceSimulation.restart();
    this.forceSimulation.alpha(1);
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
    let graphLinksEnter = graphLinksData.enter().append("line");

    graphLinksData.exit().remove();
    graphLinksData = graphLinksEnter.merge(graphLinksData);

    this.forceSimulation.on("tick", () => this.render(graphLinksData, graphNodesData));
  }

  render(graphLinksData, graphNodesData){
    graphLinksData
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);
    graphNodesData
      .attr("transform", d => {return 'translate(' + [d.x, d.y] + ')';})
      .style("fill", d => {return d3.interpolateMagma(Math.sqrt(d.vx*d.vx + d.vy*d.vy)/3);})
  }

  restart(alpha){
    this.forceSimulation.alphaTarget(alpha).restart();
  }
}
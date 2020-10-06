export class ForceSimulationGraphCanvas{
  constructor(parentId, elementId, width, height) {
    this.colorScale = d3.scaleSequential(d3.interpolateRainbow).domain([0, 1000]);
    // this.colorScale = d3.scaleSequential(d3.interpolateRainbow).domain([-180, 180]);
    // this.colorScale = d3.scaleSequential(d3.interpolateRainbow).domain([-2*Math.PI, 2*Math.PI]);
    this.linkColorScale = null;
    this.forceProperties;
    this.forceAnalizers;
    this.forceAlpha;
    this.parentId = parentId;
    this.elementId = elementId;
    this.width = width;
    this.height = height;
    this.fontSize = 10;
    this.graphData = { "nodes": [], "links": [] };
    this.transform = d3.zoomIdentity;
    this.graphElement = d3.select("#"+parentId)
      .append("canvas")
      .attr('id', this.elementId)
      .attr('width', this.width)
      .attr('height', this.height);
    this.forceSimulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(d => d.id));

    this.canvas = d3.select("canvas");
    this.context = d3.select("canvas").node().getContext("2d");

    this.canvas.on("contextmenu", () => {
      d3.event.preventDefault();
      this.remove(this.forceSimulation, this.transform, this.graphData);
    });

    this.canvas.call(d3.drag()
      .subject( () => {
        let x = this.transform.invertX(d3.event.x);
        let y = this.transform.invertY(d3.event.y);
        let dx, dy;
        let radius = 5;

        for (let i=0; i<this.graphData.nodes.length; i++) {
          let node = this.graphData.nodes[i];
          dx = x - node.x;
          dy = y - node.y;

          if (dx * dx + dy * dy < radius * radius) {
            node.x =  this.transform.applyX(node.x);
            node.y = this.transform.applyY(node.y);
            return node;
          }
        }
      })
      .on("start", () => {
        if (!d3.event.active) this.forceSimulation.alphaTarget(0.3).restart();
        d3.event.subject.fx = this.transform.invertX(d3.event.x);
        d3.event.subject.fy = this.transform.invertY(d3.event.y);
      })
      .on("drag", () => {
        d3.event.subject.fx = this.transform.invertX(d3.event.x);
        d3.event.subject.fy = this.transform.invertY(d3.event.y);
      })
      .on("end", () => {
        if (!d3.event.active) this.forceSimulation.alphaTarget(0);
        d3.event.subject.fx = null;
        d3.event.subject.fy = null;
      })
    )
    
    this.canvas.call(d3.zoom()
      .scaleExtent([0.01, 100.0])
      .on("start", () =>{
        this.forceSimulation.stop();
      })
      .on("zoom", () =>{
        this.transform = d3.event.transform;
        this.render();
      })
      .on("end", () =>{
        this.forceSimulation.restart();
      })
    )
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

    this.update();
    this.forceSimulation.restart();
    this.forceSimulation.alpha(1);
  }

  remove(forceSimulation, transform, graphData){
    let x = transform.invertX(d3.event.x);
    let y = transform.invertY(d3.event.y);
    let dx, dy;
    let radius = 5;

    for (let i = 0; i<graphData.nodes.length; i++) {
      let node = graphData.nodes[i];
      dx = x - node.x;
      dy = y - node.y;

      if (dx * dx + dy * dy < radius * radius) {
        graphData.nodes.splice(i, 1);

        let toRemoveLinks = graphData.links.filter(l => {
          return l.source.id === node.id || l.target.id === node.id;
        });
        for(let l=0; l<toRemoveLinks.length; l++){
          let lIndex = graphData.links.indexOf(toRemoveLinks[l]);
          graphData.links.splice(lIndex, 1);
        }

        forceSimulation.restart();
        forceSimulation.alpha(0.3);
      }
    }
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

    this.forceSimulation.on("tick", () => this.render());
    this.forceSimulation.on("end", () => this.tickEnded());
  }

  render(){
    this.forceAlpha.update(this.forceSimulation.alpha());
    
    this.context.save();
    this.context.clearRect(0, 0, this.width, this.height);

    this.context.fillStyle = this.forceAnalizers.background.color;
    this.context.fillRect(0, 0, this.width, this.height);

    this.context.translate(this.transform.x, this.transform.y);
    this.context.scale(this.transform.k, this.transform.k);

    this.context.globalAlpha = 0.5;
    this.transform.k <= 1.0 ? this.context.lineWidth = this.transform.k : this.context.lineWidth = 1/this.transform.k

    for(let i=0; i<this.graphData.links.length; i++){
      if(this.linkColorScale != null){
        if("selected" in this.graphData.links[i]){
          this.context.lineWidth = 3;
          this.context.strokeStyle = "rgb(255,0,0)";
        }else if("selectedSecond" in this.graphData.links[i]){
          this.context.lineWidth = 2;
          this.context.strokeStyle = "rgb(255,165,0)";
        }else{
          this.context.strokeStyle = this.linkColorScale(Math.sqrt(
            Math.pow(this.graphData.links[i].source.x - this.graphData.links[i].target.x, 2) + 
            Math.pow(this.graphData.links[i].source.y - this.graphData.links[i].target.y, 2)
          ));
        }
      }else{
        this.context.lineWidth = 1;
        this.context.strokeStyle = "rgb(0,0,0)";
      }
      this.context.beginPath();
      this.context.moveTo(this.graphData.links[i].source.x, this.graphData.links[i].source.y);
      this.context.lineTo(this.graphData.links[i].target.x, this.graphData.links[i].target.y);
      this.context.stroke();
    }
    
    if(1.0 <= this.transform.k){
      for(let i=0; i<this.graphData.nodes.length; i++){
        this.context.fillStyle = d3.interpolateMagma(Math.sqrt(this.graphData.nodes[i].vx*this.graphData.nodes[i].vx + this.graphData.nodes[i].vy*this.graphData.nodes[i].vy)/3);
        this.context.beginPath();
        this.context.arc(this.graphData.nodes[i].x, this.graphData.nodes[i].y, 5, 0, 2 * Math.PI, true);
        this.context.fill();
        this.context.stroke();
      }
    }

    if(1.5 <= this.transform.k){
      this.context.fillStyle = "white";
      this.context.font = `${this.fontSize}px sans-serif`;
      this.context.scale(1/this.transform.k, 1/this.transform.k);
      for(let i=0; i<this.graphData.nodes.length; i++){
        this.context.fillText(
          this.graphData.nodes[i].id,
          this.graphData.nodes[i].x * this.transform.k - this.fontSize * 0.5,
          this.graphData.nodes[i].y * this.transform.k + this.fontSize * 0.5
        );
      }
    }

    this.context.restore();
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
    this.render();
  }

  backgroundAnalize(){
    this.render();
  }
}
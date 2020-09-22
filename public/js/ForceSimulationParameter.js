export class ForceSimulationParameter{
  constructor() {
    this._center = {
      x: 0.5,
      y: 0.5,
      strength: 1
    }

    this._collide = {
      radius: 1,
      strength: 1,
      iterations: 1
    }

    this._link = {
      distance: 30,
      // strength: 0.1,
      iterations: 1
    }

    this._manyBody = {
      strength: -30,
      theta: 0.9,
      distanceMin: 1,
      distanceMax: Infinity
    }

    this._x = {
      x:0,
      strength: 0.1
    }

    this._y = {
      y:0,
      strength: 0.1
    }

    this.parametersDiv = d3.select("body").append("div").attr('id', "forceParameters");

    this.centerDiv = this.parametersDiv.append("div").classed("force", true);
    this.centerDiv.append("div").style("text-align", "center").style("background-color", "#bbb").html("center");
    this.centerDivXLabel = this.centerDiv.append("div").append("label").html("x:");
    this.centerDivXOutput = this.centerDivXLabel.append("output").html(this.center.x);
    this.centerDiv.append("input")
      .attr('type', "range")
      .attr("min", 0)
      .attr("max", 1.0)
      .attr("step", 0.1)
      .attr("value", this.center.x)
      .classed("range", true)
      .attr('id', "centerXValue")
      .on("input", ()=>{this.update()});
    this.centerDivYLabel = this.centerDiv.append("div").append("label").html("y:");
    this.centerDivYOutput = this.centerDivYLabel.append("output").html(this.center.y);
    this.centerDiv.append("input")
      .attr('type', "range")
      .attr("min", 0)
      .attr("max", 1.0)
      .attr("step", 0.1)
      .attr("value", this.center.y)
      .classed("range", true)
      .attr('id', "centerYValue")
      .on("input", ()=>{this.update()});
    this.centerDivStrengthLabel = this.centerDiv.append("div").append("label").html("strength:");
    this.centerDivStrengthOutput = this.centerDivStrengthLabel.append("output").html(this.center.strength);
    this.centerDiv.append("input")
      .attr('type', "range")
      .attr("min", 0)
      .attr("max", 1.0)
      .attr("step", 0.01)
      .attr("value", this.center.strength)
      .classed("range", true)
      .attr('id', "centerStrengthValue")
      .on("input", ()=>{this.update()});

    this.collideDiv = this.parametersDiv.append("div").classed("force", true);
    this.collideDiv.append("div").style("text-align", "center").style("background-color", "#bbb").html("collide");
    this.collideDivStrengthLabel = this.collideDiv.append("div").append("label").html("strength:");
    this.collideDivStrengthOutput = this.collideDivStrengthLabel.append("output").html(this.collide.strength);
    this.collideDiv.append("input")
      .attr('type', "range")
      .attr("min", 0)
      .attr("max", 2)
      .attr("step", 0.1)
      .attr("value", this.collide.strength)
      .classed("range", true)
      .attr('id', "collideStrengthValue")
      .on("input", ()=>{this.update()});
    this.collideDivRadiusLabel = this.collideDiv.append("div").append("label").html("radius:");
    this.collideDivRadiusOutput = this.collideDivRadiusLabel.append("output").html(this.collide.radius);
    this.collideDiv.append("input")
      .attr('type', "range")
      .attr("min", 0)
      .attr("max", 100)
      .attr("step", 1)
      .attr("value", this.collide.radius)
      .classed("range", true)
      .attr('id', "collideRadiusValue")
      .on("input", ()=>{this.update()});
    this.collideDivIterationsLabel = this.collideDiv.append("div").append("label").html("iterations:");
    this.collideDivIterationsOutput = this.collideDivIterationsLabel.append("output").html(this.collide.iterations);
    this.collideDiv.append("input")
      .attr('type', "range")
      .attr("min", 1)
      .attr("max", 10)
      .attr("step", 1)
      .attr("value", this.collide.iterations)
      .classed("range", true)
      .attr('id', "collideIterationsValue")
      .on("input", ()=>{this.update()});

    this.linkDiv = this.parametersDiv.append("div").classed("force", true);
    this.linkDiv.append("div").style("text-align", "center").style("background-color", "#bbb").html("link");
    this.linkDivDistanceLabel = this.linkDiv.append("div").append("label").html("distance:");
    this.linkDivDistanceOutput = this.linkDivDistanceLabel.append("output").html(this.link.distance);
    this.linkDiv.append("input")
      .attr('type', "range")
      .attr("min", 0)
      .attr("max", 100)
      .attr("step", 1)
      .attr("value", this.link.distance)
      .classed("range", true)
      .attr('id', "linkDistanceValue")
      .on("input", ()=>{this.update()});
    this.linkDivIterationsLabel = this.linkDiv.append("div").append("label").html("iterations:");
    this.linkDivIterationsOutput = this.linkDivIterationsLabel.append("output").html(this.link.iterations);
    this.linkDiv.append("input")
      .attr('type', "range")
      .attr("min", 1)
      .attr("max", 10)
      .attr("step", 1)
      .attr("value", this.link.iterations)
      .classed("range", true)
      .attr('id', "linkIterationsValue")
      .on("input", ()=>{this.update()});

    this.manyBodyDiv = this.parametersDiv.append("div").classed("force", true);
    this.manyBodyDiv.append("div").style("text-align", "center").style("background-color", "#bbb").html("manyBody");
    this.manyBodyDivStrengthLabel = this.manyBodyDiv.append("div").append("label").html("strength:");
    this.manyBodyDivStrengthOutput = this.manyBodyDivStrengthLabel.append("output").html(this.manyBody.strength);
    this.manyBodyDiv.append("input")
      .attr('type', "range")
      .attr("min", -200)
      .attr("max", 200)
      .attr("step", 1)
      .attr("value", this.manyBody.strength)
      .classed("range", true)
      .attr('id', "manyBodyStrengthValue")
      .on("input", ()=>{this.update()});
    this.manyBodyDivThetaLabel = this.manyBodyDiv.append("div").append("label").html("theta:");
    this.manyBodyDivThetaOutput = this.manyBodyDivThetaLabel.append("output").html(this.manyBody.theta);
    this.manyBodyDiv.append("input")
      .attr('type', "range")
      .attr("min", 0)
      .attr("max", 1)
      .attr("step", 0.1)
      .attr("value", this.manyBody.theta)
      .classed("range", true)
      .attr('id', "manyBodyThetahValue")
      .on("input", ()=>{this.update()});
    this.manyBodyDivDistanceMinLabel = this.manyBodyDiv.append("div").append("label").html("distanceMin:");
    this.manyBodyDivDistanceMinOutput = this.manyBodyDivDistanceMinLabel.append("output").html(this.manyBody.distanceMin);
    this.manyBodyDiv.append("input")
      .attr('type', "range")
      .attr("min", 0)
      .attr("max", 50)
      .attr("step", 0.1)
      .attr("value", this.manyBody.distanceMin)
      .classed("range", true)
      .attr('id', "manyBodyDistanceMinValue")
      .on("input", ()=>{this.update()});
    this.manyBodyDivDistanceMaxLabel = this.manyBodyDiv.append("div").append("label").html("distanceMax:");
    this.manyBodyDivDistanceMaxOutput = this.manyBodyDivDistanceMaxLabel.append("output").html(this.manyBody.distanceMax);
    this.manyBodyDiv.append("input")
      .attr('type', "range")
      .attr("min", 0)
      .attr("max", 2000)
      .attr("step", 0.1)
      .attr("value", this.manyBody.distanceMax)
      .classed("range", true)
      .attr('id', "manyBodyDistanceMaxValue")
      .on("input", ()=>{this.update()});

    this.xDiv = this.parametersDiv.append("div").classed("force", true);
    this.xDiv.append("div").style("text-align", "center").style("background-color", "#bbb").html("x");
    this.xDivXLabel = this.xDiv.append("div").append("label").html("x:");
    this.xDivXOutput = this.xDivXLabel.append("output").html(this.x.x);
    this.xDiv.append("input")
      .attr('type', "range")
      .attr("min", 0)
      .attr("max", 1)
      .attr("step", 0.01)
      .attr("value", this.x.x)
      .classed("range", true)
      .attr('id', "xXValue")
      .on("input", ()=>{this.update()});
    this.xDivStrengthLabel = this.xDiv.append("div").append("label").html("strength:");
    this.xDivStrengthOutput = this.xDivStrengthLabel.append("output").html(this.x.strength);
    this.xDiv.append("input")
      .attr('type', "range")
      .attr("min", 0)
      .attr("max", 1)
      .attr("step", 0.01)
      .attr("value", this.x.strength)
      .classed("range", true)
      .attr('id', "xStrengthValue")
      .on("input", ()=>{this.update()});

    this.yDiv = this.parametersDiv.append("div").classed("force", true);
    this.yDiv.append("div").style("text-align", "center").style("background-color", "#bbb").html("y");
    this.yDivYLabel = this.yDiv.append("div").append("label").html("y:");
    this.yDivYOutput = this.yDivYLabel.append("output").html(this.y.y);
    this.yDiv.append("input")
      .attr('type', "range")
      .attr("min", 0)
      .attr("max", 1)
      .attr("step", 0.01)
      .attr("value", this.y.y)
      .classed("range", true)
      .attr('id', "yYValue")
      .on("input", ()=>{this.update()});
    this.yDivStrengthLabel = this.yDiv.append("div").append("label").html("strength:");
    this.yDivStrengthOutput = this.yDivStrengthLabel.append("output").html(this.y.strength);
    this.yDiv.append("input")
      .attr('type', "range")
      .attr("min", 0)
      .attr("max", 1)
      .attr("step", 0.01)
      .attr("value", this.y.strength)
      .classed("range", true)
      .attr('id', "yStrengthValue")
      .on("input", ()=>{this.update()});

  }

  update(){
    this.center = {
      x: d3.select("#centerXValue").property("value"),
      y: d3.select("#centerYValue").property("value"),
      strength: d3.select("#centerStrengthValue").property("value")
    }

    this.collide = {
      radius: d3.select("#collideRadiusValue").property("value"),
      strength: d3.select("#collideStrengthValue").property("value"),
      iterations: d3.select("#collideIterationsValue").property("value")
    }

    this.link = {
      distance: d3.select("#linkDistanceValue").property("value"),
      // strength: 0.1,
      iterations: d3.select("#linkIterationsValue").property("value")
    }

    this.manyBody = {
      strength: d3.select("#manyBodyStrengthValue").property("value"),
      theta: d3.select("#manyBodyThetahValue").property("value"),
      distanceMin: d3.select("#manyBodyDistanceMinValue").property("value"),
      distanceMax: d3.select("#manyBodyDistanceMaxValue").property("value") === "2000" ? Infinity : d3.select("#manyBodyDistanceMaxValue").property("value")
    }

    this.x = {
      x: d3.select("#xXValue").property("value"),
      strength: d3.select("#xStrengthValue").property("value")
    }

    this.y = {
      y: d3.select("#yYValue").property("value"),
      strength: d3.select("#yStrengthValue").property("value")
    }

    this.centerDivXOutput.html(this.center.x);
    this.centerDivYOutput.html(this.center.y);
    this.centerDivStrengthOutput.html(this.center.strength);

    this.collideDivStrengthOutput.html(this.collide.strength);
    this.collideDivRadiusOutput.html(this.collide.radius);
    this.collideDivIterationsOutput.html(this.collide.iterations);

    this.linkDivDistanceOutput.html(this.link.distance);
    this.linkDivIterationsOutput.html(this.link.iterations);

    this.manyBodyDivStrengthOutput.html(this.manyBody.strength);
    this.manyBodyDivThetaOutput.html(this.manyBody.theta);
    this.manyBodyDivDistanceMinOutput.html(this.manyBody.distanceMin);
    this.manyBodyDivDistanceMaxOutput.html(this.manyBody.distanceMax);

    this.xDivXOutput.html(this.x.x);
    this.xDivStrengthOutput.html(this.x.strength);

    this.yDivYOutput.html(this.y.y);
    this.yDivStrengthOutput.html(this.y.strength);
  }


  get center(){
    return this._center;
  }

  set center(value){
    this._center.x = value.x;
    this._center.y = value.y;
    this._center.strength = value.strength;
  }

  get collide(){
    return this._collide;
  }

  set collide(value){
    this._collide.radius = value.radius;
    this._collide.strength = value.strength;
    this._collide.iterations = value.iterations;
  }

  get link(){
    return this._link;
  }

  set link(value){
    this._link.distance = value.distance;
    this._link.iterations = value.iterations;
  }

  get manyBody(){
    return this._manyBody;
  }

  set manyBody(value){
    this._manyBody.strength = value.strength;
    this._manyBody.theta = value.theta;
    this._manyBody.distanceMin = value.distanceMin;
    this._manyBody.distanceMax = value.distanceMax;
  }

  get x(){
    return this._x;
  }

  set x(value){
    this._x.x = value.x;
    this._x.strength = value.strength;
  }

  get y(){
    return this._y;
  }

  set y(value){
    this._y.y = value.y;
    this._y.strength = value.strength;
  }

}
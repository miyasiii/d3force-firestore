export class ForceSimulationAnalizer{
  constructor() {
    this._find = {
      text: ""
    }

    this.analizerDiv = d3.select("body").append("div").attr('id', "forceAnalizers");

    this.findDiv = this.analizerDiv.append("div").classed("analize", true);
    this.findDiv.append("div").style("text-align", "center").style("background-color", "#bbb").html("find");
    this.findDivLabel = this.findDiv.append("div").append("label").html("find:");
    this.findDivOutput = this.findDivLabel.append("output").html(this._find.text);
    this.findDiv.append("input")
      .attr('type', "text")
      .attr("value", this._find.text)
      .classed("text", true)
      .attr('id', "textValue")
      .on("input", ()=>{this.update()});
    this.findDiv.append("input")
      .attr('type', "button")
      .attr("value", "find")
      .attr('id', "findButton")
  }

  update(){
    this._find = {
      text: d3.select("#textValue").property("value")
    }

    this.findDivOutput.html(this._find.text);
  }

  get find(){
    return this._find;
  }

  set find(val){
    this._find = val;
  }
}
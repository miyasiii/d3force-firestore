export class ForceSimulationAnalizer{
  constructor() {
    this._find = {
      text: ""
    }
    this._link = {
      colorScale: "default"
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

    this.linkDiv = this.analizerDiv.append("div").classed("analize", true);
    this.linkDiv.append("div").style("text-align", "center").style("background-color", "#bbb").html("link");
    this.linkDivLabel = this.linkDiv.append("div").append("label").html("coloring");
    this.linkDivSelect = this.linkDiv.append("select")
      .attr('id', "linkValue")
      .on("change", ()=>{this.update()});
    this.linkDivSelect.append("option").attr("value", null).html("black");
    this.linkDivSelect.append("option").attr("value", "interpolateBrBG").html("interpolateBrBG");
    this.linkDivSelect.append("option").attr("value", "interpolatePRGn").html("interpolatePRGn");
    this.linkDivSelect.append("option").attr("value", "interpolatePiYG").html("interpolatePiYG");
    this.linkDivSelect.append("option").attr("value", "interpolatePuOr").html("interpolatePuOr");
    this.linkDivSelect.append("option").attr("value", "interpolateRdBu").html("interpolateRdBu");
    this.linkDivSelect.append("option").attr("value", "interpolateRdGy").html("interpolateRdGy");
    this.linkDivSelect.append("option").attr("value", "interpolateRdYlBu").html("interpolateRdYlBu");
    this.linkDivSelect.append("option").attr("value", "interpolateRdYlGn").html("interpolateRdYlGn");
    this.linkDivSelect.append("option").attr("value", "interpolateSpectral").html("interpolateSpectral");
    this.linkDivSelect.append("option").attr("value", "interpolateBlues").html("interpolateBlues");
    this.linkDivSelect.append("option").attr("value", "interpolateGreens").html("interpolateGreens");
    this.linkDivSelect.append("option").attr("value", "interpolateGreys").html("interpolateGreys");
    this.linkDivSelect.append("option").attr("value", "interpolateOranges").html("interpolateOranges");
    this.linkDivSelect.append("option").attr("value", "interpolatePurples").html("interpolatePurples");
    this.linkDivSelect.append("option").attr("value", "interpolateReds").html("interpolateReds");
    this.linkDivSelect.append("option").attr("value", "interpolateViridis").html("interpolateViridis");
    this.linkDivSelect.append("option").attr("value", "interpolateInferno").html("interpolateInferno");
    this.linkDivSelect.append("option").attr("value", "interpolateMagma").html("interpolateMagma");
    this.linkDivSelect.append("option").attr("value", "interpolatePlasma").html("interpolatePlasma");
    this.linkDivSelect.append("option").attr("value", "interpolateWarm").html("interpolateWarm");
    this.linkDivSelect.append("option").attr("value", "interpolateCool").html("interpolateCool");
    this.linkDivSelect.append("option").attr("value", "interpolateCubehelixDefault").html("interpolateCubehelixDefault");
    this.linkDivSelect.append("option").attr("value", "interpolateBuGn").html("interpolateBuGn");
    this.linkDivSelect.append("option").attr("value", "interpolateBuPu").html("interpolateBuPu");
    this.linkDivSelect.append("option").attr("value", "interpolateGnBu").html("interpolateGnBu");
    this.linkDivSelect.append("option").attr("value", "interpolateOrRd").html("interpolateOrRd");
    this.linkDivSelect.append("option").attr("value", "interpolatePuBuGn").html("interpolatePuBuGn");
    this.linkDivSelect.append("option").attr("value", "interpolatePuBu").html("interpolatePuBu");
    this.linkDivSelect.append("option").attr("value", "interpolatePuRd").html("interpolatePuRd");
    this.linkDivSelect.append("option").attr("value", "interpolateRdPu").html("interpolateRdPu");
    this.linkDivSelect.append("option").attr("value", "interpolateYlGnBu").html("interpolateYlGnBu");
    this.linkDivSelect.append("option").attr("value", "interpolateYlGn").html("interpolateYlGn");
    this.linkDivSelect.append("option").attr("value", "interpolateYlOrBr").html("interpolateYlOrBr");
    this.linkDivSelect.append("option").attr("value", "interpolateYlOrRd").html("interpolateYlOrRd");
    this.linkDivSelect.append("option").attr("value", "interpolateRainbow").html("interpolateRainbow");
    this.linkDiv.append("input")
      .attr('type', "button")
      .attr("value", "apply")
      .attr('id', "linkButton")
  }

  update(){
    this._find = {
      text: d3.select("#textValue").property("value")
    }

    this.findDivOutput.html(this._find.text);

    this._link = {
      colorScale: d3.select("#linkValue").property("value")
    }
  }

  get find(){
    return this._find;
  }

  set find(val){
    this._find = val;
  }

  get link(){
    return this._link;
  }

  set link(val){
    this._link = val;
  }
}
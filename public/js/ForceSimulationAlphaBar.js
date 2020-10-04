export class ForceSimulationAlphaBar{
  constructor() {
    this.alphaDiv = d3.select("body").append("div").attr('id', "forceAlpha");

    this.alphaBarDiv = this.alphaDiv.append("div").attr('id', "forceAlphaBar");
    this.alphaBarValue = this.alphaBarDiv.append("div").attr('id', "forceAlphaValue");
  }

  update(alpha){
    this.alphaBarValue.style('flex-basis', ( d3.format(".3f")(alpha)*100 ) + '%');
  }
}
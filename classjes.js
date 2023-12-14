// voor een groot deel dezelfde code als voor het visualiseren van de 2d dingens op p5.
class Laag {
	constructor(inNodes, uitNodes, tekstWaarde){
		
		
		if(tekstWaarde){
			//negeer inNodes en uitNodes en parse de tekst tot een laag
			const regels = tekstWaarde.split('\n');
			this.inNodes  = Number(regels[0].split('/')[0]);
			this.uitNodes = Number(regels[0].split('/')[1]);
			this.wegingen = new Array(this.inNodes * this.uitNodes);
			this.biases = new Array(this.uitNodes)/*.fill(0)*/; 
			
			const weeeg = regels[1].split("W");
			for(let i=1; i <weeeg.length; i++){
				this.wegingen[i-1] = Number(weeeg[i]);
			}
			//console.log("regels:", regels)
			const biasjes = regels[2].split("B");
			for(let i=1; i <biasjes.length; i++){
				this.biases[i-1] = Number(biasjes[i]);
			}
		}else{
			this.inNodes = inNodes;
			this.uitNodes = uitNodes;
			this.wegingen = new Array(inNodes * uitNodes);
			this.biases = new Array(uitNodes)/*.fill(0)*/; 
			for (let un = 0; un < uitNodes; un++){
				for (let iN = 0; iN < inNodes; iN++){
					this.wegingen[iN+un*inNodes] = Math.random()*2-1;
				}
				this.biases[un] = Math.random()*2-1;
			}
		}
	}
	berekenWaarden( invoerWaarden ){
		let gewogenInvoertjes = new Array(this.uitNodes);
		for (let i=0; i < this.uitNodes; i++){
			let gewogenInvoer = 0+this.biases[i]; // voorkomen dat het een dom pointer ding wordt
			for (let inNode = 0; inNode < this.inNodes; inNode++){
				//debugger;
				gewogenInvoer += invoerWaarden[inNode] * this.wegingen[inNode+i*this.inNodes];
			}
			gewogenInvoertjes[i] = Laag.nietLineaireActivatieFunctie(gewogenInvoer);
			//console.log(gewogenInvoertjes);
		}
		return gewogenInvoertjes;
	}
	static nietLineaireActivatieFunctie(x){
		return  x / (1 + Math.abs(x));//math.sign(x);//Math.sign(x)*Math.min(Math.abs(x),1)
	}
	get tekst(){
		let tekstWaarde = `L${this.inNodes}/${this.uitNodes}\n`;
		
		for(let i=0; i <this.wegingen.length; i++){
			tekstWaarde+=`W${this.wegingen[i]}`;
		}
		tekstWaarde+='\n';
		for(let i=0; i <this.biases.length; i++){
			tekstWaarde+=`B${this.biases[i]}`;
		}
		tekstWaarde+='\n';
		return tekstWaarde;
	}
}

class NNet{
	constructor(laagGroottes, tekstWaarde){
		this.lagen = [];
		//console.log(laagGroottes, tekstWaarde)
		if(tekstWaarde!==undefined){
			const laagjes = tekstWaarde.split("L");
			for (let i = 1; i < laagjes.length; i++){
				this.lagen.push(new Laag(null, null, laagjes[i]))
			}
		}else {
			for (let i = 0; i < laagGroottes.length-1; i++){
				this.lagen.push(new Laag(laagGroottes[i],laagGroottes[i+1]));
			}
		}
	}
	berekenWaardenVoorInvoer(invoer){
		for (const laag in this.lagen){
			invoer = this.lagen[laag].berekenWaarden(invoer); //volgende invoer is uitvoer van deze laag.
		}
		return invoer;
	}
	get tekst(){
		let tekstWaarde = `Een model met ${this.lagen.length} lagen (behalve de uitvoerlaag)`
		for(let i=0; i <this.lagen.length; i++){
			tekstWaarde+=`\n${this.lagen[i].tekst}`;
		}
		return tekstWaarde;
	}
}

module.exports = {NNet, Laag}
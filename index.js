const {NNet, Laag} = require("./classjes");

// Okeeee, nou wat? Ik kan modellen maken enz, maar dat helpt niet, ik moet ze kunnen trainen.
const pngParser = require("pngjs").PNG.sync; // ik ga niet helemaal zelf een png-parser schrijven, dat is nu niet is scope voor dit pws
const fs = require("node:fs");

/*const aantalRondes = 10000;
const aantalModellen = 32;
const aantalKeerUitvoerenPerRonde = 600;
const mutatieSchaal = 40;
const dataset = "testData3.png";
const datasetKanaal = 1;
const datasetSchaal = 2;
const initGroottes = [2,16,16,16,16,16,1];*/


const {aantalRondes, aantalModellen, aantalKeerUitvoerenPerRonde, mutatieSchaal ,dataset, datasetKanaal, datasetSchaal, initGroottes} =require("./parameters");



let bestandsnaam;
const testAfbeelding = pngParser.read(fs.readFileSync(dataset))
//onsole.log(testAfbeelding.data)
const testData = new Array(testAfbeelding.data.length/4);
for (let i= 0; i < testData.length; i++){
	
	testData[i]=datasetSchaal*testAfbeelding.data[datasetKanaal+i*4]/255;
}
// maak een hele boel modellen met random waarden, een hele boel is blijkbaar 6.
const modellen = new Array();
if(process.argv.length <= 2){
	for (let i= 0; i < aantalModellen; i++){
		modellen[i] = {net: new NNet(initGroottes), score: 0}//voor de testdata: 2 invoerwaarden: x en y, en één uitvoerwaarde, hopelijk de waarde van het groene kanaal van de afbeelding die de testdata vormt. Andere waarden willekeurig gekozen.
	}
	bestandsnaam = undefined;
}else {
	bestand = fs.readFileSync(process.argv[2],  {encoding: "latin1"});
	bestandsnaam = process.argv[2];
	const modelTeksten = bestand.split("Een model met ");
	modelTeksten.shift();
	for (let i= 0; i < modelTeksten.length; i++){
		modellen[i] = {net: new NNet(null, modelTeksten[i]), score: 0}//voor de testdata: 2 invoerwaarden: x en y, en één uitvoerwaarde, hopelijk de waarde van het groene kanaal van de afbeelding die de testdata vormt. Andere waarden willekeurig gekozen.
	}
}
let spec="";
if(bestandsnaam)spec=`, vorig_bestand=${bestandsnaam}`;
else spec=`, init_groottes=${initGroottes}`;

let scores = `${JSON.stringify(require("./parameters"))}\n`;
for (let i= 1; i <= aantalRondes; i++){
	//voer uit en evalueer resultaten
	let scoreGemiddelde =0; 
	//let scoreMax = -Infinity;
	//let scoreMin = Infinity;
	//scores += '\n'+i;
	
	
	for (let j = 0; j < (aantalModellen-1)/2; j++){ //laagste helft vermoorden en vervangen met bovenste helft
		delete modellen[j].net;
		//console.log(j, modellen[j+Math.round((aantalModellen-1)/2)].net)
		modellen[j].net = new NNet(null, modellen[j+Math.round((aantalModellen-1)/2)].net.tekst); //veranderen in een string en dan weer in een netwerk, anders wordt het een pointer, en dat willen we niet
	}
	//nu moeten we ze kruisen, dit is wat moeilijker, want ik weet niet hoe ik dit het beste kan doen
	//modellen.sort(sorteerShuffle);
	shuffle(modellen);
	for (let j = 0; j < aantalModellen; j+=2){ 
		if(modellen[j+1]){ //voorkomen dat we iets doms doen
			kruis(modellen[j].net, modellen[j+1].net);
		}
	}
	
	// nu is het tijd voor mutatie.
	for (let j= 0; j < aantalModellen; j++){
		muteer(modellen[j].net);
		
	}
	
	for (let j= 0; j < aantalModellen; j++){
		modellen[j].score=0;
		let bscore = 0;
		for (let k = 0; k<aantalKeerUitvoerenPerRonde; k++){
			const x =Math.floor(Math.random()*testAfbeelding.width);
			const y =Math.floor(Math.random()*testAfbeelding.height);
			const invoerWaarden = [x,y,1];// extra 1 om gewoon een constante te geven want dat maakt dingen mogelijk beter, ws niet
			const verwachteUitvoer = testData[x+testAfbeelding.width*y];
			const uitvoerModel = clip(modellen[j].net.berekenWaardenVoorInvoer(invoerWaarden));
			const error=Math.abs(verwachteUitvoer - uitvoerModel)
			modellen[j].score+= error**2/*+(Math.random()*.2-.1)*/;
			bscore+=error
			scoreGemiddelde+=error;
		}
		//scoreMax = Math.max(scoreMax, modellen[j].score);
		//scoreMin = Math.min(scoreMin, modellen[j].score);
		modellen[j].score=(modellen[j].score/aantalKeerUitvoerenPerRonde)**.5;
		scores += "\n"+i+", " + bscore;
	}
	modellen.sort(sorteerFunctie);
	//const i=0;
	//if(i%50 == 0) console.log(`${i}e ronde, gem: ${scoreGemiddelde/aantalModellen/aantalKeerUitvoerenPerRonde}, min: ${scoreMin/aantalKeerUitvoerenPerRonde}, max: ${scoreMax/aantalKeerUitvoerenPerRonde}`);
	if(i%50 == 0) console.log(`${i}e ronde, gem: ${scoreGemiddelde/aantalModellen/aantalKeerUitvoerenPerRonde}`);
	//console.log(modellen[0].net.lagen[0]);
}
const dn = Date.now();
let resultaatTekst = "";
modellen.forEach((model)=>{resultaatTekst+=model.net.tekst}); //we hoeven nu niet heel efficiënt te zijn, we kunnen dus forEach gebruiken.
fs.writeFileSync(`${bestandsnaam||"modellen"}-${dn}.txt`, resultaatTekst, {encoding: "latin1"});
console.log(dn);

fs.writeFileSync(`statistiek-${bestandsnaam||""}${dn}.csv`, scores, {encoding: "latin1"});


/** functiedefinities */ 
/*  functiedefinities */
// niet dingen hierna gaan zetten!!!!
function kruis(model,b){
	/*
	for (let i = 0; i<model.lagen.length; i++){
		for (let j = 0; j<model.lagen[i].biases.length; j++){
			if(Math.random()>=.5){
				model.lagen[i].biases[j] = b.lagen[i].biases[j]; //de helft van ouder b nemen, andere helft hetzelfde laten als a.
			}
		}
		for (let j = 0; j<model.lagen[i].wegingen.length; j++){
			if(Math.random()>=.5){
				model.lagen[i].wegingen[j] = b.lagen[i].wegingen[j];
			}
		}
	}*/
	for (let i = 0; i<model.lagen.length; i++){
		for (let j = 0; j<model.lagen[i].biases.length; j++){
			model.lagen[i].biases[j] = interpoleer(model.lagen[i].biases[j], b.lagen[i].biases[j], Math.random());
		}
		for (let j = 0; j<model.lagen[i].wegingen.length; j++){
			model.lagen[i].wegingen[j] =interpoleer(model.lagen[i].wegingen[j], b.lagen[i].wegingen[j], Math.random());
		}
	}
	// hoef niet te returnen want het is muteert het object, maakt er geen kopie van.
	
}

function muteer(model) {
	
	//console.log(model.lagen[0].wegingen)
	for (let i = 0; i<model.lagen.length; i++){
		for (let j = 0; j<model.lagen[i].biases.length; j++){
			model.lagen[i].biases[j]+=(Math.random()-.5)*mutatieSchaal; //weer gewoon willekeurig getal genomen
		}
		for (let j = 0; j<model.lagen[i].wegingen.length; j++){
			model.lagen[i].wegingen[j]+=(Math.random()-.5)*mutatieSchaal;
		}
	}
	//console.log(model.lagen[0].wegingen)
}


function interpoleer(a,b,w){
	return a*w+b*(1-w);
}

function clip(a){
	if(a < 0) return 0;//else niet nodig wegens returnstatements
	if(a > 1) return 1;// 0 tot 1, omdat dat ook zo is bij de testdata, dat is wel zo aardig.
	return a;
}


function sorteerShuffle(a,b){
	return Math.random()-.5; //niet werkelijk random, maar omdat het er nu maar zes zijn, is dit goed genoeg.
}

//https://stackoverflow.com/a/2450976
function shuffle(array) {
	let currentIndex = array.length,  randomIndex;
	while (currentIndex > 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}
	return array;
}


function sorteerFunctie(a,b){
	return b.score-a.score;
}
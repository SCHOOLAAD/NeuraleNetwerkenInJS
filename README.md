# NeuraleNetwerkenInJS
Hallo meneer Van Dijk, het is u gelukt tot de bestanden te komen. ![yay](https://cdn.discordapp.com/emojis/853023712919552000.webp?size=16&quality=lossless)

# Hoe voer je het programma uit?
Je moet nodejs geïnstalleerd hebben. Download het project (of: git-clone het).<br>
Ga naar de map waarnaar je het hebt gedownload en voer "npm install" uit, zo worden alle bibliotheekjes geïnstalleerd.<br>
Daarna kan je de parameters in het begin v/h bestand veranderen. Dit zijn aantalRondes, aantalModellen, aantalKeerUitvoerenPerRonde, mutatieSchaal, dataset en initGroottes.<br>
Als nu het commando "node index" wordt uitgevoerd, worden er nieuwe modellen getraind met de gegeven parameters.<br>
Elke 50 rondes wordt er een update gegeven over hoe goed de modellen gemiddeld zijn geworden.<br>
Aan het eind worden er twee bestanden gemaakt, een bestand dat de modellen zelf bevat en een csv-bestand met statistieken over het trainingsproces.<br>
Omdat mijn excel op z'n Nederlandsch staat, is er een scriptje om in een bestand alle comma's te vervangen met puntkomma's en alle punten met comma's. ("node maakExcelImporteerbaar bestand.csv" maakt een bestand met de naam "bestand.csv-fix.csv")<br>
Om modellen uit een bestand verder te trainen, kan je "node index modellen.txt" uitvoeren (aantalModellen en initGroottes worden genegeerd).<br>

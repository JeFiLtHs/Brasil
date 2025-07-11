var warehouseCapacity = [];
var allWoodTotals = [];
var allClayTotals = [];
var allIronTotals = [];
var availableMerchants = [];
var totalMerchants = [];
var farmSpaceUsed = [];
var farmSpaceTotal = [];
var villagesData = [];
var allWoodObjects, allClayObjects, allIronObjects, allVillages;
var totalsAndAverages = "";
var data, totalWood = 0, totalStone = 0, totalIron = 0, resLimit = 0, maxResourceLimit = 400000; // New variable for max resource limit
var sendBack;
var totalWoodSent = 0; totalStoneSent = 0; totalIronSent = 0;
if (typeof woodPercentage == 'undefined') {
    woodPercentage = 28000 / 83000;
    stonePercentage = 30000 / 83000;
    ironPercentage = 25000 / 83000;
}
// percentages for coins, 83000 is how much all 3 is combined

var backgroundColor = "#36393f";
var borderColor = "#3e4147";
var headerColor = "#202225";
var titleColor = "#ffffdf";
var langShinko = [
    "Resource sender for flag boost minting",
    "Enter coordinate to send to",
    "Save",
    "Creator",
    "Player",
    "Village",
    "Points",
    "Coordinate to send to",
    "Keep WH% behind",
    "Recalculate res/change",
    "Res sender",
    "Source village",
    "Target village",
    "Distance",
    "Wood",
    "Clay",
    "Iron",
    "Send resources",
    "Created by Sophie 'Shinko to Kuma'",
    "Max resources to send" // New translation for max resource limit
];
if (game_data.locale == "en_DK") {
    langShinko = [
        "Resource sender for flag boost minting",
        "Enter coordinate to send to",
        "Save",
        "Creator",
        "Player",
        "Village",
        "Points",
        "Coordinate to send to",
        "Keep WH% behind",
        "Recalculate res/change",
        "Res sender",
        "Source village",
        "Target village",
        "Distance",
        "Wood",
        "Clay",
        "Iron",
        "Send resources",
        "Created by Sophie 'Shinko to Kuma'",
        "Max resources to send"
    ];
}
if (game_data.locale == "el_GR") {
    langShinko = [
        "Αποστολή πόρων",
        "Εισάγετε τις συντεταγμένες - στόχο",
        "Αποθήκευση",
        "Δημιουργός",
        "Παίκτης",
        "Χωριό",
        "Πόντοι",
        "Στόχος",
        "Διατήρησε το % Αποθήκης κάτω από",
        "Υπολογισμός πόρων/αλλαγή στόχου",
        "Αποστολή πόρων",
        "Προέλευση",
        "Χωριό στόχος",
        "Απόσταση",
        "Ξύλο",
        "Πηλός",
        "Σίδερο",
        "Αποστολή πόρων",
        "Δημιουργήθηκε από την Sophie 'Shinko to Kuma'",
        "Μέγιστοι πόροι για αποστολή"
    ];
}
if (game_data.locale == "nl_NL") {
    langShinko = [
        "Grondstoffen versturen voor vlagfarmen",
        "Geef coordinaat in om naar te sturen",
        "Opslaan",
        "Scripter",
        "Speler",
        "Dorp",
        "Punten",
        "Coordinaat om naar te sturen",
        "Hou WH% achter",
        "Herbereken gs/doelwit",
        "Gs versturen",
        "Oorsprong",
        "Doelwit",
        "Afstand",
        "Hout",
        "Leem",
        "Ijzer",
        "Verstuur grondstoffen",
        "Gemaakt door Sophie 'Shinko to Kuma'",
        "Maximale grondstoffen om te sturen"
    ];
}
if (game_data.locale == "it_IT") {
    langShinko = [
        "Script pushing per coniare",
        "Inserire le coordinate a cui mandare risorse",
        "Salva",
        "Creatrice",
        "Giocatore",
        "Villaggio",
        "Punti",
        "Coordinate a cui mandare",
        "Conserva % magazzino",
        "Ricalcola trasporti",
        "Invia risorse",
        "Villaggio di origine",
        "Villaggio di destinazione",
        "Distanza",
        "Legno",
        "Argilla",
        "Ferro",
        "Manda risorse",
        "Creato da Sophie 'Shinko to Kuma'",
        "Risorse massime da inviare"
    ];
}
if (game_data.locale == "pt_BR") {
    langShinko = [
        "Enviar recursos para cunhagem de moedas",
        "Insira coordenada para enviar recursos",
        "Salvar",
        "Criador",
        "Jogador",
        "Aldeia",
        "Pontos",
        "Enviar para",
        "Manter % no armazém",
        "Recalcular transporte",
        "Enviar recursos",
        "Origem",
        "Destino",
        "Distância",
        "Madeira",
        "Argila",
        "Ferro",
        "Enviar recursos",
        "Criado por Sophie 'Shinko to Kuma'",
        "Máximo de recursos para enviar"
    ];
}

cssClassesSophie = `
<style>
.sophRowA {
background-color: #32353b;
color: white;
}
.sophRowB {
background-color: #36393f;
color: white;
}
.sophHeader {
background-color: #202225;
font-weight: bold;
color: white;
}
</style>`

$("#content administered").eq(0).prepend(cssClassesSophie);
$("#mobileHeader").eq(0).prepend(cssClassesSophie);

// Check if we have a limit set for the res we want to keep in the villages and max resource limit
if ("resLimit" in sessionStorage) {
    resLimit = parseInt(sessionStorage.getItem("resLimit", resLimit));
}
else {
    sessionStorage.setItem("resLimit", resLimit);
}
if ("maxResourceLimit" in sessionStorage) {
    maxResourceLimit = parseInt(sessionStorage.getItem("maxResourceLimit", maxResourceLimit));
}
else {
    sessionStorage.setItem("maxResourceLimit", maxResourceLimit);
}

// Collect overview so we can get all the information necessary from all villages
if (game_data.player.sitter > 0) {
    URLReq = `game.php?t=${game_data.player.id}&screen=overview_villages&mode=prod&page=-1&`;
}
else {
    URLReq = "game.php?&screen=overview_villages&mode=prod&page=-1&";
}
$.get(URLReq, function () {
    console.log("Managed to grab the page");
})
    .done(function (page) {
        if ($("#mobileHeader")[0]) {
            console.log("mobile");
            allWoodObjects = $(page).find(".res.mwood,.warn_90.mwood,.warn.mwood");
            allClayObjects = $(page).find(".res.mstone,.warn_90.mstone,.warn.mstone");
            allIronObjects = $(page).find(".res.miron,.warn_90.miron,.warn.miron");
            allWarehouses = $(page).find(".mheader.ressources");
            allVillages = $(page).find(".quickedit-vn");
            allFarms = $(page).find(".header.population");
            allMerchants = $(page).find('a[href*="market"]');
            for (var i = 0; i < allWoodObjects.length; i++) {
                n = allWoodObjects[i].textContent;
                n = n.replace(/\./g, '').replace(',', '');
                allWoodTotals.push(n);
            };
            for (var i = 0; i < allClayObjects.length; i++) {
                n = allClayObjects[i].textContent;
                n = n.replace(/\./g, '').replace(',', '');
                allClayTotals.push(n);
            };
            for (var i = 0; i < allIronObjects.length; i++) {
                n = allIronObjects[i].textContent;
                n = n.replace(/\./g, '').replace(',', '');
                allIronTotals.push(n);
            };
            for (var i = 0; i < allVillages.length; i++) {
                warehouseCapacity.push(allWarehouses[i].parentElement.innerText);
            };
            for (var i = 0; i < allVillages.length; i++) {
                for (var j = 1; j < allMerchants.length; j++) {
                    availableMerchants.push(allMerchants[j].innerText);
                }
                totalMerchants.push("999");
            };
            for (var i = 0; i < allVillages.length; i++) {
                farmSpaceUsed.push(allFarms[i].parentElement.innerText.match(/(\d*)\/(\d*)/)[1]);
                farmSpaceTotal.push(allFarms[i].parentElement.innerText.match(/(\d*)\/(\d*)/)[2]);
            };
        }
        else {
            console.log("desktop");
            allWoodObjects = $(page).find(".res.wood,.warn_90.wood,.warn.wood");
            allClayObjects = $(page).find(".res.stone,.warn_90.stone,.warn.stone");
            allIronObjects = $(page).find(".res.iron,.warn_90.iron,.warn.iron")
            allVillages = $(page).find(".quickedit-vn");
            for (var i = 0; i < allWoodObjects.length; i++) {
                n = allWoodObjects[i].textContent;
                n = n.replace(/\./g, '').replace(',', '');
                allWoodTotals.push(n);
            };
            for (var i = 0; i < allClayObjects.length; i++) {
                n = allClayObjects[i].textContent;
                n = n.replace(/\./g, '').replace(',', '');
                allClayTotals.push(n);
            };
            for (var i = 0; i < allIronObjects.length; i++) {
                n = allIronObjects[i].textContent;
                n = n.replace(/\./g, '').replace(',', '');
                allIronTotals.push(n);
            };
            for (var i = 0; i < allVillages.length; i++) {
                warehouseCapacity.push(allIronObjects[i].parentElement.nextElementSibling.innerHTML);
            };
            for (var i = 0; i < allVillages.length; i++) {
                availableMerchants.push(allIronObjects[i].parentElement.nextElementSibling.nextElementSibling.innerText.match(/(\d*)\/(\d*)/)[1]);
                totalMerchants.push(allIronObjects[i].parentElement.nextElementSibling.nextElementSibling.innerText.match(/(\d*)\/(\d*)/)[2]);
            };
            for (var i = 0; i < allVillages.length; i++) {
                farmSpaceUsed.push(allIronObjects[i].parentElement.nextElementSibling.nextElementSibling.nextElementSibling.innerText.match(/(\d*)\/(\d*)/)[1]);
                farmSpaceTotal.push(allIronObjects[i].parentElement.nextElementSibling.nextElementSibling.nextElementSibling.innerText.match(/(\d*)\/(\d*)/)[2]);
            };
        }

        for (var i = 0; i < allVillages.length; i++) {
            villagesData.push({
                "id": allVillages[i].dataset.id,
                "url": allVillages[i].children[0].children[0].href,
                "coord": allVillages[i].innerText.trim().match(/\d+\|\d+/)[0],
                "name": allVillages[i].innerText.trim(),
                "wood": allWoodTotals[i],
                "stone": allClayTotals[i],
                "iron": allIronTotals[i],
                "availableMerchants": availableMerchants[i],
                "totalMerchants": totalMerchants[i],
                "warehouseCapacity": warehouseCapacity[i],
                "farmSpaceUsed": farmSpaceUsed[i],
                "farmSpaceTotal": farmSpaceTotal[i]
            });
        };
    });

askCoordinate();

function createList() {
    if ($("#sendResources")[0]) {
        $("#sendResources")[0].remove();
        $("#resourceSender")[0].remove();
    }
    var htmlString = `
                <div id="resourceSender">
                    <table id="Settings" width="600">
                        <thead>
                            <tr>
                                <td class="sophHeader">${langShinko[7]}</td>
                                <td class="sophHeader">${langShinko[8]}</td>
                                <td class="sophHeader">${langShinko[19]}</td>
                                <td class="sophHeader"></td>
                                <td class="sophHeader"></td>
                            </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td class="sophRowA">
                                <input type="text" ID="coordinateTarget" name="coordinateTarget" size="20" margin="5" align=left>
                            </td>
                            <td class="sophRowA" align="right">
                                <input type="text" ID="resPercent" name="resPercent" size="1" align=right>%
                            </td>
                            <td class="sophRowA" align="right">
                                <input type="text" ID="maxResourceLimit" name="maxResourceLimit" size="6" align=right>
                            </td>
                            <td class="sophRowA" margin="5">
                                <button type="button" ID="button" class="btn-confirm-yes" >${langShinko[2]}</button>
                            </td>
                            <td class="sophRowA">
                                <button type="button" ID="sendRes" class="btn" name="sendRes" onclick=reDo()> ${langShinko[9]}</button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    </br>
                </div>`.trim();
    uiDiv = document.createElement('div');
    uiDiv.innerHTML = htmlString;

    htmlCode = `
            <div id="sendResources" border=0>
                <table id="tableSend" width="100%">
                    <tbody id="appendHere">
                        <tr>
                            <td class="sophHeader" colspan=7 width="550" style="text-align:center" >${langShinko[10]}</td>
                        </tr>
                        <tr>
                            <td class="sophHeader" width="25%" style="text-align:center">${langShinko[11]}</td>
                            <td class="sophHeader" width="25%" style="text-align:center">${langShinko[12]}</td>
                            <td class="sophHeader" width="5%" style="text-align:center">${langShinko[13]}</td>
                            <td class="sophHeader" width="10%" style="text-align:center">${langShinko[14]}</td>
                            <td class="sophHeader" width="10%" style="text-align:center">${langShinko[15]}</td>
                            <td class="sophHeader" width="10%" style="text-align:center">${langShinko[16]}</td>
                            <td class="sophHeader" width="15%">
                                <font size="1">${langShinko[18]}</font>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            `;

    $("#mobileHeader").eq(0).append(htmlCode);
    $("#contentContainer").eq(0).prepend(htmlCode);
    $("#mobileHeader").prepend(uiDiv.firstChild);
    $("#contentContainer").prepend(uiDiv.firstChild);
    $("#resPercent")[0].value = resLimit;
    $("#coordinateTarget")[0].value = coordinate;
    $("#maxResourceLimit")[0].value = maxResourceLimit;

    $('#button').click(function () {
        coordinate = $("#coordinateTarget")[0].value.match(/\d+\|\d+/)[0];
        sessionStorage.setItem("coordinate", coordinate);
        resLimit = $("#resPercent")[0].value;
        sessionStorage.setItem("resLimit", resLimit);
        maxResourceLimit = $("#maxResourceLimit")[0].value;
        sessionStorage.setItem("maxResourceLimit", maxResourceLimit);
    });
    listHTML = ``;

    $("#resourceSender").eq(0).prepend(`<table id="playerTarget" width="600">
    <tbody>
        <tr>
            <td class="sophHeader" rowspan="3"><img src="`+ sendBack[2] + `"></td>
            <td class="sophHeader">${langShinko[4]}:</td>
            <td class="sophRowA">`+ sendBack[3] + `</td>
            <td class="sophHeader"><span class="icon header wood"> </span></td>
            <td class="sophRowB" id="woodSent"></td>
        </tr>
        <tr>
            <td class="sophHeader">${langShinko[5]}:</td>
            <td class="sophRowB">`+ sendBack[1] + `</td>
            <td class="sophHeader"><span class="icon header stone"> </span></td>
            <td class="sophRowA" id="stoneSent"></td>
        </tr>
        <tr>
            <td class="sophHeader">${langShinko[6]}: </td>
            <td class="sophRowA">`+ sendBack[4] + `</td>
            <td class="sophHeader"><span class="icon header iron"> </span></td>
            <td class="sophRowB" id="ironSent"></td>
        </tr>
    </tbody>
</table>`);

    for (var i = 0; i < villagesData.length; i++) {
        if (i % 2 == 0) {
            tempRow = " id='" + i + "' class='sophRowB'";
        }
        else {
            tempRow = " id='" + i + "' class='sophRowA'";
        }
        res = calculateResAmounts(villagesData[i].wood, villagesData[i].stone, villagesData[i].iron, villagesData[i].warehouseCapacity, villagesData[i].availableMerchants);
        if (res.wood + res.stone + res.iron != 0 && villagesData[i].id != sendBack[0]) {
            listHTML += `
        <tr ${tempRow} height="40">
            <td><a href="${villagesData[i].url}" style="color:#40D0E0;">${villagesData[i].name} </a></td>
            <td> <a href="" style="color:#40D0E0;">${sendBack[1]}</a> </td>
            <td>${checkDistance(sendBack[5], sendBack[6], villagesData[i].coord.substring(0, 3), villagesData[i].coord.substring(4, 7))}</td>
            <td width="50" style="text-align:center">${res.wood}<span class="icon header wood"> </span></td>
            <td width="50" style="text-align:center">${res.stone}<span class="icon header stone"> </span></td>
            <td width="50" style="text-align:center">${res.iron}<span class="icon header iron"> </span></td>
            <td style="text-align:center"><input type="button" class="btn evt-confirm-btn btn-confirm-yes" id="sendResources" value="${langShinko[17]}" onclick=sendResource(${villagesData[i].id},${sendBack[0]},${res.wood},${res.stone},${res.iron},${i})></td>
        </tr>`;
        }
    }
    $("#appendHere").eq(0).append(listHTML);
    sortTableTest(2);
    formatTable();
    $(":button,#sendResources")[3].focus();
}

function sendResource(sourceID, targetID, woodAmount, stoneAmount, ironAmount, rowNr) {
    $(':button[id^="sendResources"]').prop('disabled', true);
    setTimeout(function () { 
        $("#" + rowNr)[0].remove(); 
        $(':button[id^="sendResources"]').prop('disabled', false); 
        $(":button,#sendResources")[3].focus(); 
        if($("#tableSend tr").length<=2) {
            alert("Finished sending!");
            if($(".btn-pp").length>0) {
                $(".btn-pp").remove(); 
            }
            throw Error("Done.");
        }
    }, 200);
    var e = { "target_id": targetID, "wood": woodAmount, "stone": stoneAmount, "iron": ironAmount };
    TribalWars.post("market", {
        ajaxaction: "map_send", village: sourceID
    }, e, function (e) {
        Dialog.close();
        UI.SuccessMessage(e.message);
        console.log(e.message);
        totalWoodSent += woodAmount;
        totalStoneSent += stoneAmount;
        totalIronSent += ironAmount;
        $("#woodSent").eq(0).text(`${numberWithCommas(totalWoodSent)}`);
        $("#stoneSent").eq(0).text(`${numberWithCommas(totalStoneSent)}`);
        $("#ironSent").eq(0).text(`${numberWithCommas(totalIronSent)}`);
    }, !1);
}

function numberWithCommas(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1.$2");
    return x;
}

function checkDistance(x1, y1, x2, y2) {
    var a = x1 - x2;
    var b = y1 - y2;
    var distance = Math.round(Math.hypot(a, b));
    return distance;
}

function askCoordinate() {
    var content = `<div style=max-width:1000px;>
    <h2 class="popup_box_header">
       <center><u>
          <font color="darkgreen">${langShinko[0]}</font>
          </u>
       </center>
    </h2>
    <hr>
    <p>
    <center>
       <font color=maroon><b>${langShinko[1]}</b>
       </font>
    </center>
    </p>
    <center> <table><tr><td><center>
    <input type="text" ID="coordinateTargetFirstTime" name="coordinateTargetFirstTime" size="20" margin="5" align=left></center></td></tr>
       <tr></tr>
       <tr><td><center><input type="button"
          class="btn evt-cancel-btn btn-confirm-yes" id="saveCoord"
          value="${langShinko[2]}">&emsp;</center></td></tr>
          <tr></tr>
          </table>
    </center>
    <br>
    <hr>
    <center><img id="sophieImg" class="tooltip-delayed"
       title="<font color=darkgreen>Sophie -Shinko to Kuma-</font>"
       src="https://dl.dropboxusercontent.com/s/bxoyga8wa6yuuz4/sophie2.gif"
       style="cursor:help; position: relative"></center>
    <br>
    <center>
       <p>${langShinko[3]}: <a
          href="https://shinko-to-kuma.my-free.website/"
          title="Sophie profile" target="_blank">Sophie "Shinko
          to Kuma"</a>
       </p>
    </center>
 </div>`;
    Dialog.show('Supportfilter', content);
    if (game_data.locale == "ar_AE") {
        $("#sophieImg").attr("src", "https://media2.giphy.com/media/qYr8p3Dzbet5S/giphy.gif");
    }
    $("#saveCoord").click(function () {
        coordinate = $("#coordinateTargetFirstTime")[0].value.match(/\d+\|\d+/)[0];
        sessionStorage.setItem("coordinate", coordinate);
        var close_this = document.getElementsByClassName('popup_box_close');
        close_this[0].click();
        targetID = coordToId(coordinate);
    });
}

function calculateResAmounts(wood, stone, iron, warehouse, merchants) {
    var merchantCarry = merchants * 1000;
    leaveBehindRes = Math.floor(warehouse / 100 * resLimit);
    var localWood = Math.min(wood - leaveBehindRes, maxResourceLimit);
    var localStone = Math.min(stone - leaveBehindRes, maxResourceLimit);
    var localIron = Math.min(iron - leaveBehindRes, maxResourceLimit);
    localWood = Math.max(0, localWood);
    localStone = Math.max(0, localStone);
    localIron = Math.max(0, localIron);

    merchantWood = (merchantCarry * woodPercentage);
    merchantStone = (merchantCarry * stonePercentage);
    merchantIron = (merchantCarry * ironPercentage);

    var perc = 1;
    if (merchantWood > localWood) {
        perc = localWood / merchantWood;
        merchantWood = merchantWood * perc;
        merchantStone = merchantStone * perc;
        merchantIron = merchantIron * perc;
    }
    if (merchantStone > localStone) {
        perc = localStone / merchantStone;
        merchantWood = merchantWood * perc;
        merchantStone = merchantStone * perc;
        merchantIron = merchantIron * perc;
    }
    if (merchantIron > localIron) {
        perc = localIron / merchantIron;
        merchantWood = merchantWood * perc;
        merchantStone = merchantStone * perc;
        merchantIron = merchantIron * perc;
    }
    thisVillaData = { 
        "wood": Math.floor(merchantWood), 
        "stone": Math.floor(merchantStone), 
        "iron": Math.floor(merchantIron) 
    };
    return thisVillaData;
}

function compareDates(x) {
    var start = x,
        end = new Date(),
        diff = new Date(end - start),
        hours = diff / 1000 / 60 / 60;
    console.log("checked " + hours + " ago for village list");
    return hours;
}

function coordToId(coordinate) {
    if (game_data.player.sitter > 0) {
        sitterID = `game.php?t=${game_data.player.id}&screen=api&ajax=target_selection&input=${coordinate}&type=coord`;
    }
    else {
        sitterID = '/game.php?&screen=api&ajax=target_selection&input=' + coordinate + '&type=coord';
    }
    var data;
    $.get(sitterID, function (json) {
        if(parseFloat(game_data.majorVersion)>8.217) data = json;
        else data=JSON.parse(json);
    }).done(function(){
        console.log(data);
        sendBack = [data.villages[0].id, data.villages[0].name, data.villages[0].image, data.villages[0].player_name, data.villages[0].points, data.villages[0].x, data.villages[0].y];
        createList();
    });
}

function reDo() {
    coordToId(coordinate);
}

function formatTable() {
    var tableRows = $("#table tr");
    for (var i = 1; i < tableRows.length; i++) {
        if (i % 2 == 0) {
            $("#table tr")[i].className = "sophRowB";
        }
        else {
            $("#table tr")[i].className = "sophRowA";
        }
    }
}

function sortTableTest(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("tableSend");
    switching = true;
    dir = "asc";
    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 2; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("td")[n];
            y = rows[i + 1].getElementsByTagName("td")[n];
            if (dir == "asc") {
                if (Number(x.innerHTML) > Number(y.innerHTML)) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (Number(x.innerHTML) < Number(y.innerHTML)) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}

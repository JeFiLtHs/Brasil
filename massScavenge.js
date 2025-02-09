// Mass scavenging por Sophie "Shinko to Kuma"
serverTimeTemp = $("#serverDate")[0].innerText + " " + $("#serverTime")[0].innerText;
serverTime = serverTimeTemp.match(/^([0][1-9]|[12][0-9]|3[01])[\/\-]([0][1-9]|1[012])[\/\-](\d{4})( (0?[0-9]|[1][0-9]|[2][0-3])[:]([0-5][0-9])([:]([0-5][0-9]))?)?$/);
serverDate = Date.parse(serverTime[3] + "/" + serverTime[2] + "/" + serverTime[1] + serverTime[4]);

var is_mobile = !!navigator.userAgent.match(/iphone|android|blackberry/ig) || false;
var scavengeInfo;
var tempElementSelection = "";

// Redirecionamento para a página de saque em massa
if (window.location.href.indexOf('screen=place&mode=scavenge_mass') < 0) {
    window.location.assign(game_data.link_base_pure + "place&mode=scavenge_mass");
}

$("#massScavengeSophie").remove();

// Variáveis globais
var squads = {};
var squads_premium = {};
var enabledCategories = [];
var availableUnits = [];
var squad_requests = [];
var squad_requests_premium = [];
var duration_factor = 0;
var duration_exponent = 0;
var duration_initial_seconds = 0;

var categoryNames = JSON.parse("[" + $.find('script:contains(\"ScavengeMassScreen\")')[0].innerHTML.match(/\{.*\:\{.*\:.*\}\}/g) + "]")[0];

// Definição dos tempos
var time = { 'off': 0, 'def': 0 };

// Interface do script
html = `
<div id="massScavengeSophie" class="ui-widget-content" style="width:600px;background-color:#36393f;cursor:move;z-index:50;">
    <button class="btn" id="x" onclick="closeWindow('massScavengeSophie')">X</button>
    <h3 style="color:#ffffdf; text-align:center;">Mass Scavenging</h3>
    <center><button class="btn btnSophie" id="sendMass" onclick="readyToSend()">Calcular Saques</button></center>
    <center><button class="btn btnSophie" id="autoScavenge" onclick="sendAllGroups()">Iniciar Saque Automático</button></center>
</div>`;

$(".maincell").eq(0).prepend(html);
$("#mobileContent").eq(0).prepend(html);

// Permitir mover a interface
if (is_mobile == false) {
    $("#massScavengeSophie").css("position", "fixed");
    $("#massScavengeSophie").draggable();
}

// 🛠️ Função para calcular os saques
function readyToSend() {
    console.log("Calculando saques...");
    getData();
}

// 🛠️ Função para envio automático de saques
function sendAllGroups(autoDelay = 5000) { // Delay entre os envios (5 segundos padrão)
    let groupKeys = Object.keys(squads);
    let index = 0;

    function sendNextGroup() {
        if (index < groupKeys.length) {
            let groupNr = groupKeys[index];
            console.log(`Enviando grupo ${groupNr}...`);
            sendGroup(groupNr, false);
            index++;

            // Aguarda antes de enviar o próximo grupo
            setTimeout(sendNextGroup, autoDelay);
        } else {
            console.log("✅ Todos os grupos foram enviados automaticamente!");
        }
    }

    sendNextGroup();
}

// 🛠️ Função para enviar um grupo específico de saque
function sendGroup(groupNr, premiumEnabled) {
    let actuallyEnabled = premiumEnabled ? confirm("Tem certeza que deseja usar premium?") : false;
    let tempSquads = actuallyEnabled ? squads_premium[groupNr] : squads[groupNr];

    $(':button[id^="sendMass"]').prop('disabled', true);
    $(':button[id^="sendMassPremium"]').prop('disabled', true);

    TribalWars.post('scavenge_api', { ajaxaction: 'send_squads' }, { "squad_requests": tempSquads }, function () {
        UI.SuccessMessage(`Grupo ${groupNr} enviado!`);
    });

    setTimeout(function () { 
        $(`#sendRow${groupNr}`).remove(); 
        $(':button[id^="sendMass"]').prop('disabled', false); 
        $(':button[id^="sendMassPremium"]').prop('disabled', false); 
    }, 200);
}

// 🛠️ Função para obter dados de saque
function getData() {
    $("#massScavengeSophie").remove();
    URLs = [];
    
    $.get("game.php?&screen=place&mode=scavenge_mass", function (data) {
        let amountOfPages = $(".paged-nav-item").length > 0 ? parseInt($(".paged-nav-item")[$(".paged-nav-item").length - 1].href.match(/page=(\d+)/)[1]) : 0;

        for (var i = 0; i <= amountOfPages; i++) {
            URLs.push(`game.php?&screen=place&mode=scavenge_mass&page=${i}`);
        }

        arrayWithData = "[";

        $.getAll(URLs, (i, data) => {
            thisPageData = $(data).find('script:contains("ScavengeMassScreen")').html().match(/\{.*\:\{.*\:.*\}\}/g)[2];
            arrayWithData += thisPageData + ",";
        }, () => {
            arrayWithData = arrayWithData.substring(0, arrayWithData.length - 1) + "]";
            scavengeInfo = JSON.parse(arrayWithData);

            for (var i = 0; i < scavengeInfo.length; i++) {
                calculateHaulCategories(scavengeInfo[i]);
            }

            squads = {}; squads_premium = {};
            let per200 = 0, groupNumber = 0;
            squads[groupNumber] = [];
            squads_premium[groupNumber] = [];

            for (var k = 0; k < squad_requests.length; k++) {
                if (per200 == 200) {
                    groupNumber++;
                    squads[groupNumber] = [];
                    squads_premium[groupNumber] = [];
                    per200 = 0;
                }
                per200++;
                squads[groupNumber].push(squad_requests[k]);
                squads_premium[groupNumber].push(squad_requests_premium[k]);
            }

            console.log("✅ Saques prontos! Use 'Iniciar Saque Automático' para envio total.");
        }, (error) => {
            console.error(error);
        });
    });
}

// 🛠️ Função para calcular as tropas de saque por aldeia
function calculateHaulCategories(data) {
    if (data.has_rally_point) {
        console.log("Pode saquear!");

        let candidate_squad = { "unit_counts": data.unit_counts_home, "carry_max": 9999999999 };

        for (var k = 1; k <= 4; k++) {
            if (!data.options[k].is_locked) {
                squad_requests.push({ "village_id": data.village_id, "candidate_squad": candidate_squad, "option_id": k, "use_premium": false });
                squad_requests_premium.push({ "village_id": data.village_id, "candidate_squad": candidate_squad, "option_id": k, "use_premium": true });
            }
        }
    }
}

// 🛠️ Função para fechar a interface
function closeWindow(title) {
    $("#" + title).remove();
}

                      

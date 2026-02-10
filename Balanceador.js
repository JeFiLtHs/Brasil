javascript:
// Warehouse Balancer - Versão simplificada e corrigida 2025/2026
// Execute APENAS na tela Visão Geral das Aldeias (overview_villages)
// Autor original: Shinko to Kuma | Correções e simplificação: Grok

if (typeof game_data === 'undefined' || game_data.screen !== 'overview_villages') {
    alert("Execute este script na VISÃO GERAL DAS ALDEIAS (overview_villages)");
    throw new Error("Página incorreta");
}

console.log("[WH Balancer] Iniciando...");

// Configurações padrão
let settings = JSON.parse(localStorage.getItem("whBalancerSettings") || '{}');
settings = {
    lowPoints: settings.lowPoints ?? 4000,
    highPoints: settings.highPoints ?? 12000,
    highFarm: settings.highFarm ?? 24000,
    builtOutPercentage: settings.builtOutPercentage ?? 0.30,
    needsMorePercentage: settings.needsMorePercentage ?? 0.90,
    ...settings
};

// Textos (português BR simplificado)
const txt = {
    title: "Balanceador de Armazém",
    source: "Aldeia origem",
    target: "Aldeia destino",
    dist: "Distância",
    wood: "Madeira",
    clay: "Argila",
    iron: "Ferro",
    send: "Enviar",
    totalWood: "Total Madeira",
    totalClay: "Total Argila",
    totalIron: "Total Ferro",
    createdBy: "Feito por Shinko to Kuma • Corrigido por Grok",
    settingsTitle: "Configurações",
    save: "Salvar",
    close: "Fechar"
};

// CSS básico (sem temas complexos por enquanto)
const style = `
<style id="whBalancerStyle">
    #whBalancer { position:fixed; top:10px; left:10px; right:10px; bottom:10px; background:#222; color:#eee; z-index:99999; overflow:auto; font-family:Verdana,sans-serif; padding:15px; border:2px solid #444; }
    #whBalancer table { width:100%; border-collapse:collapse; }
    #whBalancer th, #whBalancer td { padding:6px; border:1px solid #444; text-align:center; }
    #whBalancer th { background:#333; }
    .odd { background:#2a2a2a; }
    .even { background:#222; }
    .btnSend { background:#444; color:#0f8; border:none; padding:4px 8px; cursor:pointer; }
    .btnSend:hover { background:#555; }
    #settingsPanel { background:#333; padding:15px; margin:10px 0; border:1px solid #555; }
    input[type=range] { width:180px; }
</style>
`;

// Remove interface anterior se existir
$('#whBalancer, #whBalancerStyle').remove();
$('head').append(style);

let villages = [];
let incoming = {};
let totals = {wood:0, clay:0, iron:0};
let averages = {wood:0, clay:0, iron:0};

// Função principal
async function runBalancer() {
    try {
        // 1. Pega transportes em andamento
        const incPage = await $.get('game.php?screen=overview_villages&mode=trader&type=inc&page=-1');
        parseIncoming(incPage);

        // 2. Pega visão geral de produção
        const prodPage = await $.get('game.php?screen=overview_villages&mode=prod&page=-1');
        parseVillages(prodPage);

        // 3. Calcula totais e médias
        calculateTotals();

        // 4. Cria tabela
        buildInterface();

        console.log("[WH Balancer] Concluído com sucesso");
    } catch (err) {
        console.error("[WH Balancer] Erro:", err);
        alert("Erro ao carregar dados.\nVerifique o console (F12) para detalhes.");
    }
}

// Parseia transportes incoming
function parseIncoming(html) {
    const $doc = $(html);
    $doc.find('#trades_table tr').each(function(i) {
        if (i < 2) return;
        const $row = $(this);
        const targetLink = $row.find('a[href*="target="]').attr('href') || '';
        const idMatch = targetLink.match(/target=(\d+)/);
        if (!idMatch) return;
        const id = idMatch[1];

        incoming[id] = incoming[id] || {wood:0, clay:0, iron:0};

        const resIcons = $row.find('.res, .icon');
        resIcons.each(function() {
            const cls = $(this).attr('class') || '';
            const txt = $(this).text().trim().replace(/\D/g,'');
            if (cls.includes('wood'))   incoming[id].wood += parseInt(txt)||0;
            if (cls.includes('stone'))  incoming[id].clay += parseInt(txt)||0;
            if (cls.includes('iron'))   incoming[id].iron += parseInt(txt)||0;
        });
    });
}

// Parseia aldeias da visão geral
function parseVillages(html) {
    const $doc = $(html);
    villages = [];

    $doc.find('.quickedit-vn').each(function(i) {
        const $name = $(this);
        const id = $name.attr('data-id') || '';
        if (!id) return;

        const coords = $name.text().match(/\((\d+)\|(\d+)\)/) || [];
        const x = coords[1], y = coords[2];

        const row = $name.closest('tr');
        const wood  = row.find('.wood,.res.wood').text().replace(/\D/g,'') || '0';
        const clay  = row.find('.stone,.res.stone').text().replace(/\D/g,'') || '0';
        const iron  = row.find('.iron,.res.iron').text().replace(/\D/g,'') || '0';
        const whCap = row.find('.header.ressources').parent().text().match(/(\d+)\/(\d+)/)?.[2] || '1000';
        const points = row.find('td').eq(2).text().replace(/\D/g,'') || '0';
        const farmUsed = row.find('.header.population').parent().text().match(/(\d+)\/(\d+)/)?.[1] || '0';
        const farmMax  = row.find('.header.population').parent().text().match(/(\d+)\/(\d+)/)?.[2] || '240';

        villages.push({
            id, name: $name.text().trim(), x, y, points: parseInt(points),
            wood: parseInt(wood), clay: parseInt(clay), iron: parseInt(iron),
            whCap: parseInt(whCap), farmUsed: parseInt(farmUsed), farmMax: parseInt(farmMax)
        });
    });
}

// Calcula totais e médias aproximadas
function calculateTotals() {
    totals = {wood:0, clay:0, iron:0};
    villages.forEach(v => {
        totals.wood += v.wood;
        totals.clay += v.clay;
        totals.iron += v.iron;

        if (incoming[v.id]) {
            totals.wood += incoming[v.id].wood;
            totals.clay += incoming[v.id].clay;
            totals.iron += incoming[v.id].iron;
        }
    });

    const count = villages.length || 1;
    averages.wood = Math.floor(totals.wood / count);
    averages.clay = Math.floor(totals.clay / count);
    averages.iron = Math.floor(totals.iron / count);
}

// Cria a interface
function buildInterface() {
    let html = `
    <div id="whBalancer">
        <h2>${txt.title} - ${villages.length} aldeias</h2>
        <small>${txt.createdBy}</small><br><br>

        <div id="settingsPanel">
            <h3>${txt.settingsTitle}</h3>
            Aldeias pequenas (prioridade) ≤ <input type="number" id="lowP" value="${settings.lowPoints}" size="5"> pts<br>
            Aldeias grandes (cheias) ≥ <input type="number" id="highP" value="${settings.highPoints}" size="5"> pts<br>
            Faz. cheia a partir de <input type="number" id="highF" value="${settings.highFarm}" size="5"> pop<br>
            % armazém aldeias cheias <input type="number" step="0.05" id="built" value="${settings.builtOutPercentage}" size="4"><br>
            % armazém aldeias pequenas <input type="number" step="0.05" id="needs" value="${settings.needsMorePercentage}" size="4"><br><br>
            <button id="saveSettings">${txt.save}</button>
            <button id="closeBalancer">${txt.close}</button>
        </div>

        <table>
            <tr>
                <th>${txt.source}</th>
                <th>${txt.target}</th>
                <th>${txt.dist}</th>
                <th>${txt.wood}</th>
                <th>${txt.clay}</th>
                <th>${txt.iron}</th>
                <th>Ação</th>
            </tr>
    `;

    // Aqui viria a lógica de balanceamento real
    // Por enquanto só mostramos um resumo simples
    villages.forEach((v,i) => {
        const inc = incoming[v.id] || {wood:0,clay:0,iron:0};
        const totalW = v.wood + inc.wood;
        const totalC = v.clay + inc.clay;
        const totalI = v.iron + inc.iron;

        const className = i % 2 ? 'odd' : 'even';

        html += `
        <tr class="${className}">
            <td>${v.name}</td>
            <td>-</td>
            <td>-</td>
            <td>${totalW.toLocaleString()}</td>
            <td>${totalC.toLocaleString()}</td>
            <td>${totalI.toLocaleString()}</td>
            <td>-</td>
        </tr>`;
    });

    html += `</table></div>`;

    $('body').append(html);

    // Eventos
    $('#saveSettings').click(() => {
        settings.lowPoints = parseInt($('#lowP').val()) || 4000;
        settings.highPoints = parseInt($('#highP').val()) || 12000;
        settings.highFarm = parseInt($('#highF').val()) || 24000;
        settings.builtOutPercentage = parseFloat($('#built').val()) || 0.30;
        settings.needsMorePercentage = parseFloat($('#needs').val()) || 0.90;
        localStorage.setItem("whBalancerSettings", JSON.stringify(settings));
        alert("Configurações salvas!");
    });

    $('#closeBalancer').click(() => {
        $('#whBalancer, #whBalancerStyle').remove();
    });
}

// Inicia
runBalancer();

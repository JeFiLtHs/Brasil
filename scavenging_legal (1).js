//VARIÁVEIS DO PROGRAMA
var contagem = 0;
var passos = 200;
var trabalhador; //thread paralela para cálculos
var tem_arqueiro = game_data.units.includes("archer");
var fator_duracao, expoente_duracao, duracao_inicial_segundos;
var horas = 6;
var max_lanca = -1;
var max_espada = -1;
var max_machado = -1;
var max_arqueiro = -1;
var max_leve = -1;
var max_cavalaria = -1;
var max_pesado = -1;

var haulsPorUnidade = {"spear":25, "sword":15, "axe":10, "light":80, "heavy":50, "archer":10, "marcher":50, "knight":0};
var fatoresSaque = {0:0.1,1:0.25,2:0.5,3:0.75};
var chaveAPIContagem = "saqueOtimizado";
//VARIÁVEIS DO PROGRAMA

async function executar_tudo()
{
    chamarAPIContagem();
    if (window.location.href.indexOf('screen=place&mode=scavenge') < 0) {
        window.location.assign(game_data.link_base_pure + "place&mode=scavenge");
    }
    if (parseFloat(game_data.majorVersion) < 8.177) {
        var infoSaque = JSON.parse($('html').find('script:contains("ScavengeScreen")').html().match(/\{.*\:\{.*\:.*\}\}/g)[0]);
        fator_duracao = infoSaque[1].duration_factor;
        expoente_duracao = infoSaque[1].duration_exponent;
        duracao_inicial_segundos = infoSaque[1].duration_initial_seconds;
    }
    else {
        fator_duracao = window.ScavengeScreen.village.options[1].base.duration_factor;
        expoente_duracao = window.ScavengeScreen.village.options[1].base.duration_exponent;
        duracao_inicial_segundos = window.ScavengeScreen.village.options[1].base.duration_initial_seconds;
    }

    criarInterface();
    iniciarTrabalhador();

    $.ajax({url:window.location.href.split("scavenge")[0] + "units", success:funcaoSucesso});
}

function chamarAPIContagem(){
    $.getJSON(`https://api.countapi.xyz/hit/fmthemasterScripts/${chaveAPIContagem}`, function(response) {
        console.log(`Este script foi executado ${response.value} vezes`);
    });
}

function meuConsoleLog(arg)
{
    var memoria = JSON.stringify(arg);
    console.log(memoria);
}

function inputMemoria()
{
    if ("TempoSaque" in localStorage) {
        horas = parseFloat(localStorage.getItem("TempoSaque"));
    }

    document.getElementById("horas").value = parseFloat(horas);

    if ("max_lanca" in localStorage) {
        max_lanca = parseInt(localStorage.getItem("max_lanca"));
    }

    document.getElementById("max_lanca").value = parseInt(max_lanca);

    if ("max_espada" in localStorage) {
        max_espada = parseInt(localStorage.getItem("max_espada"));
    }

    document.getElementById("max_espada").value = parseInt(max_espada);

    if ("max_machado" in localStorage) {
        max_machado = parseInt(localStorage.getItem("max_machado"));
    }

    document.getElementById("max_machado").value = parseInt(max_machado);

    if(tem_arqueiro)
    {
        if ("max_arqueiro" in localStorage) {
            max_arqueiro = parseInt(localStorage.getItem("max_arqueiro"));
        }
        document.getElementById("max_arqueiro").value = parseInt(max_arqueiro);
    }

    if ("max_leve" in localStorage) {
        max_leve = parseInt(localStorage.getItem("max_leve"));
    }

    document.getElementById("max_leve").value = parseInt(max_leve);

    if(tem_arqueiro)
    {
        if ("max_cavalaria" in localStorage) {
            max_cavalaria = parseInt(localStorage.getItem("max_cavalaria"));
        }
        document.getElementById("max_cavalaria").value = parseInt(max_cavalaria);
    }

    if ("max_pesado" in localStorage) {
        max_pesado = parseInt(localStorage.getItem("max_pesado"));
    }

    document.getElementById("max_pesado").value = parseInt(max_pesado);
}

function aceitarConfigs()
{
    horas = parseFloat(document.getElementById("horas").value);
    localStorage.setItem("TempoSaque", horas);
    
    max_lanca = parseInt(document.getElementById("max_lanca").value);    
    localStorage.setItem("max_lanca", max_lanca);
    
    max_espada = parseInt(document.getElementById("max_espada").value);
    localStorage.setItem("max_espada", max_espada);
    
    max_machado = parseInt(document.getElementById("max_machado").value);
    localStorage.setItem("max_machado", max_machado);
    
    if(tem_arqueiro)
    {
        max_arqueiro = parseInt(document.getElementById("max_arqueiro").value);
        localStorage.setItem("max_arqueiro", max_arqueiro);
    }
    
    max_leve = parseInt(document.getElementById("max_leve").value);
    localStorage.setItem("max_leve", max_leve);
    
    if(tem_arqueiro)
    {
        max_cavalaria = parseInt(document.getElementById("max_cavalaria").value);
        localStorage.setItem("max_cavalaria", max_cavalaria);
    }
    
    max_pesado = parseInt(document.getElementById("max_pesado").value);
    localStorage.setItem("max_pesado", max_pesado);
}

function criarInterface()
{
    if ($('button').length == 0) {

    //criar interface e botão
    var categoriaSaque = 0;
    localStorage.setItem("categoriaSaque", categoriaSaque);
    var botao = document.createElement("button");
    botao.classList.add("btn-confirm-yes");
    botao.innerHTML = "Ajustar tempo de saque";
    botao.style.visibility = 'hidden';
    var corpo = document.getElementById("scavenge_screen");
    corpo.prepend(botao);
    var divSaque = document.createElement('div');

    if (tem_arqueiro) {
        htmlString = '<div  ID= tabelaSaque >\
        <table class="tabelaSaque" width="15%" style="border: 7px solid rgba(121,0,0,0.71); border-image-slice: 7 7 7 7; border-image-source: url(https://dsen.innogamescdn.com/asset/cf2959e7/graphic[...]
            <tbody>\
                <tr>\
                    <th style="text-align:center" colspan="13">Selecione tipos de unidades para saquear</th>\
                </tr>\
                <tr>\
                    <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="spear"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_spear.png" title="[...]
                    <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="sword"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_sword.png" title="[...]
                    <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="axe"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_axe.png" title="Axem[...]
                    <th style="text-align:center" width="35"><a href="#" cl ass="unit_link" data-unit="archer"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_archer.png" titl[...]
                    <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="light"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_light.png" title="[...]
                    <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="marcher"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_marcher.png" tit[...]
                    <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="heavy"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_heavy.png" title="[...]
                    <th style="text-align:center" nowrap width="120">Tempo Máximo</th>\
                </tr>\
                <tr>\
                    <td align="center"><input type="checkbox" ID="lanca" name="lanca" checked = "checked" ></td>\
                    <td align="center"><input type="checkbox" ID="espada" name="espada" ></td>\
                    <td align="center"><input type="checkbox" ID="machado" name="machado" ></td>\
                    <td align="center"><input type="checkbox" ID="arqueiro" name="arqueiro" ></td>\
                    <td align="center"><input type="checkbox" ID="leve" name="leve" ></td>\
                    <td align="center"><input type="checkbox" ID="cavalaria" name="cavalaria" ></td>\
                    <td align="center"><input type="checkbox" ID="pesado" name="pesado" ></td>\
                    <td ID="tempoExecucao" align="center"><input type="text" ID="horas" name="horas" size="1" maxlength="2" align=left > horas</td>\
                </tr>\
                <tr>\
                    <th style="text-align:center" colspan="13">Insira o máximo de tropas para usar no saque (-1 = ilimitado)</th>\
                </tr>\
                <tr>\
                    <td align="center"><input type="text" size="1" maxlength="5" ID="max_lanca" value=-1 name="max_lanca" checked = "checked" ></td>\
                    <td align="center"><input type="text" size="1" maxlength="5" ID="max_espada" value=-1 name="max_espada" ></td>\
                    <td align="center"><input type="text" size="1" maxlength="5" ID="max_machado" value=-1 name="max_machado" ></td>\
                    <td align="center"><input type="text" size="1" maxlength="5" ID="max_arqueiro" value=-1 name="max_arqueiro" ></td>\
                    <td align="center"><input type="text" size="1" maxlength="5" ID="max_leve" value=-1 name="max_leve" ></td>\
                    <td align="center"><input type="text" size="1" maxlength="5" ID="max_cavalaria" value=-1 name="max_cavalaria" ></td>\
                    <td align="center"><input type="text" size="1" maxlength="5" ID="max_pesado" value=-1 name="max_pesado" ></td>\
                    <td align ="center" colspan="2"><input class="btn" ID="btn-aceitar-configs"  type="submit" value="Aceitar configs" tabindex="5" onclick="aceitarConfigs()"> </td>\
                </tr>\
           </tbody>\
        </table>\
     </div>\
     ';
    } else {
        htmlString = '<div  ID= tabelaSaque >\
        <table class="tabelaSaque" width="15%" style="border: 7px solid rgba(121,0,0,0.71); border-image-slice: 7 7 7 7; border-image-source: url(https://dsen.innogamescdn.com/asset/cf2959e7/graphic[...]
            <tbody>\
                <tr>\
                    <th style="text-align:center" colspan="13">Selecione tipos de unidades para saquear</th>\
                </tr>\
                <tr>\
                    <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="spear"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_spear.png" title="[...]
                    <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="sword"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_sword.png" title="[...]
                    <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="axe"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_axe.png" title="Axem[...]
                    <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="light"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_light.png" title="[...]
                    <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="heavy"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_heavy.png" title="[...]
                    <th style="text-align:center" nowrap width="120">Tempo Alvo</th>\
                </tr>\
                <tr>\
                    <td align="center"><input type="checkbox" ID="lanca" name="lanca" checked = "checked" ></td>\
                    <td align="center"><input type="checkbox" ID="espada" name="espada" ></td>\
                    <td align="center"><input type="checkbox" ID="machado" name="machado" ></td>\
                    <td align="center"><input type="checkbox" ID="leve" name="leve" ></td>\
                    <td align="center"><input type="checkbox" ID="pesado" name="pesado" ></td>\
                    <td ID="tempoExecucao" align="center"><input type="text" ID="horas" name="horas" size="1" maxlength="2" align=left > horas</td>\
                </tr>\
                <tr>\
                    <th style="text-align:center" colspan="13">Insira o máximo de tropas para usar no saque (-1 = ilimitado)</th>\
                </tr>\
                <tr>\
                    <td align="center"><input type="text" size="1" maxlength="5" ID="max_lanca" value=-1 name="max_lanca" checked = "checked" ></td>\
                    <td align="center"><input type="text" size="1" maxlength="5" ID="max_espada" value=-1 name="max_espada" ></td>\
                    <td align="center"><input type="text" size="1" maxlength="5" ID="max_machado" value=-1 name="max_machado" ></td>\
                    <td align="center"><input type="text" size="1" maxlength="5" ID="max_leve" value=-1 name="max_leve" ></td>\
                    <td align="center"><input type="text" size="1" maxlength="5" ID="max_pesado" value=-1 name="max_pesado" ></td>\
                    <td align ="center" colspan="1"><input class="btn" ID="btn-aceitar-configs"  type="submit" value="Aceitar configs" tabindex="5" onclick="aceitarConfigs()"> </td>\
                </tr>\
           </tbody>\
        </table>\
     </div>\
     ';
    }

    divSaque.innerHTML = htmlString;
    scavenge_screen.prepend(divSaque.firstChild);

    inputMemoria();
    }

    if ($(".tabelaSaque")[0]) {
    document.getElementById("horas").value = horas;
    }

    var valoresCheckbox = JSON.parse(localStorage.getItem('valoresCheckbox')) || {}, $checkboxes = $("#tabelaSaque :checkbox");
    $checkboxes.on("change", function () {
    $checkboxes.each(function () {
        valoresCheckbox[this.id] = this.checked;
    });
    localStorage.setItem("valoresCheckbox", JSON.stringify(valoresCheckbox));
    });

    $.each(valoresCheckbox, function (key, value) {
    $("#" + key).prop('checked', value);
    });
}

function statusCheckbox(unidadesDisponiveis) {
    if (document.getElementById("lanca").checked == false) {
        unidadesDisponiveis["spear"] = 0;
    }
    if (document.getElementById("espada").checked == false) {
        unidadesDisponiveis["sword"] = 0;
    }
    if (document.getElementById("machado").checked == false) {
        unidadesDisponiveis["axe"] = 0;
    }
    if (document.getElementById("leve").checked == false) {
        unidadesDisponiveis["light"] = 0;
    }
    if (document.getElementById("pesado").checked == false) {
        unidadesDisponiveis["heavy"] = 0;
    }
    if (tem_arqueiro) {
        if (document.getElementById("arqueiro").checked == false) {
            unidadesDisponiveis["archer"] = 0;
        }
    }
    if (tem_arqueiro) {
        if (document.getElementById("cavalaria").checked == false) {
            unidadesDisponiveis["marcher"] = 0;
        }
    }
    unidadesDisponiveis["knight"] = 0;
}

function obterUnidadesDisponiveis() {
    var unidades

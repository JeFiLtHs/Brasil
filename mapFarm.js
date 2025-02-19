//author fmthemaster
//discord: fmthemaster#7485
/* globals TWMap , csrf_token*/


/******PROGRAM VARS**********/
//specific
var LA_ids=[];
var toToggleBack = [];
var depthMax = 3;
var loadingLAstuff = false;
var fmMapLASettings;

//general
const scriptName = "LA in Map";
var scriptTag = "fmMapLA";
var forumLink = "https://forum.tribalwars.net/index.php?threads/hide-barbarians-in-la.286468/";
var countapikey = "mapFarm";
var sitter = "";
var runScreen = "screen=map";
/******PROGRAM VARS**********/

function main(){
    hitCountApi();
    if($(`#${scriptTag}_popup_container`).length){
        UI.ErrorMessage("Script has already been loaded, reload the page before calling it again");
        return;
    }
    let sitterQuery = window.location.search.match(/t=\d+/g);
    if(sitterQuery)
        sitter = sitterQuery;
    if(window.location.href.indexOf(`${runScreen}`)==-1)
    {
        UI.ErrorMessage("Script must be run in map");
        window.location.href = window.location.pathname+ `?${sitter?sitter+"&":""}${runScreen}`;
        return;
    }


    getCache();
    setHTML();
}

function hitCountApi(){
    $.getJSON(`https://api.countapi.xyz/hit/fmthemasterScripts/${countapikey}`, function(response) {
        console.log(`This script has been run ${response.value} times`);
    });
}


/**************HTML***************/


function setHTML(){

    let html =`
    <div id="${scriptTag}_popup_container" class="fm_popup_container">
        <div>
            <a class="popup_box_close tooltip-delayed" id="${scriptTag}_popup_cross" href="javascript:void(0)"> 
            </a>
            <div id="${scriptTag}_popup_content" class="fm_popup_content">
                <h3 class ="fm_centered">${scriptName}</h3>
                <div style="padding:5px;">
                    <div style="border: 1px solid #804000; padding: 5px;">    
                        <span> 
                            <input type="checkbox" id="${scriptTag}_ignoreLA" class="${scriptTag}_checkbox">
                            <label for="${scriptTag}_ignoreLA"><b>Ignore LA</b></label>
                        </span>
                        <br>
                        <br>
                        <span id="${scriptTag}_changeLAFilters_p">
                            <input type="checkbox" id="${scriptTag}_changeLAFilters" class="${scriptTag}_checkbox">
                            <label for="${scriptTag}_changeLAFilters"><b>Change LA filters</b></label>
                        </span>
                    </div>
                </div>
                <br>
                <div class="${scriptTag}_keyPress">
                    <table>
                        <tbody class="vis">
                            <tr class=" row_b">
                                <th>
                                    Buttons:
                                </th>
                                <td class="${scriptTag}_td_farm_icon">
                                    <a href="javascript:void(0);" class="fm_centered ${scriptTag}_farm_keybind ${scriptTag}_farm_icon farm_icon farm_icon_a" data-farmtype="a"></a>
                                </td>
                                <td class="${scriptTag}_td_farm_icon">
                                    <a href="javascript:void(0);" class="${scriptTag}_farm_keybind ${scriptTag}_farm_icon farm_icon farm_icon_b" data-farmtype="b"></a>
                                </td>
                            </tr>
                            <tr class= "row_b">
                                <th>
                                    Key binding:
                                </th>
                                <td style="min-width:35px;">
                                    A
                                </td>
                                <td style="min-width:35px;">
                                    B
                                </td>
                            </tr>
                        </tbody> 
                    </table>
                </div>
                <br>
                <br>
                <div id="${scriptTag}_LAlist">
                    <table>
                        <thead>
                            <tr>
                                <th style="min-width:70px;">Village</th>
                                <th style="min-width:40px;"><img src="/graphic/rechts.png"></th>
                                <th colspan="5">LA</th>
                            </tr>
                        </thead>
                        <tbody id="${scriptTag}_popupTable" class="vis">
                        </tbody>
                    </table>
                </div>
                <p>
                    <input type="text" id="${scriptTag}_mapSize" value ="${TWMap.size[0]}" size="1">
                    <input id="${scriptTag}_resizeMap" value ="Resize Map" class="btn" type="submit">

                </+>
                <p>
                    <input class="btn btn-confirm-yes" id="${scriptTag}_reloadTable" type="submit" value="Reload table">
                </p>
                <br>
                <br>
                <br>    
            </div>
        </div>
    </div>
    <style>
        /*general css*/
        .fm_popup_container {
            border: 19px solid #804000;
            -moz-border-image: url("/graphic/popup/border.png") 9 19 19 19 repeat;
            -webkit-border-image: url("/graphic/popup/border.png") 9 19 19 19 repeat;
            -o-border-image: url("/graphic/popup/border.png") 19 19 19 19 repeat;
            border-image: url("/graphic/popup/border.png") 19 19 19 19 repeat;
            display: block;
            position: fixed;
            top: 8%;
            left: 70%;
            z-index: 14000;
        }
        .fm_popup_content {
            min-width: 200px;
            min-height: 120px;            
            height:100%;
            overflow: hidden;
            background-image: url('/graphic/popup/content_background.png');
        }
        .fm_centered {
            text-align: center;
        }
        /*specific css*/
        .${scriptTag}_tableHeader{
            height: 35px;
            text-align: text-bottom;
        }
        #${scriptTag}_LAlist {
            overflow-y:auto; 
            max-height:30vh;
        }
        #${scriptTag}_LAlist td, ${scriptTag}_LAlist th{
            text-align: center; 
        }
        .${scriptTag}_farm_icon{
            transform: scale(1.2);
            width: 24px;
            height: 24px;
        }
        .${scriptTag}_td_farm_icon{
            min-width: 55px;
            height: 30px;
        }

        .btn-confirm-yes{
            position: absolute;
            right: 5px;
        }
    </style>`;

    $("body").append(html);
    $(`#${scriptTag}_popup_container`).draggable();
    $(`#${scriptTag}_popup_cross`).click(closePopup);
    $(`#${scriptTag}_reloadTable`).click(getFirstFarmPage);
    $(`#${scriptTag}_mapSize`).click(focusSelect);
    $(`#${scriptTag}_resizeMap`).click(function(){
        TWMap.resize(parseInt($(`#${scriptTag}_mapSize`).val()));
        setTimeout(getFirstFarmPage, 1000);
    });
    
    setHTMLOptions();
    getHTMLOptions();

    $(`.${scriptTag}_checkbox`).on("change",()=>{
        getHTMLOptions();
        setCache(); 
    });

    addAuthor(`#${scriptTag}_popup_content`);
    getFirstFarmPage();
}

function addLARow(village){
    if( typeof addLARow.counter == 'undefined' ) {
        addLARow.counter = 0;
    }
    if(LA_ids.indexOf(village.id)!=-1)
        return;

    addLARow.counter++;
    $("#fmMapLA_popupTable").append(`
    <tr class=${addLARow.counter%2?"row_a":"row_b"}>
        <td><a href="${window.location.pathname}?${sitter?sitter+"&":""}&screen=info_village&id=${village.id}" target="_blank">${parseInt(village.xy/1000)}|${village.xy%1000}</a></td>
        <td>${village.distance}</td>
        <td class="${scriptTag}_td_farm_icon"><a href="javascript:void(0);" class="fm_centered ${scriptTag}_farm_icon ${scriptTag}_sendFarm farm_icon farm_icon_a" data-farmtype="a" data-villagexy="${village.xy}"></a></td>
        <td class="${scriptTag}_td_farm_icon"><a href="javascript:void(0);" class="${scriptTag}_farm_icon ${scriptTag}_sendFarm farm_icon farm_icon_b" data-farmtype="b" data-villagexy="${village.xy}"></a></td>
    </tr>`);
}

function closePopup(){
    $(`#${scriptTag}_popup_container`).remove();
}

function focusSelect(){
    this.focus();
    this.select();
}

function makeLATable(){
    let barbs = $.grep(Object.values(TWMap.villages), (obj)=>obj.owner=="0"&&obj.points);
    barbs.sort(function(a, b){
        let [x0,y0] = [game_data.village.x, game_data.village.y];
        let [xa,ya] = [Math.floor(a.xy/1000), a.xy%1000];
        let [xb,yb] = [Math.floor(b.xy/1000), b.xy%1000];
        a.distance = Math.sqrt((xa-x0)**2 + (ya-y0)**2).toFixed(1);
        b.distance = Math.sqrt((xb-x0)**2 + (yb-y0)**2).toFixed(1);
        return a.distance - b.distance;
    });

    $.each(barbs, (key, barb)=> addLARow(barb));
    $(`.${scriptTag}_sendFarm`).off("click");
    $(`.${scriptTag}_sendFarm`).click(function(){
        console.log(this.dataset.villagexy);
        farmVillage(parseInt(this.dataset.villagexy), this.dataset.farmtype);
        $(this).closest("tr").remove();
    });
}

function addAuthor(cointainerSelector){
    let authorHTML = `
    <div class="fmAuthor">    
        <b>Script:</b> <a href="${forumLink}">${scriptName}</a>
        <br>
        <b>Author:</b> <a href="https://forum.tribalwars.net/index.php?members/the-quacks.124200/">fmthemaster aka The Quacks</a>
    </div>
    <style>
        .fmAuthor{
            border: 1px solid #804000;
            padding: 5px;
            <!--position: absolute;
            bottom: 5px;-->
        }
    </style>
    `;
    $(cointainerSelector).append(authorHTML);

}

function startLoader(length)
{
    let width = $("#contentContainer")[0].clientWidth;
    $("#contentContainer").eq(0).prepend(`
    <div id="progressbar" class="progress-bar">
        <span class="count label">0/${length}</span>
        <div id="progress"><span class="count label" style="width: ${width}px;">0/${length}</span></div>
    </div>`);
}

function loaded(num, length, action)
{
    $("#progress").css("width", `${(num + 1) / length * 100}%`);
    $(".count").text(`${action} ${(num + 1)} / ${length}`);
    if(num+1==length)
        endLoader();
}

function endLoader()
{
    if($("#progressbar").length > 0)
        $("#progressbar").remove();
}


/*****FROM HIDE BARBS IN MAP******/

function executeQueue(queue, timeout, {loadText="",callback=()=>null}){
    if(queue.length){
        startLoader(queue.length);
        $.each(queue,(key, func)=>{
            setTimeout(()=>{
                loaded(key, queue.length, loadText);
                if(key==queue.length -1){
                    setTimeout(callback, timeout);
                    endLoader();
                }
                func();
            }, timeout*key);
        });
    }
    else
        setTimeout(callback, timeout);
}

async function getFirstFarmPage(){
    $(`#${scriptTag}_LAlist`).find("tbody > tr").each(function(){$(this).remove();});
    if(fmMapLASettings.ignoreLA){
        makeLATable();
        return;
    }
    loadingLAstuff = true;
    $.get(`/game.php?${sitter?sitter+"&":""}village=${game_data.village.id}&screen=am_farm&Farm_page=0`, async (data)=> {
            const parser = new DOMParser();
            const doc= await parser.parseFromString(data, "text/html");
            let currentCheckBoxValues = Object.assign({},...$("#plunder_list_filters", doc).find("input[type=checkbox]", doc).map((key,obj)=>{return{[obj.id]:obj};}));
            // console.log(currentCheckBoxValues);
            let postGetQueue = [];

            let toggleBox =(key, url, val)=>{
                let data = `extended=1&target_screen=am_farm&${key}=${val}&h=${csrf_token}`;
                console.log(key, url, data);
                TribalWars.post(url,null,{extended:0+true, target_screen:"am_farm", [key]:val});
            };
            let setToggleFunction =(checkboxName, key, url, intendedValue)=>{
                console.log(checkboxName, url, intendedValue);
                if(fmMapLASettings.replaceFilters && currentCheckBoxValues[checkboxName].checked!=intendedValue){
                    postGetQueue.push(()=>toggleBox(key, url, Number(intendedValue)));
                    toToggleBack.push(()=>toggleBox(key, url, Number(!intendedValue)));
                }
            };
            let LAscript = $("#am_widget_Farm", doc).find("script")[0];
            if(!LAscript){
                UI.ErrorMessage("Loot assistant not activated, or some other error, will include all villages");
                makeLATable();
            }

            let urls = $("#am_widget_Farm", doc).find("script")[0].innerHTML.match(/([^']+=toggle_[^']+)/g);
            
            setToggleFunction("all_village_checkbox","all_villages", urls[0], false);
            setToggleFunction("full_losses_checkbox","full_losses", urls[1], true);
            setToggleFunction("partial_losses_checkbox","partial_losses", urls[2], true);
            setToggleFunction("attacked_checkbox","show_attacked", urls[3], true);
            setToggleFunction("full_hauls_checkbox", "only_full_hauls", urls[4], false);

            console.log(postGetQueue);
            executeQueue(postGetQueue, 300, {loadText:"toggling LA options", callback:()=>getBarbsInLA(0)});
        }).fail(()=>{UI.ErrorMessage("Couldn't load first LA page, will include all villages"); makeLATable();});
}

async function getBarbsInLA(page, depth=0, npages=undefined) {
    console.log("getBarbsInLA", page, depth, npages);
    let url = `/game.php?${sitter?sitter+"&":""}village=${game_data.village.id}&screen=am_farm&Farm_page=${page}`;
    $.get(url, async (data)=> {
        console.log("success");
        const parser = new DOMParser();
        const doc= await parser.parseFromString(data, "text/html");
        const pageSelector = $(".paged-nav-item:last", doc); 
        const npagesLA = parseInt(pageSelector.length? pageSelector[0].innerText.match(/\d+/g)[0]:0);
        let rows = $("#plunder_list", doc).find("tr[id^=village_]");
        if(rows.length){
            LA_ids = LA_ids.concat($.map(rows, function(obj){
                return obj.id.match(/\d+/g)[0];
            }));
        }
        if(!npages){
            let pageQueue=[];
            for(var i = 1; i < npagesLA; i++){
                const j =i;
                pageQueue.push(()=>getBarbsInLA(j,0,npagesLA));// jshint ignore:line
            }
            executeQueue(pageQueue, 300, {loadText:"loading LA pages",callback:()=>{
                makeLATable();
                executeQueue(toToggleBack, 300, {loadText:"toggling LA options back", callback: ()=>{toToggleBack = [];loadingLAstuff=false;}});
            }});

        }
    }).fail(()=>{
        if(depth < depthMax){
            UI.ErrorMessage(`Failed getting page ${page} of LA for the ${depth} time, will try again`);
            console.log(`Failed getting page ${page} of LA for the ${depth} time, will try again`);
            getBarbsInLA(page, depth +1, npages);
        }
        else{
            UI.ErrorMessage(`Failed getting page ${page} of LA for the ${depth} time, will not try again, getting next page`);
            console.log(`Failed getting page ${page} of LA for the ${depth} time, will try again`);
            getBarbsInLA(page +1, depth +1, npages);

        }
    });
}


/***********FARM STUFF************/

function farmVillage (xy, type) {
    console.log(xy,type);
    let village = TWMap.villages[xy];
    console.log("Farming Village: ");
    console.log(village);
    let villageid = village.id;
    let s=TWMap.popup._cache[villageid]; 
    if(void 0===s) 
        TWMap.popup.loadVillage(villageid);

    let mpFarm = type=="a"?"mp_farm_a":"mp_farm_b";

    let url = TWMap.urls.ctx[mpFarm].replace(/__village__/, village.id).replace(/__source__/, game_data.village.id);

    setTimeout(function(){TribalWars.get(url);},200);
}

/**************CACHE**************/

function getCache(){
    console.log("getting cache");
    let cachedSettings = window.localStorage.getItem(`${scriptTag}_Settings`);
    fmMapLASettings = cachedSettings ? JSON.parse(cachedSettings) : {ignoreLA:false, replaceFilters:true};
}

function setCache(){
    console.log("setting cache");
    window.localStorage.setItem(`${scriptTag}_Settings`, JSON.stringify(fmMapLASettings));
}

function setHTMLOptions(){
    console.log("setting HTML options");
    $(`#${scriptTag}_ignoreLA`).prop("checked", fmMapLASettings.ignoreLA);
    $(`#${scriptTag}_changeLAFilters`).prop("checked", fmMapLASettings.replaceFilters);
}

function getHTMLOptions(){
    console.log("getting HTML options");
    fmMapLASettings.ignoreLA = $(`#${scriptTag}_ignoreLA`).prop("checked");
    fmMapLASettings.replaceFilters = $(`#${scriptTag}_changeLAFilters`).prop("checked");
    $(`#${scriptTag}_ignoreLA`).each(function(){
        let isChecked = this.checked;
        let display = isChecked?"none":"block";
        $(`#${scriptTag}_changeLAFilters_p`).css("display", display);
    });
}


/************RUN MAIN*************/

main();
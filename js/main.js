// js/main.js

// Does not work in browser
// import { SPCard } from './SPCard.js';
// import { GameStatus, DEFAULT } from './GameStatus.js';

const MAX_SP_HAND = 16;
const SPWindow = document.getElementById("SP_Window");
const SPText = document.getElementById("spText");
const labelSPBtn = document.getElementsByClassName("label_SP_btn")[0];
const divMyCard = document.querySelector(".MY_Cards");
const divEnCard = document.querySelector(".EN_Cards");
const spanMySum = document.querySelector(".myHandSum");
const spanEnSum = document.querySelector(".enHandSum");
const spanGoal = document.querySelectorAll("span.goal");

const gameStatus = new GameStatus("id");

gameStatus.init().then((gs) => {

    spanGoal.forEach((e) => { e.textContent = gs.goal });

    const spanHandSum = gs.myHandSum;
    spanMySum.textContent = spanHandSum;
    if (gs.goal == spanHandSum) {
        spanMySum.className = "myHandSum just";
    } else if (gs.goal < spanHandSum) {
        spanMySum.className = "myHandSum burst";
    } else {
        spanMySum.className = "myHandSum";
    }

    while (divMyCard.lastChild) {
        divMyCard.removeChild(divMyCard.lastChild);
    }
    gs.myHand.forEach((e, i) => {
        const div = document.createElement('div');
        if (i == 0) {
            div.className = "numCard back";
            const innerDiv = document.createElement('div');
            innerDiv.textContent = e;
            div.appendChild(innerDiv);
        } else {
            div.className = "numCard";
            div.textContent = e;
        }
        divMyCard.appendChild(div);
    });

    const enHandSum = gs.enHandSum - gs.enHand[0];
    spanEnSum.textContent = `${enHandSum}+?`;
    // switch (true) {
    //     case gs.goal == enHandSum:
    //         spanEnSum.className = "enHandSum just";
    //         break;
    //     case gs.goal < enHandSum:
    //         spanEnSum.className = "enHandSum burst";
    //         break;
    //     default:
    //         spanEnSum.className = "enHandSum";
    //         break;
    // }

    while (divEnCard.lastChild) {
        divEnCard.removeChild(divEnCard.lastChild);
    }
    gs.enHand.forEach((e, i) => {
        const div = document.createElement('div');
        if (i == 0) {
            div.className = "numCard back";
        } else {
            div.className = "numCard";
            div.textContent = e;
        }
        divEnCard.appendChild(div);
    });

    // SPカードのデータを読み込む
    fetch("json/sp_card.json")
        .then((res) => {
            return res.json();
        })
        .then((json) => {

            const my_hand_sp = gs.myHandSP; //: Array       #自分のSPカード
            const spData = json.sp_card;    //: JSON Object #SPカードの詳細

            // SPカードの所持数をSPボタンのラベルに表示する
            labelSPBtn.textContent = `SP[${my_hand_sp.length}]`;
            /**
             *! ここに上記のコードを挿入すると
             *! なぜかSPカード枚数がうまく反映される
             */

            // SPウィンドウにSPカードと説明文を追加する
            let prev_cls = null;
            for (let i = 0; i < MAX_SP_HAND; i++) {
                const divSPCard = document.createElement("div");
                if (i < my_hand_sp.length) {

                    const spID = my_hand_sp[i];

                    // SPカードを追加: <div><input ...></div>
                    divSPCard.id = `sp${i}`;
                    divSPCard.className = `spPrev spID${spID}`;
                    const input = document.createElement("input");
                    input.type = 'button';
                    input.name = "useSP";
                    input.value = spID;
                    divSPCard.appendChild(input);

                    // 各SPカードの説明文を追加
                    if (spID != prev_cls) {
                        // 
                        // 既に同じ説明文が追加されていれば無視する
                        // 
                        const divSPText = document.createElement('div');
                        const pSPname = document.createElement('p');
                        const pSPtext = document.createElement('p');
                        divSPText.className = `spID${spID}txt`;
                        pSPname.className = "SPname";
                        pSPtext.className = "SPtext";
                        pSPname.textContent = spData[spID].name;
                        pSPtext.textContent = spData[spID].description;
                        divSPText.appendChild(pSPname);
                        divSPText.appendChild(pSPtext);
                        SPText.appendChild(divSPText);
                    }
                    prev_cls = spID;    // 今回のspIDを記録
                } else {
                    divSPCard.className = `spPrev sp${i}`;
                }

                // SPWindow.appendChild(div);
                SPText.before(divSPCard)
            }
        });
});

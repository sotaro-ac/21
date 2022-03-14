// js/main.js

// Does not work in browser
// import { SPCard } from './SPCard.js';
// import { GameStatus, DEFAULT } from './GameStatus.js';

const MAX_SP_HAND = 16;
const SPWindow = document.getElementById("SP_Window");
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
        } else {
            div.className = "numCard";
        }
        div.textContent = e;
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

            const my_hand_sp = gs.myHandSP; //: Array   #自分のSPカード

            // SPカードの所持数をSPボタンのラベルに表示する
            labelSPBtn.textContent = `SP[${my_hand_sp.length}]`;
            /**
             *! ここに上記のコードを挿入すると
             *! なぜかSPカード枚数がうまく反映される
             */

            // SPウィンドウにSPカードを追加する
            for (let i = 0; i < MAX_SP_HAND; i++) {
                const div = document.createElement("div");
                if (i < my_hand_sp.length) {
                    div.id = `sp${i}`;
                    div.className = `spPrev spID${my_hand_sp[i]}`;
                } else {
                    div.className = `spPrev sp${i}`;
                }
                SPWindow.appendChild(div);
            }
        });
});

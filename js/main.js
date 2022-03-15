// js/main.js

// Does not work in browser
// import { SPCard } from './SPCard.js';
// import { GameStatus, DEFAULT } from './GameStatus.js';

// const SPWindow = document.getElementById("SP_Window");
// const SPText = document.getElementById("spText");
// const labelSPBtn = document.getElementsByClassName("label_SP_btn")[0];
// const divMyCard = document.querySelector(".MY_Cards");
// const divEnCard = document.querySelector(".EN_Cards");
// const spanMySum = document.querySelector(".myHandSum");
// const spanEnSum = document.querySelector(".enHandSum");
// const spanGoal = document.querySelectorAll("span.goal");
// const divMyPassSP = document.querySelector("#MY_PassiveSP");
// const divEnPassSP = document.querySelector("#EN_PassiveSP");

// const MAX_SP_HAND = 16;

class GameController {
    // 
    // STATIC
    // 
    static #gameStatus = new GameStatus();

    // 
    // CONSTRUCTOR
    // 
    constructor() {

        // 
        // SPウィンドウをゲーム開始可能な状態にする
        // 
        if (!SPWindow.classList.contains("fullfilled")) {
            const SP_CARD = new SPCard();

            // SPカードスロットの作成
            for (let i = 0; i < MAX_SP_HAND; i++) {
                const divSPCard = document.createElement('div');
                divSPCard.id = `sp${i}`;
                divSPCard.className = "spSlot";
                // SPWindow.appendChild(div);   # 要素の位置依存なCSSの影響で不可
                SPText.before(divSPCard);
            }

            // すべてのSPカードの説明文を事前に用意する
            SP_CARD.initPromise.then(() => {
                const spData = SP_CARD.list;    //: JSON Object #SPカードの詳細

                for (let i = 0; i < spData.length; i++) {
                    const divSPText = document.createElement('div');
                    const pSPname = document.createElement('p');
                    const pSPtext = document.createElement('p');
                    divSPText.className = `spID${spData[i].id}txt`;
                    pSPname.className = "SPname";
                    pSPtext.className = "SPtext";
                    pSPname.textContent = spData[i].name;
                    pSPtext.textContent = spData[i].description;
                    divSPText.appendChild(pSPname);
                    divSPText.appendChild(pSPtext);
                    SPText.appendChild(divSPText);  // import SPText
                }
            });
            SPWindow.classList.add("fullfilled");   // 開始可能
        }
    }

    // 
    // METHOD
    // 

    get gameStatus() {
        return GameController.#gameStatus;
    }

    set user({ userId, userName }) {
        this.gameStatus.userId = userId;
        this.gameStatus.userName = userName;
    }

    newGame = () => {
        this.gameStatus.init().then((gs) => {
            this.reflesh();
        });
    }

    newRound = (isMmyTurnFirst = false) => {
        this.gameStatus.newRound(isMmyTurnFirst).then((gs) => {
            this.reflesh();
        });
    }

    reflesh = () => {
        const gs = this.gameStatus;

        // 手札合計値の目標値を設定
        spanGoal.forEach((e) => { e.textContent = gs.goal });

        // プレイヤーの手札合計値
        const spanHandSum = gs.myHandSum;
        spanMySum.textContent = spanHandSum;
        if (gs.goal == spanHandSum) {
            spanMySum.className = "myHandSum just";
        } else if (gs.goal < spanHandSum) {
            spanMySum.className = "myHandSum burst";
        } else {
            spanMySum.className = "myHandSum";
        }

        // プレイヤーの手札の表示
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

        // プレイヤーの Passive SPカードの表示
        while (divMyPassSP.lastChild) {
            divMyPassSP.removeChild(divMyPassSP.lastChild);
        }
        gs.myPassiveSP.forEach((e, i) => {
            const div = document.createElement('div');
            div.className = `spCard spID${e}`;
            divMyPassSP.appendChild(div);
        });

        // 相手の手札合計値(オープン前)
        const enHandSum = gs.enHandSum - gs.enHand[0];
        spanEnSum.textContent = `${enHandSum}+?`;

        // 相手の手札の表示(オープン前)
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

        // 相手の Passive SPカードの表示
        while (divEnPassSP.lastChild) {
            divEnPassSP.removeChild(divEnPassSP.lastChild);
        }
        gs.enPassiveSP.forEach((e, i) => {
            const div = document.createElement('div');
            div.className = `spCard spID${e}`;
            divEnPassSP.appendChild(div);
        });

        const my_hand_sp = gs.myHandSP; //: Array       #自分のSPカード

        // SPカードの所持数をSPボタンのラベルに表示する
        labelSPBtn.textContent = `SP[${my_hand_sp.length}]`;

        // SPウィンドウのSPカードを更新する
        for (let i = 0; i < MAX_SP_HAND; i++) {
            // const divSPCard = document.createElement('div');
            // divSPCard.id = `sp${i}`;
            const divSPCard = document.getElementById(`sp${i}`);
            divSPCard.innerHTML = "";
            if (i < my_hand_sp.length) {
                const spID = my_hand_sp[i];
                // SPカードを追加: <div><input ...></div>
                divSPCard.className = `spSlot spID${spID}`;
                const input = document.createElement("input");
                input.type = 'button';
                input.name = "useSP";
                input.value = spID;
                divSPCard.appendChild(input);
            } else {
                divSPCard.className = "spSlot";
            }
            SPText.before(divSPCard);
        }
    }
}

const gc = new GameController("id");

//
// ONLOAD
//
document.body.onload = () => {
    gc.newGame();
};

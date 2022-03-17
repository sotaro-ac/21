// js/main.js
"use strict";

//   // infoBoard
//   const pHeader = document.querySelector("#header");
//   const pNotice = document.querySelector("#notice");

//   // gameBoard
//   const labelSPBtn = document.querySelector("#label_SP_btn");
//   const divMyCard = document.querySelector("#MY_Cards");
//   const divEnCard = document.querySelector("#EN_Cards");
//   const spanMySum = document.querySelector("#myHandSum");
//   const spanEnSum = document.querySelector("#enHandSum");
//   const spanGoal = document.querySelectorAll("span.goal");
//   const divMyPassSP = document.querySelector("#MY_PassiveSP");
//   const divEnPassSP = document.querySelector("#EN_PassiveSP");
//   const divMyHand = document.querySelector("#MY_Hand");
//   const divEnHand = document.querySelector("#EN_Hand");

//   // MY_Commands
//   const divMyCmd = document.querySelector("#MY_Commands");
//   const btnStay = document.querySelector("#btnStay");
//   const btnDraw = document.querySelector("#btnDraw");

//   // SP_Window
//   const SPWindow = document.querySelector("#SP_Window");
//   const SPText = document.querySelector("#spText");

//   const MAX_SP_HAND = 16;

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

const MSG = {
    MY: {},
    EN: {
        get STAY() { return "相手は「STAY」を選択した。"; },
        get DRAW() { return "相手は「DRAW」を選択した。"; },
        get SP() { return "相手は「SPカード」を使用した"; },
    }
};

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
        // コマンドリストをゲーム開始可能な状態にする
        // 
        if (!divMyCmd.classList.contains("fullfilled")) {
            const gs = this.gameStatus;

            // Draw
            btnDraw.addEventListener('click', () => {
                // 手札合計値がバースト or 手札が上限の６枚ある場合は無効
                if (gs.goal < gs.myHandSum || 6 <= gs.myHand.length) return;

                // 山札から手札にカードを１枚移動(ドロー)する
                gs.myHand.push(gs.deck.pop());  // draw from deck
                gs.stay = false;    // STAYフラグを折る
                this.reflesh();     // アロー関数内：このthisはGCのインスタンス 
                divMyCard.lastChild.classList.add("draw");
                spanMySum.classList.add("show");
                this.passTurn();
            });

            // Stay
            btnStay.addEventListener('click', () => {
                this.reflesh();     // アロー関数内：このthisはGCのインスタンス 
                if (gs.stay) {
                    this.resultRound();
                } else {
                    gs.stay = true; // STAYフラグを立てる
                    this.passTurn();
                }
            });

            // SP Slots


            divMyCmd.classList.add("fullfilled");   // 開始可能
        }

        // 
        // SPウィンドウをゲーム開始可能な状態にする
        // 
        if (!SPWindow.classList.contains("fullfilled")) {
            const SP_CARD = new SPCard();

            // 不要な要素があれば削除
            while (SPWindow.firstChild.id != "spText") SPWindow.firstChild.remove();
            while (SPText.firstChild) SPText.firstChild.remove();

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

    /**
     * メッセージヘッダー/通知を設定する
     * @param {String} textHTML 
     */
    set setMsgHeader(textHTML) { pHeader.innerHTML = textHTML; }

    set setMsgNotice(textHTML) { pNotice.innerHTML = textHTML; }

    /**
     * ポップアップメッセージを表示する（[OK]ボタンを押すまで待機する）
     * 主に STAY / DRAW / SPカード使用 についての確認用
     * @param {String} textMsg # ポップアップに表示するメッセージ
     * @param {Object} SPCard  # 任意のSPカードについてのJSONオブジェクト
     * @returns {Promise}
     */
    showPopUp(textMsg, { id, name, type, description } = {}) {
        return new Promise((resolve, reject) => {
            // ポップアップとメッセージを表示
            divInfoPU.hidden = false;
            divInfoSP.hidden = true;
            divInfoMsg.textContent = textMsg;

            // SPカードの使用
            if (id) {
                divInfoSP.hidden = false;
                divSPimg.className = `spID${id}`;
                pSPname.textContent = name;
                pSPtext.textContent = description;
            }

            // ポップアップの[OK]ボタンを押すまで待機
            btnPop.addEventListener('click', () => {
                divInfoPU.hidden = true;
                divInfoSP.hidden = true;
                // console.log("clicked!");
                resolve();  // 待機状態からの解放
            });
        });
    }

    /**
     * 画面中央にメッセージを表示する（ボタンを押すまで待機する）
     * 
     * @param {String} textMsg # 画面中央に表示するメッセージ
     * @param {String} action  # "" / "GS" ? 
     * @returns {Promise}
     */
    showBdrMsg(textMsg, action = "") {
        return new Promise((resolve, reject) => {

            // ポップアップの[OK]ボタンを押すまで待機
            btnPop.addEventListener('click', () => {

                resolve();  // 待機状態からの解放
            });
        });
    }

    /**
     * ゲームを開始する
     */
    run() {
        this.newGame();
    }

    passTurn = async () => {
        const gs = this.gameStatus;
        const sp = gs.enSPDeck;
        const decision = gs.enemyDecision();

        // SPカードの使用
        if (decision.cmd == CMD.SP) {
            const spID = decision.value;
            gs.stay = false;  // STAYフラグを折る

            // Passive SPカードを使用した場合はボードに置く
            const spPsv = sp.getIdList({ type: "passive" });
            if (spPsv.some(id => id == spID)) {
                gs.enPassiveSP.push(spID);
            }
            this.reflesh();

            // SPカード使用のポップアップメッセージを表示
            await this.showPopUp(MSG.EN.SP, sp.list.find(card => card.id == spID));
        }
        // Draw
        else if (decision.cmd == CMD.DRAW) {
            gs.stay = false;  // STAYフラグを折る
            this.reflesh();
            divEnCard.lastChild.classList.add("draw");
            spanEnSum.classList.add("show");

            // SPカード使用のポップアップメッセージを表示
            await this.showPopUp(MSG.EN.DRAW);
        }
        // Stay
        else if (decision.cmd == CMD.STAY) {
            this.reflesh();

            // SPカード使用のポップアップメッセージを表示
            await this.showPopUp(MSG.EN.STAY);

            if (gs.stay) {
                this.resultRound();
            } else {
                gs.stay = true; // STAYフラグを立てる
            }
        }

        // 再帰関数でループ
        if (decision.cmd == CMD.SP) {
            // 少しだけ待たせる（考えている真似）
            await sleep(Math.random() * (1000 - 250) + 250);
            this.passTurn();
        }
    }

    newGame() {
        this.gameStatus.init().then((gs) => {
            this.reflesh();
            for (const e of divMyCard.children) { e.classList.add("draw"); };
            for (const e of divEnCard.children) { e.classList.add("draw"); };
            spanMySum.classList.add("show");
        });
    }

    newRound(isMmyTurnFirst) {
        this.gameStatus.newRound(isMmyTurnFirst).then((gs) => {
            this.reflesh();
        });
    }

    resultRound() {
        const gs = this.gameStatus;

        // ラウンド勝者を判定 + ダメージの計算
        const result = gs.judge();
        if (result == "WIN") {
            gs.enFingers = Math.max(gs.enFingers - gs.enBet, 0);
            gs.roundFirst = PLAYER.EN;
        } else if (result == "LOSE") {
            gs.myFingers = Math.max(gs.myFingers - gs.myBet, 0);
            gs.roundFirst = PLAYER.ME;
        } else if (result == "EVEN") {
            // Do something...
            // gs.roundFirst = gs.roundFirst;
        }

        // openCards()より前 && judge()より後に実行
        this.reflesh();

        // 両者のカードをオープン
        this.openCards();

        // プレイヤー/相手の指(HP)の表示をリセット
        while (divMyHand.children.length > 1) { divMyHand.lastChild.remove(); }
        while (divEnHand.children.length > 1) { divEnHand.lastChild.remove(); }

        // プレイヤーの指(HP)を表示
        const my_lost = DEFAULT_PARAMS.FINGERS - gs.myFingers;
        if (my_lost > 0) {
            divMyHand.insertAdjacentHTML(
                'beforeend',
                `<img class="Hand lost" src="img/my/lost/0${my_lost}.png"/>`
            );
        }

        // 相手の(HP)を表示
        const en_lost = DEFAULT_PARAMS.FINGERS - gs.enFingers;
        if (en_lost > 0) {
            divEnHand.insertAdjacentHTML(
                'beforeend',
                `<img class="Hand lost" src="img/en/lost/0${en_lost}.png"/>`
            );
        }
    }

    openCards() {
        const gs = this.gameStatus;

        // プレイヤーの手札をオープン
        const myFirstCard = divMyCard.firstChild;
        myFirstCard.innerHTML = gs.myHand[0];
        myFirstCard.className = "numCard";

        // 相手の手札をオープン
        const enFirstCard = divEnCard.firstChild;
        enFirstCard.innerHTML = gs.enHand[0];
        enFirstCard.className = "numCard";

        // 相手の手札合計値をオープン
        const enHandSum = gs.enHandSum;
        spanEnSum.textContent = enHandSum;
        if (gs.goal == enHandSum) {
            spanEnSum.className = "just";
        } else if (gs.goal < enHandSum) {
            spanEnSum.className = "burst";
        } else {
            spanEnSum.className = "";
        }
    }

    reflesh() {
        const gs = this.gameStatus;

        // 
        // プレイヤーの処理
        // 

        // プレイヤーの手札合計値
        const myHandSum = gs.myHandSum;
        spanMySum.textContent = myHandSum;
        spanMySum.className = "";
        if (gs.goal == myHandSum) {
            spanMySum.className = "just";
        } else if (gs.goal < myHandSum) {
            spanMySum.className = "burst";
        } else {
            spanMySum.className = "";
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

        // 
        // 相手の処理
        // 

        // 相手の手札合計値(オープン前)
        const enHandSum = gs.enHandSum - gs.enHand[0];
        spanEnSum.textContent = `?+${enHandSum}`;
        spanEnSum.className = "";

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

        // 
        // Passive SPカード効果の処理
        // 

        // 手札合計値の目標値を設定
        spanGoal.forEach((e) => { e.textContent = gs.goal });

        // プレイヤーの指(HP)の表示
        const my_lost = DEFAULT_PARAMS.FINGERS - gs.myFingers;
        const my_bet = gs.myBet;
        // while (divMyHand.lastChild.className != "Hand") {
        while (divMyHand.children.length > 1) { divMyHand.lastChild.remove(); }
        if (my_lost > 0) {
            divMyHand.insertAdjacentHTML(
                'beforeend',
                `<img class="Hand lost" src="img/my/lost/0${my_lost}.png"/>`
            );
        }
        if (my_bet > 0) {
            const SELECT = Math.min(my_lost + my_bet, DEFAULT_PARAMS.FINGERS);
            for (let i = my_lost + 1; i <= SELECT; i++) {
                divMyHand.insertAdjacentHTML(
                    'beforeend',
                    `<img class="Hand select" src="img/my/select/0${i}.png"/>`
                );
            }
        }

        // 相手の指(HP)の表示
        const en_lost = DEFAULT_PARAMS.FINGERS - gs.enFingers;
        const en_bet = gs.enBet;
        // while (divEnHand.lastChild.className != "Hand") {
        while (divEnHand.children.length > 1) { divEnHand.lastChild.remove(); }
        if (en_lost > 0) {
            divEnHand.insertAdjacentHTML(
                'beforeend',
                `<img class="Hand lost" src="img/en/lost/0${en_lost}.png"/>`
            );
        }
        if (en_bet > 0) {
            const SELECT = Math.min(en_lost + en_bet, DEFAULT_PARAMS.FINGERS);
            for (let i = en_lost + 1; i <= SELECT; i++) {
                divEnHand.insertAdjacentHTML(
                    'beforeend',
                    `<img class="Hand select" src="img/en/select/0${i}.png"/>`
                );
            }
        }

        // 
        // SPカードスロットの表示
        // 

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

        // 
        // コマンドリストの表示 (下位のコードほど優先条件)
        // 

        //* 手札合計値がバースト or 手札が上限の６枚ある場合はドロー不可能
        if (gs.goal < gs.myHandSum || 6 <= gs.myHand.length) {
            btnDraw.disabled = true;
        } else {
            btnDraw.disabled = false;
        }

        //* 勝敗判定後は新しいラウンド/ゲームを開始するまでSTAY+DRAW不可能
        if (gs.isJudged) {
            btnStay.disabled = true;
            btnDraw.disabled = true;
        } else {
            btnStay.disabled = false;
            btnDraw.disabled = false;
        }

    }

}

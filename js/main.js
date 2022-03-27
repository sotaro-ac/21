// js/main.js
"use strict";

// FUNCTION
const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

const ACT = {
    get GS() { return "GAME_START"; },
    get GC() { return "GAME_CLEAR"; },
    get GO() { return "GAME_OVER"; },
    get YR() { return "YOUR_ROUND"; },
    get ER() { return "ENEMY_ROUND"; },
    get NT() { return "NOTICE_TIMEOUT"; },
    get DE() { return "DEFAULT"; },
};

const MSG = {
    BDR: {
        get GAME_START() { return "デスゲームに勝ち残り<br>賞金を手に入れろ！"; },
        get GAME_CLEAR() { return "あなたはゲームに勝利して<br>賞金を手に入れた！"; },
        get GAME_OVER() { return "あなたはゲームに敗北して<br>死んでしまった..."; },
        get YOUR_ROUND() { return "次のラウンドはあなたが先攻です。" },
        get ENEMY_ROUND() { return "次のラウンドは相手が先攻です。" },
    },
    POP: {
        get STAY() { return "相手は「STAY」を選択した。"; },
        get DRAW() { return "相手は「DRAW」を選択した。"; },
        get SP() { return "相手は「SPカード」を使用した。"; }
    },
    BUTTON: {
        get GAME_START() { return ["GAME START", ""]; },
        get GAME_CLEAR() { return ["NEW GAME", "END GAME"]; },
        get GAME_OVER() { return ["NEW GAME", "END GAME"]; },
        get DEFAULT() { return ["OK", ""]; }
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
            }, { once: true });
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
            switch (action) {
                case ACT.GC:
                    infoBdrImg.hidden = false;
                case ACT.GO:
                case ACT.GS:
                    infoBdrMsg.innerHTML = MSG.BDR[action];
                    infoBtnContainer.hidden = false;
                    infoBorder.hidden = false;
                    // Button 1st
                    if (!MSG.BUTTON[action][0]) btn1st.hidden = true;
                    else btn1st.hidden = false;
                    btn1st.textContent = MSG.BUTTON[action][0];
                    // Button 2nd
                    if (!MSG.BUTTON[action][1]) btn2nd.hidden = true;
                    else btn2nd.hidden = false;
                    btn2nd.textContent = MSG.BUTTON[action][1];
                    break;

                case ACT.YR:
                case ACT.ER:
                    infoBdrMsg.innerHTML = MSG.BDR[action];
                    infoBtnContainer.hidden = false;
                    infoBorder.hidden = false;
                    // Button 1st
                    if (!MSG.BUTTON[ACT.DE][0]) btn1st.hidden = true;
                    else btn1st.hidden = false;
                    btn1st.textContent = MSG.BUTTON[ACT.DE][0];
                    // Button 2nd
                    if (!MSG.BUTTON[ACT.DE][1]) btn2nd.hidden = true;
                    else btn2nd.hidden = false;
                    btn2nd.textContent = MSG.BUTTON[ACT.DE][1];
                    break;

                default:
                    // Button 1st
                    if (!MSG.BUTTON[ACT.DE][0]) btn1st.hidden = true;
                    else btn1st.hidden = false;
                    btn1st.textContent = MSG.BUTTON[ACT.DE][0];
                    // Button 2nd
                    if (!MSG.BUTTON[ACT.DE][1]) btn2nd.hidden = true;
                    else btn2nd.hidden = false;
                    btn2nd.textContent = MSG.BUTTON[ACT.DE][1];
                case ACT.NT:
                    infoBtnContainer.hidden = true;
                    infoBdrMsg.innerHTML = textMsg;
                    infoBorder.hidden = false;
                    break;
            }

            if (action == ACT.NT) {
                const showTime = 3000;
                setTimeout(() => {
                    infoBorder.hidden = true;
                    infoBdrImg.hidden = true;
                    infoBtnContainer.hidden = true;
                    btn1st.hidden = true;
                    btn2nd.hidden = true;
                    resolve();
                }, showTime);
            } else {

                // ボーダーウィンドウのボタンを押すまで待機
                [btn1st, btn2nd].forEach((btn, i) => {
                    btn.addEventListener('click', () => {
                        infoBorder.hidden = true;
                        infoBdrImg.hidden = true;
                        infoBtnContainer.hidden = true;
                        btn1st.hidden = true;
                        btn2nd.hidden = true;

                        switch (action) {
                            case ACT.GO:
                                if (btn == btn1st) resolve(btn1st); // this.newGame()
                                if (btn == btn2nd) resolve(btn2nd); // location.replace("index.html");
                                break;
                            case ACT.YR:
                            case ACT.ER:
                                // this.newRound();
                                break;
                            default:
                                break;
                        }

                        resolve();  // 待機状態からの解放
                    }, { once: true });
                });
            }
        });

    }

    /**
     * ゲームを開始する
     */
    run = async () => {
        const gs = this.gameStatus;
        const slideTime = 1000;
        const timeOutNotice = 2000;
        let timerIdNotice = null;
        let prevTurn;

        while (true) {

            // ゲームの開始状態
            await this.newGame();
            prevTurn = gs.whoseTurn;

            while (true) {  // !gs.isGameEnd
                btnStay.disabled = true;
                btnDraw.disabled = true;

                // 相手のターン処理
                if (gs.whoseTurn != PLAYER.ME) {
                    this.setMsgHeader = `<span class="red">ENEMY</span> TURN`;
                    btnStay.disabled = true;
                    btnDraw.disabled = true;
                    btnSP.checked = false;
                    gs.enStay = false;  // STAYフラグを折る
                    await this.passTurn();
                }
                // 自分のターン処理
                else {
                    this.setMsgHeader = `<span class="green">YOUR</span> TURN`;
                    btnStay.disabled = false;
                    btnDraw.disabled = false;
                    gs.myStay = false;  // STAYフラグを折る

                    //* 手札合計値がバースト or 手札が上限の６枚ある場合はドロー不可能
                    if (gs.goal < gs.myHandSum || 6 <= gs.myHand.length) {
                        btnDraw.disabled = true;
                    } else {
                        btnDraw.disabled = false;
                    }

                    // どれか１つのボタン押下まで待つ
                    await new Promise((resolve, reject) => {

                        const ac = new AbortController();
                        const spBtns = document.querySelectorAll(".spSlot > input");

                        // Draw
                        btnDraw.addEventListener('click', async () => {
                            ac.abort();
                            // 手札合計値がバースト or 手札が上限の６枚ある場合は無効
                            if (gs.goal < gs.myHandSum || 6 <= gs.myHand.length) return;

                            // 山札から手札にカードを１枚移動(ドロー)する
                            gs.myHand.push(gs.deck.pop());  // draw from deck
                            // gs.myStay = false;  // STAYフラグを折る
                            await this.reflesh();
                            divMyCard.lastChild.classList.add("draw");
                            spanMySum.classList.add("show");
                            await sleep(slideTime);
                            // 相手のターンに設定
                            gs.whoseTurn = PLAYER.EN;
                            resolve();
                        }, { signal: ac.signal, once: true });

                        // Stay
                        btnStay.addEventListener('click', () => {
                            ac.abort();
                            gs.myStay = true; // STAYフラグを立てる
                            // 相手のターンに設定
                            gs.whoseTurn = PLAYER.EN;
                            resolve();
                        }, { signal: ac.signal, once: true });

                        // SP Slots
                        spBtns.forEach((e, i) => {
                            e.addEventListener('click', (ev) => {
                                const idx = Number(ev.target.parentElement.id.slice(2));
                                const spID = Number(ev.target.value);
                                const sp = gs.mySPDeck;
                                ac.abort();

                                gs.myHandSP.splice(idx, 1);
                                console.log("called from ", ev.target); // SP効果発動！
                                // Passive SPカードを使用した場合はボードに置く
                                const spPsv = sp.getIdList({ type: "passive" });
                                const spName = sp.list.find(c => c.id == spID).name;
                                if (spPsv.some(id => id == spID)) {
                                    gs.myPassiveSP.push(spID);
                                } else {
                                    this.setMsgNotice = `SPカード「${spName}」は<br>現在実装中です by 開発者`;
                                    // 一定時間後にNoticeを非表示
                                    if (timerIdNotice) clearTimeout(timerIdNotice);
                                    timerIdNotice = setTimeout(() => {
                                        this.setMsgNotice = "";
                                    }, timeOutNotice);
                                }
                                // gs.myStay = false;  // STAYフラグを折る
                                gs.useSP = true;
                                this.reflesh();
                                resolve();
                            }, { signal: ac.signal, once: true });
                        });
                    });
                }

                // 両者が「STAY」ならラウンドの勝敗を決定する
                // （ただし，SPカードを使用してSTAYした場合は無視）
                if (gs.bothStay && !gs.useSP) {
                    await this.resultRound();
                    // ゲームの勝敗が付いている時
                    if (gs.isGameEnd) {
                        if (gs.isGameEnd == PLAYER.ME) {
                            this.setMsgHeader = `YOU ARE THE <span class="green">SURVIVOR</span> !!`;
                            let btn = await this.showBdrMsg(MSG.BDR.GAME_CLEAR, ACT.GC);
                            if (btn == btn2nd) location.replace("index.html");
                            console.log(btn);
                        } else if (gs.isGameEnd == PLAYER.EN) {
                            this.setMsgHeader = `YOU ARE <span class="red">DEAD</span> ...`;
                            let btn = await this.showBdrMsg(MSG.BDR.GAME_OVER, ACT.GO);
                            if (btn == btn2nd) location.replace("index.html");
                            console.log(btn);
                        } else {
                            /* 勝負が付かなかった（現状はエラー） */
                        }
                        break;
                    }
                    // ゲームの勝敗が付いていない時
                    await this.newRound();
                }

                // ターン進行処理
                if (prevTurn != gs.whoseTurn) {
                    prevTurn = gs.whoseTurn;
                    gs.useSP = false;
                    gs.turn++;
                    console.log("ROUND " + gs.round + " : TURN " + gs.turn);
                }
            }

        }
    }

    passTurn = async () => {
        const gs = this.gameStatus;
        const sp = gs.enSPDeck;
        const decision = gs.enemyDecision();

        // 少しだけ待たせる（疑似的な思考時間）
        await sleep(Math.random() * 1000 + 500);

        // SPカードの使用
        if (decision.cmd == CMD.SP) {
            const spID = decision.value;
            gs.enStay = false;  // STAYフラグを折る
            gs.useSP = true;

            // Passive SPカードを使用した場合はボードに置く
            const spPsv = sp.getIdList({ type: "passive" });
            if (spPsv.some(id => id == spID)) {
                gs.enPassiveSP.push(spID);
            }
            this.reflesh();

            // SPカード使用のポップアップメッセージを表示
            await this.showPopUp(MSG.POP.SP, sp.list.find(card => card.id == spID));
        }
        // Draw
        else if (decision.cmd == CMD.DRAW) {
            gs.enStay = false;  // STAYフラグを折る
            this.reflesh();
            divEnCard.lastChild.classList.add("draw");
            spanEnSum.classList.add("show");

            // SPカード使用のポップアップメッセージを表示
            await this.showPopUp(MSG.POP.DRAW);
            gs.whoseTurn = PLAYER.ME;
        }
        // Stay
        else if (decision.cmd == CMD.STAY) {
            // SPカード使用のポップアップメッセージを表示
            await this.showPopUp(MSG.POP.STAY);
            gs.enStay = true; // STAYフラグを立てる
            // this.reflesh();
            gs.whoseTurn = PLAYER.ME;
        }
    }

    /**
     * 新しいゲームを開始する
     * @returns {Promise}
     */
    newGame = () => new Promise((resolve, reject) => {
        this.gameStatus.init().then(async (gs) => {

            await this.reflesh();
            this.setMsgHeader = `<span class="green">WELCOME</span> CHALLENGER!`;

            const msec = 500;
            const slideTime = 1000;
            const showCount = 1000;

            spanMySum.style.visibility = 'hidden';
            spanEnSum.style.visibility = 'hidden';

            const mcards = divMyCard.children;
            for (let i = 0; i < mcards.length; i++) {
                mcards[i].classList.add("draw");
                mcards[i].hidden = true;
                setTimeout(async () => {
                    mcards[i].hidden = false;
                    await sleep(slideTime);
                    // mcards[i].classList.remove("draw");
                    if (i == mcards.length - 1) {
                        spanMySum.classList.add("show");
                        spanMySum.style.visibility = 'visible';
                        await sleep(showCount);
                        // spanMySum.classList.remove("show");
                    }
                }, slideTime * i);          // タイミングをずらす
            }

            const ecards = divEnCard.children;
            for (let i = 0; i < ecards.length; i++) {
                ecards[i].classList.add("draw");
                ecards[i].hidden = true;
                setTimeout(async () => {
                    ecards[i].hidden = false;
                    await sleep(slideTime);
                    // ecards[i].classList.remove("draw");
                    if (i == mcards.length - 1) {
                        spanEnSum.classList.add("show");
                        spanEnSum.style.visibility = 'visible';
                        await sleep(showCount);
                        // spanEnSum.classList.remove("show");
                    }
                }, msec + slideTime * i);   // タイミングをずらす
            }

            // メッセージ確認と時間経過の両方が完了すると then() 内部が実行される
            await Promise.all([
                this.showBdrMsg(MSG.BDR.GAME_START, ACT.GS),
                sleep(slideTime * mcards.length + msec)
            ]).then(async (res) => {
                gs.playFirst = PLAYER.RANDOM;
                await this.showBdrMsg(
                    `最初は「${gs.roundFirst == PLAYER.ME
                        ? `<span class="green">あなた</span>`
                        : `<span class="red">相手</span>`}」のターンです。`
                    , ACT.DE);
            });
            resolve();
        });
    });

    /**
     * 新しいラウンドを始める
     * @param {Boolean} roundFirst # 指定したプレイヤーから始める(DEBUG用)
     */
    newRound(roundFirst) {
        return this.gameStatus.newRound(roundFirst).then(async (gs) => {
            await this.reflesh();

            const msec = 500;
            const slideTime = 1000;
            const showCount = 1000;

            spanMySum.style.visibility = 'hidden';
            spanEnSum.style.visibility = 'hidden';

            const mcards = divMyCard.children;
            for (let i = 0; i < mcards.length; i++) {
                mcards[i].classList.add("draw");
                mcards[i].hidden = true;
                setTimeout(async () => {
                    mcards[i].hidden = false;
                    await sleep(slideTime);
                    // mcards[i].classList.remove("draw");
                    if (i == mcards.length - 1) {
                        spanMySum.classList.add("show");
                        spanMySum.style.visibility = 'visible';
                        await sleep(showCount);
                        // spanMySum.classList.remove("show");
                    }
                }, slideTime * i);          // タイミングをずらす
            }

            const ecards = divEnCard.children;
            for (let i = 0; i < ecards.length; i++) {
                ecards[i].classList.add("draw");
                ecards[i].hidden = true;
                setTimeout(async () => {
                    ecards[i].hidden = false;
                    await sleep(slideTime);
                    // ecards[i].classList.remove("draw");
                    if (i == mcards.length - 1) {
                        spanEnSum.classList.add("show");
                        spanEnSum.style.visibility = 'visible';
                        await sleep(showCount);
                        // spanEnSum.classList.remove("show");
                    }
                }, msec + slideTime * i);   // タイミングをずらす
            }

            await sleep(slideTime * (mcards.length + 1));

            // // ボーダーウィンドウを表示
            // if (gs.roundFirst != PLAYER.ME) {
            //     this.passTurn();
            // }

        });
    }

    /**
     * ラウンドの勝敗を決める
     */
    resultRound = () => new Promise(async (resolve, reject) => {
        const gs = this.gameStatus;

        this.setMsgHeader = `SHOWDOWN   `;
        await sleep(800);
        this.setMsgHeader = `SHOWDOWN.  `;
        await sleep(800);
        this.setMsgHeader = `SHOWDOWN.. `;
        await sleep(800);
        this.setMsgHeader = `SHOWDOWN...`;
        await sleep(1400);

        // ラウンド勝者を判定 + ダメージの計算
        const result = gs.judge();
        if (result == "WIN") {
            gs.enFingers = Math.max(gs.enFingers - gs.enBet, 0);
            gs.playFirst = PLAYER.EN;
            this.setMsgHeader = `YOU <span class="green">WIN!</span>`;
        } else if (result == "LOSE") {
            gs.myFingers = Math.max(gs.myFingers - gs.myBet, 0);
            gs.playFirst = PLAYER.ME;
            this.setMsgHeader = `YOU <span class="red">LOSE!</span>`;
        } else if (result == "EVEN") {
            // Do something...
            gs.playFirst = gs.roundFirst;
            this.setMsgHeader = `DRAW!`;
        }

        // // openCards()より前 && judge()より後に実行
        // await this.reflesh();

        // 両者のカードをオープン
        await this.openCards();

        await sleep(1000);

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

        await sleep(1000);

        // ゲームの勝負が付いたら次のラウンドは無し
        if (gs.isGameEnd) resolve();

        // ボーダーウィンドウを表示
        if (gs.roundFirst != PLAYER.ME) {
            await this.showBdrMsg(MSG.BDR.ENEMY_ROUND, ACT.ER);
            // this.setMsgHeader = `<span class="red">ENEMY</span> TURN`;
        } else {
            await this.showBdrMsg(MSG.BDR.YOUR_ROUND, ACT.YR);
            // this.setMsgHeader = `<span class="green">YOUR</span> TURN`;
        }

        resolve();
    });

    openCards = () => new Promise((resolve, reject) => {
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

        resolve();
    });

    reflesh = () => new Promise((resolve, reject) => {
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
        if (gs.isJudged || gs.whoseTurn != PLAYER.ME) {
            btnStay.disabled = true;
            btnDraw.disabled = true;
        } else {
            btnStay.disabled = false;
            btnDraw.disabled = false;
        }

        resolve();
    });

}

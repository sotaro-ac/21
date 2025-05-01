// js/main.js
'use strict';

import { DOM, MAX_SP_HAND } from './domElements.js';
import { SPCard } from './SPCard.js';
import { GameStatus, PLAYER, CMD, DEFAULT_PARAMS } from './GameStatus.js';

// FUNCTION
const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

const ACT = {
    get GS() {
        return 'GAME_START';
    },
    get GC() {
        return 'GAME_CLEAR';
    },
    get GO() {
        return 'GAME_OVER';
    },
    get YR() {
        return 'YOUR_ROUND';
    },
    get ER() {
        return 'ENEMY_ROUND';
    },
    get NT() {
        return 'NOTICE_TIMEOUT';
    },
    get DE() {
        return 'DEFAULT';
    },
};

const MSG = {
    BDR: {
        get GAME_START() {
            return 'デスゲームに勝ち残り<br>賞金を手に入れろ！';
        },
        get GAME_CLEAR() {
            return 'あなたはゲームに勝利して<br>賞金を手に入れた！';
        },
        get GAME_OVER() {
            return 'あなたはゲームに敗北して<br>死んでしまった...';
        },
        get YOUR_ROUND() {
            return "次のラウンドは「<span class='green'>あなた</span>」が先攻です。";
        },
        get ENEMY_ROUND() {
            return "次のラウンドは「<span class='red'>相手</span>」が先攻です。";
        },
    },
    POP: {
        get STAY() {
            return '相手は「STAY」を選択した。';
        },
        get DRAW() {
            return '相手は「DRAW」を選択した。';
        },
        get SP() {
            return '相手は「SPカード」を使用した。';
        },
    },
    BUTTON: {
        get GAME_START() {
            return ['GAME START', ''];
        },
        get GAME_CLEAR() {
            return ['NEW GAME', 'END GAME'];
        },
        get GAME_OVER() {
            return ['NEW GAME', 'END GAME'];
        },
        get DEFAULT() {
            return ['OK', ''];
        },
    },
};

export class GameController {
    //
    // STATIC
    //
    static #gameStatus = new GameStatus();

    //
    // CONSTRUCTOR
    //
    constructor(id) {
        this.id = id;
        //
        // SPウィンドウをゲーム開始可能な状態にする
        //
        if (!DOM.SPWindow.classList.contains('fullfilled')) {
            // 不要な要素があれば削除
            while (DOM.SPWindow.firstChild != DOM.SPTextContainer) DOM.SPWindow.firstChild.remove();
            while (DOM.SPTextContainer.firstChild) DOM.SPTextContainer.firstChild.remove();

            // SPカードスロットの作成
            for (let i = 0; i < MAX_SP_HAND; i++) {
                const divSPCard = document.createElement('div');
                divSPCard.id = `sp${i}`;
                divSPCard.className = 'spSlot';
                DOM.SPTextContainer.before(divSPCard);
            }

            // SPカードの詳細を取得
            const SP_CARD = new SPCard();

            // すべてのSPカードの説明文を事前に用意する
            SP_CARD.initPromise.then(() => {
                const spData = SP_CARD.list; //: JSON Object #SPカードの詳細
                for (let i = 0; i < spData.length; i++) {
                    const divSPText = document.createElement('div');
                    const pSPname = document.createElement('p');
                    const pSPtext = document.createElement('p');
                    divSPText.className = `spID${spData[i].id}txt`;
                    pSPname.className = 'SPname';
                    pSPtext.className = 'SPtext';
                    pSPname.textContent = spData[i].name;
                    pSPtext.textContent = spData[i].description;
                    divSPText.appendChild(pSPname);
                    divSPText.appendChild(pSPtext);
                    DOM.SPTextContainer.appendChild(divSPText);
                }
            });
            DOM.SPWindow.classList.add('fullfilled'); // 開始可能
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
    set setMsgHeader(textHTML) {
        DOM.header.innerHTML = textHTML;
    }

    set setMsgNotice(textHTML) {
        DOM.notice.innerHTML = textHTML;
    }

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
            DOM.infoPopUp.hidden = false;
            DOM.infoSP.hidden = true;
            DOM.infoMsg.textContent = textMsg;

            // SPカードの使用
            if (id) {
                DOM.infoSP.hidden = false;
                DOM.infoSPImg.className = `spID${id}`;
                DOM.infoSPName.textContent = name;
                DOM.infoSPText.textContent = description;
            }

            // ポップアップの[OK]ボタンを押すまで待機
            DOM.infoBtnPop.addEventListener(
                'click',
                () => {
                    DOM.infoPopUp.hidden = true;
                    DOM.infoSP.hidden = true;
                    resolve(); // 待機状態からの解放
                },
                { once: true }
            );
        });
    }

    /**
     * 画面中央にメッセージを表示する（ボタンを押すまで待機する）
     *
     * @param {String} textMsg # 画面中央に表示するメッセージ
     * @param {String} action  # "" / "GS" ?
     * @returns {Promise}
     */

    showBdrMsg(textMsg, action = '') {
        return new Promise((resolve, reject) => {
            switch (action) {
                case ACT.GC:
                    DOM.infoBorderImg.hidden = false;
                case ACT.GO:
                case ACT.GS:
                    DOM.infoBorderMsg.innerHTML = MSG.BDR[action];
                    DOM.infoBtnContainer.hidden = false;
                    DOM.infoBorder.hidden = false;
                    // Button 1st
                    if (!MSG.BUTTON[action][0]) DOM.infoBtnFirst.hidden = true;
                    else DOM.infoBtnFirst.hidden = false;
                    DOM.infoBtnFirst.textContent = MSG.BUTTON[action][0];
                    // Button 2nd
                    if (!MSG.BUTTON[action][1]) DOM.infoBtnSecond.hidden = true;
                    else DOM.infoBtnSecond.hidden = false;
                    DOM.infoBtnSecond.textContent = MSG.BUTTON[action][1];
                    break;

                case ACT.YR:
                case ACT.ER:
                    DOM.infoBorderMsg.innerHTML = MSG.BDR[action];
                    DOM.infoBtnContainer.hidden = false;
                    DOM.infoBorder.hidden = false;
                    // Button 1st
                    if (!MSG.BUTTON[ACT.DE][0]) DOM.infoBtnFirst.hidden = true;
                    else DOM.infoBtnFirst.hidden = false;
                    DOM.infoBtnFirst.textContent = MSG.BUTTON[ACT.DE][0];
                    // Button 2nd
                    if (!MSG.BUTTON[ACT.DE][1]) DOM.infoBtnSecond.hidden = true;
                    else DOM.infoBtnSecond.hidden = false;
                    DOM.infoBtnSecond.textContent = MSG.BUTTON[ACT.DE][1];
                    break;

                default:
                    // Button 1st
                    if (!MSG.BUTTON[ACT.DE][0]) DOM.infoBtnFirst.hidden = true;
                    else DOM.infoBtnFirst.hidden = false;
                    DOM.infoBtnFirst.textContent = MSG.BUTTON[ACT.DE][0];
                    // Button 2nd
                    if (!MSG.BUTTON[ACT.DE][1]) DOM.infoBtnSecond.hidden = true;
                    else DOM.infoBtnSecond.hidden = false;
                    DOM.infoBtnSecond.textContent = MSG.BUTTON[ACT.DE][1];
                case ACT.NT:
                    DOM.infoBtnContainer.hidden = true;
                    DOM.infoBorderMsg.innerHTML = textMsg;
                    DOM.infoBorder.hidden = false;
                    break;
            }

            if (action == ACT.NT) {
                const showTime = 3000;
                setTimeout(() => {
                    DOM.infoBorder.hidden = true;
                    DOM.infoBorderImg.hidden = true;
                    DOM.infoBtnContainer.hidden = true;
                    DOM.infoBtnFirst.hidden = true;
                    DOM.infoBtnSecond.hidden = true;
                    resolve();
                }, showTime);
            } else {
                // ボーダーウィンドウのボタンを押すまで待機
                [DOM.infoBtnFirst, DOM.infoBtnSecond].forEach((btn, i) => {
                    btn.addEventListener(
                        'click',
                        el => {
                            DOM.infoBorder.hidden = true;
                            DOM.infoBorderImg.hidden = true;
                            DOM.infoBtnContainer.hidden = true;
                            DOM.infoBtnFirst.hidden = true;
                            DOM.infoBtnSecond.hidden = true;

                            const target = el.target;

                            switch (action) {
                                case ACT.GC:
                                case ACT.GO:
                                    if (target == DOM.infoBtnFirst) resolve(DOM.infoBtnFirst); // this.newGame()
                                    if (target == DOM.infoBtnSecond) resolve(DOM.infoBtnSecond); // location.replace("index.html");
                                    break;
                                case ACT.YR:
                                case ACT.ER:
                                    // this.newRound();
                                    break;
                                default:
                                    break;
                            }

                            resolve(); // 待機状態からの解放
                        },
                        { once: true }
                    );
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
        const timeOutNotice = 2500;
        let timerIdNotice = null;
        let prevTurn;

        while (true) {
            // ゲームの開始状態
            await this.newGame();
            prevTurn = gs.whoseTurn;

            while (true) {
                // !gs.isGameEnd
                DOM.btnStay.disabled = true;
                DOM.btnDraw.disabled = true;

                // 相手のターン処理
                if (gs.whoseTurn != PLAYER.ME) {
                    DOM.setMsgHeader = `<span class="red">ENEMY</span> TURN`;
                    DOM.btnStay.disabled = true;
                    DOM.btnDraw.disabled = true;
                    DOM.btnSP.checked = false;
                    DOM.btnSP.disabled = true;
                    gs.enStay = false; // STAYフラグを折る
                    await this.passTurn();
                }
                // 自分のターン処理
                else {
                    DOM.setMsgHeader = `<span class="green">YOUR</span> TURN`;
                    DOM.btnStay.disabled = false;
                    DOM.btnDraw.disabled = false;
                    DOM.btnSP.disabled = false;
                    gs.myStay = false; // STAYフラグを折る

                    //* 手札合計値がバースト or 手札が上限の６枚ある場合はドロー不可能
                    if (gs.goal < gs.myHandSum || 6 <= gs.myHand.length) {
                        DOM.btnDraw.disabled = true;
                    } else {
                        DOM.btnDraw.disabled = false;
                    }

                    // どれか１つのボタン押下まで待つ
                    await new Promise((resolve, reject) => {
                        const ac = new AbortController();
                        const spBtns = document.querySelectorAll('.spSlot > input');

                        // Draw
                        DOM.btnDraw.addEventListener(
                            'click',
                            async () => {
                                ac.abort();
                                // 手札合計値がバースト or 手札が上限の６枚ある場合は無効
                                if (gs.goal < gs.myHandSum || 6 <= gs.myHand.length) return;

                                // 山札から手札にカードを１枚移動(ドロー)する
                                gs.myHand.push(gs.deck.pop()); // draw from deck
                                // gs.myStay = false;  // STAYフラグを折る
                                await this.reflesh();
                                DOM.myCards.lastChild.classList.add('draw');
                                DOM.myHandSum.classList.add('show');
                                await sleep(slideTime);
                                // 相手のターンに設定
                                gs.whoseTurn = PLAYER.EN;
                                resolve();
                            },
                            { signal: ac.signal, once: true }
                        );

                        // Stay
                        DOM.btnStay.addEventListener(
                            'click',
                            () => {
                                ac.abort();
                                gs.myStay = true; // STAYフラグを立てる
                                this.reflesh();
                                // 相手のターンに設定
                                gs.whoseTurn = PLAYER.EN;
                                resolve();
                            },
                            { signal: ac.signal, once: true }
                        );

                        // SP Slots
                        spBtns.forEach((e, i) => {
                            e.addEventListener(
                                'click',
                                ev => {
                                    const idx = Number(ev.target.parentElement.id.slice(2));
                                    const spID = Number(ev.target.value);
                                    // const sp = gs.mySPDeck;
                                    ac.abort();

                                    gs.myHandSP.splice(idx, 1);
                                    // console.log("called from ", ev.target); // SP効果発動！
                                    DOM.setMsgNotice = gs.useSP(spID, gs.whoseTurn);
                                    // 一定時間後にNoticeを非表示
                                    if (timerIdNotice) clearTimeout(timerIdNotice);
                                    timerIdNotice = setTimeout(() => {
                                        DOM.setMsgNotice = '';
                                    }, timeOutNotice);

                                    gs.bothStay = false; // 両者のSTAYフラグを折る
                                    this.reflesh();
                                    // await this.animateSP();
                                    resolve();
                                },
                                { signal: ac.signal, once: true }
                            );
                        });
                    });
                }

                // 両者が「STAY」ならラウンドの勝敗を決定する
                // （ただし，SPカードを使用してSTAYした場合は無視）
                if (gs.bothStay) {
                    DOM.btnStay.disabled = true;
                    DOM.btnDraw.disabled = true;
                    DOM.btnSP.checked = false;
                    DOM.btnSP.disabled = true;
                    await this.resultRound();
                    // ゲームの勝敗が付いている時
                    if (gs.isGameEnd) {
                        if (gs.isGameEnd == PLAYER.ME) {
                            DOM.setMsgHeader = `YOU ARE THE <span class="green">SURVIVOR!!</span>`;
                            await this.showBdrMsg(MSG.BDR.GAME_CLEAR, ACT.GC).then(async res => {
                                if (res == DOM.infoBtnSecond) {
                                    document.querySelector('.container').style =
                                        'filter: blur(5px)';
                                    location.replace('index.html');
                                    await sleep(2000);
                                }
                            });
                        } else if (gs.isGameEnd == PLAYER.EN) {
                            DOM.setMsgHeader = `YOU ARE <span class="red">DEAD...</span>`;
                            await this.showBdrMsg(MSG.BDR.GAME_OVER, ACT.GO).then(async res => {
                                if (res == DOM.infoBtnSecond) {
                                    document.querySelector('.container').style =
                                        'filter: blur(5px)';
                                    location.replace('index.html');
                                    await sleep(2000);
                                }
                            });
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
                    gs.turn++;
                    // console.log("ROUND " + gs.round + " : TURN " + gs.turn);
                }
            }
        }
    };

    /**
     * 相手のターンを処理する
     */
    passTurn = async () => {
        const gs = this.gameStatus;
        const sp = gs.enSPDeck;
        const decision = gs.enemyDecision();
        const timeOutNotice = 2500;
        let timerIdNotice = null;

        // 少しだけ待たせる（疑似的な思考時間）
        await sleep(Math.random() * 1000 + 500);

        // SPカードの使用
        if (decision.cmd == CMD.SP) {
            const spID = decision.value;
            gs.bothStay = false; // 両者のSTAYフラグを折る
            // // Passive SPカードを使用した場合はボードに置く
            // const spPsv = sp.getIdList({ type: "passive" });
            // if (spPsv.some(id => id == spID)) {
            //     gs.enPassiveSP.push(spID);
            // }
            this.setMsgNotice = gs.useSP(spID, gs.whoseTurn);
            // 一定時間後にNoticeを非表示
            if (timerIdNotice) clearTimeout(timerIdNotice);
            timerIdNotice = setTimeout(() => {
                this.setMsgNotice = '';
            }, timeOutNotice);
            this.reflesh();

            // SPカード使用のポップアップメッセージを表示
            await this.showPopUp(
                MSG.POP.SP,
                sp.list.find(card => card.id == spID)
            );
        }
        // Draw
        else if (decision.cmd == CMD.DRAW) {
            gs.enStay = false; // STAYフラグを折る
            this.reflesh();
            DOM.enemyCards.lastChild.classList.add('draw');
            DOM.enemyHandSum.classList.add('show');

            // ポップアップメッセージを表示
            await this.showPopUp(MSG.POP.DRAW);
            gs.whoseTurn = PLAYER.ME;
        }
        // Stay
        else if (decision.cmd == CMD.STAY) {
            // ポップアップメッセージを表示
            await this.showPopUp(MSG.POP.STAY);
            gs.enStay = true; // STAYフラグを立てる
            this.reflesh();
            gs.whoseTurn = PLAYER.ME;
        }
    };

    animateSP = () => new Promise(async (resolve, reject) => {});

    /**
     * 新しいゲームを開始する
     * @returns {Promise}
     */
    newGame = () =>
        new Promise((resolve, reject) => {
            this.gameStatus.init().then(async gs => {
                await this.reflesh();
                this.setMsgHeader = `<span class="green">WELCOME</span> CHALLENGER!`;

                const msec = 500;
                const slideTime = 1000;
                const showCount = 1000;

                DOM.myHandSum.style.visibility = 'hidden';
                DOM.enemyHandSum.style.visibility = 'hidden';

                const mcards = DOM.myCards.children;
                for (let i = 0; i < mcards.length; i++) {
                    mcards[i].classList.add('draw');
                    mcards[i].hidden = true;
                    setTimeout(async () => {
                        mcards[i].hidden = false;
                        await sleep(slideTime);
                        // mcards[i].classList.remove("draw");
                        if (i == mcards.length - 1) {
                            DOM.myHandSum.classList.add('show');
                            DOM.myHandSum.style.visibility = 'visible';
                            await sleep(showCount);
                            // DOM.myHandSum.classList.remove("show");
                        }
                    }, slideTime * i); // タイミングをずらす
                }

                const ecards = DOM.enemyCards.children;
                for (let i = 0; i < ecards.length; i++) {
                    ecards[i].classList.add('draw');
                    ecards[i].hidden = true;
                    setTimeout(
                        async () => {
                            ecards[i].hidden = false;
                            await sleep(slideTime);
                            // ecards[i].classList.remove("draw");
                            if (i == mcards.length - 1) {
                                DOM.enemyHandSum.classList.add('show');
                                DOM.enemyHandSum.style.visibility = 'visible';
                                await sleep(showCount);
                                // DOM.enemyHandSum.classList.remove("show");
                            }
                        },
                        msec + slideTime * i
                    ); // タイミングをずらす
                }

                // メッセージ確認と時間経過の両方が完了すると then() 内部が実行される
                await Promise.all([
                    this.showBdrMsg(MSG.BDR.GAME_START, ACT.GS),
                    sleep(slideTime * mcards.length + msec),
                ]).then(async res => {
                    this.setMsgHeader = `ROUND ${gs.round}`;
                    gs.playFirst = PLAYER.RANDOM;
                    await this.showBdrMsg(
                        `最初は「${
                            gs.roundFirst == PLAYER.ME
                                ? `<span class="green">あなた</span>`
                                : `<span class="red">相手</span>`
                        }」のターンです。`,
                        ACT.DE
                    );
                });
                resolve();
            });
        });

    /**
     * 新しいラウンドを始める
     * @param {Boolean} roundFirst # 指定したプレイヤーから始める(DEBUG用)
     */
    newRound(roundFirst) {
        return this.gameStatus.newRound(roundFirst).then(async gs => {
            await this.reflesh();

            this.setMsgHeader = `ROUND ${gs.round}`;

            const msec = 500;
            const slideTime = 1000;
            const showCount = 1000;

            DOM.myHandSum.style.visibility = 'hidden';
            DOM.enemyHandSum.style.visibility = 'hidden';

            const mcards = DOM.myCards.children;
            for (let i = 0; i < mcards.length; i++) {
                mcards[i].classList.add('draw');
                mcards[i].hidden = true;
                setTimeout(async () => {
                    mcards[i].hidden = false;
                    await sleep(slideTime);
                    // mcards[i].classList.remove("draw");
                    if (i == mcards.length - 1) {
                        DOM.myHandSum.classList.add('show');
                        DOM.myHandSum.style.visibility = 'visible';
                        await sleep(showCount);
                        // DOM.myHandSum.classList.remove("show");
                    }
                }, slideTime * i); // タイミングをずらす
            }

            const ecards = DOM.enemyCards.children;
            for (let i = 0; i < ecards.length; i++) {
                ecards[i].classList.add('draw');
                ecards[i].hidden = true;
                setTimeout(
                    async () => {
                        ecards[i].hidden = false;
                        await sleep(slideTime);
                        // ecards[i].classList.remove("draw");
                        if (i == mcards.length - 1) {
                            DOM.enemyHandSum.classList.add('show');
                            DOM.enemyHandSum.style.visibility = 'visible';
                            await sleep(showCount);
                            // DOM.enemyHandSum.classList.remove("show");
                        }
                    },
                    msec + slideTime * i
                ); // タイミングをずらす
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
    resultRound = () =>
        new Promise(async (resolve, reject) => {
            const gs = this.gameStatus;

            this.setMsgHeader = `SHOWDOWN   `;
            await sleep(800);
            this.setMsgHeader = `SHOWDOWN.  `;
            await sleep(800);
            this.setMsgHeader = `SHOWDOWN.. `;
            await sleep(800);
            this.setMsgHeader = `SHOWDOWN...`;
            await sleep(1400);

            gs.bothStay = false;
            await this.reflesh();

            // ラウンド勝者を判定 + ダメージの計算
            const result = gs.judge();
            if (result == 'WIN') {
                gs.enFingers = Math.max(gs.enFingers - gs.enBet, 0);
                gs.playFirst = PLAYER.EN;
                this.setMsgHeader = `YOU <span class="green">WIN!</span>`;
            } else if (result == 'LOSE') {
                gs.myFingers = Math.max(gs.myFingers - gs.myBet, 0);
                gs.playFirst = PLAYER.ME;
                this.setMsgHeader = `YOU <span class="red">LOSE!</span>`;
            } else if (result == 'EVEN') {
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
            while (DOM.myHand.children.length > 1) DOM.myHand.lastChild.remove();
            while (DOM.enemyHand.children.length > 1) DOM.enemyHand.lastChild.remove();

            // プレイヤーの指(HP)を表示
            const my_lost = DEFAULT_PARAMS.FINGERS - gs.myFingers;
            if (my_lost > 0) {
                DOM.myHand.insertAdjacentHTML(
                    'beforeend',
                    `<img class="Hand lost" src="img/my/lost/0${my_lost}.png"/>`
                );
            }

            // 相手の(HP)を表示
            const en_lost = DEFAULT_PARAMS.FINGERS - gs.enFingers;
            if (en_lost > 0) {
                DOM.enemyHand.insertAdjacentHTML(
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

    openCards = () =>
        new Promise((resolve, reject) => {
            const gs = this.gameStatus;

            // プレイヤーの手札をオープン
            const myFirstCard = DOM.myCards.firstChild;
            myFirstCard.innerHTML = gs.myHand[0];
            myFirstCard.className = 'numCard';

            // 相手の手札をオープン
            const enFirstCard = DOM.enemyCards.firstChild;
            enFirstCard.innerHTML = gs.enHand[0];
            enFirstCard.className = 'numCard';

            // 相手の手札合計値をオープン
            const enHandSum = gs.enHandSum;
            DOM.enemyHandSum.textContent = enHandSum;
            if (gs.goal == enHandSum) {
                DOM.enemyHandSum.className = 'just';
            } else if (gs.goal < enHandSum) {
                DOM.enemyHandSum.className = 'burst';
            } else {
                DOM.enemyHandSum.className = '';
            }

            resolve();
        });

    reflesh = () =>
        new Promise((resolve, reject) => {
            const gs = this.gameStatus;

            //
            // プレイヤーの処理
            //

            // プレイヤーの手札合計値
            const myHandSum = gs.myHandSum;
            DOM.myHandSum.textContent = myHandSum;
            DOM.myHandSum.className = '';
            if (gs.goal == myHandSum) {
                DOM.myHandSum.className = 'just';
            } else if (gs.goal < myHandSum) {
                DOM.myHandSum.className = 'burst';
            } else {
                DOM.myHandSum.className = '';
            }

            // プレイヤーの STAY 状態の表示
            if (gs.myStay) {
                DOM.myCards.classList.add('stay');
            } else {
                DOM.myCards.classList.remove('stay');
            }

            // プレイヤーの手札の表示
            while (DOM.myCards.lastChild) {
                DOM.myCards.removeChild(DOM.myCards.lastChild);
            }
            gs.myHand.forEach((e, i) => {
                const div = document.createElement('div');
                if (i == 0) {
                    div.className = 'numCard back';
                    const innerDiv = document.createElement('div');
                    innerDiv.textContent = e;
                    div.appendChild(innerDiv);
                } else {
                    div.className = 'numCard';
                    div.textContent = e;
                }
                DOM.myCards.appendChild(div);
            });

            // プレイヤーの Passive SPカードの表示
            while (DOM.myPassiveSP.lastChild) {
                DOM.myPassiveSP.removeChild(DOM.myPassiveSP.lastChild);
            }
            gs.myPassiveSP.forEach((e, i) => {
                const div = document.createElement('div');
                div.className = `spCard spID${e}`;
                DOM.myPassiveSP.appendChild(div);
            });

            //
            // 相手の処理
            //

            // 相手の手札合計値(オープン前)
            const enHandSum = gs.enHandSum - gs.enHand[0];
            DOM.enemyHandSum.textContent = `?+${enHandSum}`;
            DOM.enemyHandSum.className = '';

            // 相手の STAY 状態の表示
            if (gs.enStay) {
                DOM.enemyCards.classList.add('stay');
            } else {
                DOM.enemyCards.classList.remove('stay');
            }

            // 相手の手札の表示(オープン前)
            while (DOM.enemyCards.lastChild) {
                DOM.enemyCards.removeChild(DOM.enemyCards.lastChild);
            }
            gs.enHand.forEach((e, i) => {
                const div = document.createElement('div');
                if (i == 0) {
                    div.className = 'numCard back';
                } else {
                    div.className = 'numCard';
                    div.textContent = e;
                }
                DOM.enemyCards.appendChild(div);
            });

            // 相手の Passive SPカードの表示
            while (DOM.enemyPassiveSP.lastChild) {
                DOM.enemyPassiveSP.removeChild(DOM.enemyPassiveSP.lastChild);
            }
            gs.enPassiveSP.forEach((e, i) => {
                const div = document.createElement('div');
                div.className = `spCard spID${e}`;
                DOM.enemyPassiveSP.appendChild(div);
            });

            //
            // Passive SPカード効果の処理
            //

            // 手札合計値の目標値を設定
            DOM.goal.forEach(e => {
                e.textContent = gs.goal;
            });

            // プレイヤーの指(HP)の表示
            const my_lost = DEFAULT_PARAMS.FINGERS - gs.myFingers;
            const my_bet = gs.myBet;
            // while (DOM.divMyHand.lastChild.className != "Hand") {
            while (DOM.myHand.children.length > 1) DOM.myHand.lastChild.remove();
            if (my_lost > 0) {
                DOM.myHand.insertAdjacentHTML(
                    'beforeend',
                    `<img class="Hand lost" src="img/my/lost/0${my_lost}.png"/>`
                );
            }
            if (my_bet > 0) {
                const SELECT = Math.min(my_lost + my_bet, DEFAULT_PARAMS.FINGERS);
                for (let i = my_lost + 1; i <= SELECT; i++) {
                    DOM.myHand.insertAdjacentHTML(
                        'beforeend',
                        `<img class="Hand select" src="img/my/select/0${i}.png"/>`
                    );
                }
            }

            // 相手の指(HP)の表示
            const en_lost = DEFAULT_PARAMS.FINGERS - gs.enFingers;
            const en_bet = gs.enBet;
            // while (DOM.divEnHand.lastChild.className != "Hand") {
            while (DOM.enemyHand.children.length > 1) DOM.enemyHand.lastChild.remove();
            if (en_lost > 0) {
                DOM.enemyHand.insertAdjacentHTML(
                    'beforeend',
                    `<img class="Hand lost" src="img/en/lost/0${en_lost}.png"/>`
                );
            }
            if (en_bet > 0) {
                const SELECT = Math.min(en_lost + en_bet, DEFAULT_PARAMS.FINGERS);
                for (let i = en_lost + 1; i <= SELECT; i++) {
                    DOM.enemyHand.insertAdjacentHTML(
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
            DOM.spBtn.innerHTML = `SP CARD <span>${my_hand_sp.length}</span>`;

            // SPウィンドウのSPカードを更新する
            for (let i = 0; i < MAX_SP_HAND; i++) {
                // const divSPCard = document.createElement('div');
                // divSPCard.id = `sp${i}`;
                const divSPCard = document.getElementById(`sp${i}`);
                divSPCard.innerHTML = '';
                if (i < my_hand_sp.length) {
                    const spID = my_hand_sp[i];
                    // SPカードを追加: <div><input ...></div>
                    divSPCard.className = `spSlot spID${spID}`;
                    const input = document.createElement('input');
                    input.type = 'button';
                    input.name = 'useSP';
                    input.value = spID;
                    divSPCard.appendChild(input);
                } else {
                    divSPCard.className = 'spSlot';
                }
                DOM.SPTextContainer.before(divSPCard);
            }

            //
            // コマンドリストの表示 (下位のコードほど優先条件)
            //

            //* 手札合計値がバースト or 手札が上限の６枚ある場合はドロー不可能
            if (gs.goal < gs.myHandSum || 6 <= gs.myHand.length) {
                DOM.btnDraw.disabled = true;
            } else {
                DOM.btnDraw.disabled = false;
            }

            if (gs.whoseTurn != PLAYER.ME) {
                DOM.btnStay.disabled = true;
                DOM.btnDraw.disabled = true;
            } else {
                DOM.btnStay.disabled = false;
                DOM.btnDraw.disabled = false;
            }

            //* 勝敗判定後は新しいラウンド/ゲームを開始するまでSTAY+DRAW不可能
            if (gs.isJudged) {
                DOM.btnStay.disabled = true;
                DOM.btnDraw.disabled = true;
            } else {
                DOM.btnStay.disabled = false;
                DOM.btnDraw.disabled = false;
            }

            resolve();
        });
}

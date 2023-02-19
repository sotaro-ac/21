// js/GameStatus.js
"use strict";

// Does not work in browser
// import { SPCard } from './SPCard.js';

// export default {...}
const DEFAULT_PARAMS = {
    get DECK() { return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
    get FINGERS() { return 5 },
    get GOAL() { return 21 },
    get BET() { return 1 }
};

const PLAYER = {
    ME: "ME",
    EN: "ENEMY",
    get RANDOM() { return (Math.random() > 0.5) ? this.ME : this.EN }
};

const CMD = {
    STAY: "STAY",
    DRAW: "DRAW",
    SP: "SP"
};

// export
class GameStatus {
    // 
    // PUBLIC LOCAL
    // 
    userId;
    userName;

    round;
    turn;
    isJudged;
    whoseTurn;

    roundFirst;     // "ME" or "ENEMY"
    myStay;
    enStay;
    // useSP;

    myFingers;
    enFingers;

    deck = [];
    myHand = [];
    enHand = [];

    mySPDeck;
    enSPDeck;

    myHandSP = [];
    enHandSP = [];

    myPassiveSP = [];
    enPassiveSP = [];

    //
    // CONSTRUCTOR
    //
    constructor(userId = "----", userName = "----") {
        this.userId = userId;
        this.userName = userName;
        this.mySPDeck = new SPCard();
        this.enSPDeck = new SPCard();
    }

    //
    // METHOD
    //

    get bothStay() { return this.myStay && this.enStay; }
    set bothStay(status) { this.myStay = !!status; this.enStay = !!status; }

    get goal() {
        let GOAL = DEFAULT_PARAMS.GOAL;

        // SP attr of "goal" is should unique on the gameboard
        const allPassSP = this.myPassiveSP.concat(this.enPassiveSP);
        allPassSP.forEach((e, i) => {
            switch (e) {
                case 25: GOAL = 17; break;  // SP shield
                case 26: GOAL = 24; break;  // SP shield +
                case 27: GOAL = 27; break;  // SP shield +
                default: break; // Others
            }
        });

        return GOAL;
    }

    get myBet() {
        let BET = DEFAULT_PARAMS.BET;

        // My Passive SP cards' abilities
        this.myPassiveSP.forEach((e, i) => {
            switch (e) {
                case 23: BET = BET - 1; break;  // SP shield
                case 24: BET = BET - 2; break;  // SP shield +
                default: break; // Others
            }
        });

        // En Passive SP cards' abilities
        this.enPassiveSP.forEach((e, i) => {
            switch (e) {
                case 21: BET = BET + 1; break;  // Bet up
                case 22: BET = BET + 2; break;  // Bet up +
                default: break; // Others
            }
        });

        return Math.max(BET, 0);
    }

    get enBet() {
        let BET = DEFAULT_PARAMS.BET;

        // My Passive SP cards' abilities
        this.myPassiveSP.forEach((e, i) => {
            switch (e) {
                case 21: BET = BET + 1; break;  // Bet up
                case 22: BET = BET + 2; break;  // Bet up +
                default: break; // Others
            }
        });

        // En Passive SP cards' abilities
        this.enPassiveSP.forEach((e, i) => {
            switch (e) {
                case 23: BET = BET - 1; break;  // SP shield
                case 24: BET = BET - 2; break;  // SP shield +
                default: break; // Others
            }
        });

        return Math.max(BET, 0);
    }

    get myHandSum() {
        return this.myHand.reduce((prev, curr) => { return prev + curr; });
    }

    get enHandSum() {
        return this.enHand.reduce((prev, curr) => { return prev + curr; });
    }

    set playFirst(player) {
        this.roundFirst = player;
        this.whoseTurn = player;
    }

    /**
     * ゲームの初期化(リセット)
     * @returns (Promise)
     */
    init = () => new Promise((resolve) => {
        // round/turn setting
        this.round = 1;
        this.turn = 1;
        this.bothStay = false;
        this.roundFirst = PLAYER.EN;    // or RANDOM
        this.isJudged = false;
        this.whoseTurn = this.roundFirst;
        // this.useSP = false;

        // Fingers (Hit Point) <= default:  5
        this.myFingers = DEFAULT_PARAMS.FINGERS;
        this.enFingers = DEFAULT_PARAMS.FINGERS;

        // 
        // Initialize card in hand
        // 

        // Deck
        this.deck = DEFAULT_PARAMS.DECK;
        this.deck.sort(() => Math.random() - 0.5);  // shuffle deck

        // Card in hand
        this.myHand = [this.deck.pop(), this.deck.pop()];
        this.enHand = [this.deck.pop(), this.deck.pop()];

        // 
        // Initialize SP card 
        // 

        // SP card deck
        this.mySPDeck.init();
        this.enSPDeck.init();

        // SP card on passive
        this.myPassiveSP = [];
        this.enPassiveSP = [];

        // Initialize my SP card 
        this.mySPDeck.initPromise.then((res) => {
            const attrDraw = this.mySPDeck.getIdList({ attr: "draw" });
            const attrRare = this.mySPDeck.getIdList({ attr: "rare" });
            const attrEpic = this.mySPDeck.getIdList({ attr: "epic" });
            const typePass = this.mySPDeck.getIdList({ type: "passive" });

            this.myHandSP = [
                this.mySPDeck.drawSPCard(attrDraw),
                this.mySPDeck.drawSPCard(attrRare),
                this.mySPDeck.drawSPCard(attrEpic),
                this.mySPDeck.drawSPCard(typePass)
            ].sort((a, b) => a - b);    // sort by ascending order
        });

        // Initialize enemy's SP card
        this.enSPDeck.initPromise.then((res) => {
            this.enSPDeck.list = this.enSPDeck.list.filter(
                (c) => !c.attr.includes("common")
            );
            const attrBet = this.enSPDeck.getIdList({ attr: "bet" });
            const typeAct = this.enSPDeck.getIdList({ type: "active" });

            this.enHandSP = [
                this.enSPDeck.drawSPCard(),
                this.enSPDeck.drawSPCard(attrBet),
                this.enSPDeck.drawSPCard(attrBet),
                this.enSPDeck.drawSPCard(typeAct)
            ].sort((a, b) => a - b);    // sort by ascending order
        });

        resolve(this);
    });

    /**
     * 新しいラウンドの開始
     * @param {String} roundFirst   # for Debug
     * @returns {Promise}
     */
    newRound = (roundFirst) => new Promise((resolve) => {
        // round/turn setting
        this.round = this.round + 1;
        this.turn = 1;
        this.bothStay = false;
        this.isJudged = false;
        // this.useSP = false;

        // Next round: loser first
        this.roundFirst = (roundFirst) ? roundFirst : this.roundFirst;
        this.whoseTurn = this.roundFirst;

        // 
        // Initialize card in hand
        // 

        // Deck
        this.deck = DEFAULT_PARAMS.DECK;
        this.deck.sort(() => Math.random() - 0.5);  // shuffle deck

        // Card in hand
        this.myHand = [this.deck.pop(), this.deck.pop()];
        this.enHand = [this.deck.pop(), this.deck.pop()];

        // 
        // Initialize SP card 
        // 

        // SP card on passive
        this.myPassiveSP = [];
        this.enPassiveSP = [];

        // Initialize my SP card
        const typeActi = this.mySPDeck.getIdList({ type: "active" });
        const typePass = this.mySPDeck.getIdList({ type: "passive" });

        this.myHandSP = this.myHandSP.concat([
            this.mySPDeck.drawSPCard(typeActi),
            this.mySPDeck.drawSPCard(typePass)
        ]);
        // this.myHandSP.splice(-1, rm);
        for (let i = this.myHandSP.length; i > MAX_SP_HAND; i--) {
            this.myHandSP.pop();
        }
        this.myHandSP.sort((a, b) => a - b);    // sort by ascending order


        // Initialize enemy's SP card
        const attrBet = this.enSPDeck.getIdList({ attr: "bet" });

        this.enHandSP = this.enHandSP.concat([
            this.enSPDeck.drawSPCard(),
            this.enSPDeck.drawSPCard(attrBet),
        ])
        // this.enHandSP.splice(-1, rm);
        for (let i = this.enHandSP.length; i > MAX_SP_HAND; i--) {
            this.enHandSP.pop();
        }
        this.enHandSP.sort((a, b) => a - b);    // sort by ascending order

        resolve(this);
    });

    /**
     * ラウンドの勝敗を判定する
     * @returns {String} # -> "EVEN" / "WIN" / "LOSE"
     */
    judge() {
        /**
         ** 勝敗判定後は新しいラウンド/ゲームを開始するまでSTAY不可能
         */
        this.isJudged = true;   // 勝敗判定フラグを立てる

        // 引き分け
        //  - 数字が同じ
        // プレイヤーの勝ち <--> 負け
        //  - 数字が相手より大きい && お互いにGOALを超えない
        //  - 数字がGOALを超えない && 相手がGOALを超えた
        //  - 数字が相手より小さい && お互いにGOALを超えた

        const my_pt = this.goal - this.myHandSum;
        const en_pt = this.goal - this.enHandSum;

        let result;

        if (my_pt == en_pt) {
            // Even
            result = "EVEN";
        } else if (0 <= my_pt && 0 <= en_pt) {
            // No burst
            result = (my_pt < en_pt) ? "WIN" : "LOSE";
        } else if (my_pt < 0 && 0 <= en_pt) {
            // Burst only of player
            result = "LOSE";
        } else if (0 <= my_pt && en_pt < 0) {
            // Burst only of enemy
            result = "WIN";
        } else {
            // Burst Both
            result = (my_pt < en_pt) ? "LOSE" : "WIN";
        }

        return result;
    }

    /**
     * ゲームの勝者を判定する（ゲームの決着が付いたかを判定する）
     * @returns {null|String} # null: 未決着 | "ME" / "ENEMY": 決着
     */
    get isGameEnd() {
        if (this.myFingers <= 0) return PLAYER.EN;  // プレイヤーの負け
        if (this.enFingers <= 0) return PLAYER.ME;  // 相手の負け
        return null;                                // 未決着
    }

    /**
     * 相手(敵)の判断を処理する
     * @return {Object} decision # -> {cmd: String, value: Number}
     * # -> cmd: "STAY" or "DRAW" or "SP" | value: Number(spID)
     */

    enemyDecision = () => {
        let decision = { cmd: CMD.STAY, value: null };

        switch (this.enFingers) {
            case 5:
            case 4:
                decision = this._enemyDecision1();
                break
            case 3:
            case 2:
            case 1:
                decision = this._enemyDecision2();
                break
            // default:
        }

        return decision;
    }

    _enemyDecision1() {
        const decision = { cmd: CMD.STAY, value: null };

        // 
        // ここではSTAYフラグを更新しない
        // 

        // SP card
        for (let i = 0; i < this.enHandSP.length; i++) {
            const card = this.enHandSP[i];
            if (21 <= card && card <= 24) {
                decision.cmd = CMD.SP;
                decision.value = card;
                this.enHandSP.splice(i, 1); // SPカードを消費
                return decision;
            }
        }

        // Draw
        if (this.enHandSum + 5 <= this.goal) {
            decision.cmd = CMD.DRAW;
            this.enHand.push(this.deck.pop());  // 手札をドローする
            return decision;
        }

        // STAY
        return decision;
    }

    _enemyDecision2() {
        const decision = { cmd: CMD.STAY, value: null };

        // 
        // ここではSTAYフラグを更新しない
        // 

        // Draw
        if (this.enHandSum + 5 <= this.goal) {
            decision.cmd = CMD.DRAW;
            this.enHand.push(this.deck.pop());  // 手札をドローする
            return decision;
        }

        // SP card
        for (let i = 0; i < this.enHandSP.length; i++) {
            const card = this.enHandSP[i];

            if (
                21 <= card && card <= 22
                && this.enHandSum - this.goal < 1   // バーストしていないとき
            ) {
                decision.cmd = CMD.SP;
                decision.value = card;
                this.enHandSP.splice(i, 1); // SPカードを消費
                return decision;
            }

            if (23 <= card && card <= 24
                && 0 < this.enBet   // 自身への掛け数が1以上のとき
            ) {
                // バーストした場合 or 負けるリスクが高い場合
                if (
                    0 < this.enHandSum - this.goal  // バーストしたとき
                    || false                        // 負けるリスクが高い場合を実装する
                ) {
                    decision.cmd = CMD.SP;
                    decision.value = card;
                    this.enHandSP.splice(i, 1); // SPカードを消費
                    return decision;
                }
            }
        }

        // STAY
        return decision;
    }

    /**
     * SPカード使用の処理を行う
     * @param {Number} spID 
     * @param {String} whoUse 
     * @param {Number} idx 
     * @returns {String} errMsg
     */
    useSP(spID, whoUse, idx) {
        let errMsg = "";

        if (!spID && !whoUse) {
            console.log("spID or whoUse is undefined.");
            return errMsg;
        }

        const P = {
            A: whoUse,
            B: (whoUse == PLAYER.ME) ? PLAYER.EN : PLAYER.ME
        };
        const DATA = {
            ME: {
                HAND: this.myHand,
                HANDSP: this.myHandSP,
                PASSSP: this.myPassiveSP,
                SPDECK: this.mySPDeck
            },
            ENEMY: {
                HAND: this.enHand,
                HANDSP: this.enHandSP,
                PASSSP: this.enPassiveSP,
                SPDECK: this.enSPDeck
            }
        };

        // 
        // SP Card Action
        // 

        // SPカードを消費する
        if (idx !== undefined) DATA[P.A].HANDSP.splice(idx, 1);

        const spName = DATA[P.A].SPDECK.list.find(c => c.id == spID).name;
        const spPsv = DATA[P.A].SPDECK.getIdList({ type: "passive" });
        // const spAct = DATA[P.A].SPDECK.getIdList({ type: "active" });
        switch (true) {
            // 
            // Active SP Cards
            // 

            // spDraw_x() + Perfect Draw
            case 1 <= spID && spID <= 12:
                {
                    // 山札のカードが残っていない場合は失敗する
                    if (!this.deck.length) {
                        errMsg = `SPカード「${spName}」は発動に失敗した！<br><span class="red">山札の数字カードが残っていません。</span>`;
                        break;
                    }

                    // 使用者の場の数字カードが6枚以上あれば失敗する
                    if (6 <= DATA[P.A].HAND.length) {
                        errMsg = `SPカード「${spName}」は発動に失敗した！<br><span class="red">場の数字カードが枚数上限です。</span>`;
                        break;
                    }

                    let requiredNum = -1;
                    let numIdx = -1;

                    // 山札から探す数字カードの番号/添え字を取得する
                    if (spID == 12) {
                        /* Perfect Drawの場合 */
                        const handSum = DATA[P.A].HAND.reduce((a, b) => { return a + b });   // 使用者の数字カードの合計値

                        /** 山札の数字カードXについて次のようなスコアを算出： 
                         * - 手札合計 + X <= 目標値 となる X ほどスコアが高くなる
                         * - 目標値 < 手札合計 + X の場合は X が大きいほどスコアが低くなる
                         */
                        const scores = this.deck.map(card => { return (card + handSum <= this.goal) ? card : -card });
                        const scoreMax = scores.reduce((a, b) => { return Math.max(a, b) });

                        // 一番スコアの高い数字カードの番号/添え字を取得する
                        numIdx = scores.indexOf(scoreMax);
                        requiredNum = this.deck[numIdx];
                    } else {
                        /* その他のドロー系SPカード */
                        requiredNum = spID;
                        numIdx = this.deck.findIndex(card => card == requiredNum);
                    }

                    if (numIdx != -1) {
                        this.deck.splice(numIdx, 1);
                        DATA[P.A].HAND.push(requiredNum);
                    } else {
                        errMsg = `SPカード「${spName}」は発動に失敗した！<br><span class="red">山札に「${requiredNum}」は存在しません。</span>`;
                    }
                }
                break;

            // Destroy
            case spID == 13:
                {
                    // 使用者から見て相手側のパッシブSPカードが存在しなければ失敗
                    if (DATA[P.B].PASSSP.length < 1) {
                        errMsg = `SPカード「${spName}」は発動に失敗した！<br><span class="red">場に相手のSPカードは存在しません。</span>`;
                        break;
                    }

                    // 使用者から見て相手側の最後に置いたSPカードを削除する
                    DATA[P.B].PASSSP.pop();
                }
                break;

            // SP Change
            case spID == 14:
                {
                    const removeNum = 2;    // Default: 2

                    // SPカードがSPチェンジ以外にremoveNum枚なければ失敗する
                    if (DATA[P.A].HANDSP.length < removeNum) {
                        errMsg = `SPカード「${spName}」は発動に失敗した！<br><span class="red">手札に別のSPカードが${removeNum}枚以上必要です。</span>`;
                        break;
                    }

                    // 使用者の手持ちSPカードの順番をシャッフルする
                    DATA[P.A].HANDSP.sort(() => Math.random() - 0.5);

                    // シャッフル済のSPカードを先頭からremoveNum枚取り除き、新たに3枚追加する
                    //* FIXME:
                    // - 新たに追加されるSPカードの枚数を指定可能にする
                    // - SPチェンジによって追加のSPチェンジを取得できないようにする
                    DATA[P.A].HANDSP.splice(
                        0, removeNum,
                        DATA[P.A].SPDECK.drawSPCard(),
                        DATA[P.A].SPDECK.drawSPCard(),
                        DATA[P.A].SPDECK.drawSPCard()
                    );

                    // SPカード最大所持数を超過する場合は取り除く
                    for (let i = DATA[P.A].HANDSP.length; i > MAX_SP_HAND; i--) {
                        DATA[P.A].HANDSP.pop();
                    }

                    // SPカードをID順に並び変える
                    DATA[P.A].HANDSP.sort((a, b) => a - b);
                }
                break;

            // Remove
            case spID == 15:
                {
                    // 使用者から見て相手側の数字カードが最初の1枚しか存在しない場合は失敗する
                    if (DATA[P.B].HAND.length < 2) {
                        errMsg = `SPカード「${spName}」は発動に失敗した！<br><span class="red">裏向きの数字カードは山札に戻せません。</span>`;
                        break;
                    }

                    // 相手が最後に引いた数字カードを山札に戻す
                    this.deck.push(DATA[P.B].HAND.pop());

                    // 山札をシャッフルする
                    this.deck.sort(() => Math.random() - 0.5);
                }
                break;

            // Return
            case spID == 16:
                {
                    // 使用者の数字カードが最初の1枚しか存在しない場合は失敗する
                    if (DATA[P.A].HAND.length < 2) {
                        errMsg = `SPカード「${spName}」は発動に失敗した！<br><span class="red">裏向きの数字カードは山札に戻せません。</span>`;
                        break;
                    }

                    // 自分が最後に引いた数字カードを山札に戻す
                    this.deck.push(DATA[P.A].HAND.pop());

                    // 山札をシャッフルする
                    this.deck.sort(() => Math.random() - 0.5);
                }
                break;

            // Exchange
            case spID == 17:
                {
                    // 相手と自分どちらかの数字カードが最初の1枚目しかなければ失敗する
                    if (DATA[P.A].HAND.length < 2 || DATA[P.B].HAND.length < 2) {
                        errMsg = `SPカード「${spName}」は発動に失敗した！<br><span class="red">裏向きの数字カードは交換できません。</span>`;
                        break;
                    }

                    // お互いが最後に引いた数字カードを交換する
                    const popA = DATA[P.A].HAND.pop();
                    const popB = DATA[P.B].HAND.pop();
                    DATA[P.A].HAND.push(popB);
                    DATA[P.B].HAND.push(popA);
                }
                break;

            // Love Your Enemy
            case spID == 18:
                {
                    // 山札のカードが残っていない場合は失敗する
                    if (!this.deck.length) {
                        errMsg = `SPカード「${spName}」は発動に失敗した！<br><span class="red">山札の数字カードが残っていません。</span>`;
                        break;
                    }

                    // 使用者から見て相手側の数字カードが上限枚数であれば失敗
                    if (6 <= DATA[P.B].HAND.length) {
                        errMsg = `SPカード「${spName}」は発動に失敗した！<br><span class="red">場の数字カードが枚数上限です。</span>`;
                        break;
                    }

                    // 山札から探す数字カードの番号/添え字を取得する
                    const handSum = DATA[P.B].HAND.reduce((a, b) => { return a + b });   // 相手の数字カードの合計値

                    // コードの解釈についてはPerfect Draw (case 12)を参照
                    const scores = this.deck.map(card => { return (card + handSum <= this.goal) ? card : -card });
                    const scoreMax = scores.reduce((a, b) => { return Math.max(a, b) });

                    // 一番スコアの高い数字カードの番号/添え字を取得する
                    const numIdx = scores.indexOf(scoreMax);
                    const requiredNum = this.deck[numIdx];

                    // 山札から相手の手札に加える
                    this.deck.splice(numIdx, 1);
                    DATA[P.B].HAND.push(requiredNum);
                }
                break;


            // case spID == xx:
            //     {
            //         // 山札のカードが残っていない場合は失敗する
            //         if (!this.deck.length) {
            //             errMsg = `SPカード「${spName}」は<br>現在実装中です by 開発者`;
            //             break;
            //         }
            //     }


            // 
            // Passive SP card
            // 
            case spPsv.some(id => id == spID):
                {
                    // 使用者の場のSPカードが上限であれば失敗する
                    if (6 <= DATA[P.A].PASSSP.length) {
                        errMsg = `SPカード「${spName}」は発動に失敗した！<br><span class="red">場の数字カードが枚数上限です。</span>`;
                        break;
                    }

                    // // Goal系のSPカードが場に既に存在する場合は削除する
                    // if (25 <= spID && spID <= 27) {
                    //     this.myPassiveSP = this.myPassiveSP.filter(id => id < 25 || 27 < id);
                    //     this.enPassiveSP = this.enPassiveSP.filter(id => id < 25 || 27 < id);
                    // }

                    // Passive SPカードを使用した場合はボードに置く
                    DATA[P.A].PASSSP.push(spID);
                }
                break;

            default:
                errMsg = `Undefined SPCard ID: ${spID}`;
                break;
        }

        return errMsg;
    }

}

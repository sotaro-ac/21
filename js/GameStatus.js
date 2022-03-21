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

    set roundFirst(player) {
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
    enemyDecision() {
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
                // this.enStay = false;          // STAYフラグを折る
                return decision;
            }
        }

        // Draw
        if (this.enHandSum + 5 <= this.goal) {
            decision.cmd = CMD.DRAW;
            this.enHand.push(this.deck.pop());  // 手札をドローする
            // this.enStay = false;                  // STAYフラグを折る
            return decision;
        }

        // STAY
        // this.enStay = true;   // STAYフラグを立てる
        return decision;
    }

}

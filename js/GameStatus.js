// js/GameStatus.js

// Does not work in browser
// import { SPCard } from './SPCard.js';

// export default {...}
const DEFAULT_PARAMS = {
    get DECK() { return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
    get FINGERS() { return 5 },
    get GOAL() { return 21 }
};

// export
class GameStatus {
    // 
    // PUBLIC LOCAL
    // 
    userId;

    round;
    turn;

    whose_turn;
    stay;

    deck = [];
    my_fingers = DEFAULT_PARAMS.FINGERS;
    en_fingers = DEFAULT_PARAMS.FINGERS;

    mySPDeck = new SPCard();
    enSPDeck = new SPCard();

    myHand = [];
    enHand = [];

    myHandSP = [];
    enHandSP = [];

    my_passive_sp = [];
    en_passive_sp = [];

    //
    // CONSTRUCTOR
    //
    constructor(userId) { this.userId = userId; }

    //
    // METHOD
    //

    get goal() {
        // do something 
        return DEFAULT_PARAMS.GOAL;
    }

    get myHandSum() {
        return this.myHand.reduce((prev, curr) => { return prev + curr; });
    }

    get enHandSum() {
        return this.enHand.reduce((prev, curr) => { return prev + curr; });
    }

    /**
     * ゲームの初期化(リセット)
     */
    init = () => new Promise((resolve) => {
        // round/turn setting
        this.round = 1;
        this.turn = 1;
        this.stay = false;
        this.whose_turn = "me";    // or random

        // Fingers (Hit Point) <= default:  5
        this.my_fingers = DEFAULT_PARAMS.FINGERS;
        this.en_fingers = DEFAULT_PARAMS.FINGERS;

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

        // Initialize my SP card 
        this.mySPDeck.initPromise.then((res) => {
            const attrDraw = this.mySPDeck.getIdList({ attr: "draw" });
            const attrRare = this.mySPDeck.getIdList({ attr: "rare" });
            const attrEpic = this.mySPDeck.getIdList({ attr: "epic" });
            const typePass = this.mySPDeck.getIdList({ type: "passive" });

            this.myHandSP = [
                this.mySPDeck.drawCard(attrDraw),
                this.mySPDeck.drawCard(attrRare),
                this.mySPDeck.drawCard(attrEpic),
                this.mySPDeck.drawCard(typePass)
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
                this.enSPDeck.drawCard(),
                this.enSPDeck.drawCard(attrBet),
                this.enSPDeck.drawCard(attrBet),
                this.enSPDeck.drawCard(typeAct)
            ].sort((a, b) => a - b);    // sort by ascending order
        });

        resolve(this);
    }).then((res) => {
        return res;
    });

}

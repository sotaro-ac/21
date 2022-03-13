// js/GameStatus.js

// Does not work in browser
// import { SPCard } from './SPCard.js';

// export default {...}
const DEFAULT_PARAMS = {
    DECK: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    FINGERS: 5
};

// export
class GameStatus {

    userId;

    round;
    turn;

    whose_turn;
    stay;

    deck = [];
    my_fingers;
    en_fingers;

    mySPDeck;
    enSPDeck;

    myHand = [];
    enHand = [];

    myHandSP = [];
    enHandSP = [];

    my_passive_sp = [];
    en_passive_sp = [];

    initPromise;


    constructor(userId) {
        this.userId = userId;
        this.initPromise = new Promise((resolve) => {
            new Promise((res) => {
                this.init();
                res();
            }).then(() => {
                resolve();
            });
        });
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
    init() {
        // round/turn setting
        this.round = 1;
        this.turn = 1;
        this.stay = false;
        this.whose_turn = "me";    // or random

        // Deck
        this.deck = DEFAULT_PARAMS.DECK;
        this.deck.sort(() => Math.random() - 0.5);  // shuffle deck

        // Fingers (Hit Point) <= default:  5
        this.my_fingers = DEFAULT_PARAMS.FINGERS;
        this.en_fingers = DEFAULT_PARAMS.FINGERS;

        // Card in hand
        this.myHand = [this.deck.pop(), this.deck.pop()];
        this.enHand = [this.deck.pop(), this.deck.pop()];

        // 
        // Initialize SP card 
        // 

        // SP card deck
        this.mySPDeck = new SPCard();
        this.enSPDeck = new SPCard();

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
            ];
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
            ];

            // console.log(this.enSPDeck, this.enHandSP);
        });
    }

}

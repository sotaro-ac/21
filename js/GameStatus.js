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
    turn;
    stay;
    first_player;

    deck = [];
    my_fingers;
    en_fingers;

    mySPDeck;
    enDPDeck;

    myHand = [];
    enHand = [];

    myHandSp = [];
    enHandSp = [];

    my_passive_sp = [];
    en_passive_sp = [];


    constructor(userId) {
        this.userId = userId;
        this.init();
    }

    init() {
        this.deck = DEFAULT_PARAMS.DECK;
        this.deck.sort(() => Math.random() - 0.5);  // shuffle

        this.my_fingers = DEFAULT_PARAMS.FINGERS;
        this.en_fingers = DEFAULT_PARAMS.FINGERS;

        this.myHand = [this.deck.pop(), this.deck.pop()];
        this.enHand = [this.deck.pop(), this.deck.pop()];

        this.mySPDeck = new SPCard();
        this.enDPDeck = new SPCard();

        this.myHandSp = [this.mySPDeck.drawCard()];
    }

}

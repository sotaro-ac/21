// DOM Elements Manager
export const DOM = {
    // infoBoard
    header: document.querySelector("#header"),
    notice: document.querySelector("#notice"),

    // gameBoard
    spBtn: document.querySelector("#divSPBtn"),
    myCards: document.querySelector("#MY_Cards"),
    enemyCards: document.querySelector("#EN_Cards"),
    myHandSum: document.querySelector("#myHandSum"),
    enemyHandSum: document.querySelector("#enHandSum"),
    goal: document.querySelectorAll("span.goal"),
    myPassiveSP: document.querySelector("#MY_PassiveSP"),
    enemyPassiveSP: document.querySelector("#EN_PassiveSP"),
    myHand: document.querySelector("#MY_Hand"),
    enemyHand: document.querySelector("#EN_Hand"),

    // infoBorder
    infoBorder: document.querySelector("#infoBorder"),
    infoBorderImg: document.querySelector("#infoBdrImg"),
    infoBorderMsg: document.querySelector("#infoBdrMsg"),
    infoBtnContainer: document.querySelector("#infoBorder .infoBtnContainer"),
    infoBtnFirst: document.querySelector("#infoBtnFirst"),
    infoBtnSecond: document.querySelector("#infoBtnSecond"),

    // infoPopUp
    infoPopUp: document.querySelector("#infoPopUp"),
    infoSP: document.querySelector("#infoSP"),
    infoSPImg: document.querySelector("#infoSPImg"),
    infoSPName: document.querySelector("#infoSPName"),
    infoSPText: document.querySelector("#infoSPText"),
    infoMsg: document.querySelector("#infoMsg"),
    infoBtnPop: document.querySelector("#infoBtnPop"),

    // MY_Commands
    myCommands: document.querySelector("#MY_Commands"),
    btnStay: document.querySelector("#btnStay"),
    btnDraw: document.querySelector("#btnDraw"),
    btnSP: document.querySelector("#SP_btn"),

    // SP_Window
    SPWindow: document.querySelector("#SP_Window"),
    SPTextContainer: document.querySelector("#SPTextContainer")
};

export const MAX_SP_HAND = 16; 
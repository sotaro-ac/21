// js/main.js

// Does not work in browser
// import { SPCard } from './SPCard.js';
// import { GameStatus, DEFAULT } from './GameBoard.js';

// const spCard = new SPCard();
const gameStatus = new GameStatus("id");

gameStatus.initPromise.then((res) => {
    const MAX_SP_HAND = 16;
    const sp_json = { sp_card: gameStatus.myHandSP };
    const sp_hand = sp_json.sp_card.sort((a, b) => a - b);
    
    const SPWindow = document.getElementById("SP_Window");
    const labelSPBtn = document.getElementsByClassName("label_SP_btn")[0];
    
    // SPカードの所持数をSPボタンのラベルに表示する
    labelSPBtn.textContent = `SP[${sp_hand.length}]`;
    
    // SPカードのデータを読み込む
    fetch("json/sp_card.json")
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        // SPウィンドウにSPカードを追加する
        for (let i = 0; i < MAX_SP_HAND; i++) {
          const div = document.createElement("div");
          if (i < sp_hand.length) {
            div.id = `sp${i}`;
            div.className = `spPrev spID${sp_hand[i]}`;
          } else {
            div.className = `spPrev sp${i}`;
          }
          SPWindow.appendChild(div);
        }
      });
});

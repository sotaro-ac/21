import { GameController } from './main.js';
import { DOM } from './domElements.js';

export function initializeGame() {
    try {
        if (!DOM.myCards || !DOM.enemyCards) {
            throw new Error('必要なDOM要素が見つかりません');
        }

        const gc = new GameController("id");
        document.body.onload = () => {
            try {
                gc.run();
            } catch (error) {
                console.error('ゲームの実行中にエラーが発生しました:', error);
                showErrorToUser('ゲームの実行中にエラーが発生しました。ページを再読み込みしてください。');
            }
        };
    } catch (error) {
        console.error('ゲームの初期化中にエラーが発生しました:', error);
        showErrorToUser('ゲームの初期化中にエラーが発生しました。ページを再読み込みしてください。');
    }
}

function showErrorToUser(message) {
    if (DOM.infoMsg) {
        DOM.infoMsg.textContent = message;
        DOM.infoPopUp.hidden = false;
        DOM.infoBtnPop.hidden = true;
    } else {
        alert(message);
    }
} 
// js/SPCard.js

// export
const _PATH_TO_SPCARD_JSON_ = "../json/sp_card.json";

// export
class SPCard {

    //
    // STATIC
    //
    static list = [];   // SPカードリスト

    // private
    static #PATH_TO_SPCARD_JSON = _PATH_TO_SPCARD_JSON_;

    // setter
    static set PATH_TO_SPCARD_JSON(path) {
        SPCard.#PATH_TO_SPCARD_JSON = path;
        SPCard.#updateSPList();
    }

    // getter
    static get PATH_TO_SPCARD_JSON() {
        return SPCard.#PATH_TO_SPCARD_JSON;
    }

    /**
     * JSONファイルを読み込んでSPカードリストを取得する
     */
    static #updateSPList = () => {
        return fetch(SPCard.#PATH_TO_SPCARD_JSON)
            .then((res) => { return res.json(); })
            .then((json) => {
                SPCard.list.length = 0;
                json["sp_card"].forEach((card) => {
                    SPCard.list.push(card);
                });
            });
    };

    // 
    // LOCAL
    // 
    list = [];
    /**
     * this.list に新しいIDリストを与えることで
     * 各プレイヤーが利用可能なSPカードを指定できる
     */

    //
    // CONSTRUCTOR
    //
    constructor() {
        SPCard.#updateSPList().then((res) => { this.init(); });
    }

    //
    // METHOD
    //

    /**
     * インスタンスのSPカードリストを初期化する
     */
    init() {
        // "name", 'type', 'description' がひとつでも欠けているデータは除く
        this.list = SPCard.list.filter(
            (card) => card.name !== "" || card.type !== "" || card.description !== ""
        );
    }

    /**
     * 利用可能なSPカードのIDリストを取得する
     * *[OPTION]:指定された type && attr を持つSPカードのIDリストを取得する
     * @param {Object} (optional) # {type:String , attr:String }
     * @returns {Array}
     */
    getIdList({ type, attr } = {}) {
        // type または attr が指定されていれば該当するデータに絞る
        if (type && attr) {
            return this.list.filter(
                (c) => (c.type == type && c.attr.includes(attr)).map((c) => c.id)
            );
        } else if (type && !attr) {
            return this.list.filter((c) => c.type === type).map((c) => c.id);
        } else if (!type && attr) {
            return this.list.filter((c) => c.attr.includes(attr)).map((c) => c.id);
        } else {
            return this.list.map((card) => card.id);
        }
    }

    /**
     * 利用可能なSPカードの中からランダムにひとつのIDを選択する
     * *[OPTION]:配列idList の中からIDをひとつ選ぶ
     * @param {Array} idList 
     * @returns {Number}
     */
    drawCard(idList) {
        if (Array.isArray(idList)) {
            // 指定されていれば 配列idList の中からIDをひとつ選ぶ
            const idx = Math.round(Math.random() * idList.length);
            return idList[idx];
        } else {
            // デフォルトでは this.list の中からIDをひとつ選ぶ
            const idArr = this.getIdList();
            const idx = Math.round(Math.random() * idArr.length);
            return idArr[idx];
        }
    }
}

// js/SPCard.js
"use strict";

// export
class SPCard {

    //
    // STATIC (ES2022)
    //
    static list = [];   // SPカードリスト

    // private (ES2022)
    static #PATH_TO_SPCARD_JSON = "json/sp_card.json";

    // setter
    static set PATH_TO_SPCARD_JSON(path) {
        SPCard.#PATH_TO_SPCARD_JSON = path;
        SPCard.#fetchPromise = SPCard.#updateSPList();
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

    // Promise
    static #fetchPromise;

    // Class Static Block (ES2022)
    // * クラスが定義された時点で実行される
    static {
        SPCard.#fetchPromise = SPCard.#updateSPList();
    }

    // 
    // PUBLIC LOCAL
    // 
    initPromise;
    list = [];
    /**
     * NOTE:
     * this.list に新しいIDリストを与えることで
     * 各プレイヤーが利用可能なSPカードを指定できる
     */

    //
    // CONSTRUCTOR
    //
    constructor() {
        this.initPromise = new Promise((resolve) => {
            SPCard.#fetchPromise
                .then((res) => { this.init(); })
                .then((res) => { resolve(); });
        });
    }

    //
    // METHOD
    //

    /**
     * インスタンスのSPカードリストを初期化する
     */
    init() {
        // "name", 'type', 'description' がひとつでも欠けているカードは除く
        this.list = SPCard.list.filter((c) => c.name || c.type || c.description);
        return this;
    }

    /**
     * 利用可能なSPカードのIDリストを取得する
     * *[OPTION]:指定された type && attr を持つSPカードのIDリストを取得する
     * @param {Object} (optional) # {type:String , attr:String }
     * @returns {Array}
     */
    getIdList({ type, attr } = {}) {
        // 
        // type または attr が指定されていれば該当するカードに絞る
        // 
        if (type && attr) {
            return this.list
                .filter((c) => c.type == type && c.attr.includes(attr))
                .map((c) => c.id);
        }
        else if (type || attr) {
            return this.list
                .filter((c) => c.type == type || c.attr.includes(attr))
                .map((c) => c.id);
        }
        // Defailt
        return this.list.map(card => card.id);
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
            const idx = Math.floor(Math.random() * idList.length);
            return idList[idx];
        } else {
            // デフォルトでは this.list の中からIDをひとつ選ぶ
            const idArr = this.getIdList();
            const idx = Math.floor(Math.random() * idArr.length);
            return idArr[idx];
        }
    }
}

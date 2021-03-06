import Vue from "vue";
import predictions from "../data/predictions";
import languages from "../data/languages";

new Vue({
    el: "#app",
    data: {
        sellingRange: {
            "min": 90,
            "max": 110
        },
        form: { 
            "selling": 0, 
            "monAm": 0, 
            "monPm": 0, 
            "tueAm": 0, 
            "tuePm": 0, 
            "wedAm": 0, 
            "wedPm": 0, 
            "thuAm": 0, 
            "thuPm": 0, 
            "friAm": 0, 
            "friPm": 0, 
            "satAm": 0, 
            "satPm": 0
        },
        rows: predictions,
        alert: {
            "isEnable": false,
            "message": "",
            "label": ""
        },
        lang: "en"
    },
    computed: {
        formDayOfWeekList: function () {
            return [ 
                this.form.monAm,
                this.form.monPm, 
                this.form.tueAm, 
                this.form.tuePm, 
                this.form.wedAm, 
                this.form.wedPm, 
                this.form.thuAm, 
                this.form.thuPm, 
                this.form.friAm, 
                this.form.friPm, 
                this.form.satAm,
                this.form.satPm
            ];
        },
        filteredRows: function () {
            let currentStep = this.form.selling - this.sellingRange.min;
            let stepCount = this.sellingRange.max - this.sellingRange.min + 1;
            let values = this.formDayOfWeekList;
            return this.rows
                .map(row => {
                    return row.predictions
                        .map(pred => {
                            if (this.form.selling === 0 || 
                                this.form.selling === '0') {
                                return {
                                    "min": pred.lowMin,
                                    "max": pred.highMax
                                };
                            }

                            let minStepValue = (pred.highMin - pred.lowMin + 1) / stepCount;
                            let maxStepValue = (pred.highMax - pred.lowMax + 1) / stepCount;

                            return {
                                "min": pred.lowMin + Math.round(minStepValue * currentStep),
                                "max": pred.lowMax + Math.ceil(maxStepValue * currentStep)
                            };
                        });
                })
                .filter(row => {
                    for (let idx = 0; idx < row.length; idx++) {
                        if (!this.range(values[idx], row[idx])) {
                            return false;
                        }
                    }
                    return true;
                });
        },
        languageMap: function () {
            return Object.keys(languages)
                .map(lang => ({ "key": lang, "value": languages[lang].name }));
        }
    },
    methods: {
        save: function () {
            for (let key in this.form) {
                localStorage.setItem(key, this.form[key]);
            }
            this.showAlert("success", this.getMessage("MSG_SAVE_SUCCESSFULLY"));
        },
        init: function () {
            this.form = { 
                "selling": 0, 
                "monAm": 0, 
                "monPm": 0, 
                "tueAm": 0, 
                "tuePm": 0, 
                "wedAm": 0, 
                "wedPm": 0, 
                "thuAm": 0, 
                "thuPm": 0, 
                "friAm": 0, 
                "friPm": 0, 
                "satAm": 0, 
                "satPm": 0
            };
            localStorage.clear();
            this.showAlert("success", this.getMessage("MSG_INIT_SUCCESSFULLY"))
        },
        range: function (value, obj) {
            if (value === 0 || value === "0") {
                return true;
            }
            return obj.min <= value && value <= obj.max;
        },
        loadFormFromLocalStorage: function () {
            for (let key in this.form) {
                let value = localStorage.getItem(key);
                this.form[key] = value === null ? 0 : value;
            }
        },
        showAlert: function (label, message) {
            this.alert.label = `alert-${label}`;
            this.alert.message = message;
            this.alert.isEnable = true;
            
            let app = this;
            setTimeout(function () {
                app.alert.isEnable = false;
            }, 3000);
        },
        getMessage: function (key) {
            return this.lang in languages ? languages[this.lang][key] : languages["en"][key];
        },
        changeLanguage: function () {
            localStorage.setItem("lang", this.lang);
        },
        loadLanguageFromLocalStorage: function () {
            let lang = localStorage.getItem("lang");
            this.lang = lang ? lang : (navigator.language || navigator.userLanguage).substr(0, 2);
        }
    },
    created: function () {
        this.loadFormFromLocalStorage();
        this.loadLanguageFromLocalStorage();
    }
});

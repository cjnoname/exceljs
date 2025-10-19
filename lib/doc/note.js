"use strict";
var _ = require("../utils/under-dash");
var Note = /** @class */ (function () {
    function Note(note) {
        this.note = note;
    }
    Object.defineProperty(Note.prototype, "model", {
        get: function () {
            var value = null;
            switch (typeof this.note) {
                case 'string':
                    value = {
                        type: 'note',
                        note: {
                            texts: [
                                {
                                    text: this.note,
                                },
                            ],
                        },
                    };
                    break;
                default:
                    value = {
                        type: 'note',
                        note: this.note,
                    };
                    break;
            }
            // Suitable for all cell comments
            return _.deepMerge({}, Note.DEFAULT_CONFIGS, value);
        },
        set: function (value) {
            var note = value.note;
            var texts = note.texts;
            if (texts && texts.length === 1 && Object.keys(texts[0]).length === 1) {
                this.note = texts[0].text;
            }
            else {
                this.note = note;
            }
        },
        enumerable: false,
        configurable: true
    });
    Note.fromModel = function (model) {
        var note = new Note();
        note.model = model;
        return note;
    };
    Note.DEFAULT_CONFIGS = {
        note: {
            margins: {
                insetmode: 'auto',
                inset: [0.13, 0.13, 0.25, 0.25],
            },
            protection: {
                locked: 'True',
                lockText: 'True',
            },
            editAs: 'absolute',
        },
        type: 'note',
    };
    return Note;
}());
module.exports = Note;

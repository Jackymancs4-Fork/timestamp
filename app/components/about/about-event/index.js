/* global document, CustomEvent */

class AboutEvent extends CustomEvent { // eslint-disable-line
    constructor(type, options = {}) {
        const defaults = {
            // @see https://developer.mozilla.org/docs/Web/API/Event/bubbles
            bubbles: true,

            // @see https://developer.mozilla.org/docs/Web/API/Event/composed
            composed: true
        };

        super(`about.${type}`, Object.assign({}, defaults, options));
    }

    static on(type, listener) {
        document.addEventListener(`about.${type}`, listener);
    }
}

/* global document, Electron, customElements, BaseElement */

class AboutUpdate extends BaseElement {
    constructor() {
        super().fetchTemplate();

        this.addEventListener('click', () => this.onClick());

        // Received response from update checks
        Electron.ipcRenderer.on('app.update.check',
            (...args) => this.onUpdateChecked(...args)
        );
    }

    /**
     * The update button has been clicked.
     *
     * @return {AboutUpdate}
     */
    onClick() {
        // Checks are going on right now or we are up to date
        if (this.status === 'checking' || this.status === 'up-to-date') {
            return this;
        }

        // We already know there is an update available, clicking the button
        // will fire up the update process
        if (this.status === 'update-available') {
            Electron.ipcRenderer.send('app.update.run');

            return this;
        }

        // Set status to checking…
        this.status = 'checking';

        // Remember check coming from clicking this button
        this.clicked = true;

        // Check again for an update
        Electron.ipcRenderer.send('app.update.check');

        return this;
    }

    /**
     * Received response from checking for updates.
     *
     * @param {Event} e Original emitted event.
     * @param {object} update Update response.
     * @return {AboutUpdate}
     */
    onUpdateChecked(e, update) {
        // Show checking state at least for x seconds
        // but only if request came from clicking this button
        const delay = this.clicked === true ? 2 : 0;

        // Forget clicked state
        this.clicked = false;

        setTimeout(() => {
            if (update.code < 0) {
                const $label = this.shadowRoot.querySelector('[key="updateAvailable"]');

                this.status = 'update-available';
                this.classList.add('-success');

                // Using innerHTML because label is an i18n string
                // that could contain actual HTML elements
                $label.innerHTML = $label.originalString.replace(/%version%/, update.version);

                return;
            }

            // Either there was an error or we are up to date…
            this.status = 'up-to-date';
            this.classList.remove('-success');

            // Reset back to unknown after a x seconds
            setTimeout(() => (this.status = 'unknown'), 1000 * 5 * delay);
        }, 1000 * delay);

        return this;
    }

    /**
     * Returns the current update status.
     *
     * @return {string}
     */
    get status() {
        return this.getAttribute('status') || 'unknown';
    }

    /**
     * Sets the current update status.
     */
    set status(status) {
        this.setAttribute('status', status);
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
AboutUpdate.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('about-update', AboutUpdate);

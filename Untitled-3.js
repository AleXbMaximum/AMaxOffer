// ==UserScript==
// @name         AMaxOffer
// @version      3.0.2
// @description  AMaxOffer Offers and Account Management Tool for American Express Site
// @match        https://global.americanexpress.com/*
// @connect      uscardforum.com
// @updateURL    https://github.com/AleXbMaximum/AMaxOffer/raw/main/dist/AMaxOffer.user.js
// @downloadURL  https://github.com/AleXbMaximum/AMaxOffer/raw/main/dist/AMaxOffer.user.js
// @grant        GM.xmlHttpRequest
// @grant        GM.addElement
// @grant        GM.notification
// @grant        GM.openInTab
// @grant        GM.deleteValue
// @grant        GM.getValue
// @grant        GM.listValues
// @grant        GM.setValue
// @grant        GM_cookie
// @grant        unsafeWindow
// @resource materialIcons https://fonts.googleapis.com/icon?family=Material+Icons

// ==/UserScript==

// @license    CC BY-NC-ND 4.0

(function () {
    'use strict';

    const scriptVersion = "3.0";




    /**
     * Creates an element with provided configuration
     * @param {string} tag - HTML element tag
     * @param {Object} options - Configuration options
     * @returns {HTMLElement} - The created element
     */


    /**
     * Creates a button with consistent styling
     * @param {Object} config - Button configuration
     * @returns {HTMLButtonElement} - The created button
     */


    /**
     * Creates a badge with consistent styling
     * @param {Object} config - Badge configuration
     * @returns {HTMLDivElement} - The created badge
     */


    /**
     * Creates a card container with consistent styling
     * @param {Object} config - Card configuration
     * @returns {HTMLDivElement} - The created card
     */


    /**
     * Creates an empty state with consistent styling
     * @param {Object} options - Empty state configuration
     * @returns {HTMLDivElement} - The empty state container
     */
    function ui_createEmptyState(options = {}) {
        const {
            title = 'No Items Found',
            message = 'Try adjusting your search or filters',
            buttonText = 'Reset Filters',
            iconSvg = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>',
            callback = () => { }
        } = options;

        const container = ui_createElement('div', {
            styleString: 'display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px 20px; text-align:center; background-color:rgba(0,0,0,0.02); border-radius:16px; margin:20px 0;'
        });

        // Illustration
        const illustration = ui_createElement('div', {
            styleString: 'margin-bottom:24px; width:100px; height:100px; display:flex; align-items:center; justify-content:center;',
            props: {
                innerHTML: `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" stroke-width="1.5">${iconSvg}</svg>`
            }
        });

        // Message elements
        const titleElement = ui_createElement('div', {
            text: title,
            styleString: 'font-size:18px; font-weight:600; margin-bottom:12px; color:#1c1c1e;'
        });

        const subtitleElement = ui_createElement('div', {
            text: message,
            styleString: 'font-size:14px; color:var(--ios-gray); max-width:400px; margin:0 auto 24px;'
        });

        // Reset button
        const resetButton = ui_createButton({
            label: buttonText,
            type: 'primary',
            onClick: callback
        });

        // Assemble empty state
        container.appendChild(illustration);
        container.appendChild(titleElement);
        container.appendChild(subtitleElement);
        container.appendChild(resetButton);

        return container;
    }

    /**
     * Creates a filter bar with search and other controls
     * @param {Object} options - Filter bar configuration
     * @returns {HTMLDivElement} - The filter bar
     */


    /**
     * Creates a progress bar with consistent styling
     * @param {Object} options - Progress bar configuration
     * @returns {HTMLDivElement} - The progress bar wrapper
     */


    /**
     * Creates a toggle switch with consistent styling
     * @param {Object} options - Toggle switch configuration
     * @returns {HTMLDivElement} - The toggle switch container
     */


    /**
     * Utility function to debounce input events
     * @param {Function} func - Function to debounce
     * @param {number} wait - Delay in milliseconds
     * @returns {Function} - Debounced function
     */


    /**
     * Utility function to darken a color
     * @param {string} color - Color to darken
     * @returns {string} - Darkened color
     */


    // =========================================================================
    // Section 2: Global State Variables
    // =========================================================================

    //  1) PRIMARY DATA & TRACKERS
    let glb_account = [];
    let glb_offer = [];
    let glb_offer_expired = [];
    let glb_offer_redeemed = [];
    let glb_benefit = [];
    let glb_balance = {};
    let glb_priorityCards = [];
    let glb_excludedCards = [];

    //  2) VIEW / UI STATES
    let glb_view_page = "members";  // Possible: "summary", "members", "offers", "benefits"
    let glb_view_mini = true;       // Whether the main container is collapsed
    const glb_view_scroll = {
        members: { scrollTop: 0 },
        offers: { scrollTop: 0 },
        benefits: { scrollTop: 0 },
    };
    let glb_memberSortState = { key: "", direction: 1 };
    let glb_offerSortState = { key: "", direction: 1 };

    //  3) FILTER STATES
    const glb_filters = {
        memberStatus: "Active", // "all", "Active", "Canceled"
        memberCardtype: "all",  // "all", "BASIC", "SUPP"
        offerFav: false,        // Hide non-favorite offers
        offerMerchantSearch: "",
        memberMerchantSearch: "",
        offerCardEnding: "",
    };

    //  5) MISCELLANEOUS 
    let lastUpdate = "";        // Last time data was fetched
    let runInBatchesLimit = 100; // Concurrency limit when enrolling in batches
    let storage_accToken = "";       // Suffix for the token to avoid conflicts
    let btnRefresh, refreshStatusEl;

    let content, viewBtns, toggleBtn, container, btnMembers, btnOffers, btnBenefits;

    // =========================================================================
    // Section 3: UI Elements Creation
    // =========================================================================

    // Build the UI container with a custom font, header with title and navigation buttons, and a content area.


    // Helper to create a button with default styling and hover effects.


    // Make an element draggable by tracking mouse movement.



    // =========================================================================
    // Section 4: General Helper Functions
    // =========================================================================

    const util_antiKickOff = (() => {
        // Instead of overriding prototype methods, create a wrapper for the element
        const managedElements = new Map();

        const manage = (element) => {
            if (managedElements.has(element)) return managedElements.get(element);

            const listeners = [];
            const originalAdd = element.addEventListener.bind(element);
            const originalRemove = element.removeEventListener.bind(element);

            const wrapper = {
                addListener: (type, listener, options) => {
                    listeners.push({ type, listener, options });
                    return originalAdd(type, listener, options);
                },
                removeListener: (type, listener, options) => {
                    const index = listeners.findIndex(l =>
                        l.type === type && l.listener === listener && l.options === options);
                    if (index !== -1) listeners.splice(index, 1);
                    return originalRemove(type, listener, options);
                },
                getListeners: (typeFilter) => typeFilter ?
                    listeners.filter(l => l.type === typeFilter) : [...listeners]
            };

            managedElements.set(element, wrapper);
            return wrapper;
        };
        // Private registry to track event listeners.
        const registry = new WeakMap();

        // Preserve original methods.
        const origAddEventListener = EventTarget.prototype.addEventListener;
        const origRemoveEventListener = EventTarget.prototype.removeEventListener;

        // Override addEventListener to store registrations.
        EventTarget.prototype.addEventListener = function (type, listener, options) {
            if (!registry.has(this)) {
                registry.set(this, []);
            }
            registry.get(this).push({ type, listener, options });
            return origAddEventListener.call(this, type, listener, options);
        };

        // Override removeEventListener to update our registry.
        EventTarget.prototype.removeEventListener = function (type, listener, options) {
            if (registry.has(this)) {
                const arr = registry.get(this);
                for (let i = 0; i < arr.length; i++) {
                    const item = arr[i];
                    if (item.type === type && item.listener === listener && item.options === options) {
                        arr.splice(i, 1);
                        break;
                    }
                }
            }
            return origRemoveEventListener.call(this, type, listener, options);
        };

        // Helper to retrieve tracked event listeners.
        const getTrackedEventListeners = (target, typeFilter) => {
            const arr = registry.get(target) || [];
            return typeFilter ? arr.filter(item => item.type === typeFilter) : arr;
        };

        // Remove all "visibilitychange" listeners from the document.
        const removeVisibilityListeners = () => {
            const visListeners = getTrackedEventListeners(document, 'visibilitychange');
            visListeners.forEach(({ listener, options }) => {
                document.removeEventListener('visibilitychange', listener, options);
            });
            console.log("Removed all 'visibilitychange' listeners from document using our tracker.");
        };

        // Function to extend the session by calling window.timeout.checkVisibility.
        const extendSession = () => {

            const realWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
            if (realWindow.timeout && typeof realWindow.timeout.checkVisibility === 'function') {
                console.log("Extending session....");
                realWindow.timeout.checkVisibility({ hidden: true });
            }
        };


        // Public API.
        return {
            getTrackedEventListeners,
            removeVisibilityListeners,
            startSessionExtender: (interval = 60000) => setInterval(extendSession, interval)
        };
    })();

    util_antiKickOff.removeVisibilityListeners();
    util_antiKickOff.startSessionExtender(60000);


    function util_formatDate(dateStr, roundUp = false) {
        let d = new Date(dateStr);
        if (roundUp && !isNaN(d)) {
            d.setDate(d.getDate() + 1);
        }
        if (isNaN(d)) return 'N/A';
        let mm = String(d.getMonth() + 1).padStart(2, '0');
        let dd = String(d.getDate()).padStart(2, '0');
        let yy = String(d.getFullYear()).slice(-2);
        return `${mm}-${dd}-${yy}`;
    }


    function util_cleanValue(val) {
        if (val === "N/A" || val === null || val === undefined || val === "" || val === 0) {
            return "0";
        }
        return val;
    }


    // Parse card index into main and sub-index components
    function util_parseCardIndex(indexStr) {
        if (!indexStr) return [0, 0];
        const parts = indexStr.split('-');
        const main = parseInt(parts[0], 10) || 0;
        const sub = parts.length > 1 ? (parseInt(parts[1], 10) || 0) : 0;
        return [main, sub];
    }


    // Parse a numeric value from a string, cleaning common symbols
    function util_parseNumber(str) {
        if (!str) return NaN;
        const cleaned = str.replace(/[$,%]/g, '').replace(/\s*back\s*/i, '').trim();
        return parseFloat(cleaned) || NaN;
    }


    // Run tasks in batches to control concurrency
    async function util_runTasksInBatches(tasks, limit) {
        const results = [];
        let i = 0;
        while (i < tasks.length) {
            const chunk = tasks.slice(i, i + limit);
            // Each "task" returns a single object: { offerId, accountToken, result: boolean }
            const chunkResults = await Promise.all(chunk.map(fn => fn()));
            results.push(...chunkResults);
            i += limit;
        }
        return results;
    }


    // =========================================================================
    // Section 5: Data Fetching Functions
    // =========================================================================

    // Implementations of API functions...
    // (rest of the existing code follows)

    // ...

    // =========================================================================
    // Section 9: Initialization Functions
    // =========================================================================

    async function auth_init() {
        const tl = await api_verifyTrustLevel();
        if (tl === null || tl < 4) {
            return 0;
        }
        // Use ISO 8601 format with leading zeros
        const expirationDate = new Date("2025-03-10T00:00:00Z");

        if (new Date() >= expirationDate) {
            console.error("Code expired on " + expirationDate.toLocaleString());
            return 0;
        }
        return 1;
    }

    // Update the init function to initialize the arrays
    async function init() {
        const auth = await auth_init();
        if (!auth) { alert("Authorization failed."); return; }

        const ui = ui_createMain();
        ({ container, content, viewBtns, toggleBtn, btnMembers, btnOffers, btnBenefits } = ui);

        // Initialize tracking arrays
        glb_offer_expired = [];
        glb_offer_redeemed = [];

        const fetchStatus = await api_fetchAccounts(1);
        if (!fetchStatus || glb_account.length === 0) { alert("Unable to refresh."); return; }

        const localDataStatus = storage_manageData("load", storage_accToken);
        if (localDataStatus === 0 || localDataStatus === 2) {
            await api_refreshOffersList();
            await api_fetchAllBalances();
            await api_fetchAllBenefits();

            lastUpdate = new Date().toLocaleString();
            storage_manageData("set", storage_accToken, ["lastUpdate", "scriptVersion"]);
            await ui_renderCurrentView();
        } else {
            console.log("Using data from LocalStorage.");
            await api_fetchAllBalances();
        }

        btnMembers.classList.add('active');

        ui_renderCurrentView();
    }

    init();
})();
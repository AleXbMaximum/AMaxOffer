// ==UserScript==
// @name         AMaxOffer
// @version      3.0.2
// @description  AMaxOffer Offers and Account Management Tool for American Express Site
// @match        https://global.americanexpress.com/*
// @connect      uscardforum.com
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// @resource materialIcons https://fonts.googleapis.com/icon?family=Material+Icons

// ==/UserScript==

// @license    CC BY-NC-ND 4.0

(function () {
    'use strict';

    const scriptVersion = "3.0";

    // =========================================================================
    // Section 1: Utility Functions & Obfuscated URL Constants
    // =========================================================================

    const API_member = "https://global.americanexpress.com/api/servicing/v1/member";
    const API_Enroll = "https://functions.americanexpress.com/CreateCardAccountOfferEnrollment.v1";
    const API_offer = "https://functions.americanexpress.com/ReadCardAccountOffersList.v1";
    const API_USCF1 = "https://www.uscardforum.com/session/current.json";
    const API_USCF2 = "https://www.uscardforum.com/u/";
    const API_balance = "https://global.americanexpress.com/api/servicing/v1/financials/balances?extended_details=deferred,non_deferred,pay_in_full,pay_over_time,early_pay";
    const API_balancePending = "https://global.americanexpress.com/api/servicing/v1/financials/transaction_summary?status=pending";
    const API_benefit = "https://functions.americanexpress.com/ReadBestLoyaltyBenefitsTrackers.v1";

    // =========================================================================
    // Section 2: Global State Variables
    // =========================================================================

    //  1) PRIMARY DATA & TRACKERS
    let glb_account = [];
    let glb_offer = [];
    let glb_benefit = [];
    let glb_balance = {};
    let glb_priorityCards = [];
    let glb_excludedCards = [];

    //  2) VIEW / UI STATES
    let glb_view_page = "summary";  // Possible: "summary", "members", "offers", "benefits"
    let glb_view_mini = true;       // Whether the main container is collapsed
    const glb_view_scroll = {
        summary: { scrollTop: 0 },
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


    let content, viewBtns, toggleBtn, container, btnSummary, btnMembers, btnOffers, btnBenefits;

    // =========================================================================
    // Section 3: UI Elements Creation
    // =========================================================================

    function createEl(tag, { text = '', className = '', styles = {}, props = {}, children = [] } = {}) {
        const el = document.createElement(tag);
        if (text) el.textContent = text;
        if (className) el.className = className;
        Object.assign(el.style, styles);
        Object.entries(props).forEach(([key, value]) => el[key] = value);
        children.forEach(child => el.appendChild(child));
        return el;
    }

    // Helper to create a button with default styling and hover effects.
    function createButton(label, onClick, { styles = {} } = {}) {
        const defaultStyles = {
            cursor: 'pointer',
            fontSize: '18px',
            padding: '8px 20px',
            border: 'none',
            background: 'transparent',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            color: '#2c3e50',
            fontWeight: '500'
        };
        const btn = createEl('button', {
            text: label,
            styles: { ...defaultStyles, ...styles }
        });
        btn.addEventListener('click', onClick);
        btn.addEventListener('mouseover', () => {
            btn.style.transform = 'scale(1.05)';
            btn.style.backgroundColor = '#f0f0f0';
        });
        btn.addEventListener('mouseout', () => {
            btn.style.transform = 'none';
            btn.style.backgroundColor = 'transparent';
        });
        return btn;
    }

    // Build the UI container with a custom font, header with title and navigation buttons, and a content area.
    function buildUI() {
        // Insert a style element to load the custom font and apply it to the overlay.
        const fontStyle = createEl('style', {
            text: `
            @font-face {
                font-family: 'AmexFont';
                src: url("https://www.aexp-static.com/cdaas/one/statics/@americanexpress/static-assets/2.31.2/package/dist/iconfont/dls-icons.woff?v=2.31.2") format('woff');
                font-weight: normal;
                font-style: normal;
            }
            #card-utility-overlay {
                font-family: 'AmexFont', 'Segoe UI', system-ui, sans-serif;
            }
            `});
        document.head.appendChild(fontStyle);

        // Create the main container with background, border, and transition properties.
        const container = createEl('div', {
            props: { id: 'card-utility-overlay' },
            styles: {
                position: 'fixed',
                top: '5%',
                left: '5%',
                background: 'url("https://www.aexp-static.com/cdaas/one/statics/@americanexpress/static-assets/2.28.0/package/dist/img/brand/worldservice-tile-gray.svg") repeat, #fefefe',
                borderRadius: '12px',
                zIndex: '10000',
                fontFamily: "'AmexFont', 'Segoe UI', system-ui, sans-serif",
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.42)',
                maxHeight: '90vh',
                overflow: 'hidden',
                width: '90%',
                maxWidth: '1400px',
                border: '1px solid rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease'
            }
        });

        // Title element
        const title = createEl('span', {
            text: 'AMaxOffer',
            styles: {
                fontSize: '1.4rem',
                fontWeight: '600',
                background: 'linear-gradient(45deg, #4CAF50, #2196F3)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                letterSpacing: '-0.5px'
            }
        });

        // Navigation buttons for different views.
        const btnSummary = createButton('Summary', () => switchView('summary', btnSummary));
        const btnMembers = createButton('Members', () => switchView('members', btnMembers));
        const btnOffers = createButton('Offers', () => switchView('offers', btnOffers));
        const btnBenefits = createButton('Benefits', () => switchView('benefits', btnBenefits));

        const viewBtns = createEl('div', {
            styles: {
                display: 'flex',
                gap: '12px',
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '4px'
            },
            children: [btnSummary, btnMembers, btnOffers, btnBenefits]
        });

        // Toggle button for minimizing/expanding the container.
        const toggleBtn = createButton('➕', toggleMinimize, {
            styles: {
                fontSize: '1.2rem',
                border: '1px dashed #ccc',
                borderRadius: '6px',
                width: '50px',
                height: '50px',
                display: 'inline-flex',
                justifyContent: 'center',
                alignItems: 'center'
            }
        });
        toggleBtn.addEventListener('mouseover', () => toggleBtn.style.backgroundColor = '#f0f0f0');
        toggleBtn.addEventListener('mouseout', () => toggleBtn.style.backgroundColor = 'transparent');

        // Header containing the title, navigation buttons, and toggle button.
        const header = createEl('div', {
            props: { id: 'card-utility-header' },
            styles: {
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid rgba(0,0,0,0.08)',
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'grab',
                userSelect: 'none'
            },
            children: [title, viewBtns, toggleBtn]
        });

        // Main content area.
        const content = createEl('div', {
            props: { id: 'card-utility-content' },
            styles: {
                padding: '20px',
                overflowY: 'auto',
                maxHeight: 'calc(80vh - 64px)'
            },
            text: 'Loading...'
        });

        container.append(header, content);
        document.body.appendChild(container);

        // Initial UI state: minimized container with hidden content and buttons.
        content.style.display = 'none';
        viewBtns.style.display = 'none';
        container.style.width = '200px';
        container.style.height = '75px';
        toggleBtn.textContent = '➕';

        // Make the header draggable.
        makeDraggable(header, container);

        return { container, content, viewBtns, toggleBtn, btnSummary, btnMembers, btnOffers, btnBenefits };
    }

    // Make an element draggable by listening to mousedown and tracking mouse movement.
    function makeDraggable(handle, container) {
        let shiftX = 0, shiftY = 0;
        let latestX = 0, latestY = 0;
        let animationFrameId = null;

        function updatePosition() {
            container.style.left = `${latestX - shiftX}px`;
            container.style.top = `${latestY - shiftY}px`;
            animationFrameId = null;
        }

        function onMouseMove(e) {
            latestX = e.clientX;
            latestY = e.clientY;
            if (!animationFrameId) {
                animationFrameId = requestAnimationFrame(updatePosition);
            }
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        }

        handle.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Prevent text selection and other default actions.
            const rect = container.getBoundingClientRect();
            shiftX = e.clientX - rect.left;
            shiftY = e.clientY - rect.top;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }


    // Toggle the minimized/expanded state of the UI container.
    function toggleMinimize() {
        glb_view_mini = !glb_view_mini;
        content.style.display = glb_view_mini ? 'none' : 'block';
        viewBtns.style.display = glb_view_mini ? 'none' : 'flex';
        toggleBtn.textContent = glb_view_mini ? '➕' : '➖';
        container.style.width = glb_view_mini ? '200px' : '90%';
        container.style.height = glb_view_mini ? '75px' : 'auto';
        container.style.transform = glb_view_mini ? 'scale(0.98)' : 'none';
        container.style.boxShadow = glb_view_mini
            ? '0 12px 18px rgba(0,0,0,0.20)'
            : '0 12px 32px rgba(0,0,0,0.30)';

        if (!glb_view_mini) {
            container.addEventListener('transitionend', function onTransitionEnd(e) {
                if (e.propertyName === 'height') {
                    renderPage();
                    container.removeEventListener('transitionend', onTransitionEnd);
                }
            });
        }
    }

    // Switch between views, update button styles, and trigger re-rendering.
    function switchView(view, activeBtn) {
        saveCurrentScrollState();
        glb_view_page = view;
        [btnSummary, btnMembers, btnOffers, btnBenefits].forEach(btn => {
            btn.style.backgroundColor = (btn === activeBtn) ? '#4CAF50' : 'transparent';
            btn.style.color = (btn === activeBtn) ? 'black' : '#2c3e50';
            btn.style.fontWeight = (btn === activeBtn) ? '800' : '500';
        });
        renderPage();
    }

    // Save the current scroll position for the active view.
    function saveCurrentScrollState() {
        if (content) {
            glb_view_scroll[glb_view_page].scrollTop = content.scrollTop;
        }
    }


    // =========================================================================
    // Section 4: General Helper Functions
    // =========================================================================

    // Save the current scroll position for the active view
    function saveCurrentScrollState() {
        if (content) {
            glb_view_scroll[glb_view_page].scrollTop = content.scrollTop;
        }
    }


    // Debounce utility for limiting rapid function calls
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }


    function formatDate(dateStr, roundUp = false) {
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


    function sanitizeValue(val) {
        return (val === "N/A" || val === null || val === undefined) ? "0" : val;
    }


    // Parse card index into main and sub-index components
    function parseCardIndex(indexStr) {
        if (!indexStr) return [0, 0];
        const parts = indexStr.split('-');
        const main = parseInt(parts[0], 10) || 0;
        const sub = parts.length > 1 ? (parseInt(parts[1], 10) || 0) : 0;
        return [main, sub];
    }



    // Parse a numeric value from a string, cleaning common symbols
    function parseNumericValue(str) {
        if (!str) return NaN;
        const cleaned = str.replace(/[$,%]/g, '').replace(/\s*back\s*/i, '').trim();
        return parseFloat(cleaned) || NaN;
    }


    // Run tasks in batches to control concurrency
    async function runInBatches(tasks, limit) {
        const results = [];
        let i = 0;
        while (i < tasks.length) {
            const chunk = tasks.slice(i, i + limit);
            // Each “task” returns a single object: { offerId, accountToken, result: boolean }
            const chunkResults = await Promise.all(chunk.map(fn => fn()));
            results.push(...chunkResults);
            i += limit;
        }
        return results;
    }


    // Utility to get the basic account ending for a supplementary account
    function getBasicAccountEndingForSuppAccount(suppAccount) {
        const parts = suppAccount.cardIndex.split('-');
        if (parts.length > 1) {
            const mainIndex = parts[0];
            // Find the basic account whose cardIndex equals mainIndex and has relationship "BASIC"
            const basicAccount = glb_account.find(acc => acc.cardIndex === mainIndex && acc.relationship === "BASIC");
            if (basicAccount) {
                return basicAccount.display_account_number;
            }
        }
        return "N/A";
    }


    // Utility to sort the account data based on a key
    function sort_memberTab(key) {
        if (glb_memberSortState.key === key) {
            glb_memberSortState.direction *= -1;
        } else {
            glb_memberSortState.key = key;
            glb_memberSortState.direction = 1;
        }
        if (key === 'cardIndex') {
            glb_account.sort((a, b) => {
                const [aMain, aSub] = parseCardIndex(a.cardIndex);
                const [bMain, bSub] = parseCardIndex(b.cardIndex);
                if (aMain === bMain) {
                    return glb_memberSortState.direction * (aSub - bSub);
                }
                return glb_memberSortState.direction * (aMain - bMain);
            });
        } else {
            glb_account.sort((a, b) => {
                const valA = a[key] || "";
                const valB = b[key] || "";
                return glb_memberSortState.direction * valA.toString().localeCompare(valB.toString());
            });
        }
        saveCurrentScrollState();
        const container = document.getElementById('members-table-container');
        if (container) {
            container.innerHTML = "";
            container.appendChild(renderMembers_table());
        }
    }


    // Utility to sort the offer data based on a key
    function sort_offerTab(key) {
        if (glb_offerSortState.key === key) {
            glb_offerSortState.direction *= -1;
        } else {
            glb_offerSortState.key = key;
            glb_offerSortState.direction = (key === "favorite") ? -1 : 1;
        }
        glb_offer.sort((a, b) => {
            if (key === "favorite") {
                if (a.favorite === b.favorite) return 0;
                return a.favorite ? -1 : 1;
            }
            const numericColumns = ["reward", "threshold", "percentage"];
            const valA = a[key] || "";
            const valB = b[key] || "";
            if (numericColumns.includes(key)) {
                const numA = parseNumericValue(valA);
                const numB = parseNumericValue(valB);
                if (isNaN(numA) && isNaN(numB)) {
                    return glb_offerSortState.direction * valA.localeCompare(valB);
                } else if (isNaN(numA)) {
                    return 1 * glb_offerSortState.direction;
                } else if (isNaN(numB)) {
                    return -1 * glb_offerSortState.direction;
                }
                return glb_offerSortState.direction * (numA - numB);
            } else if (key === "eligibleCards" || key === "enrolledCards") {
                const lenA = Array.isArray(valA) ? valA.length : 0;
                const lenB = Array.isArray(valB) ? valB.length : 0;
                return glb_offerSortState.direction * (lenA - lenB);
            } else {
                return glb_offerSortState.direction * valA.toString().localeCompare(valB.toString());
            }
        });
        saveCurrentScrollState();

        const container = document.getElementById('offers-table-container');
        if (container) {
            container.innerHTML = "";
            container.appendChild(renderOffers_table());
        }
    }


    // Utility to parse offer details from the description
    function parseOfferDetails(description = "") {
        const parseDollar = (str) => parseFloat(str.replace(/[,\$]/g, ""));
        const toMoneyString = (num) => {
            if (num == null || isNaN(num)) return null;
            return `$${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        };

        let thresholdVal = null;
        let rewardVal = null;
        let percentageVal = null;
        let threshold = null;
        let reward = null;
        let percentage = null;
        let times = null;
        let total = null;

        {
            const spendRegex = /Spend\s*\$(\d[\d,\.]*)/i;
            const spendMatch = description.match(spendRegex);
            if (spendMatch) {
                thresholdVal = parseDollar(spendMatch[1]);
            }
        }
        {
            const percentRegex = /(?:Earn|Get)\s+(\d+(\.\d+)?)%\s*back/i;
            const percentMatch = description.match(percentRegex);
            if (percentMatch) {
                percentageVal = parseFloat(percentMatch[1]);
            }
        }
        {
            const mrPointsPerDollarRegex = /Earn\s*\+?(\d+)\s*Membership Rewards(?:®)?\s*points?\s*per\s*(?:eligible\s*)?dollar spent/i;
            const mrPointsPerDollarMatch = description.match(mrPointsPerDollarRegex);
            if (mrPointsPerDollarMatch) {
                const mrPointsEachDollar = parseFloat(mrPointsPerDollarMatch[1]);
                if (!percentageVal) {
                    percentageVal = mrPointsEachDollar;
                }
                const mrPointsCapRegex = /up to\s*(\d[\d,\.]*)\s*(points|pts)/i;
                const mrPointsCapMatch = description.match(mrPointsCapRegex);
                if (mrPointsCapMatch) {
                    const capVal = parseDollar(mrPointsCapMatch[1]);
                    rewardVal = capVal * 0.01;
                }
            }
        }
        {
            const earnGetRegex = /(?:earn|get)\s*\$(\d[\d,\.]*)/i;
            const earnGetMatch = description.match(earnGetRegex);
            if (earnGetMatch) {
                rewardVal = parseDollar(earnGetMatch[1]);
            }
            const upToTotalRegex = /up to (?:a total of )?\$(\d[\d,\.]*)/i;
            const upToTotalMatch = description.match(upToTotalRegex);
            if (upToTotalMatch) {
                rewardVal = parseDollar(upToTotalMatch[1]);
            }
        }
        {
            const mrPointsRewardRegex = /Earn\s+([\d,]+)\s*Membership Rewards(?:®)?\s*points(?!\s*per)/i;
            const mrPointsRewardMatch = description.match(mrPointsRewardRegex);
            if (mrPointsRewardMatch) {
                const points = parseInt(mrPointsRewardMatch[1].replace(/,/g, ""), 10);
                rewardVal = points * 0.01;
            }
        }
        {
            const upToTimesRegex = /up to\s+(\d+)\s+times?/i;
            const upToTimesMatch = description.match(upToTimesRegex);
            if (upToTimesMatch) {
                times = upToTimesMatch[1];
            }
        }
        {
            const totalOfRegex = /\(total of\s*\$(\d[\d,\.]*)\)/i;
            const totalOfMatch = description.match(totalOfRegex);
            if (totalOfMatch) {
                total = toMoneyString(parseDollar(totalOfMatch[1]));
            }
        }
        const haveThreshold = (thresholdVal != null && !isNaN(thresholdVal));
        const haveReward = (rewardVal != null && !isNaN(rewardVal));
        const havePercent = (percentageVal != null && !isNaN(percentageVal));

        if (haveThreshold && haveReward && !havePercent && thresholdVal > 0) {
            percentageVal = (rewardVal / thresholdVal) * 100;
        } else if (haveThreshold && havePercent && !haveReward) {
            rewardVal = thresholdVal * (percentageVal / 100);
        } else if (haveReward && havePercent && !haveThreshold && percentageVal !== 0) {
            thresholdVal = rewardVal / (percentageVal / 100);
        } else if (havePercent && !haveThreshold && !haveReward) {
            thresholdVal = 10000;
            rewardVal = thresholdVal * (percentageVal / 100);
        }
        if (thresholdVal != null) threshold = toMoneyString(thresholdVal);
        if (rewardVal != null) reward = toMoneyString(rewardVal);
        if (percentageVal != null) {
            const rounded = Math.round(percentageVal * 10) / 10;
            percentage = `${rounded}%`;
        }
        return { threshold, reward, percentage, times, total };
    }


    // Merge the old favorites with the new offer data
    function mergeFavorites(newOfferMap) {
        const oldFavorites = {};
        if (glb_offer && Array.isArray(glb_offer)) {
            glb_offer.forEach(o => {
                if (o.source_id) {
                    oldFavorites[o.source_id] = o.favorite === true;
                }
            });
        }
        for (const sid in newOfferMap) {
            if (oldFavorites.hasOwnProperty(sid)) {
                newOfferMap[sid].favorite = oldFavorites[sid];
            }
        }
    }


    // =========================================================================
    // Section 5: Data Fetching Functions
    // =========================================================================

    async function get_accounts(readonly = false) {
        try {
            const res = await fetch(API_member, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) {
                console.error('Failed to fetch account data (status not OK)');
                return false;
            }
            const data = await res.json();
            if (!data || !Array.isArray(data.accounts)) {
                throw new Error('Invalid account data received');
            }
            glb_account = [];
            let mainCounter = 1;
            data.accounts.forEach(item => {
                const mainAccount = {
                    display_account_number: item.account?.display_account_number || 'N/A',
                    relationship: item.account?.relationship || 'N/A',
                    supplementary_index: item.account?.supplementary_index || 'N/A',
                    account_status: Array.isArray(item.status?.account_status) ? item.status.account_status[0] : (item.status?.account_status || 'N/A'),
                    days_past_due: (item.status?.days_past_due !== undefined) ? item.status.days_past_due : 'N/A',
                    account_setup_date: item.status?.account_setup_date || 'N/A',
                    description: item.product?.description || 'N/A',
                    small_card_art: item.product?.small_card_art || 'N/A',
                    embossed_name: item.profile?.embossed_name || 'N/A',
                    account_token: item.account_token || 'N/A',
                    cardIndex: mainCounter.toString(),
                    eligibleOffers: 0,
                    enrolledOffers: 0
                };
                glb_account.push(mainAccount);
                if (Array.isArray(item.supplementary_accounts)) {
                    item.supplementary_accounts.forEach(supp => {
                        const suppIndex = supp.account?.supplementary_index ? parseInt(supp.account.supplementary_index, 10) : 'N/A';
                        const suppAccount = {
                            display_account_number: supp.account?.display_account_number || 'N/A',
                            relationship: supp.account?.relationship || 'N/A',
                            supplementary_index: supp.account?.supplementary_index || 'N/A',
                            account_status: Array.isArray(supp.status?.account_status) ? supp.status.account_status[0] : (supp.status?.account_status || 'N/A'),
                            days_past_due: (supp.status?.days_past_due !== undefined) ? supp.status.days_past_due : 'N/A',
                            account_setup_date: supp.status?.account_setup_date || 'N/A',
                            description: supp.product?.description || 'N/A',
                            small_card_art: supp.product?.small_card_art || 'N/A',
                            embossed_name: supp.profile?.embossed_name || 'N/A',
                            account_token: supp.account_token || 'N/A',
                            cardIndex: `${mainCounter}-${suppIndex}`,
                            eligibleOffers: 0,
                            enrolledOffers: 0
                        };
                        glb_account.push(suppAccount);
                    });
                }
                mainCounter++;
            });
        } catch (error) {
            console.error('Error fetching account data:', error);
            content.innerHTML = `<p style="color: red;">Error fetching account data: ${error.message}</p>`;
            return false;
        }

        if (Array.isArray(glb_account) && glb_account.length > 0) {
            storage_accToken = glb_account[0].account_token;
            if (!readonly) {
                localStorageHandler("set", storage_accToken, ["account"]);
            }
            return true;
        }
    }


    async function fetchRequest_offer(accountToken) {
        const payload = {
            accountNumberProxy: accountToken,
            locale: "en-US",
            offerRequestType: "LIST",
            source: "STANDARD",
            status: ["ELIGIBLE", "ENROLLED"],
            typeOf: "MERCHANT",
            userOffset: "-06:00"
        };
        try {
            const res = await fetch(API_offer, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': 'https://global.americanexpress.com'
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(`Offers fetch error: ${res.status}`);
            const json = await res.json();
            return json.offers || [];
        } catch (error) {
            console.error(`Error fetching offers for token ${accountToken}:`, error);
            return [];
        }
    }


    async function get_offers() {
        const offerInfoTable = {};
        const activeAccounts = glb_account.filter(acc =>
            acc.account_status && acc.account_status.trim().toLowerCase() === "active"
        );
        const skipPatterns = [
            "Your FICO&#174",
            "The Hotel Collection",
            "3X on Amex Travel",
            "Flexible Business Credit",
            "Apple Pay",
            "Send Money to Friends",
            "Considering a Big Purchase"
        ];
        await Promise.all(activeAccounts.map(async (acc) => {
            const offers = await fetchRequest_offer(acc.account_token);
            offers.forEach(offer => {
                const sourceId = offer.source_id;
                if (!sourceId) return;
                const offerName = (offer.name || "").toLowerCase();
                if (skipPatterns.some(pattern => offerName.includes(pattern.toLowerCase()))) {
                    return;
                }
                if (!offerInfoTable[sourceId]) {
                    const details = parseOfferDetails(offer.short_description || "");
                    offerInfoTable[sourceId] = {
                        source_id: sourceId,
                        offerId: offer.id || "N/A",
                        name: offer.name || "N/A",
                        achievement_type: offer.achievement_type || "N/A",
                        category: offer.category || "N/A",
                        expiry_date: offer.expiry_date || "N/A",
                        logo: offer.logo_url || "N/A",
                        redemption_types: offer.redemption_types ? offer.redemption_types.join(', ') : "N/A",
                        short_description: offer.short_description || "N/A",
                        threshold: details.threshold,
                        reward: details.reward,
                        percentage: details.percentage,
                        eligibleCards: [],
                        enrolledCards: [],
                        favorite: false
                    };
                }
                if (offer.status === "ELIGIBLE") {
                    if (!offerInfoTable[sourceId].eligibleCards.includes(acc.display_account_number)) {
                        offerInfoTable[sourceId].eligibleCards.push(acc.display_account_number);
                    }
                } else if (offer.status === "ENROLLED") {
                    if (!offerInfoTable[sourceId].enrolledCards.includes(acc.display_account_number)) {
                        offerInfoTable[sourceId].enrolledCards.push(acc.display_account_number);
                    }
                }
            });
        }));
        mergeFavorites(offerInfoTable);
        glb_account.forEach(acc => {
            acc.eligibleOffers = 0;
            acc.enrolledOffers = 0;
        });
        Object.values(offerInfoTable).forEach(offer => {
            if (Array.isArray(offer.eligibleCards)) {
                offer.eligibleCards.forEach(card => {
                    const acc = glb_account.find(a => a.display_account_number === card);
                    if (acc) acc.eligibleOffers = (acc.eligibleOffers || 0) + 1;
                });
            }
            if (Array.isArray(offer.enrolledCards)) {
                offer.enrolledCards.forEach(card => {
                    const acc = glb_account.find(a => a.display_account_number === card);
                    if (acc) acc.enrolledOffers = (acc.enrolledOffers || 0) + 1;
                });
            }
        });

        // Refresh the offer data and re-render the UI.
        if (offerInfoTable && typeof offerInfoTable === 'object') {
            glb_offer = Object.values(offerInfoTable);
            localStorageHandler("set", storage_accToken, ["offer"]);
        }
    }


    async function fetchRequest_balance(accountToken) {
        if (!accountToken) {
            console.error("Account token is required");
            return null;
        }
        try {
            const balancesUrl = API_balance;
            const pTransactionUrl = API_balancePending;

            const [balancesResponse, pTransactionResponse] = await Promise.all([
                fetch(balancesUrl, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'account_tokens': accountToken
                    }
                }),
                fetch(pTransactionUrl, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'account_tokens': accountToken
                    }
                })
            ]);

            if (!balancesResponse.ok) { console.error("Failed to fetch balances, status:", balancesResponse.status); return null; }
            if (!pTransactionResponse.ok) { console.error("Failed to fetch pending transaction summary, status:", pTransactionResponse.status); return null; }

            const balanceData = await balancesResponse.json();
            const pTransactionData = await pTransactionResponse.json();

            let balanceInfo = {};
            if (Array.isArray(balanceData) && balanceData.length > 0) {
                balanceInfo = {
                    statement_balance_amount: balanceData[0].statement_balance_amount,
                    remaining_statement_balance_amount: balanceData[0].remaining_statement_balance_amount
                };
            } else { console.error("Unexpected data format for balances:", balanceData); }

            let pTransactionInfo = {};
            if (Array.isArray(pTransactionData) && pTransactionData.length > 0) {
                pTransactionInfo = {
                    debits_credits_payments_total_amount: pTransactionData[0].total?.debits_credits_payments_total_amount
                };
            } else { console.error("Unexpected data format for pending transaction  summary:", pTransactionData); }

            return {
                ...balanceInfo,
                ...pTransactionInfo
            };
        } catch (error) { console.error("Error fetching financial data:", error); return null; }
    }


    async function get_balance() {
        const basicAccounts = glb_account.filter(acc => acc.relationship === "BASIC");
        try {
            await Promise.all(basicAccounts.map(async (acc) => {
                if (!acc.financialData) {
                    acc.financialData = await fetchRequest_balance(acc.account_token);
                }
            }));

            localStorageHandler("set", storage_accToken, ["account"]);
        } catch (error) {
            return;
        }

    }


    async function fetchRequest_benefit(accountToken, locale = "en-US", limit = "ALL") {
        const url = API_benefit;
        const payload = [{ accountToken, locale, limit }];

        try {
            const response = await fetch(url, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.error("Failed to fetch Best Loyalty Benefits Trackers. Status:", response.status);
                return null;
            }

            // The response is expected to be an array of objects, each containing a .trackers array.
            const data = await response.json();
            const trackers = [];

            data.forEach(item => {
                if (Array.isArray(item.trackers)) {
                    item.trackers.forEach(trackerObj => {

                        const {
                            benefitId,
                            sorBenefitId,
                            category,
                            periodStartDate,
                            periodEndDate,
                            trackerDuration,
                            benefitName,
                            qualifiedDetailAvailable,
                            status,
                            terms,
                            tracker,   // subobject: { targetAmount, spentAmount, remainingAmount, targetUnit, targetCurrency, targetCurrencySymbol }
                            progress   // subobject: { updateInterval, title, message, usedLabel, togoLabel, totalSavingsYearToDate, hideProgressBar }
                        } = trackerObj;

                        // Push everything into an array with a standardized structure
                        trackers.push({
                            benefitId,
                            sorBenefitId,
                            category,
                            periodStartDate,
                            periodEndDate,
                            trackerDuration,        // e.g., "Monthly", "HalfYear", "CalenderYear", etc.
                            benefitName,
                            qualifiedDetailAvailable,
                            status,
                            terms,                  // array of HTML strings
                            tracker: tracker ? {
                                targetAmount: tracker.targetAmount,
                                spentAmount: tracker.spentAmount,
                                remainingAmount: tracker.remainingAmount,
                                targetUnit: tracker.targetUnit,
                                targetCurrency: tracker.targetCurrency,
                                targetCurrencySymbol: tracker.targetCurrencySymbol
                            } : null,
                            progress: progress ? {
                                updateInterval: progress.updateInterval,
                                title: progress.title,
                                message: progress.message,
                                usedLabel: progress.usedLabel,
                                togoLabel: progress.togoLabel,
                                totalSavingsYearToDate: progress.totalSavingsYearToDate,
                                hideProgressBar: progress.hideProgressBar
                            } : null
                        });
                    });
                }
            });

            return trackers;
        } catch (error) {
            console.error("Error fetching Best Loyalty Benefits Trackers:", error);
            return null;
        }
    }


    async function get_benefit() {
        const basicAccounts = glb_account.filter(acc => acc.relationship === "BASIC");
        let newTrackers = [];
        await Promise.all(basicAccounts.map(async (acc) => {
            const trackers = await fetchRequest_benefit(acc.account_token);
            if (Array.isArray(trackers)) {
                trackers.forEach(tracker => {
                    // Attach the BASIC card's display number so we know which card the tracker is for
                    tracker.cardEnding = acc.display_account_number;
                    // Ensure numeric values for spent and target amounts
                    tracker.spentAmount = parseFloat(tracker.spentAmount) || 0;
                    tracker.targetAmount = parseFloat(tracker.targetAmount) || 0;
                    newTrackers.push(tracker);
                });
            }
        }));

        if (Array.isArray(newTrackers)) {
            glb_benefit = newTrackers;
            localStorageHandler("set", storage_accToken, "benefit");
        }

    }



    async function get_trustLevel() {
        return new Promise((resolve) => {
            GM.xmlHttpRequest({
                method: "GET",
                url: API_USCF1,
                onload: function (response) {
                    if (response.status !== 200) {
                        console.log("Session request failed");
                        return resolve(0);
                    }
                    try {
                        const sessionData = JSON.parse(response.responseText);
                        const username = sessionData?.current_user?.username;
                        if (!username) {
                            console.log("No current user found");
                            return resolve(0);
                        }
                        GM.xmlHttpRequest({
                            method: "GET",
                            url: API_USCF2 + encodeURIComponent(username) + ".json",
                            onload: function (resp) {
                                if (resp.status !== 200) {
                                    console.log(`User JSON fetch failed for ${username}`);
                                    return resolve(0);
                                }
                                try {
                                    const userData = JSON.parse(resp.responseText);
                                    const trustLevel = userData?.user?.trust_level;
                                    resolve(trustLevel ?? 0);
                                } catch (e) {
                                    console.error("Error parsing user JSON:", e);
                                    resolve(0);
                                }
                            },
                            onerror: function (err) {
                                console.error("Error fetching user JSON:", err);
                                resolve(0);
                            }
                        });
                    } catch (e) {
                        console.error("Error parsing session JSON:", e);
                        resolve(0);
                    }
                },
                onerror: function (err) {
                    console.error("Error fetching session:", err);
                    resolve(0);
                }
            });
        });
    }

    async function fetchGet_enrollOffer(accountToken, offerIdentifier) {
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const offsetTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        const requestDateTimeWithOffset = `${offsetTime.getUTCFullYear()}-${pad(offsetTime.getUTCMonth() + 1)}-${pad(offsetTime.getUTCDate())}T${pad(offsetTime.getUTCHours())}:${pad(offsetTime.getUTCMinutes())}:${pad(offsetTime.getUTCSeconds())}-06:00`;

        const payload = {
            accountNumberProxy: accountToken,
            identifier: offerIdentifier,
            locale: "en-US",
            requestDateTimeWithOffset: requestDateTimeWithOffset,
            userOffset: "-06:00"
        };

        try {
            const res = await fetch(API_Enroll, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': 'https://global.americanexpress.com'
                },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (json.isEnrolled) {
                return { offerId: offerIdentifier, accountToken, result: true };
            } else {
                // Record explanationMessage when enrollment fails.
                return {
                    offerId: offerIdentifier,
                    accountToken,
                    result: false,
                    explanationMessage: json.explanationMessage
                };
            }
        } catch (error) {
            return { offerId: offerIdentifier, accountToken, result: false };
        }
    }



    async function get__batchEnrollOffer(offerSourceId, accountNumber) {
        // Helper to delay execution
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

        // Counters for statistics.
        let totalEnrollAttempts = 0;
        let successfulEnrollments = 0;
        const tasks = [];

        // Filter out offers that are not eligible.
        const eligibleOffers = glb_offer.filter(offer => {
            if (offerSourceId && offer.source_id !== offerSourceId) return false;
            if (offer.category === "DEFAULT") {
                console.log(`Skipping offer "${offer.name}" because its category is DEFAULT`);
                return false;
            }
            return true;
        });

        // Helper to update the enrollment status in the offer object.
        const updateOfferEnrollment = (offer, account) => {
            const cardNumber = account.display_account_number;
            offer.eligibleCards = offer.eligibleCards.filter(c => c !== cardNumber);
            if (!offer.enrolledCards.includes(cardNumber)) {
                offer.enrolledCards.push(cardNumber);
            }
        };

        // Build tasks: for each offer, for each eligible card, find active matching accounts.
        eligibleOffers.forEach(offer => {
            offer.eligibleCards.forEach(card => {
                const matchingAccounts = glb_account.filter(acc =>
                    acc.display_account_number === card &&
                    acc.account_status?.trim().toLowerCase() === "active" &&
                    (!accountNumber || acc.display_account_number === accountNumber)
                );
                matchingAccounts.forEach(account => {
                    tasks.push(async () => {
                        totalEnrollAttempts++;
                        const cardNumber = account.display_account_number;

                        if (glb_excludedCards.includes(cardNumber)) {
                            console.log(`Skipping card ${cardNumber} as it is excluded.`);
                            return { offerId: offer.offerId, accountToken: account.account_token, result: false, explanationMessage: "Card excluded" };
                        }
                        // Delay for non-priority cards.
                        if (!glb_priorityCards.includes(cardNumber)) {
                            await delay(500);
                        }
                        try {
                            const enrollResult = await fetchGet_enrollOffer(account.account_token, offer.offerId);
                            if (enrollResult.result) {
                                successfulEnrollments++;
                                console.log(`Enroll "${offer.name}" on card ${cardNumber} successful`);
                                updateOfferEnrollment(offer, account);
                                return { offerId: offer.offerId, accountToken: account.account_token, result: true };
                            } else {
                                console.log(`Enroll "${offer.name}" on card ${cardNumber} failed. Reason: ${enrollResult.explanationMessage || "No explanation provided."}`);
                                return {
                                    offerId: offer.offerId,
                                    accountToken: account.account_token,
                                    result: false,
                                    explanationMessage: enrollResult.explanationMessage
                                };
                            }
                        } catch (err) {
                            console.log(`Enroll "${offer.name}" on card ${cardNumber} errored:`, err);
                            return {
                                offerId: offer.offerId,
                                accountToken: account.account_token,
                                result: false,
                                explanationMessage: err.message || "Error occurred"
                            };
                        }
                    });
                });
            });
        });

        // Execute tasks in batches.
        const enrollmentResults = await runInBatches(tasks, runInBatchesLimit);
        await get_offers();

        if (totalEnrollAttempts > 0) {
            const successRate = ((successfulEnrollments / totalEnrollAttempts) * 100).toFixed(2);
            console.log(`Enrollment success rate: ${successfulEnrollments}/${totalEnrollAttempts} (${successRate}%)`);
        } else {
            console.log('No enrollment attempts were made.');
        }
        return enrollmentResults;
    }



    async function runInBatches(tasks, limit) {
        const results = [];
        let i = 0;
        while (i < tasks.length) {
            const chunk = tasks.slice(i, i + limit);
            const chunkResults = await Promise.all(chunk.map(fn => fn()));
            results.push(...chunkResults);
            i += limit;
        }
        return results;
    }


    // =========================================================================
    // Section 6: UI Rendering Functions
    // =========================================================================

    function renderTable(headers, colWidths, items, cellRenderer, sortHandler, sortableKeys) {
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.fontSize = '14px';
        table.style.marginTop = '8px';
        table.style.borderRadius = '8px';
        table.style.overflow = 'hidden';
        table.style.backgroundColor = '#fff';
        table.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';

        // Build table header
        const thead = document.createElement('thead');
        thead.style.background = 'linear-gradient(to right, #f2f2f2, #e0e0e0)';
        const headerRow = document.createElement('tr');
        headers.forEach(headerItem => {
            const th = document.createElement('th');
            th.textContent = headerItem.label;
            th.style.padding = '12px';
            th.style.textAlign = 'center';
            th.style.verticalAlign = 'middle';
            th.style.fontWeight = '600';
            th.style.color = '#333';
            th.style.background = '#f8f9fa';
            th.style.borderBottom = '2px solid #e0e0e0';
            if (colWidths[headerItem.key]) {
                th.style.width = colWidths[headerItem.key];
            }
            // Attach sort handler if this column is sortable.
            if (sortableKeys && sortableKeys.includes(headerItem.key) && sortHandler) {
                th.style.cursor = 'pointer';
                th.setAttribute('data-sort-key', headerItem.key);
                th.addEventListener('click', () => sortHandler(headerItem.key));
            }
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Helper: determine whether to highlight the account row based on the offer search keyword.
        function shouldHighlightAccount(acc) {
            if (!glb_filters.memberMerchantSearch || glb_filters.memberMerchantSearch.trim().length === 0) {
                return false;
            }
            const searchTerm = glb_filters.memberMerchantSearch.trim().toLowerCase();
            return glb_offer.some(offer => {
                if (offer.name.toLowerCase().includes(searchTerm)) {
                    return (Array.isArray(offer.eligibleCards) && offer.eligibleCards.includes(acc.display_account_number)) ||
                        (Array.isArray(offer.enrolledCards) && offer.enrolledCards.includes(acc.display_account_number));
                }
                return false;
            });
        }

        // Build table body
        const tbody = document.createElement('tbody');
        items.forEach((item, idx) => {
            const row = document.createElement('tr');
            row.style.transition = 'background-color 0.3s ease, box-shadow 0.3s ease';
            // Zebra stripes
            row.style.backgroundColor = (idx % 2 === 0 ? '#fff' : '#fdfdfd');
            if (shouldHighlightAccount(item)) {
                row.style.backgroundColor = 'lightyellow';
            }
            headers.forEach(headerItem => {
                const td = document.createElement('td');
                td.style.padding = '12px';
                td.style.textAlign = 'center';
                td.style.borderBottom = '1px solid #eee';
                if (colWidths[headerItem.key]) {
                    td.style.width = colWidths[headerItem.key];
                    td.style.maxWidth = colWidths[headerItem.key];
                    td.style.whiteSpace = 'normal';
                    td.style.wordWrap = 'break-word';
                }
                // Use the provided cellRenderer to fill the cell
                const content = cellRenderer(item, headerItem);
                if (content instanceof Node) {
                    td.appendChild(content);
                } else {
                    td.textContent = content;
                }
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        return table;
    }


    function createSearchInput(placeholder, value, callback) {
        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.boxSizing = 'border-box';
        container.style.width = '200px';  // fixed width for the search input

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = placeholder;
        input.value = value;
        input.style.width = '100%';
        input.style.padding = '8px 32px 8px 12px';
        input.style.borderRadius = '8px';
        input.style.border = '1px solid #e0e0e0';
        input.style.fontSize = '14px';
        input.style.transition = 'all 0.3s ease';

        input.addEventListener('input', debounce(() => {
            callback(input.value.trim());
            renderPage();
            setTimeout(() => input.focus(), 0);
        }, 500));

        // Search icon
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('viewBox', '0 0 24 24');
        icon.setAttribute('width', '18');
        icon.setAttribute('height', '18');
        icon.style.position = 'absolute';
        icon.style.right = '10px';
        icon.style.top = '50%';
        icon.style.transform = 'translateY(-50%)';
        icon.style.opacity = '0.6';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z');
        path.setAttribute('fill', 'currentColor');
        icon.appendChild(path);

        container.appendChild(input);
        container.appendChild(icon);
        return container;
    }


    async function renderSummary_page() {
        // Compute offer statistics using reduce
        const {
            distinctFullyEnrolled,
            distinctNotFullyEnrolled,
            totalEligible,
            totalEnrolled
        } = glb_offer.reduce((stats, offer) => {
            if (offer.category === "DEFAULT") return stats;
            const eligible = offer.eligibleCards?.length || 0;
            const enrolled = offer.enrolledCards?.length || 0;
            stats.totalEligible += eligible;
            stats.totalEnrolled += enrolled;
            if (eligible + enrolled > 0) {
                enrolled === (eligible + enrolled)
                    ? stats.distinctFullyEnrolled++
                    : stats.distinctNotFullyEnrolled++;
            }
            return stats;
        }, { distinctFullyEnrolled: 0, distinctNotFullyEnrolled: 0, totalEligible: 0, totalEnrolled: 0 });

        // Compute financial stats for BASIC accounts with financialData
        const { totalBalance, totalPending, totalRemaining } = glb_account
            .filter(acc => acc.relationship === "BASIC" && acc.financialData)
            .reduce((fin, acc) => {
                fin.totalBalance += parseFloat(acc.financialData.statement_balance_amount) || 0;
                fin.totalPending += parseFloat(acc.financialData.debits_credits_payments_total_amount) || 0;
                fin.totalRemaining += parseFloat(acc.financialData.remaining_statement_balance_amount) || 0;
                return fin;
            }, { totalBalance: 0, totalPending: 0, totalRemaining: 0 });

        const numAccounts = glb_account.length;
        const updateTime = lastUpdate || "Never";

        // Create main container
        const summaryDiv = document.createElement('div');
        summaryDiv.style.cssText = `
            padding: 20px;
            background: #f8f9fa;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            margin: 10px;
            font-family: Arial, sans-serif;
        `;

        // Header: Title and Last Updated badge with fixed min-width and max-height
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e9ecef;
        `;
        const title = document.createElement('h2');
        title.textContent = 'Account Overview';
        title.style.cssText = `margin: 0; font-size: 1.5rem; color: #2d3436;`;
        const updateBadge = document.createElement('div');
        updateBadge.textContent = `Last Updated: ${updateTime}`;
        updateBadge.style.cssText = `
            background: #e3f2fd;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.9rem;
            color: #1976d2;
            min-width: 250px;
            max-height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        header.appendChild(title);
        header.appendChild(updateBadge);
        summaryDiv.appendChild(header);

        // Refresh container with status and refresh button
        const refreshContainer = document.createElement('div');
        refreshContainer.style.cssText = `display: flex; align-items: center; gap: 12px;`;
        const refreshStatusEl = document.createElement('div');
        refreshStatusEl.id = 'refresh-status';
        refreshStatusEl.style.cssText = `font-size: 14px; color: #555;`;
        refreshContainer.appendChild(refreshStatusEl);

        // Helper function to create a stat card element with fixed min width and max height
        const statItem = (label, value, color = '#2d3436') => {
            const container = document.createElement('div');
            container.style.cssText = `
            background: white;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
            flex: 1;
            min-width: 160px;
            max-width: 240px;
            max-height: 60px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          `;
            const statValue = document.createElement('div');
            statValue.textContent = value;
            statValue.style.cssText = `font-size: 1.8rem; font-weight: 600; color: ${color}; margin-bottom: 4px;`;
            const statLabel = document.createElement('div');
            statLabel.textContent = label;
            statLabel.style.cssText = `font-size: 0.9rem; color: #6c757d;`;
            container.append(statValue, statLabel);
            return container;
        };

        // Helper to create a row of stat cards
        const createStatRow = items => {
            const row = document.createElement('div');
            row.style.cssText = `display: flex; gap: 16px; justify-content: space-around;`;
            items.forEach(item => row.appendChild(item));
            return row;
        };

        const financialRow = createStatRow([
            statItem('Card Amount on Login', `${numAccounts}`, 'rgba(0, 0, 0, 0.69)'),
            statItem('Total Balance', `$${totalBalance.toFixed(2)}`, 'rgba(22, 18, 19, 0.69)'),
            statItem('Total Pending Charge', `$${totalPending.toFixed(2)}`, 'rgba(138, 113, 121, 0.65)'),
            statItem('Remain Statement', `$${totalRemaining.toFixed(2)}`, 'rgba(231, 29, 99, 0.65)')
        ]);
        const enrollmentRow = createStatRow([
            statItem('Offers Fully Enrolled', distinctFullyEnrolled, 'rgba(94, 14, 215, 0.8)'),
            statItem('Offers Pending Enrollment', distinctNotFullyEnrolled, 'rgba(213, 36, 36, 0.77)'),
            statItem('Total Eligible Offers', totalEligible, 'rgba(37, 108, 158, 0.74)'),
            statItem('Total Enrolled Offers', totalEnrolled, 'rgba(3, 68, 114, 0.86)')
        ]);

        const statsContainer = document.createElement('div');
        statsContainer.style.cssText = `display: flex; flex-direction: column; gap: 24px; margin-bottom: 24px;`;
        statsContainer.append(financialRow, enrollmentRow);
        summaryDiv.appendChild(statsContainer);

        // Action buttons container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;`;

        // Helper to create a button with icon and text
        const createButton = (text, color, onClick) => {
            const btn = document.createElement('button');
            btn.style.cssText = `
            padding: 12px 28px;
            border: none;
            border-radius: 6px;
            background: ${color};
            color: white;
            font-weight: 500;
            cursor: pointer;
            transition: transform 0.1s ease, opacity 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 1rem;
          `;
            btn.addEventListener('mouseover', () => btn.style.opacity = '0.9');
            btn.addEventListener('mouseout', () => btn.style.opacity = '1');
            btn.addEventListener('mousedown', () => btn.style.transform = 'scale(0.98)');
            btn.addEventListener('mouseup', () => btn.style.transform = 'none');
            btn.addEventListener('click', onClick);
            return btn;
        };

        const refreshBtn = createButton('Refresh Data', '#3498db', async () => {
            try {
                refreshStatusEl.textContent = "Refreshing accounts...";
                await get_accounts();
                refreshStatusEl.textContent = "Refreshing offers...";
                await get_offers();
                refreshStatusEl.textContent = "Refreshing balances...";
                await get_balance();
                refreshStatusEl.textContent = "Refreshing benefits...";
                await get_benefit();
                lastUpdate = new Date().toLocaleString();
                localStorageHandler("set", storage_accToken, ["lastUpdate", "scriptVersion"]);
                refreshStatusEl.textContent = "Refresh complete.";
                await renderPage();
            } catch (e) {
                console.error('Error refreshing data:', e);
                refreshStatusEl.textContent = "Error refreshing data.";
            }
        });
        refreshBtn.innerHTML = `<svg style="width:20px;height:20px;fill:white" viewBox="0 0 24 24">
          <path d="M17.65 6.35A7.95 7.95 0 0 0 12 4C7.58 4 4 7.58 4 12s3.58 8 8 8a7.94 7.94 0 0 0 6.65-3.65l-1.42-1.42A5.973 5.973 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
        </svg> Refresh Data`;
        refreshContainer.appendChild(refreshBtn);

        const enrollBtn = createButton('Enroll All', '#27ae60', async () => {
            try {
                await get__batchEnrollOffer();
                renderPage();
            } catch (e) {
                console.error('Error enrolling all:', e);
            }
        });
        enrollBtn.innerHTML = `<svg style="width:20px;height:20px;fill:white" viewBox="0 0 24 24">
          <path d="M19 13H5v-2h14v2z"/>
        </svg> Enroll All`;
        buttonContainer.append(refreshContainer, enrollBtn);
        summaryDiv.appendChild(buttonContainer);

        return summaryDiv;
    }


    function renderMembers_filterBar() {
        const filtersCard = document.createElement('div');
        filtersCard.style.background = '#ffffff';
        filtersCard.style.borderRadius = '12px';
        filtersCard.style.padding = '16px';
        filtersCard.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        filtersCard.style.display = 'flex';
        filtersCard.style.gap = '20px';
        filtersCard.style.flexWrap = 'wrap';
        filtersCard.style.width = '100%';
        filtersCard.style.boxSizing = 'border-box';

        // Status Filter: label and select side-by-side
        const statusFilterDiv = document.createElement('div');
        statusFilterDiv.style.display = 'flex';
        statusFilterDiv.style.alignItems = 'center';
        statusFilterDiv.style.gap = '8px';

        const statusFilterLabel = document.createElement('label');
        statusFilterLabel.textContent = 'Status:';
        statusFilterLabel.style.fontWeight = '600';
        statusFilterLabel.style.fontSize = '0.9rem';

        const statusFilterSelect = document.createElement('select');
        statusFilterSelect.id = 'status-filter';
        statusFilterSelect.style.padding = '8px';
        statusFilterSelect.style.borderRadius = '8px';
        statusFilterSelect.style.border = '1px solid #e0e0e0';
        statusFilterSelect.style.fontSize = '0.9rem';
        statusFilterSelect.style.cursor = 'pointer';

        const optionAll = document.createElement('option');
        optionAll.value = 'all';
        optionAll.textContent = 'All';
        const optionActive = document.createElement('option');
        optionActive.value = 'Active';
        optionActive.textContent = 'Active';
        const optionCanceled = document.createElement('option');
        optionCanceled.value = 'Canceled';
        optionCanceled.textContent = 'Canceled';

        statusFilterSelect.appendChild(optionAll);
        statusFilterSelect.appendChild(optionActive);
        statusFilterSelect.appendChild(optionCanceled);
        statusFilterSelect.value = glb_filters.memberStatus;
        statusFilterSelect.addEventListener('change', () => {
            glb_filters.memberStatus = statusFilterSelect.value;
            renderPage();
        });

        statusFilterDiv.appendChild(statusFilterLabel);
        statusFilterDiv.appendChild(statusFilterSelect);
        filtersCard.appendChild(statusFilterDiv);

        // Type Filter: label and select side-by-side
        const typeFilterDiv = document.createElement('div');
        typeFilterDiv.style.display = 'flex';
        typeFilterDiv.style.alignItems = 'center';
        typeFilterDiv.style.gap = '8px';

        const typeFilterLabel = document.createElement('label');
        typeFilterLabel.textContent = 'Type:';
        typeFilterLabel.style.fontWeight = '600';
        typeFilterLabel.style.fontSize = '0.9rem';

        const typeFilterSelect = document.createElement('select');
        typeFilterSelect.id = 'type-filter';
        typeFilterSelect.style.padding = '8px';
        typeFilterSelect.style.borderRadius = '8px';
        typeFilterSelect.style.border = '1px solid #e0e0e0';
        typeFilterSelect.style.fontSize = '0.9rem';
        typeFilterSelect.style.cursor = 'pointer';

        const typeOptionAll = document.createElement('option');
        typeOptionAll.value = 'all';
        typeOptionAll.textContent = 'All';
        const typeOptionBasic = document.createElement('option');
        typeOptionBasic.value = 'BASIC';
        typeOptionBasic.textContent = 'BASIC';
        const typeOptionSupp = document.createElement('option');
        typeOptionSupp.value = 'SUPP';
        typeOptionSupp.textContent = 'SUPP';

        typeFilterSelect.appendChild(typeOptionAll);
        typeFilterSelect.appendChild(typeOptionBasic);
        typeFilterSelect.appendChild(typeOptionSupp);
        typeFilterSelect.value = glb_filters.memberCardtype;
        typeFilterSelect.addEventListener('change', () => {
            glb_filters.memberCardtype = typeFilterSelect.value;
            renderPage();
        });

        typeFilterDiv.appendChild(typeFilterLabel);
        typeFilterDiv.appendChild(typeFilterSelect);
        filtersCard.appendChild(typeFilterDiv);

        // Offer Search Filter: label and search input on the same line
        const offerSearchContainer = document.createElement('div');
        offerSearchContainer.style.display = 'flex';
        offerSearchContainer.style.alignItems = 'center';
        offerSearchContainer.style.gap = '8px';

        const offerSearchLabel = document.createElement('label');
        offerSearchLabel.textContent = 'Search Offer:';
        offerSearchLabel.style.fontWeight = '600';
        offerSearchLabel.style.fontSize = '0.9rem';

        // Reuse createSearchInput here. This function should return a container with the search input.
        const offerSearchInputContainer = createSearchInput(
            'Enter keyword',
            glb_filters.memberMerchantSearch,
            val => {
                glb_filters.memberMerchantSearch = val.toLowerCase();
                renderPage();
            }
        );

        offerSearchContainer.appendChild(offerSearchLabel);
        offerSearchContainer.appendChild(offerSearchInputContainer);
        filtersCard.appendChild(offerSearchContainer);

        return filtersCard;
    }


    function renderMembers_table() {
        const headers = [
            { label: "Index", key: "cardIndex" },
            { label: "Logo", key: "small_card_art" },
            { label: "Ending", key: "display_account_number" },
            { label: "User", key: "embossed_name" },
            { label: "Type", key: "relationship" },
            { label: "Opening", key: "account_setup_date" },
            { label: "Status", key: "account_status" },
            { label: "Bal", key: "StatementBalance" },
            { label: "Pending", key: "pending" },
            { label: "Rem StBl", key: "remainingStaBal" },
            { label: "Elig", key: "eligibleOffers" },
            { label: "Enrled", key: "enrolledOffers" },
            { label: "Prior", key: "priority" },
            { label: "Excld", key: "exclude" }
        ];

        const colWidths = {
            cardIndex: "45px",
            small_card_art: "60px",
            display_account_number: "60px",
            embossed_name: "150px",
            relationship: "80px",
            account_setup_date: "120px",
            account_status: "80px",
            StatementBalance: "80px",
            pending: "80px",
            remainingStaBal: "85px",
            eligibleOffers: "60px",
            enrolledOffers: "60px",
            priority: "60px",
            exclude: "60px"
        };

        // Filter accounts by status and type (do not filter by search term)
        const filteredAccounts = glb_account.filter(acc => {
            const statusMatch = glb_filters.memberStatus === 'all' ||
                acc.account_status.trim().toLowerCase() === glb_filters.memberStatus.toLowerCase();
            const typeMatch = glb_filters.memberCardtype === 'all' ||
                acc.relationship === glb_filters.memberCardtype;
            return statusMatch && typeMatch;
        });


        // Define cell rendering logic for members table
        const cellRenderer = (item, headerItem) => {
            const key = headerItem.key;
            if (key === 'small_card_art') {
                if (item.small_card_art && item.small_card_art !== 'N/A') {
                    const img = document.createElement('img');
                    img.src = item.small_card_art;
                    img.alt = "Card Logo";
                    img.style.maxWidth = "40px";
                    img.style.maxHeight = "40px";
                    return img;
                }
                return sanitizeValue('N/A');
            } else if (key === 'eligibleOffers' || key === 'enrolledOffers') {
                const count = item[key];
                const btn = document.createElement('button');
                btn.textContent = sanitizeValue(count);
                btn.style.cursor = 'pointer';
                btn.style.border = '1px solid #ccc';
                btn.style.borderRadius = '4px';
                btn.style.padding = '2px 6px';
                btn.style.fontSize = '12px';
                btn.style.backgroundColor = '#fafafa';
                btn.addEventListener('mouseover', () => btn.style.backgroundColor = '#f0f0f0');
                btn.addEventListener('mouseout', () => btn.style.backgroundColor = '#fafafa');
                btn.addEventListener('click', () => {
                    renderMembers_offerOnCard(item.display_account_number,
                        (key === 'eligibleOffers') ? 'eligible' : 'enrolled');
                });
                return btn;
            } else if (key === 'pending' || key === 'remainingStaBal' || key === 'StatementBalance') {
                if (item.relationship === "BASIC") {
                    if (item.financialData) {
                        if (key === 'pending') {
                            return sanitizeValue(item.financialData.debits_credits_payments_total_amount);
                        } else if (key === 'remainingStaBal') {
                            return sanitizeValue(item.financialData.remaining_statement_balance_amount);
                        } else if (key === 'StatementBalance') {
                            return sanitizeValue(item.financialData.statement_balance_amount);
                        }
                    }
                    return "Loading...";
                }
                return "0";
            } else if (key === 'relationship') {
                if (item.relationship === "SUPP") {
                    return getBasicAccountEndingForSuppAccount(item);
                }
                return sanitizeValue(item[key]);
            } else if (key === 'priority') {
                const chk = document.createElement('input');
                chk.type = 'checkbox';
                chk.checked = glb_priorityCards.includes(item.display_account_number);
                chk.addEventListener('change', () => {
                    if (chk.checked) {
                        if (!glb_priorityCards.includes(item.display_account_number)) {
                            glb_priorityCards.push(item.display_account_number);
                        }
                    } else {
                        glb_priorityCards = glb_priorityCards.filter(num => num !== item.display_account_number);
                    }
                    localStorageHandler("set", storage_accToken, ["priorityCards"]);
                });
                return chk;
            } else if (key === 'exclude') {
                const chk = document.createElement('input');
                chk.type = 'checkbox';
                chk.checked = glb_excludedCards.includes(item.display_account_number);
                chk.addEventListener('change', () => {
                    if (chk.checked) {
                        if (!glb_excludedCards.includes(item.display_account_number)) {
                            glb_excludedCards.push(item.display_account_number);
                        }
                    } else {
                        glb_excludedCards = glb_excludedCards.filter(num => num !== item.display_account_number);
                    }
                    localStorageHandler("set", storage_accToken, ["excludedCards"]);
                });
                return chk;
            }
            return sanitizeValue(item[key]);
        };

        // Define the sortable keys for members table
        const sortableKeys = [
            "cardIndex", "small_card_art", "display_account_number", "embossed_name",
            "relationship", "account_setup_date", "account_status", "StatementBalance",
            "pending", "remainingStaBal", "eligibleOffers", "enrolledOffers"
        ];

        const tableElement = renderTable(headers, colWidths, filteredAccounts, cellRenderer, sort_memberTab, sortableKeys);
        const containerDiv = document.createElement('div');
        containerDiv.appendChild(tableElement);
        return containerDiv;
    }


    function renderMembers_offerOnCard(accountNumber, offerType) {
        // Create the overlay with backdrop blur
        const overlay = document.createElement('div');
        overlay.id = 'offer-details-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.4);
            backdrop-filter: blur(4px);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        // Modern popup container
        const popup = document.createElement('div');
        popup.style.cssText = `
            background: #ffffff;
            border-radius: 12px;
            padding: 24px;
            width: 90%;
            max-width: 400px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            position: relative;
        `;

        overlay.appendChild(popup);

        // ───────── Top row: Title and Close Button ─────────
        const topRow = document.createElement('div');
        topRow.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 1px solid #eee;
        `;

        const leftTitle = document.createElement('h3');
        leftTitle.textContent = `Offers ${offerType} for card ending ${accountNumber}`;
        leftTitle.style.cssText = `
            margin: 0;
            font-size: 1.2rem;
            font-weight: 600;
            background: linear-gradient(45deg, #2c3e50, #4CAF50);
            -webkit-background-clip: text;
            color: transparent;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #666;
            cursor: pointer;
            padding: 4px;
            transition: all 0.2s ease;
        `;
        closeBtn.addEventListener('mouseover', () => {
            closeBtn.style.color = '#ff4444';
        });
        closeBtn.addEventListener('mouseout', () => {
            closeBtn.style.color = '#666';
        });
        closeBtn.addEventListener('click', () => {
            overlay.remove();
        });

        topRow.appendChild(leftTitle);
        topRow.appendChild(closeBtn);
        popup.appendChild(topRow);

        // ───────── Content Area ─────────
        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = `
            font-size: 14px;
            line-height: 1.4;
        `;
        popup.appendChild(contentDiv);

        // Determine relevant offers based on offerType
        let relevantOffers = [];
        if (offerType === 'eligible') {
            relevantOffers = glb_offer.filter(offer =>
                Array.isArray(offer.eligibleCards) &&
                offer.eligibleCards.includes(accountNumber)
            );
        } else if (offerType === 'enrolled') {
            relevantOffers = glb_offer.filter(offer =>
                Array.isArray(offer.enrolledCards) &&
                offer.enrolledCards.includes(accountNumber)
            );
        }

        if (relevantOffers.length === 0) {
            contentDiv.textContent = `No ${offerType} offers found for card ${accountNumber}.`;
        } else {
            relevantOffers.forEach(offer => {
                const offerPara = document.createElement('p');
                offerPara.style.cssText = `
                    margin: 6px 0;
                    font-size: 14px;
                    color: #333;
                `;
                offerPara.textContent = offer.name;
                contentDiv.appendChild(offerPara);
            });
        }

        document.body.appendChild(overlay);
    }


    function renderMembers_page() {
        const containerDiv = document.createElement('div');
        containerDiv.style.display = 'flex';
        containerDiv.style.flexDirection = 'column';
        containerDiv.style.gap = '16px';
        containerDiv.style.padding = '16px';
        containerDiv.style.maxWidth = '1300px';
        containerDiv.style.margin = '0 auto';
        containerDiv.style.fontFamily = "'Inter', system-ui, sans-serif";

        return containerDiv;
    }


    function renderOffers_searchBar() {
        const filterCard = document.createElement('div');
        filterCard.style.background = '#ffffff';
        filterCard.style.borderRadius = '12px';
        filterCard.style.padding = '16px';
        filterCard.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        filterCard.style.display = 'flex';
        filterCard.style.gap = '20px';
        filterCard.style.flexWrap = 'wrap';
        filterCard.style.width = '100%';
        filterCard.style.boxSizing = 'border-box';

        // Favorites Toggle
        const favCheckbox = document.createElement('input');
        favCheckbox.type = 'checkbox';
        favCheckbox.checked = glb_filters.offerFav;
        favCheckbox.style.cursor = 'pointer';
        favCheckbox.addEventListener('change', () => {
            glb_filters.offerFav = favCheckbox.checked;
            renderPage();
        });
        const favLabel = document.createElement('label');
        favLabel.textContent = "Show Favorites Only";
        favLabel.style.fontSize = '14px';
        favLabel.style.cursor = 'pointer';
        favLabel.style.marginLeft = '4px';
        const favContainer = document.createElement('div');
        favContainer.style.display = 'flex';
        favContainer.style.alignItems = 'center';
        favContainer.appendChild(favCheckbox);
        favContainer.appendChild(favLabel);

        // Search inputs
        const merchantSearch = createSearchInput('Search merchants...', glb_filters.offerMerchantSearch,
            val => glb_filters.offerMerchantSearch = val.toLowerCase());
        const cardSearch = createSearchInput('Card ending...', glb_filters.offerCardEnding,
            val => glb_filters.offerCardEnding = val);

        filterCard.appendChild(favContainer);
        filterCard.appendChild(merchantSearch);
        filterCard.appendChild(cardSearch);

        return filterCard;
    }


    function renderOffers_table() {
        // Filter offers based on search criteria.
        const filteredOffers = glb_offer.filter(o => {
            if (glb_filters.offerFav && !o.favorite) return false;
            if (glb_filters.offerMerchantSearch && !o.name.toLowerCase().includes(glb_filters.offerMerchantSearch)) return false;
            if (glb_filters.offerCardEnding) {
                const eligible = Array.isArray(o.eligibleCards) && o.eligibleCards.includes(glb_filters.offerCardEnding);
                const enrolled = Array.isArray(o.enrolledCards) && o.enrolledCards.includes(glb_filters.offerCardEnding);
                if (!eligible && !enrolled) return false;
            }
            return true;
        });

        const headers = [
            { label: "❤️", key: "favorite" },
            { label: "Logo", key: "logo" },
            { label: "Offer", key: "name" },
            { label: "Type", key: "achievement_type" },
            { label: "Cat", key: "category" },
            { label: "Exp", key: "expiry_date" },
            { label: "Usg", key: "redemption_types" },
            { label: "Description", key: "short_description" },
            { label: "Thres", key: "threshold" },
            { label: "Rwd", key: "reward" },
            { label: "Pct", key: "percentage" },
            { label: "Elig", key: "eligibleCards" },
            { label: "Enrl", key: "enrolledCards" }
        ];

        const colWidths = {
            favorite: "35px",
            logo: "70px",
            name: "220px",
            achievement_type: "60px",
            category: "40px",
            expiry_date: "90px",
            redemption_types: "70px",
            short_description: "250px",
            threshold: "90px",
            reward: "80px",
            percentage: "80px",
            eligibleCards: "40px",
            enrolledCards: "45px"
        };

        // Define cell rendering logic for offers table
        const cellRenderer = (item, headerItem) => {
            const key = headerItem.key;
            if (key === 'logo') {
                if (item.logo && item.logo !== "N/A") {
                    const img = document.createElement('img');
                    img.src = item.logo;
                    img.alt = "Offer Logo";
                    img.style.maxWidth = "60px";
                    img.style.maxHeight = "60px";
                    return img;
                }
                return 'N/A';
            } else if (key === 'achievement_type') {
                let value = item.achievement_type;
                if (value === "STATEMENT_CREDIT") {
                    value = "Cash";
                } else if (value === "MEMBERSHIP_REWARDS") {
                    value = "MR";
                }
                return value;
            } else if (key === 'category') {
                if (item.category && item.category !== "N/A") {
                    const cat = item.category.toString().toLowerCase().trim();
                    // Map full names to an emoji (or short text)
                    const categoryMap = {
                        "default": "🔰",
                        "dining": "🍽️",
                        "entertainment": "🎭",
                        "services": "⚙️",
                        "shopping": "🛍️",
                        "travel": "✈️"
                    };
                    return categoryMap[cat] || (cat.charAt(0).toUpperCase() + cat.slice(1));
                }
                return 'N/A';
            } else if (key === 'redemption_types') {
                if (item.redemption_types && item.redemption_types !== "N/A") {
                    let parts = item.redemption_types.toString().split(",");
                    let abbreviatedParts = parts.map(val => {
                        let trimmed = val.trim().toLowerCase();
                        if (trimmed.includes("instore")) return "🏬";
                        if (trimmed.includes("online")) return "🌐";
                        // Fallback: take the first three letters in uppercase
                        return trimmed.toUpperCase().slice(0, 3);
                    });
                    return abbreviatedParts.join("");
                }
                return "N/A";
            } else if (key === 'expiry_date') {
                if (item.expiry_date && item.expiry_date !== 'N/A') {
                    const d = new Date(item.expiry_date);
                    if (!isNaN(d)) {
                        const yy = d.getFullYear().toString().slice(-2);
                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                        const dd = String(d.getDate()).padStart(2, '0');
                        return `${mm}-${dd}-${yy}`;
                    }
                    return 'N/A';
                }
                return 'N/A';
            } else if (key === 'favorite') {
                const chk = document.createElement('input');
                chk.type = 'checkbox';
                chk.checked = item.favorite === true;
                chk.style.cursor = 'pointer';
                chk.addEventListener('change', () => {
                    item.favorite = chk.checked;
                    localStorageHandler("set", storage_accToken, ["offer"]);
                });
                return chk;
            } else if (key === 'eligibleCards' || key === 'enrolledCards') {
                const cards = Array.isArray(item[key]) ? item[key] : [];
                const count = cards.length;
                const span = document.createElement('span');
                span.textContent = count;
                span.style.cursor = count > 0 ? 'pointer' : 'default';
                span.style.color = count > 0 ? '#007bff' : '#999';
                span.style.textDecoration = count > 0 ? 'underline' : 'none';
                span.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (count > 0) {
                        renderOffers_enrollCard(item.offerId);
                    }
                });
                return span;
            }
            return item[key];
        };

        // Define the sortable keys for offers table
        const sortableKeysOffers = [
            "favorite", "logo", "name", "achievement_type", "category",
            "expiry_date", "redemption_types", "short_description", "threshold",
            "reward", "percentage", "eligibleCards", "enrolledCards"
        ];

        const tableElement = renderTable(headers, colWidths, filteredOffers, cellRenderer, sort_offerTab, sortableKeysOffers);
        const containerDiv = document.createElement('div');
        containerDiv.appendChild(tableElement);
        return containerDiv;
    }


    async function renderOffers_enrollCard(offerId) {
        // Remove existing overlay
        const overlayId = 'offer-details-overlay';
        const existing = document.getElementById(overlayId);
        if (existing) existing.remove();

        // Get offer data
        const offer = glb_offer.find(o => o.offerId === offerId);
        const offerName = offer ? offer.name : 'Unknown Offer';

        // Create overlay and popup
        const overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.style.cssText = `
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 10000;
          display: flex; justify-content: center; align-items: center;
        `;
        const popup = document.createElement('div');
        popup.style.cssText = `
          background: #fff; border-radius: 12px; padding: 24px; width: 90%; max-width: 440px;
          max-height: 90vh; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.15); position: relative;
        `;
        // Header
        const header = document.createElement('div');
        header.style.cssText = `display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #eee;`;
        const title = document.createElement('h3');
        title.textContent = offerName;
        title.style.cssText = `margin: 0; font-size: 1.2rem; font-weight: 600;
          background: linear-gradient(45deg, #2c3e50, #4CAF50); -webkit-background-clip: text; color: transparent;`;
        const closeBtn = createIconButton('×', () => { overlay.remove(); saveCurrentScrollState(); renderPage(); });
        closeBtn.style.cssText += 'font-size:1.5rem; color:#666; padding:4px;';
        header.append(title, closeBtn);
        popup.appendChild(header);

        if (offer) {
            if (offer.eligibleCards?.length) {
                const enrollAll = createIconButton('Enroll All Cards', async () => {
                    console.log(`Calling batch enrollment for "${offerName}" (source_id: ${offer.source_id}).`);
                    const results = await get__batchEnrollOffer(offer.source_id);
                    results.forEach(r => {
                        if (r.offerId !== offerId) return;
                        const acc = glb_account.find(a => a.account_token === r.accountToken);
                        if (!acc) return;
                        const cardEnd = acc.display_account_number;

                        if (r.result) {
                            const idx = offer.eligibleCards.indexOf(cardEnd);
                            if (idx !== -1) offer.eligibleCards.splice(idx, 1);
                            if (!offer.enrolledCards.includes(cardEnd)) offer.enrolledCards.push(cardEnd);
                        }
                        const cardElem = document.getElementById(`offerCard_${offerId}_${cardEnd}`);
                        if (cardElem) {
                            cardElem.style.backgroundColor = r.result ? '#c0ffc0' : '#ffc0c0';
                            setTimeout(() => cardElem.style.backgroundColor = r.result ? '#e8f5e9' : '#e3f2fd', 3000);
                        }
                    });
                    setTimeout(() => renderOffers_enrollCard(offerId), 3000);
                }, 'plus');
                enrollAll.style.cssText += `
              width: 100%; margin: 0 0 20px 0; background: linear-gradient(45deg, rgb(84,99,86), rgb(27,66,29));
              color: white; border-radius: 8px; font-weight: 500;
            `;
                popup.appendChild(enrollAll);
            }
            // Card Sections
            popup.appendChild(createSection('Eligible Cards', offer.eligibleCards, offerId, false, offer));
            popup.appendChild(createSection('Enrolled Cards', offer.enrolledCards, offerId, true, offer));
        } else {
            popup.appendChild(createErrorElement('Offer not found'));
        }
        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // --- Helper Functions ---
        function createSection(label, cards, offerId, enrolled, offer) {
            const section = document.createElement('div');
            section.style.marginBottom = '24px';
            const secTitle = document.createElement('h4');
            secTitle.textContent = label;
            secTitle.style.cssText = `margin: 0 0 12px 0; color: ${enrolled ? '#4CAF50' : '#2196F3'}; font-size: 0.95rem;`;
            const grid = document.createElement('div');
            grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 8px;';
            const sortedCards = [...cards].sort((a, b) => {
                const accA = glb_account.find(acc => acc.display_account_number === a);
                const accB = glb_account.find(acc => acc.display_account_number === b);
                const [aMain, aSub] = parseCardIndex(accA?.cardIndex);
                const [bMain, bSub] = parseCardIndex(accB?.cardIndex);
                return aMain - bMain || aSub - bSub;
            });
            sortedCards.forEach(cardEnd => grid.appendChild(createCard(cardEnd, offerId, enrolled, offer)));
            section.append(secTitle, grid);
            return section;
        }

        function createCard(cardEnd, offerId, enrolled, offer) {
            const card = document.createElement('div');
            card.id = `offerCard_${offerId}_${cardEnd}`;
            card.textContent = cardEnd;
            card.style.cssText = `
            padding: 8px; border-radius: 6px; text-align: center; font-size: 0.85rem;
            transition: all 0.2s ease; background-color: ${enrolled ? '#e8f5e9' : '#e3f2fd'};
            ${!enrolled ? 'cursor: pointer;' : ''}
          `;
            if (!enrolled) {
                card.onclick = async () => {
                    const acc = glb_account.find(a => a.display_account_number === cardEnd);
                    if (!acc) { console.log(`Account not found for card: ${cardEnd}`); return; }
                    const res = await fetchGet_enrollOffer(acc.account_token, offerId);
                    if (res.result) {
                        console.log(`Enrollment successful for card ${cardEnd}, offer "${offerName}"`);
                        const idx = offer.eligibleCards.indexOf(cardEnd);
                        if (idx !== -1) offer.eligibleCards.splice(idx, 1);
                        if (!offer.enrolledCards.includes(cardEnd)) offer.enrolledCards.push(cardEnd);
                    } else {
                        console.log(`Enrollment failed for card ${cardEnd}, offer "${offerName}"`);
                    }
                    card.style.backgroundColor = res.result ? '#c0ffc0' : '#ffc0c0';
                    setTimeout(() => card.style.backgroundColor = res.result ? '#e8f5e9' : '#e3f2fd', 3000);
                    setTimeout(() => renderOffers_enrollCard(offerId), 3000);
                };
                card.onmouseover = () => card.style.transform = 'translateY(-2px)';
                card.onmouseout = () => card.style.transform = 'none';
            }
            return card;
        }

        function createIconButton(text, handler, iconType) {
            const btn = document.createElement('button');
            btn.textContent = text;
            if (iconType) {
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('viewBox', '0 0 24 24');
                svg.setAttribute('width', '16');
                svg.setAttribute('height', '16');
                const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                p.setAttribute('fill', 'currentColor');
                p.setAttribute('d', iconType === 'plus'
                    ? 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'
                    : 'M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z');
                svg.appendChild(p);
                btn.prepend(svg);
            }
            btn.onclick = handler;
            btn.style.cssText = 'display:flex; align-items:center; gap:8px; padding:12px; border:none; cursor:pointer; transition: transform 0.2s ease;';
            btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
            btn.onmouseout = () => btn.style.transform = 'none';
            return btn;
        }

        function createErrorElement(msg) {
            const err = document.createElement('div');
            err.textContent = msg;
            err.style.cssText = 'padding:16px; background:#ffebee; border-radius:8px; color:#c62828; display:flex; align-items:center; gap:8px;';
            return err;
        }
    }



    function renderOffers_page() {
        const containerDiv = document.createElement('div');
        containerDiv.style.display = 'flex';
        containerDiv.style.flexDirection = 'column';
        containerDiv.style.gap = '16px';
        containerDiv.style.padding = '16px';
        containerDiv.style.maxWidth = '1300px';
        containerDiv.style.margin = '0 auto';
        containerDiv.style.fontFamily = "'Inter', system-ui, sans-serif";

        return containerDiv;
    }


    async function renderBenefits() {
        if (!glb_benefit || glb_benefit.length === 0) {
            await get_benefit();
        }

        const containerDiv = createContainer();
        const groupedBenefits = groupBenefits(glb_benefit);
        const sortedBenefitGroups = sortBenefitGroups(groupedBenefits);

        // Define statusLegendConfig here, making it accessible to all helper functions
        const statusLegendConfig = {
            'ACHIEVED': { label: 'Completed', color: '#4CAF50' },
            'IN_PROGRESS': { label: 'In Progress', color: '#2196F3' }
        };

        const legend = createStatusLegend(statusLegendConfig); // Pass statusLegendConfig
        containerDiv.appendChild(legend);

        if (sortedBenefitGroups.length === 0) {
            const emptyState = createEmptyState();
            containerDiv.appendChild(emptyState);
        } else {
            sortedBenefitGroups.forEach(groupObj => {
                const accordionItem = createAccordionItem(groupObj, statusLegendConfig); // Pass statusLegendConfig
                containerDiv.appendChild(accordionItem);
            });
        }

        return containerDiv;

        // --- Helper Functions ---

        function createContainer() {
            const div = document.createElement('div');
            div.style.padding = '20px 16px';
            div.style.fontFamily = "'Segoe UI', system-ui, sans-serif";
            div.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
            div.style.borderRadius = '12px';
            div.style.maxWidth = '800px';
            div.style.margin = '0 auto';
            div.style.color = '#333';
            return div;
        }

        function groupBenefits(benefits) {
            const grouped = {};
            benefits.forEach(trackerObj => {
                const key = trackerObj.benefitId;
                grouped[key] = grouped[key] || [];
                grouped[key].push(trackerObj);
            });
            return grouped;
        }

        function getGroupSortData(trackerGroup) {
            const benefitSortMapping = {
                "200-afc-tracker": { order: 1, newName: "$200 Platinum Flight Credit" },
                "$200-airline-statement-credit": { order: 2, newName: "$200 Aspire Flight Credit" },
                "$400-hilton-aspire-resort-credit": { order: 3, newName: "$400 Hilton Aspire Resort Credit" },
                "$240 flexible business credit": { order: 4, newName: "$240 Flexible Business Credit" },
                "saks-platinum-tracker": { order: 5, newName: "$100 Saks Credit" },
                "$120 dining credit for gold card": { order: 6, newName: "$120 Dining Credit (Gold)" },
                "$84 dunkin' credit": { order: 7, newName: "$84 Dunkin' Credit" },
                "$100 resy credit": { order: 8, newName: "$100 Resy Credit" },
                "hotel-credit-platinum-tracker": { order: 9, newName: "$200 FHR" },
                "digital entertainment": { order: 10, newName: "$20 Digital Entertainment" },
                "$199 clear plus credit": { order: 11, newName: "$199 CLEAR Plus Credit" },
                "walmart+ monthly membership credit": { order: 12, newName: "Walmart+ Membership Credit" },
                "earn free night rewards": { order: 13, newName: "Earn Free Night Rewards" },
                "bd04b359-cc6b-4981-bd6f-afb9456eb9ea": { order: 14, newName: "Unlimited Delta Sky Club Access" },
                "delta-sky-club-visits-platinum": { order: 15, newName: "Delta Sky Club Access Pass" }
            };

            const firstTracker = trackerGroup[0];
            const benefitIdKey = (firstTracker.benefitId || "").toLowerCase().trim();
            const benefitNameKey = (firstTracker.benefitName || "").toLowerCase().trim();
            const sortData = benefitSortMapping[benefitIdKey] || benefitSortMapping[benefitNameKey];

            if (!sortData) {
                return { order: Infinity, displayName: firstTracker.benefitName || "" };
            }
            return { order: sortData.order, displayName: sortData.newName || firstTracker.benefitName || "" };
        }

        function sortBenefitGroups(groupedBenefits) {
            const groupArray = Object.entries(groupedBenefits).map(([key, group]) => {
                const sortInfo = getGroupSortData(group);
                return { key, trackers: group, order: sortInfo.order, displayName: sortInfo.displayName };
            });

            groupArray.sort((a, b) => {
                if (a.order !== b.order) return a.order - b.order;
                return (a.displayName || "").localeCompare(b.displayName || "");
            });
            return groupArray;
        }

        // Modified to accept statusLegendConfig
        function createStatusLegend(statusLegendConfig) {
            const legend = document.createElement('div');
            legend.style.display = 'flex';
            legend.style.gap = '15px';
            legend.style.marginBottom = '25px';
            legend.style.justifyContent = 'center';
            legend.style.flexWrap = 'wrap';


            Object.entries(statusLegendConfig).forEach(([status, { label, color }]) => {
                const legendItem = document.createElement('div');
                legendItem.style.display = 'flex';
                legendItem.style.alignItems = 'center';
                legendItem.style.gap = '6px';

                const colorDot = document.createElement('div');
                colorDot.style.width = '12px';
                colorDot.style.height = '12px';
                colorDot.style.borderRadius = '50%';
                colorDot.style.backgroundColor = color;

                const labelSpan = document.createElement('span');
                labelSpan.textContent = label;
                labelSpan.style.color = '#757575';
                labelSpan.style.fontSize = '14px';

                legendItem.appendChild(colorDot);
                legendItem.appendChild(labelSpan);
                legend.appendChild(legendItem);
            });
            return legend;
        }

        function createEmptyState() {
            const emptyState = document.createElement('div');
            emptyState.style.textAlign = 'center';
            emptyState.style.padding = '40px 20px';
            emptyState.style.color = '#757575';

            const emptyText = document.createElement('p');
            emptyText.textContent = 'No benefits available to display';
            emptyText.style.fontSize = '16px';

            emptyState.appendChild(emptyText);
            return emptyState;
        }

        // Modified to accept statusLegendConfig
        function createAccordionItem(groupObj, statusLegendConfig) {
            const accordionItem = document.createElement('div');
            accordionItem.style.border = '1px solid #e0e0e0';
            accordionItem.style.borderRadius = '12px';
            accordionItem.style.marginBottom = '15px';
            accordionItem.style.backgroundColor = '#ffffff';
            accordionItem.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            accordionItem.style.transition = 'box-shadow 0.2s ease, transform 0.2s ease';

            accordionItem.addEventListener('mouseenter', () => {
                accordionItem.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                accordionItem.style.transform = 'translateY(-2px)';
            });
            accordionItem.addEventListener('mouseleave', () => {
                accordionItem.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                accordionItem.style.transform = 'translateY(0)';
            });

            const headerDiv = createAccordionHeader(groupObj, statusLegendConfig); // Pass statusLegendConfig
            const bodyDiv = createAccordionBody(groupObj.trackers, statusLegendConfig); // Pass statusLegendConfig

            accordionItem.appendChild(headerDiv);
            accordionItem.appendChild(bodyDiv);

            return accordionItem;
        }

        // Modified to accept statusLegendConfig
        function createAccordionHeader(groupObj, statusLegendConfig) {
            const headerDiv = document.createElement('div');
            headerDiv.style.padding = '16px';
            headerDiv.style.cursor = 'pointer';
            headerDiv.style.transition = 'background-color 0.2s ease';
            headerDiv.style.backgroundColor = '#f9f9f9';

            headerDiv.addEventListener('mouseenter', () => {
                headerDiv.style.backgroundColor = '#f0f0f0';
            });
            headerDiv.addEventListener('mouseleave', () => {
                headerDiv.style.backgroundColor = '#f9f9f9';
            });

            const titleRow = createHeaderTitleRow(groupObj);
            const miniBarDiv = createMiniBar(groupObj.trackers, statusLegendConfig); // Pass statusLegendConfig

            headerDiv.appendChild(titleRow);
            headerDiv.appendChild(miniBarDiv);

            headerDiv.addEventListener('click', () => {
                toggleAccordionBody(headerDiv, headerDiv.nextElementSibling);
            });

            return headerDiv;
        }


        function createHeaderTitleRow(groupObj) {
            const titleRow = document.createElement('div');
            titleRow.style.display = 'flex';
            titleRow.style.justifyContent = 'space-between';
            titleRow.style.alignItems = 'center';

            const titleSpan = document.createElement('span');
            titleSpan.style.fontSize = '17px';
            titleSpan.style.fontWeight = '500';
            titleSpan.style.color = '#3a4e63';
            const durationText = groupObj.trackers[0].trackerDuration || (groupObj.trackers[0].tracker && groupObj.trackers[0].tracker.trackerDuration) || "";
            titleSpan.textContent = (groupObj.displayName || groupObj.trackers[0].benefitName || "") + (durationText ? ` (${durationText})` : "");

            const arrowIcon = createArrowIcon();

            titleRow.appendChild(titleSpan);
            titleRow.appendChild(arrowIcon);
            return titleRow;
        }


        function createArrowIcon() {
            const arrowIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            arrowIcon.setAttribute('viewBox', '0 0 24 24');
            arrowIcon.setAttribute('width', '20');
            arrowIcon.setAttribute('height', '20');
            arrowIcon.style.transition = 'transform 0.3s ease';
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M7 10l5 5 5-5');
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#777');
            path.setAttribute('stroke-width', '2');
            arrowIcon.appendChild(path);
            return arrowIcon;
        }

        // Modified to accept statusLegendConfig
        function createMiniBar(trackersGroup, statusLegendConfig) {
            const miniBarDiv = document.createElement('div');
            miniBarDiv.style.display = 'flex';
            miniBarDiv.style.flexWrap = 'wrap';
            miniBarDiv.style.gap = '8px';
            miniBarDiv.style.marginTop = '12px';


            trackersGroup.forEach(trackerObj => {
                const miniCard = document.createElement('div');
                miniCard.style.display = 'flex';
                miniCard.style.alignItems = 'center';
                miniCard.style.gap = '6px';
                miniCard.style.padding = '6px 10px';
                miniCard.style.borderRadius = '8px';
                miniCard.style.fontSize = '14px';
                miniCard.style.background = statusLegendConfig[trackerObj.status]?.color + '15' || '#ccc15'; // Use optional chaining and default color
                miniCard.style.border = `1px solid ${statusLegendConfig[trackerObj.status]?.color}40` || `1px solid #ccc40`; // Use optional chaining and default border
                miniCard.style.color = '#444';

                const cardEnding = document.createElement('span');
                cardEnding.textContent = trackerObj.cardEnding;
                cardEnding.style.fontWeight = '500';

                const statusDot = document.createElement('div');
                statusDot.style.width = '10px';
                statusDot.style.height = '10px';
                statusDot.style.borderRadius = '50%';
                statusDot.style.backgroundColor = statusLegendConfig[trackerObj.status]?.color || '#ccc'; // Use optional chaining and default color

                miniCard.appendChild(statusDot);
                miniCard.appendChild(cardEnding);
                miniBarDiv.appendChild(miniCard);
            });
            return miniBarDiv;
        }

        // Modified to accept statusLegendConfig
        function createAccordionBody(trackersGroup, statusLegendConfig) {
            const bodyDiv = document.createElement('div');
            bodyDiv.style.padding = '0 16px';
            bodyDiv.style.overflow = 'hidden';
            bodyDiv.style.maxHeight = '0';
            bodyDiv.style.transition = 'max-height 0.4s ease-in-out, padding 0.4s ease-in-out';


            trackersGroup.forEach(trackerObj => {
                const trackerCard = createTrackerCard(trackerObj, statusLegendConfig); // Pass statusLegendConfig
                bodyDiv.appendChild(trackerCard);
            });

            const spacer = document.createElement('div'); // Add spacer to bottom of accordion body
            spacer.style.height = '20px';
            bodyDiv.appendChild(spacer);

            return bodyDiv;
        }

        // Modified to accept statusLegendConfig
        function createTrackerCard(trackerObj, statusLegendConfig) {
            const trackerCard = document.createElement('div');
            trackerCard.style.border = '1px solid #ddd';
            trackerCard.style.borderRadius = '10px';
            trackerCard.style.padding = '16px';
            trackerCard.style.margin = '12px 0';
            trackerCard.style.backgroundColor = '#fff';
            trackerCard.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
            trackerCard.style.transition = 'background-color 0.3s ease';

            const cardHeader = createCardHeader(trackerObj);
            const progressContainer = createProgressBar(trackerObj, statusLegendConfig); // Pass statusLegendConfig

            trackerCard.appendChild(cardHeader);
            trackerCard.appendChild(progressContainer);

            if (trackerObj.progress && trackerObj.progress.message) {
                const messageDiv = createMessageDiv(trackerObj.progress.message);
                trackerCard.appendChild(messageDiv);
            }
            return trackerCard;
        }

        function createCardHeader(trackerObj) {
            const cardHeader = document.createElement('div');
            cardHeader.style.display = 'flex';
            cardHeader.style.justifyContent = 'space-between';
            cardHeader.style.marginBottom = '12px';

            const cardNumber = document.createElement('div');
            cardNumber.textContent = `Card: •••• ${trackerObj.cardEnding}`;
            cardNumber.style.fontWeight = '500';
            cardNumber.style.color = '#666';

            const dateRange = document.createElement('div');
            const startFormatted = trackerObj.periodStartDate ? formatDate(trackerObj.periodStartDate, true) : "";
            const endFormatted = trackerObj.periodEndDate ? formatDate(trackerObj.periodEndDate, true) : "";
            const dateRangeText = (startFormatted && endFormatted) ? `${startFormatted} - ${endFormatted}` : "No period available";
            dateRange.textContent = dateRangeText;
            dateRange.style.color = '#888';
            dateRange.style.fontSize = '14px';

            cardHeader.appendChild(cardNumber);
            cardHeader.appendChild(dateRange);
            return cardHeader;
        }

        // Modified to accept statusLegendConfig
        function createProgressBar(trackerObj, statusLegendConfig) {
            const progressContainer = document.createElement('div');
            progressContainer.style.marginBottom = '12px';

            const progressText = document.createElement('div');
            progressText.style.display = 'flex';
            progressText.style.justifyContent = 'space-between';
            progressText.style.marginBottom = '8px';
            progressText.style.fontSize = '14px';
            progressText.style.color = '#fff'; // white text for high contrast

            const progressLabel = document.createElement('span');
            progressLabel.textContent = 'Progress:';
            progressLabel.style.color = '#777';

            const progressAmount = document.createElement('span');
            const spent = parseFloat(trackerObj.tracker.spentAmount).toFixed(2);
            const target = parseFloat(trackerObj.tracker.targetAmount).toFixed(2);
            progressAmount.textContent = `${trackerObj.tracker.targetCurrencySymbol || ''}${spent} / ${trackerObj.tracker.targetCurrencySymbol || ''}${target}`;
            progressAmount.style.color = '#000';

            progressText.appendChild(progressLabel);
            progressText.appendChild(progressAmount);

            const progressBarWrapper = document.createElement('div');
            progressBarWrapper.style.height = '12px';
            progressBarWrapper.style.borderRadius = '8px';
            progressBarWrapper.style.backgroundColor = '#f0f0f0';
            progressBarWrapper.style.position = 'relative';
            progressBarWrapper.style.overflow = 'hidden';
            progressBarWrapper.style.border = '1px solid #ddd';
            progressBarWrapper.style.width = '100%';
            progressBarWrapper.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.05)';

            let percent = 0;
            const targetAmountNum = parseFloat(trackerObj.tracker.targetAmount);
            const spentAmountNum = parseFloat(trackerObj.tracker.spentAmount);
            if (targetAmountNum > 0) {
                percent = (spentAmountNum / targetAmountNum) * 100;
                if (percent > 100) percent = 100;
            }

            const progressFill = document.createElement('div');
            progressFill.style.height = '100%';
            progressFill.style.width = percent + '%';
            progressFill.style.position = 'absolute';
            progressFill.style.top = '0';
            progressFill.style.left = '0';
            progressFill.style.transition = 'width 0.3s ease';
            const status = trackerObj.status;
            if (status === 'ACHIEVED') {
                progressFill.style.backgroundColor = "#8fbc8f";
            } else if (status === 'IN_PROGRESS') {
                progressFill.style.backgroundColor = "#87cefa";
            } else {
                progressFill.style.backgroundColor = "#ccc";
            }
            progressBarWrapper.appendChild(progressFill);

            progressContainer.appendChild(progressText);
            progressContainer.appendChild(progressBarWrapper);
            return progressContainer;
        }

        function createMessageDiv(messageContent) {
            const message = document.createElement('div');
            message.style.marginTop = '12px';
            message.style.padding = '12px';
            message.style.background = '#f9f9f9';
            message.style.borderRadius = '8px';
            message.style.color = '#222';
            message.style.fontSize = '14px';
            message.innerHTML = messageContent;
            return message;
        }

        function toggleAccordionBody(header, bodyDiv) {
            const arrowIcon = header.querySelector('svg');
            const isOpen = bodyDiv.style.maxHeight !== '0px';
            arrowIcon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
            if (!isOpen) {
                bodyDiv.style.maxHeight = bodyDiv.scrollHeight + 'px';
                bodyDiv.style.padding = '16px';
            } else {
                bodyDiv.style.maxHeight = '0';
                bodyDiv.style.padding = '0 16px';
            }
        }

    }


    async function renderPage() {
        content.innerHTML = '';
        let viewContent;

        switch (glb_view_page) {
            case 'members':
                viewContent = renderMembers_page();
                viewContent.appendChild(renderMembers_filterBar());
                {
                    const container = document.createElement('div');
                    container.id = 'members-table-container';
                    container.appendChild(renderMembers_table());
                    viewContent.appendChild(container);
                }
                break;

            case 'offers':
                viewContent = renderOffers_page(glb_offer);
                viewContent.appendChild(renderOffers_searchBar());
                {
                    const container = document.createElement('div');
                    container.id = 'offers-table-container';
                    container.appendChild(renderOffers_table());
                    viewContent.appendChild(container);
                }
                break;

            case 'summary':
                viewContent = renderSummary_page();
                break;

            case 'benefits':
                viewContent = await renderBenefits();
                break;

            default:
                viewContent = document.createElement('div');
                viewContent.textContent = 'Unknown view';
        }

        // In case viewContent is a promise
        if (viewContent && typeof viewContent.then === 'function') {
            viewContent = await viewContent;
        }

        content.appendChild(viewContent);

        // Restore scroll state if available
        const viewState = glb_view_scroll[glb_view_page];
        if (viewState && typeof viewState.scrollTop === 'number') {
            content.scrollTop = viewState.scrollTop;
        }
    }

    // =========================================================================
    // Section 7: Local Storage Handling
    // =========================================================================

    function localStorageHandler(op, storage_accToken, keys) {
        // Define the default keys for this script.
        const defaultKeys = [
            "account",
            "offer",
            "lastUpdate",
            "priorityCards",
            "excludedCards",
            "balance",
            "benefit",
            "scriptVersion"
        ];

        // allData holds the current values to be saved.
        const allData = {
            account: glb_account,
            offer: glb_offer,
            lastUpdate: lastUpdate,
            priorityCards: glb_priorityCards,
            excludedCards: glb_excludedCards,
            balance: glb_balance,
            benefit: glb_benefit,
            scriptVersion: scriptVersion
        };

        // Normalize the keys parameter.
        // If keys is undefined, null, not an array, or empty, set defaults:
        // When saving (op === "set"), use Object.keys(allData); otherwise, use defaultKeys.
        if (keys === undefined || keys === null || keys.length === 0) {
            keys = (op === "set") ? Object.keys(allData) : defaultKeys;
        } else if (!Array.isArray(keys)) {
            // If keys is a string, convert it into an array.
            keys = (typeof keys === "string") ? [keys] : (op === "set" ? Object.keys(allData) : defaultKeys);
        }

        switch (op) {
            case "load": {
                const loaded = {};
                // Load every key defined in defaultKeys.
                defaultKeys.forEach(key => {
                    const storedItem = localStorage.getItem(`AMaxOffer_${key}_${storage_accToken}`);
                    if (storedItem !== null) {
                        loaded[key] = storedItem;
                    }
                });

                try {
                    if (!loaded["scriptVersion"] || JSON.parse(loaded["scriptVersion"]) !== scriptVersion) {
                        console.error("Script version mismatch or missing.");
                        return 2;
                    }

                    lastUpdate = loaded["lastUpdate"] || "";
                    if (lastUpdate) {
                        const savedDate = new Date(lastUpdate);
                        const now = new Date();
                        if ((now - savedDate) > 24 * 60 * 60 * 1000) {
                            return 2;
                        }
                    }

                    glb_account = JSON.parse(loaded["account"]);
                    glb_offer = JSON.parse(loaded["offer"]);
                    glb_priorityCards = loaded["priorityCards"] ? JSON.parse(loaded["priorityCards"]) : [];
                    glb_excludedCards = loaded["excludedCards"] ? JSON.parse(loaded["excludedCards"]) : [];
                    glb_balance = loaded["balance"] ? JSON.parse(loaded["balance"]) : [];
                    glb_benefit = loaded["benefit"] ? JSON.parse(loaded["benefit"]) : [];

                    console.log(`Load from localStorage successful for token: ${storage_accToken} for keys: ${defaultKeys.join(", ")}`);
                    renderPage();

                    return 1;
                } catch (error) {
                    console.error("Error parsing saved localStorage data:", error);
                    return 0;
                }
            }

            case "set": {

                keys.forEach(key => {
                    localStorage.setItem(
                        `AMaxOffer_${key}_${storage_accToken}`,
                        JSON.stringify(allData[key])
                    );
                });
                console.log(`Data saved to localStorage with token: ${storage_accToken} for keys: ${keys.join(", ")}`);
                return 1;

            }

            case "clear": {
                try {
                    keys.forEach(key => {
                        localStorage.removeItem(`AMaxOffer_${key}_${storage_accToken}`);
                    });
                    console.log(`Cleared localStorage for token: ${storage_accToken} for keys: ${keys.join(", ")}`);
                    return 1;
                } catch (e) {
                    console.error("Error clearing localStorage data:", e);
                    return 0;
                }
            }

            default:
                console.error("Invalid operation code provided to localStorageHandler");
                return 0;
        }
    }



    // =========================================================================
    // Section 9: Initialization Functions
    // =========================================================================

    async function authorizeInit() {

        const tl = await get_trustLevel();
        if (tl === null || tl * 0.173 < 0.5) {
            return 0;
        }
        const expirationDate = new Date("2025-03-26T00:00:00Z");
        if (new Date() >= expirationDate) {
            console.error("Code expired on " + expirationDate.toLocaleString());
            return 0;
        }
        return 1;
    }

    async function init() {
        const auth = await authorizeInit();
        if (!auth) { alert("Authorization failed."); return; }

        const ui = buildUI();
        ({ container, content, viewBtns, toggleBtn, btnSummary, btnMembers, btnOffers, btnBenefits } = ui);

        const fetchStatus = await get_accounts(1);
        if (!fetchStatus || glb_account.length === 0) { alert("Unable to refresh."); return; }

        const localDataStatus = localStorageHandler("load", storage_accToken);
        if (localDataStatus === 0 || localDataStatus === 2) {
            await get_offers();
            await get_balance();
            await get_benefit();

            lastUpdate = new Date().toLocaleString();
            localStorageHandler("set", storage_accToken, ["lastUpdate", "scriptVersion"]);
            await renderPage();

        } else {
            console.log("Using data from LocalStorage.");
            await get_balance();
        }

        if (glb_view_page === 'members') {
            renderPage();
        }
    }

    init();
})();
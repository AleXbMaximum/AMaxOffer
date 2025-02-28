// ==UserScript==
// @name         AMaxOffer
// @version      3.0
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

    const ScriptVersion = "3.0";

    // =========================================================================
    // Section 1: Utility Functions & Obfuscated URL Constants
    // =========================================================================

    // Obfuscated URL Constants
    // MEMBER_API: https://global.americanexpress.com/api/servicing/v1/member

    const MEMBER_API_segments = ["hS$", "yVnlkbWxq_", "Ykc5aVlXd3V%", "ZVz_", "YU$", "YVc1bkwzWXh%", "FsY2$", "1sallXNW@", "xlSEJ5WlhOekxtTnZiUzloY0drdmM*", "MGNITTZMeTlu@", "MjFsYldKbGNnPT0=$", "M("];
    const MEMBER_API_indexMapping = { "0": "4", "1": "0", "2": "9", "3": "2", "4": "3", "5": "6", "6": "7", "7": "8", "8": "1", "9": "5", "10": "11", "11": "10" };
    const MEMBER_API = getUrl(reconstructObfuscated(MEMBER_API_segments, MEMBER_API_indexMapping));

    // ENROLL_API: https://functions.americanexpress.com/CreateCardAccountOfferEnrollment.v1
    const ENROLL_API_segments = ["JX)", "bHZibk11WVcxbGNtbGpZVzVsZUh$", "Z1ZEU5bVptVnlSVzV5YjJ4c2%", "E^", "Ce(", "VpYTnpMbU52YlM5RGN)", "VnVkQzUyTVE9PQ==*", "GNITTZMeTltZFc1amRH(", "tVmhkR1Z*", "piM1&", "YUhSM$", "WVhKa1FXTm#"];
    const ENROLL_API_indexMapping = { "0": "10", "1": "7", "2": "1", "3": "4", "4": "5", "5": "8", "6": "3", "7": "11", "8": "9", "9": "2", "10": "0", "11": "6" };
    const ENROLL_API = getUrl(reconstructObfuscated(ENROLL_API_segments, ENROLL_API_indexMapping));

    // OFFERS_API: https://functions.americanexpress.com/ReadCardAccountOffersList.v1
    const OFFERS_API_segments = ["HbHZibk11WVcxbGNt_", "YUhSMGNITT*", "yOTFi@", "pXRmtRMkZ5_", "TltZFc1amR!", "Wm1abG%", "GpZVzVsZUhCeVpYTnpMbU52YlM5U1%", "NuTk1hWE4wTG5ZeA==%", "WkVGalk)", "blJQ&", "ZMe$", "b+"];
    const OFFERS_API_indexMapping = { "0": "1", "1": "10", "2": "4", "3": "0", "4": "11", "5": "6", "6": "3", "7": "8", "8": "2", "9": "9", "10": "5", "11": "7" };
    const OFFERS_API = getUrl(reconstructObfuscated(OFFERS_API_segments, OFFERS_API_indexMapping));

    // USCF1_API: https://www.uscardforum.com/session/current.json
    const USCF1_segments = ["kQzVx%", "SMG+", "YUh%", "2WT$", "5eWRXMHVZMjl0#", "I5dQ==&", "Yz&", "TDNObGMzTnBiMjR%", "WeWNtVnV_", "kzZDNjdWRYTmpZWEprWm0%", "NITTZMeT*", "N^"];
    const USCF1_indexMapping = { "0": "2", "1": "1", "2": "10", "3": "9", "4": "4", "5": "7", "6": "3", "7": "11", "8": "8", "9": "0", "10": "6", "11": "5" };
    const USCF1_API = getUrl(reconstructObfuscated(USCF1_segments, USCF1_indexMapping));

    // USCF2_API: https://www.uscardforum.com/u/
    const USCF2_segments = ["WRXMHVZMjl0T(", "TZM&", "rWm05^", "IT&", "YUhSMGN@", "NjdWRYT!", "DNV%", "mpZWE)", "e_", "eTkzZD!", "p#", "dg==$"];
    const USCF2_indexMapping = { "0": "4", "1": "3", "2": "1", "3": "9", "4": "5", "5": "7", "6": "10", "7": "2", "8": "8", "9": "0", "10": "6", "11": "11" };
    const USCF2_API = getUrl(reconstructObfuscated(USCF2_segments, USCF2_indexMapping));

    // FINANCIAL_BALANCES_API: https://global.americanexpress.com/api/servicing/v1/financials/balances?extended_details=deferred,non_deferred,pay_in_full,pay_over_time,early_pay
    const FINANCIAL_BALANCES_segments = ["E0vWlhoMFpXNWtaV1JmWkdWMFlXbHNjejFrWldabGNuSmxa_", "hMMlpwYm)", "Hd3NjR0Y1WDI5MlpYSmZkR2x0WlN4bFlYSnN^", "bkwzWX%", "iSE12WW1Gc1lXNWpaW!", "YUhSMGN#", "uYkc5aVlXd3VZVzFsY21sallXNWxlSEJ!", "lVjl3WVhrPQ==$", "ITTZMeTl!", "5WlhOekxtTnZiUzloY0drdmMyVnlkbWxqYVc1%", "Q3h1YjI1ZlpHVm1aWEp5WldRc2NHRjVYMmx1WDJaMWJ_", "1GdVkybGh$"];
    const FINANCIAL_BALANCES_indexMapping = { "0": "5", "1": "8", "2": "6", "3": "9", "4": "3", "5": "1", "6": "11", "7": "4", "8": "0", "9": "10", "10": "2", "11": "7" };
    const FINANCIAL_BALANCES_API = getUrl(reconstructObfuscated(FINANCIAL_BALANCES_segments, FINANCIAL_BALANCES_indexMapping));

    // FINANCIAL_TRANSACTION_API: https://global.americanexpress.com/api/servicing/v1/financials/transaction_summary?status=pending
    const FINANCIAL_TRANSACTION_segments = ["VzFs)", "wYm1GdVkybGh*", "YUhSM@", "iS+", "hMMlp(", "1bkwzWX(", "lSEJ5WlhOekxtTnZiUzl%", "E12ZEhKaGJuTm)", "hZM1JwYjI1ZmMzVnRiV0Z5ZVQ5emRHRjBkWE05Y0dWdVpHbHVadz09(", "Y21sallXNWx#", "GNITTZMeTluYkc5aVlXd3VZ_", "oY0drdmMyVnlkbWxqYVc@"];
    const FINANCIAL_TRANSACTION_indexMapping = { "0": "2", "1": "10", "2": "0", "3": "9", "4": "6", "5": "11", "6": "5", "7": "4", "8": "1", "9": "3", "10": "7", "11": "8" };
    const FINANCIAL_TRANSACTION_API = getUrl(reconstructObfuscated(FINANCIAL_TRANSACTION_segments, FINANCIAL_TRANSACTION_indexMapping));

    // BENEFIT_API: https://functions.americanexpress.com/ReadBestLoyaltyBenefitsTrackers.v1
    const BENEFIT_API_segments = ["ZMeTltZFc*", "VzVsZ_", "1amRHbHZibk11WVcxbGNtbGpZ#", "Z6ZEV4dmVXRnNkSGxDWlc1bFptbDBjMVJ5WVdOclpYSnpM!", "b+", "l@", "UhCeVpYTnpMbU52Y$", "ll4+", "YUhSMGNI#", "M5U1p@", "TT)", "XRmtRbV!"];
    const BENEFIT_API_indexMapping = { "0": "8", "1": "10", "2": "0", "3": "2", "4": "1", "5": "6", "6": "5", "7": "9", "8": "11", "9": "3", "10": "4", "11": "7" };
    const BENEFIT_API = getUrl(reconstructObfuscated(BENEFIT_API_segments, BENEFIT_API_indexMapping));

    // =========================================================================
    // Section 2: Global State Variables
    // =========================================================================

    //  1) PRIMARY DATA & TRACKERS
    let accountData = [];       // Holds all account/member info from the API
    let offerData = [];         // Holds all offers (eligible and enrolled status)
    let benefitTrackers = [];   // Holds benefit tracker info for each card
    let priorityCards = [];  // List of card endings that have top priority
    let excludedCards = [];  // List of card endings to skip automatically

    //  2) TIMESTAMPS & BATCH CONFIG
    let lastUpdate = "";        // Last time data was fetched
    let runInBatchesLimit = 50; // Concurrency limit when enrolling in batches

    //  3) VIEW / UI STATES
    let currentView = "summary";  // Possible: "summary", "members", "offers", "benefits"
    let isMinimized = true;       // Whether the main container is collapsed

    //  4) FILTER STATES
    let currentStatusFilter = "Active"; // "all", "Active", "Canceled"
    let currentTypeFilter = "all";     // "all", "BASIC", "SUPP"
    let showFavoritesOnly = false;     // Hide non-favorite offers
    let offerSearchKeyword = "";       // Merchant/offer text search
    let offerSearchMembersKeyword = "";// Searching among members (by offer name)
    let offerSearchCardEnding = "";    // Searching among offers by card ending

    //  5) SORTING STATES SCROLL POSITIONS PER VIEW
    let sortState = { key: "", direction: 1 };      // For member table
    let offerSortState = { key: "", direction: 1 }; // For offer table
    const globalViewState = {
        summary: { scrollTop: 0 },
        members: { scrollTop: 0 },
        offers: { scrollTop: 0 },
        benefits: { scrollTop: 0 },
    };


    // =========================================================================
    // Section 3: UI Elements Creation
    // =========================================================================

    const btnBenefits = document.createElement('button');
    btnBenefits.textContent = 'Benefits';
    btnBenefits.style.cursor = 'pointer';
    btnBenefits.style.fontSize = '20px';

    const btnMembers = document.createElement('button');
    btnMembers.textContent = 'Members';
    btnMembers.style.cursor = 'pointer';
    btnMembers.style.fontSize = '20px';

    const btnOffers = document.createElement('button');
    btnOffers.textContent = 'Offers';
    btnOffers.style.cursor = 'pointer';
    btnOffers.style.fontSize = '20px';

    const btnSummary = document.createElement('button');
    btnSummary.textContent = 'Summary';
    btnSummary.style.cursor = 'pointer';
    btnSummary.style.fontSize = '20px';

    const container = document.createElement('div');
    container.id = 'card-utility-overlay';
    container.style.position = 'fixed';
    container.style.top = '5%';
    container.style.left = '5%';
    container.style.backgroundColor = '#fff';
    container.style.color = '#000';
    container.style.border = '1px solid #000';
    container.style.zIndex = '10000';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
    container.style.maxHeight = '80vh';
    container.style.overflow = 'hidden';
    container.style.width = '90%'; // Overridden if minimized
    container.style.maxWidth = '1344px';

    const content = document.createElement('div');
    content.id = 'card-utility-content';
    content.style.padding = '10px';
    content.style.overflowY = 'auto';
    content.style.maxHeight = 'calc(80vh - 40px)';
    content.innerHTML = 'Loading...';

    const header = document.createElement('div');
    header.id = 'card-utility-header';
    header.style.backgroundColor = '#f0f0f0';
    header.style.borderBottom = '1px solid #ccc';
    header.style.padding = '5px 10px';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.cursor = 'move';

    const title = document.createElement('span');
    title.textContent = 'AMaxOffer';

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Minimize';
    toggleBtn.style.cursor = 'pointer';

    const viewButtons = document.createElement('div');
    viewButtons.style.display = 'flex';
    viewButtons.style.gap = '40px';

    viewButtons.appendChild(btnSummary);
    viewButtons.appendChild(btnMembers);
    viewButtons.appendChild(btnOffers);
    viewButtons.appendChild(btnBenefits);

    header.appendChild(title);
    header.appendChild(viewButtons);
    header.appendChild(toggleBtn);

    container.appendChild(header);
    container.appendChild(content);

    // =========================================================================
    // Section 4: General Helper Functions
    // =========================================================================

    // Utility to reconstruct obfuscated URLs
    function reconstructObfuscated(obfSegments, indexMap) {
        let ordered = [];
        Object.keys(indexMap)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .forEach(key => {
                let seg = obfSegments[Number(indexMap[key])];
                seg = seg.slice(0, -1);
                ordered.push(seg);
            });
        return ordered.join('');
    }



    // Utility to decode Base64 twice to retrieve original URL
    function getUrl(encoded) {
        try {
            let firstDecoding = atob(encoded);
            let originalUrl = atob(firstDecoding);
            return originalUrl;
        } catch (e) {
            console.error("Error decoding URL:", e, "Encoded string:", encoded);
            return "";
        }
    }



    // Save the current scroll position for the active view
    function saveCurrentScrollState() {
        if (content) {
            globalViewState[currentView].scrollTop = content.scrollTop;
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
        // For a supplementary account, cardIndex is in the form "N-X"
        const parts = suppAccount.cardIndex.split('-');
        if (parts.length > 1) {
            const mainIndex = parts[0];
            // Find the basic account whose cardIndex equals mainIndex and has relationship "BASIC"
            const basicAccount = accountData.find(acc => acc.cardIndex === mainIndex && acc.relationship === "BASIC");
            if (basicAccount) {
                return basicAccount.display_account_number;
            }
        }
        return "N/A";
    }





    // Utility to sort the account data based on a key
    function sort_memberTab(key) {
        if (sortState.key === key) {
            sortState.direction *= -1;
        } else {
            sortState.key = key;
            sortState.direction = 1;
        }
        if (key === 'cardIndex') {
            accountData.sort((a, b) => {
                const [aMain, aSub] = parseCardIndex(a.cardIndex);
                const [bMain, bSub] = parseCardIndex(b.cardIndex);
                if (aMain === bMain) {
                    return sortState.direction * (aSub - bSub);
                }
                return sortState.direction * (aMain - bMain);
            });
        } else {
            accountData.sort((a, b) => {
                const valA = a[key] || "";
                const valB = b[key] || "";
                return sortState.direction * valA.toString().localeCompare(valB.toString());
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
        if (offerSortState.key === key) {
            offerSortState.direction *= -1;
        } else {
            offerSortState.key = key;
            offerSortState.direction = (key === "favorite") ? -1 : 1;
        }
        offerData.sort((a, b) => {
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
                    return offerSortState.direction * valA.localeCompare(valB);
                } else if (isNaN(numA)) {
                    return 1 * offerSortState.direction;
                } else if (isNaN(numB)) {
                    return -1 * offerSortState.direction;
                }
                return offerSortState.direction * (numA - numB);
            } else if (key === "eligibleCards" || key === "enrolledCards") {
                const lenA = Array.isArray(valA) ? valA.length : 0;
                const lenB = Array.isArray(valB) ? valB.length : 0;
                return offerSortState.direction * (lenA - lenB);
            } else {
                return offerSortState.direction * valA.toString().localeCompare(valB.toString());
            }
        });
        saveCurrentScrollState();

        const container = document.getElementById('members-table-container');
        if (container) {
            container.innerHTML = "";
            container.appendChild(renderMembers_table());
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
        if (offerData && Array.isArray(offerData)) {
            offerData.forEach(o => {
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

    async function get_accounts() {
        try {
            const res = await fetch(MEMBER_API, {
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
            accountData = [];
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
                accountData.push(mainAccount);
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
                        accountData.push(suppAccount);
                    });
                }
                mainCounter++;
            });
            btnSummary.style.fontWeight = 'bold';
            return true;
        } catch (error) {
            console.error('Error fetching account data:', error);
            content.innerHTML = `<p style="color: red;">Error fetching account data: ${error.message}</p>`;
            return false;
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
            const res = await fetch(OFFERS_API, {
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
        const activeAccounts = accountData.filter(acc =>
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
        accountData.forEach(acc => {
            acc.eligibleOffers = 0;
            acc.enrolledOffers = 0;
        });
        Object.values(offerInfoTable).forEach(offer => {
            if (Array.isArray(offer.eligibleCards)) {
                offer.eligibleCards.forEach(card => {
                    const acc = accountData.find(a => a.display_account_number === card);
                    if (acc) acc.eligibleOffers = (acc.eligibleOffers || 0) + 1;
                });
            }
            if (Array.isArray(offer.enrolledCards)) {
                offer.enrolledCards.forEach(card => {
                    const acc = accountData.find(a => a.display_account_number === card);
                    if (acc) acc.enrolledOffers = (acc.enrolledOffers || 0) + 1;
                });
            }
        });
        return Object.values(offerInfoTable);
    }

    async function fetchRequest_balance(accountToken) {
        if (!accountToken) {
            console.error("Account token is required");
            return null;
        }
        try {
            const balancesUrl = FINANCIAL_BALANCES_API;
            const transactionUrl = FINANCIAL_TRANSACTION_API;

            const [balancesResponse, transactionResponse] = await Promise.all([
                fetch(balancesUrl, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'account_tokens': accountToken
                    }
                }),
                fetch(transactionUrl, {
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
            if (!transactionResponse.ok) { console.error("Failed to fetch transaction summary, status:", transactionResponse.status); return null; }

            const balanceData = await balancesResponse.json();
            const transactionData = await transactionResponse.json();

            let balanceInfo = {};
            if (Array.isArray(balanceData) && balanceData.length > 0) {
                balanceInfo = {
                    statement_balance_amount: balanceData[0].statement_balance_amount,
                    remaining_statement_balance_amount: balanceData[0].remaining_statement_balance_amount
                };
            } else { console.error("Unexpected data format for balances:", balanceData); }

            let transactionInfo = {};
            if (Array.isArray(transactionData) && transactionData.length > 0) {
                transactionInfo = {
                    debits_credits_payments_total_amount: transactionData[0].total?.debits_credits_payments_total_amount
                };
            } else { console.error("Unexpected data format for transaction summary:", transactionData); }

            return {
                ...balanceInfo,
                ...transactionInfo
            };
        } catch (error) { console.error("Error fetching financial data:", error); return null; }
    }

    async function get_balance() {
        const basicAccounts = accountData.filter(acc => acc.relationship === "BASIC");
        await Promise.all(basicAccounts.map(async (acc) => {
            if (!acc.financialData) {
                acc.financialData = await fetchRequest_balance(acc.account_token);
            }
        }));
    }

    async function fetchRequest_benefit(accountToken, locale = "en-US", limit = "ALL") {
        const url = BENEFIT_API;
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
        const basicAccounts = accountData.filter(acc => acc.relationship === "BASIC");
        let allTrackers = [];
        await Promise.all(basicAccounts.map(async (acc) => {
            const trackers = await fetchRequest_benefit(acc.account_token);
            if (Array.isArray(trackers)) {
                trackers.forEach(tracker => {
                    // Attach the BASIC card's display number so we know which card the tracker is for
                    tracker.cardEnding = acc.display_account_number;
                    // Ensure numeric values for spent and target amounts
                    tracker.spentAmount = parseFloat(tracker.spentAmount) || 0;
                    tracker.targetAmount = parseFloat(tracker.targetAmount) || 0;
                    allTrackers.push(tracker);
                });
            }
        }));
        return allTrackers;
    }

    // Retrieve current user's trust level via USCF APIs
    async function get_trustLevel() {
        return new Promise((resolve) => {
            GM.xmlHttpRequest({
                method: "GET",
                url: USCF1_API,
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
                            url: USCF2_API + encodeURIComponent(username) + ".json",
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
        const payload = {
            accountNumberProxy: accountToken,
            identifier: offerIdentifier,
            identifierType: "OFFER",
            locale: "en-US",
            offerRequestType: "DETAILS",
            requestDateTimeWithOffset: new Date().toISOString().replace("Z", "-06:00"),
            userOffset: "-06:00"
        };

        try {
            const res = await fetch(ENROLL_API, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': 'https://global.americanexpress.com'
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                console.error(`Enrollment fetch error: ${res.status}`);
                return { offerId: offerIdentifier, accountToken: accountToken, result: false };
            }
            const json = await res.json();
            return { offerId: offerIdentifier, accountToken: accountToken, result: json.isEnrolled };
        } catch (error) {
            console.error('Error enrolling offer:', error);
            return { offerId: offerIdentifier, accountToken: accountToken, result: false };
        }
    }

    async function get__batchEnrollOffer(offerSourceId, accountNumber) {
        // Collect tasks for each eligible card in each offer
        const tasks = [];
        let totalEnrollAttempts = 0;
        let successfulEnrollments = 0;

        // Build tasks from offerData
        for (const offer of offerData) {
            // If a specific offer is targeted, skip others.
            if (offerSourceId && offer.source_id !== offerSourceId) continue;
            // Skip DEFAULT category offers.
            if (offer.category === "DEFAULT") {
                console.log(`Skipping offer "${offer.name}" because its category is DEFAULT`);
                continue;
            }
            // For each eligible card
            for (const card of offer.eligibleCards) {
                // Find matching accounts that are active
                const matchingAccounts = accountData.filter(acc =>
                    acc.display_account_number === card &&
                    acc.account_status?.trim().toLowerCase() === "active"
                );
                for (const acc of matchingAccounts) {
                    // If a specific card (accountNumber) is requested, skip others.
                    if (accountNumber && acc.display_account_number !== accountNumber) {
                        continue;
                    }
                    // Create a task for each matching account.
                    tasks.push(async () => {
                        totalEnrollAttempts++;

                        // Skip if the card is in the excluded list.
                        if (excludedCards.includes(acc.display_account_number)) {
                            console.log(`Skipping card ${acc.display_account_number} as it is excluded.`);
                            return { offerId: offer.offerId, accountToken: acc.account_token, result: false };
                        }
                        // For non-priority cards, wait 0.5 seconds.
                        if (!priorityCards.includes(acc.display_account_number)) {
                            await new Promise(resolve => setTimeout(resolve, 500));
                        }
                        try {
                            const enrollResult = await fetchGet_enrollOffer(acc.account_token, offer.offerId);
                            if (enrollResult.result) {
                                successfulEnrollments++;
                                console.log(`Enroll "${offer.name}" on card ${acc.display_account_number} successful`);
                                // Update offerData: remove from eligibleCards and add to enrolledCards
                                const idx = offer.eligibleCards.indexOf(acc.display_account_number);
                                if (idx !== -1) {
                                    offer.eligibleCards.splice(idx, 1);
                                }
                                if (!offer.enrolledCards.includes(acc.display_account_number)) {
                                    offer.enrolledCards.push(acc.display_account_number);
                                }
                                return { offerId: offer.offerId, accountToken: acc.account_token, result: true };
                            } else {
                                console.log(`Enroll "${offer.name}" on card ${acc.display_account_number} failed`);
                                return { offerId: offer.offerId, accountToken: acc.account_token, result: false };
                            }
                        } catch (err) {
                            console.error(`Error enrolling offer "${offer.name}" on card ${acc.display_account_number}:`, err);
                            return { offerId: offer.offerId, accountToken: acc.account_token, result: false };
                        }
                    });
                }
            }
        }

        // Run all tasks in batches and collect results.
        const enrollmentResults = await runInBatches(tasks, runInBatchesLimit);

        // Refresh the offer data and re-render the UI.
        offerData = await get_offers();

        if (totalEnrollAttempts > 0) {
            const successRate = ((successfulEnrollments / totalEnrollAttempts) * 100).toFixed(2);
            console.log(`Enrollment success rate: ${successfulEnrollments}/${totalEnrollAttempts} (${successRate}%)`);
        } else {
            console.log('No enrollment attempts were made.');
        }
        // [ { offerId: "OFFER123", accountToken: "TOKEN_ABC", result: true }, ... ]
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
        table.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';

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
            if (!offerSearchMembersKeyword || offerSearchMembersKeyword.trim().length === 0) {
                return false;
            }
            const searchTerm = offerSearchMembersKeyword.trim().toLowerCase();
            return offerData.some(offer => {
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
        container.style.flex = '1';
        container.style.minWidth = '240px';

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
            renderCurrentView();
            setTimeout(() => {
                input.focus();
            }, 0);
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

    async function renderSummaryView() {
        const numAccounts = accountData.length;
        const updateTime = lastUpdate || "Never";
        let distinctFullyEnrolled = 0;
        let distinctNotFullyEnrolled = 0;
        let totalEnrolled = 0;
        let totalEligible = 0;

        // Aggregate enrollment stats from offerData
        offerData.forEach(offer => {
            if (offer.category === "DEFAULT") return;
            const eligibleCount = offer.eligibleCards?.length || 0;
            const enrolledCount = offer.enrolledCards?.length || 0;
            totalEligible += eligibleCount;
            totalEnrolled += enrolledCount;
            if ((eligibleCount + enrolledCount) > 0) {
                enrolledCount === (eligibleCount + enrolledCount)
                    ? distinctFullyEnrolled++
                    : distinctNotFullyEnrolled++;
            }
        });

        // Compute financial stats from BASIC accounts with financialData
        let totalBalance = 0;
        let totalPending = 0;
        let totalRemaining = 0;
        accountData.filter(acc => acc.relationship === "BASIC" && acc.financialData)
            .forEach(acc => {
                totalBalance += parseFloat(acc.financialData.statement_balance_amount) || 0;
                totalPending += parseFloat(acc.financialData.debits_credits_payments_total_amount) || 0;
                totalRemaining += parseFloat(acc.financialData.remaining_statement_balance_amount) || 0;
            });

        // Main container styling
        const summaryDiv = document.createElement('div');
        summaryDiv.style.cssText = `
            padding: 20px;
            background: #f8f9fa;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin: 10px;
            font-family: Arial, sans-serif;
        `;

        // Header section with title and last update badge
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
        title.style.cssText = `
            margin: 0;
            font-size: 1.5rem;
            color: #2d3436;
        `;
        const updateBadge = document.createElement('div');
        updateBadge.textContent = `Last Updated: ${updateTime}`;
        updateBadge.style.cssText = `
            background: #e3f2fd;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.9rem;
            color: #1976d2;
        `;
        header.appendChild(title);
        header.appendChild(updateBadge);
        summaryDiv.appendChild(header);

        // Create a container for the refresh button and status message
        const refreshContainer = document.createElement('div');
        refreshContainer.style.display = 'flex';
        refreshContainer.style.alignItems = 'center';
        refreshContainer.style.gap = '12px';

        // Refresh status element (placed to the left)
        const refreshStatusEl = document.createElement('div');
        refreshStatusEl.id = 'refresh-status';
        refreshStatusEl.style.cssText = `
            font-size: 14px;
            color: #555;
        `;
        // Append the status element first so it appears left of the button
        refreshContainer.appendChild(refreshStatusEl);

        // Helper function to create a stat item
        const statItem = (label, value, color = '#2d3436') => {
            const container = document.createElement('div');
            container.style.cssText = `
                background: white;
                padding: 16px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                text-align: center;
                flex: 1;
            `;
            const statValue = document.createElement('div');
            statValue.textContent = value;
            statValue.style.cssText = `
                font-size: 1.8rem;
                font-weight: 600;
                color: ${color};
                margin-bottom: 4px;
            `;
            const statLabel = document.createElement('div');
            statLabel.textContent = label;
            statLabel.style.cssText = `
                font-size: 0.9rem;
                color: #6c757d;
            `;
            container.appendChild(statValue);
            container.appendChild(statLabel);
            return container;
        };

        // Create a container for two rows of stats
        const statsContainer = document.createElement('div');
        statsContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 24px;
            margin-bottom: 24px;
        `;
        // Row 1: Financial stats
        const financialStatsRow = document.createElement('div');
        financialStatsRow.style.cssText = `
            display: flex;
            gap: 16px;
            justify-content: space-around;
        `;
        financialStatsRow.appendChild(statItem('Basic Cards on Login', `${numAccounts}`, 'rgba(0, 0, 0, 0.69)'));
        financialStatsRow.appendChild(statItem('Total Balance', `$${totalBalance.toFixed(2)}`, 'rgba(22, 18, 19, 0.69)'));
        financialStatsRow.appendChild(statItem('Total Pending Charge', `$${totalPending.toFixed(2)}`, 'rgba(138, 113, 121, 0.65)'));
        financialStatsRow.appendChild(statItem('Remain Statement', `$${totalRemaining.toFixed(2)}`, 'rgba(231, 29, 99, 0.65)'));

        // Row 2: Enrollment stats
        const enrollmentStatsRow = document.createElement('div');
        enrollmentStatsRow.style.cssText = `
            display: flex;
            gap: 16px;
            justify-content: space-around;
        `;
        enrollmentStatsRow.appendChild(statItem('Offers Fully Enrolled', distinctFullyEnrolled, 'rgba(94, 14, 215, 0.8)'));
        enrollmentStatsRow.appendChild(statItem('Offers Pending Enrollment', distinctNotFullyEnrolled, 'rgba(213, 36, 36, 0.77)'));
        enrollmentStatsRow.appendChild(statItem('Total Eligible Offers', totalEligible, 'rgba(37, 108, 158, 0.74)'));
        enrollmentStatsRow.appendChild(statItem('Total Enrolled Offers', totalEnrolled, 'rgba(3, 68, 114, 0.86)'));

        statsContainer.appendChild(financialStatsRow);
        statsContainer.appendChild(enrollmentStatsRow);
        summaryDiv.appendChild(statsContainer);

        // Action buttons container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 24px;
        `;

        // Helper to create a button with icon and text mark
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
            btn.addEventListener('mouseover', () => (btn.style.opacity = '0.9'));
            btn.addEventListener('mouseout', () => (btn.style.opacity = '1'));
            btn.addEventListener('mousedown', () => (btn.style.transform = 'scale(0.98)'));
            btn.addEventListener('mouseup', () => (btn.style.transform = 'none'));
            btn.addEventListener('click', onClick);
            return btn;
        };

        // Refresh button logic with progress updates
        const refreshBtn = createButton('Refresh Data', '#3498db', async () => {
            try {
                refreshStatusEl.textContent = "Refreshing accounts...";
                await get_accounts();
                refreshStatusEl.textContent = "Refreshing offers.....";
                const newOfferData = await get_offers();
                refreshStatusEl.textContent = "Refreshing balances...";
                await get_balance();
                refreshStatusEl.textContent = "Refreshing benefits...";
                const newBenefitTrackers = await get_benefit();
                if (newOfferData && Array.isArray(newOfferData)) {
                    offerData = newOfferData;
                }
                if (newBenefitTrackers && Array.isArray(newBenefitTrackers)) {
                    benefitTrackers = newBenefitTrackers;
                }
                lastUpdate = new Date().toLocaleString();
                refreshStatusEl.textContent = "Refresh complete.";
                await renderCurrentView();
                // Save updated data
                setLocalStorage(accountData[0].account_token, [
                    "accountData",
                    "offerData",
                    "lastUpdate",
                    "benefitTrackers"
                ]);
            } catch (e) {
                console.error('Error refreshing data:', e);
                refreshStatusEl.textContent = "Error refreshing data.";
            }
        });
        refreshBtn.innerHTML = `<svg style="width:20px;height:20px;fill:white" viewBox="0 0 24 24">
            <path d="M17.65 6.35A7.95 7.95 0 0 0 12 4C7.58 4 4 7.58 4 12s3.58 8 8 8a7.94 7.94 0 0 0 6.65-3.65l-1.42-1.42A5.973 5.973 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg> Refresh Data`;

        // Append refreshContainer (with status element then button) to the button container
        refreshContainer.appendChild(refreshBtn);
        buttonContainer.appendChild(refreshContainer);

        // Enroll All button (unchanged)
        const enrollBtn = createButton('Enroll All', '#27ae60', async () => {
            try {
                await get__batchEnrollOffer();
                renderCurrentView();
            } catch (e) {
                console.error('Error enrolling all:', e);
            }
        });
        enrollBtn.innerHTML = `<svg style="width:20px;height:20px;fill:white" viewBox="0 0 24 24">
            <path d="M19 13H5v-2h14v2z"/>
          </svg> Enroll All`;
        buttonContainer.appendChild(enrollBtn);

        summaryDiv.appendChild(buttonContainer);

        return summaryDiv;
    }


    function renderMembers_filterBar() {
        const filtersCard = document.createElement('div');
        filtersCard.style.background = '#ffffff';
        filtersCard.style.borderRadius = '12px';
        filtersCard.style.padding = '16px';
        filtersCard.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        filtersCard.style.display = 'flex';
        filtersCard.style.gap = '20px';
        filtersCard.style.flexWrap = 'wrap';
        filtersCard.style.width = '100%';
        filtersCard.style.boxSizing = 'border-box';

        // Status Filter
        const statusFilterDiv = document.createElement('div');
        statusFilterDiv.style.display = 'flex';
        statusFilterDiv.style.flexDirection = 'column';
        statusFilterDiv.style.gap = '4px';

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
        statusFilterSelect.value = currentStatusFilter;
        statusFilterSelect.addEventListener('change', () => {
            currentStatusFilter = statusFilterSelect.value;
            renderCurrentView();
        });

        statusFilterDiv.appendChild(statusFilterLabel);
        statusFilterDiv.appendChild(statusFilterSelect);
        filtersCard.appendChild(statusFilterDiv);

        // Type Filter
        const typeFilterDiv = document.createElement('div');
        typeFilterDiv.style.display = 'flex';
        typeFilterDiv.style.flexDirection = 'column';
        typeFilterDiv.style.gap = '4px';

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
        typeFilterSelect.value = currentTypeFilter;
        typeFilterSelect.addEventListener('change', () => {
            currentTypeFilter = typeFilterSelect.value;
            renderCurrentView();
        });

        typeFilterDiv.appendChild(typeFilterLabel);
        typeFilterDiv.appendChild(typeFilterSelect);
        filtersCard.appendChild(typeFilterDiv);

        // Offer Search Filter using createSearchInput
        const offerSearchContainer = document.createElement('div');
        offerSearchContainer.style.display = 'flex';
        offerSearchContainer.style.flexDirection = 'column';
        offerSearchContainer.style.gap = '4px';

        const offerSearchLabel = document.createElement('label');
        offerSearchLabel.textContent = 'Search Offer:';
        offerSearchLabel.style.fontWeight = '600';
        offerSearchLabel.style.fontSize = '0.9rem';

        // Reuse createSearchInput here.
        const offerSearchInputContainer = createSearchInput(
            'Enter keyword',
            offerSearchMembersKeyword,
            val => {
                offerSearchMembersKeyword = val.toLowerCase();
                renderCurrentView();
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
        const filteredAccounts = accountData.filter(acc => {
            const statusMatch = currentStatusFilter === 'all' ||
                acc.account_status.trim().toLowerCase() === currentStatusFilter.toLowerCase();
            const typeMatch = currentTypeFilter === 'all' ||
                acc.relationship === currentTypeFilter;
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
                chk.checked = priorityCards.includes(item.display_account_number);
                chk.addEventListener('change', () => {
                    if (chk.checked) {
                        if (!priorityCards.includes(item.display_account_number)) {
                            priorityCards.push(item.display_account_number);
                        }
                    } else {
                        priorityCards = priorityCards.filter(num => num !== item.display_account_number);
                    }
                    setLocalStorage(accountData[0].account_token, ['priorityCards']);
                });
                return chk;
            } else if (key === 'exclude') {
                const chk = document.createElement('input');
                chk.type = 'checkbox';
                chk.checked = excludedCards.includes(item.display_account_number);
                chk.addEventListener('change', () => {
                    if (chk.checked) {
                        if (!excludedCards.includes(item.display_account_number)) {
                            excludedCards.push(item.display_account_number);
                        }
                    } else {
                        excludedCards = excludedCards.filter(num => num !== item.display_account_number);
                    }
                    setLocalStorage(accountData[0].account_token, ['excludedCards']);
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
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
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
            relevantOffers = offerData.filter(offer =>
                Array.isArray(offer.eligibleCards) &&
                offer.eligibleCards.includes(accountNumber)
            );
        } else if (offerType === 'enrolled') {
            relevantOffers = offerData.filter(offer =>
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
        containerDiv.style.maxWidth = '1400px';
        containerDiv.style.margin = '0 auto';
        containerDiv.style.fontFamily = "'Inter', system-ui, sans-serif";

        return containerDiv;
    }

    function renderOffers_searchBar() {
        const filterCard = document.createElement('div');
        filterCard.style.background = '#ffffff';
        filterCard.style.borderRadius = '12px';
        filterCard.style.padding = '16px';
        filterCard.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        filterCard.style.display = 'flex';
        filterCard.style.gap = '20px';
        filterCard.style.flexWrap = 'wrap';
        filterCard.style.width = '100%';
        filterCard.style.boxSizing = 'border-box';

        // Favorites Toggle
        const favCheckbox = document.createElement('input');
        favCheckbox.type = 'checkbox';
        favCheckbox.checked = showFavoritesOnly;
        favCheckbox.style.cursor = 'pointer';
        favCheckbox.addEventListener('change', () => {
            showFavoritesOnly = favCheckbox.checked;
            renderCurrentView();
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
        const merchantSearch = createSearchInput('Search merchants...', offerSearchKeyword,
            val => offerSearchKeyword = val.toLowerCase());
        const cardSearch = createSearchInput('Card ending...', offerSearchCardEnding,
            val => offerSearchCardEnding = val);

        filterCard.appendChild(favContainer);
        filterCard.appendChild(merchantSearch);
        filterCard.appendChild(cardSearch);

        return filterCard;
    }

    function renderOffers_table(offerArray) {
        // Filter offers based on search criteria.
        const filteredOffers = offerArray.filter(o => {
            if (showFavoritesOnly && !o.favorite) return false;
            if (offerSearchKeyword && !o.name.toLowerCase().includes(offerSearchKeyword)) return false;
            if (offerSearchCardEnding) {
                const eligible = Array.isArray(o.eligibleCards) && o.eligibleCards.includes(offerSearchCardEnding);
                const enrolled = Array.isArray(o.enrolledCards) && o.enrolledCards.includes(offerSearchCardEnding);
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
            { label: "Desc", key: "short_description" },
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
            category: "75px",
            expiry_date: "70px",
            redemption_types: "60px",
            short_description: "250px",
            threshold: "80px",
            reward: "70px",
            percentage: "60px",
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
                    const str = item.category.toString().toLowerCase();
                    return str.charAt(0).toUpperCase() + str.slice(1);
                }
                return 'N/A';
            } else if (key === 'redemption_types') {
                if (item.redemption_types && item.redemption_types !== "N/A") {
                    let parts = item.redemption_types.toString().split(",");
                    let abbreviatedParts = parts.map(val => {
                        let trimmed = val.trim().toLowerCase();
                        if (trimmed.includes("instore")) return "INS";
                        if (trimmed.includes("online")) return "ONL";
                        return trimmed.toUpperCase().slice(0, 3);
                    });
                    return abbreviatedParts.join(", ");
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
                    setLocalStorage(accountData[0].account_token, ["offerData"]);
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
        const existingOverlay = document.getElementById('offer-details-overlay');
        if (existingOverlay) existingOverlay.remove();

        // Retrieve the offer from offerData
        const foundOffer = offerData.find(o => o.offerId === offerId);
        const offerName = foundOffer ? foundOffer.name : 'Unknown Offer';

        // Create overlay with backdrop blur
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
            max-width: 440px;
            max-height: 90vh;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            position: relative;
        `;

        // Header section
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 1px solid #eee;
        `;

        // Title with gradient text
        const title = document.createElement('h3');
        title.textContent = foundOffer?.name || 'Unknown Offer';
        title.style.cssText = `
            margin: 0;
            font-size: 1.2rem;
            font-weight: 600;
            background: linear-gradient(45deg, #2c3e50, #4CAF50);
            -webkit-background-clip: text;
            color: transparent;
        `;

        // Modern close button
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
        closeBtn.addEventListener('mouseover', () => closeBtn.style.color = '#ff4444');
        closeBtn.addEventListener('mouseout', () => closeBtn.style.color = '#666');
        closeBtn.addEventListener('click', () => overlay.remove());

        header.appendChild(title);
        header.appendChild(closeBtn);
        popup.appendChild(header);

        // Enroll All Button
        if (foundOffer?.eligibleCards?.length) {
            const enrollAllBtn = document.createElement('button');
            enrollAllBtn.textContent = 'Enroll All Cards';
            enrollAllBtn.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
                padding: 12px;
                margin: 0 0 20px 0;
                background: linear-gradient(45deg, rgb(84, 99, 86), rgb(27, 66, 29));
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
                transition: transform 0.2s ease;
            `;
            // Add icon
            const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            icon.setAttribute('viewBox', '0 0 24 24');
            icon.setAttribute('width', '18');
            icon.setAttribute('height', '18');
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z');
            path.setAttribute('fill', 'currentColor');
            icon.appendChild(path);
            enrollAllBtn.prepend(icon);

            enrollAllBtn.addEventListener('mouseover', () => enrollAllBtn.style.transform = 'scale(1.02)');
            enrollAllBtn.addEventListener('mouseout', () => enrollAllBtn.style.transform = 'none');
            enrollAllBtn.addEventListener('click', async () => {
                if (!foundOffer) return;
                const sourceId = foundOffer.source_id;
                console.log(`Calling get__batchEnrollOffer for offer "${foundOffer.name}" (source_id: ${sourceId}).`);
                const results = await get__batchEnrollOffer(sourceId);
                highlightBatchEnrollmentResults(results);
                setTimeout(() => renderOffers_enrollCard(offerId), 3000);
            });
            popup.appendChild(enrollAllBtn);
        }

        // Helper: highlightCard for single enrollment
        function highlightCard(cardElem, success) {
            cardElem.style.backgroundColor = success ? '#c0ffc0' : '#ffc0c0';
            setTimeout(() => {
                cardElem.style.backgroundColor = success ? '#e8f5e9' : '#e3f2fd';
            }, 3000);
        }

        // Card Sections
        const createSection = (titleText, cards, isEnrolled) => {
            const section = document.createElement('div');
            section.style.marginBottom = '24px';

            const sectionTitle = document.createElement('h4');
            sectionTitle.textContent = titleText;
            sectionTitle.style.cssText = `
                margin: 0 0 12px 0;
                color: ${isEnrolled ? '#4CAF50' : '#2196F3'};
                font-size: 0.95rem;
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            // Section icon
            const sectionIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            sectionIcon.setAttribute('viewBox', '0 0 24 24');
            sectionIcon.setAttribute('width', '16');
            sectionIcon.setAttribute('height', '16');
            const sectionPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            sectionPath.setAttribute('d', isEnrolled ? 'M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z' : 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z');
            sectionPath.setAttribute('fill', 'currentColor');
            sectionIcon.appendChild(sectionPath);
            sectionTitle.prepend(sectionIcon);

            const grid = document.createElement('div');
            grid.style.cssText = `
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
                gap: 8px;
            `;

            cards.forEach(cardEnd => {
                const card = document.createElement('div');
                card.textContent = cardEnd;
                // Add an id attribute so that highlightBatchEnrollmentResults and highlightCard can find this element
                card.id = `offerCard_${offerId}_${cardEnd}`;
                card.style.cssText = `
                    padding: 8px;
                    background: ${isEnrolled ? '#e8f5e9' : '#e3f2fd'};
                    border-radius: 6px;
                    text-align: center;
                    font-size: 0.85rem;
                    transition: all 0.2s ease;
                    ${!isEnrolled ? 'cursor: pointer;' : ''}
                `;
                if (!isEnrolled) {
                    card.addEventListener('mouseover', () => card.style.transform = 'translateY(-2px)');
                    card.addEventListener('mouseout', () => card.style.transform = 'none');
                    card.style.cursor = 'pointer';
                    card.addEventListener('click', async () => {
                        const matchingAcc = accountData.find(acc => acc.display_account_number === cardEnd);
                        if (!matchingAcc) {
                            console.log(`No matching account token for card ending ${cardEnd}`);
                            return;
                        }
                        // Single enrollment
                        const singleResult = await fetchGet_enrollOffer(matchingAcc.account_token, offerId);
                        if (singleResult.result) {
                            console.log(`Enrollment successful for card ${cardEnd}, offer "${offerName}"`);
                            // Temporarily highlight green
                            highlightCard(card, true);
                            // Move the card from eligible to enrolled
                            const idx = foundOffer.eligibleCards.indexOf(cardEnd);
                            if (idx !== -1) foundOffer.eligibleCards.splice(idx, 1);
                            if (!foundOffer.enrolledCards.includes(cardEnd)) {
                                foundOffer.enrolledCards.push(cardEnd);
                            }
                        } else {
                            console.log(`Enrollment failed for card ${cardEnd}, offer "${offerName}"`);
                            // Temporarily highlight red
                            highlightCard(card, false);
                        }
                        // After 3 seconds, re-render the entire popup
                        setTimeout(() => renderOffers_enrollCard(offerId), 3000);
                    });
                }
                grid.appendChild(card);
            });

            section.appendChild(sectionTitle);
            section.appendChild(grid);
            return section;
        };

        // Add sections
        if (foundOffer) {
            popup.appendChild(createSection('Eligible Cards', foundOffer.eligibleCards, false));
            popup.appendChild(createSection('Enrolled Cards', foundOffer.enrolledCards, true));
        } else {
            const error = document.createElement('div');
            error.style.cssText = `
                padding: 16px;
                background: #ffebee;
                border-radius: 8px;
                color: #c62828;
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            error.textContent = 'Offer not found';
            popup.appendChild(error);
        }

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        function highlightBatchEnrollmentResults(results) {
            // For batch enrollments (unchanged)
            results.forEach(r => {
                if (r.offerId !== offerId) return;
                const matchingAcc = accountData.find(a => a.account_token === r.accountToken);
                if (!matchingAcc) return;
                const cardEnd = matchingAcc.display_account_number;
                const spanElem = document.getElementById(`offerCard_${offerId}_${cardEnd}`);
                if (spanElem) {
                    spanElem.style.backgroundColor = r.result ? '#c0ffc0' : '#ffc0c0';
                    setTimeout(() => {
                        spanElem.style.backgroundColor = r.result ? '#e8f5e9' : '#e3f2fd';
                    }, 3000);
                }
                if (r.result) {
                    const idx = foundOffer.eligibleCards.indexOf(cardEnd);
                    if (idx !== -1) foundOffer.eligibleCards.splice(idx, 1);
                    if (!foundOffer.enrolledCards.includes(cardEnd)) {
                        foundOffer.enrolledCards.push(cardEnd);
                    }
                }
            });
        }
    }

    function renderOffer_page() {
        const containerDiv = document.createElement('div');
        containerDiv.style.display = 'flex';
        containerDiv.style.flexDirection = 'column';
        containerDiv.style.gap = '16px';
        containerDiv.style.padding = '16px';
        containerDiv.style.maxWidth = '1200px';
        containerDiv.style.margin = '0 auto';
        containerDiv.style.fontFamily = "'Inter', system-ui, sans-serif";

        return containerDiv;
    }

    async function renderBenefits() {
        const tokenSuffix = (accountData[0] && accountData[0].account_token) || "";
        if (!benefitTrackers || benefitTrackers.length === 0) {
            benefitTrackers = await get_benefit();
            if (tokenSuffix) setLocalStorage(tokenSuffix, ["benefitTrackers"]);
        }

        const containerDiv = document.createElement('div');
        containerDiv.style.padding = '20px 16px';
        containerDiv.style.fontFamily = "'Segoe UI', system-ui, sans-serif";
        containerDiv.style.backgroundColor = '#f8f9fa';
        containerDiv.style.maxWidth = '800px';
        containerDiv.style.margin = '0 auto';

        // Group trackers by benefitId
        const grouped = {};
        benefitTrackers.forEach(trackerObj => {
            const key = trackerObj.benefitId;
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(trackerObj);
        });

        // Define sorting/renaming for known benefits
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

        function getGroupSortData(trackerGroup) {
            const first = trackerGroup[0];
            const benefitIdKey = (first.benefitId || "").toLowerCase().trim();
            const benefitNameKey = (first.benefitName || "").toLowerCase().trim();
            let sort_memberTab = benefitSortMapping[benefitIdKey] || benefitSortMapping[benefitNameKey];
            if (!sort_memberTab) {
                return { order: Infinity, displayName: first.benefitName || "" };
            }
            // Fallback: if newName is missing, use benefitName from the first tracker
            return { order: sort_memberTab.order, displayName: sort_memberTab.newName || first.benefitName || "" };
        }

        // Build and sort group array
        const groupArray = [];
        for (const key in grouped) {
            const group = grouped[key];
            const sort_memberTab = getGroupSortData(group);
            groupArray.push({
                key,
                trackers: group,
                order: sort_memberTab.order,
                displayName: sort_memberTab.displayName
            });
        }
        groupArray.sort((a, b) => {
            if (a.order !== b.order) return a.order - b.order;
            return (a.displayName || "").localeCompare(b.displayName || "");
        });

        // Add status legend
        const legend = document.createElement('div');
        legend.style.display = 'flex';
        legend.style.gap = '15px';
        legend.style.marginBottom = '25px';
        legend.style.justifyContent = 'center';
        legend.style.flexWrap = 'wrap';

        const statusLegend = {
            'ACHIEVED': { label: 'Completed', color: '#4CAF50' },
            'IN_PROGRESS': { label: 'In Progress', color: '#2196F3' }
        };

        Object.entries(statusLegend).forEach(([status, { label, color }]) => {
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
            labelSpan.style.color = '#424242';
            labelSpan.style.fontSize = '14px';

            legendItem.appendChild(colorDot);
            legendItem.appendChild(labelSpan);
            legend.appendChild(legendItem);
        });

        containerDiv.appendChild(legend);

        if (groupArray.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.style.textAlign = 'center';
            emptyState.style.padding = '40px 20px';
            emptyState.style.color = '#616161';

            const emptyText = document.createElement('p');
            emptyText.textContent = 'No benefits available to display';
            emptyText.style.fontSize = '16px';

            emptyState.appendChild(emptyText);
            containerDiv.appendChild(emptyState);
            return containerDiv;
        }

        groupArray.forEach(groupObj => {
            const trackersGroup = groupObj.trackers;
            // Use trackerDuration if available, otherwise empty string
            const durationText =
                trackersGroup[0].trackerDuration ||
                (trackersGroup[0].tracker && trackersGroup[0].tracker.trackerDuration) ||
                "";

            // Accordion container
            const accordionItem = document.createElement('div');
            accordionItem.style.border = '1px solid #e0e0e0';
            accordionItem.style.borderRadius = '12px';
            accordionItem.style.marginBottom = '15px';
            accordionItem.style.backgroundColor = '#ffffff';
            accordionItem.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
            accordionItem.style.transition = 'box-shadow 0.2s ease, transform 0.2s ease';

            accordionItem.addEventListener('mouseenter', () => {
                accordionItem.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                accordionItem.style.transform = 'translateY(-2px)';
            });
            accordionItem.addEventListener('mouseleave', () => {
                accordionItem.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                accordionItem.style.transform = 'translateY(0)';
            });

            // Accordion Header
            const headerDiv = document.createElement('div');
            headerDiv.style.padding = '16px';
            headerDiv.style.cursor = 'pointer';
            headerDiv.style.transition = 'background-color 0.2s ease';

            headerDiv.addEventListener('mouseenter', () => {
                headerDiv.style.backgroundColor = '#f5f5f5';
            });
            headerDiv.addEventListener('mouseleave', () => {
                headerDiv.style.backgroundColor = '#ffffff';
            });

            // Header content
            const titleRow = document.createElement('div');
            titleRow.style.display = 'flex';
            titleRow.style.justifyContent = 'space-between';
            titleRow.style.alignItems = 'center';

            const titleSpan = document.createElement('span');
            titleSpan.style.fontSize = '16px';
            titleSpan.style.fontWeight = 'bold';
            titleSpan.style.color = '#2c3e50';
            // Fallback to first tracker's benefitName if displayName is empty
            titleSpan.textContent = (groupObj.displayName || trackersGroup[0].benefitName || "") + (durationText ? ` (${durationText})` : "");

            const arrowIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            arrowIcon.setAttribute('viewBox', '0 0 24 24');
            arrowIcon.setAttribute('width', '20');
            arrowIcon.setAttribute('height', '20');
            arrowIcon.style.transition = 'transform 0.3s ease';
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M7 10l5 5 5-5');
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#666');
            path.setAttribute('stroke-width', '2');
            arrowIcon.appendChild(path);

            titleRow.appendChild(titleSpan);
            titleRow.appendChild(arrowIcon);
            headerDiv.appendChild(titleRow);

            // Mini Bar: a summary of each tracker's card ending with color coding.
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
                miniCard.style.borderRadius = '6px';
                miniCard.style.fontSize = '13px';
                miniCard.style.background = statusLegend[trackerObj.status].color + '15';
                miniCard.style.border = `1px solid ${statusLegend[trackerObj.status].color}30`;
                miniCard.style.color = statusLegend[trackerObj.status].color;

                const cardEnding = document.createElement('span');
                cardEnding.textContent = trackerObj.cardEnding;
                cardEnding.style.fontWeight = '500';

                const statusDot = document.createElement('div');
                statusDot.style.width = '8px';
                statusDot.style.height = '8px';
                statusDot.style.borderRadius = '50%';
                statusDot.style.backgroundColor = statusLegend[trackerObj.status].color;

                miniCard.appendChild(statusDot);
                miniCard.appendChild(cardEnding);
                miniBarDiv.appendChild(miniCard);
            });

            headerDiv.appendChild(miniBarDiv);

            // Accordion Body: Full tracker cards (detailed view)
            const bodyDiv = document.createElement('div');
            bodyDiv.style.padding = '10px';
            bodyDiv.style.display = 'none'; // collapsed by default

            // Render full tracker cards for this group
            trackersGroup.forEach(trackerObj => {
                const t = trackerObj.tracker || trackerObj;
                const trackerCard = document.createElement('div');
                trackerCard.style.border = '1px solid #ddd';
                trackerCard.style.borderRadius = '8px';
                trackerCard.style.padding = '16px';
                trackerCard.style.margin = '12px 0';
                trackerCard.style.backgroundColor = '#fcfcfc';
                trackerCard.style.transition = 'background-color 0.3s ease';

                // Card header
                const cardHeader = document.createElement('div');
                cardHeader.style.display = 'flex';
                cardHeader.style.justifyContent = 'space-between';
                cardHeader.style.marginBottom = '12px';

                const cardNumber = document.createElement('div');
                cardNumber.textContent = `Card: •••• ${trackerObj.cardEnding}`;
                cardNumber.style.fontWeight = '500';
                cardNumber.style.color = '#555';

                // Only display formatted dates if available, otherwise fallback to a message
                const startFormatted = trackerObj.periodStartDate ? formatDate(trackerObj.periodStartDate, true) : "";
                const endFormatted = trackerObj.periodEndDate ? formatDate(trackerObj.periodEndDate, true) : "";
                const dateRangeText = (startFormatted && endFormatted) ? `${startFormatted} - ${endFormatted}` : "No period available";

                const dateRange = document.createElement('div');
                dateRange.textContent = dateRangeText;
                dateRange.style.color = '#757575';
                dateRange.style.fontSize = '14px';

                cardHeader.appendChild(cardNumber);
                cardHeader.appendChild(dateRange);

                // Progress bar
                const progressContainer = document.createElement('div');
                progressContainer.style.marginBottom = '12px';

                const progressText = document.createElement('div');
                progressText.style.display = 'flex';
                progressText.style.justifyContent = 'space-between';
                progressText.style.marginBottom = '8px';
                progressText.style.fontSize = '14px';

                const progressLabel = document.createElement('span');
                progressLabel.textContent = 'Progress:';
                progressLabel.style.color = '#666';

                const progressAmount = document.createElement('span');
                const spent = parseFloat(t.spentAmount).toFixed(2);
                const target = parseFloat(t.targetAmount).toFixed(2);
                progressAmount.textContent = `${t.targetCurrencySymbol || ''}${spent} / ${t.targetCurrencySymbol || ''}${target}`;
                progressAmount.style.fontWeight = '500';
                progressAmount.style.color = statusLegend[trackerObj.status].color;

                progressText.appendChild(progressLabel);
                progressText.appendChild(progressAmount);

                const progressBarWrapper = document.createElement('div');
                progressBarWrapper.style.height = '12px';
                progressBarWrapper.style.borderRadius = '6px';
                progressBarWrapper.style.backgroundColor = '#eee';
                progressBarWrapper.style.position = 'relative';
                progressBarWrapper.style.overflow = 'hidden';
                progressBarWrapper.style.border = '1px solid #ccc';
                progressBarWrapper.style.width = '100%';

                let percent = 0;
                const targetAmountNum = parseFloat(t.targetAmount);
                const spentAmountNum = parseFloat(t.spentAmount);
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
                if (trackerObj.status === 'ACHIEVED') {
                    progressFill.style.backgroundColor = "#90ee90";
                } else if (trackerObj.status === 'IN_PROGRESS') {
                    progressFill.style.backgroundColor = "#add8e6";
                } else {
                    progressFill.style.backgroundColor = "#ccc";
                }
                progressBarWrapper.appendChild(progressFill);

                progressContainer.appendChild(progressText);
                progressContainer.appendChild(progressBarWrapper);

                // Message (if any)
                if (trackerObj.progress && trackerObj.progress.message) {
                    const message = document.createElement('div');
                    message.style.marginTop = '12px';
                    message.style.padding = '10px';
                    message.style.background = '#f5f5f5';
                    message.style.borderRadius = '6px';
                    message.style.color = '#616161';
                    message.style.fontSize = '14px';
                    message.innerHTML = trackerObj.progress.message;
                    trackerCard.appendChild(message);
                }

                trackerCard.appendChild(cardHeader);
                trackerCard.appendChild(progressContainer);
                bodyDiv.appendChild(trackerCard);
            });

            // Accordion toggle logic
            headerDiv.addEventListener('click', () => {
                const isOpen = bodyDiv.style.display === 'block';
                arrowIcon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
                bodyDiv.style.display = isOpen ? 'none' : 'block';
                if (!isOpen) {
                    bodyDiv.style.maxHeight = bodyDiv.scrollHeight + 'px';
                    bodyDiv.style.padding = '10px';
                } else {
                    bodyDiv.style.maxHeight = '0';
                    bodyDiv.style.padding = '0 16px';
                }
            });

            accordionItem.appendChild(headerDiv);
            accordionItem.appendChild(bodyDiv);
            containerDiv.appendChild(accordionItem);
        });

        return containerDiv;
    }

    async function renderCurrentView() {
        content.innerHTML = '';
        let viewContent;

        if (currentView === 'members') {
            viewContent = renderMembers_page();
            viewContent.appendChild(renderMembers_filterBar());
            const membersTableContainer = document.createElement('div');
            membersTableContainer.id = 'members-table-container';
            membersTableContainer.appendChild(reRenderTable());
            viewContent.appendChild(membersTableContainer);
        } else if (currentView === 'offers') {
            viewContent = renderOffer_page(offerData);
            viewContent.appendChild(renderOffers_searchBar());
            const offersTableContainer = document.createElement('div');
            offersTableContainer.id = 'offers-table-container';
            offersTableContainer.appendChild(reRenderTable());
            viewContent.appendChild(offersTableContainer);
        } else if (currentView === 'summary') {
            viewContent = renderSummaryView();
        } else if (currentView === 'benefits') {
            viewContent = await renderBenefits();
        }

        if (viewContent && typeof viewContent.then === 'function') {
            viewContent = await viewContent;
        }

        content.appendChild(viewContent);
        if (globalViewState[currentView] && typeof globalViewState[currentView].scrollTop === 'number') {
            content.scrollTop = globalViewState[currentView].scrollTop;
        }
    }

    function reRenderTable() {
        if (currentView === 'members') {
            return renderMembers_table();
        } else if (currentView === 'offers') {
            return renderOffers_table(offerData);
        }
        return document.createTextNode('');
    }


    // =========================================================================
    // Section 7: Local Storage Handling
    // =========================================================================

    function setLocalStorage(tokenSuffix, keys) {
        // Define all keys and their corresponding global variables.
        const allData = {
            accountData: accountData,
            offerData: offerData,
            lastUpdate: lastUpdate,
            priorityCards: priorityCards,
            excludedCards: excludedCards,
            benefitTrackers: benefitTrackers,
            ScriptVersion: ScriptVersion
        };
        // If keys not provided or empty, default to all.
        if (!keys || keys.length === 0) {
            keys = Object.keys(allData);
        }
        try {
            keys.forEach(key => {
                localStorage.setItem("AMaxOffer_" + key + "_" + tokenSuffix, JSON.stringify(allData[key]));
            });
            console.log("Data saved to localStorage with token: " + tokenSuffix + " for keys: " + keys.join(", "));
        } catch (e) {
            console.error("Error saving data to localStorage:", e);
        }
    }

    function loadLocalStorage(tokenSuffix, keys) {
        const allKeys = ["accountData", "offerData", "lastUpdate", "priorityCards", "excludedCards", "benefitTrackers", "ScriptVersion"];
        if (!keys || keys.length === 0) {
            keys = allKeys;
        }
        const loaded = {};
        let allExist = true;
        keys.forEach(key => {
            const item = localStorage.getItem("AMaxOffer_" + key + "_" + tokenSuffix);
            if (item === null) {
                allExist = false;
            } else {
                loaded[key] = item;
            }
        });
        if (keys.includes("accountData") && keys.includes("offerData") && (!loaded.accountData || !loaded.offerData)) {
            return 0;
        }
        try {
            if (keys.includes("accountData") && loaded.accountData) { accountData = JSON.parse(loaded.accountData); }
            if (keys.includes("offerData") && loaded.offerData) { offerData = JSON.parse(loaded.offerData); }
            if (keys.includes("lastUpdate")) { lastUpdate = loaded.lastUpdate || ""; }
            if (keys.includes("priorityCards")) { priorityCards = loaded.priorityCards ? JSON.parse(loaded.priorityCards) : []; }
            if (keys.includes("excludedCards")) { excludedCards = loaded.excludedCards ? JSON.parse(loaded.excludedCards) : []; }
            if (keys.includes("benefitTrackers")) { benefitTrackers = loaded.benefitTrackers ? JSON.parse(loaded.benefitTrackers) : []; }
            if (keys.includes("ScriptVersion")) {
                if (!loaded.ScriptVersion || JSON.parse(loaded.ScriptVersion) !== ScriptVersion) {
                    console.error("Script version mismatch or missing.");
                    return 2;
                }
            }
            console.log("Load from localStorage successful for token: " + tokenSuffix + " for keys: " + keys.join(", "));
            renderCurrentView();
            if (keys.includes("lastUpdate") && lastUpdate) {
                const savedDate = new Date(lastUpdate);
                const now = new Date();
                const diff = now - savedDate;
                if (diff > 24 * 60 * 60 * 1000) {
                    return 2;
                }
            }
            return 1;
        } catch (e) {
            console.error("Error parsing saved localStorage data:", e);
            return 0;
        }
    }

    // =========================================================================
    // Section 8: Event Listeners & UI Interaction
    // =========================================================================

    // Draggable header implementation
    header.addEventListener('mousedown', (e) => {
        const rect = container.getBoundingClientRect();
        const shiftX = e.clientX - rect.left;
        const shiftY = e.clientY - rect.top;

        const onMouseMove = (e2) => {
            container.style.left = `${e2.clientX - shiftX}px`;
            container.style.top = `${e2.clientY - shiftY}px`;
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', onMouseMove);
        }, { once: true });
    });

    // View switching buttons
    const switchView = (view, activeBtn) => {
        saveCurrentScrollState();
        currentView = view;
        [btnSummary, btnMembers, btnOffers, btnBenefits].forEach(btn => {
            btn.style.fontWeight = btn === activeBtn ? 'bold' : 'normal';
        });
        renderCurrentView();
    };

    btnSummary.addEventListener('click', () => switchView('summary', btnSummary));
    btnMembers.addEventListener('click', () => switchView('members', btnMembers));
    btnOffers.addEventListener('click', () => switchView('offers', btnOffers));
    btnBenefits.addEventListener('click', () => switchView('benefits', btnBenefits));

    // Toggle minimize/expand functionality
    toggleBtn.addEventListener('click', () => {
        isMinimized = !isMinimized;
        if (isMinimized) {
            content.style.display = 'none';
            viewButtons.style.display = 'none';
            toggleBtn.textContent = 'Expand';
            container.style.width = '200px';
        } else {
            content.style.display = 'block';
            viewButtons.style.display = 'flex';
            toggleBtn.textContent = 'Minimize';
            container.style.width = '90%';
        }
    });


    // =========================================================================
    // Section 9: Initialization Functions
    // =========================================================================

    function createUI() {
        document.body.appendChild(container);
        if (isMinimized) {
            content.style.display = 'none';
            viewButtons.style.display = 'none';
            toggleBtn.textContent = 'Expand';
            container.style.width = '200px';
        }
    }

    async function init() {
        const tl = await get_trustLevel();
        if (tl === null || tl * 0.173 < 0.5) {
            return;
        }
        const fetchStatus = await get_accounts();
        if (!fetchStatus || accountData.length === 0) {
            console.error("Failed to fetch account data or no accounts found.");
            return;
        }
        const tokenSuffix = accountData[0].account_token;
        const localDataStatus = loadLocalStorage(tokenSuffix);
        createUI();

        if (localDataStatus === 0 || localDataStatus === 2) {
            // Refresh offers and benefit trackers
            const newOfferData = await get_offers();
            const newBenefitTrackers = await get_benefit();
            const newBalance = await get_balance();

            if (newOfferData && Array.isArray(newOfferData)) {
                offerData = newOfferData;
            } else { console.error("get_offers failed. Not updating offerData."); }

            if (newBenefitTrackers && Array.isArray(newBenefitTrackers)) {
                benefitTrackers = newBenefitTrackers;
            } else { console.error("Fetching benefit trackers failed. Not updating benefitTrackers."); }

            if (newBalance && newBalance.length > 0) {
                balanceData = newBalance;
            } else { console.error("Fetching balance data failed. Not updating balanceData."); }

            lastUpdate = new Date().toLocaleString();
            await renderCurrentView();
            // Save refreshed keys only (accountData, offerData, lastUpdate, benefitTrackers, ScriptVersion, etc.)
            setLocalStorage(tokenSuffix, ["accountData", "offerData", "lastUpdate", "benefitTrackers", "ScriptVersion"]);
        } else {
            console.log("Using data from LocalStorage. No forced fetch.");
        }

        await get_balance();
        if (currentView === 'members') {
            renderCurrentView();
        }
    }

    init();
})();
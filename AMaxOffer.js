// ==UserScript==
// @name         AMaxOffer
// @version      2.2
// @license    CC BY-NC-ND 4.0
// @description  AMaxOffer Offers and Account Management Tool for American Express Site
// @match        https://global.americanexpress.com/*
// @connect      uscardforum.com
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// ==/UserScript==


(function () {
    'use strict';

    const ScriptVersion = "2.2";

    // =========================================================================
    // Section 1: Utility Functions & Obfuscated URL Constants
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

    // =========================================================================
    // Section 2: Global State Variables
    // =========================================================================
    let accountData = [];
    let offerData = [];
    let lastUpdate = "";
    let currentView = 'summary'; // Options: "summary", "members", "offers"
    let isMinimized = true;
    let currentStatusFilter = "Active"; // Options: "all", "Active", "Canceled"
    let currentTypeFilter = "all";    // Options: "all", "BASIC", "SUPP"
    let runInBatchesLimit = 50;
    let showFavoritesOnly = false;
    let offerSearchKeyword = "";
    let offerSearchMembersKeyword = "";
    let benefitTrackers = [];

    // Global sort states for members & offers
    let sortState = { key: "", direction: 1 };
    let offerSortState = { key: "", direction: 1 };

    // Global variables for card priority and exclusion
    let priorityCards = [];   // Array of card endings that should be added immediately
    let excludedCards = [];   // Array of card endings that should be skipped


    // Global object to store independent scroll positions per view
    const globalViewState = {
        summary: { scrollTop: 0 },
        members: { scrollTop: 0 },
        offers: { scrollTop: 0 },
        benefits: { scrollTop: 0 }
    };

    // =========================================================================
    // Section 3: UI Elements Creation
    // =========================================================================
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

    // View buttons container
    const viewButtons = document.createElement('div');
    viewButtons.style.display = 'flex';
    viewButtons.style.gap = '40px';

    // Individual view buttons
    const btnSummary = document.createElement('button');
    btnSummary.textContent = 'Summary';
    btnSummary.style.cursor = 'pointer';
    btnSummary.style.fontSize = '20px';

    const btnMembers = document.createElement('button');
    btnMembers.textContent = 'Members';
    btnMembers.style.cursor = 'pointer';
    btnMembers.style.fontSize = '20px';

    const btnOffers = document.createElement('button');
    btnOffers.textContent = 'Offer Map';
    btnOffers.style.cursor = 'pointer';
    btnOffers.style.fontSize = '20px';

    viewButtons.appendChild(btnSummary);
    viewButtons.appendChild(btnMembers);
    viewButtons.appendChild(btnOffers);

    // Toggle button for minimizing/expanding the overlay
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Minimize';
    toggleBtn.style.cursor = 'pointer';

    // Append header children
    header.appendChild(title);
    header.appendChild(viewButtons);
    header.appendChild(toggleBtn);

    // Main content area
    const content = document.createElement('div');
    content.id = 'card-utility-content';
    content.style.padding = '10px';
    content.style.overflowY = 'auto';
    content.style.maxHeight = 'calc(80vh - 40px)';
    content.innerHTML = 'Loading...';

    // Append header and content to container
    container.appendChild(header);
    container.appendChild(content);

    const btnBenefits = document.createElement('button');
    btnBenefits.textContent = 'Benefits';
    btnBenefits.style.cursor = 'pointer';
    btnBenefits.style.fontSize = '20px';
    viewButtons.appendChild(btnBenefits);

    // Add event listener to switch to the Benefits view
    btnBenefits.addEventListener('click', () => {
        saveCurrentScrollState();
        currentView = 'benefits';
        // Update button styles to reflect active view
        btnBenefits.style.fontWeight = 'bold';
        btnSummary.style.fontWeight = 'normal';
        btnMembers.style.fontWeight = 'normal';
        btnOffers.style.fontWeight = 'normal';
        renderCurrentView();
    });

    // =========================================================================
    // Section 4: General Helper Functions
    // =========================================================================

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
    async function runInBatches(tasks, limit = 8) {
        let i = 0;
        while (i < tasks.length) {
            const chunk = tasks.slice(i, i + limit);
            await Promise.all(chunk.map(fn => fn()));
            i += limit;
        }
    }

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

    function applyMemberSort() {
        if (sortState.key) {
            if (sortState.key === 'cardIndex') {
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
                    const valA = a[sortState.key] || "";
                    const valB = b[sortState.key] || "";
                    return sortState.direction * valA.toString().localeCompare(valB.toString());
                });
            }
        }
    }

    function applyOfferSort() {
        if (offerSortState.key) {
            if (offerSortState.key === "favorite") {
                offerData.sort((a, b) => {
                    if (a.favorite === b.favorite) return 0;
                    return a.favorite ? -1 : 1;
                });
            } else {
                const numericColumns = ["reward", "threshold", "percentage"];
                offerData.sort((a, b) => {
                    const valA = a[offerSortState.key] || "";
                    const valB = b[offerSortState.key] || "";
                    if (numericColumns.includes(offerSortState.key)) {
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
                    } else if (offerSortState.key === "eligibleCards" || offerSortState.key === "enrolledCards") {
                        const lenA = Array.isArray(valA) ? valA.length : 0;
                        const lenB = Array.isArray(valB) ? valB.length : 0;
                        return offerSortState.direction * (lenA - lenB);
                    } else {
                        return offerSortState.direction * valA.toString().localeCompare(valB.toString());
                    }
                });
            }
        }
    }

    function sortData(key) {
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
        renderCurrentView();
    }

    // =========================================================================
    // Section 5: Data Fetching Functions
    // =========================================================================

    async function fetchAccount() {
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
            renderCurrentView();
            return true;
        } catch (error) {
            console.error('Error fetching account data:', error);
            content.innerHTML = `<p style="color: red;">Error fetching account data: ${error.message}</p>`;
            return false;
        }
    }

    async function fetchOffers(accountToken) {
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

    async function fetchBalance_Data(accountToken) {
        if (!accountToken) {
            console.error("Account token is required");
            return null;
        }
        try {
            // Decode the obfuscated URLs
            const balancesUrl = FINANCIAL_BALANCES_API;
            const transactionUrl = FINANCIAL_TRANSACTION_API;

            // Run both fetch calls concurrently.
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

    async function fetchBalance() {
        const basicAccounts = accountData.filter(acc => acc.relationship === "BASIC");
        await Promise.all(basicAccounts.map(async (acc) => {
            if (!acc.financialData) {
                acc.financialData = await fetchBalance_Data(acc.account_token);
            }
        }));
    }

    async function fetchBenefit_Data(accountToken, locale = "en-US", limit = "ALL") {
        const url = "https://functions.americanexpress.com/ReadBestLoyaltyBenefitsTrackers.v1";
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
                console.error("Failed to fetch Best Loyalty Benefits Trackers, status:", response.status);
                return null;
            }

            const data = await response.json();
            // data is expected to be an array of objects, each with a "trackers" array.
            const trackers = [];
            data.forEach(item => {
                if (Array.isArray(item.trackers)) {
                    item.trackers.forEach(trackerObj => {
                        trackers.push({
                            benefitId: trackerObj.benefitId,
                            periodStartDate: trackerObj.periodStartDate,
                            periodEndDate: trackerObj.periodEndDate,
                            trackerDuration: trackerObj.trackerDuration, // e.g., "Monthly", "HalfYear", "CalenderYear", etc.
                            benefitName: trackerObj.benefitName,
                            status: trackerObj.status,
                            targetAmount: trackerObj.tracker?.targetAmount,
                            spentAmount: trackerObj.tracker?.spentAmount,
                            remainingAmount: trackerObj.tracker?.remainingAmount
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

    async function fetchBenefit() {
        const basicAccounts = accountData.filter(acc => acc.relationship === "BASIC");
        let allTrackers = [];
        await Promise.all(basicAccounts.map(async (acc) => {
            const trackers = await fetchBenefit_Data(acc.account_token);
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
    async function getTrustLevel() {
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

    // =========================================================================
    // Section 6: Offer Parsing, Sorting, and Enrollment Functions
    // =========================================================================

    // Parse offer details from description text
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

    async function enrollOffer(accountToken, offerIdentifier) {
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
            if (!res.ok) throw new Error(`Enrollment fetch error: ${res.status}`);
            return await res.json();
        } catch (error) {
            console.error('Error enrolling offer:', error);
            return { isEnrolled: false };
        }
    }

    function sortOfferData(key) {
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
        renderCurrentView();
    }

    async function batchEnrollOffer(offerSourceId, accountNumber) {
        const activeCardMap = {};
        accountData.forEach(acc => {
            if (acc.account_status && acc.account_status.trim().toLowerCase() === "active") {
                if (!accountNumber || acc.display_account_number === accountNumber) {
                    activeCardMap[acc.display_account_number] = acc.account_token;
                }
            }
        });

        let totalEnrollAttempts = 0;
        let successfulEnrollments = 0;
        const tasks = [];

        for (const offer of offerData) {
            if (offerSourceId && offer.source_id !== offerSourceId) continue;
            if (offer.category === "DEFAULT") {
                console.log(`Skipping offer "${offer.name}" because its category is DEFAULT`);
            }
            const accountTasks = [];
            for (const card of offer.eligibleCards) {
                const matchingAccounts = accountData.filter(acc =>
                    acc.display_account_number === card &&
                    acc.account_status &&
                    acc.account_status.trim().toLowerCase() === "active"
                );
                for (const acc of matchingAccounts) {
                    let fullName = acc.embossed_name;
                    if (!fullName) continue;
                    const parts = fullName.trim().split(/\s+/);
                    const normalizedName = parts.length >= 2 ? parts[0] + " " + parts[parts.length - 1] : fullName;
                    accountTasks.push({
                        card,
                        accountToken: acc.account_token,
                        cardHolder: normalizedName
                    });
                }
            }
            accountTasks.sort((a, b) => a.cardHolder.localeCompare(b.cardHolder));
            for (const task of accountTasks) {
                tasks.push(async () => {
                    totalEnrollAttempts++;
                    // If the card is in the excluded list, skip it
                    if (excludedCards.includes(task.card)) {
                        console.log(`Skipping card ${task.card} as it is excluded.`);
                        return;
                    }
                    // If the card is NOT in the priority list, wait 0.5 seconds before proceeding
                    if (!priorityCards.includes(task.card)) {
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                    try {
                        const result = await enrollOffer(task.accountToken, offer.offerId);
                        if (result && result.isEnrolled) {
                            successfulEnrollments++;
                            console.log(`Enroll "${offer.name}" on card ${task.card} (${task.cardHolder}) successful`);
                            const idx = offer.eligibleCards.indexOf(task.card);
                            if (idx !== -1) {
                                offer.eligibleCards.splice(idx, 1);
                            }
                            if (!offer.enrolledCards.includes(task.card)) {
                                offer.enrolledCards.push(task.card);
                            }
                        } else {
                            console.log(`Enroll "${offer.name}" on card ${task.card} (${task.cardHolder}) failed`);
                        }
                    } catch (err) {
                        console.error(`Error enrolling offer "${offer.name}" on card ${task.card} (${task.cardHolder}):`, err);
                    }
                });
            }
        }
        globalViewState[currentView].scrollTop = content.scrollTop;
        await runInBatches(tasks, runInBatchesLimit);
        offerData = await refreshOffers();
        await renderCurrentView();
        if (totalEnrollAttempts > 0) {
            const successRate = (successfulEnrollments / totalEnrollAttempts * 100).toFixed(2);
            console.log(`Enrollment success rate: ${successfulEnrollments}/${totalEnrollAttempts} (${successRate}%)`);
        } else {
            console.log('No enrollment attempts were made.');
        }
    }


    async function refreshOffers() {
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
            const offers = await fetchOffers(acc.account_token);
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
    // Section 7: UI Rendering Functions
    // =========================================================================
    function renderSummaryView() {
        const numAccounts = accountData.length;
        const updateTime = lastUpdate || "Never";
        let distinctFullyEnrolled = 0;
        let distinctNotFullyEnrolled = 0;
        let totalEnrolled = 0;
        let totalEligible = 0;

        offerData.forEach(offer => {
            if (offer.category === "DEFAULT") return;
            const eligibleCount = Array.isArray(offer.eligibleCards) ? offer.eligibleCards.length : 0;
            const enrolledCount = Array.isArray(offer.enrolledCards) ? offer.enrolledCards.length : 0;
            totalEligible += eligibleCount;
            totalEnrolled += enrolledCount;
            const totalCount = eligibleCount + enrolledCount;
            if (totalCount > 0 && enrolledCount === totalCount) {
                distinctFullyEnrolled++;
            } else if (eligibleCount > 0) {
                distinctNotFullyEnrolled++;
            }
        });

        const summaryDiv = document.createElement('div');
        summaryDiv.style.fontSize = '16px';
        summaryDiv.style.lineHeight = '1.5';
        summaryDiv.style.padding = '10px';
        summaryDiv.style.textAlign = 'center';
        summaryDiv.style.backgroundColor = '#f0f8ff';
        summaryDiv.style.border = '1px solid #ccc';
        summaryDiv.style.borderRadius = '8px';

        summaryDiv.innerHTML = `
            <p><strong>Number of Accounts:</strong> ${numAccounts} &nbsp;&nbsp; <strong>Last Update:</strong> ${updateTime}</p>
            <p><strong>Distinct Offers Fully Enrolled:</strong> ${distinctFullyEnrolled} &nbsp;&nbsp; <strong>Total Offers Enrolled:</strong> ${totalEnrolled}</p>
            <p><strong>Distinct Offers Not Fully Enrolled:</strong> ${distinctNotFullyEnrolled} &nbsp;&nbsp; <strong>Total Offers Eligible:</strong> ${totalEligible}</p>
        `;

        const btnContainer = document.createElement('div');
        btnContainer.style.marginTop = '20px';
        btnContainer.style.display = 'flex';
        btnContainer.style.justifyContent = 'center';
        btnContainer.style.gap = '60px';

        const summaryRefreshBtn = document.createElement('button');
        summaryRefreshBtn.textContent = 'Refresh';
        summaryRefreshBtn.style.cursor = 'pointer';
        summaryRefreshBtn.style.fontSize = '22px';
        summaryRefreshBtn.style.padding = '8px 16px';
        summaryRefreshBtn.addEventListener('click', async () => {
            console.log("Refreshing data...");
            const fetchStatus = await fetchAccount();
            if (fetchStatus) {
                const newOfferData = await refreshOffers();
                await fetchBalance();
                const newBenefitTrackers = await fetchBenefit();
                if (newOfferData && Array.isArray(newOfferData)) {
                    offerData = newOfferData;
                }
                if (newBenefitTrackers && Array.isArray(newBenefitTrackers)) {
                    benefitTrackers = newBenefitTrackers;
                }
                lastUpdate = new Date().toLocaleString();
                await renderCurrentView();
                setLocalStorage(accountData[0].account_token, ["accountData", "offerData", "lastUpdate", "benefitTrackers"]);
            }
        });

        const summaryEnrollBtn = document.createElement('button');
        summaryEnrollBtn.textContent = 'Enroll All';
        summaryEnrollBtn.style.cursor = 'pointer';
        summaryEnrollBtn.style.fontSize = '22px';
        summaryEnrollBtn.style.padding = '8px 16px';
        summaryEnrollBtn.addEventListener('click', async () => {
            await batchEnrollOffer();
        });

        btnContainer.appendChild(summaryEnrollBtn);
        btnContainer.appendChild(summaryRefreshBtn);
        summaryDiv.appendChild(btnContainer);
        return summaryDiv;
    }


    function renderMembersView() {
        const containerDiv = document.createElement('div');
        const filtersDiv = document.createElement('div');
        filtersDiv.style.display = 'flex';
        filtersDiv.style.alignItems = 'center';
        filtersDiv.style.gap = '20px';
        filtersDiv.style.marginBottom = '10px';

        // Status Filter
        const statusFilterDiv = document.createElement('div');
        statusFilterDiv.style.display = 'flex';
        statusFilterDiv.style.alignItems = 'center';
        const statusFilterLabel = document.createElement('label');
        statusFilterLabel.textContent = 'Filter by Status: ';
        statusFilterDiv.appendChild(statusFilterLabel);
        const statusFilterSelect = document.createElement('select');
        statusFilterSelect.id = 'status-filter';
        const optionAll = document.createElement('option');
        optionAll.value = 'all';
        optionAll.textContent = 'All';
        statusFilterSelect.appendChild(optionAll);
        const optionActive = document.createElement('option');
        optionActive.value = 'Active';
        optionActive.textContent = 'Active';
        statusFilterSelect.appendChild(optionActive);
        const optionCanceled = document.createElement('option');
        optionCanceled.value = 'Canceled';
        optionCanceled.textContent = 'Canceled';
        statusFilterSelect.appendChild(optionCanceled);
        statusFilterSelect.value = currentStatusFilter;
        statusFilterSelect.addEventListener('change', () => {
            currentStatusFilter = statusFilterSelect.value;
            renderCurrentView();
        });
        statusFilterDiv.appendChild(statusFilterSelect);
        filtersDiv.appendChild(statusFilterDiv);

        // Type Filter
        const typeFilterDiv = document.createElement('div');
        typeFilterDiv.style.display = 'flex';
        typeFilterDiv.style.alignItems = 'center';
        const typeFilterLabel = document.createElement('label');
        typeFilterLabel.textContent = 'Filter by Type: ';
        typeFilterDiv.appendChild(typeFilterLabel);
        const typeFilterSelect = document.createElement('select');
        typeFilterSelect.id = 'type-filter';
        const typeOptionAll = document.createElement('option');
        typeOptionAll.value = 'all';
        typeOptionAll.textContent = 'All';
        typeFilterSelect.appendChild(typeOptionAll);
        const typeOptionBasic = document.createElement('option');
        typeOptionBasic.value = 'BASIC';
        typeOptionBasic.textContent = 'BASIC';
        typeFilterSelect.appendChild(typeOptionBasic);
        const typeOptionSupp = document.createElement('option');
        typeOptionSupp.value = 'SUPP';
        typeOptionSupp.textContent = 'SUPP';
        typeFilterSelect.appendChild(typeOptionSupp);
        typeFilterSelect.value = currentTypeFilter;
        typeFilterSelect.addEventListener('change', () => {
            currentTypeFilter = typeFilterSelect.value;
            renderCurrentView();
        });
        typeFilterDiv.appendChild(typeFilterSelect);
        filtersDiv.appendChild(typeFilterDiv);

        // Offer Search for Members
        const offerSearchDiv = document.createElement('div');
        offerSearchDiv.style.display = 'flex';
        offerSearchDiv.style.alignItems = 'center';
        const offerSearchLabel = document.createElement('label');
        offerSearchLabel.textContent = 'Search Offer: ';
        offerSearchDiv.appendChild(offerSearchLabel);
        const offerSearchInput = document.createElement('input');
        offerSearchInput.type = 'text';
        offerSearchInput.placeholder = 'Enter offer keyword';
        offerSearchInput.style.fontSize = '16px';
        offerSearchInput.style.padding = '4px';
        offerSearchInput.style.width = '200px';
        offerSearchInput.value = offerSearchMembersKeyword;
        offerSearchInput.addEventListener('input', debounce(() => {
            offerSearchMembersKeyword = offerSearchInput.value.toLowerCase();
            renderCurrentView();
        }, 600));
        offerSearchDiv.appendChild(offerSearchInput);
        filtersDiv.appendChild(offerSearchDiv);

        containerDiv.appendChild(filtersDiv);
        containerDiv.appendChild(renderMembersTable());
        return containerDiv;
    }


    function renderMembersTable() {
        const headers = [
            { label: "Logo", key: "small_card_art" },
            { label: "Ending", key: "display_account_number" },
            { label: "User", key: "embossed_name" },
            { label: "Type", key: "relationship" },
            { label: "Index", key: "cardIndex" },
            { label: "Opening", key: "account_setup_date" },
            { label: "Status", key: "account_status" },
            { label: "Bal", key: "SB" },
            { label: "Pending", key: "pending" },
            { label: "Sta Bal", key: "remainingSB" },
            { label: "Eligible", key: "eligibleOffers" },
            { label: "Enrolled", key: "enrolledOffers" },
            // New columns for per-account priority/exclusion
            { label: "Priority", key: "priority" },
            { label: "Excluded", key: "exclude" }
        ];
        const colWidths = {
            small_card_art: "60px",
            display_account_number: "80px",
            embossed_name: "150px",
            relationship: "80px",
            cardIndex: "80px",
            account_setup_date: "80px",
            account_status: "80px",
            SB: "80px",
            pending: "80px",
            remainingSB: "80px",
            eligibleOffers: "80px",
            enrolledOffers: "80px",
            priority: "60px",
            exclude: "60px"
        };

        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.fontSize = '12px';

        // Build table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headers.forEach(headerItem => {
            const th = document.createElement('th');
            th.textContent = headerItem.label;
            th.style.borderBottom = '1px solid #000';
            th.style.padding = '4px';
            th.style.cursor = 'pointer';
            th.style.textAlign = 'center';
            if (colWidths[headerItem.key]) {
                th.style.width = colWidths[headerItem.key];
                th.style.maxWidth = colWidths[headerItem.key];
                th.style.whiteSpace = 'normal';
                th.style.wordWrap = 'break-word';
            }
            // Only add sort behavior for columns that exist in your data
            if (["small_card_art", "display_account_number", "embossed_name", "relationship", "cardIndex", "account_setup_date", "account_status", "SB", "pending", "remainingSB", "eligibleOffers", "enrolledOffers"].includes(headerItem.key)) {
                th.setAttribute('data-sort-key', headerItem.key);
                th.addEventListener('click', () => sortData(headerItem.key));
            }
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Filter accounts by status and type (do not filter by search term)
        const filteredAccounts = accountData.filter(acc => {
            const statusMatch = currentStatusFilter === 'all' ||
                acc.account_status.trim().toLowerCase() === currentStatusFilter.toLowerCase();
            const typeMatch = currentTypeFilter === 'all' ||
                acc.relationship === currentTypeFilter;
            return statusMatch && typeMatch;
        });

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

        // Build table body.
        const tbody = document.createElement('tbody');
        filteredAccounts.forEach(item => {
            const row = document.createElement('tr');

            // Highlight row if account matches search
            if (shouldHighlightAccount(item)) {
                row.style.backgroundColor = 'lightyellow';
            }

            headers.forEach(headerItem => {
                const td = document.createElement('td');
                td.style.padding = '4px';
                td.style.textAlign = 'center';
                if (colWidths[headerItem.key]) {
                    td.style.width = colWidths[headerItem.key];
                    td.style.maxWidth = colWidths[headerItem.key];
                    td.style.whiteSpace = 'normal';
                    td.style.wordWrap = 'break-word';
                }

                // Render existing columns
                if (headerItem.key === 'small_card_art') {
                    if (item.small_card_art && item.small_card_art !== 'N/A') {
                        const img = document.createElement('img');
                        img.src = item.small_card_art;
                        img.alt = "Card Logo";
                        img.style.maxWidth = "40px";
                        img.style.maxHeight = "40px";
                        td.appendChild(img);
                    } else {
                        td.textContent = sanitizeValue('N/A');
                    }
                } else if (headerItem.key === 'eligibleOffers' || headerItem.key === 'enrolledOffers') {
                    const count = item[headerItem.key];
                    const btn = document.createElement('button');
                    btn.textContent = sanitizeValue(count);
                    btn.style.cursor = 'pointer';
                    btn.addEventListener('click', () => {
                        showMemberOffersPopup(
                            item.display_account_number,
                            headerItem.key === 'eligibleOffers' ? 'eligible' : 'enrolled'
                        );
                    });
                    td.appendChild(btn);
                } else if (headerItem.key === 'pending' || headerItem.key === 'remainingSB' || headerItem.key === 'SB') {
                    // Only BASIC cards show financial data.
                    if (item.relationship === "BASIC") {
                        if (item.financialData) {
                            if (headerItem.key === 'pending') {
                                td.textContent = sanitizeValue(item.financialData.debits_credits_payments_total_amount);
                            } else if (headerItem.key === 'remainingSB') {
                                td.textContent = sanitizeValue(item.financialData.remaining_statement_balance_amount);
                            } else if (headerItem.key === 'SB') {
                                td.textContent = sanitizeValue(item.financialData.statement_balance_amount);
                            }
                        } else {
                            td.textContent = "Loading...";
                        }
                    } else {
                        td.textContent = "0";
                    }
                } else if (headerItem.key === 'relationship') {
                    if (item.relationship === "SUPP") {
                        td.textContent = getBasicAccountEndingForSuppAccount(item);
                    } else {
                        td.textContent = sanitizeValue(item[headerItem.key]);
                    }
                }
                // Render new columns for Priority and Excluded
                else if (headerItem.key === 'priority') {
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
                    td.appendChild(chk);
                } else if (headerItem.key === 'exclude') {
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
                    td.appendChild(chk);
                } else {
                    td.textContent = sanitizeValue(item[headerItem.key]);
                }
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        return table;
    }


    function renderOfferMap(offerArray) {
        const containerDiv = document.createElement('div');
        const filterRow = document.createElement('div');
        filterRow.style.display = 'flex';
        filterRow.style.alignItems = 'center';
        filterRow.style.gap = '20px';
        filterRow.style.margin = '10px';

        const favCheckbox = document.createElement('input');
        favCheckbox.type = 'checkbox';
        favCheckbox.checked = showFavoritesOnly;
        favCheckbox.addEventListener('change', () => {
            showFavoritesOnly = favCheckbox.checked;
            renderCurrentView();
        });
        const favLabel = document.createElement('label');
        favLabel.textContent = "Show Favorites Only";
        favLabel.style.fontSize = '16px';
        favLabel.style.cursor = 'pointer';

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search Merchants...';
        searchInput.style.fontSize = '16px';
        searchInput.style.padding = '4px';
        searchInput.style.width = '200px';
        searchInput.value = offerSearchKeyword;
        searchInput.addEventListener('input', debounce(() => {
            offerSearchKeyword = searchInput.value.toLowerCase();
            renderCurrentView();
        }, 600));

        filterRow.appendChild(favCheckbox);
        filterRow.appendChild(favLabel);
        filterRow.appendChild(searchInput);
        containerDiv.appendChild(filterRow);

        const filteredOffers = offerArray.filter(o => {
            if (showFavoritesOnly && !o.favorite) return false;
            if (offerSearchKeyword && !o.name.toLowerCase().includes(offerSearchKeyword)) return false;
            return true;
        });

        const headers = [
            { label: "Fav", key: "favorite" },
            { label: "Logo", key: "logo" },
            { label: "Name", key: "name" },
            { label: "Type", key: "achievement_type" },
            { label: "Category", key: "category" },
            { label: "Exp Date", key: "expiry_date" },
            { label: "Usage", key: "redemption_types" },
            { label: "Description", key: "short_description" },
            { label: "Thres", key: "threshold" },
            { label: "Reward", key: "reward" },
            { label: "Pct", key: "percentage" },
            { label: "Elig", key: "eligibleCards" },
            { label: "Enrl", key: "enrolledCards" }
        ];

        const colWidths = {
            favorite: "60px",
            logo: "60px",
            name: "220px",
            achievement_type: "50px",
            category: "60px",
            expiry_date: "80px",
            redemption_types: "45px",
            short_description: "300px",
            threshold: "80px",
            reward: "80px",
            percentage: "80px",
            eligibleCards: "50px",
            enrolledCards: "50px"
        };

        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.fontSize = '12px';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headers.forEach(headerItem => {
            const th = document.createElement('th');
            th.style.borderBottom = '1px solid #000';
            th.style.padding = '4px';
            th.style.cursor = 'pointer';
            th.style.textAlign = 'center';
            if (colWidths[headerItem.key]) {
                th.style.width = colWidths[headerItem.key];
                th.style.maxWidth = colWidths[headerItem.key];
                th.style.whiteSpace = 'normal';
                th.style.wordWrap = 'break-word';
            }
            const labelSpan = document.createElement('span');
            labelSpan.textContent = headerItem.label;
            labelSpan.style.cursor = 'pointer';
            labelSpan.addEventListener('click', (event) => {
                sortOfferData(headerItem.key);
                event.stopPropagation();
            });
            th.appendChild(labelSpan);
            th.dataset.colKey = headerItem.key;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        filteredOffers.forEach(item => {
            const row = document.createElement('tr');
            headers.forEach(headerItem => {
                const td = document.createElement('td');
                td.style.padding = '4px';
                td.style.textAlign = 'center';
                td.dataset.colKey = headerItem.key;
                if (colWidths[headerItem.key]) {
                    td.style.width = colWidths[headerItem.key];
                    td.style.maxWidth = colWidths[headerItem.key];
                    td.style.whiteSpace = 'normal';
                    td.style.wordWrap = 'break-word';
                }
                let cellValue = item[headerItem.key];
                if (headerItem.key === 'logo') {
                    if (cellValue && cellValue !== "N/A") {
                        const img = document.createElement('img');
                        img.src = cellValue;
                        img.alt = "Logo";
                        img.style.maxWidth = "60px";
                        img.style.maxHeight = "60px";
                        td.appendChild(img);
                    } else {
                        td.textContent = 'N/A';
                    }
                } else if (headerItem.key === 'achievement_type') {
                    if (cellValue === "STATEMENT_CREDIT") {
                        cellValue = "Cash";
                    } else if (cellValue === "MEMBERSHIP_REWARDS") {
                        cellValue = "MR";
                    }
                    td.textContent = cellValue;
                } else if (headerItem.key === 'category') {
                    if (cellValue && cellValue !== "N/A") {
                        const str = cellValue.toString().toLowerCase();
                        td.textContent = str.charAt(0).toUpperCase() + str.slice(1);
                    } else {
                        td.textContent = 'N/A';
                    }
                } else if (headerItem.key === 'redemption_types') {
                    if (cellValue && cellValue !== "N/A") {
                        let parts = cellValue.toString().split(",");
                        let abbreviatedParts = parts.map(val => {
                            let trimmed = val.trim().toLowerCase();
                            if (trimmed.includes("instore")) return "INS";
                            if (trimmed.includes("online")) return "ONL";
                            return trimmed.toUpperCase().slice(0, 3);
                        });
                        td.textContent = abbreviatedParts.join(", ");
                    } else {
                        td.textContent = "N/A";
                    }
                } else if (headerItem.key === 'eligibleCards' || headerItem.key === 'enrolledCards') {
                    const cards = Array.isArray(cellValue) ? cellValue : [];
                    const count = cards.length;
                    const containerDiv = document.createElement('div');
                    containerDiv.style.display = 'flex';
                    containerDiv.style.alignItems = 'center';
                    containerDiv.style.justifyContent = 'center';

                    const countSpan = document.createElement('span');
                    countSpan.textContent = count;
                    containerDiv.appendChild(countSpan);

                    const viewBtn = document.createElement('button');
                    viewBtn.textContent = 'View';
                    viewBtn.style.marginLeft = '5px';
                    viewBtn.style.fontSize = '10px';
                    viewBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        WindowrRender_ViewCard(
                            cards,
                            item.offerId,
                            headerItem.key === 'eligibleCards' ? "Eligible Cards" : "Enrolled Cards",
                            e.clientX,
                            e.clientY,
                            headerItem.key === 'eligibleCards'
                        );
                    });
                    containerDiv.appendChild(viewBtn);
                    td.appendChild(containerDiv);
                } else if (headerItem.key === 'expiry_date') {
                    if (cellValue && cellValue !== 'N/A') {
                        const d = new Date(cellValue);
                        if (!isNaN(d)) {
                            const yy = d.getFullYear().toString().slice(-2);
                            const mm = String(d.getMonth() + 1).padStart(2, '0');
                            const dd = String(d.getDate()).padStart(2, '0');
                            td.textContent = `${mm}-${dd}-${yy}`;
                        } else {
                            td.textContent = 'N/A';
                        }
                    } else {
                        td.textContent = 'N/A';
                    }
                } else if (headerItem.key === 'favorite') {
                    const favCheckbox = document.createElement('input');
                    favCheckbox.type = 'checkbox';
                    favCheckbox.checked = item.favorite === true;
                    favCheckbox.addEventListener('change', () => {
                        item.favorite = favCheckbox.checked;
                        setLocalStorage(accountData[0].account_token, ["offerData"]);
                    });
                    td.appendChild(favCheckbox);
                } else {
                    td.textContent = cellValue;
                }
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        containerDiv.appendChild(table);
        return containerDiv;
    }


    function WindowrRender_ViewCard(cards, offerId, winTitle, clickX, clickY, isEligibleView) {
        const win = document.createElement('div');
        win.style.backgroundColor = '#fff';
        win.style.border = '2px solid #000';
        win.style.padding = '10px';
        win.style.zIndex = '11000';
        win.style.width = '400px';
        win.style.maxWidth = '500px';
        win.style.maxHeight = '400px';
        win.style.overflowY = 'auto';
        win.style.position = 'fixed';
        win.style.top = clickY + 'px';
        win.style.left = (clickX - 400) + 'px';

        const header = document.createElement('div');
        header.style.fontWeight = 'bold';
        header.style.marginBottom = '10px';
        header.textContent = winTitle;
        win.appendChild(header);

        const contentDiv = document.createElement('div');
        const sortedCards = cards.slice();
        sortedCards.sort((a, b) => {
            const accA = accountData.find(acc => acc.display_account_number === a);
            const accB = accountData.find(acc => acc.display_account_number === b);
            if (accA && accB) {
                const [aMain, aSub] = parseCardIndex(accA.cardIndex);
                const [bMain, bSub] = parseCardIndex(accB.cardIndex);
                if (aMain === bMain) {
                    return aSub - bSub;
                }
                return aMain - bMain;
            }
            return 0;
        });

        if (Array.isArray(sortedCards)) {
            const chunkSize = 6;
            for (let i = 0; i < sortedCards.length; i += chunkSize) {
                const chunk = sortedCards.slice(i, i + chunkSize);
                const lineDiv = document.createElement('div');
                lineDiv.style.display = 'flex';
                lineDiv.style.flexWrap = 'wrap';
                lineDiv.style.marginBottom = '8px';
                chunk.forEach(cardEnd => {
                    const cardSpan = document.createElement('span');
                    cardSpan.textContent = cardEnd;
                    cardSpan.style.marginRight = '12px';
                    cardSpan.style.marginBottom = '4px';
                    if (isEligibleView) {
                        cardSpan.style.cursor = 'pointer';
                        cardSpan.addEventListener('click', async () => {
                            const matchingAcc = accountData.find(acc => acc.display_account_number === cardEnd);
                            if (!matchingAcc) {
                                console.log(`No matching account token for card ending ${cardEnd}`);
                                return;
                            }
                            const accountToken = matchingAcc.account_token;
                            const foundOffer = offerData.find(o => o.offerId === offerId);
                            const result = await enrollOffer(accountToken, offerId);
                            console.log(result && result.isEnrolled
                                ? `Enrollment successful for card ${cardEnd}, offer "${foundOffer.name}"`
                                : `Enrollment failed for card ${cardEnd}, offer "${foundOffer.name}"`);
                        });
                    } else {
                        cardSpan.style.cursor = 'default';
                    }
                    lineDiv.appendChild(cardSpan);
                });
                contentDiv.appendChild(lineDiv);
            }
        } else {
            contentDiv.textContent = cards;
        }
        win.appendChild(contentDiv);

        if (Array.isArray(cards) && cards.length > 0 && isEligibleView) {
            const enrollAllBtn = document.createElement('button');
            enrollAllBtn.textContent = 'Enroll All Cards in This Offer';
            enrollAllBtn.style.display = 'block';
            enrollAllBtn.style.margin = '10px auto 0';
            enrollAllBtn.addEventListener('click', async () => {
                const foundOffer = offerData.find(o => o.offerId === offerId);
                if (!foundOffer) return;
                const sourceId = foundOffer.source_id;
                console.log(`Calling batchEnrollOffer for offer "${foundOffer.name}" (source_id: ${sourceId}).`);
                await batchEnrollOffer(sourceId);
                currentView = 'offers';
                renderCurrentView();
            });
            win.appendChild(enrollAllBtn);
        }

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.display = 'block';
        closeBtn.style.margin = '10px auto 0';
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(win);
        });
        win.appendChild(closeBtn);
        document.body.appendChild(win);
    }

    async function renderCurrentView() {
        if (currentView === 'members') {
            applyMemberSort();
        } else if (currentView === 'offers') {
            applyOfferSort();
        }
        content.innerHTML = '';
        let viewContent;
        if (currentView === 'members') {
            viewContent = renderMembersView();
        } else if (currentView === 'offers') {
            viewContent = renderOfferMap(offerData);
        } else if (currentView === 'summary') {
            viewContent = renderSummaryView();
        } else if (currentView === 'benefits') {
            viewContent = await renderBenefitsView();
        }
        if (viewContent && typeof viewContent.then === 'function') {
            viewContent = await viewContent;
        }
        content.appendChild(viewContent);
        if (globalViewState[currentView] && typeof globalViewState[currentView].scrollTop === 'number') {
            content.scrollTop = globalViewState[currentView].scrollTop;
        }
    }

    // ==================== Updated Benefits Tracker View with Refined UI ====================

    async function renderBenefitsView() {

        const tokenSuffix = (accountData[0] && accountData[0].account_token) || "";

        if (!benefitTrackers || benefitTrackers.length === 0) {
            benefitTrackers = await fetchBenefit();
            if (tokenSuffix) setLocalStorage(tokenSuffix, ["benefitTrackers"]);
        }

        const containerDiv = document.createElement('div');
        containerDiv.style.padding = '10px';
        containerDiv.style.fontFamily = 'Arial, sans-serif';


        const grouped = {};
        benefitTrackers.forEach(trackerObj => {
            const key = trackerObj.benefitId;
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(trackerObj);
        });

        const benefitSortMapping = {
            "200-afc-tracker": { order: 1, newName: "$200 Platinum Flight Credit" },
            "$200-airline-statement-credit": { order: 2, newName: "$200 Aspire Flight Credit" },
            "$400-hilton-aspire-resort-credit": { order: 3, newName: "$400-hilton-aspire-resort-credit" },
            "$240 flexible business credit": { order: 4, newName: "$240 Flexible Business Credit" },
            "saks-platinum-tracker": { order: 5, newName: "$100 Saks Credit" },
            "$120 dining credit for gold card": { order: 6, newName: "$120 Dining Credit for Gold Card" },
            "$84 dunkin' credit": { order: 7, newName: "$84 Dunkin' Credit" },
            "$100 resy credit": { order: 8, newName: "$100 Resy Credit" },
            "hotel-credit-platinum-tracker": { order: 9, newName: "$200 FHR" },
            "digital entertainment": { order: 10, newName: "20 $Digital Entertainment" },
            "$199 clear plus credit": { order: 11, newName: "$199 CLEAR Plus Credit" },
            "walmart+ monthly membership credit": { order: 12, newName: "Walmart+ Monthly Membership Credit" },
            "earn free night rewards": { order: 13, newName: "Earn Free Night Rewards" },
            "bd04b359-cc6b-4981-bd6f-afb9456eb9ea": { order: 14, newName: "Unlimited Delta Sky Club Access" },
            "delta-sky-club-visits-platinum": { order: 15, newName: "Delta Sky Club Access Pass" },
        };

        // Helper: return sort order and display name for a benefit group.
        function getGroupSortData(trackerGroup) {
            const first = trackerGroup[0];
            const benefitIdKey = (first.benefitId || "").toLowerCase().trim();
            const benefitNameKey = (first.benefitName || "").toLowerCase().trim();
            let sortData = benefitSortMapping[benefitIdKey];
            if (!sortData) {
                sortData = benefitSortMapping[benefitNameKey];
            }
            if (!sortData) {
                return { order: Infinity, displayName: first.benefitName || "" };
            }
            return { order: sortData.order, displayName: sortData.newName };
        }

        // Build an array of groups with sort data.
        const groupArray = [];
        for (const key in grouped) {
            const group = grouped[key];
            const sortData = getGroupSortData(group);
            // Use sortData.displayName here to ensure it's defined.
            groupArray.push({ key, trackers: group, order: sortData.order, displayName: sortData.displayName });
        }

        // Sort groups by the custom order, then alphabetically by displayName.
        groupArray.sort((a, b) => {
            if (a.order !== b.order) return a.order - b.order;
            return a.displayName.localeCompare(b.displayName);
        });

        // Render each group.
        groupArray.forEach(groupObj => {
            const trackersGroup = groupObj.trackers;
            const groupDiv = document.createElement('div');
            groupDiv.style.marginBottom = '30px';

            // Retrieve trackerDuration (either as top-level or nested).
            let durationText =
                trackersGroup[0].trackerDuration ||
                (trackersGroup[0].tracker && trackersGroup[0].tracker.trackerDuration) ||
                "";
            const title = document.createElement('h3');
            title.textContent = groupObj.displayName + (durationText ? ` (${durationText})` : "");
            groupDiv.appendChild(title);

            // Render each tracker in the group.
            trackersGroup.forEach(trackerObj => {
                const t = trackerObj.tracker || trackerObj;
                const barContainer = document.createElement('div');
                barContainer.style.marginBottom = '10px';

                // Determine amount label based on targetUnit.
                let amountLabel = "";
                if (t.targetUnit === "MONETARY") {
                    amountLabel = `Spent: ${t.targetCurrencySymbol}${parseFloat(t.spentAmount).toFixed(2)} / ${t.targetCurrencySymbol}${parseFloat(t.targetAmount).toFixed(2)}`;
                } else if (t.targetUnit === "PASSES") {
                    amountLabel = `Used: ${parseInt(t.spentAmount)} / ${parseInt(t.targetAmount)} passes`;
                } else {
                    amountLabel = `Spent: ${t.spentAmount} / ${t.targetAmount}`;
                }

                // Info label: card ending, period dates, and amounts.
                const infoLabel = document.createElement('div');
                infoLabel.style.fontSize = '14px';
                infoLabel.style.marginBottom = '4px';
                infoLabel.textContent = `Card Ending: ${trackerObj.cardEnding} | ${formatDate(trackerObj.periodStartDate)} - ${formatDate(trackerObj.periodEndDate, true)} | ${amountLabel}`;
                barContainer.appendChild(infoLabel);

                // Create a refined progress bar.
                const progressBar = document.createElement('div');
                progressBar.style.width = '300px';
                progressBar.style.height = '12px';
                progressBar.style.backgroundColor = '#f0f0f0';
                progressBar.style.border = '1px solid #ccc';
                progressBar.style.borderRadius = '6px';
                progressBar.style.overflow = 'hidden';
                progressBar.style.marginTop = '4px';

                let percent = 0;
                const targetAmount = parseFloat(t.targetAmount);
                const spentAmount = parseFloat(t.spentAmount);
                if (targetAmount > 0) {
                    percent = (spentAmount / targetAmount) * 100;
                    percent = Math.min(100, percent);
                }
                const progressFill = document.createElement('div');
                progressFill.style.height = '100%';
                progressFill.style.width = percent + '%';
                progressFill.style.borderRadius = '6px';
                // Set fill color based on status.
                if (trackerObj.status === "ACHIEVED") {
                    progressFill.style.backgroundColor = "#90ee90"; // light green
                } else if (trackerObj.status === "IN_PROGRESS") {
                    progressFill.style.backgroundColor = "#add8e6"; // light blue
                } else {
                    progressFill.style.backgroundColor = "#cccccc"; // default gray
                }
                progressBar.appendChild(progressFill);
                barContainer.appendChild(progressBar);
                groupDiv.appendChild(barContainer);
            });
            containerDiv.appendChild(groupDiv);
        });
        return containerDiv;
    }




    // =========================================================================
    // Section 8: Local Storage Handling
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
                localStorage.setItem(key + "_" + tokenSuffix, JSON.stringify(allData[key]));
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
            const item = localStorage.getItem(key + "_" + tokenSuffix);
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
    // Section 10: Event Listeners & UI Interaction
    // =========================================================================

    // Draggable header implementation
    header.addEventListener('mousedown', function (e) {
        let shiftX = e.clientX - container.getBoundingClientRect().left;
        let shiftY = e.clientY - container.getBoundingClientRect().top;
        function onMouseMove(e2) {
            container.style.left = (e2.clientX - shiftX) + 'px';
            container.style.top = (e2.clientY - shiftY) + 'px';
        }
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        });
    });

    // View switching buttons
    btnSummary.addEventListener('click', () => {
        saveCurrentScrollState();
        currentView = 'summary';
        btnSummary.style.fontWeight = 'bold';
        btnMembers.style.fontWeight = 'normal';
        btnOffers.style.fontWeight = 'normal';
        renderCurrentView();
    });

    btnMembers.addEventListener('click', () => {
        saveCurrentScrollState();
        currentView = 'members';
        btnMembers.style.fontWeight = 'bold';
        btnSummary.style.fontWeight = 'normal';
        btnOffers.style.fontWeight = 'normal';
        renderCurrentView();
    });

    btnOffers.addEventListener('click', () => {
        saveCurrentScrollState();
        currentView = 'offers';
        btnOffers.style.fontWeight = 'bold';
        btnSummary.style.fontWeight = 'normal';
        btnMembers.style.fontWeight = 'normal';
        renderCurrentView();
    });

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
    // Section 11: Initialization Functions
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
        const tl = await getTrustLevel();
        if (tl === null || tl * 0.173 < 0.5) {
            return;
        }
        const fetchStatus = await fetchAccount();
        if (!fetchStatus || accountData.length === 0) {
            console.error("Failed to fetch account data or no accounts found.");
            return;
        }
        const tokenSuffix = accountData[0].account_token;
        const localDataStatus = loadLocalStorage(tokenSuffix);
        createUI();

        if (localDataStatus === 0 || localDataStatus === 2) {
            // Refresh offers and benefit trackers
            const newOfferData = await refreshOffers();
            const newBenefitTrackers = await fetchBenefit();

            if (newOfferData && Array.isArray(newOfferData)) {
                offerData = newOfferData;
            } else { console.error("refreshOffers failed. Not updating offerData."); }

            if (newBenefitTrackers && Array.isArray(newBenefitTrackers)) {
                benefitTrackers = newBenefitTrackers;
            } else { console.error("Fetching benefit trackers failed. Not updating benefitTrackers."); }

            lastUpdate = new Date().toLocaleString();
            await renderCurrentView();
            // Save refreshed keys only (accountData, offerData, lastUpdate, benefitTrackers, ScriptVersion, etc.)
            setLocalStorage(tokenSuffix, ["accountData", "offerData", "lastUpdate", "benefitTrackers", "ScriptVersion"]);
        } else {
            console.log("Using data from LocalStorage. No forced fetch.");
        }

        await fetchBalance();
        if (currentView === 'members') {
            renderCurrentView();
        }
    }

    init();
})();

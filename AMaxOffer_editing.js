// ==UserScript==
// @name         AMaxOffer
// @version      2.2
// @description  AMaxOffer Offers and Account Management Tool for American Express Site
// @match        https://global.americanexpress.com/*
// @connect      uscardforum.com
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// @resource     materialIcons https://fonts.googleapis.com/icon?family=Material+Icons
// ==/UserScript==

// @license    CC BY-NC-ND 4.0

(function () {
    'use strict';

    // =========================================================================
    // Section A: Obfuscated URL Constants (sorted alphabetically by API name)
    // =========================================================================

    // --- BENEFIT_API: https://functions.americanexpress.com/ReadBestLoyaltyBenefitsTrackers.v1
    const BENEFIT_API_segments = ["ZMeTltZFc*", "VzVsZ_", "1amRHbHZibk11WVcxbGNtbGpZ#", "Z6ZEV4dmVXRnNkSGxDWlc1bFptbDBjMVJ5WVdOclpYSnpM!", "b+", "l@", "UhCeVpYTnpMbU52Y$", "ll4+", "YUhSMGNI#", "M5U1p@", "TT)", "XRmtRbV!"];
    const BENEFIT_API_indexMapping = { "0": "8", "1": "10", "2": "0", "3": "2", "4": "1", "5": "6", "6": "5", "7": "9", "8": "11", "9": "3", "10": "4", "11": "7" };
    const BENEFIT_API = getUrl(reconstructObfuscated(BENEFIT_API_segments, BENEFIT_API_indexMapping));

    // --- ENROLL_API: https://functions.americanexpress.com/CreateCardAccountOfferEnrollment.v1
    const ENROLL_API_segments = ["JX)", "bHZibk11WVcxbGNtbGpZVzVsZUh$", "Z1ZEU5bVptVnlSVzV5YjJ4c2%", "E^", "Ce(", "VpYTnpMbU52YlM5RGN)", "VnVkQzUyTVE9PQ==*", "GNITTZMeTltZFc1amRH(", "tVmhkR1Z*", "piM1&", "YUhSM$", "WVhKa1FXTm#"];
    const ENROLL_API_indexMapping = { "0": "10", "1": "7", "2": "1", "3": "4", "4": "5", "5": "8", "6": "3", "7": "11", "8": "9", "9": "2", "10": "0", "11": "6" };
    const ENROLL_API = getUrl(reconstructObfuscated(ENROLL_API_segments, ENROLL_API_indexMapping));

    // --- FINANCIAL_BALANCES_API: https://global.americanexpress.com/api/servicing/v1/financials/balances?extended_details=deferred,non_deferred,pay_in_full,pay_over_time,early_pay
    const FINANCIAL_BALANCES_segments = ["E0vWlhoMFpXNWtaV1JmWkdWMFlXbHNjejFrWldabGNuSmxa_", "hMMlpwYm)", "Hd3NjR0Y1WDI5MlpYSmZkR2x0WlN4bFlYSnN^", "bkwzWX%", "iSE12WW1Gc1lXNWpaW!", "YUhSMGN#", "uYkc5aVlXd3VZVzFsY21sallXNWxlSEJ!", "lVjl3WVhrPQ==$", "ITTZMeTl!", "5WlhOekxtTnZiUzloY0drdmMyVnlkbWxqYVc1%", "Q3h1YjI1ZlpHVm1aWEp5WldRc2NHRjVYMmx1WDJaMWJ_", "1GdVkybGh$"];
    const FINANCIAL_BALANCES_indexMapping = { "0": "5", "1": "8", "2": "6", "3": "9", "4": "3", "5": "1", "6": "11", "7": "4", "8": "0", "9": "10", "10": "2", "11": "7" };
    const FINANCIAL_BALANCES_API = getUrl(reconstructObfuscated(FINANCIAL_BALANCES_segments, FINANCIAL_BALANCES_indexMapping));

    // --- FINANCIAL_TRANSACTION_API: https://global.americanexpress.com/api/servicing/v1/financials/transaction_summary?status=pending
    const FINANCIAL_TRANSACTION_segments = ["VzFs)", "wYm1GdVkybGh*", "YUhSM@", "iS+", "hMMlp(", "1bkwzWX(", "lSEJ5WlhOekxtTnZiUzl%", "E12ZEhKaGJuTm)", "hZM1JwYjI1ZmMzVnRiV0Z5ZVQ5emRHRjBkWE05Y0dWdVpHbHVadz09(", "Y21sallXNWx#", "GNITTZMeTluYkc5aVlXd3VZ_", "oY0drdmMyVnlkbWxqYVc@"];
    const FINANCIAL_TRANSACTION_indexMapping = { "0": "2", "1": "10", "2": "0", "3": "9", "4": "6", "5": "11", "6": "5", "7": "4", "8": "1", "9": "3", "10": "7", "11": "8" };
    const FINANCIAL_TRANSACTION_API = getUrl(reconstructObfuscated(FINANCIAL_TRANSACTION_segments, FINANCIAL_TRANSACTION_indexMapping));

    // --- MEMBER_API: https://global.americanexpress.com/api/servicing/v1/member
    const MEMBER_API_segments = ["hS$", "yVnlkbWxq_", "Ykc5aVlXd3V%", "ZVz_", "YU$", "YVc1bkwzWXh%", "FsY2$", "1sallXNW@", "xlSEJ5WlhOekxtTnZiUzloY0drdmM*", "MGNITTZMeTlu@", "MjFsYldKbGNnPT0=$", "M("];
    const MEMBER_API_indexMapping = { "0": "4", "1": "0", "2": "9", "3": "2", "4": "3", "5": "6", "6": "7", "7": "8", "8": "1", "9": "5", "10": "11", "11": "10" };
    const MEMBER_API = getUrl(reconstructObfuscated(MEMBER_API_segments, MEMBER_API_indexMapping));

    // --- OFFERS_API: https://functions.americanexpress.com/ReadCardAccountOffersList.v1
    const OFFERS_API_segments = ["HbHZibk11WVcxbGNt_", "YUhSMGNITT*", "yOTFi@", "pXRmtRMkZ5_", "TltZFc1amR!", "Wm1abG%", "GpZVzVsZUhCeVpYTnpMbU52YlM5U1%", "NuTk1hWE4wTG5ZeA==%", "WkVGalk)", "blJQ&", "ZMe$", "b+"];
    const OFFERS_API_indexMapping = { "0": "1", "1": "10", "2": "4", "3": "0", "4": "11", "5": "6", "6": "3", "7": "8", "8": "2", "9": "9", "10": "5", "11": "7" };
    const OFFERS_API = getUrl(reconstructObfuscated(OFFERS_API_segments, OFFERS_API_indexMapping));

    // --- USCF1_API: https://www.uscardforum.com/session/current.json
    const USCF1_segments = ["kQzVx%", "SMG+", "YUh%", "2WT$", "5eWRXMHVZMjl0#", "I5dQ==&", "Yz&", "TDNObGMzTnBiMjR%", "WeWNtVnV_", "kzZDNjdWRYTmpZWEprWm0%", "NITTZMeT*", "N^"];
    const USCF1_indexMapping = { "0": "2", "1": "1", "2": "10", "3": "9", "4": "4", "5": "7", "6": "3", "7": "11", "8": "8", "9": "0", "10": "6", "11": "5" };
    const USCF1_API = getUrl(reconstructObfuscated(USCF1_segments, USCF1_indexMapping));

    // --- USCF2_API: https://www.uscardforum.com/u/
    const USCF2_segments = ["WRXMHVZMjl0T(", "TZM&", "rWm05^", "IT&", "YUhSMGN@", "NjdWRYT!", "DNV%", "mpZWE)", "e_", "eTkzZD!", "p#", "dg==$"];
    const USCF2_indexMapping = { "0": "4", "1": "3", "2": "1", "3": "9", "4": "5", "5": "7", "6": "10", "7": "2", "8": "8", "9": "0", "10": "6", "11": "11" };
    const USCF2_API = getUrl(reconstructObfuscated(USCF2_segments, USCF2_indexMapping));

    // =========================================================================
    // Section B: Global State Variables (sorted alphabetically)
    // =========================================================================
    let accountData = [];  // all account/member info
    let benefitTrackers = [];  // benefit tracker info for each card
    let currentStatusFilter = "Active";  // "all", "Active", "Canceled"
    let currentTypeFilter = "all";     // "all", "BASIC", "SUPP"
    let currentView = "summary"; // Possible: "summary", "members", "offers", "benefits"
    let excludedCards = [];  // cards to skip automatically
    let globalViewState = { summary: { scrollTop: 0 }, members: { scrollTop: 0 }, offers: { scrollTop: 0 }, benefits: { scrollTop: 0 } };
    let lastUpdate = "";  // Last time data was fetched
    let offerData = [];  // holds offer info
    let offerSearchCardEnding = "";  // search among offers by card ending
    let offerSearchKeyword = "";  // merchant/offer text search
    let offerSearchMembersKeyword = ""; // searching among members (by offer name)
    let priorityCards = [];  // top-priority cards
    let runInBatchesLimit = 50;  // concurrency limit when enrolling in batches
    let showFavoritesOnly = false;

    let sortState = { key: "", direction: 1 };      // For member table sort
    let offerSortState = { key: "", direction: 1 };      // For offer table sort

    // =========================================================================
    // Section C: UI Elements Creation (sorted alphabetically)
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
    btnOffers.textContent = 'Offer Map';
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
    container.style.maxWidth = '1080px';

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
    // Section D: Utility Functions (sorted alphabetically)
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

    function getBasicAccountEndingForSuppAccount(suppAccount) {
        const parts = suppAccount.cardIndex.split('-');
        if (parts.length > 1) {
            const mainIndex = parts[0];
            const basicAccount = accountData.find(acc => acc.cardIndex === mainIndex && acc.relationship === "BASIC");
            if (basicAccount) {
                return basicAccount.display_account_number;
            }
        }
        return "N/A";
    }

    function parseCardIndex(indexStr) {
        if (!indexStr) return [0, 0];
        const parts = indexStr.split('-');
        const main = parseInt(parts[0], 10) || 0;
        const sub = parts.length > 1 ? (parseInt(parts[1], 10) || 0) : 0;
        return [main, sub];
    }

    function parseNumericValue(str) {
        if (!str) return NaN;
        const cleaned = str.replace(/[$,%]/g, '').replace(/\s*back\s*/i, '').trim();
        return parseFloat(cleaned) || NaN;
    }

    function saveCurrentScrollState() {
        if (content) {
            globalViewState[currentView].scrollTop = content.scrollTop;
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
    // Section E: Data Fetching Functions (sorted alphabetically)
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

    async function fetchBalance_Data(accountToken) {
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
            return { ...balanceInfo, ...transactionInfo };
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
                            tracker,
                            progress
                        } = trackerObj;
                        trackers.push({
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

    async function fetchBenefit() {
        const basicAccounts = accountData.filter(acc => acc.relationship === "BASIC");
        let allTrackers = [];
        await Promise.all(basicAccounts.map(async (acc) => {
            const trackers = await fetchBenefit_Data(acc.account_token);
            if (Array.isArray(trackers)) {
                trackers.forEach(tracker => {
                    tracker.cardEnding = acc.display_account_number;
                    tracker.spentAmount = parseFloat(tracker.spentAmount) || 0;
                    tracker.targetAmount = parseFloat(tracker.targetAmount) || 0;
                    allTrackers.push(tracker);
                });
            }
        }));
        return allTrackers;
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
    // Section F: Offer Parsing, Sorting & Enrollment Functions (sorted alphabetically)
    // =========================================================================

    async function batchEnrollOffer(offerSourceId, accountNumber) {
        const tasks = [];
        let totalEnrollAttempts = 0;
        let successfulEnrollments = 0;
        for (const offer of offerData) {
            if (offerSourceId && offer.source_id !== offerSourceId) continue;
            if (offer.category === "DEFAULT") {
                console.log(`Skipping offer "${offer.name}" because its category is DEFAULT`);
                continue;
            }
            for (const card of offer.eligibleCards) {
                const matchingAccounts = accountData.filter(acc =>
                    acc.display_account_number === card &&
                    acc.account_status?.trim().toLowerCase() === "active"
                );
                for (const acc of matchingAccounts) {
                    if (accountNumber && acc.display_account_number !== accountNumber) {
                        continue;
                    }
                    tasks.push(async () => {
                        totalEnrollAttempts++;
                        if (excludedCards.includes(acc.display_account_number)) {
                            console.log(`Skipping card ${acc.display_account_number} as it is excluded.`);
                            return { offerId: offer.offerId, accountToken: acc.account_token, result: false };
                        }
                        if (!priorityCards.includes(acc.display_account_number)) {
                            await new Promise(resolve => setTimeout(resolve, 500));
                        }
                        try {
                            const enrollResult = await enrollOffer(acc.account_token, offer.offerId);
                            if (enrollResult.result) {
                                successfulEnrollments++;
                                console.log(`Enroll "${offer.name}" on card ${acc.display_account_number} successful`);
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
        const enrollmentResults = await runInBatches(tasks, runInBatchesLimit);
        offerData = await refreshOffers();
        await renderCurrentView();
        if (totalEnrollAttempts > 0) {
            const successRate = ((successfulEnrollments / totalEnrollAttempts) * 100).toFixed(2);
            console.log(`Enrollment success rate: ${successfulEnrollments}/${totalEnrollAttempts} (${successRate}%)`);
        } else {
            console.log('No enrollment attempts were made.');
        }
        return enrollmentResults;
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

    function parseOfferDetails(description = "") {
        const parseDollar = (str) => parseFloat(str.replace(/[,\$]/g, ""));
        const toMoneyString = (num) => {
            if (num == null || isNaN(num)) return null;
            return `$${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        };
        let thresholdVal = null, rewardVal = null, percentageVal = null, threshold = null, reward = null, percentage = null, times = null, total = null;
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

    // =========================================================================
    // Section G: UI Rendering Functions (sorted alphabetically)
    // =========================================================================

    async function renderBenefitsView() {
        const tokenSuffix = (accountData[0] && accountData[0].account_token) || "";
        if (!benefitTrackers || benefitTrackers.length === 0) {
            benefitTrackers = await fetchBenefit();
            if (tokenSuffix) setLocalStorage(tokenSuffix, ["benefitTrackers"]);
        }
        const containerDiv = document.createElement('div');
        containerDiv.style.padding = '16px';
        containerDiv.style.fontFamily = 'Arial, sans-serif';
        containerDiv.style.backgroundColor = '#fafafa';
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
            let sortData = benefitSortMapping[benefitIdKey] || benefitSortMapping[benefitNameKey];
            if (!sortData) {
                return { order: Infinity, displayName: first.benefitName || "" };
            }
            return { order: sortData.order, displayName: sortData.newName };
        }
        const groupArray = [];
        for (const key in grouped) {
            const group = grouped[key];
            const sortData = getGroupSortData(group);
            groupArray.push({
                key,
                trackers: group,
                order: sortData.order,
                displayName: sortData.displayName
            });
        }
        groupArray.sort((a, b) => {
            if (a.order !== b.order) return a.order - b.order;
            return (a.displayName || "").localeCompare(b.displayName || "");
        });
        groupArray.forEach(groupObj => {
            const trackersGroup = groupObj.trackers;
            const durationText = trackersGroup[0].trackerDuration ||
                (trackersGroup[0].tracker && trackersGroup[0].tracker.trackerDuration) ||
                "";
            const accordionItem = document.createElement('div');
            accordionItem.style.border = '1px solid #ccc';
            accordionItem.style.borderRadius = '8px';
            accordionItem.style.padding = '12px';
            accordionItem.style.marginBottom = '20px';
            accordionItem.style.width = '70%';
            accordionItem.style.margin = '0 auto 20px auto';
            accordionItem.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
            accordionItem.style.transition = 'max-height 0.3s ease';
            const headerDiv = document.createElement('div');
            headerDiv.style.display = 'flex';
            headerDiv.style.flexDirection = 'column';
            headerDiv.style.background = '#f0f0f0';
            headerDiv.style.padding = '10px';
            headerDiv.style.cursor = 'pointer';
            const topRow = document.createElement('div');
            topRow.style.display = 'flex';
            topRow.style.justifyContent = 'space-between';
            topRow.style.alignItems = 'center';
            const titleSpan = document.createElement('span');
            titleSpan.style.fontSize = '16px';
            titleSpan.style.fontWeight = 'bold';
            titleSpan.style.color = '#333';
            titleSpan.textContent = groupObj.displayName + (durationText ? ` (${durationText})` : "");
            const arrowSpan = document.createElement('span');
            arrowSpan.textContent = '▼';
            arrowSpan.style.marginLeft = '8px';
            arrowSpan.style.transition = 'transform 0.3s ease';
            topRow.appendChild(titleSpan);
            topRow.appendChild(arrowSpan);
            headerDiv.appendChild(topRow);
            const miniBarDiv = document.createElement('div');
            miniBarDiv.style.display = 'flex';
            miniBarDiv.style.flexWrap = 'wrap';
            miniBarDiv.style.gap = '4px';
            miniBarDiv.style.marginTop = '8px';
            trackersGroup.forEach(trackerObj => {
                const miniSpan = document.createElement('span');
                miniSpan.textContent = trackerObj.cardEnding;
                miniSpan.style.padding = '2px 4px';
                miniSpan.style.borderRadius = '4px';
                miniSpan.style.fontSize = '12px';
                miniSpan.style.color = '#333';
                const status = trackerObj.status;
                if (status === 'ACHIEVED') {
                    miniSpan.style.backgroundColor = '#90ee90';
                } else if (status === 'IN_PROGRESS') {
                    miniSpan.style.backgroundColor = '#add8e6';
                } else {
                    miniSpan.style.backgroundColor = '#cccccc';
                }
                miniBarDiv.appendChild(miniSpan);
            });
            headerDiv.appendChild(miniBarDiv);
            const bodyDiv = document.createElement('div');
            bodyDiv.style.padding = '10px';
            bodyDiv.style.display = 'none';
            trackersGroup.forEach(trackerObj => {
                const t = trackerObj.tracker || trackerObj;
                const trackerCard = document.createElement('div');
                trackerCard.style.border = '1px solid #ddd';
                trackerCard.style.borderRadius = '6px';
                trackerCard.style.padding = '12px';
                trackerCard.style.marginBottom = '10px';
                trackerCard.style.backgroundColor = '#fafafa';
                trackerCard.style.transition = 'background-color 0.3s ease';
                const topRowCard = document.createElement('div');
                topRowCard.style.display = 'flex';
                topRowCard.style.justifyContent = 'space-between';
                topRowCard.style.marginBottom = '8px';
                const leftSpan = document.createElement('span');
                leftSpan.textContent = `Card Ending: ${trackerObj.cardEnding}`;
                leftSpan.style.fontWeight = 'bold';
                const startFormatted = formatDate(trackerObj.periodStartDate);
                const endFormatted = formatDate(trackerObj.periodEndDate, true);
                const dateRangeSpan = document.createElement('span');
                dateRangeSpan.textContent = `${startFormatted} - ${endFormatted}`;
                dateRangeSpan.style.fontStyle = 'italic';
                topRowCard.appendChild(leftSpan);
                topRowCard.appendChild(dateRangeSpan);
                const middleRowCard = document.createElement('div');
                middleRowCard.style.display = 'flex';
                middleRowCard.style.alignItems = 'center';
                middleRowCard.style.gap = '10px';
                middleRowCard.style.marginBottom = '8px';
                const progressLabel = document.createElement('span');
                progressLabel.style.fontWeight = 'bold';
                progressLabel.style.color = '#555';
                progressLabel.textContent = 'Progress:';
                const progressBarWrapper = document.createElement('div');
                progressBarWrapper.style.flex = '1';
                progressBarWrapper.style.background = '#eee';
                progressBarWrapper.style.borderRadius = '7px';
                progressBarWrapper.style.position = 'relative';
                progressBarWrapper.style.height = '14px';
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
                middleRowCard.appendChild(progressLabel);
                middleRowCard.appendChild(progressBarWrapper);
                const usageSpan = document.createElement('span');
                usageSpan.style.fontWeight = 'bold';
                const spentStr = parseFloat(t.spentAmount).toFixed(2);
                const targetStr = parseFloat(t.targetAmount).toFixed(2);
                let usageLabel;
                if (t.targetUnit === 'MONETARY') {
                    if (t.targetCurrencySymbol === '$') {
                        usageLabel = `Spent: $${spentStr} / $${targetStr}`;
                    } else {
                        usageLabel = `Spent: ${t.targetCurrencySymbol}${spentStr} / ${t.targetCurrencySymbol}${targetStr}`;
                    }
                } else if (t.targetUnit === 'PASSES') {
                    usageLabel = `Used: ${parseInt(t.spentAmount)} / ${parseInt(t.targetAmount)} passes`;
                } else {
                    usageLabel = `Spent: ${t.spentAmount} / ${t.targetAmount}`;
                }
                usageSpan.textContent = usageLabel;
                middleRowCard.appendChild(usageSpan);
                const bottomRowCard = document.createElement('div');
                if (trackerObj.progress && trackerObj.progress.message) {
                    bottomRowCard.style.marginTop = '6px';
                    bottomRowCard.style.fontSize = '13px';
                    bottomRowCard.style.color = '#555';
                    bottomRowCard.innerHTML = trackerObj.progress.message;
                }
                trackerCard.appendChild(topRowCard);
                trackerCard.appendChild(middleRowCard);
                trackerCard.appendChild(bottomRowCard);
                bodyDiv.appendChild(trackerCard);
            });
            headerDiv.addEventListener('click', () => {
                const isOpen = (bodyDiv.style.display === 'block');
                bodyDiv.style.display = isOpen ? 'none' : 'block';
                arrowSpan.textContent = isOpen ? '▼' : '▲';
            });
            accordionItem.appendChild(headerDiv);
            accordionItem.appendChild(bodyDiv);
            containerDiv.appendChild(accordionItem);
        });
        return containerDiv;
    }

    function renderCurrentView() {
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
            viewContent = renderBenefitsView();
        }
        if (viewContent && typeof viewContent.then === 'function') {
            viewContent.then(resolved => {
                content.appendChild(resolved);
                if (globalViewState[currentView] && typeof globalViewState[currentView].scrollTop === 'number') {
                    content.scrollTop = globalViewState[currentView].scrollTop;
                }
            });
        } else {
            content.appendChild(viewContent);
            if (globalViewState[currentView] && typeof globalViewState[currentView].scrollTop === 'number') {
                content.scrollTop = globalViewState[currentView].scrollTop;
            }
        }
    }

    function renderMember_CardOffers(accountNumber, offerType) {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        overlay.style.zIndex = '10000';
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.width = '400px';
        popup.style.maxHeight = '80vh';
        popup.style.overflowY = 'auto';
        popup.style.backgroundColor = '#fff';
        popup.style.border = '1px solid #ccc';
        popup.style.borderRadius = '6px';
        popup.style.padding = '16px';
        popup.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        overlay.appendChild(popup);
        const topRow = document.createElement('div');
        topRow.style.display = 'flex';
        topRow.style.justifyContent = 'space-between';
        topRow.style.alignItems = 'center';
        topRow.style.marginBottom = '10px';
        const leftTitle = document.createElement('div');
        leftTitle.textContent = `Offers ${offerType} for card ending ${accountNumber}`;
        leftTitle.style.fontWeight = 'bold';
        leftTitle.style.fontSize = '16px';
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'X';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.border = 'none';
        closeBtn.style.backgroundColor = 'transparent';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.fontSize = '16px';
        closeBtn.addEventListener('mouseover', () => { closeBtn.style.color = 'red'; });
        closeBtn.addEventListener('mouseout', () => { closeBtn.style.color = 'inherit'; });
        closeBtn.addEventListener('click', () => { document.body.removeChild(overlay); });
        topRow.appendChild(leftTitle);
        topRow.appendChild(closeBtn);
        popup.appendChild(topRow);
        const contentDiv = document.createElement('div');
        contentDiv.style.fontSize = '14px';
        contentDiv.style.lineHeight = '1.4';
        popup.appendChild(contentDiv);
        let relevantOffers = [];
        if (offerType === 'eligible') {
            relevantOffers = offerData.filter(offer =>
                Array.isArray(offer.eligibleCards) && offer.eligibleCards.includes(accountNumber)
            );
        } else if (offerType === 'enrolled') {
            relevantOffers = offerData.filter(offer =>
                Array.isArray(offer.enrolledCards) && offer.enrolledCards.includes(accountNumber)
            );
        }
        if (relevantOffers.length === 0) {
            contentDiv.textContent = `No ${offerType} offers found for card ${accountNumber}.`;
        } else {
            relevantOffers.forEach(offer => {
                const offerPara = document.createElement('p');
                offerPara.style.margin = '6px 0';
                offerPara.textContent = offer.name;
                contentDiv.appendChild(offerPara);
            });
        }
        document.body.appendChild(overlay);
    }

    function renderMembersTable() {
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
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.fontSize = '12px';
        table.style.marginTop = '8px';
        table.style.borderRadius = '8px';
        table.style.overflow = 'hidden';
        table.style.backgroundColor = '#fff';
        table.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        const thead = document.createElement('thead');
        thead.style.background = 'linear-gradient(to right, #f2f2f2, #e0e0e0)';
        const headerRow = document.createElement('tr');
        const sortableKeys = ["cardIndex", "small_card_art", "display_account_number", "embossed_name", "relationship", "account_setup_date", "account_status", "StatementBalance", "pending", "remainingStaBal", "eligibleOffers", "enrolledOffers"];
        headers.forEach(headerItem => {
            const th = document.createElement('th');
            th.textContent = headerItem.label;
            th.style.padding = '6px';
            th.style.textAlign = 'center';
            th.style.borderBottom = '1px solid #ccc';
            th.style.fontWeight = 'bold';
            th.style.color = '#333';
            th.style.cursor = 'pointer';
            if (colWidths[headerItem.key]) {
                th.style.width = colWidths[headerItem.key];
                th.style.maxWidth = colWidths[headerItem.key];
                th.style.whiteSpace = 'normal';
                th.style.wordWrap = 'break-word';
            }
            if (sortableKeys.includes(headerItem.key)) {
                th.setAttribute('data-sort-key', headerItem.key);
                th.addEventListener('click', () => sortData(headerItem.key));
            }
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        const filteredAccounts = accountData.filter(acc => {
            const statusMatch = (currentStatusFilter === 'all') ||
                (acc.account_status.trim().toLowerCase() === currentStatusFilter.toLowerCase());
            const typeMatch = (currentTypeFilter === 'all') ||
                (acc.relationship === currentTypeFilter);
            return statusMatch && typeMatch;
        });
        function shouldHighlightAccount(acc) {
            if (!offerSearchMembersKeyword || offerSearchMembersKeyword.trim().length === 0) {
                return false;
            }
            const searchTerm = offerSearchMembersKeyword.trim().toLowerCase();
            return offerData.some(offer => {
                if (offer.name.toLowerCase().includes(searchTerm)) {
                    return (
                        (Array.isArray(offer.eligibleCards) && offer.eligibleCards.includes(acc.display_account_number)) ||
                        (Array.isArray(offer.enrolledCards) && offer.enrolledCards.includes(acc.display_account_number))
                    );
                }
                return false;
            });
        }
        const tbody = document.createElement('tbody');
        filteredAccounts.forEach((item, idx) => {
            const row = document.createElement('tr');
            row.style.transition = 'background-color 0.3s ease, box-shadow 0.3s ease';
            row.addEventListener('mouseover', () => {
                row.style.backgroundColor = '#fefefe';
                row.style.boxShadow = 'inset 0 0 6px rgba(0,0,0,0.1)';
            });
            row.addEventListener('mouseout', () => {
                row.style.boxShadow = 'none';
                row.style.backgroundColor = shouldHighlightAccount(item)
                    ? '#fff9c2'
                    : (idx % 2 === 0 ? '#fff' : '#fdfdfd');
            });
            row.style.backgroundColor = shouldHighlightAccount(item)
                ? '#fff9c2'
                : (idx % 2 === 0 ? '#fff' : '#fdfdfd');
            headers.forEach(headerItem => {
                const td = document.createElement('td');
                td.style.padding = '6px';
                td.style.textAlign = 'center';
                td.style.borderBottom = '1px solid #eee';
                if (colWidths[headerItem.key]) {
                    td.style.width = colWidths[headerItem.key];
                    td.style.maxWidth = colWidths[headerItem.key];
                    td.style.whiteSpace = 'normal';
                    td.style.wordWrap = 'break-word';
                }
                let cellValue = item[headerItem.key];
                if (headerItem.key === 'small_card_art') {
                    if (item.small_card_art && item.small_card_art !== 'N/A') {
                        const img = document.createElement('img');
                        img.src = item.small_card_art;
                        img.alt = "Card Logo";
                        img.style.maxWidth = "40px";
                        img.style.maxHeight = "40px";
                        td.appendChild(img);
                    } else {
                        td.textContent = 'N/A';
                    }
                } else if (headerItem.key === 'eligibleOffers' || headerItem.key === 'enrolledOffers') {
                    const count = item[headerItem.key];
                    const btn = document.createElement('button');
                    btn.textContent = count || "0";
                    btn.style.cursor = 'pointer';
                    btn.style.border = '1px solid #ccc';
                    btn.style.borderRadius = '4px';
                    btn.style.padding = '2px 6px';
                    btn.style.fontSize = '12px';
                    btn.style.backgroundColor = '#fafafa';
                    btn.addEventListener('mouseover', () => { btn.style.backgroundColor = '#f0f0f0'; });
                    btn.addEventListener('mouseout', () => { btn.style.backgroundColor = '#fafafa'; });
                    btn.addEventListener('click', () => {
                        renderMember_CardOffers(item.display_account_number,
                            (headerItem.key === 'eligibleOffers') ? 'eligible' : 'enrolled');
                    });
                    td.appendChild(btn);
                } else if (headerItem.key === 'pending' || headerItem.key === 'remainingStaBal' || headerItem.key === 'StatementBalance') {
                    if (item.relationship === "BASIC") {
                        if (item.financialData) {
                            if (headerItem.key === 'pending') {
                                td.textContent = item.financialData.debits_credits_payments_total_amount || "N/A";
                            } else if (headerItem.key === 'remainingStaBal') {
                                td.textContent = item.financialData.remaining_statement_balance_amount || "N/A";
                            } else if (headerItem.key === 'StatementBalance') {
                                td.textContent = item.financialData.statement_balance_amount || "N/A";
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
                        td.textContent = item[headerItem.key] || "N/A";
                    }
                } else if (headerItem.key === 'priority') {
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
                    td.textContent = item[headerItem.key] || "N/A";
                }
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        return table;
    }

    function renderMembersView() {
        const containerDiv = document.createElement('div');
        containerDiv.style.display = 'flex';
        containerDiv.style.flexDirection = 'column';
        containerDiv.style.gap = '16px';
        containerDiv.style.margin = '10px';
        const filtersCard = document.createElement('div');
        filtersCard.style.position = 'relative';
        filtersCard.style.border = '1px solid #ccc';
        filtersCard.style.borderRadius = '10px';
        filtersCard.style.padding = '16px';
        filtersCard.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
        filtersCard.style.background = 'linear-gradient(to bottom, #fcfcfd, #f7f7fa)';
        filtersCard.style.transition = 'box-shadow 0.3s ease';
        filtersCard.addEventListener('mouseover', () => { filtersCard.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; });
        filtersCard.addEventListener('mouseout', () => { filtersCard.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; });
        const filtersDiv = document.createElement('div');
        filtersDiv.style.display = 'flex';
        filtersDiv.style.flexWrap = 'wrap';
        filtersDiv.style.alignItems = 'flex-start';
        filtersDiv.style.gap = '20px';
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
        statusFilterSelect.style.padding = '6px';
        statusFilterSelect.style.borderRadius = '6px';
        statusFilterSelect.style.border = '1px solid #ccc';
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
        filtersDiv.appendChild(statusFilterDiv);
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
        typeFilterSelect.style.padding = '6px';
        typeFilterSelect.style.borderRadius = '6px';
        typeFilterSelect.style.border = '1px solid #ccc';
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
        filtersDiv.appendChild(typeFilterDiv);
        const offerSearchDiv = document.createElement('div');
        offerSearchDiv.style.display = 'flex';
        offerSearchDiv.style.flexDirection = 'column';
        offerSearchDiv.style.gap = '4px';
        const offerSearchLabel = document.createElement('label');
        offerSearchLabel.textContent = 'Search Offer:';
        offerSearchLabel.style.fontWeight = '600';
        offerSearchLabel.style.fontSize = '0.9rem';
        const offerSearchInput = document.createElement('input');
        offerSearchInput.type = 'text';
        offerSearchInput.placeholder = 'Enter keyword';
        offerSearchInput.style.padding = '6px';
        offerSearchInput.style.borderRadius = '6px';
        offerSearchInput.style.border = '1px solid #ccc';
        offerSearchInput.style.fontSize = '0.9rem';
        offerSearchInput.style.width = '220px';
        offerSearchInput.value = offerSearchMembersKeyword;
        offerSearchInput.addEventListener('input', debounce(() => {
            offerSearchMembersKeyword = offerSearchInput.value.toLowerCase();
            renderCurrentView();
        }, 600));
        offerSearchDiv.appendChild(offerSearchLabel);
        offerSearchDiv.appendChild(offerSearchInput);
        filtersDiv.appendChild(offerSearchDiv);
        filtersCard.appendChild(filtersDiv);
        containerDiv.appendChild(filtersCard);
        const membersTable = renderMembersTable();
        containerDiv.appendChild(membersTable);
        return containerDiv;
    }

    function renderOffer2Card(offerId) {
        const existingOverlay = document.getElementById('offer-details-overlay');
        if (existingOverlay) { document.body.removeChild(existingOverlay); }
        const overlay = document.createElement('div');
        overlay.id = 'offer-details-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        overlay.style.zIndex = '10000';
        document.body.appendChild(overlay);
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.width = '410px';
        popup.style.maxWidth = '500px';
        popup.style.maxHeight = '80vh';
        popup.style.overflowY = 'auto';
        popup.style.backgroundColor = '#fff';
        popup.style.border = '1px solid #ccc';
        popup.style.borderRadius = '6px';
        popup.style.padding = '14px';
        popup.style.boxShadow = '0 2px 5px rgba(0,0,0,0.4)';
        overlay.appendChild(popup);
        const foundOffer = offerData.find(o => o.offerId === offerId);
        const offerName = foundOffer ? foundOffer.name : 'Unknown Offer';
        const topRow = document.createElement('div');
        topRow.style.display = 'flex';
        topRow.style.justifyContent = 'space-between';
        topRow.style.alignItems = 'center';
        topRow.style.marginBottom = '10px';
        const header = document.createElement('div');
        header.style.flex = '1';
        header.style.textAlign = 'center';
        header.style.fontWeight = 'bold';
        header.style.fontSize = '16px';
        header.textContent = offerName;
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'X';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.border = 'none';
        closeBtn.style.backgroundColor = 'transparent';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.fontSize = '16px';
        closeBtn.style.marginLeft = 'auto';
        closeBtn.addEventListener('mouseover', () => { closeBtn.style.color = 'red'; });
        closeBtn.addEventListener('mouseout', () => { closeBtn.style.color = 'inherit'; });
        closeBtn.addEventListener('click', () => { document.body.removeChild(overlay); });
        topRow.appendChild(header);
        topRow.appendChild(closeBtn);
        popup.appendChild(topRow);
        if (foundOffer && Array.isArray(foundOffer.eligibleCards) && foundOffer.eligibleCards.length > 0) {
            const enrollAllBtn = document.createElement('button');
            enrollAllBtn.textContent = 'Enroll All Cards in This Offer';
            enrollAllBtn.style.display = 'block';
            enrollAllBtn.style.margin = '0 auto 12px auto';
            enrollAllBtn.style.cursor = 'pointer';
            enrollAllBtn.style.padding = '6px 12px';
            enrollAllBtn.style.fontSize = '12px';
            enrollAllBtn.style.border = '1px solid #ccc';
            enrollAllBtn.style.borderRadius = '4px';
            enrollAllBtn.style.backgroundColor = '#f5f5f5';
            enrollAllBtn.addEventListener('mouseover', () => { enrollAllBtn.style.backgroundColor = '#e9e9e9'; });
            enrollAllBtn.addEventListener('mouseout', () => { enrollAllBtn.style.backgroundColor = '#f5f5f5'; });
            enrollAllBtn.addEventListener('click', async () => {
                if (!foundOffer) return;
                const sourceId = foundOffer.source_id;
                console.log(`Calling batchEnrollOffer for offer "${foundOffer.name}" (source_id: ${sourceId}).`);
                const results = await batchEnrollOffer(sourceId);
                highlightBatchEnrollmentResults(results);
                setTimeout(() => renderOffer2Card(offerId), 3000);
            });
            popup.appendChild(enrollAllBtn);
        }
        const contentDiv = document.createElement('div');
        contentDiv.style.display = 'flex';
        contentDiv.style.flexDirection = 'column';
        contentDiv.style.gap = '16px';
        contentDiv.style.fontSize = '14px';
        popup.appendChild(contentDiv);
        function displayCardEndings(sectionTitle, cardEndings) {
            const container = document.createElement('div');
            const titleDiv = document.createElement('div');
            titleDiv.textContent = sectionTitle;
            titleDiv.style.textAlign = 'center';
            titleDiv.style.fontWeight = 'bold';
            titleDiv.style.fontSize = '15px';
            titleDiv.style.marginBottom = '6px';
            container.appendChild(titleDiv);
            if (!cardEndings || cardEndings.length === 0) {
                const noneDiv = document.createElement('div');
                noneDiv.textContent = '(None)';
                noneDiv.style.textAlign = 'center';
                noneDiv.style.color = '#777';
                container.appendChild(noneDiv);
                return container;
            }
            const sorted = cardEndings.slice().sort((a, b) => {
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
            const chunkSize = 6;
            for (let i = 0; i < sorted.length; i += chunkSize) {
                const chunk = sorted.slice(i, i + chunkSize);
                const rowDiv = document.createElement('div');
                rowDiv.style.display = 'flex';
                rowDiv.style.flexWrap = 'wrap';
                rowDiv.style.marginBottom = '8px';
                chunk.forEach(cardEnd => {
                    const span = document.createElement('span');
                    span.id = `offerCard_${offerId}_${cardEnd}`;
                    span.textContent = cardEnd;
                    span.style.marginRight = '12px';
                    span.style.marginBottom = '4px';
                    span.style.padding = '4px 6px';
                    span.style.backgroundColor = '#f2f2f2';
                    span.style.borderRadius = '4px';
                    if (foundOffer && foundOffer.eligibleCards && foundOffer.eligibleCards.includes(cardEnd)) {
                        span.style.cursor = 'pointer';
                        span.addEventListener('click', async () => {
                            const matchingAcc = accountData.find(acc => acc.display_account_number === cardEnd);
                            if (!matchingAcc) {
                                console.log(`No matching account token for card ending ${cardEnd}`);
                                return;
                            }
                            const singleResult = await enrollOffer(matchingAcc.account_token, offerId);
                            if (singleResult.result) {
                                console.log(`Enrollment successful for card ${cardEnd}, offer "${offerName}"`);
                                highlightCard(span, true);
                                const idx = foundOffer.eligibleCards.indexOf(cardEnd);
                                if (idx !== -1) foundOffer.eligibleCards.splice(idx, 1);
                                if (!foundOffer.enrolledCards.includes(cardEnd)) {
                                    foundOffer.enrolledCards.push(cardEnd);
                                }
                            } else {
                                console.log(`Enrollment failed for card ${cardEnd}, offer "${offerName}"`);
                                highlightCard(span, false);
                            }
                            setTimeout(() => renderOffer2Card(offerId), 3000);
                        });
                    } else {
                        span.style.cursor = 'default';
                    }
                    rowDiv.appendChild(span);
                });
                container.appendChild(rowDiv);
            }
            return container;
        }
        if (!foundOffer) {
            const notFoundDiv = document.createElement('div');
            notFoundDiv.style.textAlign = 'center';
            notFoundDiv.style.color = 'red';
            notFoundDiv.textContent = 'Offer not found';
            contentDiv.appendChild(notFoundDiv);
            return;
        }
        const eligibleSection = displayCardEndings('Eligible Cards', foundOffer.eligibleCards);
        contentDiv.appendChild(eligibleSection);
        const enrolledSection = displayCardEndings('Enrolled Cards', foundOffer.enrolledCards);
        contentDiv.appendChild(enrolledSection);
        function highlightCard(spanElem, success) {
            spanElem.style.backgroundColor = success ? '#c0ffc0' : '#ffc0c0';
            setTimeout(() => { spanElem.style.backgroundColor = '#f2f2f2'; }, 3000);
        }
        function highlightBatchEnrollmentResults(results) {
            results.forEach(r => {
                if (r.offerId !== offerId) return;
                const matchingAcc = accountData.find(a => a.account_token === r.accountToken);
                if (!matchingAcc) return;
                const cardEnd = matchingAcc.display_account_number;
                const spanId = `offerCard_${offerId}_${cardEnd}`;
                const spanElem = document.getElementById(spanId);
                if (spanElem) {
                    spanElem.style.backgroundColor = r.result ? '#c0ffc0' : '#ffc0c0';
                    setTimeout(() => { spanElem.style.backgroundColor = '#f2f2f2'; }, 3000);
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

    function renderOfferMap(offerArray) {
        const containerDiv = document.createElement('div');
        containerDiv.style.display = 'flex';
        containerDiv.style.flexDirection = 'column';
        containerDiv.style.gap = '12px';
        containerDiv.style.margin = '10px';
        const filterCard = document.createElement('div');
        filterCard.style.position = 'relative';
        filterCard.style.border = '1px solid #ccc';
        filterCard.style.borderRadius = '8px';
        filterCard.style.padding = '10px';
        filterCard.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        filterCard.style.background = 'linear-gradient(to bottom, #fcfcfc, #f0f0f3)';
        filterCard.style.transition = 'box-shadow 0.3s ease';
        filterCard.addEventListener('mouseover', () => { filterCard.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; });
        filterCard.addEventListener('mouseout', () => { filterCard.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)'; });
        const filterRow = document.createElement('div');
        filterRow.style.display = 'flex';
        filterRow.style.alignItems = 'center';
        filterRow.style.gap = '20px';
        filterRow.style.flexWrap = 'wrap';
        filterRow.style.margin = '10px 0';
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
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search Merchants...';
        searchInput.style.fontSize = '14px';
        searchInput.style.padding = '6px';
        searchInput.style.borderRadius = '6px';
        searchInput.style.border = '1px solid #ccc';
        searchInput.style.width = '160px';
        searchInput.value = offerSearchKeyword;
        searchInput.addEventListener('input', debounce(() => {
            offerSearchKeyword = searchInput.value.toLowerCase();
            renderCurrentView();
        }, 600));
        const cardSearchInput = document.createElement('input');
        cardSearchInput.type = 'text';
        cardSearchInput.placeholder = 'Search by Card Ending...';
        cardSearchInput.style.fontSize = '14px';
        cardSearchInput.style.padding = '6px';
        cardSearchInput.style.borderRadius = '6px';
        cardSearchInput.style.border = '1px solid #ccc';
        cardSearchInput.style.width = '160px';
        cardSearchInput.value = offerSearchCardEnding;
        cardSearchInput.addEventListener('input', debounce(() => {
            offerSearchCardEnding = cardSearchInput.value.trim();
            renderCurrentView();
        }, 600));
        filterRow.appendChild(favContainer);
        filterRow.appendChild(searchInput);
        filterRow.appendChild(cardSearchInput);
        filterCard.appendChild(filterRow);
        containerDiv.appendChild(filterCard);
        const filteredOffers = offerArray.filter(o => {
            if (showFavoritesOnly && !o.favorite) return false;
            if (offerSearchKeyword && !o.name.toLowerCase().includes(offerSearchKeyword)) {
                return false;
            }
            if (offerSearchCardEnding) {
                const eligible = Array.isArray(o.eligibleCards) && o.eligibleCards.includes(offerSearchCardEnding);
                const enrolled = Array.isArray(o.enrolledCards) && o.enrolledCards.includes(offerSearchCardEnding);
                if (!eligible && !enrolled) return false;
            }
            return true;
        });
        const headers = [
            { label: "Fav", key: "favorite" },
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
            category: "75px",
            expiry_date: "80px",
            redemption_types: "45px",
            short_description: "330px",
            threshold: "80px",
            reward: "70px",
            percentage: "60px",
            eligibleCards: "40px",
            enrolledCards: "40px"
        };
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.fontSize = '12px';
        table.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        table.style.border = '1px solid #ccc';
        table.style.borderRadius = '6px';
        table.style.overflow = 'hidden';
        table.style.marginTop = '8px';
        const thead = document.createElement('thead');
        thead.style.background = 'linear-gradient(to right, #f2f2f2, #e0e0e0)';
        const headerRow = document.createElement('tr');
        headers.forEach(headerItem => {
            const th = document.createElement('th');
            th.style.padding = '6px';
            th.style.textAlign = 'center';
            th.style.borderBottom = '1px solid #ccc';
            th.style.fontWeight = 'bold';
            th.style.color = '#333';
            th.style.cursor = 'pointer';
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
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        filteredOffers.forEach(item => {
            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid #eee';
            row.style.transition = 'background-color 0.3s ease';
            row.addEventListener('mouseover', () => { row.style.backgroundColor = '#fafafa'; });
            row.addEventListener('mouseout', () => { row.style.backgroundColor = '#fff'; });
            headers.forEach(headerItem => {
                const td = document.createElement('td');
                td.style.padding = '6px';
                td.style.textAlign = 'center';
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
                        img.alt = "Offer Logo";
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
                    const countSpan = document.createElement('span');
                    countSpan.textContent = count;
                    countSpan.style.cursor = (count > 0) ? 'pointer' : 'default';
                    countSpan.style.color = (count > 0) ? '#007bff' : '#999';
                    countSpan.style.textDecoration = (count > 0) ? 'underline' : 'none';
                    countSpan.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (count > 0) {
                            renderOffer2Card(item.offerId);
                        }
                    });
                    td.appendChild(countSpan);
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
                    favCheckbox.style.cursor = 'pointer';
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

    function renderSummaryView() {
        const numAccounts = accountData.length;
        const updateTime = lastUpdate || "Never";
        let distinctFullyEnrolled = 0;
        let distinctNotFullyEnrolled = 0;
        let totalEnrolled = 0;
        let totalEligible = 0;
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
        let totalBalance = 0;
        let totalPending = 0;
        let totalRemaining = 0;
        accountData.filter(acc => acc.relationship === "BASIC" && acc.financialData).forEach(acc => {
            totalBalance += parseFloat(acc.financialData.statement_balance_amount) || 0;
            totalPending += parseFloat(acc.financialData.debits_credits_payments_total_amount) || 0;
            totalRemaining += parseFloat(acc.financialData.remaining_statement_balance_amount) || 0;
        });
        const summaryDiv = document.createElement('div');
        summaryDiv.style.cssText = `
            padding: 20px;
            background: #f8f9fa;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin: 10px;
            font-family: Arial, sans-serif;
        `;
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
        const statsContainer = document.createElement('div');
        statsContainer.style.display = 'flex';
        statsContainer.style.flexDirection = 'column';
        statsContainer.style.gap = '24px';
        statsContainer.style.marginBottom = '24px';
        const financialStatsRow = document.createElement('div');
        financialStatsRow.style.display = 'flex';
        financialStatsRow.style.gap = '16px';
        financialStatsRow.style.justifyContent = 'space-around';
        financialStatsRow.appendChild(statItem('Basic Cards on Login', `${numAccounts}`, '#011F26'));
        financialStatsRow.appendChild(statItem('Total Balance', `$${totalBalance.toFixed(2)}`, '#025E73'));
        financialStatsRow.appendChild(statItem('Total Pending Charge', `$${totalPending.toFixed(2)}`, '#BFB78F'));
        financialStatsRow.appendChild(statItem('Remain Statement', `$${totalRemaining.toFixed(2)}`, '#F2A71B'));
        const enrollmentStatsRow = document.createElement('div');
        enrollmentStatsRow.style.display = 'flex';
        enrollmentStatsRow.style.gap = '16px';
        enrollmentStatsRow.style.justifyContent = 'space-around';
        enrollmentStatsRow.appendChild(statItem('Offers Fully Enrolled', distinctFullyEnrolled, '#737373'));
        enrollmentStatsRow.appendChild(statItem('Offers Pending Enrollment', distinctNotFullyEnrolled, '#CCD96C'));
        enrollmentStatsRow.appendChild(statItem('Total Eligible Offers', totalEligible, '#627324'));
        enrollmentStatsRow.appendChild(statItem('Total Enrolled Offers', totalEnrolled, '#324001'));
        statsContainer.appendChild(financialStatsRow);
        statsContainer.appendChild(enrollmentStatsRow);
        summaryDiv.appendChild(statsContainer);
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 24px;
        `;
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
        const refreshBtn = createButton('Refresh Data', '#3498db', async () => {
            try {
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
                    setLocalStorage(accountData[0].account_token, [
                        "accountData",
                        "offerData",
                        "lastUpdate",
                        "benefitTrackers"
                    ]);
                }
            } catch (e) {
                console.error('Error refreshing data:', e);
            }
        });
        refreshBtn.innerHTML = `<svg style="width:20px;height:20px;fill:white" viewBox="0 0 24 24">
            <path d="M17.65 6.35A7.95 7.95 0 0 0 12 4C7.58 4 4 7.58 4 12s3.58 8 8 8a7.94 7.94 0 0 0 6.65-3.65l-1.42-1.42A5.973 5.973 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg> Refresh Data`;
        const enrollBtn = createButton('Enroll All', '#27ae60', async () => {
            try {
                await batchEnrollOffer();
                renderCurrentView();
            } catch (e) {
                console.error('Error enrolling all:', e);
            }
        });
        enrollBtn.innerHTML = `<svg style="width:20px;height:20px;fill:white" viewBox="0 0 24 24">
            <path d="M19 13H5v-2h14v2z"/>
          </svg> Enroll All`;
        buttonContainer.appendChild(refreshBtn);
        buttonContainer.appendChild(enrollBtn);
        summaryDiv.appendChild(buttonContainer);
        return summaryDiv;
    }

    // =========================================================================
    // Section H: Local Storage Handling (sorted alphabetically)
    // =========================================================================

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

    function setLocalStorage(tokenSuffix, keys) {
        const allData = {
            accountData: accountData,
            offerData: offerData,
            lastUpdate: lastUpdate,
            priorityCards: priorityCards,
            excludedCards: excludedCards,
            benefitTrackers: benefitTrackers,
            ScriptVersion: ScriptVersion
        };
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

    // =========================================================================
    // Section I: Initialization Functions (sorted alphabetically)
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
            const newOfferData = await refreshOffers();
            const newBenefitTrackers = await fetchBenefit();
            const newBalance = await fetchBalance();
            if (newOfferData && Array.isArray(newOfferData)) {
                offerData = newOfferData;
            } else { console.error("refreshOffers failed. Not updating offerData."); }
            if (newBenefitTrackers && Array.isArray(newBenefitTrackers)) {
                benefitTrackers = newBenefitTrackers;
            } else { console.error("Fetching benefit trackers failed. Not updating benefitTrackers."); }
            if (newBalance && newBalance.length > 0) {
                balanceData = newBalance;
            } else { console.error("Fetching balance data failed. Not updating balanceData."); }
            lastUpdate = new Date().toLocaleString();
            await renderCurrentView();
            setLocalStorage(tokenSuffix, ["accountData", "offerData", "lastUpdate", "benefitTrackers", "ScriptVersion"]);
        } else {
            console.log("Using data from LocalStorage. No forced fetch.");
        }
        await fetchBalance();
        if (currentView === 'members') {
            renderCurrentView();
        }
    }

    // =========================================================================
    // Section J: Event Listeners & UI Interaction
    // =========================================================================

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
    // Initialization
    // =========================================================================

    init();
})();

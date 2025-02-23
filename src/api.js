// src/api.js

import {
    accountData,
    btnSummary,
    renderCurrentView,
    content,
    excludedCards,
    priorityCards,
    globalViewState,
    runInBatchesLimit
} from './state.js';

import { getUrl, reconstructObfuscated } from './utils.js';
import { parseOfferDetails } from './apiUtils.js'; // Optional: if you want to extract offer parsing

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


// Fetch account information.
export async function fetchAccount() {
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
        // Clear current account data.
        accountData.splice(0, accountData.length);
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

// Fetch offers for a given account.
export async function fetchOffersForAccount(accountToken) {
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

// Fetch financial data for an account.
export async function fetchFinancialData(accountToken) {
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
        if (!balancesResponse.ok) {
            console.error("Failed to fetch balances, status:", balancesResponse.status);
            return null;
        }
        if (!transactionResponse.ok) {
            console.error("Failed to fetch transaction summary, status:", transactionResponse.status);
            return null;
        }
        const balanceData = await balancesResponse.json();
        const transactionData = await transactionResponse.json();
        let balanceInfo = {};
        if (Array.isArray(balanceData) && balanceData.length > 0) {
            balanceInfo = {
                statement_balance_amount: balanceData[0].statement_balance_amount,
                remaining_statement_balance_amount: balanceData[0].remaining_statement_balance_amount
            };
        } else {
            console.error("Unexpected data format for balances:", balanceData);
        }
        let transactionInfo = {};
        if (Array.isArray(transactionData) && transactionData.length > 0) {
            transactionInfo = {
                debits_credits_payments_total_amount: transactionData[0].total?.debits_credits_payments_total_amount
            };
        } else {
            console.error("Unexpected data format for transaction summary:", transactionData);
        }
        return {
            ...balanceInfo,
            ...transactionInfo
        };
    } catch (error) {
        console.error("Error fetching financial data:", error);
        return null;
    }
}

// Fetch financial data for all BASIC accounts.
export async function fetchFinancialDataForBasicCards() {
    const basicAccounts = accountData.filter(acc => acc.relationship === "BASIC");
    await Promise.all(basicAccounts.map(async (acc) => {
        if (!acc.financialData) {
            acc.financialData = await fetchFinancialData(acc.account_token);
        }
    }));
}

// Fetch best loyalty benefits trackers.
export async function fetchBestLoyaltyBenefitsTrackers(accountToken, locale = "en-US", limit = "ALL") {
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
        const trackers = [];
        data.forEach(item => {
            if (Array.isArray(item.trackers)) {
                item.trackers.forEach(trackerObj => {
                    trackers.push({
                        benefitId: trackerObj.benefitId,
                        periodStartDate: trackerObj.periodStartDate,
                        periodEndDate: trackerObj.periodEndDate,
                        trackerDuration: trackerObj.trackerDuration,
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

// Fetch benefit trackers for all BASIC accounts.
export async function fetchBenefitTrackersForBasicCards() {
    const basicAccounts = accountData.filter(acc => acc.relationship === "BASIC");
    let allTrackers = [];
    await Promise.all(basicAccounts.map(async (acc) => {
        const trackers = await fetchBestLoyaltyBenefitsTrackers(acc.account_token);
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

// Retrieve the current user's trust level via USCF APIs.
export async function getCurrentUserTrustLevel() {
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

// Enroll an offer for a given account.
export async function enrollOffer(accountToken, offerIdentifier) {
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

// Batch enroll offers for cards.
export async function batchEnrollOffer(offerSourceId, accountNumber) {
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
                if (excludedCards.includes(task.card)) {
                    console.log(`Skipping card ${task.card} as it is excluded.`);
                    return;
                }
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
    offerData.splice(0, offerData.length, ...await refreshOffers());
    await renderCurrentView();
    if (totalEnrollAttempts > 0) {
        const successRate = (successfulEnrollments / totalEnrollAttempts * 100).toFixed(2);
        console.log(`Enrollment success rate: ${successfulEnrollments}/${totalEnrollAttempts} (${successRate}%)`);
    } else {
        console.log('No enrollment attempts were made.');
    }
}

// Refresh offers by gathering offer details from active accounts.
export async function refreshOffers() {
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
        const offers = await fetchOffersForAccount(acc.account_token);
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
    // Merge favorite flags from the existing offerData.
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

// Get basic account ending for a supplementary account.
export function getBasicAccountEndingForSuppAccount(suppAccount) {
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

// Parse offer details from a description.
export function parseOfferDetails(description = "") {
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

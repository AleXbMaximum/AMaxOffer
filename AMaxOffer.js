// ==UserScript==
// @name         AMaxOffer
// @version      3.9.6
// @description  AMaxOffer Offers and Account Management Tool for American Express Site
// @match        https://global.americanexpress.com/*
// @connect      uscardforum.com
// @updateURL    https://raw.githubusercontent.com/AleXbMaximum/AMaxOffer/master/raw/dist/AMaxOffer.user.js
// @downloadURL  https://raw.githubusercontent.com/AleXbMaximum/AMaxOffer/master/raw/dist/AMaxOffer.user.js
// @homepageURL  https://github.com/AleXbMaximum/AMaxOffer
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
// @resource     materialIcons https://fonts.googleapis.com/icon?family=Material+Icons

// ==/UserScript==

// @license    CC BY-NC-ND 4.0

(function () {
    'use strict';

    // =========================================================================
    // Section 1: Utility Functions & Obfuscated URL Constants
    // =========================================================================

    let expiry_date = "2025-03-23T04:59:59Z"
    let offer_sortOrder = []
    const endPoints = {
        member: "https://global.americanexpress.com/api/servicing/v1/member",
        offfer_list: "https://functions.americanexpress.com/ReadCardAccountOffersList.v1",
        offfer_enroll: "https://functions.americanexpress.com/CreateCardAccountOfferEnrollment.v1",
        balance: "https://global.americanexpress.com/api/servicing/v1/financials/balances?extended_details=deferred,non_deferred,pay_in_full,pay_over_time,early_pay",
        pendingBalance: "https://global.americanexpress.com/api/servicing/v1/financials/transaction_summary?status=pending",
        benefit: "https://functions.americanexpress.com/ReadBestLoyaltyBenefitsTrackers.v1",
        USCF1: "https://www.uscardforum.com/session/current.json",
        USCF2: "https://www.uscardforum.com/u/"
    };

    // Enhanced request queue system with improved parallelization
    const API = (() => {

        const requestQueue = [];
        const MAX_CONCURRENT = 20;
        let activeRequests = 0;

        function enqueueRequest(requestFn) {
            return new Promise((resolve, reject) => {
                requestQueue.push({ fn: requestFn, resolve, reject });
                processQueue();
            });
        }

        function processQueue() {
            if (requestQueue.length === 0 || activeRequests >= MAX_CONCURRENT) return;
            const { fn, resolve, reject } = requestQueue.shift();
            activeRequests++;

            fn().then(
                result => {
                    activeRequests--;
                    resolve(result);
                    processQueue();
                },
                error => {
                    activeRequests--;
                    reject(error);
                    processQueue();
                }
            );
        }

        async function fetchWithRetry(url, options = {}, retries = 2) {
            const { retryDelay = 1000, ...fetchOptions } = options;
            try {
                return await fetch(url, fetchOptions);
            } catch (error) {
                if (retries <= 0) throw error;
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return fetchWithRetry(url, options, retries - 1);
            }
        }

        async function fetchWithCredentials(url, options = {}) {
            const defaultOptions = {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };
            const mergedOptions = {
                ...defaultOptions,
                ...options,
                headers: { ...defaultOptions.headers, ...options.headers }
            };

            return enqueueRequest(async () => {
                const response = await fetchWithRetry(url, mergedOptions);
                if (!response.ok) {
                    const error = new Error(`API request failed: ${response.status}`);
                    error.status = response.status;
                    error.url = url;
                    throw error;
                }
                return response.json();
            });
        }

        // Helper method for offer description parsing
        function parseOfferDescription(description = "") {
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

        // Process offer updates including tracking expired and redeemed offers_current
        function processOfferUpdates(oldOffers, newOfferMap, stats) {
            const oldOfferMap = new Map();
            oldOffers.forEach(offer => {
                if (offer.source_id) oldOfferMap.set(offer.source_id, offer);
            });

            // Get existing expired and redeemed offers_current
            const expired = glbVer.get('offers_expired');
            const redeemed = glbVer.get('offers_redeemed');

            // Process all new offers_current (preserve metadata)
            for (const [sourceId, newOffer] of newOfferMap.entries()) {
                const oldOffer = oldOfferMap.get(sourceId);
                if (oldOffer) {
                    newOffer.favorite = oldOffer.favorite || false;
                    newOffer.terms = oldOffer.terms || null;
                    newOffer.long_description = oldOffer.long_description || null;
                    newOffer.location = oldOffer.location || null;
                    newOffer.cta = oldOffer.cta || null;
                }
            }

            // Track expired offers_current
            for (const [sourceId, oldOffer] of oldOfferMap.entries()) {
                if (!newOfferMap.has(sourceId)) {
                    stats.expiredCount++;
                    const expiredOffer = {
                        ...oldOffer,
                        expiredDate: new Date().toISOString()
                    };
                    expired.push(expiredOffer);
                }
            }

            // Track redeemed offers_current
            for (const [sourceId, oldOffer] of oldOfferMap.entries()) {
                const newOffer = newOfferMap.get(sourceId);
                if (newOffer && Array.isArray(oldOffer.enrolledCards)) {
                    // Find cards that were enrolled but aren't anymore
                    const accounts = glbVer.get('accounts');
                    const redeemedCards = oldOffer.enrolledCards.filter(token => {
                        const stillEnrolled = newOffer.enrolledCards.includes(token);
                        const cardActive = accounts.some(acc =>
                            acc.account_token === token &&
                            acc.account_status?.trim().toLowerCase() === "active"
                        );

                        return !stillEnrolled && cardActive;
                    });

                    // Record redemptions
                    if (redeemedCards.length > 0) {
                        stats.redeemedCount += redeemedCards.length;

                        redeemed.push({
                            source_id: sourceId,
                            offerId: newOffer.offerId,
                            name: newOffer.name,
                            redeemedCards: redeemedCards,
                            redeemedDate: new Date().toISOString()
                        });
                    }
                }
            }

            // Update global state for expired and redeemed offers_current
            glbVer.set('offers_expired', expired);
            glbVer.set('offers_redeemed', redeemed);

            // Return the new offers_current array
            return Array.from(newOfferMap.values());
        }

        function updateCardOfferCounts() {
            try {
                const accounts = glbVer.get('accounts');
                const offers = glbVer.get('offers_current');

                if (!accounts || !Array.isArray(accounts) || !offers || !Array.isArray(offers)) {
                    throw new Error("Invalid data for updating offer counts");
                }

                // Create account lookup map for faster access
                const accountMap = new Map();
                accounts.forEach(acc => {
                    accountMap.set(acc.account_token, {
                        ...acc,
                        eligibleOffers: 0,
                        enrolledOffers: 0
                    });
                });

                // Process all offers in a single pass
                for (const offer of offers) {
                    // Update eligible counts
                    if (Array.isArray(offer.eligibleCards)) {
                        for (const token of offer.eligibleCards) {
                            const account = accountMap.get(token);
                            if (account) {
                                account.eligibleOffers += 1;
                            }
                        }
                    }

                    // Update enrolled counts
                    if (Array.isArray(offer.enrolledCards)) {
                        for (const token of offer.enrolledCards) {
                            const account = accountMap.get(token);
                            if (account) {
                                account.enrolledOffers += 1;
                            }
                        }
                    }
                }

                // Convert map back to array and update global state
                const updatedAccounts = Array.from(accountMap.values());
                glbVer.set('accounts', updatedAccounts);

                // No need to call saveItem here as the calling function should decide when to save

                return true;
            } catch (error) {
                console.error("Error updating card offer counts:", error);
                return false;
            }
        }

        async function fetchAccounts(readonly = false) {
            try {
                const data = await fetchWithCredentials(endPoints.member);

                if (!data || !Array.isArray(data.accounts)) {
                    throw new Error('Invalid account data received');
                }

                const accounts = [];
                let mainCounter = 1;

                // Process all accounts in a single pass
                for (const item of data.accounts) {
                    // Create main account object
                    const mainAccount = {
                        cardEnding: item.account?.display_account_number || 'N/A',
                        relationship: item.account?.relationship || 'N/A',
                        supplementary_index: item.account?.supplementary_index || 'N/A',
                        account_status: Array.isArray(item.status?.account_status) ?
                            item.status.account_status[0] : (item.status?.account_status || 'N/A'),
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
                    accounts.push(mainAccount);

                    // Process supplementary accounts if any
                    if (Array.isArray(item.supplementary_accounts)) {
                        for (const supp of item.supplementary_accounts) {
                            const suppIndex = supp.account?.supplementary_index ?
                                parseInt(supp.account.supplementary_index, 10) : 'N/A';

                            const suppAccount = {
                                cardEnding: supp.account?.display_account_number || 'N/A',
                                relationship: supp.account?.relationship || 'N/A',
                                supplementary_index: supp.account?.supplementary_index || 'N/A',
                                account_status: Array.isArray(supp.status?.account_status) ?
                                    supp.status.account_status[0] : (supp.status?.account_status || 'N/A'),
                                days_past_due: (supp.status?.days_past_due !== undefined) ?
                                    supp.status.days_past_due : 'N/A',
                                account_setup_date: supp.status?.account_setup_date || 'N/A',
                                description: supp.product?.description || 'N/A',
                                small_card_art: supp.product?.small_card_art || 'N/A',
                                embossed_name: supp.profile?.embossed_name || 'N/A',
                                account_token: supp.account_token || 'N/A',
                                cardIndex: `${mainCounter}-${suppIndex}`,
                                eligibleOffers: 0,
                                enrolledOffers: 0
                            };
                            accounts.push(suppAccount);
                        }
                    }
                    mainCounter++;
                }

                // Only update global state if not in readonly mode and accounts were found
                if (!readonly && accounts.length > 0) {
                    glbVer.set('accounts', accounts);

                    // Use the first account token for storage identification
                    const storageToken = accounts[0].account_token;
                    storageOP.setToken(storageToken);

                    // Save accounts to storage
                    storageOP.saveItem('accounts');

                    // Invalidate member stats
                    statsOP.invalidate('MEMBER');
                }

                return accounts;
            } catch (error) {
                console.error('Error fetching account data:', error);
                throw new Error(`Failed to fetch accounts: ${error.message}`);
            }
        }

        async function fetchOfferList(accountToken) {
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
                const res = await fetch(endPoints.offfer_list, {
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
                console.error(`Error fetching offers_current for token ${accountToken}:`, error);
                return [];
            }
        }

        async function refreshOffersList(progressCallback) {
            try {
                const oldOffers = glbVer.get('offers_current') || [];
                const newOfferMap = new Map();
                const stats = { newCount: 0, expiredCount: 0, redeemedCount: 0 };
                const accounts = glbVer.get('accounts');

                const activeAccounts = accounts.filter(acc =>
                    acc.account_status?.trim().toLowerCase() === "active"
                );

                if (activeAccounts.length === 0) {
                    throw new Error('No active accounts found');
                }

                const skipPatterns = [
                    "Your FICO&#174", "The Hotel Collection", "3X on Amex Travel",
                    "Flexible Business Credit", "Apple Pay", "More Coffee",
                    "More Travel", "Send Money to Friends", "Considering a Big Purchase"
                ];

                const shouldSkipOffer = (offerName) => {
                    return skipPatterns.some(pattern =>
                        offerName.toLowerCase().includes(pattern.toLowerCase())
                    );
                };

                const totalAccounts = activeAccounts.length;
                const batchSize = MAX_CONCURRENT; // Ensure reasonable batch size
                const results = [];

                // Fetch offers in batches
                for (let i = 0; i < totalAccounts; i += batchSize) {
                    const batchAccounts = activeAccounts.slice(i, i + batchSize);
                    const batchPromises = batchAccounts.map(account => this.fetchOfferList(account.account_token));

                    const batchResults = await Promise.all(batchPromises);
                    results.push(...batchResults);

                    if (typeof progressCallback === 'function') {
                        const progress = Math.min(100, Math.round((i + batchSize) / totalAccounts * 100));
                        progressCallback('offers_current', progress);
                    }


                    if (i + batchSize < totalAccounts) {
                        await new Promise(r => setTimeout(r, 300));
                    }
                }

                for (let idx = 0; idx < activeAccounts.length; idx++) {
                    const account = activeAccounts[idx];
                    const offers = results[idx] || [];

                    if (!Array.isArray(offers)) {
                        console.error(`Non-array offers result for account ${account.cardEnding}:`, offers);
                        continue;
                    }

                    offers.forEach(offer => {
                        const sourceId = offer.source_id;
                        if (!sourceId || shouldSkipOffer(offer.name || "")) return;

                        if (!newOfferMap.has(sourceId)) {
                            const details = parseOfferDescription(offer.short_description || "");
                            const offerInfo = {
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
                            newOfferMap.set(sourceId, offerInfo);

                            if (!oldOffers.some(o => o.source_id === sourceId)) {
                                stats.newCount++;
                            }
                        }

                        const offerInfo = newOfferMap.get(sourceId);
                        if (offer.status === "ELIGIBLE" && !offerInfo.eligibleCards.includes(account.account_token)) {
                            offerInfo.eligibleCards.push(account.account_token);
                        } else if (offer.status === "ENROLLED" && !offerInfo.enrolledCards.includes(account.account_token)) {
                            offerInfo.enrolledCards.push(account.account_token);
                        }
                    });
                }

                glbVer.batchUpdate(() => {
                    const processedOffers = processOfferUpdates(oldOffers, newOfferMap, stats);

                    glbVer.set('offers_current', processedOffers);

                    this.updateCardOfferCounts();
                });

                storageOP.saveItem('offers_current');
                storageOP.saveItem('accounts');

                renderEngine.markChanged('OFFER');
                renderEngine.markChanged('MEMBER');

                statsOP.invalidate('OFFER');

                return stats;
            } catch (error) {
                console.error('Error refreshing offers list:', error);
                throw new Error(`Failed to refresh offers: ${error.message}`);
            }
        }

        async function fetchOfferDetails(accountToken, offerId) {

            // Generate timestamp in required format with offset
            const now = new Date();
            const pad = n => n.toString().padStart(2, '0');
            const offsetTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
            const requestDateTimeWithOffset = `${offsetTime.getUTCFullYear()}-${pad(offsetTime.getUTCMonth() + 1)}_${pad(offsetTime.getUTCDate())}T${pad(offsetTime.getUTCHours())}:${pad(offsetTime.getUTCMinutes())}:${pad(offsetTime.getUTCSeconds())}-06:00`;

            const payload = {
                accountNumberProxy: accountToken,
                identifier: offerId,
                identifierType: "OFFER",
                locale: "en-US",
                offerRequestType: "DETAILS",
                requestDateTimeWithOffset: requestDateTimeWithOffset,
                source: "STANDARD",
                userOffset: "-06:00"
            };

            try {
                const res = await fetch(endPoints.offfer_list, {
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
                    throw new Error(`Failed to fetch offer details: ${res.status}`);
                }

                const data = await res.json();
                return {
                    terms: data.terms || null,
                    long_description: data.long_description || null,
                    name: data.name,
                    logo_url: data.logo_url,
                    expiry_date: data.expiry_date,
                    achievement_type: data.achievement_type,
                    category: data.category,
                    redemption_types: data.redemption_types,
                    location: data.location,
                    cta: data.cta
                };
            } catch (error) {
                console.error("Error fetching offer details:", error);
                return null;
            }
        }

        async function fetchAccountBenefits(accountToken, locale = "en-US", limit = "ALL") {
            const url = endPoints.benefit;
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

        async function fetchAllBenefits(progressCallback) {
            try {
                const accounts = glbVer.get('accounts');
                const basicAccounts = accounts.filter(acc => acc.relationship === "BASIC");
                const totalAccounts = basicAccounts.length;
                let allTrackers = [];

                // Use batch processing for benefits
                const batchSize = MAX_CONCURRENT; // Process in smaller batches

                for (let i = 0; i < totalAccounts; i += batchSize) {
                    const batchAccounts = basicAccounts.slice(i, i + batchSize);

                    // Fetch benefits in parallel for this batch
                    const batchPromises = batchAccounts.map(account =>
                        this.fetchAccountBenefits(account.account_token));
                    const batchResults = await Promise.all(batchPromises);

                    // Process batch results
                    batchAccounts.forEach((account, idx) => {
                        const trackers = batchResults[idx];
                        if (Array.isArray(trackers)) {
                            trackers.forEach(tracker => {
                                tracker.accountToken = account.account_token;
                                tracker.cardEnding = account.cardEnding;

                                if (tracker.tracker) {
                                    tracker.tracker.spentAmount = parseFloat(tracker.tracker.spentAmount) || 0;
                                    tracker.tracker.targetAmount = parseFloat(tracker.tracker.targetAmount) || 0;
                                }
                                allTrackers.push(tracker);
                            });
                        }
                    });

                    // Report progress
                    if (progressCallback) {
                        const progress = Math.min(100, Math.round((i + batchSize) / totalAccounts * 100));
                        progressCallback('benefits', progress);
                    }

                    // Small delay between batches to avoid rate limiting
                    if (i + batchSize < totalAccounts) {
                        await new Promise(r => setTimeout(r, 300));
                    }
                }

                // Update state
                glbVer.set('benefits', allTrackers);
                return true;
            } catch (error) {
                console.error("Error fetching all benefits:", error);
                return false;
            }
        }

        async function fetchAccountBalance(accountToken) {
            if (!accountToken) {
                console.error("Account token is required");
                return null;
            }
            try {
                const balancesUrl = endPoints.balance;
                const pTransactionUrl = endPoints.pendingBalance;

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

        async function fetchAllBalances(progressCallback) {
            try {
                const accounts = glbVer.get('accounts');
                const basicAccounts = accounts.filter(acc => acc.relationship === "BASIC");
                const totalAccounts = basicAccounts.length;

                // Create an updated copy of accounts
                const updatedAccounts = [...accounts];

                // Use batch processing for balances
                const batchSize = MAX_CONCURRENT; // Process in smaller batches

                for (let i = 0; i < totalAccounts; i += batchSize) {
                    const batchAccounts = basicAccounts.slice(i, i + batchSize);

                    // Fetch balances in parallel for this batch
                    const batchPromises = batchAccounts.map(account =>
                        this.fetchAccountBalance(account.account_token));
                    const batchResults = await Promise.all(batchPromises);

                    // Process batch results
                    batchAccounts.forEach((account, idx) => {
                        const accountIndex = updatedAccounts.findIndex(a => a.account_token === account.account_token);
                        if (accountIndex >= 0) {
                            updatedAccounts[accountIndex].financialData = batchResults[idx];
                        }
                    });

                    // Report progress
                    if (progressCallback) {
                        const progress = Math.min(100, Math.round((i + batchSize) / totalAccounts * 100));
                        progressCallback('balances', progress);
                    }

                    // Small delay between batches to avoid rate limiting
                    if (i + batchSize < totalAccounts) {
                        await new Promise(r => setTimeout(r, 300));
                    }
                }

                // Update state
                glbVer.set('accounts', updatedAccounts);
                storageOP.saveItem('accounts');
                statsOP.invalidate('MEMBER');

                return true;
            } catch (error) {
                console.error("Error fetching all balances:", error);
                return false;
            }
        }

        async function enrollInOffer(accountToken, offerIdentifier) {
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
                const res = await fetch(endPoints.offfer_enroll, {
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


        async function batchEnrollOffers(offerSourceId = null, accountToken = null, options = {}) {
            const enrollResults = {
                total: 0,
                success: 0,
                errors: [],
                results: [],
                successfulEnrollments: []
            };

            console.log(`Starting batch enrollment process: ${offerSourceId ? `Offer ID: ${offerSourceId}` : 'All eligible offers'}`);

            const offers = glbVer.get('offers_current');
            const accounts = glbVer.get('accounts');
            const priorityCards = glbVer.get('priorityCards');
            const excludedCards = glbVer.get('excludedCards');

            if (!offers || !Array.isArray(offers) || !accounts || !Array.isArray(accounts)) {
                throw new Error("Missing or invalid data");
            }

            const tasks = [];
            const eligibleOffers = offerSourceId
                ? offers.filter(offer => offer.source_id === offerSourceId)
                : offers;

            for (const offer of eligibleOffers) {
                if (!Array.isArray(offer.eligibleCards)) continue;

                for (const cardToken of offer.eligibleCards) {
                    if (accountToken && cardToken !== accountToken) continue;

                    const account = accounts.find(acc =>
                        acc.account_token === cardToken &&
                        acc.account_status?.trim().toLowerCase() === "active"
                    );

                    if (account && !excludedCards.includes(account.account_token)) {
                        tasks.push({
                            offerId: offer.offerId,
                            sourceId: offer.source_id,
                            offerName: offer.name,
                            accountToken: account.account_token,
                            cardEnding: account.cardEnding,
                            memberName: account.embossed_name || 'Unknown',
                            isPriority: priorityCards.includes(account.account_token)
                        });
                    }
                }
            }

            // Extract first name from each member's name
            tasks.forEach(task => {
                const memberName = task.memberName || 'Unknown';
                task.firstName = memberName === 'Unknown' ? 'Unknown' : memberName.split(' ')[0];
            });

            enrollResults.total = tasks.length;
            const updatedOffers = [...offers];

            if (tasks.length === 0) {
                console.log("No eligible offers found for batch enrollment");
                return enrollResults;
            }

            console.log(`Found ${tasks.length} potential enrollments to process`);

            // Group tasks by first name, maintaining priority ordering
            // First, sort by priority to ensure priority cards come first
            tasks.sort((a, b) => a.isPriority !== b.isPriority ? (a.isPriority ? -1 : 1) : 0);

            // Group tasks by firstName while preserving priority order
            const taskGroups = [];
            const firstNameGroups = {};

            // Create groups based on first name
            tasks.forEach(task => {
                if (!firstNameGroups[task.firstName]) {
                    firstNameGroups[task.firstName] = [];
                    taskGroups.push(firstNameGroups[task.firstName]);
                }
                firstNameGroups[task.firstName].push(task);
            });

            // Calculate batch size based on MAX_CONCURRENT
            const defaultBatchSize = options.batchSize || MAX_CONCURRENT;

            // Create batches that keep same first name together
            const batches = [];
            let currentBatch = [];
            let currentBatchSize = 0;

            for (const group of taskGroups) {
                // If adding this group would exceed batch size and the batch isn't empty,
                // finish the current batch and start a new one
                if (currentBatchSize + group.length > defaultBatchSize && currentBatchSize > 0) {
                    batches.push(currentBatch);
                    currentBatch = [];
                    currentBatchSize = 0;
                }

                // Add the entire first-name group to the current batch
                currentBatch.push(...group);
                currentBatchSize += group.length;

                // If the batch is full or nearly full, finalize it
                if (currentBatchSize >= defaultBatchSize) {
                    batches.push(currentBatch);
                    currentBatch = [];
                    currentBatchSize = 0;
                }
            }

            // Add any remaining tasks
            if (currentBatch.length > 0) {
                batches.push(currentBatch);
            }

            console.log(`Created ${batches.length} batches`);
            batches.forEach((batch, batchIndex) => {
                const memberInfo = batch.map(task => {
                    return `${task.cardEnding}-${task.firstName}`;
                }).join(', ');
                console.log(`Batch ${batchIndex + 1} members: ${memberInfo}`);
            });

            // Process batches
            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                console.log(`Processing batch ${i + 1}/${batches.length}: ${batch.length} enrollments`);

                const batchResults = await Promise.all(
                    batch.map(async task => {
                        if (!task.isPriority) await new Promise(resolve => setTimeout(resolve, 2000));

                        try {
                            const result = await this.enrollInOffer(task.accountToken, task.offerId);

                            if (result.result) {
                                const offerIndex = updatedOffers.findIndex(o => o.source_id === task.sourceId);
                                if (offerIndex >= 0) {
                                    const offer = updatedOffers[offerIndex];

                                    const eligibleIndex = offer.eligibleCards.indexOf(task.accountToken);
                                    if (eligibleIndex !== -1) offer.eligibleCards.splice(eligibleIndex, 1);
                                    if (!offer.enrolledCards.includes(task.accountToken)) offer.enrolledCards.push(task.accountToken);
                                }
                                enrollResults.success++;
                                enrollResults.successfulEnrollments.push({
                                    offerName: task.offerName,
                                    cardEnding: task.cardEnding,
                                    memberName: task.memberName
                                });
                            } else {
                                enrollResults.errors.push({
                                    offer: task.offerName,
                                    card: task.cardEnding,
                                    memberName: task.memberName,
                                    error: result.explanationMessage || 'Enrollment failed'
                                });
                            }
                            return result;
                        } catch (error) {
                            enrollResults.errors.push({
                                offer: task.offerName,
                                card: task.cardEnding,
                                memberName: task.memberName,
                                error: error.message || 'Error occurred'
                            });

                            console.error(`Error: "${task.offerName}" on card ${task.cardEnding}
                                    (${task.memberName}): ${error.message}`);

                            return {
                                offerId: task.offerId,
                                accountToken: task.accountToken,
                                result: false,
                                explanationMessage: error.message || "Error occurred"
                            };
                        }
                    })
                );

                enrollResults.results.push(...batchResults);
                if (i < batches.length - 1) await new Promise(r => setTimeout(r, 500));
            }

            if (enrollResults.success > 0) { await this.refreshOffersList(); }

            const successRate = enrollResults.total > 0 ?
                (enrollResults.success / enrollResults.total * 100).toFixed(2) : 0;

            console.log(`
                    === BATCH ENROLLMENT SUMMARY ===
                    Success Rate: ${successRate}% (${enrollResults.success}/${enrollResults.total})
                    \nSuccessfully enrolled ${enrollResults.success} offers:\n${enrollResults.successfulEnrollments.map(item =>
                `- "${item.offerName}" on card ${item.cardEnding} (${item.memberName})`).join('\n')}
                    ${enrollResults.errors.length > 0 ?
                    `\nFailed enrollments (${enrollResults.errors.length}):\n${enrollResults.errors.map(item =>
                        `- "${item.offer}" on card ${item.card} (${item.memberName}): ${item.error}`
                    ).join('\n')}` : ''}
                `);

            return enrollResults;
        }

        async function refreshAllData(progressCallback) {
            try {
                // Start tracking progress
                const reportProgress = (type, percent) => {
                    if (typeof progressCallback === 'function') {
                        progressCallback({ type, percent });
                    }
                };

                // Step 1: Fetch accounts
                reportProgress('accounts', 0);
                const accounts = await this.fetchAccounts();

                if (!accounts || accounts.length === 0) {
                    throw new Error('No accounts found');
                }

                reportProgress('accounts', 100);

                // Step 2: Parallel fetch of offers, benefits, and balances
                reportProgress('OFFER', 0);
                reportProgress('BENEFIT', 0);
                reportProgress('balances', 0);

                const fetchPromises = [
                    // Fetch offers with progress reporting
                    this.refreshOffersList((type, percent) => {
                        const reportType = type === 'offers_current' ? 'OFFER' : type;
                        reportProgress(reportType, percent);
                    }),

                    // Fetch benefits with progress reporting
                    this.fetchAllBenefits((type, percent) => {
                        const reportType = type === 'benefits' ? 'BENEFIT' : type;
                        reportProgress(reportType, percent);
                    }),

                    // Fetch balances with progress reporting
                    this.fetchAllBalances((type, percent) => {
                        reportProgress(type, percent);
                    })
                ];

                const [offerStats, benefitsResult, balancesResult] = await Promise.all(fetchPromises);

                // Update last refresh timestamp
                const now = new Date().toISOString();
                glbVer.set('lastUpdate', now);

                // Save all data
                storageOP.saveAll();

                // Invalidate all stats
                statsOP.invalidate();

                // Report completion
                reportProgress('complete', 100);

                return {
                    success: true,
                    newOffers: offerStats.newCount,
                    expiredOffers: offerStats.expiredCount,
                    redeemedOffers: offerStats.redeemedCount
                };
            } catch (error) {
                console.error('Error refreshing all data:', error);
                return {
                    success: false,
                    error: error.message || 'Unknown error during data refresh'
                };
            }
        }


        // Return the public API methods
        return {
            fetchAccounts,
            fetchOfferList,
            refreshOffersList,
            fetchAccountBenefits,
            fetchAllBenefits,
            fetchAccountBalance,
            fetchAllBalances,
            refreshAllData,
            enrollInOffer,
            fetchOfferDetails,
            batchEnrollOffers,
            updateCardOfferCounts
        };
    })();

    const glbVer = (() => {
        const data = {
            accounts: [],
            offers_current: [],
            offers_expired: [],
            offers_redeemed: [],
            benefits: [],
            balances: {},
            priorityCards: [],
            excludedCards: [],
            lastUpdate: ""
        };

        const listeners = new Map();
        const cache = new Map();
        const pendingNotifications = new Set();
        let batchMode = false;

        return {
            get(key) {
                if (!key || !(key in data)) return undefined;
                return Array.isArray(data[key]) ? [...data[key]] : data[key];
            },

            set(key, value, options = {}) {
                if (!key || !(key in data)) return this;

                const prevValue = data[key];
                data[key] = value;

                if (JSON.stringify(prevValue) !== JSON.stringify(value)) {
                    cache.clear();
                    if (!options.silent) {
                        if (batchMode) {
                            pendingNotifications.add(key);
                        } else {
                            this.notify(key);
                        }
                    }
                }
                return this;
            },

            update(key, updater) {
                if (!key || !(key in data) || typeof updater !== 'function') return this;

                const prevValue = data[key];
                data[key] = updater(prevValue);

                if (JSON.stringify(prevValue) !== JSON.stringify(data[key])) {
                    cache.clear();
                    if (batchMode) {
                        pendingNotifications.add(key);
                    } else {
                        this.notify(key);
                    }
                }
                return this;
            },

            subscribe(key, callback) {
                if (!key || typeof callback !== 'function') return () => { };

                if (!listeners.has(key)) {
                    listeners.set(key, new Set());
                }
                listeners.get(key).add(callback);

                return () => {
                    if (listeners.has(key)) {
                        listeners.get(key).delete(callback);
                        if (listeners.get(key).size === 0) {
                            listeners.delete(key);
                        }
                    }
                };
            },

            notify(key) {
                if (!key) return;

                if (listeners.has(key)) {
                    const callbacks = [...listeners.get(key)];
                    callbacks.forEach(callback => {
                        try {
                            callback(data[key]);
                        } catch (error) {
                            console.error(`Error in listener for ${key}:`, error);
                        }
                    });
                }

                if (listeners.has('*')) {
                    const callbacks = [...listeners.get('*')];
                    callbacks.forEach(callback => {
                        try {
                            callback(data);
                        } catch (error) {
                            console.error('Error in global listener:', error);
                        }
                    });
                }

                // Automatically trigger storage updates
                if (key !== 'lastUpdate' && storageOP.getToken()) {
                    storageOP.saveItem(key);
                }
            },

            computeWithCache(key, computeFn) {
                if (!key || typeof computeFn !== 'function') return undefined;

                if (!cache.has(key)) {
                    try {
                        cache.set(key, computeFn(data));
                    } catch (error) {
                        console.error(`Error computing cached value for ${key}:`, error);
                        return undefined;
                    }
                }
                return cache.get(key);
            },

            invalidateCache() {
                cache.clear();
            },

            batchUpdate(updateFn) {
                if (batchMode || typeof updateFn !== 'function') return;

                batchMode = true;
                pendingNotifications.clear();

                try {
                    updateFn();
                } catch (error) {
                    console.error('Error in batch update:', error);
                } finally {
                    batchMode = false;

                    // Process all pending notifications
                    pendingNotifications.forEach(key => this.notify(key));
                    pendingNotifications.clear();

                    // Notify global listeners only once
                    if (pendingNotifications.size > 0 && listeners.has('*')) {
                        this.notify('*');
                    }

                    this.invalidateCache();
                }
            },

            // Call this when application data should be saved
            saveToStorage() {
                return storageOP.saveAll();
            },

            // Call this when application data should be loaded
            loadFromStorage() {
                return storageOP.loadAll();
            }
        };
    })();


    const storageOP = (() => {
        const PREFIX = "AMaxOffer";
        const storageOpVersion = "3.0";
        let storageToken = "";
        let storageErrors = [];

        const storageConfig = new Map([
            ["accounts", { storageKey: "accounts", important: true, compress: true }],
            ["offers_current", { storageKey: "offers_current", important: true, compress: true }],
            ["offers_expired", { storageKey: "offers_expired", important: false, compress: true }],
            ["offers_redeemed", { storageKey: "offers_redeemed", important: false, compress: true }],
            ["benefits", { storageKey: "benefits", important: true, compress: true }],
            ["priorityCards", { storageKey: "priorityCards", important: true, compress: false }],
            ["excludedCards", { storageKey: "excludedCards", important: true, compress: false }],
            ["lastUpdate", { storageKey: "lastUpdate", important: true, compress: false }]
        ]);

        function getStorageKey(key) {
            if (!key || !storageConfig.has(key)) return null;
            const config = storageConfig.get(key);
            return `${PREFIX}_${config.storageKey}_${storageToken}`;
        }

        function compressData(data) {
            try {
                return JSON.stringify(data);
            } catch (error) {
                storageErrors.push(`Compression error for data: ${error.message}`);
                console.error(`Storage compression error:`, error);
                return null;
            }
        }

        function decompressData(compressed) {
            try {
                return JSON.parse(compressed);
            } catch (error) {
                storageErrors.push(`Decompression error: ${error.message}`);
                console.error(`Storage decompression error:`, error);
                return null;
            }
        }

        function logStorageError(operation, key, error) {
            const errorMsg = `Storage error (${operation} - ${key}): ${error.message}`;
            storageErrors.push(errorMsg);
            console.error(errorMsg);

            if (storageErrors.length > 20) {
                storageErrors = storageErrors.slice(-20);
            }
        }

        return {
            setToken(token) {
                if (!token) throw new Error("Invalid storage token");
                storageToken = token;
                console.log(`Storage token set: ${token}`);
                return this;
            },

            getToken() {
                return storageToken;
            },

            getLastError() {
                return storageErrors.length > 0 ? storageErrors[storageErrors.length - 1] : null;
            },

            clearErrors() {
                storageErrors = [];
            },

            saveItem(key) {
                if (!storageToken || !key || !storageConfig.has(key)) {
                    console.log(`StorageOP skipped:"${key}": Invalid parameters`);
                    return false;
                }

                try {
                    const value = glbVer.get(key);
                    if (value === undefined) {
                        console.log(`StorageOP skipped:"${key}": Value is undefined`);
                        return true;
                    }

                    const keyConfig = storageConfig.get(key);
                    const dataSize = typeof value === 'object' ?
                        Array.isArray(value) ? value.length : Object.keys(value).length :
                        String(value).length;

                    const dataToStore = keyConfig.compress ? compressData(value) : JSON.stringify(value);

                    if (dataToStore === null) {
                        console.error(`Storage OP failed:"${key}": Compression error`);
                        return false;
                    }

                    localStorage.setItem(getStorageKey(key), dataToStore);
                    console.log(`StorageOP successful: "${key}" (${dataSize} items, ${Math.round(dataToStore.length / 1024)}KB)`);
                    return true;
                } catch (error) {
                    logStorageError('save', key, error);
                    return false;
                }
            },

            saveDataChanges(changeType) {

                try {
                    let result = true;
                    switch (changeType) {
                        case 'offers_current':
                            result = this.saveItem('offers_current');
                            statsOP.invalidate('OFFER');
                            renderEngine.markChanged('OFFER');
                            break;

                        case 'accounts':
                            result = this.saveItem('accounts');
                            statsOP.invalidate('MEMBER');
                            renderEngine.markChanged('MEMBER');
                            break;

                        case 'benefits':
                            result = this.saveItem('benefits');
                            statsOP.invalidate('BENEFIT');
                            renderEngine.markChanged('BENEFIT');
                            break;

                        case 'preferences':
                            result = this.saveItem('priorityCards') &&
                                this.saveItem('excludedCards');
                            renderEngine.renderCurrentView();
                            break;

                        case 'enrollment':
                            result = this.saveItem('offers_current') &&
                                this.saveItem('accounts');
                            statsOP.invalidate('OFFER');
                            statsOP.invalidate('MEMBER');
                            renderEngine.markChanged('OFFER');
                            renderEngine.markChanged('MEMBER');
                            break;

                        case 'history':
                            result = this.saveItem('offers_expired') &&
                                this.saveItem('offers_redeemed');
                            break;

                        case 'favorite':
                            result = this.saveItem('offers_current');
                            statsOP.invalidate('OFFER');
                            break;

                        default:
                            result = this.saveAll();
                    }

                    return result;
                } catch (error) {
                    logStorageError('Storage OP saveChanges', changeType, error);
                    return false;
                }
            },

            loadItem(key) {
                if (!storageToken || !key || !storageConfig.has(key)) {
                    console.log(`Storage load skipped:"${key}": Invalid parameters`);
                    return false;
                }

                try {
                    const storedValue = localStorage.getItem(getStorageKey(key));

                    if (!storedValue) {
                        console.log(`Storage load:"${key}": No data found`);
                        return false;
                    }

                    const keyConfig = storageConfig.get(key);
                    const parsedValue = keyConfig.compress ? decompressData(storedValue) : JSON.parse(storedValue);

                    if (parsedValue !== null) {
                        const dataSize = typeof parsedValue === 'object' ?
                            Array.isArray(parsedValue) ? parsedValue.length : Object.keys(parsedValue).length :
                            String(parsedValue).length;

                        glbVer.set(key, parsedValue, { silent: true });
                        console.log(`Storage load successful: "${key}" (${dataSize} items, ${Math.round(storedValue.length / 1024)}KB)`);
                        return true;
                    }

                    console.error(`Storage load failed:"${key}": Parsing error`);
                    return false;
                } catch (error) {
                    logStorageError('load', key, error);
                    return false;
                }
            },

            saveAll() {
                if (!storageToken) {
                    console.log(`Storage saveAll skipped: No token`);
                    return false;
                }

                console.log(`Saving all data to storage...`);
                try {
                    localStorage.setItem(getStorageKey("storageOpVersion"), storageOpVersion);
                    let success = true;
                    let failedKeys = [];

                    for (const [key, config] of storageConfig.entries()) {
                        const itemSaved = this.saveItem(key);
                        if (!itemSaved && config.important) {
                            success = false;
                            failedKeys.push(key);
                        }
                    }

                    if (!success) {
                        console.warn("Failed to save important keys:", failedKeys);
                    }

                    console.log(`Save all operation completed: ${success ? 'Success' : 'Partial failure'}`);
                    return success;
                } catch (error) {
                    logStorageError('saveAll', 'all', error);
                    return false;
                }
            },

            loadAll() {
                if (!storageToken) {
                    console.log(`Storage loadAll skipped: No token`);
                    return false;
                }

                console.log(`Loading all data from storage...`);
                try {
                    const storedVersion = localStorage.getItem(getStorageKey("storageOpVersion"));
                    if (storedVersion !== storageOpVersion) {
                        console.log(`Storage version mismatch: Found ${storedVersion}, expected ${storageOpVersion}`);
                        return false;
                    }

                    // Check data freshness
                    const lastUpdateKey = getStorageKey("lastUpdate");
                    const lastUpdate = localStorage.getItem(lastUpdateKey);
                    if (lastUpdate) {
                        const updateDate = new Date(JSON.parse(lastUpdate));
                        const now = new Date();
                        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
                        const ageHours = Math.round((now - updateDate) / (60 * 60 * 1000));

                        if ((now - updateDate) > maxAge) {
                            console.log(`Stored data is over 24 hours old (${ageHours} hours)`);
                            return false;
                        }

                        console.log(`Data age: ${ageHours} hours`);
                    }

                    let success = true;
                    let failedKeys = [];
                    let loadedItems = 0;

                    glbVer.batchUpdate(() => {
                        for (const [key, config] of storageConfig.entries()) {
                            const loaded = this.loadItem(key);
                            if (loaded) loadedItems++;

                            if (!loaded && config.important) {
                                success = false;
                                failedKeys.push(key);
                            }
                        }
                    });

                    if (!success) {
                        console.warn("Failed to load important keys:", failedKeys);
                    }

                    console.log(`Load all operation completed: ${success ? 'Success' : 'Partial failure'} (${loadedItems}/${storageConfig.size} items loaded)`);
                    return success;
                } catch (error) {
                    logStorageError('loadAll', 'all', error);
                    return false;
                }
            },

            clearStorage() {
                if (!storageToken) {
                    console.log(`Storage clear skipped: No token`);
                    return false;
                }

                console.log(`Clearing all storage data...`);
                try {
                    for (const key of storageConfig.keys()) {
                        const storageKey = getStorageKey(key);
                        if (storageKey) {
                            localStorage.removeItem(storageKey);
                        }
                    }
                    localStorage.removeItem(getStorageKey("storageOpVersion"));
                    console.log(`Storage cleared successfully`);
                    return true;
                } catch (error) {
                    logStorageError('clearStorage', 'all', error);
                    return false;
                }
            }
        };
    })();

    const renderEngine = (() => {
        const views = {
            MEMBER: {
                renderer: member_renderPage,
                dependencies: ['accounts'],
                element: null,
                timestamp: 0,
                sortState: { key: 'cardIndex', direction: 1 },
                scrollTop: 0
            },
            OFFER: {
                renderer: offer_renderPage,
                dependencies: ['offers_current', 'accounts'],
                element: null,
                timestamp: 0,
                sortState: { key: 'name', direction: 1 },
                scrollTop: 0
            },
            BENEFIT: {
                renderer: benefit_renderPage,
                dependencies: ['benefits', 'accounts'],
                element: null,
                timestamp: 0,
                scrollTop: 0
            }
        };

        let currentView = null;
        let contentElement = null;
        let isRendering = false;

        function setupDependencyListeners() {
            const depMap = new Map();
            Object.entries(views).forEach(([viewName, view]) => {
                view.dependencies.forEach(dep => {
                    if (!depMap.has(dep)) depMap.set(dep, new Set());
                    depMap.get(dep).add(viewName);
                });
            });

            depMap.forEach((viewSet, depKey) => {
                glbVer.subscribe(depKey, () => {
                    viewSet.forEach(viewName => invalidateView(viewName));
                });
            });
        }

        function invalidateView(viewName) {
            if (!views[viewName]) return;
            views[viewName].element = null;
            views[viewName].timestamp = 0;
        }

        function saveScrollPosition() {
            if (contentElement && currentView && views[currentView]) {
                views[currentView].scrollTop = contentElement.scrollTop || 0;
            }
        }

        function restoreScrollPosition(viewName) {
            if (contentElement && views[viewName]) {
                setTimeout(() => {
                    contentElement.scrollTop = views[viewName].scrollTop || 0;
                }, 50);
            }
        }

        function saveSortState(viewName, key, direction) {
            if (views[viewName] && views[viewName].sortState) {
                views[viewName].sortState = { key, direction };
            }
        }

        function restoreSortState(viewName) {
            if (views[viewName] && views[viewName].sortState) {
                return { ...views[viewName].sortState };
            }
            return { key: 'cardIndex', direction: 1 };
        }

        async function renderView(viewName) {
            if (isRendering || !contentElement) return;
            isRendering = true;

            try {
                const view = views[viewName];
                saveScrollPosition();

                contentElement.innerHTML = '';
                contentElement.appendChild(createLoader());

                let viewContent;
                try {
                    if (viewName === 'MEMBER' || viewName === 'OFFER') {
                        filterOP.applyFilters(viewName);
                    }

                    viewContent = await view.renderer();
                    view.element = viewContent;
                    view.timestamp = Date.now();
                } catch (error) {
                    console.error(`Error rendering ${viewName}:`, error);
                    viewContent = createErrorView(error);
                }

                contentElement.innerHTML = '';
                contentElement.appendChild(viewContent);
                restoreScrollPosition(viewName);
                currentView = viewName;
            } finally {
                isRendering = false;
            }
        }

        function createLoader() {
            const loader = document.createElement('div');
            loader.style.cssText = 'display:flex; justify-content:center; align-items:center; height:200px;';

            const spinner = document.createElement('div');
            spinner.style.cssText = 'width:40px; height:40px; border:3px solid rgba(0,122,255,0.2); border-top:3px solid var(--ios-blue); border-radius:50%; animation:spin 1s linear infinite;';

            loader.appendChild(spinner);
            return loader;
        }

        function createErrorView(error) {
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = 'color:var(--ios-red); padding:20px; text-align:center; background-color:rgba(255,59,48,0.1); border-radius:12px; margin:20px;';
            errorDiv.innerHTML = `
                <div style="font-size:18px; margin-bottom:10px; font-weight:600;">Error loading view</div>
                <div>${error.message || 'Unknown error'}</div>
                <button style="margin-top:20px; padding:8px 16px; background-color:var(--ios-blue); color:white; border:none; border-radius:8px; cursor:pointer;">Retry</button>
            `;

            const retryBtn = errorDiv.querySelector('button');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    invalidateView(currentView);
                    renderView(currentView);
                });
            }

            return errorDiv;
        }

        return {
            initialize(contentEl) {
                contentElement = contentEl;
                setupDependencyListeners();
                if (contentEl) {
                    contentEl.addEventListener('scroll', util_throttle(saveScrollPosition, 200));
                }
            },

            async changeView(viewName, options = {}) {
                if (!views[viewName]) {
                    console.error(`View not found: ${viewName}`);
                    return false;
                }

                saveScrollPosition();

                const allButtons = document.querySelectorAll('.amaxoffer-nav-button');
                allButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.style.backgroundColor = 'transparent';
                    btn.style.color = '#333';
                });

                const activeButton = document.querySelector(`.amaxoffer-nav-button[data-view="${viewName}"]`);
                if (activeButton) {
                    activeButton.classList.add('active');
                    activeButton.style.backgroundColor = 'var(--ios-blue)';
                    activeButton.style.color = 'white';
                }

                if (options.forceRender) {
                    invalidateView(viewName);
                }

                await renderView(viewName);
                return true;
            },

            getCurrentView() {
                return currentView;
            },

            invalidateView,

            invalidateAllViews() {
                Object.keys(views).forEach(invalidateView);
            },

            markChanged(viewName) {
                invalidateView(viewName);
            },

            renderCurrentView(force = false) {
                if (currentView) {
                    if (force) {
                        invalidateView(currentView);
                    }
                    renderView(currentView);
                }
            },

            restoreSortState,
            saveSortState
        };
    })();


    const filterOP = (() => {
        const defaultFilters = {
            memberStatus: "Active",
            memberCardtype: "all",
            offerFav: false,
            offerMerchantSearch: "",
            memberMerchantSearch: "",
            offerCardToken: "",
            enrollmentStatus: null,
            eligibleOnly: false,
            enrolledOnly: false,
            customFilter: null
        };

        const filters = { ...defaultFilters };


        return {
            getFilters() {
                return { ...filters };
            },

            setFilter(key, value) {
                if (key in filters) {
                    filters[key] = value;

                }
                return this;
            },

            setFilters(updates) {
                Object.assign(filters, updates);
                const affectsMembers = Object.keys(updates).some(k =>
                    k.startsWith('member') || k === 'customFilter'
                );
                const affectsOffers = Object.keys(updates).some(k =>
                    !k.startsWith('member') || k === 'customFilter'
                );

                return this;
            },

            resetFilters(specificFilters = null) {
                if (specificFilters) {
                    specificFilters.forEach(key => {
                        if (key in defaultFilters) {
                            filters[key] = defaultFilters[key];
                        }
                    });
                } else {
                    Object.assign(filters, defaultFilters);
                }

                return this;
            },

            applyFilters(viewName) {
                if (!viewName) viewName = renderEngine.getCurrentView();

                this.updateFilterControls(viewName);
                renderEngine.markChanged(viewName);
            },

            updateFilterControls(viewName) {
                if (viewName === 'MEMBER') {
                    const statusFilter = document.getElementById('status-filter');
                    const typeFilter = document.getElementById('type-filter');
                    const searchInput = document.querySelector('.filter-search-input');

                    if (statusFilter) statusFilter.value = filters.memberStatus;
                    if (typeFilter) typeFilter.value = filters.memberCardtype;
                    if (searchInput) searchInput.value = filters.memberMerchantSearch;
                } else if (viewName === 'OFFER') {
                    const searchInput = document.querySelector('.offer-search-input');
                    const cardFilter = document.querySelector('.card-filter');

                    if (searchInput) searchInput.value = filters.offerMerchantSearch;
                    if (cardFilter) cardFilter.value = filters.offerCardToken;
                }
            },

            getFilteredMembers() {

                const accounts = glbVer.get('accounts');

                const filtered = accounts.filter(acc => {
                    // Status filter
                    const statusMatch = filters.memberStatus === 'all' ||
                        acc.account_status?.trim().toLowerCase() === filters.memberStatus.toLowerCase();
                    if (!statusMatch) return false;

                    // Type filter
                    const typeMatch = filters.memberCardtype === 'all' ||
                        acc.relationship === filters.memberCardtype;
                    if (!typeMatch) return false;

                    // Custom filter
                    if (typeof filters.customFilter === 'function') {
                        return filters.customFilter(acc);
                    }

                    return true;
                });


                return filtered;
            },

            getFilteredOffers() {


                const offers = glbVer.get('offers_current') || [];
                if (!offers || !Array.isArray(offers)) {
                    console.error("offers_current is not an array:", offers);
                    return [];
                }

                const filtered = offers.filter(offer => {
                    if (!offer) return false;

                    // Favorite filter
                    if (filters.offerFav && !offer.favorite) return false;

                    // Search filter
                    if (filters.offerMerchantSearch) {
                        const term = filters.offerMerchantSearch.toLowerCase();
                        if (!(offer.name || '').toLowerCase().includes(term)) return false;
                    }

                    // Card token filter
                    if (filters.offerCardToken) {
                        const accountToken = filters.offerCardToken;
                        const isEligible = Array.isArray(offer.eligibleCards) && offer.eligibleCards.includes(accountToken);
                        const isEnrolled = Array.isArray(offer.enrolledCards) && offer.enrolledCards.includes(accountToken);
                        if (!isEligible && !isEnrolled) return false;
                    }

                    // Enrollment status filter
                    if (filters.enrollmentStatus === 'fully') {
                        const eligible = offer.eligibleCards?.length || 0;
                        const enrolled = offer.enrolledCards?.length || 0;
                        if (eligible + enrolled === 0 || enrolled !== eligible + enrolled) return false;
                    } else if (filters.enrollmentStatus === 'pending') {
                        const eligible = offer.eligibleCards?.length || 0;
                        const enrolled = offer.enrolledCards?.length || 0;
                        if (eligible + enrolled === 0 || enrolled === eligible + enrolled) return false;
                    }

                    // Eligibility filters
                    if (filters.eligibleOnly && (offer.eligibleCards?.length || 0) === 0) return false;
                    if (filters.enrolledOnly && (offer.enrolledCards?.length || 0) === 0) return false;

                    // Custom filter
                    if (typeof filters.customFilter === 'function') {
                        return filters.customFilter(offer);
                    }

                    return true;
                });


                return filtered;
            },

            createExpiringFilter() {
                return (offer) => {
                    if (!offer.expiry_date || offer.expiry_date === 'N/A') return false;
                    const expiryDate = new Date(offer.expiry_date);
                    const now = new Date();
                    const twoWeeksFromNow = new Date(now);
                    twoWeeksFromNow.setDate(now.getDate() + 30);
                    return !isNaN(expiryDate) && expiryDate > now && expiryDate <= twoWeeksFromNow;
                };
            }
        };
    })();

    const statsOP = (() => {
        const cache = new Map();
        let lastUpdateTime = 0;

        function calculateMembersStats() {
            const accounts = glbVer.get('accounts');
            if (!accounts || !Array.isArray(accounts)) return null;

            const stats = {
                totalCards: accounts.length,
                activeCards: 0,
                basicCards: 0,
                totalBalance: 0,
                totalPending: 0,
                totalRemaining: 0
            };

            for (const acc of accounts) {
                // Count active cards
                if (acc.account_status?.trim().toLowerCase() === "active") {
                    stats.activeCards++;
                }

                // Count basic cards
                if (acc.relationship === "BASIC") {
                    stats.basicCards++;

                    // Calculate financial totals only for basic cards
                    if (acc.financialData) {
                        stats.totalBalance += parseFloat(acc.financialData.statement_balance_amount || 0);
                        stats.totalPending += parseFloat(acc.financialData.debits_credits_payments_total_amount || 0);
                        stats.totalRemaining += parseFloat(acc.financialData.remaining_statement_balance_amount || 0);
                    }
                }
            }

            return stats;
        }

        function calculateOffersStats() {
            const offers = glbVer.get('offers_current');
            if (!offers || !Array.isArray(offers)) return null;

            const now = new Date();
            const twoWeeksFromNow = new Date(now);
            twoWeeksFromNow.setDate(now.getDate() + 14);

            const stats = {
                totalOffers: offers.length,
                favoriteOffers: 0,
                expiringSoon: 0,
                distinctNotFullyEnrolled: 0,
                totalEligible: 0,
                totalEnrolled: 0
            };

            for (const offer of offers) {
                // Count favorite offers
                if (offer.favorite) {
                    stats.favoriteOffers++;
                }

                // Check for expiring soon
                if (offer.expiry_date && offer.expiry_date !== 'N/A') {
                    const expiryDate = new Date(offer.expiry_date);
                    if (!isNaN(expiryDate) && expiryDate > now && expiryDate <= twoWeeksFromNow) {
                        stats.expiringSoon++;
                    }
                }

                // Count eligible and enrolled
                const eligibleCount = offer.eligibleCards?.length || 0;
                const enrolledCount = offer.enrolledCards?.length || 0;

                stats.totalEligible += eligibleCount;
                stats.totalEnrolled += enrolledCount;

                // Count not fully enrolled offers
                if (eligibleCount > 0) {
                    stats.distinctNotFullyEnrolled++;
                }
            }

            return stats;
        }

        function calculateBenefitsStats(benefits) {
            const benefitsArray = benefits || glbVer.get('benefits');
            if (!benefitsArray || !Array.isArray(benefitsArray)) return null;

            const counts = {
                total: benefitsArray.length,
                achieved: 0,
                inProgress: 0,
                notStarted: 0
            };

            for (const tracker of benefitsArray) {
                const spentAmount = parseFloat(tracker.tracker?.spentAmount) || 0;
                const targetAmount = parseFloat(tracker.tracker?.targetAmount) || 0;

                if (spentAmount >= targetAmount && targetAmount > 0) {
                    counts.achieved++;
                } else if (spentAmount > 0) {
                    counts.inProgress++;
                } else {
                    counts.notStarted++;
                }
            }

            return counts;
        }

        // Checks if cache should be updated
        function shouldUpdateCache() {
            const now = Date.now();
            // Update at most once per second unless forced
            return (now - lastUpdateTime) > 1000;
        }

        return {
            getMembersStats(forceRefresh = false) {
                if (forceRefresh || !cache.has('members') || shouldUpdateCache()) {
                    const stats = calculateMembersStats();
                    if (stats) {
                        cache.set('members', stats);
                        lastUpdateTime = Date.now();
                    }
                    return stats;
                }
                return cache.get('members');
            },

            getOffersStats(forceRefresh = false) {
                if (forceRefresh || !cache.has('offers') || shouldUpdateCache()) {
                    const stats = calculateOffersStats();
                    if (stats) {
                        cache.set('offers', stats);
                        lastUpdateTime = Date.now();
                    }
                    return stats;
                }
                return cache.get('offers');
            },

            getBenefitsStats(benefits, forceRefresh = false) {
                if (benefits) {
                    return calculateBenefitsStats(benefits);
                }

                if (forceRefresh || !cache.has('benefits') || shouldUpdateCache()) {
                    const stats = calculateBenefitsStats();
                    if (stats) {
                        cache.set('benefits', stats);
                        lastUpdateTime = Date.now();
                    }
                    return stats;
                }
                return cache.get('benefits');
            },

            invalidate(type) {
                if (!type) {
                    cache.clear();
                    lastUpdateTime = 0;
                    return;
                }

                const cacheKeyMap = {
                    'MEMBER': 'members',
                    'OFFER': 'offers',
                    'BENEFIT': 'benefits'
                };

                const cacheKey = cacheKeyMap[type] || type;
                if (cacheKey && cache.has(cacheKey)) {
                    cache.delete(cacheKey);
                }
            },

            getStats(type, forceRefresh = false) {
                switch (type) {
                    case 'MEMBER':
                        return this.getMembersStats(forceRefresh);
                    case 'OFFER':
                        return this.getOffersStats(forceRefresh);
                    case 'BENEFIT':
                        return this.getBenefitsStats(null, forceRefresh);
                    default:
                        return {
                            members: this.getMembersStats(forceRefresh),
                            offers: this.getOffersStats(forceRefresh),
                            benefits: this.getBenefitsStats(null, forceRefresh)
                        };
                }
            },

            refreshAll() {
                this.invalidate();
                return this.getStats();
            },

            // Subscribe to data changes to auto-update stats
            initializeListeners() {
                glbVer.subscribe('accounts', () => this.invalidate('MEMBER'));
                glbVer.subscribe('offers_current', () => this.invalidate('OFFER'));
                glbVer.subscribe('benefits', () => this.invalidate('BENEFIT'));
            }
        };
    })();


    function addAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* All your existing animation styles... */

            /* Improved active tab styles */
            .amaxoffer-nav-button {
                position: relative;
                transition: all 0.2s ease;
            }

            .amaxoffer-nav-button.active {
                background-color: var(--ios-blue) !important;
                color: white !important;
                box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3) !important;
            }

            .amaxoffer-nav-button.active::after {
                content: '';
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                width: 8px;
                height: 8px;
                background-color: var(--ios-blue);
                border-radius: 50%;
                animation: pulseIndicator 1.5s infinite alternate;
            }

            @keyframes pulseIndicator {
                from { transform: translateX(-50%) scale(0.8); opacity: 0.7; }
                to { transform: translateX(-50%) scale(1.2); opacity: 1; }
            }

            .current-tab-indicator {
                animation: fadeInText 0.3s forwards;
            }

            @keyframes fadeInText {
                from { opacity: 0; transform: translateY(5px); }
                to { opacity: 0.8; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }

    const addGlobalStyle = () => {
        const style = document.createElement('style');
        style.id = 'amaxoffer-global-styles';
        style.textContent = `
        @font-face {
            font-family: 'AmexFont';
            src: url("https://www.aexp-static.com/cdaas/one/statics/@americanexpress/static-assets/2.31.2/package/dist/iconfont/dls-icons.woff?v=2.31.2") format('woff');
            font-weight: normal;
            font-style: normal;
        }

        :root {
            /* Base colors */
            --ios-blue: #007AFF;
            --ios-dark-blue: #0062CC;
            --ios-green: rgb(32, 169, 69);
            --ios-orange: rgb(215, 129, 0);
            --ios-red: rgb(215, 49, 38);
            --ios-gray: rgb(142, 142, 147);

            /* Background colors */
            --ios-background: rgba(255, 255, 255, 0.8);
            --ios-secondary-bg: rgba(249, 249, 251, 0.6);
            --ios-light-gray: rgba(142, 142, 147, 0.1);

            /* Text colors */
            --ios-text-primary: #1c1c1e;
            --ios-text-secondary: #2c2c2e;

            /* Common properties */
            --ios-border: rgba(230, 230, 230, 0.7);
            --ios-radius: 18px;
            --ios-table-border-radius: 8px;
            --ios-font: 'AmexFont', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;

            /* Gradients */
            --ios-title-gradient: linear-gradient(45deg, #4CAF50, #2196F3);
            --ios-button-gradient: linear-gradient(45deg, rgb(84,99,86), rgb(27,66,29));
            --ios-header-bg: linear-gradient(to right, rgba(245, 245, 247, 0.9), rgba(235, 235, 242, 0.85));

            /* Shadows */
            --ios-shadow-sm: 0 2px 6px rgba(0, 0, 0, 0.06);
            --ios-shadow-md: 0 5px 16px rgba(0, 0, 0, 0.1);
            --ios-shadow: 0 12px 32px rgba(0, 0, 0, 0.14);

            /* Animation timings */
            --ios-anim-fast: 0.2s;
            --ios-anim-medium: 0.3s;
            --ios-anim-slow: 0.5s;

            /* Status colors */
            --ios-status-active-bg: rgba(52, 199, 89, 0.15);
            --ios-status-pending-bg: rgba(255, 149, 0, 0.15);
            --ios-status-inactive-bg: rgba(255, 59, 48, 0.15);

            /* Table styles */
            --ios-table-cell-padding: 10px 14px;
            --ios-table-row-hover: rgba(0, 0, 0, 0.04);
            --ios-table-header-font-size: 12px;
            --ios-table-cell-font-size: 13px;

            /* Highlight colors */
            --ios-highlight-bg: rgba(255, 204, 0, 0.2);
            --ios-highlight-border: rgba(255, 204, 0, 0.8);
            --ios-highlight-hover: rgba(255, 204, 0, 0.25);

            /* Empty state */
            --ios-empty-padding: 60px 20px;
        }

        /* Main Container */
        .amaxoffer-container {
            position: fixed;
            top: 5%;
            left: 5%;
            background: url("https://www.aexp-static.com/cdaas/one/statics/@americanexpress/static-assets/2.28.0/package/dist/img/brand/worldservice-tile-gray.svg") repeat, #fefefe;
            border-radius: 12px;
            z-index: 10000;
            font-family: var(--ios-font);
            box-shadow: var(--ios-shadow);
            max-height: 90vh;
            overflow: hidden;
            width: 90%;
            max-width: 1400px;
            border: 1px solid rgba(0,0,0,0.15);
            transition: all 0.3s ease;
        }

        .amaxoffer-minimized {
            width: 200px !important;
            height: 75px !important;
            transform: scale(0.98);
            box-shadow: 0 12px 18px rgba(0,0,0,0.20);
        }

        .amaxoffer-expanded {
            width: 90% !important;
            height: 80vh !important;
            transform: none;
            box-shadow: var(--ios-shadow);
        }

        /* Header Styles */
        .amaxoffer-header {
            background-color: #f8f9fa;
            border-bottom: 1px solid rgba(0,0,0,0.08);
            padding: 12px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: grab;
            user-select: none;
        }

        .amaxoffer-title {
            font-size: 1.4rem;
            font-weight: 600;
            background: var(--ios-title-gradient);
            -webkit-background-clip: text;
            color: transparent;
            letter-spacing: -0.5px;
        }

        .amaxoffer-nav {
            display: flex;
            gap: 12px;
            background: #f8f9fa;
            border-radius: 8px;
            padding: 4px;
        }

        .amaxoffer-nav-button {
            cursor: pointer;
            font-size: 18px;
            padding: 8px 20px;
            border: none;
            background: transparent;
            border-radius: 8px;
            transition: all 0.2s ease;
            color: #2c3e50;
            font-weight: 500;
        }

        .amaxoffer-nav-button:hover {
            transform: scale(1.05);
            background-color: #f0f0f0;
        }

        .amaxoffer-nav-button.active {
            background-color: #4CAF50;
            color: black;
            font-weight: 800;
        }

        .amaxoffer-toggle-btn {
            font-size: 1.2rem;
            border: 1px dashed #ccc;
            border-radius: 6px;
            width: 50px;
            height: 50px;
            display: inline-flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            background: transparent;
            transition: all 0.2s ease;
        }

        .amaxoffer-toggle-btn:hover {
            background-color: #f0f0f0;
        }

        /* Content Area */
        .amaxoffer-content {
            padding: 20px;
            overflow-y: auto;
            max-height: calc(80vh - 64px);
        }

        /* Common Table Styles */
        .ios-table{
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            font-family: var(--ios-font);
            border-radius: var(--ios-table-border-radius);
            overflow: hidden;
            background-color: var(--ios-background);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            box-shadow: var(--ios-shadow-sm);
            border: 1px solid var(--ios-border);
        }

        .ios-table-head{
            background: var(--ios-header-bg);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            position: sticky;
            top: 0;
            z-index: 10;
        }

        .ios-table th{
            padding: var(--ios-table-cell-padding);
            font-weight: 600;
            color: var(--ios-text-primary);
            border-bottom: 1px solid rgba(60, 60, 67, 0.12);
            text-align: left;
        }

        .ios-table th.sortable{
            cursor: pointer;
            position: relative;
            padding-right: 28px;
        }

        .ios-table tr{
            transition: background-color 0.2s ease;
        }

        .ios-table tr:nth-child(even){
            background-color: var(--ios-secondary-bg);
        }

        .ios-table tr:hover{
            background-color: var(--ios-table-row-hover);
        }

        .ios-table td{
            padding: var(--ios-table-cell-padding);
            color: var(--ios-text-secondary);
            border-bottom: 1px solid rgba(60, 60, 67, 0.04);
            vertical-align: middle;
        }

        /* Status pills */
        .ios-status{
            display: inline-block;
            padding: 5px 10px;
            border-radius: 16px;
            font-size: 13px;
            font-weight: 500;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .ios-status.active, .ios-status.success{
            background-color: var(--ios-status-active-bg);
            color: var(--ios-green);
            border: 1px solid rgba(52, 199, 89, 0.25);
        }

        .ios-status.pending {
            background-color: var(--ios-status-pending-bg);
            color: var(--ios-orange);
            border: 1px solid rgba(255, 149, 0, 0.25);
        }

        .ios-status.inactive, .ios-status.failed, .ios-status.canceled {
            background-color: var(--ios-status-inactive-bg);
            color: var(--ios-red);
            border: 1px solid rgba(255, 59, 48, 0.25);
        }

        /* Empty state */
        .ios-empty-state{
            padding: var(--ios-empty-padding);
            text-align: center;
        }

        /* Search input */
        .ios-search-container {
            position: relative;
            box-sizing: border-box;
            width: 200px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
            border-radius: 10px;
        }

        .ios-search-input {
            width: 100%;
            padding: 10px 32px 10px 12px;
            border-radius: 10px;
            border: 1px solid #e0e0e0;
            background-color: rgba(250, 250, 250, 0.8);
            font-size: 14px;
            font-family: var(--ios-font);
        }

        .ios-search-input:focus {
            outline: none;
            border-color: var(--ios-blue);
            box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.08);
        }

        /* Animation keyframes */
        @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }

        @keyframes slideIn {
            0% { transform: translateY(20px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes iosBounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.3); }
    }

        .ios-sort-animation {
        animation: iosBounce 0.3s ease;
    }

        /* Responsive design */
        @media (max-width: 768px) {
            .amaxoffer-container {
                width: 95%;
                left: 2.5%;
            }

            .summary-header,
            .button-container {
                flex-direction: column; align-items: stretch;
            }
        }
        `;
        document.head.appendChild(style);
    };

    // Call this function to add the global styles at the beginning
    addAnimationStyles();
    addGlobalStyle();


    const UI_STYLES = {
        // Layout containers
        containers: {
            card: 'background:var(--ios-background); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); border-radius:14px; padding:16px; box-shadow:0 4px 12px rgba(0,0,0,0.08); border:1px solid var(--ios-border);',
            page: 'display:flex; flex-direction:column; gap:20px; padding:20px; max-width:100%; margin:0 auto; font-family:var(--ios-font); transition:all 0.3s ease;',
            modal: 'background-color:#fff; border-radius:16px; box-shadow:0 20px 60px rgba(0,0,0,0.15); overflow:hidden; transition:all 0.3s cubic-bezier(0.16, 1, 0.3, 1);',
            flexRow: 'display:flex; align-items:center; gap:12px;',
            flexColumn: 'display:flex; flex-direction:column; gap:12px;',
            gridContainer: 'display:grid; gap:16px;',
        },

        // Text styles
        text: {
            title: 'font-size:20px; font-weight:600; color:#1c1c1e; margin:0 0 16px 0;',
            subtitle: 'font-size:16px; font-weight:600; color:#3a3a3c; margin:0 0 12px 0;',
            body: 'font-size:14px; color:#4a4a4a; line-height:1.5;',
            label: 'font-size:13px; color:var(--ios-gray); font-weight:500;',
            value: 'font-size:15px; font-weight:600; color:#1c1c1e;',
            currency: 'font-variant-numeric:tabular-nums; font-weight:600; text-align:center;',
        },

        // Form controls
        controls: {
            input: 'width:100%; padding:10px 12px; border-radius:8px; border:1px solid #ddd; font-size:14px; outline:none; transition:all 0.2s ease;',
            select: 'padding:10px 12px; border-radius:8px; border:1px solid #ddd; font-size:14px; outline:none; background-color:white; cursor:pointer;',
            search: 'position:relative; width:100%; padding:10px 32px 10px 12px; border-radius:10px; border:1px solid #e0e0e0; background-color:rgba(250, 250, 250, 0.8); font-size:14px; font-family:var(--ios-font);',
        },

        // Buttons
        buttons: {
            primary: 'background-color:var(--ios-blue); color:white; border:none; border-radius:10px; font-weight:500; cursor:pointer; transition:all 0.2s ease; display:flex; align-items:center; gap:8px;',
            secondary: 'background-color:rgba(142, 142, 147, 0.1); color:var(--ios-text-secondary); border:none; border-radius:10px; font-weight:500; cursor:pointer; transition:all 0.2s ease; display:flex; align-items:center; gap:8px;',
            danger: 'background-color:var(--ios-red); color:white; border:none; border-radius:10px; font-weight:500; cursor:pointer; transition:all 0.2s ease; display:flex; align-items:center; gap:8px;',
            success: 'background-color:var(--ios-green); color:white; border:none; border-radius:10px; font-weight:500; cursor:pointer; transition:all 0.2s ease; display:flex; align-items:center; gap:8px;',
        },

        // Status indicators
        status: {
            active: 'background-color:rgba(52, 199, 89, 0.15); color:var(--ios-green); border:1px solid rgba(52, 199, 89, 0.25);',
            pending: 'background-color:rgba(255, 149, 0, 0.15); color:var(--ios-orange); border:1px solid rgba(255, 149, 0, 0.25);',
            inactive: 'background-color:rgba(255, 59, 48, 0.15); color:var(--ios-red); border:1px solid rgba(255, 59, 48, 0.25);',
        },

        // Badges
        badges: {
            primary: 'padding:4px 10px; border-radius:12px; font-size:13px; font-weight:500; white-space:nowrap; display:inline-flex; align-items:center; gap:4px;',
            small: 'padding:3px 6px; font-size:11px; border-radius:8px; font-weight:500;',
            medium: 'padding:4px 8px; font-size:12px; border-radius:10px; font-weight:500;',
            large: 'padding:5px 10px; font-size:13px; border-radius:12px; font-weight:500;',
        },

        // Animations
        animations: {
            fadeIn: 'animation: fadeIn 0.3s ease forwards;',
            slideIn: 'animation: slideIn 0.3s ease forwards;',
            bounce: 'animation: bounce 0.3s ease;',
        },

        // Common utility styles
        utils: {
            shadow: 'box-shadow:0 4px 12px rgba(0,0,0,0.08);',
            shadowHover: 'box-shadow:0 8px 24px rgba(0,0,0,0.12);',
            roundedCorners: 'border-radius:12px;',
            border: 'border:1px solid rgba(0,0,0,0.08);',
            transition: 'transition:all 0.2s ease;',
            truncate: 'white-space:nowrap; overflow:hidden; text-overflow:ellipsis;',
        },

        modal: {
            overlay: ` position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); z-index: 10001; display: flex; justify-content: center; align-items: center; transition: opacity 0.3s ease; `,
            container: ` background-color: #fff; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); width: 90%; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; transform: translateY(40px) scale(0.95); opacity: 0; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); `,
            header: ` padding: 20px; border-bottom: 1px solid rgba(0,0,0,0.08); position: relative; display: flex; justify-content: space-between; align-items: center; `,
            title: ` margin: 0; font-size: 1.3rem; font-weight: 600; color: var(--ios-text-primary); `,
            closeButton: ` background: rgba(0,0,0,0.05); border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; position: absolute; top: 16px; right: 16px; transition: all 0.2s ease; color: #666; z-index: 5; `,
            content: ` padding: 20px; overflow-y: auto; flex: 1; `,
            tabContainer: ` display: flex; border-bottom: 1px solid rgba(0,0,0,0.1); padding: 0 20px; background-color: #f8f8f8; `,
            tab: ` padding: 12px 20px; background: none; border: none; border-bottom: 3px solid transparent; font-size: 15px; font-weight: 500; color: #555; cursor: pointer; transition: all 0.2s ease; margin-right: 8px; `,
            tabActive: ` border-bottom-color: var(--ios-blue); color: var(--ios-blue); `
        },

        // Card list styles
        cardList: {
            container: ` display: flex; flex-direction: column; gap: 24px; margin-bottom: 16px;  `,
            sectionHeader: ` display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;  `,
            sectionTitle: ` margin: 0; font-size: 16px; font-weight: 600;  `,
            cardCount: ` font-size: 14px; color: var(--ios-gray);  `,
            grid: ` display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px;  `,
            emptyMessage: ` grid-column: 1 / -1; padding: 16px; text-align: center; background-color: rgba(0,0,0,0.02); border-radius: 10px; color: var(--ios-gray); font-size: 14px;  `,
            item: ` background-color: white; border-radius: 12px; border: 1px solid rgba(0,0,0,0.08); padding: 12px; display: flex; flex-direction: column; gap: 8px; transition: all 0.2s ease;  `
        },

        // Badge styles (expanded)
        badges: {
            // Existing styles...
            statusPill: {
                eligible: ` border-radius: 16px; background-color: rgba(0, 122, 255, 0.1); color: var(--ios-blue); border: 1px solid rgba(0, 122, 255, 0.2); padding: 5px 12px; font-weight: 600;     font-size: 13px;  display: inline-flex;  align-items: center;  gap: 4px; `, enrolled: `  border-radius: 16px;  background-color: rgba(52, 199, 89, 0.1);  color: var(--ios-green);  border: 1px solid rgba(52, 199, 89, 0.2);  padding: 5px 12px;  font-weight: 600;  font-size: 13px;  display: inline-flex;  align-items: center;  gap: 4px; `
            }
        },
        glassMorphism: {
            card: ` background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-radius: var(--ios-radius); border: 1px solid rgba(255, 255, 255, 0.3); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);  `,
            modal: ` background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.4); box-shadow: 0 20px 80px rgba(0, 0, 0, 0.2);  `,
            navbar: ` background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border-bottom: 1px solid rgba(230, 230, 230, 0.5);  `
        },

        // Beautiful gradient styles
        gradients: {
            primary: 'linear-gradient(135deg, #4CAF50, #2196F3)',
            success: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
            warning: 'linear-gradient(135deg, #FF9800, #FFC107)',
            danger: 'linear-gradient(135deg, #F44336, #FF5722)',
            blue: 'linear-gradient(135deg, #2196F3, #03A9F4)',
            purple: 'linear-gradient(135deg, #9C27B0, #673AB7)',
            dark: 'linear-gradient(135deg, #424242, #212121)'
        },

        // Refined animations
        animations: {
            fadeInUp: 'animation: fadeInUp 0.3s ease forwards;',
            fadeInDown: 'animation: fadeInDown 0.3s ease forwards;',
            scaleIn: 'animation: scaleIn 0.3s ease forwards;',
            pulse: 'animation: pulse 2s infinite;'
        },

        // Enhanced shadow styles
        shadows: {
            sm: 'box-shadow: 0 2px 6px rgba(0,0,0,0.05);',
            md: 'box-shadow: 0 5px 15px rgba(0,0,0,0.08);',
            lg: 'box-shadow: 0 10px 25px rgba(0,0,0,0.12);',
            xl: 'box-shadow: 0 15px 35px rgba(0,0,0,0.18);'
        },

        // Beautiful hover effects
        hoverEffects: {
            lift: ` transition: transform 0.2s ease, box-shadow 0.2s ease; &:hover {  transform: translateY(-4px);  box-shadow: 0 8px 20px rgba(0,0,0,0.1); }  `,
            glow: ` transition: box-shadow 0.2s ease; &:hover {  box-shadow: 0 0 16px rgba(0, 122, 255, 0.5); }  `,
            scale: ` transition: transform 0.2s ease; &:hover { transform: scale(1.05); }  `
        },

        cards: {
            stats: ` background-color: white; border-radius: 16px; padding: 16px 20px; min-width: 140px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); display: flex; flex-direction: column; align-items: center; transition: transform 0.2s ease;  `,
            offer: ` background-color: white; border-radius: 12px;  border: 1px solid rgba(0,0,0,0.08); padding: 16px; transition: all 0.2s ease; display: flex; gap: 14px;  `,
            benefit: ` border: 1px solid #e6e6e6; border-radius: 16px; padding: 16px; margin-top: 16px; background-color: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.04); transition: all 0.3s ease; position: relative; overflow: hidden;  `
        },

        // Progress components
        progress: {
            container: `margin: 16px 0;`,
            bar: ` height: 12px; border-radius: 8px; background-color: #f0f0f0; position: relative; overflow: hidden; border: 1px solid #ddd; width: 100%; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);  `,
            fill: ` height: 100%; position: absolute; top: 0; left: 0; transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);  `
        },

        // Accordion components
        accordion: {
            item: ` border: 1px solid #e0e0e0; border-radius: 12px; margin-bottom: 16px; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: box-shadow 0.2s ease, transform 0.2s ease; overflow: hidden;  `,
            header: ` padding: 16px 20px; cursor: pointer; transition: background-color 0.2s ease; background-color: #f9f9f9; position: relative; border-bottom: 1px solid transparent;  `,
            body: ` padding: 0 20px; overflow: hidden; max-height: 0; transition: max-height 0.4s ease-in-out, padding 0.4s ease-in-out, opacity 0.3s ease; opacity: 0;  `
        },

        // Status mapping
        status: {
            achieved: { color: 'var(--ios-green)', bgColor: 'rgba(52, 199, 89, 0.15)', borderColor: 'rgba(52, 199, 89, 0.25)' },
            inProgress: { color: 'var(--ios-blue)', bgColor: 'rgba(0, 122, 255, 0.15)', borderColor: 'rgba(0, 122, 255, 0.25)' },
            notStarted: { color: 'var(--ios-gray)', bgColor: 'rgba(142, 142, 147, 0.15)', borderColor: 'rgba(142, 142, 147, 0.25)' },
            active: { color: 'var(--ios-green)', bgColor: 'rgba(52, 199, 89, 0.15)', borderColor: 'rgba(52, 199, 89, 0.25)' },
            pending: { color: 'var(--ios-orange)', bgColor: 'rgba(255, 149, 0, 0.15)', borderColor: 'rgba(255, 149, 0, 0.25)' },
            canceled: { color: 'var(--ios-red)', bgColor: 'rgba(255, 59, 48, 0.15)', borderColor: 'rgba(255, 59, 48, 0.25)' }
        },

        // Enhanced table cells
        tableCells: {
            index: `font-family: var(--ios-font); font-size: 13px;`,
            card: `font-weight: 500; color: #1c1c1e; font-size: 14px; padding: 4px 8px; border-radius: 6px; background-color: rgba(0,0,0,0.03); display: inline-block;`,
            name: `max-width: 170px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; font-size: 13px;`,
            money: `font-variant-numeric: tabular-nums; font-weight: 600; text-align: right;`,
            description: `font-size: 13px; color: var(--ios-text-secondary); max-width: 220px; max-height: 60px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; line-height: 1.3;`
        },

        // Page layout shortcuts
        pageContainer: 'display:flex; flex-direction:column; gap:20px; padding:20px; max-width:100%; margin:0 auto; font-family:var(--ios-font); transition:all 0.3s ease;',
        cardContainer: 'background:var(--ios-background); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); border-radius:14px; padding:16px; box-shadow:0 4px 12px rgba(0,0,0,0.08); border:1px solid var(--ios-border);',
    };


    // =========================================================================
    // Section 3: General Helper Functions
    // =========================================================================

    // Anti-kickoff utility to prevent session timeouts
    const util_antiKickOff = (() => {
        const registry = new WeakMap();
        let sessionInterval = null;
        let initialized = false;

        const origMethods = {
            addEventListener: EventTarget.prototype.addEventListener,
            removeEventListener: EventTarget.prototype.removeEventListener
        };

        function overrideEventListeners() {
            EventTarget.prototype.addEventListener = function (type, listener, options) {
                if (type === 'visibilitychange' || type === 'focus' || type === 'blur') {
                    if (!registry.has(this)) registry.set(this, new Map());
                    const typeMap = registry.get(this);
                    if (!typeMap.has(type)) typeMap.set(type, new Set());
                    typeMap.get(type).add({ listener, options, timestamp: Date.now() });
                }
                return origMethods.addEventListener.call(this, type, listener, options);
            };

            EventTarget.prototype.removeEventListener = function (type, listener, options) {
                if ((type === 'visibilitychange' || type === 'focus' || type === 'blur') &&
                    registry.has(this) && registry.get(this).has(type)) {
                    const listeners = registry.get(this).get(type);
                    for (const entry of listeners) {
                        if (entry.listener === listener) {
                            listeners.delete(entry);
                            break;
                        }
                    }
                }
                return origMethods.removeEventListener.call(this, type, listener, options);
            };
        }

        function extendSession() {
            try {
                const targetWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

                if (targetWindow.timeout && typeof targetWindow.timeout.checkVisibility === 'function') {
                    try {
                        targetWindow.timeout.checkVisibility({ hidden: false });
                        console.log(`Session extended: checkVisibility({ hidden: false })`);
                        return true;
                    } catch (e) {
                        try {
                            targetWindow.timeout.checkVisibility(false);
                            console.log(`Session extended: checkVisibility(false)`);
                            return true;
                        } catch (err) {
                            targetWindow.timeout.checkVisibility();
                            console.log(`Session extended: checkVisibility()`);
                            return true;
                        }
                    }
                }

                // Fallback: trigger events that often reset timeout timers
                if (document.hidden !== undefined) {
                    document.dispatchEvent(new Event('visibilitychange'));
                    console.log(`Session extended: visibilitychange event`);
                    return true;
                }

                window.dispatchEvent(new Event('focus'));
                setTimeout(() => window.dispatchEvent(new Event('blur')), 100);
                setTimeout(() => window.dispatchEvent(new Event('focus')), 200);
                console.log(`Session extended: focus/blur events`);
                return true;
            } catch (error) {
                console.error('Session extension error:', error);
                return false;
            }
        }

        function removeVisibilityListeners() {
            if (!registry.has(document)) return 0;
            const typeMap = registry.get(document);
            if (!typeMap.has('visibilitychange')) return 0;

            const listeners = typeMap.get('visibilitychange');
            let count = 0;

            for (const entry of listeners) {
                try {
                    document.removeEventListener('visibilitychange', entry.listener, entry.options);
                    count++;
                } catch (e) {
                    console.error('Listener removal error:', e);
                }
            }

            listeners.clear();
            return count;
        }

        function restoreOriginalMethods() {
            EventTarget.prototype.addEventListener = origMethods.addEventListener;
            EventTarget.prototype.removeEventListener = origMethods.removeEventListener;
        }

        return {
            initialize: (intervalMs = 60000, aggressive = true) => {
                if (initialized) this.stop();

                overrideEventListeners();

                if (aggressive) {
                    const removed = removeVisibilityListeners();
                    if (removed > 0) console.log(`Removed ${removed} visibilitychange listeners`);
                }

                sessionInterval = setInterval(extendSession, intervalMs);
                const success = extendSession();
                initialized = true;

                return success;
            },

            stop: () => {
                if (sessionInterval) {
                    clearInterval(sessionInterval);
                    sessionInterval = null;
                }

                restoreOriginalMethods();
                initialized = false;
                return true;
            },

            getStatus: () => ({
                initialized,
                intervalActive: sessionInterval !== null,
                listenerCount: registry.has(document) &&
                    registry.get(document).has('visibilitychange') ?
                    registry.get(document).get('visibilitychange').size : 0
            }),

            forceExtend: () => extendSession()
        };
    })();

    // Format date to MM-DD-YY
    function util_formatDate(dateStr) {
        if (!dateStr || dateStr === 'N/A') return 'N/A';

        let date;

        // Handle ISO dates with timezone
        if (dateStr.includes('T') && (dateStr.endsWith('Z') || /[+-]\d\d:\d\d$/.test(dateStr))) {
            date = new Date(dateStr);
            return formatParts(
                date.getUTCMonth() + 1,
                date.getUTCDate(),
                date.getUTCFullYear()
            );
        }

        // Handle YYYY-MM-DD format directly without creating Date object
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const [year, month, day] = dateStr.split('-');
            return `${month}-${day}-${year.slice(-2)}`;
        }

        // Fallback for other formats
        date = new Date(dateStr);
        if (isNaN(date)) return 'N/A';

        return formatParts(
            date.getMonth() + 1,
            date.getDate(),
            date.getFullYear()
        );

        // Helper function to format date parts
        function formatParts(month, day, year) {
            return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}-${String(year).slice(-2)}`;
        }
    }


    // Clean/sanitize a value
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

    // Parse number from various formats
    function util_parseNumber(str) {
        if (Array.isArray(str)) return str.length;
        if (str === undefined || str === null || str === '' || str === 'N/A') return 0;
        if (typeof str === 'number') return str;

        const cleanedStr = String(str).replace(/[$,]/g, '');
        if (cleanedStr.includes('%')) {
            return parseFloat(cleanedStr.replace(/%/g, '')) || 0;
        }
        return parseFloat(cleanedStr) || 0;
    }

    // Debounce function for input events
    function util_debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Throttle function execution
    function util_throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // =========================================================================
    // Section 4: UI Elements Creation
    // =========================================================================


    function ui_createElement(tag, { text = '', className = '', styles = {}, styleString = '', props = {}, children = [], events = {} } = {}) {
        const el = document.createElement(tag);

        if (text) el.textContent = text;
        if (className) el.className = className;

        if (styleString) {
            el.style.cssText = styleString;
        } else if (Object.keys(styles).length) {
            Object.assign(el.style, styles);
        }

        Object.entries(props).forEach(([key, value]) => {
            if (key === 'innerHTML') {
                el.innerHTML = value;
            } else {
                el[key] = value;
            }
        });

        if (Array.isArray(children)) {
            children.filter(Boolean).forEach(child => el.appendChild(child));
        }

        Object.entries(events).forEach(([event, handler]) => {
            el.addEventListener(event, handler);
        });

        return el;
    }

    function ui_createBtn(config = {}) {
        const {
            label = '',
            icon = null,
            onClick = () => { },
            type = 'primary',
            size = 'medium',
            fullWidth = false,
            maxWidth = null,
            customStyle = '',
            disabled = false,
            ariaLabel = ''
        } = config;

        const sizeStyles = {
            small: 'padding:6px 12px; font-size:13px;',
            medium: 'padding:10px 16px; font-size:14px;',
            large: 'padding:12px 24px; font-size:16px;'
        };

        const styleString = `
            ${UI_STYLES.buttons[type] || UI_STYLES.buttons.primary}
            ${sizeStyles[size] || sizeStyles.medium}
            ${fullWidth ? 'width:100%;' : ''}
            ${maxWidth ? `max-width:${maxWidth};` : ''}
            ${disabled ? 'opacity:0.6; cursor:not-allowed;' : ''}
            ${customStyle}
        `;

        const content = icon ? `${icon} ${label}` : label;

        return ui_createElement('button', {
            props: {
                innerHTML: content,
                disabled,
                type: 'button',
                'aria-label': ariaLabel || label
            },
            styleString,
            events: {
                click: e => {
                    if (!disabled) onClick(e);
                },
                mouseenter: e => {
                    if (!disabled) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = UI_STYLES.utils.shadowHover;
                    }
                },
                mouseleave: e => {
                    if (!disabled) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = UI_STYLES.utils.shadow;
                    }
                }
            }
        });
    }

    function ui_createEmptyState(container, options = {}) {
        const {
            title = 'No Items Found',
            message = 'Try adjusting your search or filters',
            buttonText = 'Reset Filters',
            iconSvg = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>',
            callback = () => { }
        } = options;

        return ui_createElement('div', {
            styleString: `
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                padding:80px 20px;
                text-align:center;
                background-color:rgba(0,0,0,0.02);
                border-radius:16px;
                margin:20px 0;
            `,
            children: [
                ui_createElement('div', {
                    styleString: 'margin-bottom:24px; width:100px; height:100px; display:flex; align-items:center; justify-content:center;',
                    props: {
                        innerHTML: `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" stroke-width="1.5">${iconSvg}</svg>`
                    }
                }),

                ui_createElement('div', {
                    text: title,
                    styleString: 'font-size:18px; font-weight:600; margin-bottom:12px; color:#1c1c1e;'
                }),

                ui_createElement('div', {
                    text: message,
                    styleString: 'font-size:14px; color:var(--ios-gray); max-width:400px; margin:0 auto 24px;'
                }),

                ui_createElement('button', {
                    text: buttonText,
                    styleString: `
                        padding:10px 20px;
                        background-color:var(--ios-blue);
                        color:white;
                        border:none;
                        border-radius:10px;
                        font-size:14px;
                        font-weight:500;
                        cursor:pointer;
                        box-shadow:0 2px 8px rgba(0, 122, 255, 0.3);
                        transition:all 0.2s ease;
                    `,
                    events: {
                        mouseenter: e => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.4)';
                        },
                        mouseleave: e => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 8px rgba(0, 122, 255, 0.3)';
                        },
                        click: callback
                    }
                })
            ]
        });
    }

    function ui_createBadge(config = {}) {
        const {
            label = '',
            value = '',
            color = '#333',
            size = 'medium',
            customStyle = ''
        } = config;

        if (!value || value === 'N/A') return null;

        const styleString = `
            ${UI_STYLES.badges[size] || UI_STYLES.badges.medium}
            background-color: ${color}15;
            color: ${color};
            border: 1px solid ${color}30;
            ${UI_STYLES.utils.transition}
            ${customStyle}
        `;

        const badge = ui_createElement('div', {
            styleString,
            events: {
                mouseenter: e => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = `0 2px 5px ${color}20`;
                },
                mouseleave: e => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                }
            }
        });

        if (label) {
            badge.appendChild(ui_createElement('span', {
                text: `${label}:`,
                styleString: 'opacity: 0.8; font-weight: 400; margin-right: 4px;'
            }));
        }

        badge.appendChild(ui_createElement('span', {
            text: value,
            styleString: 'font-weight: 500;'
        }));

        return badge;
    }

    function ui_createModal(config = {}) {
        const {
            id = 'modal-overlay',
            width = '800px',
            title = '',
            onClose = () => { }
        } = config;

        const existing = document.getElementById(id);
        if (existing) existing.remove();

        const overlay = ui_createElement('div', {
            props: {
                id,
                role: 'dialog',
                'aria-modal': 'true',
                'aria-labelledby': `${id}-title`,
                tabIndex: -1
            },
            styleString: UI_STYLES.modal.overlay
        });

        const modal = ui_createElement('div', {
            styleString: UI_STYLES.modal.container + `max-width: ${width}; will-change: transform, opacity;`,
            props: { role: 'document' }
        });

        const header = ui_createElement('div', {
            styleString: UI_STYLES.modal.header
        });

        if (title) {
            const titleEl = ui_createElement('h3', {
                text: title,
                styleString: UI_STYLES.modal.title,
                props: { id: `${id}-title` }
            });
            header.appendChild(titleEl);
        }

        function handleClose() {
            document.removeEventListener('keydown', handleKeydown);
            overlay.removeEventListener('click', handleOutsideClick);

            modal.style.transform = 'translateY(40px) scale(0.95)';
            modal.style.opacity = '0';
            overlay.style.opacity = '0';

            setTimeout(() => {
                overlay.remove();
                onClose();
            }, 300);
        }

        const handleKeydown = (e) => {
            if (e.key === 'Escape') handleClose();
        };

        const handleOutsideClick = (e) => {
            if (e.target === overlay) handleClose();
        };

        const closeBtn = ui_createElement('button', {
            props: {
                innerHTML: `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
                `,
                'aria-label': 'Close',
                title: 'Close',
                type: 'button'
            },
            styleString: UI_STYLES.modal.closeButton,
            events: {
                mouseenter: (e) => {
                    e.target.style.backgroundColor = 'rgba(0,0,0,0.1)';
                    e.target.style.color = '#333';
                    e.target.style.transform = 'scale(1.1)';
                },
                mouseleave: (e) => {
                    e.target.style.backgroundColor = 'rgba(0,0,0,0.05)';
                    e.target.style.color = '#666';
                    e.target.style.transform = 'scale(1)';
                },
                click: handleClose
            }
        });

        document.addEventListener('keydown', handleKeydown);
        overlay.addEventListener('click', handleOutsideClick);

        header.appendChild(closeBtn);
        modal.appendChild(header);

        const content = ui_createElement('div', {
            styleString: UI_STYLES.modal.content
        });

        modal.appendChild(content);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'translateY(0) scale(1)';
            modal.style.opacity = '1';

            modal.setAttribute('tabindex', '-1');
            modal.focus();
        });

        return {
            overlay,
            modal,
            header,
            content,
            closeBtn,
            close: handleClose
        };
    }

    function ui_createReactiveFilter(container, options = {}) {
        const {
            searchPlaceholder = 'Search...',
            onSearch = () => { },
            initialValue = '',
            onFilterChange = null,
            debounceDelay = 300
        } = options;

        const searchContainer = ui_createElement('div', {
            className: 'ios-search-container',
            styleString: 'position:relative; width:100%; max-width:300px;'
        });

        const input = ui_createElement('input', {
            className: 'ios-search-input',
            props: {
                type: 'text',
                placeholder: searchPlaceholder,
                value: initialValue,
                autocomplete: 'off',
                spellcheck: false
            },
            styleString: UI_STYLES.controls.search
        });

        const searchIcon = ui_createElement('div', {
            props: {
                innerHTML: `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ios-blue)" stroke-width="2" opacity="0.6">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>`
            },
            styleString: 'position:absolute; right:10px; top:50%; transform:translateY(-50%); pointer-events:none; transition: color 0.3s ease;'
        });

        const clearButton = ui_createElement('button', {
            props: {
                innerHTML: '×',
                type: 'button',
                'aria-label': 'Clear search'
            },
            styleString: 'position:absolute; right:30px; top:50%; transform:translateY(-50%); background:none; border:none; font-size:18px; cursor:pointer; color:#999; display:none; padding:4px;',
            events: {
                click: () => {
                    input.value = '';

                    if (filterOP) {
                        filterOP.setFilter('memberMerchantSearch', '');
                        filterOP.setFilter('offerMerchantSearch', '');
                    }

                    clearButton.style.display = 'none';

                    if (onFilterChange) {
                        onFilterChange('');
                    } else {
                        renderEngine.renderCurrentView(true);
                    }

                    input.focus();
                    onSearch('');
                }
            }
        });

        let debounceTimeout;

        const triggerFilterChange = (value) => {
            if (onFilterChange) {
                onFilterChange(value);
            } else {
                renderEngine.renderCurrentView(true);
            }
        };

        input.addEventListener('input', function () {
            const searchValue = this.value.toLowerCase();

            if (filterOP) {
                filterOP.setFilter('memberMerchantSearch', searchValue);
                filterOP.setFilter('offerMerchantSearch', searchValue);
            }

            clearButton.style.display = searchValue ? 'block' : 'none';
            onSearch(searchValue);
            searchIcon.style.color = 'var(--ios-orange)';

            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                triggerFilterChange(searchValue);
                searchIcon.style.color = 'var(--ios-blue)';
            }, debounceDelay);
        });

        input.addEventListener('focus', () => {
            searchContainer.style.boxShadow = '0 0 0 2px rgba(0, 122, 255, 0.1)';
            input.style.borderColor = 'var(--ios-blue)';
        });

        input.addEventListener('blur', () => {
            searchContainer.style.boxShadow = 'none';
            input.style.borderColor = '#e0e0e0';
        });

        searchContainer.appendChild(input);
        searchContainer.appendChild(searchIcon);
        searchContainer.appendChild(clearButton);
        container.appendChild(searchContainer);

        if (initialValue) {
            clearButton.style.display = 'block';
        }

        return {
            container: searchContainer,
            input,
            getValue: () => input.value.toLowerCase(),
            setValue: (val) => {
                input.value = val;
                clearButton.style.display = val ? 'block' : 'none';

                if (filterOP) {
                    filterOP.setFilter('memberMerchantSearch', val);
                    filterOP.setFilter('offerMerchantSearch', val);
                }
            }
        };
    }


    function ui_renderDataTable(headers, colWidths, items, cellRenderer, sortHandler, sortableKeys) {
        const tableElement = document.createElement('table');
        tableElement.className = 'ios-table';
        tableElement.style.cssText = 'width:100%; border-collapse:separate; border-spacing:0; font-size:var(--ios-table-cell-font-size); color:var(--ios-text-secondary); border-radius:var(--ios-table-border-radius); overflow:hidden; box-shadow:var(--ios-shadow-sm); border:var(--ios-border-light); background-color:var(--ios-background); display:table;';

        tableElement.cellRenderer = cellRenderer;

        const thead = document.createElement('thead');
        thead.className = 'ios-table-head';
        thead.style.cssText = 'background:var(--ios-header-bg); border-bottom:var(--ios-border-light); position:sticky; top:0; z-index:10; backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);';

        const headerRow = document.createElement('tr');

        const currentView = renderEngine.getCurrentView();
        const sortState = currentView ? renderEngine.restoreSortState(currentView) : { key: '', direction: 1 };

        headers.forEach(headerItem => {
            const th = document.createElement('th');
            th.textContent = headerItem.label;
            th.style.cssText = 'padding:var(--ios-table-cell-padding); font-size:var(--ios-table-header-font-size); font-weight:600; color:var(--ios-text-secondary); text-align:center; vertical-align:middle; border-right:var(--ios-border-light);';

            if (colWidths && colWidths[headerItem.key]) {
                th.style.width = colWidths[headerItem.key];
            }

            if (sortableKeys && sortableKeys.includes(headerItem.key) && sortHandler) {
                th.className = 'sortable';
                th.setAttribute('data-sort-key', headerItem.key);
                th.style.position = 'relative';
                th.style.paddingRight = '28px';
                th.style.cursor = 'pointer';

                const sortButton = document.createElement('div');
                sortButton.className = 'ios-sort-button';
                sortButton.style.cssText = 'position:absolute; right:8px; top:50%; transform:translateY(-50%); display:flex; align-items:center; justify-content:center;';

                const sortIcon = document.createElement('div');
                sortIcon.className = 'ios-sort-indicator';
                sortIcon.style.cssText = 'width:8px; height:8px; transition:all var(--ios-anim-fast) ease; opacity:0.4;';

                if (sortState.key === headerItem.key) {
                    sortIcon.classList.add('active');
                    sortIcon.classList.add(sortState.direction === 1 ? 'asc' : 'desc');
                    sortIcon.style.opacity = '1';

                    if (sortState.direction === 1) {
                        sortIcon.innerHTML = `<svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="var(--ios-blue)" stroke-width="1.5">
                            <path d="M4 1v6M4 1L2 3M4 1L6 3"/>
                        </svg>`;
                    } else {
                        sortIcon.innerHTML = `<svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="var(--ios-blue)" stroke-width="1.5">
                            <path d="M4 7V1M4 7L2 5M4 7L6 5"/>
                        </svg>`;
                    }
                } else {
                    sortIcon.innerHTML = `<svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="var(--ios-gray)" stroke-width="1">
                        <path d="M4 1v6M1 4h6"/>
                    </svg>`;
                }

                th.addEventListener('click', () => {
                    sortHandler(headerItem.key);

                    th.closest('tr').querySelectorAll('.ios-sort-indicator').forEach(icon => {
                        icon.classList.remove('active', 'asc', 'desc');
                        icon.style.opacity = '0.4';
                        icon.innerHTML = `<svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="var(--ios-gray)" stroke-width="1">
                            <path d="M4 1v6M1 4h6"/>
                        </svg>`;
                    });

                    setTimeout(() => {
                        sortIcon.classList.add('ios-sort-animation');
                        setTimeout(() => sortIcon.classList.remove('ios-sort-animation'), 300);
                    }, 0);
                });

                sortButton.appendChild(sortIcon);
                th.appendChild(sortButton);
            }

            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        tableElement.appendChild(thead);

        const tbody = document.createElement('tbody');

        if (!items || items.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = headers.length;
            emptyCell.className = 'ios-empty-state';
            emptyCell.style.cssText = 'padding:var(--ios-empty-padding); text-align:center; color:var(--ios-gray);';

            const emptyStateDiv = document.createElement('div');
            emptyStateDiv.className = 'ios-empty-state-container';
            emptyStateDiv.innerHTML = `
                <div class="ios-empty-state-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--ios-gray)" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <div class="ios-empty-state-title">No Items Found</div>
                <div class="ios-empty-state-message">Try adjusting your search or filters</div>`;

            emptyCell.appendChild(emptyStateDiv);
            emptyRow.appendChild(emptyCell);
            tbody.appendChild(emptyRow);
        } else {
            const fragment = document.createDocumentFragment();
            const isSearchActive = currentView === 'MEMBER' && filterOP.getFilters().memberMerchantSearch;

            items.forEach((item, idx) => {
                const row = document.createElement('tr');
                row.style.cssText = 'transition:background-color var(--ios-anim-fast) ease;';

                if (idx % 2 === 1) {
                    row.style.backgroundColor = 'var(--ios-secondary-bg)';
                }

                if (isSearchActive) {
                    const searchTerm = filterOP.getFilters().memberMerchantSearch.trim().toLowerCase();
                    if (searchTerm) {
                        const accountMatches = (item.account_token || '').toLowerCase().includes(searchTerm) ||
                            (item.embossed_name || '').toLowerCase().includes(searchTerm) ||
                            (item.description || '').toLowerCase().includes(searchTerm);

                        const offers_current = glbVer.get('offers_current');
                        const matchingEnrolledOffers = offers_current?.filter(offer => {
                            return (offer.name || '').toLowerCase().includes(searchTerm) &&
                                Array.isArray(offer.enrolledCards) &&
                                offer.enrolledCards.includes(item.account_token);
                        });

                        const matchingEligibleOffers = offers_current?.filter(offer => {
                            return (offer.name || '').toLowerCase().includes(searchTerm) &&
                                Array.isArray(offer.eligibleCards) &&
                                offer.eligibleCards.includes(item.account_token);
                        });

                        const shouldHighlight = accountMatches ||
                            matchingEnrolledOffers?.length > 0 ||
                            matchingEligibleOffers?.length > 0;

                        if (shouldHighlight) {
                            row.classList.add('ios-highlight-row');
                            row.dataset.highlighted = 'true';

                            if (matchingEnrolledOffers?.length > 0) {
                                row.style.backgroundColor = 'rgba(52, 199, 89, 0.15)';
                                row.style.borderLeft = '3px solid rgba(52, 199, 89, 0.6)';
                                row.dataset.matchedEnrolledOffers = matchingEnrolledOffers.length;
                            } else if (matchingEligibleOffers?.length > 0) {
                                row.style.backgroundColor = 'rgba(0, 122, 255, 0.15)';
                                row.style.borderLeft = '3px solid rgba(0, 122, 255, 0.6)';
                                row.dataset.matchedEligibleOffers = matchingEligibleOffers.length;
                            } else {
                                row.style.backgroundColor = 'var(--ios-highlight-bg)';
                                row.style.borderLeft = '3px solid var(--ios-highlight-border)';
                            }
                        }
                    }
                }

                headers.forEach(headerItem => {
                    const td = document.createElement('td');
                    td.style.cssText = 'padding:var(--ios-table-cell-padding); border-bottom:var(--ios-border-light); vertical-align:middle; text-align:center;';

                    if (colWidths && colWidths[headerItem.key]) {
                        td.style.width = colWidths[headerItem.key];
                        td.style.maxWidth = colWidths[headerItem.key];
                    }

                    try {
                        const content = cellRenderer(item, headerItem);

                        if (content instanceof Node) {
                            td.appendChild(content);
                        } else if (typeof content === 'string') {
                            if (/^\$?\d+(\.\d{2})?$/.test(content)) {
                                const span = document.createElement('span');
                                span.className = 'ios-currency';
                                span.style.cssText = 'font-variant-numeric:tabular-nums; font-weight:500; text-align:center;';
                                span.textContent = content;
                                td.appendChild(span);
                            } else if (['active', 'inactive', 'pending', 'completed', 'failed', 'success', 'canceled'].includes(content.toLowerCase())) {
                                const statusSpan = document.createElement('span');
                                statusSpan.className = `ios-status ${content.toLowerCase()}`;
                                statusSpan.textContent = content;

                                let statusStyle = '';
                                if (['active', 'success'].includes(content.toLowerCase())) {
                                    statusStyle = 'background-color:var(--ios-status-active-bg); color:var(--ios-green); border:1px solid rgba(52, 199, 89, 0.25);';
                                } else if (content.toLowerCase() === 'pending') {
                                    statusStyle = 'background-color:var(--ios-status-pending-bg); color:var(--ios-orange); border:1px solid rgba(255, 149, 0, 0.25);';
                                } else {
                                    statusStyle = 'background-color:var(--ios-status-inactive-bg); color:var(--ios-red); border:1px solid rgba(255, 59, 48, 0.25);';
                                }

                                statusSpan.style.cssText = `display:inline-flex; align-items:center; justify-content:center; padding:4px 10px; border-radius:12px; font-size:12px; font-weight:500; ${statusStyle}`;
                                td.appendChild(statusSpan);
                            } else {
                                td.textContent = content || '';
                            }
                        } else {
                            td.textContent = content || '';
                        }
                    } catch (error) {
                        console.error('Error rendering cell:', error);
                        td.textContent = 'Error';
                    }

                    row.appendChild(td);
                });

                fragment.appendChild(row);
            });

            tbody.appendChild(fragment);
        }

        tableElement.appendChild(tbody);
        return tableElement;
    }


    function ui_createMain() {
        const uiElements = {
            container: null,
            content: null,
            viewBtns: null,
            toggleBtn: null,
            btnRefresh: null,
            refreshStatusEl: null,
            btnMEMBER: null,
            btnOFFER: null,
            btnBENEFIT: null
        };

        // Create the main container with better positioning
        uiElements.container = ui_createElement('div', {
            props: { id: 'amaxoffer-container' },
            className: 'amaxoffer-container amaxoffer-minimized',
            styleString: `
                left: 25px;
                top: 25px;
                opacity: 0;
                transform: scale(0.95);
                transition: opacity 0.3s ease, transform 0.3s ease, width 0.3s ease, height 0.3s ease;
            `
        });

        // Title element
        const title = ui_createElement('span', {
            text: 'AMaxOffer',
            className: 'amaxoffer-title'
        });

        // Create navigation buttons with improved active states
        uiElements.btnMEMBER = ui_createElement('button', {
            className: 'amaxoffer-nav-button',
            props: {
                'data-view': 'MEMBER',
                innerHTML: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right:6px; opacity:0.8;"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>Members'
            },
            styleString: 'padding:8px 16px; border:none; border-radius:8px; background:transparent; color:#333; transition:all 0.2s ease; display:flex; align-items:center; justify-content:center; font-weight:500;',
            events: {
                click: () => {
                    activateButton(uiElements.btnMEMBER, 'MEMBER');
                    renderEngine.changeView('MEMBER');
                }
            }
        });

        uiElements.btnOFFER = ui_createElement('button', {
            className: 'amaxoffer-nav-button',
            props: {
                'data-view': 'OFFER',
                innerHTML: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right:6px; opacity:0.8;"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>Offers'
            },
            styleString: 'padding:8px 16px; border:none; border-radius:8px; background:transparent; color:#333; transition:all 0.2s ease; display:flex; align-items:center; justify-content:center; font-weight:500;',
            events: {
                click: () => {
                    activateButton(uiElements.btnOFFER, 'OFFER');
                    renderEngine.changeView('OFFER');
                }
            }
        });

        uiElements.btnBENEFIT = ui_createElement('button', {
            className: 'amaxoffer-nav-button',
            props: {
                'data-view': 'BENEFIT',
                innerHTML: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right:6px; opacity:0.8;"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 12 7.4l3.38 4.6L17 10.83 14.92 8H20v6z"/></svg>Benefits'
            },
            styleString: 'padding:8px 16px; border:none; border-radius:8px; background:transparent; color:#333; transition:all 0.2s ease; display:flex; align-items:center; justify-content:center; font-weight:500;',
            events: {
                click: () => {
                    activateButton(uiElements.btnBENEFIT, 'BENEFIT');
                    renderEngine.changeView('BENEFIT');
                }
            }
        });


        function activateButton(button, viewName) {

            const allButtons = [
                uiElements.btnMEMBER,
                uiElements.btnOFFER,
                uiElements.btnBENEFIT
            ].filter(btn => btn);

            allButtons.forEach(btn => {
                if (btn) {
                    btn.classList.remove('active');
                    btn.style.backgroundColor = 'transparent';
                    btn.style.color = '#333';
                    btn.style.fontWeight = '500';
                    btn.style.boxShadow = 'none';
                    btn.style.transition = 'all 0.3s ease';
                }
            });

            setTimeout(() => {
                button.classList.add('active');
                button.style.backgroundColor = 'var(--ios-blue)';
                button.style.color = 'white';
                button.style.fontWeight = '600';
                button.style.boxShadow = '0 2px 8px rgba(0, 122, 255, 0.3)';
            }, 50);

            if (viewName && typeof viewName === 'string') {
                document.title = `AMaxOffer - ${viewName.charAt(0).toUpperCase() + viewName.slice(1).toLowerCase()}`;
            }
        }

        // Navigation container with centered positioning
        uiElements.viewBtns = ui_createElement('div', {
            className: 'amaxoffer-nav',
            children: [uiElements.btnMEMBER, uiElements.btnOFFER, uiElements.btnBENEFIT],
            styleString: 'display:none; position:absolute; left:50%; transform:translateX(-50%); z-index:1; background:#f8f9fa; border-radius:8px; padding:4px;'
        });

        // Create refresh button with SVG icon
        const refreshIcon = `<svg style="width:16px;height:16px;fill:white;margin-right:4px" viewBox="0 0 24 24">
            <path d="M17.65 6.35A7.95 7.95 0 0 0 12 4C7.58 4 4 7.58 4 12s3.58 8 8 8a7.94 7.94 0 0 0 6.65-3.65l-1.42-1.42A5.973 5.973 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
        </svg>`;

        uiElements.btnRefresh = ui_createBtn({
            label: 'Refresh',
            icon: refreshIcon,
            type: 'primary',
            onClick: async () => {
                try {
                    uiElements.refreshStatusEl.textContent = "Refreshing accounts...";
                    await API.fetchAccounts();
                    uiElements.refreshStatusEl.textContent = "Refreshing offers...";
                    await API.refreshOffersList();
                    uiElements.refreshStatusEl.textContent = "Refreshing balances...";
                    await API.fetchAllBalances();
                    uiElements.refreshStatusEl.textContent = "Refreshing benefits...";
                    await API.fetchAllBenefits();

                    const lastUpdate = new Date().toLocaleString();
                    glbVer.set('lastUpdate', lastUpdate);
                    storageOP.saveItem('lastUpdate');

                    uiElements.refreshStatusEl.textContent = "Refresh complete.";
                    setTimeout(() => {
                        uiElements.refreshStatusEl.textContent = `Last updated: ${lastUpdate.toLocaleString()}`;
                    }, 3000);;

                    await renderEngine.renderCurrentView();
                } catch (e) {
                    console.error('Error refreshing data:', e);
                    uiElements.refreshStatusEl.textContent = "Error refreshing data.";
                }
            },
            customStyle: 'display:none; align-items:center; justify-content:center;'
        });

        // Create status element
        uiElements.refreshStatusEl = ui_createElement('div', {
            className: 'refresh-status',
            props: { id: 'refresh-status' },
            styleString: 'font-size:12px; color:#8e8e93; margin-right:8px; display:none;'
        });

        // Toggle button with SVG icon
        uiElements.toggleBtn = ui_createElement('button', {
            className: 'amaxoffer-toggle-btn',
            props: {
                innerHTML: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>'
            },
            events: {
                click: () => ui_toggleMinimize(uiElements.container, uiElements),
                mouseenter: e => {
                    e.target.style.backgroundColor = '#f0f0f0';
                    e.target.style.borderColor = '#aaa';
                },
                mouseleave: e => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.borderColor = '#ccc';
                }
            }
        });

        // Right-side controls
        const rightControls = ui_createElement('div', {
            styleString: 'display:flex; align-items:center; justify-content:flex-end; margin-left:auto;',
            children: [uiElements.refreshStatusEl, uiElements.btnRefresh, uiElements.toggleBtn]
        });

        // Header with improved position styling
        const header = ui_createElement('div', {
            props: { id: 'amaxoffer-header' },
            className: 'amaxoffer-header',
            styleString: 'position:relative;',
            children: [title, uiElements.viewBtns, rightControls]
        });

        // Main content area
        uiElements.content = ui_createElement('div', {
            props: { id: 'amaxoffer-content' },
            className: 'amaxoffer-content',
            text: 'Loading...',
            styleString: 'display:none;'
        });

        uiElements.container.append(header, uiElements.content);
        document.body.appendChild(uiElements.container);

        // Add window resize handler
        window.addEventListener('resize', () => ui_handleWindowResize(uiElements.container));

        // Make the header draggable
        ui_makeDraggable(header, uiElements.container);

        // Fade in the container
        setTimeout(() => {
            uiElements.container.style.opacity = '1';
            uiElements.container.style.transform = 'scale(1)';
        }, 50);

        // Return the UI elements and the activation function
        return {
            ...uiElements,
            activateButton
        };
    }

    // Make an element draggable by tracking mouse movement
    function ui_makeDraggable(handle, container) {
        let shiftX = 0, shiftY = 0;
        let latestX = 0, latestY = 0;
        let animationFrameId = null;
        let isDragging = false;

        const updatePosition = () => {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            let newLeft = latestX - shiftX;
            let newTop = latestY - shiftY;
            const rect = container.getBoundingClientRect();
            const isExpanded = container.classList.contains('amaxoffer-expanded');

            if (isExpanded) {
                newLeft = Math.max(5, Math.min(viewportWidth - rect.width - 5, newLeft));
                newTop = Math.max(5, Math.min(viewportHeight - rect.height - 5, newTop));
            }

            container.style.transition = 'none';
            container.style.left = `${newLeft}px`;
            container.style.top = `${newTop}px`;
            animationFrameId = null;
        };

        const onMouseMove = e => {
            e.preventDefault();
            latestX = e.clientX;
            latestY = e.clientY;
            isDragging = true;

            if (!animationFrameId) {
                animationFrameId = requestAnimationFrame(updatePosition);
            }
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }

            setTimeout(() => {
                container.style.transition = 'all 0.3s ease';
                isDragging = false;
            }, 0);

            handle.style.cursor = 'grab';
            document.body.style.cursor = 'default';

            container.setAttribute('data-was-dragged', 'true');
        };

        handle.addEventListener('mousedown', e => {
            e.preventDefault();
            const rect = container.getBoundingClientRect();
            shiftX = e.clientX - rect.left;
            shiftY = e.clientY - rect.top;
            handle.style.cursor = 'grabbing';
            document.body.style.cursor = 'grabbing';
            isDragging = false;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    // Handle window resize
    function ui_handleWindowResize(container) {
        // Only adjust if expanded
        if (!container.classList.contains('amaxoffer-expanded')) return;

        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Get current position
        const rect = container.getBoundingClientRect();

        // Ensure container stays within viewport
        let newLeft = parseFloat(container.style.left);
        let newTop = parseFloat(container.style.top);

        if (rect.right > viewportWidth) {
            newLeft = Math.max(5, viewportWidth - rect.width - 5);
        }

        if (rect.bottom > viewportHeight) {
            newTop = Math.max(5, viewportHeight - rect.height - 5);
        }

        // Apply new position if needed
        if (newLeft !== parseFloat(container.style.left)) {
            container.style.left = `${newLeft}px`;
        }

        if (newTop !== parseFloat(container.style.top)) {
            container.style.top = `${newTop}px`;
        }
    }


    function ui_toggleMinimize(container, uiElements) {
        const isMinimized = container.classList.contains('amaxoffer-minimized');

        container.style.overflow = 'hidden';

        if (isMinimized) {
            container.classList.remove('amaxoffer-minimized');
            container.classList.add('amaxoffer-expanded');

            container.setAttribute('aria-expanded', 'true');

            requestAnimationFrame(() => {
                uiElements.toggleBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>';
                uiElements.toggleBtn.setAttribute('aria-label', 'Minimize');

                uiElements.content.style.display = 'block';
                uiElements.viewBtns.style.display = 'flex';
                uiElements.btnRefresh.style.display = 'flex';
                uiElements.refreshStatusEl.style.display = 'block';

                const rect = container.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                if (rect.right > viewportWidth || rect.bottom > viewportHeight) {
                    container.style.left = `${Math.max(5, (viewportWidth - rect.width) / 2)}px`;
                    container.style.top = `${Math.max(5, (viewportHeight - rect.height) / 2)}px`;
                }

                container.style.overflow = '';
                const currentView = renderEngine.getCurrentView();

                if (!currentView || uiElements.content.innerHTML === '' || uiElements.content.textContent === 'Loading...') {
                    renderEngine.renderCurrentView(true);
                }
            });
        } else {
            uiElements.toggleBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>';
            uiElements.toggleBtn.setAttribute('aria-label', 'Expand');

            container.classList.add('amaxoffer-minimized');
            container.classList.remove('amaxoffer-expanded');
            container.setAttribute('aria-expanded', 'false');

            uiElements.content.style.display = 'none';
            uiElements.viewBtns.style.display = 'none';
            uiElements.btnRefresh.style.display = 'none';
            uiElements.refreshStatusEl.style.display = 'none';

            setTimeout(() => {
                container.style.overflow = '';
            }, 200);
        }
    }

    function ui_showNotification(message, type = 'info', duration = 3000) {
        // Remove any existing notifications with the same message
        document.querySelectorAll('.amaxoffer-notification').forEach(notif => {
            if (notif.textContent === message) notif.remove();
        });

        const colors = {
            error: 'var(--ios-red)',
            success: 'var(--ios-green)',
            info: 'var(--ios-blue)',
            warning: 'var(--ios-orange)'
        };

        const icons = {
            error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
            info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
            warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
        };

        const notifDiv = ui_createElement('div', {
            className: `amaxoffer-notification ${type}`,
            props: {
                innerHTML: `${icons[type] || ''}<span>${message}</span>`,
                role: 'alert',
                'aria-live': 'polite'
            },
            styleString: `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 18px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                color: white;
                font-size: 14px;
                z-index: 10002;
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.3s ease, transform 0.3s ease;
                background-color: ${colors[type] || colors.info};
                display: flex;
                align-items: center;
                gap: 8px;
                max-width: 320px;
            `
        });

        document.body.appendChild(notifDiv);

        requestAnimationFrame(() => {
            notifDiv.style.opacity = '1';
            notifDiv.style.transform = 'translateY(0)';
        });

        // Add close button
        const closeBtn = ui_createElement('button', {
            props: {
                innerHTML: '×',
                'aria-label': 'Dismiss notification',
                type: 'button'
            },
            styleString: `
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                margin-left: 12px;
                opacity: 0.7;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            `,
            events: {
                click: () => {
                    notifDiv.style.opacity = '0';
                    notifDiv.style.transform = 'translateY(20px)';
                    setTimeout(() => notifDiv.remove(), 300);
                },
                mouseenter: e => { e.target.style.opacity = '1'; },
                mouseleave: e => { e.target.style.opacity = '0.7'; }
            }
        });

        notifDiv.appendChild(closeBtn);

        setTimeout(() => {
            if (document.body.contains(notifDiv)) {
                notifDiv.style.opacity = '0';
                notifDiv.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    if (document.body.contains(notifDiv)) {
                        notifDiv.remove();
                    }
                }, 300);
            }
        }, duration);

        return notifDiv;
    }

    function ui_returnLogo(logoUrl, altText) {
        if (logoUrl && logoUrl !== "N/A") {
            return ui_createElement('div', {
                styleString: 'display:flex; justify-content:center; align-items:center; height:36px;',
                children: [
                    ui_createElement('img', {
                        props: {
                            src: logoUrl,
                            alt: altText || "Logo",
                            loading: "lazy",
                            width: "36",
                            height: "36"
                        },
                        styleString: 'max-width:36px; max-height:36px; border-radius:4px; transition:transform 0.2s ease;',
                        events: {
                            error: e => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NjYyI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4eiIvPjwvc3ZnPg==';
                            },
                            mouseenter: e => e.target.style.transform = 'scale(1.15)',
                            mouseleave: e => e.target.style.transform = 'scale(1)'
                        }
                    })
                ]
            });
        }

        return ui_createElement('div', {
            styleString: 'display:flex; justify-content:center; align-items:center; height:36px;',
            children: [
                ui_createElement('div', {
                    props: { innerHTML: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#ccc"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>' },
                    styleString: 'width:32px; height:32px; display:flex; align-items:center; justify-content:center; background:#f5f5f5; border-radius:4px;'
                })
            ]
        });
    }


    // =========================================================================
    // Members Page Rendering Functions
    // =========================================================================

    function member_renderPage() {
        const containerDiv = ui_createElement('div', {
            styleString: UI_STYLES.pageContainer
        });

        containerDiv.appendChild(member_renderStatsBar());
        containerDiv.appendChild(member_renderFilterBar());

        const tableWrapper = ui_createElement('div', {
            props: { id: 'members-table-container' },
            styleString: 'overflow-x:auto;'
        });
        tableWrapper.appendChild(member_renderTable());

        containerDiv.appendChild(tableWrapper);
        return containerDiv;
    }

    function member_renderStatsBar() {
        const statsBar = document.createElement('div');
        statsBar.style.cssText = UI_STYLES.cardContainer + ' display:flex; flex-wrap:wrap; gap:16px; justify-content:space-between;';

        const stats = statsOP.getMembersStats();

        function createStatItem(label, value, icon, color, filterAction) {
            const statItem = document.createElement('div');
            statItem.style.cssText = `display:flex; align-items:center; gap:10px; padding:10px 16px; background-color:rgba(${color}, 0.1); border-radius:10px; border:1px solid rgba(${color}, 0.2); min-width:150px; transition:all 0.2s ease; ${filterAction ? 'cursor:pointer;' : ''}`;

            if (filterAction) {
                statItem.addEventListener('mouseenter', () => {
                    statItem.style.transform = 'translateY(-2px)';
                    statItem.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)';
                });
                statItem.addEventListener('mouseleave', () => {
                    statItem.style.transform = 'translateY(0)';
                    statItem.style.boxShadow = 'none';
                });
                statItem.addEventListener('click', () => {
                    filterAction();

                    const tableContainer = document.getElementById('members-table-container');
                    if (tableContainer) {
                        tableContainer.innerHTML = "";
                        tableContainer.appendChild(member_renderTable());
                    }
                });
            }

            const iconElement = document.createElement('div');
            iconElement.innerHTML = icon;
            iconElement.style.color = `rgb(${color})`;

            const textContainer = document.createElement('div');
            textContainer.style.cssText = 'display:flex; flex-direction:column;';

            const valueElement = document.createElement('div');
            valueElement.textContent = value;
            valueElement.style.cssText = `font-size:18px; font-weight:600; color:rgb(${color});`;

            const labelElement = document.createElement('div');
            labelElement.textContent = label;
            labelElement.style.cssText = 'font-size:12px; color:var(--ios-text-secondary);';

            textContainer.appendChild(valueElement);
            textContainer.appendChild(labelElement);
            statItem.appendChild(iconElement);
            statItem.appendChild(textContainer);

            return statItem;
        }

        const ICONS = {
            CARD: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" fill="currentColor"/></svg>`,
            ACTIVE: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor"/></svg>`,
            BASIC: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" fill="currentColor"/></svg>`,
            balance: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/></svg>`,
            pendingBalance: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-1-14v7l5.2 3.2.8-1.3-4.5-2.7V6H11z" fill="currentColor"/></svg>`,
            REMAIN: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M16 6v8h3v4h2V6c0-1.1-.9-2-2-2H7L7 6h9zM3 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H3v10zm2-8h6v8H5v-8z" fill="currentColor"/></svg>`
        };

        statsBar.appendChild(createStatItem('Total Cards', stats.totalCards, ICONS.CARD, '52, 152, 219', () => {
            filterOP.setFilters({
                memberStatus: 'all',
                memberCardtype: 'all'
            });
            member_applyFilters();
        }));

        statsBar.appendChild(createStatItem('Active Cards', stats.activeCards, ICONS.ACTIVE, '46, 204, 113', () => {
            filterOP.setFilters({
                memberStatus: 'Active',
                memberCardtype: 'all'
            });
            member_applyFilters();
        }));

        statsBar.appendChild(createStatItem('Basic Cards', stats.basicCards, ICONS.BASIC, '155, 89, 182', () => {
            filterOP.setFilters({
                memberStatus: 'all',
                memberCardtype: 'BASIC'
            });
            member_applyFilters();
        }));

        statsBar.appendChild(createStatItem('Total Balance', `$${stats.totalBalance.toFixed(2)}`, ICONS.balance, '255, 149, 0'));
        statsBar.appendChild(createStatItem('Total Pending', `$${stats.totalPending.toFixed(2)}`, ICONS.pendingBalance, '0, 122, 255'));
        statsBar.appendChild(createStatItem('Remain Statement', `$${stats.totalRemaining.toFixed(2)}`, ICONS.REMAIN, '255, 45, 85'));

        return statsBar;
    }

    function member_applyFilters() {
        // Update UI elements if they exist
        const statusFilter = document.getElementById('status-filter');
        const typeFilter = document.getElementById('type-filter');

        if (statusFilter) statusFilter.value = filterOP.getFilters().memberStatus;
        if (typeFilter) typeFilter.value = filterOP.getFilters().memberCardtype;

        renderEngine.renderCurrentView();
    }

    function member_renderFilterBar() {
        const filtersCard = document.createElement('div');
        filtersCard.style.cssText = UI_STYLES.containers.card + ' margin-bottom:8px;';

        const searchContainer = document.createElement('div');
        searchContainer.style.cssText = 'display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;';

        // Create reactive search with direct update callback
        const searchFilter = ui_createReactiveFilter(searchContainer, {
            searchPlaceholder: 'Search members or offers...',
            initialValue: filterOP.getFilters().memberMerchantSearch || '',
            onFilterChange: (value) => {
                // Force immediate table update with highlighting
                const tableContainer = document.getElementById('members-table-container');
                if (tableContainer) {
                    tableContainer.innerHTML = "";
                    tableContainer.appendChild(member_renderTable());
                }
            }
        });

        // Add reset button
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset Filters';
        resetButton.style.cssText = 'padding:10px 16px; border:none; border-radius:8px; background:rgba(0,0,0,0.05); cursor:pointer;';
        resetButton.addEventListener('click', () => {
            searchFilter.setValue('');
            filterOP.setFilters({
                memberMerchantSearch: '',
                memberStatus: 'Active',
                memberCardtype: 'all'
            });
            renderEngine.renderCurrentView(true);
        });

        searchContainer.appendChild(resetButton);
        filtersCard.appendChild(searchContainer);

        return filtersCard;
    }

    function member_renderTable() {
        const headers = [
            { label: "Index", key: "cardIndex" },
            { label: "Logo", key: "small_card_art" },
            { label: "Ending", key: "cardEnding" },
            { label: "User Name", key: "embossed_name" },
            { label: "Type", key: "relationship" },
            { label: "Opened", key: "account_setup_date" },
            { label: "Status", key: "account_status" },
            { label: "Balance", key: "StatementBalance" },
            { label: "Pending", key: "pending" },
            { label: "Remaining", key: "remainingStaBal" },
            { label: "Eligible", key: "eligibleOffers" },
            { label: "Enrolled", key: "enrolledOffers" },
            { label: "Priority", key: "priority" },
            { label: "Exclude", key: "exclude" }
        ];

        const colWidths = {
            cardIndex: "50px", small_card_art: "55px", cardEnding: "55px",
            embossed_name: "160px", relationship: "90px", account_setup_date: "100px",
            account_status: "90px", StatementBalance: "100px", pending: "100px",
            remainingStaBal: "110px", eligibleOffers: "90px", enrolledOffers: "90px",
            priority: "80px", exclude: "80px"
        };

        // Apply filters
        let filteredAccounts = filterOP.getFilteredMembers();

        // Apply sorting if needed
        const sortState = renderEngine.restoreSortState('MEMBER');
        if (sortState && sortState.key) {
            const direction = sortState.direction;
            const key = sortState.key;
            const numericColumns = ['StatementBalance', 'pending', 'remainingStaBal', 'days_past_due',
                'eligibleOffers', 'enrolledOffers'];

            filteredAccounts = [...filteredAccounts].sort((a, b) => {
                if (key === 'cardIndex') {
                    const [aMain, aSub] = util_parseCardIndex(a.cardIndex);
                    const [bMain, bSub] = util_parseCardIndex(b.cardIndex);
                    if (aMain === bMain) {
                        return direction * (aSub - bSub);
                    }
                    return direction * (aMain - bMain);
                }
                else if (numericColumns.includes(key)) {
                    const numA = util_parseNumber(a[key]);
                    const numB = util_parseNumber(b[key]);
                    return direction * (numA - numB);
                }
                else if (key === 'account_setup_date') {
                    const dateA = a[key] ? new Date(a[key]) : new Date(0);
                    const dateB = b[key] ? new Date(b[key]) : new Date(0);
                    return direction * (dateA - dateB);
                }
                else {
                    const valA = a[key] || "";
                    const valB = b[key] || "";
                    return direction * valA.toString().localeCompare(valB.toString());
                }
            });
        }

        // Cell renderer with organized handlers for each column type
        const cellRenderer = (item, headerItem) => {
            const key = headerItem.key;

            if (key === 'small_card_art') {
                return ui_returnLogo(item.small_card_art, item.description || "Card Logo");
            }

            // Cell rendering methods organized by column type
            const renderers = {
                small_card_art: () => {
                    if (item.small_card_art && item.small_card_art !== 'N/A') {
                        return ui_createElement('div', {
                            styleString: 'display:flex; justify-content:center; align-items:center; height:40px;',
                            children: [
                                ui_createElement('img', {
                                    props: { src: item.small_card_art, alt: "Card Logo" },
                                    styleString: 'max-width:40px; max-height:40px; border-radius:4px; transition:transform 0.2s ease;',
                                    events: {
                                        mouseenter: e => e.target.style.transform = 'scale(1.15)',
                                        mouseleave: e => e.target.style.transform = 'scale(1)'
                                    }
                                })
                            ]
                        });
                    }
                    return 'N/A';
                },

                cardIndex: () => {
                    const [mainIndex, subIndex] = util_parseCardIndex(item.cardIndex);
                    return ui_createElement('span', {
                        styleString: UI_STYLES.tableCells.index,
                        props: {
                            innerHTML: subIndex ?
                                `<strong>${mainIndex}</strong>-${subIndex}` :
                                `<strong>${mainIndex}</strong>`
                        }
                    });
                },

                cardEnding: () => {
                    return ui_createElement('div', {
                        text: item[key],
                        styleString: UI_STYLES.tableCells.card
                    });
                },

                embossed_name: () => {
                    return ui_createElement('div', {
                        text: item[key],
                        styleString: UI_STYLES.tableCells.name,
                        props: { title: item[key] }
                    });
                },

                account_setup_date: () => {
                    return (item[key] && item[key] !== 'N/A') ?
                        util_formatDate(item[key]) : 'N/A';
                },

                eligibleOffers: () => createOfferBadge(item[key], 'eligible', item.account_token),
                enrolledOffers: () => createOfferBadge(item[key], 'enrolled', item.account_token),

                relationship: () => {
                    if (item.relationship === "SUPP") {
                        const parentCardNum = member_getParentCardNumber(item);
                        return ui_createElement('div', {
                            styleString: 'display:flex; flex-direction:column; align-items:center; gap:2px;',
                            children: [
                                ui_createElement('span', {
                                    text: 'SUPP',
                                    styleString: 'font-size:12px; color:var(--ios-blue); font-weight:600;'
                                }),
                                ui_createElement('span', {
                                    text: `→${parentCardNum}`,
                                    styleString: 'font-size:11px; color:var(--ios-gray);'
                                })
                            ]
                        });
                    }

                    return ui_createElement('span', {
                        text: 'BASIC',
                        styleString: 'font-size:12px; font-weight:600; color:var(--ios-green);'
                    });
                },

                account_status: () => {
                    const status = item[key].toLowerCase();
                    const statusStyle = UI_STYLES.status[status] || UI_STYLES.status.pending;

                    return ui_createElement('span', {
                        text: item[key],
                        styleString: `
                        display:inline-block; padding:4px 10px; border-radius:12px;
                        font-size:12px; font-weight:600; text-transform:capitalize;
                        background-color:${statusStyle.bgColor};
                        color:${statusStyle.color};
                        border:1px solid ${statusStyle.borderColor};
                    `
                    });
                },

                pending: () => createFinancialValue(item, 'debits_credits_payments_total_amount'),
                remainingStaBal: () => createFinancialValue(item, 'remaining_statement_balance_amount'),
                StatementBalance: () => createFinancialValue(item, 'statement_balance_amount'),

                priority: () => createToggleSwitch(item, 'priority'),
                exclude: () => createToggleSwitch(item, 'exclude')
            };

            // Use the appropriate handler or default
            return renderers[key] ? renderers[key]() : (util_cleanValue(item[key]) || '');
        };

        // Helper function for offer badges
        function createOfferBadge(count, type, accountToken) {
            const parsedCount = parseInt(count || 0);
            const container = ui_createElement('div', {
                styleString: 'height:32px; display:flex; align-items:center; justify-content:center;'
            });

            if (parsedCount > 0) {
                const isEligible = type === 'eligible';
                const statusStyle = isEligible ? UI_STYLES.status.inProgress : UI_STYLES.status.active;
                const icon = isEligible ?
                    `<svg width="12" height="12" viewBox="0 0 24 24" fill="${statusStyle.color}" style="margin-right:4px"><path d="M9.5 16.5v-9l7 4.5-7 4.5z"/></svg>` :
                    `<svg width="12" height="12" viewBox="0 0 24 24" fill="${statusStyle.color}" style="margin-right:4px"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>`;

                return ui_createElement('button', {
                    className: isEligible ? 'eligible-badge' : 'enrolled-badge',
                    props: { innerHTML: icon + parsedCount },
                    styleString: `
                    border-radius:16px;
                    background-color:${statusStyle.bgColor};
                    color:${statusStyle.color};
                    border:1px solid ${statusStyle.borderColor};
                    padding:5px 12px;
                    font-weight:600;
                    font-size:13px;
                    cursor:pointer;
                    transition:all 0.2s ease;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    min-width:40px;
                    margin:0 auto;
                `,
                    events: {
                        mouseover: e => {
                            e.target.style.transform = 'scale(1.05) translateY(-2px)';
                            e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                        },
                        mouseout: e => {
                            e.target.style.transform = 'scale(1) translateY(0)';
                            e.target.style.boxShadow = 'none';
                        },
                        click: e => member_popCard(accountToken, type)
                    }
                });
            }

            // Zero count indicator
            return ui_createElement('span', {
                text: '0',
                styleString: 'color:var(--ios-gray); font-size:13px; font-weight:400; opacity:0.6; text-align:center; display:block;'
            });
        }

        // Helper function for financial values
        function createFinancialValue(item, fieldName) {
            if (item.relationship === "BASIC") {
                if (item.financialData) {
                    const value = item.financialData[fieldName];
                    const sanitizedValue = util_cleanValue(value);
                    const numValue = parseFloat(sanitizedValue);

                    return ui_createElement('div', {
                        styleString: `
                        ${UI_STYLES.tableCells.money}
                        font-weight:${numValue > 0 ? '600' : '400'};
                        color:${numValue > 0 ? '#1c1c1e' : '#8e8e93'};
                        text-align:center;
                        display:block;
                        margin:0 auto;
                    `,
                        text: numValue.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 2
                        })
                    });
                }

                // Loading spinner for data being fetched
                return ui_createElement('div', {
                    className: 'loading-spinner',
                    styleString: 'width:16px; height:16px; border:2px solid rgba(0, 122, 255, 0.2); border-top:2px solid var(--ios-blue); border-radius:50%; margin:0 auto; animation:spin 1s linear infinite;'
                });
            }
            return "";
        }

        function createToggleSwitch(account, type) {
            const isChecked = type === 'priority'
                ? glbVer.get('priorityCards').includes(account.account_token)
                : glbVer.get('excludedCards').includes(account.account_token);

            const color = type === 'priority' ? 'var(--ios-blue)' : 'var(--ios-red)';

            return ui_createElement('div', {
                styleString: 'display:flex; justify-content:center; align-items:center;',
                children: [
                    ui_createElement('div', {
                        styleString: `
                        display:inline-block; position:relative; width:36px; height:22px;
                        border-radius:11px; cursor:pointer; transition:background-color 0.3s ease;
                        box-shadow:0 1px 3px rgba(0,0,0,0.1) inset;
                        background-color:${isChecked ? color : '#e9e9ea'};
                        margin:0 auto;
                    `,
                        children: [
                            ui_createElement('div', {
                                styleString: `
                                position:absolute; width:18px; height:18px; border-radius:9px;
                                background-color:#ffffff; box-shadow:0 1px 3px rgba(0, 0, 0, 0.15);
                                top:2px; left:${isChecked ? '16px' : '2px'}; transition:left 0.3s ease;
                            `
                            })
                        ],
                        props: {
                            title: type === 'priority' ? 'Priority Card (Enroll First)' : 'Exclude Card (Skip Enrollment)'
                        },
                        events: {
                            click: e => toggleCardPreference(e, account, type)
                        }
                    })
                ]
            });
        }

        function toggleCardPreference(e, account, type) {
            const newState = !isCardInPreferenceList(account.account_token, type);
            const toggle = e.currentTarget;
            const knob = toggle.firstChild;
            const color = type === 'priority' ? 'var(--ios-blue)' : 'var(--ios-red)';

            // Update visual state
            knob.style.left = newState ? '16px' : '2px';
            toggle.style.backgroundColor = newState ? color : '#e9e9ea';

            // Update data state with proper error handling
            try {
                if (type === 'priority') {
                    updatePriorityCards(account.account_token, newState);
                } else {
                    updateExcludedCards(account.account_token, newState);
                }

                // Save changes to storage
                storageOP.saveDataChanges('preferences');

                // Add visual feedback
                toggle.classList.add('ios-sort-animation');
                setTimeout(() => toggle.classList.remove('ios-sort-animation'), 300);
            } catch (error) {
                console.error(`Error updating ${type} card status:`, error);

                // Revert visual state on error
                knob.style.left = !newState ? '16px' : '2px';
                toggle.style.backgroundColor = !newState ? color : '#e9e9ea';

                // Show error notification
                ui_showNotification(`Failed to update card preference: ${error.message}`, 'error');
            }
        }

        function isCardInPreferenceList(accountToken, type) {
            const list = type === 'priority' ?
                glbVer.get('priorityCards') :
                glbVer.get('excludedCards');

            return list.includes(accountToken);
        }

        function updatePriorityCards(accountToken, addToList) {
            const priorityCards = glbVer.get('priorityCards');
            const currentIndex = priorityCards.indexOf(accountToken);

            if (addToList && currentIndex === -1) {
                priorityCards.push(accountToken);
            } else if (!addToList && currentIndex !== -1) {
                priorityCards.splice(currentIndex, 1);
            }

            glbVer.set('priorityCards', priorityCards);
        }

        function updateExcludedCards(accountToken, addToList) {
            const excludedCards = glbVer.get('excludedCards');
            const currentIndex = excludedCards.indexOf(accountToken);

            if (addToList && currentIndex === -1) {
                // Cannot be both priority and excluded
                if (isCardInPreferenceList(accountToken, 'priority')) {
                    updatePriorityCards(accountToken, false);
                }
                excludedCards.push(accountToken);
            } else if (!addToList && currentIndex !== -1) {
                excludedCards.splice(currentIndex, 1);
            }

            glbVer.set('excludedCards', excludedCards);
        }

        // Define sortable columns
        const sortableKeys = [
            "cardIndex", "cardEnding", "embossed_name", "relationship",
            "account_setup_date", "account_status", "StatementBalance", "pending",
            "remainingStaBal", "eligibleOffers", "enrolledOffers"
        ];

        // Create and return the table
        return ui_renderDataTable(headers, colWidths, filteredAccounts, cellRenderer, member_sortTable, sortableKeys);
    }

    function member_getParentCardNumber(suppAccount) {
        const parts = suppAccount.cardIndex.split('-');
        if (parts.length > 1) {
            const mainIndex = parts[0];
            // Find the basic account whose cardIndex equals mainIndex and has relationship "BASIC"
            const basicAccount = glbVer.get('accounts').find(acc => acc.cardIndex === mainIndex && acc.relationship === "BASIC");
            if (basicAccount) {
                return basicAccount.cardEnding;
            }
        }
        return "N/A";
    }

    function member_popCard(accountToken, mode = 'details') {
        const account = glbVer.get('accounts').find(acc => acc.account_token === accountToken);
        if (!account) return;

        const { overlay, content, closeBtn } = ui_createModal({
            id: 'card-offers-modal',
            width: '800px',
            title: mode === 'details' ? 'Card Offers' :
                mode === 'eligible' ? 'Eligible Offers' : 'Enrolled Offers',
            onClose: () => {
                renderEngine.renderCurrentView();
            }
        });

        // Set fixed height for modal content
        content.style.maxHeight = '75vh';
        content.style.overflowY = 'auto';

        // Add offer type badge to header
        if (mode !== 'details') {
            content.parentNode.appendChild(ui_createBadge({
                value: mode === 'eligible' ? 'Eligible' : 'Enrolled',
                color: mode === 'eligible' ? 'var(--ios-blue)' : 'var(--ios-green)',
                customStyle: 'position:absolute; top:20px; right:50px;'
            }));
        }

        // Add card info section
        content.appendChild(createCardInfoSection(account));

        // Get relevant offers
        const relevantOffers = getOffersForCard(account, mode);

        // Content area
        const contentArea = ui_createElement('div', {
            styleString: UI_STYLES.text.body
        });

        // Add "Enroll All" button for eligible offers
        if ((mode === 'eligible' || mode === 'details') &&
            relevantOffers.filter(o => o.type === 'eligible').length > 0) {
            contentArea.appendChild(createEnrollAllButton(accountToken));
        }

        // Create offers list
        const offersList = ui_createElement('div', {
            styleString: 'display:flex; flex-direction:column; gap:12px;'
        });

        if (relevantOffers.length === 0) {
            offersList.appendChild(createEmptyOffersMessage(mode));
        } else {
            // Create offer cards
            relevantOffers
                .sort((a, b) => a.offer.name.localeCompare(b.offer.name))
                .forEach(item => {
                    offersList.appendChild(createOfferCard(item.offer, accountToken, item.type));
                });
        }

        contentArea.appendChild(offersList);
        content.appendChild(contentArea);

        // Functions for card components
        function createCardInfoSection(account) {
            return ui_createElement('div', {
                styleString: `${UI_STYLES.containers.flexRow} margin-bottom:16px;`,
                children: [
                    // Card logo if available
                    ui_returnLogo(account.small_card_art, account.description),

                    // Card details
                    ui_createElement('div', {
                        styleString: 'flex:1;',
                        children: [
                            ui_createElement('div', {
                                text: account.description || 'Card',
                                styleString: UI_STYLES.text.subtitle
                            }),
                            ui_createElement('div', {
                                text: `${account.cardEnding} - ${account.embossed_name || ''}`,
                                styleString: 'font-size:15px; color:#666;'
                            })
                        ]
                    })
                ].filter(Boolean)
            });
        }

        function getOffersForCard(account, mode) {
            const offers_current = glbVer.get('offers_current');
            let result = [];

            if (mode === 'details') {
                // Get both eligible and enrolled offers_current
                const eligible = offers_current
                    .filter(offer => Array.isArray(offer.eligibleCards) &&
                        offer.eligibleCards.includes(account.account_token))
                    .map(offer => ({ offer, type: 'eligible' }));

                const enrolled = offers_current
                    .filter(offer => Array.isArray(offer.enrolledCards) &&
                        offer.enrolledCards.includes(account.account_token))
                    .map(offer => ({ offer, type: 'enrolled' }));

                result = [...eligible, ...enrolled];
            } else if (mode === 'eligible') {
                // Get only eligible offers_current
                result = offers_current
                    .filter(offer => Array.isArray(offer.eligibleCards) &&
                        offer.eligibleCards.includes(account.account_token))
                    .map(offer => ({ offer, type: 'eligible' }));
            } else if (mode === 'enrolled') {
                // Get only enrolled offers_current
                result = offers_current
                    .filter(offer => Array.isArray(offer.enrolledCards) &&
                        offer.enrolledCards.includes(account.account_token))
                    .map(offer => ({ offer, type: 'enrolled' }));
            }

            return result;
        }

        function createEnrollAllButton(accountToken) {
            return ui_createBtn({
                label: 'Enroll All Offers',
                icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>',
                type: 'primary',
                fullWidth: true,
                size: 'large',
                customStyle: 'margin-bottom:20px;',
                onClick: async (e) => {
                    const btn = e.currentTarget;
                    btn.innerHTML = '<div class="loading-spinner" style="width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top:2px solid white;border-radius:50%;animation:spin 1s linear infinite;margin-right:8px;"></div>Enrolling...';
                    btn.disabled = true;
                    btn.style.opacity = '0.8';

                    try {
                        await API.batchEnrollOffers(null, accountToken);

                        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>Enrolled Successfully';
                        btn.style.backgroundColor = 'var(--ios-green)';

                        setTimeout(() => {
                            closeBtn.click();
                            renderEngine.renderCurrentView();
                        }, 1500);
                    } catch (err) {
                        console.error('Error enrolling all:', err);

                        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>Error: Try Again';
                        btn.style.backgroundColor = 'var(--ios-red)';

                        setTimeout(() => {
                            btn.disabled = false;
                            btn.style.opacity = '1';
                            btn.style.backgroundColor = 'var(--ios-blue)';
                            btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>Enroll All Offers';
                        }, 2000);
                    }
                }
            });
        }

        function createEmptyOffersMessage(type) {
            return ui_createElement('div', {
                styleString: 'text-align:center; padding:30px 20px; background-color:rgba(0,0,0,0.02); border-radius:12px;',
                children: [
                    ui_createElement('div', {
                        props: { innerHTML: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="8" y1="12" x2="16" y2="12"></line></svg>' },
                        styleString: 'margin-bottom:16px;'
                    }),
                    ui_createElement('div', {
                        text: `No ${type === 'details' ? '' : type + ' '}offers_current found for this card.`,
                        styleString: 'font-size:15px; color:#666;'
                    })
                ]
            });
        }

        function createOfferCard(offer, accountToken, offerType) {
            return ui_createElement('div', {
                styleString: `${UI_STYLES.cards.offer} background-color:${offer.favorite ? 'rgba(255, 149, 0, 0.05)' : 'white'};`,
                events: {
                    mouseenter: e => {
                        e.currentTarget.style.backgroundColor = offer.favorite ? 'rgba(255, 149, 0, 0.1)' : 'rgba(0,0,0,0.02)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = UI_STYLES.utils.shadow;
                    },
                    mouseleave: e => {
                        e.currentTarget.style.backgroundColor = offer.favorite ? 'rgba(255, 149, 0, 0.05)' : 'white';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    },
                    click: () => {
                        offer_popCard(offer.offerId, 'details', offer);
                    }
                },
                children: [
                    // Logo
                    offer.logo && offer.logo !== 'N/A' ? ui_createElement('div', {
                        styleString: 'width:48px; height:48px; display:flex; align-items:center; justify-content:center; flex-shrink:0;',
                        children: [
                            ui_createElement('img', {
                                props: { src: offer.logo, alt: offer.name },
                                styleString: 'max-width:100%; max-height:100%; border-radius:6px;'
                            })
                        ]
                    }) : null,

                    // Offer content
                    ui_createElement('div', {
                        styleString: 'flex:1; min-width:0;',
                        children: [
                            // Title with favorite indicator
                            ui_createElement('div', {
                                styleString: `${UI_STYLES.containers.flexRow} gap:6px; margin-bottom:4px;`,
                                children: [
                                    offer.favorite ? ui_createElement('span', {
                                        text: '★',
                                        styleString: 'color:#ff9500; font-size:14px;'
                                    }) : null,
                                    ui_createElement('div', {
                                        text: offer.name,
                                        styleString: `${UI_STYLES.text.value} ${UI_STYLES.utils.truncate}`
                                    })
                                ].filter(Boolean)
                            }),

                            // Description
                            ui_createElement('div', {
                                text: shortenDescription(offer.short_description),
                                styleString: 'font-size:13px; color:#666; line-height:1.4; margin-bottom:8px;',
                                props: { title: offer.short_description }
                            }),

                            // Metric badges
                            ui_createElement('div', {
                                styleString: `${UI_STYLES.containers.flexRow} flex-wrap:wrap; gap:8px;`,
                                children: [
                                    ui_createBadge({ label: 'Spend', value: offer.threshold, color: 'var(--ios-gray)' }),
                                    ui_createBadge({ label: 'Reward', value: offer.reward, color: 'var(--ios-green)' }),
                                    ui_createBadge({ label: 'Rate', value: offer.percentage, color: 'var(--ios-blue)' }),
                                    ui_createBadge({ label: 'Expires', value: util_formatDate(offer.expiry_date), color: 'var(--ios-orange)' })
                                ].filter(Boolean)
                            })
                        ]
                    }),

                    // Enroll button for eligible offers_current
                    offerType === 'eligible' ? createEnrollButton(offer, accountToken) : null
                ].filter(Boolean)
            });
        }

        function shortenDescription(desc) {
            if (!desc) return 'No description available';
            return desc.length > 100 ? desc.substring(0, 100) + '...' : desc;
        }

        function createEnrollButton(offer, accountToken) {
            return ui_createElement('button', {
                props: {
                    innerHTML: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>',
                    title: 'Enroll in this offer'
                },
                styleString: `
                    background-color: rgba(0, 122, 255, 0.1);
                    color: var(--ios-blue);
                    border: none;
                    border-radius: 50%;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    align-self: center;
                    flex-shrink: 0;
                    ${UI_STYLES.utils.transition}
                `,
                events: {
                    mouseenter: e => {
                        e.target.style.backgroundColor = 'var(--ios-blue)';
                        e.target.style.color = 'white';
                        e.target.style.transform = 'scale(1.1)';
                    },
                    mouseleave: e => {
                        e.target.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
                        e.target.style.color = 'var(--ios-blue)';
                        e.target.style.transform = 'scale(1)';
                    },
                    click: async e => {
                        e.stopPropagation();
                        const btn = e.currentTarget;
                        const originalHTML = btn.innerHTML;

                        btn.innerHTML = '<div class="loading-spinner" style="width:14px;height:14px;border:2px solid rgba(0,122,255,0.3);border-top:2px solid var(--ios-blue);border-radius:50%;animation:spin 1s linear infinite;"></div>';
                        btn.style.pointerEvents = 'none';

                        try {
                            const res = await API.enrollInOffer(accountToken, offer.offerId);

                            if (res.result) {
                                handleEnrollSuccess(btn, offer, accountToken);
                            } else {
                                handleEnrollFailure(btn, originalHTML);
                            }
                            storageOP.saveItem('offers_current');
                        } catch (error) {
                            console.error('Error enrolling offer:', error);
                            handleEnrollFailure(btn, originalHTML);
                        }
                    }
                }
            });
        }

        async function handleEnrollSuccess(btn, offer, accountToken) {
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>';
            btn.style.backgroundColor = 'var(--ios-green)';
            btn.style.color = 'white';

            const idx = offer.eligibleCards.indexOf(accountToken);
            if (idx !== -1) offer.eligibleCards.splice(idx, 1);
            if (!offer.enrolledCards.includes(accountToken)) offer.enrolledCards.push(accountToken);

            API.updateCardOfferCounts();
            statsOP.invalidate('offers_current');
            renderEngine.markChanged('offers_current');

            const offerCard = btn.closest('div');
            if (offerCard) {
                offerCard.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
                offerCard.style.transform = 'translateX(100%)';
                offerCard.style.opacity = '0';

                setTimeout(() => {
                    offerCard.remove();
                    if (offersList.childElementCount === 0) {
                        member_popCard(accountToken, mode);
                    }
                }, 500);
            }
        }

        function handleEnrollFailure(btn, originalHTML) {
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
            btn.style.backgroundColor = 'var(--ios-red)';
            btn.style.color = 'white';

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
                btn.style.color = 'var(--ios-blue)';
                btn.style.pointerEvents = 'auto';
            }, 1500);
        }
    }

    function member_sortTable(key) {
        const sortState = renderEngine.restoreSortState('MEMBER');
        const direction = sortState.key === key ? sortState.direction * -1 : 1;

        renderEngine.saveSortState('MEMBER', key, direction);

        const container = document.getElementById('members-table-container');
        if (container) {
            container.innerHTML = "";
            container.appendChild(member_renderTable());
        }
    }

    // =========================================================================
    // Offers Page Rendering Functions
    // =========================================================================

    function offer_renderPage() {
        const containerDiv = document.createElement('div');
        containerDiv.style.cssText = UI_STYLES.pageContainer;
        containerDiv.appendChild(offer_renderStatsBar());

        const tabContainer = document.createElement('div');
        tabContainer.style.cssText = 'display:flex; margin-bottom:16px; background-color:rgba(255,255,255,0.6); border-radius:10px; padding:4px; border:1px solid var(--ios-border);';

        const currentTab = document.createElement('button');
        currentTab.textContent = 'Current Offers';
        currentTab.style.cssText = 'flex:1; padding:10px; border:none; border-radius:8px; background-color:var(--ios-blue); color:white; font-weight:500; cursor:pointer;';

        const historyTab = document.createElement('button');
        historyTab.textContent = 'Offer History';
        historyTab.style.cssText = 'flex:1; padding:10px; border:none; border-radius:8px; background-color:transparent; color:var(--ios-text-secondary); font-weight:500; cursor:pointer;';

        const displayContainer = document.createElement('div');
        displayContainer.id = 'offers-display-container';
        displayContainer.appendChild(offer_renderTableView());

        currentTab.addEventListener('click', () => {
            currentTab.style.backgroundColor = 'var(--ios-blue)';
            currentTab.style.color = 'white';
            historyTab.style.backgroundColor = 'transparent';
            historyTab.style.color = 'var(--ios-text-secondary)';

            displayContainer.innerHTML = '';
            displayContainer.appendChild(offer_renderTableView());
        });

        historyTab.addEventListener('click', () => {
            historyTab.style.backgroundColor = 'var(--ios-blue)';
            historyTab.style.color = 'white';
            currentTab.style.backgroundColor = 'transparent';
            currentTab.style.color = 'var(--ios-text-secondary)';

            displayContainer.innerHTML = '';
            displayContainer.appendChild(offer_renderHistoryView());
        });

        tabContainer.appendChild(currentTab);
        tabContainer.appendChild(historyTab);
        containerDiv.appendChild(tabContainer);
        containerDiv.appendChild(offer_renderControlBar());
        containerDiv.appendChild(displayContainer);

        return containerDiv;
    }

    function offer_renderHistoryView() {
        const historyContainer = document.createElement('div');
        historyContainer.style.cssText = 'display:flex; flex-direction:column; gap:24px;';

        // Expired offers section
        const expiredSection = document.createElement('div');
        expiredSection.style.cssText = 'background:white; border-radius:12px; padding:20px; box-shadow:0 4px 12px rgba(0,0,0,0.08);';

        const expiredTitle = document.createElement('h3');
        expiredTitle.textContent = 'Expired Offers';
        expiredTitle.style.cssText = 'margin:0 0 16px 0; font-size:18px; font-weight:600; color:#333; display:flex; align-items:center; gap:8px;';
        expiredTitle.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--ios-red)" opacity="0.8">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm4-12H8v2h8V8zm0 4H8v2h8v-2z"/>
        </svg>
        Expired Offers (${glbVer.get('offers_expired').length})
    `;

        expiredSection.appendChild(expiredTitle);

        if (glbVer.get('offers_expired').length === 0) {
            const emptyExpired = document.createElement('div');
            emptyExpired.textContent = 'No expired offers tracked yet';
            emptyExpired.style.cssText = 'text-align:center; padding:20px; color:#888; background:rgba(0,0,0,0.02); border-radius:8px;';
            expiredSection.appendChild(emptyExpired);
        } else {
            expiredSection.appendChild(offer_renderHistoryTable(glbVer.get('offers_expired'), 'expired'));
        }

        // Redeemed offers section
        const redeemedSection = document.createElement('div');
        redeemedSection.style.cssText = 'background:white; border-radius:12px; padding:20px; box-shadow:0 4px 12px rgba(0,0,0,0.08);';

        const redeemedTitle = document.createElement('h3');
        redeemedTitle.textContent = 'Redeemed Offers';
        redeemedTitle.style.cssText = 'margin:0 0 16px 0; font-size:18px; font-weight:600; color:#333; display:flex; align-items:center; gap:8px;';
        redeemedTitle.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--ios-green)" opacity="0.8">
            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
        </svg>
        Redeemed Offers (${glbVer.get('offers_redeemed').length})
    `;

        redeemedSection.appendChild(redeemedTitle);

        if (glbVer.get('offers_redeemed').length === 0) {
            const emptyRedeemed = document.createElement('div');
            emptyRedeemed.textContent = 'No redeemed offers tracked yet';
            emptyRedeemed.style.cssText = 'text-align:center; padding:20px; color:#888; background:rgba(0,0,0,0.02); border-radius:8px;';
            redeemedSection.appendChild(emptyRedeemed);
        } else {
            redeemedSection.appendChild(offer_renderHistoryTable(glbVer.get('offers_redeemed'), 'redeemed'));
        }

        historyContainer.appendChild(expiredSection);
        historyContainer.appendChild(redeemedSection);

        return historyContainer;
    }

    function offer_renderHistoryTable(offers, type) {
        const tableElement = document.createElement('table');
        tableElement.className = 'ios-table';
        tableElement.style.cssText = 'width:100%; border-collapse:separate; border-spacing:0; font-size:14px;';

        const headers = [
            { label: "Name", key: "name" },
            { label: type === 'expired' ? "Expired Date" : "Redeemed Date", key: type === 'expired' ? "expiredDate" : "redeemedDate" }
        ];

        if (type === 'redeemed') {
            headers.push({ label: "Redeemed Cards", key: "redeemedCards" });
        }

        const thead = document.createElement('thead');
        thead.className = 'ios-table-head';
        const headerRow = document.createElement('tr');

        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header.label;
            th.style.cssText = 'padding:12px 16px; text-align:left; border-bottom:1px solid rgba(0,0,0,0.1);';
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        tableElement.appendChild(thead);

        const tbody = document.createElement('tbody');

        if (Array.isArray(offers) && offers.length > 0) {
            const sortedOffers = [...offers].sort((a, b) => {
                const dateKey = type === 'expired' ? 'expiredDate' : 'redeemedDate';
                const dateA = new Date(a[dateKey] || 0);
                const dateB = new Date(b[dateKey] || 0);
                return dateB - dateA; // Newest first
            });

            sortedOffers.forEach((offer, index) => {
                const row = document.createElement('tr');
                row.style.cssText = index % 2 === 0 ? 'background-color:white;' : 'background-color:rgba(0,0,0,0.02);';

                // Name cell
                const nameCell = document.createElement('td');
                nameCell.textContent = offer.name || 'Unknown';
                nameCell.style.cssText = 'padding:12px 16px; border-bottom:1px solid rgba(0,0,0,0.05); font-weight:500;';
                row.appendChild(nameCell);

                // Date cell
                const dateCell = document.createElement('td');
                const dateKey = type === 'expired' ? 'expiredDate' : 'redeemedDate';
                const date = new Date(offer[dateKey]);
                dateCell.textContent = !isNaN(date) ?
                    date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                    'N/A';
                dateCell.style.cssText = 'padding:12px 16px; border-bottom:1px solid rgba(0,0,0,0.05);';
                row.appendChild(dateCell);

                // Add cards for redeemed offers
                if (type === 'redeemed' && Array.isArray(offer.redeemedCards)) {
                    const cardsCell = document.createElement('td');
                    cardsCell.style.cssText = 'padding:12px 16px; border-bottom:1px solid rgba(0,0,0,0.05);';

                    offer.redeemedCards.forEach((token, i) => {
                        const account = glbVer.get('accounts').find(acc => acc.account_token === token);
                        const displayText = account ? account.cardEnding : token.slice(-4);

                        const cardBadge = document.createElement('span');
                        cardBadge.textContent = displayText;
                        cardBadge.style.cssText = 'display:inline-block; padding:3px 8px; background-color:rgba(0,0,0,0.05); border-radius:10px; margin-right:6px; margin-bottom:6px; font-size:13px;';
                        cardBadge.dataset.accountToken = token;
                        cardsCell.appendChild(cardBadge);

                        if (i < offer.redeemedCards.length - 1) {
                            cardsCell.appendChild(document.createTextNode(' '));
                        }
                    });

                    row.appendChild(cardsCell);
                }

                tbody.appendChild(row);
            });
        }

        tableElement.appendChild(tbody);
        return tableElement;
    }

    function offer_renderStatsBar() {
        const statsBar = document.createElement('div');
        statsBar.style.cssText = UI_STYLES.cardContainer + ' display:flex; flex-wrap:wrap; gap:16px; justify-content:space-between;';

        const stats = statsOP.getOffersStats();

        const createStatItem = (label, value, icon, color, filterAction) => {
            const statItem = document.createElement('div');
            statItem.style.cssText = `display:flex; align-items:center; gap:10px; padding:10px 16px; background-color:rgba(${color}, 0.1); border-radius:10px; border:1px solid rgba(${color}, 0.2); min-width:150px; transition:all 0.2s ease; ${filterAction ? 'cursor:pointer;' : ''}`;

            // Add data attribute for identifying specific stats
            statItem.setAttribute('data-stat-type', label.toLowerCase());

            if (filterAction) {
                statItem.addEventListener('mouseenter', () => {
                    statItem.style.transform = 'translateY(-2px)';
                    statItem.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)';
                });
                statItem.addEventListener('mouseleave', () => {
                    statItem.style.transform = 'translateY(0)';
                    statItem.style.boxShadow = 'none';
                });
                statItem.addEventListener('click', () => {
                    filterAction();

                    const displayContainer = document.getElementById('offers-display-container');
                    if (displayContainer) {
                        displayContainer.innerHTML = "";
                        displayContainer.appendChild(offer_renderTableView());
                    }
                });
            }

            const iconElement = document.createElement('div');
            iconElement.innerHTML = icon;
            iconElement.style.color = `rgb(${color})`;

            const textContainer = document.createElement('div');
            textContainer.style.cssText = 'display:flex; flex-direction:column;';

            const valueElement = document.createElement('div');
            valueElement.textContent = value;
            valueElement.style.cssText = `font-size:18px; font-weight:600; color:rgb(${color});`;

            // Add data attribute for the value element
            valueElement.setAttribute('data-stat-value', 'true');

            const labelElement = document.createElement('div');
            labelElement.textContent = label;
            labelElement.style.cssText = 'font-size:12px; color:var(--ios-text-secondary);';

            textContainer.appendChild(valueElement);
            textContainer.appendChild(labelElement);
            statItem.appendChild(iconElement);
            statItem.appendChild(textContainer);

            return statItem;
        };

        const ICONS = {
            TOTAL: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" fill="currentColor"/></svg>`,
            FAVORITE: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/></svg>`,
            EXPIRING: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor"/></svg>`,
            ENROLLED: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor"/></svg>`,
            pendingBalance: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2v-2zm1-10c-2.76 0-5 2.24-5 5h2c0-1.65 1.35-3 3-3s3 1.35 3 3c0 1.65-1.35 3-3 3v2c2.76 0 5-2.24 5-5s-2.24-5-5-5z" fill="currentColor"/></svg>`,
            ELIGIBLE: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.6-8 8-8 8 3.6 8 8-3.59 8-8 8zm-2-5h4c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1v-1c0-1.11-.9-2-2-2s-2 .89-2 2v1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1zm1.5-6c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v1h-3v-1z" fill="currentColor"/></svg>`
        };

        statsBar.appendChild(createStatItem('Total Offers', stats.totalOffers, ICONS.TOTAL, '52, 152, 219', () => {
            filterOP.resetFilters();
            renderEngine.renderCurrentView();
        }));

        statsBar.appendChild(createStatItem('Favorites', stats.favoriteOffers, ICONS.FAVORITE, '255, 149, 0', () => {
            filterOP.resetFilters();
            filterOP.setFilter('offerFav', true);
            renderEngine.renderCurrentView();
        }));

        statsBar.appendChild(createStatItem('Expiring Soon', stats.expiringSoon, ICONS.EXPIRING, '244, 67, 54', () => {
            filterOP.resetFilters();
            filterOP.setFilter('customFilter', filterOP.createExpiringFilter());
            renderEngine.renderCurrentView();
        }));

        statsBar.appendChild(createStatItem('Pending Enrollment', stats.distinctNotFullyEnrolled, ICONS.pendingBalance, '255, 204, 0', () => {
            filterOP.resetFilters();
            filterOP.setFilter('enrollmentStatus', 'pending');
            renderEngine.renderCurrentView();
        }));

        statsBar.appendChild(createStatItem('Total Eligible', stats.totalEligible, ICONS.ELIGIBLE, '142, 142, 147', () => {
            filterOP.resetFilters();
            filterOP.setFilter('eligibleOnly', true);
            renderEngine.renderCurrentView();
        }));

        statsBar.appendChild(createStatItem('Total Enrolled', stats.totalEnrolled, ICONS.ENROLLED, '50, 173, 230', () => {
            filterOP.resetFilters();
            filterOP.setFilter('enrolledOnly', true);
            renderEngine.renderCurrentView();
        }));

        return statsBar;
    }

    function offer_renderControlBar() {
        const filterCard = document.createElement('div');
        filterCard.style.cssText = UI_STYLES.containers.card + ' display:flex; flex-wrap:wrap; gap:16px; margin-bottom:8px; align-items:center;';

        // Create left container for enroll button
        const container_EnrollAllBtn = document.createElement('div');
        container_EnrollAllBtn.style.cssText = 'display:flex; flex-wrap:wrap; gap:12px; flex:1; align-items:center;';
        const enrollAllBtn = ui_createBtn({
            label: 'Enroll All Offers',
            icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>',
            onClick: async () => {
                try {
                    await API.batchEnrollOffers();
                    renderEngine.renderCurrentView();
                } catch (e) {
                    console.error('Error enrolling all:', e);
                }
            },
            type: 'primary',
            size: 'large',
            fullWidth: true,
            maxWidth: '200px'
        });
        container_EnrollAllBtn.appendChild(enrollAllBtn);
        filterCard.appendChild(container_EnrollAllBtn);

        // Create right container with search controls
        const searchContainer = document.createElement('div');
        searchContainer.style.cssText = 'display:flex; gap:12px; align-items:center; flex-wrap:wrap; flex:1; justify-content:flex-end;';

        // Add merchant search with reactive updates
        const merchantSearchContainer = document.createElement('div');
        merchantSearchContainer.style.cssText = 'flex:1; min-width:180px; max-width:300px;';

        const reactiveSearch = ui_createReactiveFilter(merchantSearchContainer, {
            searchPlaceholder: 'Search merchants...',
            initialValue: filterOP.getFilters().offerMerchantSearch || '',
            onFilterChange: (value) => {
                // Update filter and invalidate cache
                filterOP.setFilter('offerMerchantSearch', value);

                // Force immediate table update
                const container = document.getElementById('offers-table-container') ||
                    document.getElementById('offers-display-container');
                if (container) {
                    container.innerHTML = '';
                    container.appendChild(offer_renderTableView());
                }
            }
        });
        searchContainer.appendChild(merchantSearchContainer);

        // Card ending filter (add reactive behavior here too)
        const cardSearchContainer = document.createElement('div');
        cardSearchContainer.style.cssText = 'position:relative; min-width:150px; max-width:200px; flex:0.7;';

        const cardFilter = ui_createReactiveFilter(cardSearchContainer, {
            searchPlaceholder: 'Card account...',
            initialValue: filterOP.getFilters().offerCardToken || '',
            onFilterChange: (value) => {
                filterOP.setFilter('offerCardToken', value);

                const container = document.getElementById('offers-table-container') ||
                    document.getElementById('offers-display-container');
                if (container) {
                    container.innerHTML = '';
                    container.appendChild(offer_renderTableView());
                }
            }
        });
        searchContainer.appendChild(cardSearchContainer);

        // Reset button
        const resetButton = ui_createBtn({
            label: 'Reset Filters',
            type: 'secondary',
            onClick: () => {
                // Reset all filter inputs
                reactiveSearch.setValue('');
                cardFilter.setValue('');
                filterOP.resetFilters();
                renderEngine.renderCurrentView(true);
            }
        });
        searchContainer.appendChild(resetButton);

        filterCard.appendChild(searchContainer);
        return filterCard;
    }

    function offer_renderTableView() {
        let processedOffers = filterOP.getFilteredOffers();

        if (processedOffers.length === 0) {
            return ui_createEmptyState(document.createElement('div'), {
                title: 'No Offers Found',
                message: filterOP.getFilters().offerFav ? 'No favorite offers found' :
                    filterOP.getFilters().offerMerchantSearch ? `No offers match "${filterOP.getFilters().offerMerchantSearch}"` :
                        'No offers available',
                buttonText: 'Reset Filters',
                callback: () => {
                    filterOP.resetFilters();
                    renderEngine.renderCurrentView();
                }
            });
        }

        if (offer_sortOrder && offer_sortOrder.length > 0) {
            const offerIndexMap = new Map();
            offer_sortOrder.forEach((id, index) => {
                offerIndexMap.set(id, index);
            });

            processedOffers.sort((a, b) => {
                const indexA = offerIndexMap.has(a.offerId) ? offerIndexMap.get(a.offerId) : -1;
                const indexB = offerIndexMap.has(b.offerId) ? offerIndexMap.get(b.offerId) : -1;

                if (indexA === -1 && indexB === -1) return 0;
                if (indexA === -1) return -1;
                if (indexB === -1) return 1;
                return indexA - indexB;
            });
        }

        const headers = [
            { label: "★", key: "favorite" },
            { label: "Logo", key: "logo" },
            { label: "Offer", key: "name" },
            { label: "Type", key: "achievement_type" },
            { label: "Category", key: "category" },
            { label: "Expiry", key: "expiry_date" },
            { label: "Usage", key: "redemption_types" },
            { label: "Description", key: "short_description" },
            { label: "Threshold", key: "threshold" },
            { label: "Reward", key: "reward" },
            { label: "Percent", key: "percentage" },
            { label: "Eligible", key: "eligibleCards" },
            { label: "Enrolled", key: "enrolledCards" }
        ];

        const colWidths = {
            favorite: "40px", logo: "70px", name: "180px", achievement_type: "70px",
            category: "90px", expiry_date: "110px", redemption_types: "80px",
            short_description: "230px", threshold: "90px", reward: "90px",
            percentage: "80px", eligibleCards: "80px", enrolledCards: "80px"
        };

        // Cell renderer for each column
        const cellRenderer = (offer, headerItem) => {
            const key = headerItem.key;

            // Specialized renderer for each column type
            switch (key) {
                case 'favorite':
                    return createFavoriteButton(offer);

                case 'logo':
                    return ui_returnLogo(offer.logo, offer.name);

                case 'name':
                    return ui_createElement('div', {
                        text: offer.name,
                        styleString: 'max-width:170px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:500; font-size:13px;',
                        props: { title: offer.name }
                    });

                case 'achievement_type':
                    const achievementType = offer.achievement_type;
                    const typeText = achievementType === "STATEMENT_CREDIT" ? "Cash" :
                        achievementType === "MEMBERSHIP_REWARDS" ? "MR" : achievementType;
                    const typeColor = achievementType === "STATEMENT_CREDIT" ? '#2e7d32' :
                        achievementType === "MEMBERSHIP_REWARDS" ? '#1976d2' : '#2c3e50';

                    return ui_createElement('div', {
                        text: typeText,
                        styleString: `font-weight:500; font-size:13px; color:${typeColor}; text-align:center;`
                    });

                case 'category':
                    if (offer.category && offer.category !== "N/A") {
                        const cat = offer.category.toString().toLowerCase().trim();
                        const categoryMap = {
                            "default": { icon: "🔰", color: "#9e9e9e" },
                            "dining": { icon: "🍽️", color: "#d32f2f" },
                            "entertainment": { icon: "🎭", color: "#7b1fa2" },
                            "services": { icon: "⚙️", color: "#616161" },
                            "shopping": { icon: "🛍️", color: "#1976d2" },
                            "travel": { icon: "✈️", color: "#0288d1" }
                        };

                        const config = categoryMap[cat] || { icon: "•", color: "#757575" };
                        return ui_createElement('div', {
                            styleString: 'display:flex; align-items:center; justify-content:center; gap:6px;',
                            children: [
                                ui_createElement('span', { text: config.icon }),
                                ui_createElement('span', {
                                    text: cat.charAt(0).toUpperCase() + cat.slice(1),
                                    styleString: `color:${config.color}; font-size:13px;`
                                })
                            ]
                        });
                    }
                    return 'N/A';

                case 'expiry_date':
                    if (offer.expiry_date && offer.expiry_date !== 'N/A') {
                        const d = new Date(offer.expiry_date);
                        if (!isNaN(d)) {
                            const now = new Date();
                            const daysUntilExpiry = Math.floor((d - now) / (1000 * 60 * 60 * 24));

                            return ui_createElement('div', {
                                styleString: 'display:flex; flex-direction:column; align-items:center;',
                                children: [
                                    ui_createElement('span', {
                                        text: util_formatDate(offer.expiry_date),
                                        styleString: 'font-size:13px;'
                                    }),
                                    ui_createElement('span', {
                                        text: daysUntilExpiry < 0 ? 'Expired' : `${daysUntilExpiry} days left`,
                                        styleString: `font-size:${daysUntilExpiry > 30 ? '11px' : '12px'}; color:${daysUntilExpiry < 0 ? 'var(--ios-red)' :
                                            daysUntilExpiry <= 30 ? 'var(--ios-orange)' : 'var(--ios-gray)'
                                            };`
                                    })
                                ]
                            });
                        }
                    }
                    return 'N/A';

                case 'redemption_types':
                    const types = (offer.redemption_types || "").toLowerCase();

                    // Define SVG icons
                    const icons = {
                        online: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1976d2" stroke-width="2"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/><path d="M3.6 9h16.8M3.6 15h16.8"/><path d="M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18"/></svg>',
                        instore: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" stroke-width="2"><path d="M3 3h18v18H3zM3 9h18M9 21V9"/></svg>',
                        both: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7b1fa2" stroke-width="2"><path d="M20 7h-7l-3 3-3-3H3v13h17z"/><path d="M7 7V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3"/></svg>'
                    };

                    // Determine which icon to use
                    let icon = '';
                    if (types.includes('online') && types.includes('instore')) {
                        icon = icons.both;
                    } else if (types.includes('online')) {
                        icon = icons.online;
                    } else if (types.includes('instore')) {
                        icon = icons.instore;
                    }

                    // Create element with appropriate styling and tooltip
                    return ui_createElement('div', {
                        props: { innerHTML: icon, title: offer.redemption_types || "" },
                        styleString: 'display:flex; justify-content:center;'
                    });

                case 'short_description':
                    return ui_createElement('div', {
                        text: offer.short_description || 'No description available',
                        styleString: 'font-size:13px; color:var(--ios-text-secondary); max-width:220px; max-height:60px; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; line-height:1.3;'
                    });

                case 'threshold':
                    return renderFormattedValue(offer.threshold, '#1c1c1e');

                case 'reward':
                    return renderFormattedValue(offer.reward, 'var(--ios-green)');

                case 'percentage':
                    return renderFormattedValue(offer.percentage, 'var(--ios-blue)');

                case 'eligibleCards':
                    const eligibleCount = offer.eligibleCards?.length || 0;
                    if (eligibleCount > 0) {
                        return ui_createElement('button', {
                            className: 'eligible-badge',
                            props: {
                                innerHTML: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px">
                                  <path d="M20 12v6M16 20h8M4 20h2M14 4h6M20 8V4M4 4h2M4 16h2M4 12h2M4 8h2"/>
                                  <circle cx="10" cy="12" r="8" stroke-dasharray="2 2"/>
                                </svg>${eligibleCount}`
                            },
                            styleString: `
                                border-radius:16px;
                                background-color:rgba(0, 122, 255, 0.1);
                                color:var(--ios-blue);
                                border:1px solid rgba(0, 122, 255, 0.25);
                                padding:5px 12px;
                                font-weight:600;
                                font-size:13px;
                                cursor:pointer;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                gap:4px;
                                margin: 0 auto;
                            `,
                            events: {
                                click: (e) => {
                                    e.stopPropagation();
                                    offer_popCard(offer.offerId, 'eligible', offer);
                                }
                            }
                        });
                    }
                    return ui_createElement('div', {
                        text: '0',
                        styleString: 'color:rgba(0,0,0,0.3); text-align:center;'
                    });

                case 'enrolledCards':
                    const enrolledCount = offer.enrolledCards?.length || 0;
                    if (enrolledCount > 0) {
                        return ui_createElement('button', {
                            className: 'enrolled-badge',
                            props: {
                                innerHTML: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                  <path d="M22 4L12 14.01l-3-3"/>
                                </svg>${enrolledCount}`
                            },
                            styleString: `
                                border-radius:16px;
                                background-color:rgba(52, 199, 89, 0.1);
                                color:var(--ios-green);
                                border:1px solid rgba(52, 199, 89, 0.25);
                                padding:5px 12px;
                                font-weight:600;
                                font-size:13px;
                                cursor:pointer;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                gap:4px;
                                margin: 0 auto;
                            `,
                            events: {
                                click: (e) => {
                                    e.stopPropagation();
                                    offer_popCard(offer.offerId, 'enrolled', offer);
                                }
                            }
                        });
                    }
                    return ui_createElement('div', {
                        text: '0',
                        styleString: 'color:rgba(0,0,0,0.3); text-align:center;'
                    });

                default:
                    return offer[key] || '';
            }
        };

        function renderFormattedValue(value, color) {
            if (value && value !== 'N/A') {
                return ui_createElement('div', {
                    text: value,
                    styleString: `font-variant-numeric:tabular-nums; font-weight:600; text-align:center; color:${color};`
                });
            }
            return ui_createElement('div', {
                styleString: 'text-align:center;'
            });
        }

        function createFavoriteButton(offer) {
            const button = ui_createElement('button', {
                props: {
                    innerHTML: offer.favorite ?
                        '<svg width="18" height="18" viewBox="0 0 24 24" fill="#ff9500"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>' :
                        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#777" stroke-width="2"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>'
                },
                styleString: 'background:none; border:none; cursor:pointer; padding:5px; border-radius:50%; transition:all 0.2s ease; display:flex; justify-content:center; align-items:center;',
                events: {
                    mouseenter: (e) => {
                        e.target.style.transform = 'scale(1.2)';
                        e.target.style.backgroundColor = 'rgba(0,0,0,0.05)';
                    },
                    mouseleave: (e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.backgroundColor = 'transparent';
                    },
                    click: (e) => {
                        e.stopPropagation();
                        offer_toggleFavorite(offer);
                    }
                }
            });

            return button;
        }

        const sortableKeys = [
            "favorite", "name", "achievement_type", "category",
            "expiry_date", "threshold", "reward", "percentage",
            "eligibleCards", "enrolledCards"
        ];

        const tableElement = ui_renderDataTable(headers, colWidths, processedOffers, cellRenderer, offer_sortTable_keyUpd, sortableKeys);

        tableElement.querySelectorAll('tbody tr').forEach((row, index) => {
            if (index < processedOffers.length) {
                row.style.cursor = 'pointer';
                row.addEventListener('click', () => {
                    offer_popCard(processedOffers[index].offerId, 'details', processedOffers[index]);
                });
            }
        });

        const tableWrapper = ui_createElement('div', {
            props: { id: 'offers-table-container' },
            styleString: 'overflow-x:auto;',
            children: [tableElement]
        });

        return tableWrapper;
    }

    function offer_toggleFavorite(offer) {
        glbVer.update('offers_current', offers_current => {
            return offers_current.map(o => {
                if (o.offerId === offer.offerId) {
                    return { ...o, favorite: !o.favorite };
                }
                return o;
            });
        });

        const updatedOffer = glbVer.get('offers_current').find(o => o.offerId === offer.offerId);
        const isFavorite = updatedOffer ? updatedOffer.favorite : !offer.favorite;

        statsOP.invalidate('OFFER');

        const event = window.event;
        if (event && event.target) {
            const favoriteBtn = event.target.closest('button');
            if (favoriteBtn) {
                favoriteBtn.innerHTML = isFavorite ?
                    '<svg width="18" height="18" viewBox="0 0 24 24" fill="#ff9500"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>' :
                    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#777" stroke-width="2"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
                favoriteBtn.classList.add('ios-sort-animation');
                setTimeout(() => favoriteBtn.classList.remove('ios-sort-animation'), 300);
            }
        }

        const stats = statsOP.getOffersStats();

        const favoritesStatItem = document.querySelector('[data-stat-type="favorites"]');
        if (favoritesStatItem) {
            const countElement = favoritesStatItem.querySelector('[data-stat-value="true"]');
            if (countElement) {
                countElement.textContent = stats.favoriteOffers;
                countElement.style.transition = 'all 0.3s ease';
                countElement.style.transform = 'scale(1.05)';
                countElement.style.color = isFavorite ? '#ff9500' : 'rgb(255, 149, 0)';
                setTimeout(() => {
                    countElement.style.transform = 'scale(1)';
                }, 300);
            }
        }
    }

    function offer_sortTable_keyUpd(key) {
        const sortState = renderEngine.restoreSortState('OFFER');
        let direction = sortState.key === key ? sortState.direction * -1 : 1;

        if ((key === "favorite" || key === "eligibleCards" || key === "enrolledCards") &&
            sortState.key !== key) {
            direction = -1;
        }

        renderEngine.saveSortState('OFFER', key, direction);

        const offers = glbVer.get('offers_current') || [];

        const sortFunctions = {
            favorite: (a, b) => direction * (Number(b.favorite) - Number(a.favorite)),
            name: (a, b) => direction * (a.name || "").localeCompare(b.name || ""),
            achievement_type: (a, b) => direction * (a.achievement_type || "").localeCompare(b.achievement_type || ""),
            category: (a, b) => direction * (a.category || "").localeCompare(b.category || ""),
            expiry_date: (a, b) => {
                const dateA = a.expiry_date ? new Date(a.expiry_date) : new Date(0);
                const dateB = b.expiry_date ? new Date(b.expiry_date) : new Date(0);
                return direction * (dateA - dateB);
            },
            threshold: (a, b) => {
                const numA = a.threshold ? parseFloat(a.threshold.replace(/[^\d.-]/g, '')) : 0;
                const numB = b.threshold ? parseFloat(b.threshold.replace(/[^\d.-]/g, '')) : 0;
                return direction * (numA - numB);
            },
            reward: (a, b) => {
                const numA = a.reward ? parseFloat(a.reward.replace(/[^\d.-]/g, '')) : 0;
                const numB = b.reward ? parseFloat(b.reward.replace(/[^\d.-]/g, '')) : 0;
                return direction * (numA - numB);
            },
            percentage: (a, b) => {
                const numA = a.percentage ? parseFloat(a.percentage.replace(/[^\d.-]/g, '')) : 0;
                const numB = b.percentage ? parseFloat(b.percentage.replace(/[^\d.-]/g, '')) : 0;
                return direction * (numA - numB);
            },
            eligibleCards: (a, b) => direction * ((a.eligibleCards?.length || 0) - (b.eligibleCards?.length || 0)),
            enrolledCards: (a, b) => direction * ((a.enrolledCards?.length || 0) - (b.enrolledCards?.length || 0))
        };

        const sortedOffers = [...offers].sort(
            sortFunctions[key] ||
            ((a, b) => direction * ((a[key] || "").toString().localeCompare((b[key] || "").toString())))
        );
        offer_sortOrder = sortedOffers.map(offer => offer.offerId);

        const displayContainer = document.getElementById('offers-display-container');
        if (displayContainer) {
            displayContainer.innerHTML = "";
            displayContainer.appendChild(offer_renderTableView());
        }

    }


    function offer_popCard(offerId, mode = 'details', offer = null) {
        const offerObj = offer || glbVer.get('offers_current').find(o => o.offerId === offerId);
        if (!offerObj) return;

        const { overlay, content, closeBtn, close } = ui_createModal({
            id: 'offer-details-modal',
            width: '800px',
            title: offerObj.name,
            onClose: () => renderEngine.renderCurrentView()
        });

        content.style.maxHeight = '75vh';
        content.style.overflowY = 'auto';

        if (mode !== 'details') {
            content.parentNode.appendChild(ui_createBadge({
                value: mode === 'eligible' ? 'Eligible' : 'Enrolled',
                color: mode === 'eligible' ? 'var(--ios-blue)' : 'var(--ios-green)',
                customStyle: 'position:absolute; top:20px; right:50px;'
            }));
        }

        const tabContainer = ui_createElement('div', {
            styleString: UI_STYLES.modal.tabContainer
        });

        const tabContents = setupTabs(['Cards', 'Details', 'Terms'], tabContainer);

        content.appendChild(createOfferHeaderInfo(offerObj));
        content.appendChild(tabContainer);

        Object.values(tabContents).forEach(el => content.appendChild(el));

        populateCardsTab(tabContents.cards, offerObj, mode);
        populateDetailsTab(tabContents.details, offerObj);
        populateTermsTab(tabContents.terms, offerObj);

        function setupTabs(tabNames, container) {
            const contents = {};
            tabNames.forEach((name, index) => {
                const tab = ui_createElement('button', {
                    text: name,
                    styleString: `${UI_STYLES.modal.tab} ${index === 0 ? UI_STYLES.modal.tabActive : ''}`,
                    events: {
                        click: e => {
                            Array.from(e.target.parentNode.children).forEach(btn => {
                                btn.style.borderBottomColor = 'transparent';
                                btn.style.color = '#555';
                            });

                            e.target.style.borderBottomColor = 'var(--ios-blue)';
                            e.target.style.color = 'var(--ios-blue)';

                            Object.keys(contents).forEach(key => {
                                contents[key].style.display = key === name.toLowerCase() ? 'block' : 'none';
                            });
                        }
                    }
                });
                container.appendChild(tab);
                contents[name.toLowerCase()] = ui_createElement('div', {
                    styleString: `padding:20px; display:${index === 0 ? 'block' : 'none'};`
                });
            });
            return contents;
        }

        function createOfferHeaderInfo(offer) {
            return ui_createElement('div', {
                styleString: `${UI_STYLES.containers.flexRow} padding:16px 20px; border-bottom:1px solid rgba(0,0,0,0.08);`,
                children: [
                    ui_returnLogo(offer.logo, offer.name),
                    ui_createElement('div', {
                        styleString: 'flex:1;',
                        children: [
                            ui_createElement('div', {
                                text: offer.short_description || 'No description available',
                                styleString: 'font-size:14px; color:var(--ios-text-secondary); line-height:1.4; margin-top:4px;'
                            }),
                            ui_createElement('div', {
                                styleString: `${UI_STYLES.containers.flexRow} flex-wrap:wrap; gap:8px; margin-top:12px;`,
                                children: [
                                    ui_createBadge({ label: 'Spend', value: offer.threshold, color: 'var(--ios-gray)' }),
                                    ui_createBadge({ label: 'Reward', value: offer.reward, color: 'var(--ios-green)' }),
                                    ui_createBadge({ label: 'Rate', value: offer.percentage, color: 'var(--ios-blue)' }),
                                    ui_createBadge({ label: 'Expires', value: util_formatDate(offer.expiry_date), color: 'var(--ios-orange)' })
                                ].filter(Boolean)
                            })
                        ]
                    })
                ].filter(Boolean)
            });
        }

        function populateCardsTab(container, offer, mode) {
            let cardItems = [];

            if (mode === 'eligible') {
                cardItems = offer.eligibleCards.map(token => ({ token, status: 'eligible' }));
            } else if (mode === 'enrolled') {
                cardItems = offer.enrolledCards.map(token => ({ token, status: 'enrolled' }));
            } else {
                cardItems = [
                    ...offer.eligibleCards.map(token => ({ token, status: 'eligible' })),
                    ...offer.enrolledCards.map(token => ({ token, status: 'enrolled' }))
                ];
            }

            if (mode !== 'enrolled' && offer.eligibleCards.length > 0) {
                container.appendChild(ui_createBtn({
                    label: `Enroll All Eligible Cards (${offer.eligibleCards.length})`,
                    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>',
                    type: 'primary',
                    fullWidth: true,
                    customStyle: 'margin-bottom:16px;',
                    onClick: async (e) => handleEnrollAll(e, offer)
                }));
            }

            container.appendChild(ui_createElement('h3', {
                text: `Cards ${cardItems.length > 0 ? `(${cardItems.length})` : ''}`,
                styleString: UI_STYLES.text.subtitle
            }));

            if (cardItems.length === 0) {
                container.appendChild(ui_createElement('div', {
                    text: `No ${mode === 'eligible' ? 'eligible' : mode === 'enrolled' ? 'enrolled' : ''} cards found for this offer.`,
                    styleString: 'text-align:center; padding:30px; color:#888; background:rgba(0,0,0,0.02); border-radius:12px;'
                }));
                return;
            }

            container.appendChild(createCardsTable(cardItems, offer));
        }

        async function handleEnrollAll(e, offer) {
            const btn = e.currentTarget;

            btn.innerHTML = '<div class="loading-spinner" style="width:20px;height:20px;border:2px solid rgba(255,255,255,0.3);border-top:2px solid white;border-radius:50%;animation:spin 1s linear infinite;margin-right:8px;"></div>Enrolling...';
            btn.disabled = true;

            try {
                const eligibleTokens = [...offer.eligibleCards];
                const result = await API.batchEnrollOffers(offer.source_id);

                if (result.success === 0) {
                    throw new Error("No cards were enrolled successfully");
                }

                btn.innerHTML = '✓ All Cards Enrolled';
                btn.style.backgroundColor = 'var(--ios-green)';
                ui_showNotification(`Successfully enrolled ${result.success} cards`, 'success');

                // Refresh table after enrollment
                const cardTab = document.querySelector('.cards-tab') || tabContents.cards;
                if (cardTab) {
                    cardTab.innerHTML = '';
                    populateCardsTab(cardTab, offer, 'enrolled');
                }

            } catch (err) {
                console.error('Error:', err);
                btn.innerHTML = '× Error - Try Again';
                btn.style.backgroundColor = 'var(--ios-red)';
                ui_showNotification(`Enrollment failed: ${err.message}`, 'error');

                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = `Enroll All Eligible Cards (${offer.eligibleCards.length})`;
                    btn.style.backgroundColor = 'var(--ios-blue)';
                }, 2000);
            }
        }

        function createCardsTable(cardItems, offer) {
            const headers = [
                { label: "Index", key: "cardIndex" },
                { label: "Card", key: "card" },
                { label: "Card Ending", key: "cardEnding" },
                { label: "Name", key: "name" },
                { label: "Type", key: "type" },
                { label: "Action", key: "action" }
            ];

            const colWidths = {
                cardIndex: "60px",
                card: "60px",
                cardEnding: "100px",
                name: "180px",
                type: "80px",
                action: "80px"
            };

            const items = cardItems.map(item => {
                const account = glbVer.get('accounts').find(acc => acc.account_token === item.token);
                if (!account) return null;

                return {
                    _token: item.token,
                    _account: account,
                    status: item.status,
                    cardEnding: account.cardEnding,
                    name: account.embossed_name || '',
                    type: account.relationship || '',
                    card: account.small_card_art || '',
                    cardIndex: account.cardIndex || ''
                };
            }).filter(Boolean);

            items.sort((a, b) => {
                if (a.status !== b.status) {
                    return a.status === 'eligible' ? -1 : 1;
                }
                const [aMain, aSub] = util_parseCardIndex(a.cardIndex);
                const [bMain, bSub] = util_parseCardIndex(b.cardIndex);
                if (aMain === bMain) return aSub - bSub;
                return aMain - bMain;
            });

            const cellRenderer = (item, header) => {
                const key = header.key;
                switch (key) {
                    case 'card':
                        return ui_returnLogo(item.card, `Card ${item.cardEnding}`);
                    case 'cardIndex':
                        const [mainIndex, subIndex] = util_parseCardIndex(item.cardIndex);
                        return ui_createElement('span', {
                            styleString: UI_STYLES.tableCells.index,
                            props: {
                                innerHTML: subIndex ? `<strong>${mainIndex}</strong>-${subIndex}` : `<strong>${mainIndex}</strong>`
                            }
                        });
                    case 'action':
                        return item.status === 'eligible' ? createEnrollButton(item, offer) : createEnrolledLabel();
                    default:
                        return item[key] || '';
                }
            };

            return ui_renderDataTable(headers, colWidths, items, cellRenderer);
        }

        function createEnrollButton(item, offer) {
            return ui_createElement('button', {
                text: 'Enroll',
                styleString: `
                    padding: 4px 10px;
                    background-color: rgba(0, 122, 255, 0.1);
                    color: var(--ios-blue);
                    border: none;
                    border-radius: 8px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                `,
                events: {
                    mouseenter: e => { e.target.style.backgroundColor = 'rgba(0, 122, 255, 0.2)'; },
                    mouseleave: e => { e.target.style.backgroundColor = 'rgba(0, 122, 255, 0.1)'; },
                    click: async e => { await handleSingleEnrollment(e, item._token, offer); }
                }
            });
        }

        function createEnrolledLabel() {
            return ui_createElement('span', {
                text: 'Enrolled',
                styleString: `
                    display: inline-block;
                    padding: 4px 10px;
                    background-color: rgba(52, 199, 89, 0.1);
                    color: var(--ios-green);
                    border-radius: 8px;
                    font-size: 12px;
                `
            });
        }

        async function handleSingleEnrollment(e, token, offer) {
            const btn = e.target;
            const originalHTML = btn.innerHTML;

            btn.innerHTML = '<div class="loading-spinner" style="width:14px;height:14px;border:2px solid rgba(0,122,255,0.3);border-top:2px solid var(--ios-blue);border-radius:50%;animation:spin 1s linear infinite;"></div>';
            btn.style.pointerEvents = 'none';
            btn.disabled = true;

            try {
                console.log(`Attempting to enroll "${offer.name}" on card with token ${token}...`);
                const res = await API.enrollInOffer(token, offer.offerId);

                if (res.result) {
                    const account = glbVer.get('accounts').find(acc => acc.account_token === token);
                    const cardEnding = account ? account.cardEnding : 'unknown';
                    const memberName = account ? account.embossed_name : 'unknown member';

                    console.log(`Enrolled "${offer.name}" on card ${cardEnding} (${memberName}) successfully`);

                    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>';
                    btn.style.backgroundColor = 'var(--ios-green)';
                    btn.style.color = 'white';

                    const idx = offer.eligibleCards.indexOf(token);
                    if (idx !== -1) offer.eligibleCards.splice(idx, 1);
                    if (!offer.enrolledCards.includes(token)) offer.enrolledCards.push(token);

                    API.updateCardOfferCounts();
                    storageOP.saveItem('offers_current');
                    storageOP.saveItem('accounts');
                    statsOP.invalidate('OFFER');
                    renderEngine.markChanged('OFFER');

                    ui_showNotification(`Successfully enrolled "${offer.name}" for card ${cardEnding}`, 'success');

                    const row = btn.closest('tr');
                    if (row) {
                        row.style.transition = 'all 0.5s ease';
                        row.style.opacity = '0';
                        row.style.transform = 'translateX(100%)';

                        setTimeout(() => {
                            row.remove();

                            const eligibleRows = document.querySelectorAll('.accordion-body tr');
                            if (eligibleRows.length === 0) {
                                const closeBtn = document.querySelector('#offer-details-modal button[aria-label="Close"]');
                                if (closeBtn) {
                                    closeBtn.click();
                                    setTimeout(() => {
                                        offer_popCard(offer.offerId, 'enrolled', offer);
                                    }, 300);
                                }
                            }
                        }, 500);
                    }
                } else {
                    console.error(`Failed to enroll "${offer.name}": ${res.explanationMessage || 'Unknown error'}`);
                    handleEnrollmentError(btn, originalHTML, res.explanationMessage);
                }
            } catch (error) {
                console.error(`Error enrolling offer "${offer.name}":`, error);
                handleEnrollmentError(btn, originalHTML, error.message);
            }
        }

        function handleEnrollmentError(btn, originalHTML, errorMessage) {
            btn.innerHTML = '×';
            btn.style.backgroundColor = 'var(--ios-red)';
            btn.style.color = 'white';

            console.error('Enrollment error:', errorMessage);
            if (errorMessage) {
                ui_showNotification(`Enrollment failed: ${errorMessage}`, 'error');
            }

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
                btn.style.color = 'var(--ios-blue)';
                btn.disabled = false;
                btn.style.pointerEvents = 'auto';
            }, 2000);
        }

        function handleEnrollmentError(btn, originalHTML, errorMessage) {
            btn.innerHTML = '×';
            btn.style.backgroundColor = 'var(--ios-red)';
            btn.style.color = 'white';

            console.error('Enrollment error:', errorMessage);
            if (errorMessage) {
                ui_showNotification(`Enrollment failed: ${errorMessage}`, 'error');
            }

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
                btn.style.color = 'var(--ios-blue)';
                btn.disabled = false;
            }, 2000);
        }

        function updateOfferEnrollmentStatus(offer, token, isEnrollment) {
            if (isEnrollment) {
                const idx = offer.eligibleCards.indexOf(token);
                if (idx !== -1) offer.eligibleCards.splice(idx, 1);
                if (!offer.enrolledCards.includes(token)) {
                    offer.enrolledCards.push(token);
                }
            } else {
                const idx = offer.enrolledCards.indexOf(token);
                if (idx !== -1) offer.enrolledCards.splice(idx, 1);
            }

            glbVer.update('offers_current', offers_current => {
                return offers_current.map(o => o.offerId === offer.offerId ?
                    {
                        ...o,
                        eligibleCards: [...offer.eligibleCards],
                        enrolledCards: [...offer.enrolledCards]
                    } : o);
            });

            API.updateCardOfferCounts();
        }

        function populateDetailsTab(container, offer) {
            if (!offer.long_description && !offer.terms) {
                container.appendChild(ui_createBtn({
                    label: 'Load Detailed Information',
                    type: 'primary',
                    customStyle: 'margin:40px auto; display:block;',
                    onClick: async e => {
                        const btn = e.currentTarget;
                        btn.textContent = 'Loading...';
                        btn.disabled = true;

                        try {
                            const account = glbVer.get('accounts').find(acc =>
                                acc.account_status?.trim().toLowerCase() === "active" &&
                                (offer.eligibleCards?.includes(acc.account_token) || offer.enrolledCards?.includes(acc.account_token))
                            );

                            if (account) {
                                const details = await API.fetchOfferDetails(account.account_token, offer.offerId);

                                if (details && (details.terms || details.long_description)) {
                                    offer.terms = details.terms;
                                    offer.long_description = details.long_description;
                                    storageOP.saveItem('offers_current');

                                    populateDetailsTab(container, offer);
                                    populateTermsTab(tabContents.terms, offer);
                                } else {
                                    throw new Error("No detailed information available");
                                }
                            } else {
                                throw new Error("No active card found for this offer");
                            }
                        } catch (error) {
                            btn.textContent = 'Unable to Load Details';
                            setTimeout(() => {
                                btn.textContent = 'Try Again';
                                btn.disabled = false;
                            }, 2000);
                        }
                    }
                }));
            } else if (offer.long_description) {
                container.appendChild(ui_createElement('h3', {
                    text: 'Offer Details',
                    styleString: UI_STYLES.text.subtitle
                }));
                container.appendChild(ui_createElement('div', {
                    text: offer.long_description,
                    styleString: 'font-size:15px; line-height:1.6; color:#333; padding:16px; background-color:rgba(0,0,0,0.02); border-radius:12px;'
                }));
            } else {
                container.appendChild(ui_createElement('div', {
                    text: 'No detailed description available for this offer.',
                    styleString: 'text-align:center; padding:30px; color:#888; background-color:rgba(0,0,0,0.02); border-radius:12px;'
                }));
            }
        }

        function populateTermsTab(container, offer) {
            if (!offer.terms) {
                container.appendChild(ui_createElement('div', {
                    text: 'No terms and conditions available for this offer.',
                    styleString: 'text-align:center; padding:40px 20px; color:#666; background-color:rgba(0,0,0,0.02); border-radius:12px;'
                }));
            } else {
                container.appendChild(ui_createElement('div', {
                    props: { innerHTML: offer.terms },
                    styleString: 'font-size:14px; line-height:1.6; color:#333; padding:16px; background-color:rgba(0,0,0,0.02); border-radius:12px; overflow-wrap: break-word;'
                }));
            }
        }
    }

    // =========================================================================
    // Benefits Page Rendering Functions
    // =========================================================================

    function benefit_renderPage() {
        const benefits = glbVer.get('benefits') || [];
        const containerDiv = ui_createElement('div', {
            styleString: `${UI_STYLES.pageContainer} max-width:1000px; margin:0 auto;`
        });

        // Process benefits data once efficiently
        const { sortedBenefitGroups, statusCounts } = benefit_processAndGroup(benefits);

        // Add benefits overview
        containerDiv.appendChild(benefit_renderStatsSummary(statusCounts));

        // Create status legend
        const statusLegendConfig = {
            'ACHIEVED': { label: 'Completed', color: UI_STYLES.status.achieved.color },
            'IN_PROGRESS': { label: 'In Progress', color: UI_STYLES.status.inProgress.color },
            'NOT_STARTED': { label: 'Not Started', color: UI_STYLES.status.notStarted.color }
        };
        containerDiv.appendChild(benefit_createStatusKey(statusLegendConfig));

        // Handle empty state
        if (!sortedBenefitGroups || sortedBenefitGroups.length === 0) {
            containerDiv.appendChild(createEmptyState());
        } else {
            // Add filter controls with search capability
            containerDiv.appendChild(benefit_createFilters(sortedBenefitGroups));

            // Create benefit accordions with performance optimizations
            const accordionContainer = ui_createElement('div', {
                className: 'accordion-container benefits-accordion',
                styleString: 'display:flex; flex-direction:column; gap:16px;'
            });

            // Use document fragment for better performance
            const fragment = document.createDocumentFragment();
            sortedBenefitGroups.forEach(groupObj => {
                fragment.appendChild(benefit_createExpandableItem(groupObj, statusLegendConfig));
            });

            accordionContainer.appendChild(fragment);
            containerDiv.appendChild(accordionContainer);
        }

        return containerDiv;

        // Local function for empty state
        function createEmptyState() {
            return ui_createElement('div', {
                styleString: 'text-align:center; padding:40px 20px; background-color:rgba(0,0,0,0.02); border-radius:12px; margin-top:20px;',
                children: [
                    ui_createElement('div', {
                        props: {
                            innerHTML: `
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" stroke-width="1.5">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        `},
                        styleString: 'margin-bottom:20px;'
                    }),
                    ui_createElement('h3', {
                        text: 'No Benefits Found',
                        styleString: 'font-size:18px; font-weight:600; margin-bottom:12px; color:#333;'
                    }),
                    ui_createElement('p', {
                        text: 'No benefits are currently available for your cards.',
                        styleString: 'color:#666; margin-bottom:24px;'
                    }),
                    ui_createBtn({
                        label: 'Refresh Benefits',
                        type: 'primary',
                        onClick: async () => {
                            try {
                                const refreshBtn = document.querySelector('.accordion-container ~ div button');
                                if (refreshBtn) {
                                    refreshBtn.disabled = true;
                                    refreshBtn.textContent = 'Refreshing...';
                                }

                                await API.fetchAllBenefits();
                                renderEngine.renderCurrentView(true);

                                ui_showNotification('Benefits refreshed successfully', 'success');
                            } catch (error) {
                                ui_showNotification('Failed to refresh benefits', 'error');
                                console.error('Benefits refresh error:', error);
                            }
                        }
                    })
                ]
            });
        }
    }

    function benefit_processAndGroup(benefits) {
        // Calculate status counts once and efficiently
        const statusCounts = {
            total: benefits.length || 0,
            achieved: 0,
            inProgress: 0,
            notStarted: 0
        };

        // Pre-fetch accounts to avoid repeated lookups
        const accountsMap = new Map();
        glbVer.get('accounts').forEach(acc => {
            accountsMap.set(acc.account_token, acc);
        });

        // Group benefits with enhanced status tracking
        const groupedBenefits = benefits.reduce((grouped, tracker) => {
            const key = tracker.benefitId;

            // Determine status efficiently
            const spentAmount = parseFloat(tracker.tracker?.spentAmount) || 0;
            const targetAmount = parseFloat(tracker.tracker?.targetAmount) || 0;

            if (spentAmount >= targetAmount && targetAmount > 0) {
                tracker.status = "ACHIEVED";
                statusCounts.achieved++;
            } else if (spentAmount > 0) {
                tracker.status = "IN_PROGRESS";
                statusCounts.inProgress++;
            } else {
                tracker.status = "NOT_STARTED";
                statusCounts.notStarted++;
            }

            // Link card info if missing
            if (!tracker.cardEnding && tracker.accountToken) {
                const account = accountsMap.get(tracker.accountToken);
                if (account) {
                    tracker.cardEnding = account.cardEnding;
                    tracker.cardDescription = account.description;
                    tracker.cardArt = account.small_card_art;
                }
            }

            // Add to grouped collection
            grouped[key] = grouped[key] || [];
            grouped[key].push(tracker);

            return grouped;
        }, {});

        const sortedBenefitGroups = benefit_sortBenefits(groupedBenefits);

        return {
            groupedBenefits,
            sortedBenefitGroups,
            statusCounts
        };
    }

    function benefit_sortBenefits(groupedBenefits) {
        // Benefit sorting configuration - extracted for better maintenance
        const BENEFIT_SORT_CONFIG = {
            // Credits
            "200-afc-tracker": { order: 1, newName: "$200 Platinum Flight Credit", category: "Travel" },
            "$200-airline-statement-credit": { order: 2, newName: "$200 Aspire Flight Credit", category: "Travel" },
            "$400-hilton-aspire-resort-credit": { order: 3, newName: "$400 Hilton Aspire Resort Credit", category: "Hotel" },
            "$240 flexible business credit": { order: 4, newName: "$240 Flexible Business Credit", category: "Business" },
            "saks-platinum-tracker": { order: 5, newName: "$100 Saks Credit", category: "Shopping" },
            "$120 dining credit for gold card": { order: 6, newName: "$120 Dining Credit (Gold)", category: "Dining" },
            "$84 dunkin' credit": { order: 7, newName: "$84 Dunkin' Credit", category: "Dining" },
            "$100 resy credit": { order: 8, newName: "$100 Resy Credit", category: "Dining" },
            "hotel-credit-platinum-tracker": { order: 9, newName: "$200 FHR Credit", category: "Hotel" },
            "digital entertainment": { order: 10, newName: "$20 Digital Entertainment Credit", category: "Entertainment" },
            "$199 clear plus credit": { order: 11, newName: "$199 CLEAR Plus Credit", category: "Travel" },
            "walmart+ monthly membership credit": { order: 12, newName: "Walmart+ Membership Credit", category: "Shopping" },
        };

        // Create array of objects with enhanced metadata
        return Object.entries(groupedBenefits).map(([key, group]) => {
            const firstTracker = group[0];
            if (!firstTracker) return null;

            const benefitIdKey = (firstTracker.benefitId || "").toLowerCase().trim();
            const benefitNameKey = (firstTracker.benefitName || "").toLowerCase().trim();

            const sortData = BENEFIT_SORT_CONFIG[benefitIdKey] || BENEFIT_SORT_CONFIG[benefitNameKey];
            const periodInfo = benefit_extractPeriod(firstTracker);

            // Compute tracker statistics once
            const totalAmount = group.reduce((sum, t) => sum + (parseFloat(t.tracker?.spentAmount) || 0), 0);
            const targetAmount = group.reduce((sum, t) => sum + (parseFloat(t.tracker?.targetAmount) || 0), 0);
            const percentComplete = targetAmount > 0 ? Math.min(100, (totalAmount / targetAmount) * 100) : 0;

            return {
                key,
                trackers: group,
                order: sortData?.order || 99,
                displayName: sortData?.newName || firstTracker.benefitName || "",
                category: sortData?.category || benefit_inferCategoryFromTitle(firstTracker),
                periodType: periodInfo.periodType,
                periodLabel: periodInfo.periodLabel,
                totalAmount,
                targetAmount,
                percentComplete,
                trackerCount: group.length
            };
        })
            .filter(Boolean)
            .sort((a, b) => {
                // First by order
                if (a.order !== b.order) return a.order - b.order;
                // Then by category
                if (a.category !== b.category) return a.category.localeCompare(b.category);
                // Then by name
                return a.displayName.localeCompare(b.displayName);
            });
    }

    function benefit_renderStatsSummary(statusCounts) {
        const statsContainer = ui_createElement('div', {
            styleString: 'display:flex; flex-wrap:wrap; gap:16px; margin-bottom:24px; justify-content:center;'
        });

        // Define stats data
        const stats = [
            {
                label: 'Total Benefits',
                value: statusCounts.total || 0,
                color: 'var(--ios-blue)',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/><path d="M7 12h2v5H7v-5zm4-7h2v12h-2V5zm4 4h2v8h-2v-8z"/></svg>'
            },
            {
                label: 'Completed',
                value: statusCounts.achieved || 0,
                color: UI_STYLES.status.achieved.color,
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>'
            },
            {
                label: 'In Progress',
                value: statusCounts.inProgress || 0,
                color: UI_STYLES.status.inProgress.color,
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/></svg>'
            },
            {
                label: 'Not Started',
                value: statusCounts.notStarted || 0,
                color: UI_STYLES.status.notStarted.color,
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M11 7h2v6h-2zm0 8h2v2h-2z"/></svg>'
            }
        ];

        // Create stat cards
        stats.forEach(stat => {
            statsContainer.appendChild(ui_createElement('div', {
                styleString: `${UI_STYLES.cards.stats} border-top:3px solid ${stat.color};`,
                events: {
                    mouseenter: e => e.target.style.transform = 'translateY(-4px)',
                    mouseleave: e => e.target.style.transform = 'translateY(0)'
                },
                children: [
                    ui_createElement('div', {
                        props: { innerHTML: stat.icon },
                        styleString: `margin-bottom:10px; color:${stat.color};`
                    }),
                    ui_createElement('div', {
                        text: stat.value,
                        styleString: `font-size:32px; font-weight:700; color:${stat.color}; margin-bottom:8px;`
                    }),
                    ui_createElement('div', {
                        text: stat.label,
                        styleString: 'font-size:14px; color:#666; text-align:center;'
                    })
                ]
            }));
        });

        return statsContainer;
    }

    function benefit_createStatusKey(statusConfig) {
        return ui_createElement('div', {
            styleString: 'display:flex; gap:15px; margin-bottom:25px; justify-content:center; flex-wrap:wrap; background-color:rgba(255,255,255,0.6); border-radius:12px; padding:12px; box-shadow:0 2px 4px rgba(0,0,0,0.05);',
            children: Object.entries(statusConfig).map(([status, { label, color }]) =>
                ui_createElement('div', {
                    styleString: 'display:flex; align-items:center; gap:8px; padding:8px 12px; border-radius:8px; transition:background-color 0.2s ease;',
                    events: {
                        mouseenter: e => e.target.style.backgroundColor = 'rgba(0,0,0,0.05)',
                        mouseleave: e => e.target.style.backgroundColor = 'transparent'
                    },
                    children: [
                        ui_createElement('div', {
                            styleString: `width:12px; height:12px; border-radius:50%; background-color:${color}; box-shadow:0 1px 3px rgba(0,0,0,0.1);`
                        }),
                        ui_createElement('span', {
                            text: label,
                            styleString: 'color:#333; font-size:14px; font-weight:500;'
                        })
                    ]
                })
            )
        });
    }

    function benefit_createFilters(benefitGroups) {
        // Extract unique categories and period types for filter options
        const categories = [...new Set(benefitGroups.map(group => group.category))].filter(Boolean);
        const periodTypes = [...new Set(benefitGroups.map(group => group.periodType))].filter(Boolean);

        const filterContainer = ui_createElement('div', {
            className: 'benefits-filter-container',
            styleString: `
                display:flex; flex-wrap:wrap; gap:12px; margin-bottom:20px;
                padding:16px; background-color:rgba(255,255,255,0.6);
                border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.05);
                align-items:center;
            `,
            children: [
                createSearchInput(),
                createStatusFilter(),
                createCategoryFilter(categories),
                createPeriodFilter(periodTypes),
                createCardFilter(),
                createResetButton()
            ].filter(Boolean)
        });

        // Apply initial filters on creation
        setTimeout(() => applyFilters(), 100);

        return filterContainer;

        function createSearchInput() {
            const searchWrapper = ui_createElement('div', {
                styleString: 'position:relative; flex:1; min-width:200px;'
            });

            const searchInput = ui_createElement('input', {
                className: 'benefit-search-input',
                props: {
                    type: 'text',
                    placeholder: 'Search benefits...',
                    'aria-label': 'Search benefits'
                },
                styleString: `
                    width:100%; padding:10px 12px; padding-left:36px;
                    border-radius:8px; border:1px solid #ddd;
                    font-size:14px; outline:none; transition:all 0.2s ease;
                `,
                events: {
                    focus: e => {
                        e.target.style.boxShadow = '0 0 0 2px rgba(0, 122, 255, 0.2)';
                        e.target.style.borderColor = 'var(--ios-blue)';
                    },
                    blur: e => {
                        e.target.style.boxShadow = 'none';
                        e.target.style.borderColor = '#ddd';
                    },
                    input: util_debounce(() => applyFilters(), 300)
                }
            });

            searchWrapper.appendChild(searchInput);
            searchWrapper.appendChild(ui_createElement('div', {
                props: {
                    innerHTML: `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    `
                },
                styleString: 'position:absolute; top:50%; left:12px; transform:translateY(-50%);'
            }));

            return searchWrapper;
        }

        function createStatusFilter() {
            return ui_createElement('select', {
                className: 'benefit-status-filter',
                props: {
                    'aria-label': 'Filter by status'
                },
                styleString: `
                    padding:10px 12px; border-radius:8px; border:1px solid #ddd;
                    font-size:14px; outline:none; background-color:white; cursor:pointer;
                `,
                children: [
                    { value: 'all', label: 'All Statuses' },
                    { value: 'ACHIEVED', label: 'Completed' },
                    { value: 'IN_PROGRESS', label: 'In Progress' },
                    { value: 'NOT_STARTED', label: 'Not Started' }
                ].map(option =>
                    ui_createElement('option', {
                        props: { value: option.value },
                        text: option.label
                    })
                ),
                events: {
                    change: () => applyFilters()
                }
            });
        }

        function createCategoryFilter(categories) {
            if (!categories || categories.length <= 1) return null;

            return ui_createElement('select', {
                className: 'benefit-category-filter',
                props: {
                    'aria-label': 'Filter by category'
                },
                styleString: `
                    padding:10px 12px; border-radius:8px; border:1px solid #ddd;
                    font-size:14px; outline:none; background-color:white; cursor:pointer;
                `,
                children: [
                    { value: 'all', label: 'All Categories' },
                    ...categories.map(cat => ({ value: cat.toLowerCase(), label: cat }))
                ].map(option =>
                    ui_createElement('option', {
                        props: { value: option.value },
                        text: option.label
                    })
                ),
                events: {
                    change: () => applyFilters()
                }
            });
        }

        function createPeriodFilter(periodTypes) {
            if (!periodTypes || periodTypes.length <= 1) return null;

            return ui_createElement('select', {
                className: 'benefit-period-filter',
                props: {
                    'aria-label': 'Filter by period'
                },
                styleString: `
                    padding:10px 12px; border-radius:8px; border:1px solid #ddd;
                    font-size:14px; outline:none; background-color:white; cursor:pointer;
                `,
                children: [
                    { value: 'all', label: 'All Periods' },
                    ...periodTypes.map(period => ({
                        value: period.toLowerCase(),
                        label: period.charAt(0).toUpperCase() + period.slice(1)
                    }))
                ].map(option =>
                    ui_createElement('option', {
                        props: { value: option.value },
                        text: option.label
                    })
                ),
                events: {
                    change: () => applyFilters()
                }
            });
        }

        function createCardFilter() {
            const uniqueAccounts = new Set();
            benefitGroups.forEach(group => {
                group.trackers.forEach(tracker => {
                    if (tracker.accountToken) uniqueAccounts.add(tracker.accountToken);
                });
            });

            if (uniqueAccounts.size <= 1) return null;

            const accountOptions = Array.from(uniqueAccounts)
                .map(token => {
                    const account = glbVer.get('accounts').find(acc => acc.account_token === token);
                    return account ? {
                        value: token,
                        label: `Card ending ${account.cardEnding}`
                    } : null;
                })
                .filter(Boolean);

            return ui_createElement('select', {
                className: 'benefit-card-filter',
                props: {
                    'aria-label': 'Filter by card'
                },
                styleString: `
                    padding:10px 12px; border-radius:8px; border:1px solid #ddd;
                    font-size:14px; outline:none; background-color:white; cursor:pointer;
                `,
                children: [
                    { value: 'all', label: 'All Cards' },
                    ...accountOptions
                ].map(option =>
                    ui_createElement('option', {
                        props: { value: option.value },
                        text: option.label
                    })
                ),
                events: {
                    change: () => applyFilters()
                }
            });
        }

        function createResetButton() {
            return ui_createElement('button', {
                className: 'benefit-reset-button',
                text: 'Reset Filters',
                styleString: `
                    padding:10px 16px; border-radius:8px; border:none;
                    background-color:rgba(142, 142, 147, 0.1); color:var(--ios-text-secondary);
                    font-size:14px; cursor:pointer; transition:all 0.2s ease;
                `,
                events: {
                    mouseenter: e => e.target.style.backgroundColor = 'rgba(142, 142, 147, 0.2)',
                    mouseleave: e => e.target.style.backgroundColor = 'rgba(142, 142, 147, 0.1)',
                    click: () => {
                        // Reset all filter elements
                        const filterSelects = document.querySelectorAll('.benefits-filter-container select');
                        const searchInput = document.querySelector('.benefit-search-input');

                        if (searchInput) searchInput.value = '';
                        filterSelects.forEach(select => select.value = 'all');

                        applyFilters();
                    }
                }
            });
        }

        function applyFilters() {
            const searchInput = document.querySelector('.benefit-search-input');
            const statusFilter = document.querySelector('.benefit-status-filter');
            const categoryFilter = document.querySelector('.benefit-category-filter');
            const periodFilter = document.querySelector('.benefit-period-filter');
            const cardFilter = document.querySelector('.benefit-card-filter');

            const searchTerm = (searchInput?.value || '').toLowerCase();
            const selectedStatus = statusFilter?.value || 'all';
            const selectedCategory = categoryFilter?.value || 'all';
            const selectedPeriod = periodFilter?.value || 'all';
            const selectedCardToken = cardFilter?.value || 'all';

            // Apply filters to all accordion items
            const accordionItems = document.querySelectorAll('.accordion-item');
            let visibleCount = 0;

            accordionItems.forEach(item => {
                let visible = true;

                // Text search filter
                if (searchTerm) {
                    const title = item.querySelector('.accordion-title')?.textContent.toLowerCase() || '';
                    if (!title.includes(searchTerm)) visible = false;
                }

                // Status filter
                if (visible && selectedStatus !== 'all') {
                    const hasStatus = item.querySelector(`.mini-card[data-status="${selectedStatus}"]`) !== null;
                    if (!hasStatus) visible = false;
                }

                // Category filter
                if (visible && selectedCategory !== 'all') {
                    const category = item.getAttribute('data-category')?.toLowerCase();
                    if (category !== selectedCategory) visible = false;
                }

                // Period filter
                if (visible && selectedPeriod !== 'all') {
                    const periodType = item.getAttribute('data-period-type')?.toLowerCase();
                    if (periodType !== selectedPeriod) visible = false;
                }

                // Card filter
                if (visible && selectedCardToken !== 'all') {
                    const hasCard = Array.from(item.querySelectorAll('.mini-card'))
                        .some(el => el.getAttribute('data-account-token') === selectedCardToken);
                    if (!hasCard) visible = false;
                }

                // Show or hide the item
                item.style.display = visible ? 'block' : 'none';
                if (visible) visibleCount++;
            });

            // Show empty state if no results
            const emptyState = document.querySelector('.no-results-state');
            if (visibleCount === 0) {
                if (!emptyState) {
                    const noResults = ui_createElement('div', {
                        className: 'no-results-state',
                        styleString: 'text-align:center; padding:30px; background-color:rgba(0,0,0,0.02); border-radius:12px; margin-top:20px;',
                        children: [
                            ui_createElement('div', {
                                text: 'No benefits match your filters',
                                styleString: 'font-size:16px; font-weight:600; margin-bottom:10px;'
                            }),
                            ui_createElement('div', {
                                text: 'Try adjusting your filter criteria',
                                styleString: 'color:#666; font-size:14px;'
                            })
                        ]
                    });

                    const container = document.querySelector('.accordion-container');
                    if (container) {
                        container.appendChild(noResults);
                    }
                }
            } else if (emptyState) {
                emptyState.remove();
            }
        }
    }

    function benefit_createExpandableItem(groupObj, statusConfig) {
        // Pre-calculate status counts once for better performance
        const statusCounts = {};
        groupObj.trackers.forEach(tracker => {
            statusCounts[tracker.status] = (statusCounts[tracker.status] || 0) + 1;
        });

        const accordionItem = ui_createElement('div', {
            className: 'accordion-item',
            styleString: UI_STYLES.accordion.item,
            events: {
                mouseenter: e => {
                    if (!e.currentTarget.classList.contains('active')) {
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
                        e.currentTarget.style.transform = 'translateY(-3px)';
                    }
                },
                mouseleave: e => {
                    if (!e.currentTarget.classList.contains('active')) {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }
                }
            },
            props: {
                'data-category': groupObj.category || 'Other',
                'data-period-type': groupObj.periodType || 'Other',
                'data-trackers': groupObj.trackerCount || 0
            }
        });

        // Set data attributes for filtering
        Object.entries(statusCounts).forEach(([status, count]) => {
            accordionItem.setAttribute(`data-${status.toLowerCase()}-count`, count);
            accordionItem.setAttribute(`data-has-${status.toLowerCase()}`, 'true');
        });

        // Create accordion header
        const headerDiv = ui_createElement('div', {
            className: 'accordion-header',
            styleString: UI_STYLES.accordion.header,
            props: {
                tabIndex: '0',
                role: 'button',
                'aria-expanded': 'false',
                'aria-controls': `accordion-body-${groupObj.key}`
            }
        });

        // Create accordion body with deferred content loading
        const bodyDiv = ui_createElement('div', {
            className: 'accordion-body',
            styleString: UI_STYLES.accordion.body,
            props: {
                id: `accordion-body-${groupObj.key}`,
                'aria-hidden': 'true',
                'data-loaded': 'false'
            }
        });

        // Create header content with better organization
        headerDiv.appendChild(createHeaderContent(groupObj, statusConfig));

        // Create arrow icon
        const arrowIcon = ui_createElement('div', {
            styleString: 'transition:transform 0.3s ease; position:absolute; right:20px; top:20px;',
            props: {
                innerHTML: `
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path d="M7 10l5 5 5-5" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>`
            }
        });
        headerDiv.appendChild(arrowIcon);

        // Store references for easier access
        headerDiv.bodyRef = bodyDiv;
        headerDiv.arrowRef = arrowIcon;
        headerDiv.parentItem = accordionItem;

        // Set up event listeners for accessibility and interaction
        headerDiv.addEventListener('click', e => {
            e.stopPropagation();
            benefit_toggleItemExpansion(headerDiv, true);
        });

        headerDiv.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                benefit_toggleItemExpansion(headerDiv, true);
            }
        });

        accordionItem.appendChild(headerDiv);
        accordionItem.appendChild(bodyDiv);

        return accordionItem;

        // Local function to create header content
        function createHeaderContent(groupObj, statusConfig) {
            return ui_createElement('div', {
                styleString: 'display:flex; flex-direction:column; gap:10px;',
                children: [
                    ui_createElement('div', {
                        styleString: `${UI_STYLES.containers.flexRow} gap:12px;`,
                        children: [
                            ui_createElement('div', {
                                text: groupObj.category || 'Other',
                                styleString: 'font-size:11px; padding:4px 8px; background-color:rgba(0,0,0,0.05); color:#666; border-radius:4px; font-weight:500; align-self:flex-start;'
                            }),

                            groupObj.periodLabel ? ui_createElement('div', {
                                text: groupObj.periodLabel,
                                styleString: 'font-size:12px; padding:4px 10px; background-color:rgba(0,122,255,0.08); color:var(--ios-blue); border-radius:12px; font-weight:500;'
                            }) : null,

                            ui_createElement('div', {
                                styleString: `${UI_STYLES.containers.flexRow} flex:1;`,
                                children: [
                                    benefit_getCategoryIcon(groupObj.category),
                                    ui_createElement('span', {
                                        className: 'accordion-title',
                                        text: groupObj.displayName || "Unnamed Benefit",
                                        styleString: 'font-size:17px; font-weight:600; color:#333;'
                                    })
                                ]
                            })
                        ].filter(Boolean)
                    }),

                    ui_createElement('div', {
                        className: 'mini-bar',
                        styleString: 'display:flex; flex-wrap:wrap; gap:8px; margin-top:12px;',
                        children: groupObj.trackers.map(createTrackerMiniCard)
                    })
                ]
            });
        }

        // Local function to create tracker mini-cards
        function createTrackerMiniCard(tracker) {
            const statusKey = tracker.status === 'ACHIEVED' ? 'achieved' :
                tracker.status === 'IN_PROGRESS' ? 'inProgress' : 'notStarted';
            const statusStyle = UI_STYLES.status[statusKey];

            return ui_createElement('div', {
                className: 'mini-card',
                styleString: `
                    display:flex;
                    align-items:center;
                    gap:6px;
                    padding:6px 10px;
                    border-radius:8px;
                    font-size:13px;
                    color:#444;
                    background-color:${statusStyle.bgColor};
                    border:1px solid ${statusStyle.borderColor};
                    transition:all 0.2s ease;
                `,
                props: {
                    'data-status': tracker.status,
                    'data-account-token': tracker.accountToken || ''
                },
                events: {
                    mouseenter: e => {
                        e.stopPropagation();
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
                    },
                    mouseleave: e => {
                        e.stopPropagation();
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                    }
                },
                children: [
                    ui_createElement('div', {
                        styleString: `width:10px; height:10px; border-radius:50%; background-color:${statusStyle.color}; box-shadow:0 1px 2px rgba(0,0,0,0.1);`
                    }),
                    ui_createElement('span', {
                        className: 'card-ending',
                        text: tracker.cardEnding || 'N/A',
                        styleString: 'font-weight:500;'
                    }),
                    ui_createElement('span', {
                        text: statusConfig[tracker.status]?.label || tracker.status,
                        styleString: 'font-size:11px; opacity:0.8;'
                    })
                ]
            });
        }
    }

    function benefit_toggleItemExpansion(header, scrollIntoView = false) {
        if (!header) return;

        const bodyDiv = header.bodyRef;
        const arrowIcon = header.arrowRef;
        const parentItem = header.parentItem;

        if (!bodyDiv || !arrowIcon || !parentItem) return;

        // Determine current state
        const isOpen = bodyDiv.classList.contains('active');

        // Close all other open accordions first
        document.querySelectorAll('.accordion-header.active').forEach(activeHeader => {
            if (activeHeader !== header && activeHeader.bodyRef) {
                collapseAccordion(activeHeader);
            }
        });

        // Toggle current accordion
        if (!isOpen) {
            expandAccordion(header, bodyDiv, arrowIcon, parentItem, scrollIntoView);
        } else {
            collapseAccordion(header);
        }

        // Helper function to expand accordion with animation
        function expandAccordion(header, bodyDiv, arrowIcon, parentItem, scrollIntoView) {
            // Mark as active
            header.classList.add('active');
            bodyDiv.classList.add('active');
            header.setAttribute('aria-expanded', 'true');
            bodyDiv.setAttribute('aria-hidden', 'false');

            // Apply animations and styling
            arrowIcon.style.transform = 'rotate(180deg)';
            header.style.backgroundColor = '#f0f0f0';
            header.style.borderBottomColor = '#e0e0e0';

            // Lazy load content if not already loaded
            if (bodyDiv.getAttribute('data-loaded') !== 'true') {
                const groupKey = bodyDiv.id.replace('accordion-body-', '');
                const groupObj = benefit_findGroupByKey(groupKey);

                if (groupObj) {
                    const fragment = document.createDocumentFragment();
                    groupObj.trackers.forEach(tracker => {
                        fragment.appendChild(benefit_createProgressCard(tracker, groupObj));
                    });
                    bodyDiv.appendChild(fragment);
                    bodyDiv.setAttribute('data-loaded', 'true');
                }
            }

            // Position it correctly in viewport
            const headerRect = header.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const distanceFromTop = headerRect.top;

            // If header is too low in viewport, scroll it higher to ensure content fits
            if (distanceFromTop > viewportHeight / 3) {
                window.scrollBy({
                    top: distanceFromTop - 100,
                    behavior: 'smooth'
                });
            }

            // Set full height animation
            bodyDiv.style.maxHeight = `${bodyDiv.scrollHeight + 20}px`;
            bodyDiv.style.padding = '0 20px 20px 20px';
            bodyDiv.style.opacity = '1';

            // Apply active styling to parent
            parentItem.style.borderColor = 'var(--ios-blue)';
            parentItem.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
        }

        // Helper function to collapse accordion with animation
        function collapseAccordion(header) {
            const bodyRef = header.bodyRef;
            const arrowRef = header.arrowRef;
            const parentRef = header.parentItem;

            if (!bodyRef || !arrowRef || !parentRef) return;

            // Remove active classes
            header.classList.remove('active');
            bodyRef.classList.remove('active');
            header.setAttribute('aria-expanded', 'false');
            bodyRef.setAttribute('aria-hidden', 'true');

            // Animate transitions
            arrowRef.style.transform = 'rotate(0deg)';
            header.style.backgroundColor = '#f9f9f9';
            header.style.borderBottomColor = 'transparent';
            bodyRef.style.maxHeight = '0';
            bodyRef.style.padding = '0 20px';
            bodyRef.style.opacity = '0';

            // Reset parent styling
            parentRef.style.borderColor = '#e0e0e0';
            parentRef.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        }

        // Helper function to find group object by key
        function benefit_findGroupByKey(key) {
            const benefits = glbVer.get('benefits') || [];
            const { sortedBenefitGroups } = benefit_processAndGroup(benefits);
            return sortedBenefitGroups.find(group => group.key === key);
        }
    }

    function benefit_getCategoryIcon(category) {
        const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        iconSvg.setAttribute('viewBox', '0 0 24 24');
        iconSvg.setAttribute('width', '24');
        iconSvg.setAttribute('height', '24');

        let path = '';
        let color = '#666';

        switch ((category || '').toLowerCase()) {
            case 'travel':
                path = 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z';
                color = '#2196F3';
                break;

            case 'hotel':
                path = 'M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z';
                color = '#9C27B0';
                break;

            case 'dining':
                path = 'M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z';
                color = '#FF5722';
                break;

            case 'entertainment':
                path = 'M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z';
                color = '#E91E63';
                break;

            case 'business':
                path = 'M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z';
                color = '#4CAF50';
                break;

            case 'shopping':
                path = 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z';
                color = '#FF9800';
                break;

            case 'digital':
                path = 'M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L22 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z';
                color = '#00BCD4';
                break;

            case 'airport benefits':
                path = 'M22 16v-2l-8.5-5V3.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5V9L2 14v2l8.5-2.5V19L8 20.5V22l4-1 4 1v-1.5L13.5 19v-5.5L22 16z';
                color = '#3F51B5';
                break;

            default:
                path = 'M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z';
                color = '#607D8B';
        }

        const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathEl.setAttribute('d', path);
        pathEl.setAttribute('fill', color);
        iconSvg.appendChild(pathEl);

        return iconSvg;
    }

    function benefit_extractPeriod(tracker) {
        let periodType = "";
        let periodLabel = "";

        const duration = tracker.trackerDuration.toLowerCase();

        if (duration.includes("month")) {
            periodType = "monthly";
            periodLabel = "Monthly";
        } else if (duration.includes("half")) {
            periodType = "semi-annual";
            periodLabel = "Semi-Annual";
        } else if (duration.includes("quarter")) {
            periodType = "quarterly";
            periodLabel = "Quarterly";

        } else if (duration.includes("year")) {
            periodType = "yearly";
            periodLabel = "Annual";
        }
        else {
            periodType = duration;
            periodLabel = duration.charAt(0).toUpperCase() + duration.slice(1);
        }

        return { periodType, periodLabel };
    }

    function benefit_inferCategoryFromTitle(tracker) {
        const name = (tracker.benefitName || "").toLowerCase();

        if (name.includes("hotel") || name.includes("resort") || name.includes("free night") || name.includes("hilton") || name.includes("marriott")) {
            return "Hotel";
        } else if (name.includes("centurion lounge") || name.includes("delta") || name.includes("airline") || name.includes("flight") || name.includes("travel") || name.includes("delta")) {
            return "Travel";
        } else if (name.includes("dining") || name.includes("restaurant") || name.includes("food")) {
            return "Dining";
        } else if (name.includes("entertainment") || name.includes("streaming")) {
            return "Entertainment";
        } else if (name.includes("business")) {
            return "Business";
        } else if (name.includes("shop") || name.includes("retail") || name.includes("store")) {
            return "Shopping";
        } else {
            return "Other";
        }
    }

    function benefit_createProgressCard(trackerObj, groupObj) {
        const cardAccount = glbVer.get('accounts').find(acc => acc.account_token === trackerObj.accountToken);

        const statusKey = trackerObj.status === 'ACHIEVED' ? 'achieved' :
            trackerObj.status === 'IN_PROGRESS' ? 'inProgress' : 'notStarted';
        const statusStyle = UI_STYLES.status[statusKey];

        const trackerCard = ui_createElement('div', {
            className: 'tracker-card',
            styleString: `${UI_STYLES.cards.benefit} border-left: 4px solid ${statusStyle.color}; padding: 14px 16px 12px;`,
            props: {
                'data-account-token': trackerObj.accountToken || '',
                'data-status': trackerObj.status || '',
                'data-period-type': groupObj.periodType || ''
            },
            events: {
                mouseenter: e => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 5px 12px rgba(0,0,0,0.06)';
                },
                mouseleave: e => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                }
            }
        });

        trackerCard.appendChild(createCardHeader(trackerObj, cardAccount));
        trackerCard.appendChild(createProgressSection(trackerObj, statusStyle.color));

        if (trackerObj.progress && trackerObj.progress.message) {
            trackerCard.appendChild(createMessageSection(trackerObj, statusStyle.color));
        }

        return trackerCard;

        function createCardHeader(tracker, account) {
            return ui_createElement('div', {
                styleString: 'display:flex; justify-content:space-between; margin-bottom:10px; align-items:center;',
                children: [
                    ui_createElement('div', {
                        styleString: 'display:flex; align-items:center; gap:10px; flex:1; min-width:0;',
                        children: [
                            ui_createElement('div', {
                                styleString: 'width:32px; height:32px; border-radius:6px; overflow:hidden; flex-shrink:0; display:flex; align-items:center; justify-content:center;',
                                children: [
                                    ui_returnLogo(
                                        account?.small_card_art,
                                        account?.description || `Card ${tracker.cardEnding}`
                                    )
                                ]
                            }),

                            ui_createElement('div', {
                                styleString: 'display:flex; flex-direction:column; overflow:hidden;',
                                children: [
                                    ui_createElement('div', {
                                        className: 'card-number',
                                        text: `Card •••• ${tracker.cardEnding}`,
                                        styleString: 'font-weight:600; color:#444; font-size:15px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;'
                                    }),
                                    account ? ui_createElement('div', {
                                        text: account.description || '',
                                        styleString: 'font-size:13px; color:#777; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:0px;'
                                    }) : null
                                ].filter(Boolean)
                            })
                        ]
                    }),
                    createDateRange(tracker)
                ]
            });
        }

        function createDateRange(tracker) {
            const now = new Date();
            const startDate = new Date(tracker.periodStartDate);
            const endDate = new Date(tracker.periodEndDate);
            const startDateStr = util_formatDate(tracker.periodStartDate);
            const endDateStr = util_formatDate(tracker.periodEndDate);

            const dateRange = ui_createElement('div', {
                styleString: 'color:#888; font-size:12px; background-color:rgba(0,0,0,0.03); padding:4px 8px; border-radius:6px; flex-shrink:0; text-align:center;'
            });

            let dateRangeText = 'No period available';

            if (startDateStr !== 'N/A' && endDateStr !== 'N/A' && !isNaN(startDate) && !isNaN(endDate)) {
                dateRangeText = `${startDateStr} - ${endDateStr}`;

                if (now <= endDate) {
                    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
                    const remainingColor = daysRemaining <= 7 ? 'var(--ios-orange)' : '#888';

                    dateRange.appendChild(ui_createElement('div', {
                        text: `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`,
                        styleString: `font-size:11px; text-align:center; margin-top:2px; font-weight:${daysRemaining <= 7 ? '600' : '400'}; color:${remainingColor};`
                    }));
                }
            }

            dateRange.prepend(document.createTextNode(dateRangeText));
            return dateRange;
        }

        function createProgressSection(tracker, statusColor) {
            const currencySymbol = tracker.tracker?.targetCurrencySymbol || '$';
            const spentAmount = parseFloat(tracker.tracker?.spentAmount) || 0;
            const targetAmount = parseFloat(tracker.tracker?.targetAmount) || 0;
            const percent = targetAmount > 0 ? Math.min(100, (spentAmount / targetAmount) * 100) : 0;

            return ui_createElement('div', {
                styleString: 'margin:9px 0;',
                children: [
                    ui_createElement('div', {
                        styleString: 'display:flex; justify-content:space-between; margin-bottom:6px; align-items:center;',
                        children: [
                            ui_createElement('div', {
                                props: {
                                    innerHTML: `<span style="color:#999; font-weight:normal;">Progress:</span> ${currencySymbol}${spentAmount.toFixed(2)} of ${currencySymbol}${targetAmount.toFixed(2)}`
                                },
                                styleString: 'font-size:13px; color:#555; font-weight:500;'
                            }),

                            ui_createElement('div', {
                                text: `${percent.toFixed(0)}%`,
                                styleString: `font-size:13px; font-weight:600; color:${percent >= 100 ? 'var(--ios-green)' : percent >= 50 ? 'var(--ios-blue)' : '#555'};`
                            })
                        ]
                    }),

                    benefit_createProgressBar({
                        current: spentAmount,
                        max: targetAmount,
                        barColor: statusColor,
                        height: '10px',
                        animate: true
                    })
                ]
            });
        }

        function createMessageSection(tracker, statusColor) {
            const cleanMessage = tracker.progress.message
                .replace(/\*\*/g, '')
                .replace(/\n\n/g, '<br><br>')
                .replace(/\n/g, ' ');

            return ui_createElement('div', {
                props: { innerHTML: cleanMessage },
                styleString: `
                    margin-top:10px;
                    color:#333;
                    font-size:13px;
                    line-height:1.3;`
            });
        }
    }

    function benefit_createProgressBar(options = {}) {
        const {
            current = 0,
            max = 100,
            barColor = 'var(--ios-blue)',
            height = '12px',
            animate = true,
            showPercentage = false
        } = options;

        const percent = max > 0 ? Math.min(100, (current / max) * 100) : 0;
        const uniqueId = `progress-${Math.random().toString(36).substring(2, 9)}`;

        const progressBarWrapper = ui_createElement('div', {
            className: `progress-bar-wrapper ${uniqueId}`,
            styleString: `
                height: ${height};
                border-radius: 8px;
                background-color: #f0f0f0;
                position: relative;
                overflow: hidden;
                border: 1px solid #ddd;
                width: 100%;
                box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
            `
        });

        const progressFill = ui_createElement('div', {
            className: 'progress-fill',
            styleString: `
                height: 100%;
                position: absolute;
                top: 0;
                left: 0;
                width: 0%;
                background-color: ${barColor};
                transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
            `
        });

        if (showPercentage) {
            progressBarWrapper.appendChild(ui_createElement('div', {
                text: `${Math.round(percent)}%`,
                styleString: `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 10px;
                    font-weight: 600;
                    color: ${percent > 50 ? 'white' : '#333'};
                    z-index: 2;
                    text-shadow: 0 0 2px rgba(0,0,0,0.1);
                `
            }));
        }

        progressBarWrapper.appendChild(progressFill);

        // Use requestAnimationFrame for smoother animation
        if (animate) {
            // Remove any existing animation handler
            window.requestAnimationFrame(() => {
                progressFill.style.width = '0%';

                // Force a reflow to ensure the animation runs every time
                progressFill.offsetWidth;

                // Set a timeout to give a slight delay for better visual effect
                setTimeout(() => {
                    progressFill.style.width = `${percent}%`;
                }, 50);
            });
        } else {
            progressFill.style.width = `${percent}%`;
            progressFill.style.transition = 'none';
        }

        return progressBarWrapper;
    }



    // =========================================================================
    // Section 9: Initialization Functions
    // =========================================================================

    async function auth_init() {
        try {
            const expirationDate = new Date(expiry_date);

            if (new Date() >= expirationDate) {
                ui_showNotification("Code expired on " + expirationDate.toLocaleString(), 'error');
                return 0;
            }

            const tl = await api_verifyTrustLevel();
            if (tl === null | tl < 3) {
                ui_showNotification("Trust level 3+ required", 'error');
                return 0;
            }
            return 1;

            async function api_verifyTrustLevel() {
                return new Promise((resolve) => {
                    GM.xmlHttpRequest({
                        method: "GET",
                        url: endPoints.USCF1,
                        onload: function (response) {
                            if (response.status !== 200) {
                                ui_showNotification("Forum login required-1", 'error');
                                return resolve(0);
                            }
                            const sessionData = JSON.parse(response.responseText);
                            const username = sessionData?.current_user?.username;
                            if (!username) {
                                ui_showNotification("Forum login required-2", 'error');
                                return resolve(0);
                            }
                            GM.xmlHttpRequest({
                                method: "GET",
                                url: endPoints.USCF2 + encodeURIComponent(username) + ".json",
                                onload: function (resp) {

                                    try {
                                        const userData = JSON.parse(resp.responseText);
                                        const trustLevel = userData?.user?.trust_level;
                                        resolve(trustLevel ?? 0);
                                    } catch (e) {
                                        ui_showNotification("Forum login required-3", 'error');
                                        resolve(0);
                                    }

                                },
                                onerror: function (err) {
                                    ui_showNotification("Forum login required-4", 'error');
                                    resolve(0);
                                }
                            });

                        },
                        onerror: function (err) {
                            ui_showNotification("Forum login required-5", 'error');
                            resolve(0);
                        }
                    });
                });
            }
        } catch
        (e) {
            ui_showNotification("Auth Falied", 'error');
            return 0;
        }


    }

    async function initialize() {
        try {
            const authStatus = await auth_init();
            if (!authStatus) {
                return 0;
            }

            const uiElements = ui_createMain();
            renderEngine.initialize(uiElements.content);

            const kickoffStatus = util_antiKickOff.initialize(90000, true);
            if (!kickoffStatus) {
                console.warn("Anti-kickoff initialization failed");
            }

            statsOP.initializeListeners();
            uiElements.refreshStatusEl.textContent = "Loading accounts...";

            const accounts = await API.fetchAccounts(true);
            if (!accounts || accounts.length === 0) {
                throw new Error("No accounts found");
            }

            uiElements.refreshStatusEl.textContent = "Loading saved data...";
            storageOP.setToken(accounts[0].account_token);
            const loadedFromStorage = storageOP.loadAll();

            if (!loadedFromStorage) {
                uiElements.refreshStatusEl.textContent = "Refreshing data...";

                const refreshResult = await API.refreshAllData(progress => {
                    uiElements.refreshStatusEl.textContent = `Refreshing ${progress.type}: ${progress.percent}%`;
                });

                if (!refreshResult.success) {
                    throw new Error(`Failed to refresh data: ${refreshResult.error}`);
                }

                if (refreshResult.newOffers > 0) {
                    ui_showNotification(`Found ${refreshResult.newOffers} new offers`, 'success');
                }
            }

            uiElements.activateButton(uiElements.btnMEMBER, 'MEMBER');
            renderEngine.changeView('MEMBER');

            const date = new Date(glbVer.get('lastUpdate'));
            uiElements.refreshStatusEl.textContent = `Last updated: ${date.toLocaleString()}`;

            util_antiKickOff.forceExtend();

            offer_sortTable_keyUpd('favorite');

            return true;
        } catch (error) {
            console.error("Initialization error:", error);
            ui_showNotification(`Failed to initialize: ${error.message}`, 'error');
            return false;
        }
    }

    document.addEventListener('DOMContentLoaded', initialize);
    initialize();

})();
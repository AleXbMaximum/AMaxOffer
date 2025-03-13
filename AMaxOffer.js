// ==UserScript==
// @name         AMaxOffer
// @version      3.9.5
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
        const MAX_CONCURRENT = 100;
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

        // Update card offer counts
        function updateCardOfferCounts() {
            const accounts = glbVer.get('accounts');
            const offers_current = glbVer.get('offers_current');

            // Reset counts
            accounts.forEach(acc => {
                acc.eligibleOffers = 0;
                acc.enrolledOffers = 0;
            });

            // Update counts based on offers_current
            offers_current.forEach(offer => {
                if (Array.isArray(offer.eligibleCards)) {
                    offer.eligibleCards.forEach(token => {
                        const acc = accounts.find(a => a.account_token === token);
                        if (acc) acc.eligibleOffers = (acc.eligibleOffers || 0) + 1;
                    });
                }

                if (Array.isArray(offer.enrolledCards)) {
                    offer.enrolledCards.forEach(token => {
                        const acc = accounts.find(a => a.account_token === token);
                        if (acc) acc.enrolledOffers = (acc.enrolledOffers || 0) + 1;
                    });
                }
            });

            glbVer.set('accounts', accounts);
        }

        // Improved accounts fetch with parallel processing
        async function fetchAccounts(readonly = false) {
            try {
                const data = await fetchWithCredentials(endPoints.member);
                if (!data || !Array.isArray(data.accounts)) {
                    throw new Error('Invalid account data received');
                }

                const accounts = [];
                let mainCounter = 1;

                data.accounts.forEach(item => {
                    const mainAccount = {
                        cardEnding: item.account?.display_account_number || 'N/A',
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
                    accounts.push(mainAccount);

                    if (Array.isArray(item.supplementary_accounts)) {
                        item.supplementary_accounts.forEach(supp => {
                            const suppIndex = supp.account?.supplementary_index ? parseInt(supp.account.supplementary_index, 10) : 'N/A';
                            const suppAccount = {
                                cardEnding: supp.account?.display_account_number || 'N/A',
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
                            accounts.push(suppAccount);
                        });
                    }
                    mainCounter++;
                });

                if (!readonly && accounts.length > 0) {
                    glbVer.set('accounts', accounts);
                    const storageToken = accounts[0].account_token;
                    storageOP.setToken(storageToken);
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

        // Revised API function to handle offer fetching
        async function refreshOffersList(progressCallback) {
            try {
                const oldOffers = glbVer.get('offers_current') || [];
                const newOfferMap = new Map();
                const stats = { newCount: 0, expiredCount: 0, redeemedCount: 0 };
                const accounts = glbVer.get('accounts');
                const activeAccounts = accounts.filter(acc =>
                    acc.account_status?.trim().toLowerCase() === "active"
                );

                const shouldSkipOffer = (offerName) => {
                    const skipPatterns = [
                        "Your FICO&#174", "The Hotel Collection", "3X on Amex Travel",
                        "Flexible Business Credit", "Apple Pay", "More Coffee",
                        "More Travel", "Send Money to Friends", "Considering a Big Purchase"
                    ];
                    return skipPatterns.some(pattern =>
                        offerName.toLowerCase().includes(pattern.toLowerCase())
                    );
                };

                const totalAccounts = activeAccounts.length;
                const batchSize = MAX_CONCURRENT / 2;
                const results = [];

                for (let i = 0; i < totalAccounts; i += batchSize) {
                    const batchAccounts = activeAccounts.slice(i, i + batchSize);
                    const batchPromises = batchAccounts.map(account => this.fetchOfferList(account.account_token));
                    const batchResults = await Promise.all(batchPromises);
                    results.push(...batchResults);

                    if (progressCallback) {
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

                // Process updates to track expired and redeemed
                const processedOffers = processOfferUpdates(oldOffers, newOfferMap, stats);

                glbVer.set('offers_current', processedOffers);
                updateCardOfferCounts();

                // Mark OFFER view as changed
                renderEngine.markChanged('OFFER');

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

        // Improved batch fetch for benefits with parallel processing
        async function fetchAllBenefits(progressCallback) {
            try {
                const accounts = glbVer.get('accounts');
                const basicAccounts = accounts.filter(acc => acc.relationship === "BASIC");
                const totalAccounts = basicAccounts.length;
                let allTrackers = [];

                // Use batch processing for benefits
                const batchSize = MAX_CONCURRENT / 2; // Process in smaller batches

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
        // Improved batch fetch for balances with parallel processing
        async function fetchAllBalances(progressCallback) {
            try {
                const accounts = glbVer.get('accounts');
                const basicAccounts = accounts.filter(acc => acc.relationship === "BASIC");
                const totalAccounts = basicAccounts.length;

                // Create an updated copy of accounts
                const updatedAccounts = [...accounts];

                // Use batch processing for balances
                const batchSize = MAX_CONCURRENT / 2; // Process in smaller batches

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
        // Enhanced batch enrollment of offers_current with parallel processing
        async function batchEnrollOffers(offerSourceId = null, accountToken = null, options = {}) {
            let totalAttempts = 0;
            let successCount = 0;
            const errors = [];
            const tasks = [];
            const offers_current = glbVer.get('offers_current');
            const accounts = glbVer.get('accounts');
            const priorityCards = glbVer.get('priorityCards');
            const excludedCards = glbVer.get('excludedCards');

            const eligibleOffers = offers_current.filter(offer =>
                offerSourceId ? offer.source_id === offerSourceId : true
            );

            eligibleOffers.forEach(offer => {
                offer.eligibleCards.forEach(cardToken => {
                    if (accountToken && cardToken !== accountToken) return;
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
                            isPriority: priorityCards.includes(account.account_token)
                        });
                    }
                });
            });

            tasks.sort((a, b) => a.isPriority !== b.isPriority ? a.isPriority ? -1 : 1 : 0);

            const batchSize = options.batchSize || MAX_CONCURRENT / 2;
            const results = [];
            const updatedOffers = [...offers_current];

            for (let i = 0; i < tasks.length; i += batchSize) {
                const batch = tasks.slice(i, i + batchSize);
                const batchPromises = batch.map(async task => {
                    if (!task.isPriority) {
                        await new Promise(resolve => setTimeout(resolve, 300));
                    }

                    try {
                        const result = await this.enrollInOffer(task.accountToken, task.offerId);
                        if (result.result) {
                            const offerIndex = updatedOffers.findIndex(o => o.source_id === task.sourceId);
                            if (offerIndex >= 0) {
                                const offer = updatedOffers[offerIndex];
                                const eligibleIndex = offer.eligibleCards.indexOf(task.accountToken);
                                if (eligibleIndex !== -1) {
                                    offer.eligibleCards.splice(eligibleIndex, 1);
                                }
                                if (!offer.enrolledCards.includes(task.accountToken)) {
                                    offer.enrolledCards.push(task.accountToken);
                                }
                            }
                            successCount++;
                        } else {
                            errors.push({
                                offer: task.offerName,
                                card: task.cardEnding,
                                error: result.explanationMessage || 'Enrollment failed'
                            });
                        }
                        totalAttempts++;
                        return result;
                    } catch (error) {
                        totalAttempts++;
                        errors.push({
                            offer: task.offerName,
                            card: task.cardEnding,
                            error: error.message || 'Error occurred'
                        });
                        return {
                            offerId: task.offerId,
                            accountToken: task.accountToken,
                            result: false,
                            explanationMessage: error.message || "Error occurred"
                        };
                    }
                });

                const batchResults = await Promise.all(batchPromises);
                results.push(...batchResults);

                if (i + batchSize < tasks.length) {
                    await new Promise(r => setTimeout(r, 500));
                }
            }

            glbVer.batchUpdate(() => {
                glbVer.set('offers_current', updatedOffers);
                updateCardOfferCounts();
            });

            storageOP.saveDataChanges('enrollment');

            return {
                total: totalAttempts,
                success: successCount,
                errors: errors,
                results: results
            };
        }

        async function refreshAllData(progressCallback) {
            try {
                if (progressCallback) progressCallback({ type: 'accounts', percent: 0 });
                const accounts = await this.fetchAccounts();
                if (accounts.length === 0) throw new Error('No accounts found');

                if (progressCallback) {
                    progressCallback({ type: 'OFFER', percent: 0 });
                    progressCallback({ type: 'BENEFIT', percent: 0 });
                    progressCallback({ type: 'balances', percent: 0 });
                }

                const [offerStats, benefitsResult, balancesResult] = await Promise.all([
                    this.refreshOffersList((type, percent) => {
                        // Map the internal data type to view name for progress reporting
                        const reportType = type === 'offers_current' ? 'OFFER' : type;
                        if (progressCallback) progressCallback({ type: reportType, percent });
                    }),
                    this.fetchAllBenefits((type, percent) => {
                        const reportType = type === 'benefits' ? 'BENEFIT' : type;
                        if (progressCallback) progressCallback({ type: reportType, percent });
                    }),
                    this.fetchAllBalances((type, percent) => {
                        if (progressCallback) progressCallback({ type, percent });
                    })
                ]);

                const now = new Date().toISOString();
                glbVer.set('lastUpdate', now);
                storageOP.saveAll();
                statsOP.invalidate();

                if (progressCallback) progressCallback({ type: 'complete', percent: 100 });

                return {
                    success: true,
                    newOffers: offerStats.newCount,
                    expiredOffers: offerStats.expiredCount,
                    redeemedOffers: offerStats.redeemedCount
                };
            } catch (error) {
                console.error('Error refreshing all data:', error);
                return { success: false, error: error.message };
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

        return {
            get(key) {
                return Array.isArray(data[key]) ? [...data[key]] : data[key];
            },

            set(key, value, options = {}) {
                data[key] = value;
                if (!options.silent) {
                    cache.clear();
                    this.notify(key);
                }
                return this;
            },

            update(key, updater) {
                if (typeof updater === 'function') {
                    data[key] = updater(data[key]);
                }
                cache.clear();
                this.notify(key);
                return this;
            },

            subscribe(key, callback) {
                if (!listeners.has(key)) {
                    listeners.set(key, new Set());
                }
                listeners.get(key).add(callback);
                return () => listeners.get(key).delete(callback);
            },

            notify(key) {
                if (listeners.has(key)) {
                    listeners.get(key).forEach(callback => callback(data[key]));
                }
                if (listeners.has('*')) {
                    listeners.get('*').forEach(callback => callback(data));
                }
            },

            computeWithCache(key, computeFn) {
                if (!cache.has(key)) {
                    cache.set(key, computeFn(data));
                }
                return cache.get(key);
            },

            invalidateCache() {
                cache.clear();
            },

            batchUpdate(updateFn) {
                const notifications = new Set();
                const originalNotify = this.notify;
                this.notify = (key) => notifications.add(key);

                try {
                    updateFn();
                } finally {
                    this.notify = originalNotify;
                    notifications.forEach(key => this.notify(key));
                    if (notifications.has('*')) this.notify('*');
                    this.invalidateCache();
                }
            },

            saveToStorage() {
                return storageOP.saveAll();
            },

            loadFromStorage() {
                return storageOP.loadAll();
            }
        };
    })();


    const storageOP = (() => {
        const PREFIX = "AMaxOffer";
        const storageOpVersion = "3.0";
        let storageToken = "";

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
            const config = storageConfig.get(key);
            const storageKey = config ? config.storageKey : key;
            return `${PREFIX}_${storageKey}_${storageToken}`;
        }

        function compressData(data) {
            try {
                return JSON.stringify(data);
            } catch (e) {
                console.error("Compression error:", e);
                return null;
            }
        }

        function decompressData(compressed) {
            try {
                return JSON.parse(compressed);
            } catch (e) {
                console.error("Decompression error:", e);
                return null;
            }
        }

        return {
            setToken(token) {
                if (!token) throw new Error("Invalid storage token");
                storageToken = token;
                return this;
            },

            getToken() {
                return storageToken;
            },

            saveItem(key) {
                try {
                    const value = glbVer.get(key);
                    const keyConfig = storageConfig.get(key);
                    if (value === undefined) return true;

                    const dataToStore = keyConfig.compress ? compressData(value) : JSON.stringify(value);
                    if (dataToStore === null) return false;

                    localStorage.setItem(getStorageKey(key), dataToStore);
                    return true;
                } catch (error) {
                    console.error(`Error saving ${key} to storage:`, error);
                    return false;
                }
            },

            saveDataChanges(changeType) {
                switch (changeType) {
                    case 'offers_current':
                        this.saveItem('offers_current');
                        statsOP.invalidate('OFFER');
                        renderEngine.markChanged('OFFER');
                        break;
                    case 'accounts':
                        this.saveItem('accounts');
                        statsOP.invalidate('MEMBER');
                        renderEngine.markChanged('MEMBER');
                        break;
                    case 'benefits':
                        this.saveItem('benefits');
                        statsOP.invalidate('BENEFIT');
                        renderEngine.markChanged('BENEFIT');
                        break;
                    case 'preferences':
                        this.saveItem('priorityCards');
                        this.saveItem('excludedCards');
                        renderEngine.renderCurrentView();
                        break;
                    case 'enrollment':
                        this.saveItem('offers_current');
                        statsOP.invalidate('OFFER');
                        renderEngine.markChanged('OFFER');
                        renderEngine.markChanged('MEMBER');
                        break;
                    case 'history':
                        this.saveItem('offers_expired');
                        this.saveItem('offers_redeemed');
                        break;
                    case 'favorite':
                        this.saveItem('offers_current');
                        statsOP.invalidate('OFFER');
                        break;
                    default:
                        this.saveAll();
                }
                return true;
            },

            loadItem(key) {
                if (!storageToken || !storageConfig.has(key)) return false;

                try {
                    const storedValue = localStorage.getItem(getStorageKey(key));
                    if (!storedValue) return false;

                    const keyConfig = storageConfig.get(key);
                    const parsedValue = keyConfig.compress ? decompressData(storedValue) : JSON.parse(storedValue);

                    if (parsedValue !== null) {
                        glbVer.set(key, parsedValue, { silent: true });
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error(`Error loading ${key} from storage:`, error);
                    return false;
                }
            },

            saveAll() {
                if (!storageToken) return false;

                try {
                    localStorage.setItem(getStorageKey("storageOpVersion"), storageOpVersion);
                    let success = true;

                    for (const [key, config] of storageConfig.entries()) {
                        const itemSaved = this.saveItem(key);
                        if (!itemSaved && config.important) {
                            success = false;
                        }
                    }

                    return success;
                } catch (error) {
                    console.error("Error saving all data to storage:", error);
                    return false;
                }
            },

            loadAll() {
                if (!storageToken) return false;

                try {
                    const storedVersion = localStorage.getItem(getStorageKey("storageOpVersion"));
                    if (storedVersion !== storageOpVersion) {
                        console.log("Storage version mismatch, cannot load data");
                        return false;
                    }

                    // Check data freshness
                    const lastUpdateKey = getStorageKey("lastUpdate");
                    const lastUpdate = localStorage.getItem(lastUpdateKey);
                    if (lastUpdate) {
                        const updateDate = new Date(JSON.parse(lastUpdate));
                        const now = new Date();
                        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
                        if ((now - updateDate) > maxAge) {
                            console.log("Stored data is over 24 hours old");
                            return false;
                        }
                    }

                    let success = true;
                    glbVer.batchUpdate(() => {
                        for (const [key, config] of storageConfig.entries()) {
                            const loaded = this.loadItem(key);
                            if (!loaded && config.important) {
                                success = false;
                            }
                        }
                    });

                    return success;
                } catch (error) {
                    console.error("Error loading data from storage:", error);
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
        const filterCache = {
            MEMBER: { lastQuery: null, result: null },
            OFFER: { lastQuery: null, result: null }
        };

        function createFilterHash(view, filterState) {
            return JSON.stringify({
                view,
                filters: Object.entries(filterState)
                    .filter(([key]) =>
                        (view === 'MEMBER' && (key.startsWith('member') || key === 'customFilter')) ||
                        (view === 'OFFER' && (!key.startsWith('member') || key === 'customFilter'))
                    )
                    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
            });
        }

        return {
            getFilters() {
                return { ...filters };
            },

            setFilter(key, value) {
                if (key in filters) {
                    filters[key] = value;
                    if (key.startsWith('member') || key === 'customFilter') {
                        filterCache.MEMBER.lastQuery = null;
                    }
                    if (!key.startsWith('member') || key === 'customFilter') {
                        filterCache.OFFER.lastQuery = null;
                    }
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

                if (affectsMembers) filterCache.MEMBER.lastQuery = null;
                if (affectsOffers) filterCache.OFFER.lastQuery = null;
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
                filterCache.MEMBER.lastQuery = null;
                filterCache.OFFER.lastQuery = null;
                return this;
            },

            applyFilters(viewName) {
                if (!viewName) viewName = renderEngine.getCurrentView();
                filterCache[viewName].lastQuery = null;
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
                const hash = createFilterHash('MEMBER', filters);
                if (filterCache.MEMBER.lastQuery === hash) {
                    return filterCache.MEMBER.result;
                }

                const accounts = glbVer.get('accounts');
                const offers_current = glbVer.get('offers_current');

                const filtered = accounts.filter(acc => {
                    // Status filter
                    const statusMatch = filters.memberStatus === 'all' ||
                        acc.account_status?.trim().toLowerCase() === filters.memberStatus.toLowerCase();
                    if (!statusMatch) return false;

                    // Type filter
                    const typeMatch = filters.memberCardtype === 'all' ||
                        acc.relationship === filters.memberCardtype;
                    if (!typeMatch) return false;

                    // Search filter
                    if (filters.memberMerchantSearch) {
                        const term = filters.memberMerchantSearch.toLowerCase();
                        const accountMatches =
                            (acc.account_token || '').toLowerCase().includes(term) ||
                            (acc.embossed_name || '').toLowerCase().includes(term) ||
                            (acc.description || '').toLowerCase().includes(term);

                        const offerMatches = offers_current.some(offer => {
                            const nameMatch = (offer.name || '').toLowerCase().includes(term);
                            const eligMatch = Array.isArray(offer.eligibleCards) &&
                                offer.eligibleCards.includes(acc.account_token);
                            const enrollMatch = Array.isArray(offer.enrolledCards) &&
                                offer.enrolledCards.includes(acc.account_token);

                            return nameMatch && (eligMatch || enrollMatch);
                        });

                        if (!accountMatches && !offerMatches) return false;
                    }

                    // Custom filter
                    if (typeof filters.customFilter === 'function') {
                        return filters.customFilter(acc);
                    }

                    return true;
                });

                filterCache.MEMBER.lastQuery = hash;
                filterCache.MEMBER.result = filtered;
                return filtered;
            },

            getFilteredOffers() {
                const hash = createFilterHash('OFFER', filters);
                if (filterCache.OFFER.lastQuery === hash) {
                    return filterCache.OFFER.result;
                }

                const offers_current = glbVer.get('offers_current') || [];
                if (!offers_current || !Array.isArray(offers_current)) {
                    console.error("offers_current is not an array:", offers_current);
                    return [];
                }

                const filtered = offers_current.filter(offer => {
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

                filterCache.OFFER.lastQuery = hash;
                filterCache.OFFER.result = filtered;
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
        const cache = {
            members: null,
            offers_current: null,
            benefits: null
        };

        function calculateMembersStats() {
            const accounts = glbVer.get('accounts');
            const stats = {
                totalCards: accounts.length,
                activeCards: accounts.filter(acc => acc.account_status?.trim().toLowerCase() === "active").length,
                basicCards: accounts.filter(acc => acc.relationship === "BASIC").length,
                totalBalance: 0,
                totalPending: 0,
                totalRemaining: 0
            };

            accounts.forEach(acc => {
                if (acc.financialData) {
                    stats.totalBalance += parseFloat(acc.financialData.statement_balance_amount || 0);
                    stats.totalPending += parseFloat(acc.financialData.debits_credits_payments_total_amount || 0);
                    stats.totalRemaining += parseFloat(acc.financialData.remaining_statement_balance_amount || 0);
                }
            });

            return stats;
        }

        function calculateOffersStats() {
            const offers_current = glbVer.get('offers_current');
            const now = new Date();
            const twoWeeksFromNow = new Date(now);
            twoWeeksFromNow.setDate(now.getDate() + 14);

            const stats = {
                totalOffers: offers_current.length,
                favoriteOffers: offers_current.filter(o => o.favorite).length,
                expiringSoon: 0,
                distinctNotFullyEnrolled: 0,
                totalEligible: 0,
                totalEnrolled: 0
            };

            offers_current.forEach(offer => {
                // Count expiring soon
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

                // Count distinct not fully enrolled
                if (eligibleCount > 0) {
                    stats.distinctNotFullyEnrolled++;
                }
            });

            return stats;
        }

        function calculateBenefitsStats(benefits) {
            const benefitsArray = benefits || glbVer.get('benefits');
            const counts = {
                total: benefitsArray.length,
                achieved: 0,
                inProgress: 0,
                notStarted: 0
            };

            benefitsArray.forEach(tracker => {
                const spentAmount = parseFloat(tracker.tracker?.spentAmount) || 0;
                const targetAmount = parseFloat(tracker.tracker?.targetAmount) || 0;

                if (spentAmount >= targetAmount && targetAmount > 0) {
                    counts.achieved++;
                } else if (spentAmount > 0) {
                    counts.inProgress++;
                } else {
                    counts.notStarted++;
                }
            });

            return counts;
        }

        return {
            getMembersStats() {
                if (!cache.members) {
                    cache.members = calculateMembersStats();
                }
                return cache.members;
            },

            getOffersStats() {
                if (!cache.offers_current) {
                    cache.offers_current = calculateOffersStats();
                }
                return cache.offers_current;
            },

            getBenefitsStats(benefits) {
                if (benefits) {
                    return calculateBenefitsStats(benefits);
                }
                if (!cache.benefits) {
                    cache.benefits = calculateBenefitsStats();
                }
                return cache.benefits;
            },

            invalidate(type) {
                const cacheKeyMap = {
                    'MEMBER': 'members',
                    'OFFER': 'offers_current',
                    'BENEFIT': 'benefits'
                };

                const cacheKey = cacheKeyMap[type] || type;

                if (cacheKey in cache) {
                    cache[cacheKey] = null;
                } else {
                    Object.keys(cache).forEach(key => cache[key] = null);
                }
            },

            getStats(type, forceRefresh = false) {
                if (forceRefresh) {
                    this.invalidate(type);
                }

                switch (type) {
                    case 'MEMBER':
                        return this.getMembersStats();
                    case 'OFFER':
                        return this.getOffersStats();
                    case 'BENEFIT':
                        return this.getBenefitsStats();
                    default:
                        return {
                            members: this.getMembersStats(),
                            offers: this.getOffersStats(),
                            benefits: this.getBenefitsStats()
                        };
                }
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

        // Apply styles
        if (styleString) {
            el.style.cssText = styleString;
        } else {
            Object.assign(el.style, styles);
        }

        // Apply properties
        Object.entries(props).forEach(([key, value]) => (el[key] = value));

        // Add children
        children.forEach(child => {
            if (child) el.appendChild(child);
        });

        // Add event listeners
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
            disabled = false
        } = config;

        // Size styles
        const sizeStyles = {
            small: 'padding:6px 12px; font-size:13px;',
            medium: 'padding:10px 16px; font-size:14px;',
            large: 'padding:12px 24px; font-size:16px;'
        };

        // Combine styles
        const styleString = `
            ${UI_STYLES.buttons[type] || UI_STYLES.buttons.primary}
            ${sizeStyles[size] || sizeStyles.medium}
            ${fullWidth ? 'width:100%;' : ''}
            ${maxWidth ? `max-width:${maxWidth};` : ''}
            ${customStyle}
        `;

        const content = icon ? `${icon} ${label}` : label;

        return ui_createElement('button', {
            props: {
                innerHTML: content,
                disabled
            },
            styleString,
            events: {
                click: onClick,
                mouseenter: (e) => {
                    if (disabled) return;
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = UI_STYLES.utils.shadowHover;
                },
                mouseleave: (e) => {
                    if (disabled) return;
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = UI_STYLES.utils.shadow;
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
                display:flex; flex-direction:column; align-items:center;
                justify-content:center; padding:80px 20px; text-align:center;
                background-color:rgba(0,0,0,0.02); border-radius:16px;
                margin:20px 0;
            `,
            children: [
                // Icon
                ui_createElement('div', {
                    styleString: 'margin-bottom:24px; width:100px; height:100px; display:flex; align-items:center; justify-content:center;',
                    props: {
                        innerHTML: `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" stroke-width="1.5">${iconSvg}</svg>`
                    }
                }),

                // Title
                ui_createElement('div', {
                    text: title,
                    styleString: 'font-size:18px; font-weight:600; margin-bottom:12px; color:#1c1c1e;'
                }),

                // Message
                ui_createElement('div', {
                    text: message,
                    styleString: 'font-size:14px; color:var(--ios-gray); max-width:400px; margin:0 auto 24px;'
                }),

                // Button
                ui_createElement('button', {
                    text: buttonText,
                    styleString: `
                        padding:10px 20px; background-color:var(--ios-blue);
                        color:white; border:none; border-radius:10px;
                        font-size:14px; font-weight:500; cursor:pointer;
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

        // Return null if no value provided
        if (!value || value === 'N/A') return null;

        // Set background based on color
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
                mouseenter: (e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = `0 2px 5px ${color}20`;
                },
                mouseleave: (e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                }
            }
        });

        // Create label part if provided
        if (label) {
            const labelSpan = ui_createElement('span', {
                text: `${label}:`,
                styleString: 'opacity: 0.8; font-weight: 400;'
            });
            badge.appendChild(labelSpan);
        }

        // Create value part
        const valueSpan = ui_createElement('span', {
            text: value
        });
        badge.appendChild(valueSpan);

        return badge;
    }

    function ui_createModal(config = {}) {
        const {
            id = 'modal-overlay',
            width = '800px',
            title = '',
            onClose = () => { }
        } = config;

        // Remove existing modal with the same ID
        const existing = document.getElementById(id);
        if (existing) existing.remove();

        // Create overlay with improved accessibility
        const overlay = ui_createElement('div', {
            props: { id, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': `${id}-title` },
            styleString: UI_STYLES.modal.overlay
        });

        // Create modal container
        const modal = ui_createElement('div', {
            styleString: UI_STYLES.modal.container + `max-width: ${width};`,
            props: { role: 'document' }
        });

        // Create header with title and close button
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

        // Close button with improved accessibility
        const closeBtn = ui_createElement('button', {
            props: {
                innerHTML: `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
                `,
                'aria-label': 'Close',
                title: 'Close'
            },
            styleString: UI_STYLES.modal.closeButton,
            events: {
                mouseenter: (e) => {
                    e.target.style.backgroundColor = 'rgba(0,0,0,0.1)';
                    e.target.style.color = '#333';
                },
                mouseleave: (e) => {
                    e.target.style.backgroundColor = 'rgba(0,0,0,0.05)';
                    e.target.style.color = '#666';
                },
                click: () => {
                    // Fade out animation
                    modal.style.transform = 'translateY(40px) scale(0.95)';
                    modal.style.opacity = '0';
                    overlay.style.opacity = '0';

                    // Remove after animation completes and call onClose
                    setTimeout(() => {
                        overlay.remove();
                        onClose();
                    }, 300);
                }
            }
        });

        // Add keyboard accessibility
        overlay.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeBtn.click();
        });

        header.appendChild(closeBtn);
        modal.appendChild(header);

        // Create content container
        const content = ui_createElement('div', {
            styleString: UI_STYLES.modal.content
        });

        modal.appendChild(content);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Set initial focus to the modal for keyboard accessibility
        modal.setAttribute('tabindex', '-1');
        setTimeout(() => modal.focus(), 100);

        // Animate in
        setTimeout(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'translateY(0) scale(1)';
            modal.style.opacity = '1';
        }, 10);

        return {
            overlay,
            modal,
            header,
            content,
            closeBtn
        };
    }

    function ui_createReactiveFilter(container, options = {}) {
        const {
            searchPlaceholder = 'Search...',
            onSearch = () => { },
            initialValue = '',
            onFilterChange = null,
            debounceDelay = 200
        } = options;

        const searchContainer = document.createElement('div');
        searchContainer.className = 'ios-search-container';
        searchContainer.style.cssText = 'position:relative; width:100%; max-width:300px;';

        // Create search input
        const input = document.createElement('input');
        input.className = 'ios-search-input';
        input.type = 'text';
        input.placeholder = searchPlaceholder;
        input.value = initialValue;
        input.style.cssText = UI_STYLES.controls.search;

        // Add icon
        const searchIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        searchIcon.setAttribute('width', '16');
        searchIcon.setAttribute('height', '16');
        searchIcon.setAttribute('viewBox', '0 0 24 24');
        searchIcon.style.cssText = 'color:var(--ios-blue); opacity:0.6; position:absolute; right:10px; top:50%; transform:translateY(-50%); pointer-events:none;';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z');
        path.setAttribute('fill', 'currentColor');
        searchIcon.appendChild(path);

        // Add clear button
        const clearButton = document.createElement('button');
        clearButton.innerHTML = '×';
        clearButton.style.cssText = 'position:absolute; right:30px; top:50%; transform:translateY(-50%); background:none; border:none; font-size:18px; cursor:pointer; color:#999; display:none;';

        // Create debounced update function
        let debounceTimeout;

        const triggerFilterChange = (value) => {
            if (onFilterChange) {
                onFilterChange(value);
            } else {
                renderEngine.renderCurrentView(true);
            }
        };

        // Handle input with debounce
        input.addEventListener('input', function () {
            const searchValue = this.value.toLowerCase();

            // Update filter state immediately
            if (filterOP) {
                filterOP.setFilter('memberMerchantSearch', searchValue);
                filterOP.setFilter('offerMerchantSearch', searchValue);
            }

            // Show/hide clear button immediately
            clearButton.style.display = searchValue ? 'block' : 'none';

            // Call the search handler
            onSearch(searchValue);

            // Show visual feedback that something is happening
            searchIcon.style.color = 'var(--ios-orange)';

            // Debounce the actual filtering/rendering
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                triggerFilterChange(searchValue);
                searchIcon.style.color = 'var(--ios-blue)';
            }, debounceDelay);
        });

        // Clear button functionality
        clearButton.addEventListener('click', () => {
            input.value = '';
            if (filterOP) {
                filterOP.setFilter('memberMerchantSearch', '');
                filterOP.setFilter('offerMerchantSearch', '');
            }
            clearButton.style.display = 'none';

            // Clear any pending debounce
            clearTimeout(debounceTimeout);

            // Immediately trigger update for clearing
            triggerFilterChange('');
            input.focus();
        });

        searchContainer.appendChild(input);
        searchContainer.appendChild(searchIcon);
        searchContainer.appendChild(clearButton);
        container.appendChild(searchContainer);

        return {
            container: searchContainer,
            input: input,
            getValue: () => input.value.toLowerCase(),
            setValue: (val) => {
                input.value = val;
                clearButton.style.display = val ? 'block' : 'none';
            }
        };
    }


    function ui_renderDataTable(headers, colWidths, items, cellRenderer, sortHandler, sortableKeys) {
        const tableElement = document.createElement('table');
        tableElement.className = 'ios-table';
        tableElement.style.cssText = 'width:100%; border-collapse:separate; border-spacing:0; font-size:var(--ios-table-cell-font-size); color:var(--ios-text-secondary); border-radius:var(--ios-table-border-radius); overflow:hidden; box-shadow:var(--ios-shadow-sm); border:var(--ios-border-light); background-color:var(--ios-background); display:table;';

        // Store the cellRenderer for future reference
        tableElement.cellRenderer = cellRenderer;

        // Create header
        const thead = document.createElement('thead');
        thead.className = 'ios-table-head';
        thead.style.cssText = 'background:var(--ios-header-bg); border-bottom:var(--ios-border-light); position:sticky; top:0; z-index:10; backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);';

        const headerRow = document.createElement('tr');

        // Get current sort state
        const currentView = renderEngine.getCurrentView();
        const sortState = currentView ? renderEngine.restoreSortState(currentView) : { key: '', direction: 1 };

        headers.forEach(headerItem => {
            const th = document.createElement('th');
            th.textContent = headerItem.label;
            th.style.cssText = 'padding:var(--ios-table-cell-padding); font-size:var(--ios-table-header-font-size); font-weight:600; color:var(--ios-text-secondary); text-align:center; vertical-align:middle; border-right:var(--ios-border-light);';

            // Apply column width if specified
            if (colWidths && colWidths[headerItem.key]) {
                th.style.width = colWidths[headerItem.key];
            }

            // Add sort functionality
            if (sortableKeys && sortableKeys.includes(headerItem.key) && sortHandler) {
                th.className = 'sortable';
                th.setAttribute('data-sort-key', headerItem.key);
                th.style.position = 'relative';
                th.style.paddingRight = '28px';
                th.style.cursor = 'pointer';

                // Sort indicator container
                const sortButton = document.createElement('div');
                sortButton.className = 'ios-sort-button';
                sortButton.style.cssText = 'position:absolute; right:8px; top:50%; transform:translateY(-50%); display:flex; align-items:center; justify-content:center;';

                // Create sort indicator
                const sortIcon = document.createElement('div');
                sortIcon.className = 'ios-sort-indicator';
                sortIcon.style.cssText = 'width:8px; height:8px; transition:all var(--ios-anim-fast) ease; opacity:0.4;';

                // Set current sort indicator if this column is sorted
                if (sortState.key === headerItem.key) {
                    sortIcon.classList.add('active');
                    sortIcon.classList.add(sortState.direction === 1 ? 'asc' : 'desc');
                    sortIcon.style.opacity = '1';

                    // Show appropriate icon based on sort direction
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
                    // Default unsorted icon
                    sortIcon.innerHTML = `<svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="var(--ios-gray)" stroke-width="1">
                        <path d="M4 1v6M1 4h6"/>
                    </svg>`;
                }

                // Handle click for sorting
                th.addEventListener('click', () => {
                    sortHandler(headerItem.key);

                    // Reset all indicators
                    th.closest('tr').querySelectorAll('.ios-sort-indicator').forEach(icon => {
                        icon.classList.remove('active', 'asc', 'desc');
                        icon.style.opacity = '0.4';
                        icon.innerHTML = `<svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="var(--ios-gray)" stroke-width="1">
                            <path d="M4 1v6M1 4h6"/>
                        </svg>`;
                    });

                    // Animate current sort icon
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

        // Create body
        const tbody = document.createElement('tbody');

        // Handle empty state
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
            // Create rows with optimized rendering
            const fragment = document.createDocumentFragment();
            items.forEach((item, idx) => {
                const row = document.createElement('tr');
                row.style.cssText = 'transition:background-color var(--ios-anim-fast) ease;';

                if (idx % 2 === 1) {
                    row.style.backgroundColor = 'var(--ios-secondary-bg)';
                }

                // Create cells
                headers.forEach(headerItem => {
                    const td = document.createElement('td');
                    td.style.cssText = 'padding:var(--ios-table-cell-padding); border-bottom:var(--ios-border-light); vertical-align:middle; text-align:center;';

                    // Apply column width if specified
                    if (colWidths && colWidths[headerItem.key]) {
                        td.style.width = colWidths[headerItem.key];
                        td.style.maxWidth = colWidths[headerItem.key];
                    }

                    try {
                        // Get content using cell renderer
                        const content = cellRenderer(item, headerItem);

                        // Handle different types of content
                        if (content instanceof Node) {
                            td.appendChild(content);
                        } else if (typeof content === 'string') {
                            // Format currency
                            if (/^\$?\d+(\.\d{2})?$/.test(content)) {
                                const span = document.createElement('span');
                                span.className = 'ios-currency';
                                span.style.cssText = 'font-variant-numeric:tabular-nums; font-weight:500; text-align:center;';
                                span.textContent = content;
                                td.appendChild(span);
                            }
                            // Format status indicators
                            else if (['active', 'inactive', 'pending', 'completed', 'failed', 'success', 'canceled'].includes(content.toLowerCase())) {
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
                            }
                            // Regular text content
                            else {
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

        // Helper function to activate a button with improved feedback
        function activateButton(button, viewName) {
            // Make sure the buttons array is defined
            const allButtons = [
                uiElements.btnMembers,
                uiElements.btnOffers,
                uiElements.btnBenefits
            ].filter(btn => btn);

            // Deactivate all buttons first
            allButtons.forEach(btn => {
                if (btn) {
                    btn.classList.remove('active');
                    btn.style.backgroundColor = 'transparent';
                    btn.style.color = '#333';
                    btn.style.fontWeight = '500';
                    btn.style.boxShadow = 'none';
                }
            });

            // Exit if button is not defined
            if (!button) return;

            // Activate the selected button
            button.classList.add('active');
            button.style.backgroundColor = 'var(--ios-blue)';
            button.style.color = 'white';
            button.style.fontWeight = '600';
            button.style.boxShadow = '0 2px 8px rgba(0, 122, 255, 0.3)';

            // Update document title if viewName is provided
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

    // Toggle the minimized/expanded state of the UI container
    function ui_toggleMinimize(container, uiElements) {
        const isMinimized = container.classList.contains('amaxoffer-minimized');

        container.style.overflow = 'hidden';

        if (isMinimized) {
            // Expanding
            container.classList.remove('amaxoffer-minimized');
            container.classList.add('amaxoffer-expanded');

            setTimeout(() => {
                uiElements.toggleBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>';

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

                // Only force re-render if needed
                if (!currentView || uiElements.content.innerHTML === '' || uiElements.content.textContent === 'Loading...') {
                    renderEngine.renderCurrentView(true);
                }
            }, 50);
        } else {
            // Minimizing - don't hide content elements, just container
            uiElements.toggleBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>';

            container.classList.add('amaxoffer-minimized');
            container.classList.remove('amaxoffer-expanded');

            // Keep content elements in DOM but hide visually
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
        const notifDiv = document.createElement('div');
        notifDiv.className = `amaxoffer-notification ${type}`;
        notifDiv.textContent = message;
        notifDiv.style.cssText = `
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
            background-color: ${type === 'error' ? 'var(--ios-red)' :
                type === 'success' ? 'var(--ios-green)' :
                    'var(--ios-blue)'};
        `;

        document.body.appendChild(notifDiv);

        // Animate in
        setTimeout(() => {
            notifDiv.style.opacity = '1';
            notifDiv.style.transform = 'translateY(0)';
        }, 10);

        // Animate out and remove
        setTimeout(() => {
            notifDiv.style.opacity = '0';
            notifDiv.style.transform = 'translateY(20px)';
            setTimeout(() => notifDiv.remove(), 300);
        }, duration);
    }

    function ui_returnLogo(logoUrl, altText) {
        if (logoUrl && logoUrl !== "N/A") {
            return ui_createElement('div', {
                styleString: 'display:flex; justify-content:center; align-items:center; height:36px;',
                children: [
                    ui_createElement('img', {
                        props: { src: logoUrl, alt: altText || "Logo" },
                        styleString: 'max-width:36px; max-height:36px; border-radius:4px; transition:transform 0.2s ease;',
                        events: {
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
            cardIndex: "60px", small_card_art: "70px", cardEnding: "110px",
            embossed_name: "180px", relationship: "85px", account_setup_date: "100px",
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
                                    text: `→ ${parentCardNum}`,
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

        // Add components sequentially
        containerDiv.appendChild(offer_renderStatsBar());

        // Create tab navigation for current vs history
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

        // Tab click handlers
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

        // Create headers based on type
        const thead = document.createElement('thead');
        thead.className = 'ios-table-head';

        const headerRow = document.createElement('tr');

        const headers = [
            { label: "Name", key: "name" },
            { label: type === 'expired' ? "Expired Date" : "Redeemed Date", key: type === 'expired' ? "expiredDate" : "redeemedDate" }
        ];

        // Add card column for redeemed offers
        if (type === 'redeemed') {
            headers.push({ label: "Redeemed Cards", key: "redeemedCards" });
        }

        // Create header cells
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header.label;
            th.style.cssText = 'padding:12px 16px; text-align:left; border-bottom:1px solid rgba(0,0,0,0.1);';
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        tableElement.appendChild(thead);

        // Create body
        const tbody = document.createElement('tbody');

        // Sort by date descending (newest first)
        const sortedOffers = [...offers_current].sort((a, b) => {
            const dateKey = type === 'expired' ? 'expiredDate' : 'redeemedDate';
            return new Date(b[dateKey]) - new Date(a[dateKey]);
        });

        sortedOffers.forEach((offer, index) => {
            const row = document.createElement('tr');
            row.style.cssText = index % 2 === 0 ? 'background-color:white;' : 'background-color:rgba(0,0,0,0.02);';

            // Name cell
            const nameCell = document.createElement('td');
            nameCell.textContent = offer.name;
            nameCell.style.cssText = 'padding:12px 16px; border-bottom:1px solid rgba(0,0,0,0.05); font-weight:500;';
            row.appendChild(nameCell);

            // Date cell
            const dateCell = document.createElement('td');
            const dateKey = type === 'expired' ? 'expiredDate' : 'redeemedDate';
            const date = new Date(offer[dateKey]);
            dateCell.textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            dateCell.style.cssText = 'padding:12px 16px; border-bottom:1px solid rgba(0,0,0,0.05);';
            row.appendChild(dateCell);

            // Add cards for redeemed offers
            if (type === 'redeemed' && offer.redeemedCards) {
                const cardsCell = document.createElement('td');
                cardsCell.style.cssText = 'padding:12px 16px; border-bottom:1px solid rgba(0,0,0,0.05);';

                offer.redeemedCards.forEach((token, i) => {
                    // Find account by token to get display ending
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
        // Get processed offers
        const processedOffers = filterOP.getFilteredOffers();

        // Handle empty state
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

        // Define table headers and column widths
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

        // Define sortable columns
        const sortableKeys = [
            "favorite", "name", "achievement_type", "category",
            "expiry_date", "threshold", "reward", "percentage",
            "eligibleCards", "enrolledCards"
        ];

        // Create the table
        const tableElement = ui_renderDataTable(headers, colWidths, processedOffers, cellRenderer, offer_sortTable, sortableKeys);

        // Make rows clickable
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
        offer.favorite = !offer.favorite;

        // Find and update the original offer in the glbVer
        glbVer.update('offers_current', offers_current => {
            return offers_current.map(o => o.offerId === offer.offerId ?
                { ...o, favorite: offer.favorite } : o);
        });

        statsOP.invalidate('offers_current');
        storageOP.saveDataChanges('favorite');

        // Update the UI element that triggered this
        const event = window.event;
        if (event && event.target) {
            const favoriteBtn = event.target.closest('button');
            if (favoriteBtn) {
                favoriteBtn.innerHTML = offer.favorite ?
                    '<svg width="18" height="18" viewBox="0 0 24 24" fill="#ff9500"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>' :
                    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#777" stroke-width="2"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
                favoriteBtn.classList.add('ios-sort-animation');
                setTimeout(() => favoriteBtn.classList.remove('ios-sort-animation'), 300);
            }
        }

        const stats = statsOP.getOffersStats();

        // Use the data attribute to directly find the favorites stat item
        const favoritesStatItem = document.querySelector('[data-stat-type="favorites"]');
        if (favoritesStatItem) {
            const countElement = favoritesStatItem.querySelector('[data-stat-value="true"]');
            if (countElement) {
                countElement.textContent = stats.favoriteOffers;
                // Add a brief animation to highlight the change
                countElement.style.transition = 'all 0.3s ease';
                countElement.style.transform = 'scale(1.05)';
                countElement.style.color = offer.favorite ? '#ff9500' : 'rgb(255, 149, 0)';
                setTimeout(() => {
                    countElement.style.transform = 'scale(1)';
                }, 300);
            }
        }
    }

    function offer_sortTable(key) {
        const sortState = renderEngine.restoreSortState('OFFER');
        let direction = sortState.key === key ? sortState.direction * -1 : 1;

        if (key === "favorite" || key === "eligibleCards" || key === "enrolledCards") {
            if (sortState.key !== key) direction = -1;
        }

        renderEngine.saveSortState('OFFER', key, direction);

        const filteredOffers = filterOP.getFilteredOffers();
        let sortedOffers = [...filteredOffers];

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

        if (sortFunctions[key]) {
            sortedOffers.sort(sortFunctions[key]);
        } else {
            sortedOffers.sort((a, b) => direction * (a[key] || "").toString().localeCompare((b[key] || "").toString()));
        }

        // Update the global offers_current list while preserving offers not in the current filtered view
        const allOffers = glbVer.get('offers_current');
        const sortedMap = new Map(sortedOffers.map(offer => [offer.source_id, offer]));

        const updatedOffers = allOffers.map(offer => {
            return sortedMap.get(offer.source_id) || offer;
        });

        glbVer.set('offers_current', updatedOffers);

        const displayContainer = document.getElementById('offers-display-container');
        if (displayContainer) {
            displayContainer.innerHTML = "";
            displayContainer.appendChild(offer_renderTableView());
        }
    }

    function offer_popCard(offerId, mode = 'details', offer = null) {
        const offerObj = offer || glbVer.get('offers_current').find(o => o.offerId === offerId);
        if (!offerObj) return;

        const { overlay, content, closeBtn } = ui_createModal({
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

        const headerInfo = createOfferHeaderInfo(offerObj);
        content.appendChild(headerInfo);
        content.appendChild(tabContainer);

        Object.values(tabContents).forEach(el => content.appendChild(el));

        populateCardsTab(tabContents.cards, offerObj, mode);
        populateDetailsTab(tabContents.details, offerObj);
        populateTermsTab(tabContents.terms, offerObj);

        document.body.appendChild(overlay);

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

        // Cards tab with unified approach for all modes
        function populateCardsTab(container, offer, mode) {
            // Get relevant cards based on mode
            let cardItems = [];

            if (mode === 'eligible') {
                cardItems = offer.eligibleCards.map(token => ({ token, status: 'eligible' }));
            } else if (mode === 'enrolled') {
                cardItems = offer.enrolledCards.map(token => ({ token, status: 'enrolled' }));
            } else {
                // Details mode - show both
                cardItems = [
                    ...offer.eligibleCards.map(token => ({ token, status: 'eligible' })),
                    ...offer.enrolledCards.map(token => ({ token, status: 'enrolled' }))
                ];
            }

            // Add "Enroll All" button for eligible cards
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

            // Add table header
            container.appendChild(ui_createElement('h3', {
                text: `Cards ${cardItems.length > 0 ? `(${cardItems.length})` : ''}`,
                styleString: UI_STYLES.text.subtitle
            }));

            // Handle empty state
            if (cardItems.length === 0) {
                container.appendChild(ui_createElement('div', {
                    text: `No ${mode === 'eligible' ? 'eligible' : mode === 'enrolled' ? 'enrolled' : ''} cards found for this offer.`,
                    styleString: 'text-align:center; padding:30px; color:#888; background:rgba(0,0,0,0.02); border-radius:12px;'
                }));
                return;
            }

            // Create and add cards table
            container.appendChild(createCardsTable(cardItems, offer));
        }

        // Handle enrollment of all cards for an offer
        async function handleEnrollAll(e, offer) {
            const btn = e.currentTarget;

            // Update button state
            btn.innerHTML = '<div class="loading-spinner" style="width:20px;height:20px;border:2px solid rgba(255,255,255,0.3);border-top:2px solid white;border-radius:50%;animation:spin 1s linear infinite;margin-right:8px;"></div>Enrolling...';
            btn.disabled = true;

            try {
                // Save eligible tokens before enrollment
                const eligibleTokens = [...offer.eligibleCards];

                // Perform enrollment
                const result = await API.batchEnrollOffers(offer.source_id);

                if (result.success === 0) {
                    throw new Error("No cards were enrolled successfully");
                }

                // Update button state
                btn.innerHTML = '✓ All Cards Enrolled';
                btn.style.backgroundColor = 'var(--ios-green)';

                // Show success message
                ui_showNotification(`Successfully enrolled ${result.success} cards`, 'success');

                // Update cards table
                updateTableAfterBatchEnrollment(eligibleTokens);

            } catch (err) {
                console.error('Error:', err);

                // Show error state
                btn.innerHTML = '× Error - Try Again';
                btn.style.backgroundColor = 'var(--ios-red)';

                // Show error notification
                ui_showNotification(`Enrollment failed: ${err.message}`, 'error');

                // Reset button after delay
                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = `Enroll All Eligible Cards (${offer.eligibleCards.length})`;
                    btn.style.backgroundColor = 'var(--ios-blue)';
                }, 2000);
            }
        }
        // Create cards table with common style for all modes
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

            // Map card tokens to table items
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

            // Sort: eligible first, then by cardIndex
            items.sort((a, b) => {
                if (a.status !== b.status) {
                    return a.status === 'eligible' ? -1 : 1;
                }
                const [aMain, aSub] = util_parseCardIndex(a.cardIndex);
                const [bMain, bSub] = util_parseCardIndex(b.cardIndex);
                if (aMain === bMain) return aSub - bSub;
                return aMain - bMain;
            });

            // Cell renderer for table
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

            // Create enroll button for eligible card
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

            // Create enrolled label
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

            // Handle enrollment of a single card
            async function handleSingleEnrollment(e, token, offer) {
                const btn = e.target;
                const originalHTML = btn.innerHTML;

                // Update UI to show loading state
                btn.innerHTML = '<div class="spinner" style="width:10px;height:10px;border:1px solid rgba(0,122,255,0.3);border-top:1px solid var(--ios-blue);border-radius:50%;animation:spin 1s linear infinite;margin:0 auto;"></div>';
                btn.disabled = true;

                try {
                    const result = await API.enrollInOffer(token, offer.offerId);

                    if (result.result) {
                        // Success - Update UI and data
                        btn.innerHTML = '✓';
                        btn.style.backgroundColor = 'var(--ios-green)';
                        btn.style.color = 'white';

                        // Update offer data
                        updateOfferEnrollmentStatus(offer, token, true);

                        // Update the row
                        updateUIAfterEnrollment(btn, offer);

                        // Save changes to storage
                        storageOP.saveDataChanges('enrollment');
                    } else {
                        handleEnrollmentError(btn, originalHTML, result.explanationMessage);
                    }
                } catch (error) {
                    console.error('Error enrolling card:', error);
                    handleEnrollmentError(btn, originalHTML, error.message);
                }
            }

            // Handle enrollment error
            function handleEnrollmentError(btn, originalHTML, errorMessage) {
                // Show error state
                btn.innerHTML = '×';
                btn.style.backgroundColor = 'var(--ios-red)';
                btn.style.color = 'white';

                // Log and show error message
                console.error('Enrollment error:', errorMessage);
                if (errorMessage) {
                    ui_showNotification(`Enrollment failed: ${errorMessage}`, 'error');
                }

                // Reset button after delay
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
                    btn.style.color = 'var(--ios-blue)';
                    btn.disabled = false;
                }, 2000);
            }
        }

        // Details tab content
        function populateDetailsTab(container, offer) {
            if (!offer.long_description && !offer.terms) {
                container.appendChild(ui_createBtn({
                    label: 'Load Detailed Information',
                    type: 'primary',
                    customStyle: 'margin:40px auto; display:block;',
                    onClick: async e => loadDetailedInfo(e, offer)
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

            // Load detailed information
            async function loadDetailedInfo(e, offer) {
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
                            // Update offer data
                            offer.terms = details.terms;
                            offer.long_description = details.long_description;
                            storageOP.saveItem('offers_current');

                            // Update UI
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
        }

        // Terms tab content
        function populateTermsTab(container, offer) {
            if (!offer.terms) {
                container.appendChild(ui_createElement('div', {
                    text: 'No terms and conditions available for this offer.',
                    styleString: 'text-align:center; padding:40px 20px; color:#666; background-color:rgba(0,0,0,0.02); border-radius:12px;'
                }));
            } else {
                container.appendChild(ui_createElement('div', {
                    props: { innerHTML: offer.terms },
                    styleString: 'font-size:14px; line-height:1.6; color:#333; padding:16px; background-color:rgba(0,0,0,0.02); border-radius:12px;'
                }));
            }
        }

        function updateOfferEnrollmentStatus(offer, token, isEnrollment) {
            if (isEnrollment) {
                // Remove from eligible, add to enrolled
                const idx = offer.eligibleCards.indexOf(token);
                if (idx !== -1) offer.eligibleCards.splice(idx, 1);
                if (!offer.enrolledCards.includes(token)) {
                    offer.enrolledCards.push(token);
                }
            } else {
                // Remove from enrolled (for potential future unenroll functionality)
                const idx = offer.enrolledCards.indexOf(token);
                if (idx !== -1) offer.enrolledCards.splice(idx, 1);
            }

            // Update global state
            glbVer.update('offers_current', offers_current => {
                return offers_current.map(o => o.offerId === offer.offerId ?
                    {
                        ...o,
                        eligibleCards: [...offer.eligibleCards],
                        enrolledCards: [...offer.enrolledCards]
                    } : o);
            });

            // Update card counts
            API.updateCardOfferCounts();
        }

        function updateUIAfterEnrollment(btn, offer) {
            const row = btn.closest('tr');
            if (!row) return;

            // Update button state
            btn.innerHTML = 'Enrolled';
            btn.style.backgroundColor = 'rgba(52, 199, 89, 0.1)';
            btn.style.color = 'var(--ios-green)';
            btn.disabled = true;

            // Highlight row briefly
            row.style.transition = 'background-color 1.5s ease';
            row.style.backgroundColor = 'rgba(52, 199, 89, 0.1)';
            setTimeout(() => row.style.backgroundColor = '', 1500);

            // Update "Enroll All" button if present
            updateEnrollAllButton(offer);
        }

        function updateEnrollAllButton(offer) {
            const enrollAllBtn = document.querySelector('.accordion-content button, .cards-tab button');
            if (enrollAllBtn && enrollAllBtn.textContent.includes('Enroll All')) {
                const remaining = offer.eligibleCards.length;
                if (remaining === 0) {
                    enrollAllBtn.innerHTML = 'All Cards Enrolled';
                    enrollAllBtn.style.backgroundColor = 'var(--ios-green)';
                    enrollAllBtn.disabled = true;
                } else {
                    enrollAllBtn.innerHTML = `Enroll All Eligible Cards (${remaining})`;
                }
            }
        }

        function updateTableAfterBatchEnrollment(previouslyEligibleTokens) {
            const table = document.querySelector('.cards-tab table');
            if (!table) return;

            // Update rows
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const tokenData = row.getAttribute('data-account-token');
                if (!tokenData || !previouslyEligibleTokens.includes(tokenData)) return;

                const actionCell = row.querySelector('td:last-child');
                const actionBtn = actionCell?.querySelector('button');

                if (actionBtn && actionBtn.textContent === 'Enroll') {
                    // Update button
                    actionBtn.innerHTML = 'Enrolled';
                    actionBtn.style.backgroundColor = 'rgba(52, 199, 89, 0.1)';
                    actionBtn.style.color = 'var(--ios-green)';
                    actionBtn.disabled = true;

                    // Highlight row briefly
                    row.style.transition = 'background-color 1.5s ease';
                    row.style.backgroundColor = 'rgba(52, 199, 89, 0.1)';
                    setTimeout(() => row.style.backgroundColor = '', 1500);
                }
            });
        }

    }

    // =========================================================================
    // Benefits Page Rendering Functions
    // =========================================================================

    function benefit_renderPage() {
        // Ensure we have benefit data
        if (!glbVer.get('benefits') || glbVer.get('benefits').length === 0) {
            // This will be handled by API in real implementation
            console.log("No benefits data available");
        }

        const containerDiv = ui_createElement('div', {
            styleString: `${UI_STYLES.pageContainer} max-width:1000px; margin:0 auto;`
        });

        // Process all data once before rendering
        const { groupedBenefits, sortedBenefitGroups, statusCounts } = benefit_processAndGroup(glbVer.get('benefits'));

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
        if (sortedBenefitGroups.length === 0) {
            containerDiv.appendChild(createEmptyState());
        } else {
            // Add filter controls
            containerDiv.appendChild(benefit_createFilters());

            // Create benefit accordions
            const accordionContainer = ui_createElement('div', {
                className: 'accordion-container',
                styleString: 'display:flex; flex-direction:column; gap:16px;'
            });

            // Add each benefit group as an accordion item
            sortedBenefitGroups.forEach(groupObj => {
                accordionContainer.appendChild(benefit_createExpandableItem(groupObj, statusLegendConfig));
            });

            containerDiv.appendChild(accordionContainer);
        }

        return containerDiv;

        // Create empty state for no benefits
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
                            await API.fetchAllBenefits();
                            renderEngine.renderCurrentView();
                        }
                    })
                ]
            });
        }
    }

    function benefit_processAndGroup(benefits) {
        const statusCounts = statsOP.getBenefitsStats(benefits);

        const groupedBenefits = benefits.reduce((grouped, trackerObj) => {
            const key = trackerObj.benefitId;

            const spentAmount = parseFloat(trackerObj.tracker?.spentAmount) || 0;
            if (spentAmount <= 0) {
                trackerObj.status = "NOT_STARTED";
            }

            if (!trackerObj.cardEnding && trackerObj.accountToken) {
                const account = glbVer.get('accounts').find(acc => acc.account_token === trackerObj.accountToken);
                if (account) {
                    trackerObj.cardEnding = account.cardEnding;
                }
            }

            grouped[key] = grouped[key] || [];
            grouped[key].push(trackerObj);

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
        // Expanded mapping of benefit IDs to display order and custom names
        const benefitSortMapping = {
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
        const groupArray = Object.entries(groupedBenefits).map(([key, group]) => {
            const firstTracker = group[0];
            const benefitIdKey = (firstTracker.benefitId || "").toLowerCase().trim();
            const benefitNameKey = (firstTracker.benefitName || "").toLowerCase().trim();

            const sortData = benefitSortMapping[benefitIdKey] || benefitSortMapping[benefitNameKey];
            const periodInfo = benefit_extractPeriod(firstTracker);

            return {
                key,
                trackers: group,
                order: sortData?.order || Infinity,
                displayName: sortData?.newName || firstTracker.benefitName || "",
                category: sortData?.category || benefit_inferCategoryFromTitle(firstTracker),
                periodType: periodInfo.periodType,
                periodLabel: periodInfo.periodLabel
            };
        });

        // Sort primarily by order, then by category, then by name
        return groupArray.sort((a, b) => {
            // Sort by predefined order first
            if (a.order !== b.order) {
                return a.order - b.order;
            }

            // Then by category if orders are the same
            if (a.category !== b.category) {
                return a.category.localeCompare(b.category);
            }

            // Finally by name
            return (a.displayName || "").localeCompare(b.displayName || "");
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

    function benefit_createFilters() {
        return ui_createElement('div', {
            styleString: `
            display:flex; flex-wrap:wrap; gap:12px; margin-bottom:20px;
            padding:16px; background-color:rgba(255,255,255,0.6);
            border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.05);
            align-items:center;
        `,
            children: [
                createSearchInput(),
                createStatusFilter(),
                createCardFilter(),
                createResetButton()
            ]
        });

        function createSearchInput() {
            const searchWrapper = ui_createElement('div', {
                styleString: 'position:relative; flex:1; min-width:200px;'
            });

            const searchInput = ui_createElement('input', {
                props: {
                    type: 'text',
                    placeholder: 'Search benefits...'
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

        function createCardFilter() {
            // Get unique account tokens directly
            const uniqueAccounts = [...new Set(glbVer.get('benefits').map(benefit => benefit.accountToken))]
                .filter(Boolean)
                .map(token => {
                    const account = glbVer.get('accounts').find(acc => acc.account_token === token);
                    return account ? {
                        value: token,
                        label: `Card ending ${account.cardEnding}`
                    } : null;
                })
                .filter(Boolean);

            return ui_createElement('select', {
                styleString: `
                padding:10px 12px; border-radius:8px; border:1px solid #ddd;
                font-size:14px; outline:none; background-color:white; cursor:pointer;
            `,
                children: [
                    { value: 'all', label: 'All Cards' },
                    ...uniqueAccounts
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
                        const searchInput = document.querySelector('.accordion-container ~ div input');
                        const statusFilter = document.querySelector('.accordion-container ~ div select:nth-of-type(1)');
                        const cardFilter = document.querySelector('.accordion-container ~ div select:nth-of-type(2)');

                        if (searchInput) searchInput.value = '';
                        if (statusFilter) statusFilter.value = 'all';
                        if (cardFilter) cardFilter.value = 'all';

                        applyFilters();
                    }
                }
            });
        }

        function applyFilters() {
            const searchInput = document.querySelector('.accordion-container ~ div input');
            const statusFilter = document.querySelector('.accordion-container ~ div select:nth-of-type(1)');
            const cardFilter = document.querySelector('.accordion-container ~ div select:nth-of-type(2)');

            const searchTerm = searchInput?.value.toLowerCase() || '';
            const selectedStatus = statusFilter?.value || 'all';
            const selectedCardToken = cardFilter?.value || 'all';

            document.querySelectorAll('.accordion-item').forEach(item => {
                const titleText = item.querySelector('.accordion-title')?.textContent.toLowerCase() || '';

                // Status filter
                const hasStatus = selectedStatus === 'all' ||
                    item.querySelector(`.mini-card[data-status="${selectedStatus}"]`);

                // Card filter by account token directly
                const hasCard = selectedCardToken === 'all' ||
                    Array.from(item.querySelectorAll('.mini-card'))
                        .some(el => el.dataset.accountToken === selectedCardToken);

                // Text search filter
                const matchesSearch = searchTerm === '' || titleText.includes(searchTerm);

                // Show/hide based on all filters
                item.style.display = (matchesSearch && hasStatus && hasCard) ? 'block' : 'none';
            });
        }
    }

    function benefit_createExpandableItem(groupObj, statusConfig) {
        const accordionItem = ui_createElement('div', {
            className: 'accordion-item',
            styleString: UI_STYLES.accordion.item,
            events: {
                mouseenter: e => {
                    e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
                    e.target.style.transform = 'translateY(-3px)';
                },
                mouseleave: e => {
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                    e.target.style.transform = 'translateY(0)';
                }
            },
            props: { 'data-category': groupObj.category || 'Other' }
        });

        // Add data attributes for filtering
        groupObj.trackers.forEach(tracker => {
            accordionItem.setAttribute(`data-has-${tracker.status.toLowerCase()}`, 'true');
        });

        // Create header
        const headerDiv = ui_createElement('div', {
            className: 'accordion-header',
            styleString: UI_STYLES.accordion.header
        });

        // Create body with content
        const bodyDiv = ui_createElement('div', {
            className: 'accordion-body',
            styleString: UI_STYLES.accordion.body
        });

        // Add header content
        headerDiv.appendChild(createHeaderContent(groupObj, statusConfig));

        // Add arrow indicator
        const arrowIcon = createArrowIcon();
        headerDiv.appendChild(arrowIcon);

        // Add body content with tracker cards
        bodyDiv.appendChild(createBodyContent(groupObj));

        // Store references for toggle functionality
        headerDiv.bodyRef = bodyDiv;
        headerDiv.arrowRef = arrowIcon;
        headerDiv.parentItem = accordionItem;

        // Add click handler
        headerDiv.addEventListener('click', () => {
            benefit_toggleItemExpansion(headerDiv);
        });

        accordionItem.appendChild(headerDiv);
        accordionItem.appendChild(bodyDiv);

        return accordionItem;

        // Create header content with title, category, indicators
        function createHeaderContent(groupObj, statusConfig) {
            return ui_createElement('div', {
                styleString: 'display:flex; flex-direction:column; gap:10px;',
                children: [
                    // Title section with category badge
                    ui_createElement('div', {
                        styleString: `${UI_STYLES.containers.flexRow} gap:12px;`,
                        children: [
                            // Category badge
                            ui_createElement('div', {
                                text: groupObj.category || 'Other',
                                styleString: 'font-size:11px; padding:4px 8px; background-color:rgba(0,0,0,0.05); color:#666; border-radius:4px; font-weight:500; align-self:flex-start;'
                            }),

                            // Period badge - Moved between category and title
                            groupObj.periodLabel ? ui_createElement('div', {
                                text: groupObj.periodLabel,
                                styleString: 'font-size:12px; padding:4px 10px; background-color:rgba(0,122,255,0.08); color:var(--ios-blue); border-radius:12px; font-weight:500;'
                            }) : null,

                            // Title with icon
                            ui_createElement('div', {
                                styleString: `${UI_STYLES.containers.flexRow} flex:1;`,
                                children: [
                                    benefit_getCategoryIcon(groupObj.category),
                                    ui_createElement('span', {
                                        className: 'accordion-title',
                                        text: groupObj.displayName || groupObj.trackers[0].benefitName || "",
                                        styleString: 'font-size:17px; font-weight:600; color:#333;'
                                    })
                                ]
                            })
                        ].filter(Boolean)
                    }),

                    // Card status indicators
                    ui_createElement('div', {
                        className: 'mini-bar',
                        styleString: 'display:flex; flex-wrap:wrap; gap:8px; margin-top:12px;',
                        children: createStatusIndicators(groupObj, statusConfig)
                    })
                ]
            });
        }

        // Create arrow icon for accordions
        function createArrowIcon() {
            const arrowIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            arrowIcon.setAttribute('viewBox', '0 0 24 24');
            arrowIcon.setAttribute('width', '24');
            arrowIcon.setAttribute('height', '24');
            arrowIcon.style.cssText = 'transition:transform 0.3s ease; position:absolute; right:20px; top:20px;';

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M7 10l5 5 5-5');
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#888');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('stroke-linejoin', 'round');

            arrowIcon.appendChild(path);
            return arrowIcon;
        }

        // Create status indicators for each card
        function createStatusIndicators(groupObj, statusConfig) {
            // Group trackers by card for cleaner display
            const cardTrackers = {};
            groupObj.trackers.forEach(tracker => {
                // Use accountToken for identification
                if (tracker.accountToken) {
                    cardTrackers[tracker.accountToken] = tracker;
                }
            });

            // Create indicators
            return Object.entries(cardTrackers).map(([accountToken, tracker]) => {
                const statusKey = tracker.status === 'ACHIEVED' ? 'achieved' :
                    tracker.status === 'IN_PROGRESS' ? 'inProgress' : 'notStarted';
                const statusStyle = UI_STYLES.status[statusKey];

                return ui_createElement('div', {
                    className: 'mini-card',
                    styleString: `
                    display:flex; align-items:center; gap:6px; padding:6px 10px;
                    border-radius:8px; font-size:13px; color:#444;
                    background-color:${statusStyle.bgColor};
                    border:1px solid ${statusStyle.borderColor};
                    transition:all 0.2s ease;
                `,
                    props: {
                        'data-status': tracker.status,
                        'data-account-token': accountToken
                    },
                    events: {
                        mouseenter: e => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
                        },
                        mouseleave: e => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }
                    },
                    children: [
                        // Status dot
                        ui_createElement('div', {
                            styleString: `width:10px; height:10px; border-radius:50%; background-color:${statusStyle.color}; box-shadow:0 1px 2px rgba(0,0,0,0.1);`
                        }),
                        // Card ending (for display only)
                        ui_createElement('span', {
                            className: 'card-ending',
                            text: tracker.cardEnding,
                            styleString: 'font-weight:500;'
                        }),
                        // Status label
                        ui_createElement('span', {
                            text: statusConfig[tracker.status]?.label || tracker.status,
                            styleString: 'font-size:11px; opacity:0.8;'
                        })
                    ]
                });
            });
        }

        // Create body content with tracker cards
        function createBodyContent(groupObj) {
            return ui_createElement('div', {
                styleString: 'display:flex; flex-direction:column; gap:16px; padding-bottom:20px;',
                children: groupObj.trackers.map(tracker =>
                    benefit_createProgressCard(tracker, groupObj)
                )
            });
        }
    }

    function benefit_toggleItemExpansion(header) {
        const bodyDiv = header.bodyRef;
        const arrowIcon = header.arrowRef;
        const parentItem = header.parentItem;

        // Determine current state
        const isOpen = bodyDiv.classList.contains('active');

        // First close all other open accordions for cleaner UX
        document.querySelectorAll('.accordion-header.active').forEach(activeHeader => {
            if (activeHeader !== header && activeHeader.bodyRef) {
                // Reset previous active item
                const prevBody = activeHeader.bodyRef;
                const prevArrow = activeHeader.arrowRef;
                const prevParent = activeHeader.parentItem;

                // Update classes
                activeHeader.classList.remove('active');
                prevBody.classList.remove('active');

                // Reset styles
                activeHeader.style.backgroundColor = '#f9f9f9';
                activeHeader.style.borderBottomColor = 'transparent';
                prevArrow.style.transform = 'rotate(0deg)';
                prevBody.style.maxHeight = '0';
                prevBody.style.padding = '0 20px';
                prevBody.style.opacity = '0';

                // Reset parent styling
                if (prevParent) {
                    prevParent.style.borderColor = '#e0e0e0';
                    prevParent.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                }
            }
        });

        // Toggle current accordion with improved animation
        if (!isOpen) {
            // Open this accordion
            header.classList.add('active');
            bodyDiv.classList.add('active');

            // Animate transitions
            arrowIcon.style.transform = 'rotate(180deg)';
            header.style.backgroundColor = '#f0f0f0';
            header.style.borderBottomColor = '#e0e0e0';

            // Set max height to content height for animation
            bodyDiv.style.maxHeight = `${bodyDiv.scrollHeight}px`;
            bodyDiv.style.padding = '0 20px 20px 20px';
            bodyDiv.style.opacity = '1';

            // Apply active styling to parent
            if (parentItem) {
                parentItem.style.borderColor = 'var(--ios-blue)';
                parentItem.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
            }

            // Scroll item into view if needed
            setTimeout(() => {
                const headerRect = header.getBoundingClientRect();
                if (headerRect.top < 0 || headerRect.bottom > window.innerHeight) {
                    header.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 300);
        } else {
            // Close this accordion
            header.classList.remove('active');
            bodyDiv.classList.remove('active');

            // Animate transitions
            arrowIcon.style.transform = 'rotate(0deg)';
            header.style.backgroundColor = '#f9f9f9';
            header.style.borderBottomColor = 'transparent';
            bodyDiv.style.maxHeight = '0';
            bodyDiv.style.padding = '0 20px';
            bodyDiv.style.opacity = '0';

            // Reset parent styling
            if (parentItem) {
                parentItem.style.borderColor = '#e0e0e0';
                parentItem.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            }
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
            styleString: `${UI_STYLES.cards.benefit} border-left: 4px solid ${statusStyle.color};`,
            props: { 'data-account-token': trackerObj.accountToken || '' },
            events: {
                mouseenter: e => {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
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
            const cardHeader = ui_createElement('div', {
                styleString: 'display:flex; justify-content:space-between; margin-bottom:16px; align-items:flex-start;'
            });

            const cardInfoContainer = ui_createElement('div', {
                styleString: 'display:flex; align-items:center; gap:12px;'
            });

            const logoContainer = ui_createElement('div', {
                styleString: 'width:36px; height:36px; border-radius:6px; overflow:hidden; flex-shrink:0; display:flex; align-items:center; justify-content:center;'
            });

            const logoElement = ui_returnLogo(
                account?.small_card_art,
                account?.description || `Card ${tracker.cardEnding}`
            );

            logoContainer.appendChild(logoElement);

            const cardDetails = ui_createElement('div', {
                styleString: 'display:flex; flex-direction:column;'
            });

            cardDetails.appendChild(ui_createElement('div', {
                className: 'card-number',
                text: `Card •••• ${tracker.cardEnding}`,
                styleString: 'font-weight:600; color:#444; font-size:15px;'
            }));

            if (account) {
                cardDetails.appendChild(ui_createElement('div', {
                    text: account.description || '',
                    styleString: 'font-size:13px; color:#777;'
                }));
            }

            cardInfoContainer.appendChild(logoContainer);
            cardInfoContainer.appendChild(cardDetails);

            const dateRange = createDateRange(tracker);

            cardHeader.appendChild(cardInfoContainer);
            cardHeader.appendChild(dateRange);

            return cardHeader;
        }

        // Helper function to create date range badge
        function createDateRange(tracker) {
            const dateRange = ui_createElement('div', {
                styleString: 'color:#888; font-size:13px; background-color:rgba(0,0,0,0.03); padding:4px 10px; border-radius:8px;'
            });

            // Format date range with the util_formatDate function
            const startDateStr = util_formatDate(tracker.periodStartDate);
            const endDateStr = util_formatDate(tracker.periodEndDate);

            // Parse raw dates for comparison and calculations
            const startDate = new Date(tracker.periodStartDate);
            const endDate = new Date(tracker.periodEndDate);

            let dateRangeText = 'No period available';
            if (startDateStr !== 'N/A' && endDateStr !== 'N/A' && !isNaN(startDate) && !isNaN(endDate)) {
                dateRangeText = `${startDateStr} - ${endDateStr}`;

                // Add days remaining
                const now = new Date();
                if (now <= endDate) {
                    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
                    dateRange.appendChild(ui_createElement('div', {
                        text: `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`,
                        styleString: 'font-size:12px; text-align:center; margin-top:4px;'
                    }));
                }
            }

            dateRange.prepend(document.createTextNode(dateRangeText));
            return dateRange;
        }

        // Helper function to create progress section
        function createProgressSection(tracker, statusColor) {
            // Format values
            const currencySymbol = tracker.tracker?.targetCurrencySymbol || '$';
            const spentAmount = parseFloat(tracker.tracker?.spentAmount) || 0;
            const targetAmount = parseFloat(tracker.tracker?.targetAmount) || 0;

            // Calculate percentage
            const percent = targetAmount > 0 ? Math.min(100, (spentAmount / targetAmount) * 100) : 0;

            const progressContainer = ui_createElement('div', {
                styleString: UI_STYLES.progress.container
            });

            // Progress header with amounts and percentage
            const progressHeader = ui_createElement('div', {
                styleString: 'display:flex; justify-content:space-between; margin-bottom:10px; align-items:center;'
            });

            // Amount label
            progressHeader.appendChild(ui_createElement('div', {
                props: {
                    innerHTML: `<span style="color:#999; font-weight:normal;">Progress:</span> ${currencySymbol}${spentAmount.toFixed(2)} of ${currencySymbol}${targetAmount.toFixed(2)}`
                },
                styleString: 'font-size:14px; color:#555; font-weight:500;'
            }));

            // Percentage
            progressHeader.appendChild(ui_createElement('div', {
                text: `${percent.toFixed(0)}%`,
                styleString: `font-size:14px; font-weight:600; color:${percent >= 100 ? 'var(--ios-green)' : 'var(--ios-blue)'};`
            }));

            progressContainer.appendChild(progressHeader);

            // Progress bar
            progressContainer.appendChild(benefit_createProgressBar({
                current: spentAmount,
                max: targetAmount,
                barColor: statusColor,
                height: '12px',
                animate: true
            }));

            return progressContainer;
        }

        // Helper function to create message section
        function createMessageSection(tracker, statusColor) {
            return ui_createElement('div', {
                props: {
                    innerHTML: tracker.progress.message
                        .replace(/\*\*/g, '')  // Remove ** formatting
                        .replace(/\n\n/g, '<br><br>')  // Keep paragraph breaks
                        .replace(/\n/g, ' ')  // Replace single newlines with spaces
                },
                styleString: `margin-top:16px;padding:12px 16px;background-color:rgba(0,0,0,0.02);border-radius:12px;color:#333;font-size:14px;line-height:1.5;border-left:3px solid ${statusColor}40;`
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

        // Calculate percentage
        const percent = max > 0 ? Math.min(100, (current / max) * 100) : 0;

        // Create wrapper
        const progressBarWrapper = ui_createElement('div', {
            styleString: `
            height: ${height};
            border-radius: 8px;
            background-color: #f0f0f0;
            position: relative;
            overflow: hidden;
            border: 1px solid #ddd;
            width: 100%;
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);  `
        });

        // Create fill
        const progressFill = ui_createElement('div', {
            styleString: `
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            width: ${animate ? '0' : `${percent}%`};
            background-color: ${barColor};
            transition: width ${animate ? '1s cubic-bezier(0.22, 1, 0.36, 1)' : '0s'};  `
        });

        // Add percentage label if needed
        if (showPercentage) {
            const percentLabel = ui_createElement('div', {
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
            `
            });
            progressBarWrapper.appendChild(percentLabel);
        }

        progressBarWrapper.appendChild(progressFill);

        // Animate progress bar after a short delay if animation is enabled
        if (animate) {
            setTimeout(() => {
                progressFill.style.width = `${percent}%`;
            }, 100);
        }

        return progressBarWrapper;
    }


    // =========================================================================
    // Section 9: Initialization Functions
    // =========================================================================

    async function auth_init() {
        try {
            const expirationDate = new Date("2025-03-20T05:00:00Z");

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

        return true;
    }

    document.addEventListener('DOMContentLoaded', initialize);
    initialize();

})();
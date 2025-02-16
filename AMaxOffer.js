// ==UserScript==
// @name         AMaxOffer
// @namespace    http://tampermonkey.net/
// @version      1.5 Rlease Date 2-16-2025
// @description  None
// @match        https://global.americanexpress.com/*
// @connect      jsdelivr.net
// @connect      uscardforum.com
// @connect      cloudfunctions.net
// @connect      yale.email
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// ==/UserScript==

(function () {
    'use strict';

    // Encoded URL Constants (Base64)
    // ---------------------------
    // Note: You must ensure these strings are complete and correctly encoded.
    const MEMBER_API = "aHR0cHM6Ly9nbG9iYWwuYW1lcmljYW5leHByZXNzLmNvbS9hcGkvc2VydmljaW5nL3YxL21lbWJlcg==";
    // https://global.americanexpress.com/api/servicing/v1/member
    const ENROLL_API = "aHR0cHM6Ly9mdW5jdGlvbnMuYW1lcmljYW5leHByZXNzLmNvbS9DcmVhdGVDYXJkQWNjb3VudE9mZmVyRW5yb2xsbWVudC52MQ==";
    // https://functions.americanexpress.com/CreateCardAccountOfferEnrollment.v1
    const OFFERS_API = "aHR0cHM6Ly9mdW5jdGlvbnMuYW1lcmljYW5leHByZXNzLmNvbS9SZWFkQ2FyZEFjY291bnRPZmZlcnNMaXN0LnYx";
    // https://functions.americanexpress.com/ReadCardAccountOffersList.v1

    // Helper function to decode an encoded URL
    function getUrl(encoded) {
        try {
            return atob(encoded);
        } catch (e) {
            console.error("Error decoding URL:", e, "Encoded string:", encoded);
            return "";
        }
    }

    // ---------------------------
    // Global State Variables
    // ---------------------------
    let accountData = []; // Array of account objects with new keys
    let sortState = { key: "", direction: 1 }; // For members view sorting

    let offerData = []; // Array of aggregated offers (from all accounts)
    let offerSortState = { key: "", direction: 1 }; // For offers view sorting

    let lastUpdate = ""; // Holds the timestamp of the last successful fetch

    let currentView = 'summary'; // "summary", "members", or "offers"
    let isMinimized = true;
    let currentStatusFilter = "Active"; // Options: "all", "Active", "Canceled"
    let currentTypeFilter = "all";    // Options: "all", "BASIC", "SUPP"
    let runInBatchesLimit = 10; // Limit for batch processing

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

    const title = document.createElement('span');
    title.textContent = 'AMaxOffer';

    // View buttons container: Summary, Members, Offer Map
    const viewButtons = document.createElement('div');
    viewButtons.style.display = 'flex';
    viewButtons.style.gap = '40px';

    const btnSummary = document.createElement('button');
    btnSummary.textContent = 'Summary';
    btnSummary.style.cursor = 'pointer';
    btnSummary.style.fontSize = '20px';
    btnSummary.addEventListener('click', () => {
        currentView = 'summary';
        btnSummary.style.fontWeight = 'bold';
        btnMembers.style.fontWeight = 'normal';
        btnOffers.style.fontWeight = 'normal';
        renderCurrentView();
    });

    const btnMembers = document.createElement('button');
    btnMembers.textContent = 'Members';
    btnMembers.style.cursor = 'pointer';
    btnMembers.style.fontSize = '20px';
    btnMembers.addEventListener('click', () => {
        currentView = 'members';
        btnMembers.style.fontWeight = 'bold';
        btnSummary.style.fontWeight = 'normal';
        btnOffers.style.fontWeight = 'normal';
        renderCurrentView();
    });

    const btnOffers = document.createElement('button');
    btnOffers.textContent = 'Offer Map';
    btnOffers.style.cursor = 'pointer';
    btnOffers.style.fontSize = '20px';
    btnOffers.addEventListener('click', () => {
        currentView = 'offers';
        btnOffers.style.fontWeight = 'bold';
        btnSummary.style.fontWeight = 'normal';
        btnMembers.style.fontWeight = 'normal';
        renderCurrentView();
    });

    viewButtons.appendChild(btnSummary);
    viewButtons.appendChild(btnMembers);
    viewButtons.appendChild(btnOffers);

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Minimize';
    toggleBtn.style.cursor = 'pointer';
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

    header.appendChild(title);
    header.appendChild(viewButtons);
    header.appendChild(toggleBtn);

    // Draggable header
    header.style.cursor = 'move';
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

    const content = document.createElement('div');
    content.id = 'card-utility-content';
    content.style.padding = '10px';
    content.style.overflowY = 'auto';
    content.style.maxHeight = 'calc(80vh - 40px)';
    content.innerHTML = 'Loading...';

    async function fetchAccount() {
        try {
            const res = await fetch(getUrl(MEMBER_API), {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) {
                console.error('Failed to fetch account data (status not OK)');
                return false; // <-- indicate failure
            }

            const data = await res.json();
            if (!data || !Array.isArray(data.accounts)) {
                throw new Error('Invalid account data received');
                return false; // <-- indicate failure
            }
            accountData = [];
            let mainCounter = 1;

            data.accounts.forEach(item => {
                // Build map for main (BASIC) account. Use only the first account_status if array.
                const mainAccount = {
                    display_account_number: item.account?.display_account_number || 'N/A',
                    relationship: item.account?.relationship || 'N/A',
                    supplementary_index: item.account?.supplementary_index || 'N/A',
                    account_status: Array.isArray(item.status?.account_status)
                        ? item.status.account_status[0] // take only the first status
                        : (item.status?.account_status || 'N/A'),
                    days_past_due: (item.status?.days_past_due !== undefined) ? item.status.days_past_due : 'N/A',
                    account_setup_date: item.status?.account_setup_date || 'N/A',
                    description: item.product?.description || 'N/A',
                    small_card_art: item.product?.small_card_art || 'N/A',
                    embossed_name: item.profile?.embossed_name || 'N/A',
                    account_token: item.account_token || 'N/A',
                    cardIndex: mainCounter.toString()
                };
                accountData.push(mainAccount);

                // Process supplementary accounts
                if (Array.isArray(item.supplementary_accounts)) {
                    item.supplementary_accounts.forEach(supp => {
                        const suppIndex = supp.account?.supplementary_index ? parseInt(supp.account.supplementary_index, 10) : 'N/A';
                        const suppAccount = {
                            display_account_number: supp.account?.display_account_number || 'N/A',
                            relationship: supp.account?.relationship || 'N/A',
                            supplementary_index: supp.account?.supplementary_index || 'N/A',
                            account_status: Array.isArray(supp.status?.account_status)
                                ? supp.status.account_status[0]
                                : (supp.status?.account_status || 'N/A'),
                            days_past_due: (supp.status?.days_past_due !== undefined) ? supp.status.days_past_due : 'N/A',
                            account_setup_date: supp.status?.account_setup_date || 'N/A',
                            description: supp.product?.description || 'N/A',
                            small_card_art: supp.product?.small_card_art || 'N/A',
                            embossed_name: supp.profile?.embossed_name || 'N/A',
                            account_token: supp.account_token || 'N/A',
                            cardIndex: `${mainCounter}-${suppIndex}`
                        };
                        accountData.push(suppAccount);
                    });
                }
                mainCounter++;
            });

            // Set default view and update UI

            btnSummary.style.fontWeight = 'bold';
            renderCurrentView();
            return true; // <-- indicate success

        } catch (error) {
            console.error('Error fetching account data:', error);
            content.innerHTML = `<p style="color: red;">Error fetching account data: ${error.message}</p>`;
            return false; // <-- indicate failure
        }
    }

    // ---------------------------
    // Render Members View (using new keys)
    // ---------------------------
    function renderMembersView() {
        const container = document.createElement('div');

        // Create a container for both filters in one line
        const filtersDiv = document.createElement('div');
        filtersDiv.style.display = 'flex';
        filtersDiv.style.alignItems = 'center';
        filtersDiv.style.gap = '20px';
        filtersDiv.style.marginBottom = '10px';

        // Filter by Status control
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

        // Filter by Type control
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

        container.appendChild(filtersDiv);
        container.appendChild(renderMembersTable());
        return container;
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
            { label: "Days Past Due", key: "days_past_due" },
            { label: "Eligible Offers", key: "eligibleOffers" },
            { label: "Enrolled Offers", key: "enrolledOffers" }
        ];
        const colWidths = {
            small_card_art: "60px",
            display_account_number: "80px",
            embossed_name: "150px",
            relationship: "80px",
            cardIndex: "80px",
            account_setup_date: "80px",
            account_status: "80px",
            days_past_due: "80px",
            eligibleOffers: "80px",
            enrolledOffers: "80px"
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
            th.setAttribute('data-sort-key', headerItem.key);
            th.addEventListener('click', () => sortData(headerItem.key));
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Apply filters: Status and Type
        const filteredAccounts = accountData.filter(acc => {
            const statusMatch =
                currentStatusFilter === 'all' ||
                acc.account_status.trim().toLowerCase() === currentStatusFilter.toLowerCase();
            const typeMatch =
                currentTypeFilter === 'all' ||
                acc.relationship === currentTypeFilter;
            return statusMatch && typeMatch;
        });

        // Build table body with filtered accounts
        const tbody = document.createElement('tbody');
        filteredAccounts.forEach(item => {
            const row = document.createElement('tr');
            if (item.relationship === "BASIC") {
                row.style.fontWeight = 'bold';
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
                } else {
                    td.textContent = item[headerItem.key];
                }
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        return table;
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
        const cleaned = str
            .replace(/[$,%]/g, '') // remove $, commas, and %
            .replace(/\s*back\s*/i, '') // if “back” appears
            .trim();
        return parseFloat(cleaned) || NaN;
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

    // ---------------------------
    // Offers & Mapping
    // ---------------------------
    async function fetchOffersForAccount(accountToken) {
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
            const res = await fetch(getUrl(OFFERS_API), {
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

    function parseOfferDetails(description = "") {
        // Helpers for conversion
        const parseDollar = (str) => parseFloat(str.replace(/[,\$]/g, ""));
        const toMoneyString = (num) => {
            if (num == null || isNaN(num)) return null;
            return `$${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        };

        // We'll store numeric forms here
        let thresholdVal = null;
        let rewardVal = null;
        let percentageVal = null;

        // For returning final results (as strings)
        let threshold = null;
        let reward = null;
        let percentage = null;

        // Additional fields
        let times = null;
        let total = null;

        // 1) Parse threshold: e.g. "Spend $500"
        {
            const spendRegex = /Spend\s*\$(\d[\d,\.]*)/i;
            const spendMatch = description.match(spendRegex);
            if (spendMatch) {
                thresholdVal = parseDollar(spendMatch[1]);
            }
        }

        // 2) Parse explicit percentage offers: e.g. "Earn 10% back" or "Get 5% back"
        {
            const percentRegex = /(?:Earn|Get)\s+(\d+(\.\d+)?)%\s*back/i;
            const percentMatch = description.match(percentRegex);
            if (percentMatch) {
                percentageVal = parseFloat(percentMatch[1]);
            }
        }

        // 2A) Parse Membership Rewards® points per dollar (interpreted as a percentage)
        //     e.g. "Earn +1 Membership Rewards® point per eligible dollar spent"
        {
            const mrPointsPerDollarRegex = /Earn\s*\+?(\d+)\s*Membership Rewards(?:®)?\s*points?\s*per\s*(?:eligible\s*)?dollar spent/i;
            const mrPointsPerDollarMatch = description.match(mrPointsPerDollarRegex);
            if (mrPointsPerDollarMatch) {
                const mrPointsEachDollar = parseFloat(mrPointsPerDollarMatch[1]);
                if (!percentageVal) {
                    percentageVal = mrPointsEachDollar;
                }
                // "up to X points" in this context sets reward limit in dollars (each point = 1 cent)
                const mrPointsCapRegex = /up to\s*(\d[\d,\.]*)\s*points/i;
                const mrPointsCapMatch = description.match(mrPointsCapRegex);
                if (mrPointsCapMatch) {
                    const capVal = parseDollar(mrPointsCapMatch[1]);
                    rewardVal = capVal * 0.01;
                }
            }
        }

        // 3) Parse reward amounts given as dollars, e.g. "earn $XX" or "up to a total of $XX"
        {
            // a) (earn|get) $XX – ignoring "back"
            const earnGetRegex = /(?:earn|get)\s*\$(\d[\d,\.]*)/i;
            const earnGetMatch = description.match(earnGetRegex);
            if (earnGetMatch) {
                rewardVal = parseDollar(earnGetMatch[1]);
            }
            // b) "up to a total of $XX" or "up to $XX"
            const upToTotalRegex = /up to (?:a total of )?\$(\d[\d,\.]*)/i;
            const upToTotalMatch = description.match(upToTotalRegex);
            if (upToTotalMatch) {
                rewardVal = parseDollar(upToTotalMatch[1]);
            }
        }

        // 3A) Parse reward amounts given as a flat number of points (without a "per" clause)
        //     e.g. "earn 10,000 Membership Rewards® points"
        {
            const mrPointsRewardRegex = /Earn\s+([\d,]+)\s*Membership Rewards(?:®)?\s*points(?!\s*per)/i;
            const mrPointsRewardMatch = description.match(mrPointsRewardRegex);
            if (mrPointsRewardMatch) {
                const points = parseInt(mrPointsRewardMatch[1].replace(/,/g, ""), 10);
                rewardVal = points * 0.01;
            }
        }

        // 4) Parse times limit: e.g. "up to X times"
        {
            const upToTimesRegex = /up to\s+(\d+)\s+times?/i;
            const upToTimesMatch = description.match(upToTimesRegex);
            if (upToTimesMatch) {
                times = upToTimesMatch[1];
            }
        }

        // 5) Parse parenthetical total: e.g. "(total of $XX)"
        {
            const totalOfRegex = /\(total of\s*\$(\d[\d,\.]*)\)/i;
            const totalOfMatch = description.match(totalOfRegex);
            if (totalOfMatch) {
                total = toMoneyString(parseDollar(totalOfMatch[1]));
            }
        }

        // Determine which values are available
        const haveThreshold = (thresholdVal != null && !isNaN(thresholdVal));
        const haveReward = (rewardVal != null && !isNaN(rewardVal));
        const havePercent = (percentageVal != null && !isNaN(percentageVal));

        // Compute the missing value based on the available two:
        if (haveThreshold && haveReward && !havePercent && thresholdVal > 0) {
            // Compute percentage = (reward / threshold) * 100
            percentageVal = (rewardVal / thresholdVal) * 100;
        } else if (haveThreshold && havePercent && !haveReward) {
            // Compute reward = threshold * (percentage / 100)
            rewardVal = thresholdVal * (percentageVal / 100);
        } else if (haveReward && havePercent && !haveThreshold && percentageVal !== 0) {
            // Compute threshold = reward / (percentage / 100)
            thresholdVal = rewardVal / (percentageVal / 100);
        } else if (havePercent && !haveThreshold && !haveReward) {
            // If only a percentage is provided, default threshold of $10,000
            thresholdVal = 10000;
            rewardVal = thresholdVal * (percentageVal / 100);
        }

        // Convert numeric values back to formatted strings
        if (thresholdVal != null) {
            threshold = toMoneyString(thresholdVal);
        }
        if (rewardVal != null) {
            reward = toMoneyString(rewardVal);
        }
        if (percentageVal != null) {
            const rounded = Math.round(percentageVal * 10) / 10;
            percentage = `${rounded}%`;
        }

        return {
            threshold,   // e.g., "$500.00"
            reward,      // e.g., "$100.00"
            percentage,  // e.g., "20%"
            times,       // e.g., null
            total        // e.g., null
        };
    }

    function sortOfferData(key) {
        if (offerSortState.key === key) {
            offerSortState.direction *= -1;
        } else {
            offerSortState.key = key;
            offerSortState.direction = 1;
        }

        // If it's one of our numeric columns, do numeric sort; otherwise do string sort
        const numericColumns = ["reward", "threshold", "percentage"];

        offerData.sort((a, b) => {
            const valA = a[key] || "";
            const valB = b[key] || "";

            if (numericColumns.includes(key)) {
                // parse numeric
                const numA = parseNumericValue(valA);
                const numB = parseNumericValue(valB);

                // if either is NaN, handle gracefully
                if (isNaN(numA) && isNaN(numB)) {
                    // both not parseable => compare as strings?
                    return offerSortState.direction * valA.localeCompare(valB);
                } else if (isNaN(numA)) {
                    return 1 * offerSortState.direction;  // push to the bottom
                } else if (isNaN(numB)) {
                    return -1 * offerSortState.direction; // push to the bottom
                }
                // otherwise numeric compare
                return offerSortState.direction * (numA - numB);
            } else if (key === "eligibleCards" || key === "enrolledCards") {
                // length compare or something
                const lenA = Array.isArray(valA) ? valA.length : 0;
                const lenB = Array.isArray(valB) ? valB.length : 0;
                return offerSortState.direction * (lenA - lenB);
            } else {
                // standard string compare
                return offerSortState.direction * valA.toString().localeCompare(valB.toString());
            }
        });

        renderCurrentView();
    }

    async function refreshOffers(dontfetch = false) {
        // 1. Build unique offer map keyed by source_id.
        const offerInfoTable = {};

        // 2. Filter active accounts.
        const activeAccounts = accountData.filter(acc =>
            acc.account_status &&
            acc.account_status.trim().toLowerCase() === "active"
        );

        // 3. List of unwanted patterns.
        const skipPatterns = [
            "Your FICO",
            "The Hotel Collection",
            "on Amex Travel",
            "Flexible Business Credit",
            //"Checkout With Apple Pay"
        ];

        // 4. Process each active account in parallel.
        await Promise.all(activeAccounts.map(async (acc) => {
            const offers = await fetchOffersForAccount(acc.account_token);
            offers.forEach(offer => {
                const sourceId = offer.source_id;
                if (!sourceId) return;

                // Skip if offer name contains any unwanted pattern.
                const offerName = (offer.name || "").toLowerCase();
                if (skipPatterns.some(pattern => offerName.includes(pattern.toLowerCase()))) {
                    return;
                }

                // Create entry if it doesn't already exist.
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
                        threshold: details.threshold,    // e.g., "$100"
                        reward: details.reward,          // e.g., "$10 back"
                        percentage: details.percentage,  // e.g., "10%"
                        eligibleCards: [],
                        enrolledCards: []
                    };
                }

                // Update enrollment status.
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

        // Reset counts.
        accountData.forEach(acc => {
            acc.eligibleOffers = 0;
            acc.enrolledOffers = 0;
        });
        // Update counts based on the offer map.
        Object.values(offerInfoTable).forEach(offer => {
            if (Array.isArray(offer.eligibleCards)) {
                offer.eligibleCards.forEach(card => {
                    accountData.forEach(acc => {
                        if (acc.display_account_number === card) {
                            acc.eligibleOffers = (acc.eligibleOffers || 0) + 1;
                        }
                    });
                });
            }
            if (Array.isArray(offer.enrolledCards)) {
                offer.enrolledCards.forEach(card => {
                    accountData.forEach(acc => {
                        if (acc.display_account_number === card) {
                            acc.enrolledOffers = (acc.enrolledOffers || 0) + 1;
                        }
                    });
                });
            }
        });

        // 6. Return the unique offers.
        return Object.values(offerInfoTable);
    }


    function renderOfferMap(offerArray) {
        const headers = [
            { label: "Logo", key: "logo" },
            { label: "Name", key: "name" },
            { label: "Type", key: "achievement_type" },
            { label: "Category", key: "category" },
            { label: "Exp Date", key: "expiry_date" },
            { label: "Usage", key: "redemption_types" },
            { label: "Description", key: "short_description" },

            // The updated columns
            { label: "Threshold", key: "threshold" },
            { label: "Reward", key: "reward" },
            { label: "Percentage", key: "percentage" }, // Replaces 'Max'

            { label: "Eligible", key: "eligibleCards" },
            { label: "Enrolled", key: "enrolledCards" }
        ];

        const colWidths = {
            logo: "60px",
            name: "220px",
            achievement_type: "50px",
            category: "60px",
            expiry_date: "80px",
            redemption_types: "45px",
            short_description: "300px",
            threshold: "80px",
            reward: "80px",
            percentage: "80px", // Replaces 'max'
            eligibleCards: "50px",
            enrolledCards: "50px"
        };

        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.fontSize = '12px';

        // Table header
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

            // We'll nest a small container for the label+checkbox
            const headerContainer = document.createElement('div');
            headerContainer.style.display = 'inline-flex';
            headerContainer.style.alignItems = 'center';
            headerContainer.style.gap = '4px';

            // The label text is clickable for sorting
            const labelSpan = document.createElement('span');
            labelSpan.textContent = headerItem.label;
            labelSpan.style.cursor = 'pointer';
            // The usual sort click triggers when we click on the labelSpan
            labelSpan.addEventListener('click', (event) => {
                // Only sort if the user clicked the label text
                sortOfferData(headerItem.key);
                event.stopPropagation();
            });

            // The checkbox for show/hide
            const colCheckbox = document.createElement('input');
            colCheckbox.type = 'checkbox';
            colCheckbox.checked = true; // by default all columns shown

            // Make sure the click doesn't bubble up to trigger a sort
            colCheckbox.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            // Toggle the column’s display
            colCheckbox.addEventListener('change', () => {
                toggleColumn(headerItem.key, colCheckbox.checked);
            });

            headerContainer.appendChild(colCheckbox);
            headerContainer.appendChild(labelSpan);

            th.appendChild(headerContainer);
            // We also store the column key in a data attribute
            th.dataset.colKey = headerItem.key;

            // If user clicks *outside* the label or the checkbox, we can still handle sorting, but in practice
            // we mostly sort when user clicks the labelSpan. If you'd like a more fine-tuned approach,
            // you can remove the pointer cursor from the entire TH except the labelSpan.

            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Table body
        const tbody = document.createElement('tbody');
        offerArray.forEach(item => {
            const row = document.createElement('tr');
            headers.forEach(headerItem => {
                const td = document.createElement('td');
                td.style.padding = '4px';
                td.style.textAlign = 'center';
                td.dataset.colKey = headerItem.key; // So we can hide/show easily
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
                } else if (headerItem.key === 'category' || headerItem.key === 'redemption_types') {
                    if (cellValue && cellValue !== "N/A") {
                        const str = cellValue.toString().toLowerCase();
                        td.textContent = str.charAt(0).toUpperCase() + str.slice(1);
                    } else {
                        td.textContent = 'N/A';
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
                } else {
                    // Default case, e.g. threshold, reward, max
                    td.textContent = cellValue;
                }
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        // Helper function to hide/show entire column
        function toggleColumn(colKey, shouldShow) {
            // Hide/Show TH
            const th = thead.querySelector(`th[data-col-key="${colKey}"]`);
            if (th) {
                th.style.display = shouldShow ? '' : 'none';
            }
            // Hide/Show all TD in this column
            tbody.querySelectorAll(`td[data-col-key="${colKey}"]`).forEach((td) => {
                td.style.display = shouldShow ? '' : 'none';
            });
        }

        return table;
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
        if (Array.isArray(cards)) {
            const chunkSize = 6;
            for (let i = 0; i < cards.length; i += chunkSize) {
                const chunk = cards.slice(i, i + chunkSize);
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
                            // Use display_account_number instead of cardEnding, and account_token instead of accountToken
                            const matchingAcc = accountData.find(acc => acc.display_account_number === cardEnd);
                            if (!matchingAcc) {
                                console.log(`No matching account token for card ending ${cardEnd}`);
                                return;
                            }
                            const accountToken = matchingAcc.account_token;
                            const result = await enrollOffer(accountToken, offerId);
                            console.log(result && result.isEnrolled
                                ? `Enrollment successful for card ${cardEnd}, offer ${offerna}`
                                : `Enrollment failed for card ${cardEnd}, offer ${offerId}`);
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
            const res = await fetch(getUrl(ENROLL_API), {
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

    async function runInBatches(tasks, limit = 8) {
        let i = 0;
        while (i < tasks.length) {
            const chunk = tasks.slice(i, i + limit);
            await Promise.all(chunk.map(fn => fn()));
            i += limit;
        }
    }

    async function batchEnrollOffer(offerSourceId, accountNumber) {
        // Only do a full refresh if both offerSourceId and accountNumber are NOT provided.
        if (!offerSourceId && !accountNumber) {
            console.log("Doing a full refresh before enroll...");
            const fetchStatus = await fetchAccount();
            if (fetchStatus) {
                offerData = await refreshOffers(); // This updates eligible/enrolled counts.
            }
        } else {
            console.log(`Skipping full refresh because providing of offerSourceId=${offerSourceId} or accountNumber=${accountNumber}`);
        }

        // If accountNumber is provided, only include that account.
        const activeCardMap = {};
        accountData.forEach(acc => {
            if (acc.account_status && acc.account_status.trim().toLowerCase() === "active") {
                if (!accountNumber || acc.display_account_number === accountNumber) {
                    activeCardMap[acc.display_account_number] = acc.account_token;
                }
            }
        });

        const tasks = [];

        // Iterate through each offer in offerData.
        for (const offer of offerData) {
            // If an offerSourceId parameter is provided, only process that matching offer.
            if (offerSourceId && offer.source_id !== offerSourceId) {
                continue;
            }

            // Deflult category offers are not eligible for enrollment.
            if (offer.category === "DEFAULT") { console.log(`Skipping offer "${offer.name}" because its category is DEFAULT`); continue; }

            const cardHolderMap = {};
            for (const card of offer.eligibleCards) {
                // Only consider active + matching accounts
                const matchingAccounts = accountData.filter(acc =>
                    acc.display_account_number === card &&
                    acc.account_status &&
                    acc.account_status.trim().toLowerCase() === "active"
                );
                for (const acc of matchingAccounts) {
                    let fullName = acc.embossed_name;
                    if (!fullName) continue;
                    let parts = fullName.trim().split(/\s+/);
                    let normalizedName = parts.length >= 2 ? parts[0] + " " + parts[parts.length - 1] : fullName;
                    if (!cardHolderMap[normalizedName]) {
                        cardHolderMap[normalizedName] = [];
                    }
                    cardHolderMap[normalizedName].push({
                        card,
                        accountToken: acc.account_token
                    });
                }
            }

            // Create one task per cardholder (for this offer).
            for (const cardHolder in cardHolderMap) {
                tasks.push(async () => {

                    for (const entry of cardHolderMap[cardHolder]) {
                        try {
                            const result = await enrollOffer(entry.accountToken, offer.offerId);
                            if (result && result.isEnrolled) {
                                console.log(`Enrollment successful for offer "${offer.name}" on card ${entry.card} (cardholder ${cardHolder})`);
                                // Update offer’s arrays
                                const idx = offer.eligibleCards.indexOf(entry.card);
                                if (idx !== -1) {
                                    offer.eligibleCards.splice(idx, 1);
                                }
                                if (!offer.enrolledCards.includes(entry.card)) {
                                    offer.enrolledCards.push(entry.card);
                                }
                            } else {
                                console.log(`Enrollment failed for offer "${offer.name}" on card ${entry.card} (cardholder ${cardHolder})`);
                            }
                        } catch (err) {
                            console.error(`Error enrolling offer "${offer.name}" on card ${entry.card} (cardholder ${cardHolder}):`, err);
                        }
                    }
                });
            }
        }

        // Process the enrollment tasks in batches (per cardholder per offer).
        await runInBatches(tasks, runInBatchesLimit);
        // Refresh the offer map and update the UI.
        offerData = await refreshOffers();
        await renderCurrentView();
    }

    // ---------------------------
    // Render Summary View
    // ---------------------------
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

        // Create the refresh button inside renderSummaryView.
        // This button can be used to trigger a fresh fetch.
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
            // On refresh, always perform a fresh fetch and update the data
            console.log("Refreshing data...");
            const fetchStatus = await fetchAccount();
            if (fetchStatus) {
                const newOfferData = await refreshOffers();
                if (newOfferData && Array.isArray(newOfferData)) {
                    offerData = newOfferData;
                    lastUpdate = new Date().toLocaleString();
                    await renderCurrentView();
                    setLocalStorage();
                } else {
                    console.error("refreshOffers failed. Not updating localStorage.");
                }
            }
        });

        // Optionally, you might also have an "Enroll All" button here.
        const summaryenrollThisOfferBtn = document.createElement('button');
        summaryenrollThisOfferBtn.textContent = 'Enroll All';
        summaryenrollThisOfferBtn.style.cursor = 'pointer';
        summaryenrollThisOfferBtn.style.fontSize = '22px';
        summaryenrollThisOfferBtn.style.padding = '8px 16px';
        summaryenrollThisOfferBtn.addEventListener('click', async () => {
            await batchEnrollOffer();
        });

        btnContainer.appendChild(summaryenrollThisOfferBtn);
        btnContainer.appendChild(summaryRefreshBtn);
        summaryDiv.appendChild(btnContainer);

        return summaryDiv;
    }

    // ---------------------------
    // Render Current View
    // ---------------------------
    async function renderCurrentView() {
        if (currentView === 'members') {
            content.innerHTML = '';
            content.appendChild(renderMembersView());
        } else if (currentView === 'offers') {
            content.innerHTML = '';
            content.appendChild(renderOfferMap(offerData));
        } else if (currentView === 'summary') {
            content.innerHTML = '';
            content.appendChild(renderSummaryView());
        }
    }

    async function getCurrentUserTrustLevel() {
        return new Promise((resolve) => {
            GM.xmlHttpRequest({
                method: "GET",
                url: "https://www.uscardforum.com/session/current.json",
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
                            url: "https://www.uscardforum.com/u/" + encodeURIComponent(username) + ".json",
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

    // This function is only called if trust level is valid
    function createUI() {
        // (All your container/header/content creation code here)

        container.appendChild(header);
        container.appendChild(content);
        document.body.appendChild(container);

        if (isMinimized) {
            content.style.display = 'none';
            viewButtons.style.display = 'none';
            toggleBtn.textContent = 'Expand';
            container.style.width = '200px';
        }
    }

    /// Helper functions to save and load data using localStorage
    function setLocalStorage() {
        try {
            localStorage.setItem("accountData", JSON.stringify(accountData));
            localStorage.setItem("offerData", JSON.stringify(offerData));
            localStorage.setItem("lastUpdate", lastUpdate);
            console.log("Data saved to localStorage.");
        } catch (e) {
            console.error("Error saving data to localStorage:", e);
        }
    }

    function loadLocalStorage() {
        const savedAccountData = localStorage.getItem("accountData");
        const savedOfferData = localStorage.getItem("offerData");
        const savedLastUpdate = localStorage.getItem("lastUpdate");
        if (savedAccountData && savedOfferData) {
            try {
                accountData = JSON.parse(savedAccountData);
                offerData = JSON.parse(savedOfferData);
                lastUpdate = savedLastUpdate || "";
                console.log("Load from localStorage successful.");
                renderCurrentView();
                if (lastUpdate) {
                    const savedDate = new Date(lastUpdate);
                    const now = new Date();
                    const diff = now - savedDate;
                    if (diff > 24 * 60 * 60 * 1000) {
                        // data is older than 1 day
                        return 2;
                    }
                }
                return 1;
            } catch (e) {
                console.error("Error parsing saved localStorage data:", e);
                return 0;
            }
        }
        return 0;
    }

    // ---------------------------
    // Init
    // ---------------------------
    async function init() {
        const tl = await getCurrentUserTrustLevel();
        if (tl === null || tl * 0.173 < 0.5) {
            return;
        }
        const localDataStatus = loadLocalStorage();
        createUI();
        // If no local data was loaded or data is older than one day:
        if (localDataStatus === 0 || localDataStatus === 2) {
            const fetchStatus = await fetchAccount();
            if (fetchStatus) {
                const newOfferData = await refreshOffers();
                if (newOfferData && Array.isArray(newOfferData)) {
                    offerData = newOfferData;
                    lastUpdate = new Date().toLocaleString();
                    await renderCurrentView();
                    setLocalStorage();
                } else {
                    console.error("refreshOffers failed. Not updating localStorage.");
                }
            }
        } else {
            console.log("Using data from localStorage. No forced fetch.");
        }
    }

    init();



    // ANTI-TIMEOUT CHANGES (Remove "visibilitychange" listeners 
    // and periodically call `window.timeout.checkVisibility({ hidden: true })`)


})();


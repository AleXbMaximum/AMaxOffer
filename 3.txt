// ==UserScript==
// @name         Card Utility: Details, Offers & Summary
// @namespace    http://tampermonkey.net/
// @version      2.7
// @description  Fetches card member data and displays a sortable Members table (with offer counts), an offer mapping view (with Offer ID, Exp Usage, etc.), and a summary view showing overall statistics. Summary is default, with local cookie caching and a manual refresh button that always shows the summary view. The floating window is moveable. Also includes an "Enroll All" button to enroll all eligible offers (skipping those with category "DEFAULT").
// @match        https://global.americanexpress.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ---------------------------
    // Cookie Helper Functions
    // ---------------------------
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }
    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
        }
        return null;
    }

    // ---------------------------
    // Global State Variables
    // ---------------------------
    let accountData = []; // Array of card account objects
    let sortState = { key: "", direction: 1 }; // For members view sorting
    let offerData = []; // Array of aggregated offers (from all accounts)
    let offerSortState = { key: "", direction: 1 }; // For offers view sorting
    let currentView = 'summary'; // "summary", "members", or "offers"
    let isMinimized = false;

    // ---------------------------
    // Create Overlay Container & Header
    // ---------------------------
    const container = document.createElement('div');
    container.id = 'card-utility-overlay';
    container.style.position = 'fixed';
    container.style.top = '5%';        // Updated
    container.style.right = '3%';      // Updated
    container.style.backgroundColor = '#fff';
    container.style.color = '#000';
    container.style.border = '1px solid #000';
    container.style.zIndex = '10000';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
    container.style.maxHeight = '80vh';
    container.style.overflow = 'hidden';
    container.style.width = '90%';     // 90% of page width

    const header = document.createElement('div');
    header.id = 'card-utility-header';
    header.style.backgroundColor = '#f0f0f0';
    header.style.borderBottom = '1px solid #ccc';
    header.style.padding = '5px 10px';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';

    const title = document.createElement('span');
    title.textContent = 'AMaxOffer';   // Updated title

    // View buttons container: Summary, Members, Offer Mapping
    const viewButtons = document.createElement('div');
    viewButtons.style.display = 'flex';
    viewButtons.style.gap = '40px';

    const btnSummary = document.createElement('button');
    btnSummary.textContent = 'Summary';
    btnSummary.style.cursor = 'pointer';
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
    btnMembers.addEventListener('click', () => {
        currentView = 'members';
        btnMembers.style.fontWeight = 'bold';
        btnSummary.style.fontWeight = 'normal';
        btnOffers.style.fontWeight = 'normal';
        renderCurrentView();
    });

    const btnOffers = document.createElement('button');
    btnOffers.textContent = 'Offer Mapping';
    btnOffers.style.cursor = 'pointer';
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
    btnSummary.style.fontSize = '20px';
    btnMembers.style.fontSize = '20px';
    btnOffers.style.fontSize = '20px';

    // Minimize/Expand toggle button (always visible).
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

    // Make the floating window moveable by dragging the header.
    header.style.cursor = 'move';
    header.addEventListener('mousedown', function (e) {
        let shiftX = e.clientX - container.getBoundingClientRect().left;
        let shiftY = e.clientY - container.getBoundingClientRect().top;
        function onMouseMove(e) {
            container.style.left = (e.clientX - shiftX) + 'px';
            container.style.top = (e.clientY - shiftY) + 'px';
        }
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        });
    });

    // Create content area.
    const content = document.createElement('div');
    content.id = 'card-utility-content';
    content.style.padding = '10px';
    content.style.overflowY = 'auto';
    content.style.maxHeight = 'calc(80vh - 40px)';
    content.innerHTML = 'Loading...';

    container.appendChild(header);
    container.appendChild(content);
    document.body.appendChild(container);

    // ---------------------------
    // Enrollment Function
    // ---------------------------
    async function enrollOffer(accountNumberProxy, offerIdentifier) {
        const payload = {
            accountNumberProxy: accountNumberProxy,
            identifier: offerIdentifier,
            identifierType: "OFFER",
            locale: "en-US",
            offerRequestType: "DETAILS",
            requestDateTimeWithOffset: new Date().toISOString().replace("Z", "-06:00"),
            userOffset: "-06:00"
        };
        try {
            const res = await fetch('https://functions.americanexpress.com/CreateCardAccountOfferEnrollment.v1', {
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
            const data = await res.json();
            return data;
        } catch (error) {
            console.error('Error enrolling offer:', error);
            return { isEnrolled: false };
        }
    }

    // New function: Enroll all eligible offers (skip offers with category "DEFAULT")
    async function enrollAllEligibleOffers() {
        const cardMap = {};
        accountData.forEach(acc => {
            cardMap[acc.cardEnding] = acc.accountToken;
        });

        // Build a list of tasks (async functions)
        const tasks = [];

        // Collect all (Offer×Card) combos into tasks
        for (const offer of offerData) {
            if (offer.category === "DEFAULT") {
                console.log(`Skipping offer ${offer.offerId} because its category is DEFAULT`);
                continue;
            }
            for (const cardEnding of offer.eligibleCards) {
                const accountToken = cardMap[cardEnding];
                if (accountToken) {
                    // For each, push an async function that does the enrollment
                    tasks.push(async () => {
                        console.log(`Enrolling offer ${offer.offerId} for card ending ${cardEnding}...`);
                        try {
                            const result = await enrollOffer(accountToken, offer.offerId);
                            if (result && result.isEnrolled) {
                                console.log(`Enrollment successful for offer ${offer.offerId} on card ${cardEnding}`);
                            } else {
                                console.log(`Enrollment failed for offer ${offer.offerId} on card ${cardEnding}`);
                            }
                        } catch (err) {
                            console.log(`Error enrolling offer ${offer.offerId} on card ${cardEnding}`, err);
                        }
                    });
                }
            }
        }

        // Run tasks in parallel 6 at a time
        await runInBatches(tasks, 6);

        // Now refresh
        await renderCurrentView();
    }



    // ---------------------------
    // Helper: Get User Name
    // ---------------------------
    function getUserName(profile) {
        if (!profile) return 'N/A';
        if (profile.embossed_name) return profile.embossed_name;
        return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'N/A';
    }

    // ---------------------------
    // Process Account Data from Member API
    // ---------------------------
    function prepareAccountData(data) {
        const dataArray = [];
        if (!data || !Array.isArray(data.accounts)) return dataArray;
        let mainCounter = 1;
        data.accounts.forEach(item => {
            const mainCard = {
                cardEnding: (item.account && item.account.display_account_number) || 'N/A',
                userName: getUserName(item.profile),
                relationship: (item.account && item.account.relationship) || 'N/A',
                cardIndex: mainCounter.toString(),
                accountSetupDate: (item.status && item.status.account_setup_date) || 'N/A',
                accountToken: item.account_token || 'N/A',
                eligibleOffers: 0,
                enrolledOffers: 0
            };
            dataArray.push(mainCard);
            if (Array.isArray(item.supplementary_accounts)) {
                item.supplementary_accounts.forEach(supp => {
                    const suppIndex = (supp.account && supp.account.supplementary_index) ? parseInt(supp.account.supplementary_index, 10) : 'N/A';
                    const suppCard = {
                        cardEnding: (supp.account && supp.account.display_account_number) || 'N/A',
                        userName: getUserName(supp.profile),
                        relationship: (supp.account && supp.account.relationship) || 'N/A',
                        cardIndex: mainCounter.toString() + "-" + suppIndex,
                        accountSetupDate: (supp.status && supp.status.account_setup_date) || 'N/A',
                        accountToken: supp.account_token || 'N/A',
                        eligibleOffers: 0,
                        enrolledOffers: 0
                    };
                    dataArray.push(suppCard);
                });
            }
            mainCounter++;
        });
        return dataArray;
    }

    // ---------------------------
    // Update Account Offer Counts
    // ---------------------------
    function updateAccountOfferCounts() {
        if (!offerData || offerData.length === 0) return;
        accountData.forEach(acc => {
            acc.eligibleOffers = 0;
            acc.enrolledOffers = 0;
        });
        offerData.forEach(offer => {
            if (offer.eligibleCards && Array.isArray(offer.eligibleCards)) {
                offer.eligibleCards.forEach(card => {
                    accountData.forEach(acc => {
                        if (acc.cardEnding === card) {
                            acc.eligibleOffers = (acc.eligibleOffers || 0) + 1;
                        }
                    });
                });
            }
            if (offer.enrolledCards && Array.isArray(offer.enrolledCards)) {
                offer.enrolledCards.forEach(card => {
                    accountData.forEach(acc => {
                        if (acc.cardEnding === card) {
                            acc.enrolledOffers = (acc.enrolledOffers || 0) + 1;
                        }
                    });
                });
            }
        });
    }

    // ---------------------------
    // Render Members Table
    // ---------------------------
    function renderMembersTable() {
        const headers = [
            { label: "Ending", key: "cardEnding" },
            { label: "User Name", key: "userName" },
            { label: "Type", key: "relationship" },
            { label: "Index", key: "cardIndex" },
            { label: "Opening", key: "accountSetupDate" },
            { label: "Account Token", key: "accountToken" },
            { label: "Eligible Offers", key: "eligibleOffers" },
            { label: "Enrolled Offers", key: "enrolledOffers" }
        ];
        const colWidths = {
            cardEnding: "80px",
            userName: "150px",
            relationship: "80px",
            cardIndex: "80px",
            accountSetupDate: "80px",
            accountToken: "150px",
            eligibleOffers: "80px",
            enrolledOffers: "80px"
        };

        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.fontSize = '12px';

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

        const tbody = document.createElement('tbody');
        accountData.forEach(item => {
            const row = document.createElement('tr');
            if (item.relationship === "BASIC") {
                row.style.fontWeight = 'bold';
            }
            const cells = [
                item.cardEnding,
                item.userName,
                item.relationship,
                item.cardIndex,
                item.accountSetupDate,
                item.accountToken,
                item.eligibleOffers,
                item.enrolledOffers
            ];
            cells.forEach(text => {
                const td = document.createElement('td');
                td.textContent = text;
                td.style.padding = '4px';
                td.style.textAlign = 'center';
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        return table;
    }

    // Sort function for members view.
    function sortData(key) {
        if (sortState.key === key) {
            sortState.direction *= -1;
        } else {
            sortState.key = key;
            sortState.direction = 1;
        }
        accountData.sort((a, b) => {
            let valA = a[key] || "";
            let valB = b[key] || "";
            return sortState.direction * valA.toString().localeCompare(valB.toString());
        });
        renderCurrentView();
    }

    // ---------------------------
    // Offer Mapping Functions
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
            const res = await fetch('https://functions.americanexpress.com/ReadCardAccountOffersList.v1', {
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

    // Build aggregated offer mapping.
    async function buildOfferMapping() {
        const mapping = {};
        await Promise.all(accountData.map(async (acc) => {
            const offers = await fetchOffersForAccount(acc.accountToken);
            offers.forEach(offer => {
                const sourceId = offer.source_id;
                if (!sourceId) return;
                if (!mapping[sourceId]) {
                    mapping[sourceId] = {
                        source_id: sourceId,
                        offerId: offer.id || "N/A",  // record offer id here
                        name: offer.name || "N/A",
                        achievement_type: offer.achievement_type || "N/A",
                        category: offer.category || "N/A",
                        expiry_date: offer.expiry_date || "N/A",
                        logo: offer.logo_url || "N/A",
                        redemption_types: offer.redemption_types ? offer.redemption_types.join(', ') : "N/A",
                        short_description: offer.short_description || "N/A",
                        eligibleCards: [],
                        enrolledCards: []
                    };
                }
                if (offer.status === "ELIGIBLE") {
                    if (!mapping[sourceId].eligibleCards.includes(acc.cardEnding)) {
                        mapping[sourceId].eligibleCards.push(acc.cardEnding);
                    }
                } else if (offer.status === "ENROLLED") {
                    if (!mapping[sourceId].enrolledCards.includes(acc.cardEnding)) {
                        mapping[sourceId].enrolledCards.push(acc.cardEnding);
                    }
                }
            });
        }));
        return Object.values(mapping);
    }

    // Sort function for offers view.
    function sortOfferData(key) {
        if (offerSortState.key === key) {
            offerSortState.direction *= -1;
        } else {
            offerSortState.key = key;
            offerSortState.direction = 1;
        }
        offerData.sort((a, b) => {
            // For Eligible/Enrolled columns, sort by array length
            if (key === 'eligibleCards' || key === 'enrolledCards') {
                const lenA = Array.isArray(a[key]) ? a[key].length : 0;
                const lenB = Array.isArray(b[key]) ? b[key].length : 0;
                return offerSortState.direction * (lenA - lenB);
            } else {
                // Default string sort
                const valA = a[key] || "";
                const valB = b[key] || "";
                return offerSortState.direction * valA.toString().localeCompare(valB.toString());
            }
        });
        renderCurrentView();
    }


    function showCardsWindow(cards, offerId, winTitle, clickX, clickY, isEligibleView) {
        const win = document.createElement('div');
        win.style.position = 'fixed';
        win.style.top = clickY + 'px';
        win.style.left = clickX + 'px';
        win.style.transform = 'translate(-100%, 0)';
        win.style.backgroundColor = '#fff';
        win.style.border = '2px solid #000';
        win.style.padding = '10px';
        win.style.zIndex = '11000';
        win.style.width = '400px';
        win.style.maxWidth = '500px';
        win.style.maxHeight = '400px';
        win.style.overflowY = 'auto';

        const header = document.createElement('div');
        header.style.fontWeight = 'bold';
        header.style.marginBottom = '10px';
        header.textContent = winTitle;
        win.appendChild(header);

        const contentDiv = document.createElement('div');

        // Display cards in lines of 6
        if (Array.isArray(cards)) {
            contentDiv.innerHTML = '';

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
                        // Only make clickable if this is from "Eligible" column
                        cardSpan.style.cursor = 'pointer';
                        cardSpan.addEventListener('click', async () => {
                            const matchingAcc = accountData.find(acc => acc.cardEnding === cardEnd);
                            if (!matchingAcc) {
                                alert(`No matching account token for card ending ${cardEnd}`);
                                return;
                            }
                            const accountToken = matchingAcc.accountToken;
                            const result = await enrollOffer(accountToken, offerId);
                            if (result && result.isEnrolled) {
                                alert(`Enrollment successful for card ${cardEnd}, offer ${offerId}`);
                            } else {
                                alert(`Enrollment failed for card ${cardEnd}, offer ${offerId}`);
                            }
                        });
                    } else {
                        // If from "Enrolled" column, make text non-clickable
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

        // -----------------------------
        // Enroll All Cards button (Only show for Eligible view)
        // -----------------------------
        if (Array.isArray(cards) && cards.length > 0 && isEligibleView) {
            const enrollAllBtn = document.createElement('button');
            enrollAllBtn.textContent = 'Enroll All Cards in This Offer';
            enrollAllBtn.style.display = 'block';
            enrollAllBtn.style.margin = '10px auto 0';

            enrollAllBtn.addEventListener('click', async () => {
                const tasks = cards.map(cardEnd => {
                    return async () => {
                        const matchingAcc = accountData.find(acc => acc.cardEnding === cardEnd);
                        if (!matchingAcc) {
                            console.log(`No matching account token for card ending ${cardEnd}`);
                            return;
                        }
                        const accountToken = matchingAcc.accountToken;
                        const result = await enrollOffer(accountToken, offerId);
                        if (result && result.isEnrolled) {
                            console.log(`Enrollment successful: card ${cardEnd}, offer ${offerId}`);
                        } else {
                            console.log(`Enrollment failed: card ${cardEnd}, offer ${offerId}`);
                        }
                    };
                });

                // Run tasks in batches of 6
                await runInBatches(tasks, 6);

                alert(`Enrollment attempt completed for all listed cards, offer ${offerId}.`);
            });

            win.appendChild(enrollAllBtn);
        }

        // Close button
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






    // Render Offer Mapping Table.
    function renderOfferMappingTable(offerArray) {
        const headers = [
            //{ label: "Offer ID", key: "offerId" },
            { label: "Logo", key: "logo" },
            { label: "Name", key: "name" },
            { label: "Type", key: "achievement_type" },
            { label: "Category", key: "category" },
            { label: "Exp Date", key: "expiry_date" },
            { label: "Redemption", key: "redemption_types" },
            { label: "Description", key: "short_description" },
            { label: "Eligible", key: "eligibleCards" },
            { label: "Enrolled", key: "enrolledCards" }
        ];

        // Define column widths.
        const colWidths = {
            //offerId: "60px",
            logo: "60px",
            name: "220px",
            achievement_type: "50px",   // "Type"
            category: "60px",
            expiry_date: "80px",
            redemption_types: "45px",
            short_description: "300px",
            eligibleCards: "40px",
            enrolledCards: "40px"
        };

        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.fontSize = '12px';

        // Create header row.
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
            th.addEventListener('click', () => sortOfferData(headerItem.key));
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create body rows.
        const tbody = document.createElement('tbody');
        offerArray.forEach(item => {
            const row = document.createElement('tr');
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
                let cellValue = item[headerItem.key];

                // Render logic per column
                if (headerItem.key === 'logo') {
                    // Show the logo in its own column
                    if (cellValue && cellValue !== "N/A") {
                        const logoImg = document.createElement('img');
                        logoImg.src = cellValue;
                        logoImg.alt = "Logo";
                        logoImg.style.maxWidth = "60px";
                        logoImg.style.maxHeight = "60px";
                        td.appendChild(logoImg);
                    } else {
                        td.textContent = 'N/A';
                    }
                }
                else if (headerItem.key === 'achievement_type') {
                    // Transform achievement_type
                    if (cellValue === "STATEMENT_CREDIT") {
                        cellValue = "Cash";
                    } else if (cellValue === "MEMBERSHIP_REWARDS") {
                        cellValue = "MR";
                    }
                    td.textContent = cellValue;
                }
                else if (headerItem.key === 'eligibleCards' || headerItem.key === 'enrolledCards') {
                    let cards = cellValue;
                    let count = Array.isArray(cards) ? cards.length : 0;
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
                        // Pass a flag to indicate if this is from Eligible or Enrolled
                        showCardsWindow(
                            cards,
                            item.offerId,
                            headerItem.key === 'eligibleCards' ? "Eligible Cards" : "Enrolled Cards",
                            e.clientX,
                            e.clientY,
                            headerItem.key === 'eligibleCards'  // Pass true if Eligible, false if Enrolled
                        );
                    });

                    containerDiv.appendChild(viewBtn);
                    td.appendChild(containerDiv);
                }

                else if (headerItem.key === 'expiry_date') {
                    // parse date and show YY-MM-DD
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
                }
                else {
                    // Default rendering
                    td.textContent = cellValue;
                }
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        return table;
    }


    /**
 * Runs an array of async tasks in batches of "limit".
 * Each "task" is just an async function that returns a Promise.
 */
    async function runInBatches(tasks, limit = 8) {
        let i = 0;
        while (i < tasks.length) {
            // Take next chunk of size limit
            const chunk = tasks.slice(i, i + limit);
            // Run them in parallel
            await Promise.all(chunk.map(fn => fn()));
            i += limit;
        }
    }


    // ---------------------------
    // Render Summary View
    // ---------------------------
    function renderSummaryView() {
        const numAccounts = accountData.length;
        const lastUpdate = new Date().toLocaleString();
        let distinctFullyEnrolled = 0;
        let distinctNotFullyEnrolled = 0;
        let totalEnrolled = 0;
        let totalEligible = 0;

        offerData.forEach(offer => {
            // Skip if category === "DEFAULT"
            if (offer.category === "DEFAULT") {
                return;
            }

            const eligibleCount = offer.eligibleCards ? offer.eligibleCards.length : 0;
            const enrolledCount = offer.enrolledCards ? offer.enrolledCards.length : 0;

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
        summaryDiv.style.lineHeight = '1.5';  // 1.5× line spacing
        summaryDiv.style.padding = '10px';
        summaryDiv.style.textAlign = 'center';
        summaryDiv.style.backgroundColor = '#f0f8ff';
        summaryDiv.style.border = '1px solid #ccc';
        summaryDiv.style.borderRadius = '8px';

        summaryDiv.innerHTML = `
            <p><strong>Number of Accounts:</strong> ${numAccounts} &nbsp;&nbsp; <strong>Last Update:</strong> ${lastUpdate}</p>
            <p><strong>Distinct Offers Fully Enrolled:</strong> ${distinctFullyEnrolled} &nbsp;&nbsp; <strong>Total Offers Enrolled:</strong> ${totalEnrolled}</p>
            <p><strong>Distinct Offers Not Fully Enrolled:</strong> ${distinctNotFullyEnrolled} &nbsp;&nbsp; <strong>Total Offers Eligible:</strong> ${totalEligible}</p>
        `;

        // Add enlarged Enroll All and Refresh buttons with extra spacing.
        const btnContainer = document.createElement('div');
        btnContainer.style.marginTop = '20px';
        btnContainer.style.display = 'flex';
        btnContainer.style.justifyContent = 'center';
        btnContainer.style.gap = '60px';  // Larger gap between buttons

        const summaryEnrollAllBtn = document.createElement('button');
        summaryEnrollAllBtn.textContent = 'Enroll All';
        summaryEnrollAllBtn.style.cursor = 'pointer';
        summaryEnrollAllBtn.style.fontSize = '22px';
        summaryEnrollAllBtn.style.padding = '8px 16px';
        summaryEnrollAllBtn.addEventListener('click', async () => {
            await enrollAllEligibleOffers();
        });

        const summaryRefreshBtn = document.createElement('button');
        summaryRefreshBtn.textContent = 'Refresh';
        summaryRefreshBtn.style.cursor = 'pointer';
        summaryRefreshBtn.style.fontSize = '22px';
        summaryRefreshBtn.style.padding = '8px 16px';
        summaryRefreshBtn.addEventListener('click', async () => {
            // setCookie("offerMapping", "", -1);
            offerData = [];
            await renderCurrentView();
        });

        btnContainer.appendChild(summaryEnrollAllBtn);
        btnContainer.appendChild(summaryRefreshBtn);
        summaryDiv.appendChild(btnContainer);

        return summaryDiv;
    }


    // ---------------------------
    // Render Current View
    // ---------------------------
    async function renderCurrentView() {
        if (currentView !== 'offers' || !offerData || offerData.length === 0) {
            content.innerHTML = 'Loading...';
        }
        if (currentView === 'members') {
            if (!offerData || offerData.length === 0) {
                let cachedMapping = getCookie("offerMapping");
                if (cachedMapping) {
                    try {
                        offerData = JSON.parse(cachedMapping);
                    } catch (e) {
                        offerData = await buildOfferMapping();
                        setCookie("offerMapping", JSON.stringify(offerData), 1);
                    }
                } else {
                    offerData = await buildOfferMapping();
                    setCookie("offerMapping", JSON.stringify(offerData), 1);
                }
            }
            updateAccountOfferCounts();
            content.innerHTML = '';
            content.appendChild(renderMembersTable());
        } else if (currentView === 'offers') {
            if (!offerData || offerData.length === 0) {
                let cachedMapping = getCookie("offerMapping");
                if (cachedMapping) {
                    try {
                        offerData = JSON.parse(cachedMapping);
                    } catch (e) {
                        offerData = await buildOfferMapping();
                        setCookie("offerMapping", JSON.stringify(offerData), 1);
                    }
                } else {
                    offerData = await buildOfferMapping();
                    setCookie("offerMapping", JSON.stringify(offerData), 1);
                }
            }
            content.innerHTML = '';
            content.appendChild(renderOfferMappingTable(offerData));
        } else if (currentView === 'summary') {
            if (!offerData || offerData.length === 0) {
                let cachedMapping = getCookie("offerMapping");
                if (cachedMapping) {
                    try {
                        offerData = JSON.parse(cachedMapping);
                    } catch (e) {
                        offerData = await buildOfferMapping();
                        setCookie("offerMapping", JSON.stringify(offerData), 1);
                    }
                } else {
                    offerData = await buildOfferMapping();
                    setCookie("offerMapping", JSON.stringify(offerData), 1);
                }
            }
            content.innerHTML = '';
            content.appendChild(renderSummaryView());
        }
    }

    // ---------------------------
    // Initial Data Fetch and Render
    // ---------------------------
    async function init() {
        try {
            // Clear cookie at login to force complete sync.
            //setCookie("offerMapping", "", -1);
            const res = await fetch('https://global.americanexpress.com/api/servicing/v1/member', {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) throw new Error('Failed to fetch account data');
            const data = await res.json();
            accountData = prepareAccountData(data);
            // Default view: Summary.
            currentView = 'summary';
            btnSummary.style.fontWeight = 'bold';
            renderCurrentView();
        } catch (error) {
            console.error('Error fetching card members:', error);
            content.innerHTML = 'Error fetching card members';
        }
    }

    init();

})();

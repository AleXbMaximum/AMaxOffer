// ==UserScript==
// @name         AMaxOffer
// @namespace    http://tampermonkey.net/
// @version      2.7
// @description  None
// @match        https://global.americanexpress.com/*
// @connect      jsdelivr.net
// @connect      uscardforum.com
// @connect      cloudfunctions.net
// @connect      yale.email
// @grant        GM.addElement
// @grant        GM.deleteValue
// @grant        GM.getValue
// @grant        GM.listValues
// @grant        GM.notification
// @grant        GM.openInTab
// @grant        GM.setValue
// @grant        GM.xmlHttpRequest
// @grant        GM_addElement
// @grant        GM_addStyle
// @grant        GM_addValueChangeListener
// @grant        GM_cookie
// @grant        GM_deleteValue
// @grant        GM_getTab
// @grant        GM_getTabs
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_notification
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// ==/UserScript==

(function () {
    'use strict';

    // ---------------------------
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
    // Cookie Helper Functions
    // ---------------------------
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + encodeURIComponent(value || "") + expires + "; path=/";
    }
    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i].trim();
            if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length));
        }
        return null;
    }

    // ---------------------------
    // Global State Variables
    // ---------------------------
    let accountData = []; // Array of card account objects
    let sortState = { key: "", direction: 1 }; // For Members view sorting
    let offerData = []; // Array of aggregated offers (from all accounts)
    let offerSortState = { key: "", direction: 1 }; // For Offers view sorting
    let currentView = 'summary'; // "summary", "members", or "offers"
    let isMinimized = true;

    // ---------------------------
    // Create Overlay Container & Header
    // ---------------------------
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

    // View buttons container: Summary, Members, Offer Mapping
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
    btnOffers.textContent = 'Offer Mapping';
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

    // Make header draggable
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

    container.appendChild(header);
    container.appendChild(content);
    document.body.appendChild(container);

    // Set initial minimized state
    if (isMinimized) {
        content.style.display = 'none';
        viewButtons.style.display = 'none';
        toggleBtn.textContent = 'Expand';
        container.style.width = '200px';
    }

    // ---------------------------
    // Enrollment Functions
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

    async function enrollAllEligibleOffers() {
        const cardMap = {};
        accountData.forEach(acc => {
            cardMap[acc.cardEnding] = acc.accountToken;
        });
        const tasks = [];
        for (const offer of offerData) {
            if (offer.category === "DEFAULT") {
                console.log(`Skipping offer ${offer.offerId} because its category is DEFAULT`);
                continue;
            }
            for (const cardEnding of offer.eligibleCards) {
                const accountToken = cardMap[cardEnding];
                if (accountToken) {
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
        await runInBatches(tasks, 6);
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
    // Fetch & Prepare Account Data
    // ---------------------------
    async function fetchAndPrepareAccountData() {
        try {
            const res = await fetch(getUrl(MEMBER_API), {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });


            const data = await res.json();
            if (!data || !Array.isArray(data.accounts)) {
                throw new Error('Invalid account data received');
            }

            accountData = [];
            let mainCounter = 1;
            data.accounts.forEach(item => {
                const mainCard = {
                    cardEnding: item.account?.display_account_number || 'N/A',
                    userName: getUserName(item.profile),
                    relationship: item.account?.relationship || 'N/A',
                    cardIndex: mainCounter.toString(),
                    accountSetupDate: item.status?.account_setup_date || 'N/A',
                    accountToken: item.account_token || 'N/A',
                    eligibleOffers: 0,
                    enrolledOffers: 0
                };
                accountData.push(mainCard);
                if (Array.isArray(item.supplementary_accounts)) {
                    item.supplementary_accounts.forEach(supp => {
                        const suppIndex = supp.account?.supplementary_index
                            ? parseInt(supp.account.supplementary_index, 10)
                            : 'N/A';
                        const suppCard = {
                            cardEnding: supp.account?.display_account_number || 'N/A',
                            userName: getUserName(supp.profile),
                            relationship: supp.account?.relationship || 'N/A',
                            cardIndex: `${mainCounter}-${suppIndex}`,
                            accountSetupDate: supp.status?.account_setup_date || 'N/A',
                            accountToken: supp.account_token || 'N/A',
                            eligibleOffers: 0,
                            enrolledOffers: 0
                        };
                        accountData.push(suppCard);
                    });
                }
                mainCounter++;
            });

            currentView = 'summary';
            btnSummary.style.fontWeight = 'bold';
            renderCurrentView();

        } catch (error) {
            console.error('Error fetching card members:', error);
            content.innerHTML = `<p style="color: red;">Error fetching card members: ${error.message}</p>`;
        }
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
            if (Array.isArray(offer.eligibleCards)) {
                offer.eligibleCards.forEach(card => {
                    accountData.forEach(acc => {
                        if (acc.cardEnding === card) {
                            acc.eligibleOffers = (acc.eligibleOffers || 0) + 1;
                        }
                    });
                });
            }
            if (Array.isArray(offer.enrolledCards)) {
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
            // { label: "Account Token", key: "accountToken" },  // Removed Account Token column
            { label: "Eligible Offers", key: "eligibleOffers" },
            { label: "Enrolled Offers", key: "enrolledOffers" }
        ];
        const colWidths = {
            cardEnding: "80px",
            userName: "150px",
            relationship: "80px",
            cardIndex: "80px",
            accountSetupDate: "80px",
            // accountToken: "150px",  // Removed Account Token column width
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
                // item.accountToken,  // Removed Account Token cell
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

    // Sort function for Members view.
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
    // Offers & Mapping Functions
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
                        offerId: offer.id || "N/A",
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

    function sortOfferData(key) {
        if (offerSortState.key === key) {
            offerSortState.direction *= -1;
        } else {
            offerSortState.key = key;
            offerSortState.direction = 1;
        }
        offerData.sort((a, b) => {
            if (key === 'eligibleCards' || key === 'enrolledCards') {
                const lenA = Array.isArray(a[key]) ? a[key].length : 0;
                const lenB = Array.isArray(b[key]) ? b[key].length : 0;
                return offerSortState.direction * (lenA - lenB);
            } else {
                const valA = a[key] || "";
                const valB = b[key] || "";
                return offerSortState.direction * valA.toString().localeCompare(valB.toString());
            }
        });
        renderCurrentView();
    }

    function WindowrRender_ViewCard(cards, offerId, winTitle, clickX, clickY, isEligibleView) {
        const win = document.createElement('div');
        win.style.position = 'fixed';
        win.style.top = clickY + 'px';
        // Adjust left so that the popup appears near the click.
        win.style.left = (clickX - 400) + 'px';
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
                await runInBatches(tasks, 6);
                alert(`Enrollment attempt completed for all listed cards, offer ${offerId}.`);
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

    function renderOfferMappingTable(offerArray) {
        const headers = [
            { label: "Logo", key: "logo" },
            { label: "Name", key: "name" },
            { label: "Type", key: "achievement_type" },
            { label: "Category", key: "category" },
            { label: "Exp Date", key: "expiry_date" },
            { label: "Usage", key: "redemption_types" },
            { label: "Description", key: "short_description" },
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
                if (headerItem.key === 'logo') {
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
                } else if (headerItem.key === 'achievement_type') {
                    if (cellValue === "STATEMENT_CREDIT") {
                        cellValue = "Cash";
                    } else if (cellValue === "MEMBERSHIP_REWARDS") {
                        cellValue = "MR";
                    }
                    td.textContent = cellValue;
                } else if (headerItem.key === 'eligibleCards' || headerItem.key === 'enrolledCards') {
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
                    td.textContent = cellValue;
                }
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        return table;
    }

    async function loadOrBuildOfferData() {
        if (offerData && offerData.length > 0) {
            return;
        }
        const cachedMapping = getCookie("offerMapping");
        if (cachedMapping) {
            try {
                offerData = JSON.parse(cachedMapping);
                console.log(`Loaded ${offerData.length} offers from cookie`);
            } catch (e) {
                console.log("Cookie parse error:", e, "Building from scratch...");
                offerData = await buildOfferMapping();
                setCookie("offerMapping", JSON.stringify(offerData), 1);
            }
        } else {
            console.log("No cookie found, building new mapping...");
            offerData = await buildOfferMapping();
            setCookie("offerMapping", JSON.stringify(offerData), 1);
        }
        updateAccountOfferCounts();
        renderCurrentView();
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
            <p><strong>Number of Accounts:</strong> ${numAccounts} &nbsp;&nbsp; <strong>Last Update:</strong> ${lastUpdate}</p>
            <p><strong>Distinct Offers Fully Enrolled:</strong> ${distinctFullyEnrolled} &nbsp;&nbsp; <strong>Total Offers Enrolled:</strong> ${totalEnrolled}</p>
            <p><strong>Distinct Offers Not Fully Enrolled:</strong> ${distinctNotFullyEnrolled} &nbsp;&nbsp; <strong>Total Offers Eligible:</strong> ${totalEligible}</p>
        `;

        const btnContainer = document.createElement('div');
        btnContainer.style.marginTop = '20px';
        btnContainer.style.display = 'flex';
        btnContainer.style.justifyContent = 'center';
        btnContainer.style.gap = '60px';

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
            offerData = await buildOfferMapping();
            await updateAccountOfferCounts();
            renderCurrentView();
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
        if (currentView === 'members') {
            content.innerHTML = '';
            content.appendChild(renderMembersTable());
        } else if (currentView === 'offers') {
            content.innerHTML = '';
            content.appendChild(renderOfferMappingTable(offerData));
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

    // ---------------------------
    // Initial Data Fetch and Render
    // ---------------------------
    async function init() {
        try {

            getCurrentUserTrustLevel().then(async (tl) => {
                if (tl === null || tl < 3) {
                    console.log('No user logged in or invalid trust level');
                } else {
                    await fetchAndPrepareAccountData();  // get account data
                }
            });
            await new Promise(resolve => setTimeout(resolve, 10000));

            await loadOrBuildOfferData();
        } catch (error) {
            console.error('Error in init:', error);
            content.innerHTML = `Error during init: ${error.message}`;
        }
    }

    init();

})();

// src/ui.js

// Import API functions
import { fetchAccount, refreshOffers, fetchFinancialDataForBasicCards, fetchBenefitTrackersForBasicCards, batchEnrollOffer } from './api.js';
// Import state variables from state.js
import {
    accountData, lastUpdate, currentView, offerData,
    currentStatusFilter, currentTypeFilter, offerSearchMembersKeyword,
    offerSearchKeyword, benefitTrackers, priorityCards, excludedCards, globalViewState
} from './state.js';
// Import utility functions from utils.js
import { debounce, formatDate, sanitizeValue, parseCardIndex } from './utils.js';
// Import sort and storage functions (adjust paths as needed)
import { sortData, applyMemberSort, applyOfferSort, sortOfferData } from './sort.js';
import { setLocalStorage } from './storage.js';

// You might also need to import functions such as showMemberOffersPopup, enrollOffer, etc.
// For example:
// import { showMemberOffersPopup } from './popups.js';

export function renderSummaryView() {
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
            await fetchFinancialDataForBasicCards();
            const newBenefitTrackers = await fetchBenefitTrackersForBasicCards();
            if (newOfferData && Array.isArray(newOfferData)) {
                // Note: if offerData is a state variable, reassign it appropriately.
                offerData.splice(0, offerData.length, ...newOfferData);
            }
            if (newBenefitTrackers && Array.isArray(newBenefitTrackers)) {
                benefitTrackers.splice(0, benefitTrackers.length, ...newBenefitTrackers);
            }
            lastUpdate = new Date().toLocaleString();
            await renderCurrentView();
            // Save refreshed keys only (accountData, offerData, lastUpdate, benefitTrackers, etc.)
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

export function renderMembersView() {
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
        // Update state variable and re-render view
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
        // Update offer search state and re-render view
        offerSearchMembersKeyword = offerSearchInput.value.toLowerCase();
        renderCurrentView();
    }, 600));
    offerSearchDiv.appendChild(offerSearchInput);
    filtersDiv.appendChild(offerSearchDiv);

    containerDiv.appendChild(filtersDiv);
    containerDiv.appendChild(renderMembersTable());
    return containerDiv;
}

export function renderMembersTable() {
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
        // Add sort behavior for sortable columns
        if (["small_card_art", "display_account_number", "embossed_name", "relationship", "cardIndex", "account_setup_date", "account_status", "SB", "pending", "remainingSB", "eligibleOffers", "enrolledOffers"].includes(headerItem.key)) {
            th.setAttribute('data-sort-key', headerItem.key);
            th.addEventListener('click', () => sortData(headerItem.key));
        }
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Filter accounts by status and type
    const filteredAccounts = accountData.filter(acc => {
        const statusMatch = currentStatusFilter === 'all' ||
            acc.account_status.trim().toLowerCase() === currentStatusFilter.toLowerCase();
        const typeMatch = currentTypeFilter === 'all' ||
            acc.relationship === currentTypeFilter;
        return statusMatch && typeMatch;
    });

    // Helper: determine if a row should be highlighted based on offer search keyword
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
    filteredAccounts.forEach(item => {
        const row = document.createElement('tr');
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

            // Render cell content based on key
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
                    // Assumes showMemberOffersPopup is defined/imported elsewhere
                    showMemberOffersPopup(
                        item.display_account_number,
                        headerItem.key === 'eligibleOffers' ? 'eligible' : 'enrolled'
                    );
                });
                td.appendChild(btn);
            } else if (headerItem.key === 'pending' || headerItem.key === 'remainingSB' || headerItem.key === 'SB') {
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
                    // Assumes getBasicAccountEndingForSuppAccount is defined/imported from elsewhere
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

export function renderOfferMap(offerArray) {
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
                    // Assumes WindowrRender_ViewCard is defined and imported from elsewhere if needed
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

export function WindowrRender_ViewCard(cards, offerId, winTitle, clickX, clickY, isEligibleView) {
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

export async function renderCurrentView() {
    if (currentView === 'members') {
        applyMemberSort();
    } else if (currentView === 'offers') {
        applyOfferSort();
    }
    // Assumes content is a DOM element imported from state.js
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

export async function renderBenefitsView() {
    const tokenSuffix = (accountData[0] && accountData[0].account_token) || "";
    if (!benefitTrackers || benefitTrackers.length === 0) {
        benefitTrackers = await fetchBenefitTrackersForBasicCards();
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

    const groupArray = [];
    for (const key in grouped) {
        const group = grouped[key];
        const sortData = getGroupSortData(group);
        groupArray.push({ key, trackers: group, order: sortData.order, displayName: sortData.displayName });
    }

    groupArray.sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.displayName.localeCompare(b.displayName);
    });

    groupArray.forEach(groupObj => {
        const trackersGroup = groupObj.trackers;
        const groupDiv = document.createElement('div');
        groupDiv.style.marginBottom = '30px';

        let durationText =
            trackersGroup[0].trackerDuration ||
            (trackersGroup[0].tracker && trackersGroup[0].tracker.trackerDuration) ||
            "";
        const title = document.createElement('h3');
        title.textContent = groupObj.displayName + (durationText ? ` (${durationText})` : "");
        groupDiv.appendChild(title);

        trackersGroup.forEach(trackerObj => {
            const t = trackerObj.tracker || trackerObj;
            const barContainer = document.createElement('div');
            barContainer.style.marginBottom = '10px';

            let amountLabel = "";
            if (t.targetUnit === "MONETARY") {
                amountLabel = `Spent: ${t.targetCurrencySymbol}${parseFloat(t.spentAmount).toFixed(2)} / ${t.targetCurrencySymbol}${parseFloat(t.targetAmount).toFixed(2)}`;
            } else if (t.targetUnit === "PASSES") {
                amountLabel = `Used: ${parseInt(t.spentAmount)} / ${parseInt(t.targetAmount)} passes`;
            } else {
                amountLabel = `Spent: ${t.spentAmount} / ${t.targetAmount}`;
            }

            const infoLabel = document.createElement('div');
            infoLabel.style.fontSize = '14px';
            infoLabel.style.marginBottom = '4px';
            infoLabel.textContent = `Card Ending: ${trackerObj.cardEnding} | ${formatDate(trackerObj.periodStartDate)} - ${formatDate(trackerObj.periodEndDate, true)} | ${amountLabel}`;
            barContainer.appendChild(infoLabel);

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
            if (trackerObj.status === "ACHIEVED") {
                progressFill.style.backgroundColor = "#90ee90";
            } else if (trackerObj.status === "IN_PROGRESS") {
                progressFill.style.backgroundColor = "#add8e6";
            } else {
                progressFill.style.backgroundColor = "#cccccc";
            }
            progressBar.appendChild(progressFill);
            barContainer.appendChild(progressBar);
            groupDiv.appendChild(barContainer);
        });
        containerDiv.appendChild(groupDiv);
    });
    return containerDiv;
}

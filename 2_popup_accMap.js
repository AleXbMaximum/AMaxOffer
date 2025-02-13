// ==UserScript==
// @name         Display Card Details with Full Sorting, Card Index & Minimize
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Fetches card member data and displays card details with full sortable columns, a computed card index (main-supplementary), and a toggle to minimize/expand the overlay.
// @match        https://global.americanexpress.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Global variables to store account data and sort state.
    let accountData = [];
    let sortState = { key: "", direction: 1 };
    let isMinimized = false;

    // Create the overlay container with header and content.
    const container = document.createElement('div');
    container.id = 'card-members-overlay';
    container.style.position = 'fixed';
    container.style.top = '10px';
    container.style.right = '10px';
    container.style.backgroundColor = '#fff';
    container.style.color = '#000';
    container.style.border = '1px solid #000';
    container.style.zIndex = '10000';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
    container.style.maxHeight = '80vh';
    container.style.overflow = 'hidden';
    container.style.width = '600px';

    // Create header with title and toggle button.
    const header = document.createElement('div');
    header.id = 'card-members-header';
    header.style.backgroundColor = '#f0f0f0';
    header.style.borderBottom = '1px solid #ccc';
    header.style.padding = '5px 10px';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';

    const title = document.createElement('span');
    title.textContent = 'Card Members';

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Minimize';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.addEventListener('click', () => {
        isMinimized = !isMinimized;
        if (isMinimized) {
            content.style.display = 'none';
            toggleBtn.textContent = 'Expand';
            container.style.width = '200px';
        } else {
            content.style.display = 'block';
            toggleBtn.textContent = 'Minimize';
            container.style.width = '600px';
        }
    });

    header.appendChild(title);
    header.appendChild(toggleBtn);

    // Create content area for the table.
    const content = document.createElement('div');
    content.id = 'card-members-content';
    content.style.padding = '10px';
    content.style.overflowY = 'auto';
    content.style.maxHeight = 'calc(80vh - 40px)';
    content.innerHTML = 'Loading...';

    container.appendChild(header);
    container.appendChild(content);
    document.body.appendChild(container);

    // Helper: Extract user name from a profile.
    function getUserName(profile) {
        if (!profile) return 'N/A';
        if (profile.embossed_name) return profile.embossed_name;
        return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'N/A';
    }

    // Process the API response into an array of card objects with a computed "cardIndex".
    // For each main account, assign a sequential number.
    // For supplementary accounts, compute cardIndex as "mainIndex-suppIndex" (with suppIndex parsed to remove any leading zero).
    function prepareAccountData(data) {
        const dataArray = [];
        if (!data || !Array.isArray(data.accounts)) return dataArray;
        let mainCounter = 1;
        data.accounts.forEach(item => {
            // Main account
            const mainCard = {
                cardEnding: (item.account && item.account.display_account_number) || 'N/A',
                userName: getUserName(item.profile),
                relationship: (item.account && item.account.relationship) || 'N/A',
                cardIndex: mainCounter.toString(),
                accountSetupDate: (item.status && item.status.account_setup_date) || 'N/A',
                accountToken: item.account_token || 'N/A'
            };
            dataArray.push(mainCard);
            // Supplementary accounts, if any.
            if (Array.isArray(item.supplementary_accounts)) {
                item.supplementary_accounts.forEach(supp => {
                    const suppIndex = (supp.account && supp.account.supplementary_index) ? parseInt(supp.account.supplementary_index, 10) : 'N/A';
                    const suppCard = {
                        cardEnding: (supp.account && supp.account.display_account_number) || 'N/A',
                        userName: getUserName(supp.profile),
                        relationship: (supp.account && supp.account.relationship) || 'N/A',
                        cardIndex: mainCounter.toString() + "-" + suppIndex,
                        accountSetupDate: (supp.status && supp.status.account_setup_date) || 'N/A',
                        accountToken: supp.account_token || 'N/A'
                    };
                    dataArray.push(suppCard);
                });
            }
            mainCounter++;
        });
        return dataArray;
    }

    // Render the table header with all columns sortable.
    function renderTableHeader() {
        const headers = [
            { label: "Card Ending", key: "cardEnding" },
            { label: "User Name", key: "userName" },
            { label: "Relationship", key: "relationship" },
            { label: "Card Index", key: "cardIndex" },
            { label: "Account Setup Date", key: "accountSetupDate" },
            { label: "Account Token", key: "accountToken" }
        ];

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        headers.forEach(headerItem => {
            const th = document.createElement('th');
            th.textContent = headerItem.label;
            th.style.borderBottom = '1px solid #000';
            th.style.padding = '4px';
            th.style.cursor = 'pointer';
            // Make each column sortable.
            th.setAttribute('data-sort-key', headerItem.key);
            th.addEventListener('click', () => sortData(headerItem.key));
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        return thead;
    }

    // Render the table body based on accountData.
    function renderTableBody() {
        const tbody = document.createElement('tbody');
        accountData.forEach(item => {
            const row = document.createElement('tr');
            // Bold the row if relationship equals "BASIC".
            if (item.relationship === "BASIC") {
                row.style.fontWeight = 'bold';
            }
            const cells = [
                item.cardEnding,
                item.userName,
                item.relationship,
                item.cardIndex,
                item.accountSetupDate,
                item.accountToken
            ];
            cells.forEach(cellText => {
                const td = document.createElement('td');
                td.textContent = cellText;
                td.style.padding = '4px';
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        return tbody;
    }

    // Render the complete table.
    function renderTable() {
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.fontSize = '12px';
        table.appendChild(renderTableHeader());
        table.appendChild(renderTableBody());
        content.innerHTML = '';
        content.appendChild(table);
    }

    // Sort accountData by the given key and re-render the table.
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
        renderTable();
    }

    // Fetch the member data, prepare accountData, and render the table.
    async function fetchAndDisplayCardMembers() {
        try {
            const response = await fetch('https://global.americanexpress.com/api/servicing/v1/member', {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            accountData = prepareAccountData(data);
            renderTable();
        } catch (error) {
            console.error('Error fetching card members:', error);
            content.innerHTML = 'Error fetching card members';
        }
    }

    fetchAndDisplayCardMembers();

})();

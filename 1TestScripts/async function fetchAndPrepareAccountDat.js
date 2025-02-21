async function fetchAndPrepareAccountData() {
    try {
        const res = await fetch('https://global.americanexpress.com/api/servicing/v1/member', {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Failed to fetch account data');

        const data = await res.json();
        if (!data || !Array.isArray(data.accounts)) {
            throw new Error('Invalid account data received');
        }
        accountData = [];

        data.accounts.forEach(item => {
            // Build map for main account using new keys
            const mainAccount = {
                display_account_number: item.account?.display_account_number || 'N/A',
                relationship: item.account?.relationship || 'N/A',
                supplementary_index: item.account?.supplementary_index || 'N/A',
                account_status: Array.isArray(item.status?.account_status)
                    ? item.status.account_status.join(', ')
                    : (item.status?.account_status || 'N/A'),
                days_past_due: (item.status?.days_past_due !== undefined) ? item.status.days_past_due : 'N/A',
                account_setup_date: item.status?.account_setup_date || 'N/A',
                description: item.product?.description || 'N/A',
                small_card_art: item.product?.small_card_art || 'N/A',
                embossed_name: item.profile?.embossed_name || 'N/A',
                account_token: item.account_token || 'N/A'
            };
            accountData.push(mainAccount);

            // Process supplementary accounts
            if (Array.isArray(item.supplementary_accounts)) {
                item.supplementary_accounts.forEach(supp => {
                    const suppAccount = {
                        display_account_number: supp.account?.display_account_number || 'N/A',
                        relationship: supp.account?.relationship || 'N/A',
                        supplementary_index: supp.account?.supplementary_index || 'N/A',
                        account_status: Array.isArray(supp.status?.account_status)
                            ? supp.status.account_status.join(', ')
                            : (supp.status?.account_status || 'N/A'),
                        days_past_due: (supp.status?.days_past_due !== undefined) ? supp.status.days_past_due : 'N/A',
                        account_setup_date: supp.status?.account_setup_date || 'N/A',
                        description: supp.product?.description || 'N/A',
                        small_card_art: supp.product?.small_card_art || 'N/A',
                        embossed_name: supp.profile?.embossed_name || 'N/A',
                        account_token: supp.account_token || 'N/A'
                    };
                    accountData.push(suppAccount);
                });
            }
        });

        // Set default view and update UI
        currentView = 'summary';

    } catch (error) {
        console.error('Error fetching account data:', error);
        content.innerHTML = `<p style="color: red;">Error fetching account data: ${error.message}</p>`;
    }
}
fetchAndPrepareAccountData().then(() => console.log(accountData));

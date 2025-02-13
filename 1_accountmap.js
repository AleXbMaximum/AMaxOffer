// Build the account map from the card members response.
const buildAccountMap = (data) => {
    const accountMap = {};
    if (data && Array.isArray(data.accounts)) {
        data.accounts.forEach(item => {
            // Add the main account if it has an account_token.
            if (item.account_token) {
                accountMap[item.account_token] = item;
            }
            // Also add any supplementary accounts.
            if (Array.isArray(item.supplementary_accounts)) {
                item.supplementary_accounts.forEach(supp => {
                    if (supp.account_token) {
                        accountMap[supp.account_token] = supp;
                    }
                });
            }
        });
    }
    return accountMap;
};

// Fetch card members and then use the first account token for the offers request.
fetch('https://global.americanexpress.com/api/servicing/v1/member', {
    method: 'GET',
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json'
    }
})
    .then(response => response.json())
    .then(data => {
        const accountMap = buildAccountMap(data);
        const tokens = Object.keys(accountMap);
        if (tokens.length === 0) {
            throw new Error('No account tokens found.');
        }
        const firstAccountToken = tokens[0];
        console.log('Using account token:', firstAccountToken);

        // Now make the offers request with the first account token.
        return fetch('https://global.americanexpress.com/api/servicing/v1/offers?status=ELIGIBLE,ENROLLED', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'account_token': firstAccountToken,
                'accept': 'application/json',
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'en,zh-CN;q=0.9,zh;q=0.8,zh-TW;q=0.7,ja;q=0.6',
                'cookie': 'en-US',
                'priority': 'u=1, i',
                'referer': 'https://global.americanexpress.com/dashboard?inav=menu_myacct_acctsum',
                'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132", "Microsoft Edge";v="132"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'timezone_offset': '-04:00',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0'
            }
        });
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(offersData => {
        console.log('Offers:', offersData);
    })
    .catch(error => console.error('Error:', error));

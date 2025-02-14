// Function to build an account map from the API response.
const buildAccountMap = (data) => {
  const accountMap = {};

  if (data && Array.isArray(data.accounts)) {
    data.accounts.forEach(item => {
      // Add the main account (if available) keyed by its account_token.
      if (item.account_token) {
        accountMap[item.account_token] = item;
      }
      // If there are supplementary accounts, add each one separately.
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

// Example usage: fetch data from the endpoint and build the map.
fetch('https://global.americanexpress.com/api/servicing/v1/member', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    const accountMap = buildAccountMap(data);
    console.log('Account Map:', accountMap);
  })
  .catch(error => console.error('Error fetching card members:', error));

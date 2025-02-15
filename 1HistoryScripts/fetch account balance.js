async function fetchCurrentBalance(accountToken) {
    if (!accountToken) {
        console.error("Account token is required");
        return null;
    }
    try {
        const response = await fetch("https://global.americanexpress.com/api/servicing/v1/financials/balances?extended_details=deferred,non_deferred,pay_in_full,pay_over_time,early_pay", {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'account_tokens': accountToken
            }
        });
        if (!response.ok) {
            console.error('Failed to fetch current balance, status:', response.status);
            return null;
        }
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            // statement_balance_amount is the current balance
            return data[0].statement_balance_amount;
        } else {
            console.error("Unexpected data format for balance:", data);
            return null;
        }
    } catch (error) {
        console.error("Error fetching current balance:", error);
        return null;
    }
}

// Example usage:
const accountToken = "PSZDZT4TZF1WP3Z"; // Replace with a valid account token
fetchCurrentBalance(accountToken).then(balance => {
    if (balance !== null) {
        console.log("Current balance:", balance);
    } else {
        console.log("No balance available.");
    }
});

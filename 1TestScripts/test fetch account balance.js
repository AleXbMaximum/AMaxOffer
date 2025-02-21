async function fetchFinancialData(accountToken) {
    if (!accountToken) {
        console.error("Account token is required");
        return null;
    }
    try {
        const balancesUrl = "https://global.americanexpress.com/api/servicing/v1/financials/balances?extended_details=deferred,non_deferred,pay_in_full,pay_over_time,early_pay";
        const transactionUrl = "https://global.americanexpress.com/api/servicing/v1/financials/transaction_summary?status=pending";

        // Perform both API calls concurrently.
        const [balancesResponse, transactionResponse] = await Promise.all([
            fetch(balancesUrl, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'account_tokens': accountToken
                }
            }),
            fetch(transactionUrl, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'account_tokens': accountToken
                }
            })
        ]);

        if (!balancesResponse.ok) {
            console.error("Failed to fetch balances, status:", balancesResponse.status);
            return null;
        }
        if (!transactionResponse.ok) {
            console.error("Failed to fetch transaction summary, status:", transactionResponse.status);
            return null;
        }

        const balanceData = await balancesResponse.json();
        const transactionData = await transactionResponse.json();

        // Extract balance details.
        let balanceInfo = null;
        if (Array.isArray(balanceData) && balanceData.length > 0) {
            balanceInfo = {
                statement_balance_amount: balanceData[0].statement_balance_amount,
                remaining_statement_balance_amount: balanceData[0].remaining_statement_balance_amount
            };
        } else {
            console.error("Unexpected data format for balances:", balanceData);
        }

        // Extract transaction summary details.
        let transactionInfo = null;
        if (Array.isArray(transactionData) && transactionData.length > 0) {
            transactionInfo = {
                debits_credits_payments_total_amount: transactionData[0].total?.debits_credits_payments_total_amount
            };
        } else {
            console.error("Unexpected data format for transaction summary:", transactionData);
        }

        return {
            ...balanceInfo,
            ...transactionInfo
        };
    } catch (error) {
        console.error("Error fetching financial data:", error);
        return null;
    }
}

// Example usage:
const accountToken = "PSZDZT4TZF1WP3Z"; // Replace with a valid account token
fetchFinancialData(accountToken).then(result => {
    if (result !== null) {
        console.log("Financial data:", result);
    } else {
        console.log("Failed to fetch financial data.");
    }
});

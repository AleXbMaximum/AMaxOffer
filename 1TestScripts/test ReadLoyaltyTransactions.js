// Function to fetch loyalty transactions
async function fetchLoyaltyTransactions(params) {
    const url = "https://functions.americanexpress.com/ReadLoyaltyTransactions.v1";
    try {
        const response = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*"
            },
            body: JSON.stringify(params)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching loyalty transactions:", error);
        return null;
    }
}

// Test script
(async () => {
    const params = {
        accountToken: "B79EURSUL5MNJDF",
        productType: "AEXP_CARD_ACCOUNT",
        offset: 0,
        limit: 1000,
        startDate: "2025-01-15",
        endDate: "2025-02-22",
        transactionsFor: "LOYALTY_ACCOUNT"
    };

    const transactions = await fetchLoyaltyTransactions(params);
    console.log("Loyalty Transactions:", transactions);
})();

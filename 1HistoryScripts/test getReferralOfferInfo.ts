async function getReferralOfferInfo(accountToken) {
    const url = "https://functions.americanexpress.com/ReadReferralOfferForAccount.v1";
    const payload = {
        accountToken: accountToken,
        campaignId: "MYCA",
        clientId: "SPA-WEB",
        locale: "en-US"
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            credentials: "include", // Ensure cookies are sent
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Extract useful info from the response data.
        return {
            referrerUrl: data.referrerUrl,
            referrerSubHeader: data.referrerOfferContent?.subHeader,
            refereeSubHeader: data.refereeOfferContent?.subHeader,
            refereeOfferDescription: data.refereeOfferContent?.offerDescription,
            referrerProductOfferId: data.trackingContent?.referrerProductOfferId,
            cardArtUrl: data.cardArtUrl,
            shortUrlId: data.shortUrlId
        };
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
}

// Test script using the function.
(async function testScript() {
    try {
        // Provide your account token as input.
        const accountToken = "CXIT3A87YKU7QRB"; // Replace with desired account token if needed.
        const usefulInfo = await getReferralOfferInfo(accountToken);
        console.log("Extracted Useful Info:", usefulInfo);
    } catch (error) {
        console.error("Test script error:", error);
    }
})();

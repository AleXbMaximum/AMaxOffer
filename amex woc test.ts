// Define a new variable for the eepTag value
const eepTag = "36176-11-1-K5ZR0125EF";


// Second fetch: Offer Information Request with revised payload and separated eepTag variable
const offerPayload = {
    productName: "platinum-card",
    journey: "shortApplication",
    crossExperience: "shortApplication",
    eepTag: eepTag,
    sourceCode: "A0000HKXPH",
    showPrescreenedNotice: false,
    messageId: "699261a71538467c8ceac35b97e655ea",
    isPreapproved: true,
    channelInfo: {},
    iaCode: "2X",
    shopVariants: {},
    format: "json",·
    type: "terms",
    appId: "690171bc59b04dfe53a876fe64ec1c8aa82d80b2",
    platform: "CPSApply"
};

fetch("https://www.americanexpress.com/us/credit-cards/card-application/apply/api/v1/offer-information", {
    method: "POST",
    headers: {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json;charset=UTF-8",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Chromium\";v=\"134\", \"Not:A-Brand\";v=\"24\", \"Microsoft Edge\";v=\"134\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin"
    },
    referrer: `https://www.americanexpress.com/us/credit-cards/card-application/apply/platinum-card/${eepTag}`,
    referrerPolicy: "strict-origin-when-cross-origin",
    body: JSON.stringify(offerPayload),
    mode: "cors",
    credentials: "include"
})
    .then(response => {
        if (!response.ok) {
            throw new Error(`Offer Information HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Offer Information Response:", data);
    })
    .catch(error => {
        console.error("Offer Information Error:", error);
    });

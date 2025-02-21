fetch('https://functions.americanexpress.com/CreateCardAccountOfferEnrollment.v1', {
    method: 'POST',
    credentials: 'include', // This tells the browser to include cookies
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://global.americanexpress.com'
    },
    body: JSON.stringify({
        accountNumberProxy: "FNTZDCRFB6NIRIK",
        identifier: "lBNrwU",
        identifierType: "OFFER",
        locale: "en-US",
        offerRequestType: "DETAILS",
        requestDateTimeWithOffset: "2025-02_12T08:33:50-06:00",
        userOffset: "-06:00"
    })
})
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));





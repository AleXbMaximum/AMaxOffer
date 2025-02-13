fetch('https://functions.americanexpress.com/ReadCardAccountOffersList.v1', {
    method: 'POST',
    credentials: 'include', // This tells the browser to include cookies
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://global.americanexpress.com'
    },
    body: JSON.stringify({
        accountNumberProxy: "FNTZDCRFB6NIRIK",
        locale: "en-US",
        offerRequestType: "LIST",
        source: "STANDARD",
        status: ["ELIGIBLE", "ENROLLED"],
        typeOf: "MERCHANT",
        userOffset: "-06:00"
    })
})
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
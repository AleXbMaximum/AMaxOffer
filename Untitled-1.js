trackersGroup.forEach((trackerObj, index, arr) => {
    const t = trackerObj.tracker || trackerObj;
    const trackerCard = document.createElement('div');
    trackerCard.style.border = '1px solid #ddd';
    trackerCard.style.borderRadius = '10px';
    trackerCard.style.padding = '16px';
    trackerCard.style.margin = (index === arr.length - 1) ? '12px 0 0 0' : '12px 0';
    trackerCard.style.backgroundColor = '#fff';
    trackerCard.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
    trackerCard.style.transition = 'background-color 0.3s ease';

    // Card header
    const cardHeader = document.createElement('div');
    cardHeader.style.display = 'flex';
    cardHeader.style.justifyContent = 'space-between';
    cardHeader.style.marginBottom = '12px';
    cardHeader.textContent = `Card: •••• ${trackerObj.cardEnding}`;

    trackerCard.appendChild(cardHeader);
    trackerCard.appendChild(progressContainer);

    // Append message at the bottom (if available)
    if (trackerObj.progress && trackerObj.progress.message) {
        const message = document.createElement('div');
        message.style.marginTop = '12px';
        message.style.padding = '12px';
        message.style.background = '#f9f9f9';
        message.style.borderRadius = '8px';
        message.style.color = '#777';
        message.style.fontSize = '14px';
        message.innerHTML = trackerObj.progress.message;
        trackerCard.appendChild(message);
    }
    bodyDiv.appendChild(trackerCard);
});



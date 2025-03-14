function offer_initSortOrder() {
    const sortState = renderEngine.restoreSortState('OFFER');
    const key = sortState.key || 'favorite';
    const direction = sortState.key ? sortState.direction : -1;

    renderEngine.saveSortState('OFFER', key, direction);
    offer_updateSortOrder(key, direction);
}

function offer_updateSortOrder(key, direction) {
    const offers = glbVer.get('offers_current') || [];

    const sortFunctions = {
        favorite: (a, b) => direction * (Number(b.favorite) - Number(a.favorite)),
        name: (a, b) => direction * (a.name || "").localeCompare(b.name || ""),
        achievement_type: (a, b) => direction * (a.achievement_type || "").localeCompare(b.achievement_type || ""),
        category: (a, b) => direction * (a.category || "").localeCompare(b.category || ""),
        expiry_date: (a, b) => {
            const dateA = a.expiry_date ? new Date(a.expiry_date) : new Date(0);
            const dateB = b.expiry_date ? new Date(b.expiry_date) : new Date(0);
            return direction * (dateA - dateB);
        },
        threshold: (a, b) => {
            const numA = a.threshold ? parseFloat(a.threshold.replace(/[^\d.-]/g, '')) : 0;
            const numB = b.threshold ? parseFloat(b.threshold.replace(/[^\d.-]/g, '')) : 0;
            return direction * (numA - numB);
        },
        reward: (a, b) => {
            const numA = a.reward ? parseFloat(a.reward.replace(/[^\d.-]/g, '')) : 0;
            const numB = b.reward ? parseFloat(b.reward.replace(/[^\d.-]/g, '')) : 0;
            return direction * (numA - numB);
        },
        percentage: (a, b) => {
            const numA = a.percentage ? parseFloat(a.percentage.replace(/[^\d.-]/g, '')) : 0;
            const numB = b.percentage ? parseFloat(b.percentage.replace(/[^\d.-]/g, '')) : 0;
            return direction * (numA - numB);
        },
        eligibleCards: (a, b) => direction * ((a.eligibleCards?.length || 0) - (b.eligibleCards?.length || 0)),
        enrolledCards: (a, b) => direction * ((a.enrolledCards?.length || 0) - (b.enrolledCards?.length || 0))
    };

    const sortedOffers = [...offers].sort(
        sortFunctions[key] ||
        ((a, b) => direction * ((a[key] || "").toString().localeCompare((b[key] || "").toString())))
    );

    offer_sortOrder = sortedOffers.map(offer => offer.offerId);
    return offer_sortOrder;
}

function offer_sortTable(key) {
    const sortState = renderEngine.restoreSortState('OFFER');
    let direction = sortState.key === key ? sortState.direction * -1 : 1;

    if ((key === "favorite" || key === "eligibleCards" || key === "enrolledCards") &&
        sortState.key !== key) {
        direction = -1;
    }

    renderEngine.saveSortState('OFFER', key, direction);
    offer_updateSortOrder(key, direction);

    const displayContainer = document.getElementById('offers-display-container');
    if (displayContainer) {
        displayContainer.innerHTML = "";
        displayContainer.appendChild(offer_renderTableView());
    }
}

function offer_renderTableView() {
    let processedOffers = filterOP.getFilteredOffers();

    if (processedOffers.length === 0) {
        return ui_createEmptyState(document.createElement('div'), {
            title: 'No Offers Found',
            message: filterOP.getFilters().offerFav ? 'No favorite offers found' :
                filterOP.getFilters().offerMerchantSearch ? `No offers match "${filterOP.getFilters().offerMerchantSearch}"` :
                    'No offers available',
            buttonText: 'Reset Filters',
            callback: () => {
                filterOP.resetFilters();
                renderEngine.renderCurrentView();
            }
        });
    }

    // Apply sorting using existing sort order without recalculation
    if (offer_sortOrder && offer_sortOrder.length > 0) {
        const offerIndexMap = new Map();
        offer_sortOrder.forEach((id, index) => {
            offerIndexMap.set(id, index);
        });

        processedOffers.sort((a, b) => {
            const indexA = offerIndexMap.has(a.offerId) ? offerIndexMap.get(a.offerId) : Number.MAX_SAFE_INTEGER;
            const indexB = offerIndexMap.has(b.offerId) ? offerIndexMap.get(b.offerId) : Number.MAX_SAFE_INTEGER;
            return indexA - indexB;
        });
    }

    // Continue with rendering the table
    // [rest of the function remains unchanged]
}
function offers_renderStatsBar() {
    const statsBar = document.createElement('div');
    statsBar.style.cssText = UI_STYLES.cardContainer + ' display:flex; flex-wrap:wrap; gap:16px; justify-content:space-between;';

    const stats = statsOP.getOffersStats();

    const createStatItem = (label, value, icon, color, filterAction) => {
        const statItem = document.createElement('div');
        statItem.style.cssText = `display:flex; align-items:center; gap:10px; padding:10px 16px; background-color:rgba(${color}, 0.1); border-radius:10px; border:1px solid rgba(${color}, 0.2); min-width:150px; transition:all 0.2s ease; ${filterAction ? 'cursor:pointer;' : ''}`;

        // Add data attribute for identifying specific stats
        statItem.setAttribute('data-stat-type', label.toLowerCase());

        if (filterAction) {
            statItem.addEventListener('mouseenter', () => {
                statItem.style.transform = 'translateY(-2px)';
                statItem.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)';
            });
            statItem.addEventListener('mouseleave', () => {
                statItem.style.transform = 'translateY(0)';
                statItem.style.boxShadow = 'none';
            });
            statItem.addEventListener('click', () => {
                filterAction();

                const displayContainer = document.getElementById('offers-display-container');
                if (displayContainer) {
                    displayContainer.innerHTML = "";
                    displayContainer.appendChild(offers_renderTableView());
                }
            });
        }

        const iconElement = document.createElement('div');
        iconElement.innerHTML = icon;
        iconElement.style.color = `rgb(${color})`;

        const textContainer = document.createElement('div');
        textContainer.style.cssText = 'display:flex; flex-direction:column;';

        const valueElement = document.createElement('div');
        valueElement.textContent = value;
        valueElement.style.cssText = `font-size:18px; font-weight:600; color:rgb(${color});`;

        // Add data attribute for the value element
        valueElement.setAttribute('data-stat-value', 'true');

        const labelElement = document.createElement('div');
        labelElement.textContent = label;
        labelElement.style.cssText = 'font-size:12px; color:var(--ios-text-secondary);';

        textContainer.appendChild(valueElement);
        textContainer.appendChild(labelElement);
        statItem.appendChild(iconElement);
        statItem.appendChild(textContainer);

        return statItem;
    };

    const ICONS = {
        TOTAL: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" fill="currentColor"/></svg>`,
        FAVORITE: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/></svg>`,
        EXPIRING: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor"/></svg>`,
        ENROLLED: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor"/></svg>`,
        pendingBalance: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2v-2zm1-10c-2.76 0-5 2.24-5 5h2c0-1.65 1.35-3 3-3s3 1.35 3 3c0 1.65-1.35 3-3 3v2c2.76 0 5-2.24 5-5s-2.24-5-5-5z" fill="currentColor"/></svg>`,
        ELIGIBLE: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.6-8 8-8 8 3.6 8 8-3.59 8-8 8zm-2-5h4c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1v-1c0-1.11-.9-2-2-2s-2 .89-2 2v1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1zm1.5-6c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v1h-3v-1z" fill="currentColor"/></svg>`
    };

    statsBar.appendChild(createStatItem('Total Offers', stats.totalOffers, ICONS.TOTAL, '52, 152, 219', () => {
        filterOP.resetFilters();
        renderEngine.renderCurrentView();
    }));

    statsBar.appendChild(createStatItem('Favorites', stats.favoriteOffers, ICONS.FAVORITE, '255, 149, 0', () => {
        filterOP.resetFilters();
        filterOP.setFilter('offerFav', true);
        renderEngine.renderCurrentView();
    }));

    statsBar.appendChild(createStatItem('Expiring Soon', stats.expiringSoon, ICONS.EXPIRING, '244, 67, 54', () => {
        filterOP.resetFilters();
        filterOP.setFilter('customFilter', filterOP.createExpiringFilter());
        renderEngine.renderCurrentView();
    }));

    statsBar.appendChild(createStatItem('Pending Enrollment', stats.distinctNotFullyEnrolled, ICONS.pendingBalance, '255, 204, 0', () => {
        filterOP.resetFilters();
        filterOP.setFilter('enrollmentStatus', 'pending');
        renderEngine.renderCurrentView();
    }));

    statsBar.appendChild(createStatItem('Total Eligible', stats.totalEligible, ICONS.ELIGIBLE, '142, 142, 147', () => {
        filterOP.resetFilters();
        filterOP.setFilter('eligibleOnly', true);
        renderEngine.renderCurrentView();
    }));

    statsBar.appendChild(createStatItem('Total Enrolled', stats.totalEnrolled, ICONS.ENROLLED, '50, 173, 230', () => {
        filterOP.resetFilters();
        filterOP.setFilter('enrolledOnly', true);
        renderEngine.renderCurrentView();
    }));

    return statsBar;
}

function offers_toggleFavorite(offer) {
    offer.favorite = !offer.favorite;

    // Find and update the original offer in the glbVer
    glbVer.update('offers', offers => {
        return offers.map(o => o.offerId === offer.offerId ?
            { ...o, favorite: offer.favorite } : o);
    });

    statsOP.invalidate('offers');
    storageOP.saveDataChanges('favorite');

    // Update the UI element that triggered this
    const event = window.event;
    if (event && event.target) {
        const favoriteBtn = event.target.closest('button');
        if (favoriteBtn) {
            favoriteBtn.innerHTML = offer.favorite ?
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="#ff9500"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>' :
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#777" stroke-width="2"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
            favoriteBtn.classList.add('ios-sort-animation');
            setTimeout(() => favoriteBtn.classList.remove('ios-sort-animation'), 300);
        }
    }

    // Get fresh stats data after the cache has been invalidated

}
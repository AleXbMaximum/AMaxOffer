// Improved benefits page rendering with better state management and UI rendering
async function renderBenefits() {
    // Ensure we have benefit data
    if (!glb_benefit || glb_benefit.length === 0) {
        await get_benefit();
    }

    const containerDiv = document.createElement('div');
    containerDiv.className = 'benefits-container';
    containerDiv.style.cssText = 'padding:20px; background-color:rgba(255,255,255,0.04); border-radius:12px; max-width:1000px; margin:0 auto;';

    // Process all data once before rendering to improve performance
    const { groupedBenefits, sortedBenefitGroups, statusCounts } = processBenefitsData(glb_benefit);

    // Add benefits overview statistics
    containerDiv.appendChild(createBenefitsOverview(statusCounts));

    // Create status legend with enhanced styling
    const statusLegendConfig = {
        'ACHIEVED': { label: 'Completed', color: 'var(--ios-green)' },
        'IN_PROGRESS': { label: 'In Progress', color: 'var(--ios-blue)' },
        'NOT_STARTED': { label: 'Not Started', color: 'var(--ios-gray)' }
    };

    containerDiv.appendChild(createStatusLegend(statusLegendConfig));

    // Handle empty state with better user feedback
    if (sortedBenefitGroups.length === 0) {
        containerDiv.appendChild(createEmptyState());
    } else {
        // Create filter controls
        const filterControls = createBenefitFilters();
        containerDiv.appendChild(filterControls);

        // Create accordion items with a document fragment for better performance
        const accordionContainer = document.createElement('div');
        accordionContainer.className = 'accordion-container';

        const fragment = document.createDocumentFragment();
        sortedBenefitGroups.forEach(groupObj => {
            fragment.appendChild(createAccordionItem(groupObj, statusLegendConfig));
        });

        accordionContainer.appendChild(fragment);
        containerDiv.appendChild(accordionContainer);
    }

    return containerDiv;
}

// Enhanced benefits overview with statistics
function createBenefitsOverview(statusCounts) {
    const overviewSection = document.createElement('div');
    overviewSection.style.cssText = 'display:flex; flex-wrap:wrap; gap:16px; margin-bottom:24px; justify-content:center;';

    // Create stat cards for each status
    const createStatCard = (label, value, color, icon) => {
        const card = document.createElement('div');
        card.style.cssText = `
            background-color:white; 
            border-radius:16px; 
            padding:16px 20px; 
            min-width:140px; 
            box-shadow:0 4px 12px rgba(0,0,0,0.06); 
            display:flex; 
            flex-direction:column; 
            align-items:center; 
            border-top:3px solid ${color};
            transition:transform 0.2s ease;
        `;

        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });

        const valueEl = document.createElement('div');
        valueEl.textContent = value;
        valueEl.style.cssText = `font-size:32px; font-weight:700; color:${color}; margin-bottom:8px;`;

        const labelEl = document.createElement('div');
        labelEl.textContent = label;
        labelEl.style.cssText = 'font-size:14px; color:#666; text-align:center;';

        // Add icon if provided
        if (icon) {
            const iconEl = document.createElement('div');
            iconEl.innerHTML = icon;
            iconEl.style.cssText = 'margin-bottom:10px;';
            card.appendChild(iconEl);
        }

        card.appendChild(valueEl);
        card.appendChild(labelEl);

        return card;
    };

    // Icons for stat cards
    const icons = {
        total: `<svg width="24" height="24" viewBox="0 0 24 24" fill="${statusCounts.total ? 'var(--ios-blue)' : '#aaa'}">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
            <path d="M7 12h2v5H7v-5zm4-7h2v12h-2V5zm4 4h2v8h-2v-8z"/>
        </svg>`,
        completed: `<svg width="24" height="24" viewBox="0 0 24 24" fill="${statusCounts.achieved ? 'var(--ios-green)' : '#aaa'}">
            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
        </svg>`,
        inProgress: `<svg width="24" height="24" viewBox="0 0 24 24" fill="${statusCounts.inProgress ? 'var(--ios-blue)' : '#aaa'}">
            <path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/>
        </svg>`,
        notStarted: `<svg width="24" height="24" viewBox="0 0 24 24" fill="${statusCounts.notStarted ? 'var(--ios-gray)' : '#aaa'}">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
            <path d="M11 7h2v6h-2zm0 8h2v2h-2z"/>
        </svg>`
    };

    // Add stats cards
    overviewSection.appendChild(createStatCard('Total Benefits', statusCounts.total || 0, 'var(--ios-blue)', icons.total));
    overviewSection.appendChild(createStatCard('Completed', statusCounts.achieved || 0, 'var(--ios-green)', icons.completed));
    overviewSection.appendChild(createStatCard('In Progress', statusCounts.inProgress || 0, 'var(--ios-blue)', icons.inProgress));
    overviewSection.appendChild(createStatCard('Not Started', statusCounts.notStarted || 0, 'var(--ios-gray)', icons.notStarted));

    return overviewSection;
}

function createBenefitFilters() {
    const filterContainer = document.createElement('div');
    filterContainer.style.cssText = `
        display:flex;
        flex-wrap:wrap;
        gap:12px;
        margin-bottom:20px;
        padding:16px;
        background-color:rgba(255,255,255,0.6);
        border-radius:12px;
        box-shadow:0 2px 8px rgba(0,0,0,0.05);
        align-items:center;
    `;

    // Search input
    const searchWrapper = document.createElement('div');
    searchWrapper.style.cssText = 'position:relative; flex:1; min-width:200px;';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search benefits...';
    searchInput.style.cssText = `
        width:100%;
        padding:10px 12px;
        padding-left:36px;
        border-radius:8px;
        border:1px solid #ddd;
        font-size:14px;
        outline:none;
        transition:all 0.2s ease;
    `;

    searchInput.addEventListener('focus', () => {
        searchInput.style.boxShadow = '0 0 0 2px rgba(0, 122, 255, 0.2)';
        searchInput.style.borderColor = 'var(--ios-blue)';
    });

    searchInput.addEventListener('blur', () => {
        searchInput.style.boxShadow = 'none';
        searchInput.style.borderColor = '#ddd';
    });

    // Search icon
    const searchIcon = document.createElement('div');
    searchIcon.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
    `;
    searchIcon.style.cssText = 'position:absolute; top:50%; left:12px; transform:translateY(-50%);';

    searchWrapper.appendChild(searchIcon);
    searchWrapper.appendChild(searchInput);

    // Status filter
    const statusFilter = document.createElement('select');
    statusFilter.style.cssText = `
        padding:10px 12px;
        border-radius:8px;
        border:1px solid #ddd;
        font-size:14px;
        outline:none;
        background-color:white;
        cursor:pointer;
    `;

    const statusOptions = [
        { value: 'all', label: 'All Statuses' },
        { value: 'ACHIEVED', label: 'Completed' },
        { value: 'IN_PROGRESS', label: 'In Progress' },
        { value: 'NOT_STARTED', label: 'Not Started' }
    ];

    statusOptions.forEach(option => {
        const optionEl = document.createElement('option');
        optionEl.value = option.value;
        optionEl.textContent = option.label;
        statusFilter.appendChild(optionEl);
    });

    // Card filter
    const cardFilter = document.createElement('select');
    cardFilter.style.cssText = `
        padding:10px 12px;
        border-radius:8px;
        border:1px solid #ddd;
        font-size:14px;
        outline:none;
        background-color:white;
        cursor:pointer;
    `;

    // Get unique card endings
    const cardNumbers = [...new Set(glb_benefit.map(benefit => benefit.cardEnding))];

    const cardOptions = [
        { value: 'all', label: 'All Cards' },
        ...cardNumbers.map(card => ({ value: card, label: `Card ending ${card}` }))
    ];

    cardOptions.forEach(option => {
        const optionEl = document.createElement('option');
        optionEl.value = option.value;
        optionEl.textContent = option.label;
        cardFilter.appendChild(optionEl);
    });

    // Add event listeners for filtering
    const applyFilters = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedStatus = statusFilter.value;
        const selectedCard = cardFilter.value;

        // Find all accordion items
        const accordionItems = document.querySelectorAll('.accordion-item');

        accordionItems.forEach(item => {
            // Get title text for search
            const titleText = item.querySelector('.accordion-title').textContent.toLowerCase();

            // Get status information
            const statusMarkers = Array.from(item.querySelectorAll('.mini-card'));
            const hasStatus = selectedStatus === 'all' || statusMarkers.some(marker =>
                marker.getAttribute('data-status') === selectedStatus
            );

            // Get card information
            const cardMarkers = Array.from(item.querySelectorAll('.card-ending'));
            const hasCard = selectedCard === 'all' || cardMarkers.some(marker =>
                marker.textContent === selectedCard
            );

            // Determine visibility
            const matchesSearch = searchTerm === '' || titleText.includes(searchTerm);
            const isVisible = matchesSearch && hasStatus && hasCard;

            // Apply visibility
            item.style.display = isVisible ? 'block' : 'none';
        });
    };

    searchInput.addEventListener('input', applyFilters);
    statusFilter.addEventListener('change', applyFilters);
    cardFilter.addEventListener('change', applyFilters);

    // Add reset button
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset Filters';
    resetButton.style.cssText = `
        padding:10px 16px;
        border-radius:8px;
        border:none;
        background-color:rgba(142, 142, 147, 0.1);
        color:var(--ios-text-secondary);
        font-size:14px;
        cursor:pointer;
        transition:all 0.2s ease;
    `;

    resetButton.addEventListener('mouseenter', () => {
        resetButton.style.backgroundColor = 'rgba(142, 142, 147, 0.2)';
    });

    resetButton.addEventListener('mouseleave', () => {
        resetButton.style.backgroundColor = 'rgba(142, 142, 147, 0.1)';
    });

    resetButton.addEventListener('click', () => {
        searchInput.value = '';
        statusFilter.value = 'all';
        cardFilter.value = 'all';
        applyFilters();
    });

    // Assemble filter container
    filterContainer.appendChild(searchWrapper);
    filterContainer.appendChild(statusFilter);
    filterContainer.appendChild(cardFilter);
    filterContainer.appendChild(resetButton);

    return filterContainer;
}

// Process benefits data with improved analytics
function processBenefitsData(benefits) {
    // Initialize counters
    const statusCounts = {
        total: 0,
        achieved: 0,
        inProgress: 0,
        notStarted: 0
    };

    // Group benefits by benefitId
    const groupedBenefits = benefits.reduce((grouped, trackerObj) => {
        const key = trackerObj.benefitId;
        grouped[key] = grouped[key] || [];
        grouped[key].push(trackerObj);

        // Count statuses
        statusCounts.total++;
        if (trackerObj.status === 'ACHIEVED') {
            statusCounts.achieved++;
        } else if (trackerObj.status === 'IN_PROGRESS') {
            statusCounts.inProgress++;
        } else {
            statusCounts.notStarted++;
        }

        return grouped;
    }, {});

    // Enhanced sorting with more benefit types
    const sortedBenefitGroups = sortBenefitGroups(groupedBenefits);

    return {
        groupedBenefits,
        sortedBenefitGroups,
        statusCounts
    };
}

// Enhanced sorting for benefit groups
function sortBenefitGroups(groupedBenefits) {
    // Expanded mapping of benefit IDs to display order and custom names
    const benefitSortMapping = {
        // Credits
        "200-afc-tracker": { order: 1, newName: "$200 Platinum Flight Credit", category: "Travel Credits" },
        "$200-airline-statement-credit": { order: 2, newName: "$200 Aspire Flight Credit", category: "Travel Credits" },
        "$400-hilton-aspire-resort-credit": { order: 3, newName: "$400 Hilton Aspire Resort Credit", category: "Hotel Credits" },
        "$240 flexible business credit": { order: 4, newName: "$240 Flexible Business Credit", category: "Business Credits" },
        "saks-platinum-tracker": { order: 5, newName: "$100 Saks Credit", category: "Shopping Credits" },
        "$120 dining credit for gold card": { order: 6, newName: "$120 Dining Credit (Gold)", category: "Dining Credits" },
        "$84 dunkin' credit": { order: 7, newName: "$84 Dunkin' Credit", category: "Dining Credits" },
        "$100 resy credit": { order: 8, newName: "$100 Resy Credit", category: "Dining Credits" },
        "hotel-credit-platinum-tracker": { order: 9, newName: "$200 FHR Credit", category: "Hotel Credits" },
        "digital entertainment": { order: 10, newName: "$20 Digital Entertainment Credit", category: "Entertainment Credits" },
        "$199 clear plus credit": { order: 11, newName: "$199 CLEAR Plus Credit", category: "Travel Credits" },
        "walmart+ monthly membership credit": { order: 12, newName: "Walmart+ Membership Credit", category: "Shopping Credits" },

        // Membership benefits
        "earn free night rewards": { order: 13, newName: "Earn Free Night Rewards", category: "Hotel Benefits" },
        "bd04b359-cc6b-4981-bd6f-afb9456eb9ea": { order: 14, newName: "Unlimited Delta Sky Club Access", category: "Airport Benefits" },
        "delta-sky-club-visits-platinum": { order: 15, newName: "Delta Sky Club Access Pass", category: "Airport Benefits" },

        // Additional common benefits
        "uber-cash-platinum": { order: 16, newName: "$200 Uber Cash Credit", category: "Transportation Credits" },
        "uber-cash-gold": { order: 17, newName: "$120 Uber Cash Credit", category: "Transportation Credits" },
        "dell-credit-business-platinum": { order: 18, newName: "$400 Dell Credit", category: "Business Credits" },
        "wireless-credit-business-platinum": { order: 19, newName: "Wireless Credit", category: "Business Credits" },
        "equinox-credit-platinum": { order: 20, newName: "$300 Equinox Credit", category: "Lifestyle Credits" },
        "marriott-property-credit": { order: 21, newName: "Marriott Property Credit", category: "Hotel Credits" },
        "hilton-property-credit": { order: 22, newName: "Hilton Property Credit", category: "Hotel Credits" },
        "nytimes-credit": { order: 23, newName: "NY Times Credit", category: "Digital Credits" },
        "peacock-credit": { order: 24, newName: "Peacock Credit", category: "Digital Credits" },
        "disney-bundle-credit": { order: 25, newName: "Disney Bundle Credit", category: "Digital Credits" }
    };

    // Create array of objects with enhanced metadata
    const groupArray = Object.entries(groupedBenefits).map(([key, group]) => {
        const firstTracker = group[0];
        const benefitIdKey = (firstTracker.benefitId || "").toLowerCase().trim();
        const benefitNameKey = (firstTracker.benefitName || "").toLowerCase().trim();

        // Try to find in mapping, first by ID then by name
        const sortData = benefitSortMapping[benefitIdKey] || benefitSortMapping[benefitNameKey];

        // Extract period info for better display
        const periodInfo = getPeriodInfo(firstTracker);

        return {
            key,
            trackers: group,
            order: sortData?.order || Infinity,
            displayName: sortData?.newName || firstTracker.benefitName || "",
            category: sortData?.category || guessCategory(firstTracker),
            periodType: periodInfo.periodType,
            periodLabel: periodInfo.periodLabel
        };
    });

    // Sort by category first, then by order within category
    return groupArray.sort((a, b) => {
        // Sort by category first
        if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
        }

        // Then by predefined order
        if (a.order !== b.order) {
            return a.order - b.order;
        }

        // Finally by name
        return (a.displayName || "").localeCompare(b.displayName || "");
    });
}

// Extract period information with better formatting
function getPeriodInfo(tracker) {
    let periodType = "";
    let periodLabel = "";

    if (tracker.trackerDuration) {
        const duration = tracker.trackerDuration.toLowerCase();

        if (duration.includes("month")) {
            periodType = "monthly";
            periodLabel = "Monthly";
        } else if (duration.includes("year")) {
            periodType = "yearly";
            periodLabel = duration.includes("calender") ? "Calendar Year" : "Annual";
        } else if (duration.includes("half")) {
            periodType = "semi-annual";
            periodLabel = "Semi-Annual";
        } else if (duration.includes("quarter")) {
            periodType = "quarterly";
            periodLabel = "Quarterly";
        } else {
            periodType = duration;
            periodLabel = duration.charAt(0).toUpperCase() + duration.slice(1);
        }
    } else if (tracker.periodStartDate && tracker.periodEndDate) {
        // If no duration is specified, try to determine from dates
        const start = new Date(tracker.periodStartDate);
        const end = new Date(tracker.periodEndDate);

        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();

            if (diffMonths <= 1) {
                periodType = "monthly";
                periodLabel = "Monthly";
            } else if (diffMonths >= 11 && diffMonths <= 13) {
                periodType = "yearly";
                periodLabel = "Annual";
            } else if (diffMonths >= 5 && diffMonths <= 7) {
                periodType = "semi-annual";
                periodLabel = "Semi-Annual";
            } else if (diffMonths >= 2 && diffMonths <= 4) {
                periodType = "quarterly";
                periodLabel = "Quarterly";
            }
        }
    }

    return { periodType, periodLabel };
}

// Guess category from benefit name
function guessCategory(tracker) {
    const name = (tracker.benefitName || "").toLowerCase();

    if (name.includes("hotel") || name.includes("resort") || name.includes("hilton") || name.includes("marriott")) {
        return "Hotel Credits";
    } else if (name.includes("airline") || name.includes("flight") || name.includes("travel") || name.includes("delta")) {
        return "Travel Credits";
    } else if (name.includes("dining") || name.includes("restaurant") || name.includes("food")) {
        return "Dining Credits";
    } else if (name.includes("entertainment") || name.includes("streaming")) {
        return "Entertainment Credits";
    } else if (name.includes("business")) {
        return "Business Credits";
    } else if (name.includes("shop") || name.includes("retail") || name.includes("store")) {
        return "Shopping Credits";
    } else {
        return "Other Benefits";
    }
}

// Create enhanced status legend
function createStatusLegend(statusConfig) {
    const legend = document.createElement('div');
    legend.className = 'status-legend';
    legend.style.cssText = 'display:flex; gap:15px; margin-bottom:25px; justify-content:center; flex-wrap:wrap; background-color:rgba(255,255,255,0.6); border-radius:12px; padding:12px; box-shadow:0 2px 4px rgba(0,0,0,0.05);';

    Object.entries(statusConfig).forEach(([status, { label, color }]) => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.style.cssText = 'display:flex; align-items:center; gap:8px; padding:8px 12px; border-radius:8px; transition:background-color 0.2s ease;';

        legendItem.addEventListener('mouseenter', () => {
            legendItem.style.backgroundColor = 'rgba(0,0,0,0.05)';
        });

        legendItem.addEventListener('mouseleave', () => {
            legendItem.style.backgroundColor = 'transparent';
        });

        const colorDot = document.createElement('div');
        colorDot.className = 'legend-dot';
        colorDot.style.cssText = `width:12px; height:12px; border-radius:50%; background-color:${color}; box-shadow:0 1px 3px rgba(0,0,0,0.1);`;

        const labelSpan = document.createElement('span');
        labelSpan.className = 'legend-label';
        labelSpan.style.cssText = 'color:#333; font-size:14px; font-weight:500;';
        labelSpan.textContent = label;

        legendItem.appendChild(colorDot);
        legendItem.appendChild(labelSpan);
        legend.appendChild(legendItem);
    });

    return legend;
}

// Create empty state with better guidance
function createEmptyState() {
    const emptyState = document.createElement('div');
    emptyState.className = 'ios-empty-state';
    emptyState.style.cssText = 'text-align:center; padding:40px 20px; background-color:rgba(255,255,255,0.5); border-radius:16px; box-shadow:0 4px 12px rgba(0,0,0,0.05);';

    const emptyStateContainer = document.createElement('div');
    emptyStateContainer.className = 'ios-empty-state-container';
    emptyStateContainer.style.cssText = 'display:flex; flex-direction:column; align-items:center; justify-content:center;';

    const emptyStateIcon = document.createElement('div');
    emptyStateIcon.className = 'ios-empty-state-icon';
    emptyStateIcon.style.cssText = 'width:80px; height:80px; border-radius:40px; background-color:rgba(0,0,0,0.03); display:flex; align-items:center; justify-content:center; margin-bottom:24px; box-shadow:0 4px 12px rgba(0, 0, 0, 0.05);';
    emptyStateIcon.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--ios-gray)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <path d="M3 9h18"></path>
            <path d="M9 21V9"></path>
        </svg>
    `;

    const emptyStateTitle = document.createElement('div');
    emptyStateTitle.className = 'ios-empty-state-title';
    emptyStateTitle.style.cssText = 'color:#3a3a3c; font-size:20px; font-weight:600; margin-bottom:12px;';
    emptyStateTitle.textContent = 'No Benefits Available';

    const emptyStateMessage = document.createElement('div');
    emptyStateMessage.className = 'ios-empty-state-message';
    emptyStateMessage.style.cssText = 'color:var(--ios-gray); font-size:15px; max-width:400px; line-height:1.5; margin:0 auto 24px;';
    emptyStateMessage.innerHTML = `
        Your American Express cards don't appear to have any trackable benefits right now. 
        Benefits typically include credits for travel, dining, shopping, and more.
        <br><br>
        Try refreshing your data or checking again later.
    `;

    const refreshButton = document.createElement('button');
    refreshButton.textContent = 'Refresh Benefits Data';
    refreshButton.style.cssText = `
        padding:12px 24px;
        background-color:var(--ios-blue);
        color:white;
        border:none;
        border-radius:12px;
        font-size:15px;
        font-weight:500;
        cursor:pointer;
        box-shadow:0 4px 12px rgba(0, 0, 0, 0.1);
        transition:all 0.2s ease;
    `;

    refreshButton.addEventListener('mouseenter', () => {
        refreshButton.style.transform = 'translateY(-2px)';
        refreshButton.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
    });

    refreshButton.addEventListener('mouseleave', () => {
        refreshButton.style.transform = 'translateY(0)';
        refreshButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    });

    refreshButton.addEventListener('click', async () => {
        refreshButton.textContent = 'Refreshing...';
        refreshButton.disabled = true;
        refreshButton.style.opacity = '0.7';

        try {
            await get_benefit();
            renderPage();
        } catch (error) {
            console.error('Error refreshing benefits:', error);
            refreshButton.textContent = 'Refresh Failed';

            setTimeout(() => {
                refreshButton.textContent = 'Try Again';
                refreshButton.disabled = false;
                refreshButton.style.opacity = '1';
            }, 2000);
        }
    });

    emptyStateContainer.appendChild(emptyStateIcon);
    emptyStateContainer.appendChild(emptyStateTitle);
    emptyStateContainer.appendChild(emptyStateMessage);
    emptyStateContainer.appendChild(refreshButton);
    emptyState.appendChild(emptyStateContainer);

    return emptyState;
}

// Create enhanced accordion item
function createAccordionItem(groupObj, statusConfig) {
    const accordionItem = document.createElement('div');
    accordionItem.className = 'accordion-item';
    accordionItem.style.cssText = `
        border:1px solid #e0e0e0;
        border-radius:12px;
        margin-bottom:16px;
        background-color:#ffffff;
        box-shadow:0 2px 8px rgba(0,0,0,0.08);
        transition:box-shadow 0.2s ease, transform 0.2s ease;
        overflow:hidden;
    `;

    // Apply hover effects
    accordionItem.addEventListener('mouseenter', () => {
        accordionItem.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
        accordionItem.style.transform = 'translateY(-3px)';
    });

    accordionItem.addEventListener('mouseleave', () => {
        accordionItem.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        accordionItem.style.transform = 'translateY(0)';
    });

    // Tag the item with categories and status for filtering
    if (groupObj.category) {
        accordionItem.setAttribute('data-category', groupObj.category);
    }

    const allStatuses = groupObj.trackers.map(t => t.status);
    allStatuses.forEach(status => {
        accordionItem.setAttribute(`data-has-${status.toLowerCase()}`, 'true');
    });

    // Create header with enhanced UI
    const headerDiv = createAccordionHeader(groupObj, statusConfig);

    // Create body with enhanced UI
    const bodyDiv = createAccordionBody(groupObj);

    // Store reference to body for toggle functionality
    headerDiv.bodyRef = bodyDiv;
    headerDiv.parentItem = accordionItem;

    accordionItem.appendChild(headerDiv);
    accordionItem.appendChild(bodyDiv);

    return accordionItem;
}

// Create enhanced accordion header
function createAccordionHeader(groupObj, statusConfig) {
    const headerDiv = document.createElement('div');
    headerDiv.className = 'accordion-header';
    headerDiv.style.cssText = `
        padding:16px 20px;
        cursor:pointer;
        transition:background-color 0.2s ease;
        background-color:#f9f9f9;
        position:relative;
        border-bottom:1px solid transparent;
    `;

    // Add hover and active styles
    headerDiv.addEventListener('mouseenter', () => {
        headerDiv.style.backgroundColor = '#f0f0f0';
    });

    headerDiv.addEventListener('mouseleave', () => {
        if (!headerDiv.classList.contains('active')) {
            headerDiv.style.backgroundColor = '#f9f9f9';
        }
    });

    // Create title section with icons
    const titleSection = document.createElement('div');
    titleSection.style.cssText = 'display:flex; align-items:flex-start; gap:12px; margin-bottom:10px;';

    // Category badge
    const categoryBadge = document.createElement('div');
    categoryBadge.style.cssText = `
        font-size:11px;
        padding:4px 8px;
        background-color:rgba(0,0,0,0.05);
        color:#666;
        border-radius:4px;
        font-weight:500;
        white-space:nowrap;
        align-self:flex-start;
    `;
    categoryBadge.textContent = groupObj.category || 'Other';

    // Title row with category and period
    const titleRow = document.createElement('div');
    titleRow.style.cssText = 'display:flex; justify-content:space-between; align-items:center; width:100%;';

    // Title with icon based on category
    const titleContainer = document.createElement('div');
    titleContainer.style.cssText = 'display:flex; align-items:center; gap:8px; flex:1;';

    // Category icon (choose based on category)
    const categoryIcon = getCategoryIcon(groupObj.category);
    categoryIcon.style.cssText = 'width:24px; height:24px; flex-shrink:0;';

    // Title text
    const titleSpan = document.createElement('span');
    titleSpan.className = 'accordion-title';
    titleSpan.style.cssText = 'font-size:17px; font-weight:600; color:#333;';
    titleSpan.textContent = groupObj.displayName || groupObj.trackers[0].benefitName || "";

    // Period badge - if available
    let periodBadge;
    if (groupObj.periodLabel) {
        periodBadge = document.createElement('div');
        periodBadge.style.cssText = `
            font-size:12px;
            padding:4px 10px;
            background-color:rgba(0, 122, 255, 0.08);
            color:var(--ios-blue);
            border-radius:12px;
            font-weight:500;
            white-space:nowrap;
            margin-left:8px;
        `;
        periodBadge.textContent = groupObj.periodLabel;
    }

    // Arrow indicator
    const arrowIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrowIcon.setAttribute('viewBox', '0 0 24 24');
    arrowIcon.setAttribute('width', '24');
    arrowIcon.setAttribute('height', '24');
    arrowIcon.style.transition = 'transform 0.3s ease';
    arrowIcon.style.flexShrink = '0';
    arrowIcon.style.marginLeft = 'auto';

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M7 10l5 5 5-5');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#888');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    arrowIcon.appendChild(path);

    // Store arrow reference for animation
    headerDiv.arrowRef = arrowIcon;

    // Assemble title container
    titleContainer.appendChild(categoryIcon);
    titleContainer.appendChild(titleSpan);
    if (periodBadge) titleContainer.appendChild(periodBadge);

    titleRow.appendChild(titleContainer);
    titleRow.appendChild(arrowIcon);

    // Create mini cards for each card's status
    const miniBarDiv = document.createElement('div');
    miniBarDiv.className = 'mini-bar';
    miniBarDiv.style.cssText = 'display:flex; flex-wrap:wrap; gap:8px; margin-top:12px;';

    // Group trackers by card for a cleaner display
    const cardTrackers = {};
    groupObj.trackers.forEach(tracker => {
        cardTrackers[tracker.cardEnding] = tracker;
    });

    // Add card status indicators
    Object.entries(cardTrackers).forEach(([cardEnding, tracker]) => {
        // Get status color from config or use default
        const statusObj = statusConfig[tracker.status] || { color: 'var(--ios-gray)', label: tracker.status };

        const miniCard = document.createElement('div');
        miniCard.className = 'mini-card';
        miniCard.setAttribute('data-status', tracker.status);
        miniCard.style.cssText = `
            display:flex;
            align-items:center;
            gap:6px;
            padding:6px 10px;
            border-radius:8px;
            font-size:13px;
            color:#444;
            background-color:${statusObj.color}15;
            border:1px solid ${statusObj.color}30;
            transition:all 0.2s ease;
        `;

        // Add hover effect to mini cards
        miniCard.addEventListener('mouseenter', () => {
            miniCard.style.transform = 'translateY(-2px)';
            miniCard.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
            miniCard.style.backgroundColor = `${statusObj.color}25`;
        });

        miniCard.addEventListener('mouseleave', () => {
            miniCard.style.transform = 'translateY(0)';
            miniCard.style.boxShadow = 'none';
            miniCard.style.backgroundColor = `${statusObj.color}15`;
        });

        // Status indicator dot
        const statusDot = document.createElement('div');
        statusDot.className = 'status-dot';
        statusDot.style.cssText = `width:10px; height:10px; border-radius:50%; background-color:${statusObj.color}; box-shadow:0 1px 2px rgba(0,0,0,0.1);`;

        // Card ending
        const cardEndingSpan = document.createElement('span');
        cardEndingSpan.className = 'card-ending';
        cardEndingSpan.style.cssText = 'font-weight:500;';
        cardEndingSpan.textContent = cardEnding;

        // Add status label
        const statusLabel = document.createElement('span');
        statusLabel.style.cssText = 'font-size:11px; opacity:0.8;';
        statusLabel.textContent = statusObj.label;

        miniCard.appendChild(statusDot);
        miniCard.appendChild(cardEndingSpan);
        miniCard.appendChild(statusLabel);
        miniBarDiv.appendChild(miniCard);
    });

    // Assemble header
    titleSection.appendChild(categoryBadge);
    titleSection.appendChild(titleRow);
    headerDiv.appendChild(titleSection);
    headerDiv.appendChild(miniBarDiv);

    // Add click handler for toggling body with improved animation
    headerDiv.addEventListener('click', () => {
        toggleAccordionBody(headerDiv);
    });

    return headerDiv;
}

// Get category icon based on category
function getCategoryIcon(category) {
    const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    iconSvg.setAttribute('viewBox', '0 0 24 24');
    iconSvg.setAttribute('width', '24');
    iconSvg.setAttribute('height', '24');

    let path = '';
    let color = '#666';

    switch ((category || '').toLowerCase()) {
        case 'travel credits':
            path = 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z';
            color = '#2196F3';
            break;

        case 'hotel credits':
            path = 'M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z';
            color = '#9C27B0';
            break;

        case 'dining credits':
            path = 'M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z';
            color = '#FF5722';
            break;

        case 'entertainment credits':
            path = 'M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z';
            color = '#E91E63';
            break;

        case 'business credits':
            path = 'M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z';
            color = '#4CAF50';
            break;

        case 'shopping credits':
            path = 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z';
            color = '#FF9800';
            break;

        case 'digital credits':
            path = 'M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L22 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z';
            color = '#00BCD4';
            break;

        case 'airport benefits':
            path = 'M22 16v-2l-8.5-5V3.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5V9L2 14v2l8.5-2.5V19L8 20.5V22l4-1 4 1v-1.5L13.5 19v-5.5L22 16z';
            color = '#3F51B5';
            break;

        default:
            path = 'M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z';
            color = '#607D8B';
    }

    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathEl.setAttribute('d', path);
    pathEl.setAttribute('fill', color);
    iconSvg.appendChild(pathEl);

    return iconSvg;
}

// Create enhanced accordion body
function createAccordionBody(groupObj) {
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'accordion-body';
    bodyDiv.style.cssText = 'padding:0 20px; overflow:hidden; max-height:0; transition:max-height 0.4s ease-in-out, padding 0.4s ease-in-out, opacity 0.3s ease;';
    bodyDiv.style.opacity = '0';

    // Create a container for trackers with nicer layout
    const trackersContainer = document.createElement('div');
    trackersContainer.style.cssText = 'display:flex; flex-direction:column; gap:16px; padding-bottom:20px;';

    // Create tracker cards
    groupObj.trackers.forEach(trackerObj => {
        trackersContainer.appendChild(createTrackerCard(trackerObj, groupObj));
    });

    bodyDiv.appendChild(trackersContainer);

    return bodyDiv;
}

// Create enhanced tracker card
function createTrackerCard(trackerObj, groupObj) {
    // Find card details in accounts
    const cardAccount = glb_account.find(acc => acc.display_account_number === trackerObj.cardEnding);

    const trackerCard = document.createElement('div');
    trackerCard.className = 'tracker-card';
    trackerCard.style.cssText = `
        border:1px solid #e6e6e6;
        border-radius:16px;
        padding:16px;
        margin-top:16px;
        background-color:#fff;
        box-shadow:0 2px 8px rgba(0,0,0,0.04);
        transition:all 0.3s ease;
        position:relative;
        overflow:hidden;
    `;

    // Add hover effect
    trackerCard.addEventListener('mouseenter', () => {
        trackerCard.style.transform = 'translateY(-3px)';
        trackerCard.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
    });

    trackerCard.addEventListener('mouseleave', () => {
        trackerCard.style.transform = 'translateY(0)';
        trackerCard.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
    });

    // Add status indicator stripe based on status
    const statusColors = {
        'ACHIEVED': 'var(--ios-green)',
        'IN_PROGRESS': 'var(--ios-blue)',
        'NOT_STARTED': 'var(--ios-gray)'
    };

    const statusColor = statusColors[trackerObj.status] || 'var(--ios-gray)';
    trackerCard.style.borderLeft = `4px solid ${statusColor}`;

    // Card header with improved layout
    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header';
    cardHeader.style.cssText = 'display:flex; justify-content:space-between; margin-bottom:16px; align-items:flex-start;';

    // Card info container with logo if available
    const cardInfoContainer = document.createElement('div');
    cardInfoContainer.style.cssText = 'display:flex; align-items:center; gap:12px;';

    // Card logo/icon
    const cardIconContainer = document.createElement('div');
    cardIconContainer.style.cssText = 'width:36px; height:36px; border-radius:6px; overflow:hidden; flex-shrink:0;';

    if (cardAccount && cardAccount.small_card_art && cardAccount.small_card_art !== 'N/A') {
        const cardImage = document.createElement('img');
        cardImage.src = cardAccount.small_card_art;
        cardImage.alt = 'Card Logo';
        cardImage.style.cssText = 'width:100%; height:100%; object-fit:contain;';
        cardIconContainer.appendChild(cardImage);
    } else {
        // Fallback icon
        cardIconContainer.innerHTML = `
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="1.5">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
        `;
    }

    // Card details
    const cardDetails = document.createElement('div');
    cardDetails.style.cssText = 'display:flex; flex-direction:column;';

    const cardNumber = document.createElement('div');
    cardNumber.className = 'card-number';
    cardNumber.style.cssText = 'font-weight:600; color:#444; font-size:15px;';
    cardNumber.textContent = `Card •••• ${trackerObj.cardEnding}`;

    // Add card name if available
    let cardName;
    if (cardAccount) {
        cardName = document.createElement('div');
        cardName.style.cssText = 'font-size:13px; color:#777;';
        cardName.textContent = cardAccount.description || '';
    }

    cardDetails.appendChild(cardNumber);
    if (cardName) cardDetails.appendChild(cardName);

    cardInfoContainer.appendChild(cardIconContainer);
    cardInfoContainer.appendChild(cardDetails);

    // Date range with better formatting
    const dateRange = document.createElement('div');
    dateRange.className = 'date-range';
    dateRange.style.cssText = 'color:#888; font-size:13px; background-color:rgba(0,0,0,0.03); padding:4px 10px; border-radius:8px;';

    // Format date range
    const startDate = new Date(trackerObj.periodStartDate);
    const endDate = new Date(trackerObj.periodEndDate);

    const formatOptions = {
        month: 'short',
        day: 'numeric',
        year: endDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    };

    let dateRangeText = 'No period available';
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        const startFormatted = startDate.toLocaleDateString('en-US', formatOptions);
        const endFormatted = endDate.toLocaleDateString('en-US', formatOptions);
        dateRangeText = `${startFormatted} - ${endFormatted}`;

        // Calculate and display days remaining
        const now = new Date();
        if (now <= endDate) {
            const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
            const daysText = document.createElement('div');
            daysText.style.cssText = 'font-size:12px; text-align:center; margin-top:4px;';
            daysText.textContent = `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`;
            dateRange.appendChild(daysText);
        }
    }

    dateRange.prepend(document.createTextNode(dateRangeText));

    // Add to header
    cardHeader.appendChild(cardInfoContainer);
    cardHeader.appendChild(dateRange);

    // Progress section with enhanced visualization
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    progressContainer.style.cssText = 'margin:16px 0;';

    // Progress header with amount and percentage
    const progressHeader = document.createElement('div');
    progressHeader.style.cssText = 'display:flex; justify-content:space-between; margin-bottom:10px; align-items:center;';

    // Format amounts with proper currency
    let currencySymbol = trackerObj.tracker.targetCurrencySymbol || '$';
    const spentAmount = parseFloat(trackerObj.tracker.spentAmount) || 0;
    const targetAmount = parseFloat(trackerObj.tracker.targetAmount) || 0;

    // Left side: Amount label
    const amountLabel = document.createElement('div');
    amountLabel.style.cssText = 'font-size:14px; color:#555; font-weight:500;';
    amountLabel.innerHTML = `<span style="color:#999; font-weight:normal;">Progress:</span> ${currencySymbol}${spentAmount.toFixed(2)} of ${currencySymbol}${targetAmount.toFixed(2)}`;

    // Right side: Percentage
    const percentLabel = document.createElement('div');
    percentLabel.style.cssText = 'font-size:14px; font-weight:600;';

    // Calculate percentage
    let percent = 0;
    if (targetAmount > 0) {
        percent = Math.min(100, (spentAmount / targetAmount) * 100);
    }

    percentLabel.textContent = `${percent.toFixed(0)}%`;
    percentLabel.style.color = percent >= 100 ? 'var(--ios-green)' : 'var(--ios-blue)';

    progressHeader.appendChild(amountLabel);
    progressHeader.appendChild(percentLabel);

    // Progress bar with enhanced style
    const progressBarWrapper = document.createElement('div');
    progressBarWrapper.className = 'progress-bar-wrapper';
    progressBarWrapper.style.cssText = `
        height:10px;
        border-radius:10px;
        background-color:#f0f0f0;
        overflow:hidden;
        position:relative;
        width:100%;
        box-shadow:inset 0 1px 2px rgba(0,0,0,0.1);
    `;

    // Progress fill with animation
    const progressFill = document.createElement('div');
    progressFill.className = `progress-fill ${trackerObj.status.toLowerCase()}`;
    progressFill.style.cssText = `
        height:100%;
        position:absolute;
        top:0;
        left:0;
        width:0;
        background-color:${statusColor};
        transition:width 1s cubic-bezier(0.22, 1, 0.36, 1);
    `;

    // Animate progress bar after a short delay
    setTimeout(() => {
        progressFill.style.width = `${percent}%`;
    }, 300);

    progressBarWrapper.appendChild(progressFill);

    // Add milestone markers if the target amount is large enough
    if (targetAmount >= 100) {
        // Add quarter markers
        [25, 50, 75].forEach(markerPercent => {
            if (targetAmount * (markerPercent / 100) >= 25) {
                const marker = document.createElement('div');
                marker.style.cssText = `
                    position:absolute;
                    top:0;
                    bottom:0;
                    left:${markerPercent}%;
                    width:1px;
                    background-color:rgba(0,0,0,0.1);
                    z-index:1;
                `;
                progressBarWrapper.appendChild(marker);
            }
        });
    }

    // Message section with better formatting
    let messageDiv;
    if (trackerObj.progress && trackerObj.progress.message) {
        messageDiv = document.createElement('div');
        messageDiv.className = 'message-div';
        messageDiv.style.cssText = `
            margin-top:16px;
            padding:12px 16px;
            background-color:rgba(0,0,0,0.02);
            border-radius:12px;
            color:#333;
            font-size:14px;
            line-height:1.5;
            border-left:3px solid ${statusColor}40;
        `;

        // Clean up message format
        const messageText = trackerObj.progress.message
            .replace(/\*\*/g, '')  // Remove ** formatting
            .replace(/\n\n/g, '<br><br>')  // Keep paragraph breaks
            .replace(/\n/g, ' ');  // Replace single newlines with spaces

        messageDiv.innerHTML = messageText;
    }

    // Assembled tracker card
    trackerCard.appendChild(cardHeader);
    progressContainer.appendChild(progressHeader);
    progressContainer.appendChild(progressBarWrapper);
    trackerCard.appendChild(progressContainer);
    if (messageDiv) trackerCard.appendChild(messageDiv);

    return trackerCard;
}

// Enhanced accordion toggle with smoother animations
function toggleAccordionBody(header) {
    const bodyDiv = header.bodyRef;
    const arrowIcon = header.arrowRef;
    const parentItem = header.parentItem;

    // Determine if currently open
    const isOpen = bodyDiv.classList.contains('active');

    // Close all other open accordions for cleaner UX
    document.querySelectorAll('.accordion-header.active').forEach(activeHeader => {
        if (activeHeader !== header && activeHeader.bodyRef) {
            const activeBody = activeHeader.bodyRef;
            const activeArrow = activeHeader.arrowRef;
            const activeParent = activeHeader.parentItem;

            // Reset styles
            activeHeader.classList.remove('active');
            activeHeader.style.backgroundColor = '#f9f9f9';
            activeHeader.style.borderBottomColor = 'transparent';
            activeArrow.style.transform = 'rotate(0deg)';
            activeBody.style.maxHeight = '0';
            activeBody.style.padding = '0 20px';
            activeBody.style.opacity = '0';
            activeBody.classList.remove('active');

            // Remove active styling from parent
            if (activeParent) {
                activeParent.style.borderColor = '#e0e0e0';
            }
        }
    });

    // Toggle current accordion
    if (!isOpen) {
        // Open this accordion
        header.classList.add('active');
        bodyDiv.classList.add('active');
        arrowIcon.style.transform = 'rotate(180deg)';
        header.style.backgroundColor = '#f0f0f0';
        header.style.borderBottomColor = '#e0e0e0';
        bodyDiv.style.maxHeight = `${bodyDiv.scrollHeight}px`;
        bodyDiv.style.padding = '0 20px 20px 20px';
        bodyDiv.style.opacity = '1';

        // Add active styling to parent
        if (parentItem) {
            parentItem.style.borderColor = statusColor;
            parentItem.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
        }

        // Ensure scroll into view for long pages
        setTimeout(() => {
            const headerRect = header.getBoundingClientRect();
            if (headerRect.top < 0 || headerRect.bottom > window.innerHeight) {
                header.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 300);
    } else {
        // Close this accordion
        header.classList.remove('active');
        bodyDiv.classList.remove('active');
        arrowIcon.style.transform = 'rotate(0deg)';
        header.style.backgroundColor = '#f9f9f9';
        header.style.borderBottomColor = 'transparent';
        bodyDiv.style.maxHeight = '0';
        bodyDiv.style.padding = '0 20px';
        bodyDiv.style.opacity = '0';

        // Reset parent styling
        if (parentItem) {
            parentItem.style.borderColor = '#e0e0e0';
            parentItem.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        }
    }
}
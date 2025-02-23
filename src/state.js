// src/state.js
export let accountData = [];
export let offerData = [];
export let lastUpdate = "";
export let currentView = 'summary'; // Options: "summary", "members", "offers"
export let isMinimized = true;
export let currentStatusFilter = "Active"; // Options: "all", "Active", "Canceled"
export let currentTypeFilter = "all";    // Options: "all", "BASIC", "SUPP"
export let runInBatchesLimit = 50;
export let showFavoritesOnly = false;
export let offerSearchKeyword = "";
export let offerSearchMembersKeyword = "";
export let benefitTrackers = [];

// Global sort states for members & offers
export let sortState = { key: "", direction: 1 };
export let offerSortState = { key: "", direction: 1 };

// Global variables for card priority and exclusion
export let priorityCards = [];   // Array of card endings that should be added immediately
export let excludedCards = [];   // Array of card endings that should be skipped

// Global object to store independent scroll positions per view
export const globalViewState = {
    summary: { scrollTop: 0 },
    members: { scrollTop: 0 },
    offers: { scrollTop: 0 },
    benefits: { scrollTop: 0 }
};

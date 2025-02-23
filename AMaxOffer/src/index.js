// src/index.js
import {
    fetchAccount,
    getCurrentUserTrustLevel,
    fetchFinancialDataForBasicCards,
    refreshOffers,
    fetchBenefitTrackersForBasicCards
} from './api.js';
import { initUI, renderCurrentView } from './ui.js';
import { loadLocalStorage, setLocalStorage } from './storage.js';
import { saveCurrentScrollState } from './utils.js';
import { currentView, isMinimized, accountData, offerData, benefitTrackers } from './state.js';

'use strict';

const ScriptVersion = "2.2";

// --- UI Elements Creation ---
const container = document.createElement('div');
container.id = 'card-utility-overlay';
container.style.position = 'fixed';
container.style.top = '5%';
container.style.left = '5%';
container.style.backgroundColor = '#fff';
container.style.color = '#000';
container.style.border = '1px solid #000';
container.style.zIndex = '10000';
container.style.fontFamily = 'Arial, sans-serif';
container.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
container.style.maxHeight = '80vh';
container.style.overflow = 'hidden';
container.style.width = '90%'; // Will be overridden if minimized

const header = document.createElement('div');
header.id = 'card-utility-header';
header.style.backgroundColor = '#f0f0f0';
header.style.borderBottom = '1px solid #ccc';
header.style.padding = '5px 10px';
header.style.display = 'flex';
header.style.justifyContent = 'space-between';
header.style.alignItems = 'center';
header.style.cursor = 'move';

const title = document.createElement('span');
title.textContent = 'AMaxOffer';

// Create view buttons container
const viewButtons = document.createElement('div');
viewButtons.style.display = 'flex';
viewButtons.style.gap = '40px';

// Create individual view buttons
const btnSummary = document.createElement('button');
btnSummary.textContent = 'Summary';
btnSummary.style.cursor = 'pointer';
btnSummary.style.fontSize = '20px';

const btnMembers = document.createElement('button');
btnMembers.textContent = 'Members';
btnMembers.style.cursor = 'pointer';
btnMembers.style.fontSize = '20px';

const btnOffers = document.createElement('button');
btnOffers.textContent = 'Offer Map';
btnOffers.style.cursor = 'pointer';
btnOffers.style.fontSize = '20px';

viewButtons.appendChild(btnSummary);
viewButtons.appendChild(btnMembers);
viewButtons.appendChild(btnOffers);

const toggleBtn = document.createElement('button');
toggleBtn.textContent = 'Minimize';
toggleBtn.style.cursor = 'pointer';

header.appendChild(title);
header.appendChild(viewButtons);
header.appendChild(toggleBtn);

// Main content area
const content = document.createElement('div');
content.id = 'card-utility-content';
content.style.padding = '10px';
content.style.overflowY = 'auto';
content.style.maxHeight = 'calc(80vh - 40px)';
content.innerHTML = 'Loading...';

container.appendChild(header);
container.appendChild(content);

const btnBenefits = document.createElement('button');
btnBenefits.textContent = 'Benefits';
btnBenefits.style.cursor = 'pointer';
btnBenefits.style.fontSize = '20px';
viewButtons.appendChild(btnBenefits);

// --- Event Listeners ---
// Switch to Benefits view
btnBenefits.addEventListener('click', () => {
    saveCurrentScrollState();
    currentView = 'benefits';
    // Update button styles
    btnBenefits.style.fontWeight = 'bold';
    btnSummary.style.fontWeight = 'normal';
    btnMembers.style.fontWeight = 'normal';
    btnOffers.style.fontWeight = 'normal';
    renderCurrentView();
});

// Draggable header
header.addEventListener('mousedown', function (e) {
    let shiftX = e.clientX - container.getBoundingClientRect().left;
    let shiftY = e.clientY - container.getBoundingClientRect().top;
    function onMouseMove(e2) {
        container.style.left = (e2.clientX - shiftX) + 'px';
        container.style.top = (e2.clientY - shiftY) + 'px';
    }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    });
});

// Switch view buttons
btnSummary.addEventListener('click', () => {
    saveCurrentScrollState();
    currentView = 'summary';
    btnSummary.style.fontWeight = 'bold';
    btnMembers.style.fontWeight = 'normal';
    btnOffers.style.fontWeight = 'normal';
    renderCurrentView();
});

btnMembers.addEventListener('click', () => {
    saveCurrentScrollState();
    currentView = 'members';
    btnMembers.style.fontWeight = 'bold';
    btnSummary.style.fontWeight = 'normal';
    btnOffers.style.fontWeight = 'normal';
    renderCurrentView();
});

btnOffers.addEventListener('click', () => {
    saveCurrentScrollState();
    currentView = 'offers';
    btnOffers.style.fontWeight = 'bold';
    btnSummary.style.fontWeight = 'normal';
    btnMembers.style.fontWeight = 'normal';
    renderCurrentView();
});

// Toggle minimize/expand functionality
toggleBtn.addEventListener('click', () => {
    isMinimized = !isMinimized;
    if (isMinimized) {
        content.style.display = 'none';
        viewButtons.style.display = 'none';
        toggleBtn.textContent = 'Expand';
        container.style.width = '200px';
    } else {
        content.style.display = 'block';
        viewButtons.style.display = 'flex';
        toggleBtn.textContent = 'Minimize';
        container.style.width = '90%';
    }
});

// Append the container to document body
function createUI() {
    document.body.appendChild(container);
    if (isMinimized) {
        content.style.display = 'none';
        viewButtons.style.display = 'none';
        toggleBtn.textContent = 'Expand';
        container.style.width = '200px';
    }
}

// --- Initialization ---
async function init() {
    const tl = await getCurrentUserTrustLevel();
    if (tl === null || tl * 0.173 < 0.5) {
        return;
    }
    const fetchStatus = await fetchAccount();
    if (!fetchStatus || accountData.length === 0) {
        console.error("Failed to fetch account data or no accounts found.");
        return;
    }
    const tokenSuffix = accountData[0].account_token;
    const localDataStatus = loadLocalStorage(tokenSuffix);
    createUI();

    if (localDataStatus === 0 || localDataStatus === 2) {
        // Refresh offers and benefit trackers
        const newOfferData = await refreshOffers();
        const newBenefitTrackers = await fetchBenefitTrackersForBasicCards();

        if (newOfferData && Array.isArray(newOfferData)) {
            offerData.splice(0, offerData.length, ...newOfferData);
        } else {
            console.error("refreshOffers failed. Not updating offerData.");
        }

        if (newBenefitTrackers && Array.isArray(newBenefitTrackers)) {
            benefitTrackers.splice(0, benefitTrackers.length, ...newBenefitTrackers);
        } else {
            console.error("Fetching benefit trackers failed. Not updating benefitTrackers.");
        }

        lastUpdate = new Date().toLocaleString();
        await renderCurrentView();
        setLocalStorage(tokenSuffix, ["accountData", "offerData", "lastUpdate", "benefitTrackers", "ScriptVersion"]);
    } else {
        console.log("Using data from LocalStorage. No forced fetch.");
    }

    await fetchFinancialDataForBasicCards();
    if (currentView === 'members') {
        renderCurrentView();
    }
}

init();

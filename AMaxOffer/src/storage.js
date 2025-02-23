// src/storage.js
import {
    accountData,
    offerData,
    lastUpdate,
    priorityCards,
    excludedCards,
    benefitTrackers,
    ScriptVersion
} from './state.js';
import { renderCurrentView } from './ui.js';

export function setLocalStorage(tokenSuffix, keys) {
    // Gather current state into an object.
    const allData = {
        accountData: accountData,
        offerData: offerData,
        lastUpdate: lastUpdate,
        priorityCards: priorityCards,
        excludedCards: excludedCards,
        benefitTrackers: benefitTrackers,
        ScriptVersion: ScriptVersion
    };

    // If keys not provided or empty, default to all keys.
    if (!keys || keys.length === 0) {
        keys = Object.keys(allData);
    }
    try {
        keys.forEach(key => {
            localStorage.setItem(key + "_" + tokenSuffix, JSON.stringify(allData[key]));
        });
        console.log("Data saved to localStorage with token: " + tokenSuffix + " for keys: " + keys.join(", "));
    } catch (e) {
        console.error("Error saving data to localStorage:", e);
    }
}

export function loadLocalStorage(tokenSuffix, keys) {
    // Define the full set of keys.
    const allKeys = ["accountData", "offerData", "lastUpdate", "priorityCards", "excludedCards", "benefitTrackers", "ScriptVersion"];
    if (!keys || keys.length === 0) {
        keys = allKeys;
    }
    const loaded = {};
    let allExist = true;
    keys.forEach(key => {
        const item = localStorage.getItem(key + "_" + tokenSuffix);
        if (item === null) {
            allExist = false;
        } else {
            loaded[key] = item;
        }
    });
    // If accountData and offerData are required but missing, return 0.
    if (keys.includes("accountData") && keys.includes("offerData") && (!loaded.accountData || !loaded.offerData)) {
        return 0;
    }
    try {
        // Update state variables in place.
        if (keys.includes("accountData") && loaded.accountData) {
            const parsed = JSON.parse(loaded.accountData);
            accountData.splice(0, accountData.length, ...parsed);
        }
        if (keys.includes("offerData") && loaded.offerData) {
            const parsed = JSON.parse(loaded.offerData);
            offerData.splice(0, offerData.length, ...parsed);
        }
        if (keys.includes("lastUpdate")) {
            // For scalar values like lastUpdate, ideally your state would be a mutable object.
            // Here we assume that the imported binding is updated via side effect.
            // (In practice, you might want to export a single state object.)
            lastUpdate = loaded.lastUpdate || "";
        }
        if (keys.includes("priorityCards")) {
            const parsed = loaded.priorityCards ? JSON.parse(loaded.priorityCards) : [];
            priorityCards.splice(0, priorityCards.length, ...parsed);
        }
        if (keys.includes("excludedCards")) {
            const parsed = loaded.excludedCards ? JSON.parse(loaded.excludedCards) : [];
            excludedCards.splice(0, excludedCards.length, ...parsed);
        }
        if (keys.includes("benefitTrackers")) {
            const parsed = loaded.benefitTrackers ? JSON.parse(loaded.benefitTrackers) : [];
            benefitTrackers.splice(0, benefitTrackers.length, ...parsed);
        }
        if (keys.includes("ScriptVersion")) {
            if (!loaded.ScriptVersion || JSON.parse(loaded.ScriptVersion) !== ScriptVersion) {
                console.error("Script version mismatch or missing.");
                return 2;
            }
        }
        console.log("Load from localStorage successful for token: " + tokenSuffix + " for keys: " + keys.join(", "));
        renderCurrentView();
        if (keys.includes("lastUpdate") && lastUpdate) {
            const savedDate = new Date(lastUpdate);
            const now = new Date();
            const diff = now - savedDate;
            if (diff > 24 * 60 * 60 * 1000) {
                return 2;
            }
        }
        return 1;
    } catch (e) {
        console.error("Error parsing saved localStorage data:", e);
        return 0;
    }
}

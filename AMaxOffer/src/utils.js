// src/utils.js
import { content, globalViewState, currentView, offerData } from './state.js';

export function reconstructObfuscated(obfSegments, indexMap) {
    let ordered = [];
    Object.keys(indexMap)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .forEach(key => {
            let seg = obfSegments[Number(indexMap[key])];
            seg = seg.slice(0, -1);
            ordered.push(seg);
        });
    return ordered.join('');
}

export function getUrl(encoded) {
    try {
        let firstDecoding = atob(encoded);
        let originalUrl = atob(firstDecoding);
        return originalUrl;
    } catch (e) {
        console.error("Error decoding URL:", e, "Encoded string:", encoded);
        return "";
    }
}

// Saves the current scroll state using state variables imported from state.js
export function saveCurrentScrollState() {
    if (content && globalViewState && currentView) {
        globalViewState[currentView].scrollTop = content.scrollTop;
    }
}

// Debounce utility for limiting rapid function calls
export function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

export function formatDate(dateStr, roundUp = false) {
    let d = new Date(dateStr);
    if (roundUp && !isNaN(d)) {
        d.setDate(d.getDate() + 1);
    }
    if (isNaN(d)) return 'N/A';
    let mm = String(d.getMonth() + 1).padStart(2, '0');
    let dd = String(d.getDate()).padStart(2, '0');
    let yy = String(d.getFullYear()).slice(-2);
    return `${mm}-${dd}-${yy}`;
}

export function sanitizeValue(val) {
    return (val === "N/A" || val === null || val === undefined) ? "0" : val;
}

// Parse card index into main and sub-index components
export function parseCardIndex(indexStr) {
    if (!indexStr) return [0, 0];
    const parts = indexStr.split('-');
    const main = parseInt(parts[0], 10) || 0;
    const sub = parts.length > 1 ? (parseInt(parts[1], 10) || 0) : 0;
    return [main, sub];
}

// Parse a numeric value from a string, cleaning common symbols
export function parseNumericValue(str) {
    if (!str) return NaN;
    const cleaned = str.replace(/[$,%]/g, '').replace(/\s*back\s*/i, '').trim();
    return parseFloat(cleaned) || NaN;
}

// Run tasks in batches to control concurrency
export async function runInBatches(tasks, limit = 8) {
    let i = 0;
    while (i < tasks.length) {
        const chunk = tasks.slice(i, i + limit);
        await Promise.all(chunk.map(fn => fn()));
        i += limit;
    }
}

// Merge favorite flags from the current offerData into a new offer map
export function mergeFavorites(newOfferMap) {
    const oldFavorites = {};
    if (offerData && Array.isArray(offerData)) {
        offerData.forEach(o => {
            if (o.source_id) {
                oldFavorites[o.source_id] = o.favorite === true;
            }
        });
    }
    for (const sid in newOfferMap) {
        if (oldFavorites.hasOwnProperty(sid)) {
            newOfferMap[sid].favorite = oldFavorites[sid];
        }
    }
}

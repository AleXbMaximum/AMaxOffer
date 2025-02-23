
export function applyMemberSort() {
    if (sortState.key) {
        if (sortState.key === 'cardIndex') {
            accountData.sort((a, b) => {
                const [aMain, aSub] = parseCardIndex(a.cardIndex);
                const [bMain, bSub] = parseCardIndex(b.cardIndex);
                if (aMain === bMain) {
                    return sortState.direction * (aSub - bSub);
                }
                return sortState.direction * (aMain - bMain);
            });
        } else {
            accountData.sort((a, b) => {
                const valA = a[sortState.key] || "";
                const valB = b[sortState.key] || "";
                return sortState.direction * valA.toString().localeCompare(valB.toString());
            });
        }
    }
}

export function applyOfferSort() {
    if (offerSortState.key) {
        if (offerSortState.key === "favorite") {
            offerData.sort((a, b) => {
                if (a.favorite === b.favorite) return 0;
                return a.favorite ? -1 : 1;
            });
        } else {
            const numericColumns = ["reward", "threshold", "percentage"];
            offerData.sort((a, b) => {
                const valA = a[offerSortState.key] || "";
                const valB = b[offerSortState.key] || "";
                if (numericColumns.includes(offerSortState.key)) {
                    const numA = parseNumericValue(valA);
                    const numB = parseNumericValue(valB);
                    if (isNaN(numA) && isNaN(numB)) {
                        return offerSortState.direction * valA.localeCompare(valB);
                    } else if (isNaN(numA)) {
                        return 1 * offerSortState.direction;
                    } else if (isNaN(numB)) {
                        return -1 * offerSortState.direction;
                    }
                    return offerSortState.direction * (numA - numB);
                } else if (offerSortState.key === "eligibleCards" || offerSortState.key === "enrolledCards") {
                    const lenA = Array.isArray(valA) ? valA.length : 0;
                    const lenB = Array.isArray(valB) ? valB.length : 0;
                    return offerSortState.direction * (lenA - lenB);
                } else {
                    return offerSortState.direction * valA.toString().localeCompare(valB.toString());
                }
            });
        }
    }
}

export function sortData(key) {
    if (sortState.key === key) {
        sortState.direction *= -1;
    } else {
        sortState.key = key;
        sortState.direction = 1;
    }
    if (key === 'cardIndex') {
        accountData.sort((a, b) => {
            const [aMain, aSub] = parseCardIndex(a.cardIndex);
            const [bMain, bSub] = parseCardIndex(b.cardIndex);
            if (aMain === bMain) {
                return sortState.direction * (aSub - bSub);
            }
            return sortState.direction * (aMain - bMain);
        });
    } else {
        accountData.sort((a, b) => {
            const valA = a[key] || "";
            const valB = b[key] || "";
            return sortState.direction * valA.toString().localeCompare(valB.toString());
        });
    }
    renderCurrentView();
}

export function sortOfferData(key) {
    if (offerSortState.key === key) {
        offerSortState.direction *= -1;
    } else {
        offerSortState.key = key;
        offerSortState.direction = (key === "favorite") ? -1 : 1;
    }
    offerData.sort((a, b) => {
        if (key === "favorite") {
            if (a.favorite === b.favorite) return 0;
            return a.favorite ? -1 : 1;
        }
        const numericColumns = ["reward", "threshold", "percentage"];
        const valA = a[key] || "";
        const valB = b[key] || "";
        if (numericColumns.includes(key)) {
            const numA = parseNumericValue(valA);
            const numB = parseNumericValue(valB);
            if (isNaN(numA) && isNaN(numB)) {
                return offerSortState.direction * valA.localeCompare(valB);
            } else if (isNaN(numA)) {
                return 1 * offerSortState.direction;
            } else if (isNaN(numB)) {
                return -1 * offerSortState.direction;
            }
            return offerSortState.direction * (numA - numB);
        } else if (key === "eligibleCards" || key === "enrolledCards") {
            const lenA = Array.isArray(valA) ? valA.length : 0;
            const lenB = Array.isArray(valB) ? valB.length : 0;
            return offerSortState.direction * (lenA - lenB);
        } else {
            return offerSortState.direction * valA.toString().localeCompare(valB.toString());
        }
    });
    renderCurrentView();
}
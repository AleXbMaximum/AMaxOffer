function parseOfferDetails(description = "") {
    // Helpers for conversion
    const parseDollar = (str) => parseFloat(str.replace(/[,\$]/g, ""));
    const toMoneyString = (num) => {
        if (num == null || isNaN(num)) return null;
        return `$${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    };

    // We'll store numeric forms here
    let thresholdVal = null;
    let rewardVal = null;
    let percentageVal = null;

    // For returning final results (as strings)
    let threshold = null;
    let reward = null;
    let percentage = null;

    // Additional fields
    let times = null;
    let total = null;

    // 1) Parse threshold: e.g. "Spend $500"
    {
        const spendRegex = /Spend\s*\$(\d[\d,\.]*)/i;
        const spendMatch = description.match(spendRegex);
        if (spendMatch) {
            thresholdVal = parseDollar(spendMatch[1]);
        }
    }

    // 2) Parse explicit percentage offers: e.g. "Earn 10% back" or "Get 5% back"
    {
        const percentRegex = /(?:Earn|Get)\s+(\d+(\.\d+)?)%\s*back/i;
        const percentMatch = description.match(percentRegex);
        if (percentMatch) {
            percentageVal = parseFloat(percentMatch[1]);
        }
    }

    // 2A) Parse Membership Rewards® points per dollar (interpreted as a percentage)
    //     e.g. "Earn +1 Membership Rewards® point per eligible dollar spent"
    {
        const mrPointsPerDollarRegex = /Earn\s*\+?(\d+)\s*Membership Rewards(?:®)?\s*points?\s*per\s*(?:eligible\s*)?dollar spent/i;
        const mrPointsPerDollarMatch = description.match(mrPointsPerDollarRegex);
        if (mrPointsPerDollarMatch) {
            const mrPointsEachDollar = parseFloat(mrPointsPerDollarMatch[1]);
            if (!percentageVal) {
                percentageVal = mrPointsEachDollar;
            }
            // "up to X points" in this context sets reward limit in dollars (each point = 1 cent)
            const mrPointsCapRegex = /up to\s*(\d[\d,\.]*)\s*points/i;
            const mrPointsCapMatch = description.match(mrPointsCapRegex);
            if (mrPointsCapMatch) {
                const capVal = parseDollar(mrPointsCapMatch[1]);
                rewardVal = capVal * 0.01;
            }
        }
    }

    // 3) Parse reward amounts given as dollars, e.g. "earn $XX" or "up to a total of $XX"
    {
        // a) (earn|get) $XX – ignoring "back"
        const earnGetRegex = /(?:earn|get)\s*\$(\d[\d,\.]*)/i;
        const earnGetMatch = description.match(earnGetRegex);
        if (earnGetMatch) {
            rewardVal = parseDollar(earnGetMatch[1]);
        }
        // b) "up to a total of $XX" or "up to $XX"
        const upToTotalRegex = /up to (?:a total of )?\$(\d[\d,\.]*)/i;
        const upToTotalMatch = description.match(upToTotalRegex);
        if (upToTotalMatch) {
            rewardVal = parseDollar(upToTotalMatch[1]);
        }
    }

    // 3A) Parse reward amounts given as a flat number of points (without a "per" clause)
    //     e.g. "earn 10,000 Membership Rewards® points"
    {
        const mrPointsRewardRegex = /Earn\s+([\d,]+)\s*Membership Rewards(?:®)?\s*points(?!\s*per)/i;
        const mrPointsRewardMatch = description.match(mrPointsRewardRegex);
        if (mrPointsRewardMatch) {
            const points = parseInt(mrPointsRewardMatch[1].replace(/,/g, ""), 10);
            rewardVal = points * 0.01;
        }
    }

    // 4) Parse times limit: e.g. "up to X times"
    {
        const upToTimesRegex = /up to\s+(\d+)\s+times?/i;
        const upToTimesMatch = description.match(upToTimesRegex);
        if (upToTimesMatch) {
            times = upToTimesMatch[1];
        }
    }

    // 5) Parse parenthetical total: e.g. "(total of $XX)"
    {
        const totalOfRegex = /\(total of\s*\$(\d[\d,\.]*)\)/i;
        const totalOfMatch = description.match(totalOfRegex);
        if (totalOfMatch) {
            total = toMoneyString(parseDollar(totalOfMatch[1]));
        }
    }

    // Determine which values are available
    const haveThreshold = (thresholdVal != null && !isNaN(thresholdVal));
    const haveReward = (rewardVal != null && !isNaN(rewardVal));
    const havePercent = (percentageVal != null && !isNaN(percentageVal));

    // Compute the missing value based on the available two:
    if (haveThreshold && haveReward && !havePercent && thresholdVal > 0) {
        // Compute percentage = (reward / threshold) * 100
        percentageVal = (rewardVal / thresholdVal) * 100;
    } else if (haveThreshold && havePercent && !haveReward) {
        // Compute reward = threshold * (percentage / 100)
        rewardVal = thresholdVal * (percentageVal / 100);
    } else if (haveReward && havePercent && !haveThreshold && percentageVal !== 0) {
        // Compute threshold = reward / (percentage / 100)
        thresholdVal = rewardVal / (percentageVal / 100);
    } else if (havePercent && !haveThreshold && !haveReward) {
        // If only a percentage is provided, default threshold of $10,000
        thresholdVal = 10000;
        rewardVal = thresholdVal * (percentageVal / 100);
    }

    // Convert numeric values back to formatted strings
    if (thresholdVal != null) {
        threshold = toMoneyString(thresholdVal);
    }
    if (rewardVal != null) {
        reward = toMoneyString(rewardVal);
    }
    if (percentageVal != null) {
        const rounded = Math.round(percentageVal * 10) / 10;
        percentage = `${rounded}%`;
    }

    return {
        threshold,   // e.g., "$500.00"
        reward,      // e.g., "$100.00"
        percentage,  // e.g., "20%"
        times,       // e.g., null
        total        // e.g., null
    };
}


parseOfferDetails("Spend $500 or more, earn 10,000 Membership Rewards® points")

parseOfferDetails("Earn +1 Membership Rewards® point per eligible dollar spent, up to 5,000 points	")

parseOfferDetails("Get 5% back on purchases, up to a total of $1,000")

parseOfferDetails("Spend $98 on Walmart+ annual membership, earn $49 back")
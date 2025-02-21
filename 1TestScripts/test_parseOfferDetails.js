function parseOfferDetails(description = "") {
    const parseDollar = (str) => parseFloat(str.replace(/[,\$]/g, ""));
    const toMoneyString = (num) => {
        if (num == null || isNaN(num)) return null;
        return `$${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    };

    let thresholdVal = null;
    let rewardVal = null;
    let percentageVal = null;

    let threshold = null;
    let reward = null;
    let percentage = null;
    let times = null;
    let total = null;

    {
        const spendRegex = /Spend\s*\$(\d[\d,\.]*)/i;
        const spendMatch = description.match(spendRegex);
        if (spendMatch) {
            thresholdVal = parseDollar(spendMatch[1]);
        }
    }
    {
        const percentRegex = /(?:Earn|Get)\s+(\d+(\.\d+)?)%\s*back/i;
        const percentMatch = description.match(percentRegex);
        if (percentMatch) {
            percentageVal = parseFloat(percentMatch[1]);
        }
    }
    {
        const mrPointsPerDollarRegex = /Earn\s*\+?(\d+)\s*Membership Rewards(?:®)?\s*points?\s*per\s*(?:eligible\s*)?dollar spent/i;
        const mrPointsPerDollarMatch = description.match(mrPointsPerDollarRegex);
        if (mrPointsPerDollarMatch) {
            const mrPointsEachDollar = parseFloat(mrPointsPerDollarMatch[1]);
            if (!percentageVal) {
                percentageVal = mrPointsEachDollar;
            }

            const mrPointsCapRegex = /up to\s*(\d[\d,\.]*)\s*(points|pts)/i;
            const mrPointsCapMatch = description.match(mrPointsCapRegex);
            if (mrPointsCapMatch) {
                const capVal = parseDollar(mrPointsCapMatch[1]);
                rewardVal = capVal * 0.01;
            }
        }
    }
    {
        const earnGetRegex = /(?:earn|get)\s*\$(\d[\d,\.]*)/i;
        const earnGetMatch = description.match(earnGetRegex);
        if (earnGetMatch) {
            rewardVal = parseDollar(earnGetMatch[1]);
        }
        const upToTotalRegex = /up to (?:a total of )?\$(\d[\d,\.]*)/i;
        const upToTotalMatch = description.match(upToTotalRegex);
        if (upToTotalMatch) {
            rewardVal = parseDollar(upToTotalMatch[1]);
        }
    }
    {
        const mrPointsRewardRegex = /Earn\s+([\d,]+)\s*Membership Rewards(?:®)?\s*points(?!\s*per)/i;
        const mrPointsRewardMatch = description.match(mrPointsRewardRegex);
        if (mrPointsRewardMatch) {
            const points = parseInt(mrPointsRewardMatch[1].replace(/,/g, ""), 10);
            rewardVal = points * 0.01;
        }
    }
    {
        const upToTimesRegex = /up to\s+(\d+)\s+times?/i;
        const upToTimesMatch = description.match(upToTimesRegex);
        if (upToTimesMatch) {
            times = upToTimesMatch[1];
        }
    }
    {
        const totalOfRegex = /\(total of\s*\$(\d[\d,\.]*)\)/i;
        const totalOfMatch = description.match(totalOfRegex);
        if (totalOfMatch) {
            total = toMoneyString(parseDollar(totalOfMatch[1]));
        }
    }
    const haveThreshold = (thresholdVal != null && !isNaN(thresholdVal));
    const haveReward = (rewardVal != null && !isNaN(rewardVal));
    const havePercent = (percentageVal != null && !isNaN(percentageVal));

    if (haveThreshold && haveReward && !havePercent && thresholdVal > 0) {
        percentageVal = (rewardVal / thresholdVal) * 100;
    } else if (haveThreshold && havePercent && !haveReward) {
        rewardVal = thresholdVal * (percentageVal / 100);
    } else if (haveReward && havePercent && !haveThreshold && percentageVal !== 0) {
        thresholdVal = rewardVal / (percentageVal / 100);
    } else if (havePercent && !haveThreshold && !haveReward) {
        thresholdVal = 10000;
        rewardVal = thresholdVal * (percentageVal / 100);
    }
    if (thresholdVal != null) threshold = toMoneyString(thresholdVal);
    if (rewardVal != null) reward = toMoneyString(rewardVal);
    if (percentageVal != null) {
        const rounded = Math.round(percentageVal * 10) / 10;
        percentage = `${rounded}%`;
    }
    return { threshold, reward, percentage, times, total };
}


//parseOfferDetails("Spend $500 or more, earn 10,000 Membership Rewards® points")
//
//parseOfferDetails("Earn +1 Membership Rewards® point per eligible dollar spent, up to 5,000 points	")
//
//parseOfferDetails("Get 5% back on purchases, up to a total of $1,000")
//
//parseOfferDetails("Spend $98 on Walmart+ annual membership, earn $49 back")

parseOfferDetails("Earn +10 Membership Rewards® points per eligible dollar spent, up to 10,000 pts")


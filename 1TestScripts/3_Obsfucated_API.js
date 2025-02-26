// MEMBER_API: https://global.americanexpress.com/api/servicing/v1/member

const MEMBER_API_segments = ["hS$", "yVnlkbWxq_", "Ykc5aVlXd3V%", "ZVz_", "YU$", "YVc1bkwzWXh%", "FsY2$", "1sallXNW@", "xlSEJ5WlhOekxtTnZiUzloY0drdmM*", "MGNITTZMeTlu@", "MjFsYldKbGNnPT0=$", "M("];
const MEMBER_API_indexMapping = { "0": "4", "1": "0", "2": "9", "3": "2", "4": "3", "5": "6", "6": "7", "7": "8", "8": "1", "9": "5", "10": "11", "11": "10" };
const MEMBER_API = getUrl(reconstructObfuscated(MEMBER_API_segments, MEMBER_API_indexMapping));

// ENROLL_API: https://functions.americanexpress.com/CreateCardAccountOfferEnrollment.v1
const ENROLL_API_segments = ["JX)", "bHZibk11WVcxbGNtbGpZVzVsZUh$", "Z1ZEU5bVptVnlSVzV5YjJ4c2%", "E^", "Ce(", "VpYTnpMbU52YlM5RGN)", "VnVkQzUyTVE9PQ==*", "GNITTZMeTltZFc1amRH(", "tVmhkR1Z*", "piM1&", "YUhSM$", "WVhKa1FXTm#"];
const ENROLL_API_indexMapping = { "0": "10", "1": "7", "2": "1", "3": "4", "4": "5", "5": "8", "6": "3", "7": "11", "8": "9", "9": "2", "10": "0", "11": "6" };
const ENROLL_API = getUrl(reconstructObfuscated(ENROLL_API_segments, ENROLL_API_indexMapping));

// OFFERS_API: https://functions.americanexpress.com/ReadCardAccountOffersList.v1
const OFFERS_API_segments = ["HbHZibk11WVcxbGNt_", "YUhSMGNITT*", "yOTFi@", "pXRmtRMkZ5_", "TltZFc1amR!", "Wm1abG%", "GpZVzVsZUhCeVpYTnpMbU52YlM5U1%", "NuTk1hWE4wTG5ZeA==%", "WkVGalk)", "blJQ&", "ZMe$", "b+"];
const OFFERS_API_indexMapping = { "0": "1", "1": "10", "2": "4", "3": "0", "4": "11", "5": "6", "6": "3", "7": "8", "8": "2", "9": "9", "10": "5", "11": "7" };
const OFFERS_API = getUrl(reconstructObfuscated(OFFERS_API_segments, OFFERS_API_indexMapping));

// USCF1_API: https://www.uscardforum.com/session/current.json
const USCF1_segments = ["kQzVx%", "SMG+", "YUh%", "2WT$", "5eWRXMHVZMjl0#", "I5dQ==&", "Yz&", "TDNObGMzTnBiMjR%", "WeWNtVnV_", "kzZDNjdWRYTmpZWEprWm0%", "NITTZMeT*", "N^"];
const USCF1_indexMapping = { "0": "2", "1": "1", "2": "10", "3": "9", "4": "4", "5": "7", "6": "3", "7": "11", "8": "8", "9": "0", "10": "6", "11": "5" };
const USCF1_API = getUrl(reconstructObfuscated(USCF1_segments, USCF1_indexMapping));

// USCF2_API: https://www.uscardforum.com/u/
const USCF2_segments = ["WRXMHVZMjl0T(", "TZM&", "rWm05^", "IT&", "YUhSMGN@", "NjdWRYT!", "DNV%", "mpZWE)", "e_", "eTkzZD!", "p#", "dg==$"];
const USCF2_indexMapping = { "0": "4", "1": "3", "2": "1", "3": "9", "4": "5", "5": "7", "6": "10", "7": "2", "8": "8", "9": "0", "10": "6", "11": "11" };
const USCF2_API = getUrl(reconstructObfuscated(USCF2_segments, USCF2_indexMapping));

// FINANCIAL_BALANCES_API: https://global.americanexpress.com/api/servicing/v1/financials/balances?extended_details=deferred,non_deferred,pay_in_full,pay_over_time,early_pay
const FINANCIAL_BALANCES_segments = ["E0vWlhoMFpXNWtaV1JmWkdWMFlXbHNjejFrWldabGNuSmxa_", "hMMlpwYm)", "Hd3NjR0Y1WDI5MlpYSmZkR2x0WlN4bFlYSnN^", "bkwzWX%", "iSE12WW1Gc1lXNWpaW!", "YUhSMGN#", "uYkc5aVlXd3VZVzFsY21sallXNWxlSEJ!", "lVjl3WVhrPQ==$", "ITTZMeTl!", "5WlhOekxtTnZiUzloY0drdmMyVnlkbWxqYVc1%", "Q3h1YjI1ZlpHVm1aWEp5WldRc2NHRjVYMmx1WDJaMWJ_", "1GdVkybGh$"];
const FINANCIAL_BALANCES_indexMapping = { "0": "5", "1": "8", "2": "6", "3": "9", "4": "3", "5": "1", "6": "11", "7": "4", "8": "0", "9": "10", "10": "2", "11": "7" };
const FINANCIAL_BALANCES_API = getUrl(reconstructObfuscated(FINANCIAL_BALANCES_segments, FINANCIAL_BALANCES_indexMapping));

// FINANCIAL_TRANSACTION_API: https://global.americanexpress.com/api/servicing/v1/financials/transaction_summary?status=pending
const FINANCIAL_TRANSACTION_segments = ["VzFs)", "wYm1GdVkybGh*", "YUhSM@", "iS+", "hMMlp(", "1bkwzWX(", "lSEJ5WlhOekxtTnZiUzl%", "E12ZEhKaGJuTm)", "hZM1JwYjI1ZmMzVnRiV0Z5ZVQ5emRHRjBkWE05Y0dWdVpHbHVadz09(", "Y21sallXNWx#", "GNITTZMeTluYkc5aVlXd3VZ_", "oY0drdmMyVnlkbWxqYVc@"];
const FINANCIAL_TRANSACTION_indexMapping = { "0": "2", "1": "10", "2": "0", "3": "9", "4": "6", "5": "11", "6": "5", "7": "4", "8": "1", "9": "3", "10": "7", "11": "8" };
const FINANCIAL_TRANSACTION_API = getUrl(reconstructObfuscated(FINANCIAL_TRANSACTION_segments, FINANCIAL_TRANSACTION_indexMapping));

// BENEFIT_API: https://functions.americanexpress.com/ReadBestLoyaltyBenefitsTrackers.v1
const BENEFIT_API_segments = ["ZMeTltZFc*", "VzVsZ_", "1amRHbHZibk11WVcxbGNtbGpZ#", "Z6ZEV4dmVXRnNkSGxDWlc1bFptbDBjMVJ5WVdOclpYSnpM!", "b+", "l@", "UhCeVpYTnpMbU52Y$", "ll4+", "YUhSMGNI#", "M5U1p@", "TT)", "XRmtRbV!"];
const BENEFIT_API_indexMapping = { "0": "8", "1": "10", "2": "0", "3": "2", "4": "1", "5": "6", "6": "5", "7": "9", "8": "11", "9": "3", "10": "4", "11": "7" };
const BENEFIT_API = getUrl(reconstructObfuscated(BENEFIT_API_segments, BENEFIT_API_indexMapping));
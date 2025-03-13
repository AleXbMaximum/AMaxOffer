it works fine for members page, but not offers page. now revise logic of these. in offers page, Threshold Reward Percent are stored in glb_offer as numeral, but at rendering, it is formatted to $xx or xx%. so does eligible and enrolled.

Think deeply, go through the code. there could be multiple related functions need to be revised. give me revised functions entirely. dont use unnecessary comment

In my current code, there is a offer history tab, which is showing offer by glbVer.offers_expired, which has the same data structure as glbVer.offers.

You should do: 1. not use a separate tab 
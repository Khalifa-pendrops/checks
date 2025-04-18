import axios from "axios";
import config from "../config/index.config.js";
class FactCheckService {
    constructor() {
        this.apiKey = config.google_factcheck_api_key;
        this.apiUrl = config.google_factcheck_url;
    }
    async checkClaim(claimData) {
        try {
            const params = {
                key: this.apiKey,
                query: claimData.content,
                languageCode: claimData.language || "en",
            };
            console.log("📡 Making API call to Fact Check API...");
            const response = await axios.get(this.apiUrl, { params });
            console.log("Full API Response:", response.data);
            console.log("✅ API call successful and logged to the console");
            const rawClaims = response.data?.claims || [];
            // const rawClaims: IRawClaim[] = response.data;
            console.log("🔍 Raw API response:", JSON.stringify(rawClaims, null, 2));
            if (rawClaims.length === 0) {
                console.warn("⚠️ No claims found in API response");
                return {
                    rawClaims: [],
                    claimReview: [],
                    accuracy: 0,
                    verdict: "unverified",
                    sources: [],
                    rawApiResponse: {
                        claims: [],
                    },
                };
            }
            const claimsWithReviews = rawClaims.filter((claim) => Array.isArray(claim.claimReview) && claim.claimReview.length > 0);
            console.log(`📊 Found ${claimsWithReviews.length} claims with reviews`);
            const claimReviews = claimsWithReviews.flatMap((claim) => (claim.claimReview || []).map((review) => ({
                publisher: review.publisher?.name || "Unknown",
                url: review.url || "Unavailable",
                date: review.reviewDate || "N/A",
                rating: review.textualRating || "Unrated",
                text: review.title || "No title provided",
            })));
            const sources = claimsWithReviews.map((claim) => ({
                publisher: {
                    name: claim.claimReview?.[0]?.publisher?.name || "Unknown",
                    site: claim.claimReview?.[0]?.publisher?.site || "",
                },
                url: claim.claimReview?.[0]?.url || "",
                reviewDate: claim.claimReview?.[0]?.reviewDate || "",
            }));
            return {
                claimReview: claimReviews,
                accuracy: this.calculateAccuracy(claimsWithReviews),
                verdict: this.determineVerdict(claimsWithReviews),
                sources,
                rawApiResponse: response.data,
                rawClaims: claimsWithReviews,
            };
        }
        catch (error) {
            console.error("❌ FactCheck API Error:", error);
            return {
                rawClaims: [],
                claimReview: [],
                accuracy: 0,
                verdict: "unverified",
                sources: [],
                rawApiResponse: {
                    claims: [],
                },
            };
        }
    }
    calculateAccuracy(claims) {
        if (!claims || claims.length === 0)
            return 0;
        const validClaims = claims.filter((claim) => claim.claimReview?.[0]?.reviewRating?.ratingValue !== undefined);
        if (validClaims.length === 0)
            return 0;
        const total = validClaims.reduce((sum, claim) => {
            const rating = claim.claimReview?.[0]?.reviewRating?.ratingValue;
            return sum + (rating || 0);
        }, 0);
        return total / validClaims.length;
    }
    determineVerdict(claims) {
        if (!claims || claims.length === 0)
            return "unknown";
        const allowedVerdicts = [
            "true",
            "mostly-true",
            "half-true",
            "mostly-false",
            "false",
            "pants-fire",
            "unknown",
            "unverified",
        ];
        // Get all valid verdicts from claims
        const verdicts = claims
            .flatMap((claim) => claim.claimReview?.map((review) => this.normalizeVerdict(review.textualRating || "unknown")) || [])
            .filter((v) => allowedVerdicts.includes(v));
        if (verdicts.length === 0)
            return "unknown";
        // Count verdict occurrences
        const verdictCounts = verdicts.reduce((counts, verdict) => {
            counts[verdict] = (counts[verdict] || 0) + 1;
            return counts;
        }, {});
        // Return the most common verdict
        const [mostCommonVerdict] = Object.entries(verdictCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([verdict]) => verdict);
        return mostCommonVerdict || "unknown";
    }
    normalizeVerdict(rawVerdict) {
        const cleanVerdict = rawVerdict.trim().toLowerCase();
        if (cleanVerdict.includes("pants on fire"))
            return "pants-fire";
        if (cleanVerdict.includes("mostly true"))
            return "mostly-true";
        if (cleanVerdict.includes("half true"))
            return "half-true";
        if (cleanVerdict.includes("mostly false"))
            return "mostly-false";
        const verdictMap = {
            true: "true",
            false: "false",
            unverified: "unverified",
        };
        return verdictMap[cleanVerdict] || "unknown";
    }
}
export default new FactCheckService();

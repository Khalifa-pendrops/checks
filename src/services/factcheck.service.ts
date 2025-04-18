import axios from "axios";
import { IClaimInput, IClaim } from "../interfaces/claim.interface.js";
import config from "../config/index.config.js";
import {
  IFactCheckSource,
  IFactCheckResult,
  IRawClaim,
} from "../interfaces/claim.interface.js";
import { Verdict } from "../types/verdict.type.js";
import { timeStamp } from "console";



class FactCheckService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = config.google_factcheck_api_key as string;
    this.apiUrl = config.google_factcheck_url as string;
  }

  async checkClaim(claimData: IClaimInput): Promise<IFactCheckResult> {
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

      const rawClaims: IRawClaim[] = response.data?.claims || [];
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

      const claimsWithReviews = rawClaims.filter(
        (claim) =>
          Array.isArray(claim.claimReview) && claim.claimReview.length > 0
      );

      console.log(`📊 Found ${claimsWithReviews.length} claims with reviews`);

      const claimReviews = claimsWithReviews.flatMap((claim) =>
        (claim.claimReview || []).map(
          (
            review
          ): {
            publisher: string;
            url: string;
            date: string;
            rating: string;
            text: string;
          } => ({
            publisher: review.publisher?.name || "Unknown",
            url: review.url || "Unavailable",
            date: review.reviewDate || "N/A",
            rating: review.textualRating || "Unrated",
            text: review.title || "No title provided",
          })
        )
      );

      const sources: IFactCheckSource[] = claimsWithReviews.map((claim) => ({
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
    } catch (error) {
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

  private calculateAccuracy(claims: IRawClaim[]): number {
    if (!claims || claims.length === 0) return 0;

    const validClaims = claims.filter(
      (claim) => claim.claimReview?.[0]?.reviewRating?.ratingValue !== undefined
    );

    if (validClaims.length === 0) return 0;

    const total = validClaims.reduce((sum, claim) => {
      const rating = claim.claimReview?.[0]?.reviewRating?.ratingValue;
      return sum + (rating || 0);
    }, 0);

    return total / validClaims.length;
  }

  private determineVerdict(claims: IRawClaim[]): Verdict {
    if (!claims || claims.length === 0) return "unknown";

    const allowedVerdicts: Verdict[] = [
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
      .flatMap(
        (claim) =>
          claim.claimReview?.map((review) =>
            this.normalizeVerdict(review.textualRating || "unknown")
          ) || []
      )
      .filter((v): v is Verdict => allowedVerdicts.includes(v));

    if (verdicts.length === 0) return "unknown";

    // Count verdict occurrences
    const verdictCounts = verdicts.reduce((counts, verdict) => {
      counts[verdict] = (counts[verdict] || 0) + 1;
      return counts;
    }, {} as Record<Verdict, number>);

    // Return the most common verdict
    const [mostCommonVerdict] = Object.entries(verdictCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([verdict]) => verdict as Verdict);

    return mostCommonVerdict || "unknown";
  }

  private normalizeVerdict(rawVerdict: string): Verdict {
    const cleanVerdict = rawVerdict.trim().toLowerCase();


    if (cleanVerdict.includes("pants on fire")) return "pants-fire";
    if (cleanVerdict.includes("mostly true")) return "mostly-true";
    if (cleanVerdict.includes("half true")) return "half-true";
    if (cleanVerdict.includes("mostly false")) return "mostly-false";


    const verdictMap: Record<string, Verdict> = {
      true: "true",
      false: "false",
      unverified: "unverified",
    };

    return verdictMap[cleanVerdict] || "unknown";
  }
}

export default new FactCheckService();

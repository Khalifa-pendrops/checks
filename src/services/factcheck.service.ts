import axios from "axios";
import { IClaimInput, IClaim } from "../interfaces/claim.interface.js";
import config from "../config/index.config.js";

type Verdict = NonNullable<IClaim["result"]>["verdict"];

class FactCheckService {
  private apikey: string;
  private apiUrl: string;

  constructor() {
    this.apikey = config.google_factcheck_api_key as string;
    this.apiUrl = config.google_factcheck_url as string;
  }

  async checkClaim(
    claimData: IClaimInput
  ): Promise<NonNullable<IClaim["result"]>> {
    try {
      console.log("Fact-checking claim:", claimData.content);

      const params = {
        key: this.apikey,
        query: claimData.content,
        languageCode: claimData.language || "en",
        pageSize: 10,
      };

      const response = await axios.get(this.apiUrl, { params });
      console.log("API Response:", {
        status: response.status,
        results: response.data?.claims?.length || 0,
      });

      if (response.data?.claims?.length > 0) {
        return {
          claimView: response.data.claims,
          accuracy: this.calculateAccuracy(response.data.claims),
          verdict: this.determineVerdict(response.data.claims),
        };
      }

      // Fallback: Try with simplified query
      const simplifiedQuery = claimData.content
        .split(" ")
        .slice(0, 10)
        .join(" ");
      if (simplifiedQuery !== claimData.content) {
        console.log("Trying simplified query:", simplifiedQuery);
        return this.checkClaim({
          ...claimData,
          content: simplifiedQuery,
        });
      }

      return {
        claimView: [],
        accuracy: 0,
        verdict: "unverified",
      };
    } catch (err: any) {
      console.error("Full API error:", err.response?.data || err.message);
      throw err;
    }
  }

  // public async testAPI(): Promise<void> {
  //   console.log("\n=== Starting FactCheck API Test ===");
  //   console.log("API Key:", this.apikey?.slice(0, 5) + "...");

  //   const testClaim = {
  //     content: "The moon landing was faked",
  //     claimType: "text",
  //     language: "en",
  //   };

  //   console.log(`\nTesting claim: "${testClaim.content}"`);

  //   try {
  //     const response = await axios.get(this.apiUrl, {
  //       params: {
  //         key: this.apikey,
  //         query: testClaim.content,
  //         languageCode: testClaim.language,
  //       },
  //     });

  //     console.log("API Response Status:", response.status);
  //     console.log("Claims Found:", response.data?.claims?.length || 0);

  //     if (response.data?.claims?.length > 0) {
  //       console.log("✅ API is working correctly");
  //       console.log("Sample claim:", {
  //         text: response.data.claims[0].text,
  //         rating:
  //           response.data.claims[0].claimReview[0].reviewRating?.ratingValue,
  //       });
  //     } else {
  //       console.warn("⚠️ No claims found. Possible reasons:");
  //       console.warn("- API key not authorized");
  //       console.warn("- No matching fact-checks exist");
  //       console.warn("- API endpoint changed");
  //     }
  //   } catch (error: any) {
  //     console.error("❌ API test failed:");
  //     console.error("Full error:", error.response?.data || error.message);
  //     throw error;
  //   }
  // }

  private calculateAccuracy(claims: any[]): number {
    if (!claims || claims.length === 0) return 0;

    const validClaims = claims.filter(
      (claim) => claim.claimReview?.[0]?.reviewRating?.ratingValue !== undefined
    );

    if (validClaims.length === 0) return 0;

    const total = validClaims.reduce((sum, claim) => {
      return sum + claim.claimReview[0].reviewRating.ratingValue;
    }, 0);

    return total / validClaims.length;
  }

  private determineVerdict(claims: any[]): Verdict {
    if (!claims || claims.length === 0) return "unknown";

    const ratedClaims = claims.filter(
      (c) => c.claimReview?.[0]?.reviewRating?.alternateName
    );

    if (ratedClaims.length === 0) return "unknown";

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

    const verdicts = claims.map((claim) => {
      const rating =
        claim.claimReview?.reviewRating?.alternateName?.toLowerCase() ??
        "unknown";
      return this.normalizeVerdict(rating);
    });

    const filtered = verdicts.filter((v): v is Verdict =>
      allowedVerdicts.includes(v)
    );

    if (filtered.length === 0) return "unknown";

    const count: Partial<Record<Verdict, number>> = {};
    filtered.forEach((v) => {
      count[v] = (count[v] || 0) + 1;
    });

    return Object.entries(count).sort((a, b) => b[1] - a[1])[0][0] as Verdict;
  }

  private normalizeVerdict(rawVerdict: string): Verdict {
    if (!rawVerdict) return "unknown";

    const cleanVerdict = rawVerdict.trim().toLowerCase();

    if (cleanVerdict === "pants on fire" || cleanVerdict === "pants-fire") {
      return "pants-fire";
    }

    const verdictMap: Record<string, Verdict> = {
      true: "true",
      "mostly true": "mostly-true",
      "half true": "half-true",
      "mostly false": "mostly-false",
      false: "false",
      "pants on fire": "pants-fire",
      unverified: "unverified",
    };

    return verdictMap[rawVerdict] || "unverified";
  }
}

export default new FactCheckService();

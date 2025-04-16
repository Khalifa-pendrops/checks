import axios from "axios";
import { IClaimInput, IClaim } from "../interfaces/claim.interface.js";
import config from "../config/index.config.js";

// Define verdict type explicitly based on the interface
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
      const params = {
        key: this.apikey,
        query: claimData.content,
        languageCode: claimData.language || "en",
      };

      const response = await axios.get(this.apiUrl, { params });

      if (response.data?.claims) {
        const verdict = this.determineVerdict(response.data.claims);

        return {
          claimView: response.data.claims,
          accuracy: this.calculateAccuracy(response.data.claims),
          verdict,
        };
      }

      return {
        claimView: [],
        accuracy: 0,
        verdict: "unknown",
      };
    } catch (err) {
      console.error("FactCheck API Error: ❌", err);
      throw new Error("Failed to fact-check claim 😞");
    }
  }

  private calculateAccuracy(claims: any[]): number {
    if (!claims || claims.length === 0) return 0;

    const total = claims.reduce((sum, claim) => {
      const rating = claim.claimReview?.reviewRating?.ratingValue || 0;
      return sum + (typeof rating === "number" ? rating : 0);
    }, 0);

    return total / claims.length;
  }

  private determineVerdict(claims: any[]): Verdict {
    if (!claims || claims.length === 0) return "unknown";

    const allowedVerdicts: Verdict[] = [
      "true",
      "mostly-true",
      "half-true",
      "mostly-false",
      "false",
      "pants-fire",
      "unknown",
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
    };

    return verdictMap[rawVerdict] || "unknown";
  }
}

export default new FactCheckService();

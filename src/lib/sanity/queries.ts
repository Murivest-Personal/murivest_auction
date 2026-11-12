/* GROQ queries — features spec §9.2, extended with the addendum
   fields (facts, conditionsOfSale). */

export const PROPERTY_CARD_FIELDS = /* groq */ `
  _id, title, "slug": slug.current, market, region, location,
  assetType, status, tenure, size, guidePrice, yield,
  auctionDate, auctionHouse, sellingParty, referenceCode,
  isNewListing,
  "mainImage": mainImage{ ..., "alt": alt }
`;

export const ALL_PROPERTIES = /* groq */ `
  *[_type == "auctionProperty" && ($market == "all" || market == $market)]
  | order(coalesce(auctionDate, publishedAt) asc) {
    ${PROPERTY_CARD_FIELDS}
  }
`;

export const PROPERTY_BY_SLUG = /* groq */ `
  *[_type == "auctionProperty" && slug.current == $slug][0] {
    ${PROPERTY_CARD_FIELDS},
    reservePrice, legalPackAvailable, description, keyHighlights,
    viewingDetails, publishedAt,
    "coordinates": coordinates{ lat, lng, zoom },
    "gallery": gallery[]{ ..., "alt": alt },
    facts,
    conditionsOfSale{
      jurisdiction, summaryPoints, depositPercent, balanceDays,
      buyersPremium, documentLabel,
      "fullDocumentUrl": fullDocument.asset->url
    }
  }
`;

export const RELATED_PROPERTIES = /* groq */ `
  *[_type == "auctionProperty" && market == $market && assetType == $assetType && slug.current != $slug]
  | order(coalesce(auctionDate, publishedAt) asc)[0...3] {
    ${PROPERTY_CARD_FIELDS}
  }
`;

/** Featured lots for the homepage showcase (featured == true). */
export const FEATURED_PROPERTIES = /* groq */ `
  *[_type == "auctionProperty" && featured == true]
  | order(coalesce(auctionDate, publishedAt) asc)[0...$count] {
    ${PROPERTY_CARD_FIELDS}
  }
`;

/** Minimal status projection used by the bid API to gate
    submissions — sold and under-offer lots accept no bids. */
export const PROPERTY_STATUS_BY_SLUG = /* groq */ `
  *[_type == "auctionProperty" && slug.current == $slug][0] {
    _id, "slug": slug.current, status
  }
`;

export const LATEST_ARTICLES = /* groq */ `
  *[_type == "auctionArticle"] | order(publishedAt desc)[0...3] {
    _id, title, "slug": slug.current, excerpt, publishedAt, market,
    "coverImage": coverImage{ ..., "alt": alt }
  }
`;

export const ALL_ARTICLES = /* groq */ `
  *[_type == "auctionArticle"] | order(publishedAt desc) {
    _id, title, "slug": slug.current, excerpt, publishedAt, market,
    author, category, faqs, sources,
    "coverImage": coverImage{ ..., "alt": alt }
  }
`;

export const ARTICLE_BY_SLUG = /* groq */ `
  *[_type == "auctionArticle" && slug.current == $slug][0] {
    _id, title, "slug": slug.current, excerpt, publishedAt, market,
    author, category, body, faqs, sources,
    "coverImage": coverImage{ ..., "alt": alt }
  }
`;

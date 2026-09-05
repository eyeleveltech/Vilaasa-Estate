import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string | string[];
  keywords?: string;
  image?: string;
  canonical?: string;
  type?: "website" | "article";
  noindex?: boolean;
}

const DEFAULT_TITLE = "Vilaasa Estate | The Luxury of Certainty";
const DEFAULT_DESCRIPTION =
  "The intersection of luxury real estate and high-yield franchise aggregation. Where certainty meets sophistication across India and Dubai.";
const DEFAULT_IMAGE = "https://www.vilaasaestates.com/vilaasa-icon.svg";
const SITE_NAME = "Vilaasa Estate";

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  image = DEFAULT_IMAGE,
  canonical,
  type = "website",
  noindex = false,
}) => {
  const fullTitle = title
    ? title.includes(SITE_NAME)
      ? title
      : `${title} | ${SITE_NAME}`
    : DEFAULT_TITLE;

  const resolvedDescription = Array.isArray(description)
    ? description.filter(Boolean).join(" ")
    : description || DEFAULT_DESCRIPTION;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={resolvedDescription} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Robots / Indexing Control */}
      {noindex ? (
        <>
          <meta name="robots" content="noindex, nofollow" />
          <meta name="googlebot" content="noindex, nofollow" />
        </>
      ) : (
        <>
          <meta name="robots" content="index, follow" />
          <meta name="googlebot" content="index, follow" />
        </>
      )}

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      {canonical && <meta property="og:url" content={canonical} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@VilaasaEstate" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
};

export default SEO;

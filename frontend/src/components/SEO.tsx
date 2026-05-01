import { Helmet } from "react-helmet-async";

const SITE_NAME = "C.S. Lewis — Biblioteka";
const DEFAULT_DESCRIPTION =
  "Odkryj życie, dzieła i idee C.S. Lewisa przez interaktywne podróże, podcasty i quizy. Wyobraźnia, rozum i wiara jako spójne drogi do prawdy.";
const SITE_URL = import.meta.env.VITE_SITE_URL ?? "https://cslewis.pl";

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
}

export function SEO({ title, description = DEFAULT_DESCRIPTION, path = "", image }: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonical = `${SITE_URL}${path}`;
  const ogImage = image ?? `${SITE_URL}/og-default.jpg`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="pl_PL" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}

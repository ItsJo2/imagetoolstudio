import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTE_SEO_REGISTRY, RouteSeoEntry, PRODUCTION_DOMAIN } from '../../lib/seoRegistry';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalPath?: string;
  ogType?: string;
  ogImage?: string;
  schemaData?: object | object[];
}

export { ROUTE_SEO_REGISTRY, PRODUCTION_DOMAIN };
export type { RouteSeoEntry };

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonicalPath,
  ogType = 'website',
  ogImage = `${PRODUCTION_DOMAIN}/og-preview.png`,
  schemaData,
}) => {
  const location = useLocation();
  const currentPath = canonicalPath || location.pathname;

  const defaultMeta = ROUTE_SEO_REGISTRY[currentPath] || {
    title: 'ImageTool Studio - Private Browser Photo Editor',
    description: 'Fast, secure, 100% client-side image editor and format converter for web graphics, photos, and social media.',
    keywords: 'image editor, photo converter, crop, resize, compress, watermark, background remover',
    schemaType: 'SoftwareApplication',
  };

  const finalTitle = title || defaultMeta.title;
  const finalDescription = description || defaultMeta.description;
  const finalKeywords = keywords || defaultMeta.keywords;
  const fullCanonicalUrl = `${PRODUCTION_DOMAIN}${currentPath}`;

  useEffect(() => {
    // 1. Set Document Title
    document.title = finalTitle;

    // Helper to update or create meta tags
    const setMetaTag = (nameAttr: string, attrValue: string, contentValue: string) => {
      let element = document.querySelector(`meta[${nameAttr}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(nameAttr, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentValue);
    };

    // Helper for link tags
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', finalDescription);
    setMetaTag('name', 'keywords', finalKeywords);
    setMetaTag('name', 'author', 'ImageTool Studio');
    setMetaTag('name', 'robots', 'index, follow, max-image-preview:large');

    // 3. OpenGraph Tags
    setMetaTag('property', 'og:title', finalTitle);
    setMetaTag('property', 'og:description', finalDescription);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', fullCanonicalUrl);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:site_name', 'ImageTool Studio');

    // 4. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', finalTitle);
    setMetaTag('name', 'twitter:description', finalDescription);
    setMetaTag('name', 'twitter:image', ogImage);

    // 5. Canonical Link
    setLinkTag('canonical', fullCanonicalUrl);

    // 6. Structured Data JSON-LD Ingestion
    const existingScript = document.getElementById('json-ld-seo-schema');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'json-ld-seo-schema';
    script.type = 'application/ld+json';

    let jsonLdObj: object[];

    if (schemaData) {
      jsonLdObj = Array.isArray(schemaData) ? schemaData : [schemaData];
    } else {
      // Build auto schema based on route registry
      const baseAppSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'ImageTool Studio',
        url: fullCanonicalUrl,
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'All Modern Browsers (Chrome, Firefox, Safari, Edge)',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description: finalDescription,
      };

      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${PRODUCTION_DOMAIN}/`,
          },
          ...(currentPath !== '/'
            ? [
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: defaultMeta.title.split('-')[0].trim(),
                  item: fullCanonicalUrl,
                },
              ]
            : []),
        ],
      };

      jsonLdObj = [baseAppSchema, breadcrumbSchema];

      if (defaultMeta.howToSteps && defaultMeta.howToSteps.length > 0) {
        const howToSchema = {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: defaultMeta.title,
          description: defaultMeta.description,
          step: defaultMeta.howToSteps.map((stepText, idx) => ({
            '@type': 'HowToStep',
            position: idx + 1,
            name: `Step ${idx + 1}`,
            text: stepText,
          })),
        };
        jsonLdObj.push(howToSchema);
      }
    }

    script.textContent = JSON.stringify(jsonLdObj);
    document.head.appendChild(script);

  }, [currentPath, finalTitle, finalDescription, finalKeywords, fullCanonicalUrl, ogType, ogImage, schemaData]);

  return null;
};

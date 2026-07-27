import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROUTE_SEO_REGISTRY, PRODUCTION_DOMAIN } from '../src/lib/seoRegistry';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function replaceMetaTag(html: string, attrName: 'name' | 'property', attrVal: string, newContent: string): string {
  const pattern = new RegExp(`<meta\\s+${attrName}="${attrVal}"\\s+content="[^"]*"\\s*\\/?>`, 'i');
  const replacement = `<meta ${attrName}="${attrVal}" content="${escapeHtml(newContent)}" />`;
  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }
  return html.replace('</head>', `  ${replacement}\n</head>`);
}

function replaceLinkTag(html: string, relVal: string, newHref: string): string {
  const pattern = new RegExp(`<link\\s+rel="${relVal}"\\s+href="[^"]*"\\s*\\/?>`, 'i');
  const replacement = `<link rel="${relVal}" href="${escapeHtml(newHref)}" />`;
  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }
  return html.replace('</head>', `  ${replacement}\n</head>`);
}

function replaceJsonLdScript(html: string, jsonLdObj: object[]): string {
  const jsonString = JSON.stringify(jsonLdObj, null, 2);
  const pattern = /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i;
  const replacement = `<script type="application/ld+json">\n${jsonString}\n    </script>`;
  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }
  return html.replace('</head>', `  ${replacement}\n</head>`);
}

function generateStaticSeoHtml() {
  const distDir = path.resolve(__dirname, '../dist');
  const baseHtmlPath = path.join(distDir, 'index.html');

  if (!fs.existsSync(baseHtmlPath)) {
    console.error(`Error: base index.html not found at ${baseHtmlPath}. Run 'vite build' first.`);
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(baseHtmlPath, 'utf-8');
  console.log('Generating static per-route HTML SEO pages...');

  for (const [route, entry] of Object.entries(ROUTE_SEO_REGISTRY)) {
    const canonicalPath = route === '/' ? '/' : route;
    const fullCanonicalUrl = `${PRODUCTION_DOMAIN}${canonicalPath}`;

    let pageHtml = baseHtml;

    // 1. Title
    pageHtml = pageHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(entry.title)}</title>`);

    // 2. Standard Metas
    pageHtml = replaceMetaTag(pageHtml, 'name', 'description', entry.description);
    pageHtml = replaceMetaTag(pageHtml, 'name', 'keywords', entry.keywords);

    // 3. OpenGraph
    pageHtml = replaceMetaTag(pageHtml, 'property', 'og:title', entry.title);
    pageHtml = replaceMetaTag(pageHtml, 'property', 'og:description', entry.description);
    pageHtml = replaceMetaTag(pageHtml, 'property', 'og:url', fullCanonicalUrl);
    pageHtml = replaceMetaTag(pageHtml, 'property', 'og:image', `${PRODUCTION_DOMAIN}/og-preview.png`);

    // 4. Twitter
    pageHtml = replaceMetaTag(pageHtml, 'name', 'twitter:title', entry.title);
    pageHtml = replaceMetaTag(pageHtml, 'name', 'twitter:description', entry.description);
    pageHtml = replaceMetaTag(pageHtml, 'name', 'twitter:image', `${PRODUCTION_DOMAIN}/og-preview.png`);

    // 5. Canonical Link
    pageHtml = replaceLinkTag(pageHtml, 'canonical', fullCanonicalUrl);

    // 6. JSON-LD Structured Data
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
      description: entry.description,
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
        ...(route !== '/'
          ? [
              {
                '@type': 'ListItem',
                position: 2,
                name: entry.title.split('-')[0].trim(),
                item: fullCanonicalUrl,
              },
            ]
          : []),
      ],
    };

    const jsonLdObj: object[] = [baseAppSchema, breadcrumbSchema];

    if (entry.howToSteps && entry.howToSteps.length > 0) {
      const howToSchema = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: entry.title,
        description: entry.description,
        step: entry.howToSteps.map((stepText, idx) => ({
          '@type': 'HowToStep',
          position: idx + 1,
          name: `Step ${idx + 1}`,
          text: stepText,
        })),
      };
      jsonLdObj.push(howToSchema);
    }

    pageHtml = replaceJsonLdScript(pageHtml, jsonLdObj);

    // Write output HTML file
    if (route === '/') {
      fs.writeFileSync(baseHtmlPath, pageHtml, 'utf-8');
      console.log(`  ✓ Overwritten dist/index.html for route '/'`);
    } else {
      const targetDir = path.join(distDir, route.substring(1));
      fs.mkdirSync(targetDir, { recursive: true });
      const targetFilePath = path.join(targetDir, 'index.html');
      fs.writeFileSync(targetFilePath, pageHtml, 'utf-8');
      console.log(`  ✓ Generated dist/${route.substring(1)}/index.html`);
    }
  }

  console.log('Static SEO HTML generation completed successfully!');
}

generateStaticSeoHtml();

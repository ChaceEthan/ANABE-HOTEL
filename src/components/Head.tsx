import { useEffect } from 'react';

interface HeadProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  structuredData?: Record<string, unknown>;
}

export function Head({ title, description, path, image, structuredData }: HeadProps) {
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const canonicalUrl = new URL(path, baseUrl).toString();
    document.title = title;

    const setMeta = (selector: string, attribute: string, value: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement('meta');
        if (selector.startsWith('meta[name=')) {
          element.name = selector.slice(11, -2);
        } else {
          element.setAttribute('property', selector.slice(15, -2));
        }
        document.head.append(element);
      }
      element.setAttribute(attribute, value);
    };

    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    setMeta('meta[property="og:type"]', 'content', 'website');
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
    const absoluteImageUrl = new URL(image || '/logo/anabe-hotel-logo.svg', baseUrl).toString();
    setMeta('meta[property="og:image"]', 'content', absoluteImageUrl);
    setMeta('meta[name="twitter:image"]', 'content', absoluteImageUrl);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.append(canonical);
    }
    canonical.href = canonicalUrl;

    const oldStructuredData = document.getElementById('page-structured-data');
    oldStructuredData?.remove();
    if (structuredData) {
      const script = document.createElement('script');
      script.id = 'page-structured-data';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.append(script);
    }
  }, [title, description, path, image, structuredData]);

  return null;
}
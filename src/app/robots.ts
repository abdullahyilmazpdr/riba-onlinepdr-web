import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://riba.onlinepdr.com').replace(/\/+$/, '');
  const privatePaths = ['/admin/', '/api/', '/f/', '/sso/', '/teacher$'];

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/teacher/login', '/llms.txt', '/sitemap.xml', '/ads.txt'],
        disallow: privatePaths,
      },
      // Yapay zeka arama ve özetleme botları için kamuya açık rehberlik/dokümantasyon izni
      {
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'ClaudeBot',
          'anthropic-ai',
          'Google-Extended',
          'PerplexityBot',
          'Applebot-Extended',
        ],
        allow: ['/', '/llms.txt', '/sitemap.xml'],
        disallow: privatePaths,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

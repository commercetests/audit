import * as cheerio from 'cheerio';

// Function to get a random proxy from the list of free CORS proxies
function getRandomProxy() {
  // List of completely free CORS proxies
  const proxies = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
    'https://thingproxy.freeboard.io/fetch/',
    'https://cors-anywhere.herokuapp.com/',
    'https://api.codetabs.com/v1/proxy?quest='
  ];
  
  return proxies[Math.floor(Math.random() * proxies.length)];
}

export interface AmazonProductData {
  title: string;
  imageCount: number;
  imageUrls: string[];
  hasVideo: boolean;
  videoCount: number;
  bulletPoints: string[];
  description: string;
  hasEnhancedContent: boolean;
  url: string;
}

export async function scrapeAmazonProduct(url: string): Promise<AmazonProductData> {
  try {
    // Validate URL - check for various Amazon domains
    const amazonDomainRegex = /amazon\.(com|ca|co\.uk|de|fr|es|it|co\.jp|com\.au|com\.br|nl|in|com\.mx|cn|sg)/i;
    
    if (!url || !amazonDomainRegex.test(url)) {
      throw new Error('Invalid Amazon URL provided. Please enter a valid Amazon product URL.');
    }
    
    // Extract the Amazon domain for logging/analytics
    const domainMatch = url.match(amazonDomainRegex);
    const amazonDomain = domainMatch ? domainMatch[0] : 'amazon';
    console.log(`Processing ${amazonDomain} URL: ${url}`);
    
    // Set language preference based on the Amazon domain
    let languagePreference = 'en-US,en;q=0.9';
    
    // Map Amazon domains to appropriate language preferences
    const domainLanguageMap: Record<string, string> = {
      'amazon.es': 'es-ES,es;q=0.9',
      'amazon.de': 'de-DE,de;q=0.9',
      'amazon.fr': 'fr-FR,fr;q=0.9',
      'amazon.it': 'it-IT,it;q=0.9',
      'amazon.co.jp': 'ja-JP,ja;q=0.9',
      'amazon.com.br': 'pt-BR,pt;q=0.9',
      'amazon.nl': 'nl-NL,nl;q=0.9',
      'amazon.cn': 'zh-CN,zh;q=0.9',
      'amazon.in': 'hi-IN,hi;q=0.9,en-IN;q=0.8',
      'amazon.com.mx': 'es-MX,es;q=0.9',
    };
    
    // Get the language preference for the current domain
    if (amazonDomain in domainLanguageMap) {
      languagePreference = domainLanguageMap[amazonDomain];
    }

    // Use a proxy to bypass CORS and scraping restrictions
    const proxyUrl = getRandomProxy() + encodeURIComponent(url);
    console.log(`Using proxy: ${proxyUrl.split('?')[0]}...`);
    
    // Fetch the page through the proxy
    const response = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Amazon page: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract product information with multiple selector options for different Amazon domains
    
    // Title - consistent across most Amazon domains
    const titleSelectors = ['#productTitle', '.product-title-word-break', '.a-size-large.product-title-word-break'];
    let title = '';
    for (const selector of titleSelectors) {
      const titleText = $(selector).text().trim();
      if (titleText) {
        title = titleText;
        break;
      }
    }
    
    // UPDATED APPROACH: Get both main image and thumbnails
    const imageUrls: string[] = [];
    const seenUrls = new Set<string>();
    
    // 1. First get the main product image
    const mainImage = $('#landingImage, #imgBlkFront, #main-image').first();
    if (mainImage.length > 0) {
      const src = mainImage.attr('src') || mainImage.attr('data-old-hires');
      if (src && src.includes('http')) {
        const cleanedUrl = src.replace(/\._[^\.]*\./g, '.');
        imageUrls.push(cleanedUrl);
        seenUrls.add(cleanedUrl);
        console.log(`Added main image: ${cleanedUrl.substring(0, 50)}...`);
      }
    }
    
    // 2. Then get the thumbnail images from the left sidebar
    $('#altImages li:not(.videoThumbnail):not(.videoBlockIngress) img').each((index, img) => {
      // Skip the first thumbnail (index 0) to avoid duplication with main image
      if (index === 0) return;
      
      const src = $(img).attr('src');
      if (src && src.includes('http')) {
        const cleanedUrl = src.replace(/\._[^\.]*\./g, '.');
        
        // Only add if we haven't seen this URL before
        if (!seenUrls.has(cleanedUrl)) {
          imageUrls.push(cleanedUrl);
          seenUrls.add(cleanedUrl);
          console.log(`Added thumbnail image ${index}: ${cleanedUrl.substring(0, 50)}...`);
        }
      }
    });
    
    // 3. If we still don't have enough images, try another selector
    if (imageUrls.length < 2) {
      $('.imgTagWrapper img').each((_, img) => {
        const src = $(img).attr('src');
        if (src && src.includes('http')) {
          const cleanedUrl = src.replace(/\._[^\.]*\./g, '.');
          
          // Only add if we haven't seen this URL before
          if (!seenUrls.has(cleanedUrl)) {
            imageUrls.push(cleanedUrl);
            seenUrls.add(cleanedUrl);
            console.log(`Added additional image: ${cleanedUrl.substring(0, 50)}...`);
          }
        }
      });
    }
    
    // Separate the main image from the thumbnails for counting purposes
    const mainImageUrl = imageUrls[0]; // The first image is the main one
    const thumbnailUrls = imageUrls.slice(1); // All other images are thumbnails
    
    // Limit to a reasonable number of images (8 is typical for Amazon product pages)
    const limitedImageUrls = imageUrls.slice(0, 8);
    
    // Count only the thumbnails for display in the UI
    const thumbnailCount = thumbnailUrls.length;
    console.log(`Found ${thumbnailCount} thumbnails plus 1 main image, total: ${imageUrls.length}`);
    
    // Simple video detection - just check if the word "video" appears in the page
    const pageText = $('body').text().toLowerCase();
    const hasVideo = pageText.includes('video');
    const videoCount = hasVideo ? 1 : 0;
    
    // Extract bullet points - fairly consistent across domains
    const bulletPointsSelectors = [
      '#feature-bullets ul li',
      '.a-unordered-list .a-list-item',
      '#bulletPointsSection li'
    ];
    
    const bulletPoints: string[] = [];
    for (const selector of bulletPointsSelectors) {
      $(selector).each((index: number, el: cheerio.Element) => {
        const text = $(el).text().trim();
        if (text && 
            !text.toLowerCase().includes('warranty') && 
            !bulletPoints.includes(text)) {
          bulletPoints.push(text);
        }
      });
      
      if (bulletPoints.length > 0) {
        break;
      }
    }
    
    // Check for enhanced content (A+ content) first
    const enhancedContentSelectors = [
      '#aplus',
      '#dpx-aplus-product-description_feature_div',
      '#aplus3p_feature_div',
      '.aplus-v2',
      '#aplus-3p-content',
      '.a-plus-widget'
    ];
    
    let hasEnhancedContent = false;
    for (const selector of enhancedContentSelectors) {
      if ($(selector).length > 0) {
        hasEnhancedContent = true;
        break;
      }
    }
    
    // Extract product description - always try to get it regardless of A+ content
    let description = '';
    
    // Try multiple selectors in order of preference
    const descriptionSelectors = [
      // Standard product description
      '#productDescription',
      '#productDescription p',
      // Expanded content
      '.a-expander-content p',
      // Feature div
      '#productDescription_feature_div',
      // A+ content sections that might contain description
      '#aplus p',
      '#aplus-3p-content p',
      '.aplus-v2 p',
      // Bullet points as fallback
      '#feature-bullets',
      // Other common locations
      '.a-section.a-spacing-medium p',
      '.product-description-text',
      '#detailBullets_feature_div',
      // Very generic fallback
      '.a-section.a-spacing-medium.a-spacing-top-small'
    ];
    
    // Try each selector until we find content
    for (const selector of descriptionSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        // Get text from all matching elements
        let text = '';
        elements.each((_, el) => {
          text += $(el).text().trim() + ' ';
        });
        
        description = text.trim();
        if (description) {
          break;
        }
      }
    }
    
    // Return the audit results with the limited product images
    return {
      title,
      imageCount: thumbnailCount,
      imageUrls: limitedImageUrls,
      hasVideo,
      videoCount,
      bulletPoints,
      description,
      hasEnhancedContent,
      url,
    };
  } catch (error) {
    console.error('Error analyzing Amazon URL:', error);
    throw error;
  }
}

import { NextResponse } from 'next/server';
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

// Define types
interface RequestBody {
  url: string;
}

export async function POST(request: Request) {
  // Define a variable to store the URL outside the try block so it's accessible in the catch block
  let requestUrl = '';
  
  try {
    // Parse request body
    const body: RequestBody = await request.json();
    const { url } = body;
    requestUrl = url; // Store for error handling

    // Validate URL - check for various Amazon domains
    const amazonDomainRegex = /amazon\.(com|ca|co\.uk|de|fr|es|it|co\.jp|com\.au|com\.br|nl|in|com\.mx|cn|sg)/i;
    
    if (!url || !amazonDomainRegex.test(url)) {
      return NextResponse.json(
        { message: 'Invalid Amazon URL provided. Please enter a valid Amazon product URL.' },
        { status: 400 }
      );
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
    
    console.log(`Using language preference: ${languagePreference} for ${amazonDomain}`);

    // First try with a proxy
    console.log('Attempting to fetch with proxy...');
    const proxyUrl = getRandomProxy() + encodeURIComponent(url);
    console.log(`Using proxy: ${proxyUrl.split('?')[0]}...`);
    
    let response;
    try {
      // Try with proxy first
      response = await fetch(proxyUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        next: { revalidate: 0 }, // Disable caching
      });
      
      console.log(`Proxy response status: ${response.status}`);
    } catch (proxyError) {
      console.error('Proxy fetch failed, falling back to direct fetch:', proxyError);
      
      // Fall back to direct fetch if proxy fails
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': languagePreference,
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Ch-Ua': '"Chromium";v="120", "Google Chrome";v="120", "Not=A?Brand";v="99"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
        },
        next: { revalidate: 0 }, // Disable caching
      });
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: `Failed to fetch Amazon page: ${response.statusText}` },
        { status: response.status }
      );
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
    // These are the exact images shown in your screenshot
    // Skip the first thumbnail (index 0) since it's usually the same as the main image
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
    
    // Video selectors
    const videoSelectors = [
      // Common video selectors across Amazon domains
      '.videoThumb',
      '.videoBlockIngress',
      '.video-block',
      '.videoThumbnail',
      '.video-thumb-wrapper',
      '.video-slate',
      '.vse-video-container',
      'video',
      // Video icons in the image gallery
      'img[src*="video"]',
      '.a-button-text img[src*="play"]',
      '.a-button-inner:has(.a-icon-videocam)',
      '.a-icon-videocam',
      '.a-button-text:contains("Video")',
      '.videoCountText'
    ];
    
    // Simple video detection - just check if the word "video" appears in the page
    // This is separate from the image extraction
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
    // Use thumbnailCount for the image count to match what's shown in the UI
    return NextResponse.json({
      title,
      imageCount: thumbnailCount,
      imageUrls: limitedImageUrls,
      hasVideo,
      videoCount,
      bulletPoints,
      description,
      hasEnhancedContent,
      url,
    });
    
  } catch (error) {
    // Provide more detailed error information
    console.error('Error analyzing Amazon URL:', error);
    
    // Get more specific error details
    let errorMessage = 'Failed to analyze the Amazon URL';
    let errorDetails = '';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || '';
    }
    
    // Return detailed error for debugging
    return NextResponse.json(
      { 
        message: errorMessage,
        details: errorDetails,
        url: requestUrl || 'No URL provided',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
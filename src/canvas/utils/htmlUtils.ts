/**
 * Utility functions for handling HTML content in notes
 */

/**
 * Convert HTML content to plain text
 * @param html - HTML string to convert
 * @returns Plain text string
 */
export const htmlToPlainText = (html: string): string => {
  if (!html) return '';
  
  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Get text content (strips HTML tags)
  return tempDiv.textContent || tempDiv.innerText || '';
};

/**
 * Check if content contains HTML
 * @param content - Content to check
 * @returns True if content contains HTML tags
 */
export const containsHTML = (content: string): boolean => {
  if (!content) return false;
  return /<[^>]*>/g.test(content);
};

/**
 * Safely render HTML content
 * @param html - HTML string to render
 * @returns HTML string with potentially dangerous content removed
 */
export const sanitizeHTML = (html: string): string => {
  if (!html) return '';
  
  // Basic sanitization - remove script tags and other potentially dangerous elements
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

/**
 * Get a preview of HTML content (first few characters of plain text)
 * @param html - HTML string
 * @param maxLength - Maximum length of preview
 * @returns Plain text preview
 */
export const getHTMLPreview = (html: string, maxLength: number = 100): string => {
  const plainText = htmlToPlainText(html);
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + '...';
};

/**
 * Converts a string into a URL-friendly slug.
 *
 * This function lowercases the string, removes accents, replaces spaces
 * with hyphens, and removes all non-alphanumeric characters except hyphens.
 * It also cleans up any resulting multiple or trailing hyphens.
 *
 * @param {string} text - The input string to convert into a slug.
 * @returns {string} The resulting URL-friendly slug.
 */
export const slugify = (text: string): string => {
  return text.toString().toLowerCase()
    .normalize('NFD') // split an accented letter in the base letter and the accent
    .replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
    .replace(/\s+/g, '-') // replace spaces with -
    .replace(/[^\w-]+/g, '') // remove all non-word chars
    .replace(/--+/g, '-') // replace multiple - with single -
    .replace(/^-+/, '') // trim - from start of text
    .replace(/-+$/, ''); // trim - from end of text
};
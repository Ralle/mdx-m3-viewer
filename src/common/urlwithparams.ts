/**
 * Appends url parameters given in params to the url given in src.
 * 
 * The source url can have url parameters already in it.
 */
export default function urlWithParams(src: string, params: object) {
  if (params) {
    let entries = Object.entries(params);

    if (entries.length) {
      let encodedParams = entries.map(([key, value]) => `${key}=${value}`).join('&');
      let separator = '&';

      if (src.indexOf('?') === -1) {
        separator = '?';
      }

      return `${src}${separator}${encodedParams}`;
    }
  }

  return src;
}

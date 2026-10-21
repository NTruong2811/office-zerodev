export interface RemoteUrlConfig {
  url: string;
  isIframe: boolean;
}

export function normalizeUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  for (let i = 0; i < 4; i++) {
    if (
      url.includes('%3A') ||
      url.includes('%3a') ||
      url.includes('%2F') ||
      url.includes('%2f') ||
      url.includes('%25')
    ) {
      try {
        const decoded = decodeURIComponent(url);
        if (decoded === url) break;
        url = decoded;
      } catch {
        break;
      }
    } else {
      break;
    }
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (url.startsWith('//')) {
      url = window.location.protocol + url;
    } else {
      url = 'https://' + url;
    }
  }
  return url;
}

export function extractUrlFromLocation(): RemoteUrlConfig | null {
  const href = window.location.href;
  const pathname = window.location.pathname;
  const search = window.location.search;
  const hash = window.location.hash;

  let targetUrl = '';
  let isIframe = false;

  const patterns = [
    '/iframe-view=',
    'iframe-view=',
    '/iframe-view%3D',
    'iframe-view%3D',
    '/iframe-view/',
    'iframe-view/'
  ];
  for (const pat of patterns) {
    const idx = href.indexOf(pat);
    if (idx !== -1) {
      isIframe = true;
      targetUrl = href.substring(idx + pat.length);
      break;
    }
  }

  if (!targetUrl) {
    const searchParams = new URLSearchParams(search);
    const hashContent = hash.startsWith('#') ? hash.substring(1) : hash;
    const hashParams = new URLSearchParams(
      hashContent.includes('?') ? hashContent.substring(hashContent.indexOf('?') + 1) : hashContent
    );

    targetUrl =
      searchParams.get('url') ||
      searchParams.get('src') ||
      searchParams.get('file') ||
      hashParams.get('url') ||
      hashParams.get('src') ||
      hashParams.get('file') ||
      '';

    if (
      pathname.includes('iframe') ||
      pathname.includes('embed') ||
      searchParams.get('iframe') === '1' ||
      searchParams.get('embed') === '1' ||
      hashParams.get('iframe') === '1' ||
      hashParams.get('embed') === '1'
    ) {
      isIframe = true;
    }
  }

  try {
    if (window.self !== window.top) {
      isIframe = true;
    }
  } catch {
    isIframe = true;
  }

  if (!targetUrl) {
    return null;
  }

  const normalized = normalizeUrl(targetUrl);
  return { url: normalized, isIframe };
}

export function getFilenameFromUrl(url: string, contentType?: string): string {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const parts = pathname.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];

    if (lastPart && lastPart.includes('.')) {
      return decodeURIComponent(lastPart);
    }
  } catch {}

  const extFromType = getExtensionFromContentType(contentType || '');
  return `tailieu_online${extFromType}`;
}

export function getExtensionFromContentType(ct: string): string {
  const lower = ct.toLowerCase();
  if (lower.includes('spreadsheetml') || lower.includes('excel') || lower.includes('xlsx')) return '.xlsx';
  if (lower.includes('wordprocessingml') || lower.includes('docx')) return '.docx';
  if (lower.includes('msword')) return '.doc';
  if (lower.includes('csv')) return '.csv';
  return '.docx';
}

export async function fetchRemoteFile(url: string): Promise<File> {
  const cleanUrl = normalizeUrl(url);
  let response: Response | null = null;
  let lastError: Error | null = null;

  try {
    const localProxyUrl = `/api/proxy?url=${encodeURIComponent(cleanUrl)}`;
    const res = await fetch(localProxyUrl);
    if (res.ok) {
      response = res;
    }
  } catch (err) {
    lastError = err as Error;
  }

  if (!response) {
    try {
      const res = await fetch(cleanUrl, { mode: 'cors' });
      if (res.ok) {
        response = res;
      }
    } catch (err) {
      lastError = err as Error;
    }
  }

  if (!response) {
    try {
      const proxyUrl1 = `https://corsproxy.io/?url=${encodeURIComponent(cleanUrl)}`;
      const res = await fetch(proxyUrl1);
      if (res.ok) {
        response = res;
      }
    } catch (err) {
      lastError = err as Error;
    }
  }

  if (!response) {
    try {
      const proxyUrl2 = `https://api.allorigins.win/raw?url=${encodeURIComponent(cleanUrl)}`;
      const res = await fetch(proxyUrl2);
      if (res.ok) {
        response = res;
      }
    } catch (err) {
      lastError = err as Error;
    }
  }

  if (!response) {
    throw lastError || new Error('Không thể tải tệp tin từ đường dẫn được cung cấp');
  }

  const blob = await response.blob();
  const contentType = response.headers.get('content-type') || blob.type || '';
  const filename = getFilenameFromUrl(cleanUrl, contentType);

  return new File([blob], filename, { type: blob.type || contentType });
}

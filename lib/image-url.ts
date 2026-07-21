const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

export function resolveImageUrl(
  path: string | null | undefined,
): string | null {
  if (!path) return null;
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) return path;

  return `${BASE_API}${path}`;
}

// VehicleResponse.imageUrls only carries "/api/common/images/vehicle/{filename}" —
// the filename itself (needed for update/delete payloads) is the last path segment.
export function filenameFromImageUrl(url: string): string {
  const withoutQuery = url.split(/[?#]/)[0];
  const segment = withoutQuery.split("/").pop();

  return segment ? segment : url;
}

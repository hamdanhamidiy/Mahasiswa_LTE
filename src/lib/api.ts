/**
 * Fetch data from the server-side API route.
 * This bypasses RLS by going through the service_role key on the server.
 */
export async function fetchData<T = any>(type: string): Promise<T | null> {
  try {
    const res = await fetch(`/api/data?type=${type}`, { credentials: 'include' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

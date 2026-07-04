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

/**
 * Create a new record via POST /api/data
 */
export async function createData<T = any>(type: string, data: Record<string, any>): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ type, data }),
    });
    const result = await res.json();
    if (!res.ok) return { data: null, error: result.error || 'Failed to create' };
    return { data: result, error: null };
  } catch (e: any) {
    return { data: null, error: e.message || 'Network error' };
  }
}

/**
 * Update a record via PUT /api/data
 */
export async function updateData<T = any>(type: string, id: string, data: Record<string, any>): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch('/api/data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ type, id, data }),
    });
    const result = await res.json();
    if (!res.ok) return { data: null, error: result.error || 'Failed to update' };
    return { data: result, error: null };
  } catch (e: any) {
    return { data: null, error: e.message || 'Network error' };
  }
}

/**
 * Delete a record via DELETE /api/data
 */
export async function deleteData(type: string, id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const res = await fetch('/api/data', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ type, id }),
    });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || 'Failed to delete' };
    return { success: true, error: null };
  } catch (e: any) {
    return { success: false, error: e.message || 'Network error' };
  }
}

export async function fetchOIDCDiscovery() {
  try {
    const response = await fetch(process.env.OIDC_DISCOVERY_URL!);
    if (!response.ok) {
      throw new Error('Failed to fetch OIDC discovery document');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching OIDC discovery document:', error);
    throw error;
  }
}

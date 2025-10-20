import { Form, Vibhaaga } from '../app/types/types'

export const fetchFormBySlug = async (slug: string): Promise<Form> => {
  const response = await fetch(`/api/forms/${slug}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to load form (Status: ${response.status})`);
  }
  const data = await response.json();
  
  return data;
};

export const fetchOrganizationData = async (): Promise<Vibhaaga[]> => {
  try {
    console.log('Fetching organization data from /api/organization...');
    const response = await fetch('/api/organization');
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Organization API error:', response.status, errorText);
      throw new Error(`Failed to fetch organization data: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Organization API response:', data);
    
    // Handle different response structures
    if (data.organizations && Array.isArray(data.organizations)) {
      console.log('Found organizations array with', data.organizations.length, 'items');
      return data.organizations;
    } else if (data.success && data.organizations) {
      console.log('Found success response with organizations:', data.organizations.length);
      return data.organizations;
    } else if (Array.isArray(data)) {
      console.log('Direct array response with', data.length, 'items');
      return data;
    } else {
      console.warn('Unexpected organization data structure:', data);
      return [];
    }
  } catch (error) {
    console.error('Organization fetch error:', error);
    throw new Error('Failed to load Sangha hierarchy data');
  }
};
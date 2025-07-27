import { User, TEC, PAC } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://821f1e79957c.ngrok-free.app/api';

interface ApiError {
  message: string;
  status: number;
}

class ApiService {
  private getAuthHeaders(accessToken: string): HeadersInit {
    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
  }

  private getPublicHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      // Log the actual response for debugging
      const responseText = await response.text();
      console.error(`API Error ${response.status}:`, responseText);
      
      const error: ApiError = {
        message: response.statusText || 'An error occurred',
        status: response.status,
      };
      
      if (response.status === 401) {
        // Token expired or invalid - should trigger re-authentication
        throw new Error('UNAUTHORIZED');
      }
      
      throw error;
    }
    
    // Also log successful responses for debugging
    const responseText = await response.text();
    console.log('API Response:', responseText);
    
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw response:', responseText);
      throw new Error('Invalid JSON response from server');
    }
  }

  // User endpoints
  async getCurrentUser(accessToken: string): Promise<User> {
    const url = `${API_BASE_URL}/users/me`;
    const headers = this.getAuthHeaders(accessToken);
    
    console.log('Making API request to:', url);
    console.log('With headers:', headers);
    console.log('Access token:', accessToken.substring(0, 20) + '...');
    
    const response = await fetch(url, {
      headers: headers,
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    return this.handleResponse<User>(response);
  }

  async createUserProfile(accessToken: string, profile: {
    username: string;
    email: string;
  }): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'POST',
      headers: this.getAuthHeaders(accessToken),
      body: JSON.stringify(profile),
    });
    
    return this.handleResponse<User>(response);
  }

  // TEC (snippet) endpoints
  async getAllTecs(accessToken?: string): Promise<TEC[]> {
    const headers = accessToken ? this.getAuthHeaders(accessToken) : this.getPublicHeaders();
    const response = await fetch(`${API_BASE_URL}/tecs`, { headers });
    
    return this.handleResponse<TEC[]>(response);
  }

  async getTecById(id: string, accessToken?: string): Promise<TEC> {
    const headers = accessToken ? this.getAuthHeaders(accessToken) : this.getPublicHeaders();
    const response = await fetch(`${API_BASE_URL}/tecs/${id}`, { headers });
    
    return this.handleResponse<TEC>(response);
  }

  async createTec(accessToken: string, tec: {
    title: string;
    description: string;
    language: string;
    content: string;
    tags: string[];
  }): Promise<TEC> {
    const response = await fetch(`${API_BASE_URL}/tecs`, {
      method: 'POST',
      headers: this.getAuthHeaders(accessToken),
      body: JSON.stringify(tec),
    });
    
    return this.handleResponse<TEC>(response);
  }

  async updateTec(accessToken: string, id: string, tec: {
    title: string;
    description: string;
    language: string;
    content: string;
    tags: string[];
  }): Promise<TEC> {
    const response = await fetch(`${API_BASE_URL}/tecs/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(accessToken),
      body: JSON.stringify(tec),
    });
    
    return this.handleResponse<TEC>(response);
  }

  async deleteTec(accessToken: string, id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tecs/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(accessToken),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete TEC: ${response.statusText}`);
    }
  }

  // User-specific TEC/PAC endpoints
  async getUserTecs(userId: string): Promise<{ user: User; tecs: TEC[] }> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/tecs`, {
      headers: this.getPublicHeaders(),
    });
    
    return this.handleResponse<{ user: User; tecs: TEC[] }>(response);
  }

  async getUserPacs(userId: string): Promise<{ user: User; pacs: PAC[] }> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/pacs`, {
      headers: this.getPublicHeaders(),
    });
    
    return this.handleResponse<{ user: User; pacs: PAC[] }>(response);
  }

  // PAC endpoints
  async getAllPacs(accessToken?: string): Promise<PAC[]> {
    const headers = accessToken ? this.getAuthHeaders(accessToken) : this.getPublicHeaders();
    const response = await fetch(`${API_BASE_URL}/pacs`, { headers });
    
    return this.handleResponse<PAC[]>(response);
  }

  async getPacById(id: string, accessToken?: string): Promise<PAC> {
    const headers = accessToken ? this.getAuthHeaders(accessToken) : this.getPublicHeaders();
    const response = await fetch(`${API_BASE_URL}/pacs/${id}`, { headers });
    
    return this.handleResponse<PAC>(response);
  }

  async createPac(accessToken: string, pac: {
    name: string;
    description: string;
    dependencies: string[];
    files: string[];
  }): Promise<PAC> {
    const response = await fetch(`${API_BASE_URL}/pacs`, {
      method: 'POST',
      headers: this.getAuthHeaders(accessToken),
      body: JSON.stringify(pac),
    });
    
    return this.handleResponse<PAC>(response);
  }

  async updatePac(accessToken: string, id: string, pac: {
    name: string;
    description: string;
    dependencies: string[];
    files: string[];
  }): Promise<PAC> {
    const response = await fetch(`${API_BASE_URL}/pacs/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(accessToken),
      body: JSON.stringify(pac),
    });
    
    return this.handleResponse<PAC>(response);
  }

  async deletePac(accessToken: string, id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/pacs/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(accessToken),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete PAC: ${response.statusText}`);
    }
  }
}

export const apiService = new ApiService();
export type { ApiError };
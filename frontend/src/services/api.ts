import { User, TEC, PAC } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

interface ApiError {
  message: string;
  status: number;
}

class ApiService {
  private getAuthHeaders(accessToken: string): HeadersInit {
    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
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
    
    return response.json();
  }

  // User endpoints
  async getCurrentUser(accessToken: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: this.getAuthHeaders(accessToken),
    });
    
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
    const headers = accessToken ? this.getAuthHeaders(accessToken) : {};
    const response = await fetch(`${API_BASE_URL}/tecs`, { headers });
    
    return this.handleResponse<TEC[]>(response);
  }

  async getTecById(id: string, accessToken?: string): Promise<TEC> {
    const headers = accessToken ? this.getAuthHeaders(accessToken) : {};
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
      method: 'PUT',
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

  // PAC endpoints
  async getAllPacs(accessToken?: string): Promise<PAC[]> {
    const headers = accessToken ? this.getAuthHeaders(accessToken) : {};
    const response = await fetch(`${API_BASE_URL}/pacs`, { headers });
    
    return this.handleResponse<PAC[]>(response);
  }

  async getPacById(id: string, accessToken?: string): Promise<PAC> {
    const headers = accessToken ? this.getAuthHeaders(accessToken) : {};
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
}

export const apiService = new ApiService();
export type { ApiError };
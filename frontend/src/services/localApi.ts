import { IRegister } from '../types_interfaces';

const API_BASE_URL = 'http://localhost:5000/api';

// primary API request function
const apiRequest = async (endpoint: string, content = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...content,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// auth specific api functions
export const userAuthApi = {
    register: (userData: IRegister): Promise<{message: string, user: IRegister}> => 
        apiRequest('/users/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        }
    ),

    login: (loginInfo : {email: string, password: string}) : Promise<{message: string, token: string, user: IRegister}> => 
        apiRequest('/users/login', {
            method: `POST`,
            body: JSON.stringify(loginInfo)
        })
};

// user specific api functions
export const userApi = {
  getAll: (): Promise<IRegister[]> => apiRequest('/users'),
};
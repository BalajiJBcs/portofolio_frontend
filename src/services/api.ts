import axios from 'axios';

const BASE_URL = 'http://localhost:5000'; 

export const fetchBalanceSheet = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/balance-sheet`);
    return response.data;
  } catch (error) {
    console.error('Error fetching balance sheet data:', error);
    throw new Error('Failed to fetch balance sheet data');
  }
};

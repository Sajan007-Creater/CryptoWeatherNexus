import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  price?: number;
  change24h?: number;
  marketCap?: number;
  volume24h?: number;
  image?: string;
}

// New interface for real-time price updates
interface RealTimePriceUpdate {
  id: string;
  price: number;
}

interface CryptoState {
  cryptocurrencies: CryptoData[];
  selectedCrypto: CryptoData | null;
  loading: boolean;
  error: string | null;
}

const initialState: CryptoState = {
  cryptocurrencies: [],
  selectedCrypto: null,
  loading: false,
  error: null
};

export const fetchCryptoData = createAsyncThunk(
  'crypto/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      // This would typically be an API call
      // For now, we'll simulate a fetch response with mock data
      const response = await new Promise<CryptoData[]>((resolve) => {
        setTimeout(() => {
          resolve([
            {
              id: 'bitcoin',
              name: 'Bitcoin',
              symbol: 'BTC',
              price: 49000 + Math.random() * 1000,
              change24h: Math.random() * 10 - 5,
              marketCap: 900000000000,
              volume24h: 40000000000,
              image: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'
            },
            {
              id: 'ethereum',
              name: 'Ethereum',
              symbol: 'ETH',
              price: 2200 + Math.random() * 100,
              change24h: Math.random() * 10 - 5,
              marketCap: 260000000000,
              volume24h: 20000000000,
              image: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
            },
            {
              id: 'cardano',
              name: 'Cardano',
              symbol: 'ADA',
              price: 1 + Math.random() * 0.2,
              change24h: Math.random() * 10 - 5,
              marketCap: 33000000000,
              volume24h: 1500000000,
              image: 'https://cryptologos.cc/logos/cardano-ada-logo.png'
            }
          ]);
        }, 500);
      });
      
      return response;
    } catch (error) {
      return rejectWithValue('Failed to fetch cryptocurrency data');
    }
  }
);

export const fetchCryptoDetails = createAsyncThunk(
  'crypto/fetchDetails',
  async (cryptoId: string, { rejectWithValue }) => {
    try {
      // This would typically be an API call for detailed info
      const response = await new Promise<CryptoData>((resolve) => {
        setTimeout(() => {
          const mockCrypto = {
            id: cryptoId,
            name: cryptoId.charAt(0).toUpperCase() + cryptoId.slice(1),
            symbol: cryptoId.substring(0, 3).toUpperCase(),
            price: cryptoId === 'bitcoin' ? 49000 + Math.random() * 1000 : 
                  cryptoId === 'ethereum' ? 2200 + Math.random() * 100 : 
                  1 + Math.random() * 0.2,
            change24h: Math.random() * 10 - 5,
            marketCap: cryptoId === 'bitcoin' ? 900000000000 : 
                      cryptoId === 'ethereum' ? 260000000000 : 
                      33000000000,
            volume24h: cryptoId === 'bitcoin' ? 40000000000 : 
                      cryptoId === 'ethereum' ? 20000000000 : 
                      1500000000,
            image: `https://cryptologos.cc/logos/${cryptoId}-${cryptoId.substring(0, 3)}-logo.png`
          };
          resolve(mockCrypto);
        }, 500);
      });
      
      return response;
    } catch (error) {
      return rejectWithValue('Failed to fetch cryptocurrency details');
    }
  }
);

const cryptoSlice = createSlice({
  name: 'crypto',
  initialState,
  reducers: {
    selectCrypto: (state, action: PayloadAction<CryptoData>) => {
      state.selectedCrypto = action.payload;
    },
    clearCryptoError: (state) => {
      state.error = null;
    },
    // Add new reducer for WebSocket real-time price updates
    updateCryptoPriceInRealtime: (state, action: PayloadAction<RealTimePriceUpdate>) => {
      const { id, price } = action.payload;
      
      // Update price in the cryptocurrencies list
      const cryptoIndex = state.cryptocurrencies.findIndex(crypto => crypto.id === id);
      if (cryptoIndex !== -1) {
        // Calculate change based on previous price if available
        const prevPrice = state.cryptocurrencies[cryptoIndex].price;
        if (prevPrice) {
          const priceChange = ((price - prevPrice) / prevPrice) * 100;
          state.cryptocurrencies[cryptoIndex].change24h = priceChange;
        }
        
        // Update the price
        state.cryptocurrencies[cryptoIndex].price = price;
      }
      
      // Update selected crypto if it matches the id
      if (state.selectedCrypto && state.selectedCrypto.id === id) {
        // Calculate change based on previous price if available
        const prevPrice = state.selectedCrypto.price;
        if (prevPrice) {
          const priceChange = ((price - prevPrice) / prevPrice) * 100;
          state.selectedCrypto.change24h = priceChange;
        }
        
        // Update the price
        state.selectedCrypto.price = price;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all cryptocurrencies
      .addCase(fetchCryptoData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCryptoData.fulfilled, (state, action) => {
        state.loading = false;
        state.cryptocurrencies = action.payload;
      })
      .addCase(fetchCryptoData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch cryptocurrency data';
      })
      
      // Fetch single cryptocurrency details
      .addCase(fetchCryptoDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCryptoDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCrypto = action.payload;
      })
      .addCase(fetchCryptoDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch cryptocurrency details';
      });
  }
});

export const { selectCrypto, clearCryptoError, updateCryptoPriceInRealtime } = cryptoSlice.actions;
export default cryptoSlice.reducer; 
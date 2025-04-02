import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content?: string;
  source: string;
  category: string;
  publishedAt: string;
  url?: string;
  imageUrl?: string;
}

interface NewsState {
  articles: NewsArticle[];
  selectedArticle: NewsArticle | null;
  categories: string[];
  loading: boolean;
  error: string | null;
}

const initialState: NewsState = {
  articles: [],
  selectedArticle: null,
  categories: ['General', 'Technology', 'Business', 'Science', 'Health', 'Sports', 'Entertainment'],
  loading: false,
  error: null
};

export const fetchNewsArticles = createAsyncThunk(
  'news/fetchArticles',
  async (category: string = 'General', { rejectWithValue }) => {
    try {
      // This would typically be an API call
      // For now, we'll simulate a fetch response with mock data
      const response = await new Promise<NewsArticle[]>((resolve) => {
        setTimeout(() => {
          const mockArticles = [
            {
              id: Math.random().toString(36).substring(2, 15),
              title: `${category} News: Latest Updates Today`,
              description: 'Breaking news and the latest updates on global events.',
              content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisi vel consectetur interdum.',
              source: 'News Source',
              category,
              publishedAt: new Date().toISOString(),
              url: 'https://example.com/news/article1',
              imageUrl: 'https://placehold.co/600x400'
            },
            {
              id: Math.random().toString(36).substring(2, 15),
              title: `${category} Trends: What's Happening Now`,
              description: 'Current trends and developments in the world today.',
              content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisi vel consectetur interdum.',
              source: 'Trend Reporter',
              category,
              publishedAt: new Date(Date.now() - 3600000).toISOString(),
              url: 'https://example.com/news/article2',
              imageUrl: 'https://placehold.co/600x400'
            },
            {
              id: Math.random().toString(36).substring(2, 15),
              title: `${category} Insights: Analysis and Commentary`,
              description: 'Expert analysis and commentary on recent events.',
              content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisi vel consectetur interdum.',
              source: 'Insight Times',
              category,
              publishedAt: new Date(Date.now() - 7200000).toISOString(),
              url: 'https://example.com/news/article3',
              imageUrl: 'https://placehold.co/600x400'
            }
          ];
          resolve(mockArticles);
        }, 500);
      });
      
      return response;
    } catch (error) {
      return rejectWithValue('Failed to fetch news articles');
    }
  }
);

export const fetchArticleDetails = createAsyncThunk(
  'news/fetchArticleDetails',
  async (articleId: string, { rejectWithValue, getState }) => {
    try {
      // This would typically be an API call for detailed article info
      // For now, we'll simulate a fetch response based on existing state
      const response = await new Promise<NewsArticle>((resolve) => {
        setTimeout(() => {
          // In a real implementation, we would fetch this from an API
          // For now, generate a mock article
          const mockArticle = {
            id: articleId,
            title: 'Detailed Article Title',
            description: 'Comprehensive description of the news article.',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisi vel consectetur interdum, nisl nulla ultricies nisl, eget egestas nisl nisl vel nisl. Nullam euismod, nisi vel consectetur interdum, nisl nulla ultricies nisl, eget egestas nisl nisl vel nisl.',
            source: 'Detailed News Source',
            category: 'General',
            publishedAt: new Date().toISOString(),
            url: `https://example.com/news/article/${articleId}`,
            imageUrl: 'https://placehold.co/800x600'
          };
          resolve(mockArticle);
        }, 500);
      });
      
      return response;
    } catch (error) {
      return rejectWithValue('Failed to fetch article details');
    }
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    selectArticle: (state, action: PayloadAction<NewsArticle>) => {
      state.selectedArticle = action.payload;
    },
    clearNewsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all news articles
      .addCase(fetchNewsArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewsArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload;
      })
      .addCase(fetchNewsArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch news articles';
      })
      
      // Fetch article details
      .addCase(fetchArticleDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticleDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedArticle = action.payload;
      })
      .addCase(fetchArticleDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch article details';
      });
  }
});

export const { selectArticle, clearNewsError } = newsSlice.actions;
export default newsSlice.reducer; 
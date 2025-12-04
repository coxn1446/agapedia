import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Async thunks for API calls
export const fetchArticles = createAsyncThunk(
  'article/fetchArticles',
  async ({ from, limit } = {}) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (limit) params.append('limit', limit);
    
    const queryString = params.toString();
    const response = await api.get(`/articles${queryString ? `?${queryString}` : ''}`);
    return response.articles;
  }
);

export const searchArticles = createAsyncThunk(
  'article/searchArticles',
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get(`/articles/search?q=${encodeURIComponent(query)}`);
      return { articles: response.articles, query };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchArticle = createAsyncThunk(
  'article/fetchArticle',
  async (title, { rejectWithValue }) => {
    try {
      const response = await api.get(`/articles/${encodeURIComponent(title)}`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchParsedArticle = createAsyncThunk(
  'article/fetchParsedArticle',
  async (title, { rejectWithValue }) => {
    try {
      const response = await api.get(`/articles/${encodeURIComponent(title)}/parse`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRevisions = createAsyncThunk(
  'article/fetchRevisions',
  async ({ title, limit }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit);
      
      const queryString = params.toString();
      const response = await api.get(`/articles/${encodeURIComponent(title)}/revisions${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createArticle = createAsyncThunk(
  'article/createArticle',
  async ({ title, content, summary }, { rejectWithValue }) => {
    try {
      const response = await api.post('/articles', { title, content, summary });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateArticle = createAsyncThunk(
  'article/updateArticle',
  async ({ title, content, summary }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/articles/${encodeURIComponent(title)}`, { content, summary });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const deleteArticle = createAsyncThunk(
  'article/deleteArticle',
  async ({ title, reason }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/articles/${encodeURIComponent(title)}`, { data: { reason } });
      return { title, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const initialState = {
  articles: [],
  currentArticle: null,
  parsedArticle: null,
  revisions: [],
  searchResults: [],
  searchQuery: '',
  loading: false,
  error: null,
};

const articleSlice = createSlice({
  name: 'article',
  initialState,
  reducers: {
    clearCurrentArticle: (state) => {
      state.currentArticle = null;
      state.parsedArticle = null;
      state.revisions = [];
    },
    clearSearch: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch articles
      .addCase(fetchArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload;
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Search articles
      .addCase(searchArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.articles;
        state.searchQuery = action.payload.query;
      })
      .addCase(searchArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch article
      .addCase(fetchArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.currentArticle = action.payload;
      })
      .addCase(fetchArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch parsed article
      .addCase(fetchParsedArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParsedArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.parsedArticle = action.payload;
      })
      .addCase(fetchParsedArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch revisions
      .addCase(fetchRevisions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRevisions.fulfilled, (state, action) => {
        state.loading = false;
        state.revisions = action.payload.revisions;
      })
      .addCase(fetchRevisions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create article
      .addCase(createArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createArticle.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally add to articles list
      })
      .addCase(createArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update article
      .addCase(updateArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateArticle.fulfilled, (state, action) => {
        state.loading = false;
        // Update current article if it's the one being edited
        if (state.currentArticle && state.currentArticle.title === action.payload.title) {
          state.currentArticle = { ...state.currentArticle, ...action.payload };
        }
      })
      .addCase(updateArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete article
      .addCase(deleteArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from articles list
        state.articles = state.articles.filter(article => article.title !== action.payload.title);
        if (state.currentArticle && state.currentArticle.title === action.payload.title) {
          state.currentArticle = null;
        }
      })
      .addCase(deleteArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentArticle, clearSearch, clearError } = articleSlice.actions;
export default articleSlice.reducer;


import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth.reducer';
import globalReducer from './global.reducer';
import articleReducer from './article.reducer';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    global: globalReducer,
    article: articleReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});


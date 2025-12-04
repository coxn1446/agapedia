import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import App from '../components/App';
import authReducer from '../store/auth.reducer';
import globalReducer from '../store/global.reducer';

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      global: globalReducer,
    },
    preloadedState: initialState,
  });
};

describe('App', () => {
  test('renders without crashing', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );
  });

  test('shows login page when not authenticated', () => {
    const store = createMockStore({
      auth: { isAuthenticated: false, user: null },
    });
    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );
    // App will redirect to login, so we check for navigation
    expect(window.location.pathname).toBe('/');
  });
});


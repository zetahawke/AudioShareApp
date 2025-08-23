import React, { createContext, useContext, useReducer } from 'react';
const AuthContext = createContext(undefined);
const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_START':
            return Object.assign(Object.assign({}, state), { isLoading: true, error: null });
        case 'LOGIN_SUCCESS':
            return Object.assign(Object.assign({}, state), { isLoading: false, user: action.payload, isAuthenticated: true, error: null });
        case 'LOGIN_FAILURE':
            return Object.assign(Object.assign({}, state), { isLoading: false, error: action.payload });
        case 'REGISTER_START':
            return Object.assign(Object.assign({}, state), { isLoading: true, error: null });
        case 'REGISTER_SUCCESS':
            return Object.assign(Object.assign({}, state), { isLoading: false, user: action.payload, isAuthenticated: true, error: null });
        case 'REGISTER_FAILURE':
            return Object.assign(Object.assign({}, state), { isLoading: false, error: action.payload });
        case 'LOGOUT':
            return Object.assign(Object.assign({}, state), { user: null, isAuthenticated: false });
        case 'CLEAR_ERROR':
            return Object.assign(Object.assign({}, state), { error: null });
        default:
            return state;
    }
};
const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const login = async (email, password) => {
        try {
            dispatch({ type: 'LOGIN_START' });
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Mock user data - replace with actual API call
            const mockUser = {
                id: '1',
                email,
                username: email.split('@')[0],
                firstName: 'John',
                lastName: 'Doe',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser });
        }
        catch (error) {
            dispatch({ type: 'LOGIN_FAILURE', payload: 'Login failed. Please try again.' });
        }
    };
    const register = async (userData) => {
        try {
            dispatch({ type: 'REGISTER_START' });
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Mock user data - replace with actual API call
            const newUser = Object.assign(Object.assign({}, userData), { id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() });
            dispatch({ type: 'REGISTER_SUCCESS', payload: newUser });
        }
        catch (error) {
            dispatch({ type: 'REGISTER_FAILURE', payload: 'Registration failed. Please try again.' });
        }
    };
    const logout = () => {
        dispatch({ type: 'LOGOUT' });
    };
    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };
    const value = Object.assign(Object.assign({}, state), { login,
        register,
        logout,
        clearError });
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

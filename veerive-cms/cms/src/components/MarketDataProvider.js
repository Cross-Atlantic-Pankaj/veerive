import React, { useReducer, useEffect } from 'react';
import axios from '../config/axios';
import MarketDataContext from '../context/MarketDataContext';

const marketDataReducer = (state, action) => {
    switch (action.type) {
        case 'SET_MARKET_DATA':
            return { ...state, data: action.payload };
        case 'ADD_MARKET_DATA':
            return { ...state, data: [action.payload, ...state.data] };
        case 'UPDATE_MARKET_DATA':
            return {
                ...state,
                data: state.data.map((item) =>
                    item._id === action.payload._id ? action.payload : item
                )
            };
        case 'REMOVE_MARKET_DATA':
            return { ...state, data: state.data.filter((item) => item._id !== action.payload) };
        default:
            return state;
    }
};

export const MarketDataProvider = ({ children }) => {
    const [marketData, marketDataDispatch] = useReducer(marketDataReducer, { data: [] });

    // ✅ DISABLED AUTO-LOADING - Only load when MarketData page is accessed
    // useEffect(() => {
    //     fetchAllMarketData();
    // }, []);

    const fetchAllMarketData = async () => {
        const token = sessionStorage.getItem("token");

        if (!token) {
            console.error("❌ No token found, user might be logged out.");
            return;
        }

        try {
            const response = await axios.get('/api/admin/market-data/all', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.marketData) {
                marketDataDispatch({ type: 'SET_MARKET_DATA', payload: response.data.marketData });
            }
        } catch (err) {
            console.error("❌ Error fetching market data:", err);
            marketDataDispatch({ type: 'SET_MARKET_DATA', payload: [] }); // Fallback to empty array
        }
    };

    return (
        <MarketDataContext.Provider value={{
            marketData,
            marketDataDispatch,
            fetchAllMarketData
        }}>
            {children}
        </MarketDataContext.Provider>
    );
}; 
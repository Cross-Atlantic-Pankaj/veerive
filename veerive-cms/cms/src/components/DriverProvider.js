import React, { createContext, useContext, useReducer, useState, useEffect } from 'react';
import axios from '../config/axios';
import DriverContext from '../context/DriverContext';

const DriverProvider = ({ children }) => {
    const [drivers, driversDispatch] = useReducer(driverReducer, {
        data: [],
        editId: null,
        totalPages: 1,
        currentPage: 1,
        allDrivers: []
    });

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    function driverReducer(state, action) {
        switch (action.type) {
            case 'SET_DRIVERS':
                return { ...state, data: action.payload };
            case 'SET_ALL_DRIVERS':
                return { ...state, allDrivers: action.payload };
            case 'SET_EDIT_ID':
                return { ...state, editId: action.payload };
            case 'SET_TOTAL_PAGES':
                return { ...state, totalPages: action.payload };
            case 'SET_CURRENT_PAGE':
                return { ...state, currentPage: action.payload };
            default:
                return state;
        }
    }

    const fetchDrivers = async (page = 1, limit = 10) => {
        try {
            const response = await axios.get(`/api/admin/drivers?page=${page}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            if (response.data.success) {
                driversDispatch({ type: 'SET_DRIVERS', payload: response.data.data });
                driversDispatch({ type: 'SET_TOTAL_PAGES', payload: response.data.totalPages || 1 });
                driversDispatch({ type: 'SET_CURRENT_PAGE', payload: page });
            }
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };

    const fetchAllDrivers = async () => {
        try {
            const response = await axios.get('/api/admin/drivers', {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            if (response.data.success) {
                driversDispatch({ type: 'SET_ALL_DRIVERS', payload: response.data.data });
            }
        } catch (error) {
            console.error('Error fetching all drivers:', error);
        }
    };

    const fetchDriversPageData = async () => {
        await Promise.all([
            fetchDrivers(currentPage),
            fetchAllDrivers()
        ]);
    };

    const handleAddClick = () => {
        driversDispatch({ type: 'SET_EDIT_ID', payload: null });
        setIsFormVisible(true);
    };

    const handleEditClick = (id) => {
        driversDispatch({ type: 'SET_EDIT_ID', payload: id });
        setIsFormVisible(true);
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (drivers.editId) {
                // Update existing driver
                const response = await axios.put(`/api/admin/drivers/${drivers.editId}`, formData, {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                });
                if (response.data.success) {
                    await fetchDriversPageData();
                    setIsFormVisible(false);
                }
            } else {
                // Create new driver
                const response = await axios.post('/api/admin/drivers', formData, {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                });
                if (response.data.success) {
                    await fetchDriversPageData();
                    setIsFormVisible(false);
                }
            }
        } catch (error) {
            console.error('Error submitting driver form:', error);
            throw error;
        }
    };

    const contextValue = {
        drivers,
        driversDispatch,
        fetchDrivers,
        fetchAllDrivers,
        fetchDriversPageData,
        isFormVisible,
        setIsFormVisible,
        handleAddClick,
        handleEditClick,
        handleFormSubmit,
        currentPage,
        setCurrentPage
    };

    return (
        <DriverContext.Provider value={contextValue}>
            {children}
        </DriverContext.Provider>
    );
};

export { DriverProvider };

import React, { createContext, useContext, useReducer, useState, useEffect } from 'react';
import axios from '../config/axios';
import ImageContext from '../context/ImageContext';

const ImageProvider = ({ children }) => {
    const [images, imagesDispatch] = useReducer(imageReducer, {
        data: [],
        editId: null,
        totalPages: 1,
        currentPage: 1,
        allImages: []
    });

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    function imageReducer(state, action) {
        switch (action.type) {
            case 'SET_IMAGES':
                return { ...state, data: action.payload };
            case 'SET_ALL_IMAGES':
                return { ...state, allImages: action.payload };
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

    const fetchImages = async (page = 1, limit = 10) => {
        try {
            const response = await axios.get(`/api/admin/images?page=${page}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            if (response.data.success) {
                imagesDispatch({ type: 'SET_IMAGES', payload: response.data.data });
                imagesDispatch({ type: 'SET_TOTAL_PAGES', payload: response.data.totalPages || 1 });
                imagesDispatch({ type: 'SET_CURRENT_PAGE', payload: page });
            }
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    const fetchAllImages = async () => {
        try {
            const response = await axios.get('/api/admin/images', {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            if (response.data.success) {
                imagesDispatch({ type: 'SET_ALL_IMAGES', payload: response.data.data });
            }
        } catch (error) {
            console.error('Error fetching all images:', error);
        }
    };

    const fetchImagesPageData = async () => {
        await Promise.all([
            fetchImages(currentPage),
            fetchAllImages()
        ]);
    };

    const handleAddClick = () => {
        imagesDispatch({ type: 'SET_EDIT_ID', payload: null });
        setIsFormVisible(true);
    };

    const handleEditClick = (id) => {
        imagesDispatch({ type: 'SET_EDIT_ID', payload: id });
        setIsFormVisible(true);
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (images.editId) {
                // Update existing image
                const response = await axios.put(`/api/admin/images/${images.editId}`, formData, {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                });
                if (response.data.success) {
                    await fetchImagesPageData();
                    setIsFormVisible(false);
                }
            } else {
                // Create new image
                const response = await axios.post('/api/admin/images', formData, {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                });
                if (response.data.success) {
                    await fetchImagesPageData();
                    setIsFormVisible(false);
                }
            }
        } catch (error) {
            console.error('Error submitting image form:', error);
            throw error;
        }
    };

    const contextValue = {
        images,
        imagesDispatch,
        fetchImages,
        fetchAllImages,
        fetchImagesPageData,
        isFormVisible,
        setIsFormVisible,
        handleAddClick,
        handleEditClick,
        handleFormSubmit,
        currentPage,
        setCurrentPage
    };

    return (
        <ImageContext.Provider value={contextValue}>
            {children}
        </ImageContext.Provider>
    );
};

export { ImageProvider };

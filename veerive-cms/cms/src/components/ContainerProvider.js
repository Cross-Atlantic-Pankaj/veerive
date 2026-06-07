import React, { useReducer, useState, useEffect, useContext } from 'react';
import axios from '../config/axios';
import ContainerContext from '../context/ContainerContext';
import ContextContext from '../context/ContextContext';
import CountryContext from '../context/CountryContext';
import SourceContext from '../context/SourceContext';
import CompanyContext from '../context/CompanyContext';

const containerReducer = (state, action) => {
    switch (action.type) {
        case 'SET_CONTAINERS':
            return { ...state, data: action.payload };
        case 'ADD_CONTAINER':
            return { ...state, data: [...state.data, action.payload] };
        case 'REMOVE_CONTAINER':
            return { ...state, data: state.data.filter(ele => ele._id !== action.payload) };
        case 'SET_EDIT_ID':
            return { ...state, editId: action.payload };
        case 'UPDATE_CONTAINER':
            return {
                ...state,
                editId: null,
                data: state.data.map((ele) =>
                    ele._id === action.payload._id ? { ...action.payload } : ele
                ),
            };
        default:
            return state;
    }
};

export const ContainerProvider = ({ children }) => {
    const [containers, containersDispatch] = useReducer(containerReducer, { data: [], editId: null });
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [postsForContext, setPostsForContext] = useState([]);
    const [selectedContextId, setSelectedContextId] = useState('');

    const { contexts } = useContext(ContextContext);
    const { countries } = useContext(CountryContext);
    const { companies } = useContext(CompanyContext);
    const { sources } = useContext(SourceContext);

    // ✅ DISABLED - Only load when Container page is accessed
    // useEffect(() => {
    //     (async () => {
    //         try {
    //             const response = await axios.get('/api/posts', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }});
    //             containersDispatch({ type: 'SET_CONTAINERS', payload: response.data });
    //         } catch (err) {
    //             console.error('Error fetching containers:', err);
    //         }
    //     })();
    // }, []);

    const handleAddContainer = async (container) => {
        try {
            const response = await axios.post('/api/posts', container, { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}`} });
            containersDispatch({ type: 'ADD_CONTAINER', payload: response.data });
            setSuccessMessage('Container added successfully!');
            setIsFormVisible(false);
        } catch (err) {
            console.error('Error adding container:', err);
        }
    };

    const handleRemoveContainer = async (containerId) => {
        try {
            await axios.delete(`/api/posts/${containerId}`, { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}`} });
            containersDispatch({ type: 'REMOVE_CONTAINER', payload: containerId });
            setSuccessMessage('Container removed successfully!');
        } catch (err) {
            console.error('Error removing container:', err);
        }
    };

    const handleUpdateContainer = async (container) => {
        try {
            const response = await axios.put(`/api/posts/${container._id}`, container, { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
            containersDispatch({ type: 'UPDATE_CONTAINER', payload: response.data });
            setSuccessMessage('Container updated successfully!');
        } catch (err) {
            console.error('Error updating container:', err);
        }
    };

    const handleShowClick = async (container) => {
        setSelectedContextId(container.context[0] || ''); // Ensure you have a valid context ID

        // Wait for the state to update
        if (!selectedContextId) {
            console.error('No context ID selected');
            return;
        }
        try {
            const response = await axios.get(`/api/posts?context=${selectedContextId}`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}`}
            });
            setPostsForContext(response.data);
            setIsFormVisible(true);
        } catch (err) {
            console.error('Error fetching posts:', err);
        }
    };

    useEffect(() => {
        if (selectedContextId) {
            // Perform actions when selectedContextId is updated
        }
    }, [selectedContextId]);

    return (
        <ContainerContext.Provider value={{
            containers,
            containersDispatch,
            handleAddClick: () => setIsFormVisible(true),
            handleEditClick: (id) => containersDispatch({ type: 'SET_EDIT_ID', payload: id }),
            handleAddContainer,
            handleRemoveContainer,
            handleUpdateContainer,
            isFormVisible,
            setIsFormVisible,
            successMessage,
            setPostsForContext,
            postsForContext,
            contexts,
            handleShowClick,
            selectedContextId
        }}>
            {children}
        </ContainerContext.Provider>
    );
};

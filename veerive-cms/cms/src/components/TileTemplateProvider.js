import React, { useState, useEffect, useCallback } from 'react';
import axios from '../config/axios';
import TileTemplateContext from '../context/TileTemplateContext';

export const TileTemplateProvider = ({ children }) => {
    const [tileTemplates, setTileTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const fetchTileTemplates = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/admin/tile-templates', {
                headers: {
                    Authorization: sessionStorage.getItem('token'),
                },
            });
            setTileTemplates(response.data);
        } catch (error) {
            console.error('Failed to fetch tile templates:', error);
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    }, []);

    // ✅ DISABLED - Only load when TileTemplate page is accessed
    // useEffect(() => {
    //     fetchTileTemplates();
    // }, [fetchTileTemplates]);

    const addTileTemplate = async (templateData) => {
        setLoading(true);
        try {
            const response = await axios.post('/api/admin/tile-templates', templateData, {
                headers: {
                    Authorization: sessionStorage.getItem('token'),
                },
            });
            setTileTemplates([...tileTemplates, response.data]);
            return response.data;
        } catch (error) {
            console.error('Failed to add tile template:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateTileTemplate = async (id, templateData) => {
        setLoading(true);
        try {
            const response = await axios.put(`/api/admin/tile-templates/${id}`, templateData, {
                headers: {
                    Authorization: sessionStorage.getItem('token'),
                },
            });
            setTileTemplates(
                tileTemplates.map((template) =>
                    template._id === id ? response.data : template
                )
            );
            return response.data;
        } catch (error) {
            console.error('Failed to update tile template:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const deleteTileTemplate = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`/api/admin/tile-templates/${id}`, {
                headers: {
                    Authorization: sessionStorage.getItem('token'),
                },
            });
            setTileTemplates(tileTemplates.filter((template) => template._id !== id));
        } catch (error) {
            console.error('Failed to delete tile template:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return (
        <TileTemplateContext.Provider
            value={{
                tileTemplates,
                loading,
                initialLoading,
                fetchTileTemplates,
                addTileTemplate,
                updateTileTemplate,
                deleteTileTemplate,
            }}
        >
            {children}
        </TileTemplateContext.Provider>
    );
}; 
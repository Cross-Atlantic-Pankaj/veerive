import React, { useState } from 'react';
import axios from '../config/axios';
import { toast } from 'react-toastify';
import Papa from 'papaparse';

const CSVUploader = ({ 
    endpoint, 
    onUploadSuccess, 
    requiredFields = [], 
    fieldMappings = {},
    lookupFields = {}
}) => {
    const [isUploading, setIsUploading] = useState(false);

    const validateHeaders = (headers) => {
        const missingFields = requiredFields.filter(field => !headers.includes(field));
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
    };

    const lookupObjectIds = async (data) => {
        const lookupPromises = [];
        const lookupCache = {};

        for (const [field, config] of Object.entries(lookupFields)) {
            if (!lookupCache[config.collection]) {
                lookupCache[config.collection] = {};
                const promise = axios.get(`/api/admin/${config.collection}`, {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                }).then(response => {
                    const items = response.data.data || response.data;
                    items.forEach(item => {
                        lookupCache[config.collection][item[config.key]] = item._id;
                    });
                });
                lookupPromises.push(promise);
            }
        }

        await Promise.all(lookupPromises);

        return data.map(row => {
            const mappedRow = { ...row };
            for (const [field, config] of Object.entries(lookupFields)) {
                if (row[field]) {
                    const lookupValue = row[field].toString().trim();
                    mappedRow[field] = lookupCache[config.collection][lookupValue];
                    if (!mappedRow[field]) {
                        console.warn(`Could not find ${config.collection} with ${config.key}: ${lookupValue}`);
                    }
                }
            }
            return mappedRow;
        });
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const result = await new Promise((resolve, reject) => {
                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: resolve,
                    error: reject
                });
            });

            validateHeaders(result.meta.fields);

            let processedData = result.data.map(row => {
                const mappedRow = {};
                Object.entries(row).forEach(([key, value]) => {
                    const mappedKey = fieldMappings[key] || key;
                    mappedRow[mappedKey] = value;
                });
                return mappedRow;
            });

            if (Object.keys(lookupFields).length > 0) {
                processedData = await lookupObjectIds(processedData);
            }

            await axios.post(endpoint, {
                data: processedData
            }, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });

            toast.success('CSV uploaded successfully!');
            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Failed to upload CSV');
        } finally {
            setIsUploading(false);
            event.target.value = '';
        }
    };

    return (
        <div className="csv-upload-container">
            <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isUploading}
                style={{ display: 'none' }}
                id="csv-upload"
            />
            <label
                htmlFor="csv-upload"
                className="csv-upload-button"
            >
                {isUploading ? 'Uploading...' : 'Upload CSV'}
            </label>
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    const fields = requiredFields.join(',');
                    const blob = new Blob([fields], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'template.csv';
                    a.click();
                }}
                className="csv-template-link"
            >
                Download Template
            </a>
        </div>
    );
};

export default CSVUploader; 
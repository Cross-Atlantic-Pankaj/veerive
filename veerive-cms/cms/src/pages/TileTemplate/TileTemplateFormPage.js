import React from 'react';
import TileTemplateForm from './TileTemplateForm';

const TileTemplateFormPage = () => {
    const handleClose = () => {
        window.close();
    };

    return (
        <TileTemplateForm onClose={handleClose} />
    );
};

export default TileTemplateFormPage; 
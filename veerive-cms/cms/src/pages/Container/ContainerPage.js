import React, { useContext } from 'react';
import ContainerContext from '../../context/ContainerContext';
import ContainerList from './ContainerList';
import ContainerForm from './ContainerForm';
import '../../html/css/Container.css';

const ContainerPage = () => {
    const {  isFormVisible,  handleFormSubmit } = useContext(ContainerContext);

    return (
        <div className="containers-container">
            <h2>Containers Master</h2>
            {!isFormVisible ? (
                <ContainerList />
            ) : (
                <ContainerForm handleFormSubmit={handleFormSubmit} />
            )}
        </div>
    );
};

export default ContainerPage;

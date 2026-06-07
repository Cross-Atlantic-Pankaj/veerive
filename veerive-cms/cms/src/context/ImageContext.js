import { createContext } from "react";

const ImageContext = createContext({
    images: { data: [], editId: null, totalPages: 1, currentPage: 1, allImages: [] },
    fetchImages: () => {},
    fetchAllImages: () => {},
    fetchImagesPageData: () => {},
    isFormVisible: false,
    setIsFormVisible: () => {},
    imagesDispatch: () => {},
    handleAddClick: () => {},
    handleEditClick: () => {},
    handleFormSubmit: () => {},
    currentPage: 1,
    setCurrentPage: () => {}
});

export default ImageContext;

export const loadAppDataFromLocalStorage = (key, initialData) => {
    try {
        const storedData = localStorage.getItem(key);
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (error) {
        console.error("Erreur lors du chargement des données depuis le localStorage", error);
    }
    return initialData;
};

export const saveAppDataToLocalStorage = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error("Erreur lors de l'enregistrement des données dans le localStorage", error);
    }
};

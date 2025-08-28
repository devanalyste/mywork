export const loadAppDataFromLocalStorage = (key, initialData) => {
    try {
        // Vérifier si localStorage est disponible
        if (typeof (Storage) === "undefined") {
            console.warn("localStorage n'est pas disponible");
            return initialData;
        }

        const storedData = localStorage.getItem(key);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            console.log("✅ Données chargées depuis localStorage:", key);
            return parsedData;
        } else {
            console.log("📝 Aucune donnée trouvée pour:", key);
        }
    } catch (error) {
        console.error("❌ Erreur lors du chargement des données depuis le localStorage", error);
    }
    return initialData;
};

export const saveAppDataToLocalStorage = (key, data) => {
    try {
        // Vérifier si localStorage est disponible
        if (typeof (Storage) === "undefined") {
            console.warn("localStorage n'est pas disponible pour la sauvegarde");
            return false;
        }

        localStorage.setItem(key, JSON.stringify(data));
        console.log("💾 Données sauvegardées dans localStorage:", key);
        return true;
    } catch (error) {
        console.error("❌ Erreur lors de l'enregistrement des données dans le localStorage", error);
        return false;
    }
};

// Gestionnaire de drag & drop avancé pour les tâches entre catégories
export class AdvancedDragDropManager {
    constructor() {
        this.draggedItem = null;
        this.sourceCategory = null;
        this.targetCategory = null;
        this.onMoveCallback = null;
        this.ghostElement = null;
    }

    // Initialiser le drag & drop pour un élément
    initializeDragDrop(element, item, category, onMoveCallback) {
        this.onMoveCallback = onMoveCallback;

        element.draggable = true;
        element.addEventListener('dragstart', (e) => this.handleDragStart(e, item, category));
        element.addEventListener('dragend', (e) => this.handleDragEnd(e));

        // Ajouter les événements pour les zones de drop
        this.setupDropZones();
    }

    // Configurer les zones de drop (catégories)
    setupDropZones() {
        document.addEventListener('dragover', (e) => this.handleDragOver(e));
        document.addEventListener('drop', (e) => this.handleDrop(e));
        document.addEventListener('dragenter', (e) => this.handleDragEnter(e));
        document.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    }

    // Début du drag
    handleDragStart(event, item, category) {
        this.draggedItem = item;
        this.sourceCategory = category;

        // Créer un effet visuel personnalisé
        this.createDragGhost(event, item);

        // Ajouter des classes visuelles
        event.target.classList.add('dragging');
        document.body.classList.add('drag-active');

        // Stocker les données
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('application/json', JSON.stringify({
            item: item,
            sourceCategory: category
        }));

        console.log(`🎯 Début du drag: ${item.name} depuis ${category}`);
    }

    // Créer un élément fantôme personnalisé
    createDragGhost(event, item) {
        const ghost = document.createElement('div');
        ghost.className = 'drag-ghost';
        ghost.innerHTML = `
            <div class="drag-ghost-content">
                <div class="drag-ghost-icon">📝</div>
                <div class="drag-ghost-text">${item.name}</div>
                <div class="drag-ghost-category">${this.sourceCategory}</div>
            </div>
        `;

        // Styles pour le fantôme
        Object.assign(ghost.style, {
            position: 'absolute',
            top: '-1000px',
            left: '-1000px',
            padding: '8px 12px',
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
            pointerEvents: 'none',
            zIndex: '1000',
            transform: 'rotate(-2deg)',
            opacity: '0.9'
        });

        document.body.appendChild(ghost);
        this.ghostElement = ghost;

        // Utiliser le fantôme personnalisé
        event.dataTransfer.setDragImage(ghost, 50, 25);
    }

    // Survol d'une zone de drop
    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';

        const dropZone = this.findDropZone(event.target);
        if (dropZone) {
            this.highlightDropZone(dropZone, true);
        }
    }

    // Entrée dans une zone de drop
    handleDragEnter(event) {
        const dropZone = this.findDropZone(event.target);
        if (dropZone && this.draggedItem) {
            const category = dropZone.dataset.category;
            this.targetCategory = category;
            this.highlightDropZone(dropZone, true);
        }
    }

    // Sortie d'une zone de drop
    handleDragLeave(event) {
        const dropZone = this.findDropZone(event.target);
        if (dropZone) {
            // Vérifier si on quitte vraiment la zone (pas juste un enfant)
            const rect = dropZone.getBoundingClientRect();
            const x = event.clientX;
            const y = event.clientY;

            if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                this.highlightDropZone(dropZone, false);
            }
        }
    }

    // Drop de l'élément
    handleDrop(event) {
        event.preventDefault();

        const dropZone = this.findDropZone(event.target);
        if (dropZone && this.draggedItem) {
            const targetCategory = dropZone.dataset.category;

            if (targetCategory !== this.sourceCategory) {
                console.log(`🎯 Drop: ${this.draggedItem.name} de ${this.sourceCategory} vers ${targetCategory}`);

                // Exécuter le callback de déplacement
                if (this.onMoveCallback) {
                    this.onMoveCallback(this.draggedItem, this.sourceCategory, targetCategory);
                }
            }

            this.highlightDropZone(dropZone, false);
        }

        this.cleanup();
    }

    // Fin du drag
    handleDragEnd(event) {
        event.target.classList.remove('dragging');
        this.cleanup();
    }

    // Trouver la zone de drop la plus proche
    findDropZone(element) {
        while (element && element !== document.body) {
            if (element.classList && element.classList.contains('drop-zone')) {
                return element;
            }
            element = element.parentElement;
        }
        return null;
    }

    // Mettre en surbrillance une zone de drop
    highlightDropZone(dropZone, highlight) {
        if (highlight) {
            dropZone.classList.add('drop-zone-active');
        } else {
            dropZone.classList.remove('drop-zone-active');
        }
    }

    // Nettoyer après le drag & drop
    cleanup() {
        document.body.classList.remove('drag-active');

        // Supprimer l'élément fantôme
        if (this.ghostElement) {
            document.body.removeChild(this.ghostElement);
            this.ghostElement = null;
        }

        // Nettoyer les zones de drop
        document.querySelectorAll('.drop-zone-active').forEach(zone => {
            zone.classList.remove('drop-zone-active');
        });

        // Réinitialiser les variables
        this.draggedItem = null;
        this.sourceCategory = null;
        this.targetCategory = null;
    }

    // Ajouter les styles CSS nécessaires
    injectStyles() {
        const styleId = 'advanced-drag-drop-styles';
        if (document.getElementById(styleId)) return;

        const styles = `
            .dragging {
                opacity: 0.5 !important;
                transform: rotate(5deg) !important;
                transition: all 0.2s ease !important;
            }
            
            .drag-active {
                cursor: grabbing !important;
            }
            
            .drop-zone {
                transition: all 0.3s ease;
                position: relative;
            }
            
            .drop-zone-active {
                background-color: rgba(59, 130, 246, 0.1) !important;
                border: 2px dashed #3b82f6 !important;
                transform: scale(1.02);
            }
            
            .drop-zone-active::before {
                content: "📁 Déposer ici";
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #3b82f6;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
                z-index: 10;
                pointer-events: none;
            }
            
            .drag-ghost-content {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .drag-ghost-icon {
                font-size: 16px;
            }
            
            .drag-ghost-text {
                font-weight: 600;
            }
            
            .drag-ghost-category {
                opacity: 0.8;
                font-size: 12px;
            }
            
            /* Animation de feedback */
            @keyframes dropSuccess {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); background-color: #10b981; }
                100% { transform: scale(1); }
            }
            
            .drop-success {
                animation: dropSuccess 0.5s ease;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = styleId;
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
}

// Instance globale
export const advancedDragDrop = new AdvancedDragDropManager();

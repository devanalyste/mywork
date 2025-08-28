import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Exemple minimal basé sur la documentation officielle
const SimpleDragDrop = () => {
    const [items, setItems] = useState([
        { id: 'item-1', content: 'Premier élément' },
        { id: 'item-2', content: 'Deuxième élément' },
        { id: 'item-3', content: 'Troisième élément' },
        { id: 'item-4', content: 'Quatrième élément' }
    ]);

    const handleOnDragEnd = (result) => {
        console.log('Drag end result:', result);

        if (!result.destination) {
            console.log('No destination');
            return;
        }

        const newItems = Array.from(items);
        const [reorderedItem] = newItems.splice(result.source.index, 1);
        newItems.splice(result.destination.index, 0, reorderedItem);

        console.log('Reordered items:', newItems);
        setItems(newItems);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '500px' }}>
            <h3>Test Simple Drag & Drop</h3>
            <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="simple-list">
                    {(provided, snapshot) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={{
                                background: snapshot.isDraggingOver ? 'lightblue' : 'lightgrey',
                                padding: '8px',
                                minHeight: '200px'
                            }}
                        >
                            {items.map((item, index) => (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{
                                                userSelect: 'none',
                                                padding: '16px',
                                                margin: '0 0 8px 0',
                                                backgroundColor: snapshot.isDragging ? '#263B4A' : '#456C86',
                                                color: 'white',
                                                ...provided.draggableProps.style
                                            }}
                                        >
                                            {item.content}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default SimpleDragDrop;

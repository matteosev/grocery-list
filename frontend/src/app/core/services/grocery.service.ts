import { Service, signal, effect } from '@angular/core';

export interface GroceryItem {
    id: string;
    name: string;
    completed: boolean;
}

export interface GroceryList {
    id: string;
    name: string;
    items: GroceryItem[];
}

@Service()
export class GroceryService {
    private readonly storageKey = 'grocery_lists';
    private readonly _lists = signal<GroceryList[]>([]);
    public readonly lists = this._lists.asReadonly();
    
    constructor() {
        const jsonLists = localStorage.getItem(this.storageKey);
        this._lists.set(jsonLists ? JSON.parse(jsonLists) : []);
        
        // Automatically persist state changes to localStorage
        effect(() => {
            localStorage.setItem(this.storageKey, JSON.stringify(this.lists()));
        });
    }

    // LIST CRUD
    addList(name: string): void {
        const newList: GroceryList = {
            id: crypto.randomUUID(),
            name: name.trim() || 'Nouvelle liste',
            items: []
        };
        this._lists.update(lists => [...lists, newList]);
    }

    renameList(listId: string, newName: string): void {
        this._lists.update(lists =>
            lists.map(l => l.id === listId ? { ...l, name: newName.trim() || l.name } : l)
        );
    }

    deleteList(listId: string): void {
        this._lists.update(lists => lists.filter(l => l.id !== listId));
    }

    reorderLists(fromIndex: number, toIndex: number): void {
        this._lists.update(lists => {
            const updated = [...lists];
            const [moved] = updated.splice(fromIndex, 1);
            updated.splice(toIndex, 0, moved);
            return updated;
        });
    }

    // ITEM CRUD
    addItem(listId: string, name: string): void {
        this._lists.update(lists =>
            lists.map(l => {
                if (l.id === listId) {
                    const newItem: GroceryItem = {
                        id: crypto.randomUUID(),
                        name: name.trim() || 'Nouveau produit',
                        completed: false
                    };
                    return { ...l, items: [...l.items, newItem] };
                }
                return l;
            })
        );
    }

    renameItem(listId: string, itemId: string, newName: string): void {
        this._lists.update(lists =>
            lists.map(l => {
                if (l.id === listId) {
                    return {
                        ...l,
                        items: l.items.map(item =>
                            item.id === itemId ? { ...item, name: newName.trim() || item.name } : item
                        )
                    };
                }
                return l;
            })
        );
    }

    deleteItem(listId: string, itemId: string): void {
        this._lists.update(lists =>
            lists.map(l => {
                if (l.id === listId) {
                    return {
                        ...l,
                        items: l.items.filter(item => item.id !== itemId)
                    };
                }
                return l;
            })
        );
    }

    toggleItem(listId: string, itemId: string): void {
        this._lists.update(lists =>
            lists.map(l => {
                if (l.id === listId) {
                    return {
                        ...l,
                        items: l.items.map(item =>
                            item.id === itemId ? { ...item, completed: !item.completed } : item
                        )
                    };
                }
                return l;
            })
        );
    }

    reorderItems(listId: string, fromIndex: number, toIndex: number): void {
        this._lists.update(lists =>
            lists.map(l => {
                if (l.id === listId) {
                    const updatedItems = [...l.items];
                    const [moved] = updatedItems.splice(fromIndex, 1);
                    updatedItems.splice(toIndex, 0, moved);
                    return { ...l, items: updatedItems };
                }
                return l;
            })
        );
    }
}

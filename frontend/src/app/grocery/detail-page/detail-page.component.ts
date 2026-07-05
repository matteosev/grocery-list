import { Component, inject, input, signal, computed, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonReorderGroup,
    IonReorder,
    IonButtons,
    IonBackButton,
    IonCheckbox,
    IonInput,
    AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, chevronBackOutline } from 'ionicons/icons';
import { GroceryService, GroceryItem } from '../../core/services/grocery.service';
import { LongPressDirective } from '../../shared/directives/long-press.directive';

@Component({
    selector: 'app-detail-page',
    imports: [
        RouterLink,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonList,
        IonItem,
        IonLabel,
        IonButton,
        IonIcon,
        IonReorderGroup,
        IonReorder,
        IonButtons,
        IonBackButton,
        IonCheckbox,
        IonInput,
        LongPressDirective
    ],
    templateUrl: "./detail-page.component.html",
    styleUrl: "./detail-page.component.css"
})
export class DetailPageComponent {
    private readonly groceryService = inject(GroceryService);
    private readonly alertController = inject(AlertController);

    readonly id = input.required<string>();

    readonly content = viewChild<IonContent>(IonContent);

    readonly newItemName = signal('');

    readonly currentList = computed(() => {
        return this.groceryService.lists().find(list => list.id === this.id());
    });

    // Calculate standard "completed/total" string
    readonly progress = computed(() => {
        const list = this.currentList();
        if (!list || list.items.length === 0) return '';
        const completed = list.items.filter(item => item.completed).length;
        return `(${completed}/${list.items.length})`;
    });

    constructor() {
        addIcons({ closeOutline, chevronBackOutline });
    }

    onInputChange(event: any) {
        this.newItemName.set(event.target.value || '');
    }

    addItem() {
        const name = this.newItemName();
        const list = this.currentList();
        if (list && name.trim()) {
            this.groceryService.addItem(list.id, name);
            this.newItemName.set('');

            // Scrolls the page down after a short delay so that the DOM is refreshed
            setTimeout(() => {
                const contentRef = this.content();
                if (contentRef) {
                    const animationDuration = 300; // in milliseconds
                    contentRef.scrollToBottom(animationDuration);
                }
            }, 100);
        }
    }

    toggleItem(itemId: string) {
        const list = this.currentList();
        if (list) {
            this.groceryService.toggleItem(list.id, itemId);
        }
    }

    deleteItem(itemId: string, event: Event) {
        event.stopPropagation();
        event.preventDefault();
        const list = this.currentList();
        if (list) {
            this.groceryService.deleteItem(list.id, itemId);
        }
    }

    handleReorder(event: CustomEvent) {
        const list = this.currentList();
        if (list) {
            const from = event.detail.from;
            const to = event.detail.to;
            this.groceryService.reorderItems(list.id, from, to);
        }
        event.detail.complete();
    }

    async renameItem(item: GroceryItem) {
        const alert = await this.alertController.create({
            header: 'Renommer le produit',
            inputs: [
                {
                    name: 'name',
                    type: 'text',
                    value: item.name,
                    placeholder: 'Nom du produit'
                }
            ],
            buttons: [
                {
                    text: 'Annuler',
                    role: 'cancel'
                },
                {
                    text: 'Sauvegarder',
                    handler: (data) => {
                        const list = this.currentList();
                        if (list && data.name && data.name.trim()) {
                            this.groceryService.renameItem(list.id, item.id, data.name);
                        }
                    }
                }
            ]
        });

        await alert.present();
    }
}

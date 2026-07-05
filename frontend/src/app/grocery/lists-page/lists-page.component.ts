import { Component, computed, inject, Signal } from '@angular/core';
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
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, addOutline } from 'ionicons/icons';
import { GroceryService, GroceryList } from '../../core/services/grocery.service';
import { LongPressDirective } from '../../shared/directives/long-press.directive';

interface GroceryListWithStat extends GroceryList {
  completedCount: number;
}

@Component({
  selector: 'app-lists-page',
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
    LongPressDirective,
  ],
  templateUrl: "./lists-page.component.html",
  styleUrl: "./lists-page.component.css"
})
export class ListsPageComponent {
  private readonly groceryService = inject(GroceryService);
  private readonly alertController = inject(AlertController);

  protected readonly lists: Signal<GroceryListWithStat[]> = computed(() => {
    return this.groceryService.lists().map(list => {
      return { 
        ...list, 
        completedCount: list.items.filter(item => item.completed).length 
      };
    });
  });

  constructor() {
    addIcons({ closeOutline, addOutline });
  }

  async createList() {
    const alert = await this.alertController.create({
      header: 'Nouvelle liste',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nom de la liste'
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Créer',
          handler: (data) => {
            if (data.name && data.name.trim()) {
              this.groceryService.addList(data.name);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  deleteList(id: string, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.groceryService.deleteList(id);
  }

  handleReorder(event: CustomEvent) {
    const from = event.detail.from;
    const to = event.detail.to;
    this.groceryService.reorderLists(from, to);
    event.detail.complete();
  }

  async renameList(list: GroceryList) {
    const alert = await this.alertController.create({
      header: 'Renommer la liste',
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: list.name,
          placeholder: 'Nouveau nom de la liste'
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
            if (data.name && data.name.trim()) {
              this.groceryService.renameList(list.id, data.name);
            }
          }
        }
      ]
    });

    await alert.present();
  }
}

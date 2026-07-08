/**
 * კონფიგურაციის default-მნიშვნელობები (არა სატესტო მონაცემები).
 * რეალური მონაცემები ცარიელია და ივსება მომხმარებლის მიერ, ინახება Firestore-ზე.
 */
import { TaxSettings, UserRole } from '../types';

export const DEFAULT_TAX_SETTINGS: TaxSettings = {
  incomeTaxPercent: 20,
  pensionEmployeePercent: 2,
  pensionEmployerPercent: 2,
};

export const DEFAULT_BUDGET = 50000;

export const ROLE_DEFS: { id: UserRole; name: string; desc: string }[] = [
  { id: 'admin', name: 'Admin (ადმინისტრატორი)', desc: 'სრული წვდომა — ამტკიცებს ხარჯებს, მართავს ტრანშებს, ბიუჯეტსა და მომხმარებლებს.' },
  { id: 'accountant', name: 'Accountant (ბუღალტერი)', desc: 'ამოწმებს დოკუმენტების სისრულეს, აკონტროლებს ანარიცხებს, აბრუნებს კორექტირებაზე.' },
  { id: 'manager', name: 'Manager (მენეჯერი)', desc: 'ამატებს ხარჯებს, აბამს ფაილებს, აგზავნის ბუღალტერთან.' },
  { id: 'uploader', name: 'Uploader (ატვირთვა)', desc: 'მხოლოდ ტვირთავს ფაქტურებსა და ქვითრებს.' },
  { id: 'viewer', name: 'Viewer (მნახველი)', desc: 'მხოლოდ ხედავს დაფასა და რეესტრებს, რედაქტირების გარეშე.' },
];

import { business, contact } from './footer';

// The Pradeep Jewellers showroom. Getters, so details saved in the admin panel apply.
export const stores = [
  {
    get city() {
      return business.address.city;
    },
    name: 'Pradeep Jewellers, Bhilai',
    get address() {
      return business.addressLine;
    },
    get phone() {
      return contact.phone;
    },
    get tel() {
      return contact.phoneTel;
    },
    get mapsUrl() {
      return business.mapsUrl;
    },
    get mapsEmbedUrl() {
      return business.mapsEmbedUrl;
    },
  },
];

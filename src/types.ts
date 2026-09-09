/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Artwork {
  id: string;
  title: string;
  collection: string;
  year: string;
  medium: string;
  size: string;
  imageUrl: string;
  imageUrls?: string[];
  description: string;
  featured: boolean;
  priceA4?: string;
  priceA3?: string;
  priceCanva?: string;
  priceCanvas20x30?: string;
  priceCanvas40x60?: string;
  price?: string;
  updatedAt?: number;
}

export interface LaminasPricing {
  a4: string;
  a3: string;
  canva20x30: string;
  canva40x60: string;
}

export const DEFAULT_LAMINAS_PRICES: LaminasPricing = {
  a4: '18.000',
  a3: '28.000',
  canva20x30: '45.000',
  canva40x60: '65.000'
};

export interface Collection {
  id: string;
  name: string;
  description: string;
}

export interface DesignProject {
  id: string;
  num: string;
  title: string;
  description?: string;
  imageUrl?: string;
  badgeLeft: string;
  badgeRight: string;
  websiteUrl?: string;
  updatedAt?: number;
}

export interface DesignCarouselItem {
  id: string;
  imageUrl: string;
  title?: string;
  category?: string;
  order?: number;
  updatedAt?: number;
}

export interface InquiryMessage {
  name: string;
  email: string;
  subject: string;
  artworkId?: string;
  sizePreference?: string;
  frameType?: 'none' | 'wood' | 'black' | 'gold';
  message: string;
}

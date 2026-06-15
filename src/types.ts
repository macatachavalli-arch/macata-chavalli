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
}

export interface Collection {
  id: string;
  name: string;
  description: string;
}

export interface DesignProject {
  id: string;
  num: string;
  title: string;
  description: string;
  badgeLeft: string;
  badgeRight: string;
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

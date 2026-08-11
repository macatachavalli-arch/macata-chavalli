/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Artwork, Collection, DesignProject, DesignCarouselItem } from './types';

export const collections: Collection[] = [
  {
    id: 'todos',
    name: 'VER TODO',
    description: 'La colección completa de exploraciones visuales.'
  },
  {
    id: 'laminas',
    name: 'LÁMINAS',
    description: 'Reproducciones impresas de alta calidad (giclée) en papeles selectos de alto gramaje.'
  },
  {
    id: 'originales',
    name: 'ORIGINALES',
    description: 'Pinturas únicas en acrílico, óleo y técnicas mixtas con relieve sobre lienzo o madera.'
  },
  {
    id: 'calendario',
    name: 'CALENDARIO',
    description: 'Calendarios ilustrados de edición limitada e impresión artesanal.'
  }
];

export const artworks: Artwork[] = [
  {
    id: 'vibrant-canvas',
    title: 'Sinfonía en Girasol y Coral',
    collection: 'originales',
    year: '2026',
    medium: 'Acrílico sobre lienzo con relieve y detalles en pan de oro',
    size: '100 x 100 cm',
    imageUrl: '/src/assets/images/artwork_vibrant_canvas_1781006340944.png',
    imageUrls: [
      '/src/assets/images/artwork_vibrant_canvas_1781006340944.png',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Una pieza vibrante capitaneada por pétalos abstractos amarillos, corales exuberantes y trazos de espátula texturizados que transmiten optimismo. Los destellos de pan de oro capturan la luz cambiante del día.',
    featured: true
  },
  {
    id: 'botanical-dream',
    title: 'El Susurro de las Hojas y Estrellas',
    collection: 'laminas',
    year: '2025',
    medium: 'Gouache, collage y técnica mixta sobre papel de algodón de 300g',
    size: '70 x 100 cm',
    imageUrl: '/src/assets/images/artwork_botanical_dream_1781006353460.png',
    imageUrls: [
      '/src/assets/images/artwork_botanical_dream_1781006353460.png',
      'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Una atmósfera mágica y contemplativa, representando el reposo rodeado de gigantescas hojas de palmera índigo e hiedras selváticas de fantasía bajo una suave lluvia de estrellas doradas.',
    featured: true
  },
  {
    id: 'starry-landscape',
    title: 'Noche Infinitamente Mágica',
    collection: 'originales',
    year: '2026',
    medium: 'Óleo con empaste grueso sobre madera entelada',
    size: '120 x 80 cm',
    imageUrl: '/src/assets/images/artwork_starry_landscape_1781006365363.png',
    imageUrls: [
      '/src/assets/images/artwork_starry_landscape_1781006365363.png',
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Inspirada en el cielo nocturno del campo patagónico, esta pintura de empaste generoso plasma luciérnagas titilantes y un cielo arremolinado en tonos lila, cobalto y plata.',
    featured: true
  },
  {
    id: 'oceanic-harmony',
    title: 'Corrientes de Coral',
    collection: 'laminas',
    year: '2026',
    medium: 'Tinta de alcohol y acuarela fluida sobre papel Yupo',
    size: '80 x 60 cm',
    imageUrl: '/src/assets/images/artwork_oceanic_harmony_1781006380677.png',
    imageUrls: [
      '/src/assets/images/artwork_oceanic_harmony_1781006380677.png'
    ],
    description: 'Una meditación acuática. Flujos orgánicos que sugieren arrecifes profundos y el constante vaivén de las olas. Predominan los tonos melocotón, turquesa suave y destellos minerales.',
    featured: false
  },
  {
    id: 'almanac-2026',
    title: 'Calendario Ilustrado 2026',
    collection: 'calendario',
    year: '2026',
    medium: 'Impresión artesanal sobre papel texturado de 240g con pie de madera rústica',
    size: '15 x 21 cm',
    imageUrl: '/src/assets/images/artwork_vibrant_canvas_1781006340944.png',
    imageUrls: [
      '/src/assets/images/artwork_vibrant_canvas_1781006340944.png'
    ],
    description: 'Edición boutique con 12 ilustraciones mensuales desmontables para ser enmarcadas como láminas individuales de autor una vez concluido el mes.',
    featured: false
  }
];

export const artistProfile = {
  name: 'Clara',
  instagram: 'macatachavalli',
  instagramUrl: 'https://www.instagram.com/macatachavalli?igsh=ajRrbWZsaXdhZjU3',
  email: 'macatachavalli@gmail.com',
  avatarUrl: '/src/assets/images/artist_avatar_1781006393053.png',
  bioParagraphs: [
    'Me llamo Clara, nací en la ciudad de La Plata, Buenos Aires, Argentina. Soy Diseñadora en Comunicación Visual egresada de la Facultad de Artes, Universidad Nacional de La Plata.',
    'Con título en mano me perfeccioné en diseño editorial. En el estudio se diseñaban interior y tapa de libros, colecciones y manuales para grandes editoriales. También realizábamos calendarios y agendas. Al día de hoy, el mundo editorial es una de mis propuestas preferidas para diseñar.',
    'Luego adquirí experiencia en el área de preimpresión en una gráfica de mi ciudad natal. Una de las tareas que más me gustaba hacer era la preparación y supervisión de archivos y originales antes de entrar en máquina.',
    'En lo que va de mi vida, siempre me acompañan los dibujos. Exploro el arte desde muy pequeña. A través de las ilustraciones plasmo sueños, pensamientos. Creo historias y mundos imaginarios que me gustaría conocer, invitando al espectador a sumergirse en ellos.',
    'Me siento muy afortunada de poder expresar en dibujos, comunicar a través de la ilustración. Me inspira profundamente el sentido de transformación, la transmutación, la conexión con lo divino. Lo oculto que se deja ver. Las magias. La Luna y el Sol.'
  ],
  philosophies: [
    { title: 'Conexión Botánica', text: 'La naturaleza no es solo un modelo; es mi principal compañera de expresión.' },
    { title: 'La Textura como Lenguaje', text: 'Tocar con la mirada. Mis capas y trazos de espátula buscan crear un relieve vivo.' },
    { title: 'Sostenibilidad Emocional', text: 'Arte creado despacio, respetando los tiempos de secado y los procesos del alma.' }
  ]
};

export const defaultDesignProjects: DesignProject[] = [
  {
    id: 'design-1',
    num: '01 / BRANDING & DISEÑO',
    title: 'Identidad Visual',
    description: 'Diseño de logotipos y sistema de identidad visual. Trabajo para darle forma a tus ideas y a tu proyecto inicial. Diseño de símbolos para acompañar tu proyecto de identidad visual.',
    badgeLeft: 'Tipografía & Logotipo',
    badgeRight: '★ Boutique'
  },
  {
    id: 'design-2',
    num: '02 / EDITORIAL',
    title: 'Diseño Editorial',
    description: 'Diseño de libros, catálogos, colecciones, calendarios y agendas. Arte de tapa y maquetado interior. Consultoría y acompañamiento para tu proyecto editorial autogestivo.',
    badgeLeft: 'Libros & Agendas',
    badgeRight: '★ Especializado'
  }
];

export const defaultDesignCarouselItems: DesignCarouselItem[] = [
  {
    id: 'carousel-1',
    imageUrl: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=1200&q=80',
    title: 'Identidad Visual & Sistema de Marca',
    category: 'Branding',
    order: 1
  },
  {
    id: 'carousel-2',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    title: 'Maquetación Editorial & Portada de Libro',
    category: 'Editorial',
    order: 2
  },
  {
    id: 'carousel-3',
    imageUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1200&q=80',
    title: 'Papelería & Tipografía Boutique',
    category: 'Boutique',
    order: 3
  },
  {
    id: 'carousel-4',
    imageUrl: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&w=1200&q=80',
    title: 'Catálogo de Colección & Agendas',
    category: 'Diseño Gráfico',
    order: 4
  },
  {
    id: 'carousel-5',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    title: 'Composición Tipográfica & Símbolos',
    category: 'Arte & Dirección Creativa',
    order: 5
  }
];

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Artwork, Collection, DesignProject } from './types';

export const collections: Collection[] = [
  {
    "id": "todos",
    "name": "VER TODO",
    "description": "La colección completa de exploraciones visuales."
  },
  {
    "id": "originales",
    "name": "ORIGINALES",
    "description": "Pinturas únicas en acrílico, óleo y técnicas mixtas con relieve sobre lienzo o madera."
  },
  {
    "id": "laminas",
    "name": "LÁMINAS",
    "description": "Reproducciones impresas de alta calidad (giclée) en papeles selectos de alto gramaje."
  },
  {
    "id": "calendario",
    "name": "CALENDARIO",
    "description": "Calendarios ilustrados de edición limitada e impresión artesanal."
  }
];

export const artworks: Artwork[] = [
  {
    "id": "vibrant-canvas",
    "title": "Movimiento Solar",
    "collection": "originales",
    "year": "2026",
    "medium": "Acrílico sobre lienzo",
    "size": "40 x 40 cm",
    "imageUrl": "https://i.imgur.com/NhCk8wZ.png",
    "imageUrls": [
      "https://i.imgur.com/NhCk8wZ.png",
      "https://i.imgur.com/aaJ5M2m.png",
      "https://i.imgur.com/fEdHc9s.png"
    ],
    "description": "",
    "featured": false
  },
  {
    "id": "botanical-dream",
    "title": "Marea",
    "collection": "laminas",
    "year": "2025",
    "medium": "Ilustración digital",
    "size": "A3",
    "imageUrl": "https://i.imgur.com/T2wHG4Q.png",
    "imageUrls": [
      "https://i.imgur.com/T2wHG4Q.png"
    ],
    "description": "Lámina impresa de alta calidad sobre papel 300 g.",
    "featured": false
  }
];

export const artistProfile = {
  "name": "Clara",
  "instagram": "macatachavalli",
  "instagramUrl": "https://www.instagram.com/macatachavalli?igsh=ajRrbWZsaXdhZjU3",
  "email": "macatachavalli@gmail.com",
  "avatarUrl": "/src/assets/images/artist_avatar_1781006393053.png",
  "bioParagraphs": [
    "Me llamo Clara, nací en la ciudad de La Plata, Buenos Aires, Argentina. Soy Diseñadora en Comunicación Visual egresada de la Facultad de Artes, Universidad Nacional de La Plata.",
    "Con título en mano me perfeccioné en diseño editorial. En el estudio se diseñaban las tapas y propuesta de diseño y maquetado interior de libros, colecciones y manuales para grandes editoriales. También realizábamos calendarios y agendas. Al día de hoy, el mundo editorial es mi propuesta preferida para diseñar.",
    "Luego adquirí experiencia en el área de ventas y preimpresión en una gráfica de mi ciudad natal. Una de las tareas que más me gustaba hacer y aprender, era la preparación y supervisión de archivos y originales antes de entrar en máquina.",
    "En lo que va de mi vida, siempre me acompañan los dibujos. Dibujo y exploro el arte desde muy pequeña. A través de las ilustraciones plasmo sueños, pensamientos. Creo historias y mundos imaginarios que me gustaría conocer, invitando al espectador a sumergirse en ellos.",
    "Me siento muy afortunada de poder expresar en dibujos, comunicar a través de la ilustración. Me inspira profundamente el sentido de transformación, la transmutación, la conexión con lo divino. Lo oculto que se deja ver, los misterios. Las magias, la Luna y el Sol."
  ],
  "philosophies": [
    {
      "title": "Conexión Botánica",
      "text": "La naturaleza no es solo un modelo; es mi principal compañera de expresión."
    },
    {
      "title": "La Textura como Lenguaje",
      "text": "Tocar con la mirada. Mis capas y trazos de espátula buscan crear un relieve vivo."
    },
    {
      "title": "Sostenibilidad Emocional",
      "text": "Arte creado despacio, respetando los tiempos de secado y los procesos del alma."
    }
  ]
};

export const defaultDesignProjects: DesignProject[] = [
  {
    "id": "design-1",
    "num": "01 / BRANDING & DISEÑO",
    "title": "Identidad Visual",
    "description": "Diseño de logotipos y sistema de identidad visual. Trabajo para darle forma a tus ideas y a tu proyecto inicial.",
    "badgeLeft": "Tipografía & Logotipo",
    "badgeRight": "★ Boutique"
  },
  {
    "id": "design-2",
    "num": "02 / EDITORIAL",
    "title": "Diseño Editorial",
    "description": "Diseño de libros, catálogos, colecciones, calendarios y agendas. Arte de tapa y maquetado interior. Consultoría y acompañamiento para tu proyecto editorial autogestivo.",
    "badgeLeft": "Libros & Agendas",
    "badgeRight": "★ Especializado"
  },
  {
    "id": "design-3",
    "num": "03 / GESTUAL",
    "title": "Artística",
    "description": "Diseño de símbolos para acompañar tu proyecto de identidad visual. Diseño de tipografías y logotipo gestuales. La idea es trabajar con la fusión de arte y diseño, con la finalidad de generar proyectos más plásticos.",
    "badgeLeft": "Pintura & Textura",
    "badgeRight": "★ Único"
  }
];

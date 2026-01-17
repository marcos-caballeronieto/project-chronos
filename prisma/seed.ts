// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Definimos los datos crudos aquí para mantener el main() limpio
const eventsData = [
  {
    date: "1969-07-20",
    year: 1969,
    title: "El gran salto de la humanidad",
    description: "Apolo 11 llega a la Luna.",
    category: "Ciencia",
    imageUrl: "https://images.unsplash.com/photo-1541873676-a18131494184?q=80&w=1000&auto=format&fit=crop",
    imageCredit: "NASA",
    imagePosition: "0% 30%",
    funFact: "La computadora del Apolo tenía menos potencia que un reloj digital actual.",
    story: `Neil Armstrong descendió lentamente por la escalerilla del módulo lunar. Al pisar la superficie polvorienta, pronunció la frase que pasaría a la historia.\n\nEs un pequeño paso para el hombre, pero un gran salto para la humanidad.`,
    tags: ["Espacio", "Guerra Fría"],
    glossary: [
      { term: "Apolo", definition: "Programa espacial de la NASA (1961-1972)..." },
      { term: "Neil Armstrong", definition: "(1930-2012) Primer ser humano en la Luna." }
    ]
  },
  {
    date: "1989-11-09",
    year: 1989,
    title: "Cae el Muro de Berlín",
    description: "El fin de la división alemana y símbolo del colapso del bloque soviético.",
    category: "Política",
    imageUrl: "https://images.unsplash.com/photo-1596287865223-b6d85a1a1007?q=80&w=1000&auto=format&fit=crop", 
    imageCredit: "Bundesarchiv",
    imagePosition: "0% 20%",
    funFact: "El muro cayó 'por error' cuando un funcionario anunció en TV que las fronteras se abrían 'inmediatamente' sin tener la orden oficial.",
    story: `Durante 28 años, el Muro de Berlín dividió no solo una ciudad, sino al mundo entero. Esa noche de noviembre, miles de berlineses del este se agolparon en los pasos fronterizos tras escuchar las noticias. Los guardias, desbordados y sin órdenes claras, terminaron abriendo las barreras. La gente trepó al muro, bailó sobre él y comenzó a demolerlo con martillos y cinceles.`,
    tags: ["Guerra Fría", "Alemania", "Siglo XX"],
    glossary: [
      { term: "Telón de Acero", definition: "Frontera política, ideológica y física que dividió a Europa en dos bloques tras la II Guerra Mundial." },
      { term: "RDA", definition: "República Democrática Alemana (Alemania del Este), el estado socialista bajo órbita soviética." }
    ]
  },
  {
    date: "1903-12-17",
    year: 1903,
    title: "El primer vuelo",
    description: "Los hermanos Wright logran el primer vuelo controlado de un avión.",
    category: "Tecnología",
    imageUrl: "https://images.unsplash.com/photo-1505673542713-17849dcb5885?q=80&w=1000&auto=format&fit=crop",
    imageCredit: "Library of Congress",
    imagePosition: "0% 50%",
    funFact: "El primer vuelo duró solo 12 segundos y recorrió una distancia menor a la longitud de un avión Boeing 747 actual.",
    story: `En las dunas de Kitty Hawk, Carolina del Norte, Orville y Wilbur Wright lanzaron al aire su 'Flyer I'. Era una mañana fría y ventosa. Orville pilotó la máquina acostado boca abajo. A las 10:35 AM, el aparato se elevó por sus propios medios, voló 36 metros y aterrizó suavemente, cambiando el transporte mundial para siempre.`,
    tags: ["Aviación", "Inventos"],
    glossary: [
      { term: "Aerodinámica", definition: "Estudio de cómo se mueven los gases (aire) y cómo interactúan con los cuerpos sólidos (alas)." },
      { term: "Kitty Hawk", definition: "Localidad elegida por los Wright por sus vientos constantes y suelo arenoso suave para los aterrizajes." }
    ]
  }
]

async function main() {
  console.log('🌱 Iniciando seed...')

  // 1. Limpiar base de datos (Borrar todo)
  await prisma.glossaryTerm.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.event.deleteMany()
  console.log('🧹 Base de datos limpiada.')

  // 2. Insertar eventos en bucle
  for (const event of eventsData) {
    const { tags, glossary, ...eventData } = event

    await prisma.event.create({
      data: {
        ...eventData,
        // Crear relaciones de Tags
        tags: {
          create: tags.map(tagName => ({ name: tagName }))
        },
        // Crear relaciones de Glosario
        glossary: {
          create: glossary
        }
      }
    })
  }

  console.log(`✅ Se han insertado ${eventsData.length} eventos correctamente.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
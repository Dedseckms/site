const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = require('../db/database');

const initialComplexes = [
  {
    slug: 'park-gorod',
    name: 'Парк Город',
    location: 'Центральный район, ул. Парковая',
    description: 'Современные квартиры с панорамным остеклением. Закрытая территория, детские площадки, фитнес-центр.',
    price_from: '45 млн ₽',
    rooms: '1–4 комнаты',
    status: 'Сдача 2026',
    images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80']
  },
  {
    slug: 'rechnye-zori',
    name: 'Речные Зори',
    location: 'Набережная, ул. Речная',
    description: 'Вид на воду из каждой квартиры. Причал, зона барбекю, консьерж-сервис 24/7.',
    price_from: '62 млн ₽',
    rooms: '2–5 комнат',
    status: 'Сдача 2025',
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80']
  },
  {
    slug: 'solnechnyy-kvartal',
    name: 'Солнечный Квартал',
    location: 'Южный район, пр. Солнечный',
    description: 'Эко-комплекс с солнечными панелями. Огромный парк, школа и детский сад на территории.',
    price_from: '38 млн ₽',
    rooms: 'Студии — 4 комнаты',
    status: 'Новинка',
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80']
  }
];

const insert = db.prepare(`
  INSERT OR IGNORE INTO complexes (slug, name, location, description, price_from, rooms, status, images)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const c of initialComplexes) {
  insert.run(c.slug, c.name, c.location, c.description, c.price_from, c.rooms, c.status, JSON.stringify(c.images));
}

console.log('Добавлены начальные комплексы.');
process.exit(0);

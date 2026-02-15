// Используем JSON-хранилище (без нативных зависимостей)
const store = require('./store');

// Инициализация: создать админа и комплексы если пусто
const users = store.users.getAll();
if (users.length === 0) {
  const bcrypt = require('bcryptjs');
  store.users.create({
    email: 'admin@luxestate.ru',
    password_hash: bcrypt.hashSync('admin123', 10),
    name: 'Администратор',
    role: 'admin'
  });
}

const complexes = store.complexes.getAll();
if (complexes.length === 0) {
  const initial = [
    { slug: 'park-gorod', name: 'Парк Город', location: 'Центральный район, ул. Парковая', description: 'Современные квартиры с панорамным остеклением.', price_from: '45 млн ₽', rooms: '1–4 комнаты', status: 'Сдача 2026', images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80'] },
    { slug: 'rechnye-zori', name: 'Речные Зори', location: 'Набережная, ул. Речная', description: 'Вид на воду из каждой квартиры.', price_from: '62 млн ₽', rooms: '2–5 комнат', status: 'Сдача 2025', images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'] },
    { slug: 'solnechnyy-kvartal', name: 'Солнечный Квартал', location: 'Южный район, пр. Солнечный', description: 'Эко-комплекс с солнечными панелями.', price_from: '38 млн ₽', rooms: 'Студии — 4 комнаты', status: 'Новинка', images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80'] }
  ];
  initial.forEach(c => store.complexes.create(c));
}

module.exports = store;

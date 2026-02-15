# LuxEstate — Сайт продажи жилых комплексов

## Установка

```bash
npm install
```

## Запуск

```bash
# Создать БД и первого администратора
npm run init-db

# Добавить начальные комплексы (опционально)
npm run seed

# Запустить сервер
npm start
```

Сайт: http://localhost:3000  
Админ-панель: http://localhost:3000/admin.html  

**Первый админ** (если не заданы переменные окружения):
- Email: `admin@luxestate.ru`
- Пароль: `admin123`

## API

### Без авторизации
- `POST /api/auth/register` — регистрация
- `POST /api/auth/login` — вход
- `GET /api/complexes` — список комплексов
- `GET /api/complexes/:slug` — один комплекс
- `GET /api/settings` — настройки сайта

### С JWT (Authorization: Bearer &lt;token&gt;)
- `GET /api/auth/me` — текущий пользователь
- `POST /api/complexes` — добавить комплекс (admin)
- `PUT /api/complexes/:id` — редактировать (admin)
- `DELETE /api/complexes/:id` — удалить (admin)
- `PUT /api/settings` — настройки (admin)
- `GET /api/users` — список пользователей (admin)

## Безопасность

- Пароли хэшируются (bcrypt)
- JWT для сессий
- SQLite с защитой от SQL-инъекций (prepared statements)
- Переменная `JWT_SECRET` — сменить в production

## Структура

- `data/database.sqlite` — база данных
- `db/database.js` — схема БД
- `routes/` — API
- `middleware/auth.js` — JWT, admin

ДЛЯ РАБОТЫ РАСПКАУЙТЕ В КОРЕНЬ ПРОЕКТА node_modules.zip

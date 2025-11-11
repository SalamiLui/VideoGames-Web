# VideoGames Commerce

Web app to explore and manage video games, built with Go for back and Next.js for the front

## Technologies

- **Backend:** Go, GORM, PostgreSQL, Gin
- **Frontend:** Next.js, React
- **Environment Variables:** `.env`  (not included in repo)
- **Version Control:** Git, GitHub

## Features

- List video games, wishlist, cart, mockup payment system, admin panel, filters
- User authentication, JWT security
- Creative UI
- Swagger documentation

## Backend Go

Create a .env file with following variables in each API (Login and Vdgm)
```bash
DB_USER=your_user
DB_PASS=your_password
DB_NAME=your_database
DB_PORT=5432
```

Install go dependencies
```bash
go mod tidy
```

Run it
```bash
go run ./main.go
```


CryptoTrade

CryptoTrade is a simple crypto trading demo app: React frontend, Node.js + Express backend, and MongoDB persistence.

1.Features:

User authentication (JWT)

Coins catalog (prices, available supply)

Transactions: buy / sell / list

Dashboard with portfolio calculation

Simple API for frontend consumption

2.FILE STRUCTURE

crypto-trade/

├─ backend/

│  ├─ package.json

│  ├─ .env.example

│  ├─ server.js                 # entrypoint (or index.js)

│  ├─ src/

│  │  ├─ controllers/

│  │  │  ├─ authController.js

│  │  │  ├─ coinsController.js

│  │  │  └─ transactionsController.js

│  │  ├─ middleware/

│  │  │  └─ auth.js

│  │  ├─ models/

│  │  │  ├─ User.js

│  │  │  ├─ Coin.js

│  │  │  └─ Transaction.js

│  │  ├─ routes/

│  │  │  ├─ auth.js

│  │  │  ├─ coins.js

│  │  │  └─ transactions.js

│  │  └─ config/

│  │     └─ db.js

│  └─ tests/

├─ frontend/

│  ├─ package.json

│  ├─ public/

│  └─ src/

│     ├─ api.js                  # axios instance

│     ├─ index.jsx

│     ├─ App.jsx

│     ├─ pages/

│     │  ├─ Dashboard.jsx

│     │  ├─ Login.jsx

│     │  ├─ Register.jsx

│     │  ├─ Buy.jsx

│     │  └─ Sell.jsx

│     ├─ components/

│     │  ├─ ProtectedRoute.jsx

├─ .gitignore

└─ README.md


3.Backend setup (Node + Express + MongoDB)

cd backend

Copy .env.example → .env and update values.

.env.example:

PORT=5000

MONGO_URI=mongodb://localhost:27017/cryptotrade

JWT_SECRET=supersecretkey

JWT_EXPIRES_IN=7d

Install and run:
npm install

npm run dev   

node server.js

4.Frontend setup (React)

cd frontend

npm install

Set API base in src/api.js (axios instance), e.g.:

import axios from 'axios';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' });

export default api;

Run dev server: npm start

5.Acknowledgments

Frontend: React.js, Chart.js, Axios

Backend: Node.js, Express.js, MongoDB
6.License

© 2025 Jyotsna Kasibhotla. All Rights Reserved.

The UI design, layout, and visual elements of CryptoTrade are the intellectual property of Jyotsna Kasibhotla.

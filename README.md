# 🛒 VendaSys — Sistema de Gestão de Vendas & Fiados

Sistema completo para gestão de vendas, clientes com controle de limite de crédito (fiado), produtos, usuários e relatórios.

---

## 🏗 Arquitetura

```
sistema-vendas/
├── backend/          # NestJS — API REST
│   └── src/
│       ├── modules/
│       │   ├── auth/           # JWT, Login
│       │   ├── users/          # CRUD + soft delete
│       │   ├── customers/      # CRUD + limite de crédito
│       │   ├── products/       # CRUD com categorias
│       │   ├── sales/          # Vendas/Fiados + baixa
│       │   ├── dashboard/      # KPIs + top devedores
│       │   └── import-export/  # Excel import/export
│       ├── common/             # Guards, decorators, filters
│       ├── shared/             # Enums globais
│       └── database/           # Config TypeORM
└── frontend/         # Vue 3 + Pinia
    └── src/
        ├── views/              # Telas completas
        ├── components/layout/  # Sidebar + TopBar
        ├── services/api.js     # Axios centralizado
        ├── stores/auth.js      # Pinia auth store
        └── router/             # Rotas com guards
```

---

## 🚀 Como rodar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

---

### Backend

```bash
cd backend

# 1. Instalar dependências
npm install

# 2. Criar arquivo .env (copiar do exemplo)
cp .env.example .env

# 3. Rodar o servidor
npm run start:dev
# → http://localhost:3000/api
# → Swagger: http://localhost:3000/api/docs
```

O banco de dados SQLite é criado automaticamente em `database.sqlite`.

**Criar o admin padrão:**
```bash
npx ts-node -r tsconfig-paths/register scripts/seed.ts
# Login: admin@sistema.com / admin123
```

Para usar PostgreSQL, edite o `.env`:
```env
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASS=sua_senha
DATABASE_NAME=vendas_db
```

---

### Frontend

```bash
cd frontend

# 1. Instalar dependências
npm install

# 2. Rodar o dev server
npm run dev
# → http://localhost:5173
```

O Vite já faz proxy de `/api` → `http://localhost:3000`.

---

## 👤 Usuários e permissões

| Role     | Permissões                                      |
|----------|-------------------------------------------------|
| `admin`  | Acesso total (usuários, config, tudo)           |
| `manager`| Visualiza usuários, tudo mais                   |
| `user`   | Clientes, Produtos, Vendas, Import/Export        |

Tipos de usuário: **Vendedor** / **Não Vendedor**

---

## 📋 Regras de negócio implementadas

- ✅ E-mail único por usuário
- ✅ Nome único por usuário
- ✅ Nome único por cliente (validação de duplicata no cadastro)
- ✅ Soft delete em usuários (campo `deleted`, nunca excluídos do BD)
- ✅ Limite de crédito por cliente (individual ou global para quem não tem)
- ✅ Badge "Limite excedido" quando a dívida ultrapassa o limite
- ✅ Pode continuar cadastrando vendas mesmo com limite excedido (apenas aviso)
- ✅ Calcular preço automaticamente ao selecionar produto + quantidade

---

## 📊 Dashboard

- **Cards KPI**: Total baixado (pago), total em aberto, total de vendas, clientes com dívida
- **Gráfico de barras**: Movimentação mensal (últimos 12 meses) — Total vs. Recebido
- **Top Devedores**: Ranking dos clientes que mais devem com tag de limite excedido

---

## 📁 Import / Export (Excel)

### Exportar
- Todos os dados (3 abas numa planilha)
- Apenas clientes
- Apenas produtos
- Apenas vendas

### Importar
- **Clientes** — campos: Nome*, Telefone, Endereço, Limite de Crédito
- **Produtos** — campos: Nome*, Preço*, Categoria*
- Download de templates pré-formatados
- Drag & drop de arquivos
- Resultado detalhado: quantos foram importados, quais linhas deram erro e o motivo

### Categorias de produto válidas
`Eletrônicos` | `Alimentos` | `Vestuário` | `Móveis` | `Beleza` | `Esporte` | `Saúde` | `Livros` | `Brinquedos` | `Outros`

---

## 🔌 Endpoints principais

```
POST   /api/auth/login
GET    /api/auth/profile

GET    /api/users
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id        (soft delete)

GET    /api/customers
GET    /api/customers/with-debt
POST   /api/customers
PUT    /api/customers/:id
PATCH  /api/customers/global-limit

GET    /api/products
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id

GET    /api/sales
POST   /api/sales
PATCH  /api/sales/:id/pay    (marcar como pago)
DELETE /api/sales/:id

GET    /api/dashboard
GET    /api/dashboard/top-debtors

GET    /api/import-export/export/all
GET    /api/import-export/export/customers
GET    /api/import-export/export/products
GET    /api/import-export/export/sales
GET    /api/import-export/template/customers
GET    /api/import-export/template/products
POST   /api/import-export/import/customers  (multipart/form-data)
POST   /api/import-export/import/products   (multipart/form-data)
```

---

## 🧱 Princípios aplicados (SOLID + Clean Code)

- **Single Responsibility**: cada service faz exatamente uma coisa
- **Open/Closed**: guards e decorators são extensíveis sem modificar código existente
- **Dependency Inversion**: services injetados via `@InjectRepository` e `@Injectable`
- **DRY**: `ensureEmailUnique` / `ensureNameUnique` centralizados nos services
- **Separation of concerns**: controllers só roteiam, services têm a lógica de negócio
- **Global Exception Filter**: tratamento centralizado de erros com logs
- **Soft delete**: dados nunca são excluídos fisicamente do banco

---

## 🔐 Segurança

- Senhas com bcrypt (salt 10)
- JWT com expiração configurável
- Guards `JwtAuthGuard` + `RolesGuard` em todas as rotas protegidas
- `@Exclude()` na senha — nunca retorna na API
- CORS habilitado (configure para seu domínio em produção)

---

## 🎨 Frontend — Design

- Dark theme com sistema de tokens CSS
- Fonte: **Sora** (display) + **JetBrains Mono** (valores numéricos)
- Sidebar colapsável
- Modais com Teleport + Transitions
- Toast notifications
- Tabelas com hover states e badges coloridos
- Gráficos com Chart.js

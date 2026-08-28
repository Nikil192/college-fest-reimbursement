# College Fest Reimbursement

A Next.js reimbursement management application backed by a local SQLite database through Prisma.

## Getting Started

Install dependencies and create the SQLite database:

```bash
npm install
npm run db:deploy
npm run db:seed
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

SQLite is the only supported database. Prisma stores the local database at `prisma/dev.db`; no database server or `DATABASE_URL` is required.

Useful commands:

```bash
npm run db:generate # regenerate the Prisma client
npm run db:deploy   # apply committed migrations
npm run db:migrate  # create and apply a development migration
npm run db:seed     # load sample data
npm run db:studio   # inspect the SQLite database
```

For production, deploy to a host with persistent filesystem storage for `prisma/dev.db`. Ephemeral or read-only serverless filesystems will not preserve SQLite data. The included GitHub Actions workflow deploys to a PM2-managed Oracle VPS on port `3001` and applies committed Prisma migrations before restarting the app.

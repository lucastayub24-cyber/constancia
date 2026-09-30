# Constancia

SaaS B2B para documentar trabajos y servicios con fotos, firma, QR verificable, PDF, cobros, pagos parciales, historial y próximos services.

## Stack
- Next.js 15 / React 19
- PostgreSQL + Prisma
- Mercado Pago Subscriptions
- Resend
- Cloudflare R2 / S3 compatible
- Vercel Cron

## Funciones
- Registro/login y recuperación de contraseña
- Multiempresa y plan Empresa multiusuario
- Clientes CRUD
- Constancias con evidencia, firma y QR
- Importe total, pagos parciales, medios de pago, saldo y vencimiento
- PDF A4 verificable
- Recordatorios automáticos de próximo service
- Suscripciones Mercado Pago
- Baja / arrepentimiento / privacidad sin login
- Panel admin con usuarios, suscripciones, cobros y solicitudes legales
- SEO por rubro + sitemap/robots

## Desarrollo
1. Copiar `.env.example` a `.env.local`.
2. Configurar PostgreSQL.
3. `npm install`
4. `npm run setup`
5. `npm run dev`

## Producción
Configurar todas las variables de entorno en Vercel, ejecutar `npm run db:push` o migraciones equivalentes, y desplegar `main`.

No subir secretos al repositorio.

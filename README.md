# Constancia

SaaS B2B para documentar trabajos y servicios con fotos, firma, QR verificable, PDF, importes, pagos y próximo service.

## Qué incluye

- Registro, login y recuperación de contraseña.
- Multiempresa y equipo por roles.
- Clientes: alta, edición y baja.
- Constancias con evidencia fotográfica privada, firma y QR público.
- Importe total, pago inicial, pagos parciales, saldo, vencimiento y medio de pago.
- PDF A4 que se actualiza con el historial de pagos.
- Suscripciones recurrentes con Mercado Pago.
- Webhooks para estado de suscripción y cobros autorizados.
- Recordatorios de próximos services y saldos pendientes.
- Panel admin del SaaS con usuarios, empresas, MRR, cobros y solicitudes legales.
- Términos, privacidad, arrepentimiento y baja.
- Landing pages SEO por rubro.
- GitHub Actions para validar Prisma, TypeScript y build.

## Producción

1. Crear PostgreSQL y definir DATABASE_URL.
2. Generar un JWT_SECRET aleatorio de al menos 32 caracteres.
3. Configurar Mercado Pago con MERCADOPAGO_ACCESS_TOKEN y MERCADOPAGO_WEBHOOK_SECRET.
4. Registrar el webhook de Mercado Pago en /api/mercadopago/webhook.
5. Configurar almacenamiento R2/S3 compatible para fotos.
6. Configurar Resend y un dominio remitente verificado para emails.
7. Definir CRON_SECRET. El cron diario está declarado en vercel.json.
8. Completar NEXT_PUBLIC_APP_URL y los datos legales/fiscales del proveedor.
9. Ejecutar npm install, npx prisma generate y npx prisma db push o una migración controlada.
10. Desplegar y crear la primera cuenta. La primera cuenta registrada queda como administrador global.

No guardar claves reales en Git. Usar .env.example solo como referencia.

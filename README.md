# 🚀 Backend de la Aplicación: Potenciando tu Experiencia

Este es el corazón de nuestra aplicación, un robusto backend construido con **NestJS**, un framework progresivo de Node.js. Diseñado para ser eficiente y escalable, este servicio proporciona una **API RESTful** completa para gestionar todos los datos de la aplicación, asegurando una interacción fluida y segura.

## ✨ Endpoints Principales

Nuestra API está estructurada para ofrecer una interacción clara y potente con los recursos de la aplicación. Aquí te presentamos los módulos clave:

- `/auth`: **Autenticación y Autorización** de usuarios.
- `/users`: Operaciones **CRUD** para la gestión de usuarios.
- `/posts`: Control total sobre las **publicaciones**.
- `/comments`: Gestión de **comentarios** asociados a las publicaciones.
- `/reactions`: Manejo de **reacciones** a publicaciones y comentarios.

Para una exploración exhaustiva y detallada de todos los endpoints, te invitamos a consultar nuestra **documentación interactiva de Swagger**. Una vez que el servidor esté en funcionamiento, podrás acceder a ella en:
[http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## 🛠️ Instalación Rápida

Para poner en marcha este backend, asegúrate de tener **pnpm** instalado globalmente. Si aún no lo tienes, puedes instalarlo fácilmente con npm:

```bash
npm install -g pnpm
```

Una vez que pnpm esté listo, sigue estos sencillos pasos para instalar todas las dependencias del proyecto:

```bash
pnpm install
```

## ▶️ Ejecución de la Aplicación

Inicia el servidor en diferentes modos según tus necesidades:

```bash
# Modo desarrollo
pnpm run start

# Modo vigilancia (watch mode)
pnpm run start:dev

# Modo producción
pnpm run start:prod
```

## 🧪 Pruebas

Asegura la calidad del código con nuestras pruebas:

```bash
# Pruebas unitarias
pnpm run test

# Pruebas e2e
pnpm run test:e2e

# Cobertura de pruebas
pnpm run test:cov
```

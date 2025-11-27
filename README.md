## Despliegue en Railway

La aplicación está desplegada en Railway utilizando el plan gratuito.

- **URL de producción:** https://book-review-production-f85b.up.railway.app

---

## Instrucciones de configuración (local y producción)

### Entorno local

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/Kevs77/book-app.git
   cd book-app

   Crear el archivo de entorno local a partir del archivo de ejemplo:
   ```

   ```bash

   .env.example .env.local
   Editar .env.local y completar las variables necesarias:
   ```

   env

DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
JWT_SECRET=un_secreto_jwt_largo_y_aleatorio

Instalar dependencias:

      ```bash

      npm install
      Ejecutar el entorno de desarrollo:
      ```

      ```bash

      npm run dev
      Abrir http://localhost:3000 en el navegador
      ```

### Entorno de producción (Railway)

Crear un proyecto en Railway y añadir el plugin de PostgreSQL

Crear un servicio Web en Railway conectado al repositorio de GitHub del proyecto

Configurar las variables de entorno del servicio Web, por ejemplo:

env

DATABASE_URL=postgresql://USER:PASSWORD@postgres.railway.internal:5432/DB_NAME
JWT_SECRET=un_secreto_jwt_de_produccion
NODE_ENV=production
Utilizar los comandos por defecto de Next.js para build y start:

Build: next build

Start: next start

Una vez completado el despliegue, Railway proporcionará una URL pública que se documenta en la sección anterior

### Archivo .env.example

El repositorio incluye un archivo .env.example que sirve como plantilla para configurar las variables de entorno necesarias

Ejemplo de contenido:

env

DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
JWT_SECRET=your_jwt_secret_here

### Tecnologías usadas

El proyecto utiliza el siguiente stack tecnológico:

Frontend y Backend

- Next.js (App Router)
- React
- TypeScript

Estilos

- Tailwind CSS

Base de datos

- PostgreSQL (hosteada en Railway)
- Cliente pg para la conexión desde la aplicación

Autenticación y seguridad

- bcryptjs para hash de contraseñas
- jsonwebtoken para la generación y verificación de JWT
- Cookies HttpOnly para el almacenamiento del token en el navegador

Infraestructura y herramientas

- Railway como plataforma de despliegue
- Git y GitHub para control de versiones y repositorio remoto

### Descripción del campo mood

El campo mood es un atributo adicional asociado a cada reseña de libro. Su propósito es registrar el estado de categoría

Características:

Se almacena como texto en la columna mood de la tabla reviews

Se captura a través de un campo de selección en el formulario de creación de reseñas

Ejemplos de valores utilizados:

- inspirador
- nostalgico
- terror
- reflexivo
- divertido

### Bugs conocidos o trade-offs

Algunos aspectos pendientes o decisiones conscientes de diseño son:

Paginación

- La paginación de la página /reviews se realiza actualmente en el frontend.
- Por cuestión de tiempo no se implementó paginación real en la API (LIMIT/OFFSET); para un entorno de producción sería recomendable mover la lógica de paginación al backend.

Validaciones

En el frontend se utilizan validaciones básicas, campos requeridos y longitudes mínimas
La validación principal se realiza en la capa de API, donde se comprueba:

- Presencia de todos los campos obligatorios
- Rango válido de rating entre 1 y 5
- Propiedad de la reseña antes de permitir su eliminación

Restricciones en base de datos

- La restricción de rating entre 1 y 5 se implementa en la lógica de la API en lugar de en la base de datos, debido a limitaciones en la configuración desde la interfaz de Railway

Autenticación avanzada

No se implementó un endpoint de cierre de sesión, si no directamente un boton de cambiar de usuario

### Tiempo estimado que tomó hacerlo

El desarrollo de la aplicación se realizó dentro del rango de tiempo previsto para un perfil junior

- Tiempo aproximado invertido 3 horas 30 minutos

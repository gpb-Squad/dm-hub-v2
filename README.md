# DM Hub V2

Portal de recursos del equipo con soporte para links y videos, configurable via JSON o Google Sheets.

## 🚀 Inicio rápido

```bash
# Instalar dependencias
npm install

# Iniciar en desarrollo
npm start

# Crear build para producción
npm run build
```

## ⚙️ Configuración

### Opción 1: Editar config.json (Más simple)

Edita el archivo `src/config.json` para cambiar títulos, links y secciones:

```json
{
  "siteTitle": "DM Hub",
  "siteSubtitle": "Portal de recursos del equipo",
  "sections": [
    {
      "id": "accounts",
      "title": "Accounts & SOWs",
      "icon": "📊",
      "items": [
        {
          "title": "Accounts SOWs",
          "link": "https://tu-link.com",
          "icon": "📁",
          "type": "link"
        }
      ]
    }
  ]
}
```

### Opción 2: Google Sheets (Recomendado para equipos)

1. **Crear la hoja** con estas columnas:
   | section | sectiontitle | sectionicon | title | link | icon | type |
   |---------|--------------|-------------|-------|------|------|------|
   | accounts | Accounts & SOWs | 📊 | Accounts SOWs | https://... | 📁 | link |
   | tools | Herramientas | 🛠️ | DM Calculator | https://... | 🧮 | link |
   | videos | Videos | 🎥 | Tutorial | https://youtube.com/embed/... | ▶️ | video |

2. **Publicar la hoja**:
   - File → Share → Publish to web
   - Seleccionar "Entire Document" y "Web page"
   - Click "Publish"

3. **Copiar el ID** de la URL:
   ```
   https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
   ```

4. **Actualizar config.json**:
   ```json
   {
     "googleSheetId": "PEGAR_ID_AQUI"
   }
   ```

## 📦 Deploy en GitHub Pages

1. Agregar en `package.json`:
   ```json
   {
     "homepage": "https://TU_USUARIO.github.io/dm-hub-v2"
   }
   ```

2. Instalar gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

3. Agregar scripts:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

## 📦 Deploy en Netlify

1. Crear build:
   ```bash
   npm run build
   ```

2. Arrastrar la carpeta `build` a [Netlify Drop](https://app.netlify.com/drop)

3. (Opcional) Agregar password:
   - Site settings → Access control → Password protection

## 🎨 Tipos de items

- **link**: Abre en nueva pestaña
- **video**: Abre modal con reproductor embebido (usar URL de embed de YouTube)

## 📝 Ejemplo de URL de video

YouTube normal: `https://www.youtube.com/watch?v=VIDEO_ID`
YouTube embed: `https://www.youtube.com/embed/VIDEO_ID`

## 🔧 Estructura del proyecto

```
dm-hub-v2/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.js
│   │   ├── Card.js
│   │   ├── Section.js
│   │   └── VideoModal.js
│   ├── hooks/
│   │   └── useGoogleSheets.js
│   ├── App.js
│   ├── config.json      ← Editar aquí
│   ├── index.js
│   └── styles.css
└── package.json
```

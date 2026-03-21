# PBI Docs — NADRO
## Biblioteca de documentación de reportes Power BI

---

## 📁 Estructura del proyecto

```
PBI-Docs/
├── main.py                 ← Servidor FastAPI (punto de entrada)
├── requirements.txt        ← Dependencias Python
├── start.bat               ← Doble clic para iniciar (Windows)
│
├── app/
│   ├── routes.py           ← Todos los endpoints de la API
│   ├── models.py           ← Modelos de datos (Pydantic)
│   └── storage.py          ← Lógica de lectura/escritura JSON
│
├── data/
│   ├── reportes.json       ← Base de datos de reportes
│   └── areas.json          ← Catálogo de áreas/direcciones
│
├── pdfs/                   ← PDFs subidos desde Power BI
│
└── static/
    ├── index.html          ← Frontend principal
    ├── css/styles.css      ← Estilos
    └── js/app.js           ← Lógica del frontend
```

---

## 🚀 Cómo iniciar

### Opción A — Doble clic (más fácil)
1. Abre la carpeta `PBI-Docs` en tu escritorio
2. Haz doble clic en `start.bat`
3. El servidor se inicia y abre el navegador automáticamente

### Opción B — Terminal manual
```bash
cd Desktop/PBI-Docs

# Primera vez: crear entorno e instalar dependencias
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt

# Iniciar servidor
python -m uvicorn main:app --reload --port 8000
```

Luego abre: **http://localhost:8000**

---

## 🔌 API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/reportes` | Lista todos los reportes |
| GET | `/api/reportes/{id}` | Obtiene un reporte |
| POST | `/api/reportes` | Crea un reporte nuevo |
| PUT | `/api/reportes/{id}` | Actualiza un reporte |
| DELETE | `/api/reportes/{id}` | Elimina un reporte |
| POST | `/api/reportes/{id}/pdf` | Sube el PDF del reporte |
| DELETE | `/api/reportes/{id}/pdf` | Elimina el PDF |
| GET | `/api/areas` | Lista todas las áreas |
| POST | `/api/areas` | Crea un área |
| PUT | `/api/areas/{id}` | Actualiza un área |
| DELETE | `/api/areas/{id}` | Elimina un área |
| GET | `/api/buscar?q=ventas` | Búsqueda por texto |
| GET | `/api/buscar?direccion=Dir.+Ventas` | Filtrar por dirección |
| GET | `/api/buscar?area=Canal+Nlinea` | Filtrar por área |
| GET | `/api/buscar?estado=activo` | Filtrar por estado |
| GET | `/api/stats` | Estadísticas generales |
| GET | `/docs` | Swagger UI (documentación interactiva de la API) |

---

## 📋 Cómo agregar un nuevo reporte

1. Abre la app en http://localhost:8000
2. Clic en **"+ Nueva documentación"** en el sidebar
3. Llena el formulario con nombre, dirección, área, etc.
4. Clic en **Crear**
5. El reporte aparece en el sidebar — luego puedes editar tablas, medidas y fuente directamente en `data/reportes.json`

---

## 🔍 Búsqueda por área/dirección

Desde el sidebar, usa los chips de **Filtrar por dirección** para ver solo los reportes de una dirección específica.

También puedes buscar desde la API:
```
GET /api/buscar?direccion=Dir.+Ventas
GET /api/buscar?q=nlinea
GET /api/buscar?area=Canal+Nlinea&estado=activo
```

---

## 📄 Subir PDF de un reporte

1. Abre un reporte en la app
2. Ve a la pestaña **Vista PDF**
3. Arrastra o selecciona el PDF exportado desde Power BI Desktop
4. El PDF queda guardado en la carpeta `/pdfs/` y se muestra embebido

---

## ➕ Agregar más reportes (con Claude)

Para documentar un nuevo reporte Power BI:
1. Conéctate al reporte desde Claude con el MCP de Power BI
2. Pídele: *"Genera la documentación completa de este reporte y agrégala a la app"*
3. Claude extrae tablas, columnas, medidas, relaciones y fuentes
4. Agrega el JSON directamente a `data/reportes.json`

---

## 📦 Requisitos

- Python 3.10+
- Windows 10/11 (el `start.bat` es para Windows; en Mac/Linux usa el Opción B)

# DEPLOY-GUIDE.md — Paso a paso: GitHub → Vercel → Móvil

Este documento te lleva desde "tengo los archivos en mi disco" hasta "los 12 ejecutivos LVAM usan la app desde su celular".

Tiempo estimado total: **15–25 minutos** la primera vez. Despliegues siguientes: **30 segundos**.

---

## Resumen visual del flujo

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│  Tu computador  │ ──▶ │   GitHub     │ ──▶ │   Vercel    │ ──▶ │  Celulares   │
│  (archivos)     │     │  (repo)      │     │  (hosting)  │     │  (PWA)       │
└─────────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
```

Hacés el cambio una vez. GitHub guarda. Vercel lo publica automático. Los celulares lo reciben.

---

## Archivos que SÍ tienen que ir al repo

```
appbot-lvam/          ← este es tu repo
├── index.html                ← la app principal
├── manifest.json             ← config PWA
├── sw.js                     ← service worker
├── vercel.json               ← config de hosting
├── .gitignore                ← qué NO subir
├── README.md                 ← opcional, recomendado
├── corpus/
│   ├── apv.json              ← 49 entries
│   ├── regulacion.json       ← 72 entries
│   ├── operaciones.json      ← 44 entries
│   └── flv.json              ← 48 entries
└── config/
    ├── search-config.json    ← pesos del motor
    └── synonyms.json         ← 63 sinónimos
```

**Total: 12 archivos.**

## Archivos que NO subir

- `run-engine-tests.js` (solo para testing local)
- Carpeta `governance/` (documentación interna)
- Carpeta `tests/` (validación local)
- Cualquier `.bak`, `.log`, `.DS_Store`

El `.gitignore` ya los excluye automáticamente.

---

## Parte 1 — Crear cuenta GitHub (si todavía no tenés)

1. Andá a [github.com](https://github.com)
2. Click en **Sign up**
3. Email + password + username (sugerido: `ruben-perez-lvam` o lo que prefieras)
4. Verificar email

Si ya tenés cuenta, saltá a la Parte 2.

---

## Parte 2 — Crear el repositorio en GitHub

### Opción A — Vía interfaz web (más simple, recomendada para vos)

1. Login en GitHub.
2. Arriba a la derecha, click en el **`+`** → **New repository**.
3. **Repository name**: `appbot-lvam` (o el nombre que prefieras).
4. **Description**: `Asistente comercial FFVV LVAM` (opcional).
5. **Privacidad**: elegí **Private**. Es información interna LVAM. Vercel funciona con repos privados sin costo.
6. NO marques "Add a README file" (lo subimos nosotros).
7. NO marques "Add .gitignore" (lo subimos nosotros).
8. Click **Create repository**.

Te lleva a una pantalla vacía con instrucciones. **Ignorala**, vamos por otro camino más fácil.

### Subir los archivos sin git CLI

1. En la página del repo recién creado, click en **uploading an existing file** (link azul en el medio de la pantalla).
2. **Arrastrar** la carpeta entera `lvam-mvp/` desde tu Explorador/Finder a la zona de upload.
   - GitHub web no acepta carpetas vacías. Por eso usá esta opción:
3. **Alternativa más confiable**: subí los archivos en grupos.
   - Primero los 4 de la raíz: `index.html`, `manifest.json`, `sw.js`, `vercel.json`.
   - Click **Commit changes**.
   - Repetí: click **Add file → Upload files**.
   - Subí `corpus/apv.json`, `corpus/regulacion.json`, `corpus/operaciones.json`, `corpus/flv.json`.
     - GitHub web crea la carpeta `corpus/` automáticamente cuando subís un archivo con esa ruta.
     - Si arrastrás carpeta completa funciona también.
   - Click **Commit changes**.
   - Repetí con `config/search-config.json` y `config/synonyms.json`.
   - Click **Commit changes**.
4. Verificá que el repo tiene la estructura completa (los 12 archivos).

### Opción B — Vía git CLI (si preferís terminal)

Si tenés git instalado:

```bash
cd ruta/donde/tenes/lvam-mvp
git init
git add .
git commit -m "primer despliegue asistente FFVV LVAM"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/appbot-lvam.git
git push -u origin main
```

(Reemplazá `TU-USUARIO` por tu username de GitHub.)

---

## Parte 3 — Crear cuenta Vercel y conectar el repo

1. Andá a [vercel.com](https://vercel.com).
2. Click en **Sign Up**.
3. Click en **Continue with GitHub**.
4. Autorizá Vercel para acceder a tus repos (esto es lo que permite el deploy automático).
5. Si te pide elegir plan, **Hobby (gratis)** es suficiente — incluye HTTPS, deploys ilimitados, dominios `.vercel.app`.

### Importar el repo

1. Una vez logueado, click en **Add New... → Project** arriba a la derecha.
2. En "Import Git Repository", buscás tu repo `appbot-lvam`.
3. Click **Import** al lado del nombre del repo.
4. En la pantalla de configuración del proyecto:
   - **Project Name**: dejá lo que sugiere o ponele `appbot` (esto será parte de la URL).
   - **Framework Preset**: dejá **Other** (es estático, no hay framework).
   - **Root Directory**: dejá **./** (raíz del repo).
   - **Build Command**: dejá vacío.
   - **Output Directory**: dejá vacío.
   - **Install Command**: dejá vacío.
   - **Environment Variables**: ninguna.
5. Click **Deploy**.

Vercel tarda **30–60 segundos** en deploar. Verás una animación con confetti cuando termina.

Te queda una URL del tipo:
```
https://appbot.vercel.app
```
o
```
https://appbot-tu-usuario.vercel.app
```

Esa es la URL de producción. Esa es la que vas a compartir a los 12 ejecutivos.

---

## Parte 4 — Verificar que funciona en escritorio

1. Abrí la URL de Vercel en Chrome/Edge/Safari.
2. Esperá 1–2 segundos. Deberías ver la cascada `[1/8]` → `[8/8] Aplicación lista`.
3. Click en el bug 🐛 en la topbar → panel diagnóstico. Verificá:
   - "Carga de archivos": los 6 archivos con `200 OK` en verde.
   - "Corpus cargados": APV(49), REG(72), OPS(44), FLV(48) todos `loaded`.
   - "Entries indexadas": **213** en verde.
   - "Service Worker": `activated · sw.js · Cache: lvam-ffvv-v2-2026-06-13`.
4. Escribí "qué es APV" en la caja de búsqueda → debe aparecer APV-001 en top.
5. Click en APV-001 → debe abrirse la entry view con contenido.

Si algo de esto falla, abrí DevTools (F12) → Console y Network, y compartime captura. La instrumentación te va a decir exactamente qué falló.

---

## Parte 5 — Usar la app en celular

### URL para compartir

```
https://appbot.vercel.app
```

(Reemplazá por la URL real que te dio Vercel.)

Mandala por WhatsApp, mail, lo que sea, a los 12 ejecutivos.

### Instalación como PWA en Android (Chrome)

1. Abrir la URL en Chrome.
2. Esperar que cargue (la primera vez tarda ~1–2 segundos, después es instantánea por el cache del Service Worker).
3. Chrome muestra al pie un banner **"Agregar AppBOT a pantalla principal"** o **"Instalar"**.
   - Si NO lo muestra automático: menú (⋮) arriba a la derecha → **Instalar app** o **Agregar a pantalla principal**.
4. Confirmar.
5. Aparece ícono en la pantalla principal como una app más. Al abrirla, se ve **sin barra del navegador**, igual que una app nativa.

### Instalación como PWA en iPhone/iPad (Safari)

Importante: **iOS solo permite instalar PWA desde Safari**, no desde Chrome iOS (que internamente es Safari pero no permite "Agregar a pantalla").

1. Abrir la URL en Safari.
2. Esperar que cargue.
3. Tocar el botón **Compartir** (cuadrado con flecha hacia arriba, abajo al centro).
4. Bajar y elegir **Agregar a pantalla de inicio**.
5. Confirmar nombre ("AppBOT") → **Agregar**.
6. Aparece ícono en pantalla principal. Al abrirlo, se ve como app nativa (sin barra Safari).

### Comportamiento esperado en móvil

- **Primera apertura con red**: descarga 12 archivos (~150 KB total). Tarda 1-2 segundos.
- **Aperturas siguientes**: el Service Worker sirve desde caché del dispositivo. Instantáneo, **funciona sin conexión** después de la primera carga.
- **Actualización**: cuando publiques cambios en GitHub, Vercel deploya automático y los celulares reciben la nueva versión la próxima vez que abran la app (puede tardar 1 visita extra para que el SW se actualice).

---

## Parte 6 — Publicar cambios después del primer deploy

### Si usás GitHub web (interfaz)

1. Navegás a tu repo en github.com.
2. Click en el archivo a modificar (ej: `corpus/apv.json`).
3. Click en el icono de lápiz ✏️ arriba a la derecha.
4. Editar el contenido.
5. Bajar al final, **Commit changes**.
6. Vercel detecta el cambio automáticamente y redeploya en 30-60 segundos.

### Si usás git CLI

```bash
# editar archivos localmente
git add .
git commit -m "ajuste: descripción del cambio"
git push
```

Vercel deploya automático.

### Importante para cambios en `sw.js` o JSON cacheados

Si modificás `index.html`, `sw.js`, o cualquier corpus JSON, **bumpear el `CACHE_VERSION` en `sw.js`**:

```javascript
// sw.js línea 4
const CACHE_VERSION = "lvam-ffvv-v3-2026-06-15";  // cambiar la fecha
```

Esto fuerza a que los Service Workers viejos se invaliden y los celulares descarguen la versión nueva. Sin esto, los celulares siguen mostrando la versión vieja desde cache.

Rutina recomendada en cada release de contenido:
1. Modificar el JSON/HTML.
2. Bumpear `CACHE_VERSION` en `sw.js`.
3. Commit + push.
4. Esperar deploy de Vercel.

---

## Parte 7 — Dominio personalizado (opcional)

Si querés que la URL sea algo como `asistente.lvam.cl` en vez de `appbot.vercel.app`:

1. En Vercel → tu proyecto → **Settings → Domains**.
2. Agregar `asistente.lvam.cl`.
3. Vercel te da instrucciones específicas de DNS (típicamente un registro CNAME apuntando a `cname.vercel-dns.com`).
4. Configurá esos DNS en el panel donde tenés registrado el dominio LVAM (Cloudflare, GoDaddy, Namecheap, lo que sea).
5. Esperá ~10 minutos a que propague.
6. Vercel emite certificado HTTPS automático para ese dominio.

---

## Parte 8 — Troubleshooting común

### "La app sigue mostrándome la versión vieja en mi celular"

- Service Worker está cacheando. Solución:
  - En Chrome Android: Configuración del sitio → **Borrar datos**.
  - En Safari iOS: Configuración iPhone → Safari → **Borrar historial y datos**.
  - O bumpear `CACHE_VERSION` en sw.js antes de hacer push.

### "Vercel deploya pero los archivos JSON no cargan"

- Verificar en DevTools → Network que las URLs sean `https://tu-dominio.vercel.app/corpus/apv.json` (no `file://`).
- Si dan 404: revisar que los archivos JSON estén realmente en el repo en GitHub.

### "El panel de diagnóstico dice 'SW: no registrado'"

- Service Worker solo funciona bajo HTTPS. Vercel te da HTTPS automático, así que esto NO debería pasar. Si pasa, mirá la URL — ¿es realmente `https://`?

### "Los 12 ejecutivos no pueden acceder"

- Si el repo es privado, eso NO afecta el acceso público a la URL de Vercel. La URL de Vercel es siempre pública (a menos que actives password protection en Vercel, que es feature pago).
- Confirma que les mandaste la URL HTTPS correcta.

### "Quiero ocultar la URL al público"

- Vercel Pro (pago) tiene **Password Protection**. La URL pide password antes de mostrar el contenido.
- Alternativa gratuita: integrar autenticación dentro de la app (Magic Link de Supabase, por ejemplo) — eso es para fase posterior.

---

## Resumen de comandos críticos

| Acción | Cómo |
|---|---|
| Primer deploy | GitHub → Vercel Import → Deploy |
| Publicar cambio | Editar en GitHub web o `git push` |
| Forzar actualización en móviles | Bumpear `CACHE_VERSION` en `sw.js` |
| Ver URL pública | Vercel → tu proyecto → arriba a la derecha |
| Ver logs de deploy | Vercel → tu proyecto → Deployments |
| Rollback a versión anterior | Vercel → Deployments → elegir uno anterior → **Promote to Production** |

---

## Checklist final antes de compartir a los 12 ejecutivos

- [ ] Los 12 archivos están en GitHub (verificar visualmente en el repo).
- [ ] Vercel terminó el deploy con éxito (estado **Ready** en verde).
- [ ] Abrir la URL en escritorio y verificar que llega a `[8/8] Aplicación lista`.
- [ ] Panel diagnóstico muestra 6/6 archivos con 200 OK y 213 entries.
- [ ] Probar "qué es APV" → resultado correcto.
- [ ] Probar instalación en un celular Android.
- [ ] Probar instalación en un celular iPhone (Safari).
- [ ] Confirmar que en celular se ve igual de bien (responsive).
- [ ] Tener listas las instrucciones de instalación PWA para compartir.

---

**Fin de la guía.**

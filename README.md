# AppBOT (LVAM) — MVP

PWA single-page para uso interno de Fuerza de Ventas LVAM. Búsqueda sobre corpus APV / REG / OPS / FLV con bitácora local y métricas básicas.

## Estructura

```
lvam-mvp/
├── index.html              # App principal (single-file HTML/JS/CSS vanilla)
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker (cache-first con stale-while-revalidate)
├── corpus/
│   ├── apv.json            # 50 entries
│   ├── regulacion.json     # 72 entries
│   ├── operaciones.json    # 44 entries
│   └── flv.json            # 48 entries
├── config/
│   ├── search-config.json  # pesos, boosts, penalties, threshold
│   └── synonyms.json       # 63 sinónimos iniciales (siglas + coloquiales + normativos)
├── governance/
│   ├── search-changelog.md
│   ├── improvement-ledger.md
│   └── pilot-governance-review.md
└── tests/
    └── anonymization-tests.html  # P0-3 — debe correr 100% verde
```

## Cómo probar localmente

La app usa `fetch()` para cargar los JSONs, por lo que **no funciona abriendo `index.html` con `file://`**. Hay que servirla con un HTTP server local:

```bash
# Opción 1: Python (incluido en macOS/Linux)
cd lvam-mvp/
python3 -m http.server 8080
# abrir http://localhost:8080/

# Opción 2: Node
npx serve lvam-mvp -p 8080

# Opción 3: Vercel dev (recomendado para staging)
cd lvam-mvp/
vercel dev
```

## Despliegue a Vercel

**P0-2 (bloqueante)**: SPA rewrites obligatorios. Sin esto, refresh en `/entry/APV-001` devuelve 404.

Crear archivo `vercel.json` en raíz del proyecto:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Pero como esta app usa **routing por hash** (`#/search?q=...`, `#/entry/X`), técnicamente no requiere rewrites estrictos para que el routing funcione. Sin embargo, si en el futuro se migra a routing pushState, los rewrites serán necesarios. Recomendación: configurar igualmente como seguro.

## Pre-deploy checklist (P0)

- [ ] `tests/anonymization-tests.html` muestra **100% PASS**.
- [ ] `corpus/*.json` y `config/*.json` validan al cargar la app (revisar consola).
- [ ] V13 (`/about`) muestra `globalHealth: healthy`.
- [ ] Probar las 5 queries críticas: `tope apv`, `art 107`, `regimen a`, `traspaso fondo`, `cliente conservador`.
- [ ] Verificar que el modal de identificación valida `@larrainvial.com`.
- [ ] Verificar que IndexedDB persiste eventos tras cerrar/reabrir tab.
- [ ] Lighthouse PWA score ≥ 80.

## Estructura de la app (etapas IF-02)

| Etapa | Componente | Línea aprox. |
|---|---|---|
| 1 | Loader JSON con Promise.allSettled + retries | `fetchJson`, `loadAll` |
| 2 | Validator Nivel A + B básico | `validateCorpus` |
| 3 | CategoryHealth (3 estados) + globalHealth | `deriveGlobalHealth` |
| 4 | Índice unificado | `buildIndex` (byId + allEntries) |
| 5 | Search engine simplificado | `search`, `scoreEntry`, `expandTokens` |
| 6 | Entry view con cross-refs agrupados | `renderEntry` |
| 7 | Routing hash-based (4 URLs) | `handleRoute`, `parseHash`, `navigateTo` |
| 8 | UI completa (Home, Search, Entry, Identif, Loading, Empty, About) | múltiples render* |
| 9 | Bitácora IF-05 (4 campos por evento) + anonimización pre-persistencia | `logEvent`, `anonymize` |
| 10 | V13 simplificada: 3 bloques (búsquedas, problemáticas, adopción) + por categoría (A2) | `renderAbout`, `computeWeeklyMetrics` |
| 11 | PWA: manifest.json + sw.js | `manifest.json`, `sw.js` |

## Métricas que captura la app

Desde la primera consulta:

- **Búsquedas por categoría** (A2): consultas, clicks, CTR — desglose APV/REG/OPS/FLV.
- **Consultas problemáticas**: sin resultado o sin click.
- **Adopción semanal** (A4): usuarios activos únicos / 12 habilitados.
- **Estado editorial**: vencidas / pendientes / sin validación, por categoría.

**Métricas que NO captura aún** (acción manual de Owner A/B según gobernanza):

- ERR / HER — cálculo manual semanal desde bitácora.
- Clasificación A1 (¿se entiende?) — revisión cualitativa manual semanal de ~30 sesiones.
- Clasificación A3 (tipo de consulta) — clasificación manual semanal de ~50 queries.

## Bitácora — esquema IndexedDB

- DB: `lvam-ffvv` (v1)
- Object stores: `user`, `sessions`, `events`
- Eventos capturados: `query_executed`, `result_clicked`, `entry_viewed`, `crossreference_clicked`, `feedback_given`, `system_status_viewed`
- Anonimización pre-persistencia: RUT con/sin punto, email, teléfono +56 9.

## Limitaciones conocidas del MVP

1. **No hay sync cloud** — bitácora vive solo en el dispositivo. Si el usuario limpia cache, se pierde. (Fase 3)
2. **No hay auth real** — identidad declarada por el usuario, sin verificación. (Fase 4)
3. **No hay categorías Argumentarios ni Comparativos** — gap conocido. Comunicar al piloto (P0-5).
4. **Pesos del motor son heurísticos** — recalibrar tras semana 2 con bitácora real (registrar en `improvement-ledger.md`).
5. **Routing por hash** — funciona en file:// y sin rewrites, pero las URLs son menos limpias.

## Soporte y feedback

- Owner A: Rubén Pérez (jefe comercial & habilitación digital)
- Owner B: [pendiente designación · P0-1]
- Reportar issues directamente con captura de pantalla a Rubén.

## Git

Tag inicial: `v1.0-corpus-base`

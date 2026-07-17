# CONTROL DE VERSIONES — Grain Store

## Repositorio

```
https://github.com/gusmancamila93-ops/grain_store_conexion_backend
```

Repositorio **público**, verificado accesible sin autenticación.

## Rama principal

**`main`** — es la **única rama activa del proyecto** (verificado con `git branch -a` tanto en local como en el remoto de GitHub) y es la rama sobre la que se despliega automáticamente tanto el backend (Render) como el frontend (Vercel).

## Estrategia de ramas utilizada

El desarrollo se hizo mayoritariamente de forma directa sobre `main` durante las fases de análisis, diseño, implementación del backend, integración y documentación inicial. Para los dos bloques de cambios más recientes (manejo de errores + evidencia académica + despliegue; y, después, pruebas automatizadas) se usó **una rama de feature con Pull Request en cada caso**, siguiendo el mismo patrón:

### Ciclo 1 — PR #1: manejo de errores de carga + evidencia académica + despliegue

1. Se creó la rama `feature/manejo-errores-y-evidencia-ev02` a partir de `main`.
2. Se realizaron los commits de esa etapa sobre esa rama.
3. Se abrió el Pull Request #1 (`feature/manejo-errores-y-evidencia-ev02` → `main`).
4. Tras verificar el despliegue y detectar/corregir el problema de rutas (ver [PRUEBAS_SISTEMA.md](PRUEBAS_SISTEMA.md)), el PR se fusionó a `main` mediante *squash merge*, lo que disparó el redeploy automático en Render y Vercel.
5. **Limpieza:** una vez confirmado (con `git diff main feature/manejo-errores-y-evidencia-ev02 --stat`, sin salida — es decir, sin ninguna diferencia de contenido) que el *squash merge* había capturado el 100% de los cambios de la rama, se eliminó `feature/manejo-errores-y-evidencia-ev02` tanto localmente (`git branch -D`) como en el remoto (`git push origin --delete`), dejando **`main` como única rama del repositorio**.

### Ciclo 2 — PR #2: pruebas automatizadas y clasificación de documentación histórica

1. Se creó la rama `feature/pruebas-automatizadas-ev02` a partir de `main` (ya con el commit `ea067df`, posterior al cierre inicial de esta evidencia).
2. Se implementaron y ejecutaron 105 pruebas automatizadas reales (unitarias e integración, backend y frontend — ver [PRUEBAS_SISTEMA.md](PRUEBAS_SISTEMA.md)) y se marcó como histórica la documentación de una fase anterior de esta misma evidencia, todo en un único commit sobre esa rama.
3. Se abrió el Pull Request #2 (`feature/pruebas-automatizadas-ev02` → `main`); GitHub confirmó `mergeable_state: clean` (sin conflictos con `main`).
4. El PR se fusionó a `main` mediante *squash merge* (commit `32dc8ca`), consistente con el método usado en el PR #1.
5. **Limpieza:** se eliminó `feature/pruebas-automatizadas-ev02` tanto localmente (`git branch -d`) como en el remoto (`git push origin --delete`), verificando después con `git branch -a` y `git ls-remote --heads origin` que **`main` volvió a quedar como única rama del repositorio**.
6. Tras la fusión se reverificó que el sistema sigue compilando (`npm run build`) y que las 105 pruebas automatizadas continúan aprobando sobre `main`.

Esta combinación (commits directos a `main` en las fases iniciales + un Pull Request por cada bloque de cambios posterior, cerrado en ambos casos con la eliminación de la rama de feature) refleja el flujo real de trabajo de esta evidencia, sin inventar una estrategia de ramas más compleja de la que efectivamente se usó.

## Commits relevantes relacionados con esta evidencia

| Commit | Descripción |
|---|---|
| `7d0c226` | Configuración inicial del proyecto (Vite + Tailwind) |
| `538e1cb` | Análisis inicial y arquitectura base |
| `3f06728` / `5c0cc20` | Fase de maquetado visual del frontend |
| `847141e` | CRUD del frontend + análisis inicial de backend (Fase 1 de la evidencia AA1-EV01) |
| `8fb1dc7` | Diseño de arquitectura del backend (Fase 2) |
| `ec03197` | Implementación completa del backend (Fase 3) |
| `50e9b3c` | Integración real frontend↔backend (Fase 4) |
| `e2d3db4` | Corrección de bugs detectados en verificación de navegador |
| `cf17258` | Documentación final del backend (Fase 5) |
| `3f64224` | README profesional del sistema completo |
| `3ab4a7c` | **Merge del PR #1**: manejo de errores de carga + evidencia GA8-220501096-AA1-EV02 (incluye `vercel.json` y la configuración de `VITE_API_URL` hacia Render) |
| `ea067df` | Evidencia GA8-220501096-AA1-EV02 y limpieza del repositorio para la entrega (commit directo a `main`, cierre de la primera ronda de la evidencia) |
| `32dc8ca` | **Merge del PR #2**: suite de 105 pruebas automatizadas (backend y frontend) y clasificación de documentación histórica de esta evidencia |

## Confirmación: sin credenciales sensibles en Git

Se verificó explícitamente qué archivos de variables de entorno están versionados:

```
$ git ls-files | grep -i "\.env"
.env
.env.example
backend/.env.example
```

- **`.env`** (raíz): contiene únicamente `VITE_API_URL`, una URL pública del backend — **no es un secreto**.
- **`.env.example`** y **`backend/.env.example`**: plantillas sin valores reales, solo nombres de variables.
- **`backend/.env`** (el que sí contiene la cadena de conexión real a la base de datos de Aiven y el `JWT_SECRET` de producción) **no está versionado** — está excluido explícitamente en `.gitignore` (`backend/.env`) y nunca se hizo `git add` sobre él en ningún commit de esta evidencia.

**Conclusión:** no existen credenciales, contraseñas, cadenas de conexión ni secretos almacenados en el historial de Git de este repositorio.

## Limpieza de archivos no esenciales para la entrega

Como parte de la revisión final se analizaron las carpetas `.claude/` y `.vscode/`:

| Carpeta | Contenido | ¿Necesaria para ejecutar el sistema? | Acción |
|---|---|---|---|
| `.claude/` | `launch.json` — configuración del entorno de asistencia de IA (Claude Code) para lanzar el servidor de desarrollo en su panel de vista previa | No — es exclusiva de esa herramienta, no la usa Vite, Node, Render ni Vercel | Eliminada del repositorio (estaba rastreada en Git); se agregó `.claude/` a `.gitignore` |
| `.vscode/` | `launch.json` — configuración de depuración de VS Code, apuntando a un puerto (`8080`) que no coincide con el puerto real del proyecto (`5173`), evidenciando que era un remanente obsoleto | No — es exclusiva del editor VS Code | Eliminada del disco local; ya estaba excluida de Git desde antes (`.vscode/*` en `.gitignore`), por lo que **nunca formó parte del repositorio** |

Ninguno de los dos archivos era referenciado por la documentación de esta evidencia ni por ningún script de `package.json`, `vite.config.js` o el backend — su eliminación no afecta la ejecución local, el build de producción ni los despliegues.

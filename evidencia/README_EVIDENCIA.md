# README de la evidencia — GA8-220501096-AA1-EV02

> **Documento histórico — fase anterior del proyecto.**
> Este archivo corresponde a una versión anterior de la evidencia GA8-220501096-AA1-EV02,
> elaborada antes del despliegue definitivo del sistema y antes de implementar las
> pruebas automatizadas. Se conserva como registro histórico y no debe usarse como
> referencia del estado actual del proyecto.
>
> La documentación oficial y vigente para la entrega de esta evidencia se encuentra en
> [`GA8-220501096-AA1-EV02/`](../GA8-220501096-AA1-EV02/README_EVIDENCIA.md).

Esta carpeta contiene el material de apoyo de la evidencia **"Módulos integrados"**.
El documento principal es
[`../Evidencia_GA8-220501096-AA1-EV02.md`](../Evidencia_GA8-220501096-AA1-EV02.md),
ubicado en la raíz del proyecto; los archivos de aquí lo complementan con detalle
adicional por tema.

## Contenido de esta carpeta

| Archivo | Contenido |
|---|---|
| `README_EVIDENCIA.md` | Este índice |
| `estructura.md` | Árbol completo del proyecto (frontend + backend), carpeta por carpeta |
| `modulos.md` | Ficha detallada de cada módulo del sistema (objetivo, entradas, procesamiento, salidas, dependencias, endpoints) |
| `pruebas.md` | Casos de prueba manuales ejecutados y su resultado real, incluyendo los bugs encontrados y corregidos |
| `urls.md` | Estado del despliegue (actualmente pendiente) y qué falta exactamente para completarlo |
| `capturas_requeridas.md` | Checklist de capturas de pantalla que deben tomarse manualmente para adjuntar a la entrega |

## Cómo se generó esta evidencia

Todo el contenido se obtuvo analizando el proyecto real en su estado actual:
lectura directa del código fuente, ejecución de `git log`/`git remote`/`git fetch`,
ejecución real de `npm run build`, y pruebas manuales ejecutadas contra el backend
(vía `curl`) y contra la aplicación completa en el navegador. No se inventó ningún
dato; donde algo no pudo determinarse automáticamente (por ejemplo, URLs de un
despliegue que no existe) se indica explícitamente como pendiente.

## Documentos relacionados en la raíz del proyecto

- [`Evidencia_GA8-220501096-AA1-EV02.md`](../Evidencia_GA8-220501096-AA1-EV02.md) — documento principal de esta evidencia.
- [`README.md`](../README.md) — documentación general del sistema completo.
- [`README_BACKEND.md`](../README_BACKEND.md) — documentación específica del backend.
- [`API_DOCUMENTATION.md`](../API_DOCUMENTATION.md) — referencia completa de endpoints.
- [`MANUAL_INSTALACION.md`](../MANUAL_INSTALACION.md) — guía de instalación paso a paso.
- [`DOCUMENTACION_TECNICA.md`](../DOCUMENTACION_TECNICA.md) — decisiones técnicas, seguridad y limitaciones.
- [`ANALISIS_BACKEND.md`](../ANALISIS_BACKEND.md) / [`DISENO_BACKEND.md`](../DISENO_BACKEND.md) — evidencia de las fases previas (análisis y diseño).

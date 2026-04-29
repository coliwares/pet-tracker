# Plan de Mejoras 28-04

## Objetivo

Ordenar las mejoras detectadas para Pet Tracker en un backlog accionable, priorizado y alineado con los principios del proyecto:

1. Seguridad
2. Correctitud funcional
3. UX mobile-first
4. Simplicidad de mantenimiento
5. Performance razonable

Este documento reemplaza una versión anterior más extensa y menos operativa. La idea aquí no es listar "todo lo posible", sino separar:

- mejoras que conviene ejecutar pronto
- iniciativas valiosas pero no urgentes
- apuestas futuras que requieren más validación

## Resumen Ejecutivo

La base actual del producto es buena: ya existe autenticación, gestión de mascotas, historial de eventos, enlaces compartidos, QR, dashboard y primeros pasos de onboarding. El mayor valor ahora no está en sumar muchas funciones nuevas de golpe, sino en consolidar la experiencia actual para que sea más confiable, clara y fácil de usar.

### Enfoque recomendado

- primero cerrar flujos sensibles y contratos de UI
- después completar módulos parcialmente resueltos
- luego sumar capacidades nuevas con impacto medible

### Oportunidades principales

- estabilizar compartir carnet y QR
- unificar textos, estados y contratos visuales
- completar mejor el perfil del tutor
- seguir elevando el dashboard como centro de control
- preparar terreno para recordatorios, medicamentos y exportación

## Estado Actual

### Fortalezas

- flujo base de mascotas y eventos ya operativo
- historial médico con estructura entendible
- dashboard con métricas y recordatorios
- enlaces compartidos con expiración
- onboarding inicial ya más cercano al estado real del usuario
- interfaz visual consistente en las superficies principales

### Brechas

- algunos flujos aún dependen de copy frágil o selectores inestables
- hay módulos resueltos a nivel visual, pero no del todo consolidados a nivel de UX
- faltan más pruebas E2E para validar contratos críticos
- existen iniciativas grandes descritas de forma ambiciosa, pero sin recorte de alcance

## Criterios de Priorización

### Alta prioridad

Aplica cuando una mejora:

- reduce riesgo funcional
- estabiliza un flujo sensible
- mejora una tarea frecuente del usuario
- evita deuda de producto o QA

### Prioridad media

Aplica cuando una mejora:

- aumenta claridad o eficiencia del uso diario
- completa un módulo importante ya iniciado
- prepara una capacidad futura sin ser bloqueo actual

### Prioridad baja

Aplica cuando una mejora:

- es principalmente cosmética
- requiere nuevas validaciones o integraciones externas
- no desbloquea una necesidad inmediata del producto

## Backlog Priorizado

## 1. Consolidación del producto actual

### 1.1 Estabilizar el flujo de share y QR

**Prioridad:** Alta

**Problema**

Compartir el carnet es un flujo de alto valor, pero sigue siendo sensible a cambios de copy, a estados del enlace y a validaciones E2E frágiles.

**Objetivo**

Hacer que compartir sea confiable, entendible y fácil de verificar automáticamente.

**Alcance recomendado**

- consolidar los textos clave entre dashboard y vista compartida
- revisar el estado del enlace temporal y su expiración
- reforzar el fallback cuando falle el QR
- agregar selectores estables donde hoy los tests dependen de copy literal
- revisar permisos y comportamiento de solo lectura

**Resultado esperado**

- menos regresiones en share
- mayor confianza para usuarios y QA
- mejor base para futuras opciones de compartir

### 1.2 Consolidar documentación y textos

**Prioridad:** Alta

**Problema**

Hay términos cercanos pero no siempre consistentes: carnet, ficha, historial, perfil, compartir, recordatorio.

**Objetivo**

Unificar lenguaje de producto y alinear documentación, UI y tests.

**Alcance recomendado**

- definir vocabulario canónico
- normalizar títulos, ayudas y mensajes de error
- corregir acentos y encoding en documentos y copys visibles
- reducir dependencia de textos exactos en E2E cuando no sea necesario

**Resultado esperado**

- menos ruido entre diseño, desarrollo y QA
- mayor consistencia de marca y producto

### 1.3 Completar pulido del perfil del tutor

**Prioridad:** Alta

**Problema**

El perfil del tutor ya tiene una base útil, pero todavía puede mejorar en percepción de completitud, feedback y utilidad dentro del resto del producto.

**Objetivo**

Convertirlo en un módulo claramente valioso, no solo en un formulario aislado.

**Alcance recomendado**

- mejorar jerarquía y feedback de guardado
- reforzar los estados de progreso y utilidad del perfil
- revisar validaciones y mensajes
- decidir dónde se reutiliza esta información en flujos compartidos o fichas

**Resultado esperado**

- mejor calidad de datos del tutor
- más claridad para el usuario sobre por qué completar su perfil

### 1.4 Mejorar consistencia entre dashboard y detalle

**Prioridad:** Alta

**Problema**

El dashboard y el detalle de mascota ya convergieron bastante, pero todavía pueden compartir mejor sus patrones de jerarquía, badges, estados y lenguaje.

**Objetivo**

Hacer que ambas pantallas se sientan como partes de un mismo sistema y no como módulos separados.

**Alcance recomendado**

- unificar patrones de métricas, badges y acciones primarias
- revisar textos de ayuda y estados vacíos
- mantener consistencia visual en recordatorios, historial y tarjetas

**Resultado esperado**

- menor carga cognitiva
- UI más predecible
- mantenimiento más simple

## 2. Mejoras funcionales ya iniciadas

### 2.1 Expandir casos E2E

**Prioridad:** Media

**Objetivo**

Cubrir mejor los flujos críticos ya existentes antes de abrir demasiado el alcance funcional.

**Casos sugeridos**

- share y QR
- edición de mascota
- onboarding según estado real
- filtros del dashboard
- filtros y estados del historial
- perfil del tutor

**Resultado esperado**

- menor riesgo de regresión
- releases más confiables

### 2.2 Mejorar filtros y estados del historial

**Prioridad:** Media

**Estado**

Ya hay avances concretos en esta línea. Lo siguiente debería enfocarse más en refinamiento que en rediseño.

**Próximos ajustes posibles**

- validar edge cases de fechas y recordatorios
- reforzar legibilidad mobile en listas largas
- verificar que el resumen superior y los filtros sigan exactamente la misma lógica

### 2.3 Afinar onboarding según estado real del usuario

**Prioridad:** Media

**Estado**

También ya existen mejoras importantes. Lo pendiente es seguir cerrando casos frontera.

**Próximos ajustes posibles**

- distinguir mejor usuarios nuevos versus usuarios con datos históricos parciales
- revisar cuándo mostrar, ocultar o descartar pasos
- evitar cualquier dependencia accidental de query params o estados transitorios

## 3. Iniciativas de impacto medio

### 3.1 Sistema de recordatorios y notificaciones

**Prioridad:** Media

**Por qué importa**

Es una de las funcionalidades con más valor para retención, pero conviene abordarla cuando los estados del historial y los flujos de eventos estén bien consolidados.

**Versión inicial recomendada**

- recordatorios por fecha próxima
- preferencias básicas por tipo de evento
- avisos dentro de la app antes de pensar en canales externos

### 3.2 Gestión de medicamentos

**Prioridad:** Media

**Por qué importa**

Amplía el caso de uso más allá de vacunas y visitas, y puede apoyarse en la misma lógica de historial, vencimientos y recordatorios.

**Versión inicial recomendada**

- registrar tratamiento
- dosis y frecuencia
- recordatorio de próxima toma o vencimiento

### 3.3 Exportación y reportes básicos

**Prioridad:** Media

**Por qué importa**

El producto ya tiene suficiente información como para justificar una primera exportación útil.

**Versión inicial recomendada**

- vista imprimible
- exportación simple del historial
- resumen de vacunas y controles

## 4. Oportunidades futuras

### 4.1 Integración con veterinarios

**Prioridad:** Baja por ahora

Es valiosa, pero tiene dependencia externa, más complejidad operativa y riesgo de ensanchar demasiado el producto antes de cerrar el núcleo actual.

### 4.2 Multiusuario y permisos granulares

**Prioridad:** Baja por ahora

Tiene buen potencial, especialmente para familias o cuidadores, pero exige un diseño muy cuidadoso de ownership, RLS, auditoría y UX.

### 4.3 Registro nacional de mascotas

**Prioridad:** Baja por ahora

Puede dar mucho valor local, pero depende de integración externa, validación legal y estabilidad del flujo de datos.

### 4.4 Dashboards internos y widgets

**Prioridad:** Baja

Útiles para operación o seguimiento, pero menos urgentes que consolidar las vistas principales del usuario final.

### 4.5 IA, marketplace y app nativa

**Prioridad:** Exploración futura

Son apuestas interesantes, pero todavía demasiado grandes para el momento actual del producto.

## Roadmap Sugerido

### Fase 1: Consolidación

- share y QR
- textos y documentación
- perfil del tutor
- consistencia dashboard/detalle
- estabilización E2E crítica

### Fase 2: Profundización del producto base

- ajustes finales de historial y onboarding
- recordatorios iniciales
- medicamentos versión 1
- exportación básica

### Fase 3: Expansión

- integraciones externas
- permisos más avanzados
- funcionalidades operativas o de negocio

## Principios para evaluar nuevas ideas

Antes de sumar una mejora al roadmap, conviene responder:

1. ¿Resuelve un problema real y frecuente?
2. ¿Aumenta confiabilidad o solo agrega superficie?
3. ¿Se puede lanzar en una versión pequeña y validable?
4. ¿Respeta el enfoque mobile-first?
5. ¿Aumenta complejidad de RLS, auth o mantenimiento?

Si la respuesta a varias de estas preguntas es débil, probablemente no debería entrar todavía.

## Próximos Pasos Recomendados

### Opción A: foco en estabilidad

- cerrar share/QR
- alinear textos
- robustecer E2E

### Opción B: foco en completitud del producto base

- terminar perfil del tutor
- terminar consistencia dashboard/detalle
- agregar primera iteración de recordatorios

### Opción C: foco en valor nuevo

- medicamentos versión 1
- exportación básica

La recomendación actual es priorizar la Opción A y luego pasar a la Opción B.

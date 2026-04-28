# Documentación

Este archivo es el índice canónico del proyecto. `README.md` queda como resumen operativo y aquí vive el detalle para evitar duplicación entre documentos.

## Cómo navegar

- Empieza por `setup/` si vas a levantar el proyecto o revisar infraestructura.
- Usa `testing/` si vas a validar cambios o revisar cobertura esperada.
- Consulta `product/` para contexto funcional, backlog y riesgos.
- Revisa `design/` para criterios de UX y formularios.
- Mueve a `archive/` cualquier material histórico que ya no sea fuente de verdad.

## Índice

### Setup

- [GETTING_STARTED.md](setup/GETTING_STARTED.md): instalación, variables de entorno, Supabase y SMTP con Resend
- [SECURITY_IMPROVEMENTS.md](setup/SECURITY_IMPROVEMENTS.md): decisiones de seguridad y checklist técnico
- [STORAGE_SETUP.md](setup/STORAGE_SETUP.md): bucket, policies y validaciones de archivos

### Testing

- [TESTING_GUIDE.md](testing/TESTING_GUIDE.md): flujo recomendado de validación
- [TESTING_PLAN.md](testing/TESTING_PLAN.md): cobertura funcional esperada

### Product

- [MEJORAS_PRIORITARIAS.md](product/MEJORAS_PRIORITARIAS.md): backlog priorizado
- [MVP_COMPLETADO.md](product/MVP_COMPLETADO.md): alcance implementado
- [PET_TRACKER_REVIEW.md](product/PET_TRACKER_REVIEW.md): hallazgos, riesgos y deuda
- [GO_TO_MARKET.md](product/GO_TO_MARKET.md): lineamientos comerciales iniciales

### Design

- [DESIGN_UPDATE.md](design/DESIGN_UPDATE.md): principios visuales y dirección UI
- [FORMS_UPDATE.md](design/FORMS_UPDATE.md): reglas de formularios y consistencia de inputs

### Archivo histórico

- [archive/CHANGELOG.md](archive/CHANGELOG.md)
- [archive/IMPLEMENTATION_CHECKLIST.md](archive/IMPLEMENTATION_CHECKLIST.md)
- [archive/QUICK_REFERENCE.md](archive/QUICK_REFERENCE.md)
- [archive/RATE_LIMIT_FIX.md](archive/RATE_LIMIT_FIX.md)
- [archive/pet-carnet-claude.md](archive/pet-carnet-claude.md)

## Convenciones

- Mantener documentos cortos, accionables y con una sola fuente de verdad.
- Referenciar otros documentos cuando el detalle ya exista, en vez de duplicarlo.
- Mover contenido exploratorio, obsoleto o reemplazado a `archive/`.

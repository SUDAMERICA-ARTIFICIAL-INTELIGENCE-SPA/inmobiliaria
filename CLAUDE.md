# ArgusLLM â€” Reglas de Calidad para Claude Code

## Identidad

Eres un **Senior Software Engineer** con 15+ aÃ±os de experiencia. Todo cÃ³digo que generes, modifiques o revises **DEBE** cumplir los 5 gates de calidad definidos abajo. No hay excepciones. Si un gate no se puede cumplir, documenta explÃ­citamente la razÃ³n.

---

## Gate A â€” Tests (Cobertura â‰¥ 80%)

- **SIEMPRE** genera tests unitarios para cada funciÃ³n/mÃ©todo pÃºblico.
- Cobertura mÃ­nima: **80%** de lÃ­neas y branches.
- Incluye **casos borde**: valores nulos, listas vacÃ­as, strings vacÃ­os, nÃºmeros negativos, lÃ­mites de rango.
- Incluye **casos de error**: inputs invÃ¡lidos, excepciones esperadas, timeouts.
- Nombra los tests descriptivamente: `test_should_return_empty_list_when_no_items_found`.
- Un test por comportamiento. No agrupar mÃºltiples assertions no relacionadas.

### Comandos de verificaciÃ³n
```bash
# Python
pytest --cov=src --cov-report=term-missing --cov-fail-under=80

# JavaScript/TypeScript
npx vitest run --coverage --coverage.thresholds.lines=80
```

---

## Gate B â€” Complejidad CiclomÃ¡tica (MÃ¡ximo 10)

- Ninguna funciÃ³n debe superar complejidad ciclomÃ¡tica de **10**.
- Funciones de **mÃ¡ximo 30 lÃ­neas** (sin contar docstrings/comments).
- **MÃ¡ximo 3 niveles** de anidaciÃ³n (if dentro de for dentro de if = 3).
- Si una funciÃ³n crece, **extraer** lÃ³gica a funciones auxiliares con nombres descriptivos.
- Preferir **early returns** sobre else anidados.
- Preferir **pattern matching / diccionarios de dispatch** sobre cadenas de if/elif.

### Comandos de verificaciÃ³n
```bash
# Python
radon cc src/ -n C -s  # Muestra funciones con complejidad >= C (11+)

# JavaScript/TypeScript
npx eslint --rule '{"complexity": ["error", 10]}' src/

# PowerShell
Invoke-ScriptAnalyzer -Path scripts/ -Recurse  # Requiere PSScriptAnalyzer
# Fallback si PSScriptAnalyzer no estÃ¡: heurÃ­stica de anidaciÃ³n (>4) y largo de funciÃ³n (>60 lÃ­neas)
```

---

## Gate C â€” DuplicaciÃ³n de CÃ³digo (DRY)

- Si un bloque de cÃ³digo se repite **2 o mÃ¡s veces**, extraer a funciÃ³n/mÃ³dulo reutilizable.
- Umbral mÃ¡ximo de duplicaciÃ³n: **5%** del cÃ³digo total.
- Usar herencia, composiciÃ³n o mixins para compartir comportamiento entre clases.
- Constantes y configuraciones en un solo lugar (no magic numbers/strings dispersos).

### Comandos de verificaciÃ³n
```bash
# Python
npx jscpd --pattern "**/*.py" --threshold 5

# JavaScript/TypeScript
npx jscpd --pattern "**/*.{ts,js,tsx,jsx}" --threshold 5
```

---

## Gate D â€” Seguridad (SAST)

- **Validar TODAS** las entradas de usuario (tipo, rango, formato, longitud).
- **NUNCA** hardcodear secrets, tokens, passwords, API keys. Usar variables de entorno.
- **NUNCA** usar funciones deprecated o inseguras (`eval`, `exec`, `innerHTML` sin sanitizar).
- **Sanitizar** queries SQL (usar parÃ¡metros preparados, NUNCA concatenar strings).
- **Sanitizar** output HTML (prevenir XSS).
- **Validar** URLs y paths (prevenir SSRF y path traversal).
- Dependencias: verificar vulnerabilidades conocidas.

### Comandos de verificaciÃ³n
```bash
# Python
bandit -r src/ -ll

# JavaScript/TypeScript
npm audit --audit-level=high
npx eslint --plugin security src/
```

---

## Gate E â€” Rendimiento

- **No** bucles anidados O(nÂ²) sobre colecciones que puedan crecer (>100 elementos).
- Preferir **operaciones bulk** (batch inserts, bulk API calls) sobre operaciones individuales en loop.
- Documentar la **complejidad algorÃ­tmica** de funciones crÃ­ticas en docstring/JSDoc.
- Usar **paginaciÃ³n** para queries que retornen muchos resultados.
- Evitar **N+1 queries** en acceso a base de datos.
- Preferir **lazy loading** sobre eager loading cuando no se necesiten todos los datos.

### Comandos de verificaciÃ³n
```bash
# Ambos lenguajes â€” detecciÃ³n de patrones
grep -rn "for.*for\|\.forEach.*\.forEach" src/ --include="*.py" --include="*.ts" --include="*.js"
```

---

## Flujo de Trabajo Obligatorio

### Antes de escribir cÃ³digo
1. Entender el requerimiento completo.
2. Identificar el lenguaje del proyecto (buscar `package.json` o `pyproject.toml`).
3. DiseÃ±ar la soluciÃ³n considerando los 5 gates.

### Durante el desarrollo
4. Escribir tests primero (TDD cuando sea prÃ¡ctico).
5. Implementar la soluciÃ³n con complejidad mÃ­nima.
6. Refactorizar para eliminar duplicaciÃ³n.

### DespuÃ©s del desarrollo
7. Ejecutar los quality gates:
```bash
# Desde la raÃ­z del proyecto (si ArgusLLM estÃ¡ instalado globalmente)
argus quality
# O directamente
scripts/quality-gate.sh
powershell -File scripts/quality-gate.ps1
```
8. Llenar el reporte de calidad en `prompts/quality-report.md`.

---

## Reporte de Calidad (Obligatorio)

Al finalizar CUALQUIER tarea, genera un reporte usando la plantilla `prompts/quality-report.md` con:

| Gate | Estado | Detalle |
|------|--------|---------|
| A. Tests | PASS/FAIL | Cobertura: X% |
| B. Complejidad | PASS/FAIL | MÃ¡x complejidad: X |
| C. DuplicaciÃ³n | PASS/FAIL | DuplicaciÃ³n: X% |
| D. Seguridad | PASS/FAIL | Issues: X |
| E. Rendimiento | PASS/FAIL | Patrones detectados: X |

Si algÃºn gate es **FAIL**, documenta:
- QuÃ© fallÃ³
- Por quÃ© no se puede cumplir (si aplica)
- Plan de acciÃ³n para resolverlo

---

## Sistema Multi-Agente

Este proyecto soporta un equipo de **8 agentes IA especializados** trabajando en paralelo. Los agentes se coordinan via `Docs/AgentSync.md` y se invocan como slash commands.

### Agentes Disponibles
| Agente | Rol | Slash Command |
|--------|-----|---------------|
| Project Manager | Estrategia (no programa) | `/project-manager` |
| Tech Lead | Arquitectura y diseÃ±o | `/tech-lead` |
| Guardian de Datos | DBA + Security | `/claude-bd` |
| Dev-Backend | Endpoints, lÃ³gica de negocio | `/dev-backend` |
| Dev-Frontend | UI, componentes, estado | `/dev-frontend` |
| FullStack | IntegraciÃ³n FEâ†”BE | `/fullstack` |
| QA-Sentinel | Testing y reportes (no corrige) | `/qa-sentinel` |
| Codex-Delegate | Tareas mecÃ¡nicas | `/codex-delegate` |

### CoordinaciÃ³n
- Canal principal: `Docs/AgentSync.md`
- Skills de cada agente: `.claude/commands/` (local) o `~/.argus-llm/.claude/commands/` (global)
- DocumentaciÃ³n de roles: `Agentes.md`
- Orquestador: `scripts/agent-orchestrator.ps1`
- CLI: `argus` (global) o `argus-cli.ps1` (local)

### Goal Loop
El sistema soporta **loops iterativos** hasta cumplir un objetivo:
```bash
argus pipeline "Implementar sistema de favoritos" --goal all-gates-pass --max-iterations 5
```
El loop ejecuta: Pipeline completo â†’ QA verifica â†’ Si FAIL: re-ejecuta solo agentes con fixes â†’ QA re-verifica â†’ ... hasta PASS o max iteraciones.


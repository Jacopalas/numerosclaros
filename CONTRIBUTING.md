# Contribuir a NumerosClaros

Gracias por tu interés en contribuir a NumerosClaros. Este proyecto nace con la idea de que cualquier persona en España pueda entender sus finanzas con herramientas claras, gratuitas y de código abierto. Toda ayuda es bienvenida.

## Cómo contribuir

### Reportar bugs

Si encuentras un error en alguna calculadora o en la web, abre un issue en GitHub con:

- Descripción clara del problema.
- Pasos para reproducirlo.
- Resultado esperado vs. resultado obtenido.
- Capturas de pantalla si aplica.
- Navegador y dispositivo donde ocurre.

### Sugerir mejoras

¿Tienes una idea para mejorar una calculadora existente o la experiencia de usuario? Abre un issue con la etiqueta `mejora` y describe:

- Qué quieres mejorar y por qué.
- Cómo crees que debería funcionar.

### Añadir una calculadora nueva

Las nuevas calculadoras son la contribución más valiosa. Si quieres añadir una:

1. Abre un issue describiendo la calculadora (qué calcula, para quién es útil, qué datos usa).
2. Espera confirmación antes de empezar a desarrollarla.
3. Implementa la lógica en `src/engine/` con tests.
4. Crea el Web Component en `src/calculators/`.
5. Documenta las fórmulas en `FORMULAS.md`.

### Mejorar documentación

La documentación es tan importante como el código. Correcciones, aclaraciones o ejemplos nuevos son siempre bienvenidos.

### Traducir

NumerosClaros está en español, pero aceptamos traducciones a otros idiomas oficiales de España y al inglés.

## Desarrollo local

```bash
# Clonar el repositorio
git clone https://github.com/Jacopalas/numerosclaros.git
cd numerosclaros

# Instalar dependencias
npm install

# Arrancar el servidor de desarrollo
npm run dev

# Ejecutar tests
npm test
```

## Estructura del proyecto

```
src/
  calculators/   — Web Components (interfaz de cada calculadora)
  engine/        — Lógica de cálculo pura (sin dependencias de DOM)
  sheets/        — Funciones para Google Sheets
website/         — Landing page y documentación
tests/           — Tests
```

## Guía de estilo

- **TypeScript estricto**: `strict: true` en tsconfig. Sin `any` salvo casos justificados.
- **Tests obligatorios**: toda lógica en `src/engine/` debe tener tests. No se aceptan PRs sin ellos.
- **Documentar fórmulas**: cada calculadora debe tener sus fórmulas documentadas en `FORMULAS.md` con referencias a la fuente oficial (BOE, Agencia Tributaria, etc.).
- **Nombres de componentes**: siguen el patrón `nc-nombre-calculadora` (ejemplo: `nc-irpf`, `nc-hipoteca`).
- **CSS dentro del Shadow DOM**: los estilos de cada componente van encapsulados. No se usan estilos globales.
- **Commits claros**: describe qué cambia y por qué, en español o inglés.

## Proceso de PR

1. Haz un fork del repositorio.
2. Crea una rama descriptiva (`feat/calculadora-irpf`, `fix/redondeo-hipoteca`).
3. Desarrolla tu cambio con tests.
4. Asegúrate de que todos los tests pasan con `npm test`.
5. Abre un Pull Request describiendo:
   - Qué hace tu cambio.
   - Por qué es necesario.
   - Cómo probarlo.
6. Espera revisión. Puede que pidamos ajustes antes de hacer merge.

## Código de conducta

Tratamos a todas las personas con respeto. No se tolera discriminación, acoso ni comportamiento hostil de ningún tipo. Queremos un espacio donde cualquiera pueda contribuir sin importar su experiencia, identidad o procedencia. Si alguien incumple esto, contacta con los mantenedores y actuaremos.

## Licencia

Al contribuir a NumerosClaros, aceptas que tu código se publicará bajo la [Licencia MIT](LICENSE). Esto permite que cualquiera lo use, modifique y distribuya libremente.

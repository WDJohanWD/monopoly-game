# Guía de Testing - Sistema Integrado de Monopoly

## 🧪 Testing del Sistema Integrado

### 1. Verificar que todo compile correctamente

```bash
cd monopoly-frontend
npm run build
```

Debe completar sin errores.

### 2. Testing en desarrollo

```bash
npm run dev
```

Luego accede a `http://localhost:5173/board/game-123` (cambia game-123 por un ID válido)

## 🔍 Casos de Testing

### Test 1: Carga inicial del juego

**Pasos**:
1. Navega a `/board/:gameId`
2. Espera a que cargue el juego

**Esperado**:
- ✅ Tablero se renderiza correctamente
- ✅ Se muestran todos los jugadores
- ✅ Se muestran todas las 40 casillas
- ✅ Los jugadores están en sus posiciones correctas
- ✅ El jugador actual está resaltado

---

### Test 2: Lanzamiento de dados

**Pasos**:
1. Haz clic en "Lanzar Dados"
2. Observa la animación

**Esperado**:
- ✅ Los dados giran animadamente
- ✅ Muestran números aleatorios (1-6 cada uno)
- ✅ Se muestra el total
- ✅ Si son dobles, aparece "¡Dobles! 🎲🎲"
- ✅ El botón se deshabilita durante el lanzamiento

---

### Test 3: Movimiento del jugador

**Pasos**:
1. Lanza dados (ej: 3 y 4 = 7 movimientos)
2. Observa al jugador moverse paso a paso

**Esperado**:
- ✅ El jugador se mueve 7 casillas paso a paso
- ✅ Cada movimiento tiene una pequeña pausa
- ✅ Las animaciones son fluidas
- ✅ Si pasa por GO, reinicia en posición 0
- ✅ La posición se actualiza en el panel de info

---

### Test 4: Cambio de turno

**Pasos**:
1. Termina turno (después de movimiento)
2. Observa que pase al siguiente jugador

**Esperado**:
- ✅ El jugador actual cambia
- ✅ El nuevo jugador está resaltado
- ✅ Su color está destacado
- ✅ El panel muestra su información actualizada

---

### Test 5: Integración con API

**Pasos**:
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña Network
3. Realiza acciones en el juego (lanzar dados, comprar, etc.)

**Esperado**:
- ✅ Se hacen llamadas POST a `/api/game/{id}/roll`
- ✅ Se hacen llamadas POST a `/api/game/{id}/buy`
- ✅ Se hacen llamadas GET a `/api/game/{id}`
- ✅ Todas las respuestas devuelven status 200
- ✅ Los datos en la respuesta coinciden con lo mostrado

---

### Test 6: Propiedades y compras

**Pasos**:
1. Mueve un jugador a una propiedad disponible
2. Haz clic en "Comprar Propiedad"
3. Verifica que se actualice el estado

**Esperado**:
- ✅ La propiedad se marca como comprada
- ✅ Aparece un puntito verde en la casilla
- ✅ El dinero del jugador disminuye
- ✅ Se muestra el dueño de la propiedad en hover

---

### Test 7: Responsive Design

**Pasos**:
1. Abre DevTools (F12)
2. Activa modo responsive
3. Prueba en diferentes tamaños:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)

**Esperado**:
- ✅ El tablero se adapta correctamente
- ✅ Los controles son usables en todos los tamaños
- ✅ Sin scroll horizontal innecesario
- ✅ El texto es legible

---

### Test 8: Manejo de errores

**Pasos**:
1. Apaga el servidor backend
2. Intenta jugar
3. Observa el mensaje de error

**Esperado**:
- ✅ Se muestra un error claro
- ✅ Hay opción para volver al inicio
- ✅ La UI no se congela
- ✅ Se puede reintentar

---

### Test 9: Performance

**Pasos**:
1. Abre DevTools
2. Ve a Performance
3. Graba mientras juegas 5-10 turnos
4. Analiza los frames

**Esperado**:
- ✅ 60 FPS en animaciones
- ✅ Cambios de estado sin lag
- ✅ Llamadas a API sin bloquear UI
- ✅ Memoria estable

---

### Test 10: Sincronización

**Pasos**:
1. Abre dos ventanas del navegador
2. Una es el juego en Game 1, otra en Game 2
3. Realiza acciones en ambas
4. Verifica que no entren en conflicto

**Esperado**:
- ✅ Cada juego es independiente
- ✅ No hay interferencia entre juegos
- ✅ Los IDs de juego se mantienen correcto

---

## 📊 Checklist de Validación

### Componentes
- [ ] MonopolyBoard renderiza correctamente
- [ ] DiceRoller anima los dados
- [ ] GameContainer maneja todo el flujo
- [ ] Panel de control funciona

### API
- [ ] Crear juego funciona
- [ ] Obtener juego funciona
- [ ] Lanzar dados funciona
- [ ] Comprar propiedad funciona
- [ ] Terminar turno funciona

### Animaciones
- [ ] Dados girar suavemente
- [ ] Movimiento de jugadores fluido
- [ ] Transiciones sin lag
- [ ] Efecto hover en casillas

### UI/UX
- [ ] Interfaz clara y intuitiva
- [ ] Botones bien etiquetados
- [ ] Feedback visual para acciones
- [ ] Mensajes de error claros
- [ ] Responsive en todos los tamaños

### Estado
- [ ] Jugadores se actualizan correctamente
- [ ] Dinero se refleja bien
- [ ] Posiciones son precisas
- [ ] Turnos avanzan correctamente
- [ ] Propiedades se marcan bien

### Error Handling
- [ ] Conectar sin API muestra error
- [ ] Respuestas inválidas se manejan
- [ ] Puede recuperarse de errores
- [ ] Logs útiles en consola

---

## 🐛 Debugging Tips

### Ver logs de API
```typescript
// En ConsoleDevTools verás:
// 1. Llamadas HTTP
// 2. Respuestas JSON
// 3. Errores con detalles
```

### Inspeccionar estado
```typescript
// Abre console y escribe:
// Verás en Network tab todas las llamadas
```

### Validar datos
```typescript
// Los tipos TypeScript validan en tiempo de compilación
// Abre el build para ver errores de tipo
```

---

## 📝 Reportar Issues

Cuando encuentres un bug, incluye:

1. **Pasos para reproducir**
   ```
   1. Navegar a /board/xyz
   2. Hacer clic en...
   3. Observar que...
   ```

2. **Resultado esperado**
   ```
   Debería mostrar...
   ```

3. **Resultado actual**
   ```
   Muestra...
   ```

4. **Console log/errores**
   ```
   [Copiar y pegar]
   ```

5. **Navegador y versión**
   ```
   Chrome 120, Firefox 121, Safari 17, etc.
   ```

---

## 🎯 Casos Edge

### Edge Case 1: Pasar GO
- Cuando un jugador llega o pasa por GO (posición 0)
- Debe obtener $200
- Debe resetear a posición 0 o ajustarse

### Edge Case 2: Dobles
- Si saca dobles, debe poder lanzar de nuevo
- Tercera vez con dobles, va a la cárcel
- Debe validarse en backend

### Edge Case 3: Sin dinero
- Si un jugador no tiene dinero para una compra
- Debe mostrar error
- Opción para hipotecar propiedades

### Edge Case 4: Cárcel
- Entrar a la cárcel
- Salir pagando $50 o con dobles
- Girar 3 turnos

### Edge Case 5: Red de Internet lenta
- API tarda 5+ segundos
- No debe congelar la UI
- Debe mostrar estado de carga

---

## ✅ Validación Final

Antes de pasar a producción:

```bash
# 1. Build sin errores
npm run build
✓ Passed

# 2. No warnings en consola
npm run lint
✓ Passed

# 3. Testing manual completado
✓ Todos los tests pasaron

# 4. Performance
✓ 60 FPS en animaciones

# 5. Accesibilidad
✓ Funciona sin mouse
✓ Contraste de colores OK
```

---

## 📞 Soporte Técnico

Para problemas específicos:

1. **Componentes**: Revisa `/components`
2. **API**: Revisa `/services/api.ts`
3. **Tipos**: Revisa `/types/game.types.ts`
4. **Hooks**: Revisa `/hooks/useGameAnimations.ts`


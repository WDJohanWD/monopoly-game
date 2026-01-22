# 🚀 Quick Start - Monopoly Frontend Integrado

## ⚡ 5 Minutos para Comenzar

### 1. Instalación (1 min)

```bash
# Dependencias ya instaladas ✅
npm install
```

### 2. Iniciar Servidor de Desarrollo (1 min)

```bash
npm run dev
```

Accede a `http://localhost:5173`

### 3. Backend Running (1 min)

Asegúrate de que el backend esté corriendo en `http://localhost:5093`

```bash
# En tu proyecto backend
dotnet run
```

### 4. Crear un Juego (1 min)

Usa Postman o tu cliente HTTP favorito:

```bash
POST http://localhost:5093/api/game
Content-Type: application/json

{
  "players": [
    { "name": "María", "color": "#EF4444" },
    { "name": "Juan", "color": "#3B82F6" }
  ],
  "startingMoney": 1500
}
```

Copia el `id` de la respuesta.

### 5. Jugar (1 min)

Navega a: `http://localhost:5173/board/{game-id}`

¡Listo! 🎮

---

## 📖 Documentación Rápida

### Dónde buscar qué

| Pregunta | Archivo |
|----------|---------|
| ¿Cómo usar los componentes? | `EJEMPLOS_USO.ts` |
| ¿Cómo está estructurado? | `ARQUITECTURA_VISUAL.md` |
| ¿Cómo testear? | `TESTING_GUIDE.md` |
| ¿Cómo integrar? | `INTEGRACION_FRONTEND.md` |
| ¿Qué se hizo? | `RESUMEN_INTEGRACION.md` |
| ¿Está todo completo? | `CHECKLIST_IMPLEMENTACION.md` |

### Estructura de Carpetas

```
src/
├── types/           ← Tipos TypeScript
├── components/      ← Componentes React
│   ├── Board/       ← Tablero
│   ├── Dice/        ← Dados
│   └── Game/        ← Orquestador
├── hooks/           ← Hooks personalizados
└── services/        ← Cliente API
```

---

## 🎮 Primeros Pasos

### Opción 1: Usar Page predefinida
```tsx
import { Board } from '@/Pages/Board';

// En router
<Route path="/board/:gameId" element={<Board />} />
```

### Opción 2: Usar GameContainer
```tsx
import { GameContainer } from '@/components';

export function MyGame() {
  return <GameContainer gameId="game-123" />;
}
```

### Opción 3: Componentes individuales
```tsx
import { MonopolyBoard, DiceRoller } from '@/components';

export function CustomGame() {
  return (
    <div>
      <MonopolyBoard 
        tiles={tiles} 
        players={players}
      />
      <DiceRoller 
        dice1={1} 
        dice2={1} 
        isRolling={false}
        onRoll={handleRoll}
      />
    </div>
  );
}
```

---

## 🔌 Configuración API

### Variable de Entorno

```env
# .env.local
VITE_API_URL=http://localhost:5093/api
```

Si cambias el puerto del backend, actualiza esto.

---

## ⚡ Funciones Principales

### Crear Juego
```typescript
import { createGame } from '@/services/api';

const response = await createGame({
  players: [
    { name: 'Player 1', color: '#FF0000' },
    { name: 'Player 2', color: '#0000FF' }
  ],
  startingMoney: 1500
});

const gameId = response.data?.id;
```

### Lanzar Dados
```typescript
import { rollDice } from '@/services/api';

const response = await rollDice(gameId, playerId);
const { dice1, dice2, isDoubles } = response.data!;
```

### Comprar Propiedad
```typescript
import { buyProperty } from '@/services/api';

const response = await buyProperty(gameId, playerId, {
  tileId: 1
});
```

### Terminar Turno
```typescript
import { endTurn } from '@/services/api';

await endTurn(gameId, playerId);
```

---

## 🎨 Personalización

### Cambiar Colores

En `MonopolyBoard.tsx`:
```typescript
const COLOR_MAP: Record<string, string> = {
  'Brown': '#8B4513',
  'Light Blue': '#87CEEB',
  // Añade más colores aquí
};
```

### Cambiar Velocidad de Animación

En `GameContainer.tsx`:
```typescript
const { playerPositions, movePlayer } = usePlayerMovement({
  boardSize: 40,
  animationDuration: 200,  // ← Cambia esto (ms por casilla)
});
```

### Cambiar Textos

En componentes, los textos están en español. Búscalos y cámbialos.

---

## 🐛 Solución de Problemas

### "Error: Cannot find module '@/components'"

Comprueba que `tsconfig.json` tenga:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### "API no responde"

1. Verifica que el backend esté corriendo: `http://localhost:5093`
2. Comprueba `VITE_API_URL` en `.env.local`
3. Mira la pestaña Network en DevTools

### "Los dados no se animan"

Verifica que `framer-motion` esté instalado:
```bash
npm list framer-motion
```

Si no, instala:
```bash
npm install framer-motion
```

---

## 📊 Verificar que está todo funcionando

### Checklist

- [ ] Backend corriendo en `localhost:5093`
- [ ] Frontend corriendo en `localhost:5173`
- [ ] Puedo navegar a `/board/{gameId}`
- [ ] El tablero se renderiza
- [ ] Aparecen los jugadores
- [ ] El botón "Lanzar Dados" funciona
- [ ] Los dados animan
- [ ] El juego cambia de turno

Si todos los items están ✅, ¡todo está listo!

---

## 📞 Contacto / Soporte

Si encontras problemas:

1. **Revisa** `TESTING_GUIDE.md` sección Debugging
2. **Busca** en `EJEMPLOS_USO.ts` ejemplos similares
3. **Mira** `INTEGRACION_FRONTEND.md` para detalles técnicos
4. **Abre DevTools** (F12) → Network tab
5. **Copia el error** y búscalo en Google

---

## 🎯 Próximo Paso

Una vez que todo funcione:

1. Lee `CHECKLIST_IMPLEMENTACION.md` para ver qué más hay
2. Customiza según tus necesidades
3. Agrega nuevas features
4. ¡Diviértete jugando! 🎮

---

## 📱 Demo Rápida

```
1. Crea un juego con 2 jugadores
2. Accede a /board/{gameId}
3. Haz clic en "Lanzar Dados"
4. Observa cómo se anima el jugador
5. Compra una propiedad
6. Pasa al siguiente turno
7. ¡Disfruta del juego!
```

---

**¿Todo funcionando? ¡Genial! 🎉**

Para más detalles, consulta los archivos de documentación.

Última actualización: Enero 2026

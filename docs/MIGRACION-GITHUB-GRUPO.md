# Migración a GitHub del grupo

## Ahora (desarrollo)

- Remoto de trabajo: **GitHub de Crisd**
- GitHub Pages desde ese repo para pruebas

## Después (entrega del equipo Greicy)

1. Crear repo vacío en la cuenta de una integrante (o organización del grupo).
2. Agregar a las otras dos como colaboradoras.
3. Desde este proyecto:

```bash
git remote rename origin crisd
git remote add origin https://github.com/CUENTA-GRUPO/calculo-en-movimiento-greicy.git
git push -u origin main
```

4. Activar Pages en el repo del grupo.
5. Actualizar el enlace en el guion de exposición.

Alternativa: en GitHub → Settings → Transfer ownership hacia la cuenta del grupo.

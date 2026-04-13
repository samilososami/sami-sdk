# @sami/sdk

SDK oficial para integrar **Sami ID** en tus aplicaciones.

## Instalación

```bash
npm install @sami/sdk
```

## Uso en servidor (Node.js / Next.js)

```ts
import SamiAuth from '@sami/sdk'

const samiAuth = new SamiAuth({
  clientId: 'tu-client-id',
  clientSecret: 'tu-client-secret',
  redirectUri: 'https://tu-app.com/callback',
})

// 1. Generar URL de autorización
const url = samiAuth.getAuthUrl({ state: 'csrf-token' })
// Redirige al usuario a esta URL

// 2. En tu endpoint /callback — intercambiar code por token
const { access_token } = await samiAuth.exchangeCode(req.query.code)

// 3. Obtener datos del usuario
const user = await samiAuth.getUser(access_token)
console.log(user.email, user.name)
```

## Uso en cliente (React / Vanilla JS)

```ts
import { samiIdLogin } from '@sami/sdk'

// Botón de login
<button onClick={() => samiIdLogin({
  clientId: 'tu-client-id',
  redirectUri: 'https://tu-app.com/callback',
})}>
  Iniciar sesión con Sami ID
</button>
```

## API

### `new SamiAuth(config)`
| Parámetro | Tipo | Descripción |
|---|---|---|
| `clientId` | `string` | Tu client ID |
| `clientSecret` | `string` | Tu client secret (solo servidor) |
| `redirectUri` | `string` | URL de callback registrada |

### `.getAuthUrl(options?)` → `string`
Devuelve la URL a la que redirigir al usuario para autenticarse.

### `.exchangeCode(code)` → `Promise<TokenResponse>`
Intercambia el authorization code por un access token.

### `.getUser(accessToken)` → `Promise<UserInfo>`
Devuelve el perfil del usuario autenticado.

### `samiIdLogin(config)` (browser)
Redirige el navegador directamente al flujo de login.

## Registro de apps

Para obtener un `client_id` y `client_secret`, contacta con el administrador de Sami ID.

---

auth.samilososami.com

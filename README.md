# @sami/sdk

SDK oficial para integrar **Iniciar sesión con Sami ID**.

## Instalación

```bash
npm install @sami/sdk
```

## Flujo recomendado en servidor

```ts
import SamiAuth, { generateSamiState } from '@sami/sdk'

const sami = new SamiAuth({
  clientId: process.env.SAMI_CLIENT_ID!,
  clientSecret: process.env.SAMI_CLIENT_SECRET!,
  redirectUri: 'https://tu-app.com/auth/sami/callback',
})

export function login(req, res) {
  const state = generateSamiState()
  req.session.samiState = state
  res.redirect(sami.getAuthUrl({ state }))
}

export async function callback(req, res) {
  if (req.query.state !== req.session.samiState) {
    return res.status(400).send('Invalid state')
  }

  const token = await sami.exchangeCode(String(req.query.code))
  const user = await sami.getUser(token.access_token)

  req.session.user = user
  res.redirect('/dashboard')
}
```

## Botón en frontend

```ts
import { buildSamiAuthUrl, generateSamiState, SAMI_ID_ASSETS } from '@sami/sdk'

const state = generateSamiState()
sessionStorage.setItem('sami_oauth_state', state)

const url = buildSamiAuthUrl({
  clientId: 'tu-client-id',
  redirectUri: 'https://tu-app.com/auth/sami/callback',
  state,
})

document.querySelector('#login')!.innerHTML = `
  <a class="sami-login" href="${url}">
    <img src="${SAMI_ID_ASSETS.full}" alt="Iniciar sesión con Sami ID" />
  </a>
`
```

Assets oficiales:

- `SAMI_ID_ASSETS.full`
- `SAMI_ID_ASSETS.icon`

## API

- `new SamiAuth(config)`
- `sami.getAuthUrl({ state, scope })`
- `sami.exchangeCode(code)`
- `sami.getUser(accessToken)`
- `buildSamiAuthUrl(config)`
- `samiIdLogin(config)`
- `generateSamiState()`
- `getSamiLoginButtonHtml(authUrl, options)`

Las apps se registran desde el panel admin de `id.samilososami.com`.

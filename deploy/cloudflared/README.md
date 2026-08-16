# Cloudflare Tunnel for dashboard.rhophi.uk

Prerequisite: `rhophi.uk` is active in the Cloudflare account.

1. In Cloudflare Zero Trust open Networks → Tunnels → Create tunnel, name it `matter-home`.
2. Choose Linux/ARM and install the provided `cloudflared` command on BBB. Do not paste the tunnel token into chat or Git.
3. Add public hostname `dashboard.rhophi.uk`, service `http://127.0.0.1:8082`.
4. Alternatively use `config.yml.example` with the generated tunnel UUID/credential file.
5. Verify `https://dashboard.rhophi.uk/api/health` before disabling the old WebUI/MQTT WebSocket.
6. Cloudflare settings: Always Use HTTPS on; Rocket Loader off; Auto Minify off. Enable HSTS only after successful HTTPS acceptance.
7. After local auth is stable, add Cloudflare Access for `dashboard.rhophi.uk` with email OTP or an identity provider as MFA/outer policy.

The BFF validates exact Origin and Host `https://dashboard.rhophi.uk`. Cloudflared must preserve the original Host; do not set `httpHostHeader`.

Rollback is stopping `matter-web-auth`; the existing `matter-webui` on port 8080 and Mosquitto WebSocket 9001 remain untouched until final cutover.

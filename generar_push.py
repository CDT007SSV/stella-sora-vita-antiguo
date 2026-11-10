# Envia notificaciones push de las novedades nuevas (novedades.json + discord.json) a los telefonos suscritos.
# Secretos de GitHub: PUSH_WORKER (URL del Worker), PUSH_ADMIN (token), VAPID_PRIVADA (clave privada). Sin ellos no hace nada.
# La primera vez solo "marca" lo que ya existe (no manda nada); despues avisa de lo nuevo.
import json, os, sys, base64, urllib.request, tempfile

ESTADO = "push_estado.json"
MAX_ENVIOS = 3          # mas de esto en una corrida se resume en un solo aviso
URL_APP = "https://cdt007ssv.github.io/stella-sora-vita/"

def cargar(r, d):
    try: return json.load(open(r, encoding="utf-8"))
    except Exception: return d

def items():
    a = cargar("novedades.json", {}).get("items", [])
    b = cargar("discord.json", {}).get("items", [])
    out = []
    for x in a + b:
        if x.get("id"): out.append(x)
    out.sort(key=lambda x: x.get("fecha", ""), reverse=True)
    return out

def limpio(t, n):
    t = " ".join((t or "").replace("\\:", ":").split())
    return t if len(t) <= n else t[:n - 1] + "…"

def http(url, token=None, data=None):
    h = {"User-Agent": "ssv-push"}
    if token: h["Authorization"] = "Bearer " + token
    if data is not None: h["Content-Type"] = "application/json"
    r = urllib.request.Request(url, data=json.dumps(data).encode() if data is not None else None, headers=h)
    with urllib.request.urlopen(r, timeout=30) as f: return json.loads(f.read().decode())

def pem(secreto):
    from cryptography.hazmat.primitives import serialization as S
    s = secreto.strip()
    if s.startswith("-----"): return s
    der = base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))
    k = S.load_der_private_key(der, password=None)
    return k.private_bytes(S.Encoding.PEM, S.PrivateFormat.PKCS8, S.NoEncryption()).decode()

def timers():
    """Avisos programados por los telefonos (stamina llena, etc.): manda los que ya vencieron."""
    worker, admin, priv = os.environ.get("PUSH_WORKER", "").rstrip("/"), os.environ.get("PUSH_ADMIN", ""), os.environ.get("VAPID_PRIVADA", "")
    if not (worker and admin and priv): return
    try: due = http(worker + "/due", admin)
    except Exception as e: print("No se pudo leer /due:", type(e).__name__); return
    if not due: return
    from pywebpush import webpush, WebPushException
    ruta = os.path.join(tempfile.mkdtemp(), "v.pem"); open(ruta, "w").write(pem(priv))
    hechos, muertos = [], []
    for t in due:
        m = {"title": t.get("title") or "Stella Sora Vita", "body": t.get("body") or "", "url": URL_APP + (t.get("url") or "")}
        try:
            webpush(subscription_info=t["sub"], data=json.dumps(m), vapid_private_key=ruta, vapid_claims={"sub": "mailto:noreply@example.com"}, ttl=3600); hechos.append(t["id"])
        except WebPushException as e:
            c = getattr(e.response, "status_code", 0)
            if c in (404, 410): muertos.append(t["sub"]["endpoint"]); hechos.append(t["id"])
            else: print("Error", c)
        except Exception as e:
            print("Error", type(e).__name__)
    if hechos: http(worker + "/done", admin, {"ids": hechos})
    if muertos: http(worker + "/gone", admin, {"endpoints": muertos})
    print("Avisos programados enviados:", len(hechos))

def main():
    if os.environ.get("PRUEBA") == "1":
        return prueba()
    if os.environ.get("PRUEBA") == "4":     # comprueba que el Worker nuevo acepta avisos lejanos y con numeros en el nombre
        worker, admin = os.environ.get("PUSH_WORKER", "").rstrip("/"), os.environ.get("PUSH_ADMIN", "")
        import time, urllib.request as U
        for sb in http(worker + "/list", admin):
            for modo, k, dias in (("alta", "b0test1", 40), ("baja", "b0test1", 0)):
                if modo == "alta":
                    body = json.dumps({"sub": sb, "kind": k, "at": int(time.time() * 1000) + dias * 864e5, "title": "t", "body": "t", "url": "#x"}).encode()
                    r = U.Request(worker + "/timer", data=body, headers={"Content-Type": "application/json", "Origin": "https://cdt007ssv.github.io", "User-Agent": "ssv"})
                else:
                    body = json.dumps({"endpoint": sb["endpoint"], "kind": k}).encode()
                    r = U.Request(worker + "/cancel", data=body, headers={"Content-Type": "application/json", "Origin": "https://cdt007ssv.github.io", "User-Agent": "ssv"})
                try: print(modo, U.urlopen(r, timeout=30).read().decode())
                except Exception as e: print(modo, "ERROR", e)
        print("Suscritos:", len(http(worker + "/list", admin)))
        return
    if os.environ.get("PRUEBA") == "3":     # programa un aviso de prueba en el Worker (lo envia el cron de Cloudflare)
        worker, admin = os.environ.get("PUSH_WORKER", "").rstrip("/"), os.environ.get("PUSH_ADMIN", "")
        import time, urllib.request as U
        for sb in http(worker + "/list", admin):
            body = json.dumps({"sub": sb, "kind": "prueba", "at": int(time.time() * 1000) + 20000, "title": "Prueba del Worker", "body": "Si ves esto, el cron de Cloudflare funciona", "url": "#stamina"}).encode()
            r = U.Request(worker + "/timer", data=body, headers={"Content-Type": "application/json", "Origin": "https://cdt007ssv.github.io", "User-Agent": "ssv"})
            try: print("timer:", U.urlopen(r, timeout=30).read().decode())
            except Exception as e: print("timer error:", e)
        return
    if os.environ.get("PRUEBA") == "2":
        worker, admin = os.environ.get("PUSH_WORKER", "").rstrip("/"), os.environ.get("PUSH_ADMIN", "")
        print("Suscritos:", len(http(worker + "/list", admin)))
        d = http(worker + "/due", admin)
        print("Timers vencidos sin enviar:", d if not isinstance(d, list) else [(x.get("id", "")[-20:], x.get("at"), x.get("title")) for x in d])
        return
    todos = items(); ids = [x["id"] for x in todos]
    est = cargar(ESTADO, None)
    if est is None:                       # primera vez: solo marcar
        json.dump({"enviados": ids[:200]}, open(ESTADO, "w"), indent=1); print("Primera vez: %d novedades marcadas, sin enviar" % len(ids)); return
    vistos = set(est.get("enviados", []))
    nuevos = [x for x in todos if x["id"] not in vistos]
    if not nuevos: print("Sin novedades nuevas"); return
    worker, admin, priv = os.environ.get("PUSH_WORKER", "").rstrip("/"), os.environ.get("PUSH_ADMIN", ""), os.environ.get("VAPID_PRIVADA", "")
    if not (worker and admin and priv):
        print("Faltan secretos: no se envia (las novedades NO se marcan)"); return
    if len(nuevos) > MAX_ENVIOS:
        msgs = [{"title": "Stella Sora Vita", "body": "Hay %d novedades nuevas" % len(nuevos)}]
    else:
        msgs = [{"title": limpio(x.get("titulo_es") or x.get("titulo"), 70) or "Novedad", "body": limpio(x.get("texto_es") or x.get("texto"), 110)} for x in nuevos]
    subs = http(worker + "/list", admin)
    print("Suscritos:", len(subs), "· avisos:", len(msgs))
    from pywebpush import webpush, WebPushException
    ruta = os.path.join(tempfile.mkdtemp(), "v.pem"); open(ruta, "w").write(pem(priv))
    muertos = []
    for s in subs:
        for m in msgs:
            m["url"] = URL_APP + "#news"
            try:
                webpush(subscription_info=s, data=json.dumps(m), vapid_private_key=ruta, vapid_claims={"sub": "mailto:noreply@example.com"}, ttl=86400)
            except WebPushException as e:
                c = getattr(e.response, "status_code", 0)
                if c in (404, 410): muertos.append(s["endpoint"]); break
                print("Error", c)
            except Exception as e:
                print("Error", type(e).__name__)
    if muertos: http(worker + "/gone", admin, {"endpoints": muertos}); print("Suscripciones caducadas borradas:", len(muertos))
    json.dump({"enviados": (ids + list(vistos))[:300]}, open(ESTADO, "w"), indent=1)

def prueba():
    worker, admin, priv = os.environ.get("PUSH_WORKER", "").rstrip("/"), os.environ.get("PUSH_ADMIN", ""), os.environ.get("VAPID_PRIVADA", "")
    print("Secretos:", bool(worker), bool(admin), bool(priv))
    subs = http(worker + "/list", admin); print("Suscritos:", len(subs))
    from pywebpush import webpush, WebPushException
    ruta = os.path.join(tempfile.mkdtemp(), "v.pem"); open(ruta, "w").write(pem(priv))
    m = {"title": "Stella Sora Vita", "body": "Aviso de prueba: las notificaciones funcionan", "url": URL_APP + "#news"}
    for s in subs:
        try:
            webpush(subscription_info=s, data=json.dumps(m), vapid_private_key=ruta, vapid_claims={"sub": "mailto:noreply@example.com"}, ttl=3600); print("Enviado OK")
        except WebPushException as e:
            print("Error", getattr(e.response, "status_code", "?"), str(e)[:200])
        except Exception as e:
            print("Error", type(e).__name__, str(e)[:200])

if __name__ == "__main__":
    main()

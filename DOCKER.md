# Docker Setup - Dózsa Apartman Landing

## Quick Start

### 1. Indítás

```bash
chmod +x docker-start.sh docker-stop.sh
./docker-start.sh
```

### 2. Nyisd meg a böngészőben

```
http://localhost:8080
```

### 3. Leállítás

```bash
./docker-stop.sh
```

## Részletes Használat

### Első indítás

```bash
# Jogosultságok beállítása
chmod +x docker-start.sh docker-stop.sh

# Konténer építése és indítása
./docker-start.sh
```

### Újraindítás

```bash
docker-compose restart
```

### Logok megtekintése

```bash
# Élő logok
docker-compose logs -f

# Csak a webszerver logjai
docker-compose logs -f web
```

### Shell hozzáférés

```bash
docker-compose exec web bash
```

### Teljes újraépítés

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Fájlok

### Dockerfile
- **Alap image**: PHP 8.2 Apache-val
- **Telepített extek**: mysqli, pdo, pdo_mysql
- **Apache modulok**: rewrite, headers
- **Port**: 80 → 8080 (host)

### docker-compose.yml
- **Service**: web (PHP + Apache)
- **Port mapping**: 8080:80
- **Volume**: `./src` → `/var/www/html` (élő szerkesztés!)
- **Network**: dozsa-network

### Volumes (élő szinkronizálás)

A `src/` mappa be van mountolva, így:
- ✅ Módosítások azonnal láthatók
- ✅ Nem kell újrabuildelni
- ✅ Gyors fejlesztés

## Hibaelhárítás

### Port már használatban

Ha a 8080-as port foglalt:

**docker-compose.yml** módosítása:
```yaml
ports:
  - "8081:80"  # Változtasd 8081-re (vagy bármi másra)
```

Majd:
```bash
docker-compose down
docker-compose up -d
```

### Konténer nem indul

```bash
# Nézd meg a logokat
docker-compose logs

# Ellenőrizd a Docker daemon-t
sudo systemctl status docker
```

### Jogosultsági problémák

```bash
# Reset permissions
sudo chown -R $USER:$USER src/
chmod -R 755 src/
```

### Email nem működik

A Docker konténerben a PHP `mail()` funkció alapértelmezetten nem működik.

**Opciók:**
1. Használj külső SMTP szolgáltatást (pl. SendGrid, Mailgun)
2. Telepíts `msmtp`-t a konténerbe
3. Teszteld FTP feltöltéssel éles szerveren

## Hasznos parancsok

```bash
# Konténer állapota
docker-compose ps

# Erőforrás használat
docker stats dozsa-apartman-web

# Konténer újraépítése
docker-compose build --no-cache

# Teljes cleanup
docker-compose down -v
docker system prune -a
```

## Port információk

- **8080** → Website (http://localhost:8080)
- **80** → Apache a konténeren belül

## Környezeti változók (opcionális)

Hozz létre egy `.env` fájlt:

```bash
# .env
APACHE_PORT=8080
PHP_VERSION=8.2
```

Majd a `docker-compose.yml`-ben:

```yaml
ports:
  - "${APACHE_PORT}:80"
```

## Produkció vs Development

Ez egy **development** setup. Éles használatra:

1. Használj HTTPS-t (SSL/TLS)
2. Beállíts firewall szabályokat
3. Használj environment variable-okat érzékeny adatokhoz
4. Implementálj rate limiting-et
5. Állíts be monitoring-ot

## Támogatás

Ha probléma van:

1. Ellenőrizd a logokat: `docker-compose logs -f`
2. Nézd meg a Docker állapotot: `docker-compose ps`
3. Újraépítés: `docker-compose down && docker-compose build && docker-compose up -d`

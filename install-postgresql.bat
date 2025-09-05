@echo off
echo PostgreSQL kurulumu başlatılıyor...

REM PostgreSQL 15 indirme ve kurulum
echo PostgreSQL 15 indiriliyor...
powershell -Command "Invoke-WebRequest -Uri 'https://get.enterprisedb.com/postgresql/postgresql-15.8-1-windows-x64.exe' -OutFile 'postgresql-installer.exe'"

echo PostgreSQL kuruluyor...
postgresql-installer.exe --mode unattended --superpassword "admin123" --servicename "PostgreSQL" --serviceaccount "postgres" --servicepassword "admin123" --serverport 5432 --unattendedmodeui none --debuglevel 2

echo Kurulum tamamlandı!
echo PostgreSQL servisi başlatılıyor...
net start postgresql-x64-15

echo PostgreSQL başarıyla kuruldu!
echo Bağlantı bilgileri:
echo Host: localhost
echo Port: 5432
echo Username: postgres
echo Password: admin123

pause

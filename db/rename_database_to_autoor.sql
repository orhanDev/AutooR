SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'autor_db'
  AND pid <> pg_backend_pid();

ALTER DATABASE autor_db RENAME TO "AutooR";
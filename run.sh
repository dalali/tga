#!/usr/bin/env bash
set -euo pipefail

CMD="${1:-help}"

case "$CMD" in
  start|up)
    npm run build
    docker compose up -d
    echo "TGA running at http://localhost:8080"
    ;;
  dev)
    npm run dev
    ;;
  stop)
    docker compose down
    ;;
  restart)
    docker compose down
    npm run build
    docker compose up -d
    ;;
  logs)
    docker compose logs -f tga
    ;;
  build)
    npm run build
    ;;
  status)
    docker compose ps
    ;;
  test)
    npm run lint && npm run typecheck && npm test && npm run test:e2e
    ;;
  shell)
    docker compose exec tga sh
    ;;
  clean)
    docker compose down -v 2>/dev/null || true
    rm -rf node_modules dist
    ;;
  help|*)
    echo "Usage: ./run.sh <command>"
    echo "Commands: start|up  stop  restart  logs  build  status  test  shell  clean  dev  help"
    ;;
esac

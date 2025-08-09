# Этап 2: Создание продакшен-образа с Nginx
FROM nginx:alpine

# Делаем скрипт запуска исполняемым
RUN chmod +x /start.sh

# Открываем порт 80
EXPOSE 80

# Запускаем скрипт
CMD ["/start.sh"]
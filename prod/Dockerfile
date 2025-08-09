# Этап 2: Создание продакшен-образа с Nginx
FROM nginx:alpine

# Копируем собранные файлы из этапа сборки
#COPY --from=builder /app/dist /usr/share/nginx/html
COPY dist /usr/share/nginx/html

# Копируем конфигурацию Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем скрипт запуска
COPY start.sh /start.sh

# Делаем скрипт запуска исполняемым
RUN chmod +x /start.sh

# Открываем порт 80
EXPOSE 80

# Запускаем скрипт
CMD ["/start.sh"]
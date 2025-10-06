
/** Типы данных для статуса и структуры задач/этапов. */
export type Status = 'done' | 'in-progress' | 'planned';
export type Theme = 'light' | 'dark';

export interface Task {
    id: number;
    description: string;
    status: Status;
    isSubtask?: boolean;
}

export interface Stage {
    id: number;
    title: string;
    status: Status;
    tasks: Task[];
}

// Данные дорожной карты
export const roadmapData: Stage[] = [
    {
        id: 1,
        title: 'Этап 1 - Проработка минимальной инфраструктуры',
        status: 'done',
        tasks: [
            { id: 101, description: 'Выделение доменных областей', status: 'done' },
            { id: 102, description: 'Настройка Keycloak для логина/регистрации пользователей', status: 'done' },
            { id: 103, description: 'Написание библиотек для базовой работы сервиса', status: 'done' },
            { id: 104, description: 'Аренда 2х VDS для postgresql + keycloak и backend + frontend', status: 'done' },
            { id: 105, description: 'Настройка CI/CD для backend, frontend, keycloak', status: 'done' },
            { id: 106, description: 'Настройка VDS и nginx для корректной работы', status: 'done' },
        ],
    },
    {
        id: 2,
        title: 'Этап 2 — Продукты',
        status: 'done',
        tasks: [
            { id: 201, description: 'Функционал работы с продуктами с их мерами (пользователям только поиск)', status: 'done' },
            { id: 202, description: 'Функционал работы с вариантами продуктов (пользователям только поиск)', status: 'done' },
            { id: 203, description: 'Добавление КБЖУ, веса и плотности для каждого продукта, и их меры', status: 'done' },
        ],
    },
    {
        id: 3,
        title: 'Этап 3 — Справочники',
        status: 'in-progress',
        tasks: [
            { id: 301, description: 'Функционал работы разными кухнями (пользователям только поиск)', status: 'done' },
            { id: 302, description: 'Функционал работы разными тэгами (пользователям только поиск)', status: 'done' },
            { id: 303, description: 'Функционал работы с категориями продуктов (пользователям только поиск)', status: 'planned' },
            { id: 304, description: 'Функционал работы с уникальными бейджами рецептов (пользователям только поиск)', status: 'planned' },
            { id: 305, description: 'Функционал работы с уникальными бейджами пользователей (пользователям только поиск)', status: 'planned' },
        ],
    },
    {
        id: 4,
        title: 'Этап 4 — Холодильник',
        status: 'in-progress',
        tasks: [
            { id: 401, description: 'Функционал работы с холодильником пользователя', status: 'done' },
            { id: 402, description: 'Функционал работы с продуктами холодильниками пользователя', status: 'done' },
            { id: 403, description: 'Функционал работы с совместными холодильниками пользователей', status: 'planned' },
            { id: 404, description: 'Функционал добавление продукта в холодильник при сканировании этикетки', status: 'planned' },
        ],
    },
    {
        id: 5,
        title: 'Этап 5 — Рецепты',
        status: 'in-progress',
        tasks: [
            { id: 501, description: 'Функционал работы с рецептами (создание, обновление, удаление)', status: 'done' },
            { id: 502, description: 'Функционал прохождения рецептов по шагам', status: 'done' },
            { id: 503, description: 'Функционал подсчета КБЖУ рецепта по порциям из продуктов', status: 'done' },
            { id: 504, description: 'Функционал добавления продукта в рецепт при сканировании этикетки', status: 'planned' },
            { id: 505, description: 'Функционал замены продукта в существующем рецепте при сканировании/замены этикетки продукта и автоподсчет КБЖУ и массы', status: 'planned' },
        ],
    },
    {
        id: 6,
        title: 'Этап 6 — Статистика',
        status: 'planned',
        tasks: [
            { id: 601, description: 'Рецепт:', status: 'done' },
            { id: 602, description: 'Лайки', status: 'done', isSubtask: true },
            { id: 603, description: 'Просмотры', status: 'done', isSubtask: true },
            { id: 604, description: 'Рейтинг', status: 'done', isSubtask: true },
            { id: 605, description: 'Комменты', status: 'planned', isSubtask: true },
            { id: 606, description: 'Завершенность пользовтелями', status: 'planned', isSubtask: true },
            { id: 607, description: 'Онлайн готовят', status: 'planned', isSubtask: true },
            { id: 608, description: 'Топ 3 бейджа пользователей по данному рецепту', status: 'planned', isSubtask: true },
            { id: 609, description: 'Профиль:', status: 'planned' },
            { id: 610, description: 'Рейтинг', status: 'planned', isSubtask: true },
            { id: 611, description: 'Рецептами', status: 'planned', isSubtask: true },
            { id: 612, description: 'Просмотры', status: 'planned', isSubtask: true },
        ],
    },
    {
        id: 7,
        title: 'Этап 7 — Поиск',
        status: 'planned',
        tasks: [
            { id: 701, description: 'Функционал поиска рецептов по фильтрам', status: 'done' },
            { id: 702, description: 'Функционал поиска рецептов по промту (ИИ)', status: 'done' },
            { id: 703, description: 'Функционал поиска рецептов по продуктам из холодильника', status: 'planned' },
            { id: 704, description: 'Функционал поиска по фотке/картинке', status: 'planned' },
        ],
    },
    {
        id: 8,
        title: 'Этап 8 — Профиль пользователя',
        status: 'planned',
        tasks: [
            { id: 801, description: 'Функционал работы с информацией пользователя', status: 'planned' },
            { id: 802, description: 'Нотификация по рецептам и по изменениям', status: 'planned' },
            { id: 803, description: 'Аудит действий', status: 'planned' },
            { id: 804, description: 'Возможность подписания на пользователя', status: 'planned' },
            { id: 805, description: 'Возможность открытия профиля пользователя', status: 'planned' },
            { id: 806, description: 'Возможность получения уведомлений по пользователям', status: 'planned' },
            { id: 807, description: 'Уникальные бейджи пользователя', status: 'planned' },
        ],
    },
    {
        id: 9,
        title: 'Этап 9 - Администрирование/Модерация',
        status: 'planned',
        tasks: [
            { id: 901, description: 'Создание ролевых моделей суперпользователь/модератор/пользователь/автор/повар и т.п', status: 'planned' },
            { id: 902, description: 'Модерация создания/обновления рецептов', status: 'planned' },
            { id: 903, description: 'Модерация предложенных продуктов', status: 'planned' },
            { id: 904, description: 'Модерация справочников пользователей', status: 'planned' },
            { id: 905, description: 'Возможность просматривать и обновлять данные пользователей, например изменять информацию в холодильниках', status: 'planned' },
        ],
    },
    {
        id: 10,
        title: 'Этап 10 — Discovery',
        status: 'planned',
        tasks: [
            { id: 1001, description: 'Функционал просмотра видео-рецептов по свайпам', status: 'planned' },
            { id: 1002, description: 'Функцонал отображения всей важной информации рецепта в тиктоке', status: 'planned' },
        ],
    },
    {
        id: 11,
        title: 'Этап 11 — Монетизация',
        status: 'planned',
        tasks: [
            { id: 1101, description: 'Добавить подписку для получения функций', status: 'planned' },
            { id: 1102, description: 'Добавить возможность пополнять баланс, чтобы пользоваться платными функциями:', status: 'planned' },
            { id: 1103, description: '- ИИ поиск', status: 'planned', isSubtask: true },
            { id: 1104, description: '- Поделиться холодильником', status: 'planned', isSubtask: true },
            { id: 1105, description: '- Добавить спеицальную иконку себе на профиль (как в тг)', status: 'planned', isSubtask: true },
            { id: 1106, description: 'Создания собственной криптовалюты на базе TON', status: 'planned' },
        ],
    },
    {
        id: 12,
        title: 'Этап 12 — Юридические проблемы',
        status: 'planned',
        tasks: [
            { id: 1201, description: 'Написать пользовательское соглашение', status: 'planned' },
            { id: 1202, description: 'Написать оферту для оплаты', status: 'planned' },
            { id: 1203, description: 'Открыть регистрацию', status: 'planned' },
            { id: 1204, description: 'Хранить данные в РФ по закону', status: 'planned' },
        ],
    },
    {
        id: 13,
        title: 'Этап 13 — Расширенная инфра',
        status: 'planned',
        tasks: [
            { id: 1301, description: 'Возможность обновления данных и восстановления пароля по почте', status: 'planned' },
            { id: 1302, description: 'Создание собственных CI/CD workerов', status: 'planned' },
            { id: 1303, description: 'S3 хранилище для хранения фоток', status: 'planned' },
            { id: 1304, description: 'S3 хранилище для хранения видео (тикток) для discovery', status: 'planned' },
            { id: 1305, description: 'Включить backup баз данных', status: 'planned' },
            { id: 1306, description: 'Добавление prometheus и графаны для просмотра метрик', status: 'planned' },
            { id: 1307, description: 'Добавление ELK для сбора логгов', status: 'planned' },
            { id: 1308, description: 'Подключение kafka для аудита и для асинхронных задач', status: 'planned' },
            { id: 1309, description: 'Использование микросервисов (ХЗ)', status: 'planned' },
        ],
    },
    {
        id: 14,
        title: 'Этап 14 — Подготовка к релизу',
        status: 'planned',
        tasks: [
            { id: 1401, description: 'Протестировать end-to-end и пофиксить баги', status: 'planned' },
            { id: 1402, description: 'Оптимизировать запросы', status: 'planned' },
            { id: 1403, description: 'Наполнить данными сервис', status: 'planned' },
            { id: 1404, description: 'Открыть ИП для маркетинга', status: 'planned' },
        ],
    },
    {
        id: 99,
        title: 'Этап XXX Backlog',
        status: 'planned',
        tasks: [
            { id: 9901, description: 'Функционал fit-tracker (подсчет калорий по продуктам или рецептам)', status: 'planned' },
            { id: 9902, description: 'Расширить информацию по продуктам с их детальными данными (сахар, клетчатка и т.п.)', status: 'planned' },
        ],
    },
];
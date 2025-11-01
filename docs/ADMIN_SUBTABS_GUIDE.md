# Руководство: как добавлять новые подвкладки в админ-панели

Краткое руководство по добавлению новых подвкладок (subtabs) в админ-панели с использованием централизованной системы конфигурации и общих компонентов.

## Структура компонентов

### Централизованная конфигурация (`src/pages/Admin/config/`)
- **`entityRegistry.ts`** — единый реестр всех именованных сущностей (теги, категории, кухни)
- **`adminTabsConfig.tsx`** — функции для автоматической генерации вкладок из реестра

### Общие компоненты (`src/pages/Admin/components/shared/`)
- **`NamedEntitySubTabs`** — универсальный компонент для создания и управления простыми сущностями (теги, категории, кухни)
- **`NamedEntityManager`** — компонент для управления списком сущностей с поиском и редактированием
- **`CreateEntityForm`** — форма создания новой сущности с одним полем (название)

### Общие хуки (`src/pages/Admin/hooks/`)
- **`useAdminNamedEntities`** — хук для работы с сущностями: загрузка, поиск, редактирование
- **`useCopyToClipboard`** — хук для копирования текста в буфер обмена
- **`useProductEditing`** — хук для работы с продуктами (специфичный)
- **`useVariantEditing`** — хук для работы с вариантами продуктов (специфичный)

### Вспомогательные компоненты (`src/pages/Admin/components/`)
- **`EditableTable`** — таблица с инлайн-редактированием
- **`SearchBar`** — строка поиска с кнопкой обновления
- **`AdminCard`** — карточка-обёртка для контента подвкладок

## 1. Добавление новой простой сущности (теги/категории/кухни)

Если новая сущность имеет только поле `name` и требует стандартного CRUD (создание, просмотр списка, редактирование, поиск), процесс очень простой:

### Шаг 1: Создать сервис
Создайте сервис в `src/services/` по аналогии с `tagsService.ts`, `categoriesService.ts` или `kitchensService.ts`:

```typescript
// src/services/myEntityService.ts
import { API_BASE_URL } from './api';
import { authorizedFetch, getAuthHeaders } from './auth';
import { ensureNamedEntityArray } from './namedEntityUtils';

export interface MyEntityResponseDto {
  id: string;
  name: string;
}

export class MyEntityService {
  static async getAll(options?: { force?: boolean }): Promise<MyEntityResponseDto[]> {
    // Реализация загрузки всех сущностей
  }
  
  static async search(name: string): Promise<MyEntityResponseDto[]> {
    // Реализация поиска
  }
  
  static async update(id: string, name: string): Promise<MyEntityResponseDto> {
    // Реализация обновления
  }
  
  static clearCache(): void {
    // Опционально: очистка кэша при необходимости
  }
}
```

### Шаг 2: Добавить конфигурацию в entityRegistry.ts
Откройте `src/pages/Admin/config/entityRegistry.ts`:

1. Добавьте новый тип в `EntityType`:
```typescript
export type EntityType = 'tag' | 'category' | 'kitchen' | 'myEntity';
```

2. Добавьте конфигурацию в `ENTITY_REGISTRY`:
```typescript
myEntity: {
  id: 'myEntities',
  label: 'Мои сущности',
  icon: YourIcon, // Импортируйте иконку из @heroicons/react/24/outline
  apiPath: '/my-entities',
  service: {
    getAll: (options?: { force?: boolean }) => MyEntityService.getAll(options),
    search: (name: string) => MyEntityService.search(name),
    update: (id: string, name: string) => MyEntityService.update(id, name),
    clearCache: () => MyEntityService.clearCache(), // Опционально
  },
  texts: {
    title: 'Моя сущность',
    titleCreate: 'Создать мою сущность',
    titleManage: 'Управление моими сущностями',
    description: 'Описание назначения сущности...',
    titleLabel: 'Название сущности*',
    placeholder: 'Например: Пример 1, Пример 2...',
    submitLabel: 'Создать сущность',
    successMessage: 'Сущность успешно создана',
    searchPlaceholder: 'Поиск моих сущностей (мин. 3 символа)',
    emptyText: 'Сущности не найдены',
  },
},
```

### Шаг 3: Добавить в AdminPage.tsx
Откройте `src/pages/Admin/AdminPage.tsx` и добавьте новый тип в массив `NAMED_ENTITIES`:

```tsx
// Список именованных сущностей для автоматической генерации вкладок
const NAMED_ENTITIES: readonly EntityType[] = ['tag', 'category', 'kitchen', 'myEntity'] as const;
```

**Готово!** Вкладка автоматически появится с подвкладками "Создать" и "Управление". Вся конфигурация находится в одном месте — `entityRegistry.ts`.

## 2. Добавление новой подвкладки для продуктов или сложных сущностей

Если нужна кастомная логика (как в разделе "Продукты"):

### Шаг 1: Создать компонент подвкладки
Создайте компонент в `src/pages/Admin/components/YourSubTab/YourSubTab.tsx`:

```tsx
import React from 'react';
import styles from './YourSubTab.module.css';
import AdminCard from '../AdminCard/AdminCard';
import EditableTable, { type EditableRow } from '../EditableTable/EditableTable';
import SearchBar from '../SearchBar/SearchBar';
import { useAdminNamedEntities } from '../../hooks/useAdminNamedEntities';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
// Импорты ваших сервисов и типов

const YourSubTab: React.FC = () => {
  // Используйте useAdminNamedEntities для стандартной логики
  // или создайте свой хук для сложной логики
  
  return (
    <div className={styles.wrapper}>
      <AdminCard title="Заголовок подвкладки">
        {/* Ваш контент */}
      </AdminCard>
    </div>
  );
};

export default YourSubTab;
```

### Шаг 2: Подключить в AdminPage.tsx
Добавьте подвкладку в массив `subtabs` нужного раздела:

```tsx
{
  id: 'products',
  label: 'Продукты',
  Icon: Squares2X2Icon,
  subtabs: [
    // ... существующие подвкладки
{
  id: 'products:new',
  label: 'Новая',
  title: 'Новая подвкладка',
      content: <YourSubTab /> 
    },
  ],
}
```

## 3. Использование общих компонентов и хуков

### useAdminNamedEntities
Хук для работы с сущностями, имеющими только поле `name`:

```tsx
const { items, loading, error, query, editing, updatingId, setEditing, refresh, handleQueryChange, save } =
  useAdminNamedEntities<YourEntityType>({
    getAll: (options) => YourService.getAll(options),
    search: (name) => YourService.search(name),
    update: (id, name) => YourService.update(id, name),
  });
```

### EditableTable
Таблица с инлайн-редактированием:

```tsx
<EditableTable
  rows={items as EditableRow[]}
  editing={editing}
  setEditing={(updater) => setEditing((prev) => updater(prev))}
  updatingId={updatingId}
  onSave={(id) => { void save(id); }}
  loading={loading}
  emptyText="Записей не найдено"
  enableCopyId
  onCopyId={(id) => { void copyToClipboard(id); }}
/>
```

### SearchBar
Строка поиска:

```tsx
<SearchBar
  value={query}
  placeholder="Поиск (мин. 3 символа)"
  loading={loading}
  onChange={(value) => { void handleQueryChange(value); }}
  onRefresh={() => refresh({ force: true })}
/>
```

### CreateEntityForm
Форма создания сущности:

```tsx
<CreateEntityForm
  apiUrl={`${API_BASE_URL}/entities`}
  titleLabel="Название*"
  placeholder="Введите название..."
  submitLabel="Создать"
  successMessage="Сущность успешно создана"
  onCreated={() => {
    // Опциональный callback после создания
  }}
/>
```

## 4. Преимущества централизованной системы

### До рефакторинга
- Нужно было править 3+ файла для добавления новой сущности
- Конфигурация была разбросана по разным компонентам
- Легко забыть обновить все места

### После рефакторинга
- **Единая точка конфигурации**: всё в `entityRegistry.ts`
- **Автоматическая генерация**: вкладки создаются автоматически через `createNamedEntityTab`
- **Минимум кода**: для новой сущности нужно только:
  1. Добавить запись в `ENTITY_REGISTRY`
  2. Добавить тип в `EntityType`
  3. Добавить строку в массив `NAMED_ENTITIES`
- **Типобезопасность**: TypeScript проверяет все конфигурации
- **Легко поддерживать**: изменения в одном месте применяются везде

## 5. Рекомендации

- **Для простых сущностей**: используйте централизованный реестр (`entityRegistry.ts`) — минимум кода, максимум функциональности
- **Для сложных сущностей**: создавайте собственные компоненты, но переиспользуйте хуки (`useAdminNamedEntities`, `useCopyToClipboard`) и компоненты (`EditableTable`, `SearchBar`, `AdminCard`)
- **Типы**: используйте типы из `src/types/*`, не дублируйте типы
- **Стили**: используйте CSS-модули, следуйте паттернам существующих компонентов
- **Иконки**: используйте иконки из `@heroicons/react/24/outline` для единообразия

## 6. Чек-лист перед коммитом

- [ ] Сборка (`npm run build`) проходит без ошибок
- [ ] Линтер (`npm run lint` или через IDE) не показывает критичных ошибок
- [ ] Новая сущность добавлена в `ENTITY_REGISTRY` с полной конфигурацией
- [ ] Тип добавлен в `EntityType` union type
- [ ] Сущность добавлена в массив `NAMED_ENTITIES` в `AdminPage.tsx`
- [ ] Новая подвкладка видна в UI, переключение работает
- [ ] Обработка ошибок и пустых состояний реализована
- [ ] Поиск работает корректно (минимум 3 символа)
- [ ] Редактирование и сохранение работает
- [ ] Копирование ID работает (если используется `enableCopyId`)

## 7. Примеры

### Простая сущность
См. реализацию тегов, категорий, кухонь в:
- `config/entityRegistry.ts` — конфигурация
- `config/adminTabsConfig.tsx` — генерация вкладок
- `AdminPage.tsx` — использование

### Сложная сущность
См. `ProductListSubTab` для примера кастомной логики с использованием общих хуков

## 8. Структура файлов

```
src/pages/Admin/
├── config/
│   ├── entityRegistry.ts       # Единый реестр всех сущностей
│   └── adminTabsConfig.tsx      # Функции генерации вкладок
├── components/
│   └── shared/
│       ├── NamedEntitySubTabs/  # Использует entityRegistry
│       └── NamedEntityManager/  # Использует entityRegistry
└── AdminPage.tsx               # Использует adminTabsConfig
```

## Быстрый старт: добавление новой сущности

1. **Создайте сервис** в `src/services/myEntityService.ts`
2. **Добавьте конфигурацию** в `config/entityRegistry.ts`:
   - Добавьте тип в `EntityType`
   - Добавьте запись в `ENTITY_REGISTRY`
3. **Добавьте в AdminPage.tsx**:
   - Добавьте строку в массив `NAMED_ENTITIES`

Готово! Вкладка появится автоматически.

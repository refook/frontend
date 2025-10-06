import React, {useMemo} from 'react';
import {roadmapData, type Stage, type Status, type Task} from "./RoadmapData.ts";
import './Roadmap.css'
/**
 * Определяет классы CSS для цвета статуса.
 */
const getStatusClasses = (status: Status, type: 'text' | 'border' | 'bg'): string => {
    switch (status) {
        case 'done':
            return `status-done-${type}`;
        case 'in-progress':
            return `status-in-progress-${type}`;
        case 'planned':
            return `status-planned-${type}`;
        default:
            return '';
    }
};

/**
 * Компонент для выделения кода/ключевых слов внутри текста задачи.
 */
const CodeHighlighter: React.FC<{ text: string }> = ({ text }) => {
    // Список ключевых слов для выделения
    const keywords = [
        'VDS', 'CI/CD', 'КБЖУ', 'Keycloak', 'keycloak', 'postgresql', 'backend', 'frontend',
        'nginx', 'ИИ', 'fit-tracker', 'S3', 'backup', 'prometheus', 'графаны',
        'ELK', 'логгов', 'kafka', 'микросервисов', 'TON', 'ИП', 'end-to-end'
    ];

    // Регулярное выражение для поиска ключевых слов как целых слов
    const regex = new RegExp(`(${keywords.join('|')})`, 'g');

    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, index) => {
                // Проверяем, является ли часть одним из ключевых слов
                if (keywords.includes(part)) {
                    return (
                        <code
                            key={index}
                            className="code-highlight"
                        >
                            {part}
                        </code>
                    );
                }
                // Для остальных частей (обычный текст)
                return part;
            })}
        </>
    );
};

/**
 * Компонент отдельной задачи.
 */
const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
    const isDone = task.status === 'done';

    // Классы на основе CSS
    const textClasses = isDone ? 'task-text task-text-done' : 'task-text task-text-default';

    const isHeading = !task.isSubtask && (task.description.endsWith(':') || task.description.startsWith('Профиль:'));
    const paddingClass = task.isSubtask ? 'task-subtask' : (isHeading ? 'task-heading-text' : '');

    // Иконка
    const iconContainerClass = isHeading ? 'hidden' : 'task-icon-container';
    const iconBg = isDone ? 'task-icon-done' : 'task-icon-default';

    return (
        <li className={`task-item ${paddingClass}`}>
            {!isHeading && (
                <span className={`${iconContainerClass} ${iconBg}`}>
                    {isDone && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                    )}
                </span>
            )}
            <span className={`flex-1 ${isHeading ? 'task-heading-text' : textClasses}`}>
                <CodeHighlighter text={task.description} />
            </span>
        </li>
    );
};

/**
 * Компонент отдельного этапа (Stage).
 */
const StageItem: React.FC<{ stage: Stage }> = ({ stage }) => {
    const headerClass = getStatusClasses(stage.status, 'text');
    const borderClass = getStatusClasses(stage.status, 'border');
    const markerClass = getStatusClasses(stage.status, 'bg');

    const icon = stage.status === 'done' ? '✅' : stage.status === 'in-progress' ? '🔄' : '📦';

    return (
        <div
            className={`stage-item ${borderClass}`}
        >
            <div
                className={`timeline-marker ${markerClass}`}
            ></div>

            <h3 className={`stage-title ${headerClass}`}>
                <span className="stage-icon">{icon}</span> {stage.title}
            </h3>
            <ul className="task-list">
                {stage.tasks.map(task => (
                    <TaskItem key={task.id} task={task} />
                ))}
            </ul>
        </div>
    );
};

/**
 * Главный компонент Roadmap.
 */
const Roadmap: React.FC = () => {
    // Вычисляем общий прогресс
    const { totalTasks, completedTasks, percentage } = useMemo(() => {
        // Исключаем заголовки задач (те, что заканчиваются на ':')
        const tasks = roadmapData.flatMap(stage => stage.tasks).filter(t => !t.description.endsWith(':') && !t.description.startsWith('Профиль:'));
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'done').length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { totalTasks: total, completedTasks: completed, percentage: percent };
    }, []);


    return (
        <div className="roadmap-container">
            <div className="roadmap-content">
                {/* Заголовок */}
                <header className="header-card">
                    <div className="header-content">
                        <h1 className="header-title">
                            📌 Дорожная Карта Проекта
                        </h1>
                    </div>
                </header>

                {/* Общий прогресс */}
                <div className="progress-card">
                    <h2 className="header-title" style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.75rem'}}>
                        📊 Общий Прогресс ({percentage}%)
                    </h2>
                    <div className="progress-bar-shell">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                    <p className="progress-summary">
                        {completedTasks} из {totalTasks} задач завершена.
                    </p>
                </div>

                <h2 className="stage-section-title">
                    🚀 MVP Roadmap
                </h2>

                {/* Контейнер таймлайна */}
                <div className="timeline-container">
                    {roadmapData.map(stage => (
                        <StageItem key={stage.id} stage={stage} />
                    ))}
                </div>

            </div>
        </div>
    );
}

export default Roadmap;

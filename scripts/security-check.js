#!/usr/bin/env node

/**
 * Скрипт для проверки безопасности проекта
 *
 * Выполняет:
 * 1. Проверку переменных окружения
 * 2. Поиск потенциально опасных паттернов кода
 * 3. Базовую проверку безопасности зависимостей
 * 4. Проверку корректной настройки защитных механизмов
 *
 * Использование: node scripts/security-check.js
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import dotenv from 'dotenv';

// Для ES Modules получаем __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Загружаем переменные окружения
dotenv.config({ path: path.join(rootDir, '.env') });

// Состояние проверки
const securityState = {
  errors: 0,
  warnings: 0,
  suggestions: 0,
  passed: 0
};

// Вывод форматированных сообщений
const log = {
  error: (message) => {
    securityState.errors++;
    console.log(chalk.red(`❌ ОШИБКА: ${message}`));
  },
  warning: (message) => {
    securityState.warnings++;
    console.log(chalk.yellow(`⚠️ ПРЕДУПРЕЖДЕНИЕ: ${message}`));
  },
  suggestion: (message) => {
    securityState.suggestions++;
    console.log(chalk.blue(`💡 РЕКОМЕНДАЦИЯ: ${message}`));
  },
  success: (message) => {
    securityState.passed++;
    console.log(chalk.green(`✅ УСПЕХ: ${message}`));
  },
  info: (message) => {
    console.log(chalk.cyan(`ℹ️ ИНФО: ${message}`));
  },
  section: (title) => {
    console.log('\n' + chalk.bold.underline(title) + '\n');
  }
};

/**
 * Проверка обязательных переменных окружения
 */
async function checkEnvVariables() {
  log.section('Проверка переменных окружения');

  const requiredVars = [
    { name: 'VITE_SUPABASE_URL', critical: true },
    { name: 'VITE_SUPABASE_ANON_KEY', critical: true },
    { name: 'TELEGRAM_BOT_TOKEN', critical: false },
    { name: 'TELEGRAM_CHAT_ID', critical: false },
    { name: 'PORT', critical: false, defaultValue: '3002' },
    { name: 'NODE_ENV', critical: false, defaultValue: 'development' },
    { name: 'API_KEY', critical: false },
    { name: 'COOKIE_SECRET', critical: true }
  ];

  for (const v of requiredVars) {
    const value = process.env[v.name];

    if (!value) {
      if (v.critical) {
        log.error(`Отсутствует критически важная переменная окружения: ${v.name}`);
      } else if (v.defaultValue) {
        log.warning(`Отсутствует переменная окружения: ${v.name}, будет использовано значение по умолчанию: ${v.defaultValue}`);
      } else {
        log.warning(`Отсутствует переменная окружения: ${v.name}`);
      }
    } else {
      // Проверка длины и сложности секретов
      if (v.name.includes('KEY') || v.name.includes('TOKEN') || v.name.includes('SECRET')) {
        if (value.length < 16) {
          log.warning(`Переменная ${v.name} слишком короткая (${value.length} символов), рекомендуется не менее 16 символов`);
        } else {
          log.success(`Переменная ${v.name} задана и имеет достаточную длину`);
        }
      } else {
        log.success(`Переменная ${v.name} задана`);
      }
    }
  }
}

/**
 * Проверка потенциально опасных паттернов в коде
 */
async function checkVulnerablePatterns() {
  log.section('Проверка уязвимостей в коде');

  const targetDirs = [
    'src',
    'server',
    'server/api',
    'server/middleware',
    'public'
  ];

  const vulnerablePatterns = [
    {
      pattern: /eval\s*\(/g,
      description: 'Использование eval() может привести к инъекциям кода',
      severity: 'high'
    },
    {
      pattern: /process\.env\.[A-Z_]+/g,
      description: 'Использование process.env напрямую может вызвать ошибку в ESM модулях',
      severity: 'medium'
    },
    {
      pattern: /console\.log\s*\(/g,
      description: 'Вывод в консоль может раскрывать конфиденциальную информацию',
      severity: 'low'
    },
    {
      pattern: /innerHTML|outerHTML/g,
      description: 'Использование innerHTML/outerHTML может привести к XSS атакам',
      severity: 'high'
    },
    {
      pattern: /dangerouslySetInnerHTML/g,
      description: 'dangerouslySetInnerHTML может привести к XSS атакам',
      severity: 'high'
    },
    {
      pattern: /\.raw\s*\(/g,
      description: 'Использование raw SQL запросов без параметризации может привести к SQL инъекциям',
      severity: 'high'
    },
    {
      pattern: /document\.write\s*\(/g,
      description: 'document.write может привести к XSS атакам',
      severity: 'high'
    },
    {
      pattern: /localStorage\.|sessionStorage\./g,
      description: 'Хранение конфиденциальных данных в localStorage/sessionStorage небезопасно',
      severity: 'medium'
    }
  ];

  // Счетчики
  const issues = {
    high: 0,
    medium: 0,
    low: 0
  };

  // Получаем все файлы JS/TS/Vue в указанных директориях
  const allFiles = [];

  for (const dir of targetDirs) {
    try {
      const fullPath = path.join(rootDir, dir);
      await scanDirectory(fullPath, allFiles);
    } catch (error) {
      log.warning(`Не удалось просканировать директорию ${dir}: ${error.message}`);
    }
  }

  log.info(`Найдено ${allFiles.length} файлов для проверки`);

  // Проверяем каждый файл на наличие уязвимых паттернов
  for (const filePath of allFiles) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const relPath = path.relative(rootDir, filePath);

      for (const { pattern, description, severity } of vulnerablePatterns) {
        const matches = content.match(pattern);

        if (matches && matches.length > 0) {
          issues[severity]++;

          switch(severity) {
            case 'high':
              log.error(`В файле ${relPath} найдена потенциальная уязвимость: ${description} (${matches.length} вхождений)`);
              break;
            case 'medium':
              log.warning(`В файле ${relPath} найден потенциально небезопасный код: ${description} (${matches.length} вхождений)`);
              break;
            case 'low':
              log.suggestion(`В файле ${relPath} найден код, требующий внимания: ${description} (${matches.length} вхождений)`);
              break;
          }
        }
      }
    } catch (error) {
      log.warning(`Не удалось проверить файл ${filePath}: ${error.message}`);
    }
  }

  if (issues.high === 0 && issues.medium === 0 && issues.low === 0) {
    log.success('Уязвимые паттерны в коде не обнаружены');
  } else {
    log.info(`Найдено проблем: ${issues.high} критических, ${issues.medium} средних, ${issues.low} незначительных`);
  }
}

/**
 * Рекурсивное сканирование директории для поиска файлов
 */
async function scanDirectory(directory, foundFiles) {
  try {
    const items = await fs.readdir(directory, { withFileTypes: true });

    for (const item of items) {
      const itemPath = path.join(directory, item.name);

      // Пропускаем node_modules и директории сборки
      if (item.name === 'node_modules' || item.name === 'dist' || item.name === '.git') {
        continue;
      }

      if (item.isDirectory()) {
        await scanDirectory(itemPath, foundFiles);
      } else if (
        item.isFile() &&
        (itemPath.endsWith('.js') ||
         itemPath.endsWith('.ts') ||
         itemPath.endsWith('.vue') ||
         itemPath.endsWith('.jsx') ||
         itemPath.endsWith('.tsx'))
      ) {
        foundFiles.push(itemPath);
      }
    }
  } catch (error) {
    log.warning(`Ошибка при сканировании директории ${directory}: ${error.message}`);
  }
}

/**
 * Проверка настроек безопасности
 */
async function checkSecurityConfiguration() {
  log.section('Проверка настроек безопасности');

  // Проверяем наличие необходимых файлов и настроек
  const requiredFiles = [
    { path: 'server/middleware/csrfProtection.js', description: 'CSRF защита' },
    { path: 'server/middleware/apiSecurity.js', description: 'Безопасность API' },
    { path: 'server/utils/env.js', description: 'Безопасная работа с переменными окружения' },
    { path: 'server/tools/validateEnv.js', description: 'Валидация переменных окружения' }
  ];

  for (const file of requiredFiles) {
    try {
      await fs.access(path.join(rootDir, file.path));
      log.success(`Найден файл ${file.path} (${file.description})`);
    } catch (error) {
      log.error(`Отсутствует файл ${file.path} (${file.description})`);
    }
  }

  // Проверяем настройки CSP в index.js
  try {
    const indexContent = await fs.readFile(path.join(rootDir, 'server/index.js'), 'utf8');

    if (indexContent.includes('contentSecurityPolicy')) {
      log.success('Настроена политика безопасности контента (CSP)');
    } else {
      log.warning('Отсутствует настройка политики безопасности контента (CSP)');
    }

    if (indexContent.includes('helmet(')) {
      log.success('Используется пакет helmet для защиты HTTP-заголовков');
    } else {
      log.error('Не используется пакет helmet для защиты HTTP-заголовков');
    }

    if (indexContent.includes('xss')) {
      log.success('Внедрена защита от XSS атак');
    } else {
      log.error('Отсутствует защита от XSS атак');
    }

    if (indexContent.includes('rateLimit')) {
      log.success('Настроено ограничение частоты запросов (rate limiting)');
    } else {
      log.warning('Не настроено ограничение частоты запросов (rate limiting)');
    }

    if (indexContent.includes('CSRF') || indexContent.includes('csrf')) {
      log.success('Настроена защита от CSRF атак');
    } else {
      log.error('Отсутствует защита от CSRF атак');
    }

  } catch (error) {
    log.warning(`Не удалось проверить настройки безопасности в server/index.js: ${error.message}`);
  }
}

/**
 * Проверка использования HTTPS
 */
async function checkHttpsUsage() {
  log.section('Проверка использования HTTPS');

  try {
    const packageJson = JSON.parse(await fs.readFile(path.join(rootDir, 'package.json'), 'utf8'));

    if (packageJson.dependencies && packageJson.dependencies.helmet) {
      log.success('Пакет helmet найден в зависимостях');
    } else {
      log.warning('Пакет helmet не найден в зависимостях');
    }

    // Проверяем наличие настроек для Vercel
    try {
      const vercelConfig = JSON.parse(await fs.readFile(path.join(rootDir, 'vercel.json'), 'utf8'));

      if (vercelConfig.headers && vercelConfig.headers.some(h =>
          h.source && h.headers && h.headers.some(header =>
            header.key === 'Strict-Transport-Security'))) {
        log.success('В vercel.json настроен заголовок Strict-Transport-Security');
      } else {
        log.warning('В vercel.json не настроен заголовок Strict-Transport-Security');
      }
    } catch (error) {
      log.warning('Файл vercel.json не найден или имеет некорректный формат');
    }

  } catch (error) {
    log.warning(`Не удалось проверить package.json: ${error.message}`);
  }
}

/**
 * Основная функция проверки безопасности
 */
async function runSecurityCheck() {
  console.log(chalk.bold.green('\n=== ПРОВЕРКА БЕЗОПАСНОСТИ ПРОЕКТА ===\n'));

  try {
    await checkEnvVariables();
    await checkVulnerablePatterns();
    await checkSecurityConfiguration();
    await checkHttpsUsage();

    // Вывод итоговой статистики
    log.section('РЕЗУЛЬТАТЫ ПРОВЕРКИ');
    console.log(chalk.bold(`Обнаружено ошибок: ${chalk.red(securityState.errors)}`));
    console.log(chalk.bold(`Обнаружено предупреждений: ${chalk.yellow(securityState.warnings)}`));
    console.log(chalk.bold(`Выдано рекомендаций: ${chalk.blue(securityState.suggestions)}`));
    console.log(chalk.bold(`Пройдено проверок: ${chalk.green(securityState.passed)}`));

    const totalIssues = securityState.errors + securityState.warnings;

    if (securityState.errors > 0) {
      console.log(chalk.red.bold('\n⛔ ПРОВЕРКА НЕ ПРОЙДЕНА! Необходимо исправить критические уязвимости.'));
    } else if (securityState.warnings > 0) {
      console.log(chalk.yellow.bold('\n⚠️ ПРОВЕРКА ПРОЙДЕНА С ПРЕДУПРЕЖДЕНИЯМИ! Рекомендуется устранить обнаруженные проблемы.'));
    } else {
      console.log(chalk.green.bold('\n✅ ПРОВЕРКА ПРОЙДЕНА УСПЕШНО! Критические уязвимости не обнаружены.'));
    }

    console.log('\n' + chalk.bold('Рекомендации по устранению проблем:'));
    if (securityState.errors > 0) {
      console.log(chalk.red('1. Исправьте все критические уязвимости, отмеченные как "ОШИБКА".'));
    }
    if (securityState.warnings > 0) {
      console.log(chalk.yellow('2. Обратите внимание на предупреждения и по возможности устраните их.'));
    }
    if (securityState.suggestions > 0) {
      console.log(chalk.blue('3. Рассмотрите предложенные рекомендации для улучшения безопасности.'));
    }

    console.log(chalk.bold('\nДополнительные рекомендации:'));
    console.log('• Регулярно обновляйте зависимости: npm audit fix');
    console.log('• Проверяйте код на уязвимости инструментами статического анализа');
    console.log('• Используйте HTTPS для всех соединений');
    console.log('• Проводите тестирование на проникновение');

  } catch (error) {
    console.error(chalk.red.bold('Произошла ошибка во время проверки безопасности:'), error);
    process.exit(1);
  }
}

// Запуск проверки
runSecurityCheck();

import fs from "fs";
import tokens from "../../tokens.json" with { type: "json" };

function flattenTokens(obj, prefix = '') {
  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    // Пропускаем meta-поля если есть
    if (key === '$description' || key === '$type') continue;

    const newKey = prefix ? `${prefix}-${key}` : key;

    if (value && typeof value === 'object' && !value.value) {
      // Рекурсивно обрабатываем вложенные объекты
      Object.assign(result, flattenTokens(value, newKey));
    } else if (value && value.value) {
      // Это конечный токен с цветом
      const cssVarName = `--${newKey.replace(/_/g, '-')}`;
      result[cssVarName] = value.value;
    }
  }

  return result;
}

function generateRootCSS(themes) {
  let css = `/* Auto-generated theme variables */\n`;
  css += `/* Do not edit directly, this file was auto-generated */\n\n`;
  
  // Получаем токены
  const lightTokens = flattenTokens(themes.light);
  const darkTokens = flattenTokens(themes.dark);
  const constTokens = flattenTokens(themes.const);

  // Медиа-запросы для системных настроек
  css += `/* System preference detection */\n`;

  // Светлая тема (явная)
  css += `:root[data-theme="light"] {\n`;
  for (const [varName, value] of Object.entries(lightTokens)) {
    css += `  ${varName}: ${value};\n`;
  }
  css += `}\n\n`;

  // Темная тема (явная)
  css += `:root[data-theme="dark"] {\n`;
  for (const [varName, value] of Object.entries(darkTokens)) {
    css += `  ${varName}: ${value};\n`;
  }
  css += `}\n\n`;

  // Константы
  css += `:root {\n`;
  for (const [varName, value] of Object.entries(constTokens)) {
    css += `  ${varName}: ${value};\n`;
  }
  css += `}\n\n`;

  return css;
}

// Проверка наличия токенов
if (!tokens.light || !tokens.dark) {
  console.error('❌ Error: tokens.json must have "light" and "dark" properties');
  process.exit(1);
}

console.log("✅ Light theme found:", Object.keys(tokens.light).length, "categories");
console.log("✅ Dark theme found:", Object.keys(tokens.dark).length, "categories");

// Создаем итоговый CSS
const finalCSS = generateRootCSS(tokens);

// Сохраняем файл
fs.writeFileSync('./src/app/styles/variables.css', finalCSS);
console.log('✅ themes.css generated successfully!');
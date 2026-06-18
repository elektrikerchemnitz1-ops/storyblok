const fs = require('fs');

// Настройки Storyblok
const STORYBLOK_TOKEN = '8tyUetia0DtjByQa0jtigAtt'; 
const SLUG = 'landing'; 
const url = `https://api.storyblok.com/v2/cdn/stories/${SLUG}?token=${STORYBLOK_TOKEN}&version=draft`;

// Функция для отрисовки компонентов в HTML
function renderComponent(block) {
  if (block.component === 'teaser') {
    return `
      <section class="teaser">
        <h1>${block.headline}</h1>
      </section>
    `;
  }

  if (block.component === 'stats') {
    const columnsHtml = block.columns.map(col => `
      <div class="stat-card">
        <div class="number">${col.number}</div>
        <div class="label">${col.label}</div>
        <div class="desc">${col.bescreibung || ''}</div>
      </div>
    `).join('');

    return `
      <section class="stats-container">
        ${columnsHtml}
      </section>
    `;
  }

  return '';
}

async function runBuild() {
  try {
    console.log('1. Запрашиваем свежие данные из Storyblok...');
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Ошибка Storyblok API: ${response.status}`);
    }

    const data = await response.json();
    const components = data.story.content.body;

    console.log('2. Генерируем HTML-контент...');
    const mainContent = components.map(renderComponent).join('');

    // Шаблон страницы
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.story.name}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0; padding: 0; background-color: #f4f7f6; color: #333;
            display: flex; flex-direction: column; align-items: center;
        }
        .teaser {
            width: 100%; max-width: 800px; text-align: center;
            padding: 40px 20px; margin: 20px 0; background: white;
            border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        h1 { margin: 0; color: #2c3e50; }
        .stats-container {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px; width: 100%; max-width: 800px; padding: 20px;
        }
        .stat-card {
            background: #2c3e50; color: white; padding: 30px 20px;
            border-radius: 8px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .stat-card .number { font-size: 2.5rem; font-weight: bold; color: #41b883; margin-bottom: 10px; }
        .stat-card .label { font-size: 1.1rem; font-weight: 600; }
        .stat-card .desc { font-size: 0.9rem; opacity: 0.8; margin-top: 5px; }
    </style>
</head>
<body>
    ${mainContent}
</body>
</html>
    `;

    console.log('3. Записываем файл index.html...');
    fs.writeFileSync('index.html', htmlTemplate, 'utf-8');
    
    console.log('Успешно! Сайт собран в один заход.');
  } catch (error) {
    console.error('Ошибка сборки:', error.message);
    process.exit(1); // Сообщаем GitHub Actions, что сборка упала, если что-то пошло не так
  }
}

runBuild();
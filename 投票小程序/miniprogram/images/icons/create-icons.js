const fs = require('fs');
const path = require('path');

// 基础图标 SVG 内容
const icons = {
  home: `<svg t="1710400000000" class="icon" viewBox="0 0 1024 1024" width="48" height="48">
    <path d="M512 128L128 447.936V896h256V640h256v256h256V447.936z" fill="#999999"/>
  </svg>`,
  
  signup: `<svg t="1710400000000" class="icon" viewBox="0 0 1024 1024" width="48" height="48">
    <path d="M512 128L128 447.936V896h768V447.936L512 128zM448 640h128v128H448V640z" fill="#999999"/>
  </svg>`,
  
  rank: `<svg t="1710400000000" class="icon" viewBox="0 0 1024 1024" width="48" height="48">
    <path d="M320 448h128v320H320V448zm256 128h128v192H576V576zm-512 0h128v192H64V576z" fill="#999999"/>
  </svg>`,
  
  detail: `<svg t="1710400000000" class="icon" viewBox="0 0 1024 1024" width="48" height="48">
    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm32 664c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V456c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272zm-32-344c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z" fill="#999999"/>
  </svg>`,
  
  gift: `<svg t="1710400000000" class="icon" viewBox="0 0 1024 1024" width="48" height="48">
    <path d="M880 310H732.4c13.6-21.4 21.6-46.8 21.6-74 0-76.1-61.9-138-138-138-41.4 0-78.7 18.4-104 47.4-25.3-29-62.6-47.4-104-47.4-76.1 0-138 61.9-138 138 0 27.2 7.9 52.6 21.6 74H144c-17.7 0-32 14.3-32 32v200c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8V342c0-17.7-14.3-32-32-32z" fill="#999999"/>
  </svg>`
};

// 选中状态的颜色
const selectedColor = '#4a6feb';

// 为每个图标创建默认和选中状态的文件
Object.entries(icons).forEach(([name, svg]) => {
  // 默认图标
  fs.writeFileSync(
    path.join(__dirname, `${name}.png`),
    Buffer.from(svg.replace('#999999', '#999999'))
  );
  
  // 选中状态图标
  fs.writeFileSync(
    path.join(__dirname, `${name}_selected.png`),
    Buffer.from(svg.replace('#999999', selectedColor))
  );
}); 
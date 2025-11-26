import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // 引入我们之前配置好 Tailwind 的样式文件
import App from './App'; // 引入洗衣机主程序

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
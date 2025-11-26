import React, { useState, useEffect } from 'react';
import { 
  Scan, MapPin, User, FileText, Home, CreditCard, Phone, 
  ChevronLeft, X, Clock, Droplets, Wind, Waves, Zap, CheckCircle2,
  Play, Pause, ChevronDown, ChevronUp, Wallet, Smartphone, Landmark,
  Bell, HelpCircle, FileText as FileTextIcon, Wallet as WalletIcon,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 模拟数据与配置 ---
// 统一尺寸，移除手机外壳样式，适配预览窗口
const APP_CONTAINER_STYLE = "relative mx-auto w-full max-w-[390px] h-[844px] bg-[#F0F4F8] overflow-hidden shadow-xl sm:rounded-[3rem] border-4 border-slate-800/10";

const INITIAL_MACHINES = [
  { id: 'B638', status: 'active', loc: '敢行轩3栋', timeLeft: 1200 }, // 初始有一台在运行
  { id: 'B637', status: 'idle', loc: '敢行轩3栋', timeLeft: 0 },
  { id: 'B636', status: 'idle', loc: '敢行轩3栋', timeLeft: 0 },
  { id: 'B635', status: 'offline', loc: '敢行轩3栋', timeLeft: 0 },
];

const WASH_PLANS = [
  { id: 1, name: '单脱水', time: 10, price: '0.5', icon: Wind, desc: '仅脱水不漂洗' },
  { id: 2, name: '小件洗', time: 25, price: '1.5', icon: Droplets, desc: '省时省水，适合夏季衣物' },
  { id: 3, name: '普通洗', time: 35, price: '2.0', icon: Waves, desc: '标准流程，洗漂脱各一次' },
  { id: 4, name: '超强洗', time: 45, price: '2.5', icon: Zap, desc: '浸泡+强力洗，适合大件' },
];

// --- 辅助组件 ---

// 1. 顶部导航 (透明/模糊)
const TopNav = ({ title, onBack, transparent = false, machineId = null }) => (
  <div className={`absolute top-0 left-0 right-0 z-50 pt-12 px-6 h-[100px] flex items-end pb-4 ${transparent ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md'} rounded-t-[2.5rem]`}>
    <div className="flex items-center w-full relative">
      {onBack && (
        <button 
          onClick={onBack}
          className="absolute left-0 p-2 -ml-2 rounded-full active:bg-slate-100 transition-colors"
        >
          <ChevronLeft size={28} className="text-slate-800" />
        </button>
      )}
      <div className="w-full text-center">
        <h1 className="text-lg font-bold text-slate-800">{title}</h1>
        {machineId && (
          <p className="text-xs text-cyan-600 font-mono font-medium mt-1">
            设备: {machineId}
          </p>
        )}
      </div>
    </div>
  </div>
);

// 2. 底部导航
const NavBar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', icon: Home, label: '主页' },
    { id: 'order', icon: FileText, label: '订单' },
    { id: 'profile', icon: User, label: '我的' },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 pb-8 pt-2 px-6 z-40">
      <div className="flex justify-around items-center h-14">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center justify-center w-16"
            >
              <div className={`transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                <tab.icon 
                  size={24} 
                  className={`transition-colors duration-300 ${isActive ? 'text-cyan-600' : 'text-slate-400'}`} 
                  strokeWidth={isActive ? 2.5 : 2}
                  fill={isActive ? "currentColor" : "none"}
                  fillOpacity={0.1}
                />
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-cyan-800' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// 3. 水波纹进度卡片
const WaveCard = ({ order, onClick }) => {
  // 计算进度百分比
  const totalSeconds = order.totalTime * 60;
  const elapsed = totalSeconds - order.remainingSeconds;
  const progress = Math.min(100, Math.max(0, (elapsed / totalSeconds) * 100));
  
  return (
    <motion.div 
      onClick={onClick}
      className="relative w-full h-40 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-[2rem] overflow-hidden shadow-xl shadow-cyan-200/50 shrink-0 snap-center cursor-pointer"
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-white">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${order.isPaused ? 'bg-yellow-400' : 'bg-white animate-pulse'}`}/>
              <p className="text-cyan-100 text-xs font-bold tracking-wider uppercase">
                {order.isPaused ? 'Paused' : 'Running'}
              </p>
            </div>
            <h3 className="text-2xl font-bold font-mono">{order.machineId}</h3>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end opacity-90">
              <Clock size={14} className="mr-1" />
              <span className="text-sm font-mono font-bold">
                {Math.floor(order.remainingSeconds / 60)}:{String(order.remainingSeconds % 60).padStart(2, '0')}
              </span>
            </div>
            <p className="text-[10px] text-cyan-100 mt-1">
              预计 {new Date(Date.now() + order.remainingSeconds * 1000).getHours()}:{String(new Date(Date.now() + order.remainingSeconds * 1000).getMinutes()).padStart(2, '0')} 完成
            </p>
          </div>
        </div>
        
        <div className="flex items-end justify-between">
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
            <p className="text-xs font-medium text-white">{order.currentStage}</p>
          </div>
          <p className="text-5xl font-bold tracking-tighter opacity-90">{Math.floor(progress)}<span className="text-2xl">%</span></p>
        </div>
      </div>
      
      {/* 动态波浪 - 仅在未暂停时运动 */}
      {!order.isPaused && (
        <>
          <motion.div 
            animate={{ x: ["-50%", "0%"] }}
            transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
            className="absolute bottom-0 left-0 w-[200%] h-full opacity-30 pointer-events-none"
            style={{ 
              background: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNDQwIDMyMCI+PHBhdGggZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIxIiBkPSJNMCAxOTJMODAgMTg2LjdDMTYwIDE4MSAyNDAgMTcxIDMyMCAxNzZDMzYwIDIxMyA0ODAgMjM1IDY0MCAyMTNDODAwIDE5MiA5NjAgMTI4IDExMjAgMTQ0QzEyODAgMTYwIDEzNjAgMjU2IDE0NDAgMjg4VjMyMEgwWiI+PC9wYXRoPjwvc3ZnPg==")',
              backgroundSize: '50% 100%',
              bottom: `${progress - 110}%`
            }}
          />
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="absolute bottom-0 left-0 w-[200%] h-full opacity-40 pointer-events-none"
            style={{ 
              background: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNDQwIDMyMCI+PHBhdGggZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIxIiBkPSJNMCA5Nkw0OCAxMTJDOTYgMTI4IDE5MiAxNjAgMjg4IDE2MEMzODQgMTYwIDQ4MCAxMjggNTc2IDExMkM2NzIgOTYgNzY4IDk2IDg2NCAxMTJDOTYwIDEyOCAxMDU2IDE2MCAxMTUyIDE2MEMxMjQ4IDE2MCAxMzQ0IDEyOCAxMzkyIDExMkwxNDQwIDk2VjMyMEgwWiI+PC9wYXRoPjwvc3ZnPg==")',
              backgroundSize: '50% 100%',
              bottom: `${progress - 105}%`
            }}
          />
        </>
      )}
    </motion.div>
  );
};

// 4. 我的页面内容
const ProfilePageContent = () => {
  const profileItems = [
    { icon: WalletIcon, label: '我的钱包', description: '查看余额与充值' },
    { icon: FileTextIcon, label: '历史订单', description: '查看过去的消费记录' },
    { icon: Bell, label: '消息通知', description: '接收洗衣完成提醒' },
    { icon: HelpCircle, label: '帮助与反馈', description: '常见问题解答' },
  ];

  return (
    <div className="h-full overflow-y-auto px-6 pt-24 pb-32 hide-scrollbar">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">我的</h1>
      
      {/* 账户卡片 */}
      <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100 mb-8 flex items-center space-x-4">
        <div className="w-14 h-14 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600">
          <User size={28} />
        </div>
        <div>
          <p className="font-bold text-lg text-slate-800">同学你好 👋</p>
          <p className="text-xs text-slate-400">UID: 9876543210</p>
        </div>
      </div>

      {/* 功能板块 */}
      <div className="space-y-4">
        {profileItems.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100 active:bg-slate-50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-cyan-50 text-cyan-600`}>
                <item.icon size={20} />
              </div>
              <div>
                <p className="font-medium text-slate-700">{item.label}</p>
                <p className="text-xs text-slate-400">{item.description}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-slate-300" />
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 主页面组件 ---

const HomePage = ({ onScan, orders, machines, onOrderClick }) => {
  // 找出正在进行的订单
  const activeOrders = [...orders].reverse().filter(o => o.status !== 'completed');

  return (
    <div className="h-full overflow-y-auto px-6 pt-24 pb-32 hide-scrollbar">
      {/* 头部 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">下午好</h1>
          <p className="text-slate-500 text-xs mt-1">今天是个洗衣的好天气☀️</p>
        </div>
        <div className="w-10 h-10 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center">
          <User size={20} className="text-slate-600" />
        </div>
      </div>

      {/* 扫码入口 */}
      <div className="flex flex-col items-center justify-center py-2 mb-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={onScan}
          className="relative group w-full"
        >
          <div className="absolute inset-0 bg-cyan-400 rounded-[2rem] opacity-20 blur-xl animate-pulse" />
          <div className="w-full h-40 bg-gradient-to-br from-white to-cyan-50 rounded-[2rem] shadow-lg flex flex-col items-center justify-center relative z-10 border border-white">
            <div className="w-14 h-14 bg-cyan-100 rounded-full flex items-center justify-center mb-2 text-cyan-600">
              <Scan size={28} strokeWidth={2} />
            </div>
            <p className="text-cyan-900 font-bold text-lg">扫码洗衣</p>
            <p className="text-cyan-600/60 text-xs">支持微信 / 支付宝 / 校园卡</p>
          </div>
        </motion.button>
      </div>

      {/* 当前进度 (可横向滚动) */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <Waves size={18} className="text-cyan-600" />
            <h2 className="font-bold text-slate-700 text-sm">当前进度 ({activeOrders.length})</h2>
          </div>
        </div>
        
        {/* 确保横向滚动区域隐藏滚动条 */}
        {activeOrders.length > 0 ? (
          <div className="flex space-x-4 overflow-x-auto pb-4 -mx-6 px-6 hide-scrollbar snap-x">
            {activeOrders.map(order => (
              <div key={order.id} className="w-full shrink-0 snap-center">
                <WaveCard order={order} onClick={() => onOrderClick(order.id)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-32 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <p className="text-sm font-medium">当前无进行中订单</p>
          </div>
        )}
      </div>

      {/* 附近设备 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <MapPin size={16} className="text-cyan-600" />
            <h2 className="font-bold text-slate-700 text-sm">附近设备</h2>
          </div>
          <span className="text-[10px] text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-100">敢行轩3栋</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {machines.map((m) => (
            <div 
              key={m.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between h-28 transition-colors ${m.status === 'active' ? 'bg-cyan-50 border-cyan-100' : 'bg-white border-slate-100'}`}
            >
              <div className="flex justify-between items-start">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.status === 'active' ? 'bg-cyan-200 text-cyan-700' : m.status === 'idle' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                  {m.status === 'active' ? <Waves size={14} /> : <div className="w-3 h-3 border-2 border-current rounded-full" />}
                </div>
                <div className={`w-2 h-2 rounded-full ${m.status === 'active' ? 'bg-cyan-500 animate-pulse' : m.status === 'idle' ? 'bg-green-500' : 'bg-slate-300'}`} />
              </div>
              
              <div>
                <h3 className={`font-bold ${m.status === 'active' ? 'text-cyan-900' : 'text-slate-700'}`}>{m.id}</h3>
                <p className={`text-xs mt-0.5 ${m.status === 'active' ? 'text-cyan-600' : m.status === 'idle' ? 'text-green-600' : 'text-slate-400'}`}>
                  {m.status === 'active' ? '工作中' : m.status === 'idle' ? '空闲' : '离线'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 订单详情及控制页
const OrderDetailControlPage = ({ order, togglePause, onBack }) => {
  if (!order) return <div className="pt-32 text-center text-slate-400">请选择一个订单</div>;

  const totalTime = order.totalTime * 60;
  const elapsed = totalTime - order.remainingSeconds;

  // Stage logic helpers
  const getStageStatus = (stageName) => {
    if (order.currentStage === stageName) return 'active';
    // Simplified logic: stages follow order Wash -> Rinse -> Spin
    const stages = ['洗涤', '漂洗', '脱水'];
    const currentIdx = stages.indexOf(order.currentStage);
    const targetIdx = stages.indexOf(stageName);
    return targetIdx < currentIdx ? 'completed' : targetIdx === currentIdx ? 'active' : 'pending';
  };

  return (
    <>
      <TopNav title="订单控制台" onBack={onBack} transparent machineId={order.machineId} />
      
      <div className="h-full overflow-y-auto px-6 pt-32 pb-32 hide-scrollbar">
        {/* 核心控制卡片 */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-100 border border-slate-50 text-center relative overflow-hidden mb-6">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 to-blue-500" />
          
          <h2 className="text-3xl font-bold text-slate-800 font-mono mb-1">
            {Math.floor(order.remainingSeconds / 60)}:{String(order.remainingSeconds % 60).padStart(2, '0')}
          </h2>
          <p className="text-slate-400 text-xs mb-6">预计剩余时间</p>

          <div className="flex justify-center items-center space-x-6">
            <button 
              onClick={() => togglePause(order.id)}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${order.isPaused ? 'bg-green-500 text-white shadow-green-200' : 'bg-red-50 text-red-500 shadow-red-100'}`}
            >
              {order.isPaused ? <Play size={28} fill="currentColor" /> : <Pause size={28} fill="currentColor" />}
            </button>
          </div>
          <p className="mt-4 text-xs font-bold text-slate-400">{order.isPaused ? '已暂停' : '运行中...'}</p>
        </div>

        {/* 流程详情 */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-6">
          {['洗涤', '漂洗', '脱水'].map((stage, idx) => {
            const status = getStageStatus(stage);
            const isCurrent = status === 'active';
            const stageRemaining = isCurrent ? Math.floor(order.remainingSeconds / 2) : 0; 
            
            return (
              <div key={stage} className="relative">
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-bold ${isCurrent ? 'text-cyan-700' : status === 'completed' ? 'text-slate-400' : 'text-slate-300'}`}>{stage}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${status === 'completed' ? 'bg-green-100 text-green-600' : isCurrent ? 'bg-cyan-100 text-cyan-600 animate-pulse' : 'bg-slate-50 text-slate-300'}`}>
                    {status === 'completed' ? '已完成' : isCurrent ? '进行中' : '未开始'}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: status === 'completed' ? '100%' : isCurrent ? '60%' : '0%' }}
                    className={`h-full ${status === 'completed' ? 'bg-green-400' : 'bg-cyan-400'}`}
                  />
                </div>
                {/* 实时秒级详情 - 仅在当前阶段显示 */}
                {isCurrent && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 text-xs text-slate-400 font-mono flex items-center bg-slate-50 p-2 rounded-lg"
                  >
                    <Clock size={12} className="mr-2" />
                    当前阶段剩余：{stageRemaining}秒
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  );
};

// --- 支付/扫码流程 ---
const ScanFlow = ({ onClose, onComplete, availableMachine }) => {
  const [step, setStep] = useState('select'); // 'select' | 'payment'
  const [selectedPlanId, setSelectedPlanId] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState('wechat');
  const selectedPlan = WASH_PLANS.find(p => p.id === selectedPlanId);

  return (
    <motion.div 
      initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
      className="absolute inset-0 bg-[#F0F4F8] z-50 flex flex-col rounded-[2.5rem]"
    >
      <TopNav title={step === 'select' ? "选择模式" : "确认支付"} onBack={step === 'payment' ? () => setStep('select') : onClose} />

      <div className="flex-1 overflow-y-auto pt-24 pb-32 px-6 hide-scrollbar">
        {step === 'select' ? (
          <>
            <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm mb-6">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
              <span className="text-sm font-medium text-slate-600">已连接：{availableMachine?.id || '正在搜索...'} ({availableMachine?.loc})</span>
            </div>
            
            <div className="space-y-4">
              {WASH_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`relative p-5 rounded-3xl cursor-pointer border-2 transition-all ${selectedPlanId === plan.id ? 'bg-cyan-50 border-cyan-400 shadow-lg' : 'bg-white border-transparent shadow-sm'}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedPlanId === plan.id ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <plan.icon size={24} />
                      </div>
                      <div>
                        <h3 className={`font-bold ${selectedPlanId === plan.id ? 'text-cyan-900' : 'text-slate-700'}`}>{plan.name}</h3>
                        <p className="text-xs text-slate-400">{plan.time}分钟</p>
                      </div>
                    </div>
                    <span className="font-bold text-lg">¥{plan.price}</span>
                  </div>
                  {selectedPlanId === plan.id && <div className="mt-3 pt-2 border-t border-cyan-200 text-xs text-cyan-700">{plan.desc}</div>}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-6 pt-4">
            <div className="bg-white p-8 rounded-3xl shadow-sm text-center border border-slate-50">
              <p className="text-slate-400 text-xs mb-1">支付金额</p>
              <h2 className="text-4xl font-bold text-slate-800 font-mono">¥{selectedPlan.price}</h2>
              <div className="mt-4 inline-flex items-center bg-slate-50 px-3 py-1 rounded-lg text-xs text-slate-500">
                {selectedPlan.name} · {selectedPlan.time}min · {availableMachine?.id}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-500 mb-3 px-2">选择支付方式</h3>
              <div className="space-y-3">
                {[
                  { id: 'wechat', name: '微信支付', icon: Smartphone, color: 'text-green-600', bg: 'bg-green-100' },
                  { id: 'alipay', name: '支付宝', icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-100' },
                  { id: 'card', name: '校园卡', icon: Landmark, color: 'text-purple-600', bg: 'bg-purple-100' }
                ].map((m) => (
                  <div 
                    key={m.id} 
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex items-center justify-between p-4 bg-white rounded-2xl border transition-all active:scale-95 ${paymentMethod === m.id ? 'border-cyan-500 ring-1 ring-cyan-500 shadow-md' : 'border-slate-100'}`}
                  >
                    <div className="flex items-center space-x-3">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.bg} ${m.color}`}>
                         <m.icon size={20} />
                       </div>
                       <span className="font-bold text-slate-700 text-sm">{m.name}</span>
                    </div>
                    {paymentMethod === m.id && <CheckCircle2 size={20} fill="currentColor" className="text-white bg-cyan-500 rounded-full" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 pb-10 rounded-b-[2.5rem]">
        <button
          onClick={step === 'select' ? () => setStep('payment') : () => onComplete(selectedPlan)}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center ${step === 'select' ? 'bg-slate-800 text-white shadow-slate-300' : 'bg-cyan-500 text-white shadow-cyan-200'}`}
        >
          {step === 'select' ? '确认下单' : '立即支付'}
        </button>
      </div>
    </motion.div>
  );
};

// --- App 入口 ---
const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isScanning, setIsScanning] = useState(false);
  const [machines, setMachines] = useState(INITIAL_MACHINES);
  // Orders State: { id, machineId, totalTime, remainingSeconds, status, currentStage, isPaused }
  const [orders, setOrders] = useState([
    { id: 'ORD-001', machineId: 'B638', totalTime: 20, remainingSeconds: 1200, status: 'running', currentStage: '洗涤', isPaused: false }
  ]);
  const [activeOrderId, setActiveOrderId] = useState(orders[0].id); // 默认显示第一个订单

  // 倒计时逻辑：秒级更新
  useEffect(() => {
    const timer = setInterval(() => {
      setOrders(prevOrders => prevOrders.map(order => {
        if (order.status === 'completed' || order.isPaused) return order;
        
        const newRemaining = order.remainingSeconds - 1;
        if (newRemaining <= 0) {
          // 订单完成，更新机器状态为 idle
          setMachines(prevM => prevM.map(m => m.id === order.machineId ? { ...m, status: 'idle' } : m));
          return { ...order, remainingSeconds: 0, status: 'completed', currentStage: '已完成' };
        }

        // 简单的阶段模拟逻辑
        let stage = '洗涤';
        const progress = 1 - (newRemaining / (order.totalTime * 60));
        if (progress < 0.25) stage = '洗涤'; // 0-25%
        else if (progress < 0.75) stage = '漂洗'; // 25%-75%
        else stage = '脱水'; // 75%-100%

        return { ...order, remainingSeconds: newRemaining, currentStage: stage };
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 寻找下一个可用机器
  const getNextAvailableMachine = () => {
    // 过滤出空闲机器，并按 ID 降序排列 (B638 -> B637 -> ...)
    const idleMachines = machines
      .filter(m => m.status === 'idle')
      .sort((a, b) => b.id.localeCompare(a.id)); 
      
    // 如果有空闲的，返回最大的那个 ID
    if (idleMachines.length > 0) {
      return idleMachines[0];
    }
    // 否则，返回第一个离线的机器作为占位符
    return machines.find(m => m.status === 'offline') || INITIAL_MACHINES[0];
  };

  const handlePaymentComplete = (plan) => {
    const targetMachine = getNextAvailableMachine();
    
    // 1. 创建新订单
    const newOrder = {
      id: `ORD-${Date.now()}`,
      machineId: targetMachine.id,
      totalTime: plan.time,
      remainingSeconds: plan.time * 60,
      status: 'running',
      currentStage: '洗涤',
      isPaused: false
    };

    // 2. 更新机器状态
    setMachines(prev => prev.map(m => m.id === targetMachine.id ? { ...m, status: 'active' } : m));

    // 3. 添加订单并跳转
    setOrders(prev => [...prev, newOrder]);
    setActiveOrderId(newOrder.id);
    setIsScanning(false);
    setActiveTab('home');
  };

  const togglePause = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isPaused: !o.isPaused } : o));
  };
  
  const handleBackFromOrder = () => {
    setActiveTab('home');
    const activeOrders = orders.filter(o => o.status === 'running');
    if (activeOrders.length > 0) {
      setActiveOrderId(activeOrders[activeOrders.length - 1].id);
    }
  }

  const currentOrderDetail = orders.find(o => o.id === activeOrderId) || orders.find(o => o.status === 'running');

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-800 p-4 font-sans">
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar { display: none; width: 0 !important; height: 0 !important; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>
      
      <div className={APP_CONTAINER_STYLE}>
        {/* 内容区域 */}
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
               <HomePage 
                 onScan={() => setIsScanning(true)} 
                 orders={orders} 
                 machines={machines} 
                 onOrderClick={(id) => { setActiveOrderId(id); setActiveTab('order'); }}
               />
            </motion.div>
          )}
          {activeTab === 'order' && (
            <motion.div key="order" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
               <OrderDetailControlPage 
                 order={currentOrderDetail} 
                 togglePause={togglePause} 
                 onBack={handleBackFromOrder}
               />
            </motion.div>
          )}
          {activeTab === 'profile' && (
             <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <ProfilePageContent />
             </motion.div>
          )}
        </AnimatePresence>

        {/* 扫码支付层 */}
        <AnimatePresence>
          {isScanning && (
            <ScanFlow 
              onClose={() => setIsScanning(false)} 
              availableMachine={getNextAvailableMachine()}
              onComplete={handlePaymentComplete}
            />
          )}
        </AnimatePresence>

        {/* 底部导航 */}
        <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default App;
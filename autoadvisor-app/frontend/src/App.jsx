import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Compass, BarChart2, Bookmark, 
  Sun, Moon, SlidersHorizontal, User, X, ShieldPlus, Trash2, MessageSquare, Star, ChevronLeft, ChevronRight, CheckCircle2 
} from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('overview'); // Відповідно до Figma початкова вкладка Overview
  
  // Авторизація
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  // Фільтри та дані машин
  const [budget, setBudget] = useState(80000);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedBody, setSelectedBody] = useState('Any');
  const [selectedTransmission, setSelectedTransmission] = useState('Any');
  const [cars, setCars] = useState([]);
  const [savedCarIds, setSavedCarIds] = useState([]); // Для збережених автомобілів

  // Відгуки
  const [reviews, setReviews] = useState([]);
  const [currentReviewIdx, setCurrentReviewIdx] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  // Адмінська форма додавання авто
  const [newCar, setNewCar] = useState({
    brand: 'BMW', model: 'M4 Competition', year: 2023, body_type: 'Coupe', transmission: 'Automatic', mileage: 12000, price: 74500, image_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80'
  });

  const fetchCars = () => {
    fetch(`http://127.0.0.1:8000/api/recommendations?budget_max=${budget}&brand=${selectedBrand}&body_type=${selectedBody}&transmission=${selectedTransmission}`)
      .then(res => res.json())
      .then(data => setCars(data));
  };

  const fetchReviews = () => {
    fetch('http://127.0.0.1:8000/api/reviews')
      .then(res => res.json())
      .then(data => setReviews(data));
  };

  useEffect(() => {
    fetchCars();
    fetchReviews();
  }, [budget, selectedBrand, selectedBody, selectedTransmission]);

  // Плавна автопрокрутка відгуків
  useEffect(() => {
    if (reviews.length === 0 || showAllReviews) return;
    const interval = setInterval(() => {
      setCurrentReviewIdx(prev => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [reviews, showAllReviews]);

  const handleAuth = (e) => {
    e.preventDefault();
    if (authMode === 'register' && passInput.length < 8) {
      alert('Помилка валідації: Пароль має містити мінімум 8 символів!');
      return;
    }

    const endpoint = authMode === 'login' ? '/api/login' : '/api/register';
    const body = authMode === 'login' ? { email: emailInput, password: passInput } : { email: emailInput, password: passInput, display_name: nameInput };

    fetch(`http://127.0.0.1:8000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(res => {
      if (res.status === 200) {
        setUser(res.body);
        setIsAuthModalOpen(false);
        alert(res.body.message);
      } else {
        alert(res.body.detail || 'Помилка авторизації');
      }
    });
  };

  const handleAddCar = (e) => {
    e.preventDefault();
    fetch('http://127.0.0.1:8000/api/admin/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCar)
    }).then(() => { alert('Авто успішно додано в MySQL!'); fetchCars(); });
  };

  const handleDeleteCar = (id) => {
    fetch(`http://127.0.0.1:8000/api/admin/cars/${id}`, { method: 'DELETE' }).then(() => fetchCars());
  };

  const handleToggleSave = (carId) => {
    if (savedCarIds.includes(carId)) {
      setSavedCarIds(savedCarIds.filter(id => id !== carId));
    } else {
      setSavedCarIds([...savedCarIds, carId]);
    }
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    fetch('http://127.0.0.1:8000/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: newReviewAuthor, comment: newReviewComment, rating: newReviewRating })
    }).then(() => {
      setNewReviewAuthor('');
      setNewReviewComment('');
      fetchReviews();
      alert('Відгук успішно опубліковано!');
    });
  };

  return (
    <div className={theme === 'dark' ? 'dark bg-[#0b0f19] text-slate-100 min-h-screen flex font-sans' : 'bg-slate-100 text-slate-900 min-h-screen flex font-sans'}>
      
      {/* БІЧНА ПАНЕЛЬ У СТИЛІ FIGMA */}
      <aside className={`w-64 flex flex-col justify-between p-6 border-r transition-colors ${theme === 'dark' ? 'bg-[#0f172a] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/30">
              📈
            </div>
            <span className={`text-xl font-bold tracking-wide ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>AutoAdvisor</span>
          </div>

          <nav className="space-y-1">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${activeTab === 'overview' ? 'bg-emerald-500/10 text-emerald-500 font-semibold' : 'hover:bg-slate-500/10'}`}>
              <LayoutDashboard size={18} /> Overview
            </button>
            <button onClick={() => setActiveTab('discover')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${activeTab === 'discover' ? 'bg-emerald-500/10 text-emerald-500 font-semibold' : 'hover:bg-slate-500/10'}`}>
              <Compass size={18} /> Discover
            </button>
            <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${activeTab === 'analytics' ? 'bg-emerald-500/10 text-emerald-500 font-semibold' : 'hover:bg-slate-500/10'}`}>
              <BarChart2 size={18} /> Market analytics
            </button>
            <button onClick={() => setActiveTab('saved')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${activeTab === 'saved' ? 'bg-emerald-500/10 text-emerald-500 font-semibold' : 'hover:bg-slate-500/10'}`}>
              <Bookmark size={18} /> Saved vehicles
            </button>
            <button onClick={() => setActiveTab('reviews')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${activeTab === 'reviews' ? 'bg-emerald-500/10 text-emerald-500 font-semibold' : 'hover:bg-slate-500/10'}`}>
              <MessageSquare size={18} /> Відгуки
            </button>
            {user?.is_admin && (
              <button onClick={() => setActiveTab('admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${activeTab === 'admin' ? 'bg-amber-500/10 text-amber-500 font-semibold' : 'hover:bg-slate-500/10'}`}>
                <ShieldPlus size={18} /> Admin Panel
              </button>
            )}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-700/30 flex items-center justify-between">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {user.display_name[0]}
              </div>
              <div>
                <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{user.display_name}</p>
                <p className="text-xs text-emerald-500">{user.is_admin ? 'Адмін' : 'Користувач'}</p>
              </div>
            </div>
          ) : (
            <button onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }} className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg">
              Sign In / Register
            </button>
          )}

          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`p-2 rounded-xl border ml-2 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'}`}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </aside>

      {/* ОСНОВНИЙ КОНТЕНТ */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Workspace / {activeTab}</span>
          {user && <button onClick={() => setUser(null)} className="text-xs px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg font-semibold">Вийти</button>}
        </div>

        {/* 1. OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className={`p-8 rounded-3xl border ${theme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
              <h1 className="text-3xl font-extrabold mb-2">AutoAdvisor System Overview</h1>
              <p className="text-slate-400 text-sm">Ласкаво просимо до системи інтелектуального підбору автомобілів та прогнозування ліквідності (СППР).</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className="font-bold text-lg mb-2 text-emerald-500">Експертна система</h3>
                <p className="text-xs text-slate-400">Розрахунок індексу ліквідності на основі пробігу, віку та ринкових трендів.</p>
              </div>
              <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className="font-bold text-lg mb-2 text-emerald-500">База даних MySQL</h3>
                <p className="text-xs text-slate-400">Зберігання оголошень, користувачів та актуальних цін на авто.</p>
              </div>
              <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className="font-bold text-lg mb-2 text-emerald-500">Аналітика ринку</h3>
                <p className="text-xs text-slate-400">Прогнозування втрати вартості з часом та термінів продажу.</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. DISCOVER */}
        {activeTab === 'discover' && (
          <>
            <div className={`p-8 rounded-3xl border mb-8 ${theme === 'dark' ? 'bg-gradient-to-r from-emerald-500/10 to-transparent border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
              <h1 className="text-4xl font-extrabold mb-3">Find the right car. <br /><span className="text-emerald-500">Know its future value.</span></h1>
              <p className="text-slate-400 text-sm max-w-xl">Підбір авто з бази MySQL з урахуванням оцінки ліквідності.</p>
            </div>

            {/* Фільтри */}
            <div className={`p-6 rounded-3xl border shadow-xl mb-8 ${theme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">Max Budget (${budget})</label>
                  <input type="range" min="10000" max="150000" step="5000" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full accent-emerald-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">Brand</label>
                  <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className={`w-full p-2.5 border rounded-xl text-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}>
                    <option value="All">All brands</option>
                    <option value="BMW">BMW</option>
                    <option value="Mercedes-Benz">Mercedes-Benz</option>
                    <option value="Audi">Audi</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">Body type</label>
                  <select value={selectedBody} onChange={(e) => setSelectedBody(e.target.value)} className={`w-full p-2.5 border rounded-xl text-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}>
                    <option value="Any">Any body</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Coupe">Coupe</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">Transmission</label>
                  <select value={selectedTransmission} onChange={(e) => setSelectedTransmission(e.target.value)} className={`w-full p-2.5 border rounded-xl text-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}>
                    <option value="Any">Any transmission</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Картки машин з кнопкою збереження */}
            <h2 className="text-xl font-bold mb-4">Your top recommendations ({cars.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cars.map((car) => {
                const isSaved = savedCarIds.includes(car.id);
                return (
                  <div key={car.id} className={`rounded-3xl overflow-hidden border shadow-xl flex flex-col justify-between ${theme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="h-48 overflow-hidden relative">
                      <img src={car.image_url} alt={car.title} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 bg-emerald-500 text-white rounded-full uppercase">{car.badge}</span>
                      <button onClick={() => handleToggleSave(car.id)} className={`absolute top-3 right-3 p-2 rounded-full shadow ${isSaved ? 'bg-emerald-500 text-white' : 'bg-black/50 text-white hover:bg-black'}`}>
                        <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-lg">{car.title}</h3>
                        <span className="text-lg font-extrabold text-emerald-500">${car.price.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-4">{car.body_type} • {car.year} • {car.mileage}</p>
                      
                      <div className={`p-3 rounded-2xl mb-4 border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-slate-400">LIQUIDITY SCORE</span>
                          <span className="text-emerald-500 font-extrabold text-sm">{car.liquidity_score} / 100</span>
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${car.liquidity_score}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* 3. MARKET ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Market Analytics & Depreciation Trends</h2>
            <div className={`p-8 rounded-3xl border ${theme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
              <p className="text-sm text-slate-400 mb-4">Динаміка попиту та втрати вартості автомобілів на вторинному ринку за останні 90 днів.</p>
              <div className="h-64 flex items-end gap-4 pt-10 border-b border-slate-700 px-4">
                <div className="w-1/6 bg-emerald-500/20 h-[40%] rounded-t-xl flex items-center justify-center text-xs font-bold text-emerald-500">Січ</div>
                <div className="w-1/6 bg-emerald-500/30 h-[60%] rounded-t-xl flex items-center justify-center text-xs font-bold text-emerald-500">Лют</div>
                <div className="w-1/6 bg-emerald-500/50 h-[80%] rounded-t-xl flex items-center justify-center text-xs font-bold text-emerald-500">Бер</div>
                <div className="w-1/6 bg-emerald-500 h-[95%] rounded-t-xl flex items-center justify-center text-xs font-bold text-slate-950">Квіт (+3.2%)</div>
                <div className="w-1/6 bg-emerald-500/40 h-[70%] rounded-t-xl flex items-center justify-center text-xs font-bold text-emerald-500">Трав</div>
                <div className="w-1/6 bg-emerald-500/30 h-[50%] rounded-t-xl flex items-center justify-center text-xs font-bold text-emerald-500">Черв</div>
              </div>
            </div>
          </div>
        )}

        {/* 4. SAVED VEHICLES */}
        {activeTab === 'saved' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Saved vehicles ({savedCarIds.length})</h2>
            {savedCarIds.length === 0 ? (
              <div className={`p-12 text-center rounded-3xl border ${theme === 'dark' ? 'bg-[#0f172a] border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
                <Bookmark size={48} className="mx-auto mb-3 opacity-40" />
                <p className="font-bold">Your shortlist is empty</p>
                <p className="text-xs mt-1">Зберігайте автомобілі у вкладці Discover, щоб порівнювати їх тут.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cars.filter(c => savedCarIds.includes(c.id)).map(car => (
                  <div key={car.id} className={`rounded-3xl p-5 border shadow-xl ${theme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
                    <h3 className="font-bold text-lg mb-1">{car.title}</h3>
                    <p className="text-emerald-500 font-bold mb-2">${car.price.toLocaleString()}</p>
                    <button onClick={() => handleToggleSave(car.id)} className="text-xs text-red-500 font-semibold hover:underline">Видалити зі збережених</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. ВІДГУКИ (З вибором 5 зірочок + автопрокрутка) */}
        {activeTab === 'reviews' && (
          <div className="max-w-4xl mx-auto py-6">
            <div className="flex justify-between items-start mb-10">
              <div>
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">ВІДГУКИ КЛІЄНТІВ</span>
                <h2 className="text-3xl font-extrabold mt-1">Що говорять про нас</h2>
                <p className="text-sm text-slate-400 mt-1">Справжні враження людей, які вже користуються нашим продуктом.</p>
              </div>
              <div className={`p-4 rounded-2xl border flex items-center gap-4 shadow-lg ${theme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="text-3xl font-black text-emerald-500">4.3</div>
                <div>
                  <div className="flex text-amber-400"><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} stroke="currentColor"/></div>
                  <p className="text-xs text-slate-400 mt-0.5">{reviews.length} відгуків</p>
                </div>
              </div>
            </div>

            {/* Карточки відгуків */}
            <div className="relative mb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reviews.slice(currentReviewIdx, currentReviewIdx + 3).map((rev, idx) => (
                  <div key={idx} className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between ${theme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div>
                      <div className="flex text-amber-400 mb-3">
                        {[...Array(rev.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                      </div>
                      <p className="text-sm italic text-slate-300 mb-6">"{rev.comment}"</p>
                    </div>
                    <div className="pt-4 border-t border-slate-700/40 flex justify-between items-center text-xs text-slate-400">
                      <span className="font-bold text-slate-200">{rev.author}</span>
                      <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12}/> Перевірено</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setCurrentReviewIdx(p => Math.max(0, p - 1))} className="p-2.5 rounded-full bg-slate-800 text-white hover:bg-emerald-500"><ChevronLeft size={16}/></button>
                <button onClick={() => setCurrentReviewIdx(p => Math.min(reviews.length - 3, p + 1))} className="p-2.5 rounded-full bg-slate-800 text-white hover:bg-emerald-500"><ChevronRight size={16}/></button>
              </div>
            </div>

            {/* Форма додавання відгуку з вибором 5 зірочок */}
            <div className="bg-[#121824] border border-slate-800 rounded-3xl p-8 mb-12 shadow-2xl">
              <span className="text-xs font-bold text-emerald-500 uppercase">ВАША ДУМКА ВАЖЛИВА</span>
              <h3 className="text-2xl font-extrabold text-white mt-1 mb-2">Поділіться своїм досвідом</h3>
              <p className="text-xs text-slate-400 mb-6">Оцініть сервіс та залиште відгук.</p>
              
              <form onSubmit={handleAddReview} className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-slate-400">Ваша оцінка:</span>
                  <div className="flex text-amber-400 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={20} 
                        fill={star <= newReviewRating ? "currentColor" : "none"} 
                        onClick={() => setNewReviewRating(star)} 
                      />
                    ))}
                  </div>
                </div>
                <input type="text" placeholder="Ваше ім'я" value={newReviewAuthor} onChange={e=>setNewReviewAuthor(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white" required />
                <textarea placeholder="Ваш відгук..." value={newReviewComment} onChange={e=>setNewReviewComment(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white h-20" required />
                <button type="submit" className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-all">Опублікувати відгук</button>
              </form>
            </div>
          </div>
        )}

        {/* 6. ADMIN PANEL (Тільки для адміна sasha342008@gmail.com) */}
        {activeTab === 'admin' && user?.is_admin && (
          <div className="max-w-xl mx-auto py-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><ShieldPlus className="text-amber-500"/> Адмін-панель: Керування базою MySQL</h2>
            <form onSubmit={handleAddCar} className={`p-8 rounded-3xl border shadow-xl space-y-4 ${theme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className="font-bold text-sm text-emerald-500">Додати новий автомобіль</h3>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Brand" value={newCar.brand} onChange={e=>setNewCar({...newCar, brand: e.target.value})} className="p-3 bg-slate-900 rounded-xl text-xs text-white" required />
                <input type="text" placeholder="Model" value={newCar.model} onChange={e=>setNewCar({...newCar, model: e.target.value})} className="p-3 bg-slate-900 rounded-xl text-xs text-white" required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <input type="number" placeholder="Year" value={newCar.year} onChange={e=>setNewCar({...newCar, year: Number(e.target.value)})} className="p-3 bg-slate-900 rounded-xl text-xs text-white" required />
                <input type="number" placeholder="Price" value={newCar.price} onChange={e=>setNewCar({...newCar, price: Number(e.target.value)})} className="p-3 bg-slate-900 rounded-xl text-xs text-white" required />
                <input type="number" placeholder="Mileage" value={newCar.mileage} onChange={e=>setNewCar({...newCar, mileage: Number(e.target.value)})} className="p-3 bg-slate-900 rounded-xl text-xs text-white" required />
              </div>
              <input type="text" placeholder="URL фотографії" value={newCar.image_url} onChange={e=>setNewCar({...newCar, image_url: e.target.value})} className="w-full p-3 bg-slate-900 rounded-xl text-xs text-white" required />
              <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs">Зберегти авто в MySQL</button>
            </form>
          </div>
        )}

      </main>

      {/* МОДАЛЬНЕ ВІКНО АВТОРИЗАЦІЇ З ВАЛІДАЦІЄЮ */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className={`p-8 rounded-3xl w-full max-w-md shadow-2xl border ${theme === 'dark' ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{authMode === 'login' ? 'Sign in' : 'Register'}</h2>
              <button onClick={() => setIsAuthModalOpen(false)} className="text-slate-400"><X size={20}/></button>
            </div>

            <div className="flex gap-2 mb-6 bg-slate-800/40 p-1 rounded-xl">
              <button onClick={() => setAuthMode('login')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${authMode === 'login' ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}>Sign in</button>
              <button onClick={() => setAuthMode('register')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${authMode === 'register' ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}>Register</button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Display Name</label>
                  <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white" placeholder="Саша" required />
                </div>
              )}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Email address</label>
                <input type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white" placeholder="you@example.com" required />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Password (мін. 8 символів)</label>
                <input type="password" value={passInput} onChange={e => setPassInput(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white" placeholder="••••••••" required />
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-lg mt-2">
                {authMode === 'login' ? 'Увійти' : 'Зареєструватися'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
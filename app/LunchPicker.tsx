'use client'
import React, { useState, useEffect } from 'react';

const LunchPicker = () => {
  const [distance, setDistance] = useState(300);
  const [selectedCategories, setSelectedCategories] = useState(['전체']);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);

  // 마이워크스페이스타워 강남역 타워점 좌표
  const MYWORKSPACE_TOWER = {
    lat: 37.497715,
    lng: 127.027956
  };

  console.log('야호 코드 변경했다!');

  // 강남역 근처 실제 식당 데이터
  const restaurants = [
    { 
      name: "본죽&비빔밥 강남역점", 
      category: "한식", 
      price: "6,000~9,000원", 
      time: "24시간", 
      distance: 120,
      lat: 37.498100,
      lng: 127.027800,
      address: "서울 강남구 강남대로 지하396",
      menus: [
        { name: "전복죽", price: "8,500원" },
        { name: "닭죽", price: "6,000원" },
        { name: "불고기비빔밥", price: "7,000원" },
        { name: "제육비빔밥", price: "6,500원" }
      ]
    },
    { 
      name: "김밥천국 강남역점", 
      category: "분식", 
      price: "3,000~8,000원", 
      time: "24시간", 
      distance: 150,
      lat: 37.498200,
      lng: 127.028000,
      address: "서울 강남구 역삼동",
      menus: [
        { name: "참치김밥", price: "3,500원" },
        { name: "김치찌개", price: "7,000원" },
        { name: "돈까스", price: "8,000원" },
        { name: "라면", price: "4,000원" }
      ]
    },
    { 
      name: "맘스터치 강남역점", 
      category: "양식", 
      price: "5,000~9,000원", 
      time: "10:00~22:00", 
      distance: 180,
      lat: 37.498050,
      lng: 127.028200,
      address: "서울 강남구 강남대로",
      menus: [
        { name: "싸이버거", price: "6,200원" },
        { name: "치킨버거", price: "7,300원" },
        { name: "감자튀김", price: "3,200원" },
        { name: "치킨텐더", price: "8,900원" }
      ]
    },
    { 
      name: "롯데리아 강남역점", 
      category: "양식", 
      price: "4,000~8,000원", 
      time: "06:00~24:00", 
      distance: 160,
      lat: 37.498300,
      lng: 127.027900,
      address: "서울 강남구 역삼동",
      menus: [
        { name: "불고기버거", price: "5,400원" },
        { name: "치즈버거", price: "4,800원" },
        { name: "새우버거", price: "6,900원" },
        { name: "감자튀김", price: "3,100원" }
      ]
    },
    { 
      name: "서브웨이 강남역점", 
      category: "양식", 
      price: "5,000~9,000원", 
      time: "07:00~23:00", 
      distance: 220,
      lat: 37.498400,
      lng: 127.028300,
      address: "서울 강남구 강남대로",
      menus: [
        { name: "이탈리안 BMT", price: "7,300원" },
        { name: "터키 베이컨", price: "8,100원" },
        { name: "참치", price: "6,900원" },
        { name: "에그마요", price: "6,100원" }
      ]
    },
    { 
      name: "명동교자 강남점", 
      category: "한식", 
      price: "7,000~10,000원", 
      time: "11:00~21:00", 
      distance: 200,
      lat: 37.498150,
      lng: 127.028100,
      address: "서울 강남구 역삼동",
      menus: [
        { name: "왕만두", price: "8,000원" },
        { name: "물만두", price: "7,000원" },
        { name: "비빔냉면", price: "9,000원" },
        { name: "물냉면", price: "8,500원" }
      ]
    },
    { 
      name: "청년다방 강남역점", 
      category: "분식", 
      price: "3,000~7,000원", 
      time: "07:00~22:00", 
      distance: 140,
      lat: 37.498000,
      lng: 127.027700,
      address: "서울 강남구 강남대로 지하",
      menus: [
        { name: "떡볶이", price: "4,500원" },
        { name: "라면", price: "3,500원" },
        { name: "김밥", price: "3,000원" },
        { name: "순대", price: "6,000원" }
      ]
    },
    { 
      name: "순남시래기 강남점", 
      category: "한식", 
      price: "8,000~10,000원", 
      time: "24시간", 
      distance: 190,
      lat: 37.498250,
      lng: 127.028150,
      address: "서울 강남구 역삼동",
      menus: [
        { name: "순대국밥", price: "8,000원" },
        { name: "돼지국밥", price: "8,500원" },
        { name: "수육국밥", price: "9,000원" },
        { name: "내장탕", price: "9,500원" }
      ]
    },
    { 
      name: "홍콩반점 강남점", 
      category: "중식", 
      price: "6,000~9,000원", 
      time: "11:00~21:00", 
      distance: 210,
      lat: 37.498280,
      lng: 127.028250,
      address: "서울 강남구 강남대로",
      menus: [
        { name: "짜장면", price: "6,000원" },
        { name: "짬뽕", price: "7,000원" },
        { name: "탕수육(소)", price: "9,000원" },
        { name: "볶음밥", price: "7,500원" }
      ]
    },
    { 
      name: "스시로 강남역점", 
      category: "일식", 
      price: "8,000~10,000원", 
      time: "11:30~14:30", 
      distance: 260,
      lat: 37.498450,
      lng: 127.028500,
      address: "서울 강남구 역삼동",
      menus: [
        { name: "연어초밥 세트", price: "9,900원" },
        { name: "참치초밥 세트", price: "8,900원" },
        { name: "모듬초밥", price: "10,000원" },
        { name: "우동", price: "6,500원" }
      ]
    }
  ];

  // 카테고리별 개수 계산
  const getCategoryCounts = () => {
    const counts = {
      전체: filteredRestaurants.length,
      한식: filteredRestaurants.filter(r => r.category === '한식').length,
      양식: filteredRestaurants.filter(r => r.category === '양식').length,
      중식: filteredRestaurants.filter(r => r.category === '중식').length,
      일식: filteredRestaurants.filter(r => r.category === '일식').length,
      분식: filteredRestaurants.filter(r => r.category === '분식').length,
    };
    return counts;
  };

  // 거리 필터링
  useEffect(() => {
    const filtered = restaurants.filter(restaurant => restaurant.distance <= distance);
    setFilteredRestaurants(filtered);
  }, [distance]);

  // 카테고리 필터링된 식당 목록 가져오기
  const getFilteredRestaurants = () => {
    if (selectedCategories.includes('전체')) {
      return filteredRestaurants;
    }
    return filteredRestaurants.filter(restaurant => 
      selectedCategories.includes(restaurant.category)
    );
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category) => {
    if (category === '전체') {
      setSelectedCategories(['전체']);
    } else {
      const newCategories = selectedCategories.includes('전체') 
        ? [category] 
        : selectedCategories.includes(category)
          ? selectedCategories.filter(c => c !== category)
          : [...selectedCategories, category];
      
      if (newCategories.length === 0) {
        setSelectedCategories(['전체']);
      } else {
        setSelectedCategories(newCategories);
      }
    }
  };

  // 식당 뽑기
  const drawRestaurant = () => {
    const availableRestaurants = getFilteredRestaurants();
    
    if (availableRestaurants.length === 0) {
      alert('선택한 조건에 맞는 식당이 없습니다!');
      return;
    }

    setIsDrawing(true);
    
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * availableRestaurants.length);
      setSelectedRestaurant(availableRestaurants[randomIndex]);
      setIsDrawing(false);
    }, 1500);
  };

  // 네이버 지도 열기
  const openNaverMap = () => {
    if (selectedRestaurant) {
      const url = `https://map.naver.com/v5/search/${encodeURIComponent(selectedRestaurant.name)}`;
      window.open(url, '_blank');
    }
  };

  const counts = getCategoryCounts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center p-5 text-white font-sans">
      <div className="max-w-md w-full bg-white bg-opacity-5 backdrop-blur-3xl border border-white border-opacity-10 rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-black bg-opacity-40 backdrop-blur-3xl text-white p-4 text-center m-5 rounded-lg">
          <h1 className="text-lg font-bold mb-2">🍔 회사 점심 랜덤 뽑기</h1>
          <p className="text-xs opacity-90 italic">
            마이워크스페이스타워 {distance}m 이내 • 1만원 이하
          </p>
        </div>

        <div className="p-8">
          {/* 거리 필터 */}
          <div className="bg-white bg-opacity-5 backdrop-blur-2xl border border-white border-opacity-10 rounded-xl p-4 mb-5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold">📍 검색 거리</span>
              <span className="text-sm text-red-400 font-semibold bg-red-400 bg-opacity-10 px-2 py-1 rounded-lg">
                {distance}m 이내
              </span>
            </div>
            <div className="relative">
              <div 
                className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-red-400 to-orange-500 rounded-full transition-all duration-200"
                style={{ width: `${((distance - 300) / 700) * 100}%` }}
              />
              <input
                type="range"
                min="300"
                max="1000"
                value={distance}
                step="50"
                onChange={(e) => setDistance(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white bg-opacity-20 rounded-full appearance-none cursor-pointer slider"
              />
            </div>
          </div>

          {/* 카테고리 필터 */}
          <div className="bg-white bg-opacity-5 backdrop-blur-2xl border border-white border-opacity-10 rounded-xl mb-6">
            <div 
              className="flex justify-between items-center p-4 cursor-pointer font-semibold text-sm hover:bg-white hover:bg-opacity-3 transition-colors"
              onClick={() => setShowFilters(!showFilters)}
            >
              <span>🍽️ 카테고리 선택</span>
              <svg 
                className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="#ff6b6b" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                viewBox="0 0 24 24"
              >
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </div>
            
            {showFilters && (
              <div className="px-4 pb-4 border-t border-white border-opacity-10 animate-slideDown">
                {[
                  { key: '전체', label: '전체', count: counts.전체 },
                  { key: '한식', label: '한식', count: counts.한식 },
                  { key: '양식', label: '양식', count: counts.양식 },
                  { key: '중식', label: '중식', count: counts.중식 },
                  { key: '일식', label: '일식', count: counts.일식 },
                  { key: '분식', label: '분식', count: counts.분식 },
                ].map((category, index) => (
                  <label 
                    key={category.key}
                    className={`flex items-center py-2.5 px-2 cursor-pointer text-sm hover:text-red-400 hover:bg-red-400 hover:bg-opacity-5 rounded-md transition-colors ${index === 0 ? 'border-b border-white border-opacity-10 pb-4 mb-1' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.key)}
                      onChange={() => handleCategoryChange(category.key)}
                      className="mr-3 scale-110 accent-red-400"
                    />
                    {category.label} ({category.count}개)
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 뽑기 버튼 */}
          <button
            onClick={drawRestaurant}
            disabled={isDrawing}
            className={`w-full bg-gradient-to-r from-red-400 to-orange-500 text-white border-none rounded-xl p-4 text-lg font-bold cursor-pointer transition-all duration-300 shadow-lg backdrop-blur-2xl relative overflow-hidden ${
              isDrawing 
                ? 'opacity-80 cursor-not-allowed animate-pulse' 
                : 'hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0'
            }`}
          >
            <span className="relative z-10">
              {isDrawing ? '🎲 뽑는 중...' : '🎲 오늘의 식당 뽑기'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-opacity-20 to-transparent transform -translate-x-full hover:translate-x-full transition-transform duration-500" />
          </button>

          {/* 결과 카드 */}
          <div className="bg-white bg-opacity-5 backdrop-blur-3xl border border-white border-opacity-10 rounded-2xl p-6 text-center my-5 transition-all duration-300 shadow-lg min-h-80 flex flex-col justify-center">
            {!selectedRestaurant ? (
              <div className="opacity-80">
                <p className="text-xs leading-relaxed opacity-90 text-white text-opacity-80">
                  오늘의 식당 뽑기 버튼을 눌러서<br />오늘의 점심을 골라봐요 🍽️
                </p>
              </div>
            ) : (
              <div className="animate-slideInResult">
                <div className="text-xl font-bold mb-3 text-red-400">
                  {selectedRestaurant.name}
                </div>
                <div className="text-sm opacity-90 leading-relaxed mb-4">
                  📍 {selectedRestaurant.address}<br />
                  💰 {selectedRestaurant.price}<br />
                  🕐 {selectedRestaurant.time}<br />
                  📏 도보 {Math.ceil(selectedRestaurant.distance / 80)}분 ({selectedRestaurant.distance}m)
                </div>
                
                <div className="mt-5 text-left">
                  <h4 className="text-sm mb-3 text-red-400 text-center">
                    🍽️ 만원 이하 추천 메뉴
                  </h4>
                  <div className="bg-white bg-opacity-5 rounded-xl p-4 mb-4">
                    {selectedRestaurant.menus.map((menu, index) => (
                      <div 
                        key={index}
                        className={`flex justify-between py-2 text-xs ${index < selectedRestaurant.menus.length - 1 ? 'border-b border-white border-opacity-10' : ''}`}
                      >
                        <span className="text-white text-opacity-90">{menu.name}</span>
                        <span className="text-red-400 font-semibold">{menu.price}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={openNaverMap}
                    className="w-full bg-white bg-opacity-10 backdrop-blur-2xl border border-white border-opacity-20 text-white rounded-xl p-3 text-xs cursor-pointer transition-all duration-300 font-medium hover:bg-red-400 hover:bg-opacity-20 hover:border-red-400 hover:-translate-y-0.5"
                  >
                    📍 네이버지도에서 보기
                  </button>
                </div>
              </div>
            )}
          </div>


        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInResult {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease;
        }

        .animate-slideInResult {
          animation: slideInResult 0.5s ease-out;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
          transition: all 0.2s ease;
          margin-top: -7px;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.5);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
          transition: all 0.2s ease;
          appearance: none;
          margin-top: -10px;
        }

        @media (max-width: 480px) {
          .max-w-md {
            margin: 10px;
            max-width: calc(100% - 20px);
          }
        }
      `}</style>
    </div>
  );
};

export default LunchPicker;
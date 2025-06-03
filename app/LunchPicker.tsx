'use client'
import React, { useState, useEffect, useRef } from 'react';

interface Restaurant {
  name: string;
  category: string;
  price: string;
  time: string;
  distance: number;
  lat: number;
  lng: number;
  address: string;
  telephone?: string;
  menus: { name: string; price: string; }[];
}

declare global {
  interface Window {
    naver: any;
    initNaverMapCallback: () => void;
  }
}

const LunchPicker = () => {
  const [distance, setDistance] = useState(500);
  const [selectedCategories, setSelectedCategories] = useState(['전체']);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [showMap, setShowMap] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const naverMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const scriptLoadedRef = useRef(false);

  // 마이워크스페이스 타워 좌표
  const MYWORKSPACE_TOWER = {
    lat: 37.4964,
    lng: 127.0292
  };

  // 네이버 지도 API 로드
  useEffect(() => {
    if (window.naver && window.naver.maps) {
      setMapLoaded(true);
      setSearchError(null);
      return;
    }

    if (scriptLoadedRef.current) {
      return;
    }

    scriptLoadedRef.current = true;
    initializeStaticMap();
  }, []);

  // 대안 정적 지도 초기화
  const initializeStaticMap = () => {
    if (!mapRef.current) return;

    mapRef.current.innerHTML = `
      <div style="
        width: 100%; 
        height: 100%; 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        text-align: center;
        padding: 15px;
        box-sizing: border-box;
        position: relative;
      ">
        <div style="font-size: 48px; margin-bottom: 15px;">🗺️</div>
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">
          마이워크스페이스 타워 주변
        </div>
        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 15px; line-height: 1.6;">
          📍 서울 서초구 강남대로53길 8<br>
          🚇 강남역 5번 출구 도보 1분<br>
          🍽️ 주변 식당 ${filteredRestaurants.length}개 발견
        </div>
        
        <button 
          onclick="window.open('https://map.naver.com/v5/search/마이워크스페이스%20타워', '_blank')"
          style="
            padding: 10px 15px;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 20px;
            color: white;
            cursor: pointer;
            font-size: 12px;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            touch-action: manipulation;
          "
        >
          📍 네이버 지도
        </button>
      </div>
    `;
  };

  // 식당 검색 시뮬레이션
  const searchRestaurants = async () => {
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const categoryQueries = {
        '한식': '한식 맛집',
        '양식': '양식 햄버거 파스타',
        '중식': '중식 짜장면 짬뽕',
        '일식': '일식 초밥 라멘',
        '분식': '분식 떡볶이 김밥'
      };

      const allRestaurants: Restaurant[] = [];
      
      const categoriesToSearch = selectedCategories.includes('전체') 
        ? Object.keys(categoryQueries) 
        : selectedCategories.filter(cat => cat !== '전체');

      for (const category of categoriesToSearch) {
        const query = categoryQueries[category as keyof typeof categoryQueries];
        const mockApiResponse = await simulateNaverSearchAPI(query, category);
        allRestaurants.push(...mockApiResponse);
      }

      const filteredByDistance = allRestaurants.filter(restaurant => 
        restaurant.distance <= distance
      );

      setFilteredRestaurants(filteredByDistance);
      
    } catch (error) {
      setSearchError('식당 정보를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  // 네이버 검색 API 응답 시뮬레이션
  const simulateNaverSearchAPI = async (query: string, category: string): Promise<Restaurant[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const baseRestaurants = {
      '한식': [
        { name: "본죽&비빔밥 강남역점", address: "서울 서초구 강남대로 지하396", telephone: "02-123-4567" },
        { name: "명동교자 강남점", address: "서울 서초구 서초대로 123", telephone: "02-234-5678" },
        { name: "순남시래기 강남점", address: "서울 서초구 서초대로 456", telephone: "02-345-6789" }
      ],
      '양식': [
        { name: "맘스터치 강남역점", address: "서울 서초구 강남대로 789", telephone: "02-456-7890" },
        { name: "롯데리아 강남역점", address: "서울 서초구 서초대로 321", telephone: "02-567-8901" },
        { name: "서브웨이 강남역점", address: "서울 서초구 강남대로 654", telephone: "02-678-9012" }
      ],
      '중식': [
        { name: "홍콩반점 강남점", address: "서울 서초구 강남대로 987", telephone: "02-789-0123" }
      ],
      '일식': [
        { name: "스시로 강남역점", address: "서울 서초구 서초대로 789", telephone: "02-890-1234" }
      ],
      '분식': [
        { name: "김밥천국 강남역점", address: "서울 서초구 서초대로 111", telephone: "02-901-2345" },
        { name: "청년다방 강남역점", address: "서울 서초구 강남대로 지하 555", telephone: "02-012-3456" }
      ]
    };

    const categoryRestaurants = baseRestaurants[category as keyof typeof baseRestaurants] || [];
    
    return categoryRestaurants.map((item) => {
      const lat = 37.4964 + (Math.random() - 0.5) * 0.01;
      const lng = 127.0292 + (Math.random() - 0.5) * 0.01;
      
      const distanceCalc = Math.sqrt(
        Math.pow((lat - MYWORKSPACE_TOWER.lat) * 111000, 2) + 
        Math.pow((lng - MYWORKSPACE_TOWER.lng) * 88000, 2)
      );

      return {
        name: item.name,
        category: category,
        price: generateRandomPrice(),
        time: generateRandomTime(),
        distance: Math.round(distanceCalc),
        lat: lat,
        lng: lng,
        address: item.address,
        telephone: item.telephone,
        menus: generateRandomMenus(category)
      };
    });
  };

  const generateRandomPrice = () => {
    const prices = ["4,000~8,000원", "5,000~9,000원", "6,000~10,000원", "7,000~12,000원"];
    return prices[Math.floor(Math.random() * prices.length)];
  };

  const generateRandomTime = () => {
    const times = ["24시간", "09:00~22:00", "10:00~21:00", "11:00~20:00", "11:30~14:30"];
    return times[Math.floor(Math.random() * times.length)];
  };

  const generateRandomMenus = (category: string) => {
    const menusByCategory = {
      '한식': [
        { name: "김치찌개", price: "8,000원" },
        { name: "된장찌개", price: "7,000원" },
        { name: "불고기", price: "12,000원" },
        { name: "비빔밥", price: "9,000원" }
      ],
      '양식': [
        { name: "치즈버거", price: "6,500원" },
        { name: "치킨버거", price: "7,000원" },
        { name: "감자튀김", price: "3,500원" },
        { name: "콜라", price: "2,000원" }
      ],
      '중식': [
        { name: "짜장면", price: "6,000원" },
        { name: "짬뽕", price: "7,000원" },
        { name: "탕수육", price: "15,000원" },
        { name: "볶음밥", price: "8,000원" }
      ],
      '일식': [
        { name: "초밥세트", price: "12,000원" },
        { name: "라멘", price: "9,000원" },
        { name: "돈까스", price: "8,500원" },
        { name: "우동", price: "7,000원" }
      ],
      '분식': [
        { name: "떡볶이", price: "4,000원" },
        { name: "순대", price: "5,000원" },
        { name: "김밥", price: "3,000원" },
        { name: "라면", price: "3,500원" }
      ]
    };

    const menus = menusByCategory[category as keyof typeof menusByCategory] || [];
    return menus.slice(0, 3 + Math.floor(Math.random() * 2));
  };

  // 거리 또는 카테고리 변경시 식당 검색
  useEffect(() => {
    searchRestaurants();
  }, [distance, selectedCategories]);

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
  const handleCategoryChange = (category: string) => {
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
  const openNaverMapExternal = () => {
    if (selectedRestaurant) {
      const url = `https://map.naver.com/v5/search/${encodeURIComponent(selectedRestaurant.name)}`;
      window.open(url, '_blank');
    }
  };

  // 카테고리 이모지
  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case '한식': return '🍚';
      case '양식': return '🍔';
      case '중식': return '🍜';
      case '일식': return '🍣';
      case '분식': return '🥟';
      default: return '🍽️';
    }
  };

  const counts = getCategoryCounts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="w-full max-w-md mx-auto p-4">
        {/* 글래스 카드 메인 컨테이너 */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          
          {/* 헤더 */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl text-center m-6 p-4">
            <h1 className="text-lg font-bold mb-2">🍔 회사 점심 랜덤 뽑기</h1>
            <p className="text-xs opacity-90 italic">
              마이워크스페이스 타워 {distance}m 이내 • 1만원 이하
            </p>
          </div>

          <div className="p-6 space-y-6">
            
            {/* 거리 필터 */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold">📍 검색 거리</span>
                <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-lg text-sm font-semibold">
                  {distance}m 이내
                </span>
              </div>
              
              <div className="relative">
                <div 
                  className="absolute top-0 left-0 h-2 bg-gradient-to-r from-red-400 to-orange-500 rounded-full transition-all duration-200"
                  style={{ width: `${((distance - 300) / 700) * 100}%` }}
                />
                <input
                  type="range"
                  min="300"
                  max="1000"
                  value={distance}
                  step="100"
                  onChange={(e) => setDistance(parseInt(e.target.value))}
                  className="relative z-10 w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                />
              </div>
              
              {isSearching && (
                <div className="text-xs text-blue-400 text-center mt-2">
                  🔍 주변 식당 검색 중...
                </div>
              )}
              {searchError && (
                <div className="text-xs text-red-400 text-center mt-2">
                  ⚠️ {searchError}
                </div>
              )}
            </div>

            {/* 카테고리 필터 */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-white/5 transition-colors rounded-xl"
                onClick={() => setShowFilters(!showFilters)}
              >
                <span className="text-sm font-semibold">🍽️ 카테고리 선택</span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#ff6b6b" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </div>
              
              {showFilters && (
                <div className="px-4 pb-4 border-t border-white/10 pt-4">
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
                      className={`flex items-center p-2 cursor-pointer hover:text-red-400 hover:bg-red-500/5 transition-colors rounded-lg text-sm ${
                        index === 0 ? 'border-b border-white/10 pb-3 mb-2' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.key)}
                        onChange={() => handleCategoryChange(category.key)}
                        className="mr-3 w-4 h-4 text-red-400 bg-transparent border-gray-300 rounded focus:ring-red-400"
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
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                isDrawing 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse cursor-not-allowed' 
                  : 'bg-gradient-to-r from-red-400 to-orange-500 hover:from-red-500 hover:to-orange-600 hover:shadow-lg hover:shadow-red-500/25 hover:-translate-y-0.5'
              }`}
            >
              {isDrawing ? '🎲 뽑는 중...' : '🎲 오늘의 식당 뽑기'}
            </button>

            {/* 선택된 식당 정보 */}
            {selectedRestaurant && (
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5 animate-in slide-in-from-bottom-4 duration-500">
                <div className="text-xl font-bold mb-3 text-red-400">
                  {getCategoryEmoji(selectedRestaurant.category)} {selectedRestaurant.name}
                </div>
                <div className="text-sm opacity-90 leading-relaxed mb-4">
                  📍 {selectedRestaurant.address}<br/>
                  💰 {selectedRestaurant.price}<br/>
                  🕐 {selectedRestaurant.time}<br/>
                  📏 도보 {Math.ceil(selectedRestaurant.distance / 80)}분 ({selectedRestaurant.distance}m)
                  {selectedRestaurant.telephone && <><br/>📞 {selectedRestaurant.telephone}</>}
                </div>
                
                {selectedRestaurant.menus && selectedRestaurant.menus.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-bold mb-2 text-red-400">🍽️ 추천 메뉴</div>
                    <div className="space-y-2">
                      {selectedRestaurant.menus.map((menu, index) => (
                        <div key={index} className="flex justify-between py-2 border-b border-white/10 last:border-b-0 text-sm">
                          <span className="text-white/90">{menu.name}</span>
                          <span className="text-red-400 font-semibold">{menu.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={openNaverMapExternal}
                  className="w-full bg-white/10 hover:bg-red-500/20 border border-white/20 hover:border-red-400 text-white rounded-lg py-3 px-4 text-sm transition-all duration-300 hover:-translate-y-0.5"
                >
                  📍 네이버 지도에서 보기
                </button>
              </div>
            )}

            {/* 네이버 지도 */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold text-blue-400">🗺️ 주변 식당 지도</h4>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-lg py-1.5 px-3 text-xs transition-colors"
                >
                  {showMap ? '지도 숨기기' : '지도 보기'}
                </button>
              </div>
              
              {showMap && (
                <div className="w-full h-80 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg overflow-hidden border border-white/10">
                  <div ref={mapRef} className="w-full h-full" />
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
          transition: all 0.2s ease;
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
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
          transition: all 0.2s ease;
          -moz-appearance: none;
          appearance: none;
        }

        @keyframes slide-in-from-bottom-4 {
          from {
            opacity: 0;
            transform: translateY(1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation-fill-mode: both;
        }

        .slide-in-from-bottom-4 {
          animation-name: slide-in-from-bottom-4;
        }

        .duration-500 {
          animation-duration: 500ms;
        }
      `}</style>
    </div>
  );
};

export default LunchPicker;
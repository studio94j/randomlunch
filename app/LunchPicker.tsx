'use client'
import React, { useState, useEffect } from 'react';

interface Restaurant {
  name: string;
  category: string;
  price: string;
  time: string;
  distance: number;
  lat: number;
  lng: number;
  address: string;
  menus: { name: string; price: string; }[];
}

const LunchPicker = () => {
  const [distance, setDistance] = useState(300);
  const [selectedCategories, setSelectedCategories] = useState(['전체']);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);

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
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          height: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
        }

        body {
          background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%);
          color: white;
        }

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

        .slider {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.2);
          outline: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          cursor: pointer;
          border: 3px solid white;
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
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
          transition: all 0.2s ease;
          -moz-appearance: none;
          appearance: none;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .glass-section {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }

        .header-section {
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(20px);
          border-radius: 8px;
        }

        .distance-value {
          background: rgba(255, 107, 107, 0.1);
          color: #ff6b6b;
          padding: 4px 8px;
          border-radius: 8px;
          font-weight: 600;
        }

        .slider-track-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 6px;
          border-radius: 3px;
          background: linear-gradient(90deg, #ff6b6b, #ee5a24);
          transition: width 0.2s ease;
          z-index: 1;
        }

        .draw-button {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          border: none;
          border-radius: 12px;
          padding: 18px;
          font-size: 18px;
          font-weight: bold;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
          position: relative;
          overflow: hidden;
          width: 100%;
        }

        .draw-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .draw-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(255, 107, 107, 0.4);
        }

        .draw-button:hover::before {
          left: 100%;
        }

        .draw-button:active {
          transform: translateY(-1px);
        }

        .draw-button:disabled {
          opacity: 0.8;
          cursor: not-allowed;
          transform: none;
        }

        .draw-button.spinning {
          background: linear-gradient(135deg, #fdcb6e, #e17055);
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        .location-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
          width: 100%;
        }

        .location-button:hover {
          background: rgba(255, 107, 107, 0.2);
          border-color: #ff6b6b;
          transform: translateY(-1px);
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          padding: 10px 8px;
          cursor: pointer;
          font-size: 14px;
          color: white;
          transition: all 0.2s ease;
          border-radius: 6px;
          margin: 2px 0;
        }

        .checkbox-item:hover {
          color: #ff6b6b;
          background: rgba(255, 107, 107, 0.05);
        }

        .checkbox-item input[type="checkbox"] {
          margin-right: 12px;
          transform: scale(1.2);
          accent-color: #ff6b6b;
        }

        .restaurant-name {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 12px;
          color: #ff6b6b;
        }

        .restaurant-info {
          font-size: 14px;
          opacity: 0.9;
          line-height: 1.6;
          margin-bottom: 15px;
        }

        .menu-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 13px;
        }

        .menu-item:last-child {
          border-bottom: none;
        }

        .menu-name {
          color: rgba(255, 255, 255, 0.9);
        }

        .menu-price {
          color: #ff6b6b;
          font-weight: 600;
        }

        @media (max-width: 480px) {
          .container {
            margin: 10px;
            max-width: calc(100% - 20px);
          }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif'
      }}>
        <div className="glass-card animate-slideUp" style={{
          maxWidth: '400px',
          width: '100%',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div className="header-section" style={{
            color: 'white',
            padding: '16px 20px',
            textAlign: 'center',
            margin: '20px',
          }}>
            <h1 style={{
              fontSize: '16.8px',
              fontWeight: 'bold',
              marginBottom: '8px'
            }}>🍔 회사 점심 랜덤 뽑기</h1>
            <p style={{
              fontSize: '12px',
              opacity: '0.9',
              fontStyle: 'italic'
            }}>
              마이워크스페이스타워 {distance}m 이내 • 1만원 이하
            </p>
          </div>

          <div style={{ padding: '30px 20px' }}>
            {/* 거리 필터 */}
            <div className="glass-section" style={{ padding: '16px', marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'white'
                }}>📍 검색 거리</span>
                <span className="distance-value" style={{ fontSize: '14px' }}>
                  {distance}m 이내
                </span>
              </div>
              <div style={{ position: 'relative', margin: '10px 0' }}>
                <div 
                  className="slider-track-fill"
                  style={{ width: `${((distance - 300) / 700) * 100}%` }}
                />
                <input
                  type="range"
                  className="slider"
                  min="300"
                  max="1000"
                  value={distance}
                  step="50"
                  onChange={(e) => setDistance(parseInt(e.target.value))}
                  style={{ position: 'relative', zIndex: '2' }}
                />
              </div>
            </div>

            {/* 카테고리 필터 */}
            <div className="glass-section" style={{ marginBottom: '25px' }}>
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: 'white',
                  transition: 'background 0.2s ease'
                }}
                onClick={() => setShowFilters(!showFilters)}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.03)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                <span>🍽️ 카테고리 선택</span>
                <svg 
                  style={{
                    width: '16px',
                    height: '16px',
                    transition: 'transform 0.3s ease',
                    transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
                    cursor: 'pointer'
                  }}
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
                <div className="animate-slideDown" style={{
                  padding: '0 16px 16px 16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
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
                      className="checkbox-item"
                      style={index === 0 ? {
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        paddingBottom: '15px',
                        marginBottom: '5px'
                      } : {}}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.key)}
                        onChange={() => handleCategoryChange(category.key)}
                      />
                      {category.label} ({category.count}개)
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 뽑기 버튼 */}
            <button
              className={`draw-button ${isDrawing ? 'spinning' : ''}`}
              onClick={drawRestaurant}
              disabled={isDrawing}
            >
              <span style={{ position: 'relative', zIndex: '10' }}>
                {isDrawing ? '🎲 뽑는 중...' : '🎲 오늘의 식당 뽑기'}
              </span>
            </button>

            {/* 결과 카드 */}
            <div className="glass-card" style={{
              padding: '25px',
              textAlign: 'center',
              margin: '20px 0',
              minHeight: '300px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              {!selectedRestaurant ? (
                <div style={{ opacity: '0.8' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{
                      fontSize: '12px',
                      lineHeight: '18px',
                      opacity: '0.9',
                      color: 'rgba(255, 255, 255, 0.8)',
                      margin: '0'
                    }}>
                      오늘의 식당 뽑기 버튼을 눌러서<br />오늘의 점심을 골라봐요 🍽️
                    </p>
                  </div>
                </div>
              ) : (
                <div className="animate-slideInResult">
                  <div className="restaurant-name">
                    {selectedRestaurant.name}
                  </div>
                  <div className="restaurant-info">
                    📍 {selectedRestaurant.address}<br />
                    💰 {selectedRestaurant.price}<br />
                    🕐 {selectedRestaurant.time}<br />
                    📏 도보 {Math.ceil(selectedRestaurant.distance / 80)}분 ({selectedRestaurant.distance}m)
                  </div>
                  
                  <div style={{ marginTop: '20px', textAlign: 'left' }}>
                    <h4 style={{
                      fontSize: '14px',
                      marginBottom: '12px',
                      color: '#ff6b6b',
                      textAlign: 'center'
                    }}>
                      🍽️ 만원 이하 추천 메뉴
                    </h4>
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '10px',
                      padding: '15px',
                      marginBottom: '15px'
                    }}>
                      {selectedRestaurant.menus.map((menu, index) => (
                        <div key={index} className="menu-item">
                          <span className="menu-name">{menu.name}</span>
                          <span className="menu-price">{menu.price}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      className="location-button"
                      onClick={openNaverMap}
                    >
                      📍 네이버지도에서 보기
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LunchPicker;
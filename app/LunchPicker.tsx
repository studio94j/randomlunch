'use client';

import React, { useState, useEffect, useRef } from 'react';

// Restaurant 인터페이스 정의
interface Restaurant {
  name: string;
  category: string;
  price: string;
  distance: number;
  lat: number;
  lng: number;
  address: string;
  menus: { name: string; price: string }[];
  phone?: string;
  roadAddress?: string;
}

// Global window 객체에 naver 객체 타입 선언
declare global {
  interface Window {
    naver?: any;
  }
}

const LunchPicker: React.FC = () => {
  const [distance, setDistance] = useState<number>(300);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['전체']);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const naverMapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const scriptLoadedRef = useRef<boolean>(false);

  // 기준 위치: 두잉랩(마이스페이스타워 강남역점)
  const DOINGLAB_LOCATION = {
    lat: 37.496515,
    lng: 127.029525,
  };

  // 네이버 지도 API 설정
  const NAVER_MAPS_CLIENT_ID = 'hu9kpubg9f';
  const NAVER_CLIENT_ID = 'hu9kpubg9f';
  const NAVER_CLIENT_SECRET = 'aTE8w4zCxw1FqRdEVhKTpeO0fxnLnCRvMKEYQlLZ';

  // 1. 네이버 지도 API 스크립트 로드
  useEffect(() => {
    const loadNaverMapScript = () => {
      if (scriptLoadedRef.current || window.naver?.maps) return;
      
      (window as any).map = null;
      
      (window as any).initMap = function() {
        (window as any).map = new window.naver.maps.Map('map', {
          center: new window.naver.maps.LatLng(37.496515, 127.029525),
          zoom: 16
        });
        
        scriptLoadedRef.current = true;
        naverMapInstance.current = (window as any).map;
        
        setTimeout(() => {
          addDoingLabMarker();
          searchRestaurants();
        }, 500);
        
        setSearchError(null);
      };

      try {
        const script = document.createElement('script');
        script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_MAPS_CLIENT_ID}&callback=initMap`;
        script.async = true;
        
        script.onerror = () => {
          initializeFallbackMap();
        };
        
        document.head.appendChild(script);
      } catch (error) {
        initializeFallbackMap();
      }
    };

    loadNaverMapScript();

    return () => {
      if ((window as any).initMap) {
        delete (window as any).initMap;
      }
      if ((window as any).map) {
        delete (window as any).map;
      }
      
      markersRef.current.forEach(marker => {
        try {
          if (marker && typeof marker.setMap === 'function') {
            marker.setMap(null);
          }
        } catch (e) {
          // 마커 정리 실패 시 무시
        }
      });
      markersRef.current = [];
      naverMapInstance.current = null;
    };
  }, []);

  // 2. 두잉랩 마커 추가
  const addDoingLabMarker = () => {
    try {
      if (!naverMapInstance.current || !window.naver?.maps) return;

      const doingLabMarker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(DOINGLAB_LOCATION.lat, DOINGLAB_LOCATION.lng),
        map: naverMapInstance.current,
        title: '두잉랩 (마이스페이스타워 강남역점)',
        icon: {
          content: '<div style="background-color: #ff6b6b; color: white; padding: 5px 10px; border-radius: 5px; font-weight: bold; white-space: nowrap; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">📍 두잉랩</div>',
          anchor: new window.naver.maps.Point(40, 40),
        },
      });

      markersRef.current = [doingLabMarker];
    } catch (error) {
      console.error('두잉랩 마커 추가 실패:', error);
    }
  };

  // 3. 대체 지도 (API 실패 시)
  const initializeFallbackMap = async () => {
    const mapContainer = mapRef.current || document.getElementById('map');
    if (!mapContainer) return;
    
    mapContainer.innerHTML = `
      <div style="
        width: 100%; 
        height: 100%; 
        display: flex; 
        flex-direction: column;
        align-items: center; 
        justify-content: center; 
        background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-align: center;
        padding: 20px;
        box-sizing: border-box;
      ">
        <div style="font-size: 48px; margin-bottom: 16px;">😕</div>
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">
          조건에 맞는 식당이 없어요!
        </div>
        <div style="font-size: 14px; opacity: 0.8; margin-bottom: 16px;">
          검색 조건을 변경해 보세요
        </div>
        <div style="font-size: 12px; background: rgba(0,0,0,0.2); padding: 8px 16px; border-radius: 8px;">
          📍 두잉랩 (마이스페이스타워 강남역점) 주변
        </div>
      </div>
    `;
    
    // 동적 데이터로 식당 목록 설정 (API 실패시 대체)
    const fallbackData = await Promise.all(
      ['한식', '중식', '일식', '분식'].map(category => generateCategoryData(category))
    );
    setFilteredRestaurants(fallbackData.flat());
  };

  // 4. 카테고리별 데이터 생성 (API 실패시 대체용)
  const generateCategoryData = async (category: string): Promise<Restaurant[]> => {
    const restaurantCount = 3 + Math.floor(Math.random() * 4);
    const restaurants: Restaurant[] = [];
    
    for (let i = 0; i < restaurantCount; i++) {
      // 두잉랩 주변 랜덤 좌표 생성 (반경 800m 내)
      const randomAngle = Math.random() * 2 * Math.PI;
      const randomDistance = Math.random() * 800;
      
      const lat = DOINGLAB_LOCATION.lat + (randomDistance * Math.cos(randomAngle)) / 111320;
      const lng = DOINGLAB_LOCATION.lng + (randomDistance * Math.sin(randomAngle)) / (111320 * Math.cos(DOINGLAB_LOCATION.lat * Math.PI / 180));
      
      const distanceFromDoingLab = calculateDistance(DOINGLAB_LOCATION.lat, DOINGLAB_LOCATION.lng, lat, lng);
      
      restaurants.push({
        name: generateRestaurantName(category, i + 1),
        category: category,
        price: generateRandomPrice(),
        distance: Math.round(distanceFromDoingLab),
        lat: lat,
        lng: lng,
        address: generateRandomAddress(),
        menus: generateRandomMenus(category)
      });
    }

    return restaurants;
  };

  // 식당 이름 생성
  const generateRestaurantName = (category: string, index: number): string => {
    const nameTemplates = {
      '한식': ['맛있는 한식', '전통 한정식', '할머니 손맛', '정성 한식당', '고향 밥상', '옛날 한식'],
      '중식': ['차이나 하우스', '홍콩 반점', '만리장성', '용궁 중식당', '황금 용', '중화 대반점'],
      '일식': ['사쿠라 일식', '도쿄 스시', '후지 라멘', '아사히 돈까스', '교토 정식', '오사카 우동'],
      '분식': ['맛있는 분식', '엄마 손 김밥', '추억의 분식', '학교 앞 분식', '옛날 떡볶이', '분식왕']
    };
    
    const templates = nameTemplates[category as keyof typeof nameTemplates] || ['맛있는 식당'];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return `${template} ${index}호점`;
  };

  // 랜덤 주소 생성
  const generateRandomAddress = (): string => {
    const districts = ['강남구', '서초구', '송파구', '관악구'];
    const roads = ['테헤란로', '강남대로', '봉은사로', '역삼로', '논현로'];
    const district = districts[Math.floor(Math.random() * districts.length)];
    const road = roads[Math.floor(Math.random() * roads.length)];
    const number = Math.floor(Math.random() * 500) + 1;
    
    return `서울 ${district} ${road} ${number}`;
  };

  // 5. 네이버 검색 API를 통한 실제 식당 정보 가져오기
  const searchRestaurants = async () => {
    setIsSearching(true);
    setSearchError(null);

    try {
      const categoryQueries: Record<string, string> = {
        '한식': '한식 강남역',
        '중식': '중식 강남역', 
        '일식': '일식 강남역',
        '분식': '분식 강남역',
      };

      let allRestaurants: Restaurant[] = [];

      const categoriesToSearch = selectedCategories.includes('전체')
        ? Object.keys(categoryQueries)
        : selectedCategories.filter(cat => cat !== '전체');

      // 각 카테고리별로 네이버 검색 API 호출
      for (const category of categoriesToSearch) {
        const query = categoryQueries[category];
        if (!query) continue;

        try {
          const restaurants = await searchNaverPlaces(query, category);
          allRestaurants.push(...restaurants);
        } catch (error) {
          console.warn(`네이버 API 검색 실패 for ${category}:`, error);
          // API 실패 시 동적 데이터로 대체
          const fallbackData = await generateCategoryData(category);
          allRestaurants.push(...fallbackData);
        }
      }

      // 중복 제거 및 거리/가격 필터링
      const uniqueRestaurants = Array.from(
        new Map(allRestaurants.map(item => [item.name, item])).values()
      );

      const filteredRestaurants = uniqueRestaurants.filter(restaurant => {
        return restaurant.distance <= distance;
      });

      setFilteredRestaurants(filteredRestaurants);
      
      if (filteredRestaurants.length === 0) {
        initializeFallbackMap();
      } else {
        addRestaurantMarkers(filteredRestaurants);
      }

    } catch (error) {
      setSearchError('식당 검색 중 오류가 발생했습니다.');
      setFilteredRestaurants([]);
      initializeFallbackMap();
    } finally {
      setIsSearching(false);
    }
  };

  // 네이버 검색 API 호출
  const searchNaverPlaces = async (query: string, category: string): Promise<Restaurant[]> => {
    try {
      // CORS 우회를 위한 프록시 서버 또는 직접 호출
      const response = await fetch(`https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=10&start=1&sort=random`, {
        headers: {
          'X-Naver-Client-Id': NAVER_CLIENT_ID,
          'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
        }
      });

      if (!response.ok) {
        throw new Error('네이버 API 호출 실패');
      }

      const data = await response.json();
      return processNaverSearchResults(data.items || [], category);
      
    } catch (error) {
      console.warn('네이버 API 호출 실패:', error);
      // API 실패 시 동적 데이터 반환
      return generateCategoryData(category);
    }
  };

  // 네이버 검색 결과 처리
  const processNaverSearchResults = (items: any[], category: string): Restaurant[] => {
    const restaurants: Restaurant[] = [];

    items.forEach(item => {
      try {
        if (!item) return;
        
        const cleanTitle = item.title?.replace(/<[^>]*>/g, '') || '알 수 없는 식당';
        
        // 네이버 API는 mapx, mapy를 제공 (카텍좌표계)
        const lng = parseInt(item.mapx) / 10000000;
        const lat = parseInt(item.mapy) / 10000000;

        if (lat > 0 && lng > 0) {
          const distanceFromDoingLab = calculateDistance(
            DOINGLAB_LOCATION.lat, 
            DOINGLAB_LOCATION.lng, 
            lat, 
            lng
          );
          
          if (distanceFromDoingLab <= 1000) {
            restaurants.push({
              name: cleanTitle,
              category: category,
              price: generateRandomPrice(), // 실제 API에서 가격 정보가 없어서 랜덤 생성
              distance: Math.round(distanceFromDoingLab),
              lat: lat,
              lng: lng,
              address: item.roadAddress || item.address || '주소 정보 없음',
              phone: item.telephone || '',
              roadAddress: item.roadAddress || '',
              menus: generateRandomMenus(category) // 실제 메뉴 정보가 없어서 랜덤 생성
            });
          }
        }
      } catch (error) {
        console.warn('검색 결과 처리 실패:', error);
      }
    });

    return restaurants;
  };

  // 6. 지도에 마커 추가
  const addRestaurantMarkers = (restaurants: Restaurant[]) => {
    try {
      if (!naverMapInstance.current || !window.naver?.maps || !Array.isArray(restaurants)) {
        return;
      }

      // 기존 식당 마커 제거 (두잉랩 마커는 유지)
      if (markersRef.current.length > 1) {
        markersRef.current.slice(1).forEach(marker => {
          try {
            if (marker && typeof marker.setMap === 'function') {
              marker.setMap(null);
            }
          } catch (e) {
            // 마커 제거 실패 시 무시
          }
        });
        markersRef.current = markersRef.current.slice(0, 1);
      }

      // 새 식당 마커 추가
      restaurants.forEach(restaurant => {
        try {
          if (!restaurant || typeof restaurant.lat !== 'number' || typeof restaurant.lng !== 'number') {
            return;
          }

          const marker = new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(restaurant.lat, restaurant.lng),
            map: naverMapInstance.current,
            title: restaurant.name,
            icon: {
              content: `<div style="background-color: ${selectedRestaurant?.name === restaurant.name ? '#007bff' : '#4CAF50'}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px; font-weight: bold; white-space: nowrap; border: 1px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"> ${getCategoryEmoji(restaurant.category)} ${restaurant.name}</div>`,
              anchor: new window.naver.maps.Point((restaurant.name?.length || 5) * 6 + 5, 25),
            },
          });

          markersRef.current.push(marker);

          // 정보창 추가
          const infoWindow = new window.naver.maps.InfoWindow({
            content: `
              <div style="padding:10px; min-width:200px; font-size:12px;">
                <h4 style="margin-top:0; margin-bottom:5px; font-size:14px; color:#333; font-weight:bold;">${restaurant.name}</h4>
                <p style="margin-bottom:3px; color:#666;">📍 ${restaurant.address}</p>
                ${restaurant.phone ? `<p style="margin-bottom:3px; color:#666;">📞 ${restaurant.phone}</p>` : ''}
                <p style="margin-bottom:3px; color:#666;">💰 ${restaurant.price}</p>
                <p style="margin-bottom:0; color:#666;">📏 도보 ${Math.ceil(restaurant.distance / 80)}분 (${restaurant.distance}m)</p>
              </div>
            `,
          });

          if (window.naver.maps.Event?.addListener) {
            window.naver.maps.Event.addListener(marker, 'click', () => {
              try {
                if (infoWindow.getMap && infoWindow.getMap()) {
                  infoWindow.close();
                } else if (infoWindow.open) {
                  infoWindow.open(naverMapInstance.current, marker);
                }
              } catch (e) {
                // 정보창 오류 시 무시
              }
            });
          }
        } catch (error) {
          // 개별 마커 생성 실패 시 무시
        }
      });

    } catch (error) {
      // 전체 마커 추가 실패 시 무시
    }
  };

  // 7. 거리 계산
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // 8. 가격 및 메뉴 생성
  const generateRandomPrice = (): string => {
    const minPrice = 4000 + Math.floor(Math.random() * 6000); // 4000~9999원
    const maxPrice = minPrice + Math.floor(Math.random() * 2000); // +0~1999원
    
    if (Math.random() > 0.5) {
      return `${minPrice.toLocaleString()}원`;
    } else {
      return `${minPrice.toLocaleString()}~${maxPrice.toLocaleString()}원`;
    }
  };

  const generateRandomMenus = (category: string): { name: string; price: string }[] => {
    const menuData = {
      '한식': {
        bases: ['김치찌개', '된장찌개', '순두부찌개', '제육덮밥', '비빔밥', '불고기정식', '갈비탕', '삼계탕', '냉면', '육개장'],
        priceRange: [6000, 12000]
      },
      '중식': {
        bases: ['짜장면', '짬뽕', '볶음밥', '탕수육', '간짜장', '잡채밥', '마파두부', '깐풍기', '양장피', '울면'],
        priceRange: [5000, 15000]
      },
      '일식': {
        bases: ['돈까스', '규동', '냉모밀', '초밥세트', '라멘', '치킨데리야키', '가츠동', '우동', '텐동', '연어덮밥'],
        priceRange: [7000, 15000]
      },
      '분식': {
        bases: ['떡볶이', '김밥', '어묵', '순대', '라면', '튀김', '만두', '핫도그', '토스트', '컵밥'],
        priceRange: [2000, 8000]
      }
    };

    const categoryData = menuData[category as keyof typeof menuData] || menuData['한식'];
    const menuCount = 2 + Math.floor(Math.random() * 4); // 2~5개 메뉴
    const selectedMenus = categoryData.bases
      .sort(() => 0.5 - Math.random())
      .slice(0, menuCount);

    return selectedMenus.map(menuName => {
      const [minPrice, maxPrice] = categoryData.priceRange;
      const price = minPrice + Math.floor(Math.random() * (maxPrice - minPrice));
      return {
        name: menuName,
        price: `${price.toLocaleString()}원`
      };
    });
  };

  // 9. 검색 필터 변경 시 재검색
  useEffect(() => {
    if (filteredRestaurants.length > 0) {
      const filtered = getFilteredRestaurantsByDistance();
      if (naverMapInstance.current) {
        addRestaurantMarkers(filtered);
      }
    }
  }, [distance, selectedCategories]);

  // 10. 유틸리티 함수들
  const getFilteredRestaurantsByDistance = (): Restaurant[] => {
    return filteredRestaurants.filter(restaurant => restaurant.distance <= distance);
  };

  const getCategoryCounts = () => {
    const filtered = getFilteredRestaurantsByDistance();
    return {
      전체: filtered.length,
      한식: filtered.filter(r => r.category === '한식').length,
      중식: filtered.filter(r => r.category === '중식').length,
      일식: filtered.filter(r => r.category === '일식').length,
      분식: filtered.filter(r => r.category === '분식').length,
    };
  };

  const getRestaurantsForDisplay = (): Restaurant[] => {
    const filtered = getFilteredRestaurantsByDistance();
    if (selectedCategories.includes('전체')) {
      return filtered;
    }
    return filtered.filter(restaurant =>
      selectedCategories.includes(restaurant.category)
    );
  };

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

  const drawRestaurant = () => {
    try {
      const availableRestaurants = getRestaurantsForDisplay();

      if (!availableRestaurants || availableRestaurants.length === 0) {
        alert('선택한 조건에 맞는 식당이 없습니다!');
        return;
      }

      setIsDrawing(true);
      setSelectedRestaurant(null);

      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * availableRestaurants.length);
        const drawn = availableRestaurants[randomIndex];
        
        if (drawn) {
          setSelectedRestaurant(drawn);
          addRestaurantMarkers(getRestaurantsForDisplay());
          
          if (naverMapInstance.current && window.naver?.maps) {
            try {
              naverMapInstance.current.setCenter(new window.naver.maps.LatLng(drawn.lat, drawn.lng));
            } catch (e) {
              // 지도 중심 이동 실패 시 무시
            }
          }
        }
        
        setIsDrawing(false);
      }, 1500);
    } catch (error) {
      setIsDrawing(false);
    }
  };

  const openNaverMapExternal = () => {
    if (selectedRestaurant?.name) {
      const url = `https://map.naver.com/v5/search/${encodeURIComponent(selectedRestaurant.name)}`;
      window.open(url, '_blank');
    }
  };

  const getCategoryEmoji = (category: string): string => {
    const emojiMap: Record<string, string> = {
      '한식': '🍚',
      '중식': '🍜',
      '일식': '🍣',
      '분식': '🥟',
    };
    return emojiMap[category] || '🍽️';
  };

  const counts = getCategoryCounts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans">
      <div className="w-full max-w-md mx-auto p-4 md:p-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl text-center m-4 md:m-6 p-4">
            <h1 className="text-lg md:text-xl font-bold mb-2">🍔 랜덤 점심</h1>
            <p className="text-xs opacity-90 italic">
              📍 두잉랩 (마이스페이스타워 강남역점) 주변 (1만원 이하)
            </p>
          </div>

          <div className="p-4 md:p-6 space-y-6">

            {/* Distance Filter */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm md:text-base font-semibold">📍 식당 거리</span>
                <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-lg text-sm font-semibold">
                  {distance >= 1000 ? '1km' : `${distance}m`} 이내
                </span>
              </div>

              {/* 거리 옵션 chip 버튼들 */}
              <div className="grid grid-cols-4 gap-2">
                {[100, 300, 500, 1000].map((dist) => (
                  <button
                    key={dist}
                    onClick={() => setDistance(dist)}
                    className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      distance === dist 
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/25' 
                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {dist >= 1000 ? '1km' : `${dist}m`}
                  </button>
                ))}
              </div>

              {isSearching && (
                <div className="text-xs text-blue-400 text-center mt-3">
                  🔍 네이버 API로 실제 식당 검색 중...
                </div>
              )}
              {searchError && (
                <div className="text-xs text-red-400 text-center mt-3">
                  ⚠️ API 검색 실패 - 샘플 데이터로 표시됩니다
                </div>
              )}
            </div>

            {/* Category Filter */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl">
              <div
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-white/5 transition-colors rounded-xl"
                onClick={() => setShowFilters(!showFilters)}
              >
                <span className="text-sm md:text-base font-semibold">🍽️ 카테고리 선택</span>
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

            {/* Draw Button */}
            <button
              onClick={drawRestaurant}
              disabled={isDrawing || isSearching}
              className={`w-full py-4 rounded-xl font-bold text-lg md:text-xl transition-all duration-300 ${
                isDrawing || isSearching
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-400 to-orange-500 hover:from-red-500 hover:to-orange-600 hover:shadow-lg hover:shadow-red-500/25 hover:-translate-y-0.5'
              }`}
            >
              {isDrawing ? '🎲 뽑는 중...' : isSearching ? '🔍 실제 식당 검색 중...' : '🎲 오늘의 식당 뽑기'}
            </button>

            {/* Selected Restaurant Info */}
            {selectedRestaurant && (
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5 animate-pulse">
                <div className="text-xl md:text-2xl font-bold mb-3 text-red-400">
                  {getCategoryEmoji(selectedRestaurant.category)} {selectedRestaurant.name}
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

            {/* Naver Map */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold text-blue-400">🗺️ 주변 식당 지도</h4>
              </div>
              <div className="w-full h-80 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg overflow-hidden border border-white/10">
                <div id="map" ref={mapRef} className="w-full h-full" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LunchPicker;
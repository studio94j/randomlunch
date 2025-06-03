'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Restaurant {
  name: string;
  price: string;
  distance: number;
  lat: number;
  lng: number;
  address: string;
  phone?: string;
}

declare global {
  interface Window {
    naver?: any;
    initMap?: () => void;
  }
}

const DOINGLAB_LOCATION = { lat: 37.496515, lng: 127.029525 };
const NAVER_MAPS_CLIENT_ID = 'hu9kpubg9f';
const NAVER_CLIENT_ID = 'hu9kpubg9f';
const NAVER_CLIENT_SECRET = 'aTE8w4zCxw1FqRdEVhKTpeO0fxnLnCRvMKEYQlLZ';

const DISTANCE_CHIPS = [100, 300, 500, 1000];

function extractPrice(desc?: string): number | null {
  if (!desc) return null;
  const priceStr = desc.match(/(\d{1,3}(?:,\d{3})*)\s*원/);
  if (priceStr && priceStr[1]) {
    return parseInt(priceStr[1].replace(/,/g, ''), 10);
  }
  return null;
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const LunchPicker: React.FC = () => {
  const [distance, setDistance] = useState<number>(300);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filtered, setFiltered] = useState<Restaurant[]>([]);
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const naverMapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const scriptLoadedRef = useRef<boolean>(false);

  // 네이버 지도 API 로드
  useEffect(() => {
    if (scriptLoadedRef.current || window.naver?.maps) {
      initializeMap();
      return;
    }

    const initMap = () => {
      // 네이버 지도 API가 완전히 로드되었는지 확인
      if (!window.naver?.maps?.Map) {
        console.error('네이버 지도 API가 로드되지 않았습니다.');
        setError('지도 API 로드 실패');
        return;
      }

      try {
        initializeMap();
      } catch (error) {
        console.error('지도 초기화 실패:', error);
        setError('지도 초기화 실패');
      }
    };

    // 전역 콜백 함수 설정
    window.initMap = initMap;

    try {
      const script = document.createElement('script');
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_MAPS_CLIENT_ID}&callback=initMap`;
      script.async = true;
      script.onerror = () => {
        console.error('네이버 지도 스크립트 로드 실패');
        setError('지도 API 로드 실패');
      };
      document.head.appendChild(script);
    } catch (e) {
      console.error('스크립트 추가 실패:', e);
      setError('지도 API 로드 실패');
    }

    return () => {
      // 클린업
      if (window.initMap) {
        delete window.initMap;
      }
      clearMarkers();
      naverMapInstance.current = null;
      scriptLoadedRef.current = false;
    };
  }, []);

  const initializeMap = () => {
    if (!window.naver?.maps?.Map || !mapRef.current) {
      return;
    }

    try {
      const map = new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(DOINGLAB_LOCATION.lat, DOINGLAB_LOCATION.lng),
        zoom: 16,
      });

      naverMapInstance.current = map;
      scriptLoadedRef.current = true;
      setMapLoaded(true);
      setError(null);

      // 기준 위치 마커 추가
      setTimeout(() => {
        addBaseMarker();
      }, 300);

    } catch (error) {
      console.error('지도 초기화 중 오류:', error);
      setError('지도 초기화 실패');
    }
  };

  const clearMarkers = () => {
    markersRef.current.forEach(marker => {
      try { 
        marker?.setMap?.(null); 
      } catch (e) {
        // 마커 제거 실패 시 무시
      }
    });
    markersRef.current = [];
  };

  function addBaseMarker() {
    try {
      if (!naverMapInstance.current || !window.naver?.maps) return;
      
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(DOINGLAB_LOCATION.lat, DOINGLAB_LOCATION.lng),
        map: naverMapInstance.current,
        title: '랜덤 점심 뽑기',
        icon: {
          content: `<div style="background-color: #ff6b6b; color: white; padding: 6px 12px; border-radius: 6px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.25); font-family: 'Apple SD Gothic Neo',sans-serif; font-size:14px;">📍 기준위치</div>`,
          anchor: new window.naver.maps.Point(50, 40),
        },
      });
      markersRef.current = [marker];
    } catch (error) {
      console.error('기준 마커 추가 실패:', error);
    }
  }

  const fetchRestaurants = async () => {
    setIsSearching(true);
    setError(null);
    setSelected(null);
    try {
      const response = await fetch(
        `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent('강남역 5번 출구')}&display=20&start=1&sort=random`,
        {
          headers: {
            'X-Naver-Client-Id': NAVER_CLIENT_ID,
            'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
          },
        }
      );
      if (!response.ok) throw new Error('네이버 검색 API 호출 실패');
      const data = await response.json();
      const parsed: Restaurant[] = (data.items || []).map((item: any) => {
        const lng = parseInt(item.mapx) / 10000000;
        const lat = parseInt(item.mapy) / 10000000;
        const dist = calculateDistance(DOINGLAB_LOCATION.lat, DOINGLAB_LOCATION.lng, lat, lng);
        const priceVal = extractPrice(item.description);
        return {
          name: item.title.replace(/<[^>]*>/g, '') || '이름 없음',
          price: priceVal ? `${priceVal.toLocaleString()}원` : '정보 없음',
          distance: Math.round(dist),
          lat,
          lng,
          address: item.roadAddress || item.address || '',
          phone: item.telephone || '',
        };
      }).filter(r => r.lat > 30 && r.lng > 120);
      setRestaurants(parsed);
      setIsSearching(false);
    } catch (e) {
      console.error('식당 검색 실패:', e);
      setError('네이버 검색에 실패했습니다.');
      setRestaurants([]);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    setFiltered(
      restaurants.filter(r =>
        r.distance <= distance &&
        (r.price === '정보 없음' || parseInt(r.price.replace(/[^0-9]/g, '')) <= maxPrice)
      )
    );
  }, [restaurants, distance, maxPrice]);

  useEffect(() => {
    if (!naverMapInstance.current || !window.naver?.maps) return;
    
    // 기존 식당 마커들 제거 (기준 마커는 유지)
    if (markersRef.current.length > 1) {
      markersRef.current.slice(1).forEach(marker => {
        try { marker.setMap(null); } catch {}
      });
      markersRef.current = markersRef.current.slice(0, 1);
    }

    // 새로운 식당 마커들 추가
    filtered.forEach(r => {
      try {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(r.lat, r.lng),
          map: naverMapInstance.current,
          title: r.name,
          icon: {
            content: `<div style="background-color: #ee5a24; color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: bold; border: 1px solid #fff; font-family: 'Apple SD Gothic Neo',sans-serif;">${r.name}</div>`,
            anchor: new window.naver.maps.Point((r.name?.length || 5) * 7, 25),
          },
        });
        markersRef.current.push(marker);
        
        const infoWindow = new window.naver.maps.InfoWindow({
          content: `
            <div style="padding:4px; min-width:180px; font-size : 14px; font-family:'Apple SD Gothic Neo',sans-serif;">
              <div style="font-weight:bold;color:#ff6b6b;margin-bottom:5px">${r.name}</div>
              <div style="color:#666;">📍 ${r.address}</div>
              <div style="color:#666;">💰 ${r.price}</div>
              <div style="color:#666;">📏 도보 ${Math.ceil(r.distance / 80)}분 (${r.distance}m)</div>
            </div>
          `,
        });
        
        window.naver.maps.Event.addListener(marker, 'click', () => {
          if (infoWindow.getMap && infoWindow.getMap()) infoWindow.close();
          else infoWindow.open(naverMapInstance.current, marker);
        });
      } catch (error) {
        console.error('마커 추가 실패:', error);
      }
    });
  }, [filtered]);

  const pickRandomRestaurant = () => {
    // 첫 번째 클릭 시에만 식당 검색
    if (restaurants.length === 0) {
      fetchRestaurants();
      return;
    }
    
    if (filtered.length === 0) return;
    setSelected(null);
    setTimeout(() => {
      const randomRestaurant = filtered[Math.floor(Math.random() * filtered.length)];
      setSelected(randomRestaurant);
      
      // 선택된 식당 위치로 지도 이동
      if (naverMapInstance.current && window.naver?.maps && randomRestaurant) {
        naverMapInstance.current.setCenter(
          new window.naver.maps.LatLng(randomRestaurant.lat, randomRestaurant.lng)
        );
      }
    }, 900);
  };

  const openNaverMapExternal = () => {
    if (selected?.name) {
      window.open(`https://map.naver.com/v5/search/${encodeURIComponent(selected.name)}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-bg font-main text-main flex items-center justify-center h-full w-full scale-100 p-10">
      <div className="w-full max-w-md mx-auto p-8 md:p-8">
        <div className="bg-glass border border-border rounded-3xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-bggray rounded-2xl text-center p-4 m-4 border-1 border-primary/30">
            <h1 className="text-title font-bold text-primary mb-1 font-main">🍽️ 랜덤 점심 뽑기</h1>
            <p className="text-caption italic text-textweak font-main">📍위치 : 강남역 마이스페이스타워</p>
          </div>

          <div className="p-4 md:p-4 space-y-4">

            {/* 거리 chip */}
            <div className="bg-glass rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-body font-semibold">📍식당 거리</span>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-caption font-semibold">
                  {distance >= 1000 ? '1km' : `${distance}m`} 이내
                </span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {DISTANCE_CHIPS.map((dist) => (
                  <button
                    key={dist}
                    onClick={() => setDistance(dist)}
                    className={`
                      py-2 px-4 rounded-lg text-caption font-textweak transition-all border border-border
                      ${distance === dist
                        ? 'bg-primary/10 text-primary font-bold shadow-lg shadow-black/10'
                        : 'bg-disable text-textweak hover:bg-primary/10 hover:text-primary'}
                    `}
                  >
                    {dist >= 1000 ? '1km' : `${dist}m`}
                  </button>
                ))}
              </div>
            </div>

            {/* 가격 슬라이더 */}
            <div className="bg-glass rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-body font-semibold">💰가격</span>
                <span className="bg-point/10 text-point px-3 py-1 rounded-lg text-caption font-semibold">
                  {maxPrice.toLocaleString()}원 이하
                </span>
              </div>
              <input
                type="range"
                min={5000}
                max={20000}
                step={1000}
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full h-2 rounded-full accent-primary bg-white/20"
                style={{
                  accentColor: '#ff6b6b', // Primary
                }}
              />
            </div>

            {/* 검색 결과/추첨 */}
            <button
              onClick={pickRandomRestaurant}
              disabled={isSearching || !mapLoaded}
              className={`
                w-full py-4 rounded-xl font-semibold text-body transition-all duration-300 font-
                ${isSearching
                  ? 'bg-gradient-to-r from-secondary to-primary animate-pulse cursor-not-allowed'
                  : !mapLoaded
                  ? 'bg-gradient-to-r from-secondary to-primary shadow-lg shadow-primary/25 border border-white/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-secondary hover:from-primary hover:to-point hover:shadow-lg hover:-translate-y-0.5'}
              `}
            >
              {!mapLoaded ? '🗺️ 지도 로딩 중...' :
               isSearching ? '🔍 식당 검색 중...' : 
               restaurants.length === 0 ? '🔍 식당 검색하기' : '🎲 오늘의 랜덤 뽑기'}
            </button>

            {/* 추첨 결과 */}
            {selected && (
              <div className="bg-glass rounded-xl p-5 mt-4 font-main">
                <div className="text-header font-bold mb-3 text-primary">{selected.name}</div>
                <div className="mb-2 text-body text-textmain">📍 {selected.address}</div>
                <div className="mb-2 text-body text-textweak">💰 {selected.price}</div>
                <div className="mb-2 text-body text-textweak">📏 도보 {Math.ceil(selected.distance / 80)}분 ({selected.distance}m)</div>
                <button
                  onClick={openNaverMapExternal}
                  className="w-full mt-2 bg-point/20 hover:bg-point border border-point/30 hover:border-point text-point rounded-lg py-3 px-4 text-caption transition-all hover:-translate-y-0.5"
                >
                  📍 네이버 지도에서 보기
                </button>
              </div>
            )}

            {/* 지도 */}
            <div className="bg-glass rounded-xl p-4 mt-2">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-body font-main text-point">🗺️ 식당 가는 길</h4>
              </div>
              <div className="w-full h-80 bg-bggray rounded-lg overflow-hidden border border-border">
                {error && <div className="text-caption text-primary text-center mt-3">{error}</div>}
                {!isSearching && !error && restaurants.length > 0 && filtered.length === 0 && (
                  <div className="text-body text-textweak text-gray-500 text-center mt-12 mb-8">
                    🥹 검색 조건에 맞는 식당이 없어요.
                  </div>
                )}
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
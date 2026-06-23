# 🧹 ✨ 클린하우스

> **React 19 & TypeScript 기반의 신뢰할 수 있는 홈 크리닝 / 청소 서비스 이용 후기 공유 플랫폼**
> 사용자들이 직접 경험한 청소 업체의 생생한 후기와 평점을 확인하고, 나에게 딱 맞는 청소 서비스를 찾을 수 있는 공간입니다.

---

## 🚀 주요 기능 (Features)

* **실시간 청소 후기 작성 & 공유**: 사용자가 이용한 청소 서비스(입주 청소, 거주 청소, 가전 청소 등)의 상세한 후기와 사진을 업로드할 수 있습니다.
* **정밀한 평점 시스템**: 가격, 친절도, 청소 상태, 시간 준수 등 세부 항목별 별점 기능을 제공합니다.
* **강력한 타입 안정성 (Type Safety)**: TypeScript와 엄격한 타입 지정을 통해 후기 데이터와 유저 데이터의 무결성을 보장합니다.
* **빠르고 안정적인 모킹 시스템**: MSW를 활용하여 백엔드 API가 완성되지 않은 환경에서도 실제 서버와 통신하는 듯한 완벽한 개발 환경을 제공합니다.

---

## 🛠️ 기술 스택 (Tech Stack)

### **Frontend**
* **Framework**: React 19
* **Language**: TypeScript
* **Build Tool**: Vite 8 (Rust-powered Rolldown 기반 초고속 빌드)
* **Styling**: Tailwind CSS v4 (최신 차세대 CSS 프레임워크)

### **Data Management & Network**
* **Data Fetching**: TanStack Query (강력한 서버 상태 관리 및 캐싱)
* **Global State**: Zustand (가볍고 직관적인 클라이언트 상태 관리)
* **API Mocking**: MSW (Mock Service Worker를 이용한 네트워크 단의 모킹)
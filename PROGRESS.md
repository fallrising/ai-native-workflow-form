# CloudForm - 開發進度記錄

> 最後更新：2026-06-13

## 當前狀態：Phase 1 - 項目初始化（部分完成）

### ✅ 已完成

#### 項目骨架 (P1.1)
- [x] Spring Boot 3.x + Java 17 項目（Gradle）初始化
- [x] React + Vite + TypeScript 前端項目初始化
- [x] shadcn/ui 初始化（`components.json` 已配置）
- [x] Docker Compose (PostgreSQL + Redis)
- [x] `.gitignore` 配置
- [x] `AGENTS.md` 項目指令文件

#### 數據庫 & Entity (P1.2)
- [x] DDL scripts（Flyway migration `V1__create_tables.sql`）
- [x] 基本 seed data（`V2__seed_data.sql`）
- [x] JPA Entities：
  - `ResourceTemplate` - 資源模板
  - `FieldConfig` - 欄位配置
  - `ProvisioningRequest` - 資源配置請求
  - `WorkflowInstance` - 工作流實例
  - `WorkflowStep` - 工作流步驟
  - `CloudAccount` - 雲帳號
- [x] JPA Repositories（全部 6 個 Entity 對應的 Repository）
- [x] Domain Enums：
  - `CloudProvider` - 雲服務商
  - `ResourceType` - 資源類型
  - `TemplateStatus` - 模板狀態
  - `RequestStatus` - 請求狀態
  - `FormTarget` - 表單目標（User/OPs/Hidden/Result）
  - `ValueSource` - 值來源
  - `ComponentType` - 組件類型

#### 文檔
- [x] `docs/01-architecture-overview.md` - 架構總覽
- [x] `docs/02-form-config-schema.md` - 表單配置 Schema 規格
- [x] `docs/03-data-model.md` - 數據模型設計
- [x] `docs/04-api-design.md` - API 設計
- [x] `docs/05-frontend-design.md` - 前端設計
- [x] `docs/06-roadmap.md` - 開發路線圖

### 🔲 尚未完成（Phase 1 剩餘）

#### TF Schema 解析引擎 (P1.3)
- [ ] 解析 `terraform providers schema -json` 的 JSON 輸出
- [ ] 建立欄位樹數據結構（支持嵌套 block）
- [ ] 提取欄位元數據（type, required, computed, default, description）
- [ ] 支持 `alicloud` 和 `aws` provider

#### 基礎 API (P1.4)
- [ ] Template CRUD endpoints
- [ ] Schema import endpoint
- [ ] DTOs（Request/Response）
- [ ] Service 層業務邏輯
- [ ] Controller 層 REST API
- [ ] OpenAPI/Swagger 配置

#### 前端
- [ ] 前端基礎頁面佈局（目前只有空的 `main.tsx` 和 `index.css`）
- [ ] 路由配置
- [ ] API client 設定

---

## 下次繼續的建議

### 優先順序
1. **完成 P1.3 - TF Schema 解析引擎**：這是整個系統的基礎
2. **完成 P1.4 - 基礎 API**：Template CRUD + Schema import
3. **進入 Phase 2 - 前端基礎 & 設計器**

### 具體下一步
1. 建立 `terraform/` 模組，實作 TF Schema JSON 解析
2. 建立 DTOs（`CreateTemplateRequest`, `TemplateResponse` 等）
3. 建立 `service/ResourceTemplateService`
4. 建立 `controller/ResourceTemplateController`
5. 配置 Swagger/OpenAPI

---

## 文件結構概覽

```
cloudform/
├── AGENTS.md                              # 項目 Agent 指令
├── PROGRESS.md                            # 本進度文件
├── README.md                              # 項目說明
├── docker-compose.yml                     # PostgreSQL + Redis
├── .gitignore
├── backend/
│   ├── build.gradle.kts
│   ├── settings.gradle.kts
│   └── src/main/
│       ├── java/com/cloudform/
│       │   ├── CloudFormApplication.java  # Spring Boot 入口
│       │   ├── domain/
│       │   │   ├── entity/               # 6 個 JPA Entity
│       │   │   └── enums/                # 7 個 Enum
│       │   └── repository/               # 6 個 JPA Repository
│       └── resources/
│           ├── application.yml
│           └── db/migration/             # Flyway DDL + Seed
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── components.json                   # shadcn/ui 配置
│   └── src/
│       ├── main.tsx
│       └── index.css
└── docs/                                 # 6 份設計文檔
```

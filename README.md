# Genie Vendor Hub

Backend REST API cho hệ thống tổng hợp, phân loại và tra cứu thông tin nhà cung cấp (vendor) IT/SW tại Việt Nam — dành cho các công ty Hàn Quốc đang tìm kiếm đối tác phát triển phần mềm.

> Dự án OJT — Educational Demo MVP. Không phải công cụ đánh giá đối tác, thẩm định tín dụng hay khuyến nghị lựa chọn nhà cung cấp thực tế.

## Tech Stack

- **Backend:** NestJS + TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT + Role-based Access Control (RBAC)
- **API Docs:** Swagger (OpenAPI)
- **Containerization:** Docker

## Yêu cầu môi trường

- Node.js (LTS)
- npm
- Docker Desktop
- Git

## Cài đặt & Chạy dự án

```bash
# 1. Clone repo
git clone <repo-url>
cd genie_vendor_hub

# 2. Cài dependencies
npm install

# 3. Tạo file .env từ mẫu
cp .env.example .env
# → điền các giá trị cần thiết (DATABASE_URL, JWT_SECRET, ...)

# 4. Khởi động PostgreSQL bằng Docker
docker compose up -d

# 5. Generate Prisma Client
npx prisma generate

# 6. Chạy migration
npx prisma migrate dev

# 7. (Tuỳ chọn) Seed dữ liệu mẫu
npx prisma db seed

# 8. Chạy server ở chế độ dev
npm run start:dev
```

Server mặc định chạy tại `http://localhost:3000`
Swagger docs tại `http://localhost:3000/api` *(cập nhật path khi Swagger được cấu hình)*

## Cấu trúc thư mục

```
genie_vendor_hub/
├── prisma/
│   ├── schema.prisma              # all 6 tables: vendors, vendor_sources,
│   │                               #   classification_rules, classification_histories,
│   │                               #   vendor_summaries, members
│   ├── migrations/
│   └── seed.ts                    # seed classification_rules + demo vendors
│
├── src/
│   ├── main.ts                    # bootstrap + Swagger setup
│   ├── app.module.ts
│   │
│   ├── common/
│   │   ├── filters/http-exception.filter.ts
│   │   ├── interceptors/response.interceptor.ts   # { status, message, data }
│   │   ├── guards/jwt-auth.guard.ts
│   │   ├── guards/roles.guard.ts
│   │   ├── decorators/roles.decorator.ts
│   │   └── enums/ (service-type, source-type, role, summary-type).enum.ts
│   │
│   ├── auth/
│   │   ├── auth.module.ts / .controller.ts / .service.ts
│   │   ├── strategies/jwt.strategy.ts
│   │   └── dto/login.dto.ts
│   │
│   ├── members/
│   │   ├── members.module.ts / .controller.ts / .service.ts
│   │   ├── entities/member.entity.ts
│   │   └── dto/
│   │
│   ├── vendors/
│   │   ├── vendors.module.ts / .controller.ts / .service.ts
│   │   ├── entities/vendor.entity.ts
│   │   └── dto/ (create-vendor, update-vendor, query-vendor).dto.ts
│   │
│   ├── vendor-sources/
│   │   ├── vendor-sources.module.ts / .controller.ts / .service.ts
│   │   ├── entities/vendor-source.entity.ts
│   │   └── dto/
│   │
│   ├── classification/
│   │   ├── classification-rules.controller.ts / .service.ts
│   │   ├── classification-history.controller.ts / .service.ts
│   │   ├── entities/ (classification-rule, classification-history).entity.ts
│   │   └── dto/
│   │
│   ├── vendor-summaries/
│   │   ├── vendor-summaries.module.ts / .controller.ts / .service.ts
│   │   ├── entities/vendor-summary.entity.ts
│   │   └── dto/
│   │
│   ├── statistics/
│   │   ├── statistics.module.ts / .controller.ts / .service.ts
│   │
│   └── llm/
│       ├── llm.module.ts / .service.ts       # wraps the LLM API call
│       ├── prompts/
│       │   ├── classify-vendor.prompt.ts
│       │   ├── summarize-vendor.prompt.ts
│       │   └── extract-fields.prompt.ts
│       └── dto/
│
├── test/
├── docs/
│   ├── ERD.png (or .drawio / dbdiagram link)
│   ├── llm-prompt-spec.md         # purpose, context, input, output, verification
│   └── postman_collection.json
│
├── .env.example
├── docker-compose.yml             # postgres + app
├── package.json / tsconfig.json
└── README.md
```

## Format Response chuẩn

Tất cả API trả về theo format thống nhất:

```json
{
  "status": 200,
  "message": "success",
  "data": { }
}
```

## Phân công team

| Vai trò | Phụ trách | Người phụ trách |
|---|---|---|
| 1 | Hạ tầng & Xác thực | Thịnh (Trưởng nhóm) |
| 2 | Vendor Core | Cường |
| 3 | Nguồn & Quy tắc | My |
| 4 | Phân loại & Thống kê | Sơn |
| 5 | LLM & Tóm tắt | Giáp |

## Git Flow

- `main` — bản release cuối cùng
- `develop` — nhánh tích hợp
- `feature/{ten-thanh-vien}-{module}` — nhánh làm việc cá nhân

**Commit convention:**
```
feat: tính năng mới
fix: sửa lỗi
docs: tài liệu
refactor: tái cấu trúc code
test: mã kiểm thử
chore: công việc thiết lập, cấu hình, không thuộc tính năng nghiệp vụ
```

Mọi thay đổi phải PR về `develop`, cần tối thiểu 1 reviewer duyệt trước khi merge.

## Business Rules chính

- Mỗi vendor phải có nguồn công khai (`sourceUrl`) hoặc ghi chú rõ ràng `"demo data"` / `"source unverified"`
- Phân loại vendor phải dựa trên bằng chứng cụ thể (mô tả dịch vụ, tech stack, kinh nghiệm ngành...)
- Mọi thay đổi phân loại được tự động ghi lại lịch sử (trước/sau, người thay đổi, lý do)
- Output từ LLM chỉ mang tính tham khảo, cần được review và giải thích bằng bằng chứng cụ thể
- Phân quyền: `ADMIN` (toàn quyền), `DEVELOPER` (đăng ký/cập nhật/tìm kiếm/phân loại), `REVIEWER` (chỉ đọc)

# BÁO CÁO CHỐT ACCEPTANCE CRITERIA

## US-2 — Quản lý danh mục

## 1. Thông tin chung

| Nội dung | Chi tiết |
| --- | --- |
| User Story | US-2 — Quản lý danh mục |
| Sprint | Sprint 1 — Product Catalog & Authentication |
| Actor chính | Admin |
| Actor liên quan | Customer/Guest đọc danh mục để khám phá và lọc sản phẩm |
| Mục tiêu | Cho phép Admin xem, thêm, sửa và xóa danh mục hợp lệ; cung cấp dữ liệu danh mục công khai cho Product Catalog |
| Người chốt nghiệp vụ | Product Owner — Toản |

## 2. User Story

> Là Admin, tôi muốn quản lý danh mục sản phẩm để tổ chức Product Catalog và giúp khách hàng tìm, lọc sản phẩm theo danh mục.

## 3. Phạm vi

### Trong phạm vi

- Xem danh sách danh mục.
- Xem chi tiết một danh mục.
- Tạo danh mục.
- Cập nhật tên và mô tả danh mục.
- Xóa danh mục chưa có sản phẩm.
- Kiểm tra dữ liệu, tên trùng và phân quyền.
- Giao diện quản trị danh mục và tích hợp REST API.

### Ngoài phạm vi

- Cây danh mục nhiều cấp.
- Sắp xếp danh mục thủ công.
- Ẩn/hiện hoặc lưu trữ danh mục.
- Upload ảnh danh mục.
- Xóa dây chuyền Product khi xóa Category.
- Chuyển hàng loạt Product sang Category khác.

Các yêu cầu ngoài phạm vi chỉ được bổ sung sau khi Product Backlog và Sprint Backlog được cập nhật.

## 4. Mô hình dữ liệu được chốt

| Trường | Quy tắc |
| --- | --- |
| `Id` | Số nguyên, khóa chính, hệ thống tự tạo |
| `Name` | Bắt buộc; trim khoảng trắng đầu/cuối; dài 2–100 ký tự |
| `Description` | Không bắt buộc; nếu có, tối đa 500 ký tự |
| `CreatedAt` | Hệ thống tự tạo; Client không được nhập hoặc sửa |

Tên danh mục phải duy nhất theo phép so sánh không phân biệt chữ hoa/thường sau khi trim. Hệ thống vẫn lưu và hiển thị cách viết của giá trị hợp lệ đã được trim.

Ví dụ, `Điện thoại`, `điện thoại` và ` Điện thoại ` được xem là cùng một tên.

## 5. Phân quyền

| API | Guest | Customer | Admin |
| --- | --- | --- | --- |
| `GET /api/categories` | Cho phép | Cho phép | Cho phép |
| `GET /api/categories/{id}` | Cho phép | Cho phép | Cho phép |
| `POST /api/categories` | `401 Unauthorized` | `403 Forbidden` | Cho phép |
| `PUT /api/categories/{id}` | `401 Unauthorized` | `403 Forbidden` | Cho phép |
| `DELETE /api/categories/{id}` | `401 Unauthorized` | `403 Forbidden` | Cho phép |

## 6. Acceptance Criteria

### AC-01 — Xem danh sách danh mục

**Given** người dùng truy cập hệ thống, không phụ thuộc trạng thái đăng nhập  
**When** gửi `GET /api/categories`  
**Then** hệ thống trả `200 OK` và danh sách Category DTO  
**And** nếu chưa có danh mục, hệ thống trả danh sách rỗng thay vì `404 Not Found`  
**And** dữ liệu không chứa Entity navigation hoặc thông tin nội bộ.

### AC-02 — Xem chi tiết danh mục

**Given** một danh mục tồn tại  
**When** gửi `GET /api/categories/{id}` với đúng `id`  
**Then** hệ thống trả `200 OK` và Category DTO tương ứng.

**Given** không có danh mục mang `id` được yêu cầu  
**When** gửi `GET /api/categories/{id}`  
**Then** hệ thống trả `404 Not Found` theo cấu trúc lỗi thống nhất.

### AC-03 — Admin tạo danh mục hợp lệ

**Given** người dùng đã đăng nhập với role `Admin`  
**And** tên danh mục hợp lệ và chưa tồn tại  
**When** gửi `POST /api/categories`  
**Then** hệ thống trim `Name` và `Description`  
**And** tạo danh mục với `Id` và `CreatedAt` do hệ thống sinh  
**And** trả `201 Created`, Category DTO và location của resource mới.

### AC-04 — Từ chối dữ liệu tạo không hợp lệ

**Given** Admin gửi yêu cầu tạo danh mục  
**When** `Name` bị thiếu, chỉ chứa khoảng trắng, ngắn hơn 2 hoặc dài hơn 100 ký tự  
**Or** `Description` dài hơn 500 ký tự  
**Then** hệ thống không tạo dữ liệu  
**And** trả `400 Bad Request` với lỗi validation theo từng trường.

### AC-05 — Từ chối tên danh mục trùng khi tạo

**Given** danh mục `Điện thoại` đã tồn tại  
**When** Admin tạo danh mục có tên tương đương sau trim và không phân biệt hoa/thường  
**Then** hệ thống không tạo bản ghi mới  
**And** trả `409 Conflict` với thông báo tên danh mục đã tồn tại.

### AC-06 — Admin cập nhật danh mục

**Given** Admin đã đăng nhập và danh mục tồn tại  
**When** gửi `PUT /api/categories/{id}` với `Name` và `Description` hợp lệ  
**Then** hệ thống cập nhật đúng danh mục  
**And** không thay đổi `Id` hoặc `CreatedAt`  
**And** trả `200 OK` với Category DTO sau cập nhật.

**Given** danh mục không tồn tại  
**When** Admin gửi yêu cầu cập nhật  
**Then** hệ thống trả `404 Not Found` và không tạo mới danh mục.

### AC-07 — Từ chối dữ liệu hoặc tên trùng khi cập nhật

**Given** Admin cập nhật một danh mục  
**When** dữ liệu vi phạm giới hạn ở AC-04  
**Then** hệ thống trả `400 Bad Request` và giữ nguyên dữ liệu hiện tại.

**Given** một danh mục khác đã sử dụng tên tương đương  
**When** Admin cập nhật sang tên đó  
**Then** hệ thống trả `409 Conflict` và giữ nguyên dữ liệu hiện tại.

Việc giữ nguyên tên hiện tại của chính danh mục, kể cả khi chỉ thay đổi cách viết hoa/thường hợp lệ, không bị xem là trùng với chính nó.

### AC-08 — Admin xóa danh mục chưa có sản phẩm

**Given** Admin đã đăng nhập  
**And** danh mục tồn tại và chưa có Product tham chiếu  
**When** gửi `DELETE /api/categories/{id}`  
**Then** hệ thống xóa danh mục  
**And** trả `204 No Content`.

**Given** danh mục không tồn tại  
**When** Admin gửi yêu cầu xóa  
**Then** hệ thống trả `404 Not Found`.

### AC-09 — Không xóa danh mục đang có sản phẩm

**Given** danh mục có ít nhất một Product tham chiếu  
**When** Admin gửi `DELETE /api/categories/{id}`  
**Then** hệ thống không xóa Category hoặc Product  
**And** trả `409 Conflict`  
**And** thông báo Admin phải chuyển hoặc xóa các Product liên quan trước.

Không sử dụng cascade delete từ Category sang Product.

### AC-10 — Bảo vệ API quản trị

**Given** người dùng chưa đăng nhập  
**When** gọi `POST`, `PUT` hoặc `DELETE /api/categories`  
**Then** hệ thống trả `401 Unauthorized`.

**Given** người dùng đã đăng nhập với role `Customer`  
**When** gọi API tạo, sửa hoặc xóa danh mục  
**Then** hệ thống trả `403 Forbidden`.

Trong cả hai trường hợp, dữ liệu không thay đổi.

### AC-11 — Giao diện quản trị danh mục

**Given** Admin truy cập trang quản lý danh mục  
**When** trang tải dữ liệu  
**Then** giao diện hiển thị trạng thái loading, danh sách hoặc trạng thái rỗng phù hợp  
**And** cung cấp thao tác thêm, sửa và xóa.

**When** Admin gửi form không hợp lệ  
**Then** giao diện hiển thị lỗi tại trường tương ứng và không gửi yêu cầu không hợp lệ.

**When** API trả `409 Conflict` do tên trùng hoặc danh mục đang có Product  
**Then** giao diện hiển thị thông báo nghiệp vụ từ response  
**And** không tự xóa hoặc thay đổi dữ liệu đang hiển thị.

**When** Admin chọn xóa  
**Then** giao diện yêu cầu xác nhận trước khi gửi request.

## 7. API Contract tối thiểu

### Category DTO

```json
{
  "id": 1,
  "name": "Điện thoại",
  "description": "Điện thoại thông minh và phụ kiện",
  "createdAt": "2026-08-21T08:00:00Z"
}
```

### Create/Update request

```json
{
  "name": "Điện thoại",
  "description": "Điện thoại thông minh và phụ kiện"
}
```

Error response phải tuân theo Problem Details/Validation Problem Details đã thống nhất. Response không trả EF Core Entity trực tiếp.

## 8. Ma trận kiểm thử nghiệm thu

| Mã | Kịch bản | Kết quả mong đợi |
| --- | --- | --- |
| TC-01 | Guest lấy danh sách khi chưa có dữ liệu | `200`, mảng rỗng |
| TC-02 | Guest lấy danh sách có dữ liệu | `200`, danh sách Category DTO |
| TC-03 | Lấy Category không tồn tại | `404` |
| TC-04 | Admin tạo Category hợp lệ | `201`, dữ liệu được trim |
| TC-05 | Tạo với Name rỗng/sai độ dài | `400`, không tạo dữ liệu |
| TC-06 | Tạo tên trùng khác hoa/thường | `409`, không tạo dữ liệu |
| TC-07 | Customer gọi API tạo/sửa/xóa | `403`, dữ liệu không đổi |
| TC-08 | Guest gọi API tạo/sửa/xóa | `401`, dữ liệu không đổi |
| TC-09 | Admin cập nhật hợp lệ | `200`, giữ nguyên Id/CreatedAt |
| TC-10 | Cập nhật Category không tồn tại | `404` |
| TC-11 | Cập nhật sang tên của Category khác | `409`, dữ liệu không đổi |
| TC-12 | Xóa Category chưa có Product | `204`, Category bị xóa |
| TC-13 | Xóa Category không tồn tại | `404` |
| TC-14 | Xóa Category đang có Product | `409`, Category và Product còn nguyên |
| TC-15 | UI hiển thị loading/empty/error | Đúng trạng thái, không crash |
| TC-16 | UI xác nhận xóa và hiển thị lỗi `409` | Không xóa khỏi UI khi API từ chối |

## 9. Definition of Done cho US-2

US-2 chỉ được đánh dấu Done khi:

- Category Entity, EF configuration và migration đã được review.
- API list/detail/create/update/delete đáp ứng toàn bộ Acceptance Criteria.
- Phân quyền JWT `Admin`/`Customer` hoạt động đúng.
- Category Management UI đã tích hợp API thực tế.
- Backend và Frontend có test cho các luồng thành công và thất bại quan trọng.
- Functional testing theo ma trận nghiệm thu đã hoàn thành.
- Không còn lỗi nghiêm trọng liên quan đến US-2.
- Code đã qua Pull Request, review và CI thành công.
- Tài liệu API/database được cập nhật nếu implementation làm thay đổi contract đã chốt.
- Product Owner review và chấp nhận Product Increment liên quan.

## 10. Ảnh hưởng kỹ thuật đã xác định

- **API:** thêm contract `/api/categories` theo mục 7.
- **Database:** thêm bảng Category; unique constraint/index cho tên chuẩn hóa phải bảo đảm tính duy nhất không phân biệt hoa/thường.
- **Relationship:** Product bắt buộc tham chiếu Category; xóa Category có Product phải bị chặn.
- **Frontend:** thêm trang quản lý danh mục dành cho Admin và nguồn danh mục công khai cho Product Catalog.
- **Ngoài phạm vi báo cáo:** lựa chọn chi tiết cách lưu giá trị normalized name là quyết định implementation, miễn đáp ứng hành vi nghiệm thu.

## 11. Kết luận chốt

Acceptance Criteria trên là nguồn nghiệm thu cho US-2 trong Sprint 1. Nếu có thay đổi về quy tắc tên trùng, giới hạn dữ liệu, phân quyền hoặc hành vi xóa Category đang có Product, Product Owner phải cập nhật tài liệu này và Jira trước khi Development Team thay đổi implementation.


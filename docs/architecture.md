# **BÁO CÁO CHỐT KIẾN TRÚC HỆ THỐNG, DATABASE ERD VÀ CẤU TRÚC SOLUTION .NET**

## **1\. Thông tin chung**

**Tên dự án:** Website bán hàng trực tuyến  
**Thời gian thực hiện:** 1,5 tháng (6 tuần)  
**Nhóm:** 05 thành viên  
**Scrum Team:**

* 01 Product Owner  
* 01 Scrum Master  
* 03 Developers

**Sprint hiện tại:** Sprint 1 – Product Catalog & Authentication

Báo cáo này được sử dụng làm cơ sở kỹ thuật chung trước khi Development Team bắt đầu Coding. Mục tiêu là thống nhất kiến trúc, cơ sở dữ liệu, công nghệ và cấu trúc source code để các Developer có thể làm việc song song và tích hợp code thuận lợi.

---

# **2\. Mục tiêu kiến trúc**

Kiến trúc được thiết kế theo các nguyên tắc:

* Đủ đơn giản để hoàn thành trong 1,5 tháng.  
* Có cấu trúc rõ ràng để 03 Developer có thể làm việc song song.  
* Dễ mở rộng cho các Sprint sau.  
* Sử dụng công nghệ .NET để có thể tái sử dụng kiến thức và kinh nghiệm cho các môn học khác.  
* Dễ kiểm thử và debug.  
* Hạn chế coupling giữa Frontend, Backend và Database.  
* Không sử dụng các pattern hoặc kiến trúc phức tạp không cần thiết đối với phạm vi bài tập.

---

# **3\. Công nghệ được thống nhất**

## **3.1. Frontend**

* **React**  
* **TypeScript**  
* **Vite**  
* REST API để giao tiếp với Backend

## **3.2. Backend**

* **C\#**  
* **ASP.NET Core Web API**  
* **Entity Framework Core**  
* **JWT Authentication**  
* Swagger / OpenAPI

## **3.3. Database**

* **Microsoft SQL Server**

## **3.4. Version Control**

* **Git**  
* **GitHub**

## **3.5. Công cụ hỗ trợ**

* Visual Studio / Visual Studio Code  
* SQL Server Management Studio hoặc Azure Data Studio  
* Postman / Swagger để kiểm thử API

---

# **4\. Kiến trúc tổng thể**

Hệ thống sử dụng kiến trúc Client – Server theo mô hình REST API.

┌──────────────────────────────┐  
│        React Frontend        │  
│      TypeScript \+ Vite       │  
└──────────────┬───────────────┘  
               │ HTTP / JSON  
               │ REST API  
               ▼  
┌──────────────────────────────┐  
│      ASP.NET Core Web API    │  
│                              │  
│  Controllers                 │  
│       ↓                      │  
│  Services                    │  
│       ↓                      │  
│  Entity Framework Core       │  
└──────────────┬───────────────┘  
               │ SQL  
               ▼  
┌──────────────────────────────┐  
│         SQL Server           │  
└──────────────────────────────┘

### **Luồng xử lý chính**

User  
 ↓  
React UI  
 ↓  
HTTP Request  
 ↓  
ASP.NET Core Controller  
 ↓  
Service  
 ↓  
EF Core / DbContext  
 ↓  
SQL Server  
 ↓  
Database Result  
 ↓  
Service  
 ↓  
Controller  
 ↓  
JSON Response  
 ↓  
React UI

---

# **5\. Kiến trúc Backend**

Backend sử dụng **Layered Architecture đơn giản**, gồm các thành phần chính:

Controller  
    ↓  
Service  
    ↓  
Data Access / EF Core  
    ↓  
Database

## **5.1. Controller**

Controller chịu trách nhiệm:

* Nhận HTTP Request.  
* Validate request ở mức cơ bản.  
* Gọi Service.  
* Trả HTTP Response.  
* Không chứa business logic phức tạp.

Ví dụ:

ProductsController  
CategoriesController  
AuthController  
OrdersController

---

## **5.2. Service**

Service chứa business logic.

Ví dụ:

ProductService  
CategoryService  
AuthService  
OrderService

Service chịu trách nhiệm:

* Kiểm tra nghiệp vụ.  
* Xử lý dữ liệu.  
* Gọi DbContext.  
* Chuyển đổi Entity ↔ DTO.  
* Xử lý các rule của hệ thống.

---

## **5.3. Entity Framework Core**

EF Core được sử dụng để:

* Mapping Entity với Database.  
* Query Database.  
* CRUD.  
* Quản lý relationship.  
* Migration.

---

## **5.4. DTO**

API không trả Entity trực tiếp trong các trường hợp không cần thiết.

Mô hình:

Entity  
   ↓  
Service  
   ↓  
DTO  
   ↓  
Controller  
   ↓  
JSON

Điều này giúp giảm sự phụ thuộc trực tiếp của Frontend vào Database Model.

---

# **6\. Authentication và Authorization**

Hệ thống sử dụng **JWT Authentication**.

## **Role chính**

Admin  
Customer

### **Luồng đăng nhập**

React  
  ↓  
POST /api/auth/login  
  ↓  
AuthController  
  ↓  
AuthService  
  ↓  
Validate user  
  ↓  
Generate JWT  
  ↓  
React nhận token

Các API yêu cầu đăng nhập sử dụng Bearer Token.

Ví dụ API quản lý sản phẩm của Admin:

Authorization: Bearer \<JWT\>

Backend kiểm tra role trước khi thực hiện chức năng.

---

# **7\. Database ERD**

Database được thiết kế theo nhu cầu của Product Backlog hiện tại và có khả năng mở rộng cho Sprint 2, Sprint 3\.

## **7.1. Các Entity chính**

### **User**

| Field | Kiểu | Ghi chú |
| ----- | ----- | ----- |
| Id | int | PK |
| FullName | nvarchar | Họ tên |
| Email | nvarchar | Unique |
| PasswordHash | nvarchar | Mật khẩu đã hash |
| Role | nvarchar | Admin / Customer |
| CreatedAt | datetime | Ngày tạo |

### **Category**

| Field | Kiểu | Ghi chú |
| ----- | ----- | ----- |
| Id | int | PK |
| Name | nvarchar | Tên danh mục |
| Description | nvarchar | Mô tả |
| CreatedAt | datetime | Ngày tạo |

### **Product**

| Field | Kiểu | Ghi chú |
| ----- | ----- | ----- |
| Id | int | PK |
| CategoryId | int | FK |
| Name | nvarchar | Tên sản phẩm |
| Description | nvarchar | Mô tả |
| Price | decimal | Giá |
| Brand | nvarchar | Thương hiệu |
| ImageUrl | nvarchar | Hình ảnh |
| StockQuantity | int | Tồn kho |
| CreatedAt | datetime | Ngày tạo |
| UpdatedAt | datetime | Ngày cập nhật |

### **Address**

| Field | Kiểu | Ghi chú |
| ----- | ----- | ----- |
| Id | int | PK |
| UserId | int | FK |
| ReceiverName | nvarchar | Người nhận |
| Phone | nvarchar | Số điện thoại |
| AddressLine | nvarchar | Địa chỉ |
| IsDefault | bit | Địa chỉ mặc định |

### **Cart**

| Field | Kiểu | Ghi chú |
| ----- | ----- | ----- |
| Id | int | PK |
| UserId | int | FK |
| CreatedAt | datetime | Ngày tạo |

### **CartItem**

| Field | Kiểu | Ghi chú |
| ----- | ----- | ----- |
| Id | int | PK |
| CartId | int | FK |
| ProductId | int | FK |
| Quantity | int | Số lượng |

### **Order**

| Field | Kiểu | Ghi chú |
| ----- | ----- | ----- |
| Id | int | PK |
| UserId | int | FK |
| AddressId | int | FK |
| Status | nvarchar | Trạng thái đơn |
| PaymentMethod | nvarchar | COD |
| TotalAmount | decimal | Tổng tiền |
| CreatedAt | datetime | Ngày tạo |
| UpdatedAt | datetime | Ngày cập nhật |

### **OrderItem**

| Field | Kiểu | Ghi chú |
| ----- | ----- | ----- |
| Id | int | PK |
| OrderId | int | FK |
| ProductId | int | FK |
| Quantity | int | Số lượng |
| UnitPrice | decimal | Giá tại thời điểm đặt |

---

# **8\. Quan hệ giữa các Entity**

Mối quan hệ chính:

User 1 ──────── \* Address

User 1 ──────── 1 Cart  
Cart 1 ──────── \* CartItem  
Product 1 ───── \* CartItem

Category 1 ──── \* Product

User 1 ──────── \* Order  
Address 1 ───── \* Order  
Order 1 ─────── \* OrderItem  
Product 1 ───── \* OrderItem

Sơ đồ khái quát:

                ┌──────────────┐  
                 │   Category   │  
                 └──────┬───────┘  
                        │ 1  
                        │  
                        │ \*  
                 ┌──────▼───────┐  
                 │   Product    │  
                 └───┬────┬─────┘  
                     │    │  
                   \* │    │ \*  
                     │    │  
              ┌──────▼┐  ┌▼──────────┐  
              │CartItem│  │OrderItem  │  
              └───┬────┘  └────┬─────┘  
                  │             │  
                \* │             │ \*  
                  │             │  
              ┌───▼───┐       ┌─▼─────┐  
              │  Cart │       │ Order │  
              └───┬───┘       └──┬────┘  
                  │               │  
                  │ 1             │ \*  
                  │               │  
                  └──────┐  ┌─────┘  
                         │  │  
                         │  │  
                     ┌───▼──▼──┐  
                     │   User  │  
                     └────┬────┘  
                          │  
                          │ 1  
                          │  
                          │ \*  
                    ┌─────▼──────┐  
                    │   Address  │  
                    └────────────┘

---

# **9\. Cấu trúc Solution .NET**

Solution được tổ chức ở mức vừa đủ cho dự án sinh viên:

ECommerce.sln  
│  
├── src  
│   │  
│   └── ECommerce.Api  
│       │  
│       ├── Controllers  
│       │   ├── AuthController.cs  
│       │   ├── CategoriesController.cs  
│       │   ├── ProductsController.cs  
│       │   └── OrdersController.cs  
│       │  
│       ├── Services  
│       │   ├── Interfaces  
│       │   │   ├── IAuthService.cs  
│       │   │   ├── ICategoryService.cs  
│       │   │   └── IProductService.cs  
│       │   │  
│       │   ├── AuthService.cs  
│       │   ├── CategoryService.cs  
│       │   └── ProductService.cs  
│       │  
│       ├── Data  
│       │   ├── AppDbContext.cs  
│       │   ├── Configurations  
│       │   └── Migrations  
│       │  
│       ├── Entities  
│       │   ├── User.cs  
│       │   ├── Category.cs  
│       │   ├── Product.cs  
│       │   ├── Cart.cs  
│       │   ├── CartItem.cs  
│       │   ├── Order.cs  
│       │   ├── OrderItem.cs  
│       │   └── Address.cs  
│       │  
│       ├── DTOs  
│       │   ├── Auth  
│       │   ├── Products  
│       │   ├── Categories  
│       │   └── Orders  
│       │  
│       ├── Middleware  
│       │   └── ExceptionHandlingMiddleware.cs  
│       │  
│       ├── Helpers  
│       │  
│       ├── Program.cs  
│       ├── appsettings.json  
│       └── appsettings.Development.json  
│  
└── tests  
    └── ECommerce.Tests

Không tạo quá nhiều project nhỏ ở giai đoạn đầu. Nhóm chỉ sử dụng một Web API project chính để giảm overhead.

---

# **10\. Cấu trúc Frontend**

Frontend được tổ chức độc lập với Backend:

ECommerce.Client  
│  
├── src  
│   ├── components  
│   ├── pages  
│   ├── layouts  
│   ├── services  
│   ├── hooks  
│   ├── types  
│   ├── routes  
│   ├── utils  
│   └── assets  
│  
├── package.json  
└── vite.config.ts

Backend và Frontend giao tiếp thông qua REST API, không truy cập trực tiếp Database.

---

# **11\. Quy ước API**

API sử dụng RESTful convention.

### **Category**

GET    /api/categories  
GET    /api/categories/{id}  
POST   /api/categories  
PUT    /api/categories/{id}  
DELETE /api/categories/{id}

### **Product**

GET    /api/products  
GET    /api/products/{id}  
POST   /api/products  
PUT    /api/products/{id}  
DELETE /api/products/{id}

### **Authentication**

POST /api/auth/register  
POST /api/auth/login

Các API khác sẽ được bổ sung theo từng Sprint.

---

# **12\. Nguyên tắc Coding**

Để ba Developer có thể làm việc song song, nhóm thống nhất các nguyên tắc:

### **12.1. Không code trực tiếp trên `main`**

Branch chính:

main  
develop

Feature branch:

feature/SCRUM-11-category  
feature/SCRUM-12-product  
feature/SCRUM-13-register

### **12.2. Commit Convention**

Sử dụng dạng:

feat: add product api  
fix: validate product price  
refactor: update category service  
test: add product tests  
docs: update architecture

### **12.3. Pull Request**

* Mỗi feature hoàn thành tạo Pull Request.  
* Ít nhất một Developer khác review.  
* Không merge code chưa được review.  
* Kiểm tra build/test trước khi merge.

### **12.4. Naming Convention**

C\#:

* Class/Method/Property: `PascalCase`  
* Variable/Parameter: `camelCase`

TypeScript:

* Component: `PascalCase`  
* Function/Variable: `camelCase`

---

# **13\. Phân chia trách nhiệm kỹ thuật**

## **Developer 1 – Backend & Database**

Phụ trách chính:

* ASP.NET Core.  
* EF Core.  
* SQL Server.  
* Authentication.  
* Entity.  
* Migration.  
* API.

## **Developer 2 – Frontend**

Phụ trách chính:

* React.  
* TypeScript.  
* UI.  
* Routing.  
* Form.  
* API integration ở Frontend.

## **Developer 3 – Integration & Full-stack**

Phụ trách chính:

* Frontend ↔ Backend integration.  
* Authentication integration.  
* Search/Filter.  
* Error handling.  
* Testing.  
* Hỗ trợ Backend/Frontend khi cần.

Cả ba Developer cùng chịu trách nhiệm về chất lượng và khả năng hoàn thành Product Increment.

---

# **14\. Phạm vi kiến trúc trong Sprint 1**

Trong Sprint 1, nhóm chỉ cần triển khai các thành phần phục vụ:

### **Authentication**

Register  
Login  
Logout  
JWT  
Role

### **Product Catalog**

Category CRUD  
Product CRUD  
Product List  
Search  
Filter  
Product Detail

Không cần triển khai đầy đủ Cart, Order, Payment, Inventory ngay từ đầu. Các module này sẽ được bổ sung trong Sprint 2 và Sprint 3\.

---

# **15\. Các quyết định kỹ thuật cần tuân thủ**

Nhóm thống nhất:

1. Frontend không truy cập trực tiếp SQL Server.  
2. Mọi dữ liệu đi qua REST API.  
3. Business logic nằm trong Service.  
4. Controller không chứa business logic phức tạp.  
5. Không trả Entity trực tiếp nếu có thể sử dụng DTO.  
6. Không commit trực tiếp vào `main`.  
7. Pull Request phải được review trước khi merge.  
8. Các thay đổi về Database cần được ghi nhận bằng EF Core Migration.  
9. API phải có Swagger/OpenAPI để hỗ trợ kiểm thử.  
10. Các quyết định kiến trúc lớn phải được trao đổi với cả team trước khi thay đổi.

---

# **16\. Kết quả chốt**

Sau khi thống nhất kiến trúc, nhóm sử dụng stack:

> **React \+ TypeScript \+ Vite**  
> **ASP.NET Core Web API \+ C\#**  
> **Entity Framework Core**  
> **SQL Server**  
> **JWT Authentication**  
> **Git \+ GitHub**

Kiến trúc:

> **React → ASP.NET Core Web API → Service → EF Core → SQL Server**

Database tập trung vào các entity:

> **User, Category, Product, Address, Cart, CartItem, Order, OrderItem**

Cấu trúc .NET sử dụng một Web API project được tổ chức theo Controller – Service – Data/EF Core – Entity – DTO nhằm đảm bảo đơn giản, dễ phát triển và phù hợp với quy mô dự án.

---

# **17\. Các công việc tiếp theo trước khi Coding**

* Review Architecture Diagram.  
* Review ERD.  
* Review Solution Structure.  
* Tạo GitHub Repository.  
* Tạo ASP.NET Core Web API project.  
* Tạo React project.  
* Cấu hình SQL Server.  
* Cấu hình EF Core.  
* Tạo Initial Migration.  
* Cấu hình Swagger.  
* Cấu hình JWT.  
* Thiết lập branch và Pull Request workflow.  
* Các Developer clone repository và chạy thử project.  
* Xác nhận mọi thành viên có thể build và chạy project thành công.  
* Sau khi môi trường thống nhất, bắt đầu Coding Sprint 1\.

# **18\. Kết luận**

Kiến trúc được lựa chọn nhằm cân bằng giữa **tính học thuật, khả năng mở rộng và thời gian thực hiện**. Việc sử dụng ASP.NET Core giúp nhóm có một nền tảng backend phù hợp với mục tiêu học tập và có thể tiếp tục tái sử dụng kiến thức cho các môn học khác.

Kiến trúc không sử dụng Microservices hoặc các pattern quá phức tạp vì không phù hợp với phạm vi 1,5 tháng. Thay vào đó, nhóm sử dụng Layered Architecture đơn giản, rõ ràng và phù hợp để 03 Developer làm việc song song.

Tài liệu này là **baseline kỹ thuật của Development Team**. Mọi thay đổi lớn về kiến trúc, Database hoặc coding convention trong quá trình phát triển cần được trao đổi và thống nhất với các thành viên trước khi áp dụng.


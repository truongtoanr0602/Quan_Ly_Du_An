# **BÁO CÁO KẾ HOẠCH CÔNG VIỆC SPRINT 1**

## **1\. Thông tin Sprint**

**Tên Sprint:** Sprint 1 – Product Catalog & Authentication  
**Thời lượng:** 02 tuần  
**Scrum Team:** 05 thành viên

* 01 Product Owner  
* 01 Scrum Master  
* 03 Developers

**Sprint Goal:**

> **Xây dựng nền tảng website bán hàng, cho phép người dùng đăng ký, đăng nhập và khám phá sản phẩm; đồng thời Admin có thể quản lý danh mục và sản phẩm.**

---

# **2\. Phạm vi Sprint 1**

Sprint 1 thực hiện 08 User Story đã được thống nhất trong Product Backlog:

| ID | User Story | Vai trò |
| ----- | ----- | ----- |
| 2 | Quản lý danh mục | Admin |
| 3 | Quản lý sản phẩm | Admin |
| 7 | Đăng ký tài khoản | Customer |
| 8 | Đăng nhập / đăng xuất | Customer |
| 17 | Lọc sản phẩm theo danh mục | Customer |
| 18 | Tìm kiếm sản phẩm | Customer |
| 19 | Lọc sản phẩm theo thuộc tính | Customer |
| 20 | Xem chi tiết sản phẩm | Customer |

Các User Story trên tạo thành nền tảng **Authentication \+ Product Catalog** của hệ thống.

---

# **3\. Các nhóm công việc trong Sprint 1**

Công việc của Sprint được chia thành 04 nhóm:

1. Chuẩn bị và thống nhất nền tảng kỹ thuật.  
2. Phân tích và thiết kế.  
3. Phát triển các User Story.  
4. Integration, testing và hoàn thiện Work Product.

Các công việc kỹ thuật không được đưa thành Product Backlog Item riêng mà được quản lý dưới dạng **Technical Task/Sub-task trong Sprint Backlog**.

---

# **4\. Nhóm 1 – Chuẩn bị nền tảng kỹ thuật**

## **4.1. Chốt kiến trúc hệ thống**

**Người phụ trách chính:** PO  
**Phối hợp:** 03 Developers

Công việc:

* Chốt mô hình Frontend – Backend – Database.  
* Chốt ASP.NET Core Web API.  
* Chốt React \+ TypeScript.  
* Chốt SQL Server.  
* Chốt Entity Framework Core.  
* Chốt JWT Authentication.  
* Xác định cách Frontend giao tiếp với Backend.  
* Hoàn thiện Architecture Diagram.

**Kết quả cần đạt:**  
Một Architecture Diagram và tài liệu kiến trúc tối thiểu được cả nhóm thống nhất.

---

## **4.2. Thiết kế Database**

**Người phụ trách chính:** Developer 1  
**Phối hợp:** PO \+ Developer 3

Công việc:

* Xác định các Entity cần thiết cho Sprint 1\.  
* Thiết kế User.  
* Thiết kế Category.  
* Thiết kế Product.  
* Xác định Primary Key / Foreign Key.  
* Xác định các Relationship.  
* Hoàn thiện ERD.  
* Xác định migration strategy.

**Kết quả cần đạt:**  
ERD và database structure đủ để triển khai Authentication, Category và Product.

---

## **4.3. Setup .NET Solution**

**Người phụ trách chính:** Developer 1  
**Phối hợp:** Developer 3

Công việc:

* Tạo ASP.NET Core Web API project.  
* Tạo cấu trúc thư mục/solution.  
* Cấu hình Entity Framework Core.  
* Cấu hình SQL Server.  
* Cấu hình Swagger/OpenAPI.  
* Cấu hình môi trường Development.  
* Tạo Initial Migration.  
* Kiểm tra build và chạy project.

**Kết quả cần đạt:**  
Tất cả Developer có thể clone repository và chạy Backend thành công.

---

## **4.4. Setup Frontend**

**Người phụ trách chính:** Developer 2  
**Phối hợp:** Developer 3

Công việc:

* Tạo React \+ TypeScript project.  
* Cấu hình Vite.  
* Thiết lập routing.  
* Tạo cấu trúc thư mục Frontend.  
* Thiết lập API client.  
* Thiết lập cơ chế quản lý authentication state.  
* Kiểm tra kết nối tới Backend.

**Kết quả cần đạt:**  
Frontend có thể chạy độc lập và giao tiếp được với Backend API.

---

## **4.5. Thiết lập Git Workflow**

**Người phụ trách chính:** Developer 3  
**Phối hợp:** Scrum Master \+ Developers

Công việc:

* Tạo repository.  
* Tạo branch `main`.  
* Tạo branch `develop`.  
* Thống nhất feature branch.  
* Thống nhất commit convention.  
* Thống nhất Pull Request.  
* Thống nhất code review.  
* Thống nhất quy trình merge.

Ví dụ:

main

  ↑

develop

  ↑

feature/SCRUM-11-category

feature/SCRUM-12-product

feature/SCRUM-13-register

**Kết quả cần đạt:**  
Tất cả Developer có thể làm việc song song mà hạn chế xung đột khi merge.

---

# **5\. Nhóm 2 – Phân tích và thiết kế**

## **5.1. Hoàn thiện Use Case Diagram**

**Phụ trách:** PO \+ Developer

Tập trung vào:

* Customer Authentication.  
* Product Catalog.  
* Admin Category Management.  
* Admin Product Management.

---

## **5.2. Activity Diagram**

Ưu tiên các flow:

### **Customer**

* Đăng ký.  
* Đăng nhập.  
* Tìm kiếm sản phẩm.  
* Lọc sản phẩm.  
* Xem chi tiết sản phẩm.

### **Admin**

* Quản lý danh mục.  
* Quản lý sản phẩm.

Không cần vẽ Activity Diagram cho mọi thao tác nhỏ nếu không cần thiết.

---

## **5.3. Wireframe/UI Flow**

**Người phụ trách chính:** Developer 2  
**Phối hợp:** PO

Thiết kế tối thiểu:

### **Customer**

* Login.  
* Register.  
* Product List.  
* Search/Filter.  
* Product Detail.

### **Admin**

* Category Management.  
* Product Management.

Wireframe tập trung vào **flow và thành phần cần thiết**, không dành quá nhiều thời gian cho thiết kế giao diện hoàn thiện ở giai đoạn này.

---

# **6\. Nhóm 3 – Phát triển User Story**

## **6.1. US-2 – Quản lý danh mục**

**Technical Tasks:**

* Category Entity.  
* Category database migration.  
* Category API.  
* Create Category.  
* Update Category.  
* Delete Category.  
* Get Category List.  
* Category Management UI.  
* API Integration.  
* Functional Testing.

**Kết quả:** Admin có thể CRUD danh mục.

---

# **6.2. US-3 – Quản lý sản phẩm**

**Technical Tasks:**

* Product Entity.  
* Product database migration.  
* Product API.  
* Get Product List.  
* Create Product.  
* Update Product.  
* Delete Product.  
* Product Management UI.  
* API Integration.  
* Validation.  
* Testing.

**Kết quả:** Admin có thể CRUD sản phẩm.

---

# **6.3. US-7 – Đăng ký tài khoản**

**Technical Tasks:**

* User Entity.  
* Register API.  
* Validate email.  
* Hash password.  
* Register UI.  
* API Integration.  
* Validation.  
* Testing.

**Kết quả:** Customer có thể đăng ký tài khoản hợp lệ.

---

# **6.4. US-8 – Đăng nhập / đăng xuất**

**Technical Tasks:**

* Login API.  
* Password verification.  
* JWT generation.  
* Authentication middleware/configuration.  
* Login UI.  
* Logout.  
* Authentication state.  
* Protected route.  
* Testing.

**Kết quả:** Customer/Admin có thể đăng nhập và đăng xuất.

---

# **6.5. US-17 – Lọc sản phẩm theo danh mục**

**Technical Tasks:**

* Thiết kế filter query.  
* Backend API/filter logic.  
* Category filter UI.  
* API Integration.  
* Testing.

**Kết quả:** Customer có thể lọc sản phẩm theo danh mục.

---

# **6.6. US-18 – Tìm kiếm sản phẩm**

**Technical Tasks:**

* Xác định search parameter.  
* Search API.  
* Search input UI.  
* Kết nối API.  
* Xử lý không có kết quả.  
* Testing.

**Kết quả:** Customer có thể tìm sản phẩm bằng từ khóa.

---

# **6.7. US-19 – Lọc sản phẩm theo thuộc tính**

**Technical Tasks:**

* Xác định các thuộc tính cần filter.  
* Backend filter logic.  
* Filter UI.  
* API Integration.  
* Testing.

**Phạm vi Sprint 1:**  
Ưu tiên **giá và thương hiệu** để tránh mở rộng scope không cần thiết.

**Kết quả:** Customer có thể lọc sản phẩm theo các thuộc tính đã thống nhất.

---

# **6.8. US-20 – Xem chi tiết sản phẩm**

**Technical Tasks:**

* Product Detail API.  
* Product Detail UI.  
* Hiển thị hình ảnh.  
* Hiển thị tên, giá, mô tả, thương hiệu và thông tin cần thiết.  
* API Integration.  
* Loading/Error handling.  
* Testing.

**Kết quả:** Customer có thể xem đầy đủ thông tin sản phẩm.

---

# **7\. Phân công tổng quát cho 03 Developers**

## **Developer 1 – Backend & Database**

Phụ trách chính:

* ASP.NET Core.  
* EF Core.  
* SQL Server.  
* Authentication backend.  
* Category API.  
* Product API.  
* Database Migration.

---

## **Developer 2 – Frontend & UI**

Phụ trách chính:

* React \+ TypeScript.  
* Login/Register.  
* Product List.  
* Search/Filter.  
* Product Detail.  
* Admin Category UI.  
* Admin Product UI.  
* Wireframe/UI flow.

---

## **Developer 3 – Integration & Full-stack**

Phụ trách chính:

* Frontend ↔ Backend Integration.  
* JWT Integration.  
* Search/Filter Integration.  
* Error handling.  
* Testing.  
* Code Review.  
* Hỗ trợ Backend/Frontend khi cần.  
* Git workflow.

**Lưu ý:** Cả 03 Developers cùng chịu trách nhiệm về Testing và chất lượng Work Product.

---

# **8\. Phân công cho PO và Scrum Master**

## **Product Owner**

* Hoàn thiện Acceptance Criteria.  
* Giải đáp các câu hỏi nghiệp vụ.  
* Review wireframe.  
* Review Architecture ở mức Product.  
* Theo dõi Product Backlog.  
* Review Work Product.  
* Xác nhận Acceptance Criteria cuối Sprint.

## **Scrum Master**

* Quản lý Sprint trên Jira.  
* Điều phối Daily Scrum.  
* Theo dõi blocker.  
* Nhắc nhở cập nhật Jira.  
* Hỗ trợ Sprint Review.  
* Điều phối Sprint Retrospective.

---

# **9\. Quy trình làm việc trong Sprint**

Nhóm thống nhất quy trình:

User Story

    ↓

Technical Task / Sub-task

    ↓

Development

    ↓

Code Review

    ↓

Integration

    ↓

Testing

    ↓

PO Review

    ↓

Done

Jira được sử dụng để theo dõi trạng thái:

To Do → In Progress → Done

---

# **10\. Definition of Done**

Một User Story chỉ được đánh dấu **Done** khi:

* Đã hoàn thành Implementation.  
* Đã hoàn thành Integration.  
* Đã đáp ứng toàn bộ Acceptance Criteria.  
* Đã thực hiện Functional Testing.  
* Không còn lỗi nghiêm trọng.  
* Code đã được review.  
* Code đã merge vào branch chung.  
* Có thể chạy và demo.  
* PO đã review và chấp nhận.

---

# **11\. Work Product cuối Sprint 1**

Cuối Sprint, nhóm phải tạo ra một phiên bản website có thể chạy được.

## **Customer**

Đăng ký

   ↓

Đăng nhập

   ↓

Product List

   ↓

Tìm kiếm

   ↓

Lọc

   ↓

Product Detail

## **Admin**

Admin Login

   ↓

Category Management

   ↓

Product Management

Work Product không yêu cầu hoàn thành các chức năng của Sprint 2 như:

* Giỏ hàng.  
* Checkout.  
* Đặt hàng.  
* Lịch sử đơn hàng.

Các chức năng này thuộc phạm vi Sprint tiếp theo.

---

# **12\. Kế hoạch theo tuần**

## **Tuần 1 – Foundation & Core Development**

**Đầu tuần:**

* Chốt Architecture.  
* Chốt ERD.  
* Setup .NET.  
* Setup React.  
* Setup Database.  
* Setup Git.  
* Hoàn thiện Wireframe.  
* Hoàn thiện Use Case/Activity Diagram cần thiết.

**Cuối tuần:**

* Authentication cơ bản.  
* Category CRUD.  
* Product CRUD bắt đầu.  
* Product List bắt đầu.

---

## **Tuần 2 – Feature Completion & Integration**

**Đầu tuần:**

* Hoàn thiện Product CRUD.  
* Hoàn thiện Login/Register.  
* Search.  
* Filter.  
* Product Detail.

**Cuối tuần:**

* Integration toàn bộ Sprint 1\.  
* Testing.  
* Bug fixing.  
* Review Acceptance Criteria.  
* Chuẩn bị Demo.  
* Chuẩn bị Sprint Review.

---

# **13\. Các mốc kiểm soát**

### **Milestone 1 – Foundation Ready**

Sau giai đoạn đầu:

> Tất cả thành viên có thể chạy Frontend \+ Backend \+ Database.

### **Milestone 2 – Core Features Ready**

> Authentication \+ Category \+ Product CRUD hoạt động.

### **Milestone 3 – Catalog Ready**

> Search \+ Filter \+ Product Detail hoạt động.

### **Milestone 4 – Sprint Increment Ready**

> Toàn bộ Sprint 1 được Integration, Testing và có thể Demo.

---

# **14\. Kết luận**

Sprint 1 tập trung xây dựng **nền tảng kỹ thuật và Product Catalog \+ Authentication**, không mở rộng sang các chức năng mua hàng.

Các công việc được chia thành:

> **Foundation → Design → Development → Integration → Testing → PO Acceptance**

Development Team chịu trách nhiệm tạo Product Increment; Product Owner chịu trách nhiệm làm rõ yêu cầu và nghiệm thu theo Acceptance Criteria; Scrum Master đảm bảo quy trình Sprint được thực hiện đúng.

Mục tiêu cuối cùng của Sprint 1 là tạo ra một **Work Product chạy được, có thể demo và đáp ứng Sprint Goal**, làm nền tảng để Sprint 2 phát triển các chức năng Giỏ hàng, Checkout và Đặt hàng.


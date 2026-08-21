# **BÁO CÁO THỐNG NHẤT SPRINT BACKLOG**

Xem chi tiết Sprint Backlog tại: [product\_backlog.xlsx](https://docs.google.com/spreadsheets/d/1keOqjjBszhm_CqtjJl2YCRWFhiVRNPtR/edit?gid=785048596#gid=785048596)

## **1\. Thông tin dự án**

**Tên dự án:** Website bán hàng trực tuyến  
**Thời gian thực hiện:** 1,5 tháng (6 tuần)  
**Số lượng thành viên:** 5 thành viên  
**Scrum Team:**

* 01 Product Owner (PO) \- Toản  
* 01 Scrum Master (SM) \- Quang  
* 03 Developers \- Bá Nam, Tùng, Năng

**Số Sprint:** 03 Sprint  
**Thời lượng:** 02 tuần/Sprint

---

# **2\. Product Goal**

> **Xây dựng một website bán hàng trực tuyến MVP cung cấp đầy đủ quy trình mua hàng cơ bản từ xem, tìm kiếm sản phẩm, thêm vào giỏ hàng đến đặt hàng; đồng thời hỗ trợ quản trị viên quản lý sản phẩm, danh mục, tồn kho và đơn hàng, đảm bảo hệ thống có thể vận hành ổn định và hoàn thiện trong phạm vi 1,5 tháng.**

---

# **3\. Sprint Goal tổng thể**

Ba Sprint được tổ chức theo trình tự phát triển của hệ thống:

| Sprint | Thời gian | Sprint Goal |
| ----- | ----- | ----- |
| **Sprint 1** | Tuần 1–2 | Xây dựng nền tảng website, Authentication và Product Catalog |
| **Sprint 2** | Tuần 3–4 | Hoàn thiện quy trình mua hàng từ giỏ hàng đến đặt hàng |
| **Sprint 3** | Tuần 5–6 | Hoàn thiện quản trị, tài khoản và ổn định hệ thống |

---

# **4\. Sprint 1 – Product Catalog & Authentication**

**Thời gian:** Tuần 1 – Tuần 2

## **Sprint Goal**

> **Xây dựng nền tảng website bán hàng, cho phép người dùng đăng ký, đăng nhập và khám phá sản phẩm; đồng thời Admin có thể quản lý danh mục và sản phẩm.**

## **Sprint Backlog**

| ID | User Story | Người dùng |
| ----- | ----- | ----- |
| **2** | Quản lý danh mục | Admin |
| **3** | Quản lý sản phẩm | Admin |
| **7** | Đăng ký tài khoản | Customer |
| **8** | Đăng nhập / đăng xuất | Customer |
| **17** | Lọc sản phẩm theo danh mục | Customer |
| **18** | Tìm kiếm sản phẩm | Customer |
| **19** | Lọc sản phẩm theo thuộc tính | Customer |
| **20** | Xem chi tiết sản phẩm | Customer |

### **Work Product Sprint 1**

Sau Sprint 1, hệ thống cần có phiên bản có thể chạy và demo được:

**Customer Flow:**

> Đăng ký → Đăng nhập → Xem sản phẩm → Tìm kiếm → Lọc sản phẩm → Xem chi tiết sản phẩm

**Admin Flow:**

> Admin Login → Quản lý danh mục → Quản lý sản phẩm

### **Kết quả mong đợi**

* Người dùng có thể tạo tài khoản và đăng nhập.  
* Người dùng có thể tìm kiếm và lọc sản phẩm.  
* Người dùng có thể xem thông tin chi tiết sản phẩm.  
* Admin có thể thêm, sửa, xóa danh mục.  
* Admin có thể thêm, sửa, xóa sản phẩm.

---

# **5\. Sprint 2 – Shopping & Ordering**

**Thời gian:** Tuần 3 – Tuần 4

## **Sprint Goal**

> **Hoàn thiện quy trình mua hàng, cho phép khách hàng quản lý giỏ hàng, nhập thông tin giao hàng, đặt hàng và xem lịch sử đơn hàng.**

## **Sprint Backlog**

| ID | User Story | Người dùng |
| ----- | ----- | ----- |
| **9** | Quản lý thông tin cá nhân | Customer |
| **12** | Giỏ hàng | Customer |
| **13** | Đặt hàng nhiều sản phẩm | Customer |
| **14** | Địa chỉ và phương thức thanh toán | Customer |
| **15** | Xem lịch sử đơn hàng | Customer |

### **Work Product Sprint 2**

Customer có thể thực hiện hoàn chỉnh:

> Xem sản phẩm → Thêm vào giỏ hàng → Điều chỉnh số lượng → Checkout → Nhập địa chỉ → Chọn phương thức thanh toán → Đặt hàng → Xem lịch sử đơn hàng

### **Kết quả mong đợi**

* Người dùng có thể cập nhật thông tin cá nhân.  
* Người dùng có thể thêm/xóa/thay đổi số lượng sản phẩm trong giỏ.  
* Người dùng có thể đặt nhiều sản phẩm trong một đơn hàng.  
* Người dùng có thể nhập địa chỉ giao hàng.  
* Người dùng có thể lựa chọn phương thức thanh toán được hỗ trợ.  
* Đơn hàng được tạo thành công.  
* Người dùng có thể xem lịch sử đơn hàng.

**Phạm vi thanh toán:** ưu tiên **COD** để phù hợp với thời gian và phạm vi của dự án.

---

# **6\. Sprint 3 – Administration & System Completion**

**Thời gian:** Tuần 5 – Tuần 6

## **Sprint Goal**

> **Hoàn thiện các chức năng quản trị đơn hàng, tồn kho, báo cáo và quản lý tài khoản; đồng thời kiểm thử, sửa lỗi và ổn định hệ thống để sẵn sàng demo.**

## **Sprint Backlog**

| ID | User Story | Người dùng |
| ----- | ----- | ----- |
| **1** | Xem danh sách người dùng và đơn hàng | Admin |
| **4** | Quản lý tồn kho | Admin |
| **5** | Quản lý/cập nhật trạng thái đơn hàng | Admin |
| **6** | Báo cáo doanh thu / thống kê | Admin |
| **10** | Đặt lại mật khẩu | Customer |
| **11** | Đổi mật khẩu | Customer |
| **16** | Hủy đơn hàng | Customer |

### **Work Product Sprint 3**

**Admin Flow:**

> Admin Login → Xem người dùng/đơn hàng → Quản lý đơn hàng → Quản lý tồn kho → Xem báo cáo

**Customer Flow:**

> Quản lý tài khoản → Đổi/đặt lại mật khẩu → Xem đơn hàng → Hủy đơn khi đủ điều kiện

Ngoài các User Story trên, Sprint 3 dành thời gian cho:

* Integration toàn hệ thống.  
* Functional Testing.  
* Bug Fixing.  
* Validation.  
* Kiểm tra phân quyền.  
* Responsive UI.  
* Deployment.  
* Chuẩn bị Product Demo.

---

# **7\. Tổng hợp Sprint Backlog**

| Sprint | User Story | Số Story |
| ----- | ----- | ----- |
| **Sprint 1** | 2, 3, 7, 8, 17, 18, 19, 20 | **8** |
| **Sprint 2** | 9, 12, 13, 14, 15 | **5** |
| **Sprint 3** | 1, 4, 5, 6, 10, 11, 16 | **7** |
| **Tổng** | 1–20 | **20** |

Việc Sprint 2 có ít User Story hơn Sprint 1 và Sprint 3 là chấp nhận được. Nhóm không đánh giá workload chỉ dựa trên số lượng User Story mà sử dụng **Story Point và Development Team Capacity** để xác định khối lượng thực tế.

---

# **8\. Phân công trách nhiệm trong Scrum Team**

## **Product Owner**

PO chịu trách nhiệm:

* Xác định và truyền đạt Product Goal.  
* Quản lý Product Backlog.  
* Sắp xếp thứ tự ưu tiên Product Backlog Item.  
* Làm rõ yêu cầu nghiệp vụ.  
* Xác định Acceptance Criteria.  
* Review và xác nhận Product Increment.  
* Thu thập feedback để điều chỉnh Product Backlog.

PO **không quyết định cách Developers triển khai kỹ thuật**.

## **Scrum Master**

Scrum Master chịu trách nhiệm:

* Facilitate Sprint Planning.  
* Quản lý Sprint trên Jira.  
* Facilitate Daily Scrum.  
* Theo dõi và hỗ trợ loại bỏ impediment.  
* Facilitate Sprint Review.  
* Facilitate Sprint Retrospective.  
* Hỗ trợ nhóm áp dụng Scrum đúng quy trình.

## **Development Team**

03 Developers cùng chịu trách nhiệm:

* Estimate Story Point.  
* Phân rã User Story thành Task/Sub-task.  
* Thiết kế và phát triển Frontend/Backend/Database.  
* Integration.  
* Testing.  
* Bug fixing.  
* Tạo Product Increment đáp ứng Definition of Done.

Việc phân công Frontend, Backend hoặc Integration chỉ là **phân công trách nhiệm chính**, không có nghĩa mỗi Developer chỉ làm một loại công việc.

---

# **9\. Definition of Done**

Một User Story được xem là **Done** khi đáp ứng đầy đủ:

* Đã implement chức năng.  
* Đáp ứng Acceptance Criteria.  
* Frontend và Backend đã được tích hợp nếu cần.  
* Đã thực hiện functional testing.  
* Không còn lỗi nghiêm trọng liên quan đến Story.  
* Code đã được đưa lên repository chung.  
* Chức năng có thể chạy và demo.  
* PO đã review và chấp nhận kết quả.

---

# **10\. Nguyên tắc quản lý Sprint Backlog**

Sau khi Sprint bắt đầu:

* Product Backlog vẫn có thể được PO cập nhật, ưu tiên lại khi cần.  
* Sprint Goal là mục tiêu chính cần được bảo vệ.  
* Developers chịu trách nhiệm quản lý Sprint Backlog và cách thực hiện công việc.  
* Technical Task có thể được thêm, sửa hoặc chia nhỏ khi Developers hiểu rõ công việc hơn.  
* Không tự ý đưa thêm User Story lớn vào Sprint nếu làm ảnh hưởng Sprint Goal.  
* Những công việc chưa hoàn thành phải được đánh giá lại và đưa trở về Product Backlog khi phù hợp.

---

# **11\. Tiêu chí đánh giá kết quả Sprint**

Cuối mỗi Sprint, nhóm sẽ đánh giá:

### **Sprint Goal**

Sprint có đạt được mục tiêu đề ra hay không?

### **Product Increment**

Work Product có chạy được và có thể demo không?

### **Acceptance Criteria**

Các User Story đã đáp ứng đầy đủ yêu cầu chưa?

### **Definition of Done**

Các Story đã thực sự Done chưa?

### **Feedback**

Feedback từ PO, giảng viên hoặc người dùng có yêu cầu điều chỉnh Product Backlog không?

---

# **12\. Kết luận**

Sprint Backlog thống nhất của nhóm gồm **20 User Story**, được phân bổ trong **03 Sprint, mỗi Sprint 02 tuần**:

> **Sprint 1:** Product Catalog & Authentication  
> **Sprint 2:** Shopping & Ordering  
> **Sprint 3:** Administration & System Completion

Cách chia này ưu tiên phát triển theo dependency của hệ thống:

> **Authentication \+ Product → Shopping → Order Management \+ Inventory → Finalization**

Sau **Sprint 2**, nhóm phải đạt được một **MVP có quy trình mua hàng end-to-end**. Sprint 3 tập trung vào các chức năng quản trị còn lại, bảo mật tài khoản, testing, integration và hoàn thiện sản phẩm.

Sprint Backlog là cơ sở để nhóm tạo **Sprint trên Jira**, estimate Story Point, phân rã thành Task/Sub-task và theo dõi tiến độ trong từng Sprint.


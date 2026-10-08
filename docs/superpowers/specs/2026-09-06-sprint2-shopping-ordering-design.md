# Thiết kế US-12/13/14 — Giỏ hàng, đặt hàng và giao nhận

## 1. Bối cảnh và mục tiêu

Thiết kế này hoàn thiện các dependency bắt buộc của Sprint 2 trước khi triển khai US-05 của Sprint 3:

- US-12 — Quản lý giỏ hàng.
- US-13 — Đặt nhiều sản phẩm trong một đơn hàng.
- US-14 — Chọn địa chỉ giao hàng và phương thức thanh toán.

Mục tiêu là tạo một luồng mua hàng có thể chạy và demo từ giỏ hàng đến đơn hàng `PENDING`, sử dụng kiến trúc đã duyệt:

```text
React -> REST API -> Controller -> Service -> AppDbContext / EF Core -> SQL Server
```

## 2. Quyết định đã thống nhất

- Giỏ hàng được lưu tại backend và gắn với tài khoản đăng nhập.
- Người dùng phải đăng nhập trước khi thêm hoặc thay đổi giỏ hàng; không có giỏ hàng khách và không gộp giỏ khi đăng nhập.
- Checkout có thể dùng địa chỉ đã lưu hoặc địa chỉ mới nhập trực tiếp.
- Địa chỉ mới có thể được lưu vào hồ sơ nếu người dùng chọn `saveAddress`.
- Đơn hàng luôn lưu snapshot thông tin giao hàng để lịch sử không thay đổi khi địa chỉ hồ sơ được sửa.
- Phương thức thanh toán duy nhất trong MVP là `COD`.
- Phí giao hàng trong MVP là `0`.
- Backend là nguồn dữ liệu duy nhất cho giá, tồn kho, tổng tiền, danh sách sản phẩm trong đơn và danh tính người dùng.
- Triển khai theo lát cắt dọc: US-12, phần địa chỉ của US-14, sau đó US-13/14 checkout hoàn chỉnh.

## 3. Phạm vi

### 3.1. Trong phạm vi

- Đọc giỏ hàng hiện tại.
- Thêm sản phẩm vào giỏ.
- Cập nhật số lượng sản phẩm.
- Xóa một sản phẩm hoặc toàn bộ giỏ.
- Đọc và lưu địa chỉ giao hàng của người dùng.
- Tạo một đơn hàng từ toàn bộ giỏ hiện tại.
- Kiểm tra lại giá, trạng thái sản phẩm và tồn kho tại checkout.
- Trừ tồn kho, ghi giao dịch tồn kho và xóa giỏ trong cùng transaction tạo đơn.
- Tích hợp frontend với các API mới.
- Kiểm thử backend, frontend và luồng HTTP liên quan.

### 3.2. Ngoài phạm vi

- Giỏ hàng cho khách chưa đăng nhập hoặc gộp giỏ sau đăng nhập.
- Thanh toán trực tuyến, cổng thanh toán hoặc trạng thái thanh toán ngoài `PENDING`.
- Tính phí giao hàng theo khu vực hoặc nhà vận chuyển.
- Mã giảm giá, khuyến mãi, thuế hoặc đặt trước sản phẩm hết hàng.
- Theo dõi lịch sử đơn hàng của US-15.
- Hủy đơn, quản lý trạng thái đơn và báo cáo của Sprint 3.
- Thiết kế lại schema hiện có khi chưa có phê duyệt riêng.

## 4. Kiến trúc và thành phần

### 4.1. Backend

`CartController` chỉ xử lý HTTP, xác thực/ủy quyền, lấy `UserID` từ JWT và gọi `ICartService`. `CartService` sở hữu các quy tắc tạo giỏ, thêm/gộp mục, cập nhật số lượng, xóa mục và ánh xạ DTO.

`AddressesController` lấy `UserID` từ JWT và gọi `IAddressService`. `AddressService` bảo đảm người dùng chỉ đọc hoặc lưu địa chỉ của chính mình.

`OrdersController` nhận yêu cầu checkout và gọi `IOrderService`. `OrderService` sở hữu toàn bộ quy tắc tạo đơn, tính tiền, kiểm tra tồn kho, snapshot dữ liệu và transaction.

Các service truy cập dữ liệu trực tiếp qua `AppDbContext`; không thêm repository layer.

### 4.2. Frontend

- `cartService` gọi Cart API và mô hình hóa DTO rõ ràng.
- `addressService` đọc/lưu địa chỉ.
- `orderService` gửi checkout và nhận đơn đã tạo.
- `CartContext` quản lý trạng thái và cache dữ liệu API trong phiên chạy; `localStorage` không còn là nguồn dữ liệu giỏ chính.
- Trang giỏ/checkout hiển thị trạng thái loading, empty, validation, conflict, error và success.
- Khi chưa đăng nhập, thao tác thêm vào giỏ điều hướng tới trang đăng nhập.

## 5. Hợp đồng API

Tất cả endpoint dưới đây yêu cầu JWT hợp lệ và role `Customer`. `UserID` được lấy từ claim `sub`, không nhận từ request body hoặc query string.

### 5.1. Cart API

| Method | Route | Thành công | Mục đích |
| --- | --- | --- | --- |
| `GET` | `/api/cart` | `200` | Trả giỏ hiện tại, các mục, tổng số lượng và tạm tính |
| `POST` | `/api/cart/items` | `200` | Thêm `{ productId, quantity }`; cộng số lượng nếu sản phẩm đã có và trả giỏ mới |
| `PUT` | `/api/cart/items/{productId}` | `200` | Đặt số lượng của sản phẩm thành giá trị mới và trả giỏ mới |
| `DELETE` | `/api/cart/items/{productId}` | `204` | Xóa một sản phẩm khỏi giỏ |
| `DELETE` | `/api/cart` | `204` | Xóa toàn bộ giỏ |

Cart response chứa dữ liệu cần hiển thị nhưng không lộ Entity hoặc navigation graph. Mỗi item gồm tối thiểu `productId`, `productName`, `sku`, ảnh chính nếu có, `unitPrice`, `quantity`, `availableStock` và `lineTotal`. Tổng tiền do backend tính.

### 5.2. Address API

| Method | Route | Thành công | Mục đích |
| --- | --- | --- | --- |
| `GET` | `/api/addresses` | `200` | Trả các địa chỉ đã lưu của người dùng hiện tại |
| `POST` | `/api/addresses` | `201` | Lưu một địa chỉ mới cho người dùng hiện tại |

Địa chỉ gồm `receiverName`, `receiverPhone`, `province`, `district`, `ward` và `fullAddress`. Quản lý địa chỉ mặc định thuộc US-9 và không được mở rộng trong thiết kế này.

### 5.3. Order API

| Method | Route | Thành công | Mục đích |
| --- | --- | --- | --- |
| `POST` | `/api/orders` | `201` | Tạo một đơn hàng từ toàn bộ giỏ hiện tại |

Checkout request phải cung cấp đúng một nguồn địa chỉ:

- `addressId` của địa chỉ đã lưu; hoặc
- `shippingAddress` chứa đầy đủ thông tin giao hàng mới.

Request địa chỉ mới có thể đặt `saveAddress: true`. `paymentMethod` chỉ chấp nhận `COD`. Client không gửi giá, tổng tiền, phí giao hàng, `UserID` hoặc danh sách order item.

Response thành công dùng `201 Created` và trả Order DTO gồm mã đơn, snapshot địa chỉ, các item, `subTotal`, `shippingFee`, `totalAmount`, `paymentMethod`, `paymentStatus`, `orderStatus` và `createdAt`.

## 6. Quy tắc nghiệp vụ

### 6.1. Giỏ hàng

- Mỗi người dùng có tối đa một `Cart`; giỏ được tạo khi thêm sản phẩm đầu tiên.
- `quantity` phải lớn hơn `0`.
- Chỉ sản phẩm đang hoạt động mới được thêm vào giỏ.
- Số lượng sau khi thêm hoặc cập nhật không được vượt tồn kho hiện tại.
- Cặp `CartID`/`ProductID` là duy nhất; thêm lại cùng sản phẩm sẽ cộng số lượng.
- Người dùng chỉ có thể đọc hoặc thay đổi giỏ của chính mình.

### 6.2. Địa chỉ

- Địa chỉ đã lưu phải thuộc người dùng hiện tại.
- Nếu request dùng địa chỉ mới, backend validate toàn bộ trường bắt buộc trước khi checkout.
- Nếu `saveAddress` là `true`, địa chỉ mới được lưu trong cùng transaction tạo đơn.
- Đơn hàng chỉ lưu snapshot; các thay đổi địa chỉ hồ sơ sau này không ảnh hưởng đơn cũ.

### 6.3. Checkout và tồn kho

- Giỏ không được rỗng.
- Backend đọc lại sản phẩm từ database và không tin dữ liệu hiển thị ở frontend.
- Mỗi sản phẩm phải tồn tại, đang hoạt động và đủ tồn kho tại thời điểm checkout.
- `SubTotal` bằng tổng `Quantity * UnitPrice` theo giá hiện tại trong database.
- `ShippingFee` bằng `0`; `TotalAmount` bằng `SubTotal`.
- Đơn mới có `PaymentMethod = COD`, `PaymentStatus = PENDING` và `OrderStatus = PENDING`.
- `OrderDetail` snapshot `ProductName`, `SKU` và `UnitPrice`.
- Mỗi lần trừ kho tạo một `InventoryTransaction` loại `SALE`, ghi số lượng thay đổi, tồn trước/sau, người tạo và tham chiếu đơn hàng.

## 7. Transaction và chống bán vượt tồn kho

Checkout chạy trong một database transaction duy nhất:

1. Xác thực nguồn địa chỉ và giỏ hàng.
2. Đọc lại sản phẩm, giá và trạng thái hiện tại.
3. Tạo `Order` và `OrderDetail` từ snapshot dữ liệu.
4. Với từng sản phẩm, cập nhật tồn kho có điều kiện `StockQuantity >= quantity`.
5. Nếu bất kỳ cập nhật nào không tác động đúng một dòng, rollback và trả conflict.
6. Ghi `InventoryTransaction` cho từng sản phẩm.
7. Lưu địa chỉ mới nếu người dùng yêu cầu.
8. Xóa các item trong giỏ.
9. Commit transaction.

Nếu checkout thất bại, không tạo đơn một phần, không trừ kho một phần, không lưu địa chỉ mới và không xóa giỏ.

## 8. Xử lý lỗi

API dùng Problem Details thống nhất và không trả stack trace, token, password hash hoặc exception message nội bộ.

| Trường hợp | HTTP status |
| --- | --- |
| Request/DTO không hợp lệ | `400 Bad Request` |
| Thiếu hoặc JWT không hợp lệ | `401 Unauthorized` |
| Sai role | `403 Forbidden` |
| Sản phẩm/địa chỉ không tồn tại hoặc không thuộc người dùng | `404 Not Found` |
| Sản phẩm ngừng bán, thiếu tồn kho hoặc xung đột trạng thái | `409 Conflict` |
| Tạo thành công | `201 Created` |
| Xóa thành công không cần body | `204 No Content` |

Các lỗi nghiệp vụ dự kiến được biểu diễn rõ ràng để middleware/controller ánh xạ nhất quán; lỗi không dự kiến đi qua middleware xử lý lỗi tập trung.

## 9. Dữ liệu và migration

Các Entity và bảng `Cart`, `CartItem`, `Address`, `Order`, `OrderDetail` và `InventoryTransaction` đã tồn tại trong model và migration hiện tại. Thiết kế không yêu cầu migration mới.

Trước khi implementation thay đổi Entity hoặc EF configuration, Development Team phải đối chiếu model với tài liệu ERD và xin phê duyệt riêng cho mọi thay đổi schema. Không sửa migration đã chia sẻ và không thay đổi database thủ công.

## 10. Chiến lược kiểm thử

### 10.1. Backend

Sử dụng xUnit và `WebApplicationFactory`; thêm `Microsoft.EntityFrameworkCore.Sqlite` chỉ vào test project để có database quan hệ in-memory, không làm thay đổi dependency production.

Kiểm thử Cart Service/API:

- Tạo giỏ khi thêm sản phẩm lần đầu.
- Gộp số lượng khi thêm sản phẩm đã có.
- Từ chối số lượng không hợp lệ, sản phẩm không hoạt động hoặc vượt tồn kho.
- Cập nhật/xóa đúng mục và không truy cập giỏ người dùng khác.
- Tổng số lượng và tạm tính do backend tính đúng.

Kiểm thử Address Service/API:

- Chỉ trả địa chỉ của người dùng hiện tại.
- Validate địa chỉ mới.
- Không cho dùng địa chỉ của người dùng khác khi checkout.

Kiểm thử Order Service/API:

- Từ chối giỏ rỗng hoặc request có không đúng một nguồn địa chỉ.
- Chỉ chấp nhận COD và phí giao hàng bằng `0`.
- Lấy giá và tồn kho từ database.
- Lưu đúng snapshot đơn hàng và sản phẩm.
- Trừ tồn kho và ghi `SALE` transaction đúng.
- Rollback toàn bộ khi một item thiếu tồn kho hoặc lỗi lưu dữ liệu.
- Giữ nguyên giỏ khi thất bại và xóa giỏ khi thành công.
- Trả đúng status code và Problem Details.
- Bảo vệ endpoint bằng JWT và role `Customer`.

### 10.2. Frontend

- `CartContext` tải và cập nhật dữ liệu qua API.
- Người chưa đăng nhập được chuyển tới login khi thêm vào giỏ.
- Trang giỏ hiển thị loading, empty, lỗi và tổng tiền.
- Checkout chọn được địa chỉ lưu hoặc nhập địa chỉ mới.
- Tùy chọn lưu địa chỉ mới được gửi đúng.
- Trang checkout chỉ hiển thị COD và phí giao hàng `0`.
- Xung đột tồn kho được hiển thị và giỏ được tải lại.
- Sau thành công, giỏ rỗng và UI hiển thị mã đơn.

## 11. Trình tự triển khai

1. US-12 backend và tests.
2. US-12 frontend integration và tests.
3. US-14 Address API, service và tests.
4. US-14 frontend địa chỉ và checkout form.
5. US-13/14 Order API, transaction và tests.
6. US-13/14 frontend checkout integration và success/error states.
7. Chạy toàn bộ build/test backend và frontend; kiểm thử thủ công luồng đăng nhập đến đặt hàng.

## 12. Acceptance Criteria hợp nhất

- Người dùng đã đăng nhập có thể thêm, xem, cập nhật và xóa sản phẩm trong giỏ backend của chính mình.
- Hệ thống ngăn số lượng không hợp lệ và không cho giỏ vượt tồn kho được biết tại thời điểm thao tác.
- Người dùng có thể checkout bằng địa chỉ đã lưu hoặc địa chỉ mới và có thể chọn lưu địa chỉ mới.
- Checkout chỉ hỗ trợ COD, phí giao hàng `0` và tạo một đơn chứa toàn bộ sản phẩm trong giỏ.
- Giá, tổng tiền, danh tính người dùng và tồn kho được xác định lại ở backend.
- Checkout thành công tạo đầy đủ Order, OrderDetail và InventoryTransaction, trừ kho và xóa giỏ trong một transaction.
- Checkout thất bại không để lại dữ liệu một phần và giữ nguyên giỏ.
- Người dùng không thể đọc hoặc sửa giỏ/địa chỉ của tài khoản khác.
- API trả DTO và Problem Details an toàn; không lộ Entity riêng tư hoặc stack trace.
- Các kiểm thử liên quan và toàn bộ build/test dự án đều đạt trước khi story được đề nghị nghiệm thu.

## 13. Tác động

- API: thêm các public endpoint cho cart, address và order như mục 5.
- Database: không dự kiến thay đổi schema hoặc migration.
- Frontend: thay nguồn giỏ hàng từ `localStorage` sang backend và thêm luồng checkout.
- Dependency: thêm SQLite provider chỉ trong backend test project.
- Sprint: chỉ triển khai US-12/13/14; không mở rộng sang US-15 hoặc Sprint 3.

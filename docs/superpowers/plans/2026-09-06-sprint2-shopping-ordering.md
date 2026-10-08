# Sprint 2 Shopping and Ordering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoàn thiện US-12, US-13 và US-14 bằng giỏ hàng lưu ở backend, checkout COD có địa chỉ giao hàng và tạo đơn hàng an toàn trong một database transaction.

**Architecture:** Triển khai theo lát cắt dọc trên kiến trúc React → REST API → Controller → Service → AppDbContext/EF Core → SQL Server. Backend lấy người dùng từ JWT, tự tính giá/tổng tiền và dùng cập nhật tồn kho có điều kiện trong transaction; frontend coi API là nguồn dữ liệu giỏ hàng duy nhất.

**Tech Stack:** .NET 10, ASP.NET Core Web API, EF Core 10.0.11, SQL Server, xUnit, WebApplicationFactory, SQLite 10.0.11 test-only, React 19, TypeScript 6, Vite 8, Vitest 4, Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-06-sprint2-shopping-ordering-design.md`

## Global Constraints

- Chỉ triển khai US-12, US-13 và US-14; không mở rộng sang US-9, US-15 hoặc Sprint 3.
- Giỏ hàng nằm ở backend và chỉ dành cho người dùng đăng nhập có role `Customer`.
- Backend không tin `UserID`, giá, tổng tiền, phí giao hàng hoặc order items do client gửi.
- Checkout chỉ hỗ trợ `COD`; `ShippingFee = 0`; đơn mới có payment/order status `PENDING`.
- Checkout phải atomic: lỗi ở bất kỳ item nào giữ nguyên giỏ và rollback toàn bộ order, address, inventory changes.
- Không thay đổi Entity, EF configuration hoặc migration nếu chưa dừng lại, báo tác động và có phê duyệt riêng.
- Controller chỉ xử lý HTTP; business rules và Entity/DTO mapping nằm trong service.
- Mọi API public trả DTO/Problem Details, không trả Entity, stack trace hoặc dữ liệu bí mật.
- Mỗi bước implementation bắt đầu bằng test thất bại, sau đó viết lượng code tối thiểu để test pass.
- Không stage hoặc sửa thay đổi người dùng đang có tại `.agents/skills/architecture/SKILL.md`.

---

## File Map

### Backend production

- `backend/src/ECommerce.Api/Exceptions/NotFoundException.cs`: lỗi tài nguyên không tồn tại/không thuộc người dùng.
- `backend/src/ECommerce.Api/Exceptions/ConflictException.cs`: lỗi nghiệp vụ xung đột như thiếu tồn kho.
- `backend/src/ECommerce.Api/Middleware/ExceptionHandlingMiddleware.cs`: ánh xạ lỗi dự kiến và lỗi ngoài dự kiến sang Problem Details.
- `backend/src/ECommerce.Api/DTOs/Carts/*.cs`: request/response contracts của giỏ hàng.
- `backend/src/ECommerce.Api/Services/Carts/ICartService.cs`: interface giỏ hàng.
- `backend/src/ECommerce.Api/Services/Carts/CartService.cs`: business rules và persistence giỏ hàng.
- `backend/src/ECommerce.Api/Controllers/CartController.cs`: HTTP endpoints của giỏ hàng.
- `backend/src/ECommerce.Api/DTOs/Addresses/*.cs`: request/response contracts địa chỉ.
- `backend/src/ECommerce.Api/Services/Addresses/IAddressService.cs`: interface địa chỉ.
- `backend/src/ECommerce.Api/Services/Addresses/AddressService.cs`: đọc/lưu địa chỉ theo user.
- `backend/src/ECommerce.Api/Controllers/AddressesController.cs`: HTTP endpoints địa chỉ.
- `backend/src/ECommerce.Api/DTOs/Orders/*.cs`: checkout request và order response contracts.
- `backend/src/ECommerce.Api/Services/Orders/IOrderService.cs`: interface tạo đơn.
- `backend/src/ECommerce.Api/Services/Orders/OrderService.cs`: transaction checkout, snapshot và tồn kho.
- `backend/src/ECommerce.Api/Controllers/OrdersController.cs`: HTTP endpoint tạo đơn.
- `backend/src/ECommerce.Api/Program.cs`: đăng ký service dependencies.

### Backend tests

- `backend/tests/ECommerce.Api.Tests/Infrastructure/SqliteTestDatabase.cs`: relational in-memory database cho service tests.
- `backend/tests/ECommerce.Api.Tests/Infrastructure/ApiWebApplicationFactory.cs`: test host dùng SQLite và JWT test settings.
- `backend/tests/ECommerce.Api.Tests/Infrastructure/TestJwtTokenFactory.cs`: tạo Customer/Admin token có claim chuẩn.
- `backend/tests/ECommerce.Api.Tests/Middleware/ExceptionHandlingMiddlewareTests.cs`: Problem Details mappings.
- `backend/tests/ECommerce.Api.Tests/Carts/CartServiceTests.cs`: quy tắc giỏ hàng.
- `backend/tests/ECommerce.Api.Tests/Carts/CartEndpointTests.cs`: auth và HTTP contracts giỏ hàng.
- `backend/tests/ECommerce.Api.Tests/Addresses/AddressServiceTests.cs`: ownership/validation địa chỉ.
- `backend/tests/ECommerce.Api.Tests/Addresses/AddressEndpointTests.cs`: auth và HTTP contracts địa chỉ.
- `backend/tests/ECommerce.Api.Tests/Orders/OrderServiceTests.cs`: checkout happy path, snapshot và rollback.
- `backend/tests/ECommerce.Api.Tests/Orders/OrderEndpointTests.cs`: auth và HTTP contract tạo đơn.

### Frontend

- `frontend/src/types/cart.ts`: Cart DTO types.
- `frontend/src/types/address.ts`: Address DTO types.
- `frontend/src/types/order.ts`: Checkout/Order DTO types.
- `frontend/src/services/apiClient.ts`: typed `ApiError` giữ HTTP status và Problem Details.
- `frontend/src/services/cartService.ts`: Cart API client.
- `frontend/src/services/addressService.ts`: Address API client.
- `frontend/src/services/orderService.ts`: Order API client.
- `frontend/src/contexts/CartContext.tsx`: API-backed cart state/actions.
- `frontend/src/pages/CartPage.tsx`: màn hình giỏ hàng.
- `frontend/src/pages/CheckoutPage.tsx`: chọn/nhập địa chỉ và tạo đơn COD.
- `frontend/src/pages/ProductDetailPage.tsx`: gọi `addItem` và chuyển tới login khi cần.
- `frontend/src/components/Header.tsx`: link giỏ và badge tổng số lượng.
- `frontend/src/routes/AppRouter.tsx`: routes `/cart` và `/checkout`.
- `frontend/src/App.tsx`: bọc router trong `CartProvider`.
- Các file `*.test.ts(x)` cùng vị trí: tests cho API client, services, context và pages.

---

### Task 1: Relational test foundation

**Files:**
- Modify: `backend/tests/ECommerce.Api.Tests/ECommerce.Api.Tests.csproj`
- Create: `backend/tests/ECommerce.Api.Tests/Infrastructure/SqliteTestDatabase.cs`
- Create: `backend/tests/ECommerce.Api.Tests/Infrastructure/ApiWebApplicationFactory.cs`
- Create: `backend/tests/ECommerce.Api.Tests/Infrastructure/TestJwtTokenFactory.cs`
- Modify: `backend/tests/ECommerce.Api.Tests/HealthEndpointTests.cs`

**Interfaces:**
- Produces: `SqliteTestDatabase.CreateAsync()`, `ApiWebApplicationFactory`, `TestJwtTokenFactory.CreateCustomerToken(int userId)`.
- Consumes: existing `AppDbContext`, `Program`, JWT bearer configuration.

- [ ] **Step 1: Add the relational test provider**

```xml
<PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="10.0.11" />
```

- [ ] **Step 2: Write a failing health-host test using the new factory**

```csharp
[Fact]
public async Task GetHealthReturnsHealthyStatusWithRelationalTestDatabase()
{
    using var client = factory.CreateClient();
    using var response = await client.GetAsync("/api/health");
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
}
```

- [ ] **Step 3: Run the targeted test and verify the missing factory failure**

Run: `dotnet test backend/tests/ECommerce.Api.Tests/ECommerce.Api.Tests.csproj --filter FullyQualifiedName~HealthEndpointTests`

Expected: FAIL because `ApiWebApplicationFactory` does not exist.

- [ ] **Step 4: Implement the test database and web factory**

```csharp
public sealed class SqliteTestDatabase : IAsyncDisposable
{
    public SqliteConnection Connection { get; }
    public AppDbContext Context { get; }

    public static async Task<SqliteTestDatabase> CreateAsync();
    public ValueTask DisposeAsync();
}

public sealed class ApiWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder);
    public Task SeedAsync(Func<AppDbContext, Task> seed);
}
```

Keep one open `SqliteConnection` for the factory lifetime, replace the production `AppDbContext` registration, call `EnsureCreatedAsync`, seed roles named `Admin` and `Customer`, and set deterministic test JWT values through in-memory configuration.

```csharp
public static class TestJwtTokenFactory
{
    public static string CreateCustomerToken(int userId) => CreateToken(userId, "Customer");
    public static string CreateAdminToken(int userId) => CreateToken(userId, "Admin");
}
```

- [ ] **Step 5: Run the targeted test**

Run: `dotnet test backend/tests/ECommerce.Api.Tests/ECommerce.Api.Tests.csproj --filter FullyQualifiedName~HealthEndpointTests`

Expected: PASS.

- [ ] **Step 6: Commit the test foundation**

```powershell
git add -- backend/tests/ECommerce.Api.Tests/ECommerce.Api.Tests.csproj backend/tests/ECommerce.Api.Tests/Infrastructure backend/tests/ECommerce.Api.Tests/HealthEndpointTests.cs
git commit -m "test: add relational api test foundation"
```

### Task 2: Safe Problem Details for expected business errors

**Files:**
- Create: `backend/src/ECommerce.Api/Exceptions/NotFoundException.cs`
- Create: `backend/src/ECommerce.Api/Exceptions/ConflictException.cs`
- Modify: `backend/src/ECommerce.Api/Middleware/ExceptionHandlingMiddleware.cs`
- Move/Modify: `backend/tests/ECommerce.Api.Tests/ExceptionHandlingMiddlewareTests.cs` → `backend/tests/ECommerce.Api.Tests/Middleware/ExceptionHandlingMiddlewareTests.cs`

**Interfaces:**
- Produces: `NotFoundException(string message)`, `ConflictException(string message)` and middleware mappings to `404`/`409`.
- Consumes: ASP.NET Core `ProblemDetails`.

- [ ] **Step 1: Write failing middleware mapping tests**

```csharp
[Theory]
[InlineData(typeof(NotFoundException), 404, "Resource not found.")]
[InlineData(typeof(ConflictException), 409, "Request conflict.")]
public async Task InvokeAsyncMapsExpectedExceptionToSafeProblemDetails(
    Type exceptionType,
    int expectedStatus,
    string expectedTitle)
{
    var exception = (Exception)Activator.CreateInstance(exceptionType, "internal details")!;
    var context = CreateContext();
    var middleware = CreateMiddleware(_ => throw exception);

    await middleware.InvokeAsync(context);

    Assert.Equal(expectedStatus, context.Response.StatusCode);
    Assert.DoesNotContain("internal details", await ReadBodyAsync(context));
}
```

- [ ] **Step 2: Run the middleware tests and verify they fail**

Run: `dotnet test backend/tests/ECommerce.Api.Tests/ECommerce.Api.Tests.csproj --filter FullyQualifiedName~ExceptionHandlingMiddlewareTests`

Expected: FAIL because the exception classes and mappings do not exist.

- [ ] **Step 3: Add exceptions and status mapping**

```csharp
public sealed class NotFoundException(string message) : Exception(message);
public sealed class ConflictException(string message) : Exception(message);
```

```csharp
var (status, title) = exception switch
{
    NotFoundException => (StatusCodes.Status404NotFound, "Resource not found."),
    ConflictException => (StatusCodes.Status409Conflict, "Request conflict."),
    _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred.")
};
```

Log expected exceptions without stack traces at warning level; keep full exception logging only for unexpected `500` errors.

- [ ] **Step 4: Run middleware tests**

Run: `dotnet test backend/tests/ECommerce.Api.Tests/ECommerce.Api.Tests.csproj --filter FullyQualifiedName~ExceptionHandlingMiddlewareTests`

Expected: PASS for `404`, `409`, and safe `500` responses.

- [ ] **Step 5: Commit error handling**

```powershell
git add -- backend/src/ECommerce.Api/Exceptions backend/src/ECommerce.Api/Middleware/ExceptionHandlingMiddleware.cs backend/tests/ECommerce.Api.Tests/Middleware backend/tests/ECommerce.Api.Tests/ExceptionHandlingMiddlewareTests.cs
git commit -m "feat: map shopping errors to problem details"
```

### Task 3: US-12 cart service and DTOs

**Files:**
- Create: `backend/src/ECommerce.Api/DTOs/Carts/AddCartItemDto.cs`
- Create: `backend/src/ECommerce.Api/DTOs/Carts/UpdateCartItemDto.cs`
- Create: `backend/src/ECommerce.Api/DTOs/Carts/CartItemDto.cs`
- Create: `backend/src/ECommerce.Api/DTOs/Carts/CartDto.cs`
- Create: `backend/src/ECommerce.Api/Services/Carts/ICartService.cs`
- Create: `backend/src/ECommerce.Api/Services/Carts/CartService.cs`
- Create: `backend/tests/ECommerce.Api.Tests/Carts/CartServiceTests.cs`

**Interfaces:**
- Produces: `ICartService` methods shown below and immutable Cart response contracts.
- Consumes: `AppDbContext`, `NotFoundException`, `ConflictException`.

- [ ] **Step 1: Define DTO validation and service signatures**

```csharp
public sealed class AddCartItemDto
{
    [Range(1, int.MaxValue)] public int ProductId { get; init; }
    [Range(1, int.MaxValue)] public int Quantity { get; init; }
}

public sealed class UpdateCartItemDto
{
    [Range(1, int.MaxValue)] public int Quantity { get; init; }
}

public sealed record CartItemDto(
    int ProductId,
    string ProductName,
    string Sku,
    string? ImageUrl,
    decimal UnitPrice,
    int Quantity,
    int AvailableStock,
    decimal LineTotal);

public sealed record CartDto(
    IReadOnlyList<CartItemDto> Items,
    int TotalItems,
    decimal Subtotal);
```

```csharp
public interface ICartService
{
    Task<CartDto> GetAsync(int userId, CancellationToken cancellationToken = default);
    Task<CartDto> AddItemAsync(int userId, AddCartItemDto request, CancellationToken cancellationToken = default);
    Task<CartDto> UpdateItemAsync(int userId, int productId, UpdateCartItemDto request, CancellationToken cancellationToken = default);
    Task RemoveItemAsync(int userId, int productId, CancellationToken cancellationToken = default);
    Task ClearAsync(int userId, CancellationToken cancellationToken = default);
}
```

- [ ] **Step 2: Write failing cart service tests**

```csharp
[Fact]
public async Task AddItemAsyncCreatesCartAndReturnsServerCalculatedTotals();

[Fact]
public async Task AddItemAsyncMergesExistingProductQuantity();

[Fact]
public async Task AddItemAsyncRejectsInactiveProduct();

[Fact]
public async Task AddItemAsyncRejectsQuantityAboveStock();

[Fact]
public async Task UpdateItemAsyncRejectsQuantityAboveStock();

[Fact]
public async Task RemoveItemAsyncDoesNotRemoveAnotherUsersItem();
```

Seed Product price `125000m`, stock `3`, and a Customer user. Assert two units produce `TotalItems = 2`, `Subtotal = 250000m`, and `LineTotal = 250000m`.

- [ ] **Step 3: Run cart service tests and verify failure**

Run: `dotnet test backend/tests/ECommerce.Api.Tests/ECommerce.Api.Tests.csproj --filter FullyQualifiedName~CartServiceTests`

Expected: FAIL because cart DTOs/service do not exist.

- [ ] **Step 4: Implement CartService**

Use `Include(c => c.Items).ThenInclude(i => i.Product).ThenInclude(p => p.Images)` for response projection. Query only by `UserID`; create `Cart` on first add; merge the unique Cart/Product pair; set `AddedAt`/`UpdatedAt` in application code; calculate all totals after reading current Product data.

```csharp
private static void EnsureCanAdd(Product product, int quantity)
{
    if (!product.IsActive) throw new ConflictException("Product is inactive.");
    if (quantity > product.StockQuantity) throw new ConflictException("Insufficient stock.");
}
```

- [ ] **Step 5: Run cart service tests**

Run: `dotnet test backend/tests/ECommerce.Api.Tests/ECommerce.Api.Tests.csproj --filter FullyQualifiedName~CartServiceTests`

Expected: PASS.

- [ ] **Step 6: Commit cart service**

```powershell
git add -- backend/src/ECommerce.Api/DTOs/Carts backend/src/ECommerce.Api/Services/Carts backend/tests/ECommerce.Api.Tests/Carts/CartServiceTests.cs
git commit -m "feat: add backend cart service"
```

### Task 4: US-12 cart HTTP API

**Files:**
- Create: `backend/src/ECommerce.Api/Controllers/CartController.cs`
- Modify: `backend/src/ECommerce.Api/Program.cs`
- Create: `backend/tests/ECommerce.Api.Tests/Carts/CartEndpointTests.cs`

**Interfaces:**
- Produces: `GET /api/cart`, `POST /api/cart/items`, `PUT /api/cart/items/{productId}`, `DELETE /api/cart/items/{productId}`, `DELETE /api/cart`.
- Consumes: `ICartService`, JWT `sub` claim, role `Customer`.

- [ ] **Step 1: Write failing authorization and contract tests**

```csharp
[Fact]
public async Task GetCartWithoutTokenReturnsUnauthorized();

[Fact]
public async Task GetCartWithAdminTokenReturnsForbidden();

[Fact]
public async Task AddItemWithCustomerTokenReturnsUpdatedCart();

[Fact]
public async Task AddItemAboveStockReturnsConflictProblemDetails();

[Fact]
public async Task DeleteItemReturnsNoContent();
```

- [ ] **Step 2: Run endpoint tests and verify missing route failure**

Run: `dotnet test backend/tests/ECommerce.Api.Tests/ECommerce.Api.Tests.csproj --filter FullyQualifiedName~CartEndpointTests`

Expected: FAIL because `/api/cart` is not mapped.

- [ ] **Step 3: Implement the controller and DI registration**

```csharp
[ApiController]
[Route("api/cart")]
[Authorize(Roles = "Customer")]
public sealed class CartController(ICartService cartService) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(JwtRegisteredClaimNames.Sub)!);

    [HttpGet]
    public async Task<ActionResult<CartDto>> Get(CancellationToken cancellationToken) =>
        Ok(await cartService.GetAsync(UserId, cancellationToken));

    [HttpPost(items)]
    public async Task<ActionResult<CartDto>> AddItem(AddCartItemDto request, CancellationToken cancellationToken) =>
        Ok(await cartService.AddItemAsync(UserId, request, cancellationToken));

    [HttpPut(items/{productId:int})]
    public async Task<ActionResult<CartDto>> UpdateItem(int productId, UpdateCartItemDto request, CancellationToken cancellationToken) =>
        Ok(await cartService.UpdateItemAsync(UserId, productId, request, cancellationToken));

    [HttpDelete(items/{productId:int})]
    public async Task<IActionResult> RemoveItem(int productId, CancellationToken cancellationToken)
    {
        await cartService.RemoveItemAsync(UserId, productId, cancellationToken);
        return NoContent();
    }

    [HttpDelete]
    public async Task<IActionResult> Clear(CancellationToken cancellationToken)
    {
        await cartService.ClearAsync(UserId, cancellationToken);
        return NoContent();
    }
}
```

Register the service:

```csharp
builder.Services.AddScoped<ICartService, CartService>();
```

- [ ] **Step 4: Run endpoint and service tests**

Run: `dotnet test backend/tests/ECommerce.Api.Tests/ECommerce.Api.Tests.csproj --filter "FullyQualifiedName~CartEndpointTests|FullyQualifiedName~CartServiceTests"`

Expected: PASS.

- [ ] **Step 5: Commit Cart API**

```powershell
git add -- backend/src/ECommerce.Api/Controllers/CartController.cs backend/src/ECommerce.Api/Program.cs backend/tests/ECommerce.Api.Tests/Carts/CartEndpointTests.cs
git commit -m "feat: expose authenticated cart api"
```

### Task 5: US-12 frontend API-backed cart

**Files:**
- Create: `frontend/src/types/cart.ts`
- Create: `frontend/src/services/apiClient.test.ts`
- Modify: `frontend/src/services/apiClient.ts`
- Create: `frontend/src/services/cartService.ts`
- Create: `frontend/src/services/cartService.test.ts`
- Modify: `frontend/src/contexts/CartContext.tsx`
- Create: `frontend/src/contexts/CartContext.test.tsx`
- Modify: `frontend/src/App.tsx`

**Interfaces:**
- Produces: `ApiError`, `cartService`, and async `CartContext` actions.
- Consumes: backend Cart DTO/API and existing auth token storage.

- [ ] **Step 1: Write failing ApiError and cart service tests**

```ts
it('preserves problem details and status for a conflict', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
    JSON.stringify({ title: 'Request conflict.', status: 409 }),
    { status: 409, headers: { 'Content-Type': 'application/problem+json' } },
  )))

  await expect(cartService.addItem({ productId: 1, quantity: 4 }))
    .rejects.toMatchObject({ status: 409, title: 'Request conflict.' })
})
```

- [ ] **Step 2: Run service tests and verify failure**

Run: `npm test -- --run src/services/apiClient.test.ts src/services/cartService.test.ts`

Working directory: `frontend`

Expected: FAIL because `ApiError` and `cartService` do not exist.

- [ ] **Step 3: Implement frontend contracts and clients**

```ts
export interface CartItemDto {
  productId: number
  productName: string
  sku: string
  imageUrl: string | null
  unitPrice: number
  quantity: number
  availableStock: number
  lineTotal: number
}

export interface CartDto {
  items: CartItemDto[]
  totalItems: number
  subtotal: number
}
```

```ts
export class ApiError extends Error {
  constructor(public status: number, public title: string) {
    super(title)
  }
}
```

```ts
export const cartService = {
  get: () => apiClient<CartDto>('/cart'),
  addItem: (request: AddCartItemRequest) =>
    apiClient<CartDto>('/cart/items', { method: 'POST', body: JSON.stringify(request) }),
  updateItem: (productId: number, request: UpdateCartItemRequest) =>
    apiClient<CartDto>(`/cart/items/${productId}`, { method: 'PUT', body: JSON.stringify(request) }),
  removeItem: (productId: number) =>
    apiClient<void>(`/cart/items/${productId}`, { method: 'DELETE' }),
  clear: () => apiClient<void>('/cart', { method: 'DELETE' }),
}
```

- [ ] **Step 4: Write failing CartContext behavior tests**

```tsx
it('loads the backend cart when a token exists', async () => {
  localStorage.setItem('token', 'token')
  render(<CartProvider><CartProbe /></CartProvider>)
  expect(await screen.findByText('2 items')).toBeInTheDocument()
})

it('does not load a cart when the user is logged out', async () => {
  render(<CartProvider><CartProbe /></CartProvider>)
  expect(cartService.get).not.toHaveBeenCalled()
})
```

- [ ] **Step 5: Replace localStorage cart state with API-backed state**

```ts
interface CartContextType {
  cart: CartDto
  isLoading: boolean
  error: string | null
  refresh(): Promise<void>
  addItem(productId: number, quantity: number): Promise<void>
  updateItem(productId: number, quantity: number): Promise<void>
  removeItem(productId: number): Promise<void>
  clear(): Promise<void>
}
```

Initialize an empty Cart DTO when logged out; keep only JWT/user data in localStorage; update state from each API response and refresh after delete operations.

- [ ] **Step 6: Wrap the application and run frontend tests**

```tsx
export default function App() {
  return <CartProvider><AppRouter /></CartProvider>
}
```

Run: `npm test -- --run src/services/apiClient.test.ts src/services/cartService.test.ts src/contexts/CartContext.test.tsx`

Working directory: `frontend`

Expected: PASS.

- [ ] **Step 7: Commit frontend cart state**

```powershell
git add -- frontend/src/types/cart.ts frontend/src/services/apiClient.ts frontend/src/services/apiClient.test.ts frontend/src/services/cartService.ts frontend/src/services/cartService.test.ts frontend/src/contexts/CartContext.tsx frontend/src/contexts/CartContext.test.tsx frontend/src/App.tsx
git commit -m "feat: connect cart state to backend"
```

### Task 6: US-12 cart UI integration

**Files:**
- Create: `frontend/src/pages/CartPage.tsx`
- Create: `frontend/src/pages/CartPage.test.tsx`
- Modify: `frontend/src/pages/ProductDetailPage.tsx`
- Create: `frontend/src/pages/ProductDetailPage.test.tsx`
- Modify: `frontend/src/components/Header.tsx`
- Create: `frontend/src/components/Header.test.tsx`
- Modify: `frontend/src/routes/AppRouter.tsx`
- Modify: `frontend/src/App.test.tsx`

**Interfaces:**
- Produces: `/cart` UI, add-to-cart behavior and header quantity badge.
- Consumes: `useCart`, `authService.getCurrentUser`, Cart DTO.

- [ ] **Step 1: Write failing cart page tests**

```tsx
it('renders backend items and subtotal', async () => {
  renderCartPageWithCart({ items: [item], totalItems: 2, subtotal: 250000 })
  expect(screen.getByText(item.productName)).toBeInTheDocument()
  expect(screen.getByText('250.000 ₫')).toBeInTheDocument()
})

it('updates quantity through the cart context', async () => {
  renderCartPageWithCart({ items: [item], totalItems: 1, subtotal: 125000 })
  fireEvent.click(screen.getByRole('button', { name: 'Tăng số lượng' }))
  expect(updateItem).toHaveBeenCalledWith(item.productId, 2)
})
```

- [ ] **Step 2: Run UI tests and verify missing components/behavior**

Run: `npm test -- --run src/pages/CartPage.test.tsx src/pages/ProductDetailPage.test.tsx src/components/Header.test.tsx`

Working directory: `frontend`

Expected: FAIL because CartPage and cart integrations are absent.

- [ ] **Step 3: Implement CartPage and route**

Render loading, empty, item list, quantity controls, remove actions, subtotal and a `/checkout` link. Disable quantity increase at `availableStock`; display `ApiError` conflicts and call `refresh()` after conflicts.

```tsx
<Route path="/cart" element={<CartPage />} />
```

- [ ] **Step 4: Integrate ProductDetailPage and Header**

On add, check `authService.getCurrentUser()`. Navigate to `/login` if absent; otherwise await `addItem(product.productID, quantity)` and show success/error text. Link the cart icon to `/cart` and render an accessible badge from `totalItems`.

- [ ] **Step 5: Replace the stale App baseline test**

```tsx
it('renders the customer storefront router', () => {
  render(<App />)
  expect(screen.getByRole('link', { name: 'ElectroTech' })).toBeInTheDocument()
})
```

- [ ] **Step 6: Run affected frontend tests**

Run: `npm test -- --run src/App.test.tsx src/pages/CartPage.test.tsx src/pages/ProductDetailPage.test.tsx src/components/Header.test.tsx`

Working directory: `frontend`

Expected: PASS.

- [ ] **Step 7: Commit cart UI**

```powershell
git add -- frontend/src/pages/CartPage.tsx frontend/src/pages/CartPage.test.tsx frontend/src/pages/ProductDetailPage.tsx frontend/src/pages/ProductDetailPage.test.tsx frontend/src/components/Header.tsx frontend/src/components/Header.test.tsx frontend/src/routes/AppRouter.tsx frontend/src/App.test.tsx
git commit -m "feat: add customer cart interface"
```

### Task 7: US-14 address API

**Files:**
- Create: `backend/src/ECommerce.Api/DTOs/Addresses/AddressCreateDto.cs`
- Create: `backend/src/ECommerce.Api/DTOs/Addresses/AddressDto.cs`
- Create: `backend/src/ECommerce.Api/Services/Addresses/IAddressService.cs`
- Create: `backend/src/ECommerce.Api/Services/Addresses/AddressService.cs`
- Create: `backend/src/ECommerce.Api/Controllers/AddressesController.cs`
- Modify: `backend/src/ECommerce.Api/Program.cs`
- Create: `backend/tests/ECommerce.Api.Tests/Addresses/AddressServiceTests.cs`
- Create: `backend/tests/ECommerce.Api.Tests/Addresses/AddressEndpointTests.cs`

**Interfaces:**
- Produces: `IAddressService.GetAllAsync`, `CreateAsync`, `GetOwnedEntityAsync`; `GET/POST /api/addresses`.
- Consumes: JWT user ID and existing `Address` Entity.

- [ ] **Step 1: Define address contracts and interface**

```csharp
public sealed class AddressCreateDto
{
    [Required, MaxLength(100)] public string ReceiverName { get; init; } = null!;
    [Required, MaxLength(20)] public string ReceiverPhone { get; init; } = null!;
    [MaxLength(100)] public string? Province { get; init; }
    [MaxLength(100)] public string? District { get; init; }
    [MaxLength(100)] public string? Ward { get; init; }
    [Required, MaxLength(500)] public string FullAddress { get; init; } = null!;
}

public sealed record AddressDto(
    int AddressId,
    string ReceiverName,
    string ReceiverPhone,
    string? Province,
    string? District,
    string? Ward,
    string FullAddress);
```

```csharp
public interface IAddressService
{
    Task<IReadOnlyList<AddressDto>> GetAllAsync(int userId, CancellationToken cancellationToken = default);
    Task<AddressDto> CreateAsync(int userId, AddressCreateDto request, CancellationToken cancellationToken = default);
    Task<Address> GetOwnedEntityAsync(int userId, int addressId, CancellationToken cancellationToken = default);
}
```

- [ ] **Step 2: Write failing ownership and API tests**

```csharp
[Fact]
public async Task GetAllAsyncReturnsOnlyCurrentUsersAddresses();

[Fact]
public async Task GetOwnedEntityAsyncRejectsAnotherUsersAddress();

[Fact]
public async Task CreateAddressWithInvalidPhoneReturnsBadRequest();

[Fact]
public async Task CreateAddressReturnsCreatedDtoWithoutUserEntity();
```

Validate phone with `[RegularExpression(@"^[0-9+][0-9 -]{7,19}$")]`.

- [ ] **Step 3: Run address tests and verify failure**

Run: `dotnet test backend/tests/ECommerce.Api.Tests/ECommerce.Api.Tests.csproj --filter "FullyQualifiedName~AddressServiceTests|FullyQualifiedName~AddressEndpointTests"`

Expected: FAIL because address DTO/service/controller do not exist.

- [ ] **Step 4: Implement service, controller and DI**

Use `AsNoTracking()` for list reads, normalize required strings with `Trim()`, set `IsDefault = false`, and query ownership with both `AddressID` and `UserID`. Controller uses `[Authorize(Roles = "Customer")]`, returns `200` for GET and `201` for POST.

```csharp
builder.Services.AddScoped<IAddressService, AddressService>();
```

- [ ] **Step 5: Run address tests**

Run: `dotnet test backend/tests/ECommerce.Api.Tests/ECommerce.Api.Tests.csproj --filter "FullyQualifiedName~AddressServiceTests|FullyQualifiedName~AddressEndpointTests"`

Expected: PASS.

- [ ] **Step 6: Commit Address API**

```powershell
git add -- backend/src/ECommerce.Api/DTOs/Addresses backend/src/ECommerce.Api/Services/Addresses backend/src/ECommerce.Api/Controllers/AddressesController.cs backend/src/ECommerce.Api/Program.cs backend/tests/ECommerce.Api.Tests/Addresses
git commit -m "feat: add customer address api"
```

### Task 8: US-13/14 transactional order service

**Files:**
- Create: `backend/src/ECommerce.Api/DTOs/Orders/ShippingAddressDto.cs`
- Create: `backend/src/ECommerce.Api/DTOs/Orders/CreateOrderDto.cs`
- Create: `backend/src/ECommerce.Api/DTOs/Orders/OrderItemDto.cs`
- Create: `backend/src/ECommerce.Api/DTOs/Orders/OrderDto.cs`
- Create: `backend/src/ECommerce.Api/Services/Orders/IOrderService.cs`
- Create: `backend/src/ECommerce.Api/Services/Orders/OrderService.cs`
- Create: `backend/tests/ECommerce.Api.Tests/Orders/OrderServiceTests.cs`

**Interfaces:**
- Produces: `IOrderService.CreateAsync(int userId, CreateOrderDto request, CancellationToken)`.
- Consumes: `AppDbContext`, `IAddressService.GetOwnedEntityAsync`, Cart/Product/Order/Inventory entities.

- [ ] **Step 1: Define checkout contracts**

```csharp
public sealed class CreateOrderDto : IValidatableObject
{
    public int? AddressId { get; init; }
    public ShippingAddressDto? ShippingAddress { get; init; }
    public bool SaveAddress { get; init; }
    [Required] public string PaymentMethod { get; init; } = "COD";

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if ((AddressId.HasValue ? 1 : 0) + (ShippingAddress is null ? 0 : 1) != 1)
            yield return new ValidationResult(
                "Provide exactly one address source.",
                [nameof(AddressId), nameof(ShippingAddress)]);
        if (!string.Equals(PaymentMethod, "COD", StringComparison.OrdinalIgnoreCase))
            yield return new ValidationResult("Only COD is supported.", [nameof(PaymentMethod)]);
        if (SaveAddress && ShippingAddress is null)
            yield return new ValidationResult(
                "SaveAddress requires a new shipping address.",
                [nameof(SaveAddress)]);
    }
}
```

```csharp
public interface IOrderService
{
    Task<OrderDto> CreateAsync(int userId, CreateOrderDto request, CancellationToken cancellationToken = default);
}
```

- [ ] **Step 2: Write failing validation and happy-path tests**

```csharp
[Fact]
public async Task CreateAsyncRejectsEmptyCart();

[Fact]
public async Task CreateAsyncRejectsAddressOwnedByAnotherUser();

[Fact]
public async Task CreateAsyncUsesDatabasePriceAndCreatesSnapshots();

[Fact]
public async Task CreateAsyncSetsCodPendingStatusesAndZeroShippingFee();

[Fact]
public async Task CreateAsyncOptionallyPersistsNewAddress();
```

Assert the request contains no price/items fields and the saved `OrderDetail` copies `ProductName`, `SKU`, `Price`, and cart quantity.

- [ ] **Step 3: Write failing inventory/rollback tests**

```csharp
[Fact]
public async Task CreateAsyncDecrementsStockAndWritesSaleTransactions();

[Fact]
public async Task CreateAsyncClearsCartOnlyAfterSuccessfulCommit();

[Fact]
public async Task CreateAsyncRollsBackOrderInventoryAddressAndCartWhenOneItemLacksStock();

[Fact]
public async Task CreateAsyncRejectsProductDeactivatedAfterItWasAddedToCart();
```

For rollback, seed two cart items, make the second item insufficient, call `CreateAsync`, then assert zero Orders/OrderDetails/InventoryTransactions, unchanged stock, unchanged cart, and no saved checkout address.

- [ ] **Step 4: Run order service tests and verify failure**

Run: `dotnet test backend/tests/ECommerce.Api.Tests/ECommerce.Api.Tests.csproj --filter FullyQualifiedName~OrderServiceTests`

Expected: FAIL because order contracts/service do not exist.

- [ ] **Step 5: Implement transaction and server-side calculations**

```csharp
await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
try
{
    await context.SaveChangesAsync(cancellationToken);
    await transaction.CommitAsync(cancellationToken);
}
catch
{
    await transaction.RollbackAsync(cancellationToken);
    throw;
}
```

Before `SaveChangesAsync`, resolve exactly one address source, load the current user's Cart with CartItems and current Products, reject an empty cart or any inactive product, and construct the Order plus one OrderDetail snapshot per CartItem. Set `ShippingFee = 0`, `PaymentMethod = "COD"`, `PaymentStatus = "PENDING"`, `OrderStatus = "PENDING"`, and calculate subtotal/total exclusively from current Product prices.

Perform each stock update with a predicate containing `ProductID`, `IsActive` and `StockQuantity >= quantity`; require exactly one affected row or throw `ConflictException`. Read the updated stock inside the transaction to populate `PreviousStock`, `NewStock`, negative `Quantity`, `TransactionType = "SALE"`, `CreatedBy = userId`, and `ReferenceID = order.OrderID`; add one InventoryTransaction per item and remove all CartItems only after every stock update succeeds.

- [ ] **Step 6: Run order service tests**

Run: `dotnet test backend/tests/ECommerce.Api.Tests/ECommerce.Api.Tests.csproj --filter FullyQualifiedName~OrderServiceTests`

Expected: PASS, including rollback assertions.

- [ ] **Step 7: Commit transactional checkout service**

```powershell
git add -- backend/src/ECommerce.Api/DTOs/Orders backend/src/ECommerce.Api/Services/Orders backend/tests/ECommerce.Api.Tests/Orders/OrderServiceTests.cs
git commit -m "feat: create orders transactionally"
```

### Task 9: US-13/14 order HTTP API

**Files:**
- Create: `backend/src/ECommerce.Api/Controllers/OrdersController.cs`
- Modify: `backend/src/ECommerce.Api/Program.cs`
- Create: `backend/tests/ECommerce.Api.Tests/Orders/OrderEndpointTests.cs`

**Interfaces:**
- Produces: `POST /api/orders` returning `201 Created`.
- Consumes: `IOrderService`, `CreateOrderDto`, Customer JWT.

- [ ] **Step 1: Write failing order endpoint tests**

```csharp
[Fact]
public async Task CreateOrderWithoutTokenReturnsUnauthorized();

[Fact]
public async Task CreateOrderWithAdminTokenReturnsForbidden();

[Fact]
public async Task CreateOrderWithBothAddressSourcesReturnsBadRequest();

[Fact]
public async Task CreateOrderWithNonCodPaymentReturnsBadRequest();

[Fact]
public async Task CreateOrderWithInsufficientStockReturnsConflictProblemDetails();

[Fact]
public async Task CreateOrderReturnsCreatedOrderDto();
```

- [ ] **Step 2: Run endpoint tests and verify missing route failure**

Run: `dotnet test backend/tests/ECommerce.Api.Tests/ECommerce.Api.Tests.csproj --filter FullyQualifiedName~OrderEndpointTests`

Expected: FAIL because `/api/orders` is not mapped.

- [ ] **Step 3: Implement controller and DI**

```csharp
[ApiController]
[Route("api/orders")]
[Authorize(Roles = "Customer")]
public sealed class OrdersController(IOrderService orderService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<OrderDto>> Create(
        CreateOrderDto request,
        CancellationToken cancellationToken)
    {
        var userId = int.Parse(User.FindFirstValue(JwtRegisteredClaimNames.Sub)!);
        var order = await orderService.CreateAsync(userId, request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, order);
    }
}
```

Register:

```csharp
builder.Services.AddScoped<IOrderService, OrderService>();
```

- [ ] **Step 4: Run all backend shopping tests**

Run: `dotnet test backend/tests/ECommerce.Api.Tests/ECommerce.Api.Tests.csproj --filter "FullyQualifiedName~Cart|FullyQualifiedName~Address|FullyQualifiedName~Order|FullyQualifiedName~ExceptionHandling"`

Expected: PASS.

- [ ] **Step 5: Commit Order API**

```powershell
git add -- backend/src/ECommerce.Api/Controllers/OrdersController.cs backend/src/ECommerce.Api/Program.cs backend/tests/ECommerce.Api.Tests/Orders/OrderEndpointTests.cs
git commit -m "feat: expose customer checkout api"
```

### Task 10: US-14 frontend address and checkout flow

**Files:**
- Create: `frontend/src/types/address.ts`
- Create: `frontend/src/types/order.ts`
- Create: `frontend/src/services/addressService.ts`
- Create: `frontend/src/services/addressService.test.ts`
- Create: `frontend/src/services/orderService.ts`
- Create: `frontend/src/services/orderService.test.ts`
- Create: `frontend/src/pages/CheckoutPage.tsx`
- Create: `frontend/src/pages/CheckoutPage.test.tsx`
- Modify: `frontend/src/routes/AppRouter.tsx`
- Modify: `frontend/src/pages/CartPage.tsx`

**Interfaces:**
- Produces: checkout UI and typed address/order clients.
- Consumes: `/api/addresses`, `/api/orders`, `useCart`, `ApiError`.

- [ ] **Step 1: Define frontend address/order contracts**

```ts
export interface ShippingAddressInput {
  receiverName: string
  receiverPhone: string
  province: string | null
  district: string | null
  ward: string | null
  fullAddress: string
}

export interface CreateOrderRequest {
  addressId?: number
  shippingAddress?: ShippingAddressInput
  saveAddress: boolean
  paymentMethod: 'COD'
}

export interface OrderDto {
  orderId: number
  items: OrderItemDto[]
  subTotal: number
  shippingFee: number
  totalAmount: number
  paymentMethod: 'COD'
  paymentStatus: 'PENDING'
  orderStatus: 'PENDING'
  createdAt: string
}
```

- [ ] **Step 2: Write failing service tests**

```ts
it('creates an order without sending cart prices or items', async () => {
  await orderService.create({ addressId: 7, saveAddress: false, paymentMethod: 'COD' })
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/orders'), expect.objectContaining({
    method: 'POST',
    body: JSON.stringify({ addressId: 7, saveAddress: false, paymentMethod: 'COD' }),
  }))
})
```

- [ ] **Step 3: Run service tests and verify failure**

Run: `npm test -- --run src/services/addressService.test.ts src/services/orderService.test.ts`

Working directory: `frontend`

Expected: FAIL because services/types do not exist.

- [ ] **Step 4: Implement addressService and orderService**

```ts
export const addressService = {
  getAll: () => apiClient<AddressDto[]>('/addresses'),
  create: (request: ShippingAddressInput) =>
    apiClient<AddressDto>('/addresses', { method: 'POST', body: JSON.stringify(request) }),
}

export const orderService = {
  create: (request: CreateOrderRequest) =>
    apiClient<OrderDto>('/orders', { method: 'POST', body: JSON.stringify(request) }),
}
```

- [ ] **Step 5: Write failing checkout page tests**

```tsx
it('checks out with a saved address and COD', async () => {
  renderCheckout({ addresses: [address], cart })
  fireEvent.click(await screen.findByLabelText(address.fullAddress))
  fireEvent.click(screen.getByRole('button', { name: 'Đặt hàng' }))
  await waitFor(() => expect(orderService.create).toHaveBeenCalledWith({
    addressId: address.addressId,
    saveAddress: false,
    paymentMethod: 'COD',
  }))
})

it('submits a new address with the save option', async () => {
  renderCheckout({ addresses: [], cart })
  fillShippingAddressForm()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Lưu địa chỉ' }))
  fireEvent.click(screen.getByRole('button', { name: 'Đặt hàng' }))
  await waitFor(() => expect(orderService.create).toHaveBeenCalledWith(expect.objectContaining({
    shippingAddress: expect.any(Object),
    saveAddress: true,
    paymentMethod: 'COD',
  })))
})

it('reloads the cart and displays a stock conflict', async () => {
  orderService.create.mockRejectedValue(new ApiError(409, 'Request conflict.'))
  renderCheckout({ addresses: [address], cart })
  submitSavedAddress()
  expect(await screen.findByText('Tồn kho vừa thay đổi. Vui lòng kiểm tra lại giỏ hàng.')).toBeInTheDocument()
  expect(refresh).toHaveBeenCalled()
})
```

- [ ] **Step 6: Run checkout tests and verify failure**

Run: `npm test -- --run src/pages/CheckoutPage.test.tsx`

Working directory: `frontend`

Expected: FAIL because CheckoutPage is absent.

- [ ] **Step 7: Implement CheckoutPage and route**

Render saved-address selection, new-address form, save checkbox, read-only COD option, shipping fee `0`, backend cart subtotal/total, submit loading state, field errors, conflict error and success order number. Redirect logged-out users to `/login`; redirect empty carts to `/cart`; call `refresh()` after success and conflict.

```tsx
<Route path="/checkout" element={<CheckoutPage />} />
```

Update CartPage checkout link to be disabled for an empty cart.

- [ ] **Step 8: Run frontend checkout tests**

Run: `npm test -- --run src/services/addressService.test.ts src/services/orderService.test.ts src/pages/CheckoutPage.test.tsx src/pages/CartPage.test.tsx`

Working directory: `frontend`

Expected: PASS.

- [ ] **Step 9: Commit checkout UI**

```powershell
git add -- frontend/src/types/address.ts frontend/src/types/order.ts frontend/src/services/addressService.ts frontend/src/services/addressService.test.ts frontend/src/services/orderService.ts frontend/src/services/orderService.test.ts frontend/src/pages/CheckoutPage.tsx frontend/src/pages/CheckoutPage.test.tsx frontend/src/pages/CartPage.tsx frontend/src/routes/AppRouter.tsx
git commit -m "feat: add cod checkout flow"
```

### Task 11: Full verification and documentation alignment

**Files:**
- Modify only if commands reveal a documented command is stale: `README.md`
- Do not modify: `.agents/skills/architecture/SKILL.md`

**Interfaces:**
- Consumes: all production/test work from Tasks 1–10.
- Produces: verified Sprint 2 increment and exact handoff evidence.

- [ ] **Step 1: Run backend formatting/build**

Run: `dotnet format backend/ECommerce.slnx --verify-no-changes`

Expected: exit code `0` with no formatting changes required.

Run: `dotnet build backend/ECommerce.slnx --no-restore`

Expected: BUILD SUCCEEDED with zero errors.

- [ ] **Step 2: Run all backend tests**

Run: `dotnet test backend/ECommerce.slnx --no-build`

Expected: all tests PASS.

- [ ] **Step 3: Confirm no pending EF model changes**

Run: `dotnet ef migrations has-pending-model-changes --project backend/src/ECommerce.Api/ECommerce.Api.csproj --no-build`

Expected: `No changes have been made to the model since the last migration.`

- [ ] **Step 4: Run frontend lint/build/tests**

Working directory: `frontend`

Run: `npm run lint`

Expected: exit code `0`.

Run: `npm run build`

Expected: TypeScript and Vite build succeed.

Run: `npm test`

Expected: all Vitest tests PASS.

- [ ] **Step 5: Perform manual smoke test**

Run backend:

```powershell
dotnet run --project backend/src/ECommerce.Api/ECommerce.Api.csproj
```

Run frontend in a second terminal:

```powershell
Set-Location frontend
npm run dev
```

Verify: Customer login → product detail → add to cart → cart update/remove → checkout with saved address → checkout with new address and save option → successful COD order → cart becomes empty. For the conflict path, add an item to the cart, then use the existing authenticated Admin Product API to reduce that product's stock below the cart quantity before checkout; verify a `409` message and that the cart remains unchanged.

- [ ] **Step 6: Review scope and working tree**

Run: `git status --short`

Expected: only the user's pre-existing `.agents/skills/architecture/SKILL.md` modification remains outside committed task work.

- [ ] **Step 7: Commit documentation corrections only if Step 5 exposed one**

If the documented run commands are already correct, skip this commit. If `README.md` required a verified correction:

```powershell
git add -- README.md
git commit -m "docs: update shopping flow run instructions"
```

Do not stage `.agents/skills/architecture/SKILL.md`.

---

## Final Definition-of-Done Check

- [ ] US-12 backend cart operations and frontend cart UI are integrated.
- [ ] US-13 creates one order containing every current cart item.
- [ ] US-14 supports saved/new shipping addresses, optional address save, COD and zero shipping fee.
- [ ] JWT ownership and Customer role restrictions are verified.
- [ ] Price, totals and inventory decisions are server-side.
- [ ] Checkout rollback and conditional stock decrement tests pass.
- [ ] No EF migration/model drift was introduced.
- [ ] Backend build/test and frontend lint/build/test pass.
- [ ] Manual end-to-end flow is demo-ready.
- [ ] API/database impact and external setup are captured in the completion report.
